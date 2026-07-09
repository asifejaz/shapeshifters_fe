import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useSiteData } from './PublicLayout';
import { ArrowRight, Package } from 'lucide-react';
import heroImage from '../../assets/new-design/hero-athlete.jpg';
import trainingImg from '../../assets/new-design/pillar-training.jpg';
import fitnessImg from '../../assets/new-design/pillar-fitness.jpg';
import nutritionImg from '../../assets/new-design/pillar-nutrition.jpg';
import InstagramFeed from '../../components/InstagramFeed';

const pillarImages = [trainingImg, fitnessImg, nutritionImg];
const marqueeWords = ['Conditioning', 'Hypertrophy', 'Metabolic Burn', 'Olympic Lifting', 'Mobility', 'Recovery'];

function firstWords(value, count) {
  const words = (value || '').split(' ').filter(Boolean);
  return words.slice(0, count).join(' ');
}

function restWords(value, count) {
  const words = (value || '').split(' ').filter(Boolean);
  return words.slice(count).join(' ');
}

export default function HomePage() {
  const siteData = useSiteData();
  const [homepage, setHomepage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [posters, setPosters] = useState([]);
  const sliders = siteData?.sliders || [];
  const settings = siteData?.settings || {};
  const shopEnabled = ['true', '1', true, 1].includes(settings.shop_enabled);

  useEffect(() => {
    api.get('/public/homepage').then((res) => setHomepage(res.data)).catch(() => null);
    api.get('/public/posters').then((res) => setPosters(res.data || [])).catch(() => setPosters([]));
  }, []);

  useEffect(() => {
    if (!shopEnabled) {
      setFeaturedProducts([]);
      return;
    }
    api.get('/shop/products?featured=1&in_stock=1').then((res) => setFeaturedProducts(res.data || [])).catch(() => setFeaturedProducts([]));
  }, [shopEnabled]);

  useEffect(() => {
    if (sliders.length <= 1) return undefined;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % sliders.length), 5500);
    return () => clearInterval(interval);
  }, [sliders.length]);

  const activeSlide = sliders[currentSlide];
  const heroTitle = activeSlide?.title || settings.hero_title || 'The Shift Starts Here';
  const heroIntro = activeSlide?.subtitle || settings.hero_subtitle || 'Discipline-first training, coach-led programs, and a room built for people who show up.';
  const heroCtaText = activeSlide?.button_text || settings.hero_cta_text || 'Get Started';
  const heroCtaUrl = activeSlide?.button_url || settings.hero_cta_url || '/contact';
  const secondaryText = settings.hero_secondary_text || 'View Programs';
  const secondaryUrl = settings.hero_secondary_url || '/programs';

  const stats = useMemo(() => [1, 2]
    .map((n, i) => ({
      label: i === 0 ? 'Members' : (settings[`stat_${n}_label`] || 'Client Retention Rate'),
      value: i === 0 ? '2000+' : (settings[`stat_${n}_value`] || '98%'),
      no: `0${n}`,
    })), [settings]);

  const pillars = useMemo(() => [1, 2, 3].map((n, i) => ({
    index: `0${n}`,
    title: settings[`pillar_${n}_title`] || ['Training', 'Fitness', 'Nutrition'][i],
    body: settings[`pillar_${n}_body`] || [
      'Technical precision meets raw intensity. Periodized strength and hypertrophy blocks written by coaches.',
      'Conditioning, mobility, and recovery protocols built around your schedule and goals.',
      'Practical nutrition direction that fuels performance without noise or gimmicks.',
    ][i],
    image: pillarImages[i],
  })), [settings]);

  const posterWallItems = posters.length > 0
    ? posters.slice(0, 5).map((poster, index) => ({
      no: `№ ${String(index + 1).padStart(2, '0')}`,
      title: poster.title,
      series: poster.series || 'Poster Series',
      quote: poster.quote,
      imageUrl: poster.image_url,
    }))
    : ['Mind Series', 'Iron Series', 'Discipline Series', 'Grit Series', 'Ritual Series'].map((series, index) => ({
      no: `№ ${String(index + 1).padStart(2, '0')}`,
      title: 'Coming Soon',
      series,
    }));

  return (
    <>
      <section className="mx-auto max-w-screen-xl px-6 pt-8 pb-4">
        <div className="grid grid-cols-1 gap-4 md:h-[640px] md:grid-cols-12">
          <div className="animate-reveal group relative overflow-hidden bg-ink md:col-span-8">
            <img src={activeSlide?.image_url || heroImage} alt={heroTitle} className="h-72 w-full object-cover opacity-90 grayscale transition-transform duration-[1200ms] group-hover:scale-105 md:h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div className="absolute top-6 left-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/70">
              <span className="h-px w-8 bg-paper/50" /> {settings.hero_badge || 'New Cycle'}
            </div>
            <div className="absolute right-6 bottom-8 left-6">
              <h1 className="font-display text-6xl leading-[0.85] text-paper uppercase text-balance sm:text-7xl md:text-[8rem]">
                {firstWords(heroTitle, 2)}<br />{restWords(heroTitle, 2)}
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/75">{heroIntro}</p>
            </div>
          </div>

          <div className="grid gap-4 md:col-span-4 md:grid-rows-2">
            {stats.map((stat, index) => (
              <div key={stat.no} className={`${index === 1 ? 'bg-ink text-paper' : 'border border-ink/5 bg-paper-dim text-ink'} animate-reveal flex flex-col justify-between p-8`} style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${index === 1 ? 'text-paper/40' : 'text-ink/40'}`}>({stat.no}) {index === 0 ? 'Community' : 'Standards'}</span>
                <div>
                  <div className="font-display text-6xl leading-none">{stat.value}</div>
                  <p className={`mt-2 text-[11px] uppercase tracking-[0.22em] ${index === 1 ? 'text-paper/70' : 'text-ink-muted'}`}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link to={heroCtaUrl} className="inline-flex items-center gap-2 bg-ink px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-paper transition-colors hover:bg-ember">
            {heroCtaText} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to={secondaryUrl} className="inline-flex items-center gap-2 border border-ink/20 px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-paper-dim">
            {secondaryText}
          </Link>
          {sliders.length > 1 && (
            <div className="ml-auto flex items-center gap-2">
              {sliders.map((_, i) => <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 w-8 transition-colors ${i === currentSlide ? 'bg-ember' : 'bg-ink/15'}`} aria-label={`Go to slide ${i + 1}`} />)}
            </div>
          )}
        </div>
      </section>

      {shopEnabled && (
        <section className="mx-auto max-w-screen-xl px-6 py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-ink py-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Shop · Featured</span>
              <h2 className="mt-3 font-display text-5xl uppercase md:text-6xl">Featured Products</h2>
            </div>
            <Link to="/shop" className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] hover:text-ember">View shop →</Link>
          </div>
          {featuredProducts.length === 0 ? (
            <div className="border border-dashed border-ink/20 p-10 text-center text-sm text-ink-muted">No featured products available right now.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <Link key={product.id} to={`/shop/${product.slug}`} className="group border border-ink/10 bg-paper transition hover:border-ember">
                  <div className="aspect-square bg-paper-dim">
                    {product.main_image ? <img src={product.main_image} alt={product.name} className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-[1.02] group-hover:grayscale-0" /> : <div className="grid h-full place-items-center text-ink/30"><Package className="h-12 w-12" /></div>}
                  </div>
                  <div className="p-5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">Product · {String(index + 1).padStart(2, '0')}</div>
                    <h3 className="mt-3 font-display text-2xl uppercase leading-none group-hover:text-ember">{product.name}</h3>
                    <p className="mt-3 text-sm font-semibold text-ink">Rs. {product.final_price || product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="overflow-hidden border-y border-ink/10 py-10">
        <div className="marquee-track">
          {[...marqueeWords, ...marqueeWords].map((word, i) => (
            <span key={`${word}-${i}`} className={`mx-10 font-display text-4xl uppercase whitespace-nowrap md:text-6xl ${i % 2 === 0 ? 'text-ink' : 'text-ink/15 italic'}`}>
              {word}<span className="ml-10 text-ink/20">x</span>
            </span>
          ))}
        </div>
      </div>

      <section id="pillars" className="mx-auto max-w-screen-xl px-6 py-24">
        <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4 border-b border-ink py-4">
          <h2 className="font-display text-5xl uppercase md:text-6xl">{settings.pillars_heading || 'Three Pillars'}</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">Core Methodology · 01 / 03</span>
        </div>
        <div className="grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="group bg-paper p-8 transition-colors hover:bg-paper-dim md:p-10">
              <span className="mb-10 block font-mono text-[10px] tracking-[0.22em] text-ink/50">{pillar.index} / 03</span>
              <h3 className="mb-4 font-display text-4xl uppercase">{pillar.title}</h3>
              <p className="mb-8 max-w-xs text-sm leading-relaxed text-ink-muted">{pillar.body}</p>
              <div className="aspect-square overflow-hidden bg-paper-dim">
                <img src={pillar.image} alt={pillar.title} loading="lazy" className="h-full w-full object-cover grayscale transition-transform duration-[900ms] group-hover:scale-105" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-screen-xl px-6 py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-paper/10 pb-6">
            <div>
              <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.22em] text-paper/50">(05) Poster Series</span>
              <h2 className="font-display text-5xl uppercase leading-[0.9] md:text-7xl">Strength <br className="hidden md:block" />Starts Within</h2>
              <p className="mt-6 max-w-md text-sm text-paper/60">A space for motivational posters and campaign drops managed through the Posters page content.</p>
            </div>
            <Link to="/posters" className="inline-flex items-center gap-2 border-b border-paper pb-1 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] transition-opacity hover:opacity-70">View Posters →</Link>
          </div>
          <div className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4">
            {posterWallItems.map((poster) => (
              <Link key={`${poster.no}-${poster.title}`} to="/posters" className="group w-[280px] shrink-0 snap-start md:w-[340px]">
                <div className="relative aspect-[3/4] overflow-hidden bg-ink-muted ring-1 ring-paper/5 transition-transform duration-500 group-hover:-translate-y-1">
                  {poster.imageUrl ? (
                    <img src={poster.imageUrl} alt={poster.title} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper/30">{poster.series}</span>
                      <span className="font-display text-3xl uppercase text-paper/50">Coming Soon</span>
                      <span className="h-px w-8 bg-paper/20" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 bg-ink px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-paper/60 opacity-0 transition-opacity group-hover:bg-ember group-hover:text-paper group-hover:opacity-100">
                    {poster.series}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/50">
                  <span>{poster.no}</span>
                  <span className="text-right text-paper/80">{poster.title}</span>
                </div>
                {poster.quote && <p className="mt-2 max-w-[38ch] text-xs italic text-paper/60">“{poster.quote}”</p>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-6 py-16">
        <InstagramFeed title="Latest Posts & Reels" limit={6} />
      </section>

      {homepage?.content && (
        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="ss-prose" dangerouslySetInnerHTML={{ __html: homepage.content }} />
        </section>
      )}

      <section className="border-t border-ink/10 bg-paper px-6 py-32 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="mb-8 block font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Enrollment · New Cycle</span>
          <h2 className="font-display text-6xl leading-[0.85] uppercase text-balance md:text-8xl">{settings.cta_heading || 'Claim Your Spot'}</h2>
          <p className="mx-auto mt-8 max-w-md text-sm text-ink-muted">{settings.cta_body || 'Get matched with a coach and start with a plan that fits your body, schedule, and goals.'}</p>
          <div className="mt-12">
            <Link to={settings.cta_button_url || '/contact'} className="inline-flex items-center gap-3 border-2 border-ink px-10 py-4 font-display text-2xl uppercase transition-colors hover:bg-ink hover:text-paper">
              {settings.cta_button_text || 'Start Training'} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
