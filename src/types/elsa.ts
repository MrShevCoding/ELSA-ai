// ─────────────────────────────────────────────
// ELSA AI — Shared TypeScript Types
// ─────────────────────────────────────────────

export interface AtmosphericGases {
  oxygen: boolean;        // O₂
  carbonDioxide: boolean; // CO₂
  water: boolean;         // H₂O vapor
  nitrogen: boolean;      // N₂
  methane: boolean;       // CH₄
  hydrogen: boolean;      // H₂ (gas giant indicator)
}

export interface PlanetInput {
  planetName: string;
  radius: number;          // Earth radii (R⊕) — ratio to Earth
  mass: number;            // Earth masses (M⊕) — ratio to Earth
  orbitalPeriod: number;   // Days
  starType: string;        // e.g. "G", "K", "M", "F", "A"
  equilibriumTemp: number; // Kelvin
  distanceFromEarth: number; // Light-years
  extraInfo?: string; // optional user notes about planet
  hasMoon?: boolean;
  axialTilt?: number;      // Degrees (0-180)
  systemType?: "Single" | "Binary" | "Rogue";
  hasJupiterProtector?: boolean;
  galacticDistance?: number; // kpc from galactic center
  starAge?: number;        // Billion years
  atmosphericGases?: AtmosphericGases;
}

export interface CategoryBreakdown {
  atmosphericPresence: number;   // Gas checkbox scoring (O₂, H₂O, CO₂, N₂, CH₄)
  surfaceSuitability: number;    // Planet radius + mass suitability
  temperatureScore: number;      // Equilibrium temperature (promoted from hidden)
  magneticField: number;
  orbitalStability: number;
  starQuality: number;
  galacticSafety: number;
  distanceScore: number;
  climateStability: number;      // Based on Axial Tilt
  systemArchitecture: number;    // Based on Moon, Jupiter shield, Binary/Rogue
}

export interface ScoreResult {
  score: number;            // 0–100
  breakdown: CategoryBreakdown;
  reasoning: string;        // Gemini's paragraph explanation
}

export interface BatchPlanetResult extends ScoreResult {
  planetName: string;
  input: PlanetInput;
}
