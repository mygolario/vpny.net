import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const heads = [
  'mcp-oxapay-webhook-head.json',
  'mcp-fulfill-order-head.json',
  'mcp-admin-import-pool-head.json',
  'mcp-admin-retry-fulfill-head.json',
];

for (const h of heads) {
  const p = path.join(__dirname, h);
  const args = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const file of args.files) {
    if (file.name === '_shared/fulfillment.ts') {
      file.content = file.content
        .replaceAll("from './_shared/utils.ts'", "from './utils.ts'")
        .replaceAll('from "./_shared/utils.ts"', 'from "./utils.ts"');
    }
  }
  fs.writeFileSync(p, JSON.stringify(args));
  fs.writeFileSync(path.join(__dirname, `mcp-deploy-args-${args.name}.json`), JSON.stringify(args));
  console.log('fixed', args.name);
}
