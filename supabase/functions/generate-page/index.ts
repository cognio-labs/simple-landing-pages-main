import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Plan = "free" | "pro";

const SYSTEM_PROMPT = `You are an expert website designer and React developer. You generate complete, modern websites as a React project structure.

RULES:
- Output ONLY a JSON object representing the file tree. No markdown fences, no explanations, no commentary.
- The JSON structure MUST be: { "files": { "path/to/file": "content" } }
- Use React with Tailwind CSS.
- For styling, use standard Tailwind classes.
- Use Lucide React for icons.
- Include a sidebar or top navigation, hero section, features, pricing, etc.
- Default to a dark, luxury design with glassmorphism if the brief doesn't specify a style.
- The main entry point should be src/pages/Index.tsx.
- Include a "preview.html" file that is a standalone, single-file version of the site for easy previewing using Tailwind CDN.

When the user asks you to EDIT, return the FULL updated JSON object, never a diff.`;

function extractFiles(text: string): Record<string, string> {
  try {
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const raw = (fence ? fence[1] : text).trim();
    const data = JSON.parse(raw);
    return data.files || {};
  } catch (e) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        const data = JSON.parse(text.slice(start, end + 1));
        return data.files || {};
      } catch (e2) {
        return {};
      }
    }
    return {};
  }
}

function randomId(len = 10) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
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

    if (mode === "save") {
      const targetPageId: string | undefined = body.pageId;
      const htmlToSave: string = (body.html ?? "").toString();
      const messagesToSave = body.messages ?? null;

      if (!targetPageId) {
        return new Response(JSON.stringify({ error: "pageId is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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

    if (!userMessage && mode !== "upgrade") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokensBlocked =
      actor.kind === "user"
        ? (!actor.isAdmin && actor.tokensRemaining <= 0)
        : actor.tokensRemaining <= 0;

    if (tokensBlocked && mode === "generate") {
      return new Response(
        JSON.stringify({
          error:
            actor.plan === "pro"
              ? "Monthly token limit reached."
              : "Free token limit reached. Upgrade to Pro.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Load existing page if editing
    let existing: any = null;
    if (pageId) {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", pageId)
        .maybeSingle();
      if (error) throw error;
      existing = data;
    }

    const conversation: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (existing) {
      conversation.push({ role: "user", content: `Original brief: ${existing.prompt}` });
      // Use the last assistant message's files for context if possible, or just the html
      const lastAssistantMsg = (existing.messages as any[])?.reverse().find(m => m.role === 'assistant');
      if (lastAssistantMsg?.files) {
        conversation.push({ role: "assistant", content: JSON.stringify({ files: lastAssistantMsg.files }) });
      } else {
        conversation.push({ role: "assistant", content: existing.html });
      }
      conversation.push({ role: "user", content: userMessage });
    } else {
      conversation.push({ role: "user", content: userMessage });
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
          model: "google/gemini-2.0-flash-exp",
          messages: conversation,
        }),
      },
    );

    if (!aiResp.ok) {
      throw new Error(`AI generation failed with status ${aiResp.status}`);
    }

    const aiJson = await aiResp.json();
    const rawContent = aiJson.choices?.[0]?.message?.content ?? "";
    const files = extractFiles(rawContent);
    const html = files["preview.html"] || "<html><body><h1>No preview available</h1></body></html>";

    // Update tokens
    if (actor.kind === "user" && !actor.isAdmin) {
      await supabase
        .from("profiles")
        .update({ tokens_remaining: Math.max(0, actor.tokensRemaining - 1) })
        .eq("id", actor.id);
    } else if (actor.kind === "guest") {
      await supabase
        .from("guest_profiles")
        .update({ tokens_remaining: Math.max(0, actor.tokensRemaining - 1) })
        .eq("id", actor.id);
    }

    const newAssistantMsg = {
      role: "assistant",
      content: "I've updated your website.",
      html,
      files,
      ts: new Date().toISOString(),
    };

    if (existing) {
      const updatedMessages = [...(existing.messages || []), { role: "user", content: userMessage }, newAssistantMsg];
      await supabase.from("pages").update({ html, messages: updatedMessages }).eq("id", existing.id);
      return new Response(JSON.stringify({ pageId: existing.id, html, files, assistantMessage: newAssistantMsg.content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } else {
      const newId = randomId();
      const initialMessages = [{ role: "user", content: userMessage }, newAssistantMsg];
      await supabase.from("pages").insert({ id: newId, html, prompt: userMessage, messages: initialMessages, user_id: actor.kind === 'user' ? actor.id : null, guest_id: actor.kind === 'guest' ? actor.id : null });
      return new Response(JSON.stringify({ pageId: newId, html, files, assistantMessage: newAssistantMsg.content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
