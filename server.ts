/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { generateOfflineItinerary } from "./src/fallbackGenerator.ts";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  /**
   * Endpoint to generate AI itineraries.
   * If the GEMINI_API_KEY environment variable is missing, incomplete, or fails,
   * it falls back to the deterministic local engine.
   */
  app.post("/api/generate-itinerary", async (req, res) => {
    const { destination, days, travelers, budgetInINR, interests, language } = req.body;

    // Validate inputs
    if (!destination || typeof destination !== "string" || destination.trim() === "") {
      return res.status(400).json({ error: "Destination is required and must be a non-empty string." });
    }
    const daysNum = Number(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 15) {
      return res.status(400).json({ error: "Number of days must be a valid number between 1 and 15." });
    }
    const travelersNum = Number(travelers);
    if (isNaN(travelersNum) || travelersNum < 1 || travelersNum > 50) {
      return res.status(400).json({ error: "Number of travelers must be a valid number between 1 and 50." });
    }
    const budgetNum = Number(budgetInINR);
    if (isNaN(budgetNum) || budgetNum < 1000) {
      return res.status(400).json({ error: "Trip budget must be at least ₹1,000 INR." });
    }

    const normInterests = Array.isArray(interests) ? interests : ["Sightseeing"];
    const normLanguage = typeof language === "string" ? language : "English";

    const apiKey = process.env.GEMINI_API_KEY;
    const isPlaceholder = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "";

    if (isPlaceholder) {
      console.log("[TravelMate Server] Running on Offline Expert Mode (No API key found).");
      const offlineItinerary = generateOfflineItinerary(
        destination,
        daysNum,
        travelersNum,
        budgetNum,
        normInterests,
        normLanguage
      );
      return res.json({
        itinerary: offlineItinerary,
        source: "Offline Expert Engine",
        message: "Generated instantly using our pre-compiled travel templates (Offline Mode)."
      });
    }

    try {
      console.log(`[TravelMate Server] Initiating AI itinerary generation for ${destination} using Gemini 3.8 Flash.`);
      
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Constructing prompt with specific parameters to ensure tailored response
      const userPrompt = `Generate a detailed, premium, customized day-by-day travel itinerary for ${destination} for ${daysNum} days.
Number of travelers: ${travelersNum}.
Estimated maximum budget in Indian Rupees (INR): ${budgetNum} INR.
Specific traveler interests to satisfy: ${normInterests.join(", ")}.
Output Preferred Language: ${normLanguage}.

The response MUST strictly conform to the expected responseSchema structure. Make sure estimated expenses are calculated dynamically and sum up logically close to the desired budget. Include specific places to visit, daytime activities, regional food recommendations (e.g. breakfast, lunch, dinner spots), detailed packing checklist, and local survival travel tips.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: userPrompt,
        config: {
          systemInstruction: "You are TravelMate AI, a professional tourist guide and travel planner. You generate clear, readable itineraries that highlight specific local destinations, cultural insights, local culinary venues, transit options, and packing guidelines. All budget values and costs MUST be in Indian Rupees (INR). Return your response strictly in the requested JSON schema. Do not output anything outside of the JSON object.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              destination: { type: Type.STRING, description: "Capitalized full name of the destination" },
              totalDays: { type: Type.INTEGER },
              travelers: { type: Type.INTEGER },
              budgetInINR: { type: Type.INTEGER },
              days: {
                type: Type.ARRAY,
                description: "Array of daily programs, matching totalDays length exactly",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    theme: { type: Type.STRING, description: "Daily theme, e.g. Exploring Historic Forts" },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING, description: "e.g., Morning, 10:30 AM, Sunset" },
                          placeName: { type: Type.STRING, description: "The specific tourist spot" },
                          description: { type: Type.STRING, description: "Compelling activity summary" },
                          costInINR: { type: Type.INTEGER, description: "Estimated entry fee or ticket cost in INR per traveler" }
                        },
                        required: ["time", "placeName", "description", "costInINR"]
                      }
                    },
                    foodRecommendations: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          meal: { type: Type.STRING, description: "Breakfast, Lunch, Dinner, or Snacks" },
                          placeSuggestion: { type: Type.STRING, description: "Local restaurant or cafe name" },
                          dishDescription: { type: Type.STRING, description: "Local specialty dish recommendation" },
                          estimatedCostInINR: { type: Type.INTEGER, description: "Estimated expense per person in INR" }
                        },
                        required: ["meal", "placeSuggestion", "dishDescription", "estimatedCostInINR"]
                      }
                    }
                  },
                  required: ["dayNumber", "theme", "activities", "foodRecommendations"]
                }
              },
              estimatedTotalExpense: { type: Type.INTEGER, description: "Calculated sum of all expected trip expenditures (hotels, tickets, food, transit) in INR" },
              expenseBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, description: "e.g. Accommodation, Diners, Cab & Local Transit, Sightseeing Entry, Shopping & Contingency" },
                    amountInINR: { type: Type.INTEGER }
                  },
                  required: ["category", "amountInINR"]
                }
              },
              packingChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 6-8 specific items to carry"
              },
              travelTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 4 helpful local guidelines or phrases"
              }
            },
            required: [
              "destination",
              "totalDays",
              "travelers",
              "budgetInINR",
              "days",
              "estimatedTotalExpense",
              "expenseBreakdown",
              "packingChecklist",
              "travelTips"
            ]
          }
        }
      });

      const jsonStr = response.text?.trim();
      if (!jsonStr) {
        throw new Error("Received empty text output from Gemini API.");
      }

      const parsed = JSON.parse(jsonStr);

      // standardise output structure
      const finalItinerary = {
        id: "gemini-" + Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        interests: normInterests,
        language: normLanguage,
        ...parsed
      };

      console.log(`[TravelMate Server] Successfully generated AI itinerary for ${destination}.`);
      return res.json({
        itinerary: finalItinerary,
        source: "Gemini 3.8 Flash AI",
        message: "Successfully generated by Gemini 3.8 Flash with structured JSON schema."
      });

    } catch (apiError: any) {
      console.error("[TravelMate Server] Gemini API call failed. Falling back to local engine.", apiError);
      const offlineItinerary = generateOfflineItinerary(
        destination,
        daysNum,
        travelersNum,
        budgetNum,
        normInterests,
        normLanguage
      );
      return res.json({
        itinerary: offlineItinerary,
        source: "Offline Expert Engine (Fallback)",
        message: "Cloud AI was temporarily busy. Safely generated using local pre-compiled expert knowledge."
      });
    }
  });

  // Integrate Vite for single-page app loading or static assets
  if (process.env.NODE_ENV !== "production") {
    console.log("[TravelMate Server] Mounting Vite Dev Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[TravelMate Server] Serving static build files from dist/...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TravelMate Server] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("[TravelMate Server] Master boot procedure failed:", error);
});
