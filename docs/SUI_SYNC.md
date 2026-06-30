# s-ui Integration Guide (Phase 2)

This document describes how to connect VPNy.net config pool automation with [s-ui](https://github.com/alireza0/s-ui).

## Subscription server: sub.vpny.net

1. Deploy s-ui on your server with HTTPS enabled.
2. Point DNS `sub.vpny.net` to the s-ui host.
3. Enable the subscription service in s-ui panel settings.
4. Each client in s-ui gets a subscription URL like:
   `https://sub.vpny.net/sub/<token>`
5. Store that URL in the config pool `subscription_url` field.

## Creating configs for the pool

1. Create inbound (VLESS or Hysteria2) in s-ui.
2. Create a client with traffic cap and expiry matching the pool row.
3. Copy subscription URL and/or config URI into CSV/JSON import.
4. Include `sui_client_id` for future API sync.

## s-ui API (auto-sync phase 2)

Generate an API token in s-ui panel, then use:

```bash
# List clients
curl -H "Token: YOUR_TOKEN" "https://your-panel/app/apiv2/clients"

# Get stats for traffic sync
curl -H "Token: YOUR_TOKEN" "https://your-panel/app/apiv2/stats?resource=inbound&limit=100"
```

Planned automation:

- Poll s-ui for new clients tagged `available`
- Import into `config_pool` automatically
- Sync `traffic_used_gb` from s-ui stats into `subscriptions`
- On assignment, optionally rename s-ui client to customer email via `POST /apiv2/save`

## OxaPay webhook URL

```
https://<project-ref>.supabase.co/functions/v1/oxapay-webhook
```

Set `verify_jwt = false` for this function (already configured in `supabase/config.toml`).

## Promoting an admin user

After first signup, run in Supabase SQL editor:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Config pool example

See [docs/config-pool-example.json](./config-pool-example.json) and [docs/config-pool-example.csv](./config-pool-example.csv).
