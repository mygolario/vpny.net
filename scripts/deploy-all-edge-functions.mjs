import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const configs = [
  'mcp-create-order',
  'mcp-oxapay-webhook',
  'mcp-admin-import-pool',
  'mcp-admin-retry-fulfill',
  'mcp-fulfill-order',
];

const results = [];

for (const configName of configs) {
  const filePath = path.join(root, 'scripts', `${configName}.json`);
  const args = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  results.push({
    config: configName,
    name: args.name,
    verify_jwt: args.verify_jwt,
    entrypoint_path: args.entrypoint_path,
    fileCount: args.files.length,
  });
}

console.log(JSON.stringify(results, null, 2));
