import { useState } from 'react';
import { Check, MapPin, MessageCircle, Navigation, Phone, X } from 'lucide-react';
import { whatsappUrl } from '../utils/whatsapp';
import { branchMapUrl } from '../utils/branchMaps';

const services = [
  'Gym membership',
  'Strength training',
  'Cardio + strength',
  'Aerobics',
  'Personal training',
  'Ladies programs',
  'Locker facilities',
  'Current pricing & offers',
];

export default function BranchContactCards({ branches = [], compact = false }) {
  const [selectedBranch, setSelectedBranch] = useState(null);

  return (
    <>
      <div className={`grid grid-cols-1 gap-4 ${branches.length > 1 ? 'md:grid-cols-3' : ''}`}>
        {branches.slice(0, 3).map((branch, index) => (
          <article key={branch.id} className="flex min-h-[300px] flex-col justify-between border border-ink/10 bg-paper p-7 transition-colors hover:border-ember md:p-8">
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">
                <span>Branch · {String(index + 1).padStart(2, '0')}</span>
                <span>Wah Cantt</span>
              </div>
              <h3 className={`mt-7 font-display uppercase leading-none ${compact ? 'text-3xl' : 'text-4xl'}`}>{branch.name}</h3>
              {branch.address && <p className="mt-5 flex gap-3 text-sm leading-relaxed text-ink-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember" />{branch.address}</p>}
              {branch.phone && <p className="mt-3 flex items-center gap-3 text-sm font-semibold"><Phone className="h-4 w-4 text-ember" />{branch.phone}</p>}
            </div>
            <div className="mt-8 grid gap-2">
              <button type="button" onClick={() => setSelectedBranch(branch)} className="inline-flex items-center justify-center gap-3 bg-ink px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-paper transition-colors hover:bg-ember">
                <MessageCircle className="h-4 w-4" /> Contact on WhatsApp
              </button>
              <a href={branchMapUrl(branch, index)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 border border-ink/15 px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-ember hover:text-ember">
                <Navigation className="h-3.5 w-3.5" /> Get Directions
              </a>
            </div>
          </article>
        ))}
      </div>
      {selectedBranch && <WhatsAppInquiryModal branch={selectedBranch} onClose={() => setSelectedBranch(null)} />}
    </>
  );
}

function WhatsAppInquiryModal({ branch, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', services: [], question: '' });
  const toggleService = (service) => setForm((current) => ({
    ...current,
    services: current.services.includes(service)
      ? current.services.filter((item) => item !== service)
      : [...current.services, service],
  }));

  const startChat = (event) => {
    event.preventDefault();
    const message = [
      `Hello ${branch.name}, I would like more information.`,
      `Name: ${form.name}`,
      form.phone ? `My phone: ${form.phone}` : null,
      `Interested in: ${form.services.join(', ')}`,
      form.question ? `Question: ${form.question}` : null,
    ].filter(Boolean).join('\n');
    window.open(whatsappUrl(branch.phone, message), '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-ink/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Contact ${branch.name}`}>
      <form onSubmit={startChat} className="my-6 w-full max-w-2xl bg-paper p-6 shadow-2xl md:p-9">
        <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
          <div><span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ember">WhatsApp inquiry</span><h2 className="mt-2 font-display text-4xl uppercase leading-none">{branch.name}</h2></div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center border border-ink/10 hover:border-ember" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">Your name *<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full border border-ink/15 bg-paper px-4 py-3 font-sans text-sm normal-case tracking-normal outline-none focus:border-ember" /></label>
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">Your phone<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full border border-ink/15 bg-paper px-4 py-3 font-sans text-sm normal-case tracking-normal outline-none focus:border-ember" /></label>
        </div>
        <fieldset className="mt-6"><legend className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">What do you need information about? *</legend><div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{services.map((service) => { const checked = form.services.includes(service); return <button key={service} type="button" onClick={() => toggleService(service)} className={`flex items-center gap-3 border px-4 py-3 text-left text-sm transition-colors ${checked ? 'border-ember bg-ember/10' : 'border-ink/10 hover:border-ink/30'}`}><span className={`grid h-5 w-5 place-items-center border ${checked ? 'border-ember bg-ember text-paper' : 'border-ink/20'}`}>{checked && <Check className="h-3.5 w-3.5" />}</span>{service}</button>; })}</div></fieldset>
        <label className="mt-6 block font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60">Anything else?<textarea rows="3" value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} className="mt-2 w-full resize-y border border-ink/15 bg-paper px-4 py-3 font-sans text-sm normal-case tracking-normal outline-none focus:border-ember" /></label>
        <button disabled={!form.name || form.services.length === 0} className="mt-7 inline-flex w-full items-center justify-center gap-3 bg-[#1f9d55] px-6 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#178447] disabled:cursor-not-allowed disabled:opacity-40"><MessageCircle className="h-5 w-5" /> Continue to WhatsApp</button>
      </form>
    </div>
  );
}
