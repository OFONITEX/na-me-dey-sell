"use client";

import { useState } from "react";
import { CloseIcon, PlusIcon, SparklesIcon, CalendarIcon, MapPinIcon } from "./Icons";
import { saveNewEvent } from "../lib/ticketService";
import CitySearchSelector from "./CitySearchSelector";
import DatePickerCalendar from "./DatePickerCalendar";
import VenueLocationSearch from "./VenueLocationSearch";
import { SUPPORTED_CURRENCIES } from "../data/currencies";

export default function CreateEventModal({ onClose, onEventCreated }) {
  const [selectedCurrency, setSelectedCurrency] = useState(SUPPORTED_CURRENCIES[0]); // NGN default

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "Concerts & Music",
    date: "Thursday, 8th October, 2026",
    time: "07:00 PM - 02:00 AM",
    venue: "Camp Gee Arena & Events",
    city: "Uyo, Akwa Ibom, Nigeria",
    address: "Ring Road 3, Uyo",
    organizer: "Naija Live Entertainment",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    description: "An electrifying live concert and cultural gathering with top afrobeat stars, gourmet food stalls, and unforgettable music vibes.",
    accentColor: "#522672"
  });

  // Dynamic Tiers state (supporting up to 10 tiers for concerts, arenas and stadiums)
  const [tiers, setTiers] = useState([
    {
      id: "tier_1",
      name: "Regular Admission",
      price: 5000,
      capacity: 500,
      description: "Access to main arena floor & verified digital QR pass."
    },
    {
      id: "tier_2",
      name: "VIP Lounge Pass",
      price: 25000,
      capacity: 150,
      description: "Express priority gate check-in & VIP lounge viewing deck."
    }
  ]);

  const categories = [
    "Concerts & Music",
    "Parties & Nightlife",
    "Food & Festivals",
    "Campus & Comedy",
    "Tech & Business",
    "Arts & Culture"
  ];

  // Helper to add tier (max 10)
  const handleAddTier = () => {
    if (tiers.length >= 10) {
      alert("Maximum 10 ticket tiers reached (Stadium / Arena limit).");
      return;
    }
    const tierNum = tiers.length + 1;
    const defaultNames = [
      "Regular Admission",
      "VIP Lounge Pass",
      "Golden Circle",
      "VVIP Front Row",
      "Executive Box",
      "Backstage Platinum Pass",
      "Student Concession",
      "Early Bird Pass",
      "Cabana Booth (Table of 6)",
      "Presidential Suite"
    ];
    const defaultName = defaultNames[tierNum - 1] || `Tier ${tierNum}`;
    const defaultPrice = (tierNum * 5000);

    setTiers([
      ...tiers,
      {
        id: `tier_${Date.now()}_${tierNum}`,
        name: defaultName,
        price: defaultPrice,
        capacity: 100,
        description: `Dedicated ${defaultName} access with verified QR code.`
      }
    ]);
  };

  const handleRemoveTier = (indexToRemove) => {
    if (tiers.length <= 1) {
      alert("At least one ticket tier is required for ticketing.");
      return;
    }
    setTiers(tiers.filter((_, idx) => idx !== indexToRemove));
  };

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

  // Quick 6-tier Stadium / Concert preset
  const handleLoadStadiumPreset = () => {
    setTiers([
      { id: `tier_${Date.now()}_1`, name: "Early Bird Standing", price: 3500, capacity: 800, description: "Early entrance general floor standing." },
      { id: `tier_${Date.now()}_2`, name: "Regular Admission", price: 7000, capacity: 2500, description: "Standard arena floor access & digital pass." },
      { id: `tier_${Date.now()}_3`, name: "Golden Circle (Stage Front)", price: 20000, capacity: 500, description: "Prime barricade viewing right by the main stage." },
      { id: `tier_${Date.now()}_4`, name: "VIP Grandstand Seating", price: 45000, capacity: 300, description: "Reserved elevated stadium seats with fast-track entry." },
      { id: `tier_${Date.now()}_5`, name: "VVIP Royal Hospitality Box", price: 120000, capacity: 100, description: "Catered hospitality lounge with open bar and meet & greet." },
      { id: `tier_${Date.now()}_6`, name: "Backstage Platinum All-Access", price: 250000, capacity: 30, description: "Artist lounge pass, soundcheck access & VIP gift pack." }
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.venue) {
      alert("Please fill in the event title and venue.");
      return;
    }

    if (tiers.length === 0) {
      alert("Please add at least one ticket tier.");
      return;
    }

    const eventTiers = tiers.map((t, idx) => ({
      id: t.id || `tier_${Date.now()}_${idx + 1}`,
      name: t.name || `Tier ${idx + 1}`,
      price: Number(t.price) || 0,
      currency: selectedCurrency.symbol,
      currencyCode: selectedCurrency.code,
      capacity: Number(t.capacity) || 100,
      soldCount: 0,
      description: t.description || "General entry with official verified mobile QR pass.",
      perks: [
        `Access to ${t.name}`,
        "Verified digital QR pass",
        `Instant mobile check-in`
      ]
    }));

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
      goingCount: 35,
      currency: selectedCurrency.symbol,
      currencyCode: selectedCurrency.code,
      accentColor: formData.accentColor,
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
      bannerPattern: `linear-gradient(135deg, ${formData.accentColor} 0%, #11081a 100%)`,
      description: formData.description,
      tiers: eventTiers
    };

    saveNewEvent(newEvent);
    onEventCreated(newEvent);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-panel"
        style={{
          maxWidth: "780px",
          width: "95%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          overflow: "hidden"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "18px 24px", background: "#1a0e28", borderBottom: "1px solid rgba(217, 192, 235, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(82, 38, 114, 0.6)", border: "1px solid var(--brand-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-gold)" }}>
              <PlusIcon size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#fff", margin: 0 }}>Publish Event on Nà Mè Dèy Sell</h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "3px 0 0 0" }}>
                Start selling tickets sharp-sharp with instant payout settlement
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close modal">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "22px" }}>
          
          {/* SECTION 1: Event Basics */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(217,192,235,0.08)" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              1. Event Basics
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Detty Rave Beach Carnival / Ring Road Music Concert"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Subtitle / Hook</label>
                <input
                  type="text"
                  placeholder="e.g. Live stage concert & cultural food showcase"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Category</label>
                  <select
                    style={{ width: "100%", background: "#11081a", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "13px" }}
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
                    style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                    value={formData.organizer}
                    onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Date & Time (Calendar Popup with Day & Date) */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(217,192,235,0.08)" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              2. Date & Time
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <CalendarIcon size={14} style={{ color: "var(--brand-gold)" }} />
                  <span>Event Date (Click to Pop Up Calendar)</span>
                </label>
                {/* Interactive Date Picker with Day & Date */}
                <DatePickerCalendar
                  value={formData.date}
                  onChange={(selectedFormattedDate) => setFormData(prev => ({ ...prev, date: selectedFormattedDate }))}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Event Time / Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 06:00 PM - 02:00 AM"
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Venue & Location (Search Button, Suggestions & Embedded Map) */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(217,192,235,0.08)" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              3. Venue & Location Navigation
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <MapPinIcon size={14} style={{ color: "var(--brand-gold)" }} />
                  <span>Venue & Street Address (Search Location & Suggest)</span>
                </label>
                {/* Searchable Venue Finder with Embedded Map Navigation */}
                <VenueLocationSearch
                  venueValue={formData.venue}
                  addressValue={formData.address}
                  onChange={({ venue, address, city }) => {
                    setFormData(prev => ({
                      ...prev,
                      venue,
                      address,
                      city: city ? `${city}, Nigeria` : prev.city
                    }));
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  City & Country (Worldwide Search)
                </label>
                <CitySearchSelector
                  value={formData.city}
                  onChange={(selectedCity) => setFormData(prev => ({ ...prev, city: selectedCity }))}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Ticket Pricing Tiers & Currency Selection (Up to 10 Tiers) */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(217,192,235,0.08)" }}>
            {/* Header with Title and Currency Selector */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  4. Ticket Pricing Tiers ({tiers.length}/10 Tiers)
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Configure up to 10 seating/admission tiers for arenas, stadiums & concerts.
                </div>
              </div>

              {/* Currency Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(17,8,26,0.9)", border: "1px solid rgba(217,192,235,0.25)", borderRadius: "8px", padding: "4px 8px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--brand-lavender)", textTransform: "uppercase" }}>
                  Currency:
                </span>
                <select
                  value={selectedCurrency.code}
                  onChange={e => {
                    const match = SUPPORTED_CURRENCIES.find(c => c.code === e.target.value);
                    if (match) setSelectedCurrency(match);
                  }}
                  style={{
                    background: "transparent",
                    color: "var(--brand-gold)",
                    border: "none",
                    fontWeight: "800",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  {SUPPORTED_CURRENCIES.map(curr => (
                    <option key={curr.code} value={curr.code} style={{ background: "#11081a", color: "#fff" }}>
                      {curr.flag} {curr.code} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Action: Load Stadium / Arena Preset */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "12px", padding: "8px 12px", background: "rgba(82, 38, 114, 0.25)", border: "1px dashed rgba(217, 192, 235, 0.3)", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--brand-lavender)" }}>
                Need standard arena sections?
              </span>
              <button
                type="button"
                onClick={handleLoadStadiumPreset}
                style={{
                  background: "rgba(255, 215, 0, 0.15)",
                  border: "1px solid var(--brand-gold)",
                  color: "var(--brand-gold)",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                ⚡ Load Stadium Preset (6 Tiers)
              </button>
            </div>

            {/* Tiers List (Max 10) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tiers.map((tier, index) => (
                <div
                  key={tier.id || index}
                  style={{
                    background: "rgba(17,8,26,0.8)",
                    border: "1px solid rgba(217,192,235,0.15)",
                    borderRadius: "8px",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(140px, 2fr) minmax(90px, 1fr) minmax(80px, 1fr) auto", gap: "10px", alignItems: "end" }}>
                    <div>
                      <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                        Tier {index + 1} Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Regular / VIP"
                        style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 10px", color: "#fff", outline: "none", fontSize: "13px" }}
                        value={tier.name}
                        onChange={e => handleUpdateTier(index, "name", e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                        Price ({selectedCurrency.symbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 10px", color: "var(--brand-gold)", fontWeight: "700", outline: "none", fontSize: "13px" }}
                        value={tier.price}
                        onChange={e => handleUpdateTier(index, "price", e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                        Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 10px", color: "#fff", outline: "none", fontSize: "13px" }}
                        value={tier.capacity}
                        onChange={e => handleUpdateTier(index, "capacity", e.target.value)}
                      />
                    </div>

                    {/* Delete Tier Button */}
                    <button
                      type="button"
                      disabled={tiers.length <= 1}
                      onClick={() => handleRemoveTier(index)}
                      title="Remove tier"
                      style={{
                        height: "36px",
                        width: "36px",
                        background: tiers.length <= 1 ? "rgba(255,255,255,0.05)" : "rgba(244,67,54,0.15)",
                        border: "1px solid rgba(244,67,54,0.3)",
                        borderRadius: "6px",
                        color: tiers.length <= 1 ? "rgba(255,255,255,0.2)" : "#ff6b6b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: tiers.length <= 1 ? "not-allowed" : "pointer"
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Perks / Seating description (e.g. Stage front, complimentary drink, VIP gate access)"
                      style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(217,192,235,0.1)", padding: "4px 2px", color: "var(--text-muted)", fontSize: "11px", outline: "none" }}
                      value={tier.description || ""}
                      onChange={e => handleUpdateTier(index, "description", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Tier Action Button (Up to 10) */}
            <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {tiers.length < 10 ? (
                <button
                  type="button"
                  onClick={handleAddTier}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(217, 192, 235, 0.12)",
                    border: "1px solid rgba(217, 192, 235, 0.3)",
                    color: "var(--brand-lavender)",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  <PlusIcon size={14} />
                  <span>+ Add Ticket Tier ({tiers.length}/10)</span>
                </button>
              ) : (
                <span style={{ fontSize: "12px", color: "var(--brand-gold)", fontWeight: "700" }}>
                  ✓ Maximum 10 Tiers reached (Concert & Stadium limit)
                </span>
              )}

              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                All tiers priced in {selectedCurrency.name}
              </span>
            </div>
          </div>

          {/* SECTION 5: Banner Image & Description */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(217,192,235,0.08)" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              5. Media & Highlights
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "13px" }}
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Event Description</label>
                <textarea
                  rows={3}
                  style={{ width: "100%", background: "rgba(17,8,26,0.7)", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "13px", resize: "vertical" }}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Submit Split Button */}
          <button
            type="submit"
            className="rx-btn rx-btn-gold"
            style={{ width: "100%", marginTop: "4px", padding: "14px" }}
          >
            <span className="rx-btn-text" style={{ flex: 1, fontSize: "15px", fontWeight: "800" }}>
              Publish Event & Go Live ({tiers.length} Tiers in {selectedCurrency.code})
            </span>
            <span className="rx-btn-icon">
              <SparklesIcon size={18} />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
