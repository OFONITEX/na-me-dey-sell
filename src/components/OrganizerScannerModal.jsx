"use client";

import { useState, useEffect, useRef } from "react";
import {
  CloseIcon,
  QrCodeIcon,
  SearchIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TicketIcon
} from "./Icons";
import { findAndVerifyTicket, admitTicketCheckIn, formatNaira } from "../lib/ticketService";

export default function OrganizerScannerModal({ tickets, onRefreshTickets, onClose }) {
  const [ticketInput, setTicketInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [staffName, setStaffName] = useState("Gate Marshall Lagos");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isAdmitting, setIsAdmitting] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Calculate live stats
  const totalSold = tickets.length;
  const checkedInCount = tickets.filter(t => t.status === "checked_in").length;
  const checkInRate = totalSold > 0 ? Math.round((checkedInCount / totalSold) * 100) : 0;

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access not supported on this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Start Barcode / QR detection loop if BarcodeDetector API is supported
      if (typeof window !== "undefined" && "BarcodeDetector" in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8", "data_matrix"]
          });

          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue;
                  if (rawValue) {
                    stopCamera();
                    handleVerify(rawValue);
                  }
                }
              } catch (e) {
                // Ignore detection frame error
              }
            }
          }, 400);
        } catch (e) {
          console.warn("BarcodeDetector initialization notice:", e);
        }
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("Unable to open camera. Please verify camera permissions or type the ID manually.");
      setCameraActive(false);
    }
  };

  const handleVerify = async (idToVerify) => {
    let query = (idToVerify || ticketInput).trim();
    if (!query) return;

    // Intelligent parser: extract ticketId from verify URL or QR payload
    if (query.includes("verify=")) {
      const match = query.match(/verify=([^&]+)/);
      if (match) query = decodeURIComponent(match[1]);
    } else if (query.startsWith("NMDS:") && query.includes("|")) {
      const parts = query.split("|");
      const idPart = parts.find(p => p.startsWith("NMDS:"));
      if (idPart) query = idPart.replace("NMDS:", "");
    }
    query = query.trim().toUpperCase();

    // Verify ticket payment and authenticity
    const verification = await findAndVerifyTicket(query);
    if (!verification.found || !verification.ticket) {
      setScanResult({
        status: "NOT_FOUND",
        message: verification.message || `Ticket ID "${query}" not found in Nà Mè Dèy Sell registry. Check for counterfeit or typo.`,
        ticket: null
      });
      return;
    }

    const tkt = verification.ticket;
    if (tkt.status === "checked_in") {
      setScanResult({
        status: "ALREADY_CHECKED_IN",
        message: `ALERT: This pass was already redeemed on ${new Date(tkt.checkedInAt).toLocaleString()} at Gate Check-in!`,
        ticket: tkt
      });
    } else {
      setScanResult({
        status: "SUCCESS",
        message: `✓ TICKET AUTHENTIC & VERIFIED PAID! Ready for Gate Admission.`,
        ticket: tkt
      });
    }
  };

  const handleAdmitAttendee = async () => {
    if (!scanResult?.ticket?.ticketId) return;
    setIsAdmitting(true);
    const res = await admitTicketCheckIn(scanResult.ticket.ticketId, staffName);
    setIsAdmitting(false);

    if (res.success && res.ticket) {
      setScanResult({
        status: "ADMITTED_NOW",
        message: `ENTRY GRANTED! Welcome ${res.ticket.attendee?.name || "Attendee"}. Checked in at ${new Date(res.ticket.checkedInAt).toLocaleTimeString()}`,
        ticket: res.ticket
      });
      if (onRefreshTickets) onRefreshTickets();
    } else {
      setScanResult({
        ...scanResult,
        message: res.message
      });
    }
  };

  const handleQuickTest = (tktId) => {
    setTicketInput(tktId);
    handleVerify(tktId);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-panel" style={{ maxWidth: "680px" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px", background: "#0E0E14", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.2)", border: "1px solid var(--emerald-green)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--emerald-green)" }}>
              <QrCodeIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Gate Pass &amp; Payment Scanner</span>
                <span style={{ fontSize: "10px", background: "rgba(212, 175, 55, 0.15)", border: "1px solid var(--brand-gold)", color: "var(--brand-gold)", padding: "2px 8px", borderRadius: "4px" }}>
                  Staff Mode
                </span>
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Instant dynamic QR &amp; Barcode validation with live payment proof
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Live Gate Check-in Stats */}
        <div className="rx-scanner-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", padding: "16px 24px", background: "#08080C", borderBottom: "1px solid rgba(212, 175, 55, 0.15)" }}>
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

        {/* Scanner Viewport & Controls */}
        <div style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(80vh - 180px)", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Viewfinder box / Live camera */}
          <div
            className="scanner-viewport-box"
            style={{
              position: "relative",
              height: "220px",
              background: "#050508",
              borderRadius: "12px",
              border: "2px dashed rgba(212, 175, 55, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}
          >
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div className="scanner-laser-line" />
                <button
                  type="button"
                  onClick={stopCamera}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(0,0,0,0.7)",
                    border: "1px solid #ef4444",
                    color: "#ef4444",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  Turn Off Camera
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center", padding: "16px" }}>
                <QrCodeIcon size={44} style={{ color: "rgba(245, 208, 97, 0.5)" }} />
                <div>
                  <div style={{ fontSize: "12px", color: "var(--brand-gold)", fontWeight: "800", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    Optical Barcode &amp; QR Pass Scanner
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                    Hold barcode or QR up to camera, or enter Ticket ID below
                  </div>
                </div>

                <button
                  type="button"
                  className="rx-btn rx-btn-primary rx-btn-sm"
                  onClick={startCamera}
                  style={{ marginTop: "4px" }}
                >
                  <span className="rx-btn-text">📷 Start Camera Scanner</span>
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#ef4444" }}>
              {cameraError}
            </div>
          )}

          {/* Manual Input */}
          <div>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Enter Ticket ID or Paste Scan Payload
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#070709", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "6px", padding: "10px 14px", gap: "10px" }}>
                <SearchIcon size={16} style={{ color: "var(--text-dim)" }} />
                <input
                  type="text"
                  placeholder="e.g. NMDS-2026-NAPH-1A8K"
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
                <span className="rx-btn-text">Scan Pass</span>
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
                  ⚡ {t.ticketId.slice(0, 16)}... ({t.status === "checked_in" ? "Admitted" : "Active"})
                </button>
              ))}
            </div>
          </div>

          {/* Validation Result Box */}
          {scanResult && (
            <div
              style={{
                borderRadius: "12px",
                padding: "16px 20px",
                border: (scanResult.status === "SUCCESS" || scanResult.status === "ADMITTED_NOW")
                  ? "2px solid #10b981"
                  : scanResult.status === "ALREADY_CHECKED_IN"
                  ? "2px solid #f59e0b"
                  : "2px solid #ef4444",
                background: (scanResult.status === "SUCCESS" || scanResult.status === "ADMITTED_NOW")
                  ? "rgba(16, 185, 129, 0.15)"
                  : scanResult.status === "ALREADY_CHECKED_IN"
                  ? "rgba(245, 158, 11, 0.15)"
                  : "rgba(239, 68, 68, 0.15)",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "900", fontSize: "15px", color: (scanResult.status === "SUCCESS" || scanResult.status === "ADMITTED_NOW") ? "#10b981" : scanResult.status === "ALREADY_CHECKED_IN" ? "#f59e0b" : "#ef4444" }}>
                  {(scanResult.status === "SUCCESS" || scanResult.status === "ADMITTED_NOW") && <CheckCircleIcon size={22} />}
                  {scanResult.status === "ALREADY_CHECKED_IN" && <AlertTriangleIcon size={22} />}
                  {scanResult.status === "NOT_FOUND" && <XCircleIcon size={22} />}
                  <span>
                    {scanResult.status === "ADMITTED_NOW" && "ENTRY GRANTED — ADMITTED AT GATE"}
                    {scanResult.status === "SUCCESS" && "AUTHENTIC PASS — PAYMENT VERIFIED"}
                    {scanResult.status === "ALREADY_CHECKED_IN" && "DUPLICATE TICKET — ALREADY USED"}
                    {scanResult.status === "NOT_FOUND" && "INVALID TICKET ID"}
                  </span>
                </div>

                {scanResult.ticket && (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.25)",
                      border: "1px solid #10B981",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: "900",
                      color: "#10B981"
                    }}
                  >
                    ✓ VERIFIED PAID ({formatNaira(scanResult.ticket.tierPrice, scanResult.ticket.currency)})
                  </div>
                )}
              </div>

              <p style={{ fontSize: "13px", color: "#fff", lineHeight: "1.5" }}>
                {scanResult.message}
              </p>

              {scanResult.ticket && (
                <div style={{ marginTop: "4px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.15)", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", fontSize: "12px" }}>
                  <div>Attendee: <strong style={{ color: "#fff" }}>{scanResult.ticket.attendee?.name || scanResult.ticket.attendeeName}</strong></div>
                  <div>Tier: <strong style={{ color: "var(--brand-gold)" }}>{scanResult.ticket.tierName}</strong></div>
                  <div>Event: <strong style={{ color: "#fff" }}>{scanResult.ticket.eventTitle}</strong></div>
                  <div>Seat / Code: <strong style={{ color: "#fff", fontFamily: "JetBrains Mono" }}>{scanResult.ticket.seatNumber || "General"}</strong></div>
                  <div>Gate Status: <strong style={{ color: scanResult.ticket.status === "checked_in" ? "#F59E0B" : "#10B981" }}>{scanResult.ticket.status === "checked_in" ? "Checked In" : "Active (Ready)"}</strong></div>
                  <div>Payment Method: <strong style={{ color: "#fff", textTransform: "uppercase" }}>{scanResult.ticket.paymentMethod || "MONNIFY"}</strong></div>
                </div>
              )}

              {/* Action to Admit Attendee if ticket is still active */}
              {scanResult.status === "SUCCESS" && scanResult.ticket && scanResult.ticket.status !== "checked_in" && (
                <button
                  type="button"
                  className="rx-btn rx-btn-primary"
                  onClick={handleAdmitAttendee}
                  disabled={isAdmitting}
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontWeight: "900",
                    fontSize: "13px",
                    cursor: "pointer",
                    marginTop: "6px"
                  }}
                >
                  <CheckCircleIcon size={16} />
                  <span>{isAdmitting ? "Admitting..." : "Admit Attendee & Stamp Gate Check-in"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
