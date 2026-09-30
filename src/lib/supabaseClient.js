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
