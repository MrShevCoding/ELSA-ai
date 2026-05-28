"use client";

import React, { useState } from "react";
import { BatchPlanetResult } from "@/types/elsa";

interface BatchResultsTableProps {
  results: BatchPlanetResult[];
}

export default function BatchResultsTable({ results }: BatchResultsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const toggleRow = (name: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const sortedResults = [...results].sort((a, b) => {
    return sortOrder === "desc" ? b.score - a.score : a.score - b.score;
  });

  const getScoreBadgeClass = (score: number) => {
    if (score >= 70) return "score-badge badge-high";
    if (score >= 40) return "score-badge badge-mid";
    return "score-badge badge-low";
  };

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="flex-between">
        <h3 className="text-gradient" style={{ fontFamily: "Outfit" }}>Batch Evaluation Results</h3>
        <button
          onClick={toggleSort}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "6px",
            padding: "0.4rem 1rem",
            fontSize: "0.8rem",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem"
          }}
        >
          Sort by Score: {sortOrder === "desc" ? "Highest First ↓" : "Lowest First ↑"}
        </button>
      </div>

      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}></th>
              <th>Planet Name</th>
              <th>Star Type</th>
              <th>Radius (R⊕)</th>
              <th>Mass (M⊕)</th>
              <th>Temp (K)</th>
              <th>Distance (ly)</th>
              <th>ESI Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((res) => {
              const isExpanded = !!expandedRows[res.planetName];
              return (
                <React.Fragment key={res.planetName}>
                  <tr style={{ cursor: "pointer" }} onClick={() => toggleRow(res.planetName)}>
                    <td style={{ fontSize: "0.8rem", textAlign: "center", color: "var(--accent-cyan)" }}>
                      {isExpanded ? "▼" : "▶"}
                    </td>
                    <td style={{ fontWeight: 600 }}>{res.planetName}</td>
                    <td>{res.input.starType}-type</td>
                    <td>{res.input.radius} R⊕</td>
                    <td>{res.input.mass} M⊕</td>
                    <td>{res.input.equilibriumTemp} K</td>
                    <td>{res.input.distanceFromEarth} ly</td>
                    <td>
                      <span className={getScoreBadgeClass(res.score)}>
                        {res.score}
                      </span>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={8} style={{ background: "rgba(13, 27, 62, 0.25)", padding: "1.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          
                          {/* Parameter summary & categories */}
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                            <div>
                              <h4 style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                                Rubric Breakdown
                              </h4>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem" }}>
                                <div className="flex-between">
                                  <span>Atmospheric Presence (20%):</span>
                                  <span style={{ fontWeight: 600 }}>{res.breakdown.atmosphericPresence}%</span>
                                </div>
                                <div className="flex-between">
                                  <span>Temperature Suitability (15%):</span>
                                  <span style={{ fontWeight: 600 }}>{res.breakdown.temperatureScore}%</span>
                                </div>
                                <div className="flex-between">
                                  <span>Surface Suitability (12%):</span>
                                  <span style={{ fontWeight: 600 }}>{res.breakdown.surfaceSuitability}%</span>
                                </div>
                                <div className="flex-between">
                                  <span>Climate Stability (12%):</span>
                                  <span style={{ fontWeight: 600 }}>{res.breakdown.climateStability}%</span>
                                </div>
                                <div className="flex-between">
                                  <span>Magnetic Field Potential (10%):</span>
                                  <span style={{ fontWeight: 600 }}>{res.breakdown.magneticField}%</span>
                                </div>
                                <div className="flex-between">
                                  <span>Star Quality & Age (10%):</span>
                                  <span style={{ fontWeight: 600 }}>{res.breakdown.starQuality}%</span>
                                </div>
                                <div className="flex-between">
                                  <span>Orbital Stability (7%):</span>
                                  <span style={{ fontWeight: 600 }}>{res.breakdown.orbitalStability}%</span>
                                </div>
                                <div className="flex-between">
                                  <span>Galactic Safety (7%):</span>
                                  <span style={{ fontWeight: 600 }}>{res.breakdown.galacticSafety}%</span>
                                </div>
                                <div className="flex-between">
                                  <span>System Architecture (4%):</span>
                                  <span style={{ fontWeight: 600 }}>{res.breakdown.systemArchitecture}%</span>
                                </div>
                                <div className="flex-between">
                                  <span>Distance from Earth (3%):</span>
                                  <span style={{ fontWeight: 600 }}>{res.breakdown.distanceScore}%</span>
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <h4 style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                                ELSA Analysis
                              </h4>
                              <p style={{ fontSize: "0.85rem", lineHeight: "1.4", color: "var(--text-main)", fontStyle: "italic" }}>
                                &ldquo;{res.reasoning}&rdquo;
                              </p>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
