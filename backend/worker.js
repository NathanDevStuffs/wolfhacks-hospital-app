const ALLOWED_ORIGINS = [
  "http://localhost",
  "http://127.0.0.1",
  "https://nathandevstuffs.github.io"
  // "https://yourdomain.com",  ← uncomment and set when you go live
];

function getCorsHeaders(origin) {
  const allowed =
    !origin ||
    ALLOWED_ORIGINS.some(
      (o) => origin === o || origin.startsWith(o + ":")
    );

  return {
    "Access-Control-Allow-Origin": allowed ? origin || "*" : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const corsHeaders = getCorsHeaders(origin);

    // ── Handle CORS pre-flight ─────────────────────────────────────────────
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // ── Only accept POST to /api/chat ──────────────────────────────────────
    if (request.method !== "POST" || url.pathname !== "/api/chat") {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Read and validate body ─────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Safety: strip any client-supplied model overrides if you want ──────
    // body.model = "z-ai/glm-4.5-air:free"; // uncomment to lock the model

    // ── Forward to OpenRouter ──────────────────────────────────────────────
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENROUTER_KEY}`,
        "Content-Type": "application/json",
        // Optional: tells OpenRouter which site is using the key (good practice)
        "HTTP-Referer": "https://priora.care",
        "X-Title": "PrioraCare",
      },
      body: JSON.stringify(body),
    });

    // ── Stream the response straight back to the browser ──────────────────
    const responseHeaders = {
      ...corsHeaders,
      "Content-Type": upstream.headers.get("Content-Type") || "text/event-stream",
    };

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  },
};