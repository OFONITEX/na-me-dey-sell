"use client";

import { useState } from "react";
import { QRCodeSVG } from "../lib/qrCodeGenerator";
import {
  CloseIcon,
  CopyIcon,
  CheckIcon,
  PrinterIcon,
  DownloadIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  ShieldCheckIcon,
  SparklesIcon
} from "./Icons";
import { formatNaira } from "../lib/ticketService";

export default function DigitalTicketPass({ tickets, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [copied, setCopied] = useState(false);

  if (!tickets || tickets.length === 0) return null;

  const ticket = tickets[currentIndex] || tickets[0];
  const totalTickets = tickets.length;

  const handleCopyTicketId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ticket.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadICS = () => {
    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Na Me Dey Sell//Event Pass//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${ticket.eventTitle}`,
      `DESCRIPTION:Your Nà Mè Dèy Sell Ticket ID is ${ticket.ticketId}. Tier: ${ticket.tierName}`,
      `LOCATION:${ticket.venue}, ${ticket.address || ""}, ${ticket.city}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${ticket.ticketId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isCheckedIn = ticket.status === "checked_in";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: "520px" }} onClick={e => e.stopPropagation()}>
        {/* Navigation if multiple tickets in order */}
        {totalTickets > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "#0E0E14", borderBottom: "1px solid rgba(212, 175, 55, 0.2)" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700" }}>
              Pass {currentIndex + 1} of {totalTickets} in this booking
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                ‹ Prev
              </button>
              <button
                type="button"
                style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
                onClick={() => setCurrentIndex(Math.min(totalTickets - 1, currentIndex + 1))}
                disabled={currentIndex === totalTickets - 1}
              >
                Next ›
              </button>
            </div>
          </div>
        )}

        <button className="modal-close-btn" onClick={onClose} aria-label="Close pass">
          <CloseIcon size={18} />
        </button>

        {/* Printable Pass Container */}
        <div className="digital-pass-card" id="printable-ticket" style={{ overflowY: "auto", maxHeight: "calc(88vh - 80px)" }}>
          {/* Top Banner section */}
          <div className="pass-header">
            <div className="pass-header-top">
              <div className="pass-brand-stamp">
                <img src="/logo-gold.png" alt="Nà Mè Dèy Sell" style={{ height: "22px", objectFit: "contain" }} />
                <span>Verified Event Pass</span>
              </div>
              <div className={`pass-status-chip ${isCheckedIn ? "chip-checked-in" : "chip-active"}`}>
                {isCheckedIn ? "✓ ADMITTED" : "● ACTIVE FOR ENTRY"}
              </div>
            </div>

            <h2 className="pass-event-title">{ticket.eventTitle}</h2>
            <div className="pass-event-org">Presented by {ticket.organizer}</div>
          </div>

          {/* Main Info Section */}
          <div className="pass-body">
            {/* Ticket ID Highlight Bar */}
            <div className="ticket-id-highlight-box">
              <div className="ticket-id-meta">
                <span className="ticket-id-label">OFFICIAL PASS ID</span>
                <span className="ticket-id-number">{ticket.ticketId}</span>
              </div>
              <button
                type="button"
                className="btn-copy-id"
                onClick={handleCopyTicketId}
                title="Copy Ticket ID"
              >
                {copied ? <CheckIcon size={14} style={{ color: "var(--emerald-green)" }} /> : <CopyIcon size={14} />}
                <span>{copied ? "Copied!" : "Copy ID"}</span>
              </button>
            </div>

            {/* Grid of details */}
            <div className="pass-details-grid">
              <div className="detail-cell">
                <span className="cell-label">ATTENDEE</span>
                <span className="cell-value" style={{ color: "#fff", fontWeight: "800" }}>{ticket.attendee.name}</span>
                <span className="cell-sub">{ticket.attendee.email}</span>
              </div>

              <div className="detail-cell">
                <span className="cell-label">TICKET TIER</span>
                <span className="cell-value tier-badge-highlight">{ticket.tierName}</span>
                <span className="cell-sub">{formatNaira(ticket.tierPrice, ticket.currency || "₦")} Paid</span>
              </div>

              <div className="detail-cell">
                <span className="cell-label">DATE & TIME</span>
                <span className="cell-value">{ticket.eventDate}</span>
                <span className="cell-sub">{ticket.eventTime}</span>
              </div>

              <div className="detail-cell">
                <span className="cell-label">VENUE & CITY</span>
                <span className="cell-value">{ticket.venue}</span>
                <span className="cell-sub">{ticket.seatNumber} • {ticket.city}</span>
              </div>
            </div>
          </div>

          {/* Perforation Line with Stub Cutouts */}
          <div className="pass-perforation">
            <div className="perforation-notch-left" />
            <div className="perforation-dash-line" />
            <div className="perforation-notch-right" />
          </div>

          {/* Bottom Stub: Scannable QR Code & Barcode */}
          <div className="pass-stub">
            <div className="stub-qr-container">
              <QRCodeSVG
                value={`NMDS:${ticket.ticketId}|ORD:${ticket.orderId}|EVT:${ticket.eventId}`}
                size={140}
                darkColor="#070709"
                lightColor="#ffffff"
              />
            </div>
            <span className="qr-hint">Scan at Gate for Instant Admission</span>

            {/* Barcode simulation */}
            <div
              style={{
                fontFamily: "monospace",
                letterSpacing: "4px",
                fontSize: "12px",
                color: "var(--text-dim)",
                padding: "4px 10px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "4px"
              }}
            >
              ||| | |||| | ||| |||| | || |||
            </div>
          </div>

          {/* Actions Bar */}
          <div className="pass-actions-bar">
            <button
              type="button"
              className="rx-btn rx-btn-secondary rx-btn-sm"
              style={{ flex: 1 }}
              onClick={handleDownloadICS}
            >
              <span className="rx-btn-text">Add to Calendar</span>
              <span className="rx-btn-icon">
                <CalendarIcon size={14} />
              </span>
            </button>

            <button
              type="button"
              className="rx-btn rx-btn-gold rx-btn-sm"
              style={{ flex: 1 }}
              onClick={handlePrint}
            >
              <span className="rx-btn-text">Print / Save PDF</span>
              <span className="rx-btn-icon">
                <PrinterIcon size={14} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
