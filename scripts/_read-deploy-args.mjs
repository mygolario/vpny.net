import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
if (!name) {
  console.error('Usage: node _read-deploy-args.mjs <function-name>');
  process.exit(1);
}

const candidates = [
  path.join(__dirname, `.deploy-${name}.json`),
  path.join(__dirname, `mcp-${name}-head.json`),
  path.join(__dirname, `deploy-call-${name}.json`),
];

let args = null;
for (const file of candidates) {
  if (!fs.existsSync(file)) continue;
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  args = parsed.args ?? parsed;
  break;
}

if (!args) {
  console.error(`No deploy args found for ${name}`);
  process.exit(1);
}

process.stdout.write(JSON.stringify(args));
