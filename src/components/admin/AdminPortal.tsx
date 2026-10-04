import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  LogOut,
  BedDouble,
  CalendarCheck,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { INITIAL_GALLERY, INITIAL_ROOMS, RESORT_ASSETS } from '../../data/resort';

type AdminTab = 'bookings' | 'rooms' | 'gallery' | 'messages' | 'settings';

interface BookingRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  specialRequest: string;
  status: 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

interface ContactRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  createdAt: string;
}

interface RoomRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  status: 'ACTIVE' | 'INACTIVE';
  active: boolean;
  createdAt: string;
}

interface GalleryRecord {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  alt: string;
  active: boolean;
  createdAt: string;
}

export const AdminPortal: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [token, setToken] = useState<string>(() => sessionStorage.getItem('meadows_admin_token') || '');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [setupInfoOpen, setSetupInfoOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [gallery, setGallery] = useState<GalleryRecord[]>([]);

  // Room Form State
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomImageChoice, setNewRoomImageChoice] = useState(RESORT_ASSETS.roomQuadBalcony);

  // Gallery Form State
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState('RESORT');
  const [newGalImageChoice, setNewGalImageChoice] = useState(RESORT_ASSETS.hero);

  // Password Change State
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'booking' | 'contact' | 'room' | 'gallery';
    id: string;
    label: string;
  } | null>(null);

  const authHeaders = (extra?: Record<string, string>) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  });

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: authHeaders(),
      });
      if (!res.ok) {
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      setAuthenticated(true);
      setBookings(data.bookings || []);
      setContacts(data.contacts || []);
      setRooms(data.rooms?.length ? data.rooms : INITIAL_ROOMS);
      setGallery(data.gallery?.length ? data.gallery : INITIAL_GALLERY);
    } catch {
      setAuthenticated(false);
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail.trim(),
          password: adminPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed.');
        return;
      }
      if (data.token) {
        sessionStorage.setItem('meadows_admin_token', data.token);
        setToken(data.token);
      }
      setAuthenticated(true);
      setAdminPassword('');
      fetchDashboardData();
    } catch {
      setLoginError('Network error while signing in.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    sessionStorage.removeItem('meadows_admin_token');
    setToken('');
    setAuthenticated(false);
  };

  const handleUpdateBookingStatus = async (
    id: string,
    status: BookingRecord['status']
  ) => {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    }
  };

  const handleToggleRoomActive = async (room: RoomRecord) => {
    const nextActive = !room.active;
    const res = await fetch(`/api/admin/rooms/${room.id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ active: nextActive }),
    });
    if (res.ok) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === room.id
            ? { ...r, active: nextActive, status: nextActive ? 'ACTIVE' : 'INACTIVE' }
            : r
        )
      );
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !newRoomDesc.trim()) return;
    const res = await fetch('/api/admin/rooms', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name: newRoomName.trim(),
        description: newRoomDesc.trim(),
        images: [newRoomImageChoice],
        active: true,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setRooms((prev) => [...prev, data.room]);
      setNewRoomName('');
      setNewRoomDesc('');
    }
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle.trim()) return;
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        title: newGalTitle.trim(),
        category: newGalCategory,
        imageUrl: newGalImageChoice,
        alt: newGalTitle.trim(),
        mimeType: 'image/jpeg',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setGallery((prev) => [data.item, ...prev]);
      setNewGalTitle('');
    }
  };

  const handleFileUploadGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewGalImageChoice(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const executeConfirmedDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    const endpointMap = {
      booking: `/api/admin/bookings/${id}`,
      contact: `/api/admin/contacts/${id}`,
      room: `/api/admin/rooms/${id}`,
      gallery: `/api/admin/gallery/${id}`,
    };

    const res = await fetch(endpointMap[type], {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (res.ok) {
      if (type === 'booking') setBookings((prev) => prev.filter((i) => i.id !== id));
      if (type === 'contact') setContacts((prev) => prev.filter((i) => i.id !== id));
      if (type === 'room') setRooms((prev) => prev.filter((i) => i.id !== id));
      if (type === 'gallery') setGallery((prev) => prev.filter((i) => i.id !== id));
    }
    setConfirmDelete(null);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg(null);
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        currentPassword: curPass,
        newPassword: newPass,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSettingsMsg('Password updated successfully.');
      setCurPass('');
      setNewPass('');
    } else {
      setSettingsMsg(data.error || 'Failed to update password.');
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#050708] text-[#F2E9D8] flex items-center justify-center">
        <div className="text-xs tracking-[0.25em] uppercase text-[#D4B47A]">
          Verifying Administrator Session...
        </div>
      </div>
    );
  }

  // ==========================================================================
  // UN-AUTHENTICATED VIEW: SECURE ADMIN LOGIN (NO PUBLIC REGISTRATION)
  // ==========================================================================
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#050708] text-[#F2E9D8] flex flex-col justify-between p-6">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#C5D1D0] hover:text-[#D4B47A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to The Meadows Resort</span>
          </Link>
          <span className="text-xs font-mono-tabular text-[#81957A]">
            SERVER-PROTECTED PORTAL
          </span>
        </div>

        <div className="max-w-md w-full mx-auto bg-[#071916] border border-[#D4B47A]/30 rounded-xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[#092B25] border border-[#D4B47A]/40">
              <Shield className="w-5 h-5 text-[#D4B47A]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#D4B47A]">
                Restricted Access
              </div>
              <h1 className="font-serif-display text-2xl text-[#F2E9D8]">
                Resort Administration
              </h1>
            </div>
          </div>

          <p className="text-xs text-[#C5D1D0] leading-relaxed">
            Authorized resort administrators and staff only. Public account registration is disabled for security.
          </p>

          {loginError && (
            <div className="p-3.5 rounded-lg bg-[#C66D3D]/20 border border-[#C66D3D] flex items-center gap-2 text-xs text-[#F2E9D8]">
              <AlertCircle className="w-4 h-4 text-[#C66D3D] shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs uppercase tracking-wider text-[#C5D1D0] mb-1.5"
              >
                Administrator Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@themeadowskodaikanal.com"
                className="w-full px-4 py-3 rounded-lg bg-[#050708] border border-white/15 text-sm text-[#F2E9D8] focus:outline-none focus:border-[#D4B47A]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs uppercase tracking-wider text-[#C5D1D0] mb-1.5"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-lg bg-[#050708] border border-white/15 text-sm text-[#F2E9D8] focus:outline-none focus:border-[#D4B47A]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-[#D4B47A] text-[#050708] font-semibold text-xs tracking-[0.18em] uppercase rounded-lg hover:bg-[#F2E9D8] transition-colors cursor-pointer"
            >
              SIGN IN TO DASHBOARD
            </button>
          </form>

          {/* Environment Setup Documentation Toggle */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setSetupInfoOpen((o) => !o)}
              className="text-xs text-[#81957A] hover:text-[#D4B47A] transition-colors underline cursor-pointer"
            >
              {setupInfoOpen
                ? 'Hide Administrator Provisioning Guide'
                : 'Owner & Evaluator Provisioning Instructions'}
            </button>
            {setupInfoOpen && (
              <div className="mt-3 p-4 rounded-lg bg-[#050708] border border-white/10 text-xs text-[#C5D1D0] space-y-2">
                <p>
                  Production credentials are provisioned via <code className="text-[#D4B47A]">ADMIN_EMAIL</code> and{' '}
                  <code className="text-[#D4B47A]">ADMIN_INITIAL_PASSWORD</code> in <code className="text-[#D4B47A]">.env</code>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('admin@themeadowskodaikanal.com');
                    setAdminPassword('MeadowsAdmin!2026');
                  }}
                  className="px-3 py-1.5 rounded bg-[#123C32] text-[#D4B47A] font-medium hover:bg-[#D4B47A] hover:text-[#050708] transition-colors cursor-pointer"
                >
                  Populate Development Evaluation Session
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-[#81957A]">
          The Meadows Resort Kodaikanal · Protected by HMAC Session & Rate Limiting
        </div>
      </div>
    );
  }

  // ==========================================================================
  // AUTHENTICATED VIEW: CLEAN DARK PROFESSIONAL ADMIN DASHBOARD (NO 3D CLUTTER)
  // ==========================================================================
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050708] text-[#F2E9D8] flex flex-col">
      {/* Admin Top Header */}
      <header className="px-6 py-4 bg-[#071916] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-[#092B25] border border-[#D4B47A]/30">
            <Shield className="w-5 h-5 text-[#D4B47A]" />
          </div>
          <div>
            <div className="text-xs text-[#D4B47A] uppercase tracking-widest">
              The Meadows Resort · Kodaikanal
            </div>
            <h1 className="text-lg font-semibold text-[#F2E9D8]">
              Management & Reservation Console
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="px-3.5 py-2 text-xs border border-white/15 rounded-lg text-[#C5D1D0] hover:border-[#D4B47A] hover:text-[#F2E9D8] transition-colors"
          >
            View Public Resort Website
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#123C32] text-[#F2E9D8] rounded-lg hover:bg-[#C66D3D] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] w-full mx-auto px-6 py-8 flex-1 space-y-8">
        {/* 5 Required Dashboard Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-xl bg-[#071916] border border-white/10">
            <div className="text-xs text-[#81957A] uppercase tracking-wider">Total Rooms</div>
            <div className="font-mono-tabular text-3xl font-semibold text-[#F2E9D8] mt-2">
              {rooms.length}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#071916] border border-white/10">
            <div className="text-xs text-[#81957A] uppercase tracking-wider">Active Rooms</div>
            <div className="font-mono-tabular text-3xl font-semibold text-[#D4B47A] mt-2">
              {rooms.filter((r) => r.active).length}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#071916] border border-white/10">
            <div className="text-xs text-[#81957A] uppercase tracking-wider">
              New Booking Inquiries
            </div>
            <div className="font-mono-tabular text-3xl font-semibold text-[#D4B47A] mt-2">
              {bookings.filter((b) => b.status === 'NEW').length}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#071916] border border-white/10">
            <div className="text-xs text-[#81957A] uppercase tracking-wider">
              Contact Messages
            </div>
            <div className="font-mono-tabular text-3xl font-semibold text-[#F2E9D8] mt-2">
              {contacts.length}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#071916] border border-white/10">
            <div className="text-xs text-[#81957A] uppercase tracking-wider">Gallery Items</div>
            <div className="font-mono-tabular text-3xl font-semibold text-[#F2E9D8] mt-2">
              {gallery.length}
            </div>
          </div>
        </div>

        {/* Navigation Tabs: Bookings, Rooms, Gallery, Messages, Settings */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          {(
            [
              { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
              { id: 'rooms', label: 'Rooms', icon: BedDouble },
              { id: 'gallery', label: 'Gallery', icon: ImageIcon },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'settings', label: 'Settings', icon: Settings },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#D4B47A] text-[#050708]'
                    : 'bg-[#071916] text-[#C5D1D0] hover:text-[#F2E9D8]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#81957A] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by guest name, email, or reference ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#071916] border border-white/15 text-xs text-[#F2E9D8] focus:outline-none focus:border-[#D4B47A]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {(['ALL', 'NEW', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                        statusFilter === st
                          ? 'bg-[#123C32] text-[#D4B47A] border border-[#D4B47A]/50'
                          : 'bg-[#071916] text-[#C5D1D0]'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="rounded-xl bg-[#071916] border border-white/10 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#81957A] uppercase">
                    <th className="py-3.5 px-4">Ref ID</th>
                    <th className="py-3.5 px-4">Guest</th>
                    <th className="py-3.5 px-4">Room Category</th>
                    <th className="py-3.5 px-4">Dates</th>
                    <th className="py-3.5 px-4">Guests</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#81957A]">
                        No real guest booking inquiries match the current filter. Submit a booking inquiry on the public website to test live persistence.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4 font-mono-tabular text-[#D4B47A]">{b.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#F2E9D8]">{b.name}</div>
                          <div className="text-[#81957A] font-mono-tabular">
                            {b.phone} · {b.email}
                          </div>
                          {b.specialRequest && (
                            <div className="text-[#C5D1D0] mt-1 italic">“{b.specialRequest}”</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#E7E1D5]">{b.roomType}</td>
                        <td className="py-3.5 px-4 font-mono-tabular text-[#C5D1D0]">
                          {b.checkIn} → {b.checkOut}
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular">{b.guests}</td>
                        <td className="py-3.5 px-4">
                          <select
                            aria-label={`Change status for ${b.id}`}
                            value={b.status}
                            onChange={(e) =>
                              handleUpdateBookingStatus(
                                b.id,
                                e.target.value as BookingRecord['status']
                              )
                            }
                            className="px-2.5 py-1.5 rounded bg-[#050708] border border-white/15 text-xs text-[#D4B47A]"
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDelete({
                                type: 'booking',
                                id: b.id,
                                label: `Booking Inquiry ${b.id} (${b.name})`,
                              })
                            }
                            className="p-2 text-[#C5D1D0] hover:text-[#C66D3D] transition-colors cursor-pointer"
                            aria-label={`Delete booking ${b.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ROOMS MANAGEMENT */}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-base font-semibold text-[#F2E9D8]">
                Manage Resort Room Categories
              </h2>
              <div className="space-y-3">
                {rooms.map((rm) => (
                  <div
                    key={rm.id}
                    className="p-5 rounded-xl bg-[#071916] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-base text-[#F2E9D8]">{rm.name}</span>
                        <span className="text-[#81957A]">·</span>
                        <span className={rm.active ? 'text-[#D4B47A]' : 'text-[#81957A]'}>
                          {rm.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs text-[#C5D1D0] line-clamp-2">{rm.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleRoomActive(rm)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#092B25] border border-white/15 text-xs text-[#F2E9D8] hover:border-[#D4B47A] cursor-pointer"
                      >
                        {rm.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{rm.active ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDelete({
                            type: 'room',
                            id: rm.id,
                            label: rm.name,
                          })
                        }
                        className="p-2 rounded-lg bg-[#050708] border border-white/10 text-[#C5D1D0] hover:text-[#C66D3D] cursor-pointer"
                        aria-label={`Delete ${rm.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#071916] border border-white/10 rounded-xl p-6 space-y-4 h-fit">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#D4B47A]">
                <Plus className="w-4 h-4" />
                <span>Add Verified Room Category</span>
              </div>
              <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#C5D1D0] mb-1">Room Category Title *</label>
                  <input
                    type="text"
                    required
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g. Mountain View Family Suite"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#050708] border border-white/15 text-[#F2E9D8]"
                  />
                </div>
                <div>
                  <label className="block text-[#C5D1D0] mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    placeholder="Verified architectural and hospitality description..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#050708] border border-white/15 text-[#F2E9D8]"
                  />
                </div>
                <div>
                  <label className="block text-[#C5D1D0] mb-1">Architectural Photograph</label>
                  <select
                    value={newRoomImageChoice}
                    onChange={(e) => setNewRoomImageChoice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#050708] border border-white/15 text-[#F2E9D8]"
                  >
                    <option value={RESORT_ASSETS.roomQuadBalcony}>
                      Quadruple Balcony Sanctuary View
                    </option>
                    <option value={RESORT_ASSETS.roomEconomyQuad}>
                      Economy Quadruple Forest View
                    </option>
                    <option value={RESORT_ASSETS.roomStandardFamily}>
                      Standard Family Timber Interior
                    </option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#D4B47A] text-[#050708] font-semibold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Create Room Category
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: GALLERY MANAGEMENT */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl overflow-hidden bg-[#071916] border border-white/10 flex flex-col justify-between"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.alt}
                    referrerPolicy="no-referrer"
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-[#D4B47A] uppercase tracking-widest">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-medium text-[#F2E9D8]">{item.title}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDelete({
                          type: 'gallery',
                          id: item.id,
                          label: item.title,
                        })
                      }
                      className="p-2 text-[#81957A] hover:text-[#C66D3D] cursor-pointer"
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 bg-[#071916] border border-white/10 rounded-xl p-6 space-y-4 h-fit">
              <div className="text-sm font-semibold text-[#D4B47A]">
                Add / Upload Validated Gallery Asset
              </div>
              <form onSubmit={handleCreateGalleryItem} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#C5D1D0] mb-1">Photograph Title *</label>
                  <input
                    type="text"
                    required
                    value={newGalTitle}
                    onChange={(e) => setNewGalTitle(e.target.value)}
                    placeholder="e.g. Morning Mist Over Paraipatti"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#050708] border border-white/15 text-[#F2E9D8]"
                  />
                </div>
                <div>
                  <label className="block text-[#C5D1D0] mb-1">Category *</label>
                  <select
                    value={newGalCategory}
                    onChange={(e) => setNewGalCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#050708] border border-white/15 text-[#F2E9D8]"
                  >
                    <option value="RESORT">RESORT</option>
                    <option value="ROOMS">ROOMS</option>
                    <option value="NATURE">NATURE</option>
                    <option value="DINING">DINING</option>
                    <option value="EXPERIENCES">EXPERIENCES</option>
                    <option value="KODAIKANAL">KODAIKANAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#C5D1D0] mb-1">
                    Upload Image (JPEG/PNG/WebP, max 2MB)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleFileUploadGallery}
                    className="w-full text-xs text-[#C5D1D0] file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-[#123C32] file:text-[#F2E9D8] cursor-pointer"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#D4B47A] text-[#050708] font-semibold uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Publish to Gallery
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT MESSAGES */}
        {activeTab === 'messages' && (
          <div className="rounded-xl bg-[#071916] border border-white/10 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#81957A] uppercase">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Sender</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Message</th>
                  <th className="py-3.5 px-4">Received</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#81957A]">
                      No contact inquiries received yet.
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3.5 px-4 font-mono-tabular text-[#D4B47A]">{c.id}</td>
                      <td className="py-3.5 px-4 font-medium text-[#F2E9D8]">{c.name}</td>
                      <td className="py-3.5 px-4 font-mono-tabular text-[#C5D1D0]">
                        {c.phone} · {c.email}
                      </td>
                      <td className="py-3.5 px-4 text-[#E7E1D5] max-w-md">{c.message}</td>
                      <td className="py-3.5 px-4 font-mono-tabular text-[#81957A]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDelete({
                              type: 'contact',
                              id: c.id,
                              label: `Message from ${c.name}`,
                            })
                          }
                          className="p-2 text-[#81957A] hover:text-[#C66D3D] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-lg bg-[#071916] border border-white/10 rounded-xl p-6 space-y-5">
            <h2 className="text-base font-semibold text-[#F2E9D8]">
              Administrator Security Credentials
            </h2>
            {settingsMsg && (
              <div className="p-3 rounded-lg bg-[#092B25] border border-[#D4B47A] text-xs text-[#F2E9D8] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4B47A]" />
                <span>{settingsMsg}</span>
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#C5D1D0] mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={curPass}
                  onChange={(e) => setCurPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#050708] border border-white/15 text-[#F2E9D8]"
                />
              </div>
              <div>
                <label className="block text-[#C5D1D0] mb-1">
                  New Password (minimum 8 characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#050708] border border-white/15 text-[#F2E9D8]"
                />
              </div>
              <button
                type="submit"
                className="py-3 px-6 bg-[#D4B47A] text-[#050708] font-semibold uppercase tracking-wider rounded-lg cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#050708]/85 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-[#071916] border border-[#C66D3D] rounded-xl p-6 space-y-4">
            <h3 className="font-serif-display text-2xl text-[#F2E9D8]">Confirm Deletion</h3>
            <p className="text-xs text-[#C5D1D0]">
              Are you sure you want to permanently remove <strong>{confirmDelete.label}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg border border-white/15 text-xs text-[#C5D1D0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmedDelete}
                className="px-4 py-2 rounded-lg bg-[#C66D3D] text-[#F2E9D8] text-xs font-semibold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
