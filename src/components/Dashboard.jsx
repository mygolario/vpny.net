import { useState } from 'react';
import { Copy, Check, Download, RefreshCw, Radio, Server, Globe } from 'lucide-react';

export default function Dashboard() {
  const [copiedSub, setCopiedSub] = useState(false);

  // Mock subscription data
  const sub = {
    name: 'VPNy Professional',
    location: 'Germany (Frankfurt)',
    ip: '185.190.140.42',
    trafficTotal: 100,
    trafficUsed: 42.4,
    trafficRemaining: 57.6,
    expires: '2026-07-21',
    status: 'Active',
    subLink: 'https://sub.vpny.net/api/v1/client/subscribe?token=YOUR_DECRYPTED_SUBSCRIBE_TOKEN'
  };

  const pct = Math.round((sub.trafficRemaining / sub.trafficTotal) * 100);
  const radius = 70;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const handleCopySubLink = () => {
    navigator.clipboard.writeText(sub.subLink);
    setCopiedSub(true);
    setTimeout(() => setCopiedSub(false), 2000);
  };

  return (
    <section className="dashboard">
      <div className="container">
        <div className="dashboard__header">
          <div>
            <h2 className="dashboard__title">Welcome Back</h2>
            <p className="dashboard__subtitle">Manage your active server connections, traffic usage, and configuration links.</p>
          </div>
          <div className="pill pill--green" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
            Gateways Healthy
          </div>
        </div>

        <div className="dashboard__grid">
          {/* Active Subscriptions Details */}
          <div className="card dashboard__main">
            <div className="dashboard__badge-row">
              <div>
                <span className="pill pill--gold" style={{ fontSize: '0.65rem', marginBottom: '6px' }}>VLESS / Trojan Node</span>
                <h3 className="dashboard__sub-name">{sub.name}</h3>
              </div>
              <span className="pill pill--green">{sub.status}</span>
            </div>

            <div className="dashboard__info-grid">
              <div className="dashboard__info-item">
                <p className="dashboard__info-label">Server Location</p>
                <p className="dashboard__info-value">
                  <Globe size={16} className="dashboard__info-value-icon" /> {sub.location}
                </p>
              </div>
              <div className="dashboard__info-item">
                <p className="dashboard__info-label">Target Server IP</p>
                <p className="dashboard__info-value">
                  <Server size={16} className="dashboard__info-value-icon" /> {sub.ip}
                </p>
              </div>
              <div className="dashboard__info-item">
                <p className="dashboard__info-label">Expiration Date</p>
                <p className="dashboard__info-value">{sub.expires} (in 1 Month)</p>
              </div>
              <div className="dashboard__info-item">
                <p className="dashboard__info-label">Config Type</p>
                <p className="dashboard__info-value">Xray Unified Sub</p>
              </div>
            </div>

            {/* Subscription Link & Config download */}
            <div className="dashboard__sub-section">
              <label className="dashboard__sub-label">
                Subscription URL (Hiddify / V2ray / Passwall)
              </label>
              <div className="dashboard__sub-input-row">
                <input
                  type="text"
                  readOnly
                  value={sub.subLink}
                  className="dashboard__input"
                />
                <button className="btn btn--outline" onClick={handleCopySubLink} style={{ padding: '0 16px' }}>
                  {copiedSub ? <Check size={18} style={{ color: 'var(--success)' }} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="dashboard__action-row">
              <button className="btn btn--primary" style={{ flex: 1 }}>
                <Download size={16} /> Download Config
              </button>
              <button className="btn btn--outline" style={{ flex: 1 }}>
                <RefreshCw size={16} /> Re-sync Node
              </button>
            </div>
          </div>

          {/* Side panel: Traffic Ring & announcements */}
          <div className="dashboard__sidebar">
            {/* Traffic progress */}
            <div className="card dashboard__progress">
              <div className="dashboard__progress-ring">
                <svg height="160" width="160">
                  <circle
                    className="dashboard__ring-bg"
                    r={radius}
                    cx="80"
                    cy="80"
                  />
                  <circle
                    className="dashboard__ring-fill"
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    r={radius}
                    cx="80"
                    cy="80"
                  />
                </svg>
                <div className="dashboard__ring-text">
                  <div className="dashboard__ring-pct">{pct}%</div>
                  <div className="dashboard__ring-label">Free</div>
                </div>
              </div>
              
              <div className="dashboard__traffic-info">
                Used <strong style={{ color: '#fff' }}>{sub.trafficUsed} GB</strong> of {sub.trafficTotal} GB
              </div>
              <div className="dashboard__traffic-hint">
                Resets automatically on next billing cycle.
              </div>
            </div>

            {/* Announcements */}
            <div className="card dashboard__announcements">
              <h4 className="dashboard__announcements-title">
                <Radio size={16} style={{ color: 'var(--accent)' }} /> Node Status & Updates
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="dashboard__announcement">
                  <div className="dashboard__announcement-meta">
                    <span>June 20, 2026</span>
                    <span className="dashboard__announcement-tag--info">Info</span>
                  </div>
                  <p className="dashboard__announcement-text">
                    New Vless-TLS configuration protocols have been deployed on Germany servers. Please update your subscription links.
                  </p>
                </div>

                <div className="dashboard__announcement">
                  <div className="dashboard__announcement-meta">
                    <span>May 15, 2026</span>
                    <span className="dashboard__announcement-tag--alert">Alert</span>
                  </div>
                  <p className="dashboard__announcement-text">
                    Major network disruptions detected on local MTN line operators. Secondary routing rules injected into global sub urls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
