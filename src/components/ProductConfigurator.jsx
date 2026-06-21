import React, { useState, useEffect } from 'react';
import { Check, X, Shield, Globe, Cpu, Server, HelpCircle, HardDrive } from 'lucide-react';

const PRODUCTS = {
  general: {
    id: 'vpny-general',
    name: 'VPNy General',
    tagline: 'For Web Browsing and Social Media!',
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
    tagline: 'For Traders, Financials and Developers!',
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
      { name: 'Dynamic Secure IP rotation', checked: true },
      { name: 'Limited User Allocation per Server', checked: true },
      { name: 'Unlimited Connections & Devices', checked: true },
      { name: 'Dedicated Static IP', checked: false }
    ],
    bestFor: [
      'Crypto Exchanges (Binance, ByBit, MEXC, BingX, KuCoin, OKX, Gate.io, Coinbase, Bitget)',
      'Stock & Forex Trading (eToro, TradingView, MetaTrader 4/5, Interactive Brokers)',
      'Financial Services & Banks (PayPal, Skrill, Revolut, Wise, Payoneer, Stripe)',
      'Developers & Tech Tools (GitHub, GitLab, Docker, AWS, GCP, Vercel, postman, npm, PyPI)',
      'Standard AI Platforms (ChatGPT, Gemini, Claude, Grok, Copilot, Perplexity)'
    ],
    excludes: null
  },
  ultimate: {
    id: 'vpny-ultimate-ai',
    name: 'VPNy Ultimate AI',
    tagline: 'Optimized Connectivity for AI Platforms!',
    countries: {
      'Germany': ['Frankfurt'],
      'Sweden': ['Stockholm'],
      'Switzerland': ['Geneva'],
      'United Kingdom': ['London'],
      'United States': ['New York', 'Houston']
    },
    durations: [1, 3, 6],
    trafficOptions: [100], // Fixed
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
    tagline: 'For Content Creators, Teams and Companies!',
    countries: ['Canada', 'Germany', 'Netherlands', 'Switzerland', 'United States'],
    durations: [3, 6],
    trafficOptions: [500, 1000, 2500, 5000],
    specs: [
      { name: 'Private/Public DNS Configuration', checked: true },
      { name: 'Dedicated Server (No sharing with other clients)', checked: true },
      { name: 'Custom VPN Panel for User Management (V2Board/X-ui)', checked: true },
      { name: 'Dedicated 1 IPv4 + 1 IPv6 addresses', checked: true },
      { name: '1Gbps Uplink Port speed', checked: true },
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

export default function ProductConfigurator({ addToCart }) {
  const [selectedProduct, setSelectedProduct] = useState('general');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [duration, setDuration] = useState(1);
  const [traffic, setTraffic] = useState(100);
  const [dns, setDns] = useState('Public');
  const [price, setPrice] = useState(0);

  const productData = PRODUCTS[selectedProduct];

  // Reset defaults when changing product
  useEffect(() => {
    const data = PRODUCTS[selectedProduct];
    if (selectedProduct === 'general') {
      setCountry(data.countries[0]);
      setCity('');
      setDuration(1);
      setTraffic(50);
    } else if (selectedProduct === 'professional') {
      const firstCountry = Object.keys(data.countries)[0];
      setCountry(firstCountry);
      setCity(data.countries[firstCountry][0]);
      setDuration(1);
      setTraffic(50);
    } else if (selectedProduct === 'ultimate') {
      const firstCountry = Object.keys(data.countries)[0];
      setCountry(firstCountry);
      setCity(data.countries[firstCountry][0]);
      setDuration(1);
      setTraffic(100);
    } else if (selectedProduct === 'creator') {
      setCountry(data.countries[0]);
      setCity('');
      setDuration(3);
      setTraffic(500);
      setDns('Public DNS');
    }
  }, [selectedProduct]);

  // Adjust city list if country changes on Pro or Ultimate
  const handleCountryChange = (c) => {
    setCountry(c);
    if (selectedProduct === 'professional' || selectedProduct === 'ultimate') {
      const cities = PRODUCTS[selectedProduct].countries[c];
      setCity(cities[0]);
    }
  };

  // Calculate Price live
  useEffect(() => {
    let total = 0;
    if (selectedProduct === 'general') {
      // Base: $0.02 per GB per Month.
      // E.g., 50GB * 1M = $1.00. 200GB * 6M * 0.8 (discount) = $3.20/m * 6 = $19.20 total, range: $1.0 to $8.6 per month
      const monthlyRate = traffic * 0.02 * (duration === 1 ? 1 : duration === 3 ? 0.9 : 0.85);
      total = monthlyRate * duration;
    } else if (selectedProduct === 'professional') {
      // Base: $0.028 per GB per Month.
      // E.g., 50GB * 1M = $1.40. 100GB * 6M * 0.8 (discount) = $2.24/m * 6 = $13.44 total
      const monthlyRate = traffic * 0.028 * (duration === 1 ? 1 : duration === 3 ? 0.9 : 0.85);
      total = monthlyRate * duration;
    } else if (selectedProduct === 'ultimate') {
      // Fixed 100GB traffic. Price range is $2.5 to $10.6
      // Let's say: 1M is $2.50, 3M is $6.00 ($2.00/m), 6M is $10.60 ($1.77/m)
      if (duration === 1) total = 2.50;
      else if (duration === 3) total = 6.00;
      else total = 10.60;
    } else if (selectedProduct === 'creator') {
      // 3M or 6M duration. Traffic: 500, 1000, 2500, 5000. Price: $12.0 to $33.0
      // Let's say: 500GB for 3M is $12.00. 5000GB for 6M is $33.00
      let rate = 0;
      if (traffic === 500) rate = 4.0; // $4/m
      else if (traffic === 1000) rate = 4.8; // $4.8/m
      else if (traffic === 2500) rate = 5.8; // $5.8/m
      else rate = 6.8; // $6.8/m
      
      const monthlyRate = rate * (duration === 6 ? 0.85 : 1.0) + (dns === 'Private DNS' ? 0.5 : 0);
      total = monthlyRate * duration;
    }
    setPrice(parseFloat(total.toFixed(2)));
  }, [selectedProduct, duration, traffic, dns]);

  const handleAddToCart = () => {
    const configuration = {
      product: productData.name,
      country,
      city: city || 'Country-Level',
      duration: `${duration} ${duration === 1 ? 'Month' : 'Months'}`,
      traffic: `${traffic} GB`,
      dns: selectedProduct === 'creator' ? dns : undefined,
      price: price
    };
    addToCart(configuration);
  };

  return (
    <section id="services-section" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="badge badge-purple" style={{ marginBottom: '16px' }}>Interactive Configurator</div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Customize Your Network Gateway</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Choose a tier, select your preferred endpoint geography, and dial in the monthly traffic resources you need.
          </p>
        </div>

        {/* Product Tier Switches */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {Object.keys(PRODUCTS).map((key) => (
            <button
              key={key}
              className={`toggle-btn ${selectedProduct === key ? 'active' : ''}`}
              onClick={() => setSelectedProduct(key)}
              style={{ padding: '14px 24px', fontSize: '1rem', fontWeight: '700', minWidth: '160px' }}
            >
              {PRODUCTS[key].name}
            </button>
          ))}
        </div>

        <div className="configurator-grid">
          {/* Controls Panel */}
          <div className="glass-panel calculator-controls">
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>{productData.name}</h3>
              <p style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', fontWeight: '500' }}>{productData.tagline}</p>
            </div>

            {/* Country Selector */}
            <div className="control-group">
              <label className="control-label">
                <span>Select Country</span>
                <span className="val">{country}</span>
              </label>
              <div className="toggle-buttons">
                {Array.isArray(productData.countries) 
                  ? productData.countries.map(c => (
                      <button 
                        key={c} 
                        className={`toggle-btn ${country === c ? 'active' : ''}`} 
                        onClick={() => handleCountryChange(c)}
                      >
                        {c}
                      </button>
                    ))
                  : Object.keys(productData.countries).map(c => (
                      <button 
                        key={c} 
                        className={`toggle-btn ${country === c ? 'active' : ''}`} 
                        onClick={() => handleCountryChange(c)}
                      >
                        {c}
                      </button>
                    ))
                }
              </div>
            </div>

            {/* City Selector (if available) */}
            {(selectedProduct === 'professional' || selectedProduct === 'ultimate') && (
              <div className="control-group">
                <label className="control-label">
                  <span>Select City Geolocation</span>
                  <span className="val">{city}</span>
                </label>
                <div className="toggle-buttons">
                  {productData.countries[country]?.map(cit => (
                    <button 
                      key={cit} 
                      className={`toggle-btn ${city === cit ? 'active' : ''}`} 
                      onClick={() => setCity(cit)}
                    >
                      {cit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration Selector */}
            <div className="control-group">
              <label className="control-label">
                <span>Subscription Duration</span>
                <span className="val">{duration} {duration === 1 ? 'Month' : 'Months'}</span>
              </label>
              <div className="toggle-buttons">
                {productData.durations.map(d => (
                  <button 
                    key={d} 
                    className={`toggle-btn ${duration === d ? 'active' : ''}`} 
                    onClick={() => setDuration(d)}
                  >
                    {d} {d === 1 ? 'Month' : 'Months'}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Traffic Limit */}
            <div className="control-group">
              <label className="control-label">
                <span>Monthly Traffic Bandwidth</span>
                <span className="val">{traffic} GB</span>
              </label>
              {productData.trafficOptions.length > 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="range"
                    className="range-slider"
                    min="0"
                    max={productData.trafficOptions.length - 1}
                    step="1"
                    value={productData.trafficOptions.indexOf(traffic)}
                    onChange={(e) => setTraffic(productData.trafficOptions[parseInt(e.target.value)])}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {productData.trafficOptions.map(opt => (
                      <span key={opt}>{opt} GB</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  This product has a fixed high-speed allocation of <strong>100 GB</strong>.
                </div>
              )}
            </div>

            {/* DNS Customization (Creator Only) */}
            {selectedProduct === 'creator' && (
              <div className="control-group">
                <label className="control-label">
                  <span>DNS Type</span>
                  <span className="val">{dns}</span>
                </label>
                <div className="toggle-buttons">
                  {['Public DNS', 'Private DNS'].map(d => (
                    <button 
                      key={d} 
                      className={`toggle-btn ${dns === d ? 'active' : ''}`} 
                      onClick={() => setDns(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkout/Summary Card */}
          <div className="glass-panel pricing-summary-card">
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#fff' }}>Summary & Specs</h3>
              
              <div className="pricing-price-display">
                <span className="currency">$</span>
                <span className="amount">{price}</span>
                <span className="period"> / total</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Equivalent to ${(price / duration).toFixed(2)} / month
                </div>
              </div>

              <div className="pricing-specs-list">
                {productData.specs.map((spec, i) => (
                  <div className="pricing-spec-item" key={i}>
                    {spec.checked ? (
                      <Check size={16} style={{ color: 'var(--accent-green)' }} />
                    ) : (
                      <X size={16} style={{ color: 'var(--accent-orange)' }} />
                    )}
                    <span style={{ textDecoration: spec.checked ? 'none' : 'line-through', opacity: spec.checked ? 1 : 0.5 }}>
                      {spec.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button className="btn btn-primary pulse-glow" onClick={handleAddToCart} style={{ width: '100%', padding: '14px 0', fontSize: '1rem' }}>
                Add Configuration to Cart
              </button>
              
              <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Instant setup. Cancel or change configuration within 24 hours.
              </div>
            </div>
          </div>
        </div>

        {/* Target Vibe / Exclude Details */}
        <div className="glass-panel" style={{ marginTop: '32px', padding: '30px' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: 'var(--accent-cyan)' }} /> Platform Target Compatibility
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {productData.bestFor.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          {productData.excludes && (
            <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.15)', borderRadius: '8px', fontSize: '0.85rem', color: '#fdba74', lineHeight: '1.5' }}>
              <strong>Notice:</strong> {productData.excludes}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
