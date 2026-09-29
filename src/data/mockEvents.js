/**
 * Curated initial event catalog for Nà Mè Dèy Sell
 * Retains Vibes Barn and the NAPHSS event created by iamrhobbinraynerhq01@gmail.com.
 */
export const INITIAL_EVENTS = [
  {
    id: "evt_naphss_dinner_night",
    title: "NAPHSS Annual Dinner & Awards Night 2026",
    subtitle: "The most glamorous evening of celebrating academic excellence, leadership honors, red carpet elegance, and student fellowship.",
    category: "Parties / Nightlife",
    date: "Oct 24, 2026",
    time: "06:00 PM - 01:00 AM",
    venue: "Emerald Grand Ballroom & Banquet Center",
    city: "Uyo, Akwa Ibom",
    address: "Plot 18 Banking District, Udo Udoma",
    organizer: "NAPHSS Executive Council",
    organizerEmail: "iamrhobbinraynerhq01@gmail.com",
    createdBy: "iamrhobbinraynerhq01@gmail.com",
    organizerPhone: "+2348030000002",
    badge: "👑 Featured • NAPHSS Gala Night",
    isFeatured: true,
    liveSoldText: "148 tickets sold this week",
    xpReward: 90,
    goingCount: 312,
    accentColor: "#D4AF37",
    secondaryColor: "#10B981",
    imageUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80",
    bannerPattern: "linear-gradient(135deg, #070709 0%, #151d16 50%, #D4AF37 100%)",
    description: "The National Association of Public Health Science Students (NAPHSS) proudly presents the 2026 Annual Dinner & Awards Night! A night of distinction, elegance, fine dining, student awards, celebrity musical guests, comedy performances, and the crowning of Mr & Miss NAPHSS. Dress to inspire in your finest black-tie or royal traditional attire.",
    createdAt: "2026-09-28T18:00:00.000Z",
    tiers: [
      {
        id: "tier_naphss_student",
        name: "Standard Student Pass",
        price: 3500,
        currency: "₦",
        capacity: 400,
        soldCount: 310,
        description: "Official banquet entry pass, 3-course dinner ticket, red carpet photo access, and digital QR pass.",
        perks: ["Admission to main ballroom", "3-Course gourmet banquet dinner", "Red carpet photography access", "Official NAPHSS awards program brochure"]
      },
      {
        id: "tier_naphss_vip",
        name: "VIP Executive Delegate Pass",
        price: 10000,
        currency: "₦",
        capacity: 100,
        soldCount: 78,
        description: "Expedited VIP registration, front-row reserved seat, complimentary cocktail & chops, and awards photo session.",
        perks: ["Front-row VIP ballroom seating", "Executive cocktail & appetizer service", "Complimentary bottle of wine / champagne per table", "Exclusive photo op with award recipients"]
      },
      {
        id: "tier_naphss_table",
        name: "Patrons & Alumni Table of 8",
        price: 60000,
        currency: "₦",
        capacity: 15,
        soldCount: 12,
        description: "Full table reserved for 8 alumni/dignitaries with 2 bottles of premium wine, specialized catering, and on-stage honors citation.",
        perks: ["Reserved table for 8 persons", "2 Bottles of premium wine & mixers", "Dedicated table butler", "Official departmental alumni honors citation"]
      }
    ]
  },
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
    organizerEmail: "info@vibesbarn.com",
    createdBy: "info@vibesbarn.com",
    organizerPhone: "+2348039991122",
    badge: "🔥 Trending Event",
    liveSoldText: "24 tickets sold today",
    xpReward: 50,
    goingCount: 142,
    accentColor: "#522672",
    secondaryColor: "#ff8a65",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    bannerPattern: "linear-gradient(135deg, #2D1B4E 0%, #522672 50%, #ff8a65 100%)",
    description: "Experience the vibrant rhythm of Afe Mbre. Featuring stellar live performances from top afrobeat sensations, high-energy DJ sets, local gourmet street food, cocktail lounges, and interactive light installations under the night sky.",
    createdAt: "2026-09-20T14:00:00.000Z",
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
  }
];
