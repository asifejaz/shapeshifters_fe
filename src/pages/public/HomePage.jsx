import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useSiteData } from './PublicLayout';
import { Activity, ArrowRight, Calculator, Dumbbell, HeartPulse, Music, Package, UserCheck, Users } from 'lucide-react';
import heroImage from '../../assets/new-design/hero-athlete.jpg';
import strengthHero from '../../assets/hero-slides/strength-starts-today.webp';
import womenHero from '../../assets/hero-slides/womens-strength.webp';
import coachingHero from '../../assets/hero-slides/coaching-progress.webp';
import branchesHero from '../../assets/hero-slides/three-branches.webp';
import trainingImg from '../../assets/new-design/pillar-training.jpg';
import fitnessImg from '../../assets/new-design/pillar-fitness.jpg';
import nutritionImg from '../../assets/new-design/pillar-nutrition.jpg';
import InstagramFeed from '../../components/InstagramFeed';
import BranchContactCards from '../../components/BranchContactCards';
import { trainingGuides } from './trainingGuideData';

const pillarImages = [trainingImg, fitnessImg, nutritionImg];
const marqueeWords = ['Conditioning', 'Hypertrophy', 'Metabolic Burn', 'Olympic Lifting', 'Mobility', 'Recovery'];
const campaignHeroSlides = [
  {
    image_url: strengthHero,
    badge: 'Strength · Coaching · Progress',
    title: 'Stronger Starts Today',
    subtitle: 'Build strength with expert coaching, progressive training, and a standard that never slips.',
    button_text: 'Start Training', button_url: '/contact',
    secondary_text: 'Explore Programs', secondary_url: '/programs',
  },
  {
    image_url: womenHero,
    badge: 'Women’s Fitness · Confidence',
    title: 'Your Space Your Strength',
    subtitle: 'A welcoming women’s training environment built for confidence, fitness, and lasting progress.',
    button_text: 'Explore Women’s Plans', button_url: '/guides/women-fitness',
    secondary_text: 'All Training Guides', secondary_url: '/guides',
  },
  {
    image_url: coachingHero,
    badge: 'Technique · Accountability · Results',
    title: 'Coaching Changes Everything',
    subtitle: 'Train with precise technique, a clear progression plan, and coaches invested in every rep.',
    button_text: 'View Programs', button_url: '/programs',
    secondary_text: 'Free Calculators', secondary_url: '/calculators',
  },
  {
    image_url: branchesHero,
    badge: 'Wah Cantt · Three Locations',
    title: 'Three Branches One Standard',
    subtitle: 'Choose the Shape Shifters location that fits your routine and start your next chapter.',
    button_text: 'Find Your Branch', button_url: '/contact',
    secondary_text: 'Contact Us', secondary_url: '/contact',
  },
];
const calculatorLinks = [
  ['BMI', 'bmi'], ['Calories & TDEE', 'calories'], ['Macros', 'macros'], ['Protein', 'protein'],
  ['Body Fat', 'body-fat'], ['One-Rep Max', 'one-rep-max'], ['Barbell Plates', 'plates'], ['Running Pace', 'pace'],
];
const whyChooseFeatures = [
  { icon: HeartPulse, title: 'Women’s Health & Fitness', body: 'A supportive women-focused environment for strength, healthy weight management, mobility, confidence, and lasting wellbeing.' },
  { icon: Dumbbell, title: 'Men’s Strength & Conditioning', body: 'Progressive training for muscle building, fat loss, endurance, athletic performance, and everyday strength.' },
  { icon: UserCheck, title: 'Personal Training', body: 'Individual coaching that turns your goal into a practical plan with better technique, progression, and accountability.' },
  { icon: Activity, title: 'Cardio & Weight Management', body: 'Dedicated cardio and conditioning options to support stamina, energy, body-composition goals, and heart health.' },
  { icon: Music, title: 'Aerobics, Mobility & Wellbeing', body: 'Energetic sessions that build coordination and fitness while helping you move, feel, and live better.' },
  { icon: Users, title: 'Comfortable Training Spaces', body: 'Separate sections for men and women, modern equipment, secure lockers, and a respectful community atmosphere.' },
];

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const branches = siteData?.branches || [];
  const settings = useMemo(() => siteData?.settings || {}, [siteData?.settings]);
  const heroSlides = campaignHeroSlides;
  const shopEnabled = ['true', '1', true, 1].includes(settings.shop_enabled);

  useEffect(() => {
    if (!shopEnabled) return undefined;
    api.get('/shop/products?featured=1&in_stock=1').then((res) => setFeaturedProducts(res.data || [])).catch(() => setFeaturedProducts([]));
    return undefined;
  }, [shopEnabled]);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 5500);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const activeSlide = heroSlides[currentSlide % heroSlides.length];
  const heroTitle = activeSlide?.title || settings.hero_title || 'The Shift Starts Here';
  const heroIntro = activeSlide?.subtitle || settings.hero_subtitle || 'Discipline-first training, coach-led programs, and a room built for people who show up.';
  const heroCtaText = activeSlide?.button_text || settings.hero_cta_text || 'Get Started';
  const heroCtaUrl = activeSlide?.button_url || settings.hero_cta_url || '/contact';
  const heroBadge = activeSlide?.badge || settings.hero_badge || 'New Cycle · 2026';
  const secondaryText = activeSlide?.secondary_text || settings.hero_secondary_text || 'View Programs';
  const secondaryUrl = activeSlide?.secondary_url || settings.hero_secondary_url || '/programs';

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

  return (
    <>
      <section className="mx-auto max-w-screen-xl px-6 pt-6 pb-10">
        <div className="h-[560px] sm:h-[600px] md:h-[580px]">
          <div className="animate-reveal group relative h-full overflow-hidden bg-ink">
            <img key={activeSlide?.image_url} src={activeSlide?.image_url || heroImage} alt={heroTitle} className="animate-reveal h-full w-full object-cover object-[68%_center] opacity-95 transition-transform duration-[1200ms] group-hover:scale-105 md:object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
            <div className="absolute top-6 left-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/70">
              <span className="h-px w-8 bg-paper/50" /> {heroBadge}
            </div>
            {heroSlides.length > 1 && (
              <div className="absolute top-6 right-6 hidden items-center gap-2 sm:flex">
                {heroSlides.map((slide, i) => <button key={`${slide.title}-${i}`} onClick={() => setCurrentSlide(i)} className={`h-2 transition-all ${i === currentSlide ? 'w-12 bg-ember' : 'w-7 bg-paper/30 hover:bg-paper/60'}`} aria-label={`Go to slide ${i + 1}: ${slide.title || 'Hero slide'}`} />)}
              </div>
            )}
            <div className="absolute right-6 bottom-8 left-6">
              <h1 className="max-w-5xl font-display text-5xl leading-[0.85] text-paper uppercase text-balance sm:text-7xl md:text-[6.75rem]">
                {firstWords(heroTitle, 2)}<br />{restWords(heroTitle, 2)}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-paper/80">{heroIntro}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={heroCtaUrl} className="inline-flex items-center gap-2 bg-ember px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-paper hover:text-ink">
                  {heroCtaText} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to={secondaryUrl} className="inline-flex items-center gap-2 border border-paper/50 bg-ink/20 px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-paper backdrop-blur-sm transition-colors hover:border-paper hover:bg-paper hover:text-ink">
                  {secondaryText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhyChooseSection />

      <section id="pillars" className="mx-auto max-w-screen-xl px-6 pt-4 pb-14 md:pt-4 md:pb-18">
        <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4 border-b border-ink py-4">
          <h2 className="font-section text-5xl uppercase md:text-6xl">{settings.pillars_heading || 'Three Pillars'}</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">Core Methodology · 01 / 03</span>
        </div>
        <div className="grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="group bg-paper p-8 transition-colors hover:bg-paper-dim md:p-10">
              <span className="mb-10 block font-mono text-[10px] tracking-[0.22em] text-ink/50">{pillar.index} / 03</span>
              <h3 className="mb-4 font-section text-4xl uppercase">{pillar.title}</h3>
              <p className="mb-8 max-w-xs text-sm leading-relaxed text-ink-muted">{pillar.body}</p>
              <div className="aspect-square overflow-hidden bg-paper-dim">
                <img src={pillar.image} alt={pillar.title} loading="lazy" className="h-full w-full object-cover saturate-[0.88] contrast-[1.04] transition duration-[900ms] group-hover:scale-105 group-hover:saturate-100" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-6 py-14 md:py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-ink py-4">
          <div><span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Three locations · One standard</span><h2 className="mt-3 font-section text-5xl uppercase md:text-6xl">Choose Your Branch</h2></div>
          <p className="max-w-md text-sm text-ink-muted">Tell the branch what service you need, then continue the conversation directly on WhatsApp.</p>
        </div>
        <BranchContactCards branches={branches} />
      </section>

      <div className="overflow-hidden border-y border-ink/10 py-10">
        <div className="marquee-track">
          {[...marqueeWords, ...marqueeWords].map((word, i) => (
            <span key={`${word}-${i}`} className={`mx-10 font-display text-4xl uppercase whitespace-nowrap md:text-6xl ${i % 2 === 0 ? 'text-ink' : 'text-ink/15 italic'}`}>
              {word}<span className="ml-10 text-ink/20">x</span>
            </span>
          ))}
        </div>
      </div>

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-screen-xl px-6 py-14 md:py-18">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-paper/15 pb-5"><div><span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Exercise + Pakistani food</span><h2 className="mt-3 font-section text-5xl uppercase md:text-6xl">Weekly Training Guides</h2></div><Link to="/guides" className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] hover:text-ember">View all plans →</Link></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{trainingGuides.map((guide) => <Link key={guide.slug} to={`/guides/${guide.slug}`} className="group border border-paper/10 bg-paper/5 transition hover:border-ember"><div className="aspect-[3/2] overflow-hidden"><img src={guide.image} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100" /></div><div className="p-5"><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ember">{guide.audience}</span><h3 className="mt-2 font-section text-2xl uppercase leading-none">{guide.shortTitle}</h3><span className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-paper/70 group-hover:text-ember">Open guide <ArrowRight className="h-3.5 w-3.5" /></span></div></Link>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-6 py-14 md:py-18">
        <div className="grid grid-cols-1 gap-8 border border-ink/10 bg-paper-dim p-8 md:grid-cols-[1.15fr_0.85fr] md:items-end md:p-12">
          <div><span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Free fitness tools</span><h2 className="mt-4 font-section text-5xl uppercase leading-[0.9] md:text-7xl">Calculate.<br />Plan. Train.</h2><p className="mt-6 max-w-xl text-sm leading-relaxed text-ink-muted">BMI, calories, macros, protein, hydration, body-fat estimates, strength percentages, barbell plates, running pace, and goal timelines—all in one place.</p></div>
          <div><div className="grid grid-cols-2 gap-2">{calculatorLinks.map(([label, tool]) => <Link key={tool} to={`/calculators?tool=${tool}`} className="border border-ink/15 bg-paper px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:border-ember hover:text-ember">{label} →</Link>)}</div><Link to="/calculators" className="mt-3 inline-flex w-full items-center justify-center gap-3 bg-ember px-7 py-5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink"><Calculator className="h-5 w-5" /> View all calculators <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      {shopEnabled && (
        <section className="mx-auto max-w-screen-xl px-6 py-14 md:py-16">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-ink py-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Shop · Featured</span>
              <h2 className="mt-3 font-section text-5xl uppercase md:text-6xl">Featured Products</h2>
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
                    <h3 className="mt-3 font-section text-2xl uppercase leading-none group-hover:text-ember">{product.name}</h3>
                    <p className="mt-3 text-sm font-semibold text-ink">Rs. {product.final_price || product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="mx-auto max-w-screen-xl px-6">
        <InstagramFeed title="Latest Posts & Reels" limit={6} />
      </div>

      <section className="border-t border-ink/10 bg-paper px-6 py-20 text-center md:py-24">
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

function WhyChooseSection() {
  return (
    <section className="bg-ink text-paper" aria-labelledby="why-choose-heading">
      <div className="mx-auto max-w-screen-xl px-6 py-14 md:py-18">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">One standard · Every session</span>
              <h2 id="why-choose-heading" className="mt-5 max-w-2xl font-section text-5xl leading-[0.9] uppercase text-balance sm:text-6xl md:text-7xl">More than a gym. A place to become stronger.</h2>
              <p className="mt-7 max-w-xl text-sm leading-relaxed text-paper/70 md:text-base">Shape Shifters is built for men and women who want to become stronger, healthier, and more confident—not chase shortcuts. From women-focused fitness and healthy weight management to muscle building, cardio, aerobics, and personal training, every service is designed to support progress that improves life beyond the gym.</p>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/programs" className="inline-flex items-center gap-3 bg-ember px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-paper hover:text-ink">Explore programs <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/contact" className="inline-flex items-center gap-3 border border-paper/25 px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-paper transition hover:border-paper">Find your branch</Link>
            </div>
          </div>

          <div className="grid gap-px border border-paper/15 bg-paper/15 sm:grid-cols-2">
            {whyChooseFeatures.map(({ icon: Icon, title, body }, index) => (
              <article key={title} className="group min-h-48 bg-ink p-6 transition-colors hover:bg-paper/[0.06] md:p-7">
                <div className="flex items-start justify-between">
                  <span className="grid h-10 w-10 place-items-center border border-ember/50 text-ember"><Icon className="h-5 w-5" /></span>
                  <span className="font-mono text-[9px] tracking-[0.2em] text-paper/30">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-7 font-section text-2xl uppercase leading-none">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/60">{body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 border-t border-paper/15 pt-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div><span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ember">Expert coaching</span><h3 className="mt-3 font-section text-3xl uppercase sm:text-4xl">You bring the goal. We help build the path.</h3></div>
          <p className="max-w-2xl text-sm leading-relaxed text-paper/65 md:justify-self-end">Whatever your starting point, our trainers help you move with better technique, train with purpose, and build the consistency behind better strength, fitness, confidence, and wellbeing.</p>
        </div>
      </div>
    </section>
  );
}
