import { readFileSync } from 'fs';
import { join } from 'path';

const scriptsDir = import.meta.dirname;

function loadEnv() {
  const env = {};
  for (const line of readFileSync(join(scriptsDir, 'supabase-secrets.local.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
  }
  return env;
}

const env = loadEnv();
const token = env.SUPABASE_ACCESS_TOKEN;
if (!token || token.length < 20) {
  console.error('SUPABASE_ACCESS_TOKEN missing or invalid in scripts/supabase-secrets.local.env');
  process.exit(1);
}

const functions = [
  'create-order',
  'oxapay-webhook',
  'fulfill-order',
  'admin-import-pool',
  'admin-retry-fulfill',
];

for (const name of functions) {
  const payload = JSON.parse(
    readFileSync(join(scriptsDir, `.deploy-worktree-${name}.json`), 'utf8'),
  );
  const { entrypoint_path, verify_jwt, files } = payload;

  const body = new FormData();
  body.append('metadata', JSON.stringify({ entrypoint_path, verify_jwt, name }));
  for (const file of files) {
    body.append('file', new Blob([file.content], { type: 'text/plain' }), file.name);
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/zhfxomofodwifoxiqfjx/functions/deploy?slug=${name}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body,
    },
  );
  const text = await res.text();
  console.log(`${name}: ${res.status} ${text.slice(0, 200)}`);
  if (!res.ok) process.exit(1);
}

console.log('All edge functions deployed.');
