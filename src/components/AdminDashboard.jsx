"use client";

import { useState, useMemo } from "react";
import {
  CloseIcon,
  CrownIcon,
  TicketIcon,
  CreditCardIcon,
  CalendarIcon,
  MapPinIcon,
  SearchIcon,
  DownloadIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  AlertTriangleIcon,
  ActivityIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  QrCodeIcon
} from "./Icons";
import {
  formatNaira,
  getStoredEvents,
  getStoredTickets,
  getPaymentsLedger,
  toggleEventFeatured,
  toggleEventStatus,
  deleteEvent
} from "../lib/ticketService";
import {
  getAllRegisteredUsers,
  isSuperAdmin,
  SUPER_ADMIN_EMAILS,
  verifyAdminPasscode,
  updateUserRole
} from "../lib/authService";
import EditEventModal from "./EditEventModal";

export default function AdminDashboard({
  currentUser,
  isOpen,
  onClose,
  onEventsRefresh
}) {
  if (!isOpen) return null;

  // Passcode unlock state if user is not automatically authenticated as superadmin
  const [passcode, setPasscode] = useState("");
  const [passcodeUnlocked, setPasscodeUnlocked] = useState(false);
  const [passcodeError, setPasscodeError] = useState("");

  const isAuthorized = useMemo(() => {
    return isSuperAdmin(currentUser) || passcodeUnlocked;
  }, [currentUser, passcodeUnlocked]);

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "payments" | "events" | "users"
  const [editingEvent, setEditingEvent] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Filters
  const [searchPaymentQuery, setSearchPaymentQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [searchEventQuery, setSearchEventQuery] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("all");
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [inspectedPayment, setInspectedPayment] = useState(null);

  // Data sources
  const events = useMemo(() => getStoredEvents(), [isOpen, editingEvent]);
  const tickets = useMemo(() => getStoredTickets(), [isOpen]);
  const payments = useMemo(() => getPaymentsLedger(), [isOpen]);
  const users = useMemo(() => getAllRegisteredUsers(), [isOpen]);

  // Aggregate Metrics
  const grossPlatformVolume = useMemo(() => {
    return payments.reduce((sum, p) => sum + (Number(p.grossAmount) || 0), 0);
  }, [payments]);

  const platformFeesCollected = useMemo(() => {
    return payments.reduce((sum, p) => sum + (Number(p.platformFee) || 0), 0);
  }, [payments]);

  const organizerPayoutsTotal = useMemo(() => {
    return payments.reduce((sum, p) => sum + (Number(p.organizerPayout) || 0), 0);
  }, [payments]);

  const totalTicketsIssued = tickets.length;
  const activeEventsCount = events.filter(e => e.status !== "paused").length;

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesStatus = paymentStatusFilter === "all" || p.paymentStatus === paymentStatusFilter;
      const q = searchPaymentQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.orderId?.toLowerCase().includes(q) ||
        p.transactionRef?.toLowerCase().includes(q) ||
        p.paymentReference?.toLowerCase().includes(q) ||
        p.eventTitle?.toLowerCase().includes(q) ||
        p.organizer?.toLowerCase().includes(q) ||
        p.attendee?.name?.toLowerCase().includes(q) ||
        p.attendee?.email?.toLowerCase().includes(q) ||
        p.attendee?.phone?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [payments, paymentStatusFilter, searchPaymentQuery]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesCategory = eventCategoryFilter === "all" || e.category?.toLowerCase() === eventCategoryFilter.toLowerCase();
      const q = searchEventQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        e.title?.toLowerCase().includes(q) ||
        e.organizer?.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [events, eventCategoryFilter, searchEventQuery]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchUserQuery.toLowerCase().trim();
      return !q ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q);
    });
  }, [users, searchUserQuery]);

  // Export Payments CSV
  const handleExportPaymentsCSV = () => {
    if (filteredPayments.length === 0) {
      alert("No payments found to export.");
      return;
    }

    const headers = [
      "Order ID",
      "Monnify Payment Ref",
      "Transaction Ref",
      "Event Title",
      "Organizer",
      "Payer Name",
      "Payer Email",
      "Payer Phone",
      "Quantity",
      "Tier Name",
      "Gross Amount (NGN)",
      "Platform Fee (5%)",
      "Organizer Payout (95%)",
      "Status",
      "Timestamp"
    ];

    const rows = filteredPayments.map(p => [
      `"${p.orderId || ""}"`,
      `"${p.paymentReference || ""}"`,
      `"${p.transactionRef || ""}"`,
      `"${(p.eventTitle || "").replace(/"/g, '""')}"`,
      `"${(p.organizer || "").replace(/"/g, '""')}"`,
      `"${(p.attendee?.name || "").replace(/"/g, '""')}"`,
      `"${p.attendee?.email || ""}"`,
      `"${p.attendee?.phone || ""}"`,
      p.quantity || 1,
      `"${p.tierName || ""}"`,
      p.grossAmount || 0,
      p.platformFee || 0,
      p.organizerPayout || 0,
      `"${p.paymentStatus || "PAID"}"`,
      `"${p.timestamp || ""}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `NMDS_Payments_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Payments Ledger exported successfully!");
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleToggleFeatured = (eventId) => {
    toggleEventFeatured(eventId);
    if (onEventsRefresh) onEventsRefresh();
    setToastMessage("Event feature status updated.");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleToggleStatus = (eventId, currentStatus) => {
    const newStatus = currentStatus === "paused" ? "live" : "paused";
    toggleEventStatus(eventId, newStatus);
    if (onEventsRefresh) onEventsRefresh();
    setToastMessage(`Event status switched to ${newStatus.toUpperCase()}`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleDeleteEvent = (eventId, title) => {
    if (confirm(`ADMIN ACTION: Permanently remove event "${title}" from Nà Mè Dèy Sell?`)) {
      deleteEvent(eventId);
      if (onEventsRefresh) onEventsRefresh();
      setToastMessage(`Event "${title}" has been deleted.`);
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole);
    setToastMessage(`User role updated to ${newRole.toUpperCase()}`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (verifyAdminPasscode(passcode)) {
      setPasscodeUnlocked(true);
      setPasscodeError("");
    } else {
      setPasscodeError("Invalid Admin PIN passcode. Try 'NMDS-ADMIN-2026'");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9995,
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
        style={{
          width: "100%",
          maxWidth: "1140px",
          height: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #121019 0%, #07070A 100%)",
          border: "1px solid rgba(212, 175, 55, 0.5)",
          borderRadius: "20px",
          boxShadow: "0 25px 70px -10px rgba(0, 0, 0, 0.95), 0 0 60px rgba(212, 175, 55, 0.25)",
          overflow: "hidden"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Gold & Ruby Glow Line */}
        <div style={{ height: "4px", width: "100%", background: "linear-gradient(90deg, #D4AF37, #F5D061, #EF4444, #D4AF37)" }} />

        {/* Header */}
        <div
          style={{
            padding: "18px 28px",
            borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0, 0, 0, 0.4)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #D4AF37 0%, #A67C1E 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#070709",
                boxShadow: "0 4px 14px rgba(212, 175, 55, 0.4)"
              }}
            >
              <CrownIcon size={24} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#070709",
                    background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                    padding: "2px 8px",
                    borderRadius: "4px"
                  }}
                >
                  SUPER ADMIN COMMAND CENTER
                </span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                  Nà Mè Dèy Sell Root
                </span>
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", margin: "2px 0 0" }}>
                Platform Control &amp; Payments Audit
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {currentUser?.email && (
              <span style={{ fontSize: "12px", color: "#F5D061", fontWeight: "700" }}>
                {currentUser.email}
              </span>
            )}
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

        {/* PASSCODE GATE IF NOT PRE-AUTHENTICATED */}
        {!isAuthorized ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
            <div style={{ maxWidth: "420px", width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "16px", padding: "28px", textAlign: "center" }}>
              <div style={{ width: "52px", height: "52px", margin: "0 auto 16px", borderRadius: "50%", background: "rgba(212, 175, 55, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37" }}>
                <CrownIcon size={28} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", margin: "0 0 8px" }}>Super Admin Access</h2>
              <p style={{ fontSize: "13px", color: "#948B75", margin: "0 0 20px" }}>
                Authorized for <strong>brinoekanem@gmail.com</strong>, <strong>iamrhobbinraynerhq01@gmail.com</strong>, or enter master PIN.
              </p>

              {passcodeError && (
                <div style={{ marginBottom: "14px", padding: "8px 12px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "8px", color: "#FCA5A5", fontSize: "12px" }}>
                  {passcodeError}
                </div>
              )}

              <form onSubmit={handlePasscodeSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="password"
                  required
                  placeholder="Enter Admin PIN"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  style={{ width: "100%", height: "42px", textAlign: "center", letterSpacing: "0.2em", fontSize: "16px", fontWeight: "800", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                />
                <button
                  type="submit"
                  style={{ width: "100%", height: "42px", background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)", border: "none", borderRadius: "8px", color: "#070709", fontWeight: "800", fontSize: "13px", cursor: "pointer" }}
                >
                  Authorize Command Center
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* KPI STATS BAR */}
            <div
              style={{
                padding: "16px 28px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: "14px",
                background: "rgba(0,0,0,0.25)",
                borderBottom: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "12px", padding: "12px 16px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>Gross Platform Volume</div>
                <div style={{ fontSize: "22px", fontWeight: "900", color: "#10B981", marginTop: "4px" }}>{formatNaira(grossPlatformVolume)}</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "12px", padding: "12px 16px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#D4AF37", textTransform: "uppercase" }}>Platform Revenue (5%)</div>
                <div style={{ fontSize: "22px", fontWeight: "900", color: "#F5D061", marginTop: "4px" }}>{formatNaira(platformFeesCollected)}</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "12px", padding: "12px 16px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>Organizer Net Payouts</div>
                <div style={{ fontSize: "22px", fontWeight: "900", color: "#60A5FA", marginTop: "4px" }}>{formatNaira(organizerPayoutsTotal)}</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "12px", padding: "12px 16px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>Total Tickets Sold</div>
                <div style={{ fontSize: "22px", fontWeight: "900", color: "#ffffff", marginTop: "4px" }}>{totalTicketsIssued}</div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "12px", padding: "12px 16px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>Events &amp; Organizers</div>
                <div style={{ fontSize: "22px", fontWeight: "900", color: "#ffffff", marginTop: "4px" }}>{events.length} evt / {users.length} usr</div>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                padding: "12px 28px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(10,10,15,0.6)"
              }}
            >
              {[
                { id: "overview", label: "Real-time Pulse" },
                { id: "payments", label: `Payments & Transactions (${payments.length})` },
                { id: "events", label: `All Events (${events.length})` },
                { id: "users", label: `Users & Organizers (${users.length})` }
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

            {/* TOAST MESSAGE */}
            {toastMessage && (
              <div style={{ margin: "12px 28px 0", padding: "10px 16px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "8px", color: "#6EE7B7", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircleIcon size={16} />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* TAB CONTENT */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
              {/* TAB 0: OVERVIEW & REAL-TIME PULSE */}
              {activeTab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {/* Live Activity Feed */}
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <ActivityIcon size={18} style={{ color: "#D4AF37" }} />
                      <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#ffffff", margin: 0 }}>Live Activity Feed</h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {payments.slice(0, 5).map((p, idx) => (
                        <div key={idx} style={{ padding: "10px 12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", borderLeft: "3px solid #10B981", fontSize: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", color: "#ffffff", fontWeight: "700" }}>
                            <span>Payment Received • {p.attendee?.name}</span>
                            <span style={{ color: "#10B981" }}>+ {formatNaira(p.grossAmount)}</span>
                          </div>
                          <div style={{ color: "#948B75", marginTop: "2px" }}>
                            {p.eventTitle} ({p.tierName}) • Ref: {p.paymentReference}
                          </div>
                        </div>
                      ))}

                      {tickets.filter(t => t.status === "checked_in").slice(0, 3).map((t, idx) => (
                        <div key={`checkin_${idx}`} style={{ padding: "10px 12px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", borderLeft: "3px solid #60A5FA", fontSize: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", color: "#ffffff", fontWeight: "700" }}>
                            <span>Gate Check-In • {t.attendee?.name}</span>
                            <span style={{ color: "#60A5FA" }}>Gate Marshall #1</span>
                          </div>
                          <div style={{ color: "#948B75", marginTop: "2px" }}>
                            {t.eventTitle} • Pass: {t.ticketId}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Super Admin Privileges & System Status */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "20px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#ffffff", margin: "0 0 10px" }}>
                        Designated Superadmin Accounts
                      </h3>
                      <p style={{ fontSize: "12px", color: "#948B75", margin: "0 0 14px" }}>
                        These accounts hold unconditional root privileges on Nà Mè Dèy Sell:
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {SUPER_ADMIN_EMAILS.map((email, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <CrownIcon size={16} style={{ color: "#D4AF37" }} />
                              <span style={{ color: "#ffffff", fontWeight: "700", fontSize: "13px" }}>{email}</span>
                            </div>
                            <span style={{ fontSize: "10px", fontWeight: "900", background: "#D4AF37", color: "#070709", padding: "2px 6px", borderRadius: "4px" }}>
                              SUPERADMIN
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "20px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#ffffff", margin: "0 0 10px" }}>
                        Payment Gateway Status
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px" }}>
                        <div>
                          <div style={{ fontWeight: "700", color: "#6EE7B7", fontSize: "13px" }}>Monnify Payment Engine</div>
                          <div style={{ fontSize: "11px", color: "#948B75" }}>Contracts, cards, USSD &amp; virtual account rails</div>
                        </div>
                        <span style={{ color: "#10B981", fontWeight: "800", fontSize: "12px" }}>● OPERATIONAL</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: PAYMENTS & TRANSACTIONS LEDGER */}
              {activeTab === "payments" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                      <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
                        <SearchIcon size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "rgba(212,175,55,0.7)" }} />
                        <input
                          type="text"
                          placeholder="Search Order ID, Monnify Ref, Payer Name..."
                          value={searchPaymentQuery}
                          onChange={e => setSearchPaymentQuery(e.target.value)}
                          style={{ width: "100%", height: "40px", paddingLeft: "36px", paddingRight: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>

                      <select
                        value={paymentStatusFilter}
                        onChange={e => setPaymentStatusFilter(e.target.value)}
                        style={{ height: "40px", padding: "0 12px", background: "#13131A", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#E2D9BC", fontSize: "13px", outline: "none" }}
                      >
                        <option value="all">All Payment Statuses</option>
                        <option value="PAID">PAID</option>
                        <option value="PENDING">PENDING</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportPaymentsCSV}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)", border: "none", borderRadius: "8px", color: "#070709", fontSize: "13px", fontWeight: "800", cursor: "pointer" }}
                    >
                      <DownloadIcon size={16} />
                      <span>Export Payments CSV</span>
                    </button>
                  </div>

                  {/* Payments Table */}
                  <div style={{ overflowX: "auto", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", color: "#D4AF37", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          <th style={{ padding: "12px 14px" }}>Order &amp; Gateway Ref</th>
                          <th style={{ padding: "12px 14px" }}>Event &amp; Organizer</th>
                          <th style={{ padding: "12px 14px" }}>Payer Contact</th>
                          <th style={{ padding: "12px 14px" }}>Gross Paid</th>
                          <th style={{ padding: "12px 14px" }}>Fee Split (5% / 95%)</th>
                          <th style={{ padding: "12px 14px" }}>Status</th>
                          <th style={{ padding: "12px 14px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ padding: "30px", textAlign: "center", color: "#948B75" }}>
                              No payment transactions found matching filter.
                            </td>
                          </tr>
                        ) : (
                          filteredPayments.map((p, idx) => (
                            <tr key={p.orderId || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: "800", color: "#ffffff" }}>{p.orderId}</div>
                                <div style={{ fontSize: "11px", color: "#F5D061", fontFamily: "monospace" }}>{p.paymentReference}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: "700", color: "#ffffff", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {p.eventTitle}
                                </div>
                                <div style={{ fontSize: "11px", color: "#948B75" }}>{p.organizer}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ color: "#ffffff", fontWeight: "600" }}>{p.attendee?.name}</div>
                                <div style={{ fontSize: "11px", color: "#E2D9BC" }}>{p.attendee?.email}</div>
                                <div style={{ fontSize: "10px", color: "#948B75" }}>{p.attendee?.phone}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ color: "#10B981", fontWeight: "800", fontSize: "14px" }}>{formatNaira(p.grossAmount, p.currency)}</div>
                                <div style={{ fontSize: "10px", color: "#948B75" }}>Qty: {p.quantity || 1} • {p.tierName}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontSize: "11px", color: "#D4AF37" }}>Fee: {formatNaira(p.platformFee, p.currency)}</div>
                                <div style={{ fontSize: "11px", color: "#60A5FA" }}>Payout: {formatNaira(p.organizerPayout, p.currency)}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "800", background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                                  {p.paymentStatus || "PAID"}
                                </span>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <button
                                  type="button"
                                  onClick={() => setInspectedPayment(p)}
                                  style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "6px", color: "#F5D061", fontSize: "11px", fontWeight: "700", padding: "4px 8px", cursor: "pointer" }}
                                >
                                  Inspect
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: ALL EVENTS DIRECTORY & MODERATION */}
              {activeTab === "events" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                      <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
                        <SearchIcon size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "rgba(212,175,55,0.7)" }} />
                        <input
                          type="text"
                          placeholder="Search events, organizers, cities..."
                          value={searchEventQuery}
                          onChange={e => setSearchEventQuery(e.target.value)}
                          style={{ width: "100%", height: "40px", paddingLeft: "36px", paddingRight: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>

                      <select
                        value={eventCategoryFilter}
                        onChange={e => setEventCategoryFilter(e.target.value)}
                        style={{ height: "40px", padding: "0 12px", background: "#13131A", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#E2D9BC", fontSize: "13px", outline: "none" }}
                      >
                        <option value="all">All Categories</option>
                        <option value="Concerts">Concerts</option>
                        <option value="Festival">Festival</option>
                        <option value="Tech Event">Tech Event</option>
                        <option value="Parties / Nightlife">Parties / Nightlife</option>
                      </select>
                    </div>
                  </div>

                  {/* Events Moderation Table */}
                  <div style={{ overflowX: "auto", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", color: "#D4AF37", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                          <th style={{ padding: "12px 14px" }}>Event Title</th>
                          <th style={{ padding: "12px 14px" }}>Organizer &amp; City</th>
                          <th style={{ padding: "12px 14px" }}>Date &amp; Schedule</th>
                          <th style={{ padding: "12px 14px" }}>Status</th>
                          <th style={{ padding: "12px 14px" }}>Featured</th>
                          <th style={{ padding: "12px 14px" }}>Admin Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvents.map((evt, idx) => (
                          <tr key={evt.id || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "42px", height: "42px", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                                  <img src={evt.imageUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=100&q=80"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                                <div>
                                  <div style={{ fontWeight: "700", color: "#ffffff" }}>{evt.title}</div>
                                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>ID: {evt.id}</div>
                                </div>
                              </div>
                            </td>

                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ color: "#F5D061", fontWeight: "600" }}>{evt.organizer}</div>
                              <div style={{ fontSize: "11px", color: "#948B75" }}>{evt.city}</div>
                            </td>

                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ color: "#E2D9BC" }}>{evt.date}</div>
                              <div style={{ fontSize: "10px", color: "#948B75" }}>{evt.time}</div>
                            </td>

                            <td style={{ padding: "12px 14px" }}>
                              <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "800", background: evt.status === "paused" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", color: evt.status === "paused" ? "#EF4444" : "#10B981" }}>
                                {evt.status === "paused" ? "PAUSED" : "LIVE"}
                              </span>
                            </td>

                            <td style={{ padding: "12px 14px" }}>
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(evt.id)}
                                style={{ background: evt.isFeatured ? "rgba(212, 175, 55, 0.25)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "6px", color: evt.isFeatured ? "#F5D061" : "#948B75", fontSize: "11px", fontWeight: "700", padding: "4px 8px", cursor: "pointer" }}
                              >
                                {evt.isFeatured ? "★ Featured" : "☆ Feature"}
                              </button>
                            </td>

                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                  type="button"
                                  onClick={() => setEditingEvent(evt)}
                                  title="Edit Event Details"
                                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#E2D9BC", padding: "4px 8px", cursor: "pointer" }}
                                >
                                  <EditIcon size={14} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(evt.id, evt.status)}
                                  title={evt.status === "paused" ? "Activate Event" : "Pause Event"}
                                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: evt.status === "paused" ? "#10B981" : "#EF4444", padding: "4px 8px", cursor: "pointer" }}
                                >
                                  {evt.status === "paused" ? "▶" : "⏸"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(evt.id, evt.title)}
                                  title="Delete Event"
                                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", color: "#EF4444", padding: "4px 8px", cursor: "pointer" }}
                                >
                                  <TrashIcon size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: USERS & ORGANIZERS */}
              {activeTab === "users" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
                      <SearchIcon size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "rgba(212,175,55,0.7)" }} />
                      <input
                        type="text"
                        placeholder="Search users by name, email, phone..."
                        value={searchUserQuery}
                        onChange={e => setSearchUserQuery(e.target.value)}
                        style={{ width: "100%", height: "40px", paddingLeft: "36px", paddingRight: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  {/* Users Table */}
                  <div style={{ overflowX: "auto", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", color: "#D4AF37", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                          <th style={{ padding: "12px 14px" }}>User Name</th>
                          <th style={{ padding: "12px 14px" }}>Email</th>
                          <th style={{ padding: "12px 14px" }}>Phone</th>
                          <th style={{ padding: "12px 14px" }}>Current Role</th>
                          <th style={{ padding: "12px 14px" }}>Promote / Adjust</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "#948B75" }}>
                              No users found in database.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u, idx) => {
                            const isSuper = SUPER_ADMIN_EMAILS.some(a => a.toLowerCase() === (u.email || "").toLowerCase());
                            return (
                              <tr key={u.id || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                                <td style={{ padding: "12px 14px" }}>
                                  <div style={{ fontWeight: "700", color: "#ffffff", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span>{u.fullName}</span>
                                    {isSuper && <CrownIcon size={14} style={{ color: "#D4AF37" }} />}
                                  </div>
                                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>ID: {u.id}</div>
                                </td>

                                <td style={{ padding: "12px 14px", color: "#E2D9BC" }}>
                                  {u.email}
                                </td>

                                <td style={{ padding: "12px 14px", color: "#F5D061" }}>
                                  {u.phone || "—"}
                                </td>

                                <td style={{ padding: "12px 14px" }}>
                                  <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "800", background: isSuper ? "#D4AF37" : u.role === "organizer" ? "rgba(96, 165, 250, 0.2)" : "rgba(255,255,255,0.1)", color: isSuper ? "#070709" : u.role === "organizer" ? "#60A5FA" : "#E2D9BC" }}>
                                    {isSuper ? "SUPERADMIN" : (u.role || "attendee").toUpperCase()}
                                  </span>
                                </td>

                                <td style={{ padding: "12px 14px" }}>
                                  {!isSuper ? (
                                    <div style={{ display: "flex", gap: "6px" }}>
                                      {u.role !== "organizer" && (
                                        <button
                                          type="button"
                                          onClick={() => handleRoleChange(u.id, "organizer")}
                                          style={{ background: "rgba(96, 165, 250, 0.15)", border: "1px solid rgba(96, 165, 250, 0.3)", borderRadius: "6px", color: "#60A5FA", fontSize: "11px", fontWeight: "700", padding: "4px 8px", cursor: "pointer" }}
                                        >
                                          + Make Organizer
                                        </button>
                                      )}
                                      {u.role !== "attendee" && (
                                        <button
                                          type="button"
                                          onClick={() => handleRoleChange(u.id, "attendee")}
                                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#E2D9BC", fontSize: "11px", fontWeight: "600", padding: "4px 8px", cursor: "pointer" }}
                                        >
                                          Reset to Attendee
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: "11px", color: "#D4AF37", fontWeight: "700" }}>Protected Superadmin</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Transaction Details Inspector Modal */}
      {inspectedPayment && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={() => setInspectedPayment(null)}
        >
          <div
            style={{ width: "100%", maxWidth: "540px", background: "#13131A", border: "1px solid rgba(212, 175, 55, 0.4)", borderRadius: "16px", padding: "24px", color: "#ffffff", boxShadow: "0 20px 45px rgba(0,0,0,0.9)" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "800", margin: 0, color: "#D4AF37" }}>
                Payment Transaction Audit
              </h3>
              <button
                type="button"
                onClick={() => setInspectedPayment(null)}
                style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div><strong style={{ color: "#948B75" }}>Order ID:</strong> {inspectedPayment.orderId}</div>
              <div><strong style={{ color: "#948B75" }}>Monnify Reference:</strong> <span style={{ color: "#F5D061", fontFamily: "monospace" }}>{inspectedPayment.paymentReference}</span></div>
              <div><strong style={{ color: "#948B75" }}>Transaction Reference:</strong> <span style={{ fontFamily: "monospace" }}>{inspectedPayment.transactionRef}</span></div>
              <div><strong style={{ color: "#948B75" }}>Event Title:</strong> {inspectedPayment.eventTitle}</div>
              <div><strong style={{ color: "#948B75" }}>Organizer:</strong> {inspectedPayment.organizer}</div>
              <div><strong style={{ color: "#948B75" }}>Payer:</strong> {inspectedPayment.attendee?.name} ({inspectedPayment.attendee?.email}, {inspectedPayment.attendee?.phone})</div>
              <div><strong style={{ color: "#948B75" }}>Tier &amp; Qty:</strong> {inspectedPayment.quantity}x {inspectedPayment.tierName}</div>
              <div><strong style={{ color: "#948B75" }}>Gross Amount:</strong> <span style={{ color: "#10B981", fontWeight: "800" }}>{formatNaira(inspectedPayment.grossAmount, inspectedPayment.currency)}</span></div>
              <div><strong style={{ color: "#948B75" }}>Platform Fee (5%):</strong> {formatNaira(inspectedPayment.platformFee, inspectedPayment.currency)}</div>
              <div><strong style={{ color: "#948B75" }}>Organizer Payout (95%):</strong> <span style={{ color: "#60A5FA", fontWeight: "700" }}>{formatNaira(inspectedPayment.organizerPayout, inspectedPayment.currency)}</span></div>
              <div><strong style={{ color: "#948B75" }}>Status:</strong> <span style={{ color: "#10B981", fontWeight: "800" }}>{inspectedPayment.paymentStatus}</span></div>
              <div><strong style={{ color: "#948B75" }}>Timestamp:</strong> {new Date(inspectedPayment.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

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
