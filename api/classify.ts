import { getClient, PROMPT_INSTRUCTION, wasteSchema, parseBody } from "./_lib/gemini";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const body = parseBody(req);
    const { imageBase64, mimeType, userApiKey } = body || {};

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
      text: PROMPT_INSTRUCTION,
    };

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: wasteSchema,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini API");
    }

    const parsed = JSON.parse(text.trim());
    return res.status(200).json(parsed);

  } catch (error: any) {
    console.error("Classification error:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to analyze image with Gemini AI" 
    });
  }
}
