import { useEffect, useState } from 'react';
import { Copy, Check, Download, RefreshCw, Radio, Server, Globe, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

function SubscriptionCard({ sub }) {
  const [copiedSub, setCopiedSub] = useState(false);
  const deliveryUrl = sub.subscription_url;
  const pct = sub.traffic_gb > 0
    ? Math.round(((sub.traffic_gb - Number(sub.traffic_used_gb)) / sub.traffic_gb) * 100)
    : 0;
  const radius = 70;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.max(pct, 0) / 100) * circumference;
  const location = sub.city ? `${sub.country} (${sub.city})` : sub.country;
  const expires = new Date(sub.expires_at).toLocaleDateString();
  const remaining = Math.max(sub.traffic_gb - Number(sub.traffic_used_gb), 0).toFixed(1);

  const handleCopySubLink = () => {
    if (!deliveryUrl) return;
    navigator.clipboard.writeText(deliveryUrl);
    setCopiedSub(true);
    setTimeout(() => setCopiedSub(false), 2000);
  };

  const handleDownload = () => {
    if (!deliveryUrl) return;
    window.open(deliveryUrl, '_blank');
  };

  return (
    <div className="card dashboard__main">
      <div className="dashboard__badge-row">
        <div>
          <span className="pill pill--gold" style={{ fontSize: '0.65rem', marginBottom: '6px' }}>
            {sub.protocol?.toUpperCase()} Node
          </span>
          <h3 className="dashboard__sub-name">{sub.product_name}</h3>
        </div>
        <span className={`pill pill--${sub.status === 'active' ? 'green' : 'muted'}`}>{sub.status}</span>
      </div>

      <div className="dashboard__info-grid">
        <div className="dashboard__info-item">
          <p className="dashboard__info-label">Server Location</p>
          <p className="dashboard__info-value">
            <Globe size={16} className="dashboard__info-value-icon" /> {location}
          </p>
        </div>
        <div className="dashboard__info-item">
          <p className="dashboard__info-label">Target Server IP</p>
          <p className="dashboard__info-value">
            <Server size={16} className="dashboard__info-value-icon" /> {sub.server_ip}
          </p>
        </div>
        <div className="dashboard__info-item">
          <p className="dashboard__info-label">Expiration Date</p>
          <p className="dashboard__info-value">{expires}</p>
        </div>
        <div className="dashboard__info-item">
          <p className="dashboard__info-label">Config Type</p>
          <p className="dashboard__info-value">
            {sub.subscription_url ? 'Subscription URL' : 'Direct URI (check email)'}
          </p>
        </div>
      </div>

      {deliveryUrl && (
        <div className="dashboard__sub-section">
          <label className="dashboard__sub-label">
            Subscription URL (Hiddify / V2ray / Passwall)
          </label>
          <div className="dashboard__sub-input-row">
            <input type="text" readOnly value={deliveryUrl} className="dashboard__input" />
            <button className="btn btn--outline" onClick={handleCopySubLink} style={{ padding: '0 16px' }} type="button">
              {copiedSub ? <Check size={18} style={{ color: 'var(--success)' }} /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      )}

      <div className="dashboard__action-row">
        <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleDownload} disabled={!deliveryUrl} type="button">
          <Download size={16} /> Download Config
        </button>
        <button className="btn btn--outline" style={{ flex: 1 }} onClick={handleCopySubLink} disabled={!deliveryUrl} type="button">
          <RefreshCw size={16} /> Copy Link
        </button>
      </div>

      <div className="dashboard__traffic-info" style={{ marginTop: '1rem' }}>
        Remaining <strong style={{ color: '#fff' }}>{remaining} GB</strong> of {sub.traffic_gb} GB
        <svg height="80" width="80" style={{ float: 'right' }}>
          <circle className="dashboard__ring-bg" r="30" cx="40" cy="40" />
          <circle
            className="dashboard__ring-fill"
            strokeDasharray={`${2 * Math.PI * 30} ${2 * Math.PI * 30}`}
            style={{ strokeDashoffset: 2 * Math.PI * 30 - (Math.max(pct, 0) / 100) * 2 * Math.PI * 30 }}
            r="30"
            cx="40"
            cy="40"
          />
        </svg>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSubscriptions = async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setSubscriptions(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSubscriptions();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <section className="dashboard">
        <div className="container admin-loading"><Loader2 size={24} className="spin" /> Loading portal…</div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="dashboard">
        <div className="container">
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 className="dashboard__title">Client Portal</h2>
            <p className="dashboard__subtitle">Sign in to view your active subscriptions and configuration links.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard">
      <div className="container">
        <div className="dashboard__header">
          <div>
            <h2 className="dashboard__title">Welcome Back</h2>
            <p className="dashboard__subtitle">Manage your active server connections, traffic usage, and configuration links.</p>
          </div>
          <div className="pill pill--green" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            Gateways Healthy
          </div>
        </div>

        {error && <div className="auth-modal__error" style={{ marginBottom: '1rem' }}>{error}</div>}

        {subscriptions.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3>No active subscriptions</h3>
            <p className="dashboard__subtitle">Complete a purchase to receive your configuration here automatically.</p>
          </div>
        ) : (
          <div className="dashboard__grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {subscriptions.map((sub) => (
                <SubscriptionCard key={sub.id} sub={sub} />
              ))}
            </div>

            <div className="dashboard__sidebar">
              <div className="card dashboard__announcements">
                <h4 className="dashboard__announcements-title">
                  <Radio size={16} style={{ color: 'var(--accent)' }} /> Node Status & Updates
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="dashboard__announcement">
                    <div className="dashboard__announcement-meta">
                      <span>Auto-provisioned</span>
                      <span className="dashboard__announcement-tag--info">Info</span>
                    </div>
                    <p className="dashboard__announcement-text">
                      Your configs are delivered automatically after payment. Import subscription links into Hiddify or v2rayNG.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
