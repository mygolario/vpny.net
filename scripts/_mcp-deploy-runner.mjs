import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configs = [
  'mcp-create-order',
  'mcp-oxapay-webhook',
  'mcp-admin-import-pool',
  'mcp-admin-retry-fulfill',
  'mcp-fulfill-order',
];

for (const config of configs) {
  const args = JSON.parse(fs.readFileSync(path.join(__dirname, `${config}.json`), 'utf8'));
  console.log(`=== ${config} ===`);
  console.log(JSON.stringify(args));
}
