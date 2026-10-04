import heroImg from '../assets/images/resort_hero_kodaikanal_1791018033467.jpg';
import roomQuadBalconyImg from '../assets/images/room_quadruple_balcony_1791018045013.jpg';
import roomEconomyQuadImg from '../assets/images/room_economy_quadruple_1791018056002.jpg';
import roomStandardFamilyImg from '../assets/images/room_standard_family_1791018068407.jpg';
import diningPavilionImg from '../assets/images/dining_pavilion_amber_1791018082904.jpg';
import experienceFireplaceImg from '../assets/images/experience_outdoor_fireplace_1791018093955.jpg';

export const RESORT_ASSETS = {
  hero: heroImg,
  roomQuadBalcony: roomQuadBalconyImg,
  roomEconomyQuad: roomEconomyQuadImg,
  roomStandardFamily: roomStandardFamilyImg,
  diningPavilion: diningPavilionImg,
  experienceFireplace: experienceFireplaceImg,
};

export const RESORT_INFO = {
  name: 'THE MEADOWS RESORT',
  shortName: 'The Meadows Resort',
  location: 'Kodaikanal, Tamil Nadu, India',
  city: 'Kodaikanal',
  established: 'EST. 2024',
  tagline: 'ESCAPE INTO THE MEADOWS',
  description: 'Where peaceful mountain views, warm hospitality and nature come together.',
  address: {
    line1: 'Panchayat Road,',
    line2: 'near Ohm Sakthi Temple,',
    line3: 'Bharathi Nagar, Paraipatti,',
    city: 'Kodaikanal,',
    statePostal: 'Tamil Nadu 624101,',
    country: 'India',
    full: 'Panchayat Road, near Ohm Sakthi Temple, Bharathi Nagar, Paraipatti, Kodaikanal, Tamil Nadu 624101, India',
  },
  phone: '094455 86811',
  phoneDial: '+919445586811',
  directionsUrl:
    'https://www.google.com/maps/search/?api=1&query=The+Meadows+Resort+Panchayat+Road+near+Ohm+Sakthi+Temple+Bharathi+Nagar+Paraipatti+Kodaikanal+Tamil+Nadu+624101',
  aboutPills: ['EST. 2024', 'KODAIKANAL', 'NATURE', 'HOSPITALITY'],
  ratings: [
    {
      platform: 'Google',
      score: '4.6',
      scale: '5',
      display: '4.6 / 5',
      note: 'Verified Google Places Rating',
      attribution: 'Google Maps & Search Reviews',
    },
    {
      platform: 'Booking.com',
      score: '8.6',
      scale: '10',
      display: '8.6 / 10',
      note: 'Approximately 8.6 / 10 Guest Review Score',
      attribution: 'Verified Booking.com Guest Attribution',
    },
  ],
};

export interface RoomHotspot {
  id: string;
  label: 'BED' | 'BALCONY' | 'VIEW' | 'BATHROOM' | 'AMENITIES';
  title: string;
  description: string;
  position: [number, number, number]; // 3D spherical/spatial coordinates
  yaw: number;
  pitch: number;
}

export interface RoomData {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  status: 'ACTIVE' | 'INACTIVE';
  active: boolean;
  hotspots: RoomHotspot[];
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_ROOMS: RoomData[] = [
  {
    id: 'room-quadruple-balcony',
    name: 'Quadruple Room with Balcony',
    slug: 'quadruple-room-with-balcony',
    description:
      'Designed for group and family retreats, the Quadruple Room with Balcony opens directly onto Kodaikanal’s cool mountain air and drifting valley mist. Crafted with natural timber textures and warm ambient illumination for peaceful mountain living.',
    images: [RESORT_ASSETS.roomQuadBalcony, RESORT_ASSETS.hero],
    status: 'ACTIVE',
    active: true,
    createdAt: '2024-06-01T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
    hotspots: [
      {
        id: 'hs-bed',
        label: 'BED',
        title: 'Restful Sanctuary Bedding',
        description: 'Warm timber headboard and layered mountain-climate linens oriented toward the valley light.',
        position: [-2.2, -0.4, -2.5],
        yaw: -0.45,
        pitch: -0.1,
      },
      {
        id: 'hs-balcony',
        label: 'BALCONY',
        title: 'Private Mountain Balcony',
        description: 'Step outdoors onto a private sheltered deck overlooking the misty forested slopes of Kodaikanal.',
        position: [1.8, 0.2, -2.8],
        yaw: 0.4,
        pitch: 0.05,
      },
      {
        id: 'hs-view',
        label: 'VIEW',
        title: 'Kodaikanal Valley Vista',
        description: 'Uninterrupted visual connection to drifting silver clouds, eucalyptus canopies, and mountain ridges.',
        position: [0.3, 0.9, -3.2],
        yaw: 0.08,
        pitch: 0.22,
      },
      {
        id: 'hs-bathroom',
        label: 'BATHROOM',
        title: 'En-Suite Refreshment Space',
        description: 'Private en-suite bathroom space appointed with clean modern fixtures and warm lighting.',
        position: [-2.8, 0.1, 1.2],
        yaw: -1.1,
        pitch: 0.0,
      },
      {
        id: 'hs-amenities',
        label: 'AMENITIES',
        title: 'Thoughtful Room Comforts',
        description: 'Supported by Free Wi-Fi, Room Service, and 24-Hour Front Desk assistance throughout your stay.',
        position: [2.4, -0.5, 0.8],
        yaw: 0.95,
        pitch: -0.15,
      },
    ],
  },
  {
    id: 'room-economy-quadruple',
    name: 'Economy Quadruple Room',
    slug: 'economy-quadruple-room',
    description:
      'A welcoming and practical haven for four guests seeking tranquil mountain comfort in Kodaikanal. Surrounded by quiet resort grounds and calm natural acoustics, offering essential relaxation after exploring the hills.',
    images: [RESORT_ASSETS.roomEconomyQuad, RESORT_ASSETS.roomQuadBalcony],
    status: 'ACTIVE',
    active: true,
    createdAt: '2024-06-01T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
    hotspots: [
      {
        id: 'hs-bed-2',
        label: 'BED',
        title: 'Quadruple Sleeping Arrangement',
        description: 'Comfortable sleeping quarters tailored for families or companions traveling together.',
        position: [-1.8, -0.3, -2.6],
        yaw: -0.35,
        pitch: -0.08,
      },
      {
        id: 'hs-balcony-2',
        label: 'BALCONY',
        title: 'Terrace & Garden Access',
        description: 'Easy access to the resort’s shared sun terrace, garden pathways, and crisp outdoor mountain air.',
        position: [2.1, 0.1, -2.5],
        yaw: 0.45,
        pitch: 0.02,
      },
      {
        id: 'hs-view-2',
        label: 'VIEW',
        title: 'Serene Resort Surroundings',
        description: 'Natural daylight and calm views of the surrounding greenery in Paraipatti, Kodaikanal.',
        position: [0.0, 0.8, -3.1],
        yaw: 0.0,
        pitch: 0.18,
      },
      {
        id: 'hs-bathroom-2',
        label: 'BATHROOM',
        title: 'Private En-Suite Bathroom',
        description: 'Well-maintained private bathroom designed for convenient group stays.',
        position: [-2.6, 0.0, 1.0],
        yaw: -1.0,
        pitch: 0.0,
      },
      {
        id: 'hs-amenities-2',
        label: 'AMENITIES',
        title: 'Essential Resort Hospitality',
        description: 'Includes Free Wi-Fi, Room Service access, and attentive hospitality from our 24-hour reception.',
        position: [2.2, -0.4, 1.0],
        yaw: 0.85,
        pitch: -0.12,
      },
    ],
  },
  {
    id: 'room-standard-family',
    name: 'Standard Family Room',
    slug: 'standard-family-room',
    description:
      'Crafted for unhurried family time in the hills, the Standard Family Room pairs warm interior finishes with restful privacy. Enjoy seamless access to the resort garden, indoor play area, and evening fireplace gatherings.',
    images: [RESORT_ASSETS.roomStandardFamily, RESORT_ASSETS.experienceFireplace],
    status: 'ACTIVE',
    active: true,
    createdAt: '2024-06-01T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
    hotspots: [
      {
        id: 'hs-bed-3',
        label: 'BED',
        title: 'Family Rest Quarters',
        description: 'Inviting beds dressed in soft warm ivory linens with calming forest-toned accents.',
        position: [-2.0, -0.35, -2.7],
        yaw: -0.4,
        pitch: -0.1,
      },
      {
        id: 'hs-balcony-3',
        label: 'BALCONY',
        title: 'Outdoor Lounging & Veranda Connection',
        description: 'Moments away from the sun terrace and outdoor fireplace for relaxed family evenings.',
        position: [1.9, 0.15, -2.6],
        yaw: 0.42,
        pitch: 0.04,
      },
      {
        id: 'hs-view-3',
        label: 'VIEW',
        title: 'Mountain & Foliage Framing',
        description: 'Framed views of the tranquil Kodaikanal landscape and shifting highland mist.',
        position: [0.2, 0.75, -3.0],
        yaw: 0.05,
        pitch: 0.16,
      },
      {
        id: 'hs-bathroom-3',
        label: 'BATHROOM',
        title: 'Family En-Suite Bathroom',
        description: 'Clean, functional en-suite facilities tailored for family convenience.',
        position: [-2.5, 0.05, 0.9],
        yaw: -0.95,
        pitch: 0.0,
      },
      {
        id: 'hs-amenities-3',
        label: 'AMENITIES',
        title: 'Family-Oriented Comforts',
        description: 'Connected to resort-wide Free Wi-Fi, Room Service, Laundry service, and family recreation spaces.',
        position: [2.3, -0.4, 0.9],
        yaw: 0.9,
        pitch: -0.1,
      },
    ],
  },
];

export const DINING_DATA = {
  heading: 'CULINARY WARMTH IN THE MIST',
  subheading: 'Authentic flavors served in an intimate mountain pavilion warmed by amber and copper light.',
  cuisines: [
    {
      name: 'Indian',
      description:
        'Regional South Indian and classic Indian preparations crafted with aromatic highland spices and fresh local produce.',
    },
    {
      name: 'Malaysian',
      description:
        'Distinctive Malaysian culinary traditions featuring balanced aromatics, warming broths, and vibrant wok-seared textures.',
    },
    {
      name: 'Asian',
      description:
        'Curated pan-Asian favorites prepared to comfort and restore after a day of mountain exploration in Kodaikanal.',
    },
  ],
  occasions: [
    {
      title: 'Breakfast',
      period: 'Morning',
      atmosphere: 'Freshly brewed coffee, highland morning mist, and nourishing warm plates as sunlight filters through the pines.',
    },
    {
      title: 'Brunch',
      period: 'Late Morning',
      atmosphere: 'Unhurried mid-morning dining on the sun terrace with crisp mountain air and relaxed hospitality.',
    },
    {
      title: 'Lunch',
      period: 'Midday',
      atmosphere: 'Vibrant Indian, Malaysian, and Asian selections served in our bright glass-walled dining room.',
    },
    {
      title: 'High Tea',
      period: 'Late Afternoon',
      atmosphere: 'Steaming hillside tea infusions as afternoon clouds roll across the valley slopes.',
    },
    {
      title: 'Cocktail Hour',
      period: 'Twilight',
      atmosphere: 'Warm amber lighting, copper accents, and twilight conversations before the evening chill settles.',
    },
    {
      title: 'Dinner',
      period: 'Evening',
      atmosphere: 'Intimate candlelit dining accompanied by the crackle of the nearby outdoor fireplace.',
    },
  ],
};

export interface ExperienceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  visualType: 'mountains' | 'garden' | 'cycling' | 'tabletennis' | 'games' | 'playarea' | 'fireplace' | 'entertainment';
}

export const EXPERIENCES_DATA: ExperienceItem[] = [
  {
    id: 'exp-mountain-views',
    title: 'Mountain Views',
    category: 'Panorama',
    description: 'Watch drifting clouds and golden dawn light move across the undulating ridges of Kodaikanal from our elevated vantage points.',
    visualType: 'mountains',
  },
  {
    id: 'exp-garden',
    title: 'Garden',
    category: 'Botanical',
    description: 'Stroll through manicured highland flora, dew-kissed lawns, and quiet seating nooks surrounded by native trees.',
    visualType: 'garden',
  },
  {
    id: 'exp-cycling',
    title: 'Cycling',
    category: 'Exploration',
    description: 'Pedal along winding mountain lanes and pine-bordered roads breathing in crisp eucalyptus-scented air.',
    visualType: 'cycling',
  },
  {
    id: 'exp-outdoor-fireplace',
    title: 'Outdoor Fireplace',
    category: 'Evening Ritual',
    description: 'Gather around warm glowing embers under the Kodaikanal night sky as cool mountain mist drifts past the terrace.',
    visualType: 'fireplace',
  },
  {
    id: 'exp-table-tennis',
    title: 'Table Tennis',
    category: 'Recreation',
    description: 'Engage in spirited rallies with family and fellow travelers in our dedicated indoor recreation zone.',
    visualType: 'tabletennis',
  },
  {
    id: 'exp-games-room',
    title: 'Games Room',
    category: 'Indoor Leisure',
    description: 'Unwind during misty afternoons with tabletop classics and social games in a cozy timber-lined lounge.',
    visualType: 'games',
  },
  {
    id: 'exp-indoor-play-area',
    title: 'Indoor Play Area',
    category: 'Family',
    description: 'A welcoming, sheltered space thoughtfully arranged for younger guests to play safely regardless of mountain weather.',
    visualType: 'playarea',
  },
  {
    id: 'exp-evening-entertainment',
    title: 'Evening Entertainment',
    category: 'Atmosphere',
    description: 'Curated evening gatherings that bring warmth, music, and convivial spirit to your highland retreat.',
    visualType: 'entertainment',
  },
];

export const FACILITIES_LIST: { name: string; category: string; detail: string }[] = [
  { name: 'Free Wi-Fi', category: 'Connectivity', detail: 'Complimentary wireless internet across rooms and social spaces' },
  { name: 'Free Private Parking', category: 'Arrival', detail: 'Secure on-site private parking for guests traveling by car' },
  { name: '24-Hour Front Desk', category: 'Service', detail: 'Round-the-clock reception and guest assistance' },
  { name: 'Restaurant', category: 'Dining', detail: 'On-site dining serving Indian, Malaysian, and Asian cuisines' },
  { name: 'Room Service', category: 'Dining', detail: 'In-room dining delivered directly to your private sanctuary' },
  { name: 'Garden', category: 'Outdoors', detail: 'Landscaped mountain garden for morning walks and quiet reading' },
  { name: 'Terrace / Sun Terrace', category: 'Outdoors', detail: 'Open-air terrace decks ideal for basking in highland sunshine' },
  { name: 'Outdoor Fireplace', category: 'Outdoors', detail: 'Warm open-air hearth for cool Kodaikanal evenings' },
  { name: 'Indoor Play Area', category: 'Family', detail: 'Dedicated indoor play space designed for children' },
  { name: 'Games Room', category: 'Recreation', detail: 'Social indoor recreation lounge for families and groups' },
  { name: 'Table Tennis / Ping Pong', category: 'Recreation', detail: 'Full table tennis setup for friendly matches' },
  { name: 'Cycling', category: 'Adventure', detail: 'Cycling opportunities along scenic mountain roads' },
  { name: 'Evening Entertainment', category: 'Hospitality', detail: 'Curated evening ambiance and guest entertainment' },
  { name: 'Laundry', category: 'Service', detail: 'Convenient laundry service for extended mountain stays' },
  { name: 'Luggage Storage', category: 'Arrival', detail: 'Secure baggage care before check-in or after check-out' },
  { name: 'Express Check-in / Check-out', category: 'Arrival', detail: 'Streamlined arrival and departure procedures' },
  { name: 'Airport Shuttle', category: 'Transit', detail: 'Coordinated airport transfer arrangements upon inquiry' },
  { name: 'BBQ', category: 'Dining', detail: 'Outdoor barbecue facilities for memorable highland evenings' },
  { name: 'Family Rooms', category: 'Accommodation', detail: 'Spacious multi-guest and family-configured accommodations' },
];

export interface GalleryItemData {
  id: string;
  title: string;
  category: 'RESORT' | 'ROOMS' | 'NATURE' | 'DINING' | 'EXPERIENCES' | 'KODAIKANAL';
  imageUrl: string;
  alt: string;
  active: boolean;
  createdAt: string;
}

export const INITIAL_GALLERY: GalleryItemData[] = [
  {
    id: 'gal-1',
    title: 'Dawn Mist Over The Meadows Sanctuary',
    category: 'RESORT',
    imageUrl: RESORT_ASSETS.hero,
    alt: 'The Meadows Resort architecture surrounded by misty Kodaikanal hills at dawn',
    active: true,
    createdAt: '2025-01-10T00:00:00.000Z',
  },
  {
    id: 'gal-2',
    title: 'Quadruple Room with Private Mountain Balcony',
    category: 'ROOMS',
    imageUrl: RESORT_ASSETS.roomQuadBalcony,
    alt: 'Interior of Quadruple Room with Balcony looking out onto emerald hills',
    active: true,
    createdAt: '2025-01-11T00:00:00.000Z',
  },
  {
    id: 'gal-3',
    title: 'Amber & Copper Twilight Dining Pavilion',
    category: 'DINING',
    imageUrl: RESORT_ASSETS.diningPavilion,
    alt: 'Warmly lit resort restaurant serving Indian, Malaysian, and Asian cuisine',
    active: true,
    createdAt: '2025-01-12T00:00:00.000Z',
  },
  {
    id: 'gal-4',
    title: 'Evening Hearth & Outdoor Fireplace Terrace',
    category: 'EXPERIENCES',
    imageUrl: RESORT_ASSETS.experienceFireplace,
    alt: 'Outdoor stone fireplace glowing at dusk with pine forest backdrop',
    active: true,
    createdAt: '2025-01-13T00:00:00.000Z',
  },
  {
    id: 'gal-5',
    title: 'Economy Quadruple Sanctuary with Forest Framing',
    category: 'ROOMS',
    imageUrl: RESORT_ASSETS.roomEconomyQuad,
    alt: 'Economy Quadruple Room featuring timber accents and misty tree views',
    active: true,
    createdAt: '2025-01-14T00:00:00.000Z',
  },
  {
    id: 'gal-6',
    title: 'Standard Family Room Warmth & Timber Beams',
    category: 'ROOMS',
    imageUrl: RESORT_ASSETS.roomStandardFamily,
    alt: 'Spacious Standard Family Room with warm ambient lighting and mountain vista',
    active: true,
    createdAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'gal-7',
    title: 'Eucalyptus Canopies & Highland Cloud Drift',
    category: 'NATURE',
    imageUrl: RESORT_ASSETS.hero,
    alt: 'Misty forest and mountain ridges surrounding Paraipatti, Kodaikanal',
    active: true,
    createdAt: '2025-01-16T00:00:00.000Z',
  },
  {
    id: 'gal-8',
    title: 'Kodaikanal Highland Horizons',
    category: 'KODAIKANAL',
    imageUrl: RESORT_ASSETS.experienceFireplace,
    alt: 'Twilight over the Palani Hills in Kodaikanal, Tamil Nadu',
    active: true,
    createdAt: '2025-01-17T00:00:00.000Z',
  },
];

export interface KodaikanalLandmark {
  id: string;
  name: string;
  category: string;
  description: string;
  coordinates: [number, number, number]; // 3D terrain position
  cameraTarget: [number, number, number];
  cameraOffset: [number, number, number];
}

export const KODAIKANAL_LANDMARKS: KodaikanalLandmark[] = [
  {
    id: 'lm-meadows-resort',
    name: 'The Meadows Resort',
    category: 'Sanctuary Base',
    description:
      'Located on Panchayat Road, near Ohm Sakthi Temple, Bharathi Nagar, Paraipatti — a peaceful mountain retreat surrounded by nature.',
    coordinates: [0, 1.4, 0],
    cameraTarget: [0, 1.2, 0],
    cameraOffset: [0, 4.2, 6.5],
  },
  {
    id: 'lm-kodaikanal-lake',
    name: 'Kodaikanal Lake',
    category: 'Highland Waterbody',
    description:
      'The iconic star-shaped highland lake nestled in the heart of Kodaikanal’s evergreen valley, framed by misty promenades and colonial-era foliage.',
    coordinates: [-4.2, 0.5, -2.5],
    cameraTarget: [-4.2, 0.5, -2.5],
    cameraOffset: [-2.0, 3.8, 3.5],
  },
  {
    id: 'lm-berijam-lake',
    name: 'Berijam Lake',
    category: 'Pristine Forest Reservoir',
    description:
      'A serene forest reservoir set deep within the upper shola woodlands and pine plantations, celebrated for its untouched quietude and mirror-like waters.',
    coordinates: [4.8, 1.8, -3.8],
    cameraTarget: [4.8, 1.8, -3.8],
    cameraOffset: [2.5, 4.5, 2.0],
  },
  {
    id: 'lm-chettiar-park',
    name: 'Chettiar Park',
    category: 'Botanical Parkland',
    description:
      'A tranquil terraced botanical garden in the northeastern hills of Kodaikanal, known for manicured flowerbeds, heritage trees, and peaceful walkways.',
    coordinates: [2.6, 1.1, 3.2],
    cameraTarget: [2.6, 1.1, 3.2],
    cameraOffset: [4.5, 3.6, 7.5],
  },
];
