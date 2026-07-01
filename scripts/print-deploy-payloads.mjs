import { readFileSync } from 'fs';

const functions = [
  'oxapay-webhook',
  'fulfill-order',
  'admin-import-pool',
  'admin-retry-fulfill',
];

for (const name of functions) {
  const payload = JSON.parse(readFileSync(`scripts/mcp-${name}-head.json`, 'utf8'));
  console.log('---DEPLOY---');
  console.log(JSON.stringify(payload));
}
