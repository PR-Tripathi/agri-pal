import { corsHeaders } from "../_shared/cors.ts";
import { languageName } from "../_shared/lang.ts";

interface Msg { role: "user" | "assistant"; content: string }
interface Body { messages: Msg[]; language?: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: Body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const lang = languageName(body.language);
    const system = `You are KrishiMitra (कृषि मित्र), a warm, practical AI assistant for Indian farmers. Always reply in ${lang}. Use simple words a smallholder farmer would understand. Cover crops, soil, water, pests, fertilizer, weather, market prices, government schemes. Keep answers short (3-6 sentences) unless asked for detail. Use bullet points when listing steps. Never invent numbers — say "approximately" when uncertain.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: system }, ...body.messages],
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
    if (!res.ok || !res.body) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      throw new Error(`AI gateway error ${res.status}`);
    }

    return new Response(res.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("assistant-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
