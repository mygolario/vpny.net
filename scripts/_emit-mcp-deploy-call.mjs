import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const names = process.argv.slice(2);
if (!names.length) {
  console.error('Usage: node _emit-mcp-deploy-call.mjs <function-name> [...]');
  process.exit(1);
}

for (const name of names) {
  const args = JSON.parse(readFileSync(join(dir, `.mcp-args-${name}.json`), 'utf8'));
  writeFileSync(join(dir, `.mcp-call-${name}.json`), JSON.stringify(args));
  console.log(`WROTE ${name} ${JSON.stringify(args).length} bytes`);
}
