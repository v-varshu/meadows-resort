import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { GalleryItemData } from '../../data/resort';

interface GallerySectionProps {
  items: GalleryItemData[];
}

const CATEGORIES = [
  'ALL',
  'RESORT',
  'ROOMS',
  'NATURE',
  'DINING',
  'EXPERIENCES',
  'KODAIKANAL',
] as const;

export const GallerySection: React.FC<GallerySectionProps> = ({ items }) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const filteredItems =
    activeCategory === 'ALL'
      ? items
      : items.filter((item) => item.category.toUpperCase() === activeCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showPrev = () => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  const showNext = () => {
    if (lightboxIndex === null || filteredItems.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  };

  React.useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  return (
    <section id="gallery" className="py-24 md:py-32 px-6 bg-[#050708] border-t border-white/5">
      <div className="max-w-[1320px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs tracking-[0.22em] text-[#D4B47A] uppercase mb-3">
              06. Visual Anthology
            </div>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#F2E9D8] tracking-wide">
              MOMENTS IN THE MIST
            </h2>
          </div>

          {/* Interactive Category Filter Controls */}
          <div
            role="tablist"
            aria-label="Gallery Categories"
            className="flex items-center gap-1.5 p-1.5 bg-[#071916] border border-white/10 rounded-lg overflow-x-auto"
          >
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setActiveCategory(cat);
                    setLightboxIndex(null);
                  }}
                  className={`px-3.5 py-2 text-xs font-medium tracking-[0.14em] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#D4B47A] text-[#050708]'
                      : 'text-[#C5D1D0] hover:text-[#F2E9D8]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid with 3D Tilt & Image Zoom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {filteredItems.map((item, idx) => {
            const spanClass =
              idx % 4 === 0 || idx % 4 === 3 ? 'lg:col-span-7' : 'lg:col-span-5';
            return (
              <div
                key={item.id}
                data-cursor="VIEW"
                onClick={() => openLightbox(idx)}
                className={`${spanClass} group relative h-[320px] md:h-[380px] rounded-xl overflow-hidden bg-[#071916] border border-white/10 hover:border-[#D4B47A]/50 transition-all duration-300 cursor-pointer`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.alt}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050708]/90 via-[#050708]/25 to-transparent" />

                <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xs text-[#D4B47A] tracking-[0.18em] mb-1">
                      {item.category} · 0{idx + 1}
                    </div>
                    <h3 className="font-serif-display text-2xl text-[#F2E9D8]">{item.title}</h3>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#050708]/70 border border-white/15 text-[#F2E9D8] group-hover:border-[#D4B47A] group-hover:text-[#D4B47A] transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox with Keyboard & Touch Swipe Support */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery Fullscreen Viewer"
          className="fixed inset-0 z-50 bg-[#050708]/95 backdrop-blur-xl flex flex-col justify-between p-6"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX.current;
            if (deltaX > 50) showPrev();
            if (deltaX < -50) showNext();
            touchStartX.current = null;
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-xs tracking-[0.2em] text-[#C5D1D0] font-mono-tabular">
              {lightboxIndex + 1} / {filteredItems.length} · {filteredItems[lightboxIndex].category}
            </div>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close Fullscreen Gallery (ESC)"
              className="p-2.5 rounded-lg bg-[#071916] border border-white/15 text-[#F2E9D8] hover:border-[#D4B47A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous Photograph"
              className="absolute left-2 md:left-6 z-10 p-3 rounded-full bg-[#050708]/80 border border-white/15 text-[#F2E9D8] hover:border-[#D4B47A] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <img
              src={filteredItems[lightboxIndex].imageUrl}
              alt={filteredItems[lightboxIndex].alt}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-lg border border-[#D4B47A]/25 shadow-2xl"
            />

            <button
              type="button"
              onClick={showNext}
              aria-label="Next Photograph"
              className="absolute right-2 md:right-6 z-10 p-3 rounded-full bg-[#050708]/80 border border-white/15 text-[#F2E9D8] hover:border-[#D4B47A] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center">
            <h3 className="font-serif-display text-2xl text-[#F2E9D8]">
              {filteredItems[lightboxIndex].title}
            </h3>
            <p className="text-xs text-[#81957A] mt-1">
              Use Arrow keys or swipe left/right to navigate · Press ESC to close
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
