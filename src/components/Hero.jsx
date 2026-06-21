import React from 'react';
import { Shield, Zap, Globe, Cpu, ChevronDown } from 'lucide-react';

export default function Hero() {
  const scrollToServices = () => {
    document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section" style={{ padding: '80px 0 60px 0', position: 'relative' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center' }}>
        <div className="hero-content">
          <div className="badge badge-purple" style={{ marginBottom: '20px' }}>
            <Shield size={14} /> Next-Gen Censorship Resistance
          </div>
          <h1 style={{ fontSize: '3.6rem', lineHeight: '1.1', marginBottom: '24px', fontWeight: '800' }}>
            Secure, Private & <br />
            <span className="gradient-text">High-Quality VPN</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '32px' }}>
            Engineered specifically for financial services, crypto traders, software developers, and AI professionals. 
            Keep your real IP fully hidden with zero DNS or WebRTC leaks under any local internet provider.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={scrollToServices} style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Explore Services <ChevronDown size={18} />
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
              }} 
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              Refund Policy & SLA
            </button>
          </div>

          <div style={{ display: 'flex', gap: '24px', marginTop: '48px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Global Network Coverage</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} style={{ color: 'var(--accent-green)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Up to 10Gbps Uplinks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} style={{ color: 'var(--accent-purple)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>AI Platforms Optimized</span>
            </div>
          </div>
        </div>

        <div className="hero-graphic" style={{ position: 'relative' }}>
          <div className="glass-panel" style={{ padding: '40px', position: 'relative', overflow: 'hidden', borderTop: '4px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></span>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></span>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></span>
              </div>
              <div className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Security Inspector</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>DNS Leak Protection</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>Active (0 Leaks)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>WebRTC Leak Protection</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>Active (IP Hidden)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>ISP Filtering Obstruction</span>
                <span style={{ color: 'var(--accent-purple)', fontWeight: '700' }}>Bypassed (VLESS+TLS)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>IPv4 Geolocation Lookup</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>City-Level Match</span>
              </div>
            </div>
            
            {/* Ambient inner glow */}
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', filter: 'blur(30px)' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
