import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, '..');

const functions = [
  { name: 'create-order', verify_jwt: true, files: ['index.ts', '_shared/utils.ts'] },
  { name: 'oxapay-webhook', verify_jwt: false, files: ['index.ts', '_shared/utils.ts', '_shared/fulfillment.ts'] },
  { name: 'fulfill-order', verify_jwt: true, files: ['index.ts', '_shared/utils.ts', '_shared/fulfillment.ts'] },
  { name: 'admin-import-pool', verify_jwt: true, files: ['index.ts', '_shared/utils.ts'] },
  { name: 'admin-retry-fulfill', verify_jwt: true, files: ['index.ts', '_shared/utils.ts', '_shared/fulfillment.ts'] },
];

function readFnFile(fnName, relPath) {
  const path = relPath.startsWith('_shared/')
    ? join(root, 'supabase/functions', relPath)
    : join(root, 'supabase/functions', fnName, relPath);
  let content = readFileSync(path, 'utf8');
  content = content.replaceAll("'../_shared/", "'./_shared/").replaceAll('"../_shared/', '"./_shared/');
  if (relPath === '_shared/fulfillment.ts') {
    content = content.replaceAll("'./_shared/utils.ts'", "'./utils.ts'").replaceAll('"./_shared/utils.ts"', '"./utils.ts"');
  }
  return content;
}

for (const fn of functions) {
  const payload = {
    name: fn.name,
    entrypoint_path: 'index.ts',
    verify_jwt: fn.verify_jwt,
    files: fn.files.map((f) => ({
      name: f,
      content: readFnFile(fn.name, f),
    })),
  };
  writeFileSync(join(import.meta.dirname, `.deploy-worktree-${fn.name}.json`), JSON.stringify(payload));
  console.log('wrote', fn.name, fn.files.length, 'files');
}
