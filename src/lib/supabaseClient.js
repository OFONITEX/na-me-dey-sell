import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("YOUR_SUPABASE_URL") &&
    !supabaseAnonKey.includes("YOUR_SUPABASE_ANON_KEY")
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

/**
 * Fetch all events from Supabase ordered by newest created first
 */
export async function fetchEventsFromSupabase() {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch events notice:", error.message);
      return null;
    }
    return data || [];
  } catch (err) {
    console.warn("Supabase fetch events error:", err);
    return null;
  }
}

/**
 * Upsert (Insert or Update) an event in Supabase
 */
export async function upsertEventToSupabase(eventData) {
  if (!isSupabaseConfigured() || !supabase || !eventData?.id) return null;
  try {
    // Map event model to database columns
    const payload = {
      id: String(eventData.id),
      title: eventData.title || "Untitled Experience",
      subtitle: eventData.subtitle || "",
      category: eventData.category || "Parties / Nightlife",
      date: eventData.date || "",
      time: eventData.time || "",
      venue: eventData.venue || "",
      city: eventData.city || "",
      address: eventData.address || eventData.venue || "",
      organizer: eventData.organizer || "Event Organizer",
      organizer_email: eventData.organizerEmail || eventData.createdBy || "",
      created_by: eventData.createdBy || eventData.organizerEmail || "",
      organizer_phone: eventData.organizerPhone || "",
      badge: eventData.badge || "",
      is_featured: Boolean(eventData.isFeatured),
      live_sold_text: eventData.liveSoldText || "",
      xp_reward: Number(eventData.xpReward) || 50,
      going_count: Number(eventData.goingCount) || 1,
      accent_color: eventData.accentColor || "#D4AF37",
      secondary_color: eventData.secondaryColor || "#10B981",
      image_url: eventData.imageUrl || "",
      gallery_images: eventData.galleryImages || [],
      banner_pattern: eventData.bannerPattern || "",
      description: eventData.description || "",
      status: eventData.status || "live",
      tiers: eventData.tiers || [],
      updated_at: new Date().toISOString()
    };

    if (eventData.createdAt) {
      payload.created_at = new Date(eventData.createdAt).toISOString();
    }

    const { data, error } = await supabase
      .from("events")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.warn("Supabase upsert event notice:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Supabase upsert event error:", err);
    return null;
  }
}

/**
 * Subscribe to real-time event updates across all connected devices
 */
export function subscribeToEventsRealtime(onEventChange) {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  try {
    const channel = supabase
      .channel("realtime:events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload) => {
          if (onEventChange) onEventChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn("Failed to subscribe to realtime events:", err);
    return () => {};
  }
}

/**
 * Submit a bank transfer payment for admin verification
 */
export async function submitBankTransferToSupabase(transferData) {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const payload = {
      order_id: transferData.orderId,
      reference_code: transferData.referenceCode,
      event_id: transferData.eventId,
      event_title: transferData.eventTitle,
      attendee_name: transferData.attendeeName,
      attendee_email: transferData.attendeeEmail,
      attendee_phone: transferData.attendeePhone,
      sender_name: transferData.senderName,
      sender_bank: transferData.senderBank || "Opay",
      amount: Number(transferData.amount),
      receipt_url: transferData.receiptUrl || null,
      status: "pending",
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("bank_transfers")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Supabase submit bank transfer notice:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Supabase submit bank transfer error:", err);
    return null;
  }
}

/**
 * Maps Supabase SQL row to application Ticket object
 */
export function mapSupabaseTicketRow(row) {
  if (!row) return null;
  return {
    ticketId: row.ticket_id,
    orderId: row.order_id,
    eventId: row.event_id,
    eventTitle: row.event_title,
    tierId: row.tier_id,
    tierName: row.tier_name,
    tierPrice: Number(row.tier_price || 0),
    currency: row.currency || "₦",
    attendee: {
      name: row.attendee_name,
      email: row.attendee_email,
      phone: row.attendee_phone || ""
    },
    paymentMethod: row.payment_method || "monnify",
    paymentReference: row.payment_reference || "",
    paymentStatus: row.payment_status || "PAID",
    seatNumber: row.seat_number || "STANDARD-01",
    status: row.status || "active",
    checkedInAt: row.checked_in_at || null,
    gateStaff: row.gate_staff || null,
    createdAt: row.created_at
  };
}

const MOCK_SEED_TICKET_IDS = new Set([
  "NMDS-2026-NAPH-1A8K",
  "NMDS-2026-NAPH-9X2P",
  "NMDS-2026-NAPH-VIP3",
  "NMDS-2026-NAPH-TBL1"
]);

/**
 * Fetch all tickets from Supabase cloud database
 */
export async function fetchTicketsFromSupabase() {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .neq("status", "purged_demo")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch tickets notice:", error.message);
      return null;
    }
    return (data || [])
      .map(mapSupabaseTicketRow)
      .filter(t => t && !MOCK_SEED_TICKET_IDS.has(t.ticketId) && t.status !== "purged_demo");
  } catch (err) {
    console.warn("Supabase fetch tickets error:", err);
    return null;
  }
}

/**
 * Fetch a single ticket by Ticket ID or Order ID from Supabase
 */
export async function fetchTicketByIdFromSupabase(queryId) {
  if (!isSupabaseConfigured() || !supabase || !queryId) return null;
  try {
    const clean = String(queryId).trim().toUpperCase();
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .or(`ticket_id.ilike.%${clean}%,order_id.ilike.%${clean}%`)
      .limit(1);

    if (error) {
      console.warn("Supabase ticket lookup notice:", error.message);
      return null;
    }
    if (data && data.length > 0) {
      return mapSupabaseTicketRow(data[0]);
    }
    return null;
  } catch (err) {
    console.warn("Supabase ticket lookup error:", err);
    return null;
  }
}

/**
 * Upsert one or more tickets to Supabase cloud database
 */
export async function upsertTicketsToSupabase(ticketsList) {
  if (!isSupabaseConfigured() || !supabase || !ticketsList || ticketsList.length === 0) return null;
  try {
    const payloads = ticketsList.map(t => ({
      ticket_id: t.ticketId,
      order_id: t.orderId,
      event_id: t.eventId,
      event_title: t.eventTitle,
      tier_id: t.tierId,
      tier_name: t.tierName,
      tier_price: Number(t.tierPrice || 0),
      currency: t.currency || "₦",
      attendee_name: t.attendee?.name || t.attendeeName || "Attendee",
      attendee_email: t.attendee?.email || t.attendeeEmail || "",
      attendee_phone: t.attendee?.phone || t.attendeePhone || "",
      payment_method: t.paymentMethod || "monnify",
      payment_reference: t.paymentReference || "",
      payment_status: t.paymentStatus || "PAID",
      seat_number: t.seatNumber || "",
      status: t.status || "active",
      checked_in_at: t.checkedInAt || null,
      gate_staff: t.gateStaff || null
    }));

    const { data, error } = await supabase
      .from("tickets")
      .upsert(payloads, { onConflict: "ticket_id" })
      .select();

    if (error) {
      console.warn("Supabase upsert tickets notice:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn("Supabase upsert tickets error:", err);
    return null;
  }
}

/**
 * Updates ticket check-in status in Supabase
 */
export async function markTicketCheckedInInSupabase(ticketId, staffName = "Gate Marshall") {
  if (!isSupabaseConfigured() || !supabase || !ticketId) return null;
  try {
    const checkInTime = new Date().toISOString();
    const { data, error } = await supabase
      .from("tickets")
      .update({
        status: "checked_in",
        checked_in_at: checkInTime,
        gate_staff: staffName
      })
      .eq("ticket_id", ticketId)
      .select()
      .single();

    if (error) {
      console.warn("Supabase check-in notice:", error.message);
      return null;
    }
    return mapSupabaseTicketRow(data);
  } catch (err) {
    console.warn("Supabase check-in error:", err);
    return null;
  }
}
