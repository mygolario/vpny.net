import { readFileSync, writeFileSync } from 'fs';

const index = readFileSync('supabase/functions/admin-import-pool/index.ts', 'utf8').replaceAll(
  "'../_shared/",
  "'./_shared/",
);
const utils = readFileSync('supabase/functions/_shared/utils.ts', 'utf8');
const payload = {
  project_id: 'zhfxomofodwifoxiqfjx',
  name: 'admin-import-pool',
  entrypoint_path: 'index.ts',
  verify_jwt: true,
  files: [
    { name: 'index.ts', content: index },
    { name: '_shared/utils.ts', content: utils },
  ],
};
writeFileSync('scripts/.deploy-america-import-payload.json', JSON.stringify(payload));
console.log('america tier in deploy:', index.includes('america'));
