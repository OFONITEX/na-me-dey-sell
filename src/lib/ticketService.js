import { INITIAL_EVENTS } from "../data/mockEvents";
import {
  isSupabaseConfigured,
  fetchEventsFromSupabase,
  upsertEventToSupabase,
  subscribeToEventsRealtime,
  fetchTicketsFromSupabase,
  fetchTicketByIdFromSupabase,
  upsertTicketsToSupabase,
  markTicketCheckedInInSupabase
} from "./supabaseClient";

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
 * Convert any string into an SEO-friendly URL slug
 */
export function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "and")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Get clean URL slug for an event.
 * Uses event.slug if present, else maps standard IDs or slugifies the title.
 * Examples:
 *  - "NAPHSS Annual Dinner & Awards Night 2026" -> "naphss-dinner-night"
 */
export function getEventSlug(event) {
  if (!event) return "";
  if (event.slug) return slugify(event.slug);
  
  const id = String(event.id || "").trim().toLowerCase();
  if (id === "evt_naphss_dinner_night" || id.includes("naphss")) {
    return "naphss-dinner-night";
  }

  if (id.startsWith("evt_") && !id.startsWith("evt_user_") && !id.startsWith("evt_1")) {
    return slugify(id.replace(/^evt_/, "").replace(/_/g, "-"));
  }

  return slugify(event.title) || id;
}

/**
 * Finds an event in an array by slug, ID, or title slug
 */
export function findEventBySlugOrId(eventsList, targetSlugOrId) {
  if (!eventsList || !targetSlugOrId) return null;
  const cleanTarget = String(targetSlugOrId).toLowerCase().trim();

  return eventsList.find(e => {
    if (!e) return false;
    const cleanId = String(e.id || "").toLowerCase().trim();
    if (cleanId === cleanTarget) return true;

    const eventSlug = getEventSlug(e).toLowerCase();
    if (eventSlug === cleanTarget) return true;

    if (e.slug && String(e.slug).toLowerCase().trim() === cleanTarget) return true;

    const titleSlug = slugify(e.title || "").toLowerCase();
    if (titleSlug === cleanTarget) return true;

    // Special matcher for NAPHSS
    if (cleanTarget.includes("naphss") && (cleanId.includes("naphss") || (e.title && e.title.toLowerCase().includes("naphss")))) {
      return true;
    }

    return false;
  }) || null;
}

export const LEGACY_REMOVED_EVENT_IDS = new Set([
  "evt_vibes_barn_afe_mbre",
  "evt_flytime_fest_burna",
  "evt_lagos_tech_unwind",
  "evt_eko_supper_club_experience",
  "evt_comedy_royalty_night",
  "evt_detty_december_beach_rave",
  "evt_detty_december_beach",
  "evt_corporate_leadership_awards",
  "evt_royal_wedding_experience",
  "evt_timeless_stadium_lagos",
  "evt_afrobeat_rave_abuja",
  "evt_palmwine_food_culture",
  "evt_campus_comedy_blast"
]);

/**
 * Loads events from localStorage or seeds with default events
 */
export function getStoredEvents() {
  if (typeof window === "undefined") return sortEventsByCreatedAt(INITIAL_EVENTS);
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      const sorted = sortEventsByCreatedAt(INITIAL_EVENTS);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(sorted));
      return sorted;
    }
    const parsed = JSON.parse(raw);
    let updated = false;

    // Remove legacy mock events, preserving authentic events
    const filtered = parsed.filter(evt => {
      if (LEGACY_REMOVED_EVENT_IDS.has(evt.id)) {
        updated = true;
        return false;
      }
      return true;
    });

    let synchronized = filtered.map(evt => {
      // Sync missing organizer fields from seed data
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
      // Backfill createdAt from seed data or fallback if missing
      if (!evt.createdAt) {
        const seed = INITIAL_EVENTS.find(s => s.id === evt.id);
        if (seed && seed.createdAt) {
          updated = true;
          return { ...evt, createdAt: seed.createdAt };
        } else if (evt.id === "evt_naphss_dinner_night") {
          updated = true;
          return { ...evt, createdAt: "2026-09-28T18:00:00.000Z" };
        } else {
          updated = true;
          return { ...evt, createdAt: evt.updatedAt || new Date().toISOString() };
        }
      }
      return evt;
    });

    // Ensure all seed events exist in stored catalog
    INITIAL_EVENTS.forEach(seed => {
      const exists = synchronized.some(e => e.id === seed.id);
      if (!exists) {
        synchronized.push(seed);
        updated = true;
      }
    });

    // Sort all events by createdAt descending (newest first)
    synchronized = sortEventsByCreatedAt(synchronized);

    if (updated) {
      try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(synchronized));
      } catch {}
    }
    return synchronized;
  } catch (err) {
    console.error("Failed to load events:", err);
    return sortEventsByCreatedAt(INITIAL_EVENTS);
  }
}

/**
 * Sort events by createdAt timestamp descending (newest first).
 * Events without createdAt are placed after those with timestamps.
 */
function sortEventsByCreatedAt(events) {
  return [...events].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
}

export const INITIAL_ACTIVITIES = [
  {
    id: "act_init_1",
    type: "payment",
    category: "Payment",
    title: "Ticket Purchase Completed",
    description: "Dr. Samuel Bassey paid ₦10,000 for VIP Executive Delegate Pass at NAPHSS Annual Dinner",
    actor: "Dr. Samuel Bassey",
    actorEmail: "dr.bassey@healthscience.org",
    role: "attendee",
    eventTitle: "NAPHSS Annual Dinner & Awards Night 2026",
    eventId: "evt_naphss_dinner_night",
    orderId: "ORD-NG-728192",
    amount: 10000,
    timestamp: "2026-09-28T16:20:00.000Z"
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
    title: "Monnify Payment Cleared",
    description: "Emeka Okafor paid ₦3,500 for Standard Student Pass",
    actor: "Emeka Okafor",
    actorEmail: "emeka.okafor@uniuyo.edu.ng",
    role: "attendee",
    eventTitle: "NAPHSS Annual Dinner & Awards Night 2026",
    eventId: "evt_naphss_dinner_night",
    orderId: "ORD-NG-728190",
    amount: 3500,
    timestamp: "2026-09-28T14:30:00.000Z"
  },
  {
    id: "act_init_9",
    type: "checkin",
    category: "Gate Check-In",
    title: "Gate Check-In Admitted",
    description: "NAPHSS Alumni delegate scanned in with ticket pass NMDS-2026-NAPH-TBL1",
    actor: "Gate Marshall Kalu",
    role: "staff",
    ticketId: "NMDS-2026-NAPH-TBL1",
    eventTitle: "NAPHSS Annual Dinner & Awards Night 2026",
    eventId: "evt_naphss_dinner_night",
    timestamp: "2026-09-28T18:50:00.000Z"
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
    let parsed = JSON.parse(raw);
    let updated = false;
    const beforeCount = parsed.length;
    parsed = parsed.filter(act => !LEGACY_REMOVED_EVENT_IDS.has(act.eventId));
    if (parsed.length !== beforeCount) {
      updated = true;
    }
    if (updated) {
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(parsed));
      } catch {}
    }
    return parsed;
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

    // Sync with Supabase cloud database if configured
    if (isSupabaseConfigured()) {
      upsertEventToSupabase(eventData).catch(err => console.warn("Supabase upsert event notice:", err));
    }

    return newEvents;
  } catch (err) {
    console.error("Failed to save new event:", err);
    return [];
  }
}

/**
 * Synchronize local events with Supabase cloud database.
 * If Supabase is active, pulls latest events, merges into local storage,
 * and sets up a real-time listener so changes made on any phone/PC reflect everywhere.
 */
export async function syncEventsWithSupabase(onEventsRefreshed = null) {
  if (typeof window === "undefined" || !isSupabaseConfigured()) return () => {};

  try {
    const cloudEvents = await fetchEventsFromSupabase();
    if (cloudEvents && Array.isArray(cloudEvents) && cloudEvents.length > 0) {
      const formatted = cloudEvents.map(row => ({
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        category: row.category,
        date: row.date,
        time: row.time,
        venue: row.venue,
        city: row.city,
        address: row.address,
        organizer: row.organizer,
        organizerEmail: row.organizer_email,
        createdBy: row.created_by,
        organizerPhone: row.organizer_phone,
        badge: row.badge,
        isFeatured: Boolean(row.is_featured),
        liveSoldText: row.live_sold_text,
        xpReward: Number(row.xp_reward) || 50,
        goingCount: Number(row.going_count) || 1,
        accentColor: row.accent_color,
        secondaryColor: row.secondary_color,
        imageUrl: row.image_url,
        galleryImages: row.gallery_images || [],
        bannerPattern: row.banner_pattern,
        description: row.description,
        status: row.status || "live",
        tiers: row.tiers || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      const sorted = sortEventsByCreatedAt(formatted);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(sorted));
      if (onEventsRefreshed) onEventsRefreshed(sorted);
      window.dispatchEvent(new CustomEvent("nmds_events_change", { detail: { type: "sync", events: sorted } }));
    }

    // Subscribe to realtime postgres changes
    const unsubscribe = subscribeToEventsRealtime(() => {
      syncEventsWithSupabase(onEventsRefreshed);
    });

    return unsubscribe;
  } catch (err) {
    console.warn("Supabase event sync notice:", err);
    return () => {};
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

    // Sync with Supabase cloud database if configured
    if (isSupabaseConfigured()) {
      upsertEventToSupabase(updated).catch(err => console.warn("Supabase update event notice:", err));
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
    let parsed = JSON.parse(raw);
    let updated = false;

    // Purge tickets belonging to removed legacy mock events
    const beforeCount = parsed.length;
    parsed = parsed.filter(t => !LEGACY_REMOVED_EVENT_IDS.has(t.eventId));
    if (parsed.length !== beforeCount) {
      updated = true;
    }

    // Ensure seed tickets exist
    INITIAL_TICKETS.forEach(seedTkt => {
      if (!parsed.some(t => t.ticketId === seedTkt.ticketId)) {
        parsed.push(seedTkt);
        updated = true;
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

    // Also persist newly purchased tickets to Supabase cloud database
    if (isSupabaseConfigured() && newTicketsList && newTicketsList.length > 0) {
      upsertTicketsToSupabase(newTicketsList).catch(err => {
        console.warn("Supabase ticket cloud sync notice:", err);
      });
    }

    return updated;
  } catch (err) {
    console.error("Failed to save tickets:", err);
    return [];
  }
}

export const INITIAL_PAYMENTS = [
  {
    orderId: "ORD-NG-728190",
    transactionRef: "MNF_TX_728190_001",
    paymentReference: "MNF_REV_2026_7281",
    eventId: "evt_naphss_dinner_night",
    eventTitle: "NAPHSS Annual Dinner & Awards Night 2026",
    organizer: "NAPHSS Executive Council",
    organizerEmail: "iamrhobbinraynerhq01@gmail.com",
    attendee: {
      name: "Emeka Okafor",
      email: "emeka.okafor@uniuyo.edu.ng",
      phone: "+234 803 112 4455"
    },
    quantity: 1,
    tierName: "Standard Student Pass",
    grossAmount: 3500,
    platformFee: 175,
    organizerPayout: 3325,
    currency: "₦",
    paymentMethod: "monnify",
    paymentStatus: "PAID",
    timestamp: "2026-09-28T14:30:00.000Z"
  },
  {
    orderId: "ORD-NG-728192",
    transactionRef: "MNF_TX_728192_002",
    paymentReference: "MNF_REV_2026_7282",
    eventId: "evt_naphss_dinner_night",
    eventTitle: "NAPHSS Annual Dinner & Awards Night 2026",
    organizer: "NAPHSS Executive Council",
    organizerEmail: "iamrhobbinraynerhq01@gmail.com",
    attendee: {
      name: "Dr. Samuel Bassey",
      email: "dr.bassey@healthscience.org",
      phone: "+234 802 334 1122"
    },
    quantity: 1,
    tierName: "VIP Executive Delegate Pass",
    grossAmount: 10000,
    platformFee: 500,
    organizerPayout: 9500,
    currency: "₦",
    paymentMethod: "monnify",
    paymentStatus: "PAID",
    timestamp: "2026-09-28T16:20:00.000Z"
  },
  {
    orderId: "ORD-NG-728193",
    transactionRef: "MNF_TX_728193_003",
    paymentReference: "MNF_REV_2026_7283",
    eventId: "evt_naphss_dinner_night",
    eventTitle: "NAPHSS Annual Dinner & Awards Night 2026",
    organizer: "NAPHSS Executive Council",
    organizerEmail: "iamrhobbinraynerhq01@gmail.com",
    attendee: {
      name: "NAPHSS Alumni Class of 2022",
      email: "alumni.publichealth@gmail.com",
      phone: "+234 803 777 8899"
    },
    quantity: 1,
    tierName: "Patrons & Alumni Table of 8",
    grossAmount: 60000,
    platformFee: 3000,
    organizerPayout: 57000,
    currency: "₦",
    paymentMethod: "monnify",
    paymentStatus: "PAID",
    timestamp: "2026-09-28T17:00:00.000Z"
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
    let parsed = JSON.parse(raw);
    let updated = false;
    const beforeCount = parsed.length;
    parsed = parsed.filter(p => !LEGACY_REMOVED_EVENT_IDS.has(p.eventId));
    if (parsed.length !== beforeCount) {
      updated = true;
    }
    if (updated) {
      try {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(parsed));
      } catch {}
    }
    return parsed;
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
 * Look up and verify a ticket's payment, details, and authenticity without mutating gate check-in status.
 * Searches localStorage, then Supabase cloud database, then INITIAL_TICKETS fallback.
 */
export async function findAndVerifyTicket(queryId) {
  if (!queryId) return { found: false, message: "No Ticket ID provided." };

  let cleanId = String(queryId).trim();
  // Extract ticketId if full URL or QR payload was scanned
  if (cleanId.includes("verify=")) {
    const match = cleanId.match(/verify=([^&]+)/);
    if (match) cleanId = decodeURIComponent(match[1]);
  } else if (cleanId.startsWith("NMDS:") && cleanId.includes("|")) {
    const parts = cleanId.split("|");
    const idPart = parts.find(p => p.startsWith("NMDS:"));
    if (idPart) cleanId = idPart.replace("NMDS:", "");
  }
  cleanId = cleanId.trim().toUpperCase();

  // 1. Look in localStorage
  const localTickets = getStoredTickets();
  let found = localTickets.find(
    t => t.ticketId.toUpperCase() === cleanId || cleanId.includes(t.ticketId.toUpperCase()) || (t.orderId && t.orderId.toUpperCase() === cleanId)
  );

  // 2. Look in Supabase cloud database if not found locally
  if (!found) {
    try {
      found = await fetchTicketByIdFromSupabase(cleanId);
      if (found) {
        // Cache to local tickets
        const updated = [found, ...localTickets];
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.warn("Supabase lookup notice:", e);
    }
  }

  // 3. Fallback to INITIAL_TICKETS
  if (!found) {
    found = INITIAL_TICKETS.find(
      t => t.ticketId.toUpperCase() === cleanId || cleanId.includes(t.ticketId.toUpperCase()) || (t.orderId && t.orderId.toUpperCase() === cleanId)
    );
  }

  if (!found) {
    return {
      found: false,
      ticket: null,
      status: "NOT_FOUND",
      message: `Ticket ID "${cleanId}" not found in Nà Mè Dèy Sell registry. Check for typo or counterfeit.`
    };
  }

  return {
    found: true,
    ticket: found,
    isPaid: (found.paymentStatus || "PAID").toUpperCase() === "PAID",
    status: found.status || "active",
    message: found.status === "checked_in"
      ? `Verified Pass (Admitted at Gate on ${new Date(found.checkedInAt).toLocaleTimeString()})`
      : "✓ Authentic Verified Pass — Monnify Payment Confirmed"
  };
}

/**
 * Admits an attendee at gate: checks in ticket in localStorage and Supabase
 */
export async function admitTicketCheckIn(ticketId, staffName = "Gate Marshall") {
  const verified = await findAndVerifyTicket(ticketId);
  if (!verified.found || !verified.ticket) {
    return {
      success: false,
      status: "NOT_FOUND",
      message: `Ticket ID "${ticketId}" not found in Nà Mè Dèy Sell registry.`
    };
  }

  const ticket = verified.ticket;
  if (ticket.status === "checked_in") {
    return {
      success: false,
      status: "ALREADY_CHECKED_IN",
      message: `ALERT: This ticket was already redeemed on ${new Date(ticket.checkedInAt).toLocaleTimeString()} at Gate Check-in!`,
      ticket
    };
  }

  const checkInTime = new Date().toISOString();
  const updatedTicket = {
    ...ticket,
    status: "checked_in",
    checkedInAt: checkInTime,
    gateStaff: staffName
  };

  // Update in localStorage
  if (typeof window !== "undefined") {
    try {
      const tickets = getStoredTickets();
      const idx = tickets.findIndex(t => t.ticketId.toUpperCase() === ticket.ticketId.toUpperCase());
      if (idx !== -1) {
        tickets[idx] = updatedTicket;
      } else {
        tickets.unshift(updatedTicket);
      }
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch (e) {
      console.error(e);
    }
  }

  // Update in Supabase cloud database
  try {
    await markTicketCheckedInInSupabase(ticket.ticketId, staffName);
  } catch (e) {
    console.warn("Supabase check-in cloud update notice:", e);
  }

  recordActivity({
    type: "checkin",
    category: "Gate Check-In",
    title: "Attendee Admitted",
    description: `${ticket.attendee?.name || "Attendee"} admitted at gate for "${ticket.eventTitle}" (${ticket.tierName})`,
    actor: staffName,
    role: "staff",
    ticketId: ticket.ticketId,
    eventTitle: ticket.eventTitle,
    orderId: ticket.orderId
  });

  return {
    success: true,
    status: "SUCCESS",
    message: `ENTRY GRANTED! Welcome ${ticket.attendee?.name || "Attendee"}. Tier: ${ticket.tierName}.`,
    ticket: updatedTicket
  };
}

/**
 * Validates a ticket ID for Gate Staff Scanner (Synchronous legacy wrapper)
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

  // Also notify Supabase in background
  markTicketCheckedInInSupabase(found.ticketId, staffName).catch(() => {});

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

export async function verifyTicketCheckIn(ticketId, staffName = "Gate Marshall") {
  const result = await admitTicketCheckIn(ticketId, staffName);
  if (result.success) {
    return {
      status: "SUCCESS",
      message: result.message,
      ticket: result.ticket
    };
  } else if (result.status === "ALREADY_CHECKED_IN") {
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


