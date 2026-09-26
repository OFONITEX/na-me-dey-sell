"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarIcon, CloseIcon } from "./Icons";

export default function DatePickerCalendar({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse existing date or default to current date
  const parseInitialDate = () => {
    if (!value) return new Date();
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const [currentViewDate, setCurrentViewDate] = useState(parseInitialDate());
  const [selectedDate, setSelectedDate] = useState(parseInitialDate());
  const hiddenNativeRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const fullDaysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const formatDateDisplay = (date) => {
    if (!date) return "Select Event Date";
    const dayName = fullDaysOfWeek[date.getDay()];
    const monthName = months[date.getMonth()].substring(0, 3);
    const dayNum = date.getDate();
    const year = date.getFullYear();
    const ordinal = getOrdinalSuffix(dayNum);
    return `${dayName}, ${dayNum}${ordinal} ${monthName} ${year}`;
  };

  const handleSelectDay = (day) => {
    const newDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), day);
    setSelectedDate(newDate);
    const formatted = formatDateDisplay(newDate);
    onChange(formatted);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1));
  };

  const handleQuickPreset = (daysToAdd) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    setSelectedDate(target);
    setCurrentViewDate(target);
    onChange(formatDateDisplay(target));
    setIsOpen(false);
  };

  // Get days in current month
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Visual Trigger Button */}
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
          <CalendarIcon size={16} style={{ color: "var(--brand-gold)", flexShrink: 0 }} />
          <span style={{ fontWeight: "700", color: value ? "var(--brand-gold)" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {value || "Select Event Date"}
          </span>
        </div>
        <span style={{ fontSize: "11px", background: "rgba(217,192,235,0.15)", color: "var(--brand-lavender)", padding: "3px 8px", borderRadius: "4px", flexShrink: 0 }}>
          📅 Open Calendar
        </span>
      </button>

      {/* Hidden native date input fallback */}
      <input
        ref={hiddenNativeRef}
        type="date"
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: "1px", height: "1px" }}
        onChange={(e) => {
          if (e.target.value) {
            const parts = e.target.value.split("-");
            const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            setSelectedDate(d);
            setCurrentViewDate(d);
            onChange(formatDateDisplay(d));
            setIsOpen(false);
          }
        }}
      />

      {/* Interactive Calendar Popover Modal */}
      {isOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 12000 }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="modal-panel"
            style={{ maxWidth: "360px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(217,192,235,0.15)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarIcon size={18} style={{ color: "var(--brand-gold)" }} />
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "900", color: "#fff" }}>
                  Select Event Date
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {/* Quick Presets */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
              <button
                type="button"
                onClick={() => handleQuickPreset(0)}
                style={{ background: "rgba(82, 38, 114, 0.4)", border: "1px solid rgba(217,192,235,0.2)", color: "#fff", borderRadius: "999px", padding: "4px 10px", fontSize: "10px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(1)}
                style={{ background: "rgba(82, 38, 114, 0.4)", border: "1px solid rgba(217,192,235,0.2)", color: "#fff", borderRadius: "999px", padding: "4px 10px", fontSize: "10px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(7)}
                style={{ background: "rgba(82, 38, 114, 0.4)", border: "1px solid rgba(217,192,235,0.2)", color: "#fff", borderRadius: "999px", padding: "4px 10px", fontSize: "10px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Next Week
              </button>
            </div>

            {/* Month & Year Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#11081a", padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(217,192,235,0.15)" }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{ background: "transparent", border: "none", color: "var(--brand-gold)", cursor: "pointer", fontSize: "16px", padding: "2px 8px", fontWeight: "900" }}
              >
                ◀
              </button>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#fff" }}>
                {months[month]} {year}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                style={{ background: "transparent", border: "none", color: "var(--brand-gold)", cursor: "pointer", fontSize: "16px", padding: "2px 8px", fontWeight: "900" }}
              >
                ▶
              </button>
            </div>

            {/* Days of Week Header */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", gap: "4px" }}>
              {daysOfWeek.map((d, i) => (
                <div key={d + i} style={{ fontSize: "11px", fontWeight: "800", color: i === 0 || i === 6 ? "var(--brand-gold)" : "var(--text-dim)", padding: "4px 0" }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {/* Empty leading offset days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Month Days */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const today = isToday(day);
                const selected = isSelected(day);

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "6px",
                      border: selected ? "2px solid var(--brand-gold)" : today ? "1px solid var(--brand-lavender)" : "1px solid transparent",
                      background: selected ? "var(--brand-gold)" : today ? "rgba(82, 38, 114, 0.4)" : "rgba(17,8,26,0.5)",
                      color: selected ? "#11081a" : today ? "var(--brand-gold)" : "#fff",
                      fontSize: "12px",
                      fontWeight: selected || today ? "900" : "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s"
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Bottom Current Selection Display & Native Picker Button */}
            <div style={{ borderTop: "1px solid rgba(217,192,235,0.12)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "11px", color: "var(--brand-gold)", fontWeight: "700" }}>
                {selectedDate ? formatDateDisplay(selectedDate) : "Pick any day"}
              </div>
              <button
                type="button"
                onClick={() => hiddenNativeRef.current?.showPicker ? hiddenNativeRef.current.showPicker() : hiddenNativeRef.current?.click()}
                style={{ background: "transparent", border: "none", color: "var(--brand-lavender)", fontSize: "10px", cursor: "pointer", textDecoration: "underline" }}
              >
                Use Device Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
