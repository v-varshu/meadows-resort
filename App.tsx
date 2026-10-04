import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  MapPin,
  Sparkles,
  Check,
  Utensils,
  Flame,
  Star,
  AlertTriangle,
} from 'lucide-react';
import {
  RESORT_INFO,
  RESORT_ASSETS,
  INITIAL_ROOMS,
  INITIAL_GALLERY,
  DINING_DATA,
  EXPERIENCES_DATA,
  FACILITIES_LIST,
  KODAIKANAL_LANDMARKS,
  RoomData,
  GalleryItemData,
  ExperienceItem,
  KodaikanalLandmark,
} from './src/data/resort';
import { MountainHero3D } from './src/components/3d/MountainHero3D';
import { AboutMountain3D } from './src/components/3d/AboutMountain3D';
import { RoomDepthViewer3D } from './src/components/3d/RoomDepthViewer3D';
import { ExperienceVisualizer3D } from './src/components/3d/ExperienceVisualizer3D';
import { KodaikanalMap3D } from './src/components/3d/KodaikanalMap3D';
import { CustomCursor } from './src/components/ui/CustomCursor';
import { LoadingScreen } from './src/components/ui/LoadingScreen';
import { Navbar, NavSectionId } from './src/components/navigation/Navbar';
import { GallerySection } from './src/components/gallery/GallerySection';
import { BookingSection } from './src/components/booking/BookingSection';
import { ContactSection } from './src/components/contact/ContactSection';
import { Footer } from './src/components/navigation/Footer';
import { AdminPortal } from './src/components/admin/AdminPortal';

// ============================================================================
// GLOBAL ERROR BOUNDARY
// ============================================================================
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050708] text-[#F2E9D8] flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-[#D4B47A] mb-4" />
          <h1 className="font-serif-display text-3xl mb-2">
            Temporary Sanctuary Experience Interruption
          </h1>
          <p className="text-sm text-[#C5D1D0] max-w-md mb-6">
            An unexpected display issue occurred. No technical stack traces are exposed publicly.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#D4B47A] text-[#050708] text-xs font-semibold uppercase tracking-widest rounded-lg cursor-pointer"
          >
            Reload The Meadows Resort
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// 404 PAGE
// ============================================================================
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-[#050708] text-[#F2E9D8] flex flex-col items-center justify-center p-6 text-center">
    <div className="text-xs tracking-[0.3em] text-[#D4B47A] uppercase mb-3">
      404 · Trail Lost in the Mist
    </div>
    <h1 className="font-serif-display text-5xl md:text-6xl mb-4">Page Not Found</h1>
    <p className="text-sm text-[#C5D1D0] max-w-md mb-8">
      The mountain pathway you requested does not exist at The Meadows Resort Kodaikanal.
    </p>
    <Link
      to="/"
      className="px-6 py-3.5 bg-[#D4B47A] text-[#050708] text-xs font-semibold tracking-[0.2em] uppercase rounded-lg hover:bg-[#F2E9D8] transition-colors"
    >
      Return to Sanctuary Home
    </Link>
  </div>
);

// ============================================================================
// MAIN PUBLIC RESORT EXPERIENCE
// ============================================================================
const PublicResortExperience: React.FC<{ initialSection?: NavSectionId }> = ({
  initialSection,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<NavSectionId>(initialSection || 'home');
  const [heroScrollProgress, setHeroScrollProgress] = useState<number>(0);

  const [rooms, setRooms] = useState<RoomData[]>(INITIAL_ROOMS);
  const [gallery, setGallery] = useState<GalleryItemData[]>(INITIAL_GALLERY);

  const [selectedRoomFor3D, setSelectedRoomFor3D] = useState<RoomData | null>(null);
  const [preselectedBookingRoom, setPreselectedBookingRoom] = useState<string | undefined>(
    undefined
  );
  const [activeExperience, setActiveExperience] = useState<ExperienceItem>(EXPERIENCES_DATA[0]);
  const [facilityFilter, setFacilityFilter] = useState<string>('ALL');
  const [selectedLandmark, setSelectedLandmark] = useState<KodaikanalLandmark>(
    KODAIKANAL_LANDMARKS[0]
  );

  // Sync dynamic rooms and gallery from backend if admin created/modified any
  useEffect(() => {
    fetch('/api/public-content')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data.rooms) && data.rooms.length > 0) {
          // Map backend rooms while preserving 3D hotspots and authentic generated images
          const mergedRooms: RoomData[] = data.rooms.map((dbRoom: RoomData, idx: number) => {
            const match =
              INITIAL_ROOMS.find((ir) => ir.id === dbRoom.id || ir.name === dbRoom.name) ||
              INITIAL_ROOMS[idx % INITIAL_ROOMS.length];
            const validImg =
              dbRoom.images?.[0] && !dbRoom.images[0].startsWith('/api/asset-proxy')
                ? dbRoom.images
                : match.images;
            return {
              ...match,
              ...dbRoom,
              images: validImg,
              hotspots: match.hotspots,
            };
          });
          setRooms(mergedRooms);
        }
        if (Array.isArray(data.gallery) && data.gallery.length > 0) {
          setGallery([...data.gallery, ...INITIAL_GALLERY]);
        }
      })
      .catch(() => {});
  }, []);

  // Scroll listener for 3D camera journey and active section spy
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const vh = Math.max(window.innerHeight, 1);
      setHeroScrollProgress(Math.min(1, Math.max(0, y / (vh * 1.1))));

      const sectionIds: NavSectionId[] = [
        'home',
        'about',
        'rooms',
        'dining',
        'experiences',
        'gallery',
        'reviews',
        'booking',
        'contact',
      ];
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 220) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: NavSectionId) => {
    setActiveSection(sectionId);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (initialSection && initialSection !== 'home') {
      setTimeout(() => {
        document.getElementById(initialSection)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [initialSection]);

  const facilityCategories = [
    'ALL',
    ...Array.from(new Set(FACILITIES_LIST.map((f) => f.category))),
  ];
  const filteredFacilities =
    facilityFilter === 'ALL'
      ? FACILITIES_LIST
      : FACILITIES_LIST.filter((f) => f.category === facilityFilter);

  return (
    <div className="min-h-screen bg-[#050708] text-[#F2E9D8] selection:bg-[#D4B47A]/30">
      <LoadingScreen />
      <CustomCursor />
      <Navbar activeSection={activeSection} onNavigate={scrollToSection} />

      <main>
        {/* ================================================================
            01. CINEMATIC 3D HERO SECTION
        ================================================================= */}
        <section
          id="home"
          className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden"
        >
          {/* Full-Viewport Live Three.js Kodaikanal Mountain Landscape */}
          <div className="absolute inset-0 z-0">
            <MountainHero3D scrollProgress={heroScrollProgress} />
          </div>

          {/* Semantic DOM Hero Content Overlay */}
          <div className="relative z-10 max-w-[1320px] w-full mx-auto px-6 pt-28 md:pt-36 pb-12 flex-1 flex flex-col justify-between">
            <div className="max-w-3xl space-y-6 my-auto">
              {/* Quiet Unboxed Metadata */}
              <div className="inline-flex items-center gap-2.5 text-xs tracking-[0.28em] text-[#D4B47A] uppercase font-medium bg-[#050708]/60 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                <span>{RESORT_INFO.name}</span>
                <span aria-hidden="true">·</span>
                <span>{RESORT_INFO.city}</span>
              </div>

              <h1 className="font-serif-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-[#F2E9D8] leading-[0.96] tracking-tight drop-shadow-lg">
                ESCAPE INTO
                <br />
                <span className="text-[#D4B47A] italic font-normal">THE MEADOWS</span>
              </h1>

              <p className="text-base md:text-lg text-[#E7E1D5] max-w-xl leading-relaxed drop-shadow">
                {RESORT_INFO.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  data-cursor="EXPLORE"
                  onClick={() => scrollToSection('rooms')}
                  className="inline-flex items-center gap-3 px-7 py-4 bg-[#D4B47A] text-[#050708] text-xs font-semibold tracking-[0.2em] uppercase rounded-lg hover:bg-[#F2E9D8] transition-all duration-150 whitespace-nowrap cursor-pointer shadow-lg hover:shadow-[#D4B47A]/30"
                >
                  <span>EXPLORE ROOMS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  data-cursor="BOOK"
                  onClick={() => scrollToSection('booking')}
                  className="inline-flex items-center gap-3 px-7 py-4 bg-[#071916]/90 backdrop-blur-md text-[#F2E9D8] border border-[#D4B47A]/60 text-xs font-semibold tracking-[0.2em] uppercase rounded-lg hover:border-[#D4B47A] hover:bg-[#123C32] transition-all duration-150 whitespace-nowrap cursor-pointer shadow-lg"
                >
                  <span>BOOK YOUR STAY</span>
                </button>
              </div>
            </div>

            {/* Bottom Atmospheric Coordinates Strip */}
            <div className="w-full pt-8 mt-8 border-t border-white/15 hidden md:flex items-center justify-between text-xs text-[#C5D1D0]">
              <div className="flex items-center gap-3">
                <MapPin className="w-3.5 h-3.5 text-[#D4B47A]" />
                <span>Panchayat Road, Paraipatti, Kodaikanal</span>
                <span>·</span>
                <span>Tamil Nadu 624101, India</span>
              </div>
              <div className="flex items-center gap-4 font-mono-tabular text-[#D4B47A]">
                <span>GOOGLE 4.6 / 5</span>
                <span>·</span>
                <span>BOOKING.COM ~8.6 / 10</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            02. ABOUT SECTION — WHERE NATURE MEETS COMFORT
        ================================================================= */}
        <section id="about" className="py-24 md:py-32 px-6 bg-[#050708] border-t border-white/5">
          <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs tracking-[0.25em] text-[#D4B47A] uppercase">
                01. Sanctuary Philosophy
              </div>

              <h2 className="font-serif-display text-4xl sm:text-5xl md:text-6xl text-[#F2E9D8] leading-[1.08]">
                WHERE NATURE MEETS COMFORT
              </h2>

              {/* Unboxed Editorial Metadata Separators */}
              <div className="flex flex-wrap items-center gap-3 text-xs tracking-[0.22em] text-[#D4B47A] font-medium pt-1">
                <span>EST. 2024</span>
                <span aria-hidden="true" className="text-[#526B52]">
                  ·
                </span>
                <span>KODAIKANAL</span>
                <span aria-hidden="true" className="text-[#526B52]">
                  ·
                </span>
                <span>NATURE</span>
                <span aria-hidden="true" className="text-[#526B52]">
                  ·
                </span>
                <span>HOSPITALITY</span>
              </div>

              <p className="text-base text-[#C5D1D0] leading-relaxed">
                Nestled along Panchayat Road near Ohm Sakthi Temple in Bharathi Nagar, Paraipatti, The Meadows Resort is an intimate mountain retreat in Kodaikanal, Tamil Nadu. Established in 2024, our sanctuary welcomes travelers seeking serene highland views, crisp mist-laced air, and attentive warmth.
              </p>

              <p className="text-sm text-[#81957A] leading-relaxed">
                Whether awakening to drifting silver clouds from a private balcony, sharing Indian, Malaysian, and Asian cuisine in our dining pavilion, or gathering beside the outdoor fireplace at dusk, every moment is grounded in quiet natural harmony.
              </p>

              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/10">
                <div>
                  <div className="font-mono-tabular text-2xl text-[#F2E9D8] font-semibold">
                    2024
                  </div>
                  <div className="text-xs text-[#81957A] mt-0.5">Established</div>
                </div>
                <div>
                  <div className="font-mono-tabular text-2xl text-[#D4B47A] font-semibold">
                    24-Hr
                  </div>
                  <div className="text-xs text-[#81957A] mt-0.5">Front Desk</div>
                </div>
                <div>
                  <div className="font-mono-tabular text-2xl text-[#F2E9D8] font-semibold">
                    3
                  </div>
                  <div className="text-xs text-[#81957A] mt-0.5">Signature Cuisines</div>
                </div>
                <div>
                  <div className="font-mono-tabular text-2xl text-[#D4B47A] font-semibold">
                    4.6 / 5
                  </div>
                  <div className="text-xs text-[#81957A] mt-0.5">Google Rating</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <AboutMountain3D />
            </div>
          </div>
        </section>

        {/* ================================================================
            03. ROOMS SECTION + 3D ROOM VIEWER LAUNCHER
        ================================================================= */}
        <section id="rooms" className="py-24 md:py-32 px-6 bg-[#071916] border-t border-white/5">
          <div className="max-w-[1320px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
              <div>
                <div className="text-xs tracking-[0.25em] text-[#D4B47A] uppercase mb-3">
                  02. Verified Accommodations
                </div>
                <h2 className="font-serif-display text-4xl md:text-5xl text-[#F2E9D8]">
                  MOUNTAIN SANCTUARY ROOMS
                </h2>
              </div>
              <p className="text-sm text-[#C5D1D0] max-w-md">
                Each accommodation is crafted for peaceful rest in Kodaikanal. Select any room to enter the interactive 3D spatial depth viewer and inspect its hotspots.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {rooms.map((room, index) => (
                <article
                  key={room.id}
                  data-cursor="EXPLORE"
                  className="group rounded-xl overflow-hidden bg-[#050708] border border-white/10 hover:border-[#D4B47A]/50 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div
                      onClick={() => setSelectedRoomFor3D(room)}
                      className="relative h-64 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={room.images[0] || RESORT_ASSETS.roomQuadBalcony}
                        alt={room.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050708] via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 text-xs font-mono-tabular text-[#F2E9D8] bg-[#050708]/75 backdrop-blur-md px-3 py-1 rounded border border-white/10">
                        0{index + 1} · 3D DEPTH READY
                      </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-4">
                      <div className="text-xs text-[#81957A] tracking-[0.18em] uppercase">
                        Kodaikanal Sanctuary · Verified Category
                      </div>
                      <h3 className="font-serif-display text-2xl md:text-3xl text-[#F2E9D8]">
                        {room.name}
                      </h3>
                      <p className="text-sm text-[#C5D1D0] leading-relaxed">{room.description}</p>

                      {/* Unboxed Hotspot Preview List */}
                      <div className="pt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#D4B47A] tracking-wider uppercase">
                        <span>BED</span>
                        <span>·</span>
                        <span>BALCONY</span>
                        <span>·</span>
                        <span>VIEW</span>
                        <span>·</span>
                        <span>BATHROOM</span>
                        <span>·</span>
                        <span>AMENITIES</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 md:px-8 pb-8 pt-4 border-t border-white/10 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRoomFor3D(room)}
                      className="flex-1 py-3.5 px-4 bg-[#D4B47A] text-[#050708] font-semibold text-xs tracking-[0.16em] uppercase rounded-lg hover:bg-[#F2E9D8] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      EXPLORE ROOM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreselectedBookingRoom(room.name);
                        scrollToSection('booking');
                      }}
                      className="py-3.5 px-4 border border-white/20 text-[#F2E9D8] text-xs font-medium tracking-wider uppercase rounded-lg hover:border-[#D4B47A] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      INQUIRE
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            04. DINING SECTION — AMBER & COPPER CULINARY ATMOSPHERE
        ================================================================= */}
        <section
          id="dining"
          className="py-24 md:py-32 px-6 bg-gradient-to-b from-[#050708] via-[#0d0907] to-[#050708] border-t border-[#C66D3D]/25"
        >
          <div className="max-w-[1320px] mx-auto space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs tracking-[0.25em] text-[#C66D3D] uppercase">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>03. The Dining Pavilion</span>
                </div>
                <h2 className="font-serif-display text-4xl md:text-5xl text-[#F2E9D8] leading-tight">
                  {DINING_DATA.heading}
                </h2>
                <p className="text-base text-[#E7E1D5]/85 leading-relaxed">
                  {DINING_DATA.subheading}
                </p>

                {/* Verified Cuisines */}
                <div className="space-y-4 pt-2">
                  {DINING_DATA.cuisines.map((c, idx) => (
                    <div
                      key={c.name}
                      className="p-5 rounded-xl bg-[#050708]/80 border border-[#9C5235]/35 hover:border-[#D4B47A]/60 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-serif-display text-2xl text-[#D4B47A]">
                          0{idx + 1}. {c.name} Cuisine
                        </h3>
                        <span className="text-xs text-[#C66D3D] uppercase tracking-widest">
                          Verified Kitchen
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-[#C5D1D0] leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-xl overflow-hidden border border-[#C66D3D]/40 shadow-2xl">
                  <img
                    src={RESORT_ASSETS.diningPavilion}
                    alt="The Meadows Resort Kodaikanal amber-lit dining pavilion"
                    referrerPolicy="no-referrer"
                    className="w-full h-[420px] md:h-[520px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050708] via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-[#050708]/85 backdrop-blur-md border border-[#D4B47A]/30">
                    <div className="text-xs text-[#D4B47A] uppercase tracking-[0.2em] mb-1">
                      Indian · Malaysian · Asian
                    </div>
                    <p className="text-xs text-[#E7E1D5]">
                      Prepared fresh daily for in-restaurant dining and private Room Service across The Meadows Resort.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Six Dining Occasions */}
            <div className="pt-8 border-t border-[#9C5235]/25">
              <div className="text-xs tracking-[0.22em] text-[#D4B47A] uppercase mb-6">
                Daily Culinary Rhythm · Six Verified Occasions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {DINING_DATA.occasions.map((occ) => (
                  <div
                    key={occ.title}
                    className="p-6 rounded-xl bg-[#050708] border border-white/10 hover:border-[#C66D3D]/60 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-[#C66D3D] uppercase tracking-wider">
                      <span>{occ.period}</span>
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-serif-display text-2xl text-[#F2E9D8]">{occ.title}</h4>
                    <p className="text-xs text-[#C5D1D0] leading-relaxed">{occ.atmosphere}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            05. EXPERIENCES SECTION WITH INTERACTIVE 3D VISUALIZER
        ================================================================= */}
        <section
          id="experiences"
          className="py-24 md:py-32 px-6 bg-[#071916] border-t border-white/5"
        >
          <div className="max-w-[1320px] mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="text-xs tracking-[0.25em] text-[#D4B47A] uppercase mb-3">
                  04. Highland Leisure & Rituals
                </div>
                <h2 className="font-serif-display text-4xl md:text-5xl text-[#F2E9D8]">
                  CURATED RESORT EXPERIENCES
                </h2>
              </div>
              <p className="text-sm text-[#C5D1D0] max-w-md">
                Select any of the 8 verified resort experiences below to inspect its interactive 3D kinetic sculpture.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Interactive 3D Stage */}
              <div className="lg:col-span-6">
                <ExperienceVisualizer3D activeExperience={activeExperience} />
              </div>

              {/* 8 Verified Experiences Selector Grid */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {EXPERIENCES_DATA.map((exp, idx) => {
                  const isSelected = activeExperience.id === exp.id;
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      data-cursor="DISCOVER"
                      onClick={() => setActiveExperience(exp)}
                      className={`text-left p-5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#092B25] border-[#D4B47A] shadow-lg'
                          : 'bg-[#050708]/75 border-white/10 hover:border-[#D4B47A]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#D4B47A] font-mono-tabular">0{idx + 1}</span>
                        <span className="text-[#81957A] uppercase tracking-wider">
                          {exp.category}
                        </span>
                      </div>
                      <h3 className="font-serif-display text-xl text-[#F2E9D8] mb-1">
                        {exp.title}
                      </h3>
                      <p className="text-xs text-[#C5D1D0] line-clamp-2">{exp.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            06. INTERACTIVE 19 VERIFIED FACILITIES MATRIX
        ================================================================= */}
        <section className="py-20 md:py-28 px-6 bg-[#050708] border-t border-white/5">
          <div className="max-w-[1320px] mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="text-xs tracking-[0.25em] text-[#D4B47A] uppercase mb-3">
                  05. Complete Resort Infrastructure
                </div>
                <h2 className="font-serif-display text-3xl md:text-4xl text-[#F2E9D8]">
                  VERIFIED RESORT FACILITIES
                </h2>
              </div>

              {/* Interactive Facility Category Filter */}
              <div className="flex items-center gap-1.5 p-1.5 bg-[#071916] border border-white/10 rounded-lg overflow-x-auto">
                {facilityCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFacilityFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      facilityFilter === cat
                        ? 'bg-[#D4B47A] text-[#050708]'
                        : 'text-[#C5D1D0] hover:text-[#F2E9D8]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredFacilities.map((fac) => (
                <div
                  key={fac.name}
                  className="p-5 rounded-xl bg-[#071916]/75 border border-white/10 hover:border-[#D4B47A]/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#81957A] mb-2">
                      <span>{fac.category}</span>
                      <Check className="w-3.5 h-3.5 text-[#D4B47A]" />
                    </div>
                    <h3 className="font-semibold text-sm text-[#F2E9D8] mb-1">{fac.name}</h3>
                  </div>
                  <p className="text-xs text-[#C5D1D0] leading-relaxed">{fac.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            07. EDITORIAL GALLERY SECTION
        ================================================================= */}
        <GallerySection items={gallery} />

        {/* ================================================================
            08. EXPLORE KODAIKANAL — INTERACTIVE 3D TOPOGRAPHIC MAP
        ================================================================= */}
        <section className="py-24 md:py-32 px-6 bg-[#071916] border-t border-white/5">
          <div className="max-w-[1320px] mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="text-xs tracking-[0.25em] text-[#D4B47A] uppercase mb-3">
                  07. Highland Surroundings
                </div>
                <h2 className="font-serif-display text-4xl md:text-5xl text-[#F2E9D8]">
                  EXPLORE KODAIKANAL IN 3D
                </h2>
              </div>
              <p className="text-sm text-[#C5D1D0] max-w-md">
                Click any landmark below or on the 3D terrain map to glide the camera across Kodaikanal’s hills and lakes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <KodaikanalMap3D
                  selectedLandmark={selectedLandmark}
                  onSelectLandmark={setSelectedLandmark}
                />
              </div>

              <div className="lg:col-span-5 space-y-3.5">
                {KODAIKANAL_LANDMARKS.map((lm) => {
                  const active = selectedLandmark.id === lm.id;
                  return (
                    <button
                      key={lm.id}
                      type="button"
                      onClick={() => setSelectedLandmark(lm)}
                      className={`w-full text-left p-5 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#092B25] border-[#D4B47A] shadow-xl'
                          : 'bg-[#050708]/80 border-white/10 hover:border-[#D4B47A]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#D4B47A] uppercase tracking-wider">
                          {lm.category}
                        </span>
                        <MapPin className="w-3.5 h-3.5 text-[#D4B47A]" />
                      </div>
                      <h3 className="font-serif-display text-2xl text-[#F2E9D8] mb-1">
                        {lm.name}
                      </h3>
                      <p className="text-xs text-[#C5D1D0] leading-relaxed">{lm.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            09. VERIFIED PLATFORM REVIEWS SECTION (NO FABRICATED TESTIMONIALS)
        ================================================================= */}
        <section id="reviews" className="py-24 md:py-32 px-6 bg-[#050708] border-t border-white/5">
          <div className="max-w-[1200px] mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="text-xs tracking-[0.25em] text-[#D4B47A] uppercase">
                08. Verified Guest Attribution
              </div>
              <h2 className="font-serif-display text-4xl md:text-5xl text-[#F2E9D8]">
                RECOGNIZED HOSPITALITY IN KODAIKANAL
              </h2>
              <p className="text-sm text-[#C5D1D0] leading-relaxed">
                We present our verified aggregate guest ratings across leading global travel platforms without fabricating individual guest quotes or unverified claims.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {RESORT_INFO.ratings.map((rt) => (
                <div
                  key={rt.platform}
                  className="p-8 md:p-10 rounded-xl bg-[#071916] border border-[#D4B47A]/30 flex flex-col justify-between space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.22em] text-[#D4B47A]">
                      {rt.platform} Verified Score
                    </span>
                    <div className="flex items-center gap-1 text-[#D4B47A]">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <div className="font-mono-tabular text-5xl md:text-6xl font-semibold text-[#F2E9D8]">
                      {rt.display}
                    </div>
                    <div className="text-sm text-[#E7E1D5] mt-2 font-medium">{rt.note}</div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#81957A]">
                    <span>Source: {rt.attribution}</span>
                    <span>The Meadows Resort, Kodaikanal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            10. BOOKING INQUIRY SECTION
        ================================================================= */}
        <BookingSection rooms={rooms} preselectedRoom={preselectedBookingRoom} />

        {/* ================================================================
            11. CONTACT SECTION
        ================================================================= */}
        <ContactSection />
      </main>

      <Footer onNavigate={scrollToSection} />

      {/* 3D Room Depth Viewer Modal when a room is selected */}
      {selectedRoomFor3D && (
        <RoomDepthViewer3D
          room={selectedRoomFor3D}
          onClose={() => setSelectedRoomFor3D(null)}
          onBookRoom={(roomName) => {
            setPreselectedBookingRoom(roomName);
            scrollToSection('booking');
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicResortExperience initialSection="home" />} />
          <Route path="/about" element={<PublicResortExperience initialSection="about" />} />
          <Route path="/rooms" element={<PublicResortExperience initialSection="rooms" />} />
          <Route path="/dining" element={<PublicResortExperience initialSection="dining" />} />
          <Route
            path="/experiences"
            element={<PublicResortExperience initialSection="experiences" />}
          />
          <Route path="/gallery" element={<PublicResortExperience initialSection="gallery" />} />
          <Route path="/reviews" element={<PublicResortExperience initialSection="reviews" />} />
          <Route path="/booking" element={<PublicResortExperience initialSection="booking" />} />
          <Route path="/contact" element={<PublicResortExperience initialSection="contact" />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}
