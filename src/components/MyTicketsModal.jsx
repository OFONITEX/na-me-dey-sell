"use client";

import { useState } from "react";
import { CloseIcon, SearchIcon, TicketIcon, CalendarIcon, MapPinIcon, QrCodeIcon, SparklesIcon } from "./Icons";
import { formatNaira } from "../lib/ticketService";

export default function MyTicketsModal({ tickets, onClose, onSelectTicket }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredTickets = tickets.filter(t => {
    if (filter === "active" && t.status !== "active") return false;
    if (filter === "checked_in" && t.status !== "checked_in") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.ticketId.toLowerCase().includes(q) ||
        t.orderId.toLowerCase().includes(q) ||
        t.eventTitle.toLowerCase().includes(q) ||
        t.attendee.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: "680px" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px", background: "#1a0e28", borderBottom: "1px solid rgba(217, 192, 235, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(82, 38, 114, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-gold)" }}>
              <TicketIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#fff" }}>My Pass Wallet</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {tickets.length} official Nà Mè Dèy Sell pass{tickets.length === 1 ? "" : "es"} stored on device
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Filter and search bar */}
        <div style={{ padding: "16px 24px", background: "#11081a", borderBottom: "1px solid rgba(217,192,235,0.1)", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(217,192,235,0.15)", borderRadius: "6px", padding: "8px 12px", gap: "8px" }}>
            <SearchIcon size={15} style={{ color: "var(--text-dim)" }} />
            <input
              type="text"
              placeholder="Search by NMDS ID or Event..."
              style={{ background: "transparent", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "13px" }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              style={{
                background: filter === "all" ? "var(--primary-purple)" : "rgba(255,255,255,0.06)",
                border: filter === "all" ? "1px solid var(--brand-lavender)" : "1px solid rgba(217,192,235,0.12)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer"
              }}
              onClick={() => setFilter("all")}
            >
              All ({tickets.length})
            </button>
            <button
              style={{
                background: filter === "active" ? "var(--primary-purple)" : "rgba(255,255,255,0.06)",
                border: filter === "active" ? "1px solid var(--brand-lavender)" : "1px solid rgba(217,192,235,0.12)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer"
              }}
              onClick={() => setFilter("active")}
            >
              Active ({tickets.filter(t => t.status === "active").length})
            </button>
            <button
              style={{
                background: filter === "checked_in" ? "var(--primary-purple)" : "rgba(255,255,255,0.06)",
                border: filter === "checked_in" ? "1px solid var(--brand-lavender)" : "1px solid rgba(217,192,235,0.12)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer"
              }}
              onClick={() => setFilter("checked_in")}
            >
              Admitted ({tickets.filter(t => t.status === "checked_in").length})
            </button>
          </div>
        </div>

        {/* Tickets List */}
        <div style={{ padding: "20px 24px", overflowY: "auto", maxHeight: "calc(80vh - 160px)", display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredTickets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              <TicketIcon size={40} style={{ margin: "0 auto 12px", color: "var(--text-dim)" }} />
              <h4 style={{ fontSize: "16px", color: "#fff", marginBottom: "6px" }}>No passes found</h4>
              <p style={{ fontSize: "13px" }}>
                {tickets.length === 0
                  ? "You haven't booked any passes yet. Choose an event and experience Nà Mè Dèy Sell!"
                  : "No tickets match your search criteria."}
              </p>
            </div>
          ) : (
            filteredTickets.map(t => {
              const isCheckedIn = t.status === "checked_in";
              return (
                <div
                  key={t.ticketId}
                  onClick={() => onSelectTicket(t)}
                  style={{
                    background: "rgba(17,8,26,0.6)",
                    border: "1px solid rgba(217,192,235,0.18)",
                    borderRadius: "10px",
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--brand-gold)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(217,192,235,0.18)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "var(--brand-gold)", fontWeight: "700" }}>
                        {t.ticketId}
                      </span>
                      <span style={{
                        fontSize: "9px",
                        fontWeight: "800",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        textTransform: "uppercase",
                        background: isCheckedIn ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                        color: isCheckedIn ? "#f87171" : "#10b981",
                        border: isCheckedIn ? "1px solid #ef4444" : "1px solid #10b981"
                      }}>
                        {isCheckedIn ? "Redeemed" : "Valid For Entry"}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>
                      {t.eventTitle}
                    </h4>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                      <span>📅 {t.eventDate}</span>
                      <span>📍 {t.city}</span>
                      <span>🏷️ {t.tierName} ({formatNaira(t.tierPrice, t.currency || "₦")})</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--brand-gold)", fontSize: "12px", fontWeight: "700" }}>
                    <QrCodeIcon size={22} />
                    <span>View Pass ›</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
