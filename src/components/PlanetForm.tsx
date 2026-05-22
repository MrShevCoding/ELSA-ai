"use client";

import React, { useState } from "react";
import { PlanetInput } from "@/types/elsa";

interface PlanetFormProps {
  onSubmit: (data: PlanetInput) => void;
  isLoading: boolean;
}

const SAMPLE_PLANETS = [
  {
    planetName: "Kepler-442b",
    radius: 1.34,
    mass: 2.36,
    orbitalPeriod: 112.9,
    starType: "K",
    equilibriumTemp: 233,
    distanceFromEarth: 1206,
  },
  {
    planetName: "TRAPPIST-1e",
    radius: 0.92,
    mass: 0.69,
    orbitalPeriod: 6.1,
    starType: "M",
    equilibriumTemp: 251,
    distanceFromEarth: 41,
  },
  {
    planetName: "Gliese 581g",
    radius: 1.5,
    mass: 3.1,
    orbitalPeriod: 36.6,
    starType: "M",
    equilibriumTemp: 228,
    distanceFromEarth: 20,
  }
];

export default function PlanetForm({ onSubmit, isLoading }: PlanetFormProps) {
  const [formData, setFormData] = useState<PlanetInput>({
    planetName: "",
    radius: 0,
    mass: 0,
    orbitalPeriod: 0,
    starType: "G",
    equilibriumTemp: 0,
    distanceFromEarth: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "planetName" || name === "starType" ? value : parseFloat(value) || 0,
    }));
  };

  const handleSampleSelect = (sample: typeof SAMPLE_PLANETS[0]) => {
    setFormData(sample);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div className="flex-between">
        <h3 className="text-gradient" style={{ fontFamily: "Outfit" }}>Exoplanet Parameters</h3>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Samples:</span>
          {SAMPLE_PLANETS.map((sample) => (
            <button
              key={sample.planetName}
              type="button"
              onClick={() => handleSampleSelect(sample)}
              style={{
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "4px",
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(99, 102, 241, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
              }}
            >
              {sample.planetName}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Planet Name</label>
          <input
            type="text"
            name="planetName"
            className="form-input"
            placeholder="e.g. Kepler-186f"
            value={formData.planetName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Host Star Type</label>
          <select
            name="starType"
            className="form-select"
            value={formData.starType}
            onChange={handleChange}
            required
          >
            <option value="F">F-type (Yellow-White, hot)</option>
            <option value="G">G-type (Yellow, Sun-like)</option>
            <option value="K">K-type (Orange, stable)</option>
            <option value="M">M-type (Red Dwarf, flare-prone)</option>
            <option value="A">A-type (Blue-White, very hot)</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Planet Radius (R⊕)</label>
          <input
            type="number"
            step="any"
            name="radius"
            className="form-input"
            placeholder="Earth Radii (e.g. 1.1)"
            value={formData.radius || ""}
            onChange={handleChange}
            required
            min="0.1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Planet Mass (M⊕)</label>
          <input
            type="number"
            step="any"
            name="mass"
            className="form-input"
            placeholder="Earth Masses (e.g. 1.4)"
            value={formData.mass || ""}
            onChange={handleChange}
            required
            min="0.1"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Orbital Period (Days)</label>
          <input
            type="number"
            step="any"
            name="orbitalPeriod"
            className="form-input"
            placeholder="Days to orbit star"
            value={formData.orbitalPeriod || ""}
            onChange={handleChange}
            required
            min="0.5"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Equilibrium Temp (K)</label>
          <input
            type="number"
            step="any"
            name="equilibriumTemp"
            className="form-input"
            placeholder="Kelvin (e.g. 250)"
            value={formData.equilibriumTemp || ""}
            onChange={handleChange}
            required
            min="10"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Distance (Light-Years)</label>
          <input
            type="number"
            step="any"
            name="distanceFromEarth"
            className="form-input"
            placeholder="Distance from solar system"
            value={formData.distanceFromEarth || ""}
            onChange={handleChange}
            required
            min="0.1"
          />
        </div>
      </div>

      <button type="submit" className="glowing-btn" style={{ width: "100%", marginTop: "0.5rem" }} disabled={isLoading}>
        {isLoading ? "Running ESI Scorer..." : "Compute Habitability Score →"}
      </button>
    </form>
  );
}
