import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert landing page designer. You generate complete, single-file HTML landing pages.

RULES:
- Output ONLY the raw HTML document. No markdown fences, no explanations, no commentary.
- Start with <!DOCTYPE html> and end with </html>.
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Use Google Fonts via <link> tags. Pick distinctive, modern fonts that match the brief.
- Make it visually stunning: gradients, generous spacing, bold typography, smooth hover states.
- Fully responsive (mobile-first).
- Include semantic sections: hero, features/benefits, social proof or testimonials, CTA, footer.
- Use real-looking copy tailored to the brief, not Lorem ipsum.
- For images, use high-quality, relevant https://images.unsplash.com/... URLs for EVERY section that needs an image (hero, features, etc.). Ensure EVERY "box" or section has a descriptive, high-quality image.
- Use inline SVG for icons.
- Add subtle CSS animations where they enhance the design.
- The page must work standalone in any browser.

When the user asks you to EDIT an existing page, return the FULL updated HTML document, never a diff.`;

function randomId(len = 10) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

function extractHtml(text: string): string {
  // Strip markdown code fences if the model added them anyway.
  const fence = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  const raw = (fence ? fence[1] : text).trim();
  const start = raw.search(/<!DOCTYPE|<html/i);
  if (start > 0) return raw.slice(start);
  return raw;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const body = await req.json();
    const pageId: string | undefined = body.pageId;
    const userMessage: string = (body.message ?? "").toString().trim();

    if (!userMessage) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (userMessage.length > 4000) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check tokens
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("tokens_remaining, last_token_reset, is_admin")
      .eq("id", user.id)
      .single();
    
    if (profileErr) throw profileErr;

    let tokens = profile.tokens_remaining;
    const lastReset = new Date(profile.last_token_reset);
    const now = new Date();
    
    // Reset tokens if a day has passed
    if (now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000) {
      tokens = 20;
      await supabase
        .from("profiles")
        .update({ tokens_remaining: 20, last_token_reset: now.toISOString() })
        .eq("id", user.id);
    }

    if (tokens <= 0 && !profile.is_admin) {
      return new Response(JSON.stringify({ error: "Daily token limit reached (20 websites/day)" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load existing page if editing
    type ExistingPage = {
      id: string;
      html: string;
      prompt: string;
      messages: Array<{ role: string; content: string }>;
      user_id: string;
    };
    let existing: ExistingPage | null = null;

    if (pageId) {
      const { data, error } = await supabase
        .from("pages")
        .select("id, html, prompt, messages, user_id")
        .eq("id", pageId)
        .maybeSingle();
      if (error) throw error;
      existing = (data ?? null) as ExistingPage | null;

      if (existing && existing.user_id !== user.id && !profile.is_admin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const conversation: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (existing) {
      conversation.push({
        role: "user",
        content: `Original brief: ${existing.prompt}`,
      });
      conversation.push({
        role: "assistant",
        content: existing.html,
      });
      // Replay prior chat turns (skip the original brief which we already inserted)
      const prior = (existing.messages ?? []).slice(1);
      for (const m of prior) {
        conversation.push({ role: m.role, content: m.content });
      }
      conversation.push({
        role: "user",
        content: `Apply this change and return the full updated HTML page:\n\n${userMessage}`,
      });
    } else {
      conversation.push({
        role: "user",
        content: `Build a landing page for the following brief. Return ONLY the full HTML document.\n\nBrief: ${userMessage}`,
      });
    }

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: conversation,
        }),
      },
    );

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit reached. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "AI credits exhausted. Add credits at Settings → Workspace → Usage.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const aiJson = await aiResp.json();
    const rawContent: string = aiJson.choices?.[0]?.message?.content ?? "";
    const html = extractHtml(rawContent);

    // Decrement tokens
    if (!profile.is_admin) {
      await supabase
        .from("profiles")
        .update({ tokens_remaining: tokens - 1 })
        .eq("id", user.id);
    }

    if (!html || !/<html/i.test(html)) {
      console.error("Invalid HTML from model:", rawContent.slice(0, 500));
      return new Response(
        JSON.stringify({
          error: "The AI returned an invalid page. Try rephrasing your prompt.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const newAssistantMsg = existing
      ? `Updated the page: "${userMessage.slice(0, 80)}${userMessage.length > 80 ? "…" : ""}"`
      : `Created your landing page based on: "${userMessage.slice(0, 80)}${userMessage.length > 80 ? "…" : ""}"`;

    if (existing) {
      const updatedMessages = [
        ...(existing.messages ?? []),
        { role: "user", content: userMessage },
        { role: "assistant", content: newAssistantMsg, html, ts: new Date().toISOString() },
      ];
      const { error: updErr } = await supabase
        .from("pages")
        .update({
          html,
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (updErr) throw updErr;

      return new Response(
        JSON.stringify({
          pageId: existing.id,
          html,
          assistantMessage: newAssistantMsg,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create new page
    let newId = randomId();
    // unique-ish; retry once if we somehow collide
    {
      const { data: clash } = await supabase
        .from("pages")
        .select("id")
        .eq("id", newId)
        .maybeSingle();
      if (clash) newId = randomId(12);
    }

    const initialMessages = [
      { role: "user", content: userMessage },
      { role: "assistant", content: newAssistantMsg, html, ts: new Date().toISOString() },
    ];

    const { error: insErr } = await supabase.from("pages").insert({
      id: newId,
      html,
      prompt: userMessage,
      messages: initialMessages,
      user_id: user.id,
    });
    if (insErr) throw insErr;

    return new Response(
      JSON.stringify({
        pageId: newId,
        html,
        assistantMessage: newAssistantMsg,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-page error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});