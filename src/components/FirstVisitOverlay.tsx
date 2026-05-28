"use client";

import React, { useState, useEffect } from "react";

export default function FirstVisitOverlay() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;
    const visited = localStorage.getItem("elsa_visited");
    if (!visited) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = (markVisited: boolean) => {
    if (markVisited) {
      localStorage.setItem("elsa_visited", "true");
    }
    setFadeOut(true);
    setTimeout(() => setVisible(false), 500);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(20px)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.5s ease",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          width: "90%",
          background: "linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          borderRadius: "20px",
          padding: "2.5rem",
          textAlign: "center",
          boxShadow: "0 0 80px rgba(99, 102, 241, 0.15), 0 0 200px rgba(6, 182, 212, 0.08)",
          animation: fadeOut ? "none" : "overlaySlideIn 0.6s ease",
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: "0.5rem", fontSize: "3rem" }}>🔭</div>
        <h1
          className="text-gradient"
          style={{
            fontSize: "2rem",
            fontFamily: "Outfit",
            marginBottom: "0.5rem",
          }}
        >
          Welcome to ELSA AI
        </h1>
        <p style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem", letterSpacing: "0.05em" }}>
          ExoLife Score AI — STEAM ICAC 2026
        </p>

        {/* Description */}
        <div style={{
          textAlign: "left",
          background: "rgba(99, 102, 241, 0.06)",
          border: "1px solid rgba(99, 102, 241, 0.12)",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          lineHeight: "1.6",
          fontSize: "0.88rem",
          color: "var(--text-muted)",
        }}>
          <p style={{ marginBottom: "0.75rem" }}>
            <strong style={{ color: "#fff" }}>ELSA</strong> is an AI-powered exoplanet habitability scorer built for the <strong style={{ color: "var(--accent-cyan)" }}>STEAM ICAC 2026 Astrometry</strong> project.
          </p>
          <p style={{ marginBottom: "0.75rem" }}>
            Enter an exoplanet&apos;s parameters — mass, radius, temperature, atmospheric gases, and more — and our <strong style={{ color: "#fff" }}>Gemini AI model</strong> evaluates its habitability across 10 scientific categories, producing a score from 0–100.
          </p>
          <p>
            Built by <strong style={{ color: "#fff" }}>Alex Shevkoplyas</strong>, <strong style={{ color: "#fff" }}>Aydan Jia</strong>, and <strong style={{ color: "#fff" }}>Daniel Simakov</strong>.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={() => handleDismiss(true)}
            className="glowing-btn"
            style={{
              padding: "0.75rem 2rem",
              fontSize: "0.95rem",
              borderRadius: "12px",
            }}
          >
            Get Started →
          </button>
          <button
            onClick={() => handleDismiss(true)}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.85rem",
              borderRadius: "12px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "var(--text-muted)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            I&apos;ve been here before
          </button>
        </div>
      </div>

      <style>{`
        @keyframes overlaySlideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
