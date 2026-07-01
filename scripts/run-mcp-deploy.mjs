import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const configFile = process.argv[2];
if (!configFile) {
  console.error('Usage: node run-mcp-deploy.mjs <mcp-*.json>');
  process.exit(1);
}

const args = JSON.parse(fs.readFileSync(path.join(__dirname, configFile), 'utf8'));
process.stdout.write(JSON.stringify(args));
