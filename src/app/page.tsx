import React from "react";
import Link from "next/link";
import AstrometryChat from "@/components/AstrometryChat";

export default function Home() {
  return (
    <main className="main-wrapper" style={{ display: "flex", flexDirection: "column", gap: "5rem", minHeight: "80vh", justifyContent: "center" }}>
      
      {/* Hero Section */}
      <section style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "2rem", marginTop: "2rem" }}>
        
        {/* Planet visual */}
        <div style={{ position: "relative", width: "150px", height: "150px" }}>
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, var(--accent-cyan) 0%, var(--primary) 60%, var(--bg-deep) 100%)",
            boxShadow: "0 0 40px var(--primary-glow), inset -10px -10px 30px rgba(0,0,0,0.8)"
          }}></div>
          {/* Subtle atmosphere rings */}
          <div style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "120%",
            height: "120%",
            borderRadius: "50%",
            border: "1px solid rgba(6, 182, 212, 0.2)",
            transform: "rotate3d(1, 1, 0, 75deg)",
          }}></div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", color: "var(--primary-light)", fontFamily: "Outfit", margin: 0, marginBottom: "-1rem" }}>Welcome to</h2>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 800 }} className="text-gradient">
            ExoLife Score AI
          </h1>
          <p style={{ fontSize: "1.25rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
            ELSA evaluates planetary details and computes a habitability score utilizing advanced astrobiology metrics and AI reasoning.
          </p>
        </div>

        <Link href="/score" className="glowing-btn" style={{ fontSize: "1.1rem", padding: "1rem 2.5rem" }}>
          Launch ESI Scorer →
        </Link>
      </section>

      {/* Chatbot Section */}
      <section style={{ width: "100%", paddingBottom: "4rem" }}>
        <AstrometryChat />
      </section>

    </main>
  );
}
