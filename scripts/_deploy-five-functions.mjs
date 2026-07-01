import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'zhfxomofodwifoxiqfjx';

function loadToken() {
  const envPath = join(dir, 'supabase-secrets.local.env');
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key === 'SUPABASE_ACCESS_TOKEN') return val;
  }
  return process.env.SUPABASE_ACCESS_TOKEN ?? null;
}

const token = loadToken();
if (!token) {
  console.error('SUPABASE_ACCESS_TOKEN not found');
  process.exit(1);
}

const order = [
  'admin-import-pool',
  'oxapay-webhook',
  'fulfill-order',
  'admin-retry-fulfill',
  'create-order',
];

const results = [];

for (const name of order) {
  const payload = JSON.parse(
    readFileSync(join(dir, `.tmp-mcp-${name}.json`), 'utf8'),
  );
  const { entrypoint_path, verify_jwt, files } = payload;

  const body = new FormData();
  body.append('metadata', JSON.stringify({ entrypoint_path, verify_jwt, name }));
  for (const file of files) {
    body.append('file', new Blob([file.content], { type: 'text/plain' }), file.name);
  }

  try {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_ID}/functions/deploy?slug=${name}`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body },
    );
    const text = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }
    if (!res.ok) {
      results.push({ name, ok: false, status: res.status, error: parsed });
      console.error(`${name} FAILED (${res.status}):`, text.slice(0, 500));
    } else {
      results.push({ name, ok: true, status: res.status, response: parsed });
      console.log(`${name} OK: version=${parsed.version ?? parsed.id ?? 'unknown'}`);
    }
  } catch (err) {
    results.push({ name, ok: false, error: String(err) });
    console.error(`${name} ERROR:`, err);
  }
}

writeFileSync(join(dir, '.deploy-five-results.json'), JSON.stringify(results, null, 2));
console.log('---SUMMARY---');
for (const r of results) {
  console.log(JSON.stringify(r));
}
