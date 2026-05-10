import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UploadCloud,
  ArrowLeft,
  Download,
  FileVideo,
  Gauge,
  Video,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const PYTHON_API = import.meta.env.VITE_PYTHON_API || "http://localhost:8000";
const ADMIN_API = import.meta.env.VITE_ADMIN_API || "http://localhost:5000";

export default function VideoFlow() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingText, setProcessingText] = useState("Initializing AI Engine...");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const [metadata, setMetadata] = useState({
    traffic: "Medium",
    zone: "Urban",
    distance: "",
  });

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

  const normalizeVideoResult = (apiResult) => {
    return {
      input_type: "video",
      model_type: "YOLO Video Detection",
      final_verdict: apiResult.final_verdict || "unknown",

      annotated_video_url: apiResult.annotated_video?.cloudinary_url || "",
      original_video_url: apiResult.original_video?.cloudinary_url || "",

      gps_location: {
        latitude: apiResult.gps_location?.latitude || null,
        longitude: apiResult.gps_location?.longitude || null,
        google_maps_link: apiResult.gps_location?.google_maps_link || "",
      },

      has_pothole: apiResult.analysis?.has_pothole || false,
      pothole_count: apiResult.analysis?.total_pothole_boxes || 0,
      frames_with_potholes: apiResult.analysis?.frames_with_potholes || 0,
      total_frames_checked: apiResult.analysis?.total_frames_checked || 0,
      total_frames_in_video: apiResult.analysis?.total_frames_in_video || 0,
      fps: apiResult.analysis?.fps || 0,
      severity: apiResult.analysis?.severity || "None",
      max_damage_percentage: apiResult.analysis?.max_damage_percentage || 0,
      pothole_frames: apiResult.pothole_frames || [],
    };
  };

  const saveVideoReportToAdmin = async (result) => {
    const payload = {
      input_type: "video",
      model_type: result.model_type,
      final_verdict: result.final_verdict,

      video_url: result.annotated_video_url,
      annotated_video_url: result.annotated_video_url,

      pothole_count: result.pothole_count,
      severity: result.severity,
      damage_percentage: result.max_damage_percentage,

      traffic: metadata.traffic,
      zone: metadata.zone,
      camera_distance: metadata.distance || "",

      latitude: result.gps_location?.latitude || "",
      longitude: result.gps_location?.longitude || "",

      frames_with_potholes: result.frames_with_potholes,
      total_frames_checked: result.total_frames_checked,
      total_frames_in_video: result.total_frames_in_video,
      fps: result.fps,
      detections_by_frame: result.pothole_frames,
    };

    await axios.post(`${ADMIN_API}/api/reports`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const startProcessing = async () => {
    if (!file) {
      setError("Please select a video first.");
      return;
    }

    setStep(3);

    const texts = [
      "Reading video frames...",
      "Running YOLO detection...",
      "Drawing bounding boxes...",
      "Uploading annotated video to Cloudinary...",
      "Saving report to admin dashboard...",
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
        `${PYTHON_API}/api/pothole/video-analyze`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("VIDEO API RESPONSE:", response.data);
      console.log(
        "ANNOTATED URL:",
        response.data.result?.annotated_video?.cloudinary_url
      );

      const result = normalizeVideoResult(response.data.result);

      try {
        await saveVideoReportToAdmin(result);
        console.log("Video report saved to admin successfully");
      } catch (saveError) {
        console.error("Admin video save failed:", saveError);
      }

      clearInterval(textInterval);
      setResults(result);
      setStep(4);
    } catch (err) {
      clearInterval(textInterval);
      console.error("Video AI error:", err.response?.data || err.message);
      setError(
        err.response?.data?.detail ||
          "Failed to connect to AI video server. Ensure backend is running."
      );
      setStep(1);
    }
  };

  const downloadSummary = () => {
    const content = JSON.stringify(results, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Video_Pothole_Report_${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const openVideo = (url) => {
    if (!url) {
      alert("Video URL is not available.");
      return;
    }

    window.open(url, "_blank");
  };

  const openMap = () => {
    const link = results?.gps_location?.google_maps_link;

    if (!link) {
      alert("Video GPS location is not available.");
      return;
    }

    window.open(link, "_blank");
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
              VIDEO ANALYSIS MODULE
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              YOLO Video Pothole Analysis
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-secondary border border-borderline px-5 py-3 rounded-xl">
            <Video size={20} className="text-accent" />
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
              Upload Road Video
            </h2>

            <p className="text-muted text-lg mb-8">
              Browse road video for pothole detection.
            </p>

            <div className="max-w-xl mx-auto border-2 border-dashed border-borderline rounded-2xl p-8 bg-primary">
              <input
                type="file"
                id="videoUpload"
                className="hidden"
                onChange={handleFileChange}
                accept="video/*"
              />

              <label
                htmlFor="videoUpload"
                className="inline-flex items-center gap-3 bg-accent text-white px-7 py-4 rounded-xl font-semibold cursor-pointer hover:opacity-90 transition-all"
              >
                <FileVideo size={22} />
                Browse Video
              </label>

              <p className="text-muted text-sm mt-4">
                Supports MP4, MOV, AVI, WEBM, MKV.
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
              <video
                src={previewUrl}
                controls
                className="w-full max-h-[430px] object-contain rounded-xl bg-black"
              />
            </div>

            <div>
              <p className="text-accent text-sm font-semibold tracking-widest mb-2">
                SITE DETAILS
              </p>

              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                Video Telemetry Data
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-muted font-semibold mb-2">
                    Camera Distance to Road (meters)
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
                  Initialize Video Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-secondary border border-borderline rounded-3xl p-8 md:p-14 text-center animate-fadeUp">
            <div className="relative max-w-md h-[260px] mx-auto bg-primary border border-borderline rounded-2xl overflow-hidden">
              <video
                src={previewUrl}
                className="w-full h-full object-cover opacity-50 grayscale"
                muted
                autoPlay
                loop
              />
              <div className="absolute top-0 left-0 w-full h-1 bg-accent animate-scanLine" />
            </div>

            <h2 className="text-2xl font-bold mt-8">{processingText}</h2>
            <p className="text-muted mt-2">
              YOLO is analyzing video frames.
            </p>
          </div>
        )}

        {step === 4 && results && (
          <div className="animate-fadeUp space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-accent text-sm font-semibold tracking-widest">
                  VIDEO DETECTION REPORT
                </p>
                <h2 className="text-3xl font-bold mt-1">Analysis Complete</h2>
                <p className="text-muted mt-1">
                  Video road surface analysis completed successfully.
                </p>
              </div>

              <button
                onClick={downloadSummary}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-500"
              >
                <Download size={18} />
                Download JSON Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <CleanStat title="Final Verdict" value={results.final_verdict} />
              <CleanStat title="Total Boxes" value={results.pothole_count} />
              <CleanStat
                title="Frames With Potholes"
                value={results.frames_with_potholes}
              />
              <CleanStat title="FPS" value={results.fps} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_0.9fr] gap-6">
              <div className="bg-secondary border border-borderline rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Annotated Video</h3>

                  {results.annotated_video_url && (
                    <button
                      onClick={() => openVideo(results.annotated_video_url)}
                      className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl font-semibold"
                    >
                      <ExternalLink size={17} />
                      Open Video
                    </button>
                  )}
                </div>

                {results.annotated_video_url ? (
                  <video
                    src={results.annotated_video_url}
                    controls
                    className="w-full max-h-[620px] bg-black rounded-2xl"
                  />
                ) : (
                  <div className="bg-black text-white p-10 rounded-2xl text-center">
                    Annotated video URL not available. Check Cloudinary upload.
                  </div>
                )}
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
                    value={metadata.distance ? `${metadata.distance} m` : "N/A"}
                  />
                  <CleanRow
                    label="Total Frames Checked"
                    value={results.total_frames_checked}
                  />
                  <CleanRow
                    label="Total Frames In Video"
                    value={results.total_frames_in_video}
                  />
                  <CleanRow
                    label="Pothole Found"
                    value={results.has_pothole ? "Yes" : "No"}
                  />
                  <CleanRow
                    label="Video GPS"
                    value={hasLocation ? "Available" : "Not found"}
                  />
                </div>

                <div className="bg-secondary border border-borderline rounded-3xl p-5">
                  <h3 className="text-lg font-bold mb-4">
                    Cloudinary Links
                  </h3>

                  <button
                    onClick={() => openVideo(results.annotated_video_url)}
                    className="w-full mb-3 bg-primary border border-borderline px-4 py-3 rounded-xl text-left hover:border-accent"
                  >
                    Open Annotated Video
                  </button>

                  {hasLocation && (
                    <button
                      onClick={openMap}
                      className="w-full bg-primary border border-borderline px-4 py-3 rounded-xl text-left hover:border-accent"
                    >
                      Open Video Location
                    </button>
                  )}
                </div>
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