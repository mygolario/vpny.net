import React, { useState } from 'react';
import { Copy, Check, Download, AlertCircle, RefreshCw, Radio, Server, FileText } from 'lucide-react';

export default function Dashboard() {
  const [copiedSub, setCopiedSub] = useState(false);
  const [copiedAnnounce, setCopiedAnnounce] = useState(false);

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
    subLink: 'https://sub.vpny.net/api/v1/client/subscribe?token=e1a8f9c73e920d3f820c78a0d9e'
  };

  const pct = Math.round((sub.trafficRemaining / sub.trafficTotal) * 100);
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const handleCopySubLink = () => {
    navigator.clipboard.writeText(sub.subLink);
    setCopiedSub(true);
    setTimeout(() => setCopiedSub(false), 2000);
  };

  return (
    <section style={{ padding: '60px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', color: '#fff' }}>Welcome Back, Client Portal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage your active server connections, traffic usage, and configuration links.</p>
          </div>
          <div className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }}></span>
            Gateways Healthy
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Active Subscriptions Details */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <span className="badge badge-purple" style={{ fontSize: '0.65rem', marginBottom: '6px' }}>VLESS / Trojan Node</span>
                <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{sub.name}</h3>
              </div>
              <span className="badge badge-green">{sub.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Server Location</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={16} style={{ color: 'var(--accent-cyan)' }} /> {sub.location}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Target Server IP</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Server size={16} style={{ color: 'var(--accent-purple)' }} /> {sub.ip}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Expiration Date</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginTop: '4px' }}>{sub.expires} (in 1 Month)</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Config Type</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginTop: '4px' }}>Xray Unified Sub</p>
              </div>
            </div>

            {/* Subscription Link & Config download */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Subscription URL (Hiddify / V2ray / Passwall)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={sub.subLink}
                  style={{
                    flex: 1,
                    background: '#06070a',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'var(--accent-cyan)',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
                <button className="btn btn-secondary" onClick={handleCopySubLink} style={{ padding: '0 16px' }}>
                  {copiedSub ? <Check size={18} style={{ color: 'var(--accent-green)' }} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>
                <Download size={16} /> Download Xray JSON Config
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }}>
                <RefreshCw size={16} /> Re-sync Server Node
              </button>
            </div>
          </div>

          {/* Side panel: Traffic Ring & announcements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Traffic progress */}
            <div className="glass-panel traffic-ring-container">
              <div className="progress-ring">
                <svg height={radius * 2} width={radius * 2}>
                  <circle
                    className="progress-ring-circle-bg"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  <circle
                    className="progress-ring-circle"
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                </svg>
                <div className="progress-ring-text">
                  <div className="progress-ring-percentage">{pct}%</div>
                  <div className="progress-ring-label">Free</div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Used <strong style={{ color: '#fff' }}>{sub.trafficUsed} GB</strong> of {sub.trafficTotal} GB
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Resets automatically on next billing cycle.
                </p>
              </div>
            </div>

            {/* Announcements */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={16} style={{ color: 'var(--accent-purple)' }} /> Node Status & Updates
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>June 20, 2026</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>Info</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    New Vless-TLS configuration protocols have been deployed on Germany servers. Please update your subscription links.
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>May 15, 2026</span>
                    <span style={{ color: 'var(--accent-orange)' }}>Alert</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
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
