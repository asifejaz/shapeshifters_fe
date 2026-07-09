import { useState, useEffect } from 'react';
import api from '../../api';
import { MapPin, Image as ImageIcon, X } from 'lucide-react';
import InstagramFeed from '../../components/InstagramFeed';

export default function GalleryPage() {
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    api.get('/gallery?grouped=1').then((res) => {
      setGalleryData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--forge-primary)]" />
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
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--forge-primary)]">Gallery</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-black uppercase" style={{ fontFamily: 'Orbitron, system-ui' }}>
            Our Facilities
          </h1>
          <p className="mt-4 text-lg text-[var(--forge-muted)] max-w-2xl">
            Explore our gym locations and see what makes Shape Shifters the ultimate fitness destination.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {galleryData.length === 0 ? (
                <div className="text-center py-20">
                  <ImageIcon className="w-16 h-16 text-[var(--forge-muted)] mx-auto mb-4 opacity-50" />
                  <p className="text-[var(--forge-muted)]">No photos uploaded yet</p>
                </div>
              ) : (
                galleryData.map((section) => (
                  <div key={section.branch_id || 'global'} className="mb-16">
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="w-5 h-5 text-[var(--forge-primary)]" />
                      <h2 className="text-2xl font-black uppercase" style={{ fontFamily: 'Orbitron, system-ui' }}>
                        {section.branch?.name || 'All Locations'}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {section.photos.map((photo) => (
                        <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-[var(--forge-border)] cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                          <img
                            src={photo.image_url}
                            alt={photo.caption || ''}
                            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {photo.caption && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-white text-sm font-medium">{photo.caption}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <aside className="lg:col-span-1 lg:sticky lg:top-24 self-start">
              <InstagramFeed title="Instagram" limit={8} compact />
            </aside>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedPhoto.image_url}
            alt={selectedPhoto.caption || ''}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {selectedPhoto.caption && (
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white text-lg font-medium">{selectedPhoto.caption}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
