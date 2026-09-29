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
  getActivityFeed,
  toggleEventFeatured,
  toggleEventStatus,
  deleteEvent,
  toggleTicketStatus,
  getAccountPortalData
} from "../lib/ticketService";
import {
  getAllRegisteredUsers,
  isSuperAdmin,
  getSuperAdminEmails,
  DEFAULT_SUPER_ADMIN_EMAILS,
  verifyAdminPasscode,
  updateUserRole,
  quickSwitchAccount,
  promoteToSuperAdmin,
  promoteToOrganizer
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

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "activities" | "payments" | "attendees" | "events" | "users" | "analytics"
  const [editingEvent, setEditingEvent] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Account Scope Filter ("all" or specific account email)
  const [selectedAccountFilter, setSelectedAccountFilter] = useState("all");

  // Filters for tables
  const [searchActivityQuery, setSearchActivityQuery] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState("all");
  const [searchPaymentQuery, setSearchPaymentQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [searchAttendeeQuery, setSearchAttendeeQuery] = useState("");
  const [attendeeEventFilter, setAttendeeEventFilter] = useState("all");
  const [attendeeStatusFilter, setAttendeeStatusFilter] = useState("all");
  const [searchEventQuery, setSearchEventQuery] = useState("");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("all");
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [inspectedPayment, setInspectedPayment] = useState(null);

  // Data sources
  const events = useMemo(() => getStoredEvents(), [isOpen, editingEvent]);
  const tickets = useMemo(() => getStoredTickets(), [isOpen, toastMessage]);
  const payments = useMemo(() => getPaymentsLedger(), [isOpen]);
  const activities = useMemo(() => getActivityFeed(), [isOpen, toastMessage]);
  const users = useMemo(() => getAllRegisteredUsers(), [isOpen, toastMessage]);
  const superAdminEmails = useMemo(() => getSuperAdminEmails(), [isOpen]);

  // Account Scoped Data
  const accountData = useMemo(() => {
    return getAccountPortalData(selectedAccountFilter);
  }, [selectedAccountFilter, events, tickets, payments, activities]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    const list = accountData.isGlobal ? activities : accountData.activities;
    return list.filter(a => {
      const matchesType = activityTypeFilter === "all" || a.type === activityTypeFilter || a.category?.toLowerCase().includes(activityTypeFilter.toLowerCase());
      const q = searchActivityQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.actor?.toLowerCase().includes(q) ||
        a.actorEmail?.toLowerCase().includes(q) ||
        a.eventTitle?.toLowerCase().includes(q) ||
        a.orderId?.toLowerCase().includes(q) ||
        a.ticketId?.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [activities, accountData, activityTypeFilter, searchActivityQuery]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    const list = accountData.isGlobal ? payments : accountData.payments;
    return list.filter(p => {
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
  }, [payments, accountData, paymentStatusFilter, searchPaymentQuery]);

  // Filtered Attendees / Tickets
  const filteredAttendees = useMemo(() => {
    const list = accountData.isGlobal ? tickets : accountData.tickets;
    return list.filter(t => {
      const matchesEvent = attendeeEventFilter === "all" || t.eventId === attendeeEventFilter;
      const matchesStatus = attendeeStatusFilter === "all" || t.status === attendeeStatusFilter;
      const q = searchAttendeeQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        t.ticketId?.toLowerCase().includes(q) ||
        t.orderId?.toLowerCase().includes(q) ||
        t.eventTitle?.toLowerCase().includes(q) ||
        t.attendee?.name?.toLowerCase().includes(q) ||
        t.attendee?.email?.toLowerCase().includes(q) ||
        t.attendee?.phone?.toLowerCase().includes(q) ||
        t.tierName?.toLowerCase().includes(q);
      return matchesEvent && matchesStatus && matchesSearch;
    });
  }, [tickets, accountData, attendeeEventFilter, attendeeStatusFilter, searchAttendeeQuery]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    const list = accountData.isGlobal ? events : accountData.events;
    return list.filter(e => {
      const matchesCategory = eventCategoryFilter === "all" || e.category?.toLowerCase() === eventCategoryFilter.toLowerCase();
      const q = searchEventQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        e.title?.toLowerCase().includes(q) ||
        e.organizer?.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [events, accountData, eventCategoryFilter, searchEventQuery]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const isSuper = superAdminEmails.some(a => a.toLowerCase() === (u.email || "").toLowerCase());
      const roleStr = isSuper ? "admin" : (u.role || "attendee");
      const matchesRole = userRoleFilter === "all" || roleStr === userRoleFilter;
      const q = searchUserQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        roleStr.includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, superAdminEmails, userRoleFilter, searchUserQuery]);

  // Aggregate Metrics (Global or Account-Scoped)
  const grossPlatformVolume = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + (Number(p.grossAmount) || 0), 0);
  }, [filteredPayments]);

  const platformFeesCollected = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + (Number(p.platformFee) || 0), 0);
  }, [filteredPayments]);

  const organizerPayoutsTotal = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + (Number(p.organizerPayout) || 0), 0);
  }, [filteredPayments]);

  const checkedInAttendeesCount = useMemo(() => {
    return filteredAttendees.filter(t => t.status === "checked_in").length;
  }, [filteredAttendees]);

  // Selected Account details (if filtered to one account)
  const selectedAccountUser = useMemo(() => {
    if (selectedAccountFilter === "all") return null;
    return users.find(u => u.email?.toLowerCase() === selectedAccountFilter.toLowerCase()) || {
      fullName: selectedAccountFilter.split("@")[0],
      email: selectedAccountFilter,
      role: "unknown"
    };
  }, [selectedAccountFilter, users]);

  // CSV Export for Payments
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

  // CSV Export for Attendees
  const handleExportAttendeesCSV = () => {
    if (filteredAttendees.length === 0) {
      alert("No attendee records found to export.");
      return;
    }

    const headers = [
      "Ticket ID",
      "Order ID",
      "Event Title",
      "Attendee Name",
      "Email",
      "Phone",
      "Tier",
      "Price (NGN)",
      "Seat / Pass",
      "Check-in Status",
      "Admitted At",
      "Gate Staff",
      "Purchase Date"
    ];

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
      `"${t.checkedInAt || ""}"`,
      `"${t.gateStaff || ""}"`,
      `"${t.purchaseDate || ""}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `NMDS_Attendees_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Attendees Registry exported successfully!");
    setTimeout(() => setToastMessage(""), 3500);
  };

  // CSV Export for Activities
  const handleExportActivitiesCSV = () => {
    if (filteredActivities.length === 0) {
      alert("No activity logs found to export.");
      return;
    }

    const headers = ["Activity ID", "Category", "Title", "Actor", "Actor Email", "Role", "Description", "Event Title", "Order ID", "Timestamp"];
    const rows = filteredActivities.map(a => [
      `"${a.id || ""}"`,
      `"${a.category || a.type || ""}"`,
      `"${(a.title || "").replace(/"/g, '""')}"`,
      `"${(a.actor || "").replace(/"/g, '""')}"`,
      `"${a.actorEmail || ""}"`,
      `"${a.role || ""}"`,
      `"${(a.description || "").replace(/"/g, '""')}"`,
      `"${(a.eventTitle || "").replace(/"/g, '""')}"`,
      `"${a.orderId || ""}"`,
      `"${a.timestamp || ""}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `NMDS_Activity_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Activity Audit Log exported successfully!");
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

  const handleToggleTicketCheckIn = (ticketId, currentStatus) => {
    const newStatus = currentStatus === "checked_in" ? "active" : "checked_in";
    toggleTicketStatus(ticketId, newStatus, currentUser?.fullName || "Super Admin");
    setToastMessage(`Ticket ${ticketId} status changed to ${newStatus.toUpperCase()}`);
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

  const handleSelectAccountScope = (email) => {
    setSelectedAccountFilter(email);
    setToastMessage(email === "all" ? "Switched to Global Portal View (All Accounts)" : `Filtering portal view to: ${email}`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  return (
    <div
      className="dashboard-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9995,
        backgroundColor: "rgba(5, 5, 8, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
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
          maxWidth: "1280px",
          height: "94vh",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #13111C 0%, #08080C 100%)",
          border: "1px solid rgba(212, 175, 55, 0.55)",
          borderRadius: "20px",
          boxShadow: "0 25px 70px -10px rgba(0, 0, 0, 0.98), 0 0 65px rgba(212, 175, 55, 0.25)",
          overflow: "hidden"
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Gold & Ruby Accent Bar */}
        <div style={{ height: "4px", width: "100%", background: "linear-gradient(90deg, #D4AF37 0%, #F5D061 35%, #EF4444 70%, #D4AF37 100%)" }} />

        {/* Master Header */}
        <div
          style={{
            padding: "16px 28px",
            borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0, 0, 0, 0.45)",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #D4AF37 0%, #A67C1E 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#070709",
                boxShadow: "0 4px 16px rgba(212, 175, 55, 0.4)"
              }}
            >
              <CrownIcon size={26} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
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
                  SUPER ADMIN PORTAL
                </span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                  Audit &amp; Oversight Engine
                </span>
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", margin: "2px 0 0" }}>
                Platform Control, Activities &amp; Accounts Ledger
              </h1>
            </div>
          </div>

          {/* Quick Actions & Account Scoper Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Master Button: View Everything in Portal */}
            <button
              type="button"
              onClick={() => {
                setSelectedAccountFilter("all");
                setActiveTab("overview");
                setToastMessage("Viewing everything going on across all accounts in the portal!");
                setTimeout(() => setToastMessage(""), 3500);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: selectedAccountFilter === "all"
                  ? "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)"
                  : "rgba(212, 175, 55, 0.15)",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                borderRadius: "8px",
                color: selectedAccountFilter === "all" ? "#070709" : "#F5D061",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(212, 175, 55, 0.25)"
              }}
              title="Reset filter and view entire portal activity and ledger"
            >
              <SparklesIcon size={15} />
              <span>View Everything In Portal</span>
            </button>

            {/* Account Selector Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "#948B75", fontWeight: "700" }}>Account:</span>
              <select
                value={selectedAccountFilter}
                onChange={e => handleSelectAccountScope(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  background: "#1A1726",
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  borderRadius: "8px",
                  color: "#F5D061",
                  fontSize: "12px",
                  fontWeight: "700",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="all">🌐 All Accounts (Global Platform)</option>
                <optgroup label="👑 Super Admins">
                  {superAdminEmails.map(adminEmail => (
                    <option key={adminEmail} value={adminEmail}>
                      👑 {adminEmail}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="👥 Registered User Accounts">
                  {users
                    .filter(u => !superAdminEmails.includes(u.email?.toLowerCase()))
                    .map(u => (
                      <option key={u.id || u.email} value={u.email}>
                        {u.fullName} ({u.role?.toUpperCase() || "USER"}) — {u.email}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

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

        {/* PASSCODE GATE IF NOT PRE-AUTHENTICATED */}
        {!isAuthorized ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
            <div style={{ maxWidth: "460px", width: "100%", background: "#0E0E14", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "16px", padding: "32px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.9)" }}>
              <div style={{ width: "56px", height: "56px", margin: "0 auto 16px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", fontSize: "24px" }}>
                🔒
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", margin: "0 0 8px" }}>Super Admin Access Restricted</h2>
              <p style={{ fontSize: "13px", color: "#948B75", margin: "0 0 20px", lineHeight: 1.6 }}>
                This command center is strictly restricted to platform administrators (<strong>brinoekanem@gmail.com</strong> and <strong>iamrhobbinraynerhq01@gmail.com</strong>).
                {currentUser?.email ? (
                  <> Your account (<strong>{currentUser.email}</strong>) does not have Super Admin authority.</>
                ) : (
                  <> You are currently not signed in with a Super Admin account.</>
                )}
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
                  placeholder="Enter Master Recovery PIN"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  style={{ width: "100%", height: "42px", textAlign: "center", letterSpacing: "0.15em", fontSize: "14px", fontWeight: "800", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "8px", color: "#fff", outline: "none", boxSizing: "border-box" }}
                />
                <button
                  type="submit"
                  style={{ width: "100%", height: "42px", background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)", border: "none", borderRadius: "8px", color: "#070709", fontWeight: "800", fontSize: "13px", cursor: "pointer" }}
                >
                  Verify Master PIN
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ width: "100%", height: "38px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#E2D9BC", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                >
                  Exit / Close
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* ACCOUNT SCOPE BANNER (If filtered to a single account) */}
            {!accountData.isGlobal && (
              <div
                style={{
                  background: "linear-gradient(90deg, rgba(212, 175, 55, 0.18) 0%, rgba(19, 17, 28, 0.95) 100%)",
                  borderBottom: "1px solid rgba(212, 175, 55, 0.35)",
                  padding: "10px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#D4AF37", color: "#070709", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "13px" }}>
                    {selectedAccountUser?.fullName?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff" }}>
                      Viewing Account: <span style={{ color: "#F5D061" }}>{selectedAccountUser?.fullName}</span> ({selectedAccountFilter})
                    </div>
                    <div style={{ fontSize: "11px", color: "#E2D9BC" }}>
                      Role: <strong style={{ color: "#D4AF37" }}>{selectedAccountUser?.role?.toUpperCase()}</strong> • 
                      Spent: <strong style={{ color: "#10B981" }}>{formatNaira(accountData.metrics.totalPaid)}</strong> • 
                      Earned: <strong style={{ color: "#60A5FA" }}>{formatNaira(accountData.metrics.totalEarned)}</strong> • 
                      Events: <strong>{accountData.metrics.eventsCount}</strong> • 
                      Tickets: <strong>{accountData.metrics.totalTicketsBought} bought / {accountData.metrics.totalTicketsSold} sold</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAccountFilter("all")}
                  style={{
                    padding: "6px 14px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  ✕ Clear Account Filter (View All Accounts)
                </button>
              </div>
            )}

            {/* KPI STATS BAR */}
            <div
              style={{
                padding: "14px 28px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                background: "rgba(0,0,0,0.3)",
                borderBottom: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "10px", padding: "10px 14px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>
                  {accountData.isGlobal ? "Gross Platform Volume" : "Gross Volume"}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#10B981", marginTop: "2px" }}>
                  {formatNaira(grossPlatformVolume)}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "10px", padding: "10px 14px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#D4AF37", textTransform: "uppercase" }}>
                  Platform Revenue (5%)
                </div>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#F5D061", marginTop: "2px" }}>
                  {formatNaira(platformFeesCollected)}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "10px", padding: "10px 14px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>
                  Organizer Net Payouts
                </div>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#60A5FA", marginTop: "2px" }}>
                  {formatNaira(organizerPayoutsTotal)}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "10px", padding: "10px 14px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>
                  Tickets Issued
                </div>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", marginTop: "2px" }}>
                  {filteredAttendees.length} <span style={{ fontSize: "11px", color: "#948B75", fontWeight: "600" }}>({checkedInAttendeesCount} admitted)</span>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "10px", padding: "10px 14px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#948B75", textTransform: "uppercase" }}>
                  Scope Overview
                </div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#ffffff", marginTop: "2px" }}>
                  {accountData.isGlobal ? `${filteredEvents.length} events • ${users.length} users` : `${filteredEvents.length} events • 1 account`}
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                padding: "10px 28px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(10,10,15,0.6)",
                overflowX: "auto"
              }}
            >
              {[
                { id: "overview", label: "⚡ Portal Overview" },
                { id: "activities", label: `📋 Activities (${filteredActivities.length})` },
                { id: "payments", label: `💳 Payments & Ledger (${filteredPayments.length})` },
                { id: "attendees", label: `🎟️ Attendees & Tickets (${filteredAttendees.length})` },
                { id: "events", label: `🎪 Events (${filteredEvents.length})` },
                { id: "users", label: `👥 Accounts Directory (${filteredUsers.length})` },
                { id: "analytics", label: "📊 Portal Analytics" }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: activeTab === tab.id ? "800" : "600",
                    color: activeTab === tab.id ? "#070709" : "#E2D9BC",
                    background: activeTab === tab.id ? "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)" : "transparent",
                    border: activeTab === tab.id ? "none" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TOAST MESSAGE */}
            {toastMessage && (
              <div style={{ margin: "10px 28px 0", padding: "8px 16px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "8px", color: "#6EE7B7", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircleIcon size={16} />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* MAIN TAB CONTENT CONTAINER */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>

              {/* TAB 0: PORTAL OVERVIEW */}
              {activeTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Quick Action Banner */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(245, 208, 97, 0.05) 100%)",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      borderRadius: "14px",
                      padding: "18px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "16px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <CrownIcon size={20} style={{ color: "#D4AF37" }} />
                        <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                          Super Admin Live Oversight
                        </h2>
                      </div>
                      <p style={{ fontSize: "13px", color: "#E2D9BC", margin: "4px 0 0" }}>
                        Super Admins (<strong>brinoekanem@gmail.com</strong> and <strong>iamrhobbinraynerhq01@gmail.com</strong>) have unrestricted access to all account activities, payments, and attendee analytics in organized tables.
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => setActiveTab("activities")}
                        style={{ padding: "8px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "8px", color: "#F5D061", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                      >
                        📋 View All Activities
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("payments")}
                        style={{ padding: "8px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "8px", color: "#10B981", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                      >
                        💳 View All Payments
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("attendees")}
                        style={{ padding: "8px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "8px", color: "#60A5FA", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                      >
                        🎟️ View All Attendees
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("analytics")}
                        style={{ padding: "8px 14px", background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)", border: "none", borderRadius: "8px", color: "#070709", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                      >
                        📊 View Analytics Tables
                      </button>
                    </div>
                  </div>

                  {/* 2-Column Split: Recent Live Activities & Recent Payments */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {/* Live Activities Summary Table */}
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "18px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <ActivityIcon size={18} style={{ color: "#D4AF37" }} />
                          <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                            Recent Platform Activities
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("activities")}
                          style={{ background: "none", border: "none", color: "#F5D061", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                        >
                          View All ({filteredActivities.length}) →
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {filteredActivities.slice(0, 6).map((a, idx) => (
                          <div
                            key={a.id || idx}
                            style={{
                              padding: "10px 12px",
                              background: "rgba(0,0,0,0.35)",
                              borderRadius: "8px",
                              borderLeft: `3px solid ${a.type === "payment" ? "#10B981" : a.type === "checkin" ? "#60A5FA" : a.type === "event" ? "#F59E0B" : "#D4AF37"}`,
                              fontSize: "12px"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "700", color: "#ffffff" }}>
                              <span>{a.title}</span>
                              <span style={{ fontSize: "10px", color: "#948B75" }}>
                                {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div style={{ color: "#948B75", marginTop: "2px", fontSize: "11px" }}>
                              {a.description}
                            </div>
                            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                              <span style={{ fontSize: "10px", color: "#D4AF37" }}>👤 {a.actor}</span>
                              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>({a.actorEmail})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Payments Summary Table */}
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "18px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <CreditCardIcon size={18} style={{ color: "#10B981" }} />
                          <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                            Recent Transactions
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("payments")}
                          style={{ background: "none", border: "none", color: "#10B981", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                        >
                          View All ({filteredPayments.length}) →
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {filteredPayments.slice(0, 6).map((p, idx) => (
                          <div
                            key={p.orderId || idx}
                            style={{
                              padding: "10px 12px",
                              background: "rgba(0,0,0,0.35)",
                              borderRadius: "8px",
                              borderLeft: "3px solid #10B981",
                              fontSize: "12px"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "700", color: "#ffffff" }}>
                              <span>{p.attendee?.name}</span>
                              <span style={{ color: "#10B981", fontWeight: "800" }}>+ {formatNaira(p.grossAmount, p.currency)}</span>
                            </div>
                            <div style={{ color: "#948B75", marginTop: "2px", fontSize: "11px" }}>
                              {p.eventTitle} • {p.tierName} (Qty: {p.quantity || 1})
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px" }}>
                              <span style={{ color: "#F5D061", fontFamily: "monospace" }}>Ref: {p.paymentReference}</span>
                              <span style={{ color: "#60A5FA" }}>Payout: {formatNaira(p.organizerPayout, p.currency)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: ALL PORTAL ACTIVITIES TABLE */}
              {activeTab === "activities" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "280px" }}>
                      <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
                        <SearchIcon size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "rgba(212,175,55,0.7)" }} />
                        <input
                          type="text"
                          placeholder="Search activities by actor, title, event..."
                          value={searchActivityQuery}
                          onChange={e => setSearchActivityQuery(e.target.value)}
                          style={{ width: "100%", height: "40px", paddingLeft: "36px", paddingRight: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>

                      <select
                        value={activityTypeFilter}
                        onChange={e => setActivityTypeFilter(e.target.value)}
                        style={{ height: "40px", padding: "0 12px", background: "#13131A", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#E2D9BC", fontSize: "13px", outline: "none" }}
                      >
                        <option value="all">All Activity Categories</option>
                        <option value="payment">Payments</option>
                        <option value="checkin">Gate Check-Ins</option>
                        <option value="event">Event Moderation &amp; Publishing</option>
                        <option value="auth">Super Admin &amp; Auth</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportActivitiesCSV}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)", border: "none", borderRadius: "8px", color: "#070709", fontSize: "13px", fontWeight: "800", cursor: "pointer" }}
                    >
                      <DownloadIcon size={16} />
                      <span>Export Activities CSV</span>
                    </button>
                  </div>

                  {/* Activities Table */}
                  <div style={{ overflowX: "auto", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", color: "#D4AF37", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                          <th style={{ padding: "12px 14px" }}>Timestamp</th>
                          <th style={{ padding: "12px 14px" }}>Category</th>
                          <th style={{ padding: "12px 14px" }}>Actor &amp; Account</th>
                          <th style={{ padding: "12px 14px" }}>Activity Summary</th>
                          <th style={{ padding: "12px 14px" }}>Context / Event</th>
                          <th style={{ padding: "12px 14px" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActivities.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#948B75" }}>
                              No activity records found matching filters.
                            </td>
                          </tr>
                        ) : (
                          filteredActivities.map((a, idx) => (
                            <tr key={a.id || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                              <td style={{ padding: "12px 14px", color: "#948B75", whiteSpace: "nowrap" }}>
                                <div>{new Date(a.timestamp).toLocaleDateString()}</div>
                                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                                  {new Date(a.timestamp).toLocaleTimeString()}
                                </div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontSize: "10px",
                                    fontWeight: "800",
                                    textTransform: "uppercase",
                                    background: a.type === "payment" ? "rgba(16, 185, 129, 0.15)" : a.type === "checkin" ? "rgba(96, 165, 250, 0.15)" : a.type === "event" ? "rgba(245, 158, 11, 0.15)" : "rgba(212, 175, 55, 0.15)",
                                    color: a.type === "payment" ? "#10B981" : a.type === "checkin" ? "#60A5FA" : a.type === "event" ? "#F59E0B" : "#D4AF37"
                                  }}
                                >
                                  {a.category || a.type}
                                </span>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: "700", color: "#ffffff" }}>{a.actor}</div>
                                <div style={{ fontSize: "11px", color: "#E2D9BC" }}>{a.actorEmail}</div>
                                <span style={{ fontSize: "9px", color: "#D4AF37", fontWeight: "800", textTransform: "uppercase" }}>
                                  {a.role || "USER"}
                                </span>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: "700", color: "#ffffff" }}>{a.title}</div>
                                <div style={{ color: "#948B75", fontSize: "11px", marginTop: "2px", maxWidth: "340px" }}>
                                  {a.description}
                                </div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                {a.eventTitle && <div style={{ color: "#F5D061", fontWeight: "600" }}>{a.eventTitle}</div>}
                                {a.orderId && <div style={{ fontSize: "10px", color: "#948B75" }}>Order: {a.orderId}</div>}
                                {a.ticketId && <div style={{ fontSize: "10px", color: "#948B75" }}>Ticket: {a.ticketId}</div>}
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "800", background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                                  VERIFIED
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

              {/* TAB 2: PAYMENTS & FINANCIALS LEDGER TABLE */}
              {activeTab === "payments" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "280px" }}>
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
                          <th style={{ padding: "12px 14px" }}>Event Title</th>
                          <th style={{ padding: "12px 14px" }}>Payer Account</th>
                          <th style={{ padding: "12px 14px" }}>Organizer Account</th>
                          <th style={{ padding: "12px 14px" }}>Gross Paid</th>
                          <th style={{ padding: "12px 14px" }}>Fee Split (5% / 95%)</th>
                          <th style={{ padding: "12px 14px" }}>Status</th>
                          <th style={{ padding: "12px 14px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ padding: "30px", textAlign: "center", color: "#948B75" }}>
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
                                <div style={{ fontSize: "11px", color: "#948B75" }}>Tier: {p.tierName}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ color: "#ffffff", fontWeight: "600" }}>{p.attendee?.name}</div>
                                <div style={{ fontSize: "11px", color: "#E2D9BC" }}>{p.attendee?.email}</div>
                                <div style={{ fontSize: "10px", color: "#948B75" }}>{p.attendee?.phone}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ color: "#F5D061", fontWeight: "600" }}>{p.organizer}</div>
                                <div style={{ fontSize: "11px", color: "#948B75" }}>{p.organizerEmail || "Organizer"}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ color: "#10B981", fontWeight: "800", fontSize: "14px" }}>{formatNaira(p.grossAmount, p.currency)}</div>
                                <div style={{ fontSize: "10px", color: "#948B75" }}>Qty: {p.quantity || 1}</div>
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

              {/* TAB 3: ATTENDEES & TICKET REGISTRY TABLE */}
              {activeTab === "attendees" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "280px", flexWrap: "wrap" }}>
                      <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
                        <SearchIcon size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "rgba(212,175,55,0.7)" }} />
                        <input
                          type="text"
                          placeholder="Search attendees by name, email, ticket ID..."
                          value={searchAttendeeQuery}
                          onChange={e => setSearchAttendeeQuery(e.target.value)}
                          style={{ width: "100%", height: "40px", paddingLeft: "36px", paddingRight: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>

                      <select
                        value={attendeeEventFilter}
                        onChange={e => setAttendeeEventFilter(e.target.value)}
                        style={{ height: "40px", padding: "0 12px", background: "#13131A", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#E2D9BC", fontSize: "13px", outline: "none" }}
                      >
                        <option value="all">All Events</option>
                        {events.map(e => (
                          <option key={e.id} value={e.id}>{e.title}</option>
                        ))}
                      </select>

                      <select
                        value={attendeeStatusFilter}
                        onChange={e => setAttendeeStatusFilter(e.target.value)}
                        style={{ height: "40px", padding: "0 12px", background: "#13131A", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#E2D9BC", fontSize: "13px", outline: "none" }}
                      >
                        <option value="all">All Gate Statuses</option>
                        <option value="checked_in">Checked In at Gate</option>
                        <option value="active">Active (Unredeemed)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportAttendeesCSV}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)", border: "none", borderRadius: "8px", color: "#070709", fontSize: "13px", fontWeight: "800", cursor: "pointer" }}
                    >
                      <DownloadIcon size={16} />
                      <span>Export Attendees CSV</span>
                    </button>
                  </div>

                  {/* Attendees Table */}
                  <div style={{ overflowX: "auto", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", color: "#D4AF37", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                          <th style={{ padding: "12px 14px" }}>Ticket ID &amp; Pass</th>
                          <th style={{ padding: "12px 14px" }}>Attendee Name &amp; Contact</th>
                          <th style={{ padding: "12px 14px" }}>Event &amp; Venue</th>
                          <th style={{ padding: "12px 14px" }}>Tier &amp; Price</th>
                          <th style={{ padding: "12px 14px" }}>Gate Check-in Status</th>
                          <th style={{ padding: "12px 14px" }}>Admin Override Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAttendees.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#948B75" }}>
                              No attendee records found matching criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredAttendees.map((t, idx) => (
                            <tr key={t.ticketId || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: "800", color: "#ffffff", fontFamily: "monospace" }}>{t.ticketId}</div>
                                <div style={{ fontSize: "10px", color: "#F5D061" }}>Order: {t.orderId}</div>
                                <div style={{ fontSize: "10px", color: "#948B75" }}>Seat: {t.seatNumber}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: "700", color: "#ffffff" }}>{t.attendee?.name}</div>
                                <div style={{ fontSize: "11px", color: "#E2D9BC" }}>{t.attendee?.email}</div>
                                <div style={{ fontSize: "10px", color: "#948B75" }}>{t.attendee?.phone}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: "700", color: "#ffffff", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {t.eventTitle}
                                </div>
                                <div style={{ fontSize: "11px", color: "#948B75" }}>{t.city}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <div style={{ color: "#F5D061", fontWeight: "700" }}>{t.tierName}</div>
                                <div style={{ color: "#10B981", fontWeight: "800" }}>{formatNaira(t.tierPrice, t.currency)}</div>
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                {t.status === "checked_in" ? (
                                  <div>
                                    <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "800", background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                                      ● CHECKED IN
                                    </span>
                                    <div style={{ fontSize: "10px", color: "#948B75", marginTop: "4px" }}>
                                      {t.checkedInAt ? new Date(t.checkedInAt).toLocaleTimeString() : ""}
                                    </div>
                                    <div style={{ fontSize: "9px", color: "#60A5FA" }}>{t.gateStaff || "Gate Marshall"}</div>
                                  </div>
                                ) : (
                                  <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "800", background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
                                    ○ ACTIVE (UNREDEEMED)
                                  </span>
                                )}
                              </td>

                              <td style={{ padding: "12px 14px" }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleTicketCheckIn(t.ticketId, t.status)}
                                  style={{
                                    padding: "5px 10px",
                                    background: t.status === "checked_in" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                                    border: `1px solid ${t.status === "checked_in" ? "rgba(239, 68, 68, 0.35)" : "rgba(16, 185, 129, 0.35)"}`,
                                    borderRadius: "6px",
                                    color: t.status === "checked_in" ? "#F87171" : "#6EE7B7",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    cursor: "pointer"
                                  }}
                                >
                                  {t.status === "checked_in" ? "Reset to Active" : "Admit at Gate"}
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

              {/* TAB 4: ALL EVENTS DIRECTORY & MODERATION */}
              {activeTab === "events" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "280px" }}>
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

              {/* TAB 5: ACCOUNTS DIRECTORY & CONTROL */}
              {activeTab === "users" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "280px" }}>
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

                      <select
                        value={userRoleFilter}
                        onChange={e => setUserRoleFilter(e.target.value)}
                        style={{ height: "40px", padding: "0 12px", background: "#13131A", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "8px", color: "#E2D9BC", fontSize: "13px", outline: "none" }}
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Super Admins</option>
                        <option value="organizer">Organizers</option>
                        <option value="attendee">Attendees</option>
                      </select>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div style={{ overflowX: "auto", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", color: "#D4AF37", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                          <th style={{ padding: "12px 14px" }}>Account Name</th>
                          <th style={{ padding: "12px 14px" }}>Email</th>
                          <th style={{ padding: "12px 14px" }}>Phone</th>
                          <th style={{ padding: "12px 14px" }}>Role</th>
                          <th style={{ padding: "12px 14px" }}>Events</th>
                          <th style={{ padding: "12px 14px" }}>Passes</th>
                          <th style={{ padding: "12px 14px" }}>Volume / Spend</th>
                          <th style={{ padding: "12px 14px" }}>Account Inspection</th>
                          <th style={{ padding: "12px 14px" }}>Role Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={9} style={{ padding: "30px", textAlign: "center", color: "#948B75" }}>
                              No users found in database.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u, idx) => {
                            const isSuper = superAdminEmails.some(a => a.toLowerCase() === (u.email || "").toLowerCase());
                            const userAccountData = getAccountPortalData(u.email);
                            const isSelected = selectedAccountFilter.toLowerCase() === (u.email || "").toLowerCase();

                            return (
                              <tr
                                key={u.id || idx}
                                style={{
                                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                                  background: isSelected ? "rgba(212, 175, 55, 0.12)" : idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"
                                }}
                              >
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

                                <td style={{ padding: "12px 14px", color: "#ffffff", fontWeight: "700" }}>
                                  {userAccountData.events.length}
                                </td>

                                <td style={{ padding: "12px 14px", color: "#ffffff", fontWeight: "700" }}>
                                  {userAccountData.metrics.totalTicketsBought}
                                </td>

                                <td style={{ padding: "12px 14px" }}>
                                  <div style={{ color: "#10B981", fontWeight: "700" }}>{formatNaira(userAccountData.metrics.totalPaid)}</div>
                                  {userAccountData.metrics.totalEarned > 0 && (
                                    <div style={{ fontSize: "10px", color: "#60A5FA" }}>Earned: {formatNaira(userAccountData.metrics.totalEarned)}</div>
                                  )}
                                </td>

                                <td style={{ padding: "12px 14px" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAccountScope(u.email)}
                                    style={{
                                      padding: "5px 10px",
                                      background: isSelected ? "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)" : "rgba(212, 175, 55, 0.15)",
                                      border: "1px solid rgba(212, 175, 55, 0.35)",
                                      borderRadius: "6px",
                                      color: isSelected ? "#070709" : "#F5D061",
                                      fontSize: "11px",
                                      fontWeight: "800",
                                      cursor: "pointer",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    {isSelected ? "✓ Active Filter" : "👁️ View Account"}
                                  </button>
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

              {/* TAB 6: COMPREHENSIVE PORTAL ANALYTICS TABLES */}
              {activeTab === "analytics" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Event Performance Analytics Table */}
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#ffffff", margin: 0 }}>
                          Event-by-Event Financials &amp; Conversion Analytics
                        </h3>
                        <p style={{ fontSize: "12px", color: "#948B75", margin: "4px 0 0" }}>
                          Gross volume, ticket capacities, and gate admission rates across events.
                        </p>
                      </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px" }}>
                        <thead>
                          <tr style={{ background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", color: "#D4AF37", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                            <th style={{ padding: "10px 12px" }}>Event Title &amp; City</th>
                            <th style={{ padding: "10px 12px" }}>Organizer</th>
                            <th style={{ padding: "10px 12px" }}>Capacity</th>
                            <th style={{ padding: "10px 12px" }}>Tickets Sold</th>
                            <th style={{ padding: "10px 12px" }}>Gross Sales (₦)</th>
                            <th style={{ padding: "10px 12px" }}>Platform Fee (5%)</th>
                            <th style={{ padding: "10px 12px" }}>Net Payout (95%)</th>
                            <th style={{ padding: "10px 12px" }}>Gate Check-In %</th>
                            <th style={{ padding: "10px 12px" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEvents.map(evt => {
                            const evtTickets = filteredAttendees.filter(t => t.eventId === evt.id);
                            const evtPayments = filteredPayments.filter(p => p.eventId === evt.id);
                            const gross = evtPayments.reduce((s, p) => s + (Number(p.grossAmount) || 0), 0);
                            const fee = Math.round(gross * 0.05);
                            const payout = gross - fee;
                            const totalCap = (evt.tiers || []).reduce((s, t) => s + (Number(t.capacity) || 100), 0);
                            const sold = evtTickets.length;
                            const checkedIn = evtTickets.filter(t => t.status === "checked_in").length;
                            const rate = sold > 0 ? Math.round((checkedIn / sold) * 100) : 0;

                            return (
                              <tr key={evt.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <td style={{ padding: "10px 12px" }}>
                                  <div style={{ fontWeight: "700", color: "#ffffff" }}>{evt.title}</div>
                                  <div style={{ fontSize: "11px", color: "#948B75" }}>{evt.city} • {evt.category}</div>
                                </td>
                                <td style={{ padding: "10px 12px", color: "#F5D061" }}>
                                  {evt.organizer}
                                </td>
                                <td style={{ padding: "10px 12px", color: "#E2D9BC" }}>
                                  {totalCap}
                                </td>
                                <td style={{ padding: "10px 12px", fontWeight: "700", color: "#ffffff" }}>
                                  {sold}
                                </td>
                                <td style={{ padding: "10px 12px", fontWeight: "800", color: "#10B981" }}>
                                  {formatNaira(gross)}
                                </td>
                                <td style={{ padding: "10px 12px", color: "#D4AF37", fontWeight: "700" }}>
                                  {formatNaira(fee)}
                                </td>
                                <td style={{ padding: "10px 12px", color: "#60A5FA", fontWeight: "700" }}>
                                  {formatNaira(payout)}
                                </td>
                                <td style={{ padding: "10px 12px" }}>
                                  <div style={{ fontWeight: "700", color: "#ffffff" }}>{rate}%</div>
                                  <div style={{ fontSize: "10px", color: "#948B75" }}>{checkedIn}/{sold} admitted</div>
                                </td>
                                <td style={{ padding: "10px 12px" }}>
                                  <span style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "800", background: evt.status === "paused" ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)", color: evt.status === "paused" ? "#EF4444" : "#10B981" }}>
                                    {evt.status === "paused" ? "PAUSED" : "LIVE"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Super Admin Privileges & Direct Contacts */}
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "14px", padding: "20px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#ffffff", margin: "0 0 10px" }}>
                      Authorized Super Admin Accounts
                    </h3>
                    <p style={{ fontSize: "12px", color: "#948B75", margin: "0 0 16px" }}>
                      The designated accounts hold full administrative root powers across all payments, events, and account rosters:
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                      {superAdminEmails.map((email, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <CrownIcon size={18} style={{ color: "#D4AF37" }} />
                            <div>
                              <div style={{ color: "#ffffff", fontWeight: "700", fontSize: "13px" }}>{email}</div>
                              <div style={{ fontSize: "10px", color: "#948B75" }}>Unrestricted Root Superadmin</div>
                            </div>
                          </div>
                          <span style={{ fontSize: "10px", fontWeight: "900", background: "#D4AF37", color: "#070709", padding: "3px 8px", borderRadius: "4px" }}>
                            SUPERADMIN
                          </span>
                        </div>
                      ))}
                    </div>
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
              <div><strong style={{ color: "#948B75" }}>Organizer:</strong> {inspectedPayment.organizer} ({inspectedPayment.organizerEmail || "Organizer"})</div>
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
