import React from 'react';
import { Send, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '60px 0 30px 0', marginTop: '80px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        <div>
          <a href="#" className="logo-link" style={{ marginBottom: '16px' }}>
            <ShieldCheck size={24} style={{ marginRight: '8px', color: 'var(--accent-purple)' }} />
            VPNy<span>.net</span>
          </a>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '300px' }}>
            Secure, Private, and High-Quality VPN Services Tailored for Financial Services, Crypto Traders, Developers, and AI Professionals.
          </p>
        </div>

        <div>
          <h5 style={{ color: '#fff', fontSize: '1rem', marginBottom: '16px' }}>Services</h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>VPNy General</a></li>
            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>VPNy Professional</a></li>
            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>VPNy Ultimate AI</a></li>
            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>VPNy Creator</a></li>
          </ul>
        </div>

        <div>
          <h5 style={{ color: '#fff', fontSize: '1rem', marginBottom: '16px' }}>Information</h5>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact Us</a></li>
            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Services</a></li>
            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</a></li>
            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>SLA Agreement</a></li>
          </ul>
        </div>

        <div>
          <h5 style={{ color: '#fff', fontSize: '1rem', marginBottom: '16px' }}>Contact Support</h5>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '12px' }}>
            Need help or have pre-sales questions? Reach our team at:
          </p>
          <a 
            href="mailto:support@vpny.net" 
            style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Mail size={14} /> support@vpny.net
          </a>
        </div>
      </div>

      <div className="container" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Copyright © 2026 VPNy.net. All rights reserved.
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="https://t.me/VPNynet" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', hover: { color: '#fff' } }} title="Telegram">
            <Send size={18} />
          </a>
          <a href="https://x.com/VPNynet" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center' }} title="X (Twitter)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://instagram.com/VPNynet" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center' }} title="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
