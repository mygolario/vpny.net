import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const name = process.argv[2];
if (!name) {
  console.error('Usage: node _read-mcp-deploy-args.mjs <function-name>');
  process.exit(1);
}

const dir = dirname(fileURLToPath(import.meta.url));
const payload = JSON.parse(
  readFileSync(join(dir, `.tmp-mcp-${name}.json`), 'utf8'),
);

const { name: fnName, entrypoint_path, verify_jwt, files } = payload;
process.stdout.write(JSON.stringify({ name: fnName, entrypoint_path, verify_jwt, files }));
