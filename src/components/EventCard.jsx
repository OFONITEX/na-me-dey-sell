import { useState } from "react";
import { CalendarIcon, MapPinIcon, TicketIcon, ArrowRightIcon, ClockIcon, FlameIcon, SparklesIcon, CheckIcon } from "./Icons";
import { formatNaira } from "../lib/ticketService";
import { canEditEvent } from "../lib/authService";

export default function EventCard({ event, currentUser, onSelect, onEditEvent }) {
  const [isGoing, setIsGoing] = useState(false);
  const [goingCount, setGoingCount] = useState(event.goingCount || 48);

  const userCanEdit = canEditEvent(event, currentUser);

  const handleGoingToggle = (e) => {
    e.stopPropagation();
    if (isGoing) {
      setIsGoing(false);
      setGoingCount(prev => Math.max(1, prev - 1));
    } else {
      setIsGoing(true);
      setGoingCount(prev => prev + 1);
    }
  };

  const lowestPrice = event?.tiers?.length ? Math.min(...event.tiers.map(t => t.price)) : 0;

  return (
    <div className="rx-creative-card" onClick={() => onSelect(event)}>
      {/* Top Banner Image Section */}
      <div className="rx-card-top">
        <img
          src={event.imageUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80"}
          alt={event.title}
          className="rx-card-img"
          loading="lazy"
        />
        <div className="rx-card-gradient-overlay" />

        {/* Live Tickets Sold Activity Signal */}
        <div className="rx-live-badge">
          <TicketIcon size={12} className="rx-live-badge-icon" />
          <span>{event.liveSoldText || "Fast selling event"}</span>
        </div>

        {/* Organizer Edit Shortcut Chip */}
        {userCanEdit && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <div
              style={{
                background: "rgba(10, 10, 14, 0.88)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(212, 175, 55, 0.6)",
                color: "#F5D061",
                borderRadius: "20px",
                padding: "3px 8px",
                fontSize: "10px",
                fontWeight: "900",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.6)"
              }}
            >
              <span>👑 Your Event</span>
            </div>
            {onEditEvent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditEvent(event);
                }}
                style={{
                  background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                  color: "#070709",
                  border: "none",
                  borderRadius: "20px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: "900",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.6), 0 0 10px rgba(212,175,55,0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                title="Edit your created event"
              >
                <span>✏️ Edit</span>
              </button>
            )}
          </div>
        )}

        {/* Category Badge */}
        <div className="rx-category-badge">
          {event.category}
        </div>

        {/* Venue & Time Overlay */}
        <div className="rx-card-venue-overlay">
          <div className="rx-venue-loc">
            <MapPinIcon size={13} style={{ color: "var(--warm-amber)" }} />
            <span>{event.venue}, {event.city.split(",")[0]}</span>
          </div>
          <div className="rx-venue-time">
            <ClockIcon size={13} style={{ color: "var(--warm-amber)" }} />
            <span>{event.time.split("-")[0].trim()}</span>
          </div>
        </div>
      </div>

      {/* Rigitix Signature Perforated Notches */}
      <div className="rx-ticket-notches">
        <div className="rx-notch-left" />
        <div className="rx-perforated-line" />
        <div className="rx-notch-right" />
      </div>

      {/* Card Body */}
      <div className="rx-card-body">
        {/* Meta row: Date & XP Rewards Badge */}
        <div className="rx-card-meta-row">
          <div className="rx-event-date">
            <CalendarIcon size={14} />
            <span>{event.date}</span>
          </div>

          <div className="rx-xp-badge">
            <SparklesIcon size={12} />
            <span>+{event.xpReward || 50} XP</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="rx-event-title" title={event.title}>
          {event.title}
        </h3>
        <p className="rx-event-subtitle">
          {event.subtitle}
        </p>

        {/* Rigitix-style RSVP & Social Proof */}
        <div className="rx-social-proof-row">
          <button
            type="button"
            className={`rx-rsvp-btn ${isGoing ? "attending" : ""}`}
            onClick={handleGoingToggle}
          >
            {isGoing ? <CheckIcon size={13} /> : <FlameIcon size={13} />}
            <span>{isGoing ? "Going ✓" : "Going?"}</span>
          </button>

          <div className="rx-going-count-label">
            <FlameIcon size={13} />
            <span>{goingCount} attending</span>
          </div>
        </div>

        {/* Price & Split Button Footer */}
        <div className="rx-card-footer">
          <div className="rx-price-tag">
            <span className="rx-price-prefix">From</span>
            <span className="rx-price-amount">{formatNaira(lowestPrice, event.currency || event.tiers?.[0]?.currency || "₦")}</span>
          </div>

          {userCanEdit ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {onEditEvent && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEvent(event);
                  }}
                  style={{
                    background: "rgba(212, 175, 55, 0.15)",
                    border: "1px solid rgba(212, 175, 55, 0.5)",
                    color: "#F5D061",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                  title="Edit event details & ticket tiers"
                >
                  <span>✏️ Edit</span>
                </button>
              )}
              <div
                className="rx-btn rx-btn-primary rx-btn-sm"
                style={{
                  background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                  color: "#070709",
                  fontWeight: "900"
                }}
                title="Open Event Admin Studio"
              >
                <span className="rx-btn-text">👑 Admin Hub</span>
                <span className="rx-btn-icon">
                  <ArrowRightIcon size={14} />
                </span>
              </div>
            </div>
          ) : (
            <div className="rx-btn rx-btn-primary rx-btn-sm">
              <span className="rx-btn-text">Get Ticket</span>
              <span className="rx-btn-icon">
                <ArrowRightIcon size={14} />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
