"use client";

import { useState } from "react";
import { CloseIcon, PlusIcon, SparklesIcon, CalendarIcon, MapPinIcon } from "./Icons";
import { saveNewEvent } from "../lib/ticketService";
import CitySearchSelector from "./CitySearchSelector";

export default function CreateEventModal({ onClose, onEventCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "Parties & Nightlife",
    date: "Dec 20, 2026",
    time: "07:00 PM - 03:00 AM",
    venue: "Landmark Beach Arena",
    city: "Victoria Island, Lagos, Nigeria",
    address: "Water Corporation Road, Oniru",
    organizer: "Naija Entertainment Group",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    description: "An electrifying live concert and cultural gathering with top afrobeat stars, gourmet food stalls, and unforgettable music vibes.",
    tier1Name: "Regular Admission",
    tier1Price: 5000,
    tier1Capacity: 500,
    tier2Name: "VIP Lounge Pass",
    tier2Price: 25000,
    tier2Capacity: 100,
    tier3Name: "Table of 8",
    tier3Price: 200000,
    tier3Capacity: 15,
    accentColor: "#522672"
  });

  const categories = [
    "Parties & Nightlife",
    "Concerts & Music",
    "Tech & Business",
    "Food & Festivals",
    "Campus & Comedy",
    "Arts & Culture"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.venue) {
      alert("Please fill in the event title and venue.");
      return;
    }

    const newEvent = {
      id: `evt_user_${Date.now()}`,
      title: formData.title,
      subtitle: formData.subtitle || "Official Nà Mè Dèy Sell Verified Event",
      category: formData.category,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      city: formData.city,
      address: formData.address,
      organizer: formData.organizer || "Event Organizer",
      badge: "✨ Newly Published",
      liveSoldText: "Just Launched",
      xpReward: 60,
      goingCount: 25,
      accentColor: formData.accentColor,
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
      bannerPattern: `linear-gradient(135deg, ${formData.accentColor} 0%, #11081a 100%)`,
      description: formData.description,
      tiers: [
        {
          id: `tier_1_${Date.now()}`,
          name: formData.tier1Name,
          price: Number(formData.tier1Price),
          currency: "₦",
          capacity: Number(formData.tier1Capacity),
          soldCount: 0,
          description: "General event entry and official verified mobile QR pass.",
          perks: ["Access to main event arena", "Verified digital Ticket ID", "+60 NMDS XP points"]
        },
        {
          id: `tier_2_${Date.now()}`,
          name: formData.tier2Name,
          price: Number(formData.tier2Price),
          currency: "₦",
          capacity: Number(formData.tier2Capacity),
          soldCount: 0,
          description: "Priority VIP entry, lounge access, and expedited bar.",
          perks: ["Express fast-track gate entry", "VIP lounge viewing deck", "Complimentary drink ticket"]
        }
      ]
    };

    if (formData.tier3Price) {
      newEvent.tiers.push({
        id: `tier_3_${Date.now()}`,
        name: formData.tier3Name,
        price: Number(formData.tier3Price),
        currency: "₦",
        capacity: Number(formData.tier3Capacity),
        soldCount: 0,
        description: "Private reserved table service for your party.",
        perks: ["Dedicated table service & security", "Premium drink bottles & platter"]
      });
    }

    saveNewEvent(newEvent);
    onEventCreated(newEvent);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: "720px" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px", background: "#1a0e28", borderBottom: "1px solid rgba(217, 192, 235, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(82, 38, 114, 0.5)", border: "1px solid var(--brand-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-gold)" }}>
              <PlusIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#fff" }}>Publish Event on Nà Mè Dèy Sell</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Start selling tickets sharp-sharp with instant payout settlement
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(85vh - 120px)", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Basic Info */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Event Basics
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Detty Rave Beach Carnival"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Subtitle / Hook</label>
                <input
                  type="text"
                  placeholder="e.g. Africa's premier sound & dance celebration"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Category</label>
                  <select
                    style={{ width: "100%", background: "#11081a", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "13px" }}
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Organizer / Brand</label>
                  <input
                    type="text"
                    style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                    value={formData.organizer}
                    onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date & Location */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Date & Location
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Date</label>
                <input
                  type="text"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Time</label>
                <input
                  type="text"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Venue Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eko Convention Centre"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                  value={formData.venue}
                  onChange={e => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  City & Country (Worldwide)
                </label>
                <CitySearchSelector
                  value={formData.city}
                  onChange={(selectedCity) => setFormData({ ...formData, city: selectedCity })}
                />
              </div>
            </div>
          </div>

          {/* Ticket Tiers Pricing (in Naira) */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Ticket Pricing Tiers (₦ Naira)
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>Tier 1 Name</label>
                <input
                  type="text"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 12px", color: "#fff", outline: "none", fontSize: "13px" }}
                  value={formData.tier1Name}
                  onChange={e => setFormData({ ...formData, tier1Name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>Price (₦)</label>
                <input
                  type="number"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 12px", color: "#fff", outline: "none", fontSize: "13px" }}
                  value={formData.tier1Price}
                  onChange={e => setFormData({ ...formData, tier1Price: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>Capacity</label>
                <input
                  type="number"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 12px", color: "#fff", outline: "none", fontSize: "13px" }}
                  value={formData.tier1Capacity}
                  onChange={e => setFormData({ ...formData, tier1Capacity: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>Tier 2 Name</label>
                <input
                  type="text"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 12px", color: "#fff", outline: "none", fontSize: "13px" }}
                  value={formData.tier2Name}
                  onChange={e => setFormData({ ...formData, tier2Name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>Price (₦)</label>
                <input
                  type="number"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 12px", color: "#fff", outline: "none", fontSize: "13px" }}
                  value={formData.tier2Price}
                  onChange={e => setFormData({ ...formData, tier2Price: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>Capacity</label>
                <input
                  type="number"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 12px", color: "#fff", outline: "none", fontSize: "13px" }}
                  value={formData.tier2Capacity}
                  onChange={e => setFormData({ ...formData, tier2Capacity: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Banner Image URL */}
          <div>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Banner Image URL</label>
            <input
              type="url"
              style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "13px" }}
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          {/* Submit Split Button */}
          <button
            type="submit"
            className="rx-btn rx-btn-gold"
            style={{ width: "100%", marginTop: "10px" }}
          >
            <span className="rx-btn-text" style={{ flex: 1 }}>
              Publish Event & Go Live
            </span>
            <span className="rx-btn-icon">
              <SparklesIcon size={16} />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
