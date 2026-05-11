import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UploadCloud,
  MapPin,
  ArrowLeft,
  Download,
  FileImage,
  Gauge,
  Camera,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const PYTHON_API = import.meta.env.VITE_PYTHON_API || "http://localhost:8000";
const ADMIN_API = import.meta.env.VITE_ADMIN_API || "http://localhost:5000";

export default function ImageFlow() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [metadata, setMetadata] = useState({
    distance: "",
    traffic: "Medium",
    zone: "Urban",
  });

  const [processingText, setProcessingText] = useState(
    "Initializing AI Engine...",
  );
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep(2), 500);
        }
      }, 150);
    }
  };

  const normalizeResult = (apiResult) => {
    const cnn = apiResult.cnn;
    const yolo = apiResult.yolo;
    const detections = yolo?.detections || [];

    const storeImageUrl = apiResult.image_to_store?.cloudinary_url || "";

    const originalImageUrl = apiResult.original_image?.cloudinary_url || "";

    const annotatedImageUrl = apiResult.annotated_image?.cloudinary_url || "";

    const potholes = detections.map((d) => ({
      bbox: {
        left: d.bbox.left,
        top: d.bbox.top,
        width: d.bbox.width,
        height: d.bbox.height,
      },
      confidence: d.confidence,
      damage_percentage: d.area_ratio_percent,
      severity: d.severity,
      detected_by: "CNN + YOLO",
    }));

    return {
      status: "success",
      model_type: "CNN + YOLO Hybrid",
      final_verdict: apiResult.final_verdict,
      cnn_result: cnn,

      total_potholes_detected: yolo?.total_potholes || 0,
      road_damage_percent: yolo?.road_damage_percent || 0,
      potholes,

      original_image: apiResult.original_image,
      annotated_image: apiResult.annotated_image,

      original_image_url: originalImageUrl,
      annotated_image_url: annotatedImageUrl,

     image_url: storeImageUrl,

      gps_location: {
        latitude: apiResult.gps_location?.latitude || null,
        longitude: apiResult.gps_location?.longitude || null,
        google_maps_link: apiResult.gps_location?.google_maps_link || "",
      },
    };
  };

  const saveReportToAdmin = async (result) => {
    const payload = {
      input_type: "image",
      model_type: result.model_type,
      final_verdict: result.final_verdict,

      // If YOLO ran, save annotated image.
      // If YOLO skipped, save original image.
      image_url:
        result.annotated_image_url ||
        result.original_image_url ||
        result.image_url ||
        "",

      annotated_image_url: result.annotated_image_url || "",

      pothole_count: result.total_potholes_detected || 0,
      severity: result.potholes?.[0]?.severity || "None",
      damage_percentage: result.road_damage_percent || 0,

      traffic: metadata.traffic,
      zone: metadata.zone,
      camera_distance: metadata.distance || "",

      latitude: result.gps_location?.latitude || "",
      longitude: result.gps_location?.longitude || "",

      potholes: result.potholes || [],
      cnn_result: result.cnn_result || {},
    };
    await axios.post(`${ADMIN_API}/api/reports`, payload, {
      headers: { "Content-Type": "application/json" },
    });
  };

const startProcessing = async () => {
  if (!file) {
    setError("Please select an image first.");
    return;
  }

  setStep(3);

  const texts = [
    "CNN checking road condition...",
    "Running YOLO pothole detection...",
    "Extracting GPS metadata...",
    "Generating inspection report...",
  ];

  let i = 0;

  const textInterval = setInterval(() => {
    setProcessingText(texts[i % texts.length]);
    i++;
  }, 1500);

  const formData = new FormData();
  formData.append("file", file);

  try {
    

    const response = await axios.post(
      `${PYTHON_API}/api/pothole/analyze`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    

    const result = normalizeResult(response.data.result);

    clearInterval(textInterval);

    // SHOW RESULT IMMEDIATELY
    setResults(result);
    setStep(4);

    // SAVE REPORT IN BACKGROUND
    saveReportToAdmin(result)
      .then(() => {
        console.log("Report saved successfully");
      })
      .catch((saveError) => {
        console.error("Admin save failed:", saveError);
      });

  } catch (err) {
    clearInterval(textInterval);

    console.error(
      "AI ERROR:",
      err.response?.data || err.message
    );

    setError(
      err.response?.data?.detail ||
      "Failed to connect to AI backend."
    );

    setStep(1);
  }
};

  const openInMaps = () => {
    const mapLink = results?.gps_location?.google_maps_link;

    if (mapLink) {
      window.open(mapLink, "_blank");
      return;
    }

    const lat = results?.gps_location?.latitude;
    const lon = results?.gps_location?.longitude;

    if (!lat || !lon) {
      alert("Real image GPS location is not available.");
      return;
    }

    window.open(`https://www.google.com/maps?q=${lat},${lon}`, "_blank");
  };

  const calculateMaterials = (damagePct) => {
    const estimatedAreaSqMeters = (damagePct / 100) * 9;
    const estimatedDepthCm = damagePct > 15 ? 12 : damagePct > 5 ? 7 : 4;
    const volume = estimatedAreaSqMeters * (estimatedDepthCm / 100);
    const totalWeightKg = volume * 2400;

    return {
      depth: estimatedDepthCm,
      area: estimatedAreaSqMeters.toFixed(2),
      bitumen: (totalWeightKg * 0.05).toFixed(1),
      gravel: (totalWeightKg * 0.95).toFixed(1),
      cost: "Rs. " + (totalWeightKg * 0.15 * 80).toFixed(2),
    };
  };

  const exportToPDF = async () => {
    setIsExporting(true);

    const element = document.getElementById("pdf-report-container");

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Pothole_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to generate PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const hasLocation =
    results?.gps_location?.latitude && results?.gps_location?.longitude;

  return (
    <div className="min-h-screen bg-primary text-content px-6 py-10 transition-colors duration-300">
      <div className="w-full max-w-[1500px] mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8 animate-fadeUp">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-fit flex items-center gap-2 bg-secondary border border-borderline text-muted hover:text-content px-5 py-3 rounded-xl font-semibold transition-all"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="text-center">
            <p className="text-accent text-sm font-semibold tracking-widest">
              IMAGE ANALYSIS MODULE
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              CNN + YOLO Pothole Analysis
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-secondary border border-borderline px-5 py-3 rounded-xl">
            <Camera size={20} className="text-accent" />
            <span className="text-muted font-semibold text-sm">
              AI Engine Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8 animate-fadeUp">
          <StepItem number="1" label="Upload" active={step >= 1} />
          <StepItem number="2" label="Metadata" active={step >= 2} />
          <StepItem number="3" label="AI Scan" active={step >= 3} />
          <StepItem number="4" label="Report" active={step >= 4} />
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl p-4 text-center font-semibold">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="bg-secondary border border-borderline rounded-3xl p-8 md:p-14 text-center animate-fadeUp">
            <div className="w-20 h-20 rounded-2xl bg-primary border border-borderline mx-auto flex items-center justify-center text-accent mb-6">
              <UploadCloud size={42} />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Upload Road Image
            </h2>

            <p className="text-muted text-lg mb-8">
              Browse road image for pothole detection.
            </p>

            <div className="max-w-xl mx-auto border-2 border-dashed border-borderline rounded-2xl p-8 bg-primary">
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />

              <label
                htmlFor="fileUpload"
                className="inline-flex items-center gap-3 bg-accent text-white px-7 py-4 rounded-xl font-semibold cursor-pointer hover:opacity-90 transition-all"
              >
                <FileImage size={22} />
                Browse Image
              </label>

              <p className="text-muted text-sm mt-4">
                Supports JPG, PNG, WEBP. Original camera photos may contain GPS.
              </p>

              {uploadProgress > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between text-sm text-muted mb-2">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>

                  <div className="h-3 bg-secondary border border-borderline rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid md:grid-cols-2 gap-8 bg-secondary border border-borderline rounded-3xl p-6 md:p-8 animate-fadeUp">
            <div className="bg-primary border border-borderline rounded-2xl p-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-[430px] object-cover rounded-xl"
              />
            </div>

            <div>
              <p className="text-accent text-sm font-semibold tracking-widest mb-2">
                SITE DETAILS
              </p>

              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <MapPin size={24} className="text-accent" />
                Inspection Data
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-muted font-semibold mb-2">
                    Camera Distance to Damage (meters)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={metadata.distance}
                    onChange={(e) =>
                      setMetadata({ ...metadata, distance: e.target.value })
                    }
                    className="w-full bg-primary border border-borderline text-content rounded-xl px-4 py-3 outline-none focus:border-accent transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted font-semibold mb-2">
                      Traffic Density
                    </label>
                    <select
                      value={metadata.traffic}
                      onChange={(e) =>
                        setMetadata({ ...metadata, traffic: e.target.value })
                      }
                      className="w-full bg-primary border border-borderline text-content rounded-xl px-4 py-3 outline-none focus:border-accent transition-all"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-muted font-semibold mb-2">
                      Zone
                    </label>
                    <select
                      value={metadata.zone}
                      onChange={(e) =>
                        setMetadata({ ...metadata, zone: e.target.value })
                      }
                      className="w-full bg-primary border border-borderline text-content rounded-xl px-4 py-3 outline-none focus:border-accent transition-all"
                    >
                      <option>Urban</option>
                      <option>Rural</option>
                      <option>Highway</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={startProcessing}
                  className="w-full bg-accent text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  <Gauge size={21} />
                  Initialize AI Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-secondary border border-borderline rounded-3xl p-8 md:p-14 text-center animate-fadeUp">
            <div className="relative max-w-md h-[260px] mx-auto bg-primary border border-borderline rounded-2xl overflow-hidden">
              <img
                src={previewUrl}
                alt="Processing"
                className="w-full h-full object-cover opacity-50 grayscale"
              />
              <div className="absolute top-0 left-0 w-full h-1 bg-accent animate-scanLine" />
            </div>

            <h2 className="text-2xl font-bold mt-8">{processingText}</h2>
            <p className="text-muted mt-2">Hybrid Engine: CNN + YOLO active</p>
          </div>
        )}

        {step === 4 && results && (
          <div className="animate-fadeUp space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-accent text-sm font-semibold tracking-widest">
                  DETECTION REPORT
                </p>
                <h2 className="text-3xl font-bold mt-1">Analysis Complete</h2>
                <p className="text-muted mt-1">
                  Road surface analysis completed successfully.
                </p>
              </div>

              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white ${
                  isExporting
                    ? "bg-slate-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500"
                }`}
              >
                <Download size={18} />
                {isExporting ? "Generating..." : "Download Report"}
              </button>
            </div>

            <div
              id="pdf-report-container"
              className="space-y-6 bg-primary text-content p-4 rounded-3xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <CleanStat
                  title="Total Potholes"
                  value={results.total_potholes_detected}
                />
                <CleanStat
                  title="Severity"
                  value={
                    results.potholes?.length > 0
                      ? results.potholes[0].severity
                      : "None"
                  }
                />
                <CleanStat
                  title="CNN Confidence"
                  value={`${Math.round(
                    (results.cnn_result?.confidence || 0) * 100,
                  )}%`}
                />
                <CleanStat
                  title="Image GPS"
                  value={hasLocation ? "Available" : "Unavailable"}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_0.9fr] gap-6">
                <div className="bg-secondary border border-borderline rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Detected Image</h3>
                    <span className="text-xs text-muted bg-primary border border-borderline px-3 py-1 rounded-full">
                      {results.image_url ? "Cloudinary Saved" : "Local Preview"}
                    </span>
                  </div>

                  <div className="relative w-full h-[620px] bg-black rounded-2xl overflow-hidden border border-borderline">
                    <img
                      src={results.image_url || previewUrl}
                      alt="Analyzed"
                      className="w-full h-full object-fill"
                    />

                    {!results.image_url &&
                      results.potholes?.map((p, i) => (
                        <div
                          key={i}
                          className={`absolute border-[3px] ${
                            p.severity === "High"
                              ? "border-red-500 bg-red-500/20"
                              : p.severity === "Medium"
                                ? "border-amber-500 bg-amber-500/20"
                                : "border-green-500 bg-green-500/20"
                          }`}
                          style={{
                            top: `${p.bbox.top}%`,
                            left: `${p.bbox.left}%`,
                            width: `${p.bbox.width}%`,
                            height: `${p.bbox.height}%`,
                          }}
                        >
                          <span
                            className={`text-white text-xs px-2 py-1 font-semibold inline-block ${
                              p.severity === "High"
                                ? "bg-red-500"
                                : p.severity === "Medium"
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                            }`}
                          >
                            {Math.round(p.confidence * 100)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-secondary border border-borderline rounded-3xl p-5">
                    <h3 className="text-lg font-bold mb-4">
                      Inspection Details
                    </h3>

                    <CleanRow label="Traffic" value={metadata.traffic} />
                    <CleanRow label="Zone" value={metadata.zone} />
                    <CleanRow
                      label="Camera Distance"
                      value={
                        metadata.distance ? `${metadata.distance} m` : "N/A"
                      }
                    />
                    <CleanRow
                      label="Damage"
                      value={`${results.road_damage_percent}%`}
                    />
                    <CleanRow
                      label="Final Verdict"
                      value={results.final_verdict}
                    />
                    <CleanRow
                      label="GPS Source"
                      value={hasLocation ? "Image EXIF" : "Not available"}
                    />
                  </div>

                  {results.potholes?.length > 0 && (
                    <div className="bg-secondary border border-borderline rounded-3xl p-5">
                      <h3 className="text-lg font-bold mb-4">
                        Repair Estimation
                      </h3>

                      <div className="space-y-4">
                        {results.potholes.map((p, index) => {
                          const mats = calculateMaterials(p.damage_percentage);

                          return (
                            <div
                              key={index}
                              className="bg-primary rounded-2xl border border-borderline p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold">
                                  Pothole #{index + 1}
                                </h4>

                                <span
                                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                    p.severity === "High"
                                      ? "bg-red-500/10 text-red-500"
                                      : p.severity === "Medium"
                                        ? "bg-amber-500/10 text-amber-500"
                                        : "bg-green-500/10 text-green-500"
                                  }`}
                                >
                                  {p.severity}
                                </span>
                              </div>

                              <CleanRow
                                label="Confidence"
                                value={`${Math.round(p.confidence * 100)}%`}
                              />
                              <CleanRow
                                label="Depth"
                                value={`${mats.depth} cm`}
                              />
                              <CleanRow
                                label="Area"
                                value={`${mats.area} m²`}
                              />
                              <CleanRow
                                label="Bitumen"
                                value={`${mats.bitumen} kg`}
                              />
                              <CleanRow
                                label="Gravel"
                                value={`${mats.gravel} kg`}
                              />

                              <div className="mt-3 pt-3 border-t border-borderline flex items-center justify-between">
                                <span className="text-muted text-sm">
                                  Estimated Cost
                                </span>
                                <strong>{mats.cost}</strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-secondary border border-borderline rounded-3xl p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-bold">Location Mapping</h3>

                  {hasLocation && (
                    <button
                      onClick={openInMaps}
                      className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl font-semibold"
                    >
                      <ExternalLink size={17} />
                      Open in Maps
                    </button>
                  )}
                </div>

                {hasLocation ? (
                  <div className="h-[380px] w-full rounded-2xl overflow-hidden border border-borderline">
                    <MapContainer
                      center={[
                        parseFloat(results.gps_location.latitude),
                        parseFloat(results.gps_location.longitude),
                      ]}
                      zoom={16}
                      className="h-full w-full"
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[
                          parseFloat(results.gps_location.latitude),
                          parseFloat(results.gps_location.longitude),
                        ]}
                      >
                        <Popup>
                          <div>
                            <p className="font-semibold">Image EXIF location</p>
                            <button
                              onClick={openInMaps}
                              className="mt-2 text-blue-600 underline"
                            >
                              Open in Google Maps
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <div className="bg-primary border border-dashed border-borderline rounded-2xl p-10 text-center text-muted">
                    GPS data is not available inside this image. Use original
                    camera photos with location enabled.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepItem({ number, label, active }) {
  return (
    <div
      className={`rounded-2xl border p-4 text-center transition-all ${
        active
          ? "bg-secondary border-accent text-content"
          : "bg-secondary border-borderline text-muted"
      }`}
    >
      <div
        className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold mb-2 ${
          active ? "bg-accent text-white" : "bg-primary text-muted"
        }`}
      >
        {active ? <CheckCircle2 size={18} /> : number}
      </div>
      <p className="text-xs md:text-sm font-semibold uppercase">{label}</p>
    </div>
  );
}

function CleanStat({ title, value }) {
  return (
    <div className="bg-secondary border border-borderline rounded-2xl p-5">
      <p className="text-muted text-sm font-semibold">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
}

function CleanRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-borderline last:border-b-0">
      <span className="text-muted text-sm">{label}</span>
      <strong className="text-sm">{value}</strong>
    </div>
  );
}
