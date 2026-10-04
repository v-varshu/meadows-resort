import React, { useState } from 'react';
import { Phone, Navigation, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { RESORT_INFO } from '../../data/resort';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = 'Please enter your name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!phone.trim() || !/^[+\d][\d\s\-()]{6,22}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number.';
    }
    if (!message.trim() || message.trim().length < 5) {
      errs.message = 'Please enter a message (at least 5 characters).';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setErrorMsg(data.error || 'Could not send message.');
      } else {
        setSuccessId(data.contactId || 'RECEIVED');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      }
    } catch {
      setErrorMsg('Network error while sending message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 px-6 bg-[#050708] border-t border-white/10">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Verified Address & Direct Actions */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="text-xs tracking-[0.25em] text-[#D4B47A] uppercase mb-3">
              10. Direct Hospitality Desk
            </div>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#F2E9D8]">
              CONTACT THE MEADOWS RESORT
            </h2>
          </div>

          <div className="p-6 rounded-xl bg-[#071916] border border-[#D4B47A]/25 space-y-6">
            <div className="flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-[#D4B47A] shrink-0 mt-1" />
              <div className="space-y-1 text-sm text-[#E7E1D5]">
                <div className="font-semibold tracking-wider text-[#F2E9D8] uppercase">
                  {RESORT_INFO.name}
                </div>
                <p>{RESORT_INFO.address.line1}</p>
                <p>{RESORT_INFO.address.line2}</p>
                <p>{RESORT_INFO.address.line3}</p>
                <p>{RESORT_INFO.address.city}</p>
                <p>{RESORT_INFO.address.statePostal}</p>
                <p>{RESORT_INFO.address.country}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#81957A]">
                Reception Telephone
              </span>
              <a
                href={`tel:${RESORT_INFO.phoneDial}`}
                className="font-mono-tabular text-lg text-[#D4B47A] font-medium hover:underline"
              >
                {RESORT_INFO.phone}
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`tel:${RESORT_INFO.phoneDial}`}
                data-cursor="BOOK"
                className="flex items-center justify-center gap-2 py-3.5 px-5 bg-[#D4B47A] text-[#050708] font-semibold text-xs tracking-[0.16em] uppercase rounded-lg hover:bg-[#F2E9D8] transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                <span>CALL NOW</span>
              </a>

              <a
                href={RESORT_INFO.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="EXPLORE"
                className="flex items-center justify-center gap-2 py-3.5 px-5 bg-[#123C32] text-[#F2E9D8] border border-[#D4B47A]/40 font-semibold text-xs tracking-[0.16em] uppercase rounded-lg hover:bg-[#D4B47A] hover:text-[#050708] transition-colors whitespace-nowrap"
              >
                <Navigation className="w-4 h-4" />
                <span>GET DIRECTIONS</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Contact Inquiry Form */}
        <div className="lg:col-span-7 bg-[#071916] border border-white/10 rounded-xl p-6 md:p-10">
          <h3 className="font-serif-display text-2xl md:text-3xl text-[#F2E9D8] mb-2">
            Send a Direct Message
          </h3>
          <p className="text-xs md:text-sm text-[#C5D1D0] mb-6">
            Have a question regarding group stays, dining, or local Kodaikanal directions? Write to our front desk below.
          </p>

          {successId ? (
            <div className="p-6 rounded-xl bg-[#092B25] border border-[#D4B47A] space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#D4B47A]" />
                <div>
                  <div className="text-xs text-[#D4B47A] uppercase tracking-widest">
                    MESSAGE RECEIVED ({successId})
                  </div>
                  <h4 className="font-serif-display text-2xl text-[#F2E9D8]">
                    We Will Respond Shortly
                  </h4>
                </div>
              </div>
              <p className="text-sm text-[#C5D1D0]">
                Thank you for contacting The Meadows Resort, Kodaikanal. Your message has been logged with our 24-hour front desk.
              </p>
              <button
                type="button"
                onClick={() => setSuccessId(null)}
                className="px-5 py-2.5 bg-[#D4B47A] text-[#050708] text-xs font-semibold uppercase tracking-wider rounded-lg cursor-pointer"
              >
                SEND ANOTHER MESSAGE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-lg bg-[#C66D3D]/20 border border-[#C66D3D] flex items-center gap-2.5 text-xs text-[#F2E9D8]">
                  <AlertCircle className="w-4 h-4 text-[#C66D3D] shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs uppercase tracking-wider text-[#C5D1D0] mb-1.5"
                  >
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-4 py-3 rounded-lg bg-[#050708] border border-white/15 text-sm text-[#F2E9D8] focus:outline-none focus:border-[#D4B47A]"
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-[#C66D3D] mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs uppercase tracking-wider text-[#C5D1D0] mb-1.5"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94455 86811"
                    className="w-full px-4 py-3 rounded-lg bg-[#050708] border border-white/15 text-sm text-[#F2E9D8] font-mono-tabular focus:outline-none focus:border-[#D4B47A]"
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-[#C66D3D] mt-1">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs uppercase tracking-wider text-[#C5D1D0] mb-1.5"
                >
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-[#050708] border border-white/15 text-sm text-[#F2E9D8] focus:outline-none focus:border-[#D4B47A]"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-[#C66D3D] mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs uppercase tracking-wider text-[#C5D1D0] mb-1.5"
                >
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our Kodaikanal team assist you?"
                  className="w-full px-4 py-3 rounded-lg bg-[#050708] border border-white/15 text-sm text-[#F2E9D8] focus:outline-none focus:border-[#D4B47A]"
                />
                {fieldErrors.message && (
                  <p className="text-xs text-[#C66D3D] mt-1">{fieldErrors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-[#D4B47A] text-[#050708] font-semibold text-xs tracking-[0.18em] uppercase rounded-lg hover:bg-[#F2E9D8] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting ? 'SENDING MESSAGE...' : 'SEND MESSAGE TO CONCIERGE'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
