import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { Camera, PlayCircle } from 'lucide-react';

export default function InstagramFeed({ title = 'Instagram Feed', limit = 6, compact = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get(`/public/instagram-feed?limit=${limit}`)
      .then((res) => {
        if (active) setItems(res.data?.items || []);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [limit]);

  const hasItems = useMemo(() => items.length > 0, [items]);

  if (loading) {
    return <div className="border border-ink/10 bg-paper-dim p-6"><div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-ember" /></div>;
  }

  if (!hasItems) return null;

  return (
    <section className="border border-ink/10 bg-paper p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-ink/10 pb-4">
        <Camera className="h-5 w-5 text-ember" />
        <h3 className="font-display text-3xl uppercase leading-none">{title}</h3>
      </div>
      <div className={`grid ${compact ? 'grid-cols-2 gap-3' : 'grid-cols-2 gap-4 sm:grid-cols-3'}`}>
        {items.map((item) => (
          <a key={item.id} href={item.permalink} target="_blank" rel="noreferrer" className="group relative overflow-hidden bg-ink ring-1 ring-ink/10">
            <img src={item.image_url} alt={item.caption || 'Instagram post'} className="aspect-square w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
            {item.media_type === 'VIDEO' && <div className="absolute inset-0 grid place-items-center bg-ink/25"><PlayCircle className="h-8 w-8 text-paper drop-shadow" /></div>}
          </a>
        ))}
      </div>
    </section>
  );
}
