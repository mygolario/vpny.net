import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import {
  corsHeaders,
  createServiceClient,
  createUserClient,
  getEdgeSecret,
  writeAudit,
} from '../_shared/utils.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createUserClient(authHeader);
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { items, paymentMethod = 'crypto' } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart items required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const totalAmount = items.reduce((sum: number, item: { price: number }) => sum + Number(item.price), 0);
    const serviceClient = createServiceClient();

    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending_payment',
        total_amount: totalAmount,
        currency: 'USD',
        payment_method: paymentMethod,
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item: Record<string, unknown>) => ({
      order_id: order.id,
      product_tier: item.product_tier,
      product_name: item.product,
      country: item.country,
      city: item.city === 'Country-Level' ? null : item.city,
      duration_days: item.duration_days,
      duration_label: item.duration,
      traffic_gb: item.traffic_gb,
      protocol: item.protocol ?? null,
      dns_type: item.dns ?? null,
      price: item.price,
      fulfillment_status: item.product_tier === 'creator' ? 'awaiting_manual' : 'pending',
    }));

    const { error: itemsError } = await serviceClient.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    const oxapayKey = await getEdgeSecret('OXAPAY_MERCHANT_API_KEY', serviceClient);
    const appUrl = (await getEdgeSecret('APP_URL', serviceClient)) ?? 'http://localhost:5173';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const callbackUrl = `${supabaseUrl}/functions/v1/oxapay-webhook`;

    let paymentUrl: string | null = null;
    let trackId: string | null = null;

    if (oxapayKey) {
      const oxapayResponse = await fetch('https://api.oxapay.com/v1/payment/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          merchant_api_key: oxapayKey,
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'USD',
          order_id: order.id,
          callback_url: callbackUrl,
          return_url: `${appUrl}/?section=portal&order=${order.id}`,
          description: `VPNy.net order ${order.id}`,
          lifetime: 60,
        }),
      });

      const oxapayData = await oxapayResponse.json();

      if (!oxapayResponse.ok) {
        throw new Error(oxapayData?.message ?? oxapayData?.error ?? 'OxaPay invoice creation failed');
      }

      paymentUrl = oxapayData.data?.payment_url ?? oxapayData.payment_url ?? oxapayData.payLink ?? null;
      trackId = String(oxapayData.data?.track_id ?? oxapayData.track_id ?? oxapayData.trackId ?? '');

      if (trackId) {
        await serviceClient
          .from('orders')
          .update({
            oxapay_track_id: trackId,
            oxapay_payment_url: paymentUrl,
          })
          .eq('id', order.id);
      }
    } else {
      paymentUrl = `${appUrl}/?section=portal&order=${order.id}&demo=1`;
    }

    await writeAudit(serviceClient, 'order_created', 'order', order.id, {
      total_amount: totalAmount,
      item_count: items.length,
      track_id: trackId,
    }, user.id);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        paymentUrl,
        trackId,
        totalAmount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('create-order error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
