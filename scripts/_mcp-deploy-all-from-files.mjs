#!/usr/bin/env node
/**
 * Prints deploy payloads as JSON lines for MCP deploy_edge_function.
 * Usage: node _mcp-deploy-all-from-files.mjs | while read line; do ...
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const names = [
  'admin-import-pool',
  'oxapay-webhook',
  'fulfill-order',
  'admin-retry-fulfill',
  'create-order',
];

for (const name of names) {
  const payload = JSON.parse(
    readFileSync(join(import.meta.dirname, `.deploy-worktree-${name}.json`), 'utf8'),
  );
  const { entrypoint_path, verify_jwt, files } = payload;
  console.log(JSON.stringify({ name, entrypoint_path, verify_jwt, files }));
}
