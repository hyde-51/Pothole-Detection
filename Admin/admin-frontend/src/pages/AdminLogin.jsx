import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail } from "lucide-react";
import adminApi from "../api/adminApi";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginAdmin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await adminApi.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("adminToken", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary text-content flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-secondary border border-borderline rounded-3xl p-8 shadow-card">
        <div className="w-16 h-16 bg-accent text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={34} />
        </div>

        <h1 className="text-3xl font-bold text-center">Admin Login</h1>

        <p className="text-muted text-center mt-2 mb-8">
          Login to manage pothole detection reports.
        </p>

        {error && (
          <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-3 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={loginAdmin} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-muted">Email</label>

            <div className="mt-2 flex items-center gap-3 bg-primary border border-borderline rounded-xl px-4 py-3">
              <Mail size={18} className="text-muted" />

              <input
                type="email"
                className="w-full bg-transparent outline-none text-content"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-muted">Password</label>

            <div className="mt-2 flex items-center gap-3 bg-primary border border-borderline rounded-xl px-4 py-3">
              <Lock size={18} className="text-muted" />

              <input
                type="password"
                className="w-full bg-transparent outline-none text-content"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}