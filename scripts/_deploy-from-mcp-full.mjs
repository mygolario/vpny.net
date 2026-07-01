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

const order = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['oxapay-webhook', 'fulfill-order', 'admin-retry-fulfill', 'create-order'];

const results = [];

for (const name of order) {
  const args = JSON.parse(readFileSync(join(dir, `.mcp-full-${name}.json`), 'utf8'));
  const { entrypoint_path, verify_jwt, files } = args;
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
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
    const row = {
      name,
      ok: res.ok,
      status: res.status,
      version: parsed.version ?? null,
      slug: parsed.slug ?? name,
      error: res.ok ? null : parsed,
    };
    results.push(row);
    console.log(JSON.stringify(row));
    if (!res.ok) process.exitCode = 1;
  } catch (err) {
    results.push({ name, ok: false, error: String(err) });
    console.error(name, err);
    process.exitCode = 1;
  }
}

writeFileSync(join(dir, '.deploy-batch-results.json'), JSON.stringify(results, null, 2));
