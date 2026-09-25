import { INITIAL_EVENTS } from "../data/mockEvents";

const STORAGE_KEYS = {
  EVENTS: "nmds_events_v2",
  TICKETS: "nmds_tickets_v2",
  RSVP: "nmds_rsvp_v2"
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

export function formatNaira(amount) {
  return "₦" + Number(amount).toLocaleString();
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
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load events:", err);
    return INITIAL_EVENTS;
  }
}

export function saveNewEvent(eventData) {
  if (typeof window === "undefined") return eventData;
  try {
    const events = getStoredEvents();
    const newEvents = [eventData, ...events];
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(newEvents));
    return newEvents;
  } catch (err) {
    console.error("Failed to save new event:", err);
    return [];
  }
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
    status: "active",
    checkedInAt: null,
    gateStaff: null
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
    accentColor: "#8236CF",
    bannerPattern: "linear-gradient(135deg, #11081a 0%, #3b1464 50%, #06b6d4 100%)",
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
    return JSON.parse(raw);
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
      currency: "₦",
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

  return {
    orderId,
    tickets: createdTickets,
    paymentReference,
    transactionReference,
    totalPaid: (tier.price * quantity) - promoDiscount
  };
}

/**
 * Validates a ticket ID for Gate Staff Scanner
 */
export function validateTicket(ticketId) {
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
  const updatedTickets = tickets.map(t => {
    if (t.ticketId === found.ticketId) {
      return {
        ...t,
        status: "checked_in",
        checkedInAt: new Date().toISOString(),
        gateStaff: "Gate Marshall #1"
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

  return {
    success: true,
    status: "valid",
    message: `ENTRY GRANTED! Welcome ${found.attendee.name}. Tier: ${found.tierName}.`,
    ticket: {
      ...found,
      status: "checked_in",
      checkedInAt: new Date().toISOString()
    }
  };
}

export function verifyTicketCheckIn(ticketId, staffName = "Gate Marshall") {
  const result = validateTicket(ticketId);
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

