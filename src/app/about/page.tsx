import React from "react";

export default function AboutPage() {
  return (
    <main className="main-wrapper" style={{ display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "800px" }}>
      
      <section style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1 className="text-gradient" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          About ELSA AI
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
          Discover the origins, team, and technology driving the ExoLife Score AI project.
        </p>
      </section>

      <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h2 className="text-gradient-cyan" style={{ fontSize: "1.5rem" }}>Project Overview</h2>
        <p style={{ lineHeight: "1.6", fontSize: "0.95rem", color: "var(--text-muted)" }}>
          ELSA (ExoLife Score AI) is an astrobiology scoring assistant developed to democratize exoplanet catalog analysis. By combining traditional astrophysical metrics with the reasoning power of Anthropic Claude Sonnet, ELSA provides accessible, comprehensive evaluations of candidate worlds.
        </p>
        <p style={{ lineHeight: "1.6", fontSize: "0.95rem", color: "var(--text-muted)" }}>
          This project was created as part of a school/extracurricular science fair initiative to explore how artificial intelligence can streamline data verification in planetary science.
        </p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 className="text-gradient-purple">The Mission</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            To inspect Kepler, TESS, and simulated exoplanetary models, offering a readable breakdown of what makes a planet potentially habitable, and inspire interest in astrobiology.
          </p>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 className="text-gradient-cyan">The Tech Stack</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Built on a serverless Next.js layout using TypeScript, plain CSS styles, Anthropic Claude Sonnet SDK, and Papa Parse for client-side catalog ingestion.
          </p>
        </div>

      </section>

      <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h2 className="text-gradient" style={{ fontSize: "1.5rem" }}>Project Team</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
          
          <div style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1rem", background: "rgba(255,255,255,0.02)" }}>
            <h4 style={{ color: "#fff", marginBottom: "0.25rem" }}>Lead Researcher</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Astrobiology & Rubric Modeling</p>
          </div>

          <div style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1rem", background: "rgba(255,255,255,0.02)" }}>
            <h4 style={{ color: "#fff", marginBottom: "0.25rem" }}>Lead Developer</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Next.js, UI/UX & API Integrations</p>
          </div>

          <div style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1rem", background: "rgba(255,255,255,0.02)" }}>
            <h4 style={{ color: "#fff", marginBottom: "0.25rem" }}>Project Mentor</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Scientific Validity Advisor</p>
          </div>

        </div>
      </section>

    </main>
  );
}
