import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Plan = "free" | "pro";

const SYSTEM_PROMPT = `You are an expert website designer. You generate complete, multi-page websites as a single-file HTML app.

RULES:
- Output ONLY the raw HTML document. No markdown fences, no explanations, no commentary.
- Start with <!DOCTYPE html> and end with </html>.
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Use distinctive Google Fonts via <link> tags (avoid generic defaults).
- Build a REAL website, not a single long one-page site.
  - Include a top navigation with 4–7 pages (e.g. Home, About, Services, Pricing, Blog, Contact — pick what fits).
  - Implement client-side hash routing (location.hash) to switch pages without reloading.
  - Each page should have its own hero + supporting sections (not just one shared hero).
- No external images. Use gradient backgrounds and/or inline SVG illustrations for visuals.
- Make it visually strong: deliberate typography, spacing, subtle shadows/borders, hover states.
- Fully responsive (mobile-first) and accessible (semantic tags, focus styles).
- Add subtle CSS animations where they enhance the design.
- The website must work standalone in any browser.

When the user asks you to EDIT an existing website, return the FULL updated HTML document, never a diff.`;

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

function addDays(d: Date, days: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

async function getActor(
  supabase: ReturnType<typeof createClient>,
  req: Request,
  guestIdFromBody: unknown,
): Promise<
  | {
      kind: "user";
      id: string;
      plan: Plan;
      tokensRemaining: number;
      tokenPeriodStart: Date;
      isAdmin: boolean;
    }
  | { kind: "guest"; id: string; plan: Plan; tokensRemaining: number; tokenPeriodStart: Date }
> {
  const guestId = typeof guestIdFromBody === "string" ? guestIdFromBody.trim() : "";

  // Try authenticated user first (if Authorization present)
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser(token);
    if (!userErr && user) {
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("tokens_remaining, token_period_start, plan, is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (profileErr) throw profileErr;

      if (!profile) {
        const nowIso = new Date().toISOString();
        const { error: insProfileErr } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email ?? null,
          is_admin: false,
          tokens_remaining: 3,
          plan: "free",
          token_period_start: nowIso,
        });
        if (insProfileErr) throw insProfileErr;
        return {
          kind: "user",
          id: user.id,
          plan: "free",
          tokensRemaining: 3,
          tokenPeriodStart: new Date(nowIso),
          isAdmin: false,
        };
      }

      const plan: Plan = profile.plan === "pro" ? "pro" : "free";
      return {
        kind: "user",
        id: user.id,
        plan,
        tokensRemaining: typeof profile.tokens_remaining === "number" ? profile.tokens_remaining : 0,
        tokenPeriodStart: new Date(profile.token_period_start ?? new Date().toISOString()),
        isAdmin: !!profile.is_admin,
      };
    }
  }

  if (!guestId) throw new Error("Missing guestId");

  const { data: guest, error: guestErr } = await supabase
    .from("guest_profiles")
    .select("tokens_remaining, token_period_start, plan")
    .eq("id", guestId)
    .maybeSingle();
  if (guestErr) throw guestErr;

  if (!guest) {
    const nowIso = new Date().toISOString();
    const { error: insGuestErr } = await supabase.from("guest_profiles").insert({
      id: guestId,
      tokens_remaining: 3,
      plan: "free",
      token_period_start: nowIso,
    });
    if (insGuestErr) throw insGuestErr;
    return {
      kind: "guest",
      id: guestId,
      plan: "free",
      tokensRemaining: 3,
      tokenPeriodStart: new Date(nowIso),
    };
  }

  const plan: Plan = guest.plan === "pro" ? "pro" : "free";
  return {
    kind: "guest",
    id: guestId,
    plan,
    tokensRemaining: typeof guest.tokens_remaining === "number" ? guest.tokens_remaining : 0,
    tokenPeriodStart: new Date(guest.token_period_start ?? new Date().toISOString()),
  };
}

async function maybeResetMonthlyTokens(
  supabase: ReturnType<typeof createClient>,
  actor:
    | {
        kind: "user";
        id: string;
        plan: Plan;
        tokensRemaining: number;
        tokenPeriodStart: Date;
        isAdmin: boolean;
      }
    | { kind: "guest"; id: string; plan: Plan; tokensRemaining: number; tokenPeriodStart: Date },
) {
  if (actor.plan !== "pro") return actor;

  const now = new Date();
  const nextReset = addDays(actor.tokenPeriodStart, 30);
  if (now.getTime() < nextReset.getTime()) return actor;

  const resetTo = 20;
  const nowIso = now.toISOString();
  if (actor.kind === "user") {
    await supabase
      .from("profiles")
      .update({ tokens_remaining: resetTo, token_period_start: nowIso })
      .eq("id", actor.id);
    return { ...actor, tokensRemaining: resetTo, tokenPeriodStart: now };
  }

  await supabase
    .from("guest_profiles")
    .update({ tokens_remaining: resetTo, token_period_start: nowIso })
    .eq("id", actor.id);
  return { ...actor, tokensRemaining: resetTo, tokenPeriodStart: now };
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
    const mode: string = (body.mode ?? "generate").toString();
    const pageId: string | undefined = body.pageId;
    const userMessage: string = (body.message ?? "").toString().trim();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let actor = await getActor(supabase, req, body.guestId);
    actor = await maybeResetMonthlyTokens(supabase, actor);

    if (mode === "balance") {
      return new Response(
        JSON.stringify({
          plan: actor.plan,
          tokensRemaining: actor.tokensRemaining,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (mode === "upgrade") {
      const nowIso = new Date().toISOString();
      const resetTo = 20;
      if (actor.kind === "user") {
        await supabase
          .from("profiles")
          .update({
            plan: "pro",
            tokens_remaining: resetTo,
            token_period_start: nowIso,
          })
          .eq("id", actor.id);
      } else {
        await supabase
          .from("guest_profiles")
          .update({
            plan: "pro",
            tokens_remaining: resetTo,
            token_period_start: nowIso,
          })
          .eq("id", actor.id);
      }
      return new Response(
        JSON.stringify({
          plan: "pro",
          tokensRemaining: resetTo,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (mode === "save") {
      const targetPageId: string | undefined = body.pageId;
      const htmlToSave: string = (body.html ?? "").toString();
      const messagesToSave = body.messages ?? null;

      if (!targetPageId || !htmlToSave) {
        return new Response(JSON.stringify({ error: "pageId and html are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: existing, error } = await supabase
        .from("pages")
        .select("id, user_id, guest_id")
        .eq("id", targetPageId)
        .maybeSingle();
      if (error) throw error;
      if (!existing) {
        return new Response(JSON.stringify({ error: "Page not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (actor.kind === "user") {
        if (existing.user_id && existing.user_id !== actor.id && !actor.isAdmin) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        if (existing.guest_id && existing.guest_id !== actor.id) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const { error: updErr } = await supabase
        .from("pages")
        .update({
          html: htmlToSave,
          messages: messagesToSave,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetPageId);
      if (updErr) throw updErr;

      return new Response(
        JSON.stringify({
          ok: true,
          plan: actor.plan,
          tokensRemaining: actor.tokensRemaining,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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

    const tokensBlocked =
      actor.kind === "user"
        ? (!actor.isAdmin && actor.tokensRemaining <= 0)
        : actor.tokensRemaining <= 0;

    if (tokensBlocked) {
      return new Response(
        JSON.stringify({
          error:
            actor.plan === "pro"
              ? "Monthly token limit reached (20/month)."
              : "Free token limit reached (3 total). Upgrade to Pro for 20 tokens/month.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Load existing page if editing
    type ExistingPage = {
      id: string;
      html: string;
      prompt: string;
      messages: Array<{ role: string; content: string }>;
      user_id: string | null;
      guest_id: string | null;
    };
    let existing: ExistingPage | null = null;

    if (pageId) {
      const { data, error } = await supabase
        .from("pages")
        .select("id, html, prompt, messages, user_id, guest_id")
        .eq("id", pageId)
        .maybeSingle();
      if (error) throw error;
      existing = (data ?? null) as ExistingPage | null;

      if (existing) {
        if (actor.kind === "user") {
          if (existing.user_id && existing.user_id !== actor.id && !actor.isAdmin) {
            return new Response(JSON.stringify({ error: "Forbidden" }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          if (existing.guest_id && existing.guest_id !== actor.id) {
            return new Response(JSON.stringify({ error: "Forbidden" }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
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
        content: `Build a multi-page website for the following brief. Return ONLY the full HTML document.\n\nBrief: ${userMessage}`,
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
    if (actor.kind === "user") {
      if (!actor.isAdmin) {
        await supabase
          .from("profiles")
          .update({ tokens_remaining: Math.max(0, actor.tokensRemaining - 1) })
          .eq("id", actor.id);
      }
    } else {
      await supabase
        .from("guest_profiles")
        .update({ tokens_remaining: Math.max(0, actor.tokensRemaining - 1) })
        .eq("id", actor.id);
    }
    const tokensRemainingAfter =
      actor.kind === "user" && actor.isAdmin ? actor.tokensRemaining : Math.max(0, actor.tokensRemaining - 1);

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
      ? `Updated the website: "${userMessage.slice(0, 80)}${userMessage.length > 80 ? "…" : ""}"`
      : `Created your website based on: "${userMessage.slice(0, 80)}${userMessage.length > 80 ? "…" : ""}"`;

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
          plan: actor.plan,
          tokensRemaining: tokensRemainingAfter,
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
      user_id: actor.kind === "user" ? actor.id : null,
      guest_id: actor.kind === "guest" ? actor.id : null,
    });
    if (insErr) throw insErr;

    return new Response(
      JSON.stringify({
        pageId: newId,
        html,
        assistantMessage: newAssistantMsg,
        plan: actor.plan,
        tokensRemaining: tokensRemainingAfter,
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
