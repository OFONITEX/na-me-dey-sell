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
  MailIcon
} from "./Icons";
import { formatNaira, getStoredTickets, deleteEvent } from "../lib/ticketService";
import EditEventModal from "./EditEventModal";

export default function OrganizerDashboard({
  currentUser,
  events = [],
  isOpen,
  onClose,
  onOpenCreateEvent,
  onOpenScanner,
  onEventsRefresh
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState("events"); // "events" | "attendees" | "payouts"
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchAttendeeQuery, setSearchAttendeeQuery] = useState("");
  const [selectedEventFilter, setSelectedEventFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState("");

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

  // Filter events belonging to this organizer
  const myEvents = useMemo(() => {
    if (!currentUser) return [];
    const userEmail = (currentUser.email || "").toLowerCase().trim();
    const userName = (currentUser.fullName || "").toLowerCase().trim();
    const userId = (currentUser.id || "").toLowerCase().trim();

    return events.filter(e => {
      const orgEmail = (e.organizerEmail || "").toLowerCase().trim();
      const orgId = (e.organizerId || "").toLowerCase().trim();
      const orgName = (e.organizer || "").toLowerCase().trim();

      // If user created this event, matches email, ID, or name
      const isOwner = (userEmail && orgEmail === userEmail) ||
        (userId && orgId === userId) ||
        (userName && orgName.includes(userName)) ||
        (e.id && e.id.startsWith("evt_user_"));

      // Also if user is super admin or in demo mode with no events, show first 2 events so they can test immediately
      return isOwner;
    });
  }, [events, currentUser]);

  // If user has no self-created events yet, show top sample events as editable demo events
  const displayEvents = myEvents.length > 0 ? myEvents : events.slice(0, 2);

  // All tickets belonging to organizer's events
  const allTickets = useMemo(() => {
    const rawTickets = getStoredTickets();
    const myEventIds = new Set(displayEvents.map(e => e.id));
    return rawTickets.filter(t => myEventIds.has(t.eventId));
  }, [displayEvents]);

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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        backgroundColor: "rgba(5, 5, 8, 0.92)",
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
        style={{
          width: "100%",
          maxWidth: "1080px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #13131A 0%, #08080C 100%)",
          border: "1px solid rgba(212, 175, 55, 0.4)",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.95), 0 0 50px rgba(212, 175, 55, 0.2)",
          overflow: "hidden"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Gold Accent Line */}
        <div style={{ height: "3px", width: "100%", background: "linear-gradient(90deg, transparent, #D4AF37, #F5D061, transparent)" }} />

        {/* Dashboard Top Header */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0, 0, 0, 0.3)"
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
                  Verified Organizer Hub
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
              <span>Create New Event</span>
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
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>Total Events</div>
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
            background: "rgba(10,10,15,0.5)"
          }}
        >
          {[
            { id: "events", label: `My Events (${displayEvents.length})` },
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
              {displayEvents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <TicketIcon size={48} style={{ color: "#D4AF37", opacity: 0.5, marginBottom: "16px" }} />
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: 0 }}>No Events Created Yet</h3>
                  <p style={{ fontSize: "13px", color: "#948B75", maxWidth: "420px", margin: "8px auto 20px" }}>
                    You have not published any events under this account. Create your first live concert, festival, or meetup now!
                  </p>
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
                      cursor: "pointer"
                    }}
                  >
                    Publish First Event
                  </button>
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
                              <span style={{ color: "#E2D9BC", fontWeight: "700" }}>{soldCount} tickets sold</span>
                              <span style={{ color: "#F5D061" }}>{formatNaira(evtRev)} gross</span>
                            </div>
                            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${percent}%`, height: "100%", background: "linear-gradient(90deg, #D4AF37, #10B981)", borderRadius: "3px" }} />
                            </div>
                          </div>
                        </div>

                        {/* Organizer Action Buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "160px" }}>
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

          {/* TAB 2: ATTENDEE & SALES ROSTER */}
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
                          </td>

                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ background: "rgba(212, 175, 55, 0.15)", color: "#F5D061", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>
                              {t.tierName}
                            </span>
                            <div style={{ fontSize: "10px", color: "#948B75", marginTop: "2px" }}>{t.seatNumber}</div>
                          </td>

                          <td style={{ padding: "12px 16px", color: "#10B981", fontWeight: "700" }}>
                            {formatNaira(t.tierPrice, t.currency)}
                          </td>

                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontSize: "11px",
                                fontWeight: "700",
                                background: t.status === "checked_in" ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.15)",
                                color: t.status === "checked_in" ? "#10B981" : "#60A5FA"
                              }}
                            >
                              {t.status === "checked_in" ? "✓ Checked In" : "Active Pass"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYOUT & SETTLEMENTS */}
          {activeTab === "payouts" && (
            <div style={{ maxWidth: "680px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#ffffff", margin: "0 0 12px" }}>
                  Financial Settlement Breakdown
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#948B75" }}>Gross Ticket Sales</div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>{formatNaira(totalRevenue)}</div>
                  </div>

                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#948B75" }}>Platform Fee (5%)</div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#EF4444", marginTop: "4px" }}>- {formatNaira(Math.round(totalRevenue * 0.05))}</div>
                  </div>

                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#D4AF37" }}>Net Payout Balance (95%)</div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#10B981", marginTop: "4px" }}>{formatNaira(Math.round(totalRevenue * 0.95))}</div>
                  </div>
                </div>
              </div>

              {/* Bank Account Details Form */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#ffffff", margin: "0 0 4px" }}>
                  Bank Settlement Details (Monnify Direct Payout)
                </h3>
                <p style={{ fontSize: "12px", color: "#948B75", margin: "0 0 16px" }}>
                  Ticket earnings will be deposited into this verified Nigerian bank account.
                </p>

                <form onSubmit={handleSaveBank} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#D4AF37", marginBottom: "4px" }}>
                      BANK NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={bankDetails.bankName}
                      onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      style={{ width: "100%", height: "40px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#ffffff", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#D4AF37", marginBottom: "4px" }}>
                      ACCOUNT NUMBER
                    </label>
                    <input
                      type="text"
                      required
                      value={bankDetails.accountNumber}
                      onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      style={{ width: "100%", height: "40px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#ffffff", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#D4AF37", marginBottom: "4px" }}>
                      ACCOUNT NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={bankDetails.accountName}
                      onChange={e => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                      style={{ width: "100%", height: "40px", padding: "0 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#ffffff", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: "10px 20px",
                      background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#070709",
                      fontWeight: "800",
                      fontSize: "13px",
                      cursor: "pointer",
                      alignSelf: "flex-start",
                      marginTop: "6px"
                    }}
                  >
                    Save Settlement Account
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Event Modal Integration */}
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
