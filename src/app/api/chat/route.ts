import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages array." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_key_here" || !apiKey.startsWith("AIza")) {
      return NextResponse.json(
        { error: "API key is not configured properly." },
        { status: 500 }
      );
    }

    const systemInstruction = `You are an expert AI assistant specializing in Astrometry, Exoplanetary Science, and Astrobiology. 
Your goal is to answer the user's questions about space, habitability, exoplanet classification, stars, and astrometry.
Keep your answers educational, engaging, and scientifically accurate. Use formatting like bullet points or bold text where appropriate to make it readable.
Do not answer questions completely unrelated to space, science, or technology. Instead, gently redirect the conversation back to astrometry.`;

    // Map the messages to the format expected by the @google/genai SDK
    // The history excludes the last message, which we will pass as the new input
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
      },
      history: history,
    });

    const response = await chat.sendMessage({
      message: lastMessage.content
    });

    return NextResponse.json({ text: response.text });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal server error connecting to the chat service." },
      { status: 500 }
    );
  }
}
