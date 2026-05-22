import React from "react";

export default function DocsPage() {
  return (
    <main className="main-wrapper" style={{ display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "900px" }}>
      
      <section style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1 className="text-gradient" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Methodology & Rubric
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
          Learn how ELSA calculates scores and the astrobiology reasoning behind the rubric.
        </p>
      </section>

      {/* Main Core Rubric Info */}
      <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h2 className="text-gradient-cyan" style={{ fontSize: "1.5rem" }}>How the Scoring Works</h2>
        <p style={{ lineHeight: "1.6", fontSize: "0.95rem", color: "var(--text-muted)" }}>
          ELSA combines physical metrics and planetary calculations with astrobiology parameters processed via AI models to score worlds on a 0 to 100 scale.
        </p>
        <p style={{ lineHeight: "1.6", fontSize: "0.95rem", color: "var(--text-muted)" }}>
          A perfect score of <strong>100</strong> represents a terrestrial, magneto-shielded, orbitally stable world around a stable Sun-like star within a safe distance.
        </p>
        <div style={{
          background: "rgba(239, 68, 68, 0.05)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "8px",
          padding: "1rem",
          fontSize: "0.9rem",
          lineHeight: "1.5"
        }}>
          <strong>⚠️ Astrobiological Veto Mechanism:</strong> If even a single category is hostile (scoring below 15/100 due to no atmospheric pressure, tidal lock field death, or being unreachable in another galaxy 100K+ light-years away), the final habitability rating automatically collapses to **2/100** to reflect that a single terminal factor prevents carbon-based life.
        </div>
      </section>

      {/* Scoring categories breakdown */}
      <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <h2 className="text-gradient" style={{ fontSize: "1.5rem", fontFamily: "Outfit" }}>Rubric Categories</h2>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 className="text-gradient-purple" style={{ fontSize: "1.1rem" }}>1. Atmospheric Composition (25%)</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            A planet needs appropriate mass and radius to retain a gas envelope. Sub-Earths can't hold gases, while massive super-Earths accumulate heavy, hostile hydrogen/helium layers.
          </p>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 className="text-gradient-cyan" style={{ fontSize: "1.1rem" }}>2. Magnetic Field Shielding (20%)</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Protects against stellar winds. Rapid rotation and solid cores generate dynamos. Planets that are tidally locked (short periods) or low-mass see score penalties.
          </p>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 className="text-gradient-purple" style={{ fontSize: "1.1rem" }}>3. Orbital Stability (20%)</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Stable year and distance durations ensure predictable thermal profiles. Extreme short-period eccentricities or long freezing periods lower stability.
          </p>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 className="text-gradient-cyan" style={{ fontSize: "1.1rem" }}>4. Star Quality (15%)</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Host star longevity and radiation. <strong>G-type</strong> (100%) and <strong>K-type</strong> (90%) are highly stable. <strong>M-type</strong> dwarfs are active and flare-heavy. <strong>F & A-type</strong> stars die too quickly.
          </p>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 className="text-gradient-purple" style={{ fontSize: "1.1rem" }}>5. Galactic Safety (10%)</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Positioning relative to destructive supernovae occurrences, black holes, and high stellar densities near the galactic nucleus.
          </p>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 className="text-gradient-cyan" style={{ fontSize: "1.1rem" }}>6. Distance from Earth (10%)</h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            The physical distance factor. Nearby star systems (less than 50 ly) score 100. Far distance (&gt;10,000 ly) or remote galaxy offsets trigger the Veto protocol.
          </p>
        </div>

      </section>

      {/* Rubric Score Scale Table */}
      <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 className="text-gradient" style={{ fontFamily: "Outfit" }}>Score Rubric Chart</h3>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Score Range</th>
                <th>Classification</th>
                <th>Astrobiological Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: "var(--hab-high)" }}>70 – 100</td>
                <td>Optimally Habitable</td>
                <td>World with terrestrial atmosphere, strong magnetic shielding, stable orbit, and within realistic exploration distances.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: "var(--hab-mid)" }}>40 – 69</td>
                <td>Marginally Habitable</td>
                <td>Possesses notable challenges like flare-heavy host stars, weak magnetospheres, or eccentric, fluctuating temperatures.</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: "var(--hab-low)" }}>0 – 39</td>
                <td>Hostile Environment</td>
                <td>Severe environmental constraints. A score of <strong>2</strong> represents vetoed worlds where a single fatal parameter kills all viability.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>
  );
}
