import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';

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
  userLoggedIn,
  setUserLoggedIn,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNav = useCallback(
    (link) => {
      setActiveSection(link.section);
      setMobileOpen(false);

      if (link.target) {
        const el = document.querySelector(link.target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (link.section === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [setActiveSection],
  );

  const navbarClass = `navbar${scrolled ? ' navbar--scrolled' : ''}`;

  return (
    <nav className={navbarClass}>
      <div className="container navbar__inner">
        {/* Logo */}
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

        {/* Desktop links */}
        <ul className="navbar__links">
          {NAV_LINKS.map((link) => (
            <li key={link.section}>
              <button
                className={`navbar__link${activeSection === link.section ? ' navbar__link--active' : ''}`}
                onClick={() => handleNav(link)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="navbar__actions">
          <button
            className="icon-btn navbar__cart-btn"
            onClick={toggleCart}
            aria-label="Shopping cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="navbar__cart-count">{cartCount}</span>
            )}
          </button>

          {userLoggedIn ? (
            <button
              className="btn btn--outline btn--sm"
              onClick={() => setUserLoggedIn(false)}
            >
              <LogOut size={15} />
              Logout
            </button>
          ) : (
            <button
              className="btn btn--outline btn--sm"
              onClick={() => setUserLoggedIn(true)}
            >
              <User size={15} />
              Login
            </button>
          )}

          <button
            className="btn btn--primary btn--sm"
            onClick={() => handleNav({ label: 'Plans', section: 'plans', target: '#plans-section' })}
          >
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar__mobile-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar__mobile-menu">
          {NAV_LINKS.map((link) => (
            <button
              key={link.section}
              className={`navbar__mobile-link${activeSection === link.section ? ' navbar__mobile-link--active' : ''}`}
              onClick={() => handleNav(link)}
            >
              {link.label}
            </button>
          ))}

          <div className="navbar__mobile-actions">
            <button
              className="icon-btn navbar__cart-btn"
              onClick={() => { toggleCart(); setMobileOpen(false); }}
              aria-label="Shopping cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="navbar__cart-count">{cartCount}</span>
              )}
            </button>

            {userLoggedIn ? (
              <button
                className="btn btn--outline btn--sm"
                onClick={() => { setUserLoggedIn(false); setMobileOpen(false); }}
              >
                <LogOut size={15} />
                Logout
              </button>
            ) : (
              <button
                className="btn btn--outline btn--sm"
                onClick={() => { setUserLoggedIn(true); setMobileOpen(false); }}
              >
                <User size={15} />
                Login
              </button>
            )}

            <button
              className="btn btn--primary btn--sm"
              onClick={() => handleNav({ label: 'Plans', section: 'plans', target: '#plans-section' })}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
