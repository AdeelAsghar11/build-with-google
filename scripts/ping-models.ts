import { GoogleGenAI } from "@google/genai";

/**
 * Ping role models and list available models from Gemini API.
 */
async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment.");
    process.exit(1);
  }

  console.log("Connecting to Gemini API...");
  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log("Listing available models...");
    const modelsResponse = await ai.models.list();
    console.log("Models retrieved successfully:");
    // Print models
    for await (const model of modelsResponse) {
      if (model.name?.includes("gemini") || model.name?.includes("gemma")) {
        console.log(`- ${model.name} (${model.displayName ?? "No display name"})`);
      }
    }
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

if (require.main === module) {
  main();
}
