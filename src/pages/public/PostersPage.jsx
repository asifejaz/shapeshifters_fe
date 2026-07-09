import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import { Image as ImageIcon, X } from 'lucide-react';

export default function PostersPage() {
  const [page, setPage] = useState(null);
  const [galleryData, setGalleryData] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/public/pages/posters').then((res) => setPage(res.data)).catch(() => setPage(null));
    api.get('/gallery?grouped=1').then((res) => setGalleryData(res.data || [])).catch(() => setGalleryData([]));
  }, []);

  const posterPhotos = useMemo(() => {
    const photos = galleryData.flatMap((section) => section.photos || []);
    const tagged = photos.filter((photo) => {
      const haystack = `${photo.caption || ''} ${photo.title || ''}`.toLowerCase();
      return haystack.includes('poster');
    });
    return tagged.length ? tagged : photos.slice(0, 6);
  }, [galleryData]);

  return (
    <div>
      <header className="mx-auto max-w-screen-xl px-6 pt-20 pb-16">
        <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">Series · Ongoing</span>
        <h1 className="font-display text-6xl leading-[0.85] uppercase text-balance md:text-9xl">{page?.title || <>The Poster <br />Series</>}</h1>
        <p className="mt-8 max-w-xl text-base text-ink-muted">{page?.excerpt || 'Post your campaign posters from CMS content, and upload poster images in Gallery with “poster” in the caption to feature them here.'}</p>
      </header>

      {page?.content && <section className="mx-auto max-w-4xl px-6 pb-16"><div className="ss-prose" dangerouslySetInnerHTML={{ __html: page.content }} /></section>}

      <section className="mx-auto max-w-screen-xl px-6 pb-24">
        {posterPhotos.length === 0 ? (
          <div className="grid place-items-center border border-dashed border-ink/20 p-16 text-center">
            <ImageIcon className="mb-4 h-12 w-12 text-ink/30" />
            <h2 className="font-display text-4xl uppercase">No posters yet</h2>
            <p className="mt-3 max-w-md text-sm text-ink-muted">Create a CMS page with slug “posters” for text, then upload poster images in Gallery and include “poster” in the caption.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posterPhotos.map((photo, i) => (
              <article key={photo.id || i} className="group cursor-pointer" onClick={() => setSelected(photo)}>
                <div className="relative aspect-[3/4] overflow-hidden bg-ink ring-1 ring-ink/10">
                  <img src={photo.image_url} alt={photo.caption || 'Shape Shifters poster'} loading="lazy" className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.02]" />
                  <span className="absolute top-3 right-3 bg-paper/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-ink opacity-0 transition-all group-hover:bg-ember group-hover:text-paper group-hover:opacity-100">Poster</span>
                </div>
                <div className="mt-4 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50"><span>No {String(i + 1).padStart(2, '0')}</span><span className="text-ink">{photo.caption || 'Shape Shifters'}</span></div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-4" onClick={() => setSelected(null)}>
          <button className="absolute right-4 top-4 text-paper hover:text-ember" onClick={() => setSelected(null)}><X className="h-8 w-8" /></button>
          <img src={selected.image_url} alt={selected.caption || ''} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
