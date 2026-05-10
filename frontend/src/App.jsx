import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

// User Pages
import LandingPage from "./pages/LandingPage";
import MainDashboard from "./pages/MainDashboard";
import ImageFlow from "./pages/ImageFlow";
import VideoFlow from "./pages/VideoFlow";

// Admin Pages (separate folder)
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReports from "./pages/admin/AdminReports";

function App() {
  // Dark Mode State
  const [isDark, setIsDark] = useState(true);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
  }, [isDark]);

  return (
    <Router>
      {/* 🌙 Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-5 right-8 z-[9999] p-3 rounded-full border border-borderline bg-secondary text-content flex items-center justify-center shadow-card transition-all duration-300 hover:scale-110 active:scale-95"
        title="Toggle Theme"
      >
        {isDark ? (
          <Sun size={24} className="text-amber-500" />
        ) : (
          <Moon size={24} className="text-blue-500" />
        )}
      </button>

      {/* 🚀 ROUTES */}
      <Routes>
        {/* USER SIDE */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<MainDashboard />} />
        <Route path="/upload/image" element={<ImageFlow />} />
        <Route path="/upload/video" element={<VideoFlow />} />

        {/* ADMIN SIDE (SEPARATE) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Routes>
    </Router>
  );
}

export default App;