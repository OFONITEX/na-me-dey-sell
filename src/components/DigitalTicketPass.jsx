"use client";

import { useState } from "react";
import { QRCodeSVG } from "../lib/qrCodeGenerator";
import { BarcodeSVG } from "../lib/barcodeGenerator";
import { downloadTicketSlip } from "../lib/ticketSlipGenerator";
import { sendTicketConfirmationEmail, buildTicketEmailHtml } from "../lib/emailService";
import {
  CloseIcon,
  CopyIcon,
  CheckIcon,
  PrinterIcon,
  DownloadIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  ShieldCheckIcon,
  SparklesIcon
} from "./Icons";
import { formatNaira } from "../lib/ticketService";

export default function DigitalTicketPass({ tickets, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentToast, setEmailSentToast] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

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

  const handleDownloadSlip = async () => {
    setIsDownloading(true);
    try {
      await downloadTicketSlip(ticket, currentIndex, totalTickets);
      setDownloadSuccessToast(true);
      setTimeout(() => setDownloadSuccessToast(false), 3000);
    } catch (err) {
      console.error("Failed to download ticket slip:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAllSlips = async () => {
    setIsDownloading(true);
    for (let i = 0; i < tickets.length; i++) {
      await downloadTicketSlip(tickets[i], i, tickets.length);
      await new Promise(res => setTimeout(res, 400));
    }
    setIsDownloading(false);
    setDownloadSuccessToast(true);
    setTimeout(() => setDownloadSuccessToast(false), 3500);
  };

  const handleResendEmail = async () => {
    setEmailSending(true);
    try {
      await sendTicketConfirmationEmail(ticket);
      setEmailSentToast(true);
      setTimeout(() => setEmailSentToast(false), 3500);
    } catch (err) {
      console.error("Resend email error:", err);
    } finally {
      setEmailSending(false);
    }
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
      <div
        className="modal-panel"
        style={{ maxWidth: "560px", background: "linear-gradient(180deg, #121219 0%, #08080C 100%)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Navigation if multiple tickets in booking */}
        {totalTickets > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              background: "#0E0E14",
              borderBottom: "1px solid rgba(212, 175, 55, 0.2)"
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--brand-gold-bright)", fontWeight: "700" }}>
              Pass {currentIndex + 1} of {totalTickets} in this booking
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                ‹ Prev
              </button>
              <button
                type="button"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#fff",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer"
                }}
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

        {/* Email Dispatched Banner with Resend & Preview Action */}
        <div
          style={{
            margin: "12px 20px 0",
            padding: "10px 14px",
            background: "rgba(212, 175, 55, 0.08)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#F5D061" }}>
            <MailIcon size={16} style={{ color: "#D4AF37", flexShrink: 0 }} />
            <span>
              Ticket ID &amp; Barcode sent to <strong>{ticket.attendee?.email || "your email"}</strong>
            </span>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={emailSending}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "4px",
                padding: "4px 8px",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {emailSending ? "Sending..." : "Resend"}
            </button>

            <button
              type="button"
              onClick={() => setShowEmailPreview(true)}
              style={{
                background: "rgba(212, 175, 55, 0.2)",
                border: "1px solid #D4AF37",
                borderRadius: "4px",
                padding: "4px 8px",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Preview Email
            </button>
          </div>
        </div>

        {/* Toast Notifications */}
        {emailSentToast && (
          <div
            style={{
              margin: "8px 20px 0",
              padding: "8px 12px",
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid #10B981",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6EE7B7",
              fontSize: "12px",
              fontWeight: "700"
            }}
          >
            <CheckIcon size={14} style={{ color: "#10B981" }} />
            <span>Ticket confirmation email sent with Barcode and Ticket ID!</span>
          </div>
        )}

        {downloadSuccessToast && (
          <div
            style={{
              margin: "8px 20px 0",
              padding: "8px 12px",
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid #10B981",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6EE7B7",
              fontSize: "12px",
              fontWeight: "700"
            }}
          >
            <CheckIcon size={14} style={{ color: "#10B981" }} />
            <span>Admission Slip downloaded successfully! Check your device downloads.</span>
          </div>
        )}

        {/* Printable Pass Container */}
        <div
          className="digital-pass-card"
          id="printable-ticket"
          style={{ overflowY: "auto", maxHeight: "calc(82vh - 80px)", paddingBottom: "16px", marginTop: "10px" }}
        >
          {/* Top Banner section */}
          <div className="pass-header">
            <div className="pass-header-top">
              <div className="pass-brand-stamp">
                <img
                  src="/logo-gold.png"
                  alt="Nà Mè Dèy Sell"
                  style={{ height: "24px", objectFit: "contain" }}
                />
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
            {/* Ticket ID Highlight Bar with Copy */}
            <div className="ticket-id-highlight-box">
              <div className="ticket-id-meta">
                <span className="ticket-id-label">OFFICIAL PASS TICKET ID</span>
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

            {/* Attendee Details & Ticket Number Highlight Card */}
            <div
              style={{
                background: "rgba(212, 175, 55, 0.08)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "14px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
                  paddingBottom: "8px"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#F5D061", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Attendee Details &amp; Ticket Info
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#10B981", fontWeight: "700" }}>
                  <ShieldCheckIcon size={14} />
                  <span>Verified Pass</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {/* Full Name */}
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block" }}>
                    Full Name
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#ffffff" }}>
                    {ticket.attendee?.name || "Attendee"}
                  </span>
                </div>

                {/* Ticket / Seat Number */}
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block" }}>
                    Ticket Number
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--brand-gold)", fontFamily: "JetBrains Mono" }}>
                    {ticket.seatNumber}
                  </span>
                </div>

                {/* Email Address */}
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block" }}>
                    Email Address
                  </span>
                  <span style={{ fontSize: "12px", color: "#E2D9BC", wordBreak: "break-all" }}>
                    {ticket.attendee?.email || "—"}
                  </span>
                </div>

                {/* Phone Number */}
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block" }}>
                    Phone Number
                  </span>
                  <span style={{ fontSize: "12px", color: "#E2D9BC", fontWeight: "600" }}>
                    {ticket.attendee?.phone || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Logistics Grid */}
            <div className="pass-details-grid">
              <div className="detail-cell">
                <span className="cell-label">TICKET TIER</span>
                <span className="cell-value tier-badge-highlight">{ticket.tierName}</span>
                <span className="cell-sub">{formatNaira(ticket.tierPrice, ticket.currency || "₦")} Paid</span>
              </div>

              <div className="detail-cell">
                <span className="cell-label">ORDER REFERENCE</span>
                <span className="cell-value" style={{ fontFamily: "JetBrains Mono", fontSize: "13px" }}>{ticket.orderId}</span>
                <span className="cell-sub">Pass #{currentIndex + 1} of {totalTickets}</span>
              </div>

              <div className="detail-cell">
                <span className="cell-label">DATE &amp; TIME</span>
                <span className="cell-value">{ticket.eventDate}</span>
                <span className="cell-sub">{ticket.eventTime}</span>
              </div>

              <div className="detail-cell">
                <span className="cell-label">VENUE &amp; CITY</span>
                <span className="cell-value">{ticket.venue}</span>
                <span className="cell-sub">{ticket.city}</span>
              </div>
            </div>
          </div>

          {/* Perforation Line with Stub Cutouts */}
          <div className="pass-perforation">
            <div className="perforation-notch-left" />
            <div className="perforation-dash-line" />
            <div className="perforation-notch-right" />
          </div>

          {/* Bottom Stub: Scannable 1D Barcode & 2D QR Code */}
          <div className="pass-stub" style={{ paddingTop: "12px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
              Admission Gate Scan
            </div>

            {/* 2D QR Code */}
            <div className="stub-qr-container">
              <QRCodeSVG
                value={`NMDS:${ticket.ticketId}|ORD:${ticket.orderId}|EVT:${ticket.eventId}`}
                size={140}
                darkColor="#070709"
                lightColor="#ffffff"
              />
            </div>
            <span className="qr-hint">Scan QR at Gate for Instant Admission</span>

            {/* Official 1D Barcode */}
            <div
              style={{
                marginTop: "14px",
                padding: "10px 14px",
                background: "#ffffff",
                borderRadius: "8px",
                width: "100%",
                maxWidth: "340px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.5)"
              }}
            >
              <BarcodeSVG
                value={ticket.ticketId}
                height={50}
                barColor="#000000"
                textColor="#111111"
                showText={true}
              />
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "6px" }}>
              Laser Barcode &amp; Optical QR Dual-Verification Enabled
            </div>
          </div>

          {/* Actions Bar: Download Slip, Print, Calendar */}
          <div className="pass-actions-bar" style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
            {/* Primary Action: Download Slip (PNG) */}
            <button
              type="button"
              className="rx-btn rx-btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleDownloadSlip}
              disabled={isDownloading}
            >
              <span className="rx-btn-text" style={{ flex: 1, textAlign: "center", fontSize: "13px" }}>
                {isDownloading ? "Generating Slip..." : "Download Ticket Slip (PNG)"}
              </span>
              <span className="rx-btn-icon">
                <DownloadIcon size={16} />
              </span>
            </button>

            {/* Secondary Actions Row */}
            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
              <button
                type="button"
                className="rx-btn rx-btn-gold rx-btn-sm"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={handlePrint}
              >
                <span className="rx-btn-text" style={{ padding: "8px 12px", fontSize: "11px" }}>Print / PDF</span>
                <span className="rx-btn-icon">
                  <PrinterIcon size={14} />
                </span>
              </button>

              <button
                type="button"
                className="rx-btn rx-btn-secondary rx-btn-sm"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={handleDownloadICS}
              >
                <span className="rx-btn-text" style={{ padding: "8px 12px", fontSize: "11px" }}>Calendar</span>
                <span className="rx-btn-icon">
                  <CalendarIcon size={14} />
                </span>
              </button>

              {totalTickets > 1 && (
                <button
                  type="button"
                  className="rx-btn rx-btn-secondary rx-btn-sm"
                  style={{ flex: 1.2, justifyContent: "center" }}
                  onClick={handleDownloadAllSlips}
                  disabled={isDownloading}
                >
                  <span className="rx-btn-text" style={{ padding: "8px 10px", fontSize: "11px" }}>All Slips ({totalTickets})</span>
                  <span className="rx-btn-icon">
                    <DownloadIcon size={14} />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {showEmailPreview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setShowEmailPreview(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              background: "#070709",
              border: "1px solid #D4AF37",
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px rgba(0,0,0,0.9)"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#0E0E14",
                borderBottom: "1px solid rgba(212,175,55,0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#FFFFFF", margin: 0 }}>
                  ✉️ Email Slip Preview ({ticket.attendee?.email})
                </h3>
                <span style={{ fontSize: "11px", color: "var(--brand-gold-bright)" }}>
                  Subject: 🎫 Your Admission Pass: {ticket.eventTitle} (ID: {ticket.ticketId})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreview(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#E2D9BC",
                  cursor: "pointer"
                }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              <div
                dangerouslySetInnerHTML={{ __html: buildTicketEmailHtml(ticket) }}
                style={{ maxWidth: "100%" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
