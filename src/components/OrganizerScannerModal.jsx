"use client";

import { useState } from "react";
import {
  CloseIcon,
  QrCodeIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  SparklesIcon
} from "./Icons";
import { verifyTicketCheckIn, formatNaira } from "../lib/ticketService";

export default function OrganizerScannerModal({ tickets, onRefreshTickets, onClose }) {
  const [ticketInput, setTicketInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [staffName, setStaffName] = useState("Gate Marshall Lagos");

  // Calculate live stats
  const totalSold = tickets.length;
  const checkedInCount = tickets.filter(t => t.status === "checked_in").length;
  const checkInRate = totalSold > 0 ? Math.round((checkedInCount / totalSold) * 100) : 0;

  const handleVerify = (idToVerify) => {
    const query = idToVerify || ticketInput;
    if (!query.trim()) return;

    const result = verifyTicketCheckIn(query, staffName);
    setScanResult(result);
    if (result.status === "SUCCESS") {
      onRefreshTickets();
    }
  };

  const handleQuickTest = (tktId) => {
    setTicketInput(tktId);
    handleVerify(tktId);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: "660px" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px", background: "#0E0E14", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.2)", border: "1px solid var(--emerald-green)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--emerald-green)" }}>
              <QrCodeIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Gate Pass Scanner</span>
                <span style={{ fontSize: "10px", background: "rgba(212, 175, 55, 0.15)", border: "1px solid var(--brand-gold)", color: "var(--brand-gold)", padding: "2px 8px", borderRadius: "4px" }}>
                  Staff Mode
                </span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Instant dynamic QR code validation & anti-counterfeit entry control
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Live Gate Check-in Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", padding: "16px 24px", background: "#08080C", borderBottom: "1px solid rgba(212, 175, 55, 0.15)" }}>
          <div style={{ background: "#0E0E14", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase" }}>Passes Issued</div>
            <div style={{ fontFamily: "Sora", fontSize: "1.5rem", fontWeight: "900", color: "#fff", marginTop: "2px" }}>{totalSold}</div>
          </div>
          <div style={{ background: "#0E0E14", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase" }}>Admitted</div>
            <div style={{ fontFamily: "Sora", fontSize: "1.5rem", fontWeight: "900", color: "var(--emerald-green)", marginTop: "2px" }}>{checkedInCount}</div>
          </div>
          <div style={{ background: "#0E0E14", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase" }}>Check-in Rate</div>
            <div style={{ fontFamily: "Sora", fontSize: "1.5rem", fontWeight: "900", color: "var(--brand-gold)", marginTop: "2px" }}>{checkInRate}%</div>
          </div>
        </div>

        {/* Scanner Simulation & Manual Input */}
        <div style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(80vh - 180px)", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Viewfinder simulation */}
          <div className="scanner-viewport-box">
            <div className="scanner-laser-line" />
            <div className="scanner-target-crosshairs" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "6px" }}>
              <QrCodeIcon size={44} style={{ color: "rgba(245, 208, 97, 0.4)" }} />
              <span style={{ fontSize: "10px", color: "var(--brand-gold)", fontWeight: "800", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Target Pass QR
              </span>
            </div>
          </div>

          {/* Manual Input */}
          <div>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Or Enter Ticket ID Manually
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#070709", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "6px", padding: "10px 14px", gap: "10px" }}>
                <SearchIcon size={16} style={{ color: "var(--text-dim)" }} />
                <input
                  type="text"
                  placeholder="e.g. NMDS-2026-9X7M-K42B"
                  style={{ background: "transparent", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "14px", fontFamily: "JetBrains Mono" }}
                  value={ticketInput}
                  onChange={e => setTicketInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleVerify()}
                />
              </div>
              <button
                type="button"
                className="rx-btn rx-btn-primary rx-btn-sm"
                onClick={() => handleVerify()}
              >
                <span className="rx-btn-text">Verify Pass</span>
                <span className="rx-btn-icon">
                  <ShieldCheckIcon size={14} />
                </span>
              </button>
            </div>
          </div>

          {/* Quick test buttons with real tickets */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", marginBottom: "8px" }}>
              Quick Test Scanner with Registered Passes:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {tickets.slice(0, 4).map(t => (
                <button
                  key={t.ticketId}
                  type="button"
                  onClick={() => handleQuickTest(t.ticketId)}
                  style={{
                    background: "rgba(212, 175, 55, 0.12)",
                    border: "1px solid rgba(212, 175, 55, 0.25)",
                    color: "var(--brand-gold)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "JetBrains Mono",
                    cursor: "pointer"
                  }}
                >
                  ⚡ Scan {t.ticketId.slice(0, 14)}... ({t.status === "checked_in" ? "Already Used" : "Active"})
                </button>
              ))}
            </div>
          </div>

          {/* Validation Result Box */}
          {scanResult && (
            <div
              style={{
                borderRadius: "10px",
                padding: "16px 20px",
                border: scanResult.status === "SUCCESS" ? "2px solid #10b981" : scanResult.status === "ALREADY_CHECKED_IN" ? "2px solid #f59e0b" : "2px solid #ef4444",
                background: scanResult.status === "SUCCESS" ? "rgba(16, 185, 129, 0.15)" : scanResult.status === "ALREADY_CHECKED_IN" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "900", fontSize: "15px", color: scanResult.status === "SUCCESS" ? "#10b981" : scanResult.status === "ALREADY_CHECKED_IN" ? "#f59e0b" : "#ef4444" }}>
                {scanResult.status === "SUCCESS" && <CheckCircleIcon size={20} />}
                {scanResult.status === "ALREADY_CHECKED_IN" && <AlertTriangleIcon size={20} />}
                {scanResult.status === "NOT_FOUND" && <XCircleIcon size={20} />}
                <span>
                  {scanResult.status === "SUCCESS" && "ADMISSION GRANTED — VALID TICKET"}
                  {scanResult.status === "ALREADY_CHECKED_IN" && "DUPLICATE TICKET — ALREADY USED"}
                  {scanResult.status === "NOT_FOUND" && "INVALID TICKET ID"}
                </span>
              </div>

              <p style={{ fontSize: "13px", color: "#fff", lineHeight: "1.5" }}>
                {scanResult.message}
              </p>

              {scanResult.ticket && (
                <div style={{ marginTop: "6px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", fontSize: "12px" }}>
                  <div>Attendee: <strong style={{ color: "#fff" }}>{scanResult.ticket.attendee.name}</strong></div>
                  <div>Tier: <strong style={{ color: "var(--brand-gold)" }}>{scanResult.ticket.tierName}</strong></div>
                  <div>Event: <strong style={{ color: "#fff" }}>{scanResult.ticket.eventTitle}</strong></div>
                  <div>Seat / Code: <strong style={{ color: "#fff" }}>{scanResult.ticket.seatNumber}</strong></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
