import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import { ArrowLeft } from 'lucide-react';
import ContactForm from '../../components/ContactForm';

export default function PublicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.get(`/public/pages/${slug}`)
      .then((res) => { setPage(res.data); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--forge-primary)]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-7xl font-bold text-[var(--forge-fg)] mb-4" style={{ fontFamily: 'Orbitron, system-ui' }}>404</h1>
        <h2 className="text-xl font-semibold text-[var(--forge-fg)]">Page not found</h2>
        <p className="mt-2 text-sm text-[var(--forge-muted)]">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="inline-flex items-center gap-2 mt-6 bg-forge text-[var(--forge-primary-fg)] shadow-ember px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
          <ArrowLeft className="w-4 h-4" /> Go Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.6_0.25_30/0.2),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--forge-primary)]">Page</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-black uppercase" style={{ fontFamily: 'Orbitron, system-ui' }}>
            {page.title}
          </h1>
          {page.excerpt && <p className="mt-4 text-lg text-[var(--forge-muted)] max-w-2xl">{page.excerpt}</p>}
        </div>
      </section>

      {/* Page content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {page.content ? (
            <div
              className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-a:text-[var(--forge-primary)] prose-strong:text-[var(--forge-fg)]"
              style={{ '--tw-prose-body': 'var(--forge-muted)', '--tw-prose-headings': 'var(--forge-fg)' }}
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <p className="text-[var(--forge-muted)]">This page has no content yet.</p>
          )}
        </div>
      </section>

      {/* Contact form on contact page */}
      {slug === 'contact' && (
        <section className="py-12 border-t border-[var(--forge-border)]">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <div className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--forge-primary)]">Get in Touch</div>
              <h2 className="mt-3 text-3xl font-black uppercase" style={{ fontFamily: 'Orbitron, system-ui' }}>Send us a message</h2>
            </div>
            <ContactForm />
          </div>
        </section>
      )}
    </div>
  );
}
