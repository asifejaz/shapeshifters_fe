import { useState, useEffect, createContext, useContext } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import api from '../../api';
import { Menu, X, Shield, Flame, MapPin, Phone, ShoppingBag } from 'lucide-react';
import logo from '../../assets/logo.webp';

const SiteContext = createContext(null);
export const useSiteData = () => useContext(SiteContext);

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
  );
}

function TikTokIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.69a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.12z" /></svg>
  );
}

export default function PublicLayout() {
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    api.get('/public/site-data').then((res) => {
      setSiteData(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => { setMobileMenu(false); }, [location]);

  useEffect(() => {
    const readCartCount = () => {
      try {
        const raw = localStorage.getItem('shop_cart');
        const cart = raw ? JSON.parse(raw) : [];
        const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    readCartCount();
    window.addEventListener('storage', readCartCount);
    window.addEventListener('cart-updated', readCartCount);
    return () => {
      window.removeEventListener('storage', readCartCount);
      window.removeEventListener('cart-updated', readCartCount);
    };
  }, [location]);

  if (loading) {
    return (
      <div className="forge-theme flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-[var(--forge-primary)] opacity-40 blur-2xl animate-pulse-ember" />
            <img src={logo} alt="" className="relative h-20 w-20 mx-auto" />
          </div>
          <p className="mt-4 text-[var(--forge-muted)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const settings = siteData?.settings || {};
  const headerMenu = siteData?.menus?.header;
  const footerMenu = siteData?.menus?.footer;

  const resolveUrl = (item) => {
    if (item.type === 'page' && item.page) return `/page/${item.page.slug}`;
    return item.url || '#';
  };

  const isActivePath = (item) => {
    const url = resolveUrl(item);
    if (url === '/') return location.pathname === '/';
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  return (
    <SiteContext.Provider value={siteData}>
      {/* Google Analytics */}
      {settings.google_analytics_id && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.google_analytics_id}');
              `,
            }}
          />
        </>
      )}
      {/* Google reCAPTCHA */}
      {settings.recaptcha_site_key && (
        <script
          src={`https://www.google.com/recaptcha/api.js?render=${settings.recaptcha_site_key}`}
          async
          defer
        />
      )}
      <div className="forge-theme flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[oklch(0.12_0.01_40/0.95)] border-b border-[var(--forge-border)]">
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[var(--forge-primary)] to-transparent opacity-70" />
          <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--forge-primary)] opacity-30 blur-2xl animate-pulse-ember" />
                <img src={logo} alt={settings.site_name || 'Shape Shifters'} className="relative h-14 md:h-18 w-auto object-contain drop-shadow-[0_0_18px_oklch(0.7_0.24_40/0.55)]" />
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {headerMenu?.items?.map((item) => (
                <Link
                  key={item.id}
                  to={resolveUrl(item)}
                  target={item.target === '_blank' ? '_blank' : undefined}
                  className={`relative px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
                    isActivePath(item) ? 'text-[var(--forge-primary)]' : 'text-[var(--forge-muted)] hover:text-[var(--forge-fg)]'
                  }`}
                >
                  {item.label}
                  {isActivePath(item) && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-forge shadow-glow" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold uppercase tracking-wider text-[var(--forge-muted)] hover:text-[var(--forge-fg)] transition-colors">
                <Shield className="w-4 h-4" /> Admin
              </Link>
              <Link
                to="/cart"
                className="relative bg-forge text-[var(--forge-primary-fg)] shadow-ember px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden p-2 text-[var(--forge-fg)]" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile nav */}
          {mobileMenu && (
            <div className="md:hidden border-t border-[var(--forge-border)] bg-[oklch(0.13_0.02_30/0.98)] backdrop-blur-xl">
              <div className="max-w-7xl mx-auto flex flex-col gap-1 px-4 py-4">
                {headerMenu?.items?.map((item) => (
                  <Link
                    key={item.id}
                    to={resolveUrl(item)}
                    className="px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--forge-muted)] hover:text-[var(--forge-primary)]"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link to="/cart" className="w-full bg-forge mt-3 text-center text-[var(--forge-primary-fg)] shadow-ember px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-wider">
                  <ShoppingBag className="w-4 h-4 inline mr-2" /> Cart {cartCount > 0 ? `(${cartCount})` : ''}
                </Link>
                <Link to="/login" className="w-full mt-2 text-center border border-[var(--forge-primary)] text-[var(--forge-primary)] px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-wider opacity-80 hover:opacity-100">
                  <Shield className="w-4 h-4 inline mr-2" /> Admin Login
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Main */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="relative mt-24 border-t border-[var(--forge-border)]" style={{ background: 'oklch(0.12 0.01 40)' }}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--forge-primary)] to-transparent" />
          <div className="max-w-7xl mx-auto grid gap-10 px-4 py-16 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <img src={logo} alt={settings.site_name} className="h-20 w-auto object-contain drop-shadow-[0_0_18px_oklch(0.7_0.24_40/0.5)]" />
              </div>
              <p className="mt-5 max-w-md text-sm text-[var(--forge-muted)] leading-relaxed">
                {settings.site_description || 'Forge the body you were built for. Elite coaching, science-backed nutrition, and a community engineered to push your limits.'}
              </p>
              <div className="mt-6 flex gap-3">
                {settings.facebook_url && settings.facebook_url !== '#' && (
                  <a href={settings.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook"
                    className="grid place-items-center h-10 w-10 rounded-md border border-[var(--forge-border)] bg-[oklch(0.13_0.02_30/0.6)] text-[var(--forge-muted)] transition hover:border-[var(--forge-primary)] hover:text-[var(--forge-primary)] hover:shadow-glow">
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                )}
                {settings.instagram_url && settings.instagram_url !== '#' && (
                  <a href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram"
                    className="grid place-items-center h-10 w-10 rounded-md border border-[var(--forge-border)] bg-[oklch(0.13_0.02_30/0.6)] text-[var(--forge-muted)] transition hover:border-[var(--forge-primary)] hover:text-[var(--forge-primary)] hover:shadow-glow">
                    <InstagramIcon className="h-4 w-4" />
                  </a>
                )}
                {settings.tiktok_url && settings.tiktok_url !== '#' && (
                  <a href={settings.tiktok_url} target="_blank" rel="noreferrer" aria-label="TikTok"
                    className="grid place-items-center h-10 w-10 rounded-md border border-[var(--forge-border)] bg-[oklch(0.13_0.02_30/0.6)] text-[var(--forge-muted)] transition hover:border-[var(--forge-primary)] hover:text-[var(--forge-primary)] hover:shadow-glow">
                    <TikTokIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Explore */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest text-[var(--forge-fg)]" style={{ fontFamily: 'Orbitron, system-ui' }}>Explore</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-[var(--forge-muted)]">
                {footerMenu?.items?.map((item) => (
                  <li key={item.id}>
                    <Link to={resolveUrl(item)} className="hover:text-[var(--forge-primary)] transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Locations */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest text-[var(--forge-fg)]" style={{ fontFamily: 'Orbitron, system-ui' }}>Locations</h4>
              <div className="mt-4 space-y-4">
                {siteData?.branches?.length > 0 ? siteData.branches.map((branch) => (
                  <div key={branch.id} className="text-sm text-[var(--forge-muted)]">
                    <p className="font-semibold text-[var(--forge-fg)] text-xs uppercase">{branch.name}</p>
                    {branch.address && <p className="mt-1 flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--forge-primary)]" />{branch.address}</p>}
                    {branch.phone && <p className="mt-1 flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0 text-[var(--forge-primary)]" />{branch.phone}</p>}
                  </div>
                )) : (
                  <ul className="space-y-2.5 text-sm text-[var(--forge-muted)]">
                    {settings.site_address && <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[var(--forge-primary)]" />{settings.site_address}</li>}
                    {settings.site_phone && <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0 text-[var(--forge-primary)]" />{settings.site_phone}</li>}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--forge-border)]">
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-[var(--forge-muted)] md:flex-row">
              <div className="flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-[var(--forge-primary)]" />
                {settings.footer_text || `© ${new Date().getFullYear()} Shape Shifters. Forged in iron.`}
              </div>
              <div className="tracking-widest uppercase">Privacy · Terms · Cookies</div>
            </div>
          </div>
        </footer>
      </div>
    </SiteContext.Provider>
  );
}
