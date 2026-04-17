import { corsHeaders } from "../_shared/cors.ts";

interface Body {
  imageBase64: string; // data URL or raw base64
  language?: "en" | "hi";
  cropHint?: string;
}

const SCHEMA = {
  name: "diagnose_plant",
  description: "Diagnose plant disease from an image.",
  parameters: {
    type: "object",
    properties: {
      isPlant: { type: "boolean" },
      cropGuess: { type: "string" },
      healthy: { type: "boolean" },
      disease: { type: "string", description: "Disease name or 'Healthy' or 'Unknown'." },
      severity: { type: "string", enum: ["none", "mild", "moderate", "severe"] },
      confidencePercent: { type: "number" },
      symptoms: { type: "array", items: { type: "string" } },
      causes: { type: "array", items: { type: "string" } },
      organicTreatment: { type: "array", items: { type: "string" } },
      chemicalTreatment: { type: "array", items: { type: "string" } },
      prevention: { type: "array", items: { type: "string" } },
    },
    required: [
      "isPlant", "cropGuess", "healthy", "disease", "severity",
      "confidencePercent", "symptoms", "causes",
      "organicTreatment", "chemicalTreatment", "prevention",
    ],
    additionalProperties: false,
  },
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: Body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!body.imageBase64) throw new Error("imageBase64 required");

    const dataUrl = body.imageBase64.startsWith("data:")
      ? body.imageBase64
      : `data:image/jpeg;base64,${body.imageBase64}`;

    const lang = body.language === "hi" ? "Hindi (Devanagari)" : "English";
    const sys = `You are an expert plant pathologist for Indian crops. Examine the image and diagnose disease, pest or deficiency. If it is not a plant, set isPlant=false. Respond in ${lang} for all human-readable text. Disease name stays in English with local term in parentheses if useful.`;

    const userParts: any[] = [
      { type: "text", text: `Crop hint: ${body.cropHint ?? "unknown"}. Diagnose this plant.` },
      { type: "image_url", image_url: { url: dataUrl } },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userParts },
        ],
        tools: [{ type: "function", function: SCHEMA }],
        tool_choice: { type: "function", function: { name: "diagnose_plant" } },
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "payment_required" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      throw new Error(`AI gateway error ${res.status}`);
    }

    const data = await res.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No structured output");
    const parsed = JSON.parse(args);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("disease-detect error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
