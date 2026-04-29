import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Video, Radio } from 'lucide-react';

export default function MainDashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-32 pb-16 px-5 transition-colors duration-400">
      <h2 className="text-4xl md:text-5xl font-extrabold text-content mb-4 text-center">
        Select Analysis Mode
      </h2>
      <p className="text-muted text-center mb-16 text-lg md:text-xl max-w-2xl">
        Choose a data source to begin AI surface processing.
      </p>

      <div className="flex gap-10 justify-center flex-wrap w-full max-w-[1200px]">
        
        {/* Active: Image Flow */}
        <ModeCard 
          icon={<ImageIcon size={48} className="text-accent" />}
          title="Upload Image"
          desc="Static high-resolution analysis with full EXIF metadata extraction and material estimation."
          onClick={() => navigate('/upload/image')}
          active={true}
        />
        
        {/* Inactive: Video Flow */}
        <ModeCard 
          icon={<Video size={48} className="text-muted" />}
          title="Upload Video"
          desc="Frame-by-frame stretch analysis. Generates total damage length and heatmap."
          onClick={() => alert("Video Flow coming soon!")}
          active={false}
        />

        {/* Inactive: Live Flow */}
        <ModeCard 
          icon={<Radio size={48} className="text-red-500" />}
          title="Live Detection"
          desc="Connect edge device or mobile camera for real-time inference and telemetry."
          onClick={() => alert("Live Flow coming soon!")}
          active={false}
        />
        
      </div>
    </div>
  );
}

// Reusable Card Component
function ModeCard({ icon, title, desc, onClick, active }) {
  return (
    <div 
      onClick={active ? onClick : undefined}
      className={`bg-secondary p-10 md:p-12 rounded-3xl w-full max-w-[320px] text-center border border-borderline transition-all duration-300 
        ${active ? 'cursor-pointer hover-scale opacity-100' : 'cursor-not-allowed opacity-50'}
      `}
    >
      <div className="flex justify-center mb-8">
        <div className="p-6 bg-primary rounded-full border border-borderline shadow-sm">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-content mb-4">{title}</h3>
      <p className="text-muted text-base leading-relaxed">{desc}</p>
    </div>
  );
}