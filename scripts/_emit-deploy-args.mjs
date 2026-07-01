import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const names = [
  'create-order',
  'oxapay-webhook',
  'admin-import-pool',
  'admin-retry-fulfill',
  'fulfill-order',
];

for (const name of names) {
  const argsPath = path.join(__dirname, `.args-${name}.json`);
  const args = JSON.parse(fs.readFileSync(argsPath, 'utf8'));
  console.log(`===DEPLOY:${name}===`);
  console.log(JSON.stringify(args));
}
