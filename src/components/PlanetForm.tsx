"use client";

import React, { useState } from "react";
import { PlanetInput, AtmosphericGases } from "@/types/elsa";

interface PlanetFormProps {
  onSubmit: (data: PlanetInput) => void;
  isLoading: boolean;
}

const DEFAULT_GASES: AtmosphericGases = {
  oxygen: false,
  carbonDioxide: false,
  water: false,
  nitrogen: false,
  methane: false,
  hydrogen: false,
};

const SAMPLE_PLANETS = [
  {
    planetName: "Kepler-442b",
    radius: 1.34,
    mass: 2.36,
    orbitalPeriod: 112.9,
    starType: "K",
    equilibriumTemp: 233,
    distanceFromEarth: 1206,
    systemType: "Single" as const,
    hasMoon: false,
    axialTilt: 20,
    hasJupiterProtector: true,
    galacticDistance: 8.5,
    starAge: 2.9,
    extraInfo: "",
    atmosphericGases: { oxygen: true, nitrogen: true, water: true, carbonDioxide: true, methane: false, hydrogen: false },
  },
  {
    planetName: "TRAPPIST-1e",
    radius: 0.92,
    mass: 0.69,
    orbitalPeriod: 6.1,
    starType: "M",
    equilibriumTemp: 251,
    distanceFromEarth: 41,
    systemType: "Single" as const,
    hasMoon: false,
    axialTilt: 0,
    hasJupiterProtector: false,
    galacticDistance: 7.6,
    starAge: 7.6,
    extraInfo: "",
    atmosphericGases: { oxygen: false, nitrogen: true, water: true, carbonDioxide: true, methane: false, hydrogen: false },
  },
  {
    planetName: "Gliese 581g",
    radius: 1.5,
    mass: 3.1,
    orbitalPeriod: 36.6,
    starType: "M",
    equilibriumTemp: 228,
    distanceFromEarth: 20,
    systemType: "Single" as const,
    hasMoon: true,
    axialTilt: 15,
    hasJupiterProtector: false,
    galacticDistance: 8.0,
    starAge: 8.9,
    extraInfo: "",
    atmosphericGases: { oxygen: false, nitrogen: true, water: true, carbonDioxide: true, methane: true, hydrogen: false },
  }
];

export default function PlanetForm({ onSubmit, isLoading }: PlanetFormProps) {
  const [formData, setFormData] = useState<any>({
    planetName: "",
    radius: 0,
    mass: 0,
    orbitalPeriod: 0,
    starType: "G",
    equilibriumTemp: 0,
    distanceFromEarth: 0,
    systemType: "Single",
    hasMoon: false,
    axialTilt: 0,
    hasJupiterProtector: false,
    galacticDistance: 8,
    starAge: 4.5,
    extraInfo: "",
    atmosphericGases: { ...DEFAULT_GASES },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGasChange = (gas: keyof AtmosphericGases) => {
    setFormData((prev: any) => ({
      ...prev,
      atmosphericGases: {
        ...prev.atmosphericGases,
        [gas]: !prev.atmosphericGases[gas],
      },
    }));
  };

  const handleRandomize = () => {
    const random = (min: number, max: number, decimals = 2) => {
      const val = Math.random() * (max - min) + min;
      return Number(val.toFixed(decimals));
    };
    setFormData({
      planetName: `Random-${Math.floor(random(1, 1000))}`,
      radius: random(0.5, 2.5),
      mass: random(0.5, 5),
      orbitalPeriod: random(0.5, 400),
      starType: ['F', 'G', 'K', 'M', 'A'][Math.floor(Math.random() * 5)],
      equilibriumTemp: random(50, 350),
      distanceFromEarth: random(0.1, 5000, 1),
      systemType: ['Single', 'Binary', 'Rogue'][Math.floor(Math.random() * 3)],
      hasMoon: Math.random() < 0.5,
      axialTilt: random(0, 180, 1),
      hasJupiterProtector: Math.random() < 0.5,
      galacticDistance: random(0, 15, 2),
      starAge: random(0.5, 13, 2),
      extraInfo: "",
      atmosphericGases: {
        oxygen: Math.random() < 0.4,
        carbonDioxide: Math.random() < 0.6,
        water: Math.random() < 0.5,
        nitrogen: Math.random() < 0.7,
        methane: Math.random() < 0.3,
        hydrogen: Math.random() < 0.2,
      },
    });
  };

  const handleSampleSelect = (sample: typeof SAMPLE_PLANETS[0]) => {
    setFormData({ ...sample });
  };

  // Submit handler – forwards data to parent
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const gasOptions: { key: keyof AtmosphericGases; label: string; formula: string; color: string }[] = [
    { key: "oxygen", label: "Oxygen", formula: "O₂", color: "#22d3ee" },
    { key: "nitrogen", label: "Nitrogen", formula: "N₂", color: "#a78bfa" },
    { key: "water", label: "Water Vapor", formula: "H₂O", color: "#60a5fa" },
    { key: "carbonDioxide", label: "Carbon Dioxide", formula: "CO₂", color: "#f97316" },
    { key: "methane", label: "Methane", formula: "CH₄", color: "#34d399" },
    { key: "hydrogen", label: "Hydrogen", formula: "H₂", color: "#f43f5e" },
  ];

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
            <button type="button" onClick={handleRandomize} style={{ background: "rgba(99, 102, 241, 0.2)", border: "1px solid rgba(99, 102, 241, 0.4)", borderRadius: "4px", padding: "0.25rem 0.5rem", fontSize: "0.75rem", color: "#fff", cursor: "pointer", marginLeft: "0.5rem", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99, 102, 241, 0.4)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)"; }}>Randomize</button>
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
          <label className="form-label">Planet Radius (× Earth)</label>
          <input
            type="number"
            step="any"
            name="radius"
            className="form-input"
            placeholder="Ratio to Earth (1.0 = Earth-sized)"
            value={formData.radius}
            onChange={handleChange}
            required
            min="0.1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Planet Mass (× Earth)</label>
          <input
            type="number"
            step="any"
            name="mass"
            className="form-input"
            placeholder="Ratio to Earth (1.0 = Earth-mass)"
            value={formData.mass}
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
            value={formData.orbitalPeriod}
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
            value={formData.equilibriumTemp}
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
            value={formData.distanceFromEarth}
            onChange={handleChange}
            required
            min="0.1"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">System Type</label>
          <select
            name="systemType"
            className="form-select"
            value={formData.systemType}
            onChange={handleChange}
          >
            <option value="Single">Single Star System</option>
            <option value="Binary">Binary Star System</option>
            <option value="Rogue">Rogue Planet (Ejected)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Galactic Distance (kpc)</label>
          <input
            type="number"
            step="any"
            name="galacticDistance"
            className="form-input"
            placeholder="kpc from center (Earth=8)"
            value={formData.galacticDistance}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Axial Tilt (Degrees)</label>
          <input
            type="number"
            step="any"
            name="axialTilt"
            className="form-input"
            placeholder="e.g. 23.4"
            value={formData.axialTilt}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Star Age (Billion Years)</label>
          <input
            type="number"
            step="any"
            name="starAge"
            className="form-input"
            placeholder="e.g. 4.5"
            value={formData.starAge}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* ── Atmospheric Gases Section ── */}
      <div style={{
        background: "rgba(99, 102, 241, 0.05)",
        border: "1px solid rgba(99, 102, 241, 0.15)",
        borderRadius: "12px",
        padding: "1rem 1.25rem",
      }}>
        <label className="form-label" style={{ marginBottom: "0.75rem", display: "block", fontSize: "0.9rem" }}>
          🌬️ Detected Atmospheric Gases
          <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-dark)", marginTop: "0.2rem" }}>
            Select gases detected or estimated in the planet&apos;s atmosphere
          </span>
        </label>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.5rem",
        }}>
          {gasOptions.map((gas) => {
            const isChecked = formData.atmosphericGases?.[gas.key] ?? false;
            return (
              <button
                key={gas.key}
                type="button"
                onClick={() => handleGasChange(gas.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  border: isChecked ? `1px solid ${gas.color}` : "1px solid rgba(255,255,255,0.08)",
                  background: isChecked ? `${gas.color}15` : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  color: isChecked ? gas.color : "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: isChecked ? 600 : 400,
                }}
              >
                <span style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "4px",
                  border: isChecked ? `2px solid ${gas.color}` : "2px solid rgba(255,255,255,0.2)",
                  background: isChecked ? gas.color : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s",
                  fontSize: "0.7rem",
                  color: "#fff",
                }}>
                  {isChecked && "✓"}
                </span>
                <span>
                  <strong>{gas.formula}</strong>
                  <span style={{ marginLeft: "0.3rem", opacity: 0.7 }}>{gas.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Additional Info</label>
        <textarea
          name="extraInfo"
          className="form-input"
          placeholder="e.g. nearby black hole, special observations, tidal heating"
          value={formData.extraInfo}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-row" style={{ alignItems: "center", gap: "2rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-main)", fontSize: "0.9rem", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            name="hasMoon" 
            checked={formData.hasMoon} 
            onChange={handleChange} 
            style={{ width: "16px", height: "16px" }}
          />
          Has Large Moon
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-main)", fontSize: "0.9rem", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            name="hasJupiterProtector" 
            checked={formData.hasJupiterProtector} 
            onChange={handleChange} 
            style={{ width: "16px", height: "16px" }}
          />
          Has Jupiter-like Gas Giant Shield
        </label>
      </div>

      <button type="submit" className="glowing-btn" style={{ width: "100%", marginTop: "0.5rem" }} disabled={isLoading}>
        {isLoading ? "Running ESI Scorer..." : "Compute Habitability Score →"}
      </button>
    </form>
  );
}
