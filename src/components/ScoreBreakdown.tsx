"use client";

import React, { useEffect, useState } from "react";
import { CategoryBreakdown } from "@/types/elsa";

interface ScoreBreakdownProps {
  breakdown: CategoryBreakdown;
}

export default function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const [widths, setWidths] = useState<Record<string, number>>({
    atmosphericPresence: 0,
    surfaceSuitability: 0,
    temperatureScore: 0,
    magneticField: 0,
    orbitalStability: 0,
    starQuality: 0,
    galacticSafety: 0,
    distanceScore: 0,
    climateStability: 0,
    systemArchitecture: 0,
  });

  useEffect(() => {
    // Animate widths from 0 to actual value when mounted
    const timer = setTimeout(() => {
      setWidths({
        atmosphericPresence: breakdown.atmosphericPresence,
        surfaceSuitability: breakdown.surfaceSuitability,
        temperatureScore: breakdown.temperatureScore,
        magneticField: breakdown.magneticField,
        orbitalStability: breakdown.orbitalStability,
        starQuality: breakdown.starQuality,
        galacticSafety: breakdown.galacticSafety,
        distanceScore: breakdown.distanceScore,
        climateStability: breakdown.climateStability,
        systemArchitecture: breakdown.systemArchitecture,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [breakdown]);

  const categories = [
    {
      key: "atmosphericPresence",
      name: "Atmospheric Presence",
      desc: "Detected gases: O₂, N₂, H₂O, CO₂ composition analysis",
      weight: "20%",
    },
    {
      key: "temperatureScore",
      name: "Temperature Suitability",
      desc: "Equilibrium temperature relative to habitable zone (ideal ~280K)",
      weight: "15%",
    },
    {
      key: "surfaceSuitability",
      name: "Surface & Size Suitability",
      desc: "Planet radius and mass relative to Earth (ideal ~1.0×)",
      weight: "12%",
    },
    {
      key: "climateStability",
      name: "Climate Stability",
      desc: "Seasonal extremity based on axial tilt (ideal ~23°)",
      weight: "12%",
    },
    {
      key: "magneticField",
      name: "Magnetic Field Shielding",
      desc: "Potential dynamo protection from stellar winds and flares",
      weight: "10%",
    },
    {
      key: "starQuality",
      name: "Star Quality & Age",
      desc: "Luminosity, stability, and longevity of the host star",
      weight: "10%",
    },
    {
      key: "orbitalStability",
      name: "Orbital Stability",
      desc: "Yearly mechanics, temperature variability, and rotation lock risks",
      weight: "7%",
    },
    {
      key: "galacticSafety",
      name: "Galactic Safety",
      desc: "Positioning relative to dangerous supernovae and cosmic threats",
      weight: "7%",
    },
    {
      key: "systemArchitecture",
      name: "System Architecture",
      desc: "Stability bonuses from moons and gas giant shields",
      weight: "4%",
    },
    {
      key: "distanceScore",
      name: "Distance from Earth",
      desc: "Travel and signal index based on light-year distance",
      weight: "3%",
    },
  ];

  return (
    <div className="breakdown-list">
      <h3 style={{ marginBottom: "1rem", fontFamily: "Outfit" }} className="text-gradient">
        Habitability Breakdown
      </h3>
      {categories.map((cat) => {
        const val = breakdown[cat.key as keyof CategoryBreakdown] ?? 0;
        const currentWidth = widths[cat.key] ?? 0;
        
        return (
          <div key={cat.key} className="breakdown-item">
            <div className="breakdown-label">
              <div>
                <span className="breakdown-label-name">{cat.name}</span>
                <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-dark)" }}>
                  {cat.desc}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.6rem", color: "var(--text-dark)" }}>{cat.weight}</span>
                <span style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{val}%</span>
              </div>
            </div>
            <div className="breakdown-bar-bg">
              <div 
                className="breakdown-bar-fill"
                style={{ width: `${currentWidth}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
