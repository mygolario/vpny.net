import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
if (!name) {
  console.error('Usage: node _mcp-deploy-from-args.mjs <function-name>');
  process.exit(1);
}

const argsPath = path.join(__dirname, `.mcp-args-only-${name}.json`);
const args = JSON.parse(fs.readFileSync(argsPath, 'utf8'));
process.stdout.write(JSON.stringify(args));
