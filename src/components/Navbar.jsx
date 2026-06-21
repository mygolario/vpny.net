import React from 'react';
import { ShoppingCart, User, ShieldCheck, LogOut, Menu } from 'lucide-react';

export default function Navbar({ 
  activeSection, 
  setActiveSection, 
  cartCount, 
  toggleCart, 
  userLoggedIn, 
  setUserLoggedIn 
}) {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <a href="#" className="logo-link" onClick={() => setActiveSection('home')}>
          <ShieldCheck size={26} className="logo-icon" style={{ marginRight: '8px', color: 'var(--accent-purple)' }} />
          VPNy<span>.net</span>
        </a>
        
        <div className="nav-links">
          <span 
            className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => setActiveSection('home')}
          >
            Home
          </span>
          <span 
            className={`nav-link ${activeSection === 'services' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('home');
              setTimeout(() => {
                document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Services
          </span>
          <span 
            className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            Client Portal
          </span>
          <span 
            className={`nav-link ${activeSection === 'guides' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('home');
              setTimeout(() => {
                document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Setup Guides
          </span>
          <span 
            className={`nav-link ${activeSection === 'faq' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('home');
              setTimeout(() => {
                document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            FAQ
          </span>
        </div>

        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleCart} title="Shopping Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
          
          {userLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '8px 14px' }}
                onClick={() => setActiveSection('dashboard')}
              >
                <User size={16} />
                Portal
              </button>
              <button 
                className="icon-btn" 
                onClick={() => {
                  setUserLoggedIn(false);
                  setActiveSection('home');
                }} 
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setUserLoggedIn(true);
                setActiveSection('dashboard');
              }}
            >
              <User size={16} />
              Login
            </button>
          )}

          <button 
            className="btn btn-primary pulse-glow"
            onClick={() => {
              setActiveSection('home');
              setTimeout(() => {
                document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Buy VPN
          </button>
        </div>
      </div>
    </nav>
  );
}
