import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const apiKey = process.env.GEMINI_API_KEY;

export const wasteSchema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: "Must be exactly one of: 'Wet/Organic', 'Dry/Recyclable', 'Hazardous', 'E-Waste', 'Medical/Biomedical', 'Non-Recyclable'"
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence rating as a decimal between 0.40 and 1.00"
    },
    detected_items: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Materials or objects detected"
    },
    reasoning: {
      type: Type.STRING,
      description: "Detailed, single-sentence explanation explaining the classification choice"
    },
    composition: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Component material Description" },
          percentage: { type: Type.NUMBER, description: "Approximated integer percentage of this material from 0 to 100" }
        },
        required: ["name", "percentage"]
      },
      description: "Approximated material composition details summing up to 100%"
    },
    recyclability: {
      type: Type.STRING,
      description: "Must be exactly one of: 'High', 'Medium', 'Low', 'Not Recyclable'"
    },
    decomposition_time: {
      type: Type.STRING,
      description: "Estimation of time taken to naturally decompose in a landfill (e.g. '10-20 years', '450 years', '2-4 weeks', 'Indefinite')"
    },
    environmental_risk: {
      type: Type.STRING,
      description: "Risk rating. Must be exactly one of: 'Low', 'Medium', 'High', 'Critical'"
    },
    sustainability_score: {
      type: Type.NUMBER,
      description: "An eco-friendliness score between 0 and 100 based on its material foot-print and circularity potential"
    },
    reuse_ideas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 3 distinct, creative, actionable upcycling/reuse ideas for this item before parting with it"
    },
    local_disposal_note: {
      type: Type.STRING,
      description: "India-focused disposal tip detailing municipal color-coded bin categories (Green/Blue/Yellow) or organizations (Karo Sambhav, BBMP, Swachh Bharat, etc.)"
    }
  },
  required: [
    "category", 
    "confidence", 
    "detected_items", 
    "reasoning", 
    "composition", 
    "recyclability", 
    "decomposition_time", 
    "environmental_risk", 
    "sustainability_score", 
    "reuse_ideas", 
    "local_disposal_note"
  ]
};

export const PROMPT_INSTRUCTION = `You are a professional waste classification intelligence. Analyze this image to identify any objects and classify them into exactly one of these six specific household waste bins: 'Wet/Organic', 'Dry/Recyclable', 'Hazardous', 'E-Waste', 'Medical/Biomedical', 'Non-Recyclable'. 

Also estimate:
1. The material composition (main and secondary materials with approximate percentages summing to 100%).
2. Recyclability rating ('High', 'Medium', 'Low', or 'Not Recyclable').
3. How long it takes to naturally decompose in a landfill.
4. Environmental risk level ('Low', 'Medium', 'High', or 'Critical').
5. A sustainability score from 0 to 100 (higher means more eco-friendly disposal and material footprint).
6. Exactly 3 practical, action-driven reuse or upcycling ideas for this item before discarding.
7. A brief India-specific local disposal note mentioning bin colours used in Indian municipalities (or specific organisations like Karo Sambhav, Swachh Bharat, local kabadiwalas, etc.).` +
` If the image does not show any clear waste item, or is completely unrelated, return 'Non-Recyclable' with a lower confidence score (e.g. 0.45), brief negative reasoning, and indicate 'unrecognized object' or 'unclear entity' in the detected items.`;

export function getClient(userApiKey?: string) {
  const activeKey = userApiKey?.trim() || apiKey;
  if (!activeKey) {
    throw new Error("No Gemini API key found. Please configure GEMINI_API_KEY in secrets or enter a custom key in the setup section.");
  }
  return new GoogleGenAI({
    apiKey: activeKey,
    httpOptions: {
      headers: {
        'User-Agent': userApiKey?.trim() ? 'aistudio-build-custom' : 'aistudio-build',
      }
    }
  });
}
