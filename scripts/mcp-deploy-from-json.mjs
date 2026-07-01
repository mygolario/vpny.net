import { readFileSync } from 'fs';
import { join } from 'path';

const name = process.argv[2];
if (!name) {
  console.error('Usage: node mcp-deploy-from-json.mjs <function-name>');
  process.exit(1);
}

const args = JSON.parse(
  readFileSync(join(import.meta.dirname, `.mcp-call-${name}.json`), 'utf8'),
);

// Output args for MCP deploy_edge_function (name, entrypoint_path, verify_jwt, files)
process.stdout.write(JSON.stringify(args));
