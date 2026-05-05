import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  MapPin,
  Activity,
  Search,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/reports`);
      setReports(res.data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/reports/${id}`);
      fetchReports();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete report");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const text = `
      ${report.severity || ""}
      ${report.zone || ""}
      ${report.traffic || ""}
      ${report.input_type || ""}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const totalReports = reports.length;
  const highSeverity = reports.filter((r) => r.severity === "High").length;
  const mediumSeverity = reports.filter((r) => r.severity === "Medium").length;
  const gpsAvailable = reports.filter((r) => r.latitude && r.longitude).length;

  return (
    <div className="min-h-screen bg-primary text-content px-6 py-8 transition-colors duration-300">
      <div className="max-w-[1500px] mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 bg-secondary border border-borderline px-5 py-3 rounded-xl text-muted hover:text-content transition-all"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-accent text-sm font-semibold tracking-widest">
            ADMIN PANEL
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Detection Reports Dashboard
          </h1>

          <p className="text-muted mt-3 text-lg">
            View pothole detection history, severity, GPS status, and manage
            saved reports.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={<FileText size={26} />}
            title="Total Reports"
            value={totalReports}
          />

          <StatCard
            icon={<AlertTriangle size={26} />}
            title="High Severity"
            value={highSeverity}
          />

          <StatCard
            icon={<Activity size={26} />}
            title="Medium Severity"
            value={mediumSeverity}
          />

          <StatCard
            icon={<MapPin size={26} />}
            title="GPS Available"
            value={gpsAvailable}
          />
        </div>

        {/* Search */}
        <div className="bg-secondary border border-borderline rounded-3xl p-5 mb-6">
          <div className="flex items-center gap-3 bg-primary border border-borderline rounded-xl px-4 py-3">
            <Search size={20} className="text-muted" />

            <input
              type="text"
              placeholder="Search by severity, zone, traffic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-content placeholder:text-muted"
            />
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-secondary border border-borderline rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-borderline">
            <h2 className="text-xl font-bold">Saved Detection Reports</h2>
            <p className="text-muted text-sm mt-1">
              All reports saved after image analysis will appear here.
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
                    <th className="p-4 text-sm text-muted">Image</th>
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
                  {filteredReports.map((report) => (
                    <tr
                      key={report._id}
                      className="border-b border-borderline last:border-b-0"
                    >
                      <td className="p-4">
                        {report.image_url ? (
                          <img
                            src={report.image_url}
                            alt="Road"
                            className="w-24 h-16 object-cover rounded-xl border border-borderline"
                          />
                        ) : (
                          <div className="w-24 h-16 bg-primary border border-borderline rounded-xl flex items-center justify-center text-muted">
                            <ImageIcon size={22} />
                          </div>
                        )}
                      </td>

                      <td className="p-4 font-semibold">
                        {report.pothole_count ?? 0}
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
                          <span className="text-green-500 font-semibold">
                            Available
                          </span>
                        ) : (
                          <span className="text-muted">Not found</span>
                        )}
                      </td>

                      <td className="p-4 text-muted text-sm">
                        {report.created_at
                          ? new Date(report.created_at).toLocaleString()
                          : "N/A"}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => deleteReport(report._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-all"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan="9" className="p-10 text-center text-muted">
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
    <div className="bg-secondary border border-borderline rounded-2xl p-5 hover:shadow-card transition-all">
      <div className="text-accent mb-4">{icon}</div>

      <p className="text-muted text-sm font-semibold">{title}</p>

      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const value = severity || "None";

  let styles = "bg-gray-500/10 text-gray-500";

  if (value === "High") {
    styles = "bg-red-500/10 text-red-500";
  } else if (value === "Medium") {
    styles = "bg-amber-500/10 text-amber-500";
  } else if (value === "Low") {
    styles = "bg-green-500/10 text-green-500";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}>
      {value}
    </span>
  );
}