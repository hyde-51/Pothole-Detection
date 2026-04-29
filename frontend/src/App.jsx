import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import MainDashboard from './pages/MainDashboard';
import ImageFlow from './pages/ImageFlow';

function App() {
  // State for Dark Mode (Defaults to dark)
  const [isDark, setIsDark] = useState(true);

  // Apply the theme to the HTML document whenever the toggle is clicked
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <Router>
      {/* Floating Theme Toggle Switch - Now using Tailwind CSS! */}
      <button 
        onClick={() => setIsDark(!isDark)}
        className="fixed top-5 right-8 z-[9999] p-3 rounded-full border border-borderline bg-secondary text-content flex items-center justify-center shadow-card transition-all duration-300 hover:scale-110 active:scale-95"
        title="Toggle Light/Dark Mode"
      >
        {isDark ? (
          <Sun size={24} className="text-amber-500" /> 
        ) : (
          <Moon size={24} className="text-blue-500" />
        )}
      </button>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/upload/image" element={<ImageFlow />} />
      </Routes>
    </Router>
  );
}

export default App;