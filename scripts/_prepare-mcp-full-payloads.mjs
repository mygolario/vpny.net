import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const dir = dirname(fileURLToPath(import.meta.url));
const order = [
  'admin-import-pool',
  'oxapay-webhook',
  'fulfill-order',
  'admin-retry-fulfill',
  'create-order',
];

for (const name of order) {
  const out = execFileSync(
    process.execPath,
    [join(dir, '_read-mcp-deploy-args.mjs'), name],
    { encoding: 'utf8' },
  );
  writeFileSync(join(dir, `.mcp-full-${name}.json`), out);
  const args = JSON.parse(out);
  console.log(`${name}: ${args.files.length} files, ${out.length} bytes`);
}
