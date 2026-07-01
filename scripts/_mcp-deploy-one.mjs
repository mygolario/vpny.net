#!/usr/bin/env node
/**
 * Deploy one edge function via Supabase Management API.
 * Usage: node _mcp-deploy-one.mjs <function-name>
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const name = process.argv[2];
if (!name) {
  console.error('Usage: node _mcp-deploy-one.mjs <function-name>');
  process.exit(1);
}

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

const token = loadEnv().SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('SUPABASE_ACCESS_TOKEN not set');
  process.exit(1);
}

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
if (!res.ok) {
  console.error(`${name} failed (${res.status}):`, text);
  process.exit(1);
}
console.log(`${name} deployed:`, text.slice(0, 300));
