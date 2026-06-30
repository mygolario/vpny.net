import { useCallback, useEffect, useState } from 'react';
import {
  Package, Users, Upload, RefreshCw, ClipboardList, Settings, Loader2, AlertTriangle,
} from 'lucide-react';
import { supabase, invokeFunction } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'pool', label: 'Config Pool', icon: Upload },
  { id: 'awaiting', label: 'Awaiting Inventory', icon: AlertTriangle },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'audit', label: 'Audit Log', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [pool, setPool] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError('');

    try {
      const [ordersRes, poolRes, inventoryRes, profilesRes, auditRes] = await Promise.all([
        supabase.from('orders').select('*, order_items(*), profiles(email, full_name)').order('created_at', { ascending: false }).limit(50),
        supabase.from('config_pool').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('config_pool_inventory').select('*'),
        supabase.from('profiles').select('id, email, full_name, role, created_at').order('created_at', { ascending: false }).limit(50),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (poolRes.error) throw poolRes.error;
      if (inventoryRes.error) throw inventoryRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (auditRes.error) throw auditRes.error;

      setOrders(ordersRes.data ?? []);
      setPool(poolRes.data ?? []);
      setInventory(inventoryRes.data ?? []);
      setCustomers(profilesRes.data ?? []);
      setAuditLogs(auditRes.data ?? []);
    } catch (err) {
      setError(err.message ?? 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const awaitingOrders = orders.filter((o) =>
    o.status === 'awaiting_inventory' || o.order_items?.some((i) => i.fulfillment_status === 'awaiting_inventory')
  );

  const handleImport = async () => {
    setActionLoading('import');
    setImportResult(null);
    try {
      let body;
      if (importText.trim().startsWith('{')) {
        body = JSON.parse(importText);
      } else {
        body = { csv: importText };
      }

      const configs = body.configs ?? parseCsvToConfigs(importText);
      const result = await invokeFunction('admin-import-pool', { configs });
      setImportResult(result);
      setImportText('');
      await loadData();
    } catch (err) {
      setImportResult({ error: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetryFulfill = async (orderId) => {
    setActionLoading(orderId);
    try {
      await invokeFunction('admin-retry-fulfill', { orderId });
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetireConfig = async (configId) => {
    setActionLoading(configId);
    try {
      const { error: updateError } = await supabase
        .from('config_pool')
        .update({ status: 'retired' })
        .eq('id', configId);
      if (updateError) throw updateError;
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <section className="dashboard">
        <div className="container">
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Admin Access Required</h2>
            <p className="dashboard__subtitle">Your account does not have admin privileges.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard admin-dashboard">
      <div className="container">
        <div className="dashboard__header">
          <div>
            <h2 className="dashboard__title">Admin Dashboard</h2>
            <p className="dashboard__subtitle">Manage orders, config pool inventory, and fulfillment.</p>
          </div>
          <button className="btn btn--outline btn--sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && <div className="auth-modal__error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <div className="admin-tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`admin-tabs__btn${tab === id ? ' admin-tabs__btn--active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={15} /> {label}
              {id === 'awaiting' && awaitingOrders.length > 0 && (
                <span className="admin-tabs__badge">{awaitingOrders.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="admin-loading"><Loader2 size={24} className="spin" /> Loading…</div>
        ) : (
          <>
            {tab === 'orders' && (
              <div className="admin-panel card">
                <h3>Recent Orders</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Track ID</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td><code>{order.id.slice(0, 8)}…</code></td>
                          <td>{order.profiles?.email}</td>
                          <td><span className={`pill pill--${statusColor(order.status)}`}>{order.status}</span></td>
                          <td>${Number(order.total_amount).toFixed(2)}</td>
                          <td><code>{order.oxapay_track_id ?? '—'}</code></td>
                          <td>
                            {(order.status === 'awaiting_inventory' || order.status === 'paid' || order.status === 'provisioning') && (
                              <button
                                className="btn btn--outline btn--sm"
                                disabled={actionLoading === order.id}
                                onClick={() => handleRetryFulfill(order.id)}
                              >
                                {actionLoading === order.id ? <Loader2 size={14} className="spin" /> : 'Retry Fulfill'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'pool' && (
              <div className="admin-panel-grid">
                <div className="card admin-panel">
                  <h3>Import Config Pool</h3>
                  <p className="dashboard__subtitle">Paste JSON or CSV. See docs/config-pool-example.json</p>
                  <textarea
                    className="admin-import-textarea"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='{"version":"1.0","configs":[...]}'
                    rows={10}
                  />
                  <button className="btn btn--primary" onClick={handleImport} disabled={!importText || actionLoading === 'import'}>
                    {actionLoading === 'import' ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                    Import Configs
                  </button>
                  {importResult && (
                    <pre className="admin-import-result">{JSON.stringify(importResult, null, 2)}</pre>
                  )}
                </div>

                <div className="card admin-panel">
                  <h3>Inventory Summary</h3>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Tier</th>
                          <th>Location</th>
                          <th>Protocol</th>
                          <th>Traffic</th>
                          <th>Days</th>
                          <th>Status</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.product_tier}</td>
                            <td>{row.country}{row.city ? ` (${row.city})` : ''}</td>
                            <td>{row.protocol}</td>
                            <td>{row.traffic_gb} GB</td>
                            <td>{row.duration_days}</td>
                            <td>{row.status}</td>
                            <td><strong>{row.count}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card admin-panel admin-panel--wide">
                  <h3>Config Pool ({pool.length})</h3>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>External ID</th>
                          <th>Protocol</th>
                          <th>Location</th>
                          <th>Traffic</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pool.map((cfg) => (
                          <tr key={cfg.id}>
                            <td><code>{cfg.external_id}</code></td>
                            <td>{cfg.protocol}</td>
                            <td>{cfg.country}{cfg.city ? ` (${cfg.city})` : ''}</td>
                            <td>{cfg.traffic_gb} GB / {cfg.duration_days}d</td>
                            <td>{cfg.status}</td>
                            <td>
                              {cfg.status === 'available' && (
                                <button
                                  className="btn btn--outline btn--sm"
                                  onClick={() => handleRetireConfig(cfg.id)}
                                  disabled={actionLoading === cfg.id}
                                >
                                  Retire
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tab === 'awaiting' && (
              <div className="card admin-panel">
                <h3>Awaiting Inventory ({awaitingOrders.length})</h3>
                {awaitingOrders.length === 0 ? (
                  <p className="dashboard__subtitle">No orders waiting for configs.</p>
                ) : (
                  awaitingOrders.map((order) => (
                    <div key={order.id} className="admin-awaiting-item">
                      <div>
                        <strong>{order.profiles?.email}</strong>
                        <div className="drawer__item-details">
                          {order.order_items?.map((item) => (
                            <span key={item.id}>
                              {item.product_name} · {item.country}{item.city ? ` (${item.city})` : ''} · {item.traffic_gb}GB · {item.duration_days}d
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => handleRetryFulfill(order.id)}
                        disabled={actionLoading === order.id}
                      >
                        Retry Fulfill
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'customers' && (
              <div className="card admin-panel">
                <h3>Customers</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.id}>
                          <td>{c.email}</td>
                          <td>{c.full_name ?? '—'}</td>
                          <td>{c.role}</td>
                          <td>{new Date(c.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'audit' && (
              <div className="card admin-panel">
                <h3>Audit Log</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Action</th>
                        <th>Entity</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{new Date(log.created_at).toLocaleString()}</td>
                          <td>{log.action}</td>
                          <td>{log.entity_type}</td>
                          <td><code>{JSON.stringify(log.metadata).slice(0, 80)}…</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <div className="card admin-panel">
                <h3>Settings</h3>
                <p className="dashboard__subtitle">
                  Configure secrets via Supabase Edge Function secrets: OXAPAY_MERCHANT_API_KEY, RESEND_API_KEY, ENCRYPTION_KEY, ADMIN_ALERT_EMAIL.
                </p>
                <ul className="admin-settings-list">
                  <li>Low stock threshold: 3 (edit in app_settings table)</li>
                  <li>Admin alert email: support@vpny.net</li>
                  <li>Creator tier orders require manual fulfillment</li>
                  <li>OxaPay webhook URL: <code>{import.meta.env.VITE_SUPABASE_URL}/functions/v1/oxapay-webhook</code></li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function statusColor(status) {
  if (status === 'active') return 'green';
  if (status === 'awaiting_inventory' || status === 'awaiting_manual') return 'gold';
  if (status === 'failed' || status === 'cancelled') return 'red';
  return 'muted';
}

function parseCsvToConfigs(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((header, i) => { row[header] = values[i] ?? ''; });
    return row;
  });
}
