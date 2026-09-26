"use client";

import { useState } from "react";
import { CloseIcon, UserIcon, MailIcon, PhoneIcon, CreditCardIcon, ShieldCheckIcon, TagIcon, CheckCircleIcon, SparklesIcon } from "./Icons";
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
        onClose: () => {
          setIsProcessing(false);
        },
        onError: (err) => {
          setIsProcessing(false);
          alert("Payment could not be processed. Please check your connection or details.");
        }
      });
    } else {
      // Direct simulation for other methods
      setTimeout(() => {
        finalizeOrder();
      }, 1200);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: "580px" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px", background: "#1a0e28", borderBottom: "1px solid rgba(217, 192, 235, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Secure Checkout</span>
              <span style={{ fontSize: "10px", background: "var(--primary-purple)", color: "var(--brand-gold)", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>
                Nà Mè Dèy Sell
              </span>
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Instant verifiable digital ticket issued directly to your pass wallet
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCompleteOrder} style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(85vh - 100px)", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Order Summary Strip */}
          <div style={{ background: "rgba(82, 38, 114, 0.25)", border: "1px solid rgba(217, 192, 235, 0.2)", borderRadius: "8px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>{event.title}</div>
              <div style={{ fontSize: "12px", color: "var(--brand-lavender)", marginTop: "2px" }}>
                {event.date} • {tier.name} (×{quantity})
              </div>
            </div>
            <div style={{ fontFamily: "Sora", fontSize: "1.3rem", fontWeight: "900", color: "var(--brand-gold)" }}>
              {formatNaira(subtotal, currencySymbol)}
            </div>
          </div>

          {/* Attendee Details */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Attendee Information
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Full Name</label>
                <div style={{ display: "flex", alignItems: "center", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "10px 14px", gap: "10px" }}>
                  <UserIcon size={16} style={{ color: "var(--text-dim)" }} />
                  <input
                    type="text"
                    required
                    style={{ background: "transparent", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "14px" }}
                    value={attendee.name}
                    onChange={e => setAttendee({ ...attendee, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Email Address (Pass Sent Here)</label>
                <div style={{ display: "flex", alignItems: "center", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "10px 14px", gap: "10px" }}>
                  <MailIcon size={16} style={{ color: "var(--text-dim)" }} />
                  <input
                    type="email"
                    required
                    style={{ background: "transparent", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "14px" }}
                    value={attendee.email}
                    onChange={e => setAttendee({ ...attendee, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Phone Number (SMS QR Backup)</label>
                <div style={{ display: "flex", alignItems: "center", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "10px 14px", gap: "10px" }}>
                  <PhoneIcon size={16} style={{ color: "var(--text-dim)" }} />
                  <input
                    type="tel"
                    required
                    style={{ background: "transparent", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "14px" }}
                    value={attendee.phone}
                    onChange={e => setAttendee({ ...attendee, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Select Payment Gateway
              </span>
              <span style={{ fontSize: "11px", color: "var(--emerald-green)", display: "flex", alignItems: "center", gap: "5px", fontWeight: "600" }}>
                <ShieldCheckIcon size={14} />
                <span>256-Bit Encrypted</span>
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {/* Monnify Button (Highlighted Primary) */}
              <button
                type="button"
                onClick={() => setPaymentMethod("monnify")}
                style={{
                  background: paymentMethod === "monnify" ? "rgba(82, 38, 114, 0.7)" : "rgba(17,8,26,0.6)",
                  border: paymentMethod === "monnify" ? "2px solid var(--brand-gold)" : "1px solid rgba(217,192,235,0.15)",
                  borderRadius: "8px",
                  padding: "12px 8px",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  position: "relative"
                }}
              >
                <span style={{ position: "absolute", top: "-8px", right: "6px", background: "var(--emerald-green)", color: "#11081a", fontSize: "9px", fontWeight: "900", padding: "1px 6px", borderRadius: "999px" }}>
                  POPULAR
                </span>
                <span style={{ fontSize: "20px" }}>💠</span>
                <span style={{ fontSize: "12px", fontWeight: "900", color: "var(--brand-gold)" }}>Monnify</span>
                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Transfer/Card/USSD</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("paystack")}
                style={{
                  background: paymentMethod === "paystack" ? "rgba(82, 38, 114, 0.5)" : "rgba(17,8,26,0.6)",
                  border: paymentMethod === "paystack" ? "2px solid var(--brand-gold)" : "1px solid rgba(217,192,235,0.15)",
                  borderRadius: "8px",
                  padding: "12px 8px",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                <span style={{ fontSize: "20px" }}>⚡</span>
                <span style={{ fontSize: "12px", fontWeight: "800" }}>Paystack</span>
                <span style={{ fontSize: "9px", color: "var(--text-dim)" }}>Card / Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bank_transfer")}
                style={{
                  background: paymentMethod === "bank_transfer" ? "rgba(82, 38, 114, 0.5)" : "rgba(17,8,26,0.6)",
                  border: paymentMethod === "bank_transfer" ? "2px solid var(--brand-gold)" : "1px solid rgba(217,192,235,0.15)",
                  borderRadius: "8px",
                  padding: "12px 8px",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                <span style={{ fontSize: "20px" }}>🏦</span>
                <span style={{ fontSize: "12px", fontWeight: "800" }}>Direct Transfer</span>
                <span style={{ fontSize: "9px", color: "var(--text-dim)" }}>Dedicated Account</span>
              </button>
            </div>
          </div>

          {/* Promo code */}
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 12px", gap: "8px" }}>
              <TagIcon size={15} style={{ color: "var(--text-dim)" }} />
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
              style={{ background: "rgba(217,192,235,0.15)", border: "1px solid rgba(217,192,235,0.25)", color: "#fff", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
            >
              Apply
            </button>
          </div>
          {promoSuccess && <div style={{ fontSize: "12px", color: "var(--emerald-green)" }}>{promoSuccess}</div>}
          {promoError && <div style={{ fontSize: "12px", color: "#ef4444" }}>{promoError}</div>}

          {/* Price Breakdown */}
          <div style={{ borderTop: "1px solid rgba(217,192,235,0.12)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
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
              <span style={{ color: "var(--emerald-green)" }}>FREE (0%)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "900", color: "#fff", marginTop: "6px" }}>
              <span>Total Due</span>
              <span style={{ fontFamily: "Sora", color: "var(--brand-gold)" }}>{formatNaira(finalTotal, currencySymbol)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="rx-btn rx-btn-gold"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <span className="rx-btn-text" style={{ flex: 1 }}>
              {isProcessing
                ? "Connecting Monnify..."
                : paymentMethod === "monnify"
                ? `Pay ${formatNaira(finalTotal, currencySymbol)} via Monnify`
                : `Pay ${formatNaira(finalTotal, currencySymbol)} Now`}
            </span>
            <span className="rx-btn-icon">
              <ShieldCheckIcon size={18} />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
