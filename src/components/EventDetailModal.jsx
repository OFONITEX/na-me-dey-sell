"use client";

import { useState } from "react";
import { CloseIcon, CalendarIcon, ClockIcon, MapPinIcon, CheckIcon, ShieldCheckIcon, TicketIcon, ArrowRightIcon, SparklesIcon } from "./Icons";
import { formatNaira } from "../lib/ticketService";
import { canEditEvent } from "../lib/authService";

export default function EventDetailModal({
  event,
  currentUser,
  onClose,
  onProceedToCheckout,
  onEditEvent
}) {
  const safeTiers = event?.tiers?.length ? event.tiers : [{ id: "tier_default", name: "General Admission", price: 0, currency: "₦", capacity: 100, soldCount: 0, description: "Standard entry", perks: ["General access"] }];
  const [selectedTierId, setSelectedTierId] = useState(safeTiers[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(event?.imageUrl || "");

  if (!event) return null;

  const userCanEdit = canEditEvent(event, currentUser);
  const selectedTier = safeTiers.find(t => t.id === selectedTierId) || safeTiers[0];
  const remaining = Math.max(0, (selectedTier?.capacity || 100) - (selectedTier?.soldCount || 0));
  const subtotal = selectedTier ? selectedTier.price * quantity : 0;

  const currentHeroImage = activeImage || event.imageUrl;

  const handleProceed = () => {
    onProceedToCheckout({
      event,
      tier: selectedTier,
      quantity,
      subtotal
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: "720px" }} onClick={e => e.stopPropagation()}>
        {/* Header Hero Banner with image */}
        <div
          style={{
            position: "relative",
            minHeight: "220px",
            background: `linear-gradient(to bottom, rgba(7,7,9,0.35), #0E0E14), url(${currentHeroImage}) center/cover no-repeat`,
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            transition: "background 0.3s ease"
          }}
        >
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <CloseIcon size={18} />
          </button>

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
              <span style={{ background: "rgba(212, 175, 55, 0.2)", border: "1px solid var(--brand-gold)", color: "var(--brand-gold)", fontSize: "11px", fontWeight: "800", padding: "4px 10px", borderRadius: "4px", textTransform: "uppercase" }}>
                {event.category}
              </span>
              {event.badge && (
                <span style={{ background: "rgba(245, 208, 97, 0.15)", border: "1px solid var(--brand-gold)", color: "var(--brand-gold)", fontSize: "11px", fontWeight: "800", padding: "3px 8px", borderRadius: "4px" }}>
                  {event.badge}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#fff", marginBottom: "6px" }}>{event.title}</h2>
            <div style={{ fontSize: "13px", color: "var(--brand-gold-bright)", fontWeight: "600" }}>
              Organized by <strong style={{ color: "#fff" }}>{event.organizer}</strong>
            </div>

            {/* Multi-flyer gallery thumbnails if event has multiple flyers */}
            {event.galleryImages && event.galleryImages.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                <span style={{ fontSize: "10px", color: "#fff", fontWeight: "700", textTransform: "uppercase", background: "rgba(0,0,0,0.6)", padding: "2px 6px", borderRadius: "3px" }}>
                  Flyers ({event.galleryImages.length}):
                </span>
                {event.galleryImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      border: currentHeroImage === imgUrl ? "2px solid var(--brand-gold)" : "1px solid rgba(255,255,255,0.3)",
                      padding: 0,
                      background: "#070709",
                      cursor: "pointer",
                      boxShadow: currentHeroImage === imgUrl ? "0 0 8px rgba(212,175,55,0.6)" : "none"
                    }}
                  >
                    <img src={imgUrl} alt={`Flyer ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Organizer Quick-Action Banner */}
        {userCanEdit && (
          <div
            style={{
              padding: "10px 24px",
              background: "linear-gradient(90deg, rgba(212, 175, 55, 0.18) 0%, rgba(14, 14, 20, 0.95) 100%)",
              borderBottom: "1px solid rgba(212, 175, 55, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <SparklesIcon size={16} style={{ color: "#F5D061" }} />
              <div>
                <span style={{ fontSize: "12px", color: "#F5D061", fontWeight: "800" }}>
                  👑 You have Organizer Access to this Event
                </span>
                <span style={{ fontSize: "11px", color: "#E2D9BC", marginLeft: "6px" }}>
                  ({event.organizer || "Created by you"})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEditEvent) onEditEvent(event);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                border: "none",
                borderRadius: "6px",
                color: "#070709",
                fontSize: "12px",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(212, 175, 55, 0.35)"
              }}
            >
              <span>✏️ Edit Event &amp; Tiers</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(90vh - 300px)", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Schedule & Venue row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div style={{ background: "#0E0E14", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "8px", padding: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
              <CalendarIcon size={18} style={{ color: "var(--brand-gold)" }} />
              <div>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase" }}>Date</div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{event.date}</div>
              </div>
            </div>

            <div style={{ background: "#0E0E14", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "8px", padding: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
              <ClockIcon size={18} style={{ color: "var(--brand-gold)" }} />
              <div>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase" }}>Time</div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{event.time}</div>
              </div>
            </div>

            <div style={{ background: "#0E0E14", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "8px", padding: "12px", display: "flex", gap: "10px", alignItems: "center", gridColumn: "1 / -1" }}>
              <MapPinIcon size={18} style={{ color: "var(--brand-gold)" }} />
              <div>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase" }}>Venue & City</div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{event.venue} — {event.address}, {event.city}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              About This Experience
            </h4>
            <p style={{ fontSize: "13px", lineHeight: "1.7", color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>
              {event.description}
            </p>
          </div>

          {/* Tier Selection */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              Select Ticket Tier
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {safeTiers.map(tier => {
                const isSelected = selectedTierId === tier.id;
                const tierRemaining = Math.max(0, (tier.capacity || 100) - (tier.soldCount || 0));

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    style={{
                      border: isSelected ? "2px solid var(--brand-gold)" : "1px solid rgba(212, 175, 55, 0.2)",
                      background: isSelected ? "rgba(212, 175, 55, 0.15)" : "#0E0E14",
                      borderRadius: "10px",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          border: isSelected ? "5px solid var(--brand-gold)" : "2px solid rgba(255,255,255,0.4)",
                          background: "#fff"
                        }} />
                        <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff" }}>{tier.name}</span>
                      </div>
                      <span style={{ fontFamily: "Sora", fontSize: "1.2rem", fontWeight: "900", color: "var(--brand-gold)" }}>
                        {formatNaira(tier.price, tier.currency || event.currency || "₦")}
                      </span>
                    </div>

                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "28px", marginBottom: "8px" }}>
                      {tier.description}
                    </p>

                    {tier.perks && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginLeft: "28px" }}>
                        {tier.perks.map((p, idx) => (
                          <span key={idx} style={{ fontSize: "10px", color: "var(--brand-gold-bright)", background: "rgba(212, 175, 55, 0.15)", padding: "2px 8px", borderRadius: "4px" }}>
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer with Quantity Stepper & Proceed Button */}
        <div style={{ padding: "18px 24px", background: "#0E0E14", borderTop: "1px solid rgba(212, 175, 55, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "var(--text-dim)" }}>
              Total ({quantity} {quantity === 1 ? "ticket" : "tickets"})
            </div>
            <div style={{ fontFamily: "Sora", fontSize: "1.4rem", fontWeight: "900", color: "var(--brand-gold)" }}>
              {formatNaira(subtotal, selectedTier?.currency || event.currency || "₦")}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", background: "#070709", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "6px" }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ background: "transparent", border: "none", color: "#fff", padding: "8px 12px", cursor: "pointer", fontSize: "16px" }}
              >
                -
              </button>
              <span style={{ fontSize: "13px", fontWeight: "800", padding: "0 8px" }}>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                style={{ background: "transparent", border: "none", color: "#fff", padding: "8px 12px", cursor: "pointer", fontSize: "16px" }}
              >
                +
              </button>
            </div>

            {userCanEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onEditEvent) onEditEvent(event);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  background: "rgba(212, 175, 55, 0.12)",
                  border: "1px solid rgba(212, 175, 55, 0.45)",
                  borderRadius: "8px",
                  color: "#F5D061",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                <span>✏️ Edit Event</span>
              </button>
            )}

            <button className="rx-btn rx-btn-gold" onClick={handleProceed}>
              <span className="rx-btn-text">Proceed to Checkout</span>
              <span className="rx-btn-icon">
                <ArrowRightIcon size={14} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
