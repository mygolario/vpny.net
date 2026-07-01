import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const scriptsDir = dirname(fileURLToPath(import.meta.url));

/** Load shared smoke-test credentials from scripts/supabase-secrets.local.env (never commit). */
export function loadSmokeEnv() {
  const envPath = join(scriptsDir, 'supabase-secrets.local.env');
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
  }

  const anon = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  const base =
    env.SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://zhfxomofodwifoxiqfjx.supabase.co';
  const email = env.SMOKE_TEST_EMAIL;
  const password = env.SMOKE_TEST_PASSWORD;

  if (!anon) {
    throw new Error('Set SUPABASE_ANON_KEY in scripts/supabase-secrets.local.env');
  }
  if (!email || !password) {
    throw new Error('Set SMOKE_TEST_EMAIL and SMOKE_TEST_PASSWORD in scripts/supabase-secrets.local.env');
  }

  return { anon, base, email, password, env };
}
