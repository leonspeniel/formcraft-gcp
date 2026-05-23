"use client";

import { useEffect, useState } from "react";
import { getMe } from "../services/auth";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      const user = await getMe();
      if (user) {
        setIsLoggedIn(true);
        setUserName(user.full_name);
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, []);

  return (
    <div className="hero-section" style={{ textAlign: "center", maxWidth: "800px", padding: "2rem" }}>
      <h1 className="hero-title" style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: "1.5rem" }}>
        Build Interactive Dynamic Forms <span className="logo-accent">Effortlessly</span>
      </h1>
      
      <p className="hero-subtitle" style={{ color: "var(--text-secondary)", fontSize: "1.2rem", lineHeight: 1.6, marginBottom: "2.5rem", maxWidth: "600px", margin: "0 auto 2.5rem" }}>
        FormCraft is a modern full-stack dynamic questionnaire platform. Create forms with incremental questions, support multi-option choices, and track detailed response analytics in real time.
      </p>

      {checkingAuth ? (
        <div style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Analyzing session credentials...</div>
      ) : isLoggedIn ? (
        <div className="cta-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--accent-success)" }}>
            Welcome back, {userName}! You are logged in.
          </p>
          <button
            className="btn-primary-glow"
            style={{ maxWidth: "250px" }}
            onClick={() => { if (typeof window !== "undefined") window.location.href = "/dashboard"; }}
          >
            Enter Creator Dashboard
          </button>
        </div>
      ) : (
        <div className="cta-container" style={{ display: "flex", gap: "1.25rem", justifyContent: "center" }}>
          <button
            className="btn-primary-glow"
            style={{ width: "180px" }}
            onClick={() => { if (typeof window !== "undefined") window.location.href = "/signup"; }}
          >
            Get Started Free
          </button>
          <button
            className="nav-btn-outline"
            style={{ width: "180px", padding: "0.9rem" }}
            onClick={() => { if (typeof window !== "undefined") window.location.href = "/login"; }}
          >
            Sign In
          </button>
        </div>
      )}

      {/* Modern interactive features highlight grid */}
      <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginTop: "4.5rem" }}>
        <div className="feature-card" style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)", padding: "1.75rem", borderRadius: "var(--radius-md)", textAlign: "left" }}>
          <div style={{ color: "var(--accent-primary)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚡</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>Dynamic Builder</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>Add text inputs, checkboxes, and radio buttons incrementally in an elegant dynamic flow.</p>
        </div>
        <div className="feature-card" style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)", padding: "1.75rem", borderRadius: "var(--radius-md)", textAlign: "left" }}>
          <div style={{ color: "var(--accent-primary)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>🌍</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>Public Fill Links</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>Distribute secure UUID links. Anyone can fill out your questionnaires with optional identity pre-population.</p>
        </div>
        <div className="feature-card" style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)", padding: "1.75rem", borderRadius: "var(--radius-md)", textAlign: "left" }}>
          <div style={{ color: "var(--accent-primary)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>📊</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>Creator Dashboard</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>Monitor submission metrics and inspect tabulated feedback answers inside a sleek workspace grid.</p>
        </div>
      </div>
    </div>
  );
}
