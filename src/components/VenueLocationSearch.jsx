"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { POPULAR_VENUES } from "../data/popularVenues";
import { MapPinIcon, SearchIcon, CloseIcon, CheckCircleIcon } from "./Icons";

export default function VenueLocationSearch({ venueValue, addressValue, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customVenue, setCustomVenue] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [previewQuery, setPreviewQuery] = useState(venueValue || "Eko Hotel, Lagos");
  const [onlineResults, setOnlineResults] = useState([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      if (venueValue) setPreviewQuery(`${venueValue}, ${addressValue || ""}`);
    }
  }, [isOpen, venueValue, addressValue]);

  // Live filter local curated popular venues
  const filteredVenues = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return POPULAR_VENUES;
    return POPULAR_VENUES.filter(v =>
      v.name.toLowerCase().includes(term) ||
      v.address.toLowerCase().includes(term) ||
      v.city.toLowerCase().includes(term) ||
      v.category.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Debounced online geocoding search for unknown venues/streets
  useEffect(() => {
    const term = searchTerm.trim();
    if (!term || term.length < 3) {
      setOnlineResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setOnlineResults(data.map(item => ({
            name: item.display_name.split(",")[0],
            address: item.display_name,
            city: item.address?.city || item.address?.state || "",
            country: item.address?.country || "",
            category: "Global Map Location",
            isOnline: true
          })));
        }
      } catch (err) {
        console.warn("Location query fallback:", err);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectVenue = (venue) => {
    onChange({
      venue: venue.name,
      address: venue.address,
      city: venue.city || ""
    });
    setPreviewQuery(`${venue.name}, ${venue.address}`);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleApplyCustom = (e) => {
    e?.preventDefault();
    const vName = (customVenue || searchTerm).trim();
    const vAddr = customAddress.trim() || vName;
    if (!vName) return;

    onChange({
      venue: vName,
      address: vAddr
    });
    setPreviewQuery(`${vName}, ${vAddr}`);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(17,8,26,0.7)",
          border: "1px solid rgba(217,192,235,0.25)",
          borderRadius: "6px",
          padding: "10px 14px",
          color: "#fff",
          fontSize: "13px",
          cursor: "pointer",
          textAlign: "left"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
          <MapPinIcon size={16} style={{ color: "var(--warm-amber)", flexShrink: 0 }} />
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: "700", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {venueValue || "Search Venue / Location"}
            </div>
            {addressValue && (
              <div style={{ fontSize: "11px", color: "var(--brand-lavender)", opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {addressValue}
              </div>
            )}
          </div>
        </div>
        <span style={{ fontSize: "11px", background: "rgba(217,192,235,0.15)", color: "var(--brand-gold)", padding: "3px 8px", borderRadius: "4px", flexShrink: 0, fontWeight: "700" }}>
          🔍 Search & Map
        </span>
      </button>

      {/* Venue Search & Map Navigation Modal */}
      {isOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 12000 }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="modal-panel"
            style={{ maxWidth: "680px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(217,192,235,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a0e28" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPinIcon size={18} style={{ color: "var(--brand-gold)" }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "900", color: "#fff" }}>
                    Search Event Venue & Map Location
                  </h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>
                    Find halls, arenas, stadiums, or streets with live map navigation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {/* Search Input Bar with Explicit Search Button */}
            <div style={{ padding: "14px 20px", background: "rgba(26,14,40,0.6)", borderBottom: "1px solid rgba(217,192,235,0.1)" }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchTerm.trim()) {
                    setPreviewQuery(searchTerm.trim());
                  }
                }}
                style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
              >
                <div style={{ display: "flex", alignItems: "center", background: "#11081a", border: "1.5px solid var(--brand-gold)", borderRadius: "8px", padding: "8px 12px", gap: "10px", flex: 1, minWidth: "220px" }}>
                  <SearchIcon size={16} style={{ color: "var(--brand-gold)" }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Type venue (e.g. Camp Gee, Ring Road, Tropicana, Eko Hotel)..."
                    style={{ background: "transparent", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "13px" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "14px" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  style={{
                    background: "var(--brand-gold)",
                    color: "#11081a",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 18px",
                    fontWeight: "800",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap"
                  }}
                >
                  <SearchIcon size={15} />
                  <span>Search Location</span>
                </button>
              </form>

              {/* Quick Venue Filter Chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-dim)", alignSelf: "center" }}>Popular:</span>
                {[
                  { name: "Camp Gee, Ring Rd", query: "Camp Gee Arena & Events, Ring Road 3, Uyo" },
                  { name: "Ibom Tropicana", query: "Ibom Tropicana Entertainment Center, Uyo" },
                  { name: "Nest of Champions Stadium", query: "Godswill Akpabio International Stadium, Uyo" },
                  { name: "Eko Hotel, VI", query: "Eko Hotel & Convention Centre, Lagos" },
                  { name: "Landmark Beach", query: "Landmark Beach, Victoria Island, Lagos" }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchTerm(chip.name);
                      setPreviewQuery(chip.query);
                    }}
                    style={{
                      background: "rgba(217, 192, 235, 0.1)",
                      border: "1px solid rgba(217, 192, 235, 0.2)",
                      color: "var(--brand-lavender)",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                  >
                    📍 {chip.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Responsive 2-Column: Suggestions + Embedded Interactive Map */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", padding: "14px 20px", flex: 1, overflowY: "auto", minHeight: "300px" }}>
              {/* Left Column: Venue Suggestions */}
              <div style={{ overflowY: "auto", maxHeight: "300px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase", marginBottom: "4px" }}>
                  Suggested Venues & Locations
                </div>

                {/* Instant custom match button */}
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={() => handleApplyCustom()}
                    style={{
                      background: "rgba(245, 208, 97, 0.12)",
                      border: "1px dashed var(--brand-gold)",
                      borderRadius: "6px",
                      padding: "8px 10px",
                      color: "var(--brand-gold)",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    📍 Use &ldquo;{searchTerm.trim()}&rdquo; as Venue
                  </button>
                )}

                {/* Local curated popular venues */}
                {filteredVenues.map((v, idx) => {
                  const isCurSelected = venueValue === v.name;
                  return (
                    <button
                      key={`venue-${idx}`}
                      type="button"
                      onClick={() => handleSelectVenue(v)}
                      onMouseEnter={() => setPreviewQuery(`${v.name}, ${v.city}`)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: isCurSelected ? "rgba(82, 38, 114, 0.7)" : "rgba(17,8,26,0.6)",
                        border: isCurSelected ? "1px solid var(--brand-gold)" : "1px solid rgba(217,192,235,0.12)",
                        color: "#fff",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: "800", color: isCurSelected ? "var(--brand-gold)" : "#fff" }}>
                          {v.name}
                        </span>
                        <span style={{ fontSize: "9px", background: "rgba(217,192,235,0.15)", color: "var(--brand-lavender)", padding: "1px 5px", borderRadius: "3px" }}>
                          {v.category.split(" ")[0]}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
                        {v.address} • {v.city}
                      </span>
                    </button>
                  );
                })}

                {/* Online Geocoding Results */}
                {onlineResults.map((v, idx) => (
                  <button
                    key={`online-${idx}`}
                    type="button"
                    onClick={() => handleSelectVenue(v)}
                    onMouseEnter={() => setPreviewQuery(v.address)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      background: "rgba(17,8,26,0.8)",
                      border: "1px solid rgba(245, 208, 97, 0.3)",
                      color: "#fff",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--brand-gold)" }}>
                      🌐 {v.name}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {v.address}
                    </span>
                  </button>
                ))}

                {isSearchingOnline && (
                  <div style={{ fontSize: "11px", color: "var(--brand-lavender)", textAlign: "center", padding: "6px" }}>
                    Searching global map...
                  </div>
                )}
              </div>

              {/* Right Column: Embedded Interactive Map Preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--brand-gold)", textTransform: "uppercase" }}>
                    📍 Map Navigation
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--brand-lavender)" }}>
                    Interactive Pin
                  </span>
                </div>

                <div style={{ flex: 1, minHeight: "220px", background: "#11081a", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
                  <iframe
                    title="Venue Map Navigation"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0, minHeight: "220px" }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(previewQuery || "Nigeria")}&output=embed&z=15`}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", textAlign: "center" }}>
                  Viewing: <strong>{previewQuery}</strong>
                </div>
              </div>
            </div>

            {/* Custom Manual Address Footer */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(217,192,235,0.15)", background: "#1a0e28", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>
                Or input custom venue details manually:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Venue Name (e.g. Camp Gee)"
                  style={{ background: "#11081a", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 10px", color: "#fff", fontSize: "12px", outline: "none" }}
                  value={customVenue}
                  onChange={(e) => setCustomVenue(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Street / Location (e.g. Ring Road)"
                  style={{ background: "#11081a", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 10px", color: "#fff", fontSize: "12px", outline: "none" }}
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  style={{
                    background: "var(--primary-purple)",
                    border: "1px solid var(--brand-gold)",
                    color: "var(--brand-gold)",
                    borderRadius: "6px",
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  Set Venue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
