"use client";

import React, { useState } from "react";
import PlanetForm from "@/components/PlanetForm";
import FileUpload from "@/components/FileUpload";
import ScoreGauge from "@/components/ScoreGauge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import BatchResultsTable from "@/components/BatchResultsTable";
import { PlanetInput, ScoreResult, BatchPlanetResult } from "@/types/elsa";

type ActiveTab = "manual" | "batch";

export default function ScorePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single planet scoring states
  const [singleResult, setSingleResult] = useState<ScoreResult | null>(null);
  const [scoredPlanetName, setScoredPlanetName] = useState<string>("");

  // Batch planet scoring states
  const [batchResults, setBatchResults] = useState<BatchPlanetResult[]>([]);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const handleManualSubmit = async (data: PlanetInput) => {
    setIsLoading(true);
    setError(null);
    setSingleResult(null);
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
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
    // 1. Atmosphere (25% weight)
    let atmScore = 90;
    if (planet.mass < 0.25 || planet.radius < 0.5) {
      atmScore = 5;
    } else if (planet.mass > 8.0 || planet.radius > 2.2) {
      atmScore = 5;
    } else {
      const sizeDiff = Math.abs(planet.radius - 1) * 35 + Math.abs(planet.mass - 1) * 12;
      atmScore = Math.max(15, Math.round(100 - sizeDiff));
    }

    // 2. Magnetic Field (20% weight)
    let magScore = 90;
    if (planet.mass < 0.35) {
      magScore = 8;
    } else if (planet.orbitalPeriod < 6) {
      magScore = 12;
    } else {
      const lockPenalty = Math.max(0, 30 - planet.orbitalPeriod * 2);
      magScore = Math.max(15, Math.round(95 - lockPenalty));
    }

    // 3. Orbital Stability (20% weight)
    let orbitScore = 90;
    if (planet.orbitalPeriod < 1.5) {
      orbitScore = 5;
    } else if (planet.orbitalPeriod > 1500) {
      orbitScore = 12;
    } else {
      const orbitDiff = Math.abs(planet.orbitalPeriod - 365) * 0.05;
      orbitScore = Math.max(15, Math.round(95 - Math.min(60, orbitDiff)));
    }

    // 4. Star Quality (15% weight)
    let starScore = 90;
    if (planet.starType === "A") starScore = 8;
    else if (planet.starType === "F") starScore = 70;
    else if (planet.starType === "G") starScore = 100;
    else if (planet.starType === "K") starScore = 90;
    else if (planet.starType === "M") starScore = 45;

    // 5. Galactic Safety (10% weight)
    const galScore = planet.starType === "A" ? 75 : 92;

    // 6. Distance Score (10% weight)
    let distScore = 100;
    if (planet.distanceFromEarth > 50000) {
      distScore = 5;
    } else if (planet.distanceFromEarth > 1000) {
      distScore = Math.max(15, Math.round(50 - (planet.distanceFromEarth - 1000) * 0.001));
    } else if (planet.distanceFromEarth > 50) {
      distScore = Math.round(100 - (planet.distanceFromEarth - 50) * 0.05);
    }

    // Temperature veto
    const isTempVetoed = planet.equilibriumTemp < 100 || planet.equilibriumTemp > 450;

    // Weighted average
    const weighted = (atmScore * 0.25) + (magScore * 0.20) + (orbitScore * 0.20) + (starScore * 0.15) + (galScore * 0.10) + (distScore * 0.10);

    // Veto rules
    const isVetoed = atmScore < 15 || magScore < 15 || orbitScore < 15 || starScore < 15 || distScore < 15 || isTempVetoed;
    const finalScore = isVetoed ? 2 : Math.round(weighted);

    return {
      score: finalScore,
      breakdown: {
        atmosphericComposition: atmScore,
        magneticField: magScore,
        orbitalStability: orbitScore,
        starQuality: starScore,
        galacticSafety: galScore,
        distanceScore: distScore,
      },
      reasoning: `${planet.planetName} has been evaluated using ELSA backup metrics. ${isVetoed ? "An astrobiological VETO was triggered, collapsing the final score to 2." : "The planet features a balanced profile."}`,
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
          Provide exoplanetary values manually or upload catalogs to retrieve ESI values and Claude AI astrobiological analysis.
        </p>
      </section>

      {/* Tabs */}
      <div style={{
        display: "flex",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "9999px",
        padding: "0.25rem",
        maxWidth: "400px",
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

              {/* AI written report */}
              <div style={{
                background: "rgba(99, 102, 241, 0.05)",
                border: "1px solid rgba(99, 102, 241, 0.15)",
                borderRadius: "12px",
                padding: "1.25rem"
              }}>
                <h4 style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  ELSA AI Analysis
                </h4>
                <p style={{ fontSize: "0.9rem", lineHeight: "1.5", color: "var(--text-main)", fontStyle: "italic" }}>
                  &ldquo;{singleResult.reasoning}&rdquo;
                </p>
              </div>
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

    </main>
  );
}
