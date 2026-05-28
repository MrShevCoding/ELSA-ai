"use client";

import React, { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  
  // Radius and Circumference for the SVG circular gauge
  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Reset display score and then count up
    setDisplayScore(0);
    let start = 0;
    const end = score;
    if (start === end) {
      setDisplayScore(end);
      return;
    }

    const duration = 1200; // ms
    const incrementTime = Math.max(Math.floor(duration / end), 10);
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= end) {
        clearInterval(timer);
        setDisplayScore(end);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [score]);

  // Determine color category based on score
  const getScoreColor = (val: number) => {
    if (val >= 70) return "var(--hab-high)";
    if (val >= 40) return "var(--hab-mid)";
    return "var(--hab-low)";
  };

  const getScoreGlow = (val: number) => {
    if (val >= 70) return "var(--hab-high-glow)";
    if (val >= 40) return "var(--hab-mid-glow)";
    return "var(--hab-low-glow)";
  };

  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  const currentColor = getScoreColor(score);
  const currentGlow = getScoreGlow(score);

  return (
    <div className="gauge-container">
      <div className="gauge-wrapper" style={{ filter: `drop-shadow(0 0 12px ${currentGlow})` }}>
        <svg width="180" height="180" className="gauge-circle">
          <circle
            className="gauge-bg"
            cx="90"
            cy="90"
            r={radius}
          />
          <circle
            className="gauge-progress"
            cx="90"
            cy="90"
            r={radius}
            stroke={currentColor}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="gauge-text">
          <span className="gauge-number" style={{ color: currentColor }}>
            {displayScore}
          </span>
          <span className="gauge-label">ESI Score</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span 
          className={`score-badge ${score >= 70 ? "badge-high" : score >= 40 ? "badge-mid" : "badge-low"}`}
        >
          {score >= 70 ? "Optimally Habitable" : score >= 40 ? "Marginally Habitable" : "Hostile Environment"}
        </span>
      </div>
    </div>
  );
}
