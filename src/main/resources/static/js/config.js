/**
 * GlobeTrotter App Configuration & Initial Seed Data
 * Curated destinations, activities, categories, currencies, and demo trip packages.
 */

const CONFIG = {
  APP_NAME: 'GlobeTrotter',
  VERSION: '2.0.0',
  STORAGE_KEY_TRIPS: 'globetrotter_trips_v2',
  STORAGE_KEY_USER: 'globetrotter_user_v2',
  STORAGE_KEY_SETTINGS: 'globetrotter_settings_v2',
  STORAGE_KEY_WISHLIST: 'globetrotter_wishlist_v2',
  API_DELAY_MS: 300, // Simulated network latency

  CURRENCIES: [
    { code: 'USD', symbol: '$', name: 'US Dollar (USD)', rate: 1.0 },
    { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rate: 0.92 },
    { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', rate: 0.79 },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', rate: 83.5 },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)', rate: 155.0 },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)', rate: 0.90 },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', rate: 1.36 },
    { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AUD)', rate: 1.52 }
  ],

  CATEGORIES: [
    { id: 'sightseeing', name: 'Sightseeing', icon: '🏛️', color: '#6366f1' },
    { id: 'food', name: 'Food & Dining', icon: '🍜', color: '#f97316' },
    { id: 'transport', name: 'Transport', icon: '🚆', color: '#06b6d4' },
    { id: 'stay', name: 'Stay & Lodging', icon: '🏨', color: '#10b981' },
    { id: 'adventure', name: 'Adventure & Nature', icon: '⛰️', color: '#ec4899' },
    { id: 'culture', name: 'Culture & Arts', icon: '🎭', color: '#8b5cf6' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#f59e0b' },
    { id: 'nightlife', name: 'Nightlife & Drinks', icon: '🍸', color: '#ef4444' }
  ],

  COVER_PRESETS: [
    { id: 'paris', title: 'Paris Romance', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
    { id: 'tokyo', title: 'Tokyo Neon & Temples', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80' },
    { id: 'swiss', title: 'Swiss Alps', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80' },
    { id: 'bali', title: 'Bali Tropical', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
    { id: 'amalfi', title: 'Amalfi Coast', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80' },
    { id: 'nyc', title: 'New York Skyline', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80' },
    { id: 'santorini', title: 'Santorini Blue', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80' },
    { id: 'kyoto', title: 'Kyoto Bamboo', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' }
  ],

  AVATAR_PRESETS: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
  ],

  DESTINATIONS: [
    {
      id: 'dest-paris',
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      costIndex: '$$$',
      popularity: 9.8,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      description: 'The City of Light, famous for world-class art, culinary wonders, and romantic avenues.',
      timeZone: 'Europe/Paris (GMT+2)',
      avgDailyCost: 180
    },
    {
      id: 'dest-tokyo',
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      costIndex: '$$$',
      popularity: 9.9,
      rating: 4.95,
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      description: 'A dazzling juxtaposition of ultra-modern neon skyscrapers and tranquil historic shrines.',
      timeZone: 'Asia/Tokyo (GMT+9)',
      avgDailyCost: 160
    },
    {
      id: 'dest-zurich',
      name: 'Zurich & Interlaken',
      country: 'Switzerland',
      region: 'Europe',
      costIndex: '$$$$',
      popularity: 9.5,
      rating: 4.85,
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
      description: 'Majestic Alpine peaks, pristine turquoise lakes, and world-renowned scenic train journeys.',
      timeZone: 'Europe/Zurich (GMT+2)',
      avgDailyCost: 240
    },
    {
      id: 'dest-bali',
      name: 'Bali',
      country: 'Indonesia',
      region: 'Asia',
      costIndex: '$',
      popularity: 9.6,
      rating: 4.88,
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      description: 'Tropical paradise featuring lush rice terraces, sacred temples, surf beaches, and yoga retreats.',
      timeZone: 'Asia/Makassar (GMT+8)',
      avgDailyCost: 75
    },
    {
      id: 'dest-rome',
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      costIndex: '$$',
      popularity: 9.7,
      rating: 4.86,
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
      description: 'The Eternal City with thousands of years of art, architecture, and mouth-watering trattorias.',
      timeZone: 'Europe/Rome (GMT+2)',
      avgDailyCost: 150
    },
    {
      id: 'dest-nyc',
      name: 'New York City',
      country: 'United States',
      region: 'Americas',
      costIndex: '$$$$',
      popularity: 9.8,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
      description: 'Broadway, world-class dining, Central Park, and the electrifying energy of Manhattan.',
      timeZone: 'America/New_York (GMT-4)',
      avgDailyCost: 260
    },
    {
      id: 'dest-cape-town',
      name: 'Cape Town',
      country: 'South Africa',
      region: 'Africa',
      costIndex: '$$',
      popularity: 9.3,
      rating: 4.82,
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
      description: 'Stunning coastal landscapes, Table Mountain cableway, wine estates, and vibrant wildlife.',
      timeZone: 'Africa/Johannesburg (GMT+2)',
      avgDailyCost: 95
    },
    {
      id: 'dest-kyoto',
      name: 'Kyoto',
      country: 'Japan',
      region: 'Asia',
      costIndex: '$$',
      popularity: 9.7,
      rating: 4.92,
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      description: 'Ancient capital of Japan with thousands of classical Buddhist temples, gardens, and imperial palaces.',
      timeZone: 'Asia/Tokyo (GMT+9)',
      avgDailyCost: 140
    }
  ],

  ACTIVITIES_CATALOG: [
    // Paris Activities
    {
      id: 'act-eiffel',
      cityId: 'dest-paris',
      cityName: 'Paris',
      name: 'Eiffel Tower Summit & Champagne Toast',
      category: 'sightseeing',
      cost: 45,
      duration: '2.5 hrs',
      image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80',
      description: 'Skip-the-line access to the top floor with panoramic Parisian views and complimentary bubbly.'
    },
    {
      id: 'act-louvre',
      cityId: 'dest-paris',
      cityName: 'Paris',
      name: 'Louvre Masterpieces Guided Tour',
      category: 'culture',
      cost: 65,
      duration: '3.0 hrs',
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
      description: 'Expert art historian tour covering the Mona Lisa, Venus de Milo, and Winged Victory.'
    },
    {
      id: 'act-croissant',
      cityId: 'dest-paris',
      cityName: 'Paris',
      name: 'Artisan Croissant & Pastry Workshop',
      category: 'food',
      cost: 85,
      duration: '2.5 hrs',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      description: 'Learn the secrets of laminated dough and french baking in a cozy Montmartre bakery.'
    },
    {
      id: 'act-seine-cruise',
      cityId: 'dest-paris',
      cityName: 'Paris',
      name: 'Sunset Seine River Gourmet Dinner Cruise',
      category: 'food',
      cost: 110,
      duration: '2.0 hrs',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      description: '3-course French dining while gliding past illuminated monuments and historic bridges.'
    },

    // Tokyo Activities
    {
      id: 'act-shibuya',
      cityId: 'dest-tokyo',
      cityName: 'Tokyo',
      name: 'Shibuya Crossing & Sky Observatory Deck',
      category: 'sightseeing',
      cost: 22,
      duration: '2.0 hrs',
      image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
      description: 'Witness the iconic Shibuya scramble and step out onto the 360-degree glass rooftop sky deck.'
    },
    {
      id: 'act-ramen-tour',
      cityId: 'dest-tokyo',
      cityName: 'Tokyo',
      name: 'Shinjuku Hidden Omoide Yokocho Food Tour',
      category: 'food',
      cost: 55,
      duration: '3.0 hrs',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
      description: 'Taste authentic tonkotsu ramen, yakitori skewers, and craft sake in alleyways.'
    },
    {
      id: 'act-teamlab',
      cityId: 'dest-tokyo',
      cityName: 'Tokyo',
      name: 'teamLab Planets Digital Art Immersion',
      category: 'culture',
      cost: 38,
      duration: '2.5 hrs',
      image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
      description: 'Walk through water, crystal infinite rooms, and mesmerizing floral digital gardens.'
    },
    {
      id: 'act-bullet-train',
      cityId: 'dest-tokyo',
      cityName: 'Tokyo',
      name: 'Shinkansen Bullet Train to Kyoto',
      category: 'transport',
      cost: 120,
      duration: '2.2 hrs',
      image: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&w=600&q=80',
      description: 'High-speed 300 km/h rail journey past Mount Fuji in reserved Green Car seats.'
    },

    // Swiss Alps Activities
    {
      id: 'act-jungfrau',
      cityId: 'dest-zurich',
      cityName: 'Zurich & Interlaken',
      name: 'Jungfraujoch - Top of Europe Cogwheel Train',
      category: 'adventure',
      cost: 175,
      duration: '5.0 hrs',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80',
      description: 'Ascend to 3,454 meters altitude, explore ice tunnels, and gaze across the Aletsch Glacier.'
    },
    {
      id: 'act-fondue',
      cityId: 'dest-zurich',
      cityName: 'Zurich & Interlaken',
      name: 'Traditional Swiss Cheese & Wine Fondue Chalet',
      category: 'food',
      cost: 60,
      duration: '2.0 hrs',
      image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80',
      description: 'Authentic gruyère and vacherin fondue served in a rustic 18th-century wooden alpine lodge.'
    },

    // Bali Activities
    {
      id: 'act-ubud-swing',
      cityId: 'dest-bali',
      cityName: 'Bali',
      name: 'Ubud Rice Terrace Jungle Swing & Waterfall',
      category: 'adventure',
      cost: 35,
      duration: '4.0 hrs',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
      description: 'Soar high above Tegallalang rice paddies and swim in Tegenungan jungle waterfall.'
    },
    {
      id: 'act-spa-bali',
      cityId: 'dest-bali',
      cityName: 'Bali',
      name: 'Balinese Flower Bath & Herbal Massage',
      category: 'stay',
      cost: 45,
      duration: '2.0 hrs',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      description: 'Relaxing holistic traditional body scrub followed by a scented frangipani flower bath.'
    }
  ],

  // Initial Seed Trips loaded on first use
  INITIAL_SEED_TRIPS: [
    {
      id: 'trip-paris-alps',
      title: 'Grand Europe: Paris & Swiss Alps',
      description: 'An unforgettable 7-day blend of Parisian culture, haute cuisine, and breathtaking snow-capped Swiss mountains.',
      destination: 'Paris & Switzerland',
      startDate: '2026-09-10',
      endDate: '2026-09-16',
      budget: 2500,
      currency: 'USD',
      coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      tags: ['Culture', 'Adventure', 'Foodie'],
      stops: [
        {
          id: 'stop-1',
          cityName: 'Paris',
          country: 'France',
          arrivalDate: '2026-09-10',
          departureDate: '2026-09-13',
          timeZone: 'Europe/Paris'
        },
        {
          id: 'stop-2',
          cityName: 'Interlaken & Zurich',
          country: 'Switzerland',
          arrivalDate: '2026-09-13',
          departureDate: '2026-09-16',
          timeZone: 'Europe/Zurich'
        }
      ],
      days: [
        {
          dayNumber: 1,
          date: '2026-09-10',
          city: 'Paris',
          activities: [
            {
              id: 'act-1-1',
              name: 'Arrive at Paris CDG & Boutique Hotel Check-in',
              category: 'stay',
              startTime: '14:00',
              endTime: '15:30',
              cost: 220,
              notes: 'Hotel Le Marais - Room 402',
              location: 'Le Marais, Paris'
            },
            {
              id: 'act-1-2',
              name: 'Sunset Seine River Gourmet Dinner Cruise',
              category: 'food',
              startTime: '18:30',
              endTime: '20:30',
              cost: 110,
              notes: 'Boarding near Pont Neuf',
              location: 'Seine River'
            },
            {
              id: 'act-1-3',
              name: 'Eiffel Tower Night Illumination Walk',
              category: 'sightseeing',
              startTime: '21:00',
              endTime: '22:30',
              cost: 0,
              notes: 'Light sparkle show at top of the hour',
              location: 'Champ de Mars'
            }
          ]
        },
        {
          dayNumber: 2,
          date: '2026-09-11',
          city: 'Paris',
          activities: [
            {
              id: 'act-2-1',
              name: 'Louvre Masterpieces Guided Tour',
              category: 'culture',
              startTime: '09:30',
              endTime: '12:30',
              cost: 65,
              notes: 'Meet guide at Pyramid entrance',
              location: 'Louvre Museum'
            },
            {
              id: 'act-2-2',
              name: 'Artisan Croissant & Pastry Workshop',
              category: 'food',
              startTime: '14:00',
              endTime: '16:30',
              cost: 85,
              notes: 'Chef Pierre bakery class',
              location: 'Montmartre'
            },
            {
              id: 'act-2-3',
              name: 'Eiffel Tower Summit & Champagne Toast',
              category: 'sightseeing',
              startTime: '18:00',
              endTime: '20:00',
              cost: 45,
              notes: 'Voucher #GT-9941',
              location: 'Champ de Mars'
            }
          ]
        },
        {
          dayNumber: 3,
          date: '2026-09-12',
          city: 'Paris',
          activities: [
            {
              id: 'act-3-1',
              name: 'Palace of Versailles Express Excursion',
              category: 'sightseeing',
              startTime: '09:00',
              endTime: '14:00',
              cost: 75,
              notes: 'Includes Hall of Mirrors & Royal Gardens',
              location: 'Versailles'
            },
            {
              id: 'act-3-2',
              name: 'Luxury Shopping & Macarons at Champs-Élysées',
              category: 'shopping',
              startTime: '15:30',
              endTime: '18:00',
              cost: 120,
              notes: 'Ladurée afternoon tea',
              location: 'Champs-Élysées'
            }
          ]
        },
        {
          dayNumber: 4,
          date: '2026-09-13',
          city: 'Interlaken & Zurich',
          activities: [
            {
              id: 'act-4-1',
              name: 'TGV Lyria High-Speed Train Paris to Zurich',
              category: 'transport',
              startTime: '08:30',
              endTime: '12:30',
              cost: 140,
              notes: 'First Class Coach 2, Seat 45/46',
              location: 'Gare de Lyon'
            },
            {
              id: 'act-4-2',
              name: 'Traditional Swiss Cheese & Wine Fondue Chalet',
              category: 'food',
              startTime: '19:00',
              endTime: '21:30',
              cost: 60,
              notes: 'Fondue Stube Interlaken',
              location: 'Interlaken'
            }
          ]
        },
        {
          dayNumber: 5,
          date: '2026-09-14',
          city: 'Interlaken & Zurich',
          activities: [
            {
              id: 'act-5-1',
              name: 'Jungfraujoch - Top of Europe Cogwheel Train',
              category: 'adventure',
              startTime: '09:00',
              endTime: '15:00',
              cost: 175,
              notes: 'Bring warm winter jacket & sunglasses',
              location: 'Jungfraujoch'
            }
          ]
        }
      ]
    },
    {
      id: 'trip-tokyo-kyoto',
      title: 'Tokyo & Kyoto: Future & Ancient Japan',
      description: 'Explore futuristic cyber-districts, Michelin-star ramen, bamboo groves, and serene golden shrines.',
      destination: 'Tokyo & Kyoto, Japan',
      startDate: '2026-10-05',
      endDate: '2026-10-12',
      budget: 3200,
      currency: 'USD',
      coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      tags: ['Culture', 'Foodie', 'Adventure'],
      stops: [
        {
          id: 'stop-jp-1',
          cityName: 'Tokyo',
          country: 'Japan',
          arrivalDate: '2026-10-05',
          departureDate: '2026-10-09',
          timeZone: 'Asia/Tokyo'
        },
        {
          id: 'stop-jp-2',
          cityName: 'Kyoto',
          country: 'Japan',
          arrivalDate: '2026-10-09',
          departureDate: '2026-10-12',
          timeZone: 'Asia/Tokyo'
        }
      ],
      days: [
        {
          dayNumber: 1,
          date: '2026-10-05',
          city: 'Tokyo',
          activities: [
            {
              id: 'act-tk-1',
              name: 'Shibuya Crossing & Sky Observatory Deck',
              category: 'sightseeing',
              startTime: '16:00',
              endTime: '18:00',
              cost: 22,
              notes: 'Sunset slot at Shibuya Sky',
              location: 'Shibuya'
            },
            {
              id: 'act-tk-2',
              name: 'Shinjuku Hidden Omoide Yokocho Food Tour',
              category: 'food',
              startTime: '19:00',
              endTime: '21:30',
              cost: 55,
              notes: 'Yakitori & local craft beer',
              location: 'Shinjuku Memory Lane'
            }
          ]
        }
      ]
    }
  ]
};
