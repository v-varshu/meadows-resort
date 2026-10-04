import React from 'react';
import { Phone, Navigation, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RESORT_INFO } from '../../data/resort';
import { NavSectionId } from '../navigation/Navbar';

interface FooterProps {
  onNavigate: (section: NavSectionId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative bg-[#050708] border-t border-[#D4B47A]/25 text-[#F2E9D8] overflow-hidden">
      {/* Subtle Mountain Ridge SVG Silhouette */}
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-12 md:h-20 text-[#071916] fill-current opacity-80 pointer-events-none"
        preserveAspectRatio="none"
      >
        <path d="M0 120L0 68L210 24L430 82L690 18L960 76L1210 28L1440 64L1440 120Z" />
      </svg>

      <div className="max-w-[1320px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs tracking-[0.25em] text-[#D4B47A] uppercase">
            {RESORT_INFO.established} · {RESORT_INFO.city}
          </div>
          <h3 className="font-serif-display text-3xl tracking-[0.12em] text-[#F2E9D8]">
            {RESORT_INFO.name}
          </h3>
          <p className="text-sm text-[#C5D1D0] max-w-sm leading-relaxed">
            {RESORT_INFO.description}
          </p>
          <div className="pt-2 text-xs text-[#81957A] space-y-1">
            <p>{RESORT_INFO.address.full}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <div className="text-[#D4B47A] uppercase tracking-[0.2em] font-semibold">
              Sanctuary
            </div>
            <ul className="space-y-2.5 text-[#C5D1D0]">
              <li>
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('home');
                  }}
                  className="hover:text-[#D4B47A] transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('about');
                  }}
                  className="hover:text-[#D4B47A] transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#rooms"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('rooms');
                  }}
                  className="hover:text-[#D4B47A] transition-colors"
                >
                  Rooms
                </a>
              </li>
              <li>
                <a
                  href="#dining"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('dining');
                  }}
                  className="hover:text-[#D4B47A] transition-colors"
                >
                  Dining
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[#D4B47A] uppercase tracking-[0.2em] font-semibold">
              Discover
            </div>
            <ul className="space-y-2.5 text-[#C5D1D0]">
              <li>
                <a
                  href="#experiences"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('experiences');
                  }}
                  className="hover:text-[#D4B47A] transition-colors"
                >
                  Experiences
                </a>
              </li>
              <li>
                <a
                  href="#gallery"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('gallery');
                  }}
                  className="hover:text-[#D4B47A] transition-colors"
                >
                  Gallery
                </a>
              </li>
              <li>
                <a
                  href="#reviews"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('reviews');
                  }}
                  className="hover:text-[#D4B47A] transition-colors"
                >
                  Reviews
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('contact');
                  }}
                  className="hover:text-[#D4B47A] transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Direct Actions */}
        <div className="lg:col-span-3 space-y-4">
          <div className="text-xs text-[#D4B47A] uppercase tracking-[0.2em] font-semibold">
            Direct Reception
          </div>
          <a
            href={`tel:${RESORT_INFO.phoneDial}`}
            className="flex items-center gap-2.5 font-mono-tabular text-lg text-[#F2E9D8] hover:text-[#D4B47A] transition-colors"
          >
            <Phone className="w-4 h-4 text-[#D4B47A]" />
            <span>{RESORT_INFO.phone}</span>
          </a>

          <div className="flex flex-col gap-2.5 pt-1">
            <a
              href={RESORT_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#071916] border border-[#D4B47A]/35 text-xs font-semibold uppercase tracking-widest text-[#F2E9D8] hover:bg-[#D4B47A] hover:text-[#050708] transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>

            <button
              type="button"
              onClick={() => onNavigate('booking')}
              className="py-3 px-4 rounded-lg bg-[#D4B47A] text-[#050708] text-xs font-semibold uppercase tracking-widest hover:bg-[#F2E9D8] transition-colors cursor-pointer"
            >
              Book Your Stay
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Admin Link */}
      <div className="border-t border-white/10 py-6 px-6">
        <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#81957A]">
          <div>
            © {new Date().getFullYear()} The Meadows Resort, Kodaikanal, Tamil Nadu, India. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Panchayat Road · Paraipatti · 624101</span>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-[#C5D1D0] hover:text-[#D4B47A] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff & Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
