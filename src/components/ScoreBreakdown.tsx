"use client";

import React, { useEffect, useState } from "react";
import { CategoryBreakdown } from "@/types/elsa";

interface ScoreBreakdownProps {
  breakdown: CategoryBreakdown;
}

export default function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const [widths, setWidths] = useState<Record<string, number>>({
    atmosphericComposition: 0,
    magneticField: 0,
    orbitalStability: 0,
    starQuality: 0,
    galacticSafety: 0,
    distanceScore: 0,
  });

  useEffect(() => {
    // Animate widths from 0 to actual value when mounted
    const timer = setTimeout(() => {
      setWidths({
        atmosphericComposition: breakdown.atmosphericComposition,
        magneticField: breakdown.magneticField,
        orbitalStability: breakdown.orbitalStability,
        starQuality: breakdown.starQuality,
        galacticSafety: breakdown.galacticSafety,
        distanceScore: breakdown.distanceScore,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [breakdown]);

  const categories = [
    {
      key: "atmosphericComposition",
      name: "Atmospheric Composition",
      desc: "Estimated gas composition, thickness, and pressure suitability",
    },
    {
      key: "magneticField",
      name: "Magnetic Field Shielding",
      desc: "Potential dynamo protection from stellar winds and flares",
    },
    {
      key: "orbitalStability",
      name: "Orbital Stability",
      desc: "Yearly mechanics, temperature variability, and rotation lock risks",
    },
    {
      key: "starQuality",
      name: "Star Quality",
      desc: "Luminosity, stability, and longevity of the host star",
    },
    {
      key: "galacticSafety",
      name: "Galactic Safety",
      desc: "Positioning relative to dangerous supernovae and cosmic threats",
    },
    {
      key: "distanceScore",
      name: "Distance from Earth",
      desc: "Travel and signal index based on light-year distance",
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
              <span style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{val}%</span>
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
