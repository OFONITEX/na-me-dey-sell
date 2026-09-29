import { INITIAL_EVENTS } from "../data/mockEvents";

const STORAGE_KEYS = {
  EVENTS: "nmds_events_v2",
  TICKETS: "nmds_tickets_v2",
  RSVP: "nmds_rsvp_v2",
  PAYMENTS: "nmds_payments_ledger_v2",
  ACTIVITIES: "nmds_activity_feed_v2"
};

/**
 * Generates an authentic cryptographically structured Ticket ID for Nà Mè Dèy Sell
 * Format: NMDS-2026-[4-CHAR]-[4-CHAR] (e.g. NMDS-2026-8K7N-W49X)
 */
export function generateTicketId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NMDS-2026-${part1}-${part2}`;
}

export function generateOrderId() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `ORD-NG-${num}`;
}

export function formatPrice(amount, currency = "₦") {
  const symbol = currency || "₦";
  return `${symbol}${Number(amount || 0).toLocaleString()}`;
}

export function formatNaira(amount, currency = "₦") {
  return formatPrice(amount, currency);
}

/**
 * Loads events from localStorage or seeds with default events
 */
export function getStoredEvents() {
  if (typeof window === "undefined") return INITIAL_EVENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    const parsed = JSON.parse(raw);
    let updated = false;
    let synchronized = parsed.map(evt => {
      if (!evt.organizerEmail || !evt.createdBy) {
        const seed = INITIAL_EVENTS.find(s => s.id === evt.id);
        if (seed && seed.organizerEmail) {
          updated = true;
          return {
            ...evt,
            organizer: seed.organizer,
            organizerEmail: seed.organizerEmail,
            createdBy: seed.createdBy || seed.organizerEmail,
            organizerPhone: seed.organizerPhone || evt.organizerPhone || ""
          };
        }
      }
      return evt;
    });

    // Ensure all seed events exist in stored catalog, with NAPHSS pinned at index 0
    INITIAL_EVENTS.forEach(seed => {
      const exists = synchronized.some(e => e.id === seed.id || (e.title && e.title.toLowerCase().includes("naphss")));
      if (!exists) {
        if (seed.id === "evt_naphss_dinner_night") {
          synchronized.unshift(seed);
        } else {
          synchronized.push(seed);
        }
        updated = true;
      }
    });

    // Make sure NAPHSS Dinner Night is prioritized at the top of synchronized catalog
    const naphssIdx = synchronized.findIndex(e => e.id === "evt_naphss_dinner_night" || (e.title && e.title.toLowerCase().includes("naphss")));
    if (naphssIdx > 0) {
      const [naphssEvt] = synchronized.splice(naphssIdx, 1);
      synchronized.unshift(naphssEvt);
      updated = true;
    }

    // Specifically guarantee that any NAPHSS event grants organizer/admin rights to iamrhobbinraynerhq01@gmail.com and brinoekanem@gmail.com
    synchronized = synchronized.map(evt => {
      if (evt.id === "evt_naphss_dinner_night" || (evt.title && evt.title.toLowerCase().includes("naphss"))) {
        if (evt.organizerEmail !== "iamrhobbinraynerhq01@gmail.com" || evt.createdBy !== "iamrhobbinraynerhq01@gmail.com" || !evt.isFeatured) {
          updated = true;
          return {
            ...evt,
            organizer: evt.organizer || "NAPHSS Executive Council",
            organizerEmail: "iamrhobbinraynerhq01@gmail.com",
            createdBy: "iamrhobbinraynerhq01@gmail.com",
            organizerPhone: evt.organizerPhone || "+2348030000002",
            badge: evt.badge || "👑 Featured • NAPHSS Gala Night",
            isFeatured: true
          };
        }
      }
      return evt;
    });

    if (updated) {
      try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(synchronized));
      } catch {}
    }
    return synchronized;
  } catch (err) {
    console.error("Failed to load events:", err);
    return INITIAL_EVENTS;
  }
}

export const INITIAL_ACTIVITIES = [
  {
    id: "act_init_1",
    type: "payment",
    category: "Payment",
    title: "Ticket Purchase Completed",
    description: "Chukwudi Eze paid ₦25,000 for VIP Lounge Pass at Vibes Barn Festival",
    actor: "Chukwudi Eze",
    actorEmail: "chukwudi.eze@gmail.com",
    role: "attendee",
    eventTitle: "Vibes Barn: Afe Mbre Festival",
    orderId: "ORD-NG-849201",
    amount: 25000,
    timestamp: "2026-09-27T20:15:00.000Z"
  },
  {
    id: "act_init_2",
    type: "checkin",
    category: "Gate Check-In",
    title: "Gate Admission Verified",
    description: "Amina Bello checked in at Landmark Event Centre for Lagos Tech Unwind",
    actor: "Gate Marshall Segun",
    actorEmail: "gate1@landmark.ng",
    role: "staff",
    eventTitle: "Lagos Tech & Founders Unwind 2026",
    ticketId: "NMDS-2026-4R8E-W19P",
    timestamp: "2026-09-25T08:15:22.000Z"
  },
  {
    id: "act_init_3",
    type: "event",
    category: "Event Publishing",
    title: "New Event Published Live",
    description: "Flytime Promotions published 'Flytime Fest 2026' with 3 ticket tiers",
    actor: "Flytime Promotions HQ",
    actorEmail: "info@flytimefest.com",
    role: "organizer",
    eventTitle: "Flytime Fest: Rhythm & Soul",
    timestamp: "2026-09-22T14:30:00.000Z"
  },
  {
    id: "act_init_4",
    type: "auth",
    category: "Super Admin",
    title: "Super Admin Root Initialized",
    description: "Brino Ekanem authenticated with Super Admin root permissions",
    actor: "Brino Ekanem",
    actorEmail: "brinoekanem@gmail.com",
    role: "admin",
    timestamp: "2026-09-20T10:00:00.000Z"
  },
  {
    id: "act_init_5",
    type: "auth",
    category: "Super Admin",
    title: "Super Admin Console Session",
    description: "Rhobbin Rayner reviewed global payments and accounts ledger",
    actor: "Rhobbin Rayner",
    actorEmail: "iamrhobbinraynerhq01@gmail.com",
    role: "admin",
    timestamp: "2026-09-26T16:45:00.000Z"
  },
  {
    id: "act_init_6",
    type: "payment",
    category: "Payment",
    title: "Monnify Card Payment Cleared",
    description: "Tunde Bakare paid ₦10,000 for 2x Regular Access passes",
    actor: "Tunde Bakare",
    actorEmail: "tunde.bakare@lagosmail.com",
    role: "attendee",
    eventTitle: "Vibes Barn: Afe Mbre Festival",
    orderId: "ORD-NG-628491",
    amount: 10000,
    timestamp: "2026-09-26T14:20:00.000Z"
  },
  {
    id: "act_init_7",
    type: "event",
    category: "Event Moderation",
    title: "Event Details Updated",
    description: "David Adeleke updated venue and tier capacity for 'Timeless Lagos Stadium Concert'",
    actor: "David Adeleke (Davido)",
    actorEmail: "davido@dmw.ng",
    role: "organizer",
    eventTitle: "Timeless Lagos Stadium Concert",
    eventId: "evt_timeless_stadium_lagos",
    timestamp: "2026-09-25T17:10:00.000Z"
  },
  {
    id: "act_init_8",
    type: "payment",
    category: "Payment",
    title: "Early Bird Ticket Purchase",
    description: "Kelechi Nwosu paid ₦16,000 for 2x Early Bird Passes",
    actor: "Kelechi Nwosu",
    actorEmail: "kelechi.nwosu@gmail.com",
    role: "attendee",
    eventTitle: "Detty December Landmark Beach Rave",
    orderId: "ORD-NG-519283",
    amount: 16000,
    timestamp: "2026-09-27T19:45:00.000Z"
  },
  {
    id: "act_init_9",
    type: "checkin",
    category: "Gate Check-In",
    title: "Gate Check-In Admitted",
    description: "Chukwudi Eze scanned in at VIP Entrance with ticket pass NMDS-2026-9X7M-K42B",
    actor: "Gate Marshall Kalu",
    role: "staff",
    ticketId: "NMDS-2026-9X7M-K42B",
    eventTitle: "Vibes Barn: Afe Mbre Festival",
    timestamp: "2026-09-27T20:45:10.000Z"
  }
];

export function getActivityFeed() {
  if (typeof window === "undefined") return INITIAL_ACTIVITIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
      return INITIAL_ACTIVITIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVITIES;
  }
}

export function recordActivity(activityData) {
  if (typeof window === "undefined") return activityData;
  try {
    const feed = getActivityFeed();
    const newActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...activityData
    };
    const updated = [newActivity, ...feed].slice(0, 150);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    return newActivity;
  } catch (err) {
    console.error("Failed to record activity:", err);
    return activityData;
  }
}

export function saveNewEvent(eventData) {
  if (typeof window === "undefined") return eventData;
  try {
    const events = getStoredEvents();
    const newEvents = [eventData, ...events];
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(newEvents));

    recordActivity({
      type: "event",
      category: "Event Publishing",
      title: "New Event Published Live",
      description: `${eventData.organizer || "Organizer"} published "${eventData.title}" (${(eventData.tiers || []).length} tiers, ${eventData.city})`,
      actor: eventData.organizer || "Event Organizer",
      actorEmail: eventData.organizerEmail || "",
      role: "organizer",
      eventTitle: eventData.title,
      eventId: eventData.id
    });

    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new CustomEvent("nmds_events_change", { detail: { type: "create", event: eventData } }));
      } catch {}
    }

    return newEvents;
  } catch (err) {
    console.error("Failed to save new event:", err);
    return [];
  }
}

/**
 * Update an existing event by ID (title, venue, tiers, flyer, etc.)
 * Resilient against string/number ID formats, whitespace, and missing entries.
 */
export function updateEvent(eventId, updatedFields) {
  if (typeof window === "undefined") return null;
  try {
    const events = getStoredEvents();
    const cleanId = String(eventId || "").trim().toLowerCase();
    const index = events.findIndex(e => String(e.id || "").trim().toLowerCase() === cleanId);

    let updated;
    if (index === -1) {
      console.warn("Event not found in stored events, recovering entry for ID:", eventId);
      const seed = INITIAL_EVENTS.find(s => String(s.id || "").trim().toLowerCase() === cleanId);
      updated = {
        ...(seed || {}),
        ...updatedFields,
        id: eventId,
        updatedAt: new Date().toISOString()
      };
      const newEvents = [updated, ...events];
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(newEvents));
    } else {
      const existing = events[index];
      updated = {
        ...existing,
        ...updatedFields,
        id: existing.id || eventId,
        updatedAt: new Date().toISOString()
      };
      events[index] = updated;
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    }

    // Also update any future ticket references if event title changed
    if (updatedFields.title) {
      try {
        const tickets = getStoredTickets();
        const updatedTickets = tickets.map(t => 
          String(t.eventId || "").trim().toLowerCase() === cleanId ? { ...t, eventTitle: updatedFields.title } : t
        );
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updatedTickets));
      } catch {}
    }

    recordActivity({
      type: "event",
      category: "Event Moderation",
      title: "Event Details Updated",
      description: `Event "${updated.title}" was edited and saved`,
      actor: updated.organizer || "Organizer",
      actorEmail: updated.organizerEmail || "",
      role: "organizer",
      eventTitle: updated.title,
      eventId: updated.id
    });

    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new CustomEvent("nmds_events_change", { detail: { type: "update", event: updated } }));
      } catch {}
    }

    return updated;
  } catch (err) {
    console.error("Failed to update event:", err);
    return null;
  }
}

/**
 * Delete an event from the catalog
 */
export function deleteEvent(eventId) {
  if (typeof window === "undefined") return false;
  try {
    const events = getStoredEvents();
    const cleanId = String(eventId || "").trim().toLowerCase();
    const target = events.find(e => String(e.id || "").trim().toLowerCase() === cleanId);
    const filtered = events.filter(e => String(e.id || "").trim().toLowerCase() !== cleanId);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(filtered));

    if (target) {
      recordActivity({
        type: "event",
        category: "Event Moderation",
        title: "Event Removed",
        description: `Event "${target.title}" was removed from the catalog`,
        actor: target.organizer || "Organizer / Admin",
        actorEmail: target.organizerEmail || "",
        role: "admin",
        eventTitle: target.title,
        eventId: target.id
      });
    }

    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new CustomEvent("nmds_events_change", { detail: { type: "delete", eventId } }));
      } catch {}
    }

    return true;
  } catch (err) {
    console.error("Failed to delete event:", err);
    return false;
  }
}

/**
 * Toggle an event's featured badge status
 */
export function toggleEventFeatured(eventId) {
  if (typeof window === "undefined") return null;
  try {
    const events = getStoredEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return null;
    const isNowFeatured = !event.isFeatured;
    event.isFeatured = isNowFeatured;
    if (isNowFeatured && !event.badge) {
      event.badge = "🔥 Featured by Admin";
    }
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    return event;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Toggle event publication status: "live" | "paused" | "draft"
 */
export function toggleEventStatus(eventId, newStatus) {
  return updateEvent(eventId, { status: newStatus });
}

export const INITIAL_TICKETS = [
  {
    ticketId: "NMDS-2026-9X7M-K42B",
    orderId: "ORD-NG-849201",
    eventId: "evt_vibes_barn_afe_mbre",
    eventTitle: "Vibes Barn: Afe Mbre Festival",
    eventSubtitle: "The ultimate cultural groove, live music, beachside culinary feast, and Afro-fusion experience.",
    eventDate: "Sep 27, 2026",
    eventTime: "08:00 PM - 04:00 AM",
    venue: "Ibom Tropicana Entertainment Center",
    city: "Uyo, Akwa Ibom",
    address: "Udo Udoma Banking District",
    organizer: "Vibes Barn Global",
    organizerEmail: "info@vibesbarn.com",
    accentColor: "#522672",
    bannerPattern: "linear-gradient(135deg, #2D1B4E 0%, #522672 50%, #ff8a65 100%)",
    tierId: "tier_vip",
    tierName: "VIP Lounge Pass",
    tierPrice: 25000,
    currency: "₦",
    xpReward: 50,
    perks: ["Express VIP gate check-in", "Access to elevated VIP viewing deck", "Complimentary welcome drink & canapés"],
    seatNumber: "VIP-LOUNGE-04",
    attendee: {
      name: "Chukwudi Eze",
      email: "chukwudi.eze@gmail.com",
      phone: "+234 803 456 7890",
      notes: "Early VIP Arrival"
    },
    paymentMethod: "paystack",
    purchaseDate: "2026-09-20T18:30:00.000Z",
    status: "checked_in",
    checkedInAt: "2026-09-27T20:45:10.000Z",
    gateStaff: "Gate Marshall Kalu"
  },
  {
    ticketId: "NMDS-2026-4R8E-W19P",
    orderId: "ORD-NG-739104",
    eventId: "evt_lagos_tech_unwind",
    eventTitle: "Lagos Tech & Founders Unwind 2026",
    eventSubtitle: "West Africa's largest gathering of tech founders, venture capitalists, designers, and AI creators.",
    eventDate: "Oct 18, 2026",
    eventTime: "10:00 AM - 07:00 PM",
    venue: "Landmark Event Centre",
    city: "Victoria Island, Lagos",
    address: "Water Corporation Drive, Oniru",
    organizer: "Founders Circle Africa",
    organizerEmail: "hello@founderscircle.ng",
    accentColor: "#D4AF37",
    bannerPattern: "linear-gradient(135deg, #070709 0%, #1a160d 50%, #D4AF37 100%)",
    tierId: "tier_builder",
    tierName: "Delegate Pass",
    tierPrice: 15000,
    currency: "₦",
    xpReward: 100,
    perks: ["All stage panels & keynotes", "Access to 50+ startup demo booths", "Official goodie bag & digital pass"],
    seatNumber: "MAIN-HALL-E12",
    attendee: {
      name: "Amina Bello",
      email: "amina.bello@techfoundry.africa",
      phone: "+234 812 345 6789",
      notes: "Startup Pitch Finalist"
    },
    paymentMethod: "card",
    purchaseDate: "2026-09-22T11:15:00.000Z",
    status: "checked_in",
    checkedInAt: "2026-09-25T08:15:22.000Z",
    gateStaff: "Gate Marshall Segun"
  },
  {
    ticketId: "NMDS-2026-3X8K-Q72L",
    orderId: "ORD-NG-628491",
    eventId: "evt_vibes_barn_afe_mbre",
    eventTitle: "Vibes Barn: Afe Mbre Festival",
    eventSubtitle: "The ultimate cultural groove, live music, beachside culinary feast, and Afro-fusion experience.",
    eventDate: "Sep 27, 2026",
    eventTime: "08:00 PM - 04:00 AM",
    venue: "Ibom Tropicana Entertainment Center",
    city: "Uyo, Akwa Ibom",
    address: "Udo Udoma Banking District",
    organizer: "Vibes Barn Global",
    organizerEmail: "info@vibesbarn.com",
    accentColor: "#522672",
    tierId: "tier_reg",
    tierName: "Regular Access",
    tierPrice: 5000,
    currency: "₦",
    xpReward: 25,
    perks: ["General entry", "Festival wristband"],
    seatNumber: "REG-GA-102",
    attendee: {
      name: "Tunde Bakare",
      email: "tunde.bakare@lagosmail.com",
      phone: "+234 802 334 5566"
    },
    paymentMethod: "monnify",
    purchaseDate: "2026-09-26T14:20:00.000Z",
    status: "active",
    checkedInAt: null,
    gateStaff: null
  },
  {
    ticketId: "NMDS-2026-7H2V-M91P",
    orderId: "ORD-NG-519283",
    eventId: "evt_detty_december_beach",
    eventTitle: "Detty December Landmark Beach Rave",
    eventSubtitle: "End of year afrobeat fiesta on the beachfront with top guest artists and sunrise DJ sets.",
    eventDate: "Dec 20, 2026",
    eventTime: "06:00 PM - 05:00 AM",
    venue: "Landmark Beach",
    city: "Victoria Island, Lagos",
    address: "Water Corporation Road, Oniru",
    organizer: "Soundcity Pulse",
    organizerEmail: "events@soundcitypulse.com",
    accentColor: "#F59E0B",
    tierId: "tier_eb",
    tierName: "Early Bird General Pass",
    tierPrice: 8000,
    currency: "₦",
    xpReward: 40,
    perks: ["Beach access pass", "1 Free drink ticket"],
    seatNumber: "BEACH-GA-044",
    attendee: {
      name: "Kelechi Nwosu",
      email: "kelechi.nwosu@gmail.com",
      phone: "+234 805 112 3344"
    },
    paymentMethod: "monnify",
    purchaseDate: "2026-09-27T19:45:00.000Z",
    status: "active",
    checkedInAt: null,
    gateStaff: null
  },
  {
    ticketId: "NMDS-2026-6Y9T-B38V",
    orderId: "ORD-NG-408192",
    eventId: "evt_timeless_stadium_lagos",
    eventTitle: "Timeless Lagos Stadium Concert",
    eventSubtitle: "Davido live in concert with an unmissable orchestra and guest superstars.",
    eventDate: "Dec 28, 2026",
    eventTime: "07:00 PM - 02:00 AM",
    venue: "Teslim Balogun Stadium",
    city: "Surulere, Lagos",
    address: "Alhaji Masha Road",
    organizer: "David Adeleke (Davido)",
    organizerEmail: "davido@dmw.ng",
    accentColor: "#D4AF37",
    tierId: "tier_gold_circle",
    tierName: "Gold Circle Stage Pass",
    tierPrice: 35000,
    currency: "₦",
    xpReward: 150,
    perks: ["Front of stage pit access", "Collector laminate", "Dedicated VIP bar"],
    seatNumber: "STAGE-PIT-019",
    attendee: {
      name: "Amina Bello",
      email: "amina.bello@techfoundry.africa",
      phone: "+234 812 345 6789"
    },
    paymentMethod: "monnify",
    purchaseDate: "2026-09-24T12:00:00.000Z",
    status: "active",
    checkedInAt: null,
    gateStaff: null
  },
  {
    ticketId: "NMDS-2026-NAPH-1A8K",
    orderId: "ORD-NG-728190",
    eventId: "evt_naphss_dinner_night",
    eventTitle: "NAPHSS Annual Dinner & Awards Night 2026",
    eventSubtitle: "The official grand banquet, academic excellence awards, and cultural dinner gala.",
    eventDate: "Oct 24, 2026",
    eventTime: "06:00 PM - 01:00 AM",
    venue: "Emerald Grand Ballroom & Banquet Center",
    city: "Uyo, Akwa Ibom",
    address: "Plot 18 Banking District, Udo Udoma",
    organizer: "NAPHSS Executive Council",
    organizerEmail: "iamrhobbinraynerhq01@gmail.com",
    accentColor: "#D4AF37",
    tierId: "tier_naphss_student",
    tierName: "Standard Student Pass",
    tierPrice: 3500,
    currency: "₦",
    xpReward: 90,
    perks: ["Admission to main ballroom", "3-Course gourmet banquet dinner", "Red carpet photography access"],
    seatNumber: "STU-TABLE-04",
    attendee: {
      name: "Emeka Okafor",
      email: "emeka.okafor@uniuyo.edu.ng",
      phone: "+234 803 112 4455"
    },
    paymentMethod: "monnify",
    purchaseDate: "2026-09-28T14:30:00.000Z",
    status: "active",
    checkedInAt: null,
    gateStaff: null
  },
  {
    ticketId: "NMDS-2026-NAPH-9X2P",
    orderId: "ORD-NG-728191",
    eventId: "evt_naphss_dinner_night",
    eventTitle: "NAPHSS Annual Dinner & Awards Night 2026",
    eventSubtitle: "The official grand banquet, academic excellence awards, and cultural dinner gala.",
    eventDate: "Oct 24, 2026",
    eventTime: "06:00 PM - 01:00 AM",
    venue: "Emerald Grand Ballroom & Banquet Center",
    city: "Uyo, Akwa Ibom",
    address: "Plot 18 Banking District, Udo Udoma",
    organizer: "NAPHSS Executive Council",
    organizerEmail: "iamrhobbinraynerhq01@gmail.com",
    accentColor: "#D4AF37",
    tierId: "tier_naphss_student",
    tierName: "Standard Student Pass",
    tierPrice: 3500,
    currency: "₦",
    xpReward: 90,
    perks: ["Admission to main ballroom", "3-Course gourmet banquet dinner", "Red carpet photography access"],
    seatNumber: "STU-TABLE-09",
    attendee: {
      name: "Blessing Adeyemi",
      email: "blessing.adeyemi@uniuyo.edu.ng",
      phone: "+234 812 998 7766"
    },
    paymentMethod: "monnify",
    purchaseDate: "2026-09-28T15:10:00.000Z",
    status: "checked_in",
    checkedInAt: "2026-09-28T18:45:00.000Z",
    gateStaff: "Gate Marshall Kalu"
  },
  {
    ticketId: "NMDS-2026-NAPH-VIP3",
    orderId: "ORD-NG-728192",
    eventId: "evt_naphss_dinner_night",
    eventTitle: "NAPHSS Annual Dinner & Awards Night 2026",
    eventSubtitle: "The official grand banquet, academic excellence awards, and cultural dinner gala.",
    eventDate: "Oct 24, 2026",
    eventTime: "06:00 PM - 01:00 AM",
    venue: "Emerald Grand Ballroom & Banquet Center",
    city: "Uyo, Akwa Ibom",
    address: "Plot 18 Banking District, Udo Udoma",
    organizer: "NAPHSS Executive Council",
    organizerEmail: "iamrhobbinraynerhq01@gmail.com",
    accentColor: "#D4AF37",
    tierId: "tier_naphss_vip",
    tierName: "VIP Executive Delegate Pass",
    tierPrice: 10000,
    currency: "₦",
    xpReward: 120,
    perks: ["Front-row VIP ballroom seating", "Executive cocktail & appetizer service", "Complimentary wine"],
    seatNumber: "VIP-ROW-1",
    attendee: {
      name: "Dr. Samuel Bassey",
      email: "dr.bassey@healthscience.org",
      phone: "+234 802 334 1122"
    },
    paymentMethod: "monnify",
    purchaseDate: "2026-09-28T16:20:00.000Z",
    status: "active",
    checkedInAt: null,
    gateStaff: null
  },
  {
    ticketId: "NMDS-2026-NAPH-TBL1",
    orderId: "ORD-NG-728193",
    eventId: "evt_naphss_dinner_night",
    eventTitle: "NAPHSS Annual Dinner & Awards Night 2026",
    eventSubtitle: "The official grand banquet, academic excellence awards, and cultural dinner gala.",
    eventDate: "Oct 24, 2026",
    eventTime: "06:00 PM - 01:00 AM",
    venue: "Emerald Grand Ballroom & Banquet Center",
    city: "Uyo, Akwa Ibom",
    address: "Plot 18 Banking District, Udo Udoma",
    organizer: "NAPHSS Executive Council",
    organizerEmail: "iamrhobbinraynerhq01@gmail.com",
    accentColor: "#D4AF37",
    tierId: "tier_naphss_table",
    tierName: "Patrons & Alumni Table of 8",
    tierPrice: 60000,
    currency: "₦",
    xpReward: 200,
    perks: ["Reserved table for 8 persons", "2 Bottles of premium wine & mixers", "Dedicated table butler"],
    seatNumber: "PATRON-TBL-01",
    attendee: {
      name: "NAPHSS Alumni Class of 2022",
      email: "alumni.publichealth@gmail.com",
      phone: "+234 803 777 8899"
    },
    paymentMethod: "monnify",
    purchaseDate: "2026-09-28T17:00:00.000Z",
    status: "checked_in",
    checkedInAt: "2026-09-28T18:50:00.000Z",
    gateStaff: "Gate Marshall Kalu"
  }
];

export function getStoredTickets() {
  if (typeof window === "undefined") return INITIAL_TICKETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    const parsed = JSON.parse(raw);
    let updated = false;
    // Ensure NAPHSS tickets are merged into parsed if not present
    INITIAL_TICKETS.forEach(seedTkt => {
      if (seedTkt.eventId === "evt_naphss_dinner_night") {
        if (!parsed.some(t => t.ticketId === seedTkt.ticketId)) {
          parsed.unshift(seedTkt);
          updated = true;
        }
      }
    });
    if (updated) {
      try {
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(parsed));
      } catch {}
    }
    return parsed;
  } catch (err) {
    console.error("Failed to load tickets:", err);
    return INITIAL_TICKETS;
  }
}

export function saveTickets(newTicketsList) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredTickets();
    const updated = [...newTicketsList, ...existing];
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save tickets:", err);
    return [];
  }
}

export const INITIAL_PAYMENTS = [
  {
    orderId: "ORD-NG-849201",
    transactionRef: "MNF_TX_849201_912",
    paymentReference: "MNF_REV_2026_9401",
    eventId: "evt_vibes_barn_afe_mbre",
    eventTitle: "Vibes Barn: Afe Mbre Festival",
    organizer: "Vibes Barn Global",
    organizerEmail: "info@vibesbarn.com",
    attendee: {
      name: "Chukwudi Eze",
      email: "chukwudi.eze@gmail.com",
      phone: "+234 803 456 7890"
    },
    quantity: 1,
    tierName: "VIP Lounge Pass",
    grossAmount: 25000,
    platformFee: 1250,
    organizerPayout: 23750,
    currency: "₦",
    paymentMethod: "monnify",
    paymentStatus: "PAID",
    timestamp: "2026-09-20T18:30:00.000Z"
  },
  {
    orderId: "ORD-NG-739104",
    transactionRef: "MNF_TX_739104_310",
    paymentReference: "MNF_REV_2026_7391",
    eventId: "evt_lagos_tech_unwind",
    eventTitle: "Lagos Tech & Founders Unwind 2026",
    organizer: "Founders Circle Africa",
    organizerEmail: "hello@founderscircle.ng",
    attendee: {
      name: "Amina Bello",
      email: "amina.bello@techfoundry.africa",
      phone: "+234 812 345 6789"
    },
    quantity: 1,
    tierName: "Delegate Pass",
    grossAmount: 15000,
    platformFee: 750,
    organizerPayout: 14250,
    currency: "₦",
    paymentMethod: "monnify",
    paymentStatus: "PAID",
    timestamp: "2026-09-22T11:15:00.000Z"
  },
  {
    orderId: "ORD-NG-628491",
    transactionRef: "MNF_TX_628491_582",
    paymentReference: "MNF_REV_2026_6284",
    eventId: "evt_vibes_barn_afe_mbre",
    eventTitle: "Vibes Barn: Afe Mbre Festival",
    organizer: "Vibes Barn Global",
    organizerEmail: "info@vibesbarn.com",
    attendee: {
      name: "Tunde Bakare",
      email: "tunde.bakare@lagosmail.com",
      phone: "+234 802 334 5566"
    },
    quantity: 2,
    tierName: "Regular Access",
    grossAmount: 10000,
    platformFee: 500,
    organizerPayout: 9500,
    currency: "₦",
    paymentMethod: "monnify",
    paymentStatus: "PAID",
    timestamp: "2026-09-26T14:20:00.000Z"
  },
  {
    orderId: "ORD-NG-519283",
    transactionRef: "MNF_TX_519283_449",
    paymentReference: "MNF_REV_2026_5192",
    eventId: "evt_detty_december_beach",
    eventTitle: "Detty December Landmark Beach Rave",
    organizer: "Soundcity Pulse",
    organizerEmail: "events@soundcitypulse.com",
    attendee: {
      name: "Kelechi Nwosu",
      email: "kelechi.nwosu@gmail.com",
      phone: "+234 805 112 3344"
    },
    quantity: 2,
    tierName: "Early Bird General Pass",
    grossAmount: 16000,
    platformFee: 800,
    organizerPayout: 15200,
    currency: "₦",
    paymentMethod: "monnify",
    paymentStatus: "PAID",
    timestamp: "2026-09-27T19:45:00.000Z"
  },
  {
    orderId: "ORD-NG-408192",
    transactionRef: "MNF_TX_408192_811",
    paymentReference: "MNF_REV_2026_4081",
    eventId: "evt_timeless_stadium_lagos",
    eventTitle: "Timeless Lagos Stadium Concert",
    organizer: "David Adeleke (Davido)",
    organizerEmail: "davido@dmw.ng",
    attendee: {
      name: "Amina Bello",
      email: "amina.bello@techfoundry.africa",
      phone: "+234 812 345 6789"
    },
    quantity: 1,
    tierName: "Gold Circle Stage Pass",
    grossAmount: 35000,
    platformFee: 1750,
    organizerPayout: 33250,
    currency: "₦",
    paymentMethod: "monnify",
    paymentStatus: "PAID",
    timestamp: "2026-09-24T12:00:00.000Z"
  }
];

export function getPaymentsLedger() {
  if (typeof window === "undefined") return INITIAL_PAYMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load payments ledger:", err);
    return INITIAL_PAYMENTS;
  }
}

export function recordPayment(paymentData) {
  if (typeof window === "undefined") return paymentData;
  try {
    const ledger = getPaymentsLedger();
    const updated = [paymentData, ...ledger];
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to record payment:", err);
    return [];
  }
}

export function getEventsByOrganizer(organizerIdOrEmail) {
  if (!organizerIdOrEmail) return [];
  const events = getStoredEvents();
  const cleanId = String(organizerIdOrEmail).trim().toLowerCase();
  return events.filter(e => 
    (e.organizerId && String(e.organizerId).toLowerCase() === cleanId) ||
    (e.organizerEmail && String(e.organizerEmail).toLowerCase() === cleanId) ||
    (e.organizer && String(e.organizer).toLowerCase() === cleanId)
  );
}

export function getAttendeesByEvent(eventId) {
  const tickets = getStoredTickets();
  if (!eventId) return tickets;
  return tickets.filter(t => t.eventId === eventId);
}

/**
 * Issues new tickets upon successful checkout
 */
export function issueTickets({ event, tier, quantity, attendee, paymentMethod, promoDiscount = 0, gatewayResponse = null }) {
  const orderId = generateOrderId();
  const createdTickets = [];

  const paymentReference = gatewayResponse?.paymentReference || gatewayResponse?.reference || null;
  const transactionReference = gatewayResponse?.transactionReference || null;
  const paymentStatus = gatewayResponse?.paymentStatus || gatewayResponse?.status || "PAID";

  for (let i = 0; i < quantity; i++) {
    const seatLetter = String.fromCharCode(65 + Math.floor(Math.random() * 6));
    const seatNum = Math.floor(1 + Math.random() * 50);
    const ticketId = generateTicketId();

    createdTickets.push({
      ticketId,
      orderId,
      eventId: event.id,
      eventTitle: event.title,
      eventSubtitle: event.subtitle,
      eventDate: event.date,
      eventTime: event.time,
      venue: event.venue,
      city: event.city,
      address: event.address || event.venue,
      organizer: event.organizer,
      accentColor: event.accentColor || "#522672",
      bannerPattern: event.bannerPattern,
      tierId: tier.id,
      tierName: tier.name,
      tierPrice: tier.price,
      currency: tier.currency || event.currency || "₦",
      xpReward: event.xpReward || 50,
      perks: tier.perks || [],
      seatNumber: `${tier.name.split(" ")[0].toUpperCase()}-${seatLetter}${seatNum}`,
      attendee: {
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        notes: attendee.notes || ""
      },
      paymentMethod,
      paymentReference,
      transactionReference,
      paymentStatus,
      purchaseDate: new Date().toISOString(),
      status: "active",
      checkedInAt: null,
      gateStaff: null
    });
  }

  saveTickets(createdTickets);

  const totalPaid = Math.max(0, (tier.price * quantity) - promoDiscount);
  const platformFee = Math.round(totalPaid * 0.05); // 5% platform commission
  const organizerPayout = totalPaid - platformFee;

  // Record transaction in Payments Ledger
  recordPayment({
    orderId,
    transactionRef: transactionReference || `TRX-${Date.now()}`,
    paymentReference: paymentReference || `MNF-REF-${orderId}`,
    eventId: event.id,
    eventTitle: event.title,
    organizer: event.organizer || "Event Organizer",
    organizerId: event.organizerId || event.organizerEmail || "org_default",
    attendee: {
      name: attendee.name,
      email: attendee.email,
      phone: attendee.phone
    },
    quantity,
    tierName: tier.name,
    grossAmount: totalPaid,
    platformFee,
    organizerPayout,
    currency: tier.currency || event.currency || "₦",
    paymentMethod: paymentMethod || "monnify",
    paymentStatus: paymentStatus || "PAID",
    timestamp: new Date().toISOString()
  });

  // Record platform activity
  recordActivity({
    type: "payment",
    category: "Ticket Order",
    title: "New Tickets Purchased",
    description: `${attendee.name} paid ${tier.currency || "₦"}${totalPaid.toLocaleString()} for ${quantity}x ${tier.name} (${event.title})`,
    actor: attendee.name,
    actorEmail: attendee.email,
    role: "attendee",
    eventTitle: event.title,
    orderId,
    amount: totalPaid,
    ticketCount: quantity
  });

  return {
    orderId,
    tickets: createdTickets,
    paymentReference,
    transactionReference,
    totalPaid
  };
}

/**
 * Validates a ticket ID for Gate Staff Scanner
 */
export function validateTicket(ticketId, staffName = "Gate Marshall #1") {
  const cleanId = (ticketId || "").trim().toUpperCase();
  const tickets = getStoredTickets();
  const found = tickets.find(
    t => t.ticketId.toUpperCase() === cleanId || cleanId.includes(t.ticketId.toUpperCase())
  );

  if (!found) {
    return {
      success: false,
      status: "invalid",
      message: `Ticket ID "${cleanId}" not found in Nà Mè Dèy Sell registry. Check for counterfeit or typo.`,
      ticket: null
    };
  }

  if (found.status === "checked_in") {
    return {
      success: false,
      status: "already_checked_in",
      message: `ALERT: This ticket was already redeemed on ${new Date(found.checkedInAt).toLocaleTimeString()} at Gate Check-in!`,
      ticket: found
    };
  }

  // Mark ticket as checked in
  const checkInTime = new Date().toISOString();
  const updatedTickets = tickets.map(t => {
    if (t.ticketId === found.ticketId) {
      return {
        ...t,
        status: "checked_in",
        checkedInAt: checkInTime,
        gateStaff: staffName
      };
    }
    return t;
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updatedTickets));
    } catch (e) {
      console.error(e);
    }
  }

  recordActivity({
    type: "checkin",
    category: "Gate Check-In",
    title: "Attendee Admitted",
    description: `${found.attendee?.name || "Attendee"} admitted at gate for "${found.eventTitle}" (${found.tierName})`,
    actor: staffName,
    role: "staff",
    ticketId: found.ticketId,
    eventTitle: found.eventTitle,
    orderId: found.orderId
  });

  return {
    success: true,
    status: "valid",
    message: `ENTRY GRANTED! Welcome ${found.attendee.name}. Tier: ${found.tierName}.`,
    ticket: {
      ...found,
      status: "checked_in",
      checkedInAt: checkInTime,
      gateStaff: staffName
    }
  };
}

export function verifyTicketCheckIn(ticketId, staffName = "Gate Marshall") {
  const result = validateTicket(ticketId, staffName);
  if (result.success) {
    return {
      status: "SUCCESS",
      message: result.message,
      ticket: result.ticket
    };
  } else if (result.status === "already_checked_in") {
    return {
      status: "ALREADY_CHECKED_IN",
      message: result.message,
      ticket: result.ticket
    };
  } else {
    return {
      status: "NOT_FOUND",
      message: result.message,
      ticket: null
    };
  }
}

/**
 * Toggle or force ticket check-in status (Admin/Staff override)
 */
export function toggleTicketStatus(ticketId, forcedStatus = null, staff = "Super Admin") {
  if (typeof window === "undefined") return null;
  try {
    const tickets = getStoredTickets();
    const index = tickets.findIndex(t => t.ticketId.toUpperCase() === (ticketId || "").toUpperCase());
    if (index === -1) return null;

    const current = tickets[index];
    const newStatus = forcedStatus || (current.status === "checked_in" ? "active" : "checked_in");
    const updated = {
      ...current,
      status: newStatus,
      checkedInAt: newStatus === "checked_in" ? new Date().toISOString() : null,
      gateStaff: newStatus === "checked_in" ? staff : null
    };

    tickets[index] = updated;
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));

    recordActivity({
      type: "checkin",
      category: "Ticketing Admin",
      title: newStatus === "checked_in" ? "Ticket Checked In (Admin Override)" : "Ticket Check-in Reset to Active",
      description: `Ticket ${current.ticketId} (${current.attendee?.name}, ${current.eventTitle}) status set to ${newStatus}`,
      actor: staff,
      role: "admin",
      ticketId: current.ticketId,
      eventTitle: current.eventTitle
    });

    return updated;
  } catch (err) {
    console.error("Failed to toggle ticket status:", err);
    return null;
  }
}

/**
 * Super Admin Helper: Scopes all portal entities (activities, payments, tickets, events)
 * to a single registered user account, OR returns all if "all" / null.
 */
export function getAccountPortalData(accountEmailOrId) {
  const allActivities = getActivityFeed();
  const allPayments = getPaymentsLedger();
  const allTickets = getStoredTickets();
  const allEvents = getStoredEvents();

  if (!accountEmailOrId || accountEmailOrId === "all") {
    return {
      isGlobal: true,
      email: "all",
      activities: allActivities,
      payments: allPayments,
      tickets: allTickets,
      events: allEvents,
      metrics: {
        totalPaid: allPayments.reduce((s, p) => s + (Number(p.grossAmount) || 0), 0),
        totalEarned: allPayments.reduce((s, p) => s + (Number(p.organizerPayout) || 0), 0),
        platformRevenue: allPayments.reduce((s, p) => s + (Number(p.platformFee) || 0), 0),
        totalTicketsIssued: allTickets.length,
        eventsCount: allEvents.length
      }
    };
  }

  const clean = String(accountEmailOrId).toLowerCase().trim();

  // Events owned or created by this account
  const accountEvents = allEvents.filter(e =>
    (e.organizerEmail && e.organizerEmail.toLowerCase() === clean) ||
    (e.createdBy && e.createdBy.toLowerCase() === clean) ||
    (e.organizerId && String(e.organizerId).toLowerCase() === clean) ||
    ((clean === "iamrhobbinraynerhq01@gmail.com" || clean === "brinoekanem@gmail.com") && (e.id === "evt_naphss_dinner_night" || (e.title && e.title.toLowerCase().includes("naphss"))))
  );
  const accountEventIds = new Set(accountEvents.map(e => e.id));

  // Payments where account was payer OR organizer
  const accountPayments = allPayments.filter(p =>
    (p.attendee?.email && p.attendee.email.toLowerCase() === clean) ||
    (p.organizerEmail && p.organizerEmail.toLowerCase() === clean) ||
    (p.organizerId && String(p.organizerId).toLowerCase() === clean) ||
    (p.eventId && accountEventIds.has(p.eventId))
  );

  // Tickets where account is attendee OR tickets sold for account's events
  const accountTickets = allTickets.filter(t =>
    (t.attendee?.email && t.attendee.email.toLowerCase() === clean) ||
    accountEventIds.has(t.eventId)
  );

  // Activities performed by, targeted to, or pertaining to this account
  const accountActivities = allActivities.filter(a =>
    (a.actorEmail && a.actorEmail.toLowerCase() === clean) ||
    (a.targetEmail && a.targetEmail.toLowerCase() === clean) ||
    (a.eventId && accountEventIds.has(a.eventId)) ||
    (a.orderId && accountPayments.some(p => p.orderId === a.orderId)) ||
    (a.ticketId && accountTickets.some(t => t.ticketId === a.ticketId))
  );

  const totalPaid = accountPayments
    .filter(p => p.attendee?.email && p.attendee.email.toLowerCase() === clean)
    .reduce((s, p) => s + (Number(p.grossAmount) || 0), 0);

  const totalEarned = accountPayments
    .filter(p => (p.organizerEmail && p.organizerEmail.toLowerCase() === clean) || accountEventIds.has(p.eventId))
    .reduce((s, p) => s + (Number(p.organizerPayout) || 0), 0);

  const totalTicketsBought = accountTickets.filter(t => t.attendee?.email && t.attendee.email.toLowerCase() === clean).length;
  const totalTicketsSold = accountTickets.filter(t => accountEventIds.has(t.eventId)).length;

  return {
    isGlobal: false,
    email: clean,
    events: accountEvents,
    payments: accountPayments,
    tickets: accountTickets,
    activities: accountActivities,
    metrics: {
      totalPaid,
      totalEarned,
      totalTicketsBought,
      totalTicketsSold,
      eventsCount: accountEvents.length
    }
  };
}

/**
 * Organizer Analytics Helper: Generates organized structured analytics for event creators
 */
export function getOrganizerEventAnalytics(organizerEmailOrId, specificEventId = "all", customEvents = null) {
  const allEvents = Array.isArray(customEvents) ? customEvents : getStoredEvents();
  const allTickets = getStoredTickets();
  const allPayments = getPaymentsLedger();

  const cleanEmail = organizerEmailOrId ? String(organizerEmailOrId).toLowerCase().trim() : "";

  // Filter events strictly belonging to organizer
  const organizerEvents = Array.isArray(customEvents)
    ? customEvents
    : allEvents.filter(e => {
        if (!cleanEmail) return false;
        return (e.organizerEmail && e.organizerEmail.toLowerCase() === cleanEmail) ||
          (e.createdBy && e.createdBy.toLowerCase() === cleanEmail) ||
          (e.organizerId && String(e.organizerId).toLowerCase() === cleanEmail);
      });

  const selectedEvents = specificEventId && specificEventId !== "all"
    ? organizerEvents.filter(e => e.id === specificEventId)
    : organizerEvents;

  // If this organizer has zero events, return strictly zero metrics
  if (!selectedEvents || selectedEvents.length === 0) {
    return {
      grossSales: 0,
      platformFee: 0,
      netPayout: 0,
      ticketsSold: 0,
      checkedInCount: 0,
      totalCapacity: 0,
      checkInRate: 0,
      capacitySoldRate: 0,
      eventSummaries: [],
      tierSummaries: [],
      recentCheckIns: []
    };
  }

  const targetEventIds = new Set(selectedEvents.map(e => e.id));

  // Tickets for these events
  const relevantTickets = allTickets.filter(t => targetEventIds.has(t.eventId));
  // Payments for these events
  const relevantPayments = allPayments.filter(p => targetEventIds.has(p.eventId));

  const grossSales = relevantPayments.reduce((sum, p) => sum + (Number(p.grossAmount) || 0), 0);
  const platformFee = Math.round(grossSales * 0.05);
  const netPayout = grossSales - platformFee;
  const ticketsSold = relevantTickets.length;
  const checkedInCount = relevantTickets.filter(t => t.status === "checked_in").length;
  const totalCapacity = selectedEvents.reduce((sum, e) => {
    return sum + (e.tiers || []).reduce((tsum, tier) => tsum + (Number(tier.capacity) || 100), 0);
  }, 0);

  const checkInRate = ticketsSold > 0 ? Math.round((checkedInCount / ticketsSold) * 100) : 0;
  const capacitySoldRate = totalCapacity > 0 ? Math.min(100, Math.round((ticketsSold / totalCapacity) * 100)) : 0;

  // Event summaries table rows
  const eventSummaries = selectedEvents.map(e => {
    const eTickets = relevantTickets.filter(t => t.eventId === e.id);
    const ePayments = relevantPayments.filter(p => p.eventId === e.id);
    const eGross = ePayments.reduce((sum, p) => sum + (Number(p.grossAmount) || 0), 0);
    const eNet = Math.round(eGross * 0.95);
    const eSold = eTickets.length;
    const eCap = (e.tiers || []).reduce((tsum, tier) => tsum + (Number(tier.capacity) || 100), 0);
    const eCheckedIn = eTickets.filter(t => t.status === "checked_in").length;
    const eCheckInRate = eSold > 0 ? Math.round((eCheckedIn / eSold) * 100) : 0;

    return {
      id: e.id,
      title: e.title,
      category: e.category,
      date: e.date,
      venue: e.venue,
      city: e.city,
      status: e.status || "live",
      grossRevenue: eGross,
      netPayout: eNet,
      ticketsSold: eSold,
      capacity: eCap,
      checkedIn: eCheckedIn,
      checkInRate: eCheckInRate,
      tiers: e.tiers || []
    };
  });

  // Tier summaries table rows
  const tierSummaries = [];
  selectedEvents.forEach(e => {
    (e.tiers || []).forEach(tier => {
      const soldForTier = relevantTickets.filter(t => t.eventId === e.id && (t.tierId === tier.id || t.tierName === tier.name)).length;
      const tierGross = soldForTier * (Number(tier.price) || 0);
      tierSummaries.push({
        eventId: e.id,
        eventTitle: e.title,
        tierId: tier.id,
        name: tier.name,
        price: tier.price,
        capacity: tier.capacity || 100,
        sold: soldForTier,
        gross: tierGross,
        remaining: Math.max(0, (tier.capacity || 100) - soldForTier)
      });
    });
  });

  return {
    grossSales,
    platformFee,
    netPayout,
    ticketsSold,
    checkedInCount,
    totalCapacity,
    checkInRate,
    capacitySoldRate,
    eventSummaries,
    tierSummaries,
    recentCheckIns: relevantTickets.filter(t => t.status === "checked_in").slice(0, 10)
  };
}


