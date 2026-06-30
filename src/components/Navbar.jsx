import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, ShoppingCart, User, LogOut, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', section: 'home', target: null },
  { label: 'Plans', section: 'plans', target: '#plans-section' },
  { label: 'Client Portal', section: 'portal', target: null },
  { label: 'Guides', section: 'guides', target: '#guides-section' },
  { label: 'FAQ', section: 'faq', target: '#faq-section' },
];

export default function Navbar({
  activeSection,
  setActiveSection,
  cartCount,
  toggleCart,
  onLogin,
  onRegister,
  isAdmin,
}) {
  const { isAuthenticated, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNav = useCallback(
    (link) => {
      setActiveSection(link.section);
      setMobileOpen(false);

      if (link.target) {
        if (link.section !== 'home') {
          setActiveSection('home');
        }
        setTimeout(() => {
          const el = document.querySelector(link.target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else if (link.section === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [setActiveSection],
  );

  const handleLogout = async () => {
    await signOut();
    setActiveSection('home');
    setMobileOpen(false);
  };

  const navbarClass = `navbar${scrolled ? ' navbar--scrolled' : ''}`;

  return (
    <nav className={navbarClass}>
      <div className="container navbar__inner">
        <a
          href="/"
          className="navbar__logo"
          onClick={(e) => {
            e.preventDefault();
            handleNav({ label: 'Home', section: 'home', target: null });
          }}
        >
          <ShieldCheck className="navbar__logo-icon" />
          VPNy
          <span className="navbar__logo-dot">.net</span>
        </a>

        <ul className="navbar__links">
          {NAV_LINKS.map((link) => (
            <li key={link.section}>
              <button
                className={`navbar__link${activeSection === link.section ? ' navbar__link--active' : ''}`}
                onClick={() => handleNav(link)}
                type="button"
              >
                {link.label}
              </button>
            </li>
          ))}
          {isAdmin && (
            <li>
              <button
                className={`navbar__link${activeSection === 'admin' ? ' navbar__link--active' : ''}`}
                onClick={() => { setActiveSection('admin'); setMobileOpen(false); }}
                type="button"
              >
                Admin
              </button>
            </li>
          )}
        </ul>

        <div className="navbar__actions">
          <button
            className="icon-btn navbar__cart-btn"
            onClick={toggleCart}
            aria-label="Shopping cart"
            type="button"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="navbar__cart-count">{cartCount}</span>
            )}
          </button>

          {isAuthenticated ? (
            <button className="btn btn--outline btn--sm" onClick={handleLogout} type="button">
              <LogOut size={15} />
              Logout
            </button>
          ) : (
            <button className="btn btn--outline btn--sm" onClick={onLogin} type="button">
              <User size={15} />
              Login
            </button>
          )}

          <button
            className="btn btn--primary btn--sm"
            onClick={() => handleNav({ label: 'Plans', section: 'plans', target: '#plans-section' })}
            type="button"
          >
            Get Started
          </button>
        </div>

        <button
          className="navbar__mobile-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
          type="button"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="navbar__mobile-menu">
          {NAV_LINKS.map((link) => (
            <button
              key={link.section}
              className={`navbar__mobile-link${activeSection === link.section ? ' navbar__mobile-link--active' : ''}`}
              onClick={() => handleNav(link)}
              type="button"
            >
              {link.label}
            </button>
          ))}

          {isAdmin && (
            <button
              className={`navbar__mobile-link${activeSection === 'admin' ? ' navbar__mobile-link--active' : ''}`}
              onClick={() => { setActiveSection('admin'); setMobileOpen(false); }}
              type="button"
            >
              <Settings size={16} /> Admin
            </button>
          )}

          <div className="navbar__mobile-actions">
            <button
              className="icon-btn navbar__cart-btn"
              onClick={() => { toggleCart(); setMobileOpen(false); }}
              aria-label="Shopping cart"
              type="button"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="navbar__cart-count">{cartCount}</span>
              )}
            </button>

            {isAuthenticated ? (
              <button className="btn btn--outline btn--sm" onClick={handleLogout} type="button">
                <LogOut size={15} />
                Logout
              </button>
            ) : (
              <>
                <button className="btn btn--outline btn--sm" onClick={() => { onLogin(); setMobileOpen(false); }} type="button">
                  Login
                </button>
                <button className="btn btn--outline btn--sm" onClick={() => { onRegister(); setMobileOpen(false); }} type="button">
                  Register
                </button>
              </>
            )}

            <button
              className="btn btn--primary btn--sm"
              onClick={() => handleNav({ label: 'Plans', section: 'plans', target: '#plans-section' })}
              type="button"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
