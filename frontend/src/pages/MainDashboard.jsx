import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Image as ImageIcon,
  Video,
  Radio,
  ArrowRight,
  Activity,
} from "lucide-react";
import { ArrowLeft } from "lucide-react";

export default function MainDashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-primary text-content px-5 py-16 transition-colors duration-400">
      <div className="max-w-[1250px] mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary border border-borderline text-muted hover:text-content transition-all"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-borderline rounded-full text-accent text-sm font-bold tracking-widest mb-5 shadow-card">
            <Activity size={16} />
            ANALYSIS CONTROL CENTER
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-content mb-4">
            Select Analysis Mode
          </h2>

          <p className="text-muted text-center text-lg md:text-xl max-w-2xl mx-auto">
            Choose a data source to begin AI surface processing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full">
          <ModeCard
            icon={<ImageIcon size={48} className="text-accent" />}
            title="Upload Image"
            desc="Static high-resolution analysis with full EXIF metadata extraction and material estimation."
            onClick={() => navigate("/upload/image")}
            active={true}
          />

          <ModeCard
            icon={<Video size={48} className="text-muted" />}
            title="Upload Video"
            desc="Frame-by-frame stretch analysis. Generates total damage length and heatmap."
            active={false}
            badge="Coming Soon"
          />

          <ModeCard
            icon={<Radio size={48} className="text-red-500" />}
            title="Live Detection"
            desc="Connect edge device or mobile camera for real-time inference and telemetry."
            active={false}
            badge="Coming Soon"
          />
        </div>

        <div className="mt-12 bg-secondary border border-borderline rounded-[2rem] p-6 md:p-8 shadow-card">
          <div className="grid md:grid-cols-4 gap-5">
            <StatCard title="AI Engine" value="Hybrid" />
            <StatCard title="Image Flow" value="Active" />
            <StatCard title="Video Flow" value="Soon" />
            <StatCard title="Live Flow" value="Soon" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeCard({ icon, title, desc, onClick, active, badge }) {
  return (
    <div
      onClick={active ? onClick : undefined}
      className={`relative group bg-secondary p-8 md:p-10 rounded-[2rem] min-h-[360px] border border-borderline transition-all duration-300 shadow-card overflow-hidden
        ${
          active
            ? "cursor-pointer hover:-translate-y-2 hover:border-accent/60"
            : "cursor-not-allowed opacity-60"
        }
      `}
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-[70px]" />

      {badge && (
        <span className="absolute top-5 right-5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-bold">
          {badge}
        </span>
      )}

      <div className="relative z-10">
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-primary rounded-3xl border border-borderline shadow-sm group-hover:scale-110 transition-all duration-300">
            {icon}
          </div>
        </div>

        <h3 className="text-2xl font-black text-content mb-4 text-center">
          {title}
        </h3>

        <p className="text-muted text-base leading-relaxed text-center">
          {desc}
        </p>

        <div className="mt-8 flex justify-center">
          {active ? (
            <button className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_20px_var(--accent-glow)] hover:scale-105 transition">
              Open Module
              <ArrowRight size={18} />
            </button>
          ) : (
            <button className="px-6 py-3 rounded-xl font-bold bg-primary text-muted border border-borderline">
              Future Feature
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-primary border border-borderline rounded-2xl p-5">
      <p className="text-muted text-xs font-bold uppercase tracking-wider">
        {title}
      </p>
      <h3 className="text-2xl font-black text-content mt-2">{value}</h3>
    </div>
  );
}
