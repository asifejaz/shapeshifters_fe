import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useSiteData } from './PublicLayout';
import { ArrowRight, Dumbbell, Flame, HeartPulse, Salad, Trophy, Zap, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import logoHero from '../../assets/logo-hero.webp';
import InstagramFeed from '../../components/InstagramFeed';

const pillarIcons = [Dumbbell, HeartPulse, Salad];

export default function HomePage() {
  const siteData = useSiteData();
  const [homepage, setHomepage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const sliders = siteData?.sliders || [];
  const s = siteData?.settings || {};
  const shopEnabled = s.shop_enabled === 'true' || s.shop_enabled === true || s.shop_enabled === '1' || s.shop_enabled === 1;

  useEffect(() => {
    api.get('/public/homepage').then((res) => setHomepage(res.data));
  }, []);

  useEffect(() => {
    if (shopEnabled) {
      api.get('/shop/products?featured=1&in_stock=1').then((res) => setFeaturedProducts(res.data));
    } else {
      setFeaturedProducts([]);
    }
  }, [shopEnabled]);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  // Build pillars from CMS settings
  const pillars = [1, 2, 3]
    .map((n, i) => ({
      Icon: pillarIcons[i],
      title: s[`pillar_${n}_title`],
      body: s[`pillar_${n}_body`],
    }))
    .filter((p) => p.title);

  // Build stats from CMS settings
  const stats = [1, 2, 3]
    .map((n) => ({ v: s[`stat_${n}_value`], l: s[`stat_${n}_label`] }))
    .filter((st) => st.v);

  // Split hero title into two lines for gradient effect
  const heroTitle = s.hero_title || '';
  const heroWords = heroTitle.split(' ');
  const heroLine1 = heroWords.slice(0, Math.ceil(heroWords.length / 2)).join(' ');
  const heroLine2 = heroWords.slice(Math.ceil(heroWords.length / 2)).join(' ');

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.6_0.25_30/0.25),transparent_60%)]" />
        <div className="max-w-7xl relative mx-auto grid gap-12 px-4 py-24 md:grid-cols-2 md:py-32 items-center">
          <div>
            {s.hero_badge && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--forge-primary)] bg-[var(--forge-primary)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--forge-primary)]" style={{ borderColor: 'oklch(0.68 0.22 38 / 0.4)', background: 'oklch(0.68 0.22 38 / 0.1)' }}>
                <Flame className="h-3.5 w-3.5" /> {s.hero_badge}
              </div>
            )}

            {sliders.length > 0 ? (
              <>
                <h1 className="mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl" style={{ fontFamily: 'Orbitron, system-ui' }}>
                  {sliders[currentSlide]?.title?.split(' ').slice(0, 3).join(' ')}
                  <span className="block text-gradient-forge">{sliders[currentSlide]?.title?.split(' ').slice(3).join(' ') || ''}</span>
                </h1>
                <p className="mt-6 max-w-lg text-lg text-[var(--forge-muted)]">
                  {sliders[currentSlide]?.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  {sliders[currentSlide]?.button_text && (
                    <Link to={sliders[currentSlide].button_url || s.hero_cta_url || '/page/contact'} className="bg-forge text-[var(--forge-primary-fg)] shadow-ember px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2" style={{ fontFamily: 'Orbitron, system-ui' }}>
                      {sliders[currentSlide].button_text} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {s.hero_secondary_text && (
                    <Link to={s.hero_secondary_url || '/page/programs'} className="px-6 py-3 rounded-lg font-bold uppercase tracking-wider border border-[var(--forge-primary)] text-[var(--forge-fg)] hover:bg-[var(--forge-primary)]/10 transition-colors" style={{ fontFamily: 'Orbitron, system-ui', borderColor: 'oklch(0.68 0.22 38 / 0.5)' }}>
                      {s.hero_secondary_text}
                    </Link>
                  )}
                </div>

                {sliders.length > 1 && (
                  <div className="mt-6 flex items-center gap-2">
                    <button onClick={() => setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length)} className="p-1.5 rounded-full border border-[var(--forge-border)] hover:border-[var(--forge-primary)] text-[var(--forge-muted)] hover:text-[var(--forge-primary)] transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex gap-1.5">
                      {sliders.map((_, i) => (
                        <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? 'bg-[var(--forge-primary)]' : 'bg-[var(--forge-border)]'}`} />
                      ))}
                    </div>
                    <button onClick={() => setCurrentSlide((prev) => (prev + 1) % sliders.length)} className="p-1.5 rounded-full border border-[var(--forge-border)] hover:border-[var(--forge-primary)] text-[var(--forge-muted)] hover:text-[var(--forge-primary)] transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <h1 className="mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl" style={{ fontFamily: 'Orbitron, system-ui' }}>
                  {heroLine1}
                  <span className="block text-gradient-forge">{heroLine2}</span>
                </h1>
                <p className="mt-6 max-w-lg text-lg text-[var(--forge-muted)]">
                  {s.hero_subtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  {s.hero_cta_text && (
                    <Link to={s.hero_cta_url || '/page/contact'} className="bg-forge text-[var(--forge-primary-fg)] shadow-ember px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2" style={{ fontFamily: 'Orbitron, system-ui' }}>
                      {s.hero_cta_text} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {s.hero_secondary_text && (
                    <Link to={s.hero_secondary_url || '/page/programs'} className="px-6 py-3 rounded-lg font-bold uppercase tracking-wider border border-[var(--forge-primary)] text-[var(--forge-fg)] hover:bg-[var(--forge-primary)]/10 transition-colors" style={{ fontFamily: 'Orbitron, system-ui', borderColor: 'oklch(0.68 0.22 38 / 0.5)' }}>
                      {s.hero_secondary_text}
                    </Link>
                  )}
                </div>
              </>
            )}

            {stats.length > 0 && (
              <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                {stats.map((st) => (
                  <div key={st.l}>
                    <div className="text-3xl font-black text-gradient-forge" style={{ fontFamily: 'Orbitron, system-ui' }}>{st.v}</div>
                    <div className="text-xs uppercase tracking-widest text-[var(--forge-muted)]">{st.l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hero image */}
          <div className="relative hidden md:block">
            <div className="relative aspect-square mx-auto max-w-lg">
              <img
                src={logoHero}
                alt={s.site_name || 'Shape Shifters'}
                className="relative z-10 h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop Products Section */}
      {shopEnabled ? (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--forge-primary)]">Shop</div>
              <h2 className="mt-3 text-3xl md:text-4xl font-black uppercase" style={{ fontFamily: 'Orbitron, system-ui' }}>
                Featured Products
              </h2>
            </div>
            {featuredProducts.length === 0 ? (
              <div className="text-center text-[var(--forge-muted)]">No featured products available right now.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 4).map((product) => (
                  <Link key={product.id} to="/shop" className="group">
                    <div className="bg-[oklch(0.12_0.01_40/0.6)] border border-[var(--forge-border)] rounded-xl overflow-hidden group-hover:border-[var(--forge-primary)] transition-colors">
                      <div className="aspect-square bg-[oklch(0.13_0.02_30/0.6)]">
                        {product.main_image ? (
                          <img src={product.main_image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--forge-muted)]">
                            <Package className="w-12 h-12 opacity-50" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-[var(--forge-fg)] mb-2">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          {product.discount_price ? (
                            <>
                              <span className="text-lg font-bold text-[var(--forge-primary)]">Rs. {product.final_price}</span>
                              <span className="text-sm text-[var(--forge-muted)] line-through">Rs. {product.price}</span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-[var(--forge-primary)]">Rs. {product.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="text-center mt-8">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-forge text-[var(--forge-primary-fg)] shadow-ember px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
                View All Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* PILLARS */}
      {pillars.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--forge-primary)]">Three Pillars</div>
            <h2 className="mt-3 text-4xl font-black uppercase md:text-5xl" style={{ fontFamily: 'Orbitron, system-ui' }}>
              {s.pillars_heading || 'Built on Iron Principles'}
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {pillars.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-xl border border-[var(--forge-border)] p-8 transition hover:border-[var(--forge-primary)] hover:shadow-ember"
                style={{ background: 'oklch(0.17 0.025 30 / 0.6)' }}
              >
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[var(--forge-primary)] opacity-10 blur-3xl transition group-hover:opacity-30" />
                <Icon className="h-10 w-10 text-[var(--forge-primary)]" />
                <h3 className="mt-5 text-2xl uppercase" style={{ fontFamily: 'Orbitron, system-ui' }}>{title}</h3>
                <p className="mt-3 text-[var(--forge-muted)]">{body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Instagram Feed */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <InstagramFeed title="Latest Posts & Reels" limit={6} />
      </section>

      {/* Homepage CMS content */}
      {homepage?.content && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-h2:text-gradient-forge prose-a:text-[var(--forge-primary)]" style={{ '--tw-prose-body': 'var(--forge-muted)', '--tw-prose-headings': 'var(--forge-fg)' }} dangerouslySetInnerHTML={{ __html: homepage.content }} />
        </section>
      )}

      {/* CTA */}
      {s.cta_heading && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--forge-primary)] p-10 md:p-16 text-center shadow-ember" style={{ background: 'oklch(0.17 0.025 30 / 0.8)', borderColor: 'oklch(0.68 0.22 38 / 0.4)' }}>
            <div className="absolute inset-0 grid-lines opacity-30" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.7_0.24_40/0.4),transparent_60%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 text-[var(--forge-primary)]">
                <Zap className="h-5 w-5" />
                <Trophy className="h-5 w-5" />
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl" style={{ fontFamily: 'Orbitron, system-ui' }}>
                {s.cta_heading}
              </h2>
              {s.cta_body && (
                <p className="mt-4 max-w-xl mx-auto text-[var(--forge-muted)]">
                  {s.cta_body}
                </p>
              )}
              {s.cta_button_text && (
                <Link to={s.cta_button_url || '/page/contact'} className="inline-flex items-center gap-2 mt-8 bg-forge text-[var(--forge-primary-fg)] shadow-ember px-8 py-3.5 rounded-lg font-bold uppercase tracking-widest hover:opacity-90 transition-opacity" style={{ fontFamily: 'Orbitron, system-ui' }}>
                  {s.cta_button_text} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

    </>
  );
}
