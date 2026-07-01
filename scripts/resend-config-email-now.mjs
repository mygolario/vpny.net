#!/usr/bin/env node
/** Send config email via Resend using known order/subscription fields (no Supabase key needed). */
import { readFileSync } from 'fs';
import { join } from 'path';

function loadEnv() {
  const env = {};
  for (const line of readFileSync(join(import.meta.dirname, 'supabase-secrets.local.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
  }
  return env;
}

const env = loadEnv();
const resendKey = env.RESEND_API_KEY;
const from = env.RESEND_FROM_EMAIL || 'support@arioai.ir';
const appUrl = env.APP_URL || 'https://www.arioai.ir';

const to = process.argv[2] || 'mygolariokv@gmail.com';
const productName = process.argv[3] || 'VPNy America';
const country = process.argv[4] || 'United States';
const subscriptionUrl = process.argv[5] || 'https://sub.vpny.net/sub/US-AMERICA-003-TOKEN';
const expiresAt = process.argv[6] || '12/28/2026';

if (!resendKey) throw new Error('RESEND_API_KEY missing');

const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <h2>Your VPNy.net gateway is ready</h2>
  <p>Your <strong>${productName}</strong> configuration for <strong>${country}</strong> has been activated.</p>
  <p><strong>Subscription URL:</strong><br/><code style="word-break:break-all">${subscriptionUrl}</code></p>
  <p><strong>Expires:</strong> ${expiresAt}</p>
  <p>You can also view your configs anytime in the <a href="${appUrl}/?section=portal">Client Portal</a>.</p>
</div>`;

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: `VPNy.net <${from}>`,
    to,
    subject: 'Your VPNy.net configuration is ready',
    html,
  }),
});

const body = await res.text();
console.log(JSON.stringify({ to, status: res.status, body: body.slice(0, 400) }, null, 2));
process.exit(res.ok ? 0 : 1);
