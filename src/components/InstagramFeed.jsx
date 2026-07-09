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
        if (!active) return;
        setItems(res.data?.items || []);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [limit]);

  const hasItems = useMemo(() => items.length > 0, [items]);

  if (loading) {
    return (
      <div className="bg-[oklch(0.12_0.01_40/0.6)] border border-[var(--forge-border)] rounded-xl p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--forge-primary)] mx-auto" />
      </div>
    );
  }

  if (!hasItems) return null;

  return (
    <section className="bg-[oklch(0.12_0.01_40/0.6)] border border-[var(--forge-border)] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-[var(--forge-primary)]" />
        <h3 className="text-xl font-bold uppercase" style={{ fontFamily: 'Orbitron, system-ui' }}>{title}</h3>
      </div>

      <div className={`grid ${compact ? 'grid-cols-2 gap-3' : 'grid-cols-2 sm:grid-cols-3 gap-4'}`}>
        {items.map((item) => (
          <a
            key={item.id}
            href={item.permalink}
            target="_blank"
            rel="noreferrer"
            className="group relative overflow-hidden rounded-lg border border-[var(--forge-border)] hover:border-[var(--forge-primary)] transition-colors"
          >
            <img src={item.image_url} alt={item.caption || 'Instagram post'} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
            {item.media_type === 'VIDEO' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <PlayCircle className="w-8 h-8 text-white drop-shadow" />
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
