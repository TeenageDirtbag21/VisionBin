import { getClient, PROMPT_INSTRUCTION, wasteSchema } from "./_lib/gemini";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { images, userApiKey } = req.body || {}; // images:Array<{imageBase64, mimeType}>

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

    return res.status(200).json({
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
}
