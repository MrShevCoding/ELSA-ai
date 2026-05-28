import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PlanetInput, AtmosphericGases } from "@/types/elsa";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// ─────────────────────────────────────────────────────────────────
// Atmospheric Presence Scoring (shared between simulation & prompt)
// ─────────────────────────────────────────────────────────────────
function scoreAtmosphericPresence(gases?: AtmosphericGases): number {
  if (!gases) return 15; // No data = assume airless body
  const anyChecked = gases.oxygen || gases.carbonDioxide || gases.water || gases.nitrogen || gases.methane || gases.hydrogen;
  if (!anyChecked) return 15; // Airless

  let score = 0;
  if (gases.nitrogen) score += 30;       // Bulk atmosphere buffer gas
  if (gases.oxygen) score += 30;         // Respiration + biosignature
  if (gases.water) score += 25;          // Essential solvent for life
  if (gases.carbonDioxide) score += 10;  // Greenhouse warming (trace positive)
  if (gases.methane) score += 5;         // Possible biosignature
  if (gases.hydrogen) score -= 20;       // H₂-dominant = gas giant = bad

  return Math.max(0, Math.min(100, score));
}

// ─────────────────────────────────────────────────────────────────
// Category Weights (must sum to 1.0)
// ─────────────────────────────────────────────────────────────────
const WEIGHTS = {
  atmosphericPresence: 0.20,   // Heaviest — O₂, H₂O, CO₂, N₂
  temperatureScore:    0.15,   // Promoted from hidden
  surfaceSuitability:  0.12,   // Radius + mass
  climateStability:    0.12,   // Axial tilt
  magneticField:       0.10,   // Dynamo protection
  starQuality:         0.10,   // Star type + age
  orbitalStability:    0.07,   // Orbital period
  galacticSafety:      0.07,   // Distance from galactic center
  systemArchitecture:  0.04,   // Moons, Jupiter shield
  distanceScore:       0.03,   // Distance from Earth (reachability)
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as PlanetInput;
    
    // Quick validation
    const { planetName, radius, mass, orbitalPeriod, starType, equilibriumTemp, distanceFromEarth, hasMoon, axialTilt, systemType, hasJupiterProtector, galacticDistance, starAge } = body;
    if (!planetName || radius === undefined || mass === undefined || equilibriumTemp === undefined) {
      return NextResponse.json(
        { error: "Missing required exoplanet specifications." },
        { status: 400 }
      );
    }

    // Check if API key is configured and is not a placeholder
    const apiKey = process.env.GEMINI_API_KEY;
    const isMockKey = !apiKey || apiKey === "your_gemini_key_here" || !apiKey.startsWith("AIza");

    if (isMockKey) {
      console.warn("Valid GEMINI_API_KEY is not set. Falling back to simulation mode.");
      return NextResponse.json(simulateScoring(body));
    }

    // ── Format gas info for the prompt ──
    const gases = body.atmosphericGases;
    const gasLabels: string[] = [];
    if (gases) {
      if (gases.oxygen) gasLabels.push("O₂ (Oxygen)");
      if (gases.nitrogen) gasLabels.push("N₂ (Nitrogen)");
      if (gases.water) gasLabels.push("H₂O (Water Vapor)");
      if (gases.carbonDioxide) gasLabels.push("CO₂ (Carbon Dioxide)");
      if (gases.methane) gasLabels.push("CH₄ (Methane)");
      if (gases.hydrogen) gasLabels.push("H₂ (Hydrogen)");
    }
    const gasString = gasLabels.length > 0 ? gasLabels.join(", ") : "Unknown / None detected";

    // ── Gemini System Prompt ──
    const systemPrompt = `You are ELSA (ExoLife Score AI), an expert astrobiologist and habitability scoring assistant.
Your task is to analyze exoplanet parameter inputs and output a scientific habitability score from 0 to 100 (where 100 is perfectly Earth-like/habitable, and 0 is completely hostile/uninhabitable).

You must analyze TEN key categories with these EXACT weights:

1. Atmospheric Presence (20%): Score based on detected gases. Ideal: N₂ + O₂ + H₂O + trace CO₂. N₂ = +30pts, O₂ = +30pts, H₂O = +25pts, CO₂ = +10pts, CH₄ = +5pts, H₂ = −20pts (gas giant). No gases = 15 (airless). Cap at 0–100.

2. Temperature Suitability (15%): Gaussian curve centered on 280K (std dev ~140K). Score = 100 × e^(−0.5 × ((T−280)/140)²). Rogue planets capped at 30.

3. Surface & Size Suitability (12%): Exponential decay on radius: e^(−0.04 × |R−1.0|^1.15) times exponential decay on mass: e^(−0.02 × |M−1.0|^1.1). Supermassive gas giants score near 0.

4. Climate Stability (12%): Based on axial tilt. Gaussian centered on 23.4° (σ=25°). Tilts < 10° = 40 (frozen poles), tilts > 45° = 20 (chaotic seasons).

5. Magnetic Field Potential (10%): Requires mass ≥ 0.5 M⊕ and orbital period ≥ 15 days. Having a large moon adds +20 (tidal heating). Score = 95 × min(1, mass/0.5) × min(1, period/15) + moon_bonus.

6. Star Quality & Age (10%): G-type = 100, K-type = 100, F-type = 65, M-type = 45 (flare/tidal lock risk), A-type = 20. Stars younger than 4 Gyr penalized ×0.7.

7. Orbital Stability (7%): Gaussian on log₁₀(orbital period), centered at log₁₀(200) with σ=2.0.

8. Galactic Safety (7%): Optimal 2–8 kpc from center. < 2 kpc = 20 (radiation). > 12 kpc = 60 (low metallicity). Rogue = 10.

9. System Architecture (4%): Single = +30, Binary = +10, Rogue = 5 (base 50). Jupiter protector = +20. Cap at 100.

10. Distance from Earth (3%): Exponential decay: 100 × e^(−distance/8000). Reflects reachability, not habitability.

FINAL SCORE COMPUTATION:
1. Compute the weighted average: Σ(category_score × weight)
2. Identify the minimum score among the three CRITICAL core categories: Atmospheric Presence, Temperature Suitability, and Surface & Size Suitability.
3. Apply a harsh VETO drag penalty if this critical minimum is below 35:
     if min_critical < 35: drag = sqrt(min_critical / 35)
     else: drag = 1.0  (no penalty)
4. final_score = round(weighted_average × drag)

IMPORTANT: The drag penalty only applies to the critical core categories. It prevents planets with one truly catastrophic survival factor (like crushing gravity, boiling temp, or zero atmosphere) from scoring high, while ignoring non-critical factors like distance or star age.

You MUST respond with a single, valid JSON object only. Do NOT include markdown code blocks or any conversational text. Simply return the JSON raw.

The JSON object must match this schema:
{
  "score": number, // an integer from 0 to 100
  "breakdown": {
    "atmosphericPresence": number,
    "surfaceSuitability": number,
    "temperatureScore": number,
    "magneticField": number,
    "orbitalStability": number,
    "starQuality": number,
    "galacticSafety": number,
    "distanceScore": number,
    "climateStability": number,
    "systemArchitecture": number
  },
  "reasoning": "string" // An extremely extensive, detailed, and comprehensive multi-paragraph analysis (at least 4-5 long paragraphs). Explain how the planet scored in each category, highlight the strongest and weakest areas, and describe what technologies would be needed for colonization. Be educational, highly scientific, and extremely thorough."
}`;

    const userPrompt = `Evaluate the following exoplanet:
Name: ${planetName}
Radius: ${radius} × Earth (R⊕)
Mass: ${mass} × Earth (M⊕)
Orbital Period: ${orbitalPeriod} Days
Host Star Type: ${starType}-type star (Age: ${starAge ?? "Unknown"} Billion Yrs)
Equilibrium Temperature: ${equilibriumTemp} Kelvin (K)
Distance from Earth: ${distanceFromEarth} Light-years
System Architecture: ${systemType ?? "Single"} System, Jupiter Protector: ${hasJupiterProtector ? "Yes" : "No"}, Large Moon: ${hasMoon ? "Yes" : "No"}
Axial Tilt: ${axialTilt ?? "Unknown"}°
Galactic Distance: ${galacticDistance ?? "Unknown"} kpc
Detected Atmospheric Gases: ${gasString}${body.extraInfo ? `\nAdditional User Notes: ${body.extraInfo}` : ""}`;

    // Try Gemini API, fall back to simulation if it fails
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      // Parse Response
      const responseText = response.text || "";
      
      const scoreResult = JSON.parse(responseText);
      return NextResponse.json(scoreResult);
    } catch (apiError) {
      console.warn("Gemini API call failed, falling back to simulation mode:", apiError);
      return NextResponse.json(simulateScoring(body));
    }

  } catch (error) {
    console.error("ELSA ESI Scorer API error:", error);
    return NextResponse.json(
      { error: "Internal server error scoring the exoplanet." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// Deterministic Simulation Scorer (used when Gemini API unavailable)
// All continuous Gaussian curves — no hard cutoffs
// ─────────────────────────────────────────────────────────────────
function simulateScoring(planet: PlanetInput) {
  const { hasMoon = false, axialTilt = 23.4, systemType = "Single", hasJupiterProtector = false, galacticDistance = 8, starAge = 4.5 } = planet;

  // ── 1. Atmospheric Presence (20%) ──
  const atmPresScore = scoreAtmosphericPresence(planet.atmosphericGases);

  // ── 2. Temperature Suitability (15%) ──
  const tempDev = (planet.equilibriumTemp - 280) / 140;
  let tempScore = Math.max(0, Math.round(100 * Math.exp(-0.5 * tempDev * tempDev)));
  if (systemType === "Rogue") tempScore = Math.min(30, tempScore);

  // ── 3. Surface & Size Suitability (12%) ──
  const radFactor = Math.exp(-0.04 * Math.pow(Math.abs(planet.radius - 1.0), 1.15));
  const massFactor = Math.exp(-0.02 * Math.pow(Math.abs(planet.mass - 1.0), 1.10));
  const surfScore = Math.max(0, Math.round(100 * radFactor * massFactor));

  // ── 4. Climate Stability (12%) ──
  let climateScore = 100;
  if (axialTilt < 10) climateScore = 40;
  else if (axialTilt > 45) climateScore = 20;
  else {
    const tiltDev = Math.abs(axialTilt - 23.4) / 25;
    climateScore = Math.max(0, Math.round(100 * Math.exp(-0.5 * tiltDev * tiltDev)));
  }

  // ── 5. Magnetic Field Potential (10%) ──
  const coreFactor = Math.min(1, planet.mass / 0.5);
  const rotFactor = Math.min(1, planet.orbitalPeriod / 15);
  let magScore = Math.max(0, Math.round(95 * coreFactor * rotFactor));
  if (hasMoon) magScore = Math.min(100, magScore + 20);

  // ── 6. Star Quality & Age (10%) ──
  let starScore = 50;
  if (planet.starType === "G") starScore = 100;
  else if (planet.starType === "K") starScore = 100;
  else if (planet.starType === "F") starScore = 65;
  else if (planet.starType === "M") starScore = 45;
  else if (planet.starType === "A") starScore = 20;
  if (starAge < 4) starScore = Math.round(starScore * 0.7);

  // ── 7. Orbital Stability (7%) ──
  const logPeriod = Math.log10(Math.max(0.1, planet.orbitalPeriod));
  const idealLogPeriod = Math.log10(200);
  const orbitDev = (logPeriod - idealLogPeriod) / 2.0;
  const orbitScore = Math.max(0, Math.round(95 * Math.exp(-0.5 * orbitDev * orbitDev)));

  // ── 8. Galactic Safety (7%) ──
  let galScore = 92;
  if (galacticDistance < 2) galScore = 20;
  else if (galacticDistance > 12) galScore = 60;
  if (systemType === "Rogue") galScore = 10;

  // ── 9. System Architecture (4%) ──
  let sysScore = 50;
  if (systemType === "Single") sysScore += 30;
  else if (systemType === "Binary") sysScore += 10;
  else if (systemType === "Rogue") sysScore = 5;
  if (hasJupiterProtector) sysScore += 20;
  sysScore = Math.min(100, sysScore);

  // ── 10. Distance from Earth (3%) ──
  const distScore = Math.max(0, Math.round(100 * Math.exp(-planet.distanceFromEarth / 8000)));

  // ── Weighted Average ──
  const weighted =
    (atmPresScore * WEIGHTS.atmosphericPresence) +
    (tempScore * WEIGHTS.temperatureScore) +
    (surfScore * WEIGHTS.surfaceSuitability) +
    (climateScore * WEIGHTS.climateStability) +
    (magScore * WEIGHTS.magneticField) +
    (starScore * WEIGHTS.starQuality) +
    (orbitScore * WEIGHTS.orbitalStability) +
    (galScore * WEIGHTS.galacticSafety) +
    (sysScore * WEIGHTS.systemArchitecture) +
    (distScore * WEIGHTS.distanceScore);

  // ── Critical Veto Drag (only on Atmosphere, Temperature, and Surface/Size) ──
  const criticalScores = [atmPresScore, tempScore, surfScore];
  const minCritical = Math.min(...criticalScores);
  const drag = minCritical < 35 ? Math.sqrt(minCritical / 35) : 1.0;
  const finalScore = Math.max(0, Math.round(weighted * drag));

  // ── Identify weakest for reasoning ──
  const factorNames: Record<string, string> = {
    atmPres: "Atmospheric Presence", temp: "Temperature Suitability",
    surf: "Surface & Size Suitability", clim: "Climate Stability",
    mag: "Magnetic Field Shielding", star: "Star Quality & Age",
    orbit: "Orbital Stability", gal: "Galactic Safety",
    sys: "System Architecture", dist: "Distance from Earth"
  };
  const scores: Record<string, number> = {
    atmPres: atmPresScore, temp: tempScore, surf: surfScore,
    clim: climateScore, mag: magScore, star: starScore,
    orbit: orbitScore, gal: galScore, sys: sysScore, dist: distScore
  };
  const weakestKey = Object.entries(scores).reduce((a, b) => a[1] <= b[1] ? a : b)[0];
  const strongestKey = Object.entries(scores).reduce((a, b) => a[1] >= b[1] ? a : b)[0];

  const reasoning = `[SIMULATION MODE] **${planet.planetName}** was evaluated using the ELSA 10-factor habitability matrix with weighted scoring.\n\n**Strongest factor:** ${factorNames[strongestKey]} at ${scores[strongestKey]}%. **Weakest factor:** ${factorNames[weakestKey]} at ${scores[weakestKey]}%.${drag < 1 ? ` A critical veto drag penalty of ×${drag.toFixed(2)} was applied because a core habitability factor (Atmosphere, Temp, or Size) fell below the critical 35% threshold.` : " No drag penalty was applied — all core factors are above the critical 35% threshold."}\n\nThe weighted average across all 10 categories was ${weighted.toFixed(1)}, producing a final score of ${finalScore}.\n\n${
    systemType === "Rogue" ? "As a rogue planet with no host star, colonization would require extreme geothermal boring tech and artificial radiation sources to sustain any surface or subsurface biosphere." :
    planet.starType === "M" ? "Orbiting an M-dwarf presents challenges including tidal locking risks and early stellar flaring, which would require advanced magnetic shielding technology for long-term habitability." :
    atmPresScore < 30 ? "The lack of key atmospheric gases (particularly O₂ and H₂O) severely limits habitability prospects. Terraforming would require massive-scale atmospheric engineering." :
    "Overall habitability is promising, though reaching this system would require significant advances in propulsion technology."
  }`;

  return {
    score: finalScore,
    breakdown: {
      atmosphericPresence: atmPresScore,
      surfaceSuitability: surfScore,
      temperatureScore: tempScore,
      magneticField: magScore,
      orbitalStability: orbitScore,
      starQuality: starScore,
      galacticSafety: galScore,
      distanceScore: distScore,
      climateStability: climateScore,
      systemArchitecture: sysScore
    },
    reasoning
  };
}
