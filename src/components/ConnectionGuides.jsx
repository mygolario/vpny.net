import { useState } from 'react';
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
    code: 'hiddify-cli.exe --profile "https://sub.vpny.net/api/v1/client/subscribe?token=YOUR_TOKEN_HERE" --connect'
  },
  ios: {
    title: 'Apple iOS',
    icon: Smartphone,
    steps: [
      'Install FoXray, Hiddify Next, or Shadowrocket from the App Store.',
      'Copy your VPNy subscription link from the client dashboard.',
      'In FoXray: Navigate to "Sub Manager", tap "+" at top right, paste your URL, and label it "VPNy". Tap Save.',
      'Tap "Update All Subscriptions" to fetch active configurations.',
      'Navigate to the Home tab, select a low-ping server, and toggle the connection switch at the top.'
    ],
    code: 'foxray://import?url=https%3A%2F%2Fsub.vpny.net%2Fapi%2Fv1%2Fclient%2Fsubscribe%3Ftoken%3DYOUR_TOKEN_HERE'
  },
  android: {
    title: 'Android',
    icon: Smartphone,
    steps: [
      'Download and install Hiddify Next or v2rayNG from Google Play Store.',
      'Copy your VPNy subscription link.',
      'In v2rayNG: Open sidebar, tap "Subscription Groups", tap "+" icon, enter Name "VPNy" and paste your URL. Save.',
      'Open sidebar again, tap "Update Subscription" to pull active nodes.',
      'Choose a server node and tap the floating circular connect button at bottom right.'
    ],
    code: 'v2rayng://add-subscription?url=https://sub.vpny.net/api/v1/client/subscribe?token=YOUR_TOKEN_HERE'
  },
  router: {
    title: 'OpenWrt Router',
    icon: ShieldAlert,
    steps: [
      'Ensure your router is running OpenWrt with PassWall 2, ShadowSocksR Plus, or HomeProxy installed.',
      'Access your OpenWrt Luci panel, navigate to Services -> PassWall -> Subscription.',
      'Add a new subscription item: set Name as "VPNy", paste your subscription URL, and enable "Auto Update".',
      'Click "Save & Apply" and then click "Update All Nodes".',
      'Go to the Basic Settings tab, choose the default node from VPNy, and click Save & Apply to route your local network.'
    ],
    code: '# OpenWrt CLI Setup\nuci add passwall subscription\nuci set passwall.@subscription[-1].name=\'VPNy\'\nuci set passwall.@subscription[-1].url=\'https://sub.vpny.net/api/v1/client/subscribe?token=YOUR_TOKEN_HERE\'\nuci commit passwall'
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
    <section className="guides" id="guides-section">
      <div className="container">
        {/* Section header */}
        <div className="section-header reveal">
          <span className="section-label">Connection Guides</span>
          <h2 className="section-title">Configure your devices.</h2>
          <p className="section-subtitle">
            Follow our step-by-step guides to connect your devices to VPNy.
          </p>
        </div>

        {/* Panel Card */}
        <div className="card guides__panel reveal">
          {/* Tab Headers */}
          <div className="guides__tabs">
            {Object.keys(GUIDES).map(key => {
              const TabIcon = GUIDES[key].icon;
              return (
                <button
                  key={key}
                  className={`guides__tab ${activeTab === key ? 'guides__tab--active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  <TabIcon size={16} />
                  {GUIDES[key].title}
                </button>
              );
            })}
          </div>

          {/* Content area */}
          <div className="guides__content">
            <div className="guides__steps-col">
              <h4 className="guides__steps-title">Connection Steps:</h4>
              <div className="guides__steps-list">
                {guide.steps.map((step, idx) => (
                  <div className="guides__step" key={idx}>
                    <div className="guides__step-number">{idx + 1}</div>
                    <div className="guides__step-text">{step}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="guides__code-col">
              <h4 className="guides__code-title">Developer CLI & Scheme:</h4>
              <p className="guides__code-desc">
                For quick imports or terminal execution, use the following URL scheme or configuration commands:
              </p>
              <div className="guides__code-block">
                <pre className="guides__code-pre">{guide.code}</pre>
                <button className="guides__copy-btn" onClick={handleCopyCode}>
                  {copied ? (
                    <>
                      <Check size={12} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
