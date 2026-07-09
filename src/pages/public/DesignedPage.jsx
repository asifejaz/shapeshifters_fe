import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import ContactForm from '../../components/ContactForm';
import { useSiteData } from './PublicLayout';
import { whatsappUrl } from '../../utils/whatsapp';

const programs = [
  ['01', 'Strength Training', 'Power & Muscle', 'Focused resistance training designed to build foundational strength and muscle mass through periodized programming.'],
  ['02', 'Cardio + Strength', 'Hybrid Performance', 'A balanced protocol combining metabolic conditioning with traditional weightlifting for well-rounded athletic development.'],
  ['03', 'Aerobics', 'Endurance & Agility', 'High-energy rhythmic movement to improve cardiovascular health, coordination and confidence.'],
  ['04', 'Aerobics + Cardio', 'Maximum Burn', 'An intensive combined program targeting aggressive fat loss and high-level stamina under coach supervision.'],
  ['05', 'Personal Training', 'Individualized Coaching', 'One-on-one guidance with male and female trainers available to help you reach specific goals.'],
  ['06', 'Facilities', 'Secure Storage', 'Personal locker facilities are available for all members to ensure your belongings stay safe while you train.'],
];

const plans = [
  ['01', 'Monthly', 'Flexible', 'Flexible month-to-month membership. Start when you are ready and renew as you go.'],
  ['02', 'Quarterly', '3 Months', 'A three-month commitment for members who want a focused training cycle.'],
  ['03', 'Semi-Annual', '6 Months', 'Six months of consistent training for dedicated members chasing durable transformation.', true],
  ['04', 'Annual', 'Best Value', 'One decision, twelve months of unrestricted access and long-term momentum.'],
];

const defaults = {
  programs: {
    eyebrow: 'Page · Programs',
    title: <>Every program,<br />coach-led.</>,
    intro: 'Every program is periodized, coach-led, and adapted to your body. Pick your protocol, or let a trainer engineer one for you.',
  },
  trainers: {
    eyebrow: 'Page · Trainers',
    title: <>The coaches<br />behind the work.</>,
    intro: 'Certified, experienced, and personally invested in every member’s progress.',
  },
  pricing: {
    eyebrow: 'Page · Pricing',
    title: <>Membership,<br />on your terms.</>,
    intro: 'Choose a plan that fits your goals and budget. Ask your branch for live rates and current offers.',
  },
  contact: {
    eyebrow: 'Page · Contact',
    title: <>Let’s start<br />the conversation.</>,
    intro: 'Have questions about services, branches, or memberships? Send us a message and we will get back to you.',
  },
};

function PageHeader({ eyebrow, title, intro }) {
  return (
    <header className="mx-auto max-w-screen-xl px-6 pt-20 pb-16">
      <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.3em] text-ember">{eyebrow}</span>
      <h1 className="font-display text-6xl leading-[0.85] uppercase text-balance md:text-8xl">{title}</h1>
      {intro && <p className="mt-8 max-w-2xl text-base text-ink-muted">{intro}</p>}
      <div className="mt-10 h-px w-full bg-ink/10" />
    </header>
  );
}

export default function DesignedPage({ slug }) {
  const siteData = useSiteData();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const meta = defaults[slug] || defaults.programs;
  const hasCmsContent = Boolean(page?.content?.trim());
  const showCmsContent = hasCmsContent && !['programs', 'trainers'].includes(slug);

  useEffect(() => {
    setLoading(true);
    api.get(`/public/pages/${slug}`)
      .then((res) => setPage(res.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const branches = useMemo(() => siteData?.branches || [], [siteData]);

  return (
    <div>
      <PageHeader eyebrow={meta.eyebrow} title={page?.title ? page.title : meta.title} intro={page?.excerpt || meta.intro} />

      {loading ? (
        <div className="grid place-items-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-ember" /></div>
      ) : showCmsContent ? (
        <section className="mx-auto max-w-4xl px-6 pb-20"><div className="ss-prose" dangerouslySetInnerHTML={{ __html: page.content }} /></section>
      ) : null}

      {slug === 'programs' && <ProgramsFallback />}
      {slug === 'trainers' && <TrainersFallback />}
      {slug === 'pricing' && <PricingFallback branches={branches} />}
      {slug === 'contact' && <ContactFallback branches={branches} />}
    </div>
  );
}

function ProgramsFallback() {
  return (
    <section className="mx-auto max-w-screen-xl px-6 pb-24">
      <div className="grid grid-cols-1 divide-y divide-ink/10 border-y border-ink/10 md:grid-cols-2 md:divide-y-0">
        {programs.map(([no, category, title, copy], i) => (
          <article key={no} className={`group relative flex flex-col gap-6 p-8 transition-colors hover:bg-paper-dim md:p-10 ${i % 2 === 0 ? 'md:border-r md:border-ink/10' : ''} ${i >= 2 ? 'md:border-t md:border-ink/10' : ''}`}>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">№ {no}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">{category}</span>
            </div>
            <h2 className="font-display text-4xl uppercase leading-none md:text-6xl">{title}</h2>
            <p className="max-w-[42ch] text-sm text-ink-muted">{copy}</p>
            <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em]"><span className="h-px flex-1 bg-ink/15 group-hover:bg-ember" /><Link to="/contact" className="group-hover:text-ember">Enroll</Link></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrainersFallback() {
  return (
    <section className="mx-auto max-w-screen-xl px-6 pb-24">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <article className="group relative flex flex-col overflow-hidden bg-paper-dim ring-1 ring-ink/10 transition-colors hover:ring-ember">
          <div className="relative aspect-[4/5] bg-ink"><div className="absolute inset-0 flex items-center justify-center"><span className="font-display text-[9rem] leading-none text-paper/20">SN</span></div><div className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.3em] text-paper/70">Head Trainer</div><div className="absolute right-4 bottom-4 h-2 w-2 bg-ember" /></div>
          <div className="p-6"><h2 className="font-display text-2xl uppercase leading-none">Sheikh Noman Ghani</h2><span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Certified Fitness Trainer</span><p className="mt-4 text-sm text-ink-muted">Leads programming across branches with focus on strength, hypertrophy, and long-term progress.</p></div>
        </article>
        <article className="flex flex-col justify-between border border-dashed border-ink/25 bg-paper p-8">
          <div><span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">Roster · Growing</span><h3 className="mt-4 font-display text-3xl uppercase leading-none">Female coaches available on request.</h3><p className="mt-4 text-sm text-ink-muted">Ask at the front desk for a session with one of our ladies-section trainers or personal-training specialists.</p></div>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] hover:text-ember">Request a match →</Link>
        </article>
      </div>
    </section>
  );
}

function PricingFallback({ branches }) {
  return (
    <section className="mx-auto max-w-screen-xl px-6 pb-20">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map(([no, name, tag, copy, featured]) => (
          <article key={no} className={`flex flex-col justify-between border p-8 transition-colors ${featured ? 'border-ember bg-ink text-paper' : 'border-ink/15 bg-paper hover:border-ember'}`}>
            <div><div className="flex items-baseline justify-between"><span className={`font-mono text-[10px] uppercase tracking-[0.3em] ${featured ? 'text-paper/50' : 'text-ink/40'}`}>№ {no}</span><span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">{tag}</span></div><h2 className="mt-6 font-display text-4xl uppercase leading-none md:text-5xl">{name}</h2><p className={`mt-4 text-sm ${featured ? 'text-paper/70' : 'text-ink-muted'}`}>{copy}</p></div>
            <div className={`mt-8 border-t pt-4 font-mono text-[10px] uppercase tracking-[0.3em] ${featured ? 'border-paper/20 text-paper/60' : 'border-ink/15 text-ink/50'}`}>Ask branch for rate</div>
          </article>
        ))}
      </div>
      <BranchCallout branches={branches} />
    </section>
  );
}

function ContactFallback({ branches }) {
  return (
    <section className="mx-auto max-w-screen-xl px-6 pb-24">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
        <div className="space-y-10">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Working Hours</span>
            <h3 className="mt-3 font-display text-3xl uppercase leading-none">06:00 - 22:00</h3>
            <p className="mt-2 text-sm text-ink-muted">Monday through Saturday. Closed Sunday.</p>
          </div>

          <div className="space-y-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Visit Us</span>
            {branches.map((branch, index) => <div key={branch.id} className="border-t border-ink/10 pt-6"><div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40"><span>No {String(index + 1).padStart(2, '0')}</span><span>Wah Cantt</span></div><h4 className="mt-2 font-display text-2xl uppercase">{branch.name}</h4><p className="mt-2 max-w-sm text-sm text-ink-muted">{branch.address}</p>{branch.phone && <a href={whatsappUrl(branch.phone)} target="_blank" rel="noreferrer" className="mt-3 inline-block font-mono text-xs font-semibold hover:text-ember">{branch.phone}</a>}</div>)}
          </div>
        </div>
        <div className="bg-paper-dim p-8 md:p-10"><span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Send us a message</span><h3 className="mt-3 mb-8 font-display text-3xl uppercase leading-none">Get in touch</h3><ContactForm inline /></div>
      </div>
    </section>
  );
}

function BranchCallout({ branches }) {
  return (
    <div className="mt-12 border border-ink/10 bg-paper-dim p-8 md:p-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[2fr_1fr] md:items-center">
        <div><span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Current rates</span><h3 className="mt-3 font-display text-3xl uppercase md:text-4xl">Visit any branch for live pricing & offers.</h3><p className="mt-4 max-w-xl text-sm text-ink-muted">We keep pricing personal so you always get the current promotion or family rate that applies to you.</p></div>
        <div className="flex flex-col gap-3 font-mono text-[11px] uppercase tracking-[0.22em]">{branches.slice(0, 2).map((branch) => <a key={branch.id} href={whatsappUrl(branch.phone)} target="_blank" rel="noreferrer" className="border border-ink/20 bg-paper px-5 py-4 hover:border-ember hover:text-ember">{branch.name} · {branch.phone}</a>)}<Link to="/contact" className="bg-ink px-5 py-4 text-center text-paper hover:bg-ember">Send a message →</Link></div>
      </div>
    </div>
  );
}
