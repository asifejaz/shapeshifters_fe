import { useState, useEffect, createContext, useContext } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import api from '../../api';
import { Menu, X, Shield, MapPin, Phone, ShoppingBag } from 'lucide-react';
import logo from '../../assets/logo.webp';
import { whatsappUrl } from '../../utils/whatsapp';

const SiteContext = createContext(null);
export const useSiteData = () => useContext(SiteContext);

const fallbackLinks = [
  { label: 'Programs', url: '/programs' },
  { label: 'Trainers', url: '/trainers' },
  { label: 'Posters', url: '/posters' },
  { label: 'Pricing', url: '/pricing' },
  { label: 'Training Guides', url: '/guides' },
  { label: 'Calculators', url: '/calculators' },
  { label: 'Contact', url: '/contact' },
];

const isGalleryItem = (item) => {
  const label = (item.label || '').toLowerCase();
  const url = (item.url || '').toLowerCase();
  const slug = (item.page?.slug || '').toLowerCase();
  return label === 'gallery' || slug === 'gallery' || url === '/gallery' || url === '/page/gallery';
};

const ensurePostersItem = (items) => {
  const visibleItems = items.filter((item) => !isGalleryItem(item));
  const hasPosters = visibleItems.some((item) => {
    const label = (item.label || '').toLowerCase();
    const url = (item.url || '').toLowerCase();
    const slug = (item.page?.slug || '').toLowerCase();
    return label === 'posters' || slug === 'posters' || url === '/posters' || url === '/page/posters';
  });

  const withPosters = hasPosters ? visibleItems : [...visibleItems, { label: 'Posters', url: '/posters' }];
  const hasCalculators = withPosters.some((item) => (item.label || '').toLowerCase() === 'calculators' || (item.url || '').toLowerCase() === '/calculators');
  const withCalculators = hasCalculators ? withPosters : [...withPosters, { label: 'Calculators', url: '/calculators' }];
  const hasGuides = withCalculators.some((item) => (item.label || '').toLowerCase() === 'training guides' || (item.url || '').toLowerCase() === '/guides');
  return hasGuides ? withCalculators : [...withCalculators, { label: 'Training Guides', url: '/guides' }];
};

function FacebookIcon({ className }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
}

function InstagramIcon({ className }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>;
}

function TikTokIcon({ className }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.69a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.12z" /></svg>;
}

export function resolvePublicUrl(item) {
  if (item.type === 'page' && item.page) {
    const direct = ['programs', 'trainers', 'pricing', 'contact', 'posters', 'calculators', 'guides'].includes(item.page.slug);
    return direct ? `/${item.page.slug}` : `/page/${item.page.slug}`;
  }
  return item.url || '#';
}

export default function PublicLayout() {
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    api.get('/public/site-data').then((res) => setSiteData(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { setMobileMenu(false); }, [location]);

  useEffect(() => {
    const readCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');
        setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 0), 0));
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

  const settings = siteData?.settings || {};
  const headerItems = ensurePostersItem(siteData?.menus?.header?.items?.length ? siteData.menus.header.items : fallbackLinks);
  const footerItems = ensurePostersItem(siteData?.menus?.footer?.items?.length ? siteData.menus.footer.items : headerItems);
  const analyticsId = settings.google_analytics_id?.trim();

  const isActivePath = (item) => {
    const url = resolvePublicUrl(item);
    if (url === '/') return location.pathname === '/';
    return location.pathname === url || location.pathname.startsWith(`${url}/`);
  };

  useEffect(() => {
    if (!analyticsId) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };

    if (!document.querySelector(`script[data-ga-id="${analyticsId}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
      script.dataset.gaId = analyticsId;
      document.head.appendChild(script);
      window.gtag('js', new Date());
    }

    window.gtag('config', analyticsId, {
      page_path: `${location.pathname}${location.search}`,
    });
  }, [analyticsId, location.pathname, location.search]);

  if (loading) {
    return (
      <div className="ss-theme grid min-h-screen place-items-center">
        <div className="text-center">
          <img src={logo} alt="" className="mx-auto h-20 w-auto object-contain" />
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <SiteContext.Provider value={siteData}>
      {settings.recaptcha_site_key && <script src={`https://www.google.com/recaptcha/api.js?render=${settings.recaptcha_site_key}`} async defer />}

      <div className="ss-theme flex min-h-screen flex-col bg-paper text-ink">
        <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
          <div className="mx-auto grid h-16 max-w-screen-xl grid-cols-[1fr_auto] items-center gap-4 px-4 md:grid-cols-[auto_1fr_auto] md:px-6">
            <Link to="/" className="flex items-center" aria-label="Shape Shifters home">
              <img src={logo} alt={settings.site_name || 'Shape Shifters'} className="h-10 w-auto object-contain" />
            </Link>

            <nav className="hidden items-center justify-center gap-7 text-[10px] font-semibold uppercase tracking-[0.22em] md:flex">
              {headerItems.map((item) => (
                <Link key={item.id || item.label} to={resolvePublicUrl(item)} target={item.target === '_blank' ? '_blank' : undefined} className={`transition-colors hover:text-ember ${isActivePath(item) ? 'text-ember' : 'text-ink'}`}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/60 transition hover:text-ember">
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
              <Link to="/cart" className="relative bg-ink px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-paper transition-colors hover:bg-ember" aria-label="Open cart">
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 text-[10px] text-paper">{cartCount}</span>}
              </Link>
            </div>

            <button className="grid h-10 w-10 place-items-center justify-self-end border border-ink/10 md:hidden" onClick={() => setMobileMenu((v) => !v)} aria-label="Toggle menu">
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenu && (
            <div className="border-t border-ink/10 bg-paper md:hidden">
              <div className="mx-auto flex max-w-screen-xl flex-col px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.22em]">
                {headerItems.map((item) => <Link key={item.id || item.label} to={resolvePublicUrl(item)} className="border-b border-ink/10 py-3 hover:text-ember">{item.label}</Link>)}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link to="/cart" className="bg-ink px-4 py-3 text-center text-paper">Cart {cartCount > 0 ? `(${cartCount})` : ''}</Link>
                  <Link to="/login" className="border border-ink/20 px-4 py-3 text-center">Admin</Link>
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1"><Outlet /></main>

        <footer className="border-t border-ink/10 bg-paper py-16">
          <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-10 px-6 md:grid-cols-5">
            <div className="md:col-span-2">
              <img src={logo} alt={settings.site_name || 'Shape Shifters'} className="mb-5 h-14 w-auto object-contain" />
              <p className="max-w-[40ch] text-xs uppercase leading-relaxed tracking-[0.22em] text-ink/60">
                {settings.site_description || 'Forge the body you were built for. Elite coaching, science-backed nutrition, and a community engineered to push your limits.'}
              </p>
              <div className="mt-6 flex gap-3 text-ink/60">
                {settings.facebook_url && settings.facebook_url !== '#' && <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-ember"><FacebookIcon className="h-4 w-4" /></a>}
                {settings.instagram_url && settings.instagram_url !== '#' && <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-ember"><InstagramIcon className="h-4 w-4" /></a>}
                {settings.tiktok_url && settings.tiktok_url !== '#' && <a href={settings.tiktok_url} target="_blank" rel="noreferrer" className="hover:text-ember"><TikTokIcon className="h-4 w-4" /></a>}
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">Explore</span>
              <ul className="mt-4 space-y-2 text-xs font-semibold uppercase tracking-tight">
                {footerItems.map((item) => <li key={item.id || item.label}><Link to={resolvePublicUrl(item)} className="hover:text-ember">{item.label}</Link></li>)}
              </ul>
            </div>

            <div className="md:col-span-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">Locations</span>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {siteData?.branches?.length > 0 ? siteData.branches.map((branch) => (
                  <div key={branch.id} className="text-xs leading-relaxed text-ink-muted">
                    <p className="font-semibold uppercase text-ink">{branch.name}</p>
                    {branch.address && <p className="mt-2 flex gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ember" />{branch.address}</p>}
                    {branch.phone && <a href={whatsappUrl(branch.phone)} target="_blank" rel="noreferrer" className="mt-1 flex gap-2 hover:text-ember"><Phone className="h-3.5 w-3.5 shrink-0 text-ember" />{branch.phone}</a>}
                  </div>
                )) : (
                  <div className="text-xs leading-relaxed text-ink-muted">
                    {settings.site_address || 'Wah Cantt, Pakistan'}<br />
                    {settings.site_phone ? <a href={whatsappUrl(settings.site_phone)} target="_blank" rel="noreferrer" className="hover:text-ember">{settings.site_phone}</a> : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mx-auto mt-14 flex max-w-screen-xl flex-col justify-between gap-3 border-t border-ink/5 px-6 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40 md:flex-row">
            <span>{settings.footer_text || `© ${new Date().getFullYear()} Shape Shifters. Forged in iron.`}</span>
            <span>Wah Cantt, PK</span>
          </div>
        </footer>
      </div>
    </SiteContext.Provider>
  );
}
