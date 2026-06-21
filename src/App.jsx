import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductConfigurator from './components/ProductConfigurator';
import Dashboard from './components/Dashboard';
import ConnectionGuides from './components/ConnectionGuides';
import PersianNotices from './components/PersianNotices';
import Footer from './components/Footer';
import { X, ShoppingBag, ShieldCheck, ArrowRight, UserPlus, CreditCard } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('home'); // 'home' | 'dashboard'
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout' | 'success'

  const addToCart = (item) => {
    // Generate a unique ID for this cart item
    const newItem = { ...item, id: Date.now() };
    setCart([...cart, newItem]);
    setCartOpen(true);
    setCheckoutStep('cart');
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0).toFixed(2);

  const handleCheckout = () => {
    setCheckoutStep('success');
    // Simulate registering user and logging in
    setUserLoggedIn(true);
    setTimeout(() => {
      setCart([]);
      setCartOpen(false);
      setActiveSection('dashboard');
      setCheckoutStep('cart');
    }, 2000);
  };

  return (
    <>
      {/* Background Orbs */}
      <div className="bg-glow-container">
        <div className="bg-glow-orb-1"></div>
        <div className="bg-glow-orb-2"></div>
      </div>

      <Navbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        cartCount={cart.length}
        toggleCart={() => setCartOpen(!cartOpen)}
        userLoggedIn={userLoggedIn}
        setUserLoggedIn={setUserLoggedIn}
      />

      {/* Cart & Checkout Drawer */}
      {cartOpen && (
        <div className="drawer-overlay" onClick={() => setCartOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.2rem' }}>
                <ShoppingBag size={20} style={{ color: 'var(--accent-purple)' }} />
                {checkoutStep === 'cart' ? 'Shopping Cart' : checkoutStep === 'checkout' ? 'Crypto/Payment' : 'Success!'}
              </h3>
              <button className="icon-btn" onClick={() => setCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {checkoutStep === 'cart' && (
              <>
                <div className="cart-items">
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      Your cart is empty. Add configurations below.
                    </div>
                  ) : (
                    cart.map(item => (
                      <div className="cart-item" key={item.id}>
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700' }}>{item.product}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                            {item.country} ({item.city}) • {item.duration} • {item.traffic}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--accent-cyan)' }}>${item.price.toFixed(2)}</span>
                          <button 
                            className="icon-btn" 
                            onClick={() => removeFromCart(item.id)}
                            style={{ padding: '4px', color: 'var(--accent-orange)' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: '700' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total:</span>
                    <span style={{ fontSize: '1.3rem', color: '#fff' }}>${cartTotal}</span>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setCheckoutStep('checkout')}
                    disabled={cart.length === 0}
                    style={{ width: '100%', padding: '14px 0' }}
                  >
                    Proceed to Payment <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 'checkout' && (
              <>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <CreditCard size={40} style={{ color: 'var(--accent-cyan)', marginBottom: '12px' }} />
                    <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>Secure Payment Gateway</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                      Choose your payment option below. VPNy supports anonymous crypto checkouts.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🪙 Cryptocurrencies (USDT, TRX, BTC)
                      </span>
                      <span style={{ color: 'var(--accent-green)', fontSize: '0.75rem' }}>10% Disc.</span>
                    </button>
                    <button className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '16px' }}>
                      <span>💳 Local Payment Methods</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Shetab Card</span>
                    </button>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    🔒 By proceeding, you agree to our 24-hour refund SLA. Your connection configs will be automatically provisioned in your portal.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" onClick={() => setCheckoutStep('cart')} style={{ flex: 1 }}>
                    Back
                  </button>
                  <button className="btn btn-primary" onClick={handleCheckout} style={{ flex: 2 }}>
                    Simulate Payment
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 'success' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px' }}>
                <ShieldCheck size={60} style={{ color: 'var(--accent-green)', animation: 'pulse 1s infinite' }} />
                <h4 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '800' }}>Payment Confirmed!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '280px' }}>
                  Your gateway server is being provisioned. Redirecting to your Client Portal...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Pages Content routing */}
      {activeSection === 'home' ? (
        <>
          <Hero />
          <ProductConfigurator addToCart={addToCart} />
          <ConnectionGuides />
          <PersianNotices />
        </>
      ) : (
        <Dashboard />
      )}

      <Footer />
    </>
  );
}
