import { useEffect, useState } from 'react';
import api from '../../api';
import { Image as ImageIcon, X } from 'lucide-react';

export default function PostersPage() {
  const [page, setPage] = useState(null);
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get('/public/pages/posters'),
      api.get('/public/posters'),
    ]).then(([pageResult, postersResult]) => {
      if (!active) return;
      if (pageResult.status === 'fulfilled') setPage(pageResult.value.data);
      if (postersResult.status === 'fulfilled') setPosters(postersResult.value.data || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <div>
      <header className="mx-auto max-w-screen-xl px-6 pt-20 pb-16">
        <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Series · Ongoing</span>
        <h1 className="font-display text-6xl leading-[0.85] uppercase text-balance md:text-9xl">{page?.title || <>The Poster <br />Series</>}</h1>
        <p className="mt-8 max-w-xl text-base text-ink-muted">{page?.excerpt || 'A quarterly release of motivational prints — mounted in the gym, shared with members, and built around discipline, focus, and the quiet parts of the work.'}</p>
      </header>

      {page?.content && <section className="mx-auto max-w-4xl px-6 pb-16"><div className="ss-prose" dangerouslySetInnerHTML={{ __html: page.content }} /></section>}

      <section className="mx-auto max-w-screen-xl px-6 pb-24">
        {loading ? (
          <div className="grid place-items-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-ember" /></div>
        ) : posters.length === 0 ? (
          <div className="grid place-items-center border border-dashed border-ink/20 p-16 text-center">
            <ImageIcon className="mb-4 h-12 w-12 text-ink/30" />
            <h2 className="font-display text-4xl uppercase">No posters yet</h2>
            <p className="mt-3 max-w-md text-sm text-ink-muted">Add posters from the admin CMS Posters section to publish them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posters.map((poster) => (
              <article key={poster.id} className="group cursor-pointer" onClick={() => setSelected(poster)}>
                <div className="relative aspect-[3/4] overflow-hidden bg-ink ring-1 ring-ink/10">
                  <img src={poster.image_url} alt={poster.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.02]" />
                  {poster.series && <span className="absolute top-3 right-3 bg-paper/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-ink opacity-0 transition-all group-hover:bg-ember group-hover:text-paper group-hover:opacity-100">{poster.series}</span>}
                </div>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink">{poster.title}</div>
                {poster.quote && <p className="mt-2 max-w-[38ch] text-xs italic text-ink-muted">“{poster.quote}”</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-4" onClick={() => setSelected(null)}>
          <button className="absolute right-4 top-4 text-paper hover:text-ember" onClick={() => setSelected(null)}><X className="h-8 w-8" /></button>
          <img src={selected.image_url} alt={selected.title} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
