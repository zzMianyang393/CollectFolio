import assert from 'node:assert/strict';
import test from 'node:test';
import { parseWaitlistSubmission } from './waitlist-logic.ts';

test('normalizes a valid waitlist submission and captures attribution', () => {
  const result = parseWaitlistSubmission(
    {
      email: '  Collector@Example.COM ',
      source: 'pokemon-tracker',
      website: '',
      landingPath: '/pokemon-tracker?utm_source=google&utm_medium=organic&utm_campaign=launch',
      referrer: 'https://www.google.com/',
    },
    'https://collectfolio.pages.dev/api/waitlist',
  );

  assert.deepEqual(result, {
    ok: true,
    data: {
      email: 'collector@example.com',
      source: 'pokemon-tracker',
      landingPath: '/pokemon-tracker',
      referrer: 'https://www.google.com/',
      utmSource: 'google',
      utmMedium: 'organic',
      utmCampaign: 'launch',
    },
  });
});

test('rejects a submission filled by a bot honeypot', () => {
  const result = parseWaitlistSubmission(
    { email: 'person@example.com', website: 'https://spam.example' },
    'https://collectfolio.pages.dev/api/waitlist',
  );

  assert.deepEqual(result, { ok: false, status: 400, error: 'Invalid submission' });
});

test('rejects an invalid email address', () => {
  const result = parseWaitlistSubmission(
    { email: 'not-an-email', website: '' },
    'https://collectfolio.pages.dev/api/waitlist',
  );

  assert.deepEqual(result, { ok: false, status: 400, error: 'Invalid email' });
});

test('limits untrusted attribution field lengths', () => {
  const result = parseWaitlistSubmission(
    {
      email: 'person@example.com',
      source: 's'.repeat(100),
      website: '',
      landingPath: `/?utm_campaign=${'c'.repeat(300)}`,
      referrer: `https://example.com/${'r'.repeat(600)}`,
    },
    'https://collectfolio.pages.dev/api/waitlist',
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.source.length, 64);
    assert.equal(result.data.utmCampaign.length, 128);
    assert.equal(result.data.referrer.length, 500);
  }
});
