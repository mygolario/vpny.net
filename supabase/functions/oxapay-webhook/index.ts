import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { fulfillOrder } from '../_shared/fulfillment.ts';
import {
  corsHeaders,
  createServiceClient,
  getEdgeSecret,
  sendResendEmail,
  writeAudit,
} from '../_shared/utils.ts';

async function verifyOxaPayHmac(rawBody: string, hmacHeader: string | null): Promise<boolean> {
  const apiKey = await getEdgeSecret('OXAPAY_MERCHANT_API_KEY', createServiceClient());
  if (!apiKey || !hmacHeader) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(apiKey),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const computed = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computed === hmacHeader.toLowerCase();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const rawBody = await req.text();

  try {
    const hmacHeader = req.headers.get('HMAC') ?? req.headers.get('hmac');
    const isValid = await verifyOxaPayHmac(rawBody, hmacHeader);

    if (!isValid && Deno.env.get('OXAPAY_SKIP_HMAC') !== 'true') {
      console.error('Invalid OxaPay HMAC signature');
      return new Response('invalid signature', { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const trackId = String(payload.track_id ?? payload.trackId ?? '');
    const status = String(payload.status ?? '').toLowerCase();
    const orderId = payload.order_id ?? payload.orderId;

    const supabase = createServiceClient();

    if (status === 'paid') {
      const { data: existingEvent } = await supabase
        .from('webhook_events')
        .select('processed')
        .eq('provider', 'oxapay')
        .eq('track_id', trackId)
        .eq('status', 'paid')
        .maybeSingle();

      if (existingEvent?.processed) {
        return new Response('ok', { status: 200 });
      }
    }

    await supabase.from('webhook_events').upsert(
      {
        provider: 'oxapay',
        track_id: trackId,
        order_id: orderId,
        payload,
        status,
        processed: false,
      },
      { onConflict: 'provider,track_id,status' },
    );

    if (status !== 'paid') {
      return new Response('ok', { status: 200 });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, profiles(email)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found for webhook', orderId);
      return new Response('ok', { status: 200 });
    }

    if (order.status !== 'pending_payment' && order.status !== 'paid' && order.status !== 'provisioning') {
      await supabase
        .from('webhook_events')
        .update({ processed: true })
        .eq('provider', 'oxapay')
        .eq('track_id', trackId)
        .eq('status', 'paid');
      return new Response('ok', { status: 200 });
    }

    await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        oxapay_track_id: trackId,
      })
      .eq('id', order.id);

    await writeAudit(supabase, 'payment_confirmed', 'order', order.id, {
      track_id: trackId,
      amount: payload.amount,
    });

    const customerEmail = (order as { profiles?: { email?: string } }).profiles?.email;
    if (customerEmail) {
      await sendResendEmail({
        to: customerEmail,
        subject: 'VPNy.net payment confirmed',
        html: `<p>Your payment has been confirmed. Your configuration is being provisioned now.</p>
               <p style="color:#666;font-size:14px">پرداخت شما تأیید شد. پیکربندی در حال آماده‌سازی است.</p>`,
      }).catch((err) => console.error('Payment email failed', err));
    }

    await fulfillOrder(order.id, null, trackId);

    await supabase
      .from('webhook_events')
      .update({ processed: true })
      .eq('provider', 'oxapay')
      .eq('track_id', trackId)
      .eq('status', 'paid');

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('oxapay-webhook error:', error);
    return new Response('error', { status: 500 });
  }
});
