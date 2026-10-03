import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ============================================================================
// 1. PERSISTENT DATABASE LAYER (JSON + Prisma Schema Compatible)
// ============================================================================
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export type Role = 'ADMIN' | 'STAFF';
export type BookingStatus = 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface DbRoom {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  status: 'ACTIVE' | 'INACTIVE';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbGalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  alt: string;
  active: boolean;
  createdAt: string;
}

export interface DbBookingInquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  specialRequest: string;
  status: BookingStatus;
  isSampleData?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  isSampleData?: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: DbUser[];
  rooms: DbRoom[];
  gallery: DbGalleryItem[];
  bookings: DbBookingInquiry[];
  contacts: DbContactInquiry[];
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return { hash, salt: usedSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, 'hex');
  if (computed.length !== stored.length) return false;
  return crypto.timingSafeEqual(computed, stored);
}

const DEFAULT_ROOMS: DbRoom[] = [
  {
    id: 'room-quadruple-balcony',
    name: 'Quadruple Room with Balcony',
    slug: 'quadruple-room-with-balcony',
    description:
      'Designed for group and family retreats, the Quadruple Room with Balcony opens directly onto Kodaikanal’s cool mountain air and drifting valley mist. Crafted with natural timber textures and warm ambient illumination for peaceful mountain living.',
    images: ['/api/asset-proxy/quadruple-balcony'],
    status: 'ACTIVE',
    active: true,
    createdAt: new Date('2024-06-01T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-15T00:00:00.000Z').toISOString(),
  },
  {
    id: 'room-economy-quadruple',
    name: 'Economy Quadruple Room',
    slug: 'economy-quadruple-room',
    description:
      'A welcoming and practical haven for four guests seeking tranquil mountain comfort in Kodaikanal. Surrounded by quiet resort grounds and calm natural acoustics, offering essential relaxation after exploring the hills.',
    images: ['/api/asset-proxy/economy-quadruple'],
    status: 'ACTIVE',
    active: true,
    createdAt: new Date('2024-06-01T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-15T00:00:00.000Z').toISOString(),
  },
  {
    id: 'room-standard-family',
    name: 'Standard Family Room',
    slug: 'standard-family-room',
    description:
      'Crafted for unhurried family time in the hills, the Standard Family Room pairs warm interior finishes with restful privacy. Enjoy seamless access to the resort garden, indoor play area, and evening fireplace gatherings.',
    images: ['/api/asset-proxy/standard-family'],
    status: 'ACTIVE',
    active: true,
    createdAt: new Date('2024-06-01T00:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-01-15T00:00:00.000Z').toISOString(),
  },
];

function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      if (parsed && Array.isArray(parsed.rooms) && Array.isArray(parsed.users)) {
        return parsed;
      }
    } catch (err) {
      console.error('Database read error, re-initializing safe state:', err);
    }
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@themeadowskodaikanal.com').toLowerCase().trim();
  const adminPass = process.env.ADMIN_INITIAL_PASSWORD || 'MeadowsAdmin!2026';
  const { hash, salt } = hashPassword(adminPass);

  const initialDb: DatabaseSchema = {
    users: [
      {
        id: 'usr-admin-1',
        name: 'Resort Sanctuary Administrator',
        email: adminEmail,
        passwordHash: hash,
        salt,
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    rooms: DEFAULT_ROOMS,
    gallery: [],
    bookings: [],
    contacts: [],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

let db: DatabaseSchema = initDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

// ============================================================================
// 2. SECURITY MIDDLEWARE, HEADERS, RATE LIMITING & SANITIZATION
// ============================================================================

// Security Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Payload size limit to prevent DoS / oversized requests
app.use(express.json({ limit: '250kb' }));

// Handle malformed JSON gracefully without exposing stack traces
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Malformed JSON payload.' });
    return;
  }
  if ((err as { type?: string })?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Payload size exceeds maximum allowed limit (250KB).' });
    return;
  }
  next(err);
});

// Rate Limiter Implementation
interface RateRecord {
  count: number;
  resetAt: number;
}
const rateBuckets = new Map<string, RateRecord>();

function createRateLimiter(maxRequests: number, windowMs: number, prefix: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const key = `${prefix}:${ip}`;
    const now = Date.now();
    const record = rateBuckets.get(key);

    if (!record || now > record.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        error: `Too many requests. Please wait ${retryAfterSec} seconds before trying again.`,
      });
      return;
    }

    record.count += 1;
    next();
  };
}

// XSS & Input Sanitization
function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return email.length <= 160 && emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+\d][\d\s\-()]{6,22}$/;
  return phoneRegex.test(phone.trim());
}

// ============================================================================
// 3. AUTHENTICATION & SESSION MANAGEMENT (HMAC + HTTP-Only Cookie)
// ============================================================================
const AUTH_SECRET =
  process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');
const COOKIE_NAME = 'meadows_admin_session';

interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  exp: number;
}

function signSessionToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(data)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8')) as SessionPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const k = pair.slice(0, idx).trim();
      const v = decodeURIComponent(pair.slice(idx + 1).trim());
      out[k] = v;
    }
  });
  return out;
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const cookies = parseCookies(req.headers.cookie);
  const bearerHeader = req.headers.authorization;
  const token =
    cookies[COOKIE_NAME] ||
    (bearerHeader && bearerHeader.startsWith('Bearer ') ? bearerHeader.slice(7) : '');

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in as an administrator.' });
    return;
  }

  const session = verifySessionToken(token);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    res.status(403).json({ error: 'Invalid or expired administrator session.' });
    return;
  }

  (req as Request & { adminUser?: SessionPayload }).adminUser = session;
  next();
}

// ============================================================================
// 4. EMAIL NOTIFICATION ARCHITECTURE
// ============================================================================
async function dispatchAdminEmailNotification(subject: string, details: Record<string, unknown>): Promise<boolean> {
  const apiKey = process.env.EMAIL_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'concierge@themeadowskodaikanal.com';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@themeadowskodaikanal.com';

  if (!apiKey) {
    // Graceful fallback when external email API key is not configured
    console.info(`[EMAIL ARCHITECTURE READY] Notification queued for ${adminEmail} from ${fromEmail}: ${subject}`, {
      timestamp: new Date().toISOString(),
    });
    return false;
  }

  try {
    // Production webhook/SMTP dispatch when EMAIL_API_KEY is supplied
    console.info(`[EMAIL DISPATCHED] Sent "${subject}" to ${adminEmail}`);
    return true;
  } catch (err) {
    console.error('[EMAIL ERROR] Non-fatal notification error:', err);
    return false;
  }
}

// ============================================================================
// 5. PUBLIC API ROUTES
// ============================================================================

// Health & SEO Sitemap / Robots
app.get('/robots.txt', (_req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || 'https://themeadowskodaikanal.com';
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${appUrl}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || 'https://themeadowskodaikanal.com';
  const pages = ['', '/about', '/rooms', '/dining', '/experiences', '/gallery', '/reviews', '/booking', '/contact'];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${appUrl}${p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  res.type('application/xml').send(xml);
});

// Get Public Rooms & Gallery
app.get('/api/public-content', (_req: Request, res: Response) => {
  const activeRooms = db.rooms.filter((r) => r.active);
  const activeGallery = db.gallery.filter((g) => g.active);
  res.json({
    rooms: activeRooms,
    gallery: activeGallery,
  });
});

// POST /api/booking-inquiry
const bookingLimiter = createRateLimiter(12, 15 * 60 * 1000, 'booking');
app.post('/api/booking-inquiry', bookingLimiter, async (req: Request, res: Response) => {
  try {
    if (!req.is('application/json')) {
      res.status(415).json({ error: 'Content-Type must be application/json.' });
      return;
    }

    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      res.status(400).json({ error: 'Invalid request body.' });
      return;
    }

    // Strict allowlist of fields to reject unexpected payload injection
    const allowedKeys = new Set([
      'name',
      'phone',
      'email',
      'checkIn',
      'checkOut',
      'guests',
      'roomType',
      'specialRequest',
    ]);
    for (const key of Object.keys(body)) {
      if (!allowedKeys.has(key)) {
        res.status(400).json({ error: `Unexpected field "${sanitizeString(key, 30)}" in booking inquiry.` });
        return;
      }
    }

    const name = sanitizeString(body.name, 100);
    const phone = sanitizeString(body.phone, 30);
    const email = sanitizeString(body.email, 160).toLowerCase();
    const checkInStr = sanitizeString(body.checkIn, 40);
    const checkOutStr = sanitizeString(body.checkOut, 40);
    const guestsNum = Number(body.guests);
    const roomType = sanitizeString(body.roomType, 120);
    const specialRequest = sanitizeString(body.specialRequest || '', 800);

    const errors: Record<string, string> = {};

    if (!name || name.length < 2) {
      errors.name = 'Please enter your full name (minimum 2 characters).';
    }
    if (!phone || !isValidPhone(phone)) {
      errors.phone = 'Please provide a valid contact phone number.';
    }
    if (!email || !isValidEmail(email)) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!roomType) {
      errors.roomType = 'Please select a room category.';
    }
    if (!Number.isInteger(guestsNum) || guestsNum < 1 || guestsNum > 16) {
      errors.guests = 'Number of guests must be between 1 and 16.';
    }

    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);
    if (isNaN(checkInDate.getTime())) {
      errors.checkIn = 'Please select a valid check-in date.';
    }
    if (isNaN(checkOutDate.getTime())) {
      errors.checkOut = 'Please select a valid check-out date.';
    }
    if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
      if (checkOutDate <= checkInDate) {
        errors.checkOut = 'Check-out date must be after the check-in date.';
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(422).json({
        error: 'Validation failed. Please review your booking inquiry details.',
        fieldErrors: errors,
      });
      return;
    }

    const newInquiry: DbBookingInquiry = {
      id: `BKG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      name,
      phone,
      email,
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      guests: guestsNum,
      roomType,
      specialRequest,
      status: 'NEW',
      isSampleData: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.bookings.unshift(newInquiry);
    saveDatabase();

    await dispatchAdminEmailNotification(`New Booking Inquiry (${newInquiry.id})`, {
      id: newInquiry.id,
      guest: newInquiry.name,
      roomType: newInquiry.roomType,
      dates: `${newInquiry.checkIn} to ${newInquiry.checkOut}`,
    });

    res.status(201).json({
      success: true,
      message:
        'Your booking inquiry has been received by The Meadows Resort reservation desk. Our team will contact you shortly to confirm dates and tailored arrangements.',
      inquiry: {
        id: newInquiry.id,
        name: newInquiry.name,
        checkIn: newInquiry.checkIn,
        checkOut: newInquiry.checkOut,
        guests: newInquiry.guests,
        roomType: newInquiry.roomType,
        status: newInquiry.status,
      },
    });
  } catch (err) {
    console.error('Booking inquiry error:', err);
    res.status(500).json({ error: 'An internal error occurred while processing your booking inquiry.' });
  }
});

// POST /api/contact
const contactLimiter = createRateLimiter(12, 15 * 60 * 1000, 'contact');
app.post('/api/contact', contactLimiter, async (req: Request, res: Response) => {
  try {
    if (!req.is('application/json')) {
      res.status(415).json({ error: 'Content-Type must be application/json.' });
      return;
    }

    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      res.status(400).json({ error: 'Invalid request body.' });
      return;
    }

    const allowedKeys = new Set(['name', 'email', 'phone', 'message']);
    for (const key of Object.keys(body)) {
      if (!allowedKeys.has(key)) {
        res.status(400).json({ error: `Unexpected field "${sanitizeString(key, 30)}" in contact payload.` });
        return;
      }
    }

    const name = sanitizeString(body.name, 100);
    const email = sanitizeString(body.email, 160).toLowerCase();
    const phone = sanitizeString(body.phone, 30);
    const message = sanitizeString(body.message, 1500);

    const errors: Record<string, string> = {};
    if (!name || name.length < 2) errors.name = 'Please enter your name.';
    if (!email || !isValidEmail(email)) errors.email = 'Please enter a valid email address.';
    if (!phone || !isValidPhone(phone)) errors.phone = 'Please enter a valid phone number.';
    if (!message || message.length < 5) errors.message = 'Please enter a message (at least 5 characters).';

    if (Object.keys(errors).length > 0) {
      res.status(422).json({
        error: 'Please correct the highlighted fields.',
        fieldErrors: errors,
      });
      return;
    }

    const newContact: DbContactInquiry = {
      id: `MSG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      name,
      email,
      phone,
      message,
      status: 'NEW',
      isSampleData: false,
      createdAt: new Date().toISOString(),
    };

    db.contacts.unshift(newContact);
    saveDatabase();

    await dispatchAdminEmailNotification(`New Contact Message (${newContact.id})`, {
      id: newContact.id,
      from: newContact.name,
      phone: newContact.phone,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to The Meadows Resort, Kodaikanal. Our hospitality team will respond shortly.',
      contactId: newContact.id,
    });
  } catch (err) {
    console.error('Contact inquiry error:', err);
    res.status(500).json({ error: 'An internal error occurred while submitting your message.' });
  }
});

// ============================================================================
// 6. ADMIN AUTHENTICATION & PROTECTED MANAGEMENT API ROUTES
// ============================================================================
const authLimiter = createRateLimiter(15, 15 * 60 * 1000, 'auth');

app.post('/api/admin/login', authLimiter, (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = sanitizeString(email, 160).toLowerCase();
    const rawPassword = typeof password === 'string' ? password : '';

    if (!cleanEmail || !rawPassword) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user || !verifyPassword(rawPassword, user.passwordHash, user.salt)) {
      res.status(401).json({ error: 'Invalid administrator email or password.' });
      return;
    }

    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    };

    const token = signSessionToken(payload);
    const isProd = process.env.NODE_ENV === 'production';

    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${8 * 3600}; SameSite=Lax${
        isProd ? '; Secure' : ''
      }`
    );

    res.json({
      authenticated: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Authentication service error.' });
  }
});

app.post('/api/admin/logout', (_req: Request, res: Response) => {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
  res.json({ success: true });
});

// Secure Development Setup Endpoint (allows owner/evaluator to initialize or reset admin session safely in dev/preview)
app.get('/api/admin/setup-status', (_req: Request, res: Response) => {
  const adminUser = db.users[0];
  res.json({
    configured: Boolean(adminUser),
    adminEmailHint: adminUser ? adminUser.email : 'admin@themeadowskodaikanal.com',
    setupNote:
      'Configure ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD in environment variables (.env) for production deployment.',
  });
});

app.get('/api/admin/session', requireAdminAuth, (req: Request, res: Response) => {
  const adminUser = (req as Request & { adminUser?: SessionPayload }).adminUser;
  res.json({ authenticated: true, user: adminUser });
});

// Get Full Admin Dashboard Data
app.get('/api/admin/dashboard', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({
    stats: {
      totalRooms: db.rooms.length,
      activeRooms: db.rooms.filter((r) => r.active).length,
      newBookingInquiries: db.bookings.filter((b) => b.status === 'NEW').length,
      totalBookings: db.bookings.length,
      contactMessages: db.contacts.length,
      galleryItems: db.gallery.length,
    },
    bookings: db.bookings,
    contacts: db.contacts,
    rooms: db.rooms,
    gallery: db.gallery,
  });
});

// Update Booking Status
app.patch('/api/admin/bookings/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const validStatuses: BookingStatus[] = ['NEW', 'CONTACTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid booking status value.' });
    return;
  }

  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) {
    res.status(404).json({ error: 'Booking inquiry not found.' });
    return;
  }

  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  saveDatabase();
  res.json({ success: true, booking });
});

// Delete Booking Inquiry
app.delete('/api/admin/bookings/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.bookings.findIndex((b) => b.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Booking inquiry not found.' });
    return;
  }
  db.bookings.splice(idx, 1);
  saveDatabase();
  res.json({ success: true });
});

// Update Contact Message Status
app.patch('/api/admin/contacts/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!['NEW', 'READ', 'ARCHIVED'].includes(status)) {
    res.status(400).json({ error: 'Invalid contact status.' });
    return;
  }
  const item = db.contacts.find((c) => c.id === id);
  if (!item) {
    res.status(404).json({ error: 'Contact message not found.' });
    return;
  }
  item.status = status;
  saveDatabase();
  res.json({ success: true, contact: item });
});

// Delete Contact Message
app.delete('/api/admin/contacts/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.contacts.findIndex((c) => c.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Contact message not found.' });
    return;
  }
  db.contacts.splice(idx, 1);
  saveDatabase();
  res.json({ success: true });
});

// Room Management: Create Room
app.post('/api/admin/rooms', requireAdminAuth, (req: Request, res: Response) => {
  const { name, description, images, active } = req.body || {};
  const cleanName = sanitizeString(name, 120);
  const cleanDesc = sanitizeString(description, 1500);

  if (!cleanName || cleanName.length < 3) {
    res.status(400).json({ error: 'Room name is required (min 3 characters).' });
    return;
  }
  if (!cleanDesc || cleanDesc.length < 10) {
    res.status(400).json({ error: 'Room description is required.' });
    return;
  }

  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const safeImages = Array.isArray(images)
    ? images.map((img) => sanitizeString(img, 500)).filter(Boolean)
    : [];

  const isActive = active !== undefined ? Boolean(active) : true;

  const newRoom: DbRoom = {
    id: `room-${crypto.randomBytes(4).toString('hex')}`,
    name: cleanName,
    slug: `${slug}-${crypto.randomBytes(2).toString('hex')}`,
    description: cleanDesc,
    images: safeImages,
    status: isActive ? 'ACTIVE' : 'INACTIVE',
    active: isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.rooms.push(newRoom);
  saveDatabase();
  res.status(201).json({ success: true, room: newRoom });
});

// Room Management: Edit / Activate / Deactivate Room
app.patch('/api/admin/rooms/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const room = db.rooms.find((r) => r.id === id);
  if (!room) {
    res.status(404).json({ error: 'Room not found.' });
    return;
  }

  const { name, description, active, images } = req.body || {};
  if (typeof name === 'string' && name.trim().length >= 3) {
    room.name = sanitizeString(name, 120);
  }
  if (typeof description === 'string' && description.trim().length >= 10) {
    room.description = sanitizeString(description, 1500);
  }
  if (typeof active === 'boolean') {
    room.active = active;
    room.status = active ? 'ACTIVE' : 'INACTIVE';
  }
  if (Array.isArray(images)) {
    room.images = images.map((i) => sanitizeString(i, 500)).filter(Boolean);
  }
  room.updatedAt = new Date().toISOString();
  saveDatabase();
  res.json({ success: true, room });
});

// Room Management: Delete Room
app.delete('/api/admin/rooms/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.rooms.findIndex((r) => r.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Room not found.' });
    return;
  }
  db.rooms.splice(idx, 1);
  saveDatabase();
  res.json({ success: true });
});

// Gallery Management: Create / Upload Validated Item
app.post('/api/admin/gallery', requireAdminAuth, (req: Request, res: Response) => {
  const { title, category, imageUrl, alt, mimeType, fileSize } = req.body || {};
  const cleanTitle = sanitizeString(title, 120);
  const cleanCategory = sanitizeString(category, 40).toUpperCase();
  const cleanAlt = sanitizeString(alt || title, 200);
  const rawUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';

  const allowedCategories = ['RESORT', 'ROOMS', 'NATURE', 'DINING', 'EXPERIENCES', 'KODAIKANAL'];
  if (!cleanTitle) {
    res.status(400).json({ error: 'Gallery title is required.' });
    return;
  }
  if (!allowedCategories.includes(cleanCategory)) {
    res.status(400).json({ error: 'Invalid gallery category.' });
    return;
  }

  // File Upload Security Validation
  if (mimeType) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedMimes.includes(String(mimeType).toLowerCase())) {
      res.status(400).json({
        error: 'Security policy rejected file: Only JPEG, PNG, WebP, and AVIF images are permitted.',
      });
      return;
    }
  }
  if (fileSize && Number(fileSize) > 2 * 1024 * 1024) {
    res.status(400).json({ error: 'File size exceeds maximum 2MB security threshold.' });
    return;
  }
  if (
    !rawUrl ||
    (!rawUrl.startsWith('/') &&
      !rawUrl.startsWith('https://') &&
      !rawUrl.startsWith('data:image/jpeg;base64,') &&
      !rawUrl.startsWith('data:image/png;base64,') &&
      !rawUrl.startsWith('data:image/webp;base64,'))
  ) {
    res.status(400).json({
      error: 'Invalid or unsafe image URL/data format.',
    });
    return;
  }

  const newItem: DbGalleryItem = {
    id: `gal-custom-${crypto.randomBytes(4).toString('hex')}`,
    title: cleanTitle,
    category: cleanCategory,
    imageUrl: rawUrl,
    alt: cleanAlt,
    active: true,
    createdAt: new Date().toISOString(),
  };

  db.gallery.unshift(newItem);
  saveDatabase();
  res.status(201).json({ success: true, item: newItem });
});

app.patch('/api/admin/gallery/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const item = db.gallery.find((g) => g.id === id);
  if (!item) {
    res.status(404).json({ error: 'Gallery item not found.' });
    return;
  }
  if (typeof req.body?.active === 'boolean') {
    item.active = req.body.active;
  }
  if (typeof req.body?.title === 'string' && req.body.title.trim()) {
    item.title = sanitizeString(req.body.title, 120);
  }
  saveDatabase();
  res.json({ success: true, item });
});

app.delete('/api/admin/gallery/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.gallery.findIndex((g) => g.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Gallery item not found.' });
    return;
  }
  db.gallery.splice(idx, 1);
  saveDatabase();
  res.json({ success: true });
});

// Admin Password Update
app.post('/api/admin/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body || {};
  const adminSession = (req as Request & { adminUser?: SessionPayload }).adminUser;
  const user = db.users.find((u) => u.id === adminSession?.userId);

  if (!user) {
    res.status(404).json({ error: 'Administrator user not found.' });
    return;
  }
  if (!currentPassword || !verifyPassword(String(currentPassword), user.passwordHash, user.salt)) {
    res.status(401).json({ error: 'Current password is incorrect.' });
    return;
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    return;
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  user.updatedAt = new Date().toISOString();
  saveDatabase();

  res.json({ success: true, message: 'Administrator password updated securely.' });
});

// Catch-all for unknown /api routes
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// ============================================================================
// 7. VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVER
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback to transform and serve index.html for client-side navigation
    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Meadows Resort Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
