import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const names = [
  'admin-import-pool',
  'oxapay-webhook',
  'fulfill-order',
  'admin-retry-fulfill',
  'create-order',
];

for (const name of names) {
  const payload = JSON.parse(
    readFileSync(join(dir, `.tmp-mcp-${name}.json`), 'utf8'),
  );
  const args = {
    name: payload.name,
    entrypoint_path: payload.entrypoint_path,
    verify_jwt: payload.verify_jwt,
    files: payload.files,
  };
  writeFileSync(join(dir, `.out-mcp-deploy-${name}.json`), JSON.stringify(args));
  console.log(`${name}: ${JSON.stringify(args).length} bytes`);
}
