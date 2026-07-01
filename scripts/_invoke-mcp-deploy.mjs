import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const headFiles = process.argv.slice(2);

if (!headFiles.length) {
  console.error('Usage: node _invoke-mcp-deploy.mjs <mcp-*-head.json> ...');
  process.exit(1);
}

for (const file of headFiles) {
  const filePath = path.isAbsolute(file) ? file : path.join(__dirname, file);
  const args = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`===MCP_DEPLOY:${args.name}===`);
  console.log(JSON.stringify(args));
}
