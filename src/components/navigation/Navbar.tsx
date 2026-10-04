import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export type NavSectionId =
  | 'home'
  | 'about'
  | 'rooms'
  | 'dining'
  | 'experiences'
  | 'gallery'
  | 'reviews'
  | 'contact'
  | 'booking';

interface NavbarProps {
  activeSection: NavSectionId;
  onNavigate: (section: NavSectionId) => void;
}

const NAV_ITEMS: { id: NavSectionId; label: string }[] = [
  { id: 'home', label: 'HOME' },
  { id: 'about', label: 'ABOUT' },
  { id: 'rooms', label: 'ROOMS' },
  { id: 'dining', label: 'DINING' },
  { id: 'experiences', label: 'EXPERIENCES' },
  { id: 'gallery', label: 'GALLERY' },
  { id: 'reviews', label: 'REVIEWS' },
  { id: 'contact', label: 'CONTACT' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (id: NavSectionId) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-[#050708]/90 backdrop-blur-md border-b border-[#D4B47A]/30 py-3.5 shadow-xl'
            : 'bg-[#050708]/50 backdrop-blur-md border-b border-white/10 py-4'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-4">
          {/* Zone 1: Single Text Element Brand Wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('home');
            }}
            className="font-serif-display text-lg md:text-xl font-semibold tracking-[0.14em] text-[#F2E9D8] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#D4B47A]"
          >
            THE MEADOWS RESORT
          </a>

          {/* Zone 2: Clean Typography Navigation Links with Active Champagne Indicator */}
          <nav
            aria-label="Primary Resort Navigation"
            className="hidden xl:flex items-center gap-6 text-xs font-medium tracking-[0.16em]"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.id);
                  }}
                  className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    isActive ? 'text-[#D4B47A]' : 'text-[#E7E1D5]/85 hover:text-[#F2E9D8]'
                  }`}
                >
                  {item.label}
                  <span
                    className={`
                      absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#D4B47A] transition-transform duration-200 origin-left
                      ${isActive ? 'scale-x-100' : 'scale-x-0'}
                    `}
                  />
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-cursor="BOOK"
              onClick={() => handleLinkClick('booking')}
              className="px-5 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-[#D4B47A] text-[#050708] rounded-lg hover:bg-[#F2E9D8] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              BOOK YOUR STAY
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="xl:hidden p-2.5 text-[#F2E9D8] border border-white/15 rounded-lg hover:border-[#D4B47A] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Animated Menu */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 z-30 bg-[#050708]/98 backdrop-blur-xl flex flex-col justify-between px-8 pt-24 pb-10 xl:hidden"
        >
          <nav className="flex flex-col space-y-4">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.id);
                  }}
                  className={`flex items-baseline justify-between py-2 border-b border-white/10 font-serif-display text-3xl tracking-wide transition-colors ${
                    isActive ? 'text-[#D4B47A]' : 'text-[#F2E9D8] hover:text-[#D4B47A]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="font-mono-tabular text-xs text-[#81957A]">0{idx + 1}</span>
                </a>
              );
            })}
          </nav>

          <div className="space-y-4 pt-6">
            <button
              type="button"
              onClick={() => handleLinkClick('booking')}
              className="w-full py-4 px-6 bg-[#D4B47A] text-[#050708] font-semibold text-xs tracking-[0.2em] uppercase rounded-lg"
            >
              BOOK YOUR STAY
            </button>
            <div className="flex items-center justify-between text-xs text-[#C5D1D0]">
              <span>KODAIKANAL · TAMIL NADU</span>
              <a href="tel:+919445586811" className="text-[#D4B47A] font-mono-tabular">
                094455 86811
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
