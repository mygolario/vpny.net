import { readFileSync } from 'fs';
import { join } from 'path';

function loadEnv() {
  const env = {};
  for (const line of readFileSync(join(import.meta.dirname, 'supabase-secrets.local.env'), 'utf8').split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const token = process.env.SUPABASE_ACCESS_TOKEN || loadEnv().SUPABASE_ACCESS_TOKEN;
const names = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['create-order', 'oxapay-webhook', 'fulfill-order', 'admin-import-pool', 'admin-retry-fulfill'];

if (!token) {
  console.error('No SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

for (const name of names) {
  const payload = JSON.parse(
    readFileSync(join(import.meta.dirname, `.deploy-worktree-${name}.json`), 'utf8'),
  );
  const { entrypoint_path, verify_jwt, files } = payload;
  const body = new FormData();
  body.append('metadata', JSON.stringify({ entrypoint_path, verify_jwt, name }));
  for (const file of files) {
    body.append('file', new Blob([file.content], { type: 'text/plain' }), file.name);
  }
  const res = await fetch(
    `https://api.supabase.com/v1/projects/zhfxomofodwifoxiqfjx/functions/deploy?slug=${name}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body },
  );
  const text = await res.text();
  console.log(`${name}: ${res.status} ${text.slice(0, 180)}`);
  if (!res.ok) process.exit(1);
}

console.log('Done.');
