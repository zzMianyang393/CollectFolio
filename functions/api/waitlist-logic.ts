export interface WaitlistPayload {
  email?: unknown;
  source?: unknown;
  website?: unknown;
  landingPath?: unknown;
  referrer?: unknown;
}

export interface WaitlistSubmission {
  email: string;
  source: string;
  landingPath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

type ParseResult =
  | { ok: true; data: WaitlistSubmission }
  | { ok: false; status: 400; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;
const MAX_SOURCE_LEN = 64;
const MAX_PATH_LEN = 300;
const MAX_REFERRER_LEN = 500;
const MAX_UTM_LEN = 128;

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export const parseWaitlistSubmission = (
  payload: WaitlistPayload,
  requestUrl: string,
): ParseResult => {
  if (text(payload.website, 1)) {
    return { ok: false, status: 400, error: 'Invalid submission' };
  }

  const email = text(payload.email, MAX_EMAIL_LEN + 1).toLowerCase();
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    return { ok: false, status: 400, error: 'Invalid email' };
  }

  const request = new URL(requestUrl);
  let landing = new URL('/', request.origin);
  const providedPath = text(payload.landingPath, MAX_PATH_LEN);

  if (providedPath) {
    try {
      const candidate = new URL(providedPath, request.origin);
      if (candidate.origin === request.origin) landing = candidate;
    } catch {
      // Keep the safe root fallback.
    }
  }

  return {
    ok: true,
    data: {
      email,
      source: text(payload.source, MAX_SOURCE_LEN) || 'unknown',
      landingPath: landing.pathname.slice(0, MAX_PATH_LEN),
      referrer: text(payload.referrer, MAX_REFERRER_LEN),
      utmSource: text(landing.searchParams.get('utm_source'), MAX_UTM_LEN),
      utmMedium: text(landing.searchParams.get('utm_medium'), MAX_UTM_LEN),
      utmCampaign: text(landing.searchParams.get('utm_campaign'), MAX_UTM_LEN),
    },
  };
};
