import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, AlertCircle, Users, Sparkles } from 'lucide-react';
import { RoomData } from '../../data/resort';

interface BookingSectionProps {
  rooms: RoomData[];
  preselectedRoom?: string;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ rooms, preselectedRoom }) => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysOut = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(threeDaysOut);
  const [guests, setGuests] = useState<number>(2);
  const [roomType, setRoomType] = useState<string>(
    preselectedRoom || rooms[0]?.name || 'Quadruple Room with Balcony'
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedRecord, setSubmittedRecord] = useState<{
    id: string;
    name: string;
    checkIn: string;
    checkOut: string;
    roomType: string;
    guests: number;
  } | null>(null);

  useEffect(() => {
    if (preselectedRoom) {
      setRoomType(preselectedRoom);
    }
  }, [preselectedRoom]);

  const validateClient = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Please enter your full name.';
    }
    if (!phone.trim() || !/^[+\d][\d\s\-()]{6,22}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!checkIn) errs.checkIn = 'Select a check-in date.';
    if (!checkOut) errs.checkOut = 'Select a check-out date.';
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      errs.checkOut = 'Check-out date must be after check-in date.';
    }
    if (!guests || guests < 1 || guests > 16) {
      errs.guests = 'Guests must be between 1 and 16.';
    }
    if (!roomType) {
      errs.roomType = 'Please choose a room category.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!validateClient()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/booking-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          checkIn,
          checkOut,
          guests: Number(guests),
          roomType,
          specialRequest: specialRequest.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setErrorMessage(data.error || 'Could not submit booking inquiry.');
      } else {
        setSubmittedRecord(data.inquiry);
        setName('');
        setPhone('');
        setEmail('');
        setSpecialRequest('');
      }
    } catch {
      setErrorMessage('Network error while connecting to the reservation server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-24 md:py-32 px-6 bg-[#071916] border-t border-[#D4B47A]/20">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Editorial Context */}
        <div className="lg:col-span-5 space-y-6">
          <div className="text-xs tracking-[0.25em] text-[#D4B47A] uppercase">
            09. BOOKING INQUIRY
          </div>
          <h2 className="font-serif-display text-4xl md:text-5xl text-[#F2E9D8] leading-tight">
            RESERVE YOUR MOUNTAIN SANCTUARY
          </h2>
          <p className="text-sm md:text-base text-[#C5D1D0] leading-relaxed">
            Submit your preferred dates and room category below. Every stay at The Meadows Resort Kodaikanal is personally reviewed and confirmed by our on-site hospitality desk.
          </p>

          <div className="p-6 rounded-xl bg-[#092B25]/80 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#D4B47A] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Transparent Reservation Protocol</span>
            </div>
            <p className="text-xs text-[#E7E1D5]/85 leading-relaxed">
              This system registers a direct <strong>BOOKING INQUIRY</strong> with our Kodaikanal reception desk. Rather than displaying automated placeholder rates, our team contacts you directly via phone or email with verified seasonal tariffs and availability.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#C5D1D0]">
              <span>Direct Front Desk Line</span>
              <a
                href="tel:+919445586811"
                className="font-mono-tabular text-[#D4B47A] hover:underline"
              >
                094455 86811
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Validated Inquiry Form */}
        <div className="lg:col-span-7 bg-[#050708] border border-[#D4B47A]/30 rounded-xl p-6 md:p-10 shadow-2xl">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
            <div>
              <span className="text-xs tracking-[0.2em] text-[#D4B47A] uppercase">
                BOOKING INQUIRY FORM
              </span>
              <h3 className="font-serif-display text-2xl text-[#F2E9D8] mt-0.5">
                Stay Preferences & Guest Details
              </h3>
            </div>
            <Calendar className="w-5 h-5 text-[#D4B47A]" />
          </div>

          {submittedRecord ? (
            <div
              role="status"
              className="p-8 rounded-xl bg-[#092B25] border border-[#D4B47A] space-y-5 text-[#F2E9D8]"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-[#D4B47A] shrink-0" />
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#D4B47A]">
                    BOOKING INQUIRY REGISTERED
                  </div>
                  <h4 className="font-serif-display text-2xl">
                    Thank You, {submittedRecord.name}
                  </h4>
                </div>
              </div>
              <p className="text-sm text-[#C5D1D0] leading-relaxed">
                Your booking inquiry has been securely saved in our reservation database. Our Kodaikanal hospitality team will reach out shortly to confirm availability and finalize your stay.
              </p>
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-[#050708]/70 border border-white/10 text-xs">
                <div>
                  <span className="text-[#81957A] block">Reference ID</span>
                  <span className="font-mono-tabular text-[#D4B47A] font-medium">
                    {submittedRecord.id}
                  </span>
                </div>
                <div>
                  <span className="text-[#81957A] block">Selected Category</span>
                  <span className="text-[#F2E9D8]">{submittedRecord.roomType}</span>
                </div>
                <div>
                  <span className="text-[#81957A] block">Check-In / Check-Out</span>
                  <span className="font-mono-tabular text-[#F2E9D8]">
                    {submittedRecord.checkIn} → {submittedRecord.checkOut}
                  </span>
                </div>
                <div>
                  <span className="text-[#81957A] block">Guests</span>
                  <span className="font-mono-tabular text-[#F2E9D8]">
                    {submittedRecord.guests} Guests
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubmittedRecord(null)}
                className="px-6 py-3 bg-[#D4B47A] text-[#050708] text-xs font-semibold tracking-[0.15em] uppercase rounded-lg hover:bg-[#F2E9D8] transition-colors cursor-pointer"
              >
                SUBMIT ANOTHER BOOKING INQUIRY
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {errorMessage && (
                <div
                  role="alert"
                  className="p-4 rounded-lg bg-[#C66D3D]/20 border border-[#C66D3D] flex items-start gap-3 text-xs text-[#F2E9D8]"
                >
                  <AlertCircle className="w-4 h-4 text-[#C66D3D] shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="booking-checkin"
                    className="block text-xs tracking-wider uppercase text-[#C5D1D0] mb-2"
                  >
                    Check-In Date *
                  </label>
                  <input
                    id="booking-checkin"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#071916] border border-white/15 text-sm text-[#F2E9D8] font-mono-tabular focus:outline-none focus:border-[#D4B47A]"
                  />
                  {fieldErrors.checkIn && (
                    <p className="text-xs text-[#C66D3D] mt-1">{fieldErrors.checkIn}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-checkout"
                    className="block text-xs tracking-wider uppercase text-[#C5D1D0] mb-2"
                  >
                    Check-Out Date *
                  </label>
                  <input
                    id="booking-checkout"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#071916] border border-white/15 text-sm text-[#F2E9D8] font-mono-tabular focus:outline-none focus:border-[#D4B47A]"
                  />
                  {fieldErrors.checkOut && (
                    <p className="text-xs text-[#C66D3D] mt-1">{fieldErrors.checkOut}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="booking-guests"
                    className="block text-xs tracking-wider uppercase text-[#C5D1D0] mb-2"
                  >
                    Number of Guests *
                  </label>
                  <div className="relative">
                    <input
                      id="booking-guests"
                      type="number"
                      min={1}
                      max={16}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#071916] border border-white/15 text-sm text-[#F2E9D8] font-mono-tabular focus:outline-none focus:border-[#D4B47A]"
                    />
                    <Users className="w-4 h-4 text-[#81957A] absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  {fieldErrors.guests && (
                    <p className="text-xs text-[#C66D3D] mt-1">{fieldErrors.guests}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-roomtype"
                    className="block text-xs tracking-wider uppercase text-[#C5D1D0] mb-2"
                  >
                    Room Category *
                  </label>
                  <select
                    id="booking-roomtype"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#071916] border border-white/15 text-sm text-[#F2E9D8] focus:outline-none focus:border-[#D4B47A]"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.name} className="bg-[#050708] text-[#F2E9D8]">
                        {r.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.roomType && (
                    <p className="text-xs text-[#C66D3D] mt-1">{fieldErrors.roomType}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="booking-name"
                    className="block text-xs tracking-wider uppercase text-[#C5D1D0] mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#071916] border border-white/15 text-sm text-[#F2E9D8] placeholder-[#81957A]/60 focus:outline-none focus:border-[#D4B47A]"
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-[#C66D3D] mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-phone"
                    className="block text-xs tracking-wider uppercase text-[#C5D1D0] mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#071916] border border-white/15 text-sm text-[#F2E9D8] font-mono-tabular placeholder-[#81957A]/60 focus:outline-none focus:border-[#D4B47A]"
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-[#C66D3D] mt-1">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-email"
                  className="block text-xs tracking-wider uppercase text-[#C5D1D0] mb-2"
                >
                  Email Address *
                </label>
                <input
                  id="booking-email"
                  type="email"
                  placeholder="guest@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#071916] border border-white/15 text-sm text-[#F2E9D8] placeholder-[#81957A]/60 focus:outline-none focus:border-[#D4B47A]"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-[#C66D3D] mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="booking-special"
                  className="block text-xs tracking-wider uppercase text-[#C5D1D0] mb-2"
                >
                  Special Requests (Optional)
                </label>
                <textarea
                  id="booking-special"
                  rows={3}
                  placeholder="Arrival timing, airport shuttle request, dietary preferences, or family arrangements..."
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#071916] border border-white/15 text-sm text-[#F2E9D8] placeholder-[#81957A]/60 focus:outline-none focus:border-[#D4B47A]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                data-cursor="BOOK"
                className="w-full py-4 px-6 bg-[#D4B47A] text-[#050708] font-semibold text-xs tracking-[0.18em] uppercase rounded-lg hover:bg-[#F2E9D8] disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? 'SUBMITTING BOOKING INQUIRY...' : 'SUBMIT BOOKING INQUIRY'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
