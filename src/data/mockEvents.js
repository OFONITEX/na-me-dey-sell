/**
 * Curated initial event catalog for Nà Mè Dèy Sell
 * Only the Vibes Barn seed event is kept; all other events are user-created.
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
