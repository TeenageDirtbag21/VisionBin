import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Configure body-parser to accept larger JSON payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const apiKey = process.env.GEMINI_API_KEY;
const defaultClient = new GoogleGenAI({
  apiKey: apiKey || "temp_or_empty_key",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Reuse schema helper for Gemini structured outputs
const wasteSchema = {
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

const PROMPT_INSTRUCTION = `You are a professional waste classification intelligence. Analyze this image to identify any objects and classify them into exactly one of these six specific household waste bins: 'Wet/Organic', 'Dry/Recyclable', 'Hazardous', 'E-Waste', 'Medical/Biomedical', 'Non-Recyclable'. 

Also estimate:
1. The material composition (main and secondary materials with approximate percentages summing to 100%).
2. Recyclability rating ('High', 'Medium', 'Low', or 'Not Recyclable').
3. How long it takes to naturally decompose in a landfill.
4. Environmental risk level ('Low', 'Medium', 'High', or 'Critical').
5. A sustainability score from 0 to 100 (higher means more eco-friendly disposal and material footprint).
6. Exactly 3 practical, action-driven reuse or upcycling ideas for this item before discarding.
7. A brief India-specific local disposal note mentioning bin colours used in Indian municipalities (or specific organisations like Karo Sambhav, Swachh Bharat, local kabadiwalas, etc.).` +
` If the image does not show any clear waste item, or is completely unrelated, return 'Non-Recyclable' with a lower confidence score (e.g. 0.45), brief negative reasoning, and indicate 'unrecognized object' or 'unclear entity' in the detected items.`;

// Helper to get client
function getClient(userApiKey?: string) {
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

// Single classify API
app.post("/api/classify", async (req, res) => {
  try {
    const { imageBase64, mimeType, userApiKey } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image data" });
    }

    const client = getClient(userApiKey);

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64,
      },
    };

    const textPart = {
      text: PROMPT_INSTRUCTION
    };

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: wasteSchema,
        temperature: 0.1,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini API");
    }

    const parsed = JSON.parse(text.trim());
    return res.json(parsed);

  } catch (error: any) {
    console.error("Classification error:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to analyze image with Gemini AI" 
    });
  }
});

// Multi batch classify API
app.post("/api/classify-batch", async (req, res) => {
  try {
    const { images, userApiKey } = req.body; // images:Array<{imageBase64, mimeType}>

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Missing images array" });
    }

    const client = getClient(userApiKey);

    const classifyOne = async (item: { imageBase64: string; mimeType: string }, index: number) => {
      try {
        const imagePart = {
          inlineData: {
            mimeType: item.mimeType || "image/jpeg",
            data: item.imageBase64,
          },
        };

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: { parts: [imagePart, { text: PROMPT_INSTRUCTION }] },
          config: {
            responseMimeType: "application/json",
            responseSchema: wasteSchema,
            temperature: 0.1,
          }
        });

        const text = response.text;
        if (!text) throw new Error(`Empty response for item ${index}`);
        return JSON.parse(text.trim());

      } catch (err: any) {
        console.error(`Error classifying batch item ${index}:`, err);
        return {
          category: "Non-Recyclable",
          confidence: 0.40,
          detected_items: ["Item identification failed"],
          reasoning: `Analysis failed: ${err.message}`,
          composition: [{ name: "Unrecognized Materials", percentage: 100 }],
          recyclability: "Not Recyclable",
          decomposition_time: "Unknown",
          environmental_risk: "Critical",
          sustainability_score: 10,
          reuse_ideas: [
            "Consult local municipal waste guides",
            "Handle with standard safety precautions",
            "Try scanning again with better lighting"
          ],
          local_disposal_note: "Dispose in general refuse bin due to scan failure."
        };
      }
    };

    // Run all classifications in parallel
    const results = await Promise.all(images.map((item: any, i: number) => classifyOne(item, i)));

    // Build summary from results
    const summary: Record<string, number> = {};
    results.forEach((parsed: any) => {
      const cat = parsed.category || "Non-Recyclable";
      summary[cat] = (summary[cat] || 0) + 1;
    });

    return res.json({
      results,
      summary,
      totalItems: images.length
    });

  } catch (error: any) {
    console.error("Batch classification error:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to analyze batch images with Gemini AI" 
    });
  }
});

const isVercel = process.env.VERCEL === "1" || !!process.env.NOW_REGION;

// Configure Vite or Serve static built content
async function setupRouting() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

if (!isVercel) {
  setupRouting();
}

export default app;
