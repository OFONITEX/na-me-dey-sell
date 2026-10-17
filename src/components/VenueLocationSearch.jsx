"use client";

import { POPULAR_VENUES } from "../data/popularVenues";
import { MapPinIcon } from "./Icons";

export default function VenueLocationSearch({ venueValue, addressValue, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div>
        <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--brand-gold-bright)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <MapPinIcon size={14} style={{ color: "var(--brand-gold)" }} />
          <span>Venue Name *</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Camp Gee Arena & Events, Landmark Centre, Eko Hotel"
          value={venueValue || ""}
          onChange={e => onChange({ venue: e.target.value, address: addressValue })}
          list="popular-venues-list-comp"
          style={{
            width: "100%",
            background: "#070709",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#fff",
            outline: "none",
            fontSize: "14px",
            boxSizing: "border-box"
          }}
        />
        <datalist id="popular-venues-list-comp">
          {POPULAR_VENUES.map((v, i) => (
            <option key={i} value={v.name}>{v.address}, {v.city}</option>
          ))}
        </datalist>
      </div>

      <div>
        <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
          Street / Venue Address
        </label>
        <input
          type="text"
          placeholder="e.g. Ring Road 3, Uyo or Plot 2&3 Water Corporation Road, Oniru"
          value={addressValue || ""}
          onChange={e => onChange({ venue: venueValue, address: e.target.value })}
          style={{
            width: "100%",
            background: "#070709",
            border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#fff",
            outline: "none",
            fontSize: "14px",
            boxSizing: "border-box"
          }}
        />
      </div>
    </div>
  );
}
