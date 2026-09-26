"use client";

import { useState } from "react";
import { CloseIcon, CalendarIcon, ClockIcon, MapPinIcon, CheckIcon, ShieldCheckIcon, TicketIcon, ArrowRightIcon, SparklesIcon } from "./Icons";
import { formatNaira } from "../lib/ticketService";

export default function EventDetailModal({ event, onClose, onProceedToCheckout }) {
  const [selectedTierId, setSelectedTierId] = useState(event?.tiers[0]?.id || "");
  const [quantity, setQuantity] = useState(1);

  if (!event) return null;

  const selectedTier = event.tiers.find(t => t.id === selectedTierId) || event.tiers[0];
  const remaining = Math.max(0, (selectedTier?.capacity || 100) - (selectedTier?.soldCount || 0));
  const subtotal = selectedTier ? selectedTier.price * quantity : 0;

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
            background: `linear-gradient(to bottom, rgba(17,8,26,0.3), #1a0e28), url(${event.imageUrl}) center/cover no-repeat`,
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end"
          }}
        >
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <CloseIcon size={18} />
          </button>

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
              <span style={{ background: "var(--primary-purple)", color: "#fff", fontSize: "11px", fontWeight: "800", padding: "4px 10px", borderRadius: "4px", textTransform: "uppercase" }}>
                {event.category}
              </span>
              {event.badge && (
                <span style={{ background: "rgba(255, 138, 101, 0.2)", border: "1px solid var(--warm-amber)", color: "var(--warm-amber)", fontSize: "11px", fontWeight: "800", padding: "3px 8px", borderRadius: "4px" }}>
                  {event.badge}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#fff", marginBottom: "6px" }}>{event.title}</h2>
            <div style={{ fontSize: "13px", color: "var(--brand-lavender)", fontWeight: "600" }}>
              Organized by <strong style={{ color: "#fff" }}>{event.organizer}</strong>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(90vh - 300px)", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Schedule & Venue row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div style={{ background: "rgba(17,8,26,0.6)", border: "1px solid rgba(217, 192, 235, 0.15)", borderRadius: "8px", padding: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
              <CalendarIcon size={18} style={{ color: "var(--warm-amber)" }} />
              <div>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase" }}>Date</div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{event.date}</div>
              </div>
            </div>

            <div style={{ background: "rgba(17,8,26,0.6)", border: "1px solid rgba(217, 192, 235, 0.15)", borderRadius: "8px", padding: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
              <ClockIcon size={18} style={{ color: "var(--warm-amber)" }} />
              <div>
                <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase" }}>Time</div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{event.time}</div>
              </div>
            </div>

            <div style={{ background: "rgba(17,8,26,0.6)", border: "1px solid rgba(217, 192, 235, 0.15)", borderRadius: "8px", padding: "12px", display: "flex", gap: "10px", alignItems: "center", gridColumn: "1 / -1" }}>
              <MapPinIcon size={18} style={{ color: "var(--warm-amber)" }} />
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
            <p style={{ fontSize: "13px", lineHeight: "1.7", color: "var(--text-muted)" }}>
              {event.description}
            </p>
          </div>

          {/* Tier Selection */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              Select Ticket Tier
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {event.tiers.map(tier => {
                const isSelected = selectedTierId === tier.id;
                const tierRemaining = Math.max(0, (tier.capacity || 100) - (tier.soldCount || 0));

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    style={{
                      border: isSelected ? "2px solid var(--brand-gold)" : "1px solid rgba(217, 192, 235, 0.15)",
                      background: isSelected ? "rgba(82, 38, 114, 0.35)" : "rgba(17,8,26,0.5)",
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
                          <span key={idx} style={{ fontSize: "10px", color: "var(--brand-lavender)", background: "rgba(217,192,235,0.1)", padding: "2px 8px", borderRadius: "4px" }}>
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
        <div style={{ padding: "18px 24px", background: "#11081a", borderTop: "1px solid rgba(217, 192, 235, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "var(--text-dim)" }}>
              Total ({quantity} {quantity === 1 ? "ticket" : "tickets"})
            </div>
            <div style={{ fontFamily: "Sora", fontSize: "1.4rem", fontWeight: "900", color: "var(--brand-gold)" }}>
              {formatNaira(subtotal, selectedTierObj?.currency || event.currency || "₦")}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px" }}>
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
