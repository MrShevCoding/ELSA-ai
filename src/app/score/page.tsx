"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import PlanetForm from "@/components/PlanetForm";
import FileUpload from "@/components/FileUpload";
import ScoreGauge from "@/components/ScoreGauge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import BatchResultsTable from "@/components/BatchResultsTable";
import { PlanetInput, ScoreResult, BatchPlanetResult } from "@/types/elsa";

type ActiveTab = "manual" | "batch" | "methodology" | "guide";

export default function ScorePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single planet scoring states
  const [singleResult, setSingleResult] = useState<ScoreResult | null>(null);
  const [scoredPlanetName, setScoredPlanetName] = useState<string>("");
  const [elaboratedText, setElaboratedText] = useState<string | null>(null);
  const [isElaborating, setIsElaborating] = useState(false);
  const [lastPlanetInput, setLastPlanetInput] = useState<PlanetInput | null>(null);
  const [displayedReasoning, setDisplayedReasoning] = useState<string>("");

  // Batch planet scoring states
  const [batchResults, setBatchResults] = useState<BatchPlanetResult[]>([]);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const handleManualSubmit = async (data: PlanetInput) => {
    setIsLoading(true);
    setError(null);
    setSingleResult(null);
    setElaboratedText(null);
    setLastPlanetInput(data);
    setScoredPlanetName(data.planetName);

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with ELSA scoring server.");
      }

      const result = await response.json() as ScoreResult;
      setSingleResult(result);
      setDisplayedReasoning(result.reasoning);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleElaborate = async () => {
    if (!lastPlanetInput || !singleResult) return;
    setIsElaborating(true);
    setError(null);
    try {
      const response = await fetch("/api/score/elaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planet: lastPlanetInput, scoreResult: singleResult }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate elaborate astrobiology report.");
      }
      const resData = await response.json() as { text: string };
      setElaboratedText(resData.text);
      setDisplayedReasoning(resData.text);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsElaborating(false);
    }
  };

  const handleBatchParsed = async (planets: PlanetInput[]) => {
    setIsLoading(true);
    setError(null);
    setBatchResults([]);
    setBatchProgress({ current: 0, total: planets.length });

    const resultsList: BatchPlanetResult[] = [];
    
    // Process sequentially to prevent overloading API rate limits and to display progress
    for (let i = 0; i < planets.length; i++) {
      const planet = planets[i];
      setBatchProgress((prev) => ({ ...prev, current: i + 1 }));
      
      try {
        const response = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(planet),
        });

        if (!response.ok) {
          throw new Error(`Failed scoring planet ${planet.planetName}`);
        }

        const scoreRes = await response.json() as ScoreResult;
        resultsList.push({
          ...scoreRes,
          planetName: planet.planetName,
          input: planet,
        });
      } catch {
        // Fallback simulation for this planet if request fails, ensuring batch doesn't completely halt
        console.warn(`Fallback simulation triggered for ${planet.planetName}`);
        // Run simple local simulation logic as safety
        const simulated = simulateFallbackScore(planet);
        resultsList.push({
          ...simulated,
          planetName: planet.planetName,
          input: planet,
        });
      }
      
      // Brief pause to make progress tracking visible and throttle API requests slightly
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setBatchResults(resultsList);
    setIsLoading(false);
  };

  // Quick fallback calculator in case API calls fail inside batch upload loop
  const simulateFallbackScore = (planet: PlanetInput): ScoreResult => {
    const gases = planet.atmosphericGases;
    // 1. Atmospheric Presence (20%)
    let atmPresScore = 15;
    if (gases) {
      const anyChecked = gases.oxygen || gases.carbonDioxide || gases.water || gases.nitrogen || gases.methane || gases.hydrogen;
      if (anyChecked) {
        atmPresScore = 0;
        if (gases.nitrogen) atmPresScore += 30;
        if (gases.oxygen) atmPresScore += 30;
        if (gases.water) atmPresScore += 25;
        if (gases.carbonDioxide) atmPresScore += 10;
        if (gases.methane) atmPresScore += 5;
        if (gases.hydrogen) atmPresScore -= 20;
        atmPresScore = Math.max(0, Math.min(100, atmPresScore));
      }
    }
    // 2. Temperature (15%)
    const tempDev = (planet.equilibriumTemp - 280) / 90;
    let tempScore = Math.max(0, Math.round(100 * Math.exp(-0.5 * tempDev * tempDev)));
    // 3. Surface Suitability (12%)
    const radF = Math.exp(-Math.pow((planet.radius - 1.0) / 0.6, 2));
    const massF = Math.exp(-Math.pow((planet.mass - 1.5) / 2.5, 2));
    const surfScore = Math.max(0, Math.round(100 * radF * massF));
    // 4. Climate (12%)
    const tilt = planet.axialTilt ?? 23.4;
    let climScore = 100;
    if (tilt < 10) climScore = 40;
    else if (tilt > 45) climScore = 20;
    else { const d = Math.abs(tilt - 23.4) / 15; climScore = Math.max(0, Math.round(100 * Math.exp(-0.5 * d * d))); }
    // 5. Magnetic Field (10%)
    let magScore = Math.max(0, Math.round(95 * Math.min(1, planet.mass / 0.5) * Math.min(1, planet.orbitalPeriod / 15)));
    if (planet.hasMoon) magScore = Math.min(100, magScore + 20);
    // 6. Star Quality (10%)
    let starScore = 50;
    if (planet.starType === "G") starScore = 100;
    else if (planet.starType === "K") starScore = 100;
    else if (planet.starType === "F") starScore = 65;
    else if (planet.starType === "M") starScore = 45;
    else if (planet.starType === "A") starScore = 20;
    if ((planet.starAge ?? 4.5) < 4) starScore = Math.round(starScore * 0.7);
    // 7. Orbital (7%)
    const lp = Math.log10(Math.max(0.1, planet.orbitalPeriod));
    const od = (lp - Math.log10(200)) / 1.2;
    const orbitScore = Math.max(0, Math.round(95 * Math.exp(-0.5 * od * od)));
    // 8. Galactic (7%)
    const gd = planet.galacticDistance ?? 8;
    let galScore = 92;
    if (gd < 2) galScore = 20; else if (gd > 12) galScore = 60;
    if (planet.systemType === "Rogue") galScore = 10;
    // 9. System Architecture (4%)
    let sysScore = 50;
    if (planet.systemType === "Single") sysScore += 30;
    else if (planet.systemType === "Binary") sysScore += 10;
    else if (planet.systemType === "Rogue") sysScore = 5;
    if (planet.hasJupiterProtector) sysScore += 20;
    sysScore = Math.min(100, sysScore);
    // 10. Distance (3%)
    const distScore = Math.max(0, Math.round(100 * Math.exp(-planet.distanceFromEarth / 8000)));

    // Weighted average
    const weighted = atmPresScore*0.20 + tempScore*0.15 + surfScore*0.12 + climScore*0.12 + magScore*0.10 + starScore*0.10 + orbitScore*0.07 + galScore*0.07 + sysScore*0.04 + distScore*0.03;
    // ── Critical Veto Drag (only on Atmosphere, Temperature, and Surface/Size) ──
    const criticalScores = [atmPresScore, tempScore, surfScore];
    const minCritical = Math.min(...criticalScores);
    const drag = minCritical < 35 ? Math.sqrt(minCritical / 35) : 1.0;
    const finalScore = Math.max(0, Math.round(weighted * drag));

    return {
      score: finalScore,
      breakdown: {
        atmosphericPresence: atmPresScore,
        surfaceSuitability: surfScore,
        temperatureScore: tempScore,
        magneticField: magScore,
        orbitalStability: orbitScore,
        starQuality: starScore,
        galacticSafety: galScore,
        distanceScore: distScore,
        climateStability: climScore,
        systemArchitecture: sysScore,
      },
      reasoning: `[FALLBACK] ${planet.planetName} was evaluated using local backup scoring. Weighted average: ${weighted.toFixed(1)}, Final: ${finalScore}.`,
    };
  };

  const handleUploadError = (msg: string) => {
    setError(msg);
  };

  return (
    <main className="main-wrapper" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Title */}
      <section style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 className="text-gradient" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          ExoLife Scorer
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Provide exoplanetary values manually or upload catalogs to retrieve ESI values and Gemini AI astrobiological analysis.
        </p>
      </section>

      {/* Tabs */}
      <div style={{
        display: "flex",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "9999px",
        padding: "0.25rem",
        maxWidth: "600px",
        margin: "0 auto",
        width: "100%"
      }}>
        <button
          onClick={() => { setActiveTab("manual"); setError(null); }}
          style={{
            flex: 1,
            background: activeTab === "manual" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "transparent",
            color: activeTab === "manual" ? "#fff" : "var(--text-muted)",
            border: "none",
            borderRadius: "9999px",
            padding: "0.6rem 1rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
            transition: "all 0.2s"
          }}
        >
          Manual Parameters
        </button>
        <button
          onClick={() => { setActiveTab("batch"); setError(null); }}
          style={{
            flex: 1,
            background: activeTab === "batch" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "transparent",
            color: activeTab === "batch" ? "#fff" : "var(--text-muted)",
            border: "none",
            borderRadius: "9999px",
            padding: "0.6rem 1rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
            transition: "all 0.2s"
          }}
        >
          Batch CSV/JSON File
        </button>
        <button
          onClick={() => { setActiveTab("methodology"); setError(null); }}
          style={{
            flex: 1,
            background: activeTab === "methodology" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "transparent",
            color: activeTab === "methodology" ? "#fff" : "var(--text-muted)",
            border: "none",
            borderRadius: "9999px",
            padding: "0.6rem 1rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
            transition: "all 0.2s"
          }}
        >
          Methodology & Rubric
        </button>
        <button
          onClick={() => { setActiveTab("guide"); setError(null); }}
          style={{
            flex: 1,
            background: activeTab === "guide" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "transparent",
            color: activeTab === "guide" ? "#fff" : "var(--text-muted)",
            border: "none",
            borderRadius: "9999px",
            padding: "0.6rem 1rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9rem",
            transition: "all 0.2s"
          }}
        >
          📖 Guide
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "var(--hab-low)",
          borderRadius: "8px",
          padding: "1rem",
          fontSize: "0.9rem",
          textAlign: "center"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main content split grid */}
      {activeTab !== "methodology" && activeTab !== "guide" && (
        <div className="grid-2" style={{ alignItems: "start" }}>
        
        {/* Left Side: Inputs */}
        <div>
          {activeTab === "manual" ? (
            <PlanetForm onSubmit={handleManualSubmit} isLoading={isLoading} />
          ) : (
            <FileUpload onParsed={handleBatchParsed} onError={handleUploadError} />
          )}
        </div>

        {/* Right Side: Results */}
        <div>
          {isLoading && activeTab === "batch" && (
            <div className="glass-card text-center" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "3rem" }}>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "3px solid rgba(6, 182, 212, 0.2)",
                borderTopColor: "var(--accent-cyan)",
                animation: "twinkling 1s infinite linear" // reusing animation keys
              }}></div>
              <div>
                <h3 className="text-gradient" style={{ marginBottom: "0.5rem" }}>Processing Batch Scans</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Scoring planet {batchProgress.current} of {batchProgress.total}...
                </p>
              </div>
              <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                  background: "var(--accent-cyan)",
                  transition: "width 0.2s"
                }}></div>
              </div>
            </div>
          )}

          {isLoading && activeTab === "manual" && (
            <div className="glass-card text-center" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "3rem" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "radial-gradient(circle, var(--accent-cyan) 0%, var(--primary) 70%)",
                boxShadow: "0 0 20px var(--primary-glow)",
                animation: "twinkling 2s infinite alternate"
              }}></div>
              <div>
                <h3 className="text-gradient" style={{ marginBottom: "0.5rem" }}>Analyzing Exoplanet</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Evaluating astrobiological profiles and querying Claude AI...
                </p>
              </div>
            </div>
          )}

          {!isLoading && activeTab === "manual" && singleResult && (
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.75rem" }} className="text-gradient">
                  {scoredPlanetName} Result
                </h2>
              </div>

              {/* Gauge */}
              <ScoreGauge score={singleResult.score} />

              {/* Category list breakdown */}
              <ScoreBreakdown breakdown={singleResult.breakdown} />


            </div>
          )}

          {!isLoading && activeTab === "manual" && !singleResult && (
            <div className="glass-card text-center" style={{ padding: "4rem 2rem", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🪐</p>
              <p style={{ fontSize: "0.95rem" }}>
                Awaiting planet parameters. Set manual inputs and click scoring button to begin habitability evaluation.
              </p>
            </div>
          )}

          {!isLoading && activeTab === "batch" && batchResults.length > 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              {/* Force table to render wider underneath if scored */}
              <BatchResultsTable results={batchResults} />
            </div>
          )}

          {!isLoading && activeTab === "batch" && batchResults.length === 0 && (
            <div className="glass-card text-center" style={{ padding: "4rem 2rem", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📁</p>
              <p style={{ fontSize: "0.95rem" }}>
                No batch files processed yet. Drop in a .csv or .json template to compute mass catalog scores.
              </p>
            </div>
          )}

        </div>

      </div>
      )}

      {/* Full-width AI written report */}
      {!isLoading && activeTab === "manual" && singleResult && (
        <div className="glass-card" style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "0.75rem", marginBottom: "0.5rem" }}>
            <h3 className="text-gradient-cyan" style={{ fontSize: "1.2rem", textTransform: "uppercase", margin: 0 }}>
              ELSA AI Astrobiology Analysis
            </h3>
            {!elaboratedText ? (
              <button
                onClick={handleElaborate}
                disabled={isElaborating}
                className="btn-primary"
                style={{
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.85rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: isElaborating ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 600,
                  opacity: isElaborating ? 0.7 : 1,
                  transition: "all 0.2s"
                }}
              >
                {isElaborating ? "Elaborating Analysis..." : "✨ Elaborate Analysis"}
              </button>
            ) : (
              <span style={{ fontSize: "0.85rem", color: "var(--accent-cyan)", fontWeight: 600 }}>
                ✓ Expanded Report Loaded
              </span>
            )}
          </div>
          <div className="markdown-body" style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-main)" }}>
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 style={{ fontSize: "1.5rem", color: "var(--accent-cyan)", marginBottom: "0.5rem", marginTop: "1rem" }} {...props} />,
                h2: ({node, ...props}) => <h2 style={{ fontSize: "1.3rem", color: "var(--accent-purple)", marginBottom: "0.5rem", marginTop: "1rem" }} {...props} />,
                h3: ({node, ...props}) => <h3 style={{ fontSize: "1.1rem", color: "white", marginBottom: "0.5rem", marginTop: "1rem" }} {...props} />,
                p: ({node, ...props}) => <p style={{ marginBottom: "1rem" }} {...props} />,
                ul: ({node, ...props}) => <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }} {...props} />,
                ol: ({node, ...props}) => <ol style={{ paddingLeft: "1.5rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }} {...props} />,
                li: ({node, ...props}) => <li {...props} />,
                strong: ({node, ...props}) => <strong style={{ color: "white", fontWeight: 600 }} {...props} />,
              }}
            >
              {displayedReasoning}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Methodology Content */}
      {activeTab === "methodology" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "900px", margin: "0 auto" }}>
          <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 className="text-gradient-cyan" style={{ fontSize: "1.5rem" }}>How the Scoring Works</h2>
            <p style={{ lineHeight: "1.6", fontSize: "0.95rem", color: "var(--text-muted)" }}>
              ELSA combines physical metrics and planetary calculations with astrobiology parameters processed via Gemini AI to score worlds on a 0 to 100 scale across <strong>10 scientific categories</strong>.
            </p>
            <p style={{ lineHeight: "1.6", fontSize: "0.95rem", color: "var(--text-muted)" }}>
              A perfect score of <strong>100</strong> represents a terrestrial world with a breathable atmosphere (O₂, N₂, H₂O), ideal temperature, strong magnetic shielding, stable orbit around a Sun-like star, and protected by a beneficial system architecture.
            </p>
            <div style={{
              background: "rgba(99, 102, 241, 0.05)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: "8px",
              padding: "1rem",
              fontSize: "0.9rem",
              lineHeight: "1.5"
            }}>
              <strong>🔢 Scoring Formula:</strong> The final score is the <strong>weighted average</strong> of all 10 categories. A harsh veto drag penalty is applied if any of the three core critical categories (Atmospheric Presence, Temperature Suitability, or Surface & Size Suitability) falls below 35%—preventing physically hostile planets (e.g. massive gas giants, freezing/molten worlds, or airless bodies) from scoring high.
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h2 className="text-gradient" style={{ fontSize: "1.5rem", fontFamily: "Outfit" }}>10-Factor Rubric Categories</h2>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 className="text-gradient-purple" style={{ fontSize: "1.1rem" }}>1. Atmospheric Presence (20%)</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                The most critical factor. Scores based on detected atmospheric gases: N₂ (+30), O₂ (+30), H₂O (+25), CO₂ (+10), CH₄ (+5). Hydrogen-dominant atmospheres (H₂) indicate gas giants and subtract 20 points. Airless bodies default to 15.
              </p>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 className="text-gradient-cyan" style={{ fontSize: "1.1rem" }}>2. Temperature Suitability (15%)</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Gaussian curve centered on 280K (Earth-like). Planets near this temperature score highest. Extreme cold or heat rapidly reduces the score. Rogue planets are capped at 30.
              </p>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 className="text-gradient-purple" style={{ fontSize: "1.1rem" }}>3. Surface & Size Suitability (12%)</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Planet radius (ideal ~1.0× Earth) and mass (ideal ~1.5× Earth) determine if the world can retain an atmosphere without becoming a gas giant. Gaussian curves ensure smooth scoring.
              </p>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 className="text-gradient-cyan" style={{ fontSize: "1.1rem" }}>4. Climate Stability (12%)</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Axial tilt determines seasons. Ideal around 23° (like Earth). Extreme tilts (&gt;45°) cause chaotic seasons, while very low tilts (&lt;10°) lead to frozen poles and poor heat redistribution.
              </p>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 className="text-gradient-purple" style={{ fontSize: "1.1rem" }}>5. Magnetic Field Shielding (10%)</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Protects against stellar winds and cosmic radiation. Requires sufficient mass (≥0.5× Earth) and rotation (orbital period ≥15 days). A large moon adds tidal heating bonus (+20).
              </p>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 className="text-gradient-cyan" style={{ fontSize: "1.1rem" }}>6. Star Quality & Age (10%)</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                <strong>G-type</strong> and <strong>K-type</strong> stars are ideal (100). <strong>F-type</strong> = 65. <strong>M-type</strong> red dwarfs are penalized for flaring and tidal locking (45). <strong>A-type</strong> stars die too quickly (20). Stars younger than 4 Gyr are penalized.
              </p>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 className="text-gradient-purple" style={{ fontSize: "1.1rem" }}>7. Orbital Stability (7%)</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Gaussian curve on orbital period, centered around ~200 days. Ensures predictable thermal profiles and stable year lengths.
              </p>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 className="text-gradient-cyan" style={{ fontSize: "1.1rem" }}>8. Galactic Safety (7%)</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Optimal distance 2–8 kpc from galactic center. Too close risks black hole radiation and supernovae. Too far means low metallicity. Rogue planets score extremely low.
              </p>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 className="text-gradient-purple" style={{ fontSize: "1.1rem" }}>9. System Architecture (4%)</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Bonus for moons (tidal heating), Jupiter-like gas giant shields (asteroid deflection), and stable single-star systems. Rogue planets score near 0.
              </p>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h3 className="text-gradient-cyan" style={{ fontSize: "1.1rem" }}>10. Distance from Earth (3%)</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Reflects reachability for future exploration. Exponential decay: nearby systems (&lt;100 ly) score near 100, distant ones decay toward 0. Lowest weight since this isn&apos;t about habitability itself.
              </p>
            </div>
          </section>

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
                    <td>World with breathable atmosphere, ideal temperature, strong magnetic shielding, stable orbit, and within realistic exploration distances.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: "var(--hab-mid)" }}>40 – 69</td>
                    <td>Marginally Habitable</td>
                    <td>Notable challenges like missing atmospheric gases, flare-heavy host stars, weak magnetospheres, or eccentric temperatures.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: "var(--hab-low)" }}>0 – 39</td>
                    <td>Hostile Environment</td>
                    <td>Severe environmental constraints — airless bodies, extreme temperatures, or rogue planets with no energy source.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Guide / How to Use Content */}
      {activeTab === "guide" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "900px", margin: "0 auto" }}>

          {/* Quick Start */}
          <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 className="text-gradient-cyan" style={{ fontSize: "1.5rem" }}>🚀 Quick Start Guide</h2>
            <p style={{ lineHeight: "1.6", fontSize: "0.95rem", color: "var(--text-muted)" }}>
              Welcome to the ELSA ExoLife Scorer! Whether you&apos;re a student exploring astrobiology for the first time, a space enthusiast, or a researcher, this guide will walk you through everything you need to score your first exoplanet.
            </p>
          </section>

          {/* Step-by-step */}
          <section style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h2 className="text-gradient" style={{ fontSize: "1.5rem", fontFamily: "Outfit" }}>Step-by-Step Instructions</h2>

            <div className="glass-card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ minWidth: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "#fff", flexShrink: 0 }}>1</div>
              <div>
                <h3 style={{ color: "#fff", marginBottom: "0.4rem", fontSize: "1.05rem" }}>Choose Your Input Method</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Select <strong>Manual Parameters</strong> to enter values by hand, or <strong>Batch CSV/JSON</strong> to upload an entire catalog of planets at once.
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ minWidth: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "#fff", flexShrink: 0 }}>2</div>
              <div>
                <h3 style={{ color: "#fff", marginBottom: "0.4rem", fontSize: "1.05rem" }}>Fill in Planet Data</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Enter your exoplanet&apos;s properties: <strong>name</strong>, <strong>radius</strong> (in Earth radii), <strong>mass</strong> (in Earth masses), <strong>orbital period</strong> (days), <strong>star type</strong>, <strong>equilibrium temperature</strong> (Kelvin), and <strong>distance from Earth</strong> (light-years). Optional fields like axial tilt, galactic distance, star age, moon, and gas giant shield further refine the score.
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ minWidth: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "#fff", flexShrink: 0 }}>3</div>
              <div>
                <h3 style={{ color: "#fff", marginBottom: "0.4rem", fontSize: "1.05rem" }}>Use Shortcuts (Optional)</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Not sure what numbers to enter? Use the <strong>Sample Planet</strong> buttons (Kepler-442b, TRAPPIST-1e, Gliese 581g) to auto-fill real exoplanet data. Or hit <strong>Randomize</strong> to generate a random planet with scientifically reasonable values — great for experimenting!
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ minWidth: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "#fff", flexShrink: 0 }}>4</div>
              <div>
                <h3 style={{ color: "#fff", marginBottom: "0.4rem", fontSize: "1.05rem" }}>Add Extra Context</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Use the <strong>Additional Info</strong> text box to mention anything special — a nearby black hole, unusual atmospheric readings, tidal heating effects, or any context you think might matter. The AI will factor this into its analysis!
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ minWidth: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "#fff", flexShrink: 0 }}>5</div>
              <div>
                <h3 style={{ color: "#fff", marginBottom: "0.4rem", fontSize: "1.05rem" }}>Hit &quot;Compute Habitability Score&quot;</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Click the glowing button at the bottom. ELSA will send your planet&apos;s data to the Gemini AI model, which evaluates it across <strong>8 astrobiological categories</strong> and returns a habitability score from 0–100, a category-by-category breakdown, and a detailed AI-written analysis.
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ minWidth: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--secondary))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "#fff", flexShrink: 0 }}>6</div>
              <div>
                <h3 style={{ color: "#fff", marginBottom: "0.4rem", fontSize: "1.05rem" }}>Read Your Results</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Your results appear on the right: a <strong>circular score gauge</strong> (green = habitable, red = hostile), a <strong>bar chart breakdown</strong> of each category, and below that a <strong>full AI-written report</strong> explaining strengths, weaknesses, and what technologies would be needed to colonize the world.
                </p>
              </div>
            </div>
          </section>

          {/* Tips & Tricks */}
          <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="text-gradient-purple" style={{ fontSize: "1.2rem" }}>💡 Tips & Tricks</h3>
            <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
              <li><strong>Earth&apos;s values:</strong> Radius = 1.0, Mass = 1.0, Orbital Period = 365.25, Star Type = G, Temp = 255 K, Tilt = 23.4°. Try entering these to see what a perfect score looks like!</li>
              <li><strong>Experiment freely:</strong> Change one parameter at a time to see how it affects the score. What happens if you crank the temperature to 500K? Or set the mass to 10?</li>
              <li><strong>The Veto mechanism:</strong> If any core critical factor (Atmospheric Presence, Temperature, or Surface/Size) is extremely hostile (below 35%), the entire score collapses. This models real astrobiology—one fundamental dealbreaker makes a planet uninhabitable.</li>
              <li><strong>Batch upload:</strong> Prepare a CSV with columns matching the parameter names (planetName, radius, mass, etc.) and upload it to score dozens of planets at once.</li>
              <li><strong>Educational use:</strong> Great for classroom exercises — have students hypothesize what parameters matter most, then test their theories with the scorer.</li>
            </ul>
          </section>

          {/* Parameter Reference */}
          <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="text-gradient-cyan" style={{ fontSize: "1.2rem" }}>📊 Parameter Reference</h3>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Unit</th>
                    <th>Ideal Range</th>
                    <th>Earth Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Radius</td><td>Earth Radii (R⊕)</td><td>0.8 – 1.5</td><td>1.0</td></tr>
                  <tr><td>Mass</td><td>Earth Masses (M⊕)</td><td>0.5 – 3.0</td><td>1.0</td></tr>
                  <tr><td>Orbital Period</td><td>Days</td><td>100 – 500</td><td>365.25</td></tr>
                  <tr><td>Star Type</td><td>Spectral Class</td><td>G or K</td><td>G</td></tr>
                  <tr><td>Equilibrium Temp</td><td>Kelvin (K)</td><td>200 – 350</td><td>255</td></tr>
                  <tr><td>Distance</td><td>Light-Years</td><td>&lt; 100</td><td>0</td></tr>
                  <tr><td>Axial Tilt</td><td>Degrees</td><td>15° – 35°</td><td>23.4°</td></tr>
                  <tr><td>Galactic Distance</td><td>kpc</td><td>4 – 10</td><td>8</td></tr>
                  <tr><td>Star Age</td><td>Billion Years</td><td>4 – 8</td><td>4.6</td></tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      )}

    </main>
  );
}
