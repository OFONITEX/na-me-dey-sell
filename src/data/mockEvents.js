/**
 * Curated initial event catalog for Nà Mè Dèy Sell
 * Inspired by Rigitix with authentic event experiences, tiered pricing, and social proof.
 */
export const INITIAL_EVENTS = [
  {
    id: "evt_vibes_barn_afe_mbre",
    title: "Vibes Barn: Afe Mbre Festival",
    subtitle: "The ultimate cultural groove, live music, beachside culinary feast, and Afro-fusion experience.",
    category: "Festival",
    date: "Sep 27, 2026",
    time: "08:00 PM - 04:00 AM",
    venue: "Ibom Tropicana Entertainment Center",
    city: "Uyo, Akwa Ibom",
    address: "Udo Udoma Banking District",
    organizer: "Vibes Barn Global",
    badge: "🔥 Trending Event",
    liveSoldText: "24 tickets sold today",
    xpReward: 50,
    goingCount: 142,
    accentColor: "#522672",
    secondaryColor: "#ff8a65",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    bannerPattern: "linear-gradient(135deg, #2D1B4E 0%, #522672 50%, #ff8a65 100%)",
    description: "Experience the vibrant rhythm of Afe Mbre. Featuring stellar live performances from top afrobeat sensations, high-energy DJ sets, local gourmet street food, cocktail lounges, and interactive light installations under the night sky.",
    tiers: [
      {
        id: "tier_regular",
        name: "Regular Access",
        price: 5000,
        currency: "₦",
        capacity: 1000,
        soldCount: 840,
        description: "Standard entry pass to main festival grounds, food village, and general stage arena.",
        perks: ["Access to main stage & festival arena", "Digital scannable ticket pass", "+50 NMDS XP points"]
      },
      {
        id: "tier_vip",
        name: "VIP Lounge Pass",
        price: 25000,
        currency: "₦",
        capacity: 250,
        soldCount: 215,
        description: "Elevated viewing deck, expedited entry gate, private lounge with complimentary welcome drinks.",
        perks: ["Express VIP gate check-in", "Access to elevated VIP viewing deck", "Complimentary welcome drink & canapés", "Dedicated air-conditioned restrooms"]
      },
      {
        id: "tier_table",
        name: "VVIP Table of 8",
        price: 250000,
        currency: "₦",
        capacity: 20,
        soldCount: 16,
        description: "Reserved front-row table for 8 guests, 2 premium bottles, dedicated server, and backstage photo passes.",
        perks: ["Reserved table for 8 persons", "2 Premium spirits & mixers", "Dedicated table butler & security", "Backstage artist photo access"]
      }
    ]
  },
  {
    id: "evt_lagos_tech_unwind",
    title: "Lagos Tech & Founders Unwind 2026",
    subtitle: "West Africa's largest gathering of tech founders, venture capitalists, designers, and AI creators.",
    category: "Tech Event",
    date: "Oct 18, 2026",
    time: "10:00 AM - 07:00 PM",
    venue: "Landmark Event Centre",
    city: "Victoria Island, Lagos",
    address: "Water Corporation Drive, Oniru",
    organizer: "Founders Circle Africa",
    badge: "⚡ Selling Fast",
    liveSoldText: "56 tickets sold today",
    xpReward: 100,
    goingCount: 389,
    accentColor: "#D4AF37",
    secondaryColor: "#F5D061",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    bannerPattern: "linear-gradient(135deg, #070709 0%, #1a160d 50%, #D4AF37 100%)",
    description: "Join over 2,000 founders, tech executives, angel investors, and engineers. Includes high-stakes startup pitch sessions, autonomous agent panels, networking lounges, and an exclusive sunset investor cocktail.",
    tiers: [
      {
        id: "tier_builder",
        name: "Delegate Pass",
        price: 15000,
        currency: "₦",
        capacity: 800,
        soldCount: 690,
        description: "Full day access to keynote presentations, tech breakout halls, and startup expo.",
        perks: ["All stage panels & keynotes", "Access to 50+ startup demo booths", "Official event goodie bag & digital pass"]
      },
      {
        id: "tier_executive",
        name: "Executive & Investor Pass",
        price: 60000,
        currency: "₦",
        capacity: 150,
        soldCount: 138,
        description: "Priority VIP badge, investor match-making lounge access, and private lunch networking session.",
        perks: ["Everything in Delegate Pass", "Private investor deal-room access", "Executive buffet luncheon", "Access to pitch deck database"]
      }
    ]
  },
  {
    id: "evt_afrobeat_rave_abuja",
    title: "AfroPulse Live: The Grand Concert",
    subtitle: "Chart-topping afrobeat superstars performing live with dynamic 3D visual projection stages.",
    category: "Concerts",
    date: "Nov 07, 2026",
    time: "06:00 PM - 02:00 AM",
    venue: "Eagles Square Amphitheatre",
    city: "Central Business District, Abuja",
    address: "Shehu Shagari Way, Garki",
    organizer: "AfroWave Live",
    badge: "🌟 Headline Concert",
    liveSoldText: "98 tickets sold today",
    xpReward: 75,
    goingCount: 512,
    accentColor: "#EB018E",
    secondaryColor: "#ff8a65",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    bannerPattern: "linear-gradient(135deg, #38022b 0%, #831843 50%, #ff8a65 100%)",
    description: "The most anticipated musical night in Abuja. Featuring a stellar lineup of Africa's hottest musical acts, live bands, aerial acrobatics, and an electrifying light and fireworks finale.",
    tiers: [
      {
        id: "tier_ga",
        name: "Regular Standing",
        price: 8000,
        currency: "₦",
        capacity: 2500,
        soldCount: 2210,
        description: "General admission to the main concert bowl and open-air food & drink courts.",
        perks: ["Concert field admission", "Mobile pass with QR entry", "+75 NMDS XP points"]
      },
      {
        id: "tier_fan_pit",
        name: "Golden Circle (Front Stage)",
        price: 35000,
        currency: "₦",
        capacity: 400,
        soldCount: 382,
        description: "Direct front-of-stage standing pit for the closest possible view of the headliners.",
        perks: ["Front of stage pit barrier", "Fast-track security entry", "Official concert LED wristband"]
      },
      {
        id: "tier_table_gold",
        name: "Gold Table (10 Persons)",
        price: 500000,
        currency: "₦",
        capacity: 30,
        soldCount: 27,
        description: "Premium elevated table service with champagne, gourmet finger bites, and dedicated host.",
        perks: ["10 VIP guest passes", "3 Bottles of vintage champagne & mixers", "VIP valet parking", "Backstage greenroom lounge pass"]
      }
    ]
  },
  {
    id: "evt_palmwine_food_culture",
    title: "Palm & Spice: African Food & Grill Fiesta",
    subtitle: "Celebrate authentic flavors, smoked grills, indigenous palm wine tasting, and acoustic soul rhythms.",
    category: "Food Event",
    date: "Nov 21, 2026",
    time: "12:00 PM - 10:00 PM",
    venue: "Pleasure Park Waterfront",
    city: "Port Harcourt, Rivers",
    address: "Aba Road, Bori Camp",
    organizer: "Flavors of Naija",
    badge: "🍹 Food & Fun",
    liveSoldText: "19 tickets sold today",
    xpReward: 30,
    goingCount: 97,
    accentColor: "#ff8a65",
    secondaryColor: "#10b981",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    bannerPattern: "linear-gradient(135deg, #3b1e06 0%, #7c2d12 50%, #ca8a04 100%)",
    description: "An unforgettable outdoor culinary celebration with 40+ master grillers, fresh palm wine tasting bars, games arena, sip-and-paint canvas stalls, and acoustic African live music.",
    tiers: [
      {
        id: "tier_single",
        name: "Standard Foodie Pass",
        price: 4000,
        currency: "₦",
        capacity: 1500,
        soldCount: 1120,
        description: "Entry to food festival grounds plus complimentary palm wine tasting cup.",
        perks: ["Festival grounds access", "Free commemorative palm cup", "Games & live music stage"]
      },
      {
        id: "tier_couple",
        name: "Couple's Feast Pass",
        price: 12000,
        currency: "₦",
        capacity: 300,
        soldCount: 260,
        description: "Admission for two, food tasting vouchers, and reserved picnic table space.",
        perks: ["Entry for 2 people", "₦5,000 food voucher booklet", "Sip & paint art kit for two"]
      }
    ]
  },
  {
    id: "evt_campus_comedy_blast",
    title: "Laughter Therapy: All-Star Comedy Jam",
    subtitle: "Nigeria's funniest stand-up comedians and internet skit stars live on one mega stage.",
    category: "Arts / Culture",
    date: "Dec 12, 2026",
    time: "05:30 PM - 10:30 PM",
    venue: "Eko Hotels & Suites (Grand Ballroom)",
    city: "Victoria Island, Lagos",
    address: "Plot 1415 Adetokunbo Ademola St",
    organizer: "StandUp Naija Entertainment",
    badge: "🎭 Sold Out Risk",
    liveSoldText: "82 tickets sold today",
    xpReward: 60,
    goingCount: 440,
    accentColor: "#D4AF37",
    secondaryColor: "#522672",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    bannerPattern: "linear-gradient(135deg, #1c1402 0%, #522672 60%, #b45309 100%)",
    description: "Get ready for tears of joy and non-stop punchlines! A masterclass comedy gala featuring top stand-up legends, viral skit sensations, and celebrity musical guest appearances.",
    tiers: [
      {
        id: "tier_reg",
        name: "Regular Seat",
        price: 10000,
        currency: "₦",
        capacity: 1200,
        soldCount: 1115,
        description: "Hall seating with crystal-clear view of the main comedy stage and surround sound.",
        perks: ["Ballroom seating pass", "Fast-track ticket QR scan", "+60 NMDS XP points"]
      },
      {
        id: "tier_vip",
        name: "VIP Premium Seating",
        price: 30000,
        currency: "₦",
        capacity: 300,
        soldCount: 285,
        description: "Upfront priority seating, red-carpet photography, and cocktail reception.",
        perks: ["Front-tier theater seating", "Red carpet photo pass", "Complimentary cocktail & chops"]
      },
      {
        id: "tier_table",
        name: "Celebrity Table of 8",
        price: 350000,
        currency: "₦",
        capacity: 25,
        soldCount: 22,
        description: "Exclusive round table for 8 with champagne service, gourmet platter, and artist shoutout.",
        perks: ["Table for 8 persons", "2 Bottles of Moët & Chandon", "Full gourmet finger food platter", "Live on-stage shoutout from comedians"]
      }
    ]
  },
  {
    id: "evt_detty_december_beach_rave",
    title: "Detty Dec Beach Rave & Sun Splash",
    subtitle: "The marquee end-of-year beach festival with jet ski showcases, bonfire dance circles, and all-night DJs.",
    category: "Parties / Nightlife",
    date: "Dec 29, 2026",
    time: "02:00 PM - 05:00 AM",
    venue: "Elegushi Royal Beach Resort",
    city: "Lekki Phase 1, Lagos",
    address: "Elegushi Beach Road, Ikate",
    organizer: "Lekki Vibe Nation",
    badge: "🔥 Detty December",
    liveSoldText: "110 tickets sold today",
    xpReward: 90,
    goingCount: 780,
    accentColor: "#EB018E",
    secondaryColor: "#D4AF37",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80",
    bannerPattern: "linear-gradient(135deg, #1f021e 0%, #701a75 50%, #e11d48 100%)",
    description: "No December in Lagos is complete without the Elegushi Sun Splash. Join thousands of party-goers and diaspora visitors for the quintessential Detty December bash on the white sands of Lagos.",
    tiers: [
      {
        id: "tier_beach_pass",
        name: "Beach Rave Regular",
        price: 7500,
        currency: "₦",
        capacity: 3000,
        soldCount: 2750,
        description: "Day-to-night access to all beach zones, DJ stages, and watersport viewing.",
        perks: ["All-day beach access", "Water-resistant entry wristband", "Digital wallet ticket"]
      },
      {
        id: "tier_cabana",
        name: "VIP Cabana Lounge",
        price: 150000,
        currency: "₦",
        capacity: 40,
        soldCount: 36,
        description: "Private shaded beach cabana for 6 guests with beach recliners, cooler of drinks, and security.",
        perks: ["Shaded cabana for 6 people", "Cooler packed with beers, mixers & ice", "Dedicated cabana security", "Fruit & kebab platter"]
      }
    ]
  },
  {
    id: "evt_corporate_leadership_awards",
    title: "West Africa Corporate Leadership Awards & Dinner",
    subtitle: "A prestigious black-tie awards banquet honoring outstanding captains of industry, CEOs, and enterprise pioneers.",
    category: "Corporate Events",
    date: "Nov 28, 2026",
    time: "06:00 PM - 11:30 PM",
    venue: "Eko Convention Centre (Grand Ballroom)",
    city: "Victoria Island, Lagos",
    address: "Plot 1415 Adetokunbo Ademola St",
    organizer: "West Africa Business Forum",
    badge: "🏆 Black Tie Gala",
    liveSoldText: "32 corporate tables reserved",
    xpReward: 120,
    goingCount: 290,
    accentColor: "#D4AF37",
    secondaryColor: "#F5D061",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    bannerPattern: "linear-gradient(135deg, #070709 0%, #1a160d 50%, #D4AF37 100%)",
    description: "The pinnacle of corporate networking and excellence in West Africa. Join 500+ CEOs, ambassadors, and institutional investors for a 5-course gourmet dining experience, keynote presentations, and the annual honors gala.",
    tiers: [
      {
        id: "tier_corp_individual",
        name: "Executive Delegate Dinner Seat",
        price: 50000,
        currency: "₦",
        capacity: 250,
        soldCount: 210,
        description: "Reserved 5-course gala dinner seat, cocktail reception, and honors brochure.",
        perks: ["5-Course plated gourmet dinner", "Pre-gala cocktail networking hour", "Official awards directory entry"]
      },
      {
        id: "tier_corp_table",
        name: "Corporate VIP Table of 10",
        price: 450000,
        currency: "₦",
        capacity: 30,
        soldCount: 28,
        description: "Branded corporate table with logo placement, vintage champagne service, and executive red-carpet arrival.",
        perks: ["Reserved front table for 10 executives", "Branded corporate logo on table & program", "Complimentary champagne & sommelier selection", "Red carpet media photo ops"]
      }
    ]
  },
  {
    id: "evt_royal_wedding_experience",
    title: "The Royal Wedding Fair & Nuptial Banquet Showcase",
    subtitle: "West Africa's premier bridal gala, banquet tasting tables, live couture runway, and reception decor showcase.",
    category: "Weddings",
    date: "Dec 05, 2026",
    time: "11:00 AM - 08:00 PM",
    venue: "Ibom Hall & Banquet Grounds",
    city: "Uyo, Akwa Ibom",
    address: "IBB Way, Commercial District",
    organizer: "Crown & Veil Bridal Society",
    badge: "💍 Luxury Nuptials",
    liveSoldText: "45 passes booked this week",
    xpReward: 80,
    goingCount: 215,
    accentColor: "#ec4899",
    secondaryColor: "#D4AF37",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    bannerPattern: "linear-gradient(135deg, #2b031c 0%, #831843 50%, #f472b6 100%)",
    description: "An enchanting bridal and wedding showcase for couples, event planners, and banquet hosts. Experience live nuptial table arrangements, cake tasting sessions, designer runway reveals, and meet master wedding coordinators.",
    tiers: [
      {
        id: "tier_wedding_couple",
        name: "Couple's Nuptial VIP Pass",
        price: 20000,
        currency: "₦",
        capacity: 400,
        soldCount: 340,
        description: "Admission for bride & groom, tasting platter box, and bridal planning gift bag.",
        perks: ["Entry for 2 guests", "Chef's banquet tasting platter", "Deluxe bridal planner workbook", "Exclusive designer vendor discounts"]
      },
      {
        id: "tier_wedding_party",
        name: "Bridal Party Table of 6",
        price: 90000,
        currency: "₦",
        capacity: 40,
        soldCount: 32,
        description: "Reserved runway viewing table for 6 bridesmaids or family members with champagne brunch.",
        perks: ["Reserved lounge seating for 6", "Bottomless mimosa brunch", "Front row runway fashion show access", "VIP gift bags for all 6 guests"]
      }
    ]
  }
];
