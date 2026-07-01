import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { fulfillOrder, sendConfigDeliveryEmailsForOrder } from './_shared/fulfillment.ts';
import {
  corsHeaders,
  createServiceClient,
  createUserClient,
  requireAdmin,
} from './_shared/utils.ts';

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

    const { orderId, resendEmail } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId required' }), { status: 400, headers: corsHeaders });
    }

    if (resendEmail) {
      const result = await sendConfigDeliveryEmailsForOrder(orderId, user.id);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await fulfillOrder(orderId, user.id);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('admin-retry-fulfill error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
