"use client";

import { useState, useMemo } from "react";
import {
  CloseIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  TicketIcon,
  CalendarIcon,
  MapPinIcon,
  QrCodeIcon,
  DownloadIcon,
  SearchIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CreditCardIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  ActivityIcon
} from "./Icons";
import {
  formatNaira,
  getStoredTickets,
  deleteEvent,
  saveNewEvent,
  getOrganizerEventAnalytics
} from "../lib/ticketService";
import { isSuperAdmin, isEventCreator, canEditEvent } from "../lib/authService";
import EditEventModal from "./EditEventModal";

export default function OrganizerDashboard({
  currentUser,
  events = [],
  isOpen,
  onClose,
  onOpenCreateEvent,
  onOpenScanner,
  onEventsRefresh,
  onOpenEventAdmin
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState("events"); // "events" | "analytics" | "attendees" | "payouts"
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchAttendeeQuery, setSearchAttendeeQuery] = useState("");
  const [selectedEventFilter, setSelectedEventFilter] = useState("all");
  const [analyticsEventFilter, setAnalyticsEventFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState("");
  const [adminViewAll, setAdminViewAll] = useState(false);

  // Check if current user is Super Admin
  const userIsSuperAdmin = isSuperAdmin(currentUser);

  // Payout bank state
  const [bankDetails, setBankDetails] = useState(() => {
    if (typeof window === "undefined") return { bankName: "Access Bank", accountNumber: "0123456789", accountName: currentUser?.fullName || "Organizer" };
    try {
      const saved = localStorage.getItem(`nmds_bank_${currentUser?.id || "default"}`);
      return saved ? JSON.parse(saved) : { bankName: "Access Bank", accountNumber: "0123456789", accountName: currentUser?.fullName || "Organizer" };
    } catch {
      return { bankName: "Access Bank", accountNumber: "0123456789", accountName: currentUser?.fullName || "Organizer" };
    }
  });

  // Filter events belonging to this organizer account, or show all for Super Admin / preview
  const myEvents = useMemo(() => {
    // If user is a super admin, grant visibility to all platform events
    if (userIsSuperAdmin) {
      return events;
    }
    // If not logged in, show events so organizers can preview without auth lock
    if (!currentUser) {
      return events;
    }
    // Filter by creator, but ensure NAPHSS is always included for authorized emails or super admins
    const userEmail = (currentUser.email || "").toLowerCase().trim();
    return events.filter(e => {
      if (
        (e.id === "evt_naphss_dinner_night" || (e.title && e.title.toLowerCase().includes("naphss"))) &&
        (userEmail === "iamrhobbinraynerhq01@gmail.com" || userEmail === "brinoekanem@gmail.com" || userIsSuperAdmin)
      ) {
        return true;
      }
      return isEventCreator(e, currentUser);
    });
  }, [events, currentUser, userIsSuperAdmin]);

  // Display events based on admin toggle or user's own events, always prioritizing NAPHSS at the top
  const displayEvents = useMemo(() => {
    const base = (userIsSuperAdmin && adminViewAll) ? events : myEvents;
    const sorted = [...base];
    const naphssIdx = sorted.findIndex(e => e.id === "evt_naphss_dinner_night" || (e.title && e.title.toLowerCase().includes("naphss")));
    if (naphssIdx > 0) {
      const [naphss] = sorted.splice(naphssIdx, 1);
      sorted.unshift(naphss);
    }
    return sorted;
  }, [userIsSuperAdmin, adminViewAll, events, myEvents]);

  // All tickets belonging to displayed events
  const allTickets = useMemo(() => {
    const rawTickets = getStoredTickets();
    const myEventIds = new Set(displayEvents.map(e => e.id));
    return rawTickets.filter(t => myEventIds.has(t.eventId));
  }, [displayEvents]);

  // Analytics data generated for organizer
  const analyticsData = useMemo(() => {
    return getOrganizerEventAnalytics(currentUser?.email || currentUser?.id, analyticsEventFilter, displayEvents);
  }, [currentUser, analyticsEventFilter, displayEvents, allTickets]);

  // Filtered attendees list
  const filteredAttendees = useMemo(() => {
    return allTickets.filter(t => {
      const matchesEvent = selectedEventFilter === "all" || t.eventId === selectedEventFilter;
      const q = searchAttendeeQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        t.attendee?.name?.toLowerCase().includes(q) ||
        t.attendee?.email?.toLowerCase().includes(q) ||
        t.attendee?.phone?.toLowerCase().includes(q) ||
        t.ticketId?.toLowerCase().includes(q) ||
        t.orderId?.toLowerCase().includes(q);
      return matchesEvent && matchesSearch;
    });
  }, [allTickets, selectedEventFilter, searchAttendeeQuery]);

  // Aggregate Metrics
  const totalRevenue = useMemo(() => {
    return allTickets.reduce((sum, t) => sum + (Number(t.tierPrice) || 0), 0);
  }, [allTickets]);

  const totalTicketsSold = allTickets.length;
  const checkedInCount = allTickets.filter(t => t.status === "checked_in").length;

  const handleDeleteEvent = (eventId, eventTitle) => {
    if (confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      deleteEvent(eventId);
      if (onEventsRefresh) onEventsRefresh();
      setToastMessage(`Event "${eventTitle}" has been removed.`);
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  const handleExportCSV = () => {
    if (filteredAttendees.length === 0) {
      alert("No attendee records found to export.");
      return;
    }

    const headers = ["Ticket ID", "Order ID", "Event Title", "Attendee Name", "Email", "Phone", "Tier", "Price (NGN)", "Seat Number", "Check-in Status", "Purchase Date"];
    const rows = filteredAttendees.map(t => [
      `"${t.ticketId || ""}"`,
      `"${t.orderId || ""}"`,
      `"${(t.eventTitle || "").replace(/"/g, '""')}"`,
      `"${(t.attendee?.name || "").replace(/"/g, '""')}"`,
      `"${t.attendee?.email || ""}"`,
      `"${t.attendee?.phone || ""}"`,
      `"${t.tierName || ""}"`,
      t.tierPrice || 0,
      `"${t.seatNumber || ""}"`,
      `"${t.status || "active"}"`,
      `"${t.purchaseDate || ""}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `NMDS_Attendees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Attendee CSV exported successfully!");
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSaveBank = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(`nmds_bank_${currentUser?.id || "default"}`, JSON.stringify(bankDetails));
      setToastMessage("Payout settlement bank account updated!");
      setTimeout(() => setToastMessage(""), 3500);
    } catch {}
  };

  return (
    <div
      className="dashboard-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        backgroundColor: "rgba(5, 5, 8, 0.94)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
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
        className="dashboard-modal-container"
        style={{
          width: "100%",
          maxWidth: "1140px",
          height: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #13131A 0%, #08080C 100%)",
          border: "1px solid rgba(212, 175, 55, 0.45)",
          borderRadius: "20px",
          boxShadow: "0 25px 65px -10px rgba(0, 0, 0, 0.95), 0 0 55px rgba(212, 175, 55, 0.2)",
          overflow: "hidden"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Gold Accent Line */}
        <div style={{ height: "3px", width: "100%", background: "linear-gradient(90deg, transparent, #D4AF37, #F5D061, transparent)" }} />

        {/* Dashboard Top Header */}
        <div
          style={{
            padding: "18px 28px",
            borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0, 0, 0, 0.35)",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #D4AF37 0%, #A67C1E 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#070709",
                boxShadow: "0 4px 14px rgba(212, 175, 55, 0.35)"
              }}
            >
              <TicketIcon size={26} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#D4AF37",
                    background: "rgba(212, 175, 55, 0.15)",
                    border: "1px solid rgba(212, 175, 55, 0.35)",
                    padding: "2px 8px",
                    borderRadius: "20px"
                  }}
                >
                  Organizer Studio
                </span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                  {currentUser?.email}
                </span>
              </div>
              <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", margin: "2px 0 0" }}>
                {currentUser?.fullName || "Organizer"} Dashboard
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={onOpenCreateEvent}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 18px",
                background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                border: "none",
                borderRadius: "8px",
                color: "#070709",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(212, 175, 55, 0.35)"
              }}
            >
              <PlusIcon size={16} />
              <span>Publish New Event</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "38px",
                height: "38px",
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

        {/* Quick KPI Stat Strip */}
        <div
          style={{
            padding: "16px 28px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            background: "rgba(0,0,0,0.2)",
            borderBottom: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>My Live Events</div>
            <div style={{ fontSize: "24px", fontWeight: "900", color: "#ffffff", marginTop: "4px" }}>{displayEvents.length}</div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>Tickets Sold</div>
            <div style={{ fontSize: "24px", fontWeight: "900", color: "#F5D061", marginTop: "4px" }}>{totalTicketsSold}</div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>Gross Revenue</div>
            <div style={{ fontSize: "24px", fontWeight: "900", color: "#10B981", marginTop: "4px" }}>{formatNaira(totalRevenue)}</div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>Checked-In at Gate</div>
            <div style={{ fontSize: "24px", fontWeight: "900", color: "#60A5FA", marginTop: "4px" }}>{checkedInCount} / {totalTicketsSold}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "12px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,10,15,0.5)",
            overflowX: "auto"
          }}
        >
          {[
            { id: "events", label: `My Events (${displayEvents.length})` },
            { id: "analytics", label: "📊 Event Analytics" },
            { id: "attendees", label: `Attendee Roster (${allTickets.length})` },
            { id: "payouts", label: "Payout & Settlements" }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 18px",
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
          <div style={{ margin: "12px 28px 0", padding: "10px 16px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "8px", color: "#6EE7B7", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircleIcon size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Container (Scrollable) */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {/* TAB 1: MY EVENTS */}
          {activeTab === "events" && (
            <div>
              {/* Super Admin View All Toggle */}
              {userIsSuperAdmin && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "10px", padding: "10px 16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#F5D061", fontWeight: "700" }}>👑 Super Admin View:</span>
                    <span style={{ fontSize: "12px", color: "#948B75" }}>
                      {adminViewAll ? `Showing all ${events.length} platform events` : `Showing your created events (${myEvents.length})`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdminViewAll(!adminViewAll)}
                    style={{
                      padding: "5px 12px",
                      background: adminViewAll ? "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)" : "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(212, 175, 55, 0.4)",
                      borderRadius: "6px",
                      color: adminViewAll ? "#070709" : "#E2D9BC",
                      fontSize: "11px",
                      fontWeight: "800",
                      cursor: "pointer"
                    }}
                  >
                    {adminViewAll ? "Switch to My Created Events Only" : `View All Platform Events (${events.length})`}
                  </button>
                </div>
              )}

              {displayEvents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <TicketIcon size={48} style={{ color: "#D4AF37", opacity: 0.5, marginBottom: "16px" }} />
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0 }}>No Events Created Yet</h3>
                  <p style={{ fontSize: "13px", color: "#948B75", maxWidth: "440px", margin: "8px auto 20px" }}>
                    You have not published any events under this account ({currentUser?.email}). Publish your live concert, festival, wedding, or business event to start selling tickets and monitoring analytics.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={onOpenCreateEvent}
                      style={{
                        padding: "10px 24px",
                        background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#070709",
                        fontWeight: "800",
                        fontSize: "13px",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(212, 175, 55, 0.35)"
                      }}
                    >
                      + Create and Publish Event
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {displayEvents.map(evt => {
                    const evtTickets = allTickets.filter(t => t.eventId === evt.id);
                    const evtRev = evtTickets.reduce((s, t) => s + (Number(t.tierPrice) || 0), 0);
                    const totalCap = (evt.tiers || []).reduce((s, t) => s + (Number(t.capacity) || 100), 0);
                    const soldCount = evtTickets.length;
                    const percent = totalCap > 0 ? Math.min(100, Math.round((soldCount / totalCap) * 100)) : 0;

                    return (
                      <div
                        key={evt.id}
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(212, 175, 55, 0.25)",
                          borderRadius: "14px",
                          padding: "18px",
                          display: "grid",
                          gridTemplateColumns: "140px 1fr auto",
                          gap: "20px",
                          alignItems: "center"
                        }}
                      >
                        {/* Event Flyer Thumbnail */}
                        <div style={{ width: "140px", height: "95px", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
                          <img
                            src={evt.imageUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80"}
                            alt={evt.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              top: "6px",
                              left: "6px",
                              background: evt.status === "paused" ? "#EF4444" : "#10B981",
                              color: "#fff",
                              fontSize: "9px",
                              fontWeight: "900",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              textTransform: "uppercase"
                            }}
                          >
                            {evt.status === "paused" ? "Paused" : "Live"}
                          </span>
                        </div>

                        {/* Event Details */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "11px", color: "#D4AF37", fontWeight: "800", textTransform: "uppercase" }}>
                              {evt.category}
                            </span>
                            <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
                            <span style={{ fontSize: "12px", color: "#E2D9BC" }}>
                              {evt.date}
                            </span>
                          </div>

                          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#ffffff", margin: "0 0 6px" }}>
                            {evt.title}
                          </h3>

                          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "#948B75" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <MapPinIcon size={14} style={{ color: "#D4AF37" }} />
                              <span>{evt.venue}, {evt.city}</span>
                            </span>
                          </div>

                          {/* Progress Bar for Ticket Sales */}
                          <div style={{ marginTop: "10px", maxWidth: "340px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                              <span style={{ color: "#E2D9BC", fontWeight: "700" }}>{soldCount} / {totalCap} tickets sold</span>
                              <span style={{ color: "#F5D061" }}>{formatNaira(evtRev)} gross</span>
                            </div>
                            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${percent}%`, height: "100%", background: "linear-gradient(90deg, #D4AF37, #10B981)", borderRadius: "3px" }} />
                            </div>
                          </div>
                        </div>

                        {/* Organizer Action Buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "160px" }}>
                          {/* EVENT ADMIN HUB (SINGLE EVENT DASHBOARD) */}
                          {onOpenEventAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenEventAdmin(evt);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                padding: "8px 14px",
                                background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                                border: "none",
                                borderRadius: "8px",
                                color: "#070709",
                                fontSize: "12px",
                                fontWeight: "900",
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(212, 175, 55, 0.35)"
                              }}
                              title="Open single-event admin studio: tickets sold, link generator, gate check-in & roster"
                            >
                              <span>👑 Event Admin Hub</span>
                            </button>
                          )}

                          {/* EDIT EVENT BUTTON */}
                          <button
                            type="button"
                            onClick={() => setEditingEvent(evt)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              padding: "8px 14px",
                              background: "rgba(212, 175, 55, 0.2)",
                              border: "1px solid rgba(212, 175, 55, 0.4)",
                              borderRadius: "8px",
                              color: "#F5D061",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            <EditIcon size={14} />
                            <span>Edit Event</span>
                          </button>

                          {/* VIEW ATTENDEES */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEventFilter(evt.id);
                              setActiveTab("attendees");
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              padding: "8px 14px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: "8px",
                              color: "#E2D9BC",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            <UserIcon size={14} />
                            <span>View Guest List</span>
                          </button>

                          {/* GATE SCANNER */}
                          <button
                            type="button"
                            onClick={onOpenScanner}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              padding: "8px 14px",
                              background: "rgba(16, 185, 129, 0.15)",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              borderRadius: "8px",
                              color: "#6EE7B7",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            <QrCodeIcon size={14} />
                            <span>Gate Scanner</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORGANIZED EVENT ANALYTICS */}
          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Analytics Header & Event Filter Selector */}
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(212, 175, 55, 0.25)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ActivityIcon size={18} style={{ color: "#D4AF37" }} />
                    <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                      Event Analytics &amp; Performance Tables
                    </h2>
                  </div>
                  <p style={{ fontSize: "12px", color: "#948B75", margin: "4px 0 0" }}>
                    Live conversion rates, ticket tier revenue, and gate admission velocity for your events.
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#E2D9BC", fontWeight: "600" }}>Scope Event:</span>
                  <select
                    value={analyticsEventFilter}
                    onChange={e => setAnalyticsEventFilter(e.target.value)}
                    style={{
                      height: "38px",
                      padding: "0 12px",
                      background: "#13131A",
                      border: "1px solid rgba(212, 175, 55, 0.35)",
                      borderRadius: "8px",
                      color: "#F5D061",
                      fontSize: "12px",
                      fontWeight: "700",
                      outline: "none"
                    }}
                  >
                    <option value="all">📊 All My Events Aggregated</option>
                    {displayEvents.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Organized Table 1: Event Performance & Quick Edit Actions */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                    Event Sales, Payouts &amp; Conversion Table
                  </h3>
                  <span style={{ fontSize: "11px", color: "#D4AF37", fontWeight: "700" }}>
                    {analyticsData.eventSummaries.length} event(s) monitored
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", color: "#D4AF37", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                        <th style={{ padding: "12px 14px" }}>Event Title</th>
                        <th style={{ padding: "12px 14px" }}>Schedule &amp; Venue</th>
                        <th style={{ padding: "12px 14px" }}>Sold / Capacity</th>
                        <th style={{ padding: "12px 14px" }}>Gross Sales (₦)</th>
                        <th style={{ padding: "12px 14px" }}>Net Payout (95%)</th>
                        <th style={{ padding: "12px 14px" }}>Gate Check-In %</th>
                        <th style={{ padding: "12px 14px" }}>Status</th>
                        <th style={{ padding: "12px 14px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.eventSummaries.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: "24px", textAlign: "center", color: "#948B75" }}>
                            No events found for this account. Create an event to begin tracking analytics.
                          </td>
                        </tr>
                      ) : (
                        analyticsData.eventSummaries.map(evt => {
                          const origEvt = displayEvents.find(e => e.id === evt.id) || evt;
                          return (
                            <tr key={evt.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: "700", color: "#ffffff" }}>{evt.title}</div>
                                <div style={{ fontSize: "10px", color: "#D4AF37" }}>{evt.category}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ color: "#E2D9BC" }}>{evt.date}</div>
                                <div style={{ fontSize: "11px", color: "#948B75" }}>{evt.venue}, {evt.city}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: "700", color: "#ffffff" }}>{evt.ticketsSold} / {evt.capacity}</div>
                                <div style={{ width: "100px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginTop: "4px", overflow: "hidden" }}>
                                  <div style={{ width: `${evt.capacity > 0 ? Math.min(100, Math.round((evt.ticketsSold / evt.capacity) * 100)) : 0}%`, height: "100%", background: "#10B981" }} />
                                </div>
                              </td>

                              <td style={{ padding: "12px 14px", fontWeight: "800", color: "#10B981" }}>
                                {formatNaira(evt.grossRevenue)}
                              </td>

                              <td style={{ padding: "12px 14px", fontWeight: "700", color: "#60A5FA" }}>
                                {formatNaira(evt.netPayout)}
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: "700", color: "#ffffff" }}>{evt.checkInRate}%</div>
                                <div style={{ fontSize: "10px", color: "#948B75" }}>{evt.checkedIn}/{evt.ticketsSold} admitted</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <span style={{ padding: "2px 8px", borderRadius: "8px", fontSize: "10px", fontWeight: "800", background: evt.status === "paused" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", color: evt.status === "paused" ? "#EF4444" : "#10B981" }}>
                                  {evt.status === "paused" ? "PAUSED" : "LIVE"}
                                </span>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    type="button"
                                    onClick={() => setEditingEvent(origEvt)}
                                    style={{
                                      padding: "5px 10px",
                                      background: "rgba(212, 175, 55, 0.15)",
                                      border: "1px solid rgba(212, 175, 55, 0.35)",
                                      borderRadius: "6px",
                                      color: "#F5D061",
                                      fontSize: "11px",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px"
                                    }}
                                  >
                                    <EditIcon size={12} />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedEventFilter(evt.id);
                                      setActiveTab("attendees");
                                    }}
                                    style={{
                                      padding: "5px 10px",
                                      background: "rgba(255, 255, 255, 0.06)",
                                      border: "1px solid rgba(255, 255, 255, 0.15)",
                                      borderRadius: "6px",
                                      color: "#E2D9BC",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      cursor: "pointer"
                                    }}
                                  >
                                    Guest List
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Organized Table 2: Ticket Tiers Breakdown Table */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "18px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#ffffff", margin: "0 0 14px" }}>
                  Ticket Tier Sales Breakdown Table
                </h3>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", color: "#D4AF37", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                        <th style={{ padding: "10px 14px" }}>Event</th>
                        <th style={{ padding: "10px 14px" }}>Tier Pass Name</th>
                        <th style={{ padding: "10px 14px" }}>Price (₦)</th>
                        <th style={{ padding: "10px 14px" }}>Sold / Capacity</th>
                        <th style={{ padding: "10px 14px" }}>Tier Revenue (₦)</th>
                        <th style={{ padding: "10px 14px" }}>Remaining Seats</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.tierSummaries.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#948B75" }}>
                            No tier data available.
                          </td>
                        </tr>
                      ) : (
                        analyticsData.tierSummaries.map((tier, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "10px 14px", color: "#ffffff", fontWeight: "700" }}>
                              {tier.eventTitle}
                            </td>
                            <td style={{ padding: "10px 14px", color: "#F5D061", fontWeight: "700" }}>
                              {tier.name}
                            </td>
                            <td style={{ padding: "10px 14px", color: "#10B981", fontWeight: "700" }}>
                              {formatNaira(tier.price)}
                            </td>
                            <td style={{ padding: "10px 14px", color: "#E2D9BC" }}>
                              {tier.sold} / {tier.capacity}
                            </td>
                            <td style={{ padding: "10px 14px", color: "#10B981", fontWeight: "800" }}>
                              {formatNaira(tier.gross)}
                            </td>
                            <td style={{ padding: "10px 14px", color: tier.remaining < 20 ? "#EF4444" : "#E2D9BC" }}>
                              {tier.remaining} tickets left
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDEE & SALES ROSTER */}
          {activeTab === "attendees" && (
            <div>
              {/* Filter and Search Bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                  <div style={{ position: "relative", flex: 1, maxWidth: "340px" }}>
                    <SearchIcon size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "rgba(212,175,55,0.7)" }} />
                    <input
                      type="text"
                      placeholder="Search attendee, ticket ID, phone..."
                      value={searchAttendeeQuery}
                      onChange={e => setSearchAttendeeQuery(e.target.value)}
                      style={{
                        width: "100%",
                        height: "40px",
                        paddingLeft: "36px",
                        paddingRight: "12px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "13px",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <select
                    value={selectedEventFilter}
                    onChange={e => setSelectedEventFilter(e.target.value)}
                    style={{
                      height: "40px",
                      padding: "0 12px",
                      background: "#13131A",
                      border: "1px solid rgba(212, 175, 55, 0.25)",
                      borderRadius: "8px",
                      color: "#E2D9BC",
                      fontSize: "13px",
                      outline: "none"
                    }}
                  >
                    <option value="all">All My Events</option>
                    {displayEvents.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 16px",
                    background: "rgba(212, 175, 55, 0.15)",
                    border: "1px solid rgba(212, 175, 55, 0.4)",
                    borderRadius: "8px",
                    color: "#F5D061",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  <DownloadIcon size={16} />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Attendees Table */}
              <div style={{ overflowX: "auto", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", color: "#D4AF37", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      <th style={{ padding: "12px 16px" }}>Attendee</th>
                      <th style={{ padding: "12px 16px" }}>Contact</th>
                      <th style={{ padding: "12px 16px" }}>Event</th>
                      <th style={{ padding: "12px 16px" }}>Ticket &amp; Tier</th>
                      <th style={{ padding: "12px 16px" }}>Amount</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#948B75" }}>
                          No tickets sold matching current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredAttendees.map((t, idx) => (
                        <tr
                          key={t.ticketId || idx}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"
                          }}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontWeight: "700", color: "#ffffff" }}>{t.attendee?.name || "Attendee"}</div>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>ID: {t.ticketId}</div>
                          </td>

                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ color: "#E2D9BC", fontSize: "12px" }}>{t.attendee?.email}</div>
                            <div style={{ color: "#948B75", fontSize: "11px" }}>{t.attendee?.phone}</div>
                          </td>

                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ color: "#ffffff", fontWeight: "600", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {t.eventTitle}
                            </div>
                            <div style={{ fontSize: "11px", color: "#948B75" }}>{t.city}</div>
                          </td>

                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ color: "#F5D061", fontWeight: "600" }}>{t.tierName}</div>
                            <div style={{ fontSize: "11px", color: "#948B75" }}>Seat: {t.seatNumber}</div>
                          </td>

                          <td style={{ padding: "12px 16px", color: "#10B981", fontWeight: "700" }}>
                            {formatNaira(t.tierPrice, t.currency)}
                          </td>

                          <td style={{ padding: "12px 16px" }}>
                            {t.status === "checked_in" ? (
                              <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "800", background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                                Checked In
                              </span>
                            ) : (
                              <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "800", background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
                                Active Pass
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYOUT & SETTLEMENTS */}
          {activeTab === "payouts" && (
            <div style={{ maxWidth: "700px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "24px", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#ffffff", margin: "0 0 16px" }}>
                  Automated Settlement Bank Account
                </h3>

                <form onSubmit={handleSaveBank} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "#948B75", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Bank Name</label>
                    <input
                      type="text"
                      required
                      value={bankDetails.bankName}
                      onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      style={{ width: "100%", height: "42px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "#948B75", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>NUBAN Account Number (10 Digits)</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={bankDetails.accountNumber}
                      onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      style={{ width: "100%", height: "42px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", color: "#948B75", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Account Beneficiary Name</label>
                    <input
                      type="text"
                      required
                      value={bankDetails.accountName}
                      onChange={e => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                      style={{ width: "100%", height: "42px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ marginTop: "8px", height: "42px", background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)", border: "none", borderRadius: "8px", color: "#070709", fontSize: "13px", fontWeight: "800", cursor: "pointer" }}
                  >
                    Save Settlement Details
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          isOpen={Boolean(editingEvent)}
          onClose={() => setEditingEvent(null)}
          onEventUpdated={(updated) => {
            setEditingEvent(null);
            if (onEventsRefresh) onEventsRefresh();
            setToastMessage(`Event "${updated.title}" successfully updated!`);
            setTimeout(() => setToastMessage(""), 3500);
          }}
        />
      )}
    </div>
  );
}
