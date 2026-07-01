import { readFileSync } from 'fs';
import { join } from 'path';

const names = [
  'create-order',
  'oxapay-webhook',
  'fulfill-order',
  'admin-import-pool',
  'admin-retry-fulfill',
];

for (const name of names) {
  const payload = JSON.parse(
    readFileSync(join(import.meta.dirname, `.deploy-worktree-${name}.json`), 'utf8'),
  );
  console.log(`\n=== DEPLOY ${name} ===`);
  console.log(JSON.stringify({
    name: payload.name,
    entrypoint_path: payload.entrypoint_path,
    verify_jwt: payload.verify_jwt,
    files: payload.files.map((f) => ({ name: f.name, contentLength: f.content.length })),
  }));
}
