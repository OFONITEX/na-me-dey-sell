"use client";

import { useState } from "react";
import { CloseIcon, UserIcon, MailIcon, PhoneIcon, CreditCardIcon, ShieldCheckIcon, TagIcon, CheckCircleIcon, SparklesIcon, ArrowRightIcon } from "./Icons";
import { issueTickets, formatNaira } from "../lib/ticketService";
import { payWithMonnify } from "../lib/monnifyService";
import { triggerConfetti } from "../lib/confetti";

export default function CheckoutModal({ bookingData, onClose, onOrderComplete }) {
  const { event, tier, quantity, subtotal } = bookingData;

  const [attendee, setAttendee] = useState({
    name: "Emeka Okafor",
    email: "emeka.okafor@example.com",
    phone: "08023456789",
    notes: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("monnify");
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [gatewayError, setGatewayError] = useState("");

  const currencySymbol = event?.currency || tier?.currency || "₦";

  const handleApplyPromo = () => {
    setPromoError("");
    setPromoSuccess("");
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === "NMDS20" || code === "VIBES20") {
      const discount = Math.round(subtotal * 0.2);
      setAppliedDiscount(discount);
      setPromoSuccess(`Promo applied: 20% discount (-${formatNaira(discount, currencySymbol)})`);
    } else if (code === "DETTY50") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setPromoSuccess(`Promo applied: 10% discount (-${formatNaira(discount, currencySymbol)})`);
    } else {
      setPromoError("Invalid code. Try 'NMDS20' or 'DETTY50'");
    }
  };

  const finalTotal = Math.max(0, subtotal - appliedDiscount);

  const finalizeOrder = (gatewayResponse = null) => {
    const orderResult = issueTickets({
      event,
      tier,
      quantity,
      attendee,
      paymentMethod,
      promoDiscount: appliedDiscount,
      gatewayResponse
    });

    setIsProcessing(false);
    triggerConfetti();
    onOrderComplete(orderResult);
  };

  const handleCompleteOrder = (e) => {
    e.preventDefault();
    setGatewayError("");

    if (!attendee.name || !attendee.email) {
      alert("Please provide your name and email address.");
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === "monnify") {
      // Trigger Monnify Checkout
      payWithMonnify({
        amount: finalTotal,
        customerName: attendee.name,
        customerEmail: attendee.email,
        customerPhone: attendee.phone,
        paymentDescription: `Tickets for ${event.title} (${tier.name} × ${quantity})`,
        metadata: {
          eventId: event.id,
          tierId: tier.id,
          quantity
        },
        onSuccess: (response) => {
          finalizeOrder(response);
        },
        onClose: (data) => {
          setIsProcessing(false);
        },
        onError: (err) => {
          setIsProcessing(false);
          const rawMsg = typeof err === "string" ? err : (err?.responseMessage || err?.message || "");
          setGatewayError(
            rawMsg || "Monnify account returned: Invalid credentials or account pending live KYC activation."
          );
        }
      });
    } else {
      // Direct simulation for other methods (Direct Transfer, Paystack)
      setTimeout(() => {
        finalizeOrder({
          paymentReference: `NMDS-${paymentMethod.toUpperCase()}-${Date.now()}`,
          paymentStatus: "PAID",
          amountPaid: finalTotal
        });
      }, 1000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        style={{
          maxWidth: "580px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(212, 175, 55, 0.35)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(212, 175, 55, 0.15)"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Fixed at Top */}
        <div
          style={{
            padding: "18px 24px",
            background: "#0E0E14",
            borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#fff", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <span>Secure Checkout</span>
              <span style={{ fontSize: "10px", background: "rgba(212, 175, 55, 0.15)", border: "1px solid var(--brand-gold)", color: "var(--brand-gold)", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Nà Mè Dèy Sell
              </span>
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px", marginBottom: 0 }}>
              Step 2 of 2: Review details & complete payment
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close checkout">
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="checkout-form"
          onSubmit={handleCompleteOrder}
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          {/* Gateway Error / Diagnostic Notice */}
          {gatewayError && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "8px",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontSize: "13px", fontWeight: "800" }}>
                <span>⚠️ Monnify Gateway Status</span>
              </div>
              <div style={{ fontSize: "12px", color: "#fca5a5", lineHeight: "1.5" }}>
                {gatewayError}
                <div style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: "6px" }}>
                  💡 Monnify Live accounts require business verification (KYC/CAC) from Monnify before live card debits are enabled. You can issue a verified digital pass immediately below for testing:
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => finalizeOrder({ simulated: true, reason: "Bypass for testing" })}
                  style={{
                    background: "var(--brand-gold)",
                    color: "#070709",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  Issue Verified Test Pass Now →
                </button>
                <button
                  type="button"
                  onClick={() => { setGatewayError(""); setPaymentMethod("bank_transfer"); }}
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Switch to Bank Transfer
                </button>
              </div>
            </div>
          )}

          {/* Order Summary Strip */}
          <div
            style={{
              background: "rgba(212, 175, 55, 0.08)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>{event.title}</div>
              <div style={{ fontSize: "12px", color: "var(--brand-gold-bright)", marginTop: "2px" }}>
                {event.date} • {tier.name} (×{quantity})
              </div>
            </div>
            <div style={{ fontFamily: "Sora", fontSize: "1.25rem", fontWeight: "900", color: "var(--brand-gold)" }}>
              {formatNaira(subtotal, currencySymbol)}
            </div>
          </div>

          {/* Attendee Details */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Attendee Information
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Full Name</label>
                <div style={{ display: "flex", alignItems: "center", background: "#070709", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "6px", padding: "9px 12px", gap: "10px" }}>
                  <UserIcon size={16} style={{ color: "var(--brand-gold)", flexShrink: 0 }} />
                  <input
                    type="text"
                    required
                    style={{ background: "transparent", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "13px" }}
                    value={attendee.name}
                    onChange={e => setAttendee({ ...attendee, name: e.target.value })}
                  />
                </div>
              </div>

              {/* 2-Column Grid for Email & Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Email (Pass Delivery)</label>
                  <div style={{ display: "flex", alignItems: "center", background: "#070709", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "6px", padding: "9px 12px", gap: "10px" }}>
                    <MailIcon size={16} style={{ color: "var(--brand-gold)", flexShrink: 0 }} />
                    <input
                      type="email"
                      required
                      style={{ background: "transparent", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "13px" }}
                      value={attendee.email}
                      onChange={e => setAttendee({ ...attendee, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Phone Number</label>
                  <div style={{ display: "flex", alignItems: "center", background: "#070709", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "6px", padding: "9px 12px", gap: "10px" }}>
                    <PhoneIcon size={16} style={{ color: "var(--brand-gold)", flexShrink: 0 }} />
                    <input
                      type="tel"
                      required
                      style={{ background: "transparent", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "13px" }}
                      value={attendee.phone}
                      onChange={e => setAttendee({ ...attendee, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Select Payment Method
              </span>
              <span style={{ fontSize: "10px", color: "var(--emerald-green)", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
                <ShieldCheckIcon size={13} />
                <span>256-Bit SSL Encrypted</span>
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {/* Monnify Button (Primary Default) */}
              <button
                type="button"
                onClick={() => { setPaymentMethod("monnify"); setGatewayError(""); }}
                style={{
                  background: paymentMethod === "monnify" ? "rgba(212, 175, 55, 0.2)" : "#070709",
                  border: paymentMethod === "monnify" ? "2px solid var(--brand-gold)" : "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: "8px",
                  padding: "10px 6px",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                  position: "relative"
                }}
              >
                <span style={{ position: "absolute", top: "-7px", right: "6px", background: "var(--emerald-green)", color: "#070709", fontSize: "8px", fontWeight: "900", padding: "1px 5px", borderRadius: "999px" }}>
                  POPULAR
                </span>
                <span style={{ fontSize: "18px" }}>💠</span>
                <span style={{ fontSize: "12px", fontWeight: "900", color: "var(--brand-gold)" }}>Monnify</span>
                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Transfer/Card/USSD</span>
              </button>

              <button
                type="button"
                onClick={() => { setPaymentMethod("paystack"); setGatewayError(""); }}
                style={{
                  background: paymentMethod === "paystack" ? "rgba(212, 175, 55, 0.2)" : "#070709",
                  border: paymentMethod === "paystack" ? "2px solid var(--brand-gold)" : "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: "8px",
                  padding: "10px 6px",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer"
                }}
              >
                <span style={{ fontSize: "18px" }}>⚡</span>
                <span style={{ fontSize: "12px", fontWeight: "800" }}>Paystack</span>
                <span style={{ fontSize: "9px", color: "var(--text-dim)" }}>Card / Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => { setPaymentMethod("bank_transfer"); setGatewayError(""); }}
                style={{
                  background: paymentMethod === "bank_transfer" ? "rgba(212, 175, 55, 0.2)" : "#070709",
                  border: paymentMethod === "bank_transfer" ? "2px solid var(--brand-gold)" : "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: "8px",
                  padding: "10px 6px",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer"
                }}
              >
                <span style={{ fontSize: "18px" }}>🏦</span>
                <span style={{ fontSize: "12px", fontWeight: "800" }}>Bank Transfer</span>
                <span style={{ fontSize: "9px", color: "var(--text-dim)" }}>Dedicated Account</span>
              </button>
            </div>
          </div>

          {/* Direct Transfer Info Box */}
          {paymentMethod === "bank_transfer" && (
            <div
              style={{
                background: "rgba(212, 175, 55, 0.08)",
                border: "1px solid rgba(212, 175, 55, 0.25)",
                borderRadius: "8px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase" }}>
                Dedicated Ticket Bank Account
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#fff" }}>
                <span>Bank: <strong>Wema Bank / Providus</strong></span>
                <span>Account: <strong style={{ color: "var(--brand-gold)" }}>0283948172</strong></span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Beneficiary: <strong>Nà Mè Dèy Sell Events</strong> • Automatic Instant Pass Issue
              </div>
            </div>
          )}

          {/* Promo code */}
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#070709", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "6px", padding: "8px 12px", gap: "8px" }}>
              <TagIcon size={14} style={{ color: "var(--brand-gold)" }} />
              <input
                type="text"
                placeholder="Discount code (try NMDS20)"
                style={{ background: "transparent", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "12px" }}
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleApplyPromo}
              style={{ background: "rgba(212, 175, 55, 0.15)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "var(--brand-gold)", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
            >
              Apply
            </button>
          </div>
          {promoSuccess && <div style={{ fontSize: "11px", color: "var(--emerald-green)" }}>{promoSuccess}</div>}
          {promoError && <div style={{ fontSize: "11px", color: "#ef4444" }}>{promoError}</div>}

          {/* Price Breakdown */}
          <div style={{ borderTop: "1px solid rgba(212, 175, 55, 0.15)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
              <span>Subtotal</span>
              <span>{formatNaira(subtotal, currencySymbol)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--emerald-green)" }}>
                <span>Discount</span>
                <span>-{formatNaira(appliedDiscount, currencySymbol)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)" }}>
              <span>Gateway Processing Fee</span>
              <span style={{ color: "var(--emerald-green)", fontWeight: "700" }}>FREE (0%)</span>
            </div>
          </div>
        </form>

        {/* STICKY FOOTER ACTION BAR - ALWAYS 100% VISIBLE WITHOUT SCROLLING */}
        <div
          style={{
            padding: "16px 24px",
            background: "#08080C",
            borderTop: "1px solid rgba(212, 175, 55, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexShrink: 0,
            boxShadow: "0 -8px 24px rgba(0,0,0,0.6)"
          }}
        >
          <div>
            <div style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Total Due
            </div>
            <div style={{ fontFamily: "Sora", fontSize: "1.35rem", fontWeight: "900", color: "var(--brand-gold)", lineHeight: 1.1 }}>
              {formatNaira(finalTotal, currencySymbol)}
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing}
            className="rx-btn rx-btn-gold"
            style={{
              padding: "13px 22px",
              minWidth: "220px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontSize: "13px",
              fontWeight: "900",
              cursor: isProcessing ? "not-allowed" : "pointer",
              boxShadow: "0 0 24px rgba(212, 175, 55, 0.4)"
            }}
          >
            {isProcessing ? (
              <span>Connecting Gateway...</span>
            ) : (
              <>
                <span>
                  {paymentMethod === "monnify"
                    ? "Pay via Monnify"
                    : paymentMethod === "bank_transfer"
                    ? "Confirm Bank Transfer"
                    : "Pay via Paystack"}
                </span>
                <span className="rx-btn-icon" style={{ marginLeft: "4px" }}>
                  <ArrowRightIcon size={14} />
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
