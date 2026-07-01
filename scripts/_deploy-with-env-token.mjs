import { readFileSync } from 'fs';
import { join } from 'path';

const names = [
  'admin-import-pool',
  'oxapay-webhook',
  'fulfill-order',
  'admin-retry-fulfill',
  'create-order',
];

for (const name of names) {
  const args = JSON.parse(
    readFileSync(join(import.meta.dirname, `.mcp-call-${name}.json`), 'utf8'),
  );
  const res = await fetch('https://api.supabase.com/v1/projects/zhfxomofodwifoxiqfjx/functions/deploy?slug=' + name, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      ...(args.headers || {}),
    },
    body: (() => {
      const body = new FormData();
      body.append('metadata', JSON.stringify({
        entrypoint_path: args.entrypoint_path,
        verify_jwt: args.verify_jwt,
        name: args.name,
      }));
      for (const file of args.files) {
        body.append('file', new Blob([file.content], { type: 'text/plain' }), file.name);
      }
      return body;
    })(),
  });
  const text = await res.text();
  console.log(name, res.status, text.slice(0, 120));
  if (!res.ok) process.exit(1);
}
