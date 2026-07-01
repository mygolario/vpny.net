import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRef = 'zhfxomofodwifoxiqfjx';

const configs = [
  'mcp-create-order',
  'mcp-oxapay-webhook',
  'mcp-admin-import-pool',
  'mcp-admin-retry-fulfill',
  'mcp-fulfill-order',
];

async function deployConfig(configName) {
  const args = JSON.parse(fs.readFileSync(path.join(__dirname, `${configName}.json`), 'utf8'));
  const form = new FormData();
  const metadata = {
    name: args.name,
    entrypoint_path: args.entrypoint_path,
    verify_jwt: args.verify_jwt,
  };
  if (args.import_map_path) metadata.import_map_path = args.import_map_path;
  form.append('metadata', JSON.stringify(metadata));
  for (const file of args.files) {
    form.append('file', new Blob([file.content], { type: 'text/plain' }), file.name);
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/functions/deploy?slug=${encodeURIComponent(args.name)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      },
      body: form,
    },
  );
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  return {
    config: configName,
    name: args.name,
    verify_jwt: args.verify_jwt,
    ok: res.ok,
    status: res.status,
    version: body?.version ?? null,
    slug: body?.slug ?? args.name,
    error: res.ok ? null : body?.message || body?.error || text.slice(0, 300),
  };
}

const results = [];
for (const config of configs) {
  results.push(await deployConfig(config));
}
console.log(JSON.stringify(results, null, 2));
