import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const names = ['oxapay-webhook', 'fulfill-order', 'admin-retry-fulfill'];

for (const name of names) {
  const file = join(dir, `.mcp-args-${name}.json`);
  const args = JSON.parse(readFileSync(file, 'utf8'));
  for (const f of args.files) {
    if (f.name === '_shared/fulfillment.ts') {
      f.content = f.content
        .replaceAll("from './_shared/utils.ts'", "from './utils.ts'")
        .replaceAll('from "./_shared/utils.ts"', 'from "./utils.ts"');
    }
  }
  writeFileSync(file, JSON.stringify(args));
  console.log('fixed', name);
}
