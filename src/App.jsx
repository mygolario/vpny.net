import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Plans from './components/Plans';
import ConnectionGuides from './components/ConnectionGuides';
import PersianNotices from './components/PersianNotices';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { invokeFunction } from './lib/supabase';
import { ShoppingBag, X, CreditCard, ShieldCheck, ArrowRight, Loader2, ExternalLink } from 'lucide-react';

export default function App() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [lastOrderId, setLastOrderId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section) setActiveSection(section);
  }, []);

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
    setCart(prev => [...prev, { ...item, id: Date.now() + Math.random() }]);
    setCartOpen(true);
    setCheckoutStep('cart');
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0).toFixed(2);

  const openAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleProceedToPayment = () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    setCheckoutStep('checkout');
    setCheckoutError('');
  };

  const handleCreateOrder = async () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const result = await invokeFunction('create-order', {
        items: cart,
        paymentMethod: 'crypto',
      });

      setPaymentUrl(result.paymentUrl);
      setLastOrderId(result.orderId);
      setCheckoutStep('payment');

      if (result.paymentUrl && !result.paymentUrl.includes('demo=1')) {
        window.open(result.paymentUrl, '_blank');
      }
    } catch (err) {
      setCheckoutError(err.message ?? 'Failed to create order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setCheckoutStep('success');
    setTimeout(() => {
      setCart([]);
      setCartOpen(false);
      setActiveSection('portal');
      setCheckoutStep('cart');
      setPaymentUrl(null);
    }, 2200);
  };

  const renderMain = () => {
    if (activeSection === 'admin' && isAdmin) {
      return <AdminDashboard />;
    }
    if (activeSection === 'portal') {
      return <Dashboard />;
    }
    if (activeSection === 'home' || ['plans', 'guides', 'faq'].includes(activeSection)) {
      return (
        <main>
          <Hero />
          <Features />
          <Plans addToCart={addToCart} />
          <ConnectionGuides />
          <PersianNotices />
        </main>
      );
    }
    return <Dashboard />;
  };

  return (
    <>
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        cartCount={cart.length}
        toggleCart={() => setCartOpen(!cartOpen)}
        onLogin={() => openAuth('login')}
        onRegister={() => openAuth('register')}
        isAdmin={isAdmin}
      />

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {cartOpen && (
        <div className="drawer-overlay" onClick={() => setCartOpen(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer__header">
              <h3 className="drawer__title">
                <ShoppingBag size={18} className="drawer__title-icon" />
                {checkoutStep === 'cart' && 'Shopping Cart'}
                {checkoutStep === 'checkout' && 'Payment'}
                {checkoutStep === 'payment' && 'Pay with Crypto'}
                {checkoutStep === 'success' && 'Success'}
              </h3>
              <button className="icon-btn" onClick={() => setCartOpen(false)} type="button">
                <X size={18} />
              </button>
            </div>

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
                          <button className="drawer__item-remove" onClick={() => removeFromCart(item.id)} type="button">
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
                    onClick={handleProceedToPayment}
                    disabled={cart.length === 0}
                    type="button"
                  >
                    Proceed to Payment <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 'checkout' && (
              <>
                <div className="drawer__checkout">
                  <div className="drawer__checkout-header">
                    <CreditCard size={36} className="drawer__checkout-icon" />
                    <h4 className="drawer__checkout-title">Secure Crypto Payment</h4>
                    <p className="drawer__checkout-desc">
                      Pay with USDT, TRX, or BTC via OxaPay. Your config is provisioned automatically after payment confirms.
                    </p>
                  </div>

                  <div className="drawer__payment-options">
                    <button className="drawer__payment-btn drawer__payment-btn--active" type="button">
                      <span className="drawer__payment-btn-label">Crypto via OxaPay</span>
                      <span className="drawer__payment-btn-note drawer__payment-btn-note--green">USDT · TRX · BTC</span>
                    </button>
                  </div>

                  {checkoutError && <div className="auth-modal__error">{checkoutError}</div>}

                  <div className="drawer__legal">
                    By proceeding, you agree to our 24-hour refund SLA. Configs are provisioned automatically after payment confirmation.
                  </div>
                </div>

                <div className="drawer__checkout-actions">
                  <button className="btn btn--outline" style={{ flex: 1 }} onClick={() => setCheckoutStep('cart')} type="button">
                    Back
                  </button>
                  <button className="btn btn--primary" style={{ flex: 2 }} onClick={handleCreateOrder} disabled={checkoutLoading} type="button">
                    {checkoutLoading ? <Loader2 size={16} className="spin" /> : null}
                    Pay ${cartTotal}
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 'payment' && (
              <>
                <div className="drawer__checkout">
                  <h4 className="drawer__checkout-title">Complete payment in OxaPay</h4>
                  <p className="drawer__checkout-desc">
                    Order <code>{lastOrderId?.slice(0, 8)}…</code> — after payment confirms, your config will appear in the Client Portal and be emailed to you.
                  </p>
                  {paymentUrl && (
                    <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary" style={{ width: '100%' }}>
                      Open OxaPay <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                <div className="drawer__checkout-actions">
                  <button className="btn btn--outline" style={{ flex: 1 }} onClick={() => setCheckoutStep('checkout')} type="button">
                    Back
                  </button>
                  <button className="btn btn--primary" style={{ flex: 2 }} onClick={handlePaymentComplete} type="button">
                    I&apos;ve Paid
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 'success' && (
              <div className="drawer__success">
                <ShieldCheck size={56} className="drawer__success-icon" />
                <h4 className="drawer__success-title">Order Submitted</h4>
                <p className="drawer__success-desc">
                  Once payment confirms, your gateway will be provisioned. Redirecting to Client Portal…
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {renderMain()}
      <Footer />
    </>
  );
}
