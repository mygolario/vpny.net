import { useState } from 'react';
import { Check, X, Globe } from 'lucide-react';

const PRODUCTS = {
  general: {
    id: 'vpny-general',
    name: 'VPNy General',
    tagline: 'For Web Browsing and Social Media',
    countries: ['Canada', 'France', 'Germany', 'Netherlands', 'Norway', 'Turkey', 'United Kingdom', 'United States'],
    durations: [1, 3, 6],
    trafficOptions: [50, 100, 200],
    specs: [
      { name: 'Public DNS Integration', checked: true },
      { name: 'Zero DNS Leaks Guaranteed', checked: true },
      { name: 'Zero WebRTC Leaks (Real IP Hidden)', checked: true },
      { name: 'Country-level Geolocation Accuracy', checked: true },
      { name: 'Standard User Resource Share', checked: true },
      { name: 'Unlimited Connections & Devices', checked: true },
      { name: 'Dedicated Static IP', checked: false }
    ],
    bestFor: [
      'General Web Browsing (Chrome Web Store, Wikipedia, Medium, Stack Overflow)',
      'Social Media & Messaging (Instagram, Telegram, WhatsApp, YouTube, X, TikTok, Reddit)',
      'Streaming & Gaming (Netflix, Prime, Steam, PSN, Xbox Live, Twitch)'
    ],
    excludes: 'AI platforms, financial services, and cryptocurrency exchanges may work, but connection is not guaranteed. Please consider VPNy Professional or Ultimate AI.'
  },
  professional: {
    id: 'vpny-professional',
    name: 'VPNy Professional',
    tagline: 'For Traders, Financials and Developers',
    countries: {
      'United States': ['New York', 'Los Angeles', 'Columbus'],
      'United Kingdom': ['London'],
      'Germany': ['Frankfurt', 'Berlin'],
      'Netherlands': ['Amsterdam', 'Haarlem'],
      'Canada': ['Toronto'],
      'Australia': ['Sydney'],
      'Austria': ['Vienna'],
      'Sweden': ['Stockholm'],
      'Switzerland': ['Zurich'],
      'Poland': ['Warsaw'],
      'Turkey': ['Istanbul'],
      'India': ['Mumbai'],
      'Bulgaria': ['Sofia'],
      'Mexico': ['Queretaro'],
      'Azerbaijan': ['Baku'],
      'Nigeria': ['Lagos']
    },
    durations: [1, 3, 6],
    trafficOptions: [50, 100],
    specs: [
      { name: 'Private DNS Integration', checked: true },
      { name: 'Zero DNS Leaks Guaranteed', checked: true },
      { name: 'Zero WebRTC Leaks (Real IP Hidden)', checked: true },
      { name: 'City-level Geolocation Accuracy', checked: true },
      { name: 'Dynamic Secure IP Rotation', checked: true },
      { name: 'Limited User Allocation per Server', checked: true },
      { name: 'Unlimited Connections & Devices', checked: true },
      { name: 'Dedicated Static IP', checked: false }
    ],
    bestFor: [
      'Crypto Exchanges (Binance, ByBit, MEXC, BingX, KuCoin, OKX, Gate.io, Coinbase, Bitget)',
      'Stock & Forex Trading (eToro, TradingView, MetaTrader 4/5, Interactive Brokers)',
      'Financial Services & Banks (PayPal, Skrill, Revolut, Wise, Payoneer, Stripe)',
      'Developers & Tech Tools (GitHub, GitLab, Docker, AWS, GCP, Vercel, Postman, npm, PyPI)',
      'Standard AI Platforms (ChatGPT, Gemini, Claude, Grok, Copilot, Perplexity)'
    ],
    excludes: null
  },
  ultimate: {
    id: 'vpny-ultimate-ai',
    name: 'VPNy Ultimate AI',
    tagline: 'Optimized Connectivity for AI Platforms',
    countries: {
      'Germany': ['Frankfurt'],
      'Sweden': ['Stockholm'],
      'Switzerland': ['Geneva'],
      'United Kingdom': ['London'],
      'United States': ['New York', 'Houston']
    },
    durations: [1, 3, 6],
    trafficOptions: [100],
    specs: [
      { name: 'Private DNS Integration', checked: true },
      { name: 'Zero DNS Leaks Guaranteed', checked: true },
      { name: 'Zero WebRTC Leaks (Real IP Hidden)', checked: true },
      { name: 'Dedicated Static IP (genuine IPv4/v6)', checked: true },
      { name: 'City-level Geolocation Accuracy', checked: true },
      { name: '10Gbps Uplink Port Speed', checked: true },
      { name: 'Extremely Limited Users (Highest resource share)', checked: true },
      { name: 'Unlimited Connections & Devices', checked: true }
    ],
    bestFor: [
      'Customized AI Platforms Routing (ChatGPT, Claude, Gemini, Midjourney, Cursor, Hugging Face, DeepSeek, Stable Diffusion, ElevenLabs, Replit, Notion, Grammarly)',
      'Professional Web Scraping & AI agents testing',
      'All benefits of Professional Tier with static IP guarantees and maximum connection stability'
    ],
    excludes: null
  },
  creator: {
    id: 'vpny-creator',
    name: 'VPNy Creator',
    tagline: 'For Content Creators, Teams and Companies',
    countries: ['Canada', 'Germany', 'Netherlands', 'Switzerland', 'United States'],
    durations: [3, 6],
    trafficOptions: [500, 1000, 2500, 5000],
    specs: [
      { name: 'Private/Public DNS Configuration', checked: true },
      { name: 'Dedicated Server (No sharing with other clients)', checked: true },
      { name: 'Custom VPN Panel for User Management (V2Board/X-ui)', checked: true },
      { name: 'Dedicated 1 IPv4 + 1 IPv6 addresses', checked: true },
      { name: '1Gbps Uplink Port Speed', checked: true },
      { name: 'Tested & Optimized for MCI, TCI, and MTN networks', checked: true },
      { name: 'Create custom configs for teams, families, and groups', checked: true }
    ],
    bestFor: [
      'Content Creators & YouTube Teams requiring high uploading speeds',
      'Companies & Remote Teams needing a dedicated corporate gateway',
      'Individuals wishing to resell accounts or manage their family connectivity'
    ],
    excludes: null
  }
};

export default function Plans({ addToCart }) {
  const [selectedProduct, setSelectedProduct] = useState('general');
  const [country, setCountry] = useState('Canada');
  const [city, setCity] = useState('');
  const [duration, setDuration] = useState(1);
  const [traffic, setTraffic] = useState(50);
  const [dns, setDns] = useState('Public DNS');

  const productData = PRODUCTS[selectedProduct];

  const handleProductChange = (prodKey) => {
    setSelectedProduct(prodKey);
    const data = PRODUCTS[prodKey];
    if (prodKey === 'general') {
      setCountry(data.countries[0]);
      setCity('');
      setDuration(1);
      setTraffic(50);
    } else if (prodKey === 'professional') {
      const firstCountry = Object.keys(data.countries)[0];
      setCountry(firstCountry);
      setCity(data.countries[firstCountry][0]);
      setDuration(1);
      setTraffic(50);
    } else if (prodKey === 'ultimate') {
      const firstCountry = Object.keys(data.countries)[0];
      setCountry(firstCountry);
      setCity(data.countries[firstCountry][0]);
      setDuration(1);
      setTraffic(100);
    } else if (prodKey === 'creator') {
      setCountry(data.countries[0]);
      setCity('');
      setDuration(3);
      setTraffic(500);
      setDns('Public DNS');
    }
  };

  const handleCountryChange = (c) => {
    setCountry(c);
    if (selectedProduct === 'professional' || selectedProduct === 'ultimate') {
      const cities = PRODUCTS[selectedProduct].countries[c];
      setCity(cities[0]);
    }
  };

  // Derived price calculation
  let price = 0;
  if (selectedProduct === 'general') {
    const monthlyRate = traffic * 0.02 * (duration === 1 ? 1 : duration === 3 ? 0.9 : 0.85);
    price = parseFloat((monthlyRate * duration).toFixed(2));
  } else if (selectedProduct === 'professional') {
    const monthlyRate = traffic * 0.028 * (duration === 1 ? 1 : duration === 3 ? 0.9 : 0.85);
    price = parseFloat((monthlyRate * duration).toFixed(2));
  } else if (selectedProduct === 'ultimate') {
    if (duration === 1) price = 2.50;
    else if (duration === 3) price = 6.00;
    else price = 10.60;
  } else if (selectedProduct === 'creator') {
    let rate;
    if (traffic === 500) rate = 4.0;
    else if (traffic === 1000) rate = 4.8;
    else if (traffic === 2500) rate = 5.8;
    else rate = 6.8;
    const monthlyRate = rate * (duration === 6 ? 0.85 : 1.0) + (dns === 'Private DNS' ? 0.5 : 0);
    price = parseFloat((monthlyRate * duration).toFixed(2));
  }

  const handleAddToCart = () => {
    addToCart({
      product: productData.name,
      product_tier: selectedProduct,
      product_id: productData.id,
      country,
      city: city || 'Country-Level',
      duration: `${duration} ${duration === 1 ? 'Month' : 'Months'}`,
      duration_months: duration,
      duration_days: duration * 30,
      traffic: `${traffic} GB`,
      traffic_gb: traffic,
      dns: selectedProduct === 'creator' ? dns : undefined,
      price,
    });
  };

  const countryList = Array.isArray(productData.countries)
    ? productData.countries
    : Object.keys(productData.countries);

  const hasCities = selectedProduct === 'professional' || selectedProduct === 'ultimate';

  return (
    <section id="plans-section" className="plans">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-label">Interactive Configurator</div>
          <h2 className="section-title">Customize your gateway.</h2>
          <p className="section-subtitle">
            Choose a tier, select your preferred endpoint, and configure traffic to match your needs.
          </p>
        </div>

        {/* Tier selector */}
        <div className="plans__tiers reveal">
          {Object.keys(PRODUCTS).map(key => (
            <button
              key={key}
              className={`plans__tier-btn ${selectedProduct === key ? 'plans__tier-btn--active' : ''}`}
              onClick={() => handleProductChange(key)}
            >
              {PRODUCTS[key].name}
            </button>
          ))}
        </div>

        {/* Configurator */}
        <div className="plans__configurator reveal">
          {/* Controls */}
          <div className="plans__controls">
            <div className="plans__header">
              <div className="plans__product-name">{productData.name}</div>
              <div className="plans__product-tagline">{productData.tagline}</div>
            </div>

            {/* Country */}
            <div className="plans__control-group">
              <label className="plans__control-label">
                <span>Select Country</span>
                <span className="plans__control-value">{country}</span>
              </label>
              <div className="plans__toggle-group">
                {countryList.map(c => (
                  <button
                    key={c}
                    className={`plans__toggle-btn ${country === c ? 'plans__toggle-btn--active' : ''}`}
                    onClick={() => handleCountryChange(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            {hasCities && (
              <div className="plans__control-group">
                <label className="plans__control-label">
                  <span>City Geolocation</span>
                  <span className="plans__control-value">{city}</span>
                </label>
                <div className="plans__toggle-group">
                  {productData.countries[country]?.map(cit => (
                    <button
                      key={cit}
                      className={`plans__toggle-btn ${city === cit ? 'plans__toggle-btn--active' : ''}`}
                      onClick={() => setCity(cit)}
                    >
                      {cit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="plans__control-group">
              <label className="plans__control-label">
                <span>Duration</span>
                <span className="plans__control-value">
                  {duration} {duration === 1 ? 'Month' : 'Months'}
                </span>
              </label>
              <div className="plans__toggle-group">
                {productData.durations.map(d => (
                  <button
                    key={d}
                    className={`plans__toggle-btn ${duration === d ? 'plans__toggle-btn--active' : ''}`}
                    onClick={() => setDuration(d)}
                  >
                    {d} {d === 1 ? 'Month' : 'Months'}
                  </button>
                ))}
              </div>
            </div>

            {/* Traffic */}
            <div className="plans__control-group">
              <label className="plans__control-label">
                <span>Monthly Traffic</span>
                <span className="plans__control-value">{traffic} GB</span>
              </label>
              {productData.trafficOptions.length > 1 ? (
                <>
                  <input
                    type="range"
                    className="plans__slider"
                    min="0"
                    max={productData.trafficOptions.length - 1}
                    step="1"
                    value={productData.trafficOptions.indexOf(traffic)}
                    onChange={(e) => setTraffic(productData.trafficOptions[parseInt(e.target.value)])}
                  />
                  <div className="plans__slider-labels">
                    {productData.trafficOptions.map(opt => (
                      <span key={opt}>{opt} GB</span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="plans__fixed-note">
                  Fixed high-speed allocation of <strong>100 GB</strong> per month.
                </div>
              )}
            </div>

            {/* DNS (Creator only) */}
            {selectedProduct === 'creator' && (
              <div className="plans__control-group">
                <label className="plans__control-label">
                  <span>DNS Type</span>
                  <span className="plans__control-value">{dns}</span>
                </label>
                <div className="plans__toggle-group">
                  {['Public DNS', 'Private DNS'].map(d => (
                    <button
                      key={d}
                      className={`plans__toggle-btn ${dns === d ? 'plans__toggle-btn--active' : ''}`}
                      onClick={() => setDns(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="plans__summary">
            <div>
              <div className="plans__summary-title">Summary & Specs</div>

              <div className="plans__price-display">
                <span className="plans__price-currency">$</span>
                <span className="plans__price-amount">{price}</span>
                <span className="plans__price-period"> / total</span>
                <div className="plans__price-monthly">
                  ≈ ${(price / duration).toFixed(2)} per month
                </div>
              </div>

              <div className="plans__specs-list">
                {productData.specs.map((spec, i) => (
                  <div className="plans__spec-item" key={i}>
                    {spec.checked ? (
                      <Check size={15} className="plans__spec-icon--check" />
                    ) : (
                      <X size={15} className="plans__spec-icon--cross" />
                    )}
                    <span className={spec.checked ? '' : 'plans__spec-text--disabled'}>
                      {spec.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button className="btn btn--primary plans__add-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <div className="plans__add-hint">
                Instant setup · 24-hour change window
              </div>
            </div>
          </div>
        </div>

        {/* Compatibility section */}
        <div className="plans__compatibility reveal">
          <h4 className="plans__compatibility-title">
            <Globe size={18} />
            Platform Compatibility
          </h4>
          <div className="plans__compatibility-list">
            {productData.bestFor.map((item, idx) => (
              <div className="plans__compatibility-item" key={idx}>
                <Check size={16} className="plans__compatibility-check" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          {productData.excludes && (
            <div className="plans__notice">
              <strong>Note:</strong> {productData.excludes}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
