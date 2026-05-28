"use client";

import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { PlanetInput } from "@/types/elsa";

interface FileUploadProps {
  onParsed: (planets: PlanetInput[]) => void;
  onError: (msg: string) => void;
}

export default function FileUpload({ onParsed, onError }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          validateAndEmit(results.data);
        },
        error: (err) => {
          onError(`Failed to parse CSV file: ${err.message}`);
        },
      });
    } else if (fileExtension === "json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          validateAndEmit(Array.isArray(parsed) ? parsed : [parsed]);
        } catch {
          onError("Failed to parse JSON file. Ensure it is valid JSON format.");
        }
      };
      reader.readAsText(file);
    } else {
      onError("Unsupported file format. Please upload a .csv or .json file.");
    }
  };

  const validateAndEmit = (data: unknown[]) => {
    const validPlanets: PlanetInput[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as Record<string, unknown>;
      
      // Match various header casings and naming
      const planetName = String(row.planetName || row.name || row.PlanetName || `Exoplanet-${i + 1}`);
      const radius = parseFloat(String(row.radius || row.Radius || row.planetRadius || 0));
      const mass = parseFloat(String(row.mass || row.Mass || row.planetMass || 0));
      const orbitalPeriod = parseFloat(String(row.orbitalPeriod || row.Period || row.period || 0));
      const starType = String(row.starType || row.StarType || row.star || "G").trim().toUpperCase();
      const equilibriumTemp = parseFloat(String(row.equilibriumTemp || row.Temp || row.temp || row.temperature || 0));
      const distanceFromEarth = parseFloat(String(row.distanceFromEarth || row.distance || row.Distance || 0));

      // Advanced metrics
      const hasMoon = row.hasMoon === true || String(row.hasMoon).toLowerCase() === "true" || String(row.hasMoon) === "1";
      const hasJupiterProtector = row.hasJupiterProtector === true || String(row.hasJupiterProtector).toLowerCase() === "true" || String(row.hasJupiterProtector) === "1";
      const axialTilt = row.axialTilt !== undefined ? parseFloat(String(row.axialTilt)) : 23.4; // Default to Earth-like if unknown
      
      let systemType: "Single" | "Binary" | "Rogue" = "Single";
      const sysTypeStr = String(row.systemType || "").toLowerCase();
      if (sysTypeStr === "binary") systemType = "Binary";
      if (sysTypeStr === "rogue") systemType = "Rogue";

      const galacticDistance = row.galacticDistance !== undefined ? parseFloat(String(row.galacticDistance)) : 8.0;
      const starAge = row.starAge !== undefined ? parseFloat(String(row.starAge)) : 4.5;

      if (!radius || !mass || !orbitalPeriod || !equilibriumTemp) {
        continue; // skip rows with missing numeric parameters
      }

      validPlanets.push({
        planetName,
        radius,
        mass,
        orbitalPeriod,
        starType: ["O", "B", "A", "F", "G", "K", "M"].includes(starType) ? starType : "G",
        equilibriumTemp,
        distanceFromEarth,
        hasMoon,
        hasJupiterProtector,
        axialTilt,
        systemType,
        galacticDistance,
        starAge,
      });
    }

    if (validPlanets.length === 0) {
      onError("No valid exoplanet rows found. Ensure required numeric fields (radius, mass, orbitalPeriod, equilibriumTemp) are populated.");
    } else {
      onParsed(validPlanets);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const downloadSampleTemplate = () => {
    const csvContent = 
`planetName,radius,mass,orbitalPeriod,starType,equilibriumTemp,distanceFromEarth
Kepler-452b,1.11,1.4,384.8,G,265,1400
Kepler-22b,2.4,8.3,289.8,G,262,620
Proxima Centauri b,1.03,1.07,11.2,M,234,4.2
LHS 1140 b,1.72,5.6,24.7,M,230,49
`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "elsa_score_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="flex-between">
        <h3 className="text-gradient" style={{ fontFamily: "Outfit" }}>Batch File Upload</h3>
        <button
          type="button"
          onClick={downloadSampleTemplate}
          style={{
            background: "transparent",
            border: "1px solid var(--accent-cyan)",
            borderRadius: "9999px",
            padding: "0.4rem 1rem",
            fontSize: "0.75rem",
            color: "var(--accent-cyan)",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(6, 182, 212, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Download Sample CSV
        </button>
      </div>

      <div
        className={`dropzone ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.json"
          onChange={handleChange}
        />
        <div className="dropzone-icon">🚀</div>
        <div>
          <p style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.25rem" }}>
            Drag and drop your exoplanet .csv or .json file
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            or click to browse local files
          </p>
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-dark)", marginTop: "0.5rem" }}>
          Expected Headers: planetName, radius, mass, orbitalPeriod, starType, equilibriumTemp, distanceFromEarth, hasMoon, hasJupiterProtector, axialTilt, systemType, galacticDistance, starAge
        </div>
      </div>
    </div>
  );
}
