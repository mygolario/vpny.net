import React, { useState } from 'react';
import { Smartphone, Monitor, ShieldAlert, Check, Copy } from 'lucide-react';

const GUIDES = {
  desktop: {
    title: 'Windows & macOS',
    icon: Monitor,
    steps: [
      'Download and install Hiddify Next or v2rayN client.',
      'Copy your VPNy subscription link from your client dashboard.',
      'In Hiddify: Click on "Add Profile" -> "Add from Clipboard". The app will automatically sync all available country servers.',
      'Click the Connect circle button in Hiddify to start browsing.',
      'Ensure "System Proxy" is enabled in settings to route all traffic.'
    ],
    code: `hiddify-cli.exe --profile "https://sub.vpny.net/api/v1/client/subscribe?token=e1a8f9c7..." --connect`
  },
  ios: {
    title: 'Apple iOS (iPhone/iPad)',
    icon: Smartphone,
    steps: [
      'Install FoXray, Hiddify Next, or Shadowrocket from the App Store.',
      'Copy your VPNy subscription link from the client dashboard.',
      'In FoXray: Navigate to "Sub Manager", tap "+" at top right, paste your URL, and label it "VPNy". Tap Save.',
      'Tap "Update All Subscriptions" to fetch active configurations.',
      'Navigate to the Home tab, select a low-ping server, and toggle the connection switch at the top.'
    ],
    code: `foxray://import?url=https%3A%2F%2Fsub.vpny.net%2Fapi%2Fv1%2Fclient%2Fsubscribe%3Ftoken%3De1a8f9c7...`
  },
  android: {
    title: 'Android Devices',
    icon: Smartphone,
    steps: [
      'Download and install Hiddify Next or v2rayNG from Google Play Store.',
      'Copy your VPNy subscription link.',
      'In v2rayNG: Open sidebar, tap "Subscription Groups", tap "+" icon, enter Name "VPNy" and paste your URL. Save.',
      'Open sidebar again, tap "Update Subscription" to pull active nodes.',
      'Choose a server node and tap the floating circular connect button at bottom right.'
    ],
    code: `v2rayng://add-subscription?url=https://sub.vpny.net/api/v1/client/subscribe?token=e1a8f9c7...`
  },
  router: {
    title: 'Routers & PassWall',
    icon: ShieldAlert,
    steps: [
      'Ensure your router is running OpenWrt with PassWall 2, ShadowSocksR Plus, or HomeProxy installed.',
      'Access your OpenWrt Luci panel, navigate to Services -> PassWall -> Subscription.',
      'Add a new subscription item: set Name as "VPNy", paste your subscription URL, and enable "Auto Update".',
      'Click "Save & Apply" and then click "Update All Nodes".',
      'Go to the Basic Settings tab, choose the default node from VPNy, and click Save & Apply to route your local network.'
    ],
    code: `# OpenWrt CLI Setup
uci add passwall subscription
uci set passwall.@subscription[-1].name='VPNy'
uci set passwall.@subscription[-1].url='https://sub.vpny.net/api/v1/client/subscribe?token=e1a8f9c7...'
uci commit passwall`
  }
};

export default function ConnectionGuides() {
  const [activeTab, setActiveTab] = useState('desktop');
  const [copied, setCopied] = useState(false);
  const guide = GUIDES[activeTab];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(guide.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="guides-section" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '16px' }}>Connection Guides</div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Configure Your Devices</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Follow our step-by-step setup guides to connect your mobile devices, workstations, or routers to the VPNy gateway network.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '30px' }}>
          {/* Tab Headers */}
          <div className="tabs-headers">
            {Object.keys(GUIDES).map(key => {
              const TabIcon = GUIDES[key].icon;
              return (
                <button
                  key={key}
                  className={`tab-header ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <TabIcon size={16} />
                  {GUIDES[key].title}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginTop: '24px' }}>
            <div>
              <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Connection Steps:</h4>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {guide.steps.map((step, idx) => (
                  <li key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Developer CLI & Scheme:</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                For quick imports or terminal execution, use the following URL scheme or configuration commands:
              </p>
              <div className="code-block-container">
                <pre className="code-block">{guide.code}</pre>
                <button className="copy-btn" onClick={handleCopyCode}>
                  {copied ? <Check size={14} style={{ color: 'var(--accent-green)' }} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
