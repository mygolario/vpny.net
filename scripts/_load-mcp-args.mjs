import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
if (!name) {
  console.error('Usage: node _load-mcp-args.mjs <function-name>');
  process.exit(1);
}

const args = JSON.parse(readFileSync(join(dir, `.mcp-args-${name}.json`), 'utf8'));
process.stdout.write(JSON.stringify(args));
