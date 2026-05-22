import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PlanetInput } from "@/types/elsa";

// Initialize Anthropic Client
// Uses ANTHROPIC_API_KEY environment variable automatically
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json() as PlanetInput;
    
    // Quick validation
    const { planetName, radius, mass, orbitalPeriod, starType, equilibriumTemp, distanceFromEarth } = body;
    if (!planetName || radius === undefined || mass === undefined || equilibriumTemp === undefined) {
      return NextResponse.json(
        { error: "Missing required exoplanet specifications." },
        { status: 400 }
      );
    }

    // Check if API key is configured and is not a placeholder
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const isMockKey = !apiKey || apiKey === "your_key_here" || !apiKey.startsWith("sk-");

    if (isMockKey) {
      console.warn("Valid ANTHROPIC_API_KEY is not set. Falling back to simulation mode.");
      return NextResponse.json(simulateScoring(body));
    }

    // Call Anthropic Claude API
    const systemPrompt = `You are ELSA (ExoLife Score AI), an expert astrobiologist and habitability scoring assistant.
Your task is to analyze exoplanet parameter inputs and output a scientific habitability score from 0 to 100 (where 100 is perfectly Earth-like/habitable, and 0 is completely hostile/uninhabitable).

You must analyze six key categories and weigh them as follows:
1. Atmospheric Composition (25% weight): Gaussian curve centered on ideal radius ~1.0 R⊕ and mass ~1.5 M⊕. Scores degrade smoothly as values move away from optimal. Very small planets (mass < 0.2, radius < 0.4) and gas giants (mass > 10, radius > 3) score near 0.
2. Magnetic Field Potential (20% weight): Requires sufficient mass (ramps from 0 at 0 M⊕ to full at 0.5 M⊕) and sufficient orbital period to avoid tidal lock (ramps from 0 at 0 days to full at 15 days). Score = product of both factors.
3. Orbital Stability (20% weight): Gaussian curve on log10(orbital period), centered around ~200 days. Very short periods (< 1 day) and extremely long periods (> 10,000 days) both approach 0 smoothly.
4. Star Quality (15% weight): G-type=100, K-type=90, F-type=65, M-type=45, A-type=20. These are discrete by star classification.
5. Galactic Safety (10% weight): Base of 92, reduced to 75 for A-type volatile stars.
6. Distance from Earth (10% weight): Exponential decay curve: score = 100 * e^(-distance/8000). Nearby systems score ~100, scores drop smoothly with increasing distance.

Additionally, compute a hidden Temperature Factor using a Gaussian centered on 280K (std dev ~90K). This factor is included in the weakest-link calculation below.

CRITICAL SCORING RULE — Weakest-Link Penalty:
After computing the weighted average of all 6 categories, apply a penalty multiplier based on the LOWEST scoring factor (including the hidden temperature factor):
  penalty = (min_score / 100) ^ 0.7
  final_score = round(weighted_average * penalty)

This means: if every category is great (90+), the penalty is mild (~0.93x). But if ANY single category is terrible (e.g. score of 2), the penalty crushes the final score (0.03x). This creates a smooth, continuous "veto" effect with NO hard cutoffs — bad values naturally drag down the total proportionally to how bad they are.

Examples to calibrate your scoring:
- Earth-like planet at 20 ly → score ~85-95
- Earth-like planet at 50,000 ly → score ~2-4 (distance drags it down)
- Jupiter-mass planet (318 M⊕) with all else perfect → score ~1-3 (atmosphere score near 0)
- Planet with mass 0.1 M⊕ → score ~5-10 (tiny core, no magnetic field, weak atmosphere)
- Planet with orbital period 0.5 days → score ~2-5 (tidal lock + orbital instability)

You MUST respond with a single, valid JSON object only. Do NOT include markdown code blocks (e.g. \\\`\\\`\\\`json) or any conversational text. Simply return the JSON raw.

The JSON object must match this schema:
{
  "score": number, // an integer from 0 to 100 (after applying weakest-link penalty)
  "breakdown": {
    "atmosphericComposition": number, // integer 0 to 100
    "magneticField": number, // integer 0 to 100
    "orbitalStability": number, // integer 0 to 100
    "starQuality": number, // integer 0 to 100
    "galacticSafety": number, // integer 0 to 100
    "distanceScore": number // integer 0 to 100
  },
  "reasoning": "string" // A concise paragraph (3-4 sentences). Mention the weakest factor and explain how it impacted the final score."
}`;

    const userPrompt = `Evaluate the following exoplanet:
Name: ${planetName}
Radius: ${radius} Earth Radii (R⊕)
Mass: ${mass} Earth Masses (M⊕)
Orbital Period: ${orbitalPeriod} Days
Host Star Type: ${starType}-type star
Equilibrium Temperature: ${equilibriumTemp} Kelvin (K)
Distance from Earth: ${distanceFromEarth} Light-years`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt
        }
      ]
    });

    // Parse Response
    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    
    // Clean JSON response (strip markdown wrappers if Claude returned them despite instructions)
    const jsonStart = responseText.indexOf("{");
    const jsonEnd = responseText.lastIndexOf("}") + 1;
    const cleanJson = responseText.substring(jsonStart, jsonEnd);
    
    const scoreResult = JSON.parse(cleanJson);
    return NextResponse.json(scoreResult);

  } catch (error) {
    console.error("ELSA ESI Scorer API error:", error);
    return NextResponse.json(
      { error: "Internal server error scoring the exoplanet." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// Smooth Simulation Scorer (no hard cutoffs — all continuous curves)
// ─────────────────────────────────────────────────────────────────
function simulateScoring(planet: PlanetInput) {
  // ── 1. Atmospheric Composition (25%) ──
  // Gaussian bell curves: ideal radius ~1.0 R⊕, ideal mass ~1.5 M⊕
  const radFactor = Math.exp(-Math.pow((planet.radius - 1.0) / 0.6, 2));
  const massFactor = Math.exp(-Math.pow((planet.mass - 1.5) / 2.5, 2));
  const atmScore = Math.max(1, Math.round(100 * radFactor * massFactor));

  // ── 2. Magnetic Field Potential (20%) ──
  // Smooth ramps: mass drives core dynamo, period drives rotation
  const coreFactor = Math.min(1, planet.mass / 0.5);         // 0→1 over 0→0.5 M⊕
  const rotFactor = Math.min(1, planet.orbitalPeriod / 15);   // 0→1 over 0→15 days
  const magScore = Math.max(1, Math.round(95 * coreFactor * rotFactor));

  // ── 3. Orbital Stability (20%) ──
  // Gaussian on log10(period), centered around ~200 days
  const logPeriod = Math.log10(Math.max(0.1, planet.orbitalPeriod));
  const idealLogPeriod = Math.log10(200);
  const orbitDev = (logPeriod - idealLogPeriod) / 1.2;
  const orbitScore = Math.max(1, Math.round(95 * Math.exp(-0.5 * orbitDev * orbitDev)));

  // ── 4. Star Quality (15%) ──
  let starScore = 50;
  if (planet.starType === "G") starScore = 100;
  else if (planet.starType === "K") starScore = 90;
  else if (planet.starType === "F") starScore = 65;
  else if (planet.starType === "M") starScore = 45;
  else if (planet.starType === "A") starScore = 20;

  // ── 5. Galactic Safety (10%) ──
  const galScore = planet.starType === "A" ? 75 : 92;

  // ── 6. Distance from Earth (10%) ──
  // Smooth exponential decay
  const distScore = Math.max(1, Math.round(100 * Math.exp(-planet.distanceFromEarth / 8000)));

  // ── Temperature Factor (hidden modifier for weakest-link) ──
  // Gaussian centered on 280K, std dev ~90K
  const tempDev = (planet.equilibriumTemp - 280) / 90;
  const tempScore = Math.max(1, Math.round(100 * Math.exp(-0.5 * tempDev * tempDev)));

  // ── Weighted Average ──
  const weighted = (atmScore * 0.25) + (magScore * 0.20) + (orbitScore * 0.20)
                  + (starScore * 0.15) + (galScore * 0.10) + (distScore * 0.10);

  // ── Weakest-Link Penalty ──
  // The lowest score across ALL factors (incl. temperature) acts as a drag.
  // penalty = (min / 100) ^ 0.7  →  smooth curve, no cliffs.
  const minScore = Math.min(atmScore, magScore, orbitScore, starScore, galScore, distScore, tempScore);
  const penalty = Math.pow(minScore / 100, 0.7);
  const finalScore = Math.max(1, Math.round(weighted * penalty));

  // ── Reasoning ──
  const factorNames: Record<string, string> = {
    atm: "Atmospheric Composition", mag: "Magnetic Field Shielding",
    orbit: "Orbital Stability", star: "Star Quality",
    gal: "Galactic Safety", dist: "Distance from Earth", temp: "Equilibrium Temperature"
  };
  const scores: Record<string, number> = {
    atm: atmScore, mag: magScore, orbit: orbitScore,
    star: starScore, gal: galScore, dist: distScore, temp: tempScore
  };
  const weakestKey = Object.entries(scores).reduce((a, b) => a[1] <= b[1] ? a : b)[0];

  let starDesc = "Sun-like G-type star";
  if (planet.starType === "K") starDesc = "stable orange K-type dwarf star";
  if (planet.starType === "M") starDesc = "flare-prone M-type red dwarf star";
  if (planet.starType === "F") starDesc = "hot F-type star";
  if (planet.starType === "A") starDesc = "volatile, short-lived A-type star";

  const reasoning = `[SIMULATION MODE] ${planet.planetName} orbits a ${starDesc}. Its weakest factor is ${factorNames[weakestKey]} (${scores[weakestKey]}%), which applied a ×${penalty.toFixed(2)} drag penalty to the weighted average of ${Math.round(weighted)}, yielding a final score of ${finalScore}/100. ${minScore < 20 ? "This critical weakness severely limits habitability prospects." : minScore < 50 ? "This moderate weakness noticeably impacts the overall rating." : "All factors are within acceptable ranges."}`;

  return {
    score: finalScore,
    breakdown: {
      atmosphericComposition: atmScore,
      magneticField: magScore,
      orbitalStability: orbitScore,
      starQuality: starScore,
      galacticSafety: galScore,
      distanceScore: distScore
    },
    reasoning
  };
}
