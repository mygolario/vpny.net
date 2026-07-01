# Configure Supabase Edge Function secrets + Auth URLs for VPNy.net
# Requires a Supabase Personal Access Token with access to project zhfxomofodwifoxiqfjx
#
# Usage:
#   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."
#   .\scripts\configure-supabase.ps1
#
# Or create scripts/supabase-secrets.local.env (gitignored) with:
#   SUPABASE_ACCESS_TOKEN=sbp_...
#   OXAPAY_MERCHANT_API_KEY=...
#   RESEND_API_KEY=...
#   RESEND_FROM_EMAIL=support@arioai.ir
#   ADMIN_ALERT_EMAIL=kavehtkts@gmail.com
#   APP_URL=https://vpny-net.vercel.app
#   ENCRYPTION_KEY=<32-char random>

$ErrorActionPreference = "Stop"
$ProjectRef = "zhfxomofodwifoxiqfjx"
$SecretsFile = Join-Path $PSScriptRoot "supabase-secrets.local.env"

if (Test-Path $SecretsFile) {
  Get-Content $SecretsFile | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $name = $matches[1].Trim()
      $value = $matches[2].Trim().Trim('"')
      Set-Item -Path "env:$name" -Value $value
    }
  }
}

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  Write-Error "Set SUPABASE_ACCESS_TOKEN (sbp_...) from https://supabase.com/dashboard/account/tokens"
}

$required = @(
  "OXAPAY_MERCHANT_API_KEY",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "ADMIN_ALERT_EMAIL",
  "APP_URL",
  "ENCRYPTION_KEY"
)
foreach ($key in $required) {
  if (-not (Get-Item "env:$key" -ErrorAction SilentlyContinue)) {
    Write-Error "Missing env var: $key (add to supabase-secrets.local.env or environment)"
  }
}

$headers = @{
  Authorization = "Bearer $env:SUPABASE_ACCESS_TOKEN"
  "Content-Type" = "application/json"
}

Write-Host "Setting Edge Function secrets on $ProjectRef ..."
$secretBody = @{
  OXAPAY_MERCHANT_API_KEY = $env:OXAPAY_MERCHANT_API_KEY
  RESEND_API_KEY          = $env:RESEND_API_KEY
  RESEND_FROM_EMAIL       = $env:RESEND_FROM_EMAIL
  ADMIN_ALERT_EMAIL       = $env:ADMIN_ALERT_EMAIL
  APP_URL                 = $env:APP_URL
  ENCRYPTION_KEY          = $env:ENCRYPTION_KEY
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
  -Uri "https://api.supabase.com/v1/projects/$ProjectRef/secrets" `
  -Headers $headers `
  -Body $secretBody | Out-Null

Write-Host "Updating Auth URL configuration ..."
$authBody = @{
  site_url       = "https://vpny-net.vercel.app"
  uri_allow_list = "https://vpny-net.vercel.app/**,https://www.arioai.ir/**,http://localhost:5173/**"
} | ConvertTo-Json

Invoke-RestMethod -Method PATCH `
  -Uri "https://api.supabase.com/v1/projects/$ProjectRef/config/auth" `
  -Headers $headers `
  -Body $authBody | Out-Null

Write-Host "Done. Secrets are live immediately (no redeploy required)."
