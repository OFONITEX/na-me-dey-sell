"use client";

import { useState, useEffect, useRef } from "react";
import { CloseIcon, PlusIcon, SparklesIcon, CalendarIcon, MapPinIcon, CheckCircleIcon, ShieldCheckIcon } from "./Icons";
import { saveNewEvent } from "../lib/ticketService";
import CitySearchSelector from "./CitySearchSelector";
import DatePickerCalendar from "./DatePickerCalendar";
import VenueLocationSearch from "./VenueLocationSearch";
import { SUPPORTED_CURRENCIES } from "../data/currencies";

const DRAFT_STORAGE_KEY = "nmds_event_draft_v1";

export default function CreateEventModal({ onClose, onEventCreated }) {
  const [selectedCurrency, setSelectedCurrency] = useState(SUPPORTED_CURRENCIES[0]); // NGN default
  const [showProModal, setShowProModal] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [savedDraftAvailable, setSavedDraftAvailable] = useState(null);
  const [descActiveTab, setDescActiveTab] = useState("editor"); // 'editor' | 'preview'
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "Concerts",
    date: "Thursday, 8th October, 2026",
    time: "07:00 PM - 02:00 AM",
    venue: "Camp Gee Arena & Events",
    city: "Uyo, Akwa Ibom, Nigeria",
    address: "Ring Road 3, Uyo",
    organizer: "Naija Live Entertainment",
    description: "An electrifying live concert and cultural gathering with top afrobeat stars, gourmet food stalls, and unforgettable music vibes.\n\n📅 EVENT SCHEDULE:\n- 07:00 PM: Red Carpet & VIP Cocktail Arrival\n- 08:30 PM: Opening Acts & Cultural Showcase\n- 10:00 PM: Headline Superstar Live Performance\n- 12:30 AM: Afterparty & Resident DJ Jam\n\n👔 DRESS CODE:\nDress to impress. Smart casual & traditional chic are warmly welcomed.\n\n🔒 SECURITY & ADMISSION:\nStrict digital QR verification at all gates. Licensed security & paramedical marshals on site.",
    accentColor: "#522672"
  });

  // Uploaded flyers (Free limit = 3, Pro limit = 10)
  const [uploadedImages, setUploadedImages] = useState([
    {
      id: "flyer_default",
      url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
      name: "Main Event Flyer",
      isPrimary: true
    }
  ]);

  // Dynamic Tiers state (supporting up to 10 tiers)
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

  // Check for saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.formData?.title || parsed.uploadedImages?.length)) {
          setSavedDraftAvailable(parsed);
        }
      }
    } catch (err) {
      console.warn("Could not check saved draft:", err);
    }
  }, []);

  const handleResumeDraft = () => {
    if (!savedDraftAvailable) return;
    if (savedDraftAvailable.formData) setFormData(savedDraftAvailable.formData);
    if (savedDraftAvailable.tiers) setTiers(savedDraftAvailable.tiers);
    if (savedDraftAvailable.uploadedImages) setUploadedImages(savedDraftAvailable.uploadedImages);
    if (savedDraftAvailable.selectedCurrency) setSelectedCurrency(savedDraftAvailable.selectedCurrency);
    setSavedDraftAvailable(null);
    setDraftSavedToast("Draft restored! You can continue editing your event.");
    setTimeout(() => setDraftSavedToast(false), 4000);
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setSavedDraftAvailable(null);
    } catch (err) {
      console.warn("Could not discard draft:", err);
    }
  };

  // Save work and continue later
  const handleSaveWorkAndContinue = (e) => {
    e?.preventDefault();
    try {
      const draftPayload = {
        formData,
        tiers,
        uploadedImages,
        selectedCurrency,
        savedAt: new Date().toISOString(),
        formattedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
      setDraftSavedToast("Work saved successfully! You can close this window and finish anytime.");
      setTimeout(() => setDraftSavedToast(false), 4500);
    } catch (err) {
      alert("Draft saved to browser memory.");
    }
  };

  // Handle uploading flyer images (max 3 free, up to 10 for Pro)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentCount = uploadedImages.length;
    const freeMax = 3;

    if (currentCount >= freeMax) {
      setShowProModal(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const availableSlots = freeMax - currentCount;
    const filesToProcess = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      setShowProModal(true);
    }

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setUploadedImages(prev => {
          if (prev.length >= 10) return prev;
          const isFirst = prev.length === 0;
          return [
            ...prev,
            {
              id: `flyer_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              url: dataUrl,
              name: file.name || `Flyer #${prev.length + 1}`,
              isPrimary: isFirst
            }
          ];
        });
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages(prev => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleSetPrimaryImage = (index) => {
    setUploadedImages(prev =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index
      }))
    );
  };

  // Description Dashboard template inserter
  const handleInsertDescTemplate = (templateKey) => {
    let snippet = "";
    switch (templateKey) {
      case "schedule":
        snippet = "\n\n📅 EVENT SCHEDULE:\n- 06:00 PM: Doors Open & Red Carpet Photography\n- 07:30 PM: Welcome Speech & Opening Performances\n- 09:00 PM: Main Stage Presentation & Grand Performances\n- 11:30 PM: After-Party & Networking";
        break;
      case "performers":
        snippet = "\n\n🎤 GUEST ARTISTS & HEADLINERS:\n- Top African Afrobeat sensations & celebrity guests\n- Resident and guest international DJs\n- Live instrumental band & hype masters";
        break;
      case "dresscode":
        snippet = "\n\n👔 DRESS CODE & ENTRY POLICY:\n- Strictly Glamorous, Black-Tie or Afro-Chic attire\n- No slippers or athletic sportswear permitted";
        break;
      case "perks":
        snippet = "\n\n🍹 FOOD, DRINKS & HOSPITALITY:\n- Gourmet finger foods & cocktail bars on-site\n- Reserved VIP table butler service for premium ticket holders";
        break;
      case "security":
        snippet = "\n\n🔒 SAFETY & SECURITY:\n- Verified digital QR scan required for admission\n- Uniformed security personnel & fenced perimeter parking";
        break;
      default:
        break;
    }

    setFormData(prev => ({
      ...prev,
      description: (prev.description || "").trim() + snippet
    }));
  };

  // Dynamic Tiers
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

    const primaryFlyer = uploadedImages.find(img => img.isPrimary)?.url || uploadedImages[0]?.url || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80";
    const allFlyers = uploadedImages.map(img => img.url);

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
        "Instant mobile check-in"
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
      imageUrl: primaryFlyer,
      galleryImages: allFlyers,
      bannerPattern: `linear-gradient(135deg, ${formData.accentColor} 0%, #070709 100%)`,
      description: formData.description,
      tiers: eventTiers
    };

    saveNewEvent(newEvent);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (_) {}
    onEventCreated(newEvent);
    onClose();
  };

  const wordCount = (formData.description || "").trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

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
        <div style={{ padding: "18px 24px", background: "#0E0E14", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(212, 175, 55, 0.15)", border: "1px solid var(--brand-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-gold)" }}>
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

        {/* Saved Draft Alert Banner */}
        {savedDraftAvailable && (
          <div style={{ padding: "10px 24px", background: "linear-gradient(90deg, rgba(212,175,55,0.25), rgba(14,14,20,0.9))", borderBottom: "1px solid var(--brand-gold)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ fontSize: "12px", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📝</span>
              <span><strong>Unfinished Draft Found:</strong> You have unsaved event work from {savedDraftAvailable.formattedTime || "a previous session"}.</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={handleResumeDraft}
                style={{ background: "var(--brand-gold)", color: "#070709", border: "none", padding: "4px 12px", borderRadius: "4px", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}
              >
                ⚡ Resume Draft
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                style={{ background: "transparent", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
              >
                ✕ Discard
              </button>
            </div>
          </div>
        )}

        {/* Draft Saved Toast Banner */}
        {draftSavedToast && (
          <div style={{ padding: "10px 24px", background: "rgba(16, 185, 129, 0.2)", borderBottom: "1px solid #10b981", color: "#10b981", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircleIcon size={16} />
            <span>{draftSavedToast}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "22px" }}>
          
          {/* SECTION 1: Event Basics */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              1. Event Basics
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Detty Rave Beach Carnival / Grand Corporate Gala / Royal Wedding"
                  style={{ width: "100%", background: "#070709", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Subtitle / Hook</label>
                <input
                  type="text"
                  placeholder="e.g. Live stage concert & cultural food showcase"
                  style={{ width: "100%", background: "#070709", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Nature of Event</label>
                  <select
                    style={{ width: "100%", background: "#070709", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "13px" }}
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
                    style={{ width: "100%", background: "#070709", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                    value={formData.organizer}
                    onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Date & Time (Calendar Popup with Day & Date) */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              2. Date & Time
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <CalendarIcon size={14} style={{ color: "var(--brand-gold)" }} />
                  <span>Event Date (Click to Pop Up Calendar)</span>
                </label>
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
                  style={{ width: "100%", background: "#070709", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", padding: "10px 14px", color: "#fff", outline: "none", fontSize: "14px" }}
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Venue & Location Navigation */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              3. Venue & Location Navigation
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <MapPinIcon size={14} style={{ color: "var(--brand-gold)" }} />
                  <span>Venue & Street Address (Search Location & Suggest)</span>
                </label>
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

          {/* SECTION 4: Ticket Pricing Tiers & Currency Selection */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(212,175,55,0.15)" }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#0E0E14", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", padding: "4px 8px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--brand-gold-bright)", textTransform: "uppercase" }}>
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
                    <option key={curr.code} value={curr.code} style={{ background: "#070709", color: "#fff" }}>
                      {curr.flag} {curr.code} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Action: Load Stadium / Arena Preset */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "12px", padding: "8px 12px", background: "rgba(212, 175, 55, 0.1)", border: "1px dashed rgba(212, 175, 55, 0.3)", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--brand-gold-bright)" }}>
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

            {/* Tiers List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tiers.map((tier, index) => (
                <div
                  key={tier.id || index}
                  style={{
                    background: "#0E0E14",
                    border: "1px solid rgba(212,175,55,0.2)",
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
                        style={{ width: "100%", background: "#070709", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "6px", padding: "8px 10px", color: "#fff", outline: "none", fontSize: "13px" }}
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
                        style={{ width: "100%", background: "#070709", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "6px", padding: "8px 10px", color: "var(--brand-gold)", fontWeight: "700", outline: "none", fontSize: "13px" }}
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
                        style={{ width: "100%", background: "#070709", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "6px", padding: "8px 10px", color: "#fff", outline: "none", fontSize: "13px" }}
                        value={tier.capacity}
                        onChange={e => handleUpdateTier(index, "capacity", e.target.value)}
                      />
                    </div>

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
                      style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(212,175,55,0.15)", padding: "4px 2px", color: "var(--text-muted)", fontSize: "11px", outline: "none" }}
                      value={tier.description || ""}
                      onChange={e => handleUpdateTier(index, "description", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {tiers.length < 10 ? (
                <button
                  type="button"
                  onClick={handleAddTier}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(212, 175, 55, 0.12)",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    color: "var(--brand-gold)",
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

          {/* SECTION 5: Flyer Image Upload (Up to 3 free, Upsell for 5-10) */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  5. Event Flyers & Banners ({uploadedImages.length}/3 Free Flyers)
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Upload your event flyers directly from your device gallery or camera.
                </div>
              </div>

              {/* Premium Upsell Badge */}
              <button
                type="button"
                onClick={() => setShowProModal(true)}
                style={{
                  background: "linear-gradient(135deg, rgba(212,175,55,0.25), rgba(14,14,20,0.9))",
                  border: "1px solid var(--brand-gold)",
                  color: "var(--brand-gold)",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                <span>⭐ Unlock 5–10 Flyers (Pro)</span>
              </button>
            </div>

            {/* Flyer Upload Dropzone & Button */}
            <div
              onClick={() => {
                if (uploadedImages.length >= 3) {
                  setShowProModal(true);
                } else {
                  fileInputRef.current?.click();
                }
              }}
              style={{
                border: "2px dashed rgba(212, 175, 55, 0.35)",
                borderRadius: "10px",
                padding: "20px",
                textAlign: "center",
                background: "#070709",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>📸</div>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#fff" }}>
                Click to Upload Event Flyer from Device
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Supports PNG, JPG, WEBP. Free plan allows up to <strong>3 event flyers</strong>.
              </div>
            </div>

            {/* Uploaded Flyers List Preview */}
            {uploadedImages.length > 0 && (
              <div style={{ marginTop: "14px" }}>
                <div style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700", marginBottom: "8px" }}>
                  Uploaded Flyers ({uploadedImages.length}):
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
                  {uploadedImages.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      style={{
                        position: "relative",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: img.isPrimary ? "2px solid var(--brand-gold)" : "1px solid rgba(212,175,55,0.25)",
                        background: "#070709",
                        aspectRatio: "3/4",
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >
                      <img
                        src={img.url}
                        alt={`Flyer ${idx + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      
                      {/* Top Badges */}
                      <div style={{ position: "absolute", top: "6px", left: "6px", right: "6px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "9px", fontWeight: "800", padding: "2px 6px", borderRadius: "4px", background: img.isPrimary ? "var(--brand-gold)" : "rgba(0,0,0,0.7)", color: img.isPrimary ? "#070709" : "#fff" }}>
                          {img.isPrimary ? "Main Banner" : `Flyer #${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          style={{
                            background: "rgba(0,0,0,0.8)",
                            color: "#ff6b6b",
                            border: "none",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: "11px"
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      {/* Bottom action to make primary */}
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimaryImage(idx);
                          }}
                          style={{
                            position: "absolute",
                            bottom: "0",
                            left: "0",
                            right: "0",
                            background: "rgba(0,0,0,0.85)",
                            color: "var(--brand-gold)",
                            border: "none",
                            padding: "4px",
                            fontSize: "10px",
                            fontWeight: "700",
                            cursor: "pointer",
                            textAlign: "center"
                          }}
                        >
                          Set as Main
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add more button or pro trigger */}
                  {uploadedImages.length < 3 ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        borderRadius: "8px",
                        border: "1px dashed rgba(212,175,55,0.35)",
                        aspectRatio: "3/4",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        color: "var(--brand-gold-bright)",
                        fontSize: "11px",
                        fontWeight: "700",
                        gap: "6px"
                      }}
                    >
                      <PlusIcon size={18} />
                      <span>Add Flyer ({uploadedImages.length}/3)</span>
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowProModal(true)}
                      style={{
                        borderRadius: "8px",
                        border: "1px dashed var(--brand-gold)",
                        aspectRatio: "3/4",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(212,175,55,0.1)",
                        cursor: "pointer",
                        color: "var(--brand-gold)",
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "8px",
                        textAlign: "center",
                        gap: "4px"
                      }}
                    >
                      <span>⭐</span>
                      <span>Unlock 5–10 Flyers with Pro</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 6: Rich Event Description & Overview Dashboard */}
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  6. Event Overview & Story Dashboard
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Explain what the event is about, highlight artists, dress code, and schedules.
                </div>
              </div>

              {/* View Mode Switcher: Editor / Live Attendee Preview */}
              <div style={{ display: "flex", background: "#070709", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "8px", padding: "2px" }}>
                <button
                  type="button"
                  onClick={() => setDescActiveTab("editor")}
                  style={{
                    background: descActiveTab === "editor" ? "var(--brand-gold)" : "transparent",
                    color: descActiveTab === "editor" ? "#070709" : "var(--text-dim)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 12px",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  ✏️ Edit Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setDescActiveTab("preview")}
                  style={{
                    background: descActiveTab === "preview" ? "var(--brand-gold)" : "transparent",
                    color: descActiveTab === "preview" ? "#070709" : "var(--text-dim)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 12px",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  👁️ Attendee Preview
                </button>
              </div>
            </div>

            {/* Quick Section Template Inserters */}
            <div style={{ marginBottom: "10px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
              <span style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>
                Insert Structure:
              </span>
              {[
                { label: "+ Program Schedule", key: "schedule" },
                { label: "+ Guest Artists", key: "performers" },
                { label: "+ Dress Code", key: "dresscode" },
                { label: "+ Food & Drinks", key: "perks" },
                { label: "+ Security & Safety", key: "security" }
              ].map(tpl => (
                <button
                  key={tpl.key}
                  type="button"
                  onClick={() => handleInsertDescTemplate(tpl.key)}
                  style={{
                    background: "rgba(212,175,55,0.1)",
                    border: "1px solid rgba(212,175,55,0.25)",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "11px",
                    color: "var(--brand-gold-bright)",
                    cursor: "pointer"
                  }}
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            {/* Editor or Attendee Preview */}
            {descActiveTab === "editor" ? (
              <div>
                <textarea
                  rows={8}
                  placeholder="Explain what attendees will experience, including live schedule, dress code, performers, and entry requirements..."
                  style={{
                    width: "100%",
                    background: "#070709",
                    border: "1px solid rgba(212,175,55,0.25)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                    color: "#fff",
                    outline: "none",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                
                {/* Stats Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", fontSize: "11px", color: "var(--text-dim)" }}>
                  <span>{wordCount} words • ~{readingTime} min read</span>
                  <span style={{ color: wordCount > 30 ? "var(--emerald-green)" : "var(--text-muted)" }}>
                    {wordCount > 30 ? "✓ Detailed description ready for attendees" : "💡 Add more details to boost ticket buyer confidence"}
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "#070709",
                  border: "1px solid rgba(212,175,55,0.25)",
                  borderRadius: "8px",
                  padding: "16px",
                  minHeight: "180px",
                  color: "#e2e8f0",
                  fontSize: "13px",
                  lineHeight: "1.7",
                  whiteSpace: "pre-wrap"
                }}
              >
                {formData.description || (
                  <em style={{ color: "var(--text-dim)" }}>No description added yet. Switch to Edit Dashboard to write your event overview.</em>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons: Save Work & Continue Later + Publish Event */}
          <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
            {/* Save Work and Continue Later Button */}
            <button
              type="button"
              onClick={handleSaveWorkAndContinue}
              style={{
                flex: "1 1 200px",
                background: "rgba(212, 175, 55, 0.12)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                color: "var(--brand-gold)",
                borderRadius: "8px",
                padding: "14px 18px",
                fontSize: "13px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <span>💾</span>
              <span>Save Work & Continue Later</span>
            </button>

            {/* Publish Event & Go Live Button */}
            <button
              type="submit"
              className="rx-btn rx-btn-gold"
              style={{ flex: "2 1 260px", padding: "14px 18px" }}
            >
              <span className="rx-btn-text" style={{ flex: 1, fontSize: "14px", fontWeight: "900" }}>
                Publish Event & Go Live ({tiers.length} Tiers in {selectedCurrency.code})
              </span>
              <span className="rx-btn-icon">
                <SparklesIcon size={18} />
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* PRO MONETIZATION UPSELL MODAL */}
      {showProModal && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 12500 }}
          onClick={() => setShowProModal(false)}
        >
          <div
            className="modal-panel"
            style={{ maxWidth: "480px", padding: "26px", textAlign: "center", borderRadius: "16px", border: "2px solid var(--brand-gold)" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(212,175,55,0.15)", border: "1px solid var(--brand-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px" }}>
              👑
            </div>

            <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "#fff", marginBottom: "8px" }}>
              Upgrade to Nà Mè Dèy Sell PRO
            </h3>

            <p style={{ fontSize: "13px", color: "var(--brand-gold-bright)", lineHeight: "1.6", marginBottom: "20px" }}>
              Free organizers can upload up to <strong>3 flyers</strong>. Upgrade to PRO to unlock the full event gallery and supercharge your ticket sales!
            </p>

            <div style={{ background: "#0E0E14", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "10px", padding: "16px", textAlign: "left", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#fff" }}>
                <span style={{ color: "var(--brand-gold)", fontWeight: "900" }}>✓</span>
                <span><strong>5 to 10 High-Res Event Flyers</strong> & Promo Banner Carousel</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#fff" }}>
                <span style={{ color: "var(--brand-gold)", fontWeight: "900" }}>✓</span>
                <span><strong>Featured Homepage Billboard</strong> & Priority City Spotlight</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#fff" }}>
                <span style={{ color: "var(--brand-gold)", fontWeight: "900" }}>✓</span>
                <span><strong>Verified Gold Organizer Badge</strong> for maximum attendee trust</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#fff" }}>
                <span style={{ color: "var(--brand-gold)", fontWeight: "900" }}>✓</span>
                <span><strong>Unlimited Gate Scanning Staff</strong> & Real-time Revenue Export</span>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "24px", fontWeight: "900", color: "var(--brand-gold)", fontFamily: "Sora" }}>
                ₦5,000
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "6px" }}>
                / month (or ₦2,500 single event boost)
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                type="button"
                onClick={() => {
                  alert("🎉 Thank you for your interest! Nà Mè Dèy Sell PRO monetization is launching soon. Your account has been registered for free early-access bonus!");
                  setShowProModal(false);
                }}
                className="rx-btn rx-btn-gold"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <span className="rx-btn-text" style={{ flex: 1 }}>
                  Unlock PRO Features Now
                </span>
                <span className="rx-btn-icon">
                  <ShieldCheckIcon size={18} />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowProModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", padding: "8px", fontSize: "12px", cursor: "pointer" }}
              >
                Continue with 3 Free Flyers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
