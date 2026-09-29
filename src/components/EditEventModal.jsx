"use client";

import { useState, useEffect } from "react";
import {
  CloseIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  SparklesIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  CreditCardIcon,
  AlertTriangleIcon
} from "./Icons";
import { updateEvent, formatNaira } from "../lib/ticketService";
import { triggerConfetti } from "../lib/confetti";

export default function EditEventModal({
  event,
  isOpen,
  onClose,
  onEventUpdated
}) {
  if (!isOpen || !event) return null;

  const [activeTab, setActiveTab] = useState("general"); // "general" | "tiers" | "media"
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    title: event.title || "",
    subtitle: event.subtitle || "",
    category: event.category || "Concerts",
    date: event.date || "",
    time: event.time || "",
    venue: event.venue || "",
    city: event.city || "",
    address: event.address || "",
    organizer: event.organizer || "",
    organizerEmail: event.organizerEmail || "",
    organizerPhone: event.organizerPhone || "",
    organizerId: event.organizerId || "",
    createdBy: event.createdBy || "",
    description: event.description || "",
    accentColor: event.accentColor || "#D4AF37",
    imageUrl: event.imageUrl || "",
    status: event.status || "live"
  });

  const [tiers, setTiers] = useState(
    event.tiers && event.tiers.length > 0
      ? event.tiers.map(t => ({ ...t }))
      : [
          {
            id: `tier_${Date.now()}_1`,
            name: "Regular Admission",
            price: 5000,
            capacity: 500,
            description: "Standard entry pass."
          }
        ]
  );

  // Synchronize state dynamically whenever event prop changes or modal opens
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        subtitle: event.subtitle || "",
        category: event.category || "Concerts",
        date: event.date || "",
        time: event.time || "",
        venue: event.venue || "",
        city: event.city || "",
        address: event.address || "",
        organizer: event.organizer || "",
        organizerEmail: event.organizerEmail || "",
        organizerPhone: event.organizerPhone || "",
        organizerId: event.organizerId || "",
        createdBy: event.createdBy || "",
        description: event.description || "",
        accentColor: event.accentColor || "#D4AF37",
        imageUrl: event.imageUrl || "",
        status: event.status || "live"
      });

      setTiers(
        event.tiers && event.tiers.length > 0
          ? event.tiers.map(t => ({ ...t }))
          : [
              {
                id: `tier_${Date.now()}_1`,
                name: "Regular Admission",
                price: 5000,
                capacity: 500,
                description: "Standard entry pass."
              }
            ]
      );
      setErrorMessage("");
      setSuccessToast("");
    }
  }, [event]);

  const categories = [
    "Corporate Events",
    "Weddings",
    "Festival",
    "Parties / Nightlife",
    "Concerts",
    "Business Event",
    "Tech Event",
    "Arts / Culture",
    "Marketing Event",
    "Food Event"
  ];

  const handleUpdateTier = (index, field, value) => {
    setTiers(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === "price" || field === "capacity" ? Number(value) || 0 : value
      };
      return updated;
    });
  };

  const handleAddTier = () => {
    setTiers(prev => [
      ...prev,
      {
        id: `tier_${Date.now()}_${prev.length + 1}`,
        name: `Tier ${prev.length + 1}`,
        price: 10000,
        capacity: 100,
        currency: event.currency || "₦",
        description: "General access with official verified mobile QR pass."
      }
    ]);
  };

  const handleRemoveTier = (indexToRemove) => {
    if (tiers.length <= 1) {
      alert("At least one ticket tier is required.");
      return;
    }
    setTiers(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!formData.title.trim() || !formData.venue.trim()) {
      setErrorMessage("Event Title and Venue are required.");
      return;
    }

    if (tiers.length === 0) {
      setErrorMessage("At least one ticket tier is required.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedEvent = updateEvent(event.id, {
        ...formData,
        organizer: formData.organizer || event.organizer,
        organizerEmail: formData.organizerEmail || event.organizerEmail || "",
        organizerPhone: formData.organizerPhone || event.organizerPhone || "",
        organizerId: event.organizerId || formData.organizerId || `org_${Date.now()}`,
        createdBy: event.createdBy || formData.createdBy || event.organizerEmail || "",
        tiers: tiers.map(t => ({
          ...t,
          price: Number(t.price) || 0,
          capacity: Number(t.capacity) || 100
        }))
      });

      if (!updatedEvent) {
        throw new Error("Could not update event. Please try again.");
      }

      triggerConfetti();
      setSuccessToast("Event changes published live to marketplace!");

      setTimeout(() => {
        if (onEventUpdated) onEventUpdated(updatedEvent);
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || "Failed to update event.");
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop rx-modal-backdrop rx-edit-modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(5, 5, 8, 0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto"
      }}
      onClick={e => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className="modal-panel rx-modal-card rx-edit-modal-panel"
        style={{
          width: "100%",
          maxWidth: "800px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #13131A 0%, #0B0B0F 100%)",
          border: "1px solid rgba(212, 175, 55, 0.35)",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.2)",
          overflow: "hidden"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Gold Accent Line */}
        <div style={{ height: "3px", width: "100%", background: "linear-gradient(90deg, transparent, #D4AF37, #F5D061, transparent)" }} />

        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#D4AF37",
                  background: "rgba(212, 175, 55, 0.12)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  padding: "2px 8px",
                  borderRadius: "20px"
                }}
              >
                Organizer Studio • Edit Event
              </span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                ID: {event.id}
              </span>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
              Edit Event: {formData.title || "Untitled"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#E2D9BC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          className="rx-edit-tabs"
          style={{
            display: "flex",
            gap: "8px",
            padding: "12px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.2)"
          }}
        >
          {[
            { id: "general", label: "General & Venue" },
            { id: "tiers", label: `Ticket Tiers (${tiers.length})` },
            { id: "media", label: "Flyer Banner & Visuals" }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: activeTab === tab.id ? "800" : "600",
                color: activeTab === tab.id ? "#070709" : "#E2D9BC",
                background: activeTab === tab.id ? "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)" : "rgba(255,255,255,0.05)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div style={{ margin: "16px 24px 0", padding: "10px 14px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "8px", color: "#FCA5A5", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangleIcon size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successToast && (
          <div style={{ margin: "16px 24px 0", padding: "10px 14px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "8px", color: "#6EE7B7", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircleIcon size={16} />
            <span>{successToast}</span>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="rx-edit-form-body" style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
          {activeTab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Event Title */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#D4AF37", marginBottom: "6px" }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: "100%", height: "42px", padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "8px", color: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#E2D9BC", marginBottom: "6px" }}>
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  style={{ width: "100%", height: "42px", padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Category & Status */}
              <div className="rx-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#E2D9BC", marginBottom: "6px" }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 14px", background: "#13131A", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#E2D9BC", marginBottom: "6px" }}>
                    Event Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 14px", background: "#13131A", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none" }}
                  >
                    <option value="live">🟢 Live &amp; Selling Tickets</option>
                    <option value="paused">⏸️ Paused (Ticket Sales Stopped)</option>
                    <option value="draft">📝 Draft</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="rx-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#E2D9BC", marginBottom: "6px" }}>
                    Date &amp; Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    placeholder="e.g. Saturday, 28th Nov 2026"
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#E2D9BC", marginBottom: "6px" }}>
                    Hours / Time Range
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    placeholder="e.g. 07:00 PM - 03:00 AM"
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Venue & City */}
              <div className="rx-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#D4AF37", marginBottom: "6px" }}>
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    placeholder="e.g. Landmark Centre"
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#E2D9BC", marginBottom: "6px" }}>
                    City / State
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    placeholder="e.g. Victoria Island, Lagos"
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: "100%", height: "42px", padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#E2D9BC", marginBottom: "6px" }}>
                  Full Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  placeholder="e.g. Plot 2&3 Water Corporation Road, Oniru"
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: "100%", height: "42px", padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#E2D9BC", marginBottom: "6px" }}>
                  Event Overview &amp; Program Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>

              {/* Organizer Brand & Contact Profile */}
              <div style={{ background: "rgba(212, 175, 55, 0.05)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "12px", padding: "16px", marginTop: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#D4AF37", letterSpacing: "0.05em" }}>
                    Organizer Brand &amp; Contact Details
                  </span>
                  <span style={{ fontSize: "10px", color: "#948B75" }}>
                    (Controls event ownership &amp; attendee contact info)
                  </span>
                </div>
                <div className="rx-form-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#E2D9BC", marginBottom: "4px" }}>
                      ORGANIZER NAME / BRAND
                    </label>
                    <input
                      type="text"
                      value={formData.organizer}
                      onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                      placeholder="e.g. Flytime Promotions HQ"
                      style={{ width: "100%", height: "38px", padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#fff", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#E2D9BC", marginBottom: "4px" }}>
                      ORGANIZER EMAIL
                    </label>
                    <input
                      type="email"
                      value={formData.organizerEmail}
                      onChange={e => setFormData({ ...formData, organizerEmail: e.target.value })}
                      placeholder="info@yourdomain.com"
                      style={{ width: "100%", height: "38px", padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#fff", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#E2D9BC", marginBottom: "4px" }}>
                      ORGANIZER PHONE
                    </label>
                    <input
                      type="tel"
                      value={formData.organizerPhone}
                      onChange={e => setFormData({ ...formData, organizerPhone: e.target.value })}
                      placeholder="+234 800 000 0000"
                      style={{ width: "100%", height: "38px", padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#fff", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tiers" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Ticket Tiers &amp; Pricing</h3>
                  <p style={{ fontSize: "12px", color: "#E2D9BC", margin: "2px 0 0" }}>Configure tickets, price points, and capacities.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTier}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: "800",
                    background: "rgba(212, 175, 55, 0.2)",
                    border: "1px solid rgba(212, 175, 55, 0.4)",
                    color: "#F5D061",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  <PlusIcon size={14} />
                  <span>Add Tier</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {tiers.map((tier, idx) => (
                  <div
                    key={tier.id || idx}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                      borderRadius: "10px",
                      padding: "14px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "#D4AF37" }}>
                        Tier #{idx + 1}
                      </span>
                      {tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#EF4444",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            fontWeight: "700"
                          }}
                        >
                          <TrashIcon size={14} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px", marginBottom: "8px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#948B75", marginBottom: "3px" }}>
                          TIER NAME
                        </label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={e => handleUpdateTier(idx, "name", e.target.value)}
                          placeholder="e.g. VIP Lounge Pass"
                          style={{ width: "100%", height: "36px", padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#948B75", marginBottom: "3px" }}>
                          PRICE ({event.currency || "₦"})
                        </label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={e => handleUpdateTier(idx, "price", e.target.value)}
                          style={{ width: "100%", height: "36px", padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#F5D061", fontSize: "13px", fontWeight: "700", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#948B75", marginBottom: "3px" }}>
                          CAPACITY
                        </label>
                        <input
                          type="number"
                          value={tier.capacity}
                          onChange={e => handleUpdateTier(idx, "capacity", e.target.value)}
                          style={{ width: "100%", height: "36px", padding: "0 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={tier.description || ""}
                        onChange={e => handleUpdateTier(idx, "description", e.target.value)}
                        placeholder="Perks & description (e.g. VIP deck, welcome cocktails, priority check-in)"
                        style={{ width: "100%", height: "32px", padding: "0 10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#E2D9BC", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#E2D9BC", marginBottom: "6px" }}>
                  Primary Event Flyer Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  placeholder="https://example.com/poster.jpg"
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  style={{ width: "100%", height: "42px", padding: "0 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {formData.imageUrl && (
                <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(212, 175, 55, 0.3)" }}>
                  <img
                    src={formData.imageUrl}
                    alt="Event Poster Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />
                  <div style={{ position: "absolute", bottom: "10px", left: "10px", background: "rgba(0,0,0,0.75)", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", color: "#F5D061", fontWeight: "700" }}>
                    Live Flyer Preview
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#E2D9BC", marginBottom: "6px" }}>
                  Brand Accent Glow Color
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                    style={{ width: "42px", height: "42px", border: "none", borderRadius: "8px", cursor: "pointer", background: "none" }}
                  />
                  <span style={{ fontSize: "13px", color: "#E2D9BC", fontFamily: "monospace" }}>{formData.accentColor}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Action Bar */}
          <div
            className="rx-edit-footer"
            style={{
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(212, 175, 55, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px"
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#E2D9BC",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                border: "none",
                color: "#070709",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(212, 175, 55, 0.4)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <SparklesIcon size={16} />
              <span>{isSaving ? "Saving Updates..." : "Save & Publish Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
