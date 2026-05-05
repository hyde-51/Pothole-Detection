import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Cpu,
  MapPin,
  AlertOctagon,
  TrendingDown,
  Car,
  ArrowRight,
  FileText,
  Activity,
  BarChart3,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToProblem = () => {
    const section = document.getElementById("problem-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-primary text-content font-sans transition-colors duration-300 overflow-hidden">
      {/* HERO */}
      <section className="min-h-screen px-6 py-10 flex items-center relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="max-w-[1200px] mx-auto w-full grid lg:grid-cols-2 gap-14 items-center relative z-10">
          {/* LEFT */}
          <div className="animate-fadeUp">
            <div className="inline-flex items-center gap-2 bg-secondary text-accent border border-borderline px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-card">
              <Activity size={18} />
              SYSTEM VERSION 2.0 • ONLINE
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
              Next-Gen Road <br />
              Condition Analytics
            </h1>

            <p className="text-lg md:text-xl text-muted leading-relaxed mb-8 max-w-xl">
              Deploying Hybrid Deep Learning using YOLOv8 and Faster R-CNN to
              detect, map, and analyze infrastructure decay from road images.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-accent hover:opacity-90 text-white px-7 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-card hover:-translate-y-1"
              >
                Access Dashboard
                <ArrowRight size={20} />
              </button>

              <button
                onClick={scrollToProblem}
                className="bg-secondary border border-borderline text-content hover:bg-primary px-7 py-4 rounded-xl font-semibold transition-all hover:-translate-y-1"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* RIGHT PREVIEW CARD */}
          <div className="bg-secondary border border-borderline rounded-3xl shadow-card p-6 animate-float">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted font-semibold">
                  AI ROAD SCAN
                </p>
                <h2 className="text-2xl font-bold">
                  Detection Preview
                </h2>
              </div>

              <div className="w-12 h-12 rounded-xl bg-primary text-accent flex items-center justify-center border border-borderline">
                <Cpu size={26} />
              </div>
            </div>

            <div className="relative h-[300px] bg-primary border border-borderline rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent animate-scanLine" />

              <div className="absolute top-12 left-10 w-40 h-24 border-4 border-red-500 bg-red-500/10 rounded-xl animate-boxPulse">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg">
                  HIGH 94%
                </span>
              </div>

              <div className="absolute bottom-12 right-10 w-32 h-20 border-4 border-amber-500 bg-amber-500/10 rounded-xl animate-boxPulse delay-300">
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg">
                  MEDIUM 78%
                </span>
              </div>

              <p className="text-muted font-semibold tracking-widest text-sm">
                AI VISION SIMULATION
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <MiniStat title="Potholes" value="24" />
              <MiniStat title="Severity" value="High" />
              <MiniStat title="Report" value="PDF" />
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section
        id="problem-section"
        className="px-6 py-24 bg-secondary border-y border-borderline transition-colors duration-300"
      >
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-accent font-semibold tracking-widest mb-3">
            PROBLEM STATEMENT
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-5">
            The Pothole Crisis
          </h2>

          <p className="text-muted max-w-3xl mx-auto text-lg leading-relaxed mb-14">
            Poor road conditions are more than just a nuisance; they are a
            massive economic and safety hazard worldwide. Traditional manual
            inspection is slow, expensive, and difficult to scale.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <InfoCard
              icon={<AlertOctagon size={34} className="text-red-500" />}
              title="Safety Hazard"
              desc="Potholes cause accidents, tire blowouts, vehicle imbalance, and loss of control, especially on highways."
            />

            <InfoCard
              icon={<TrendingDown size={34} className="text-amber-500" />}
              title="Economic Drain"
              desc="Governments spend large amounts on reactive repairs, while citizens face repair costs for vehicle damage."
            />

            <InfoCard
              icon={<Car size={34} className="text-green-500" />}
              title="Traffic Congestion"
              desc="Sudden braking and swerving near potholes causes traffic slowdown and increases travel time."
            />
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="px-6 py-24 bg-primary transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-accent font-semibold tracking-widest mb-3">
              AI SOLUTION
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How Our AI Solves It
            </h2>

            <p className="text-muted text-lg leading-relaxed mb-8">
              The system does not only find potholes; it analyzes them. By
              combining the speed of YOLOv8 with the accuracy of Faster R-CNN,
              it creates a reliable road damage assessment pipeline.
            </p>

            <div className="space-y-5">
              <SolutionItem
                icon={<Cpu size={26} className="text-accent" />}
                title="Hybrid Detection"
                desc="YOLOv8 performs fast detection, while Faster R-CNN improves localization and verification."
              />

              <SolutionItem
                icon={<MapPin size={26} className="text-green-600" />}
                title="Geospatial Tagging"
                desc="Extracts GPS metadata where available and maps detected potholes using location data."
              />

              <SolutionItem
                icon={<ShieldCheck size={26} className="text-amber-500" />}
                title="Material Estimation"
                desc="Estimates damaged area, approximate depth, repair material, and maintenance cost."
              />

              <SolutionItem
                icon={<FileText size={26} className="text-purple-600" />}
                title="Report Generation"
                desc="Generates official inspection reports with severity, image evidence, and telemetry details."
              />
            </div>
          </div>

          <div className="bg-secondary border border-borderline rounded-3xl shadow-card p-6">
            <h3 className="text-2xl font-bold mb-6">
              System Overview
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <OverviewCard
                icon={<BarChart3 size={24} />}
                title="Detection Accuracy"
                value="94%"
              />
              <OverviewCard
                icon={<Activity size={24} />}
                title="Road Damage"
                value="31%"
              />
              <OverviewCard
                icon={<MapPin size={24} />}
                title="GPS Mapping"
                value="Active"
              />
              <OverviewCard
                icon={<FileText size={24} />}
                title="Reports"
                value="PDF"
              />
            </div>

            <div className="mt-6 bg-primary border border-borderline rounded-2xl p-5">
              <div className="flex justify-between text-sm text-muted mb-2">
                <span>AI Processing Readiness</span>
                <span>78%</span>
              </div>

              <div className="h-3 bg-secondary rounded-full overflow-hidden border border-borderline">
                <div className="h-full w-[78%] bg-accent rounded-full animate-progressFill"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-secondary border-t border-borderline transition-colors duration-300">
        <div className="max-w-[1000px] mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Road Damage Analysis
          </h2>

          <p className="text-muted text-lg mb-8">
            Upload a road image and generate pothole detection results with
            severity, material estimation, GPS mapping, and PDF report.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-accent hover:opacity-90 text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2 transition-all hover:-translate-y-1"
          >
            Open Dashboard
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div className="bg-primary border border-borderline rounded-xl p-4 transition-colors duration-300">
      <p className="text-xs text-muted font-semibold uppercase">{title}</p>
      <h4 className="text-xl font-bold mt-1">{value}</h4>
    </div>
  );
}

function InfoCard({ icon, title, desc }) {
  return (
    <div className="bg-primary border border-borderline rounded-2xl p-7 text-left hover:shadow-card hover:-translate-y-1 transition-all duration-300">
      <div className="w-14 h-14 rounded-xl bg-secondary border border-borderline flex items-center justify-center mb-5">
        {icon}
      </div>

      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function SolutionItem({ icon, title, desc }) {
  return (
    <div className="bg-secondary border border-borderline rounded-2xl p-5 flex gap-4 hover:-translate-y-1 hover:shadow-card transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-primary border border-borderline flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <h4 className="text-lg font-bold mb-1">{title}</h4>
        <p className="text-muted leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function OverviewCard({ icon, title, value }) {
  return (
    <div className="bg-primary border border-borderline rounded-2xl p-5 hover:-translate-y-1 transition-all duration-300">
      <div className="text-accent mb-3">{icon}</div>
      <p className="text-sm text-muted font-semibold">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}