import Home from "../page";
import { INITIAL_EVENTS } from "../../data/mockEvents";
import { getEventSlug } from "../../lib/ticketService";
import { fetchEventsFromSupabase } from "../../lib/supabaseClient";

export async function generateStaticParams() {
  const defaultSlugs = [
    { slug: "naphss-dinner-night" },
    { slug: "scsn-dinner-and-award-night-2026" }
  ];

  let supabaseEvents = [];
  try {
    const data = await fetchEventsFromSupabase();
    if (data && Array.isArray(data)) {
      supabaseEvents = data.map(row => ({
        ...row,
        id: row.id,
        title: row.title,
        slug: row.slug || ""
      }));
    }
  } catch (err) {
    console.warn("Could not query Supabase events for static params:", err);
  }

  const allEvents = [...INITIAL_EVENTS, ...supabaseEvents];
  const eventSlugs = allEvents.map(event => ({
    slug: getEventSlug(event)
  }));

  const all = [...defaultSlugs, ...eventSlugs];
  const seen = new Set();
  return all.filter(item => {
    if (!item.slug || seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) return { title: "Nà Mè Dèy Sell" };

  let allEvents = INITIAL_EVENTS;
  try {
    const data = await fetchEventsFromSupabase();
    if (data && Array.isArray(data)) {
      allEvents = [...INITIAL_EVENTS, ...data];
    }
  } catch {}

  const event = allEvents.find(e => getEventSlug(e) === slug || String(e.id).includes(slug));
  if (event) {
    return {
      title: `${event.title} | Nà Mè Dèy Sell Tickets`,
      description: `${event.subtitle || event.description?.slice(0, 160) || "Get official tickets online"} at ${event.venue}, ${event.city}.`,
      openGraph: {
        title: `${event.title} - Official Tickets`,
        description: `Get your passes for ${event.title} on Nà Mè Dèy Sell.`,
        images: event.imageUrl || event.image_url ? [event.imageUrl || event.image_url] : []
      }
    };
  }

  const formattedName = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return {
    title: `${formattedName} | Tickets on Nà Mè Dèy Sell`,
    description: `Official event ticket booking on Nà Mè Dèy Sell.`
  };
}

export default function EventPage() {
  return <Home />;
}
