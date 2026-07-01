import {
  buildConfigDeliveryEmail,
  checkLowStockAndAlert,
  createServiceClient,
  decryptSecret,
  getCustomerEmail,
  getEdgeSecret,
  sendResendEmail,
  writeAudit,
} from '../_shared/utils.ts';

type OrderItem = {
  id: string;
  product_tier: string;
  product_name: string;
  country: string;
  city: string | null;
  duration_days: number;
  traffic_gb: number;
  protocol: string | null;
  fulfillment_status: string;
};

type Order = {
  id: string;
  user_id: string;
  status: string;
  profiles: { email: string; full_name: string | null } | { email: string; full_name: string | null }[] | null;
};

export async function sendConfigDeliveryEmailsForOrder(
  orderId: string,
  actorId: string | null = null,
) {
  const supabase = createServiceClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, profiles(email)')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const customerEmail = await getCustomerEmail(supabase, order.user_id, order.profiles);
  if (!customerEmail) {
    await writeAudit(supabase, 'config_email_skipped', 'order', orderId, {
      reason: 'no_customer_email',
    }, actorId);
    return { orderId, sent: false, reason: 'no_customer_email' };
  }

  const { data: subscriptions, error: subError } = await supabase
    .from('subscriptions')
    .select('id, product_name, country, city, subscription_url, config_uri_encrypted, expires_at, status')
    .eq('order_id', orderId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (subError) throw subError;
  if (!subscriptions?.length) {
    return { orderId, sent: false, reason: 'no_active_subscriptions' };
  }

  const portalUrl = `${(await getEdgeSecret('APP_URL', supabase)) ?? 'https://vpny.net'}/?section=portal`;
  const first = subscriptions[0];
  const configUri = await decryptSecret(first.config_uri_encrypted);
  const expiresAt = first.expires_at
    ? new Date(first.expires_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  const { html, text } = buildConfigDeliveryEmail({
    productName: first.product_name,
    country: first.country ?? '',
    city: first.city ?? null,
    subscriptionUrl: first.subscription_url,
    configUri,
    expiresAt,
    portalUrl,
  });

  const emailResult = await sendResendEmail({
    to: customerEmail,
    subject: 'Your VPNy.net configuration is ready',
    html,
    text,
  }, supabase);

  if ('skipped' in emailResult && emailResult.skipped) {
    await writeAudit(supabase, 'config_email_skipped', 'order', orderId, {
      reason: emailResult.reason ?? 'resend_skipped',
      to: customerEmail,
    }, actorId);
    return { orderId, sent: false, reason: emailResult.reason ?? 'resend_skipped', to: customerEmail };
  }

  await writeAudit(supabase, 'config_email_sent', 'order', orderId, {
    to: customerEmail,
    subscription_id: first.id,
    resend_id: (emailResult as { id?: string }).id ?? null,
  }, actorId);

  return {
    orderId,
    sent: true,
    to: customerEmail,
    resendId: (emailResult as { id?: string }).id ?? null,
  };
}

export async function fulfillOrder(
  orderId: string,
  actorId: string | null = null,
  oxapayTrackId: string | null = null,
) {
  const supabase = createServiceClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, status, profiles(email, full_name)')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const typedOrder = order as unknown as Order;

  await supabase
    .from('orders')
    .update({ status: 'provisioning', updated_at: new Date().toISOString() })
    .eq('id', orderId);

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .in('fulfillment_status', ['pending', 'awaiting_inventory']);

  if (itemsError) throw itemsError;
  if (!items?.length) {
    return { orderId, fulfilled: 0, message: 'No pending items' };
  }

  let fulfilledCount = 0;
  let hasAwaitingInventory = false;
  let hasAwaitingManual = false;

  for (const item of items as OrderItem[]) {
    if (item.product_tier === 'creator') {
      await supabase
        .from('order_items')
        .update({ fulfillment_status: 'awaiting_manual' })
        .eq('id', item.id);
      hasAwaitingManual = true;
      continue;
    }

    const { data: configId, error: assignError } = await supabase.rpc('assign_config_from_pool', {
      p_product_tier: item.product_tier,
      p_country: item.country,
      p_city: item.city,
      p_traffic_gb: item.traffic_gb,
      p_duration_days: item.duration_days,
      p_protocol: item.protocol,
      p_order_item_id: item.id,
    });

    if (assignError) throw assignError;

    if (!configId) {
      await supabase
        .from('order_items')
        .update({ fulfillment_status: 'awaiting_inventory' })
        .eq('id', item.id);
      hasAwaitingInventory = true;
      continue;
    }

    const { data: config, error: configError } = await supabase
      .from('config_pool')
      .select('*')
      .eq('id', configId)
      .single();

    if (configError || !config) throw configError;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + item.duration_days);

    const { error: subError } = await supabase.from('subscriptions').insert({
      user_id: typedOrder.user_id,
      order_id: orderId,
      order_item_id: item.id,
      config_pool_id: config.id,
      product_name: item.product_name,
      product_tier: item.product_tier,
      country: item.country,
      city: item.city,
      protocol: config.protocol,
      server_ip: config.server_ip,
      server_label: config.server_label,
      subscription_url: config.subscription_url,
      config_uri_encrypted: config.config_uri_encrypted,
      traffic_gb: item.traffic_gb,
      expires_at: expiresAt.toISOString(),
      status: 'active',
    });

    if (subError) throw subError;

    await supabase
      .from('order_items')
      .update({ fulfillment_status: 'fulfilled', config_pool_id: config.id })
      .eq('id', item.id);

    fulfilledCount += 1;

    await writeAudit(supabase, 'config_assigned', 'order_item', item.id, {
      order_id: orderId,
      config_pool_id: config.id,
      external_id: config.external_id,
      oxapay_track_id: oxapayTrackId,
    }, actorId);

    await checkLowStockAndAlert(supabase, {
      product_tier: config.product_tier,
      country: config.country,
      city: config.city,
      protocol: config.protocol,
      traffic_gb: config.traffic_gb,
      duration_days: config.duration_days,
    });
  }

  let newStatus = 'active';
  if (hasAwaitingManual && fulfilledCount === 0) newStatus = 'awaiting_manual';
  else if (hasAwaitingInventory && fulfilledCount === 0) newStatus = 'awaiting_inventory';
  else if (hasAwaitingInventory || hasAwaitingManual) newStatus = 'provisioning';

  await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  let emailResult = null;
  if (fulfilledCount > 0) {
    try {
      emailResult = await sendConfigDeliveryEmailsForOrder(orderId, actorId);
    } catch (err) {
      console.error('Config delivery email failed:', err);
      await writeAudit(supabase, 'config_email_failed', 'order', orderId, {
        error: err instanceof Error ? err.message : String(err),
      }, actorId);
    }
  }

  if (hasAwaitingInventory) {
    const adminEmail = (await getEdgeSecret('ADMIN_ALERT_EMAIL', supabase)) ?? 'support@vpny.net';
    await sendResendEmail({
      to: adminEmail,
      subject: `[VPNy] Order awaiting inventory: ${orderId}`,
      html: `<p>Order <strong>${orderId}</strong> could not be fully fulfilled — config pool has no exact match. Please import configs and retry from the admin dashboard.</p>`,
    }, supabase).catch((err) => console.error('Admin alert failed', err));
  }

  return {
    orderId,
    fulfilled: fulfilledCount,
    status: newStatus,
    awaitingInventory: hasAwaitingInventory,
    awaitingManual: hasAwaitingManual,
    email: emailResult,
  };
}
