"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CloseIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  TicketIcon,
  EditIcon,
  CheckCircleIcon,
  SearchIcon,
  DownloadIcon,
  QrCodeIcon,
  SparklesIcon,
  UserIcon,
  ShieldCheckIcon,
  ActivityIcon,
  FlameIcon,
  CreditCardIcon,
  ArrowRightIcon
} from "./Icons";
import {
  formatNaira,
  getStoredTickets,
  updateEvent,
  getActivityFeed,
  recordActivity,
  getEventSlug
} from "../lib/ticketService";
import { triggerConfetti } from "../lib/confetti";

export default function EventAdminModal({
  event,
  isOpen,
  currentUser,
  onClose,
  onOpenEdit,
  onPreviewAttendee,
  onOpenScanner,
  onEventUpdated
}) {
  if (!isOpen || !event) return null;

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "roster" | "link" | "activity"
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [eventStatus, setEventStatus] = useState(event.status || "live");
  const [ticketsList, setTicketsList] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);

  // Load tickets and activities for this specific event
  const refreshModalData = () => {
    try {
      const allTickets = getStoredTickets();
      const matched = allTickets.filter(
        t =>
          String(t.eventId || "").trim().toLowerCase() === String(event.id || "").trim().toLowerCase() ||
          (event.title && t.eventTitle && t.eventTitle.toLowerCase().trim() === event.title.toLowerCase().trim())
      );
      setTicketsList(matched);

      const allActivities = getActivityFeed();
      const eventActivities = allActivities.filter(
        a =>
          (a.eventId && String(a.eventId).toLowerCase() === String(event.id).toLowerCase()) ||
          (a.eventTitle && event.title && a.eventTitle.toLowerCase() === event.title.toLowerCase())
      );
      setActivitiesList(eventActivities);
    } catch (err) {
      console.error("Error refreshing event admin data:", err);
    }
  };

  useEffect(() => {
    refreshModalData();
    setEventStatus(event.status || "live");
  }, [event]);

  // Aggregate Metrics for this event
  const totalCapacity = useMemo(() => {
    return (event.tiers || []).reduce((sum, t) => sum + (Number(t.capacity) || 100), 0);
  }, [event]);

  const totalSold = ticketsList.length;

  const grossRevenue = useMemo(() => {
    return ticketsList.reduce((sum, t) => sum + (Number(t.tierPrice) || 0), 0);
  }, [ticketsList]);

  const checkedInCount = useMemo(() => {
    return ticketsList.filter(t => t.status === "checked_in").length;
  }, [ticketsList]);

  const percentSold = totalCapacity > 0 ? Math.min(100, Math.round((totalSold / totalCapacity) * 100)) : 0;
  const percentCheckedIn = totalSold > 0 ? Math.min(100, Math.round((checkedInCount / totalSold) * 100)) : 0;
  const remainingTickets = Math.max(0, totalCapacity - totalSold);

  // Clean branded event link generation (e.g. https://na-me-dey-sell.pages.dev/naphss-dinner-night)
  const origin = typeof window !== "undefined" ? window.location.origin : "https://na-me-dey-sell.pages.dev";
  const eventSlug = getEventSlug(event);
  const shareableEventLink = `${origin}/${eventSlug}`;
  const directCheckoutLink = `${origin}/${eventSlug}?mode=attendee`;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(shareableEventLink);
      setCopiedLink(true);
      triggerConfetti();
      setToastMessage("Public event ticket link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 3000);
      setTimeout(() => setToastMessage(""), 3500);
    } catch {
      alert(`Link: ${shareableEventLink}`);
    }
  };

  const handleCopyDirectLink = () => {
    try {
      navigator.clipboard.writeText(directCheckoutLink);
      setCopiedDirectLink(true);
      setToastMessage("Direct attendee checkout link copied!");
      setTimeout(() => setCopiedDirectLink(false), 3000);
      setTimeout(() => setToastMessage(""), 3500);
    } catch {
      alert(`Link: ${directCheckoutLink}`);
    }
  };

  // Toggle Live / Paused Status
  const handleToggleStatus = () => {
    const nextStatus = eventStatus === "live" ? "paused" : "live";
    const updated = updateEvent(event.id, { status: nextStatus });
    if (updated) {
      setEventStatus(nextStatus);
      setToastMessage(nextStatus === "live" ? "Event sales are now LIVE on the marketplace!" : "Ticket sales have been PAUSED.");
      if (onEventUpdated) onEventUpdated(updated);
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  // Manual Gate Check-in for an attendee
  const handleManualCheckIn = (ticketId, currentStatus) => {
    try {
      const allTickets = getStoredTickets();
      const updatedTickets = allTickets.map(t => {
        if (t.ticketId === ticketId) {
          const nextStatus = currentStatus === "checked_in" ? "active" : "checked_in";
          return {
            ...t,
            status: nextStatus,
            checkedInAt: nextStatus === "checked_in" ? new Date().toISOString() : null,
            gateStaff: nextStatus === "checked_in" ? currentUser?.fullName || "Event Organizer" : null
          };
        }
        return t;
      });
      localStorage.setItem("nmds_tickets_v2", JSON.stringify(updatedTickets));

      recordActivity({
        type: "checkin",
        category: "Gate Check-In",
        title: currentStatus === "checked_in" ? "Admission Status Reset" : "Manual Gate Admission Verified",
        description: `${currentUser?.fullName || "Organizer"} manually verified ticket pass ${ticketId}`,
        actor: currentUser?.fullName || "Organizer",
        role: "organizer",
        ticketId,
        eventTitle: event.title,
        eventId: event.id
      });

      refreshModalData();
      setToastMessage(currentStatus === "checked_in" ? "Attendee admission reset." : "Attendee successfully admitted!");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error("Failed to check in attendee:", err);
    }
  };

  // Filtered Attendees list
  const filteredAttendees = useMemo(() => {
    return ticketsList.filter(t => {
      const matchesTier = tierFilter === "all" || t.tierId === tierFilter || t.tierName === tierFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.attendee?.name?.toLowerCase().includes(q) ||
        t.attendee?.email?.toLowerCase().includes(q) ||
        t.attendee?.phone?.toLowerCase().includes(q) ||
        t.ticketId?.toLowerCase().includes(q) ||
        t.orderId?.toLowerCase().includes(q);
      return matchesTier && matchesSearch;
    });
  }, [ticketsList, tierFilter, searchQuery]);

  // CSV Export of attendees
  const handleExportCSV = () => {
    if (ticketsList.length === 0) {
      alert("No attendee records available to export yet.");
      return;
    }
    const headers = ["Ticket ID", "Order ID", "Attendee Name", "Email", "Phone", "Tier", "Price (NGN)", "Status", "Checked-in Time", "Purchased Date"];
    const rows = ticketsList.map(t => [
      t.ticketId,
      t.orderId,
      `"${t.attendee?.name || ""}"`,
      t.attendee?.email || "",
      t.attendee?.phone || "",
      `"${t.tierName || ""}"`,
      t.tierPrice || 0,
      t.status === "checked_in" ? "Admitted" : "Active / Unscanned",
      t.checkedInAt || "",
      t.purchaseDate || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendees_${event.title.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage("Attendee CSV exported successfully!");
    setTimeout(() => setToastMessage(""), 3500);
  };

  return (
    <div
      className="modal-backdrop rx-modal-overlay rx-admin-modal-overlay"
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
        className="modal-panel rx-modal-card rx-admin-modal-container"
        style={{
          width: "100%",
          maxWidth: "960px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #13131A 0%, #0B0B0F 100%)",
          border: "1px solid rgba(212, 175, 55, 0.35)",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 50px rgba(212, 175, 55, 0.25)",
          overflow: "hidden"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Gold Accent Line */}
        <div style={{ height: "3px", width: "100%", background: "linear-gradient(90deg, transparent, #D4AF37, #F5D061, transparent)" }} />

        {/* Modal Header */}
        <div
          className="rx-admin-modal-header"
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid rgba(212, 175, 55, 0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            background: "rgba(0,0,0,0.3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Event Flyer Thumbnail */}
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                flexShrink: 0,
                position: "relative"
              }}
            >
              <img
                src={event.imageUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80"}
                alt={event.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#070709",
                    background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                    padding: "2px 8px",
                    borderRadius: "4px"
                  }}
                >
                  👑 Event Admin Studio
                </span>
                <span style={{ fontSize: "11px", color: "#D4AF37", fontWeight: "700" }}>
                  {event.category}
                </span>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>•</span>
                <span
                  onClick={handleToggleStatus}
                  style={{
                    fontSize: "10px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    background: eventStatus === "live" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    border: eventStatus === "live" ? "1px solid #10B981" : "1px solid #EF4444",
                    color: eventStatus === "live" ? "#6EE7B7" : "#FCA5A5"
                  }}
                  title="Click to toggle status"
                >
                  {eventStatus === "live" ? "🟢 Live (Selling)" : "⏸️ Paused"}
                </span>
              </div>

              <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", margin: "2px 0 4px" }}>
                {event.title}
              </h2>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "12px", color: "#E2D9BC", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <CalendarIcon size={13} style={{ color: "#D4AF37" }} />
                  <span>{event.date}</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPinIcon size={13} style={{ color: "#D4AF37" }} />
                  <span>{event.venue}, {event.city}</span>
                </span>
                <span style={{ color: "#948B75" }}>
                  Organized by: <strong style={{ color: "#F5D061" }}>{event.organizer}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Direct Edit Button */}
            <button
              type="button"
              onClick={() => {
                if (onOpenEdit) onOpenEdit(event);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                border: "none",
                borderRadius: "8px",
                color: "#070709",
                fontSize: "12px",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(212, 175, 55, 0.4)"
              }}
            >
              <EditIcon size={14} />
              <span>Edit Event</span>
            </button>

            {/* Generate / Copy Ticket Link Button */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("link");
                handleCopyLink();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "rgba(212, 175, 55, 0.12)",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                borderRadius: "8px",
                color: "#F5D061",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer"
              }}
            >
              <SparklesIcon size={14} />
              <span>{copiedLink ? "Link Copied! ✓" : "Generate Ticket Link"}</span>
            </button>

            {/* Preview Public Attendee View */}
            <button
              type="button"
              onClick={() => {
                if (onPreviewAttendee) onPreviewAttendee(event);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                color: "#E2D9BC",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer"
              }}
              title="See what page visitors and ticket buyers see"
            >
              <span>👁️ Preview Attendee View</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
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
        </div>

        {/* Live Event KPI Stat Strip */}
        <div
          className="rx-admin-modal-kpis"
          style={{
            padding: "16px 28px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            background: "rgba(0,0,0,0.25)",
            borderBottom: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          {/* Tickets Sold */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px", padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#948B75", textTransform: "uppercase" }}>Tickets Sold</span>
              <span style={{ fontSize: "11px", color: "#10B981", fontWeight: "800" }}>{percentSold}% filled</span>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#ffffff", marginTop: "4px" }}>
              {totalSold} <span style={{ fontSize: "13px", fontWeight: "600", color: "#948B75" }}>/ {totalCapacity} cap</span>
            </div>
            <div style={{ width: "100%", height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", marginTop: "8px", overflow: "hidden" }}>
              <div style={{ width: `${percentSold}%`, height: "100%", background: "linear-gradient(90deg, #D4AF37, #10B981)", borderRadius: "3px" }} />
            </div>
          </div>

          {/* Gross Revenue */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#948B75", textTransform: "uppercase" }}>Gross Revenue</div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#F5D061", marginTop: "4px" }}>
              {formatNaira(grossRevenue, event.currency || "₦")}
            </div>
            <div style={{ fontSize: "11px", color: "#10B981", marginTop: "4px" }}>
              Est. Net Payout (95%): {formatNaira(grossRevenue * 0.95, event.currency || "₦")}
            </div>
          </div>

          {/* Gate Check-in Admitted */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px", padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#948B75", textTransform: "uppercase" }}>Gate Check-In</span>
              <span style={{ fontSize: "11px", color: "#60A5FA", fontWeight: "800" }}>{percentCheckedIn}% admitted</span>
            </div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#60A5FA", marginTop: "4px" }}>
              {checkedInCount} <span style={{ fontSize: "13px", fontWeight: "600", color: "#948B75" }}>/ {totalSold} guests</span>
            </div>
            <div style={{ fontSize: "11px", color: "#E2D9BC", marginTop: "4px" }}>
              {totalSold - checkedInCount} tickets pending gate admission
            </div>
          </div>

          {/* Remaining Inventory */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#948B75", textTransform: "uppercase" }}>Tickets Remaining</div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: remainingTickets > 0 ? "#10B981" : "#EF4444", marginTop: "4px" }}>
              {remainingTickets}
            </div>
            <div style={{ fontSize: "11px", color: "#948B75", marginTop: "4px" }}>
              {(event.tiers || []).length} active pricing tiers
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="rx-admin-modal-tabs"
          style={{
            display: "flex",
            gap: "8px",
            padding: "12px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,10,15,0.6)",
            overflowX: "auto"
          }}
        >
          {[
            { id: "overview", label: `📊 Tiers Performance (${(event.tiers || []).length})` },
            { id: "roster", label: `👥 Attendee Roster (${ticketsList.length})` },
            { id: "link", label: "🔗 Generate & Share Ticket Link" },
            { id: "activity", label: `📝 Activity & Scans (${activitiesList.length})` }
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
                background: activeTab === tab.id ? "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)" : "transparent",
                border: activeTab === tab.id ? "none" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div style={{ margin: "12px 28px 0", padding: "10px 16px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "8px", color: "#6EE7B7", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircleIcon size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Body Container (Scrollable) */}
        <div className="rx-admin-modal-body" style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {/* TAB 1: OVERVIEW & TIERS */}
          {activeTab === "overview" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#ffffff", margin: 0 }}>
                    Ticket Tiers &amp; Pricing Breakdown
                  </h3>
                  <p style={{ fontSize: "12px", color: "#E2D9BC", margin: "2px 0 0" }}>
                    Real-time sales, capacities, and gross ticket yields for this event.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenEdit) onOpenEdit(event);
                    }}
                    style={{
                      padding: "6px 14px",
                      background: "rgba(212, 175, 55, 0.15)",
                      border: "1px solid rgba(212, 175, 55, 0.4)",
                      borderRadius: "6px",
                      color: "#F5D061",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer"
                    }}
                  >
                    + Modify Tiers &amp; Prices
                  </button>
                </div>
              </div>

              {/* Tiers Table */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#948B75", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <th style={{ padding: "12px 16px" }}>Tier Name</th>
                      <th style={{ padding: "12px 16px" }}>Price</th>
                      <th style={{ padding: "12px 16px" }}>Capacity</th>
                      <th style={{ padding: "12px 16px" }}>Sold</th>
                      <th style={{ padding: "12px 16px" }}>Remaining</th>
                      <th style={{ padding: "12px 16px" }}>Gross Revenue</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(event.tiers || []).map(tier => {
                      const tierTickets = ticketsList.filter(t => t.tierId === tier.id || t.tierName === tier.name);
                      const tierSold = tierTickets.length;
                      const tierCap = Number(tier.capacity) || 100;
                      const tierRem = Math.max(0, tierCap - tierSold);
                      const tierRev = tierSold * (Number(tier.price) || 0);
                      const isSoldOut = tierRem === 0;

                      return (
                        <tr key={tier.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: "800", color: "#ffffff" }}>{tier.name}</div>
                            {tier.description && (
                              <div style={{ fontSize: "11px", color: "#948B75", marginTop: "2px" }}>
                                {tier.description}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: "800", color: "#F5D061" }}>
                            {formatNaira(tier.price, tier.currency || event.currency || "₦")}
                          </td>
                          <td style={{ padding: "14px 16px", color: "#E2D9BC" }}>
                            {tierCap}
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: "800", color: "#ffffff" }}>
                            {tierSold}
                          </td>
                          <td style={{ padding: "14px 16px", color: tierRem > 0 ? "#10B981" : "#EF4444", fontWeight: "700" }}>
                            {tierRem}
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: "900", color: "#10B981" }}>
                            {formatNaira(tierRev, tier.currency || event.currency || "₦")}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: "900",
                                textTransform: "uppercase",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                background: isSoldOut ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                                color: isSoldOut ? "#FCA5A5" : "#6EE7B7",
                                border: isSoldOut ? "1px solid #EF4444" : "1px solid #10B981"
                              }}
                            >
                              {isSoldOut ? "Sold Out" : "Active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Event Description & Details */}
              <div style={{ marginTop: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "18px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#D4AF37", textTransform: "uppercase", margin: "0 0 8px" }}>
                  Event Program &amp; Overview
                </h4>
                <p style={{ fontSize: "13px", color: "#E2D9BC", lineHeight: "1.6", whiteSpace: "pre-wrap", margin: 0 }}>
                  {event.description || "No detailed program description provided."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDEE ROSTER */}
          {activeTab === "roster" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#ffffff", margin: 0 }}>
                    Attendee Roster &amp; Verified Passes
                  </h3>
                  <p style={{ fontSize: "12px", color: "#E2D9BC", margin: "2px 0 0" }}>
                    View and manage all verified guests who purchased tickets for this event.
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Gate Scanner Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenScanner) onOpenScanner(event);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      background: "rgba(212, 175, 55, 0.2)",
                      border: "1px solid rgba(212, 175, 55, 0.4)",
                      borderRadius: "6px",
                      color: "#F5D061",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer"
                    }}
                  >
                    <QrCodeIcon size={14} />
                    <span>Gate Scanner</span>
                  </button>

                  {/* CSV Export Button */}
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#070709",
                      fontSize: "12px",
                      fontWeight: "900",
                      cursor: "pointer"
                    }}
                  >
                    <DownloadIcon size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
                  <SearchIcon size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#948B75" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search attendee by name, email, phone, or ticket ID..."
                    style={{
                      width: "100%",
                      height: "38px",
                      paddingLeft: "36px",
                      paddingRight: "12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <select
                  value={tierFilter}
                  onChange={e => setTierFilter(e.target.value)}
                  style={{
                    height: "38px",
                    padding: "0 12px",
                    background: "#13131A",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "12px",
                    outline: "none"
                  }}
                >
                  <option value="all">All Ticket Tiers</option>
                  {(event.tiers || []).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Attendees Table */}
              {filteredAttendees.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <TicketIcon size={36} style={{ color: "#D4AF37", opacity: 0.4, marginBottom: "8px" }} />
                  <h4 style={{ fontSize: "15px", color: "#ffffff", margin: 0 }}>No Attendee Records Found</h4>
                  <p style={{ fontSize: "12px", color: "#948B75", margin: "4px 0 0" }}>
                    {searchQuery ? "No guests match your search criteria." : "Tickets purchased for this event will appear here automatically with gate check-in status."}
                  </p>
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#948B75", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <th style={{ padding: "10px 14px" }}>Guest Name</th>
                        <th style={{ padding: "10px 14px" }}>Contact</th>
                        <th style={{ padding: "10px 14px" }}>Ticket Pass ID</th>
                        <th style={{ padding: "10px 14px" }}>Tier</th>
                        <th style={{ padding: "10px 14px" }}>Paid</th>
                        <th style={{ padding: "10px 14px" }}>Admission Status</th>
                        <th style={{ padding: "10px 14px", textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendees.map(tkt => {
                        const isAdmitted = tkt.status === "checked_in";
                        return (
                          <tr key={tkt.ticketId} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ padding: "12px 14px", fontWeight: "800", color: "#ffffff" }}>
                              {tkt.attendee?.name || "Guest Attendee"}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#E2D9BC" }}>
                              <div>{tkt.attendee?.email || "—"}</div>
                              <div style={{ fontSize: "11px", color: "#948B75" }}>{tkt.attendee?.phone || "—"}</div>
                            </td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#F5D061", fontWeight: "700" }}>
                              {tkt.ticketId}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#ffffff" }}>
                              {tkt.tierName}
                            </td>
                            <td style={{ padding: "12px 14px", fontWeight: "800", color: "#10B981" }}>
                              {formatNaira(tkt.tierPrice, tkt.currency || event.currency || "₦")}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: "900",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  background: isAdmitted ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                  color: isAdmitted ? "#6EE7B7" : "#FCD34D",
                                  border: isAdmitted ? "1px solid #10B981" : "1px solid #F59E0B"
                                }}
                              >
                                {isAdmitted ? "✅ Admitted" : "⏳ Pending Admission"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "right" }}>
                              <button
                                type="button"
                                onClick={() => handleManualCheckIn(tkt.ticketId, tkt.status)}
                                style={{
                                  padding: "4px 10px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  background: isAdmitted ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.2)",
                                  border: isAdmitted ? "1px solid #EF4444" : "1px solid #10B981",
                                  color: isAdmitted ? "#FCA5A5" : "#6EE7B7"
                                }}
                              >
                                {isAdmitted ? "Undo Check-In" : "Check In ✓"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GENERATE & SHARE TICKET LINK */}
          {activeTab === "link" && (
            <div style={{ maxWidth: "680px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <SparklesIcon size={32} style={{ color: "#D4AF37", marginBottom: "8px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#ffffff", margin: 0 }}>
                  Generate &amp; Share Public Ticket Link
                </h3>
                <p style={{ fontSize: "13px", color: "#E2D9BC", margin: "4px 0 0" }}>
                  Share your official event ticket link on Instagram, WhatsApp, flyers, or student group chats to sell out fast.
                </p>
              </div>

              {/* Primary Public Ticket Link */}
              <div style={{ background: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.35)", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "900", textTransform: "uppercase", color: "#F5D061", marginBottom: "8px" }}>
                  Official Event Page &amp; Ticket Link
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    readOnly
                    value={shareableEventLink}
                    style={{
                      flex: 1,
                      height: "44px",
                      padding: "0 14px",
                      background: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      padding: "0 20px",
                      background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#070709",
                      fontSize: "13px",
                      fontWeight: "900",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(212, 175, 55, 0.4)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {copiedLink ? "Copied! ✓" : "Copy Link"}
                  </button>
                </div>
                <div style={{ fontSize: "11px", color: "#948B75", marginTop: "8px" }}>
                  Anyone clicking this link will land directly on this event&apos;s ticket booking page on Nà Mè Dèy Sell.
                </div>
              </div>

              {/* 1-Click Social Sharing Channels */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#ffffff", textTransform: "uppercase", marginBottom: "10px" }}>
                  Quick Share to Social Networks:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`🔥 Get your official tickets for "${event.title}" on Nà Mè Dèy Sell now: ${shareableEventLink}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "12px",
                      background: "#25D366",
                      color: "#ffffff",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "800",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)"
                    }}
                  >
                    <span>💬 Share on WhatsApp</span>
                  </a>

                  {/* Twitter / X */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎟️ Secure your passes now for "${event.title}" on Nà Mè Dèy Sell:\n\n${shareableEventLink}\n\n#NaMeDeySell #EventsNG`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "12px",
                      background: "#1DA1F2",
                      color: "#ffffff",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "800",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    <span>🐦 Share on X (Twitter)</span>
                  </a>
                </div>
              </div>

              {/* Direct Attendee Checkout Deep Link */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#E2D9BC", textTransform: "uppercase" }}>
                    Direct Attendee Checkout Link (Fast-Track)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDirectLink}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#F5D061",
                      fontSize: "11px",
                      fontWeight: "800",
                      cursor: "pointer"
                    }}
                  >
                    {copiedDirectLink ? "Copied! ✓" : "Copy Direct Link"}
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={directCheckoutLink}
                  style={{
                    width: "100%",
                    height: "36px",
                    padding: "0 10px",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    color: "#948B75",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 4: EVENT ACTIVITY & LOGS */}
          {activeTab === "activity" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#ffffff", margin: 0 }}>
                    Event Audit &amp; Live Activity Log
                  </h3>
                  <p style={{ fontSize: "12px", color: "#E2D9BC", margin: "2px 0 0" }}>
                    Verified log of purchases, admissions, and changes for &quot;{event.title}&quot;.
                  </p>
                </div>
              </div>

              {activitiesList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <ActivityIcon size={36} style={{ color: "#D4AF37", opacity: 0.4, marginBottom: "8px" }} />
                  <h4 style={{ fontSize: "15px", color: "#ffffff", margin: 0 }}>No Activity Logged Yet</h4>
                  <p style={{ fontSize: "12px", color: "#948B75", margin: "4px 0 0" }}>
                    All future ticket purchases, gate admissions, and event edits will be recorded here with audit timestamps.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {activitiesList.map(act => (
                    <div
                      key={act.id}
                      style={{
                        padding: "12px 16px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(212, 175, 55, 0.15)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "14px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            background: act.type === "payment" ? "rgba(16, 185, 129, 0.15)" : act.type === "checkin" ? "rgba(96, 165, 250, 0.15)" : "rgba(212, 175, 55, 0.15)",
                            color: act.type === "payment" ? "#10B981" : act.type === "checkin" ? "#60A5FA" : "#D4AF37",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {act.type === "payment" ? <CreditCardIcon size={18} /> : act.type === "checkin" ? <QrCodeIcon size={18} /> : <SparklesIcon size={18} />}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff" }}>
                            {act.title}
                          </div>
                          <div style={{ fontSize: "12px", color: "#E2D9BC" }}>
                            {act.description}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: "11px", color: "#948B75", whiteSpace: "nowrap" }}>
                        {new Date(act.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })} at {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
