/**
 * Import matching pool row and retry fulfill for a stuck order (real config test).
 * Set SMOKE_RETRY_ORDER_ID in scripts/supabase-secrets.local.env.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadSmokeEnv } from './_smoke-env.mjs';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const { anon, base, email, password, env } = loadSmokeEnv();
const ORDER_ID = env.SMOKE_RETRY_ORDER_ID;
if (!ORDER_ID) {
  throw new Error('Set SMOKE_RETRY_ORDER_ID in scripts/supabase-secrets.local.env');
}

async function login() {
  const res = await fetch(`${base}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(data.error_description ?? 'Login failed');
  return data.access_token;
}

async function invoke(name, token, body) {
  const res = await fetch(`${base}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      apikey: anon,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`${name} ${res.status}: ${text}`);
  if (data?.error) throw new Error(data.error);
  return data;
}

const poolFile = join(scriptsDir, '..', 'docs', 'config-pool-example.json');
const { configs } = JSON.parse(readFileSync(poolFile, 'utf8'));

const token = await login();
console.log('admin login ok');

const importResult = await invoke('admin-import-pool', token, { configs });
console.log('import', JSON.stringify(importResult, null, 2));

const fulfillResult = await invoke('admin-retry-fulfill', token, { orderId: ORDER_ID });
console.log('retry-fulfill', JSON.stringify(fulfillResult, null, 2));
