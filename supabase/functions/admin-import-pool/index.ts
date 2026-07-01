import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import {
  corsHeaders,
  createServiceClient,
  createUserClient,
  encryptSecret,
  requireAdmin,
  writeAudit,
} from '../_shared/utils.ts';

const PRODUCT_TIERS = ['general', 'professional', 'ultimate', 'creator', 'america'];
const PROTOCOLS = ['vless', 'hysteria2'];

function normalizeCity(city: string | null | undefined) {
  if (!city || city.trim() === '' || city.toLowerCase() === 'country-level') return null;
  return city.trim();
}

function validateRow(row: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (!row.external_id) errors.push('external_id is required');
  if (!PROTOCOLS.includes(String(row.protocol))) errors.push(`protocol must be one of: ${PROTOCOLS.join(', ')}`);
  if (!PRODUCT_TIERS.includes(String(row.product_tier))) errors.push(`product_tier invalid`);
  if (!row.country) errors.push('country is required');
  if (!row.traffic_gb) errors.push('traffic_gb is required');
  if (!row.duration_days) errors.push('duration_days is required');
  if (!row.server_ip) errors.push('server_ip is required');
  if (!row.subscription_url && !row.config_uri) errors.push('subscription_url or config_uri required');
  return errors;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? '';
    });
    return row;
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const userClient = createUserClient(authHeader);
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const serviceClient = createServiceClient();
    await requireAdmin(serviceClient, user.id);

    const contentType = req.headers.get('Content-Type') ?? '';
    let configs: Record<string, unknown>[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      configs = body.configs ?? [];
    } else {
      const text = await req.text();
      if (text.trim().startsWith('{')) {
        const parsed = JSON.parse(text);
        configs = parsed.configs ?? [];
      } else {
        configs = parseCsv(text);
      }
    }

    const results = { imported: 0, skipped: 0, errors: [] as Array<{ external_id: string; errors: string[] }> };

    for (const raw of configs) {
      const row = {
        external_id: raw.external_id,
        protocol: String(raw.protocol).toLowerCase(),
        product_tier: String(raw.product_tier).toLowerCase(),
        country: raw.country,
        city: normalizeCity(raw.city as string),
        traffic_gb: Number(raw.traffic_gb),
        duration_days: Number(raw.duration_days),
        server_ip: raw.server_ip,
        server_label: raw.server_label || null,
        subscription_url: raw.subscription_url || null,
        config_uri: raw.config_uri || null,
        sui_client_id: raw.sui_client_id || null,
        sui_inbound_tag: raw.sui_inbound_tag || null,
        notes: raw.notes || null,
      };

      const rowErrors = validateRow(row);
      if (rowErrors.length) {
        results.errors.push({ external_id: String(raw.external_id ?? 'unknown'), errors: rowErrors });
        results.skipped += 1;
        continue;
      }

      const configUriEncrypted = await encryptSecret(row.config_uri as string | null);

      const { error } = await serviceClient.from('config_pool').upsert(
        {
          external_id: row.external_id,
          protocol: row.protocol,
          product_tier: row.product_tier,
          country: row.country,
          city: row.city,
          traffic_gb: row.traffic_gb,
          duration_days: row.duration_days,
          server_ip: row.server_ip,
          server_label: row.server_label,
          subscription_url: row.subscription_url,
          config_uri_encrypted: configUriEncrypted,
          sui_client_id: row.sui_client_id,
          sui_inbound_tag: row.sui_inbound_tag,
          notes: row.notes,
          status: 'available',
        },
        { onConflict: 'external_id', ignoreDuplicates: false },
      );

      if (error) {
        results.errors.push({ external_id: String(row.external_id), errors: [error.message] });
        results.skipped += 1;
      } else {
        results.imported += 1;
      }
    }

    await writeAudit(serviceClient, 'pool_import', 'config_pool', null, results, user.id);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('admin-import-pool error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
