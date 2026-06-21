import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Plans from './components/Plans';
import ConnectionGuides from './components/ConnectionGuides';
import PersianNotices from './components/PersianNotices';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import { ShoppingBag, X, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart');

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [activeSection]);

  const addToCart = useCallback((item) => {
    setCart(prev => [...prev, { ...item, id: Date.now() }]);
    setCartOpen(true);
    setCheckoutStep('cart');
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0).toFixed(2);

  const handleCheckout = () => {
    setCheckoutStep('success');
    setUserLoggedIn(true);
    setTimeout(() => {
      setCart([]);
      setCartOpen(false);
      setActiveSection('dashboard');
      setCheckoutStep('cart');
    }, 2200);
  };

  return (
    <>
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        cartCount={cart.length}
        toggleCart={() => setCartOpen(!cartOpen)}
        userLoggedIn={userLoggedIn}
        setUserLoggedIn={setUserLoggedIn}
      />

      {/* ── Cart & Checkout Drawer ── */}
      {cartOpen && (
        <div className="drawer-overlay" onClick={() => setCartOpen(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer__header">
              <h3 className="drawer__title">
                <ShoppingBag size={18} className="drawer__title-icon" />
                {checkoutStep === 'cart' ? 'Shopping Cart' : checkoutStep === 'checkout' ? 'Payment' : 'Success'}
              </h3>
              <button className="icon-btn" onClick={() => setCartOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Cart view */}
            {checkoutStep === 'cart' && (
              <>
                <div className="drawer__body">
                  {cart.length === 0 ? (
                    <div className="drawer__empty">
                      Your cart is empty.<br />Configure a plan below to get started.
                    </div>
                  ) : (
                    cart.map(item => (
                      <div className="drawer__item" key={item.id}>
                        <div>
                          <div className="drawer__item-name">{item.product}</div>
                          <div className="drawer__item-details">
                            {item.country}{item.city && item.city !== 'Country-Level' ? ` (${item.city})` : ''} · {item.duration} · {item.traffic}
                          </div>
                        </div>
                        <div className="drawer__item-right">
                          <span className="drawer__item-price">${item.price.toFixed(2)}</span>
                          <button className="drawer__item-remove" onClick={() => removeFromCart(item.id)}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="drawer__footer">
                  <div className="drawer__total">
                    <span className="drawer__total-label">Total</span>
                    <span className="drawer__total-amount">${cartTotal}</span>
                  </div>
                  <button
                    className="btn btn--primary btn--lg"
                    style={{ width: '100%' }}
                    onClick={() => setCheckoutStep('checkout')}
                    disabled={cart.length === 0}
                  >
                    Proceed to Payment <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {/* Checkout view */}
            {checkoutStep === 'checkout' && (
              <>
                <div className="drawer__checkout">
                  <div className="drawer__checkout-header">
                    <CreditCard size={36} className="drawer__checkout-icon" />
                    <h4 className="drawer__checkout-title">Secure Payment</h4>
                    <p className="drawer__checkout-desc">
                      Choose your payment method. VPNy supports anonymous crypto checkouts.
                    </p>
                  </div>

                  <div className="drawer__payment-options">
                    <button className="drawer__payment-btn">
                      <span className="drawer__payment-btn-label">🪙 Crypto (USDT, TRX, BTC)</span>
                      <span className="drawer__payment-btn-note drawer__payment-btn-note--green">10% Off</span>
                    </button>
                    <button className="drawer__payment-btn">
                      <span className="drawer__payment-btn-label">💳 Local Payment (Shetab)</span>
                      <span className="drawer__payment-btn-note drawer__payment-btn-note--muted">IRR</span>
                    </button>
                  </div>

                  <div className="drawer__legal">
                    🔒 By proceeding, you agree to our 24-hour refund SLA. Configs are provisioned automatically.
                  </div>
                </div>

                <div className="drawer__checkout-actions">
                  <button className="btn btn--outline" style={{ flex: 1 }} onClick={() => setCheckoutStep('cart')}>
                    Back
                  </button>
                  <button className="btn btn--primary" style={{ flex: 2 }} onClick={handleCheckout}>
                    Complete Purchase
                  </button>
                </div>
              </>
            )}

            {/* Success view */}
            {checkoutStep === 'success' && (
              <div className="drawer__success">
                <ShieldCheck size={56} className="drawer__success-icon" />
                <h4 className="drawer__success-title">Payment Confirmed</h4>
                <p className="drawer__success-desc">
                  Your gateway is being provisioned. Redirecting to Client Portal…
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      {activeSection === 'home' ? (
        <main>
          <Hero />
          <Features />
          <Plans addToCart={addToCart} />
          <ConnectionGuides />
          <PersianNotices />
        </main>
      ) : (
        <Dashboard />
      )}

      <Footer />
    </>
  );
}
