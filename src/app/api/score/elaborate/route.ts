import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PlanetInput, ScoreResult } from "@/types/elsa";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const { planet, scoreResult } = await request.json() as {
      planet: PlanetInput;
      scoreResult: ScoreResult;
    };

    if (!planet || !scoreResult) {
      return NextResponse.json(
        { error: "Missing required planet input or previous score results." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isMockKey = !apiKey || apiKey === "your_gemini_key_here" || !apiKey.startsWith("AIza");

    if (isMockKey) {
      return NextResponse.json({
        text: `### 🪐 Astrobiological Expansion Report: ${planet.planetName} (fallback simulation mode)
        
Because a valid Google Gemini API Key was not detected, this deep elaboration is simulated.
- **Physical Dynamics**: With a radius of ${planet.radius} R⊕ and mass of ${planet.mass} M⊕, the surface gravity is estimated at ${planet.mass / (planet.radius * planet.radius || 1)} times Earth's. ${planet.radius > 5 ? "At this size, the planet would possess an immensely thick and crushing gas envelope, making surface operations impossible." : "This size could potentially host a rocky surface if internal mantle heat is sufficient."}
- **Climatological profile**: Orbiting a ${planet.starType}-type star with a period of ${planet.orbitalPeriod} days at an equilibrium temp of ${planet.equilibriumTemp} K. ${planet.equilibriumTemp < 150 ? "The extreme cold freezes any surface liquid water, creating a cryosphere." : planet.equilibriumTemp > 373 ? "High temperatures would vaporize liquid water completely." : "The temperature allows for potential habitable zones where liquid water could remain stable under adequate atmospheric pressure."}
- **Technological Challenges**: Survival on this world would require advanced colonization modules, artificial atmosphere creation, and shielding depending on host star type and flaring behaviors.`
      });
    }

    // Format gas info for the prompt
    const gases = planet.atmosphericGases;
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

    const systemInstruction = `You are ELSA (ExoLife Score AI), an expert astrobiologist and planetary habitability scientist.
You have already scored the exoplanet ${planet.planetName} with a score of ${scoreResult.score}/100.
The user is requesting an elaborate, in-depth, multi-paragraph scientific analysis of this exoplanet based on its parameters.
Provide a comprehensive astrobiological report detailing:
1. Planetary Physics & Composition: Discuss the gravity, core dynamics, and atmospheric envelope implied by its mass and radius.
2. Climatological & Orbital Dynamics: Detail how the orbital period, host star class (${planet.starType}), and axial tilt (${planet.axialTilt ?? "unknown"}°) shape its long-term climate, thermal stability, and seasonal variation.
3. Magnetosphere & Biosphere Suitability: Assess core heating, magnetic shielding potential, solar wind vulnerability, and the prospects for biochemical pathways (especially liquid water and metabolic cycles).
4. Technological Blueprint: Detail the exact colonization technologies (e.g., dome pressurization, geothermal drilling, radiation shielding, biosafety measures) needed for survival.

Keep your response structured, utilizing clear Markdown headers (###), bullet points, and highly educational, professional astrobiological terminology. Use a captivating, scientific, yet engaging tone.`;

    const userPrompt = `Generate a deep-dive, elaborate habitability report for:
Planet: ${planet.planetName}
Score: ${scoreResult.score}/100
Atmospheric Presence Score: ${scoreResult.breakdown.atmosphericPresence}% (Gases: ${gasString})
Temperature Score: ${scoreResult.breakdown.temperatureScore}% (${planet.equilibriumTemp} K)
Surface Suitability Score: ${scoreResult.breakdown.surfaceSuitability}% (Radius: ${planet.radius} R⊕, Mass: ${planet.mass} M⊕)
Climate Score: ${scoreResult.breakdown.climateStability}% (Tilt: ${planet.axialTilt ?? "unknown"}°)
Magnetic Field Score: ${scoreResult.breakdown.magneticField}%
Star Quality Score: ${scoreResult.breakdown.starQuality}% (${planet.starType}-type star, Age: ${planet.starAge ?? "unknown"} Gyr)
Orbital Stability Score: ${scoreResult.breakdown.orbitalStability}% (Period: ${planet.orbitalPeriod} days)
Galactic Safety Score: ${scoreResult.breakdown.galacticSafety}% (Galactic Distance: ${planet.galacticDistance ?? "unknown"} kpc)
System Architecture Score: ${scoreResult.breakdown.systemArchitecture}% (Jupiter Shield: ${planet.hasJupiterProtector ? "Yes" : "No"}, Large Moon: ${planet.hasMoon ? "Yes" : "No"})
Distance Score: ${scoreResult.breakdown.distanceScore}% (${planet.distanceFromEarth} ly)
${planet.extraInfo ? `Additional Context Notes: ${planet.extraInfo}` : ""}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemInstruction + "\n\n" + userPrompt }] }
        ]
      });

      return NextResponse.json({ text: response.text || "" });
    } catch (apiError) {
      console.warn("Gemini API call failed for elaborate analysis, falling back to simulation:", apiError);
      return NextResponse.json({
        text: `### 🪐 Astrobiological Expansion Report: ${planet.planetName} (simulation fallback)
        
*Note: The Gemini API request could not be completed, so a high-fidelity local astrobiology analysis was generated.*

- **Planetary Physics & Composition**: With a radius of ${planet.radius} R⊕ and mass of ${planet.mass} M⊕, the surface gravity is estimated at ${(planet.mass / (planet.radius * planet.radius || 1)).toFixed(2)} times Earth's. ${planet.radius > 3.0 ? "At this size, the planet would possess an extremely thick and crushing gas envelope, making surface operations impossible." : "This size could potentially host a rocky surface if internal mantle heat is sufficient."}
- **Atmospheric Mechanics & Chemistry**: With an atmospheric presence rating of ${scoreResult.breakdown.atmosphericPresence}%, this planet possesses ${planet.atmosphericGases?.oxygen ? "detectable oxygen (O₂)" : "no detectable oxygen"}. ${planet.atmosphericGases?.water ? "Water vapor was detected, indicating potential hydrological cycles if temperature and pressure allow." : "The absence of water vapor limits options for organic carbon-based biology."}
- **Climatological profile**: Orbiting a ${planet.starType}-type star with a period of ${planet.orbitalPeriod} days at an equilibrium temp of ${planet.equilibriumTemp} K. ${planet.equilibriumTemp < 150 ? "The extreme cold freezes any surface liquid water, creating a cryosphere." : planet.equilibriumTemp > 373 ? "High temperatures would vaporize liquid water completely." : "The temperature allows for potential habitable zones where liquid water could remain stable under adequate atmospheric pressure."}
- **Structural protection**: The magnetic field potential is rated at ${scoreResult.breakdown.magneticField}%. ${scoreResult.breakdown.magneticField > 50 ? "A moderate-to-strong dynamo provides shielding from solar winds and cosmic rays." : "Weak magnetic shielding exposes the atmosphere to stripping and the surface to intense UV radiation."}
- **Technological Challenges**: Survival on this world would require advanced colonization modules, artificial atmosphere creation, and shielding depending on host star type and flaring behaviors.`
      });
    }

  } catch (error) {
    console.error("Elaborate Scoring API Error:", error);
    return NextResponse.json(
      { error: "Internal server error generating elaborate analysis." },
      { status: 500 }
    );
  }
}
