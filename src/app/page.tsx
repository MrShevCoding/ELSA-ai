import React from "react";
import Link from "next/link";

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

      {/* Highlights / Features Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
        
        <div className="glass-card">
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🧪</div>
          <h3 style={{ marginBottom: "0.5rem" }} className="text-gradient-cyan">Astrobiology Metrics</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5" }}>
            Scores planets based on physical characteristics: radius, mass, equilibrium temperature, stellar type, and orbital mechanics.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🧠</div>
          <h3 style={{ marginBottom: "0.5rem" }} className="text-gradient-purple">AI-Powered Reasoning</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5" }}>
            Integrates with Claude Sonnet to generate natural language analysis detailing chemical prospects, atmosphere retention, and radiation challenges.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📊</div>
          <h3 style={{ marginBottom: "0.5rem" }} className="text-gradient">Batch Upload Scorer</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5" }}>
            Upload csv or json catalogs to score dozens of planetary candidates simultaneously. Compare results instantly on our detailed dashboard.
          </p>
        </div>

      </section>

      {/* Brief scientific rubric teaser */}
      <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem", borderLeft: "4px solid var(--accent-cyan)" }}>
        <h3 className="text-gradient" style={{ fontFamily: "Outfit" }}>The Scoring System</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
          ELSA uses an Earth Similarity Index (ESI) framework modified for stellar properties. By comparing inputs against optimal values (like temperature bounds for liquid water, and stellar stability ranges), ELSA grades habitable prospects on a 0 to 100 spectrum.
        </p>
        <Link href="/docs" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, alignSelf: "flex-start" }}>
          Read the Methodology Docs →
        </Link>
      </section>

    </main>
  );
}
