export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/analyze-image" && request.method === "POST") {
      return analyzeImage(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};

async function analyzeImage(request, env) {
  if (!env.OPENAI_API_KEY) {
    return json({ error: "OPENAI_API_KEY Worker secret is not configured." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request must be JSON." }, 400);
  }

  const imageDataUrl = String(body.imageDataUrl || "");
  const mimeType = String(body.mimeType || "");
  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(mimeType)) {
    return json({ error: "Use a JPEG, PNG, or WEBP image." }, 400);
  }
  if (!imageDataUrl.startsWith("data:image/")) {
    return json({ error: "Missing image data URL." }, 400);
  }
  const base64 = imageDataUrl.split(",")[1] || "";
  const bytes = Math.ceil((base64.length * 3) / 4);
  if (bytes > 5 * 1024 * 1024) {
    return json({ error: "Image must be 5 MB or smaller." }, 413);
  }

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [{
        role: "user",
        content: [
          {
            type: "input_text",
            text: `You are helping a family road trip learning hub. Profile: ${body.profile || "family"}. Context: ${body.tripContext || "Bois Blanc Island trip"}. Return concise JSON. Make it useful for a family road trip photo card, not generic image captioning.`
          },
          { type: "input_image", image_url: imageDataUrl }
        ]
      }],
      text: {
        format: {
          type: "json_schema",
          name: "trip_photo_analysis",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              likelySubject: { type: "string" },
              whyItMatters: { type: "string" },
              tripConnection: { type: "string" },
              forKids: { type: "string" },
              funFact: { type: "string" },
              childFriendlyFact: { type: "string" },
              questions: { type: "array", items: { type: "string" } },
              tags: { type: "array", items: { type: "string" } },
              confidence: { type: "number" }
            },
            required: ["summary", "likelySubject", "whyItMatters", "tripConnection", "forKids", "funFact", "childFriendlyFact", "questions", "tags", "confidence"]
          }
        }
      }
    })
  });

  const payload = await openAiResponse.json().catch(() => ({}));
  if (!openAiResponse.ok) {
    return json({ error: payload.error?.message || "OpenAI image analysis failed." }, openAiResponse.status);
  }

  const text = payload.output_text || payload.output?.flatMap((item) => item.content || []).find((part) => part.type === "output_text")?.text;
  try {
    return json(JSON.parse(text));
  } catch {
    return json({ error: "OpenAI returned an unexpected response.", raw: text || "" }, 502);
  }
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
