
import { Send, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <a href="#" className="footer__brand-logo">
            <ShieldCheck size={20} className="footer__brand-dot" />
            VPNy<span className="footer__brand-dot">.net</span>
          </a>
          <p className="footer__brand-desc">
            Infrastructure-grade VPN for financial services, crypto trading, and AI development. Zero leaks. Zero compromises.
          </p>
        </div>

        <div>
          <h5 className="footer__group-title">Services</h5>
          <ul className="footer__links-list">
            <li><a href="#" className="footer__link">VPNy General</a></li>
            <li><a href="#" className="footer__link">VPNy Professional</a></li>
            <li><a href="#" className="footer__link">VPNy Ultimate AI</a></li>
            <li><a href="#" className="footer__link">VPNy Creator</a></li>
          </ul>
        </div>

        <div>
          <h5 className="footer__group-title">Information</h5>
          <ul className="footer__links-list">
            <li><a href="#" className="footer__link">Contact Us</a></li>
            <li><a href="#" className="footer__link">Terms of Services</a></li>
            <li><a href="#" className="footer__link">Privacy Policy</a></li>
            <li><a href="#" className="footer__link">SLA Agreement</a></li>
          </ul>
        </div>

        <div>
          <h5 className="footer__group-title">Contact Support</h5>
          <p className="footer__contact-text">
            Need help or have pre-sales questions? Reach our team at:
          </p>
          <a href="mailto:support@vpny.net" className="footer__contact-link">
            <Mail size={14} /> support@vpny.net
          </a>
        </div>
      </div>

      <div className="container footer__bottom">
        <p className="footer__copyright">
          Copyright © 2026 VPNy.net. All rights reserved.
        </p>

        <div className="footer__socials">
          <a href="https://t.me/VPNynet" target="_blank" rel="noopener noreferrer" className="footer__social-link" title="Telegram">
            <Send size={16} />
          </a>
          <a href="https://x.com/VPNynet" target="_blank" rel="noopener noreferrer" className="footer__social-link" title="X (Twitter)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://instagram.com/VPNynet" target="_blank" rel="noopener noreferrer" className="footer__social-link" title="Instagram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
