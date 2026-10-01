"use client";

import { useState, useEffect } from "react";
import {
  CloseIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  TicketIcon,
  CalendarIcon,
  MapPinIcon,
  QrCodeIcon,
  SparklesIcon
} from "./Icons";
import { findAndVerifyTicket, admitTicketCheckIn, formatNaira } from "../lib/ticketService";
import { downloadTicketSlip } from "../lib/ticketSlipGenerator";

export default function TicketVerificationModal({
  ticketId,
  onClose,
  onOpenDigitalPass,
  onTicketStatusChanged
}) {
  const [loading, setLoading] = useState(true);
  const [verifyData, setVerifyData] = useState(null);
  const [staffName, setStaffName] = useState("Gate Marshall Lagos");
  const [admitting, setAdmitting] = useState(false);
  const [admitMessage, setAdmitMessage] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!ticketId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await findAndVerifyTicket(ticketId);
      if (isMounted) {
        setVerifyData(res);
        setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [ticketId]);

  const handleAdmit = async () => {
    if (!verifyData?.ticket?.ticketId) return;
    setAdmitting(true);
    const res = await admitTicketCheckIn(verifyData.ticket.ticketId, staffName);
    setAdmitting(false);
    if (res.success && res.ticket) {
      setVerifyData({
        ...verifyData,
        ticket: res.ticket,
        status: "checked_in",
        message: res.message
      });
      setAdmitMessage({
        type: "success",
        text: `ADMISSION CONFIRMED! ${res.ticket.attendee?.name} admitted at ${new Date(res.ticket.checkedInAt).toLocaleTimeString()}`
      });
      if (onTicketStatusChanged) onTicketStatusChanged();
    } else {
      setAdmitMessage({
        type: "error",
        text: res.message || "Failed to check in ticket."
      });
    }
  };

  const handleDownload = async () => {
    if (!verifyData?.ticket) return;
    setIsDownloading(true);
    try {
      await downloadTicketSlip(verifyData.ticket, 0, 1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const ticket = verifyData?.ticket;
  const isPaid = verifyData?.isPaid ?? true;
  const isCheckedIn = ticket?.status === "checked_in";

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-panel"
        style={{
          maxWidth: "620px",
          width: "95%",
          background: "#08080C",
          border: "1px solid rgba(212, 175, 55, 0.35)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(16, 185, 129, 0.2)",
          borderRadius: "16px",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: "16px 20px",
            background: "#0E0E14",
            borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.2)",
                border: "1px solid #10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10B981"
              }}
            >
              <ShieldCheckIcon size={20} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "900", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Official Pass Verification</span>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: "900",
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid #10B981",
                    color: "#10B981",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    textTransform: "uppercase"
                  }}
                >
                  Live Ledger
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                Cryptographic barcode &amp; payment confirmation
              </div>
            </div>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "20px", maxHeight: "80vh", overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "3px solid rgba(212, 175, 55, 0.2)",
                  borderTopColor: "var(--brand-gold)",
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                  animation: "spin 1s linear infinite"
                }}
              />
              <div style={{ color: "#fff", fontWeight: "800", fontSize: "15px" }}>
                Scanning &amp; Verifying Pass...
              </div>
              <p style={{ color: "var(--text-dim)", fontSize: "12px", marginTop: "4px" }}>
                Checking cryptographic ticket registry and Monnify settlement
              </p>
            </div>
          ) : !verifyData?.found ? (
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "2px solid #EF4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "#EF4444"
                }}
              >
                <XCircleIcon size={32} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#EF4444", marginBottom: "8px" }}>
                Pass Not Recognized
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 20px" }}>
                {verifyData?.message || `The scanned ID "${ticketId}" could not be found in the active Nà Mè Dèy Sell registry.`}
              </p>
              <button
                type="button"
                className="rx-btn rx-btn-primary rx-btn-sm"
                onClick={onClose}
                style={{ margin: "0 auto" }}
              >
                <span className="rx-btn-text">Close Window</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Payment Proof Hero Banner */}
              <div
                style={{
                  background: isCheckedIn
                    ? "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(14, 14, 20, 0.9) 100%)"
                    : "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(14, 14, 20, 0.9) 100%)",
                  border: isCheckedIn ? "1.5px solid #F59E0B" : "1.5px solid #10B981",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: isCheckedIn ? "#F59E0B" : "#10B981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#070709",
                        fontWeight: "900"
                      }}
                    >
                      {isCheckedIn ? <AlertTriangleIcon size={20} /> : <CheckCircleIcon size={22} />}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "900",
                          color: isCheckedIn ? "#F59E0B" : "#10B981",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}
                      >
                        {isCheckedIn ? "PASS ALREADY REDEEMED" : "✓ VERIFIED PAID &amp; AUTHENTIC PASS"}
                      </div>
                      <div style={{ fontSize: "11px", color: "#fff", opacity: 0.85 }}>
                        {isCheckedIn
                          ? `Admitted on ${new Date(ticket.checkedInAt).toLocaleString()} by ${ticket.gateStaff || "Gate Marshall"}`
                          : "100% Fully Settled • Valid for Admission Gate Entry"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      textAlign: "right"
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase" }}>
                      Amount Paid
                    </div>
                    <div style={{ fontSize: "1.3rem", fontWeight: "900", color: "#F5D061", fontFamily: "Sora" }}>
                      {formatNaira(ticket.tierPrice, ticket.currency)}
                    </div>
                  </div>
                </div>

                {/* Micro Receipt Ledger Strip */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "8px",
                    fontSize: "11px"
                  }}
                >
                  <div>
                    <span style={{ color: "var(--text-dim)" }}>Payment Method: </span>
                    <strong style={{ color: "#fff", textTransform: "uppercase" }}>{ticket.paymentMethod || "MONNIFY"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-dim)" }}>Status: </span>
                    <strong style={{ color: "#10B981" }}>PAID &amp; SETTLED</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-dim)" }}>Ref: </span>
                    <strong style={{ color: "#fff", fontFamily: "JetBrains Mono" }}>
                      {ticket.paymentReference ? ticket.paymentReference.slice(0, 16) : `ORD-${ticket.orderId}`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Event & Pass Details Card */}
              <div
                style={{
                  background: "#0E0E14",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: "12px",
                  padding: "16px"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Event &amp; Venue
                </div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#fff", marginBottom: "6px" }}>
                  {ticket.eventTitle}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <CalendarIcon size={14} style={{ color: "var(--brand-gold)" }} />
                    <span>{ticket.eventDate || "Upcoming 2026"} • {ticket.eventTime || "06:00 PM"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPinIcon size={14} style={{ color: "var(--brand-gold)" }} />
                    <span>{ticket.venue || "Official Venue"} • {ticket.city || "Nigeria"}</span>
                  </div>
                </div>

                <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "14px 0" }} />

                {/* Attendee Details Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", fontSize: "12px" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "800" }}>
                      Attendee Name
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "900", color: "#fff", marginTop: "2px" }}>
                      {ticket.attendee?.name || "Attendee"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "800" }}>
                      Tier / Category
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "900", color: "var(--brand-gold)", marginTop: "2px" }}>
                      {ticket.tierName}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "800" }}>
                      Seat / Table Allocation
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#fff", marginTop: "2px", fontFamily: "JetBrains Mono" }}>
                      {ticket.seatNumber || "General Entry"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "800" }}>
                      Ticket ID
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: "900", color: "#F5D061", marginTop: "2px", fontFamily: "JetBrains Mono" }}>
                      {ticket.ticketId}
                    </div>
                  </div>
                </div>
              </div>

              {/* 1D Barcode Container Visual Proof */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: "900", color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                  Optical Barcode Scan Data
                </div>
                {/* Simulated high-contrast barcode bars */}
                <div
                  style={{
                    height: "44px",
                    background: "repeating-linear-gradient(90deg, #000 0px, #000 3px, #fff 3px, #fff 5px, #000 5px, #000 8px, #fff 8px, #fff 11px, #000 11px, #000 13px, #fff 13px, #fff 16px, #000 16px, #000 20px, #fff 20px, #fff 22px)",
                    borderRadius: "4px",
                    margin: "0 auto",
                    maxWidth: "380px"
                  }}
                />
                <div style={{ fontFamily: "JetBrains Mono", fontSize: "12px", fontWeight: "900", color: "#111", marginTop: "6px" }}>
                  * {ticket.ticketId} * &nbsp;•&nbsp; [PAID: {formatNaira(ticket.tierPrice, ticket.currency)}]
                </div>
              </div>

              {/* Admission Gate Check-In Action Section */}
              {admitMessage && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "800",
                    background: admitMessage.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    border: admitMessage.type === "success" ? "1px solid #10B981" : "1px solid #EF4444",
                    color: admitMessage.type === "success" ? "#10B981" : "#EF4444"
                  }}
                >
                  {admitMessage.text}
                </div>
              )}

              <div
                style={{
                  background: "#0E0E14",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div>
                  <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase" }}>
                    Gate Admission Status
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "900",
                      color: isCheckedIn ? "#F59E0B" : "#10B981",
                      marginTop: "2px"
                    }}
                  >
                    {isCheckedIn ? "Admitted & Checked In" : "Valid • Ready for Gate Admission"}
                  </div>
                </div>

                {!isCheckedIn ? (
                  <button
                    type="button"
                    className="rx-btn rx-btn-primary rx-btn-sm"
                    onClick={handleAdmit}
                    disabled={admitting}
                    style={{
                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "900",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    <span>{admitting ? "Admitting..." : "Admit Attendee (Check In)"}</span>
                  </button>
                ) : (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#F59E0B",
                      fontWeight: "800",
                      border: "1px solid rgba(245, 158, 11, 0.4)",
                      padding: "4px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    Already Used at Gate
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                {onOpenDigitalPass && (
                  <button
                    type="button"
                    className="rx-btn rx-btn-secondary"
                    onClick={() => {
                      onClose();
                      onOpenDigitalPass([ticket]);
                    }}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <TicketIcon size={16} />
                    <span className="rx-btn-text">View Full Pass</span>
                  </button>
                )}

                <button
                  type="button"
                  className="rx-btn rx-btn-primary"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <span className="rx-btn-text">{isDownloading ? "Generating..." : "Download Pass Slip"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
