import { readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(import.meta.dirname, 'supabase-secrets.local.env');
const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
for (const line of lines) {
  if (line.startsWith('SUPABASE_ACCESS_TOKEN=')) {
    const val = line.slice('SUPABASE_ACCESS_TOKEN='.length).trim();
    console.log('token length:', val.length, 'starts with sbp_:', val.startsWith('sbp_'));
    break;
  }
}
