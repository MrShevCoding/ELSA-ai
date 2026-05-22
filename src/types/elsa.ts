// ─────────────────────────────────────────────
// ELSA AI — Shared TypeScript Types
// ─────────────────────────────────────────────

export interface PlanetInput {
  planetName: string;
  radius: number;          // Earth radii (R⊕)
  mass: number;            // Earth masses (M⊕)
  orbitalPeriod: number;   // Days
  starType: string;        // e.g. "G", "K", "M", "F", "A"
  equilibriumTemp: number; // Kelvin
  distanceFromEarth: number; // Light-years
}

export interface CategoryBreakdown {
  atmosphericComposition: number;
  magneticField: number;
  orbitalStability: number;
  starQuality: number;
  galacticSafety: number;
  distanceScore: number;
}

export interface ScoreResult {
  score: number;            // 0–100
  breakdown: CategoryBreakdown;
  reasoning: string;        // Claude's paragraph explanation
}

export interface BatchPlanetResult extends ScoreResult {
  planetName: string;
  input: PlanetInput;
}
