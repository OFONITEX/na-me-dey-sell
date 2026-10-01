"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import EventDetailModal from "../components/EventDetailModal";
import CheckoutModal from "../components/CheckoutModal";
import DigitalTicketPass from "../components/DigitalTicketPass";
import MyTicketsModal from "../components/MyTicketsModal";
import OrganizerScannerModal from "../components/OrganizerScannerModal";
import CreateEventModal from "../components/CreateEventModal";
import OrganizerDashboard from "../components/OrganizerDashboard";
import AdminDashboard from "../components/AdminDashboard";
import EditEventModal from "../components/EditEventModal";
import EventAdminModal from "../components/EventAdminModal";
import AuthModal from "../components/AuthModal";
import TicketVerificationModal from "../components/TicketVerificationModal";
import {
  SparklesIcon,
  TicketIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  ArrowRightIcon,
  MapPinIcon,
  SearchIcon,
  FlameIcon,
  CrownIcon
} from "../components/Icons";
import { getStoredEvents, getStoredTickets, INITIAL_TICKETS, syncEventsWithSupabase, findEventBySlugOrId } from "../lib/ticketService";
import { INITIAL_EVENTS } from "../data/mockEvents";
import { getAuthUser, logoutUser, subscribeAuth, isSuperAdmin, canEditEvent } from "../lib/authService";

export default function Home() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [adminEvent, setAdminEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [activePassTickets, setActivePassTickets] = useState(null);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isOrganizerDashboardOpen, setIsOrganizerDashboardOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [verifyingTicketId, setVerifyingTicketId] = useState(null);

  // Load data and authenticate on mount
  useEffect(() => {
    const loadedEvents = getStoredEvents();
    setEvents(loadedEvents);
    setTickets(getStoredTickets());
    const authUser = getAuthUser();
    setCurrentUser(authUser);

    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
    });

    const handleEventsChange = () => {
      setEvents(getStoredEvents());
      setTickets(getStoredTickets());
    };

    window.addEventListener("nmds_events_change", handleEventsChange);

    // Support direct public ticket link from clean URL path (e.g. /naphss-dinner-night) or ?event=slug
    // Support instant barcode/QR verification link (e.g. /?verify=NMDS-2026-NAPH-1A8K or ?ticket=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const urlEventId = params.get("event");
      const urlMode = params.get("mode");
      const verifyParam = params.get("verify") || params.get("ticket") || params.get("barcode") || params.get("scan");

      if (verifyParam) {
        setVerifyingTicketId(verifyParam);
      }

      // Check pathname (e.g. /naphss-dinner-night or /e/naphss-dinner-night)
      let pathnameSlug = "";
      if (typeof window !== "undefined") {
        const rawPath = window.location.pathname || "";
        const cleanPath = rawPath.replace(/^\/e\//, "").replace(/^\//, "").replace(/\/$/, "");
        if (cleanPath && cleanPath !== "admin" && !cleanPath.startsWith("admin/") && !cleanPath.startsWith("_")) {
          pathnameSlug = cleanPath;
        }
      }

      const targetIdentifier = urlEventId || pathnameSlug;
      if (targetIdentifier) {
        const found = findEventBySlugOrId(loadedEvents, targetIdentifier);
        if (found) {
          if (urlMode === "attendee") {
            setSelectedEvent(found);
          } else if (urlMode === "admin" && canEditEvent(found, authUser)) {
            setAdminEvent(found);
          } else {
            // Default: open the public ticket checkout modal so the user can buy tickets directly
            setSelectedEvent(found);
          }
        }
      }
    } catch {}

    // Cloud sync with Supabase (fetches latest events & subscribes to live edits across all devices)
    let realtimeUnsub = null;
    syncEventsWithSupabase((cloudEvents) => {
      setEvents(cloudEvents);
      try {
        const params = new URLSearchParams(window.location.search);
        const urlEventId = params.get("event");
        const urlMode = params.get("mode");
        let pathnameSlug = "";
        const rawPath = window.location.pathname || "";
        const cleanPath = rawPath.replace(/^\/e\//, "").replace(/^\//, "").replace(/\/$/, "");
        if (cleanPath && cleanPath !== "admin" && !cleanPath.startsWith("admin/") && !cleanPath.startsWith("_")) {
          pathnameSlug = cleanPath;
        }
        const targetIdentifier = urlEventId || pathnameSlug;
        if (targetIdentifier) {
          const found = findEventBySlugOrId(cloudEvents, targetIdentifier);
          if (found) {
            if (urlMode === "admin" && canEditEvent(found, authUser)) {
              setAdminEvent(found);
            } else {
              setSelectedEvent(found);
            }
          }
        }
      } catch {}
    }).then((unsub) => {
      realtimeUnsub = unsub;
    }).catch(() => {});

    return () => {
      unsubscribe();
      window.removeEventListener("nmds_events_change", handleEventsChange);
      if (typeof realtimeUnsub === "function") realtimeUnsub();
    };
  }, []);

  const refreshData = () => {
    setEvents(getStoredEvents());
    setTickets(getStoredTickets());
  };

  // Auth requirement gate helper
  const requireAuth = (actionCallback, reason = "") => {
    const user = getAuthUser();
    if (user) {
      actionCallback(user);
    } else {
      setPendingAction(() => actionCallback);
      setAuthPromptReason(reason);
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      action(user);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const categories = [
    { id: "all", label: "All Events" },
    { id: "corporate events", label: "🏢 Corporate Events" },
    { id: "Weddings", label: "💍 Weddings" },
    { id: "Festival", label: "🎉 Festival" },
    { id: "parties/ nightlife", label: "🍾 Parties / Nightlife" },
    { id: "concerts", label: "🎵 Concerts" },
    { id: "business event", label: "💼 Business Events" },
    { id: "tech event", label: "🚀 Tech Events" },
    { id: "arts / culture", label: "🎨 Arts / Culture" },
    { id: "marketing event", label: "📢 Marketing Events" },
    { id: "Food event", label: "🍹 Food Events" }
  ];

  const cities = [
    { id: "all", label: "All Locations" },
    { id: "Lagos", label: "Lagos" },
    { id: "Abuja", label: "Abuja" },
    { id: "Port Harcourt", label: "Port Harcourt" },
    { id: "Uyo", label: "Uyo" },
    { id: "London", label: "London" },
    { id: "Accra", label: "Accra" }
  ];

  // Filter events by search, category & city
  const filteredEvents = events.filter(evt => {
    const evtCat = (evt.category || "").toLowerCase();
    const actCat = activeCategory.toLowerCase();
    const matchesCategory =
      activeCategory === "all" ||
      evtCat === actCat ||
      evtCat.includes(actCat) ||
      actCat.includes(evtCat) ||
      (actCat.includes("parties") && evtCat.includes("parties")) ||
      (actCat.includes("concert") && evtCat.includes("concert")) ||
      (actCat.includes("food") && evtCat.includes("food")) ||
      (actCat.includes("tech") && evtCat.includes("tech")) ||
      (actCat.includes("business") && evtCat.includes("business")) ||
      (actCat.includes("festival") && evtCat.includes("festival")) ||
      (actCat.includes("wedding") && evtCat.includes("wedding")) ||
      (actCat.includes("corporate") && evtCat.includes("corporate"));

    const matchesCity =
      selectedCity === "all" || evt.city.toLowerCase().includes(selectedCity.toLowerCase());

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      evt.title.toLowerCase().includes(q) ||
      evt.subtitle.toLowerCase().includes(q) ||
      evt.city.toLowerCase().includes(q) ||
      evt.venue.toLowerCase().includes(q) ||
      evt.organizer.toLowerCase().includes(q);

    return matchesCategory && matchesCity && matchesSearch;
  });

  const trendingEvents = events.slice(0, 4);

  // Handle event selection:
  // - If user has organizer/admin rights to this event, display the Event Admin Dashboard directly!
  //   (Tickets sold, revenue, gate check-in status, attendee roster, and "Generate Ticket Link" button)
  // - If user is a visitor/attendee, display the public ticket booking detail modal.
  // - Supports explicit forceMode: "attendee" (for preview) or "admin" (for switching back)
  const handleSelectEvent = (event, forceMode = null) => {
    if (!event) return;
    if (forceMode === "attendee") {
      setAdminEvent(null);
      setSelectedEvent(event);
      return;
    }
    if (forceMode === "admin") {
      setSelectedEvent(null);
      setAdminEvent(event);
      return;
    }
    // Default click on an event card opens the ticket booking & detail modal
    // (Organizers have a dedicated admin ribbon inside the modal + quick buttons on the card)
    setAdminEvent(null);
    setSelectedEvent(event);
  };

  // Require account registration/login before proceeding to checkout
  const handleStartBooking = (bookingPayload) => {
    requireAuth(
      (authedUser) => {
        setSelectedEvent(null);
        setCheckoutData({ ...bookingPayload, user: authedUser });
      },
      "to purchase tickets and receive your verified pass"
    );
  };

  const handleOrderComplete = ({ orderId, tickets: newTickets }) => {
    setCheckoutData(null);
    refreshData();
    setActivePassTickets(newTickets);
  };

  const handleEventCreated = (newEvent) => {
    setEvents([newEvent, ...events]);
  };

  return (
    <div className="min-h-screen bg-[#070709]" style={{ backgroundColor: "#070709" }}>
      {/* Super Admin Top Notification Ribbon */}
      {isSuperAdmin(currentUser) && (
        <div
          className="rx-superadmin-ribbon"
          style={{
            background: "linear-gradient(90deg, #181303 0%, #291D04 50%, #181303 100%)",
            borderBottom: "1px solid rgba(212, 175, 55, 0.4)",
            position: "sticky",
            top: 0,
            zIndex: 1001,
            boxShadow: "0 4px 15px rgba(0,0,0,0.6)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                color: "#070709",
                padding: "2px 8px",
                borderRadius: "4px",
                fontWeight: "900",
                fontSize: "10px",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap"
              }}
            >
              👑 SUPER ADMIN
            </span>
            <span style={{ fontSize: "12px", color: "#F5D061", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
              {currentUser?.email}
            </span>
            <span className="hidden md:inline" style={{ color: "#7A7056" }}>|</span>
            <span className="hidden md:inline" style={{ color: "#E2D9BC", fontSize: "12px" }}>
              Full portal authority: monitor all activities, payments, attendees &amp; tables for every account.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAdminDashboardOpen(true)}
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
              color: "#070709",
              border: "none",
              borderRadius: "6px",
              padding: "5px 12px",
              fontSize: "11px",
              fontWeight: "900",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(212, 175, 55, 0.35)",
              whiteSpace: "nowrap"
            }}
          >
            <span>⚡ View Everything In Portal</span>
          </button>
        </div>
      )}

      {/* Sticky Navigation */}
      <Navbar
        user={currentUser}
        onOpenAuth={(reason) => {
          setAuthPromptReason(typeof reason === "string" ? reason : "to access your account");
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        ticketsCount={tickets.length}
        onOpenMyTickets={() =>
          requireAuth(() => setIsMyTicketsOpen(true), "to access your pass wallet")
        }
        onOpenScanner={() =>
          requireAuth(() => setIsScannerOpen(true), "to access the Gate Staff Scanner")
        }
        onOpenCreateEvent={() =>
          requireAuth(() => setIsCreateEventOpen(true), "to create and publish an event")
        }
        onOpenOrganizerDashboard={() =>
          requireAuth(() => setIsOrganizerDashboardOpen(true), "to access your Organizer Studio & Dashboard")
        }
        onOpenAdminDashboard={() => {
          if (isSuperAdmin(currentUser)) {
            setIsAdminDashboardOpen(true);
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Hero Section */}
      <section className="rx-hero">
        <div className="rx-hero-glow-1" />
        <div className="rx-hero-glow-2" />

        <div className="rx-announcement-pill">
          <span className="accent-dot" />
          <span>Nà Mè Dèy Sell • Africa&apos;s Next-Gen Ticket Infrastructure</span>
        </div>

        <h1 className="rx-hero-title">
          Your event life, <span className="rx-highlight-gold">simplified.</span>
        </h1>

        <p className="rx-hero-subtitle">
          Plan, promote, discover, and sell tickets sharp-sharp from one high-speed platform built for event creators, organizers, and verified attendees.
        </p>

        {/* Dual Split CTA Buttons */}
        <div className="rx-hero-actions">
          <button
            className="rx-btn rx-btn-primary"
            onClick={() =>
              requireAuth(() => setIsCreateEventOpen(true), "to create and publish an event", "register")
            }
          >
            <span className="rx-btn-text">Create an Event</span>
            <span className="rx-btn-icon">
              <ArrowRightIcon size={16} />
            </span>
          </button>

          <a href="#events-section" className="rx-btn rx-btn-secondary">
            <span className="rx-btn-text">Find Experiences</span>
            <span className="rx-btn-icon">
              <TicketIcon size={16} />
            </span>
          </a>
        </div>

        {/* Live One-Line Platform Stats Row */}
        <div className="rx-stats-row">
          <div className="rx-stat-item">
            <div className="rx-stat-num">160+</div>
            <div className="rx-stat-label">Live Events</div>
          </div>
          <div className="rx-stat-item">
            <div className="rx-stat-num">48,200+</div>
            <div className="rx-stat-label">Tickets Sold</div>
          </div>
          <div className="rx-stat-item">
            <div className="rx-stat-num">12,500+</div>
            <div className="rx-stat-label">Active Users</div>
          </div>
        </div>
      </section>

      {/* Search & Location Filter Section */}
      <section className="rx-filter-section">
        <div className="rx-filter-box">
          {/* Search Input */}
          <div className="rx-search-input-wrap">
            <SearchIcon size={18} style={{ color: "var(--brand-gold)" }} />
            <input
              type="text"
              className="rx-search-input"
              placeholder="Search experiences, venues, artists or festivals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" }}
              >
                ×
              </button>
            )}
          </div>

          {/* City Dropdown */}
          <div className="rx-city-select-wrap">
            <MapPinIcon size={16} style={{ color: "var(--warm-amber)" }} />
            <select
              className="rx-city-select"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
            >
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Horizontal Category Scroll */}
        <div className="rx-category-scroll">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`rx-category-pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Trending Events Spotlight Slider */}
      <section id="trending" className="rx-trending-section">
        <div className="rx-section-header-wrap">
          <div>
            <div className="rx-section-badge">
              <FlameIcon size={14} />
              <span>Happening Right Now</span>
            </div>
            <h2 className="rx-section-title">
              Trending <span style={{ color: "var(--brand-gold-bright)", fontStyle: "italic" }}>Events</span>.
            </h2>
          </div>
          <a
            href="#events-section"
            className="rx-btn rx-btn-secondary rx-btn-sm hidden sm:inline-flex"
          >
            <span className="rx-btn-text">See All Events</span>
            <span className="rx-btn-icon">
              <ArrowRightIcon size={13} />
            </span>
          </a>
        </div>

        <div className="rx-trending-slider">
          {trendingEvents.map(evt => (
            <EventCard
              key={evt.id}
              event={evt}
              currentUser={currentUser}
              onSelect={handleSelectEvent}
              onEditEvent={setEditingEvent}
              onOpenAdmin={(selected) => handleSelectEvent(selected, "admin")}
            />
          ))}
        </div>
      </section>

      {/* Main Events Catalog */}
      <section id="events-section" style={{ padding: "40px 0 60px" }}>
        <div className="rx-section-header-wrap">
          <div>
            <div className="rx-section-badge">
              <SparklesIcon size={14} />
              <span>Curated Experiences</span>
            </div>
            <h2 className="rx-section-title">
              Explore All <span style={{ color: "var(--brand-gold)" }}>Tickets</span>
            </h2>
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "700" }}>
            Showing {filteredEvents.length} event{filteredEvents.length === 1 ? "" : "s"}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
            <TicketIcon size={48} style={{ margin: "0 auto 16px", color: "var(--text-dim)" }} />
            <h3 style={{ fontSize: "1.4rem", color: "#fff", marginBottom: "8px" }}>No events found</h3>
            <p style={{ fontSize: "14px", maxWidth: "420px", margin: "0 auto 20px" }}>
              No upcoming events match your active filters. Try selecting &quot;All Events&quot; or clearing your search.
            </p>
            <button
              className="rx-btn rx-btn-primary rx-btn-sm"
              onClick={() => {
                setActiveCategory("all");
                setSelectedCity("all");
                setSearchQuery("");
              }}
            >
              <span className="rx-btn-text">Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="rx-events-grid">
            {filteredEvents.map(evt => (
              <EventCard
                key={evt.id}
                event={evt}
                currentUser={currentUser}
                onSelect={handleSelectEvent}
                onEditEvent={setEditingEvent}
                onOpenAdmin={(selected) => handleSelectEvent(selected, "admin")}
              />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Nà Mè Dèy Sell */}
      <section id="features" className="rx-features-section">
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}>
          <div className="rx-section-badge" style={{ justifyContent: "center" }}>
            <ShieldCheckIcon size={14} />
            <span>Built For Africa &amp; The Diaspora</span>
          </div>
          <h2 className="rx-section-title" style={{ fontSize: "2.4rem" }}>
            Why Organizers &amp; Fans Choose <span className="rx-highlight-gold">Nà Mè Dèy Sell</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "12px", lineHeight: "1.6" }}>
            Say goodbye to fake tickets, delayed bank settlements, and slow gate queues. Everything is fast, transparent, and built to sell out your event.
          </p>
        </div>

        <div className="rx-features-grid">
          <div className="rx-feature-card">
            <div className="rx-feature-icon-box">
              <span style={{ fontSize: "22px" }}>⚡</span>
            </div>
            <h3 className="rx-feature-title">Instant Bank Payouts</h3>
            <p className="rx-feature-desc">
              Receive your ticket revenue without painful delays. Integrated with instant automated settlements directly into your Nigerian bank account.
            </p>
          </div>

          <div className="rx-feature-card">
            <div className="rx-feature-icon-box">
              <QrCodeIcon size={24} />
            </div>
            <h3 className="rx-feature-title">Anti-Fraud Dynamic QR Codes</h3>
            <p className="rx-feature-desc">
              Zero fake passes. Every ticket features an authentic cryptographically signed Ticket ID with gate fraud detection to prevent duplicate entries.
            </p>
          </div>

          <div className="rx-feature-card">
            <div className="rx-feature-icon-box">
              <span style={{ fontSize: "22px" }}>💰</span>
            </div>
            <h3 className="rx-feature-title">Promoter &amp; Affiliate Network</h3>
            <p className="rx-feature-desc">
              Empower brand ambassadors, hype men, and influencers to sell tickets with custom referral links and earn automated cash commissions.
            </p>
          </div>

          <div className="rx-feature-card">
            <div className="rx-feature-icon-box">
              <ShieldCheckIcon size={24} />
            </div>
            <h3 className="rx-feature-title">Live Gate Scanner &amp; Staff Mode</h3>
            <p className="rx-feature-desc">
              Turn any smartphone into an ultra-fast ticket scanner. Admit guests in sub-seconds and track real-time gate turnout metrics on the fly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="rx-footer">
        <div className="rx-footer-container">
          <div className="rx-footer-grid">
            {/* Col 1: Brand Info */}
            <div>
              <img
                src="/logo-gold.png"
                alt="Nà Mè Dèy Sell"
                style={{ height: "46px", objectFit: "contain", marginBottom: "12px" }}
              />
              <p className="rx-footer-brand-desc">
                Nà Mè Dèy Sell is the premier modern ticketing platform designed to discover, monetize, and manage unforgettable events, concerts, and festivals.
              </p>
            </div>

            {/* Col 2: Solutions */}
            <div>
              <h4 className="rx-footer-heading">Solutions</h4>
              <ul className="rx-footer-links">
                <li>
                  <span
                    className="rx-footer-link"
                    onClick={() =>
                      requireAuth(() => setIsCreateEventOpen(true), "to create and manage your event", "register")
                    }
                  >
                    For Organizers
                  </span>
                </li>
                <li><span className="rx-footer-link">For Promoters &amp; Affiliates</span></li>
                <li><span className="rx-footer-link">For Food &amp; Merch Vendors</span></li>
                <li><span className="rx-footer-link">NMDS XP Rewards</span></li>
              </ul>
            </div>

            {/* Col 3: Quick Links */}
            <div>
              <h4 className="rx-footer-heading">Experience</h4>
              <ul className="rx-footer-links">
                <li>
                  <span
                    className="rx-footer-link"
                    onClick={() =>
                      requireAuth(() => setIsMyTicketsOpen(true), "to access your pass wallet", "login")
                    }
                  >
                    My Pass Wallet
                  </span>
                </li>
                <li>
                  <span
                    className="rx-footer-link"
                    onClick={() =>
                      requireAuth(() => setIsScannerOpen(true), "to access the Gate Staff Scanner", "login")
                    }
                  >
                    Gate Staff Scanner
                  </span>
                </li>
                <li><a href="#trending" className="rx-footer-link">Trending Events</a></li>
                <li><a href="#features" className="rx-footer-link">Safety &amp; Anti-Fraud</a></li>
              </ul>
            </div>

            {/* Col 4: Top Locations */}
            <div>
              <h4 className="rx-footer-heading">Hot Cities</h4>
              <ul className="rx-footer-links">
                <li><span className="rx-footer-link" onClick={() => setSelectedCity("Lagos")}>Lagos Events</span></li>
                <li><span className="rx-footer-link" onClick={() => setSelectedCity("Abuja")}>Abuja Concerts</span></li>
                <li><span className="rx-footer-link" onClick={() => setSelectedCity("Port Harcourt")}>Port Harcourt</span></li>
                <li><span className="rx-footer-link" onClick={() => setSelectedCity("Uyo")}>Uyo Festivals</span></li>
              </ul>
            </div>
          </div>

          <div className="rx-footer-bottom">
            <div>
              © 2026 Nà Mè Dèy Sell. All rights reserved. Your Event Life, Simplified.
            </div>
            <div style={{ display: "flex", gap: "18px" }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Organizers Agreement</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Suite */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          currentUser={currentUser}
          onClose={() => setSelectedEvent(null)}
          onProceedToCheckout={handleStartBooking}
          onEditEvent={setEditingEvent}
          onSwitchToAdmin={(evt) => handleSelectEvent(evt, "admin")}
        />
      )}

      {/* Dedicated Event Admin Dashboard for Organizers & Admins */}
      {adminEvent && (
        <EventAdminModal
          event={adminEvent}
          isOpen={Boolean(adminEvent)}
          currentUser={currentUser}
          onClose={() => setAdminEvent(null)}
          onOpenEdit={(evt) => {
            setEditingEvent(evt);
          }}
          onPreviewAttendee={(evt) => {
            handleSelectEvent(evt, "attendee");
          }}
          onOpenScanner={() => {
            setIsScannerOpen(true);
          }}
          onEventUpdated={(updated) => {
            refreshData();
            setAdminEvent(updated);
            if (selectedEvent && String(selectedEvent.id) === String(updated.id)) {
              setSelectedEvent(updated);
            }
          }}
        />
      )}

      {/* Direct Event Editor for Organizers & Admins */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          isOpen={Boolean(editingEvent)}
          onClose={() => setEditingEvent(null)}
          onEventUpdated={(updated) => {
            setEditingEvent(null);
            refreshData();
            if (adminEvent && String(adminEvent.id) === String(updated.id)) {
              setAdminEvent(updated);
            }
            if (selectedEvent && String(selectedEvent.id) === String(updated.id)) {
              setSelectedEvent(updated);
            }
          }}
        />
      )}

      {checkoutData && (
        <CheckoutModal
          bookingData={checkoutData}
          currentUser={currentUser}
          onClose={() => setCheckoutData(null)}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {activePassTickets && (
        <DigitalTicketPass
          tickets={activePassTickets}
          onClose={() => setActivePassTickets(null)}
        />
      )}

      {isMyTicketsOpen && (
        <MyTicketsModal
          tickets={tickets}
          onClose={() => setIsMyTicketsOpen(false)}
          onSelectTicket={(tkt) => {
            setIsMyTicketsOpen(false);
            setActivePassTickets([tkt]);
          }}
        />
      )}

      {isScannerOpen && (
        <OrganizerScannerModal
          tickets={tickets}
          onRefreshTickets={refreshData}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {verifyingTicketId && (
        <TicketVerificationModal
          ticketId={verifyingTicketId}
          onClose={() => {
            setVerifyingTicketId(null);
            if (typeof window !== "undefined" && window.history.replaceState) {
              const url = new URL(window.location.href);
              url.searchParams.delete("verify");
              url.searchParams.delete("ticket");
              url.searchParams.delete("scan");
              url.searchParams.delete("barcode");
              window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ""));
            }
          }}
          onOpenDigitalPass={(passTickets) => setActivePassTickets(passTickets)}
          onTicketStatusChanged={() => {
            setTickets(getStoredTickets());
          }}
        />
      )}

      {isCreateEventOpen && (
        <CreateEventModal
          currentUser={currentUser}
          onClose={() => setIsCreateEventOpen(false)}
          onEventCreated={handleEventCreated}
          onEditEvent={(evt) => {
            setIsCreateEventOpen(false);
            setEditingEvent(evt);
          }}
        />
      )}

      {/* Organizer Dashboard & Event Studio */}
      {isOrganizerDashboardOpen && (
        <OrganizerDashboard
          currentUser={currentUser}
          events={events}
          isOpen={isOrganizerDashboardOpen}
          onClose={() => setIsOrganizerDashboardOpen(false)}
          onOpenCreateEvent={() => {
            setIsOrganizerDashboardOpen(false);
            setIsCreateEventOpen(true);
          }}
          onOpenScanner={() => {
            setIsOrganizerDashboardOpen(false);
            setIsScannerOpen(true);
          }}
          onEventsRefresh={refreshData}
          onOpenEventAdmin={(evt) => {
            setIsOrganizerDashboardOpen(false);
            setAdminEvent(evt);
          }}
        />
      )}

      {/* Super Admin Command Center & Moderation Hub */}
      {isAdminDashboardOpen && isSuperAdmin(currentUser) && (
        <AdminDashboard
          currentUser={currentUser}
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
          onEventsRefresh={refreshData}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        promptReason={authPromptReason}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
