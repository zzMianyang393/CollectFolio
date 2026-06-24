/// <reference types="@cloudflare/workers-types" />

import { parseWaitlistSubmission, type WaitlistPayload } from './waitlist-logic';

interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  ALLOWED_ORIGIN?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

const corsHeaders = (origin: string | null, allowed: string) => {
  const allowOrigin = origin && (allowed === '*' || origin === allowed) ? origin : allowed;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  } as const;
};

const isOriginAllowed = (origin: string | null, allowed: string): boolean => {
  if (!origin) return false;
  if (allowed === '*') return true;
  return origin === allowed;
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin');
  const allowed = context.env.ALLOWED_ORIGIN ?? 'https://collectfolio.pages.dev';
  if (!isOriginAllowed(origin, allowed)) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, { status: 204, headers: corsHeaders(origin, allowed) });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin');
  const allowed = context.env.ALLOWED_ORIGIN ?? 'https://collectfolio.pages.dev';

  // Only accept same-origin or explicitly allowed origin
  if (origin && !isOriginAllowed(origin, allowed)) {
    return json({ error: 'Forbidden' }, 403);
  }

  // Parse and validate
  let payload: WaitlistPayload;
  try {
    payload = (await context.request.json()) as WaitlistPayload;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const parsed = parseWaitlistSubmission(payload, context.request.url);
  if (!parsed.ok) return json({ error: parsed.error }, parsed.status);
  const { email, source, landingPath, referrer, utmSource, utmMedium, utmCampaign } = parsed.data;

  // Honeypot / basic spam heuristics
  if (email.endsWith('.ru') || email.includes('mailinator') || email.includes('tempmail')) {
    // Silently accept but do not store (avoids leaking which addresses were filtered)
    return json({ ok: true });
  }

  // Insert into D1
  try {
    await context.env.DB.prepare(
      `INSERT INTO waitlist (
        email, source, landing_path, referrer, utm_source, utm_medium, utm_campaign,
        created_at, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      email,
      source,
      landingPath,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      new Date().toISOString(),
      context.request.headers.get('User-Agent') ?? '',
    ).run();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Unique constraint: already on the list
    if (message.includes('UNIQUE') || message.includes('constraint')) {
      return json({ ok: true, alreadySubscribed: true });
    }
    console.error('Waitlist insert failed:', message);
    return json({ error: 'Internal error' }, 500);
  }

  // Optional: send confirmation email via Resend
  if (context.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CollectFolio <hello@collectfolio.com>',
          to: email,
          subject: "You're on the CollectFolio waitlist",
          html: `<p>Thanks for joining the CollectFolio waitlist.</p><p>We'll email you when beta access opens. In the meantime, <a href="https://collectfolio.pages.dev/blog">read our latest posts on the blog</a>.</p>`,
        }),
      });
    } catch (err) {
      // Non-fatal: subscription was recorded
      console.error('Resend send failed:', err);
    }
  }

  return json({ ok: true });
};

export const onRequestGet: PagesFunction<Env> = async () => {
  // Return basic count for sanity checks (does not expose emails)
  return new Response(null, { status: 405, headers: { Allow: 'POST, OPTIONS' } });
};
