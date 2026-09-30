import Home from "../page";
import { INITIAL_EVENTS } from "../../data/mockEvents";
import { getEventSlug } from "../../lib/ticketService";

export function generateStaticParams() {
  const defaultSlugs = [
    { slug: "naphss-dinner-night" },
    { slug: "vibes-barn" }
  ];

  const eventSlugs = INITIAL_EVENTS.map(event => ({
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

  const event = INITIAL_EVENTS.find(e => getEventSlug(e) === slug || String(e.id).includes(slug));
  if (event) {
    return {
      title: `${event.title} | Nà Mè Dèy Sell Tickets`,
      description: `${event.subtitle || event.description?.slice(0, 160) || "Get official tickets online"} at ${event.venue}, ${event.city}.`,
      openGraph: {
        title: `${event.title} - Official Tickets`,
        description: `Get your passes for ${event.title} on Nà Mè Dèy Sell.`,
        images: event.imageUrl ? [event.imageUrl] : []
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
