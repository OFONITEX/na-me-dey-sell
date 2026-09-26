"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { WORLD_CITIES } from "../data/worldCities";
import { MapPinIcon, SearchIcon, CloseIcon, CheckCircleIcon } from "./Icons";

export default function CitySearchSelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRegion, setActiveRegion] = useState("All");
  const [customInput, setCustomInput] = useState("");
  const inputRef = useRef(null);

  const regions = ["All", "Nigeria", "Africa", "Europe", "Americas", "Middle East & Asia"];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredCities = useMemo(() => {
    let list = WORLD_CITIES;

    if (activeRegion !== "All") {
      list = list.filter(c => c.region === activeRegion);
    }

    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;

    return list.filter(c =>
      c.city.toLowerCase().includes(term) ||
      c.state.toLowerCase().includes(term) ||
      c.country.toLowerCase().includes(term) ||
      c.label.toLowerCase().includes(term)
    );
  }, [searchTerm, activeRegion]);

  const handleSelectCity = (cityLabel) => {
    onChange(cityLabel);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleApplyCustom = (e) => {
    e?.preventDefault();
    const finalVal = (customInput || searchTerm).trim();
    if (!finalVal) return;
    onChange(finalVal);
    setIsOpen(false);
    setSearchTerm("");
    setCustomInput("");
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
          textAlign: "left",
          transition: "border-color 0.2s"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
          <MapPinIcon size={16} style={{ color: "var(--brand-gold)", flexShrink: 0 }} />
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: "600" }}>
            {value || "Select City or Country"}
          </span>
        </div>
        <span style={{ fontSize: "11px", background: "rgba(217,192,235,0.15)", color: "var(--brand-gold)", padding: "3px 8px", borderRadius: "4px", flexShrink: 0, fontWeight: "700" }}>
          🔍 Change
        </span>
      </button>

      {/* Global Search Modal / Popover */}
      {isOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 11000 }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="modal-panel"
            style={{ maxWidth: "520px", maxHeight: "88vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(217,192,235,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a0e28" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPinIcon size={18} style={{ color: "var(--brand-gold)" }} />
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#fff" }}>
                  Choose Event City or Country
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {/* Search Input Bar */}
            <div style={{ padding: "14px 20px 8px 20px", background: "rgba(26,14,40,0.6)" }}>
              <div style={{ display: "flex", alignItems: "center", background: "#11081a", border: "1.5px solid var(--brand-gold)", borderRadius: "8px", padding: "8px 12px", gap: "10px" }}>
                <SearchIcon size={16} style={{ color: "var(--brand-gold)" }} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search any city, state, or country..."
                  style={{ background: "transparent", border: "none", color: "#fff", width: "100%", outline: "none", fontSize: "13px" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (filteredCities.length > 0 && searchTerm) {
                        handleSelectCity(filteredCities[0].label);
                      } else if (searchTerm.trim()) {
                        handleApplyCustom();
                      }
                    }
                  }}
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

              {/* Region Filter Pills */}
              <div style={{ display: "flex", gap: "6px", overflowX: "auto", padding: "10px 0 4px 0", scrollbarWidth: "none" }}>
                {regions.map(reg => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setActiveRegion(reg)}
                    style={{
                      background: activeRegion === reg ? "var(--brand-gold)" : "rgba(82, 38, 114, 0.4)",
                      color: activeRegion === reg ? "#11081a" : "#fff",
                      border: activeRegion === reg ? "1px solid var(--brand-gold)" : "1px solid rgba(217,192,235,0.15)",
                      borderRadius: "999px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0
                    }}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Location Instant Option when typing */}
            {searchTerm.trim() && (
              <div style={{ padding: "8px 20px", background: "rgba(82, 38, 114, 0.35)", borderBottom: "1px solid rgba(217,192,235,0.1)" }}>
                <button
                  type="button"
                  onClick={() => handleApplyCustom()}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(245, 208, 97, 0.15)",
                    border: "1px dashed var(--brand-gold)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "var(--brand-gold)",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: "700" }}>
                    ✨ Use custom: &ldquo;{searchTerm.trim()}&rdquo;
                  </span>
                  <span style={{ fontSize: "10px", background: "var(--brand-gold)", color: "#11081a", padding: "2px 8px", borderRadius: "4px", fontWeight: "800" }}>
                    Select
                  </span>
                </button>
              </div>
            )}

            {/* Cities List */}
            <div style={{ flex: 1, overflowY: "auto", maxHeight: "320px", padding: "8px 20px" }}>
              {filteredCities.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {filteredCities.map((item, index) => {
                    const isSelected = value === item.label || value === `${item.city}, ${item.country}`;
                    return (
                      <button
                        key={`${item.city}-${item.country}-${index}`}
                        type="button"
                        onClick={() => handleSelectCity(item.label)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          background: isSelected ? "rgba(82, 38, 114, 0.6)" : "transparent",
                          border: isSelected ? "1px solid var(--brand-gold)" : "1px solid transparent",
                          color: "#fff",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.15s"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "18px" }}>{item.flag}</span>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: isSelected ? "var(--brand-gold)" : "#fff" }}>
                              {item.city}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--brand-lavender)", opacity: 0.85 }}>
                              {item.state ? `${item.state} • ` : ""}{item.country}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircleIcon size={16} style={{ color: "var(--brand-gold)" }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 10px" }}>
                  <div style={{ fontSize: "28px", marginBottom: "6px" }}>🌍</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>
                    No preset city found for &ldquo;{searchTerm}&rdquo;
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", marginBottom: "12px" }}>
                    You can input any custom city or country across the world:
                  </p>
                  <button
                    type="button"
                    onClick={() => handleApplyCustom()}
                    className="rx-btn rx-btn-gold"
                    style={{ margin: "0 auto", padding: "6px 16px", fontSize: "12px" }}
                  >
                    <span>Use &ldquo;{searchTerm}&rdquo;</span>
                  </button>
                </div>
              )}
            </div>

            {/* Custom Input Footer */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(217,192,235,0.15)", background: "#1a0e28" }}>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>
                Or type any custom location:
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="e.g. Asaba, Delta State or Houston, Texas"
                  style={{ flex: 1, background: "#11081a", border: "1px solid rgba(217,192,235,0.2)", borderRadius: "6px", padding: "8px 12px", color: "#fff", fontSize: "12px", outline: "none" }}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyCustom(e);
                  }}
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
                    cursor: "pointer"
                  }}
                >
                  Set City
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
