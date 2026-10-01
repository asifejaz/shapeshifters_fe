import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api';
import { ArrowLeft } from 'lucide-react';

export default function PublicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.get(`/public/pages/${slug}`)
      .then((res) => setPage(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="grid place-items-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-ember" /></div>;
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-screen-xl px-6 py-32 text-center">
        <h1 className="font-display text-8xl uppercase leading-none">404</h1>
        <h2 className="mt-3 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-ink-muted">The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 bg-ink px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-paper hover:bg-ember">
          <ArrowLeft className="h-4 w-4" /> Go Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="mx-auto max-w-screen-xl px-6 pt-14 pb-12 md:pt-16 md:pb-14">
        <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.3em] text-ember">Page</span>
        <h1 className="font-display text-6xl leading-[0.85] uppercase text-balance md:text-8xl">{page.title}</h1>
        {page.excerpt && <p className="mt-8 max-w-2xl text-base text-ink-muted">{page.excerpt}</p>}
        <div className="mt-10 h-px w-full bg-ink/10" />
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-14 md:pb-16">
        {page.content ? <div className="ss-prose" dangerouslySetInnerHTML={{ __html: page.content }} /> : <p className="text-ink-muted">This page has no content yet.</p>}
      </section>

    </div>
  );
}
