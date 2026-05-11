import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Activity,
  FileText,
  MapPin,
  Search,
  Trash2,
  LogOut,
  Image as ImageIcon,
  Download,
  Video,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import adminApi from "../api/adminApi";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  const fetchReports = async () => {
    try {
      setLoading(true);

      const res = await adminApi.get("/reports");

      console.log("API Response:", res.data);

      const reportsData = Array.isArray(res.data)
        ? res.data
        : res.data?.reports || [];

      setReports(reportsData);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;

    try {
      await adminApi.delete(`/reports/${id}`);
      fetchReports();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const downloadReport = (report) => {
    const gpsLink =
      report.latitude && report.longitude
        ? `https://www.google.com/maps?q=${report.latitude},${report.longitude}`
        : "N/A";

    const rows = [
      ["Report ID", report._id],
      ["File Type", report.file_type || report.input_type || "image"],
      [
        report.input_type === "video" ? "Frames With Potholes" : "Potholes",
        report.input_type === "video"
          ? (report.frames_with_potholes ?? 0)
          : (report.pothole_count ?? 0),
      ],
      ["Severity", report.severity || "None"],
      ["Damage Percentage", `${report.damage_percentage ?? 0}%`],
      ["Zone", report.zone || "N/A"],
      ["Traffic", report.traffic || "N/A"],
      ["Camera Distance", report.camera_distance || "N/A"],
      ["Latitude", report.latitude || "N/A"],
      ["Longitude", report.longitude || "N/A"],
      ["GPS Link", gpsLink],
      [
        "File URL",
        report.input_type === "video"
          ? report.annotated_video_url || report.video_url || "N/A"
          : report.annotated_image_url || report.image_url || "N/A",
      ],
      [
        "Created At",
        report.createdAt ? new Date(report.createdAt).toLocaleString() : "N/A",
      ],
    ];

    const csv =
      "Field,Value\n" +
      rows
        .map(
          ([key, value]) => `"${key}","${String(value).replace(/"/g, '""')}"`,
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `pothole_report_${report._id}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = Array.isArray(reports)
    ? reports.filter((r) =>
        `${r.severity} ${r.zone} ${r.traffic} ${r.file_type || r.input_type}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : [];

  const totalReports = Array.isArray(reports) ? reports.length : 0;
  const highSeverity = Array.isArray(reports)
    ? reports.filter((r) => r.severity === "High").length
    : 0;

  const mediumSeverity = Array.isArray(reports)
    ? reports.filter((r) => r.severity === "Medium").length
    : 0;

  const lowSeverity = Array.isArray(reports)
    ? reports.filter((r) => r.severity === "Low").length
    : 0;

  const gpsAvailable = Array.isArray(reports)
    ? reports.filter((r) => r.latitude && r.longitude).length
    : 0;

  return (
    <div className="min-h-screen bg-primary text-content px-6 py-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <p className="text-accent text-sm font-semibold tracking-widest">
              ADMIN PANEL
            </p>

            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              Detection Reports Dashboard
            </h1>

            <p className="text-muted mt-2">
              View saved image/video pothole reports, severity, GPS status, and
              download reports.
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-secondary border border-borderline px-5 py-3 rounded-xl text-muted hover:text-content transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8">
          <StatCard
            icon={<FileText />}
            title="Total Reports"
            value={totalReports}
          />
          <StatCard
            icon={<AlertTriangle />}
            title="High Severity"
            value={highSeverity}
          />
          <StatCard
            icon={<Activity />}
            title="Medium Severity"
            value={mediumSeverity}
          />
          <StatCard
            icon={<Activity />}
            title="Low Severity"
            value={lowSeverity}
          />
          <StatCard
            icon={<MapPin />}
            title="GPS Available"
            value={gpsAvailable}
          />
        </div>

        <div className="bg-secondary border border-borderline rounded-3xl p-5 mb-6">
          <div className="flex items-center gap-3 bg-primary border border-borderline rounded-xl px-4 py-3">
            <Search size={20} className="text-muted" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by severity, zone, traffic, image, video..."
              className="w-full bg-transparent outline-none text-content"
            />
          </div>
        </div>

        <div className="bg-secondary border border-borderline rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-borderline">
            <h2 className="text-xl font-bold">Saved Detection Reports</h2>
            <p className="text-muted text-sm mt-1">
              Reports are automatically saved after user image/video analysis.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-muted">
              Loading reports...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-primary border-b border-borderline">
                  <tr>
                    <th className="p-4 text-sm text-muted">File</th>
                    <th className="p-4 text-sm text-muted">Type</th>
                    <th className="p-4 text-sm text-muted">Potholes</th>
                    <th className="p-4 text-sm text-muted">Severity</th>
                    <th className="p-4 text-sm text-muted">Damage %</th>
                    <th className="p-4 text-sm text-muted">Zone</th>
                    <th className="p-4 text-sm text-muted">Traffic</th>
                    <th className="p-4 text-sm text-muted">GPS</th>
                    <th className="p-4 text-sm text-muted">Date</th>
                    <th className="p-4 text-sm text-muted">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.map((report) => {
                    const fileType =
                      report.file_type || report.input_type || "image";

                    const fileUrl =
                      fileType === "video"
                        ? report.annotated_video_url ||
                          report.video_url ||
                          report.file_url ||
                          ""
                        : report.annotated_image_url ||
                          report.image_url ||
                          report.file_url ||
                          "";

                    return (
                      <tr
                        key={report._id}
                        className="border-b border-borderline last:border-b-0"
                      >
                        <td className="p-4">
                          {fileUrl ? (
                            fileType === "video" ? (
                              <video
                                src={fileUrl}
                                controls
                                className="w-32 h-20 object-cover rounded-xl border border-borderline"
                              />
                            ) : (
                              <img
                                src={fileUrl}
                                alt="Road"
                                className="w-32 h-20 object-cover rounded-xl border border-borderline"
                              />
                            )
                          ) : (
                            <div className="w-32 h-20 bg-primary border border-borderline rounded-xl flex items-center justify-center text-muted">
                              {fileType === "video" ? (
                                <Video size={24} />
                              ) : (
                                <ImageIcon size={24} />
                              )}
                            </div>
                          )}
                        </td>

                        <td className="p-4 capitalize font-semibold">
                          {fileType}
                        </td>

                        <td className="p-4 font-semibold">
                          {fileType === "video"
                            ? (report.frames_with_potholes ?? 0)
                            : (report.pothole_count ?? 0)}
                        </td>

                        <td className="p-4">
                          <SeverityBadge severity={report.severity} />
                        </td>

                        <td className="p-4">
                          {report.damage_percentage ?? 0}%
                        </td>
                        <td className="p-4">{report.zone || "N/A"}</td>
                        <td className="p-4">{report.traffic || "N/A"}</td>

                        <td className="p-4">
                          {report.latitude && report.longitude ? (
                            <a
                              href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-green-600 font-semibold inline-flex items-center gap-1"
                            >
                              Available <ExternalLink size={14} />
                            </a>
                          ) : (
                            <span className="text-muted">Not found</span>
                          )}
                        </td>

                        <td className="p-4 text-muted text-sm">
                          {report.createdAt
                            ? new Date(report.createdAt).toLocaleString()
                            : "N/A"}
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => downloadReport(report)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-all"
                            >
                              <Download size={16} />
                              Report
                            </button>

                            <button
                              onClick={() => deleteReport(report._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-all"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan="10" className="p-10 text-center text-muted">
                        No reports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-secondary border border-borderline rounded-2xl p-5 shadow-card">
      <div className="text-accent mb-4">{icon}</div>
      <p className="text-muted text-sm font-semibold">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const value = severity || "None";

  let style = "bg-gray-500/10 text-gray-500";

  if (value === "High") {
    style = "bg-red-500/10 text-red-500";
  } else if (value === "Medium") {
    style = "bg-amber-500/10 text-amber-500";
  } else if (value === "Low") {
    style = "bg-green-500/10 text-green-500";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {value}
    </span>
  );
}
