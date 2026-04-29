import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Cpu, MapPin, AlertOctagon, TrendingDown, Car } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // NEW: Smooth scroll function
  const scrollToNextSection = () => {
    const nextSection = document.getElementById('problem-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-primary text-content transition-colors duration-400">
      
      {/* SECTION 1: FULL SCREEN HERO */}
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-5 relative">
        <div className="animate-fade-up max-w-[800px] z-10">
          <div className="inline-block px-4 py-2 bg-secondary text-accent border border-borderline rounded-full text-sm font-bold mb-5 tracking-widest shadow-sm">
            SYSTEM VERSION 2.0 • ONLINE
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 text-content">
            Next-Gen Road<br/>Condition Analytics
          </h1>
          <p className="text-xl md:text-2xl text-muted mb-10 leading-relaxed max-w-2xl mx-auto">
            Deploying Hybrid Deep Learning (YOLOv8 + Faster R-CNN) to detect, map, and analyze infrastructure decay in real-time.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="hover-scale px-12 py-5 text-xl font-bold text-white bg-accent rounded-xl shadow-[0_4px_20px_var(--accent-glow)] transition-all hover:opacity-90 active:scale-95"
          >
            Access Dashboard →
          </button>
        </div>
        
        {/* UPDATED: Functional Scroll Indicator with Tailwind bounce */}
        <div 
          onClick={scrollToNextSection}
          className="absolute bottom-10 flex flex-col items-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity animate-bounce z-20"
        >
          <p className="text-xs tracking-widest mb-2 text-muted font-bold">SCROLL TO LEARN</p>
          <div className="w-[2px] h-8 bg-accent rounded-full"></div>
        </div>
      </div>

      {/* SECTION 2: THE PROBLEM (Educational) */}
      {/* UPDATED: Added id="problem-section" so the scroll function can find it */}
      <div id="problem-section" className="py-24 px-5 bg-secondary text-center transition-colors duration-400 border-y border-borderline">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-5 text-content">The Pothole Crisis</h2>
        <p className="text-muted max-w-[700px] mx-auto mb-16 text-lg leading-relaxed">
          Poor road conditions are more than just a nuisance; they are a massive economic and safety hazard worldwide. Traditional manual inspection is too slow.
        </p>

        <div className="flex justify-center gap-8 flex-wrap max-w-[1200px] mx-auto">
          <InfoCard 
            icon={<AlertOctagon size={40} className="text-red-500" />}
            title="Safety Hazard"
            desc="Potholes are a leading cause of severe vehicular accidents, tire blowouts, and loss of vehicle control, especially at high speeds."
          />
          <InfoCard 
            icon={<TrendingDown size={40} className="text-amber-500" />}
            title="Economic Drain"
            desc="Governments spend billions annually on reactive repairs, while drivers face massive repair bills for suspension and wheel damage."
          />
          <InfoCard 
            icon={<Car size={40} className="text-green-500" />}
            title="Traffic Congestion"
            desc="Sudden braking and swerving to avoid road damage causes severe bottlenecking and increases carbon emissions in urban areas."
          />
        </div>
      </div>

      {/* SECTION 3: THE AI SOLUTION */}
      <div className="py-24 px-5 bg-primary transition-colors duration-400">
        <div className="max-w-[1200px] mx-auto flex flex-wrap lg:flex-nowrap gap-16 items-center">
          
          <div className="flex-1 min-w-[300px]">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-content">How Our AI Solves It</h2>
            <p className="text-muted text-lg leading-relaxed mb-8">
              We don't just find potholes; we analyze them. By combining the blazing speed of <strong className="text-content">YOLOv8</strong> with the pinpoint accuracy of <strong className="text-content">Faster R-CNN</strong>, our system creates a robust evaluation pipeline.
            </p>
            
            <ul className="flex flex-col gap-6">
              <li className="flex items-start gap-4">
                <Cpu size={28} className="text-accent shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-bold mb-1 text-content">Hybrid Detection</h4>
                  <p className="text-muted leading-relaxed">YOLO scans for fast real-time edge processing, while R-CNN verifies complex surface anomalies.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <MapPin size={28} className="text-green-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-bold mb-1 text-content">Automated Geospatial Tagging</h4>
                  <p className="text-muted leading-relaxed">Extracts EXIF metadata from imagery to plot exact damage coordinates on interactive maps.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <ShieldCheck size={28} className="text-amber-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-xl font-bold mb-1 text-content">Material Estimation Math</h4>
                  <p className="text-muted leading-relaxed">Proprietary algorithms calculate surface area to estimate exact kg of bitumen needed for repair.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex-1 min-w-[300px] bg-secondary rounded-[2rem] p-8 md:p-10 border border-borderline shadow-card">
            <div className="w-full h-[300px] bg-primary rounded-2xl border-2 border-dashed border-borderline flex items-center justify-center relative overflow-hidden">
              
              <style>
                {`
                  @keyframes scanLine {
                    0% { top: 0; }
                    50% { top: calc(100% - 2px); }
                    100% { top: 0; }
                  }
                `}
              </style>

              <div className="absolute left-0 w-full h-[2px] bg-accent shadow-[0_0_15px_var(--accent)] animate-[scanLine_3s_infinite_ease-in-out]"></div>
              
              <p className="text-muted font-bold tracking-[0.2em]">AI VISION SIMULATION</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// Reusable UI Component for the feature cards
function InfoCard({ icon, title, desc }) {
  return (
    <div className="hover-scale bg-primary p-10 rounded-2xl w-full max-w-[350px] border border-borderline text-left shadow-sm">
      <div className="mb-6 p-4 bg-secondary inline-block rounded-xl border border-borderline shadow-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-content mb-3">{title}</h3>
      <p className="text-muted leading-relaxed">{desc}</p>
    </div>
  );
}