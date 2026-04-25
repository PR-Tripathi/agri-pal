import { corsHeaders } from "../_shared/cors.ts";
import { languageName } from "../_shared/lang.ts";

interface Body {
  language?: string;
  location?: { lat: number; lon: number; name?: string };
  soil?: {
    ph?: number;
    moisture?: number;
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    soilType?: string;
    organicCarbon?: number;
  };
  weather?: {
    tempC?: number;
    rainfallMm?: number;
    humidity?: number;
    forecastSummary?: string;
  };
  season?: string;
  landSizeAcres?: number;
}

const SCHEMA = {
  name: "recommend_crops",
  description: "Recommend the best crops for the farmer with profit and sustainability scoring.",
  parameters: {
    type: "object",
    properties: {
      summary: { type: "string", description: "1-2 sentence overall summary in the requested language." },
      crops: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            localName: { type: "string", description: "Name in requested language" },
            suitabilityPercent: { type: "number" },
            estimatedYieldKgPerHectare: { type: "number" },
            estimatedProfitPerAcreInr: { type: "number" },
            sustainabilityScore: { type: "number", description: "0-100" },
            waterNeed: { type: "string", enum: ["low", "medium", "high"] },
            growthDurationDays: { type: "number" },
            reasons: { type: "array", items: { type: "string" } },
            tips: { type: "array", items: { type: "string" } },
          },
          required: [
            "name", "localName", "suitabilityPercent",
            "estimatedYieldKgPerHectare", "estimatedProfitPerAcreInr",
            "sustainabilityScore", "waterNeed", "growthDurationDays",
            "reasons", "tips",
          ],
          additionalProperties: false,
        },
      },
    },
    required: ["summary", "crops"],
    additionalProperties: false,
  },
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: Body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const lang = languageName(body.language);
    const sys = `You are KrishiMitra, an expert agronomist for Indian farmers. Recommend crops grounded in the provided soil, weather, location and season. Estimate realistic yields and profits in INR using typical Indian mandi prices. Sustainability considers water use, soil health and chemical input. Respond in ${lang} for all human-readable text fields (summary, localName, reasons, tips). Crop "name" stays in English.`;

    const userPrompt = `Farmer context:\n${JSON.stringify(body, null, 2)}\n\nReturn 3-5 best-fit crops.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [{ type: "function", function: SCHEMA }],
        tool_choice: { type: "function", function: { name: "recommend_crops" } },
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
    console.error("crop-recommend error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
