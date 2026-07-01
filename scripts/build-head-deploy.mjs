import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

const functions = [
  { name: 'oxapay-webhook', verify_jwt: false, files: ['index.ts', '_shared/utils.ts', '_shared/fulfillment.ts'] },
  { name: 'fulfill-order', verify_jwt: true, files: ['index.ts', '_shared/utils.ts', '_shared/fulfillment.ts'] },
  { name: 'admin-import-pool', verify_jwt: true, files: ['index.ts', '_shared/utils.ts'] },
  { name: 'admin-retry-fulfill', verify_jwt: true, files: ['index.ts', '_shared/utils.ts', '_shared/fulfillment.ts'] },
];

for (const fn of functions) {
  const payload = {
    name: fn.name,
    entrypoint_path: 'index.ts',
    verify_jwt: fn.verify_jwt,
    files: fn.files.map((f) => {
      const gitPath = f.startsWith('_shared/')
        ? `supabase/functions/${f}`
        : `supabase/functions/${fn.name}/${f}`;
      let content = execSync(`git show HEAD:${gitPath}`, { encoding: 'utf8' });
      content = content.replaceAll("'../_shared/", "'./_shared/").replaceAll('"../_shared/', '"./_shared/');
      return { name: f === 'index.ts' ? 'index.ts' : f, content };
    }),
  };
  writeFileSync(`scripts/mcp-${fn.name}-head.json`, JSON.stringify(payload));
  console.log('wrote', fn.name);
}
