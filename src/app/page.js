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
import {
  SparklesIcon,
  TicketIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  ArrowRightIcon,
  MapPinIcon,
  SearchIcon,
  FlameIcon,
  CalendarIcon
} from "../components/Icons";
import { getStoredEvents, getStoredTickets, INITIAL_TICKETS } from "../lib/ticketService";
import { INITIAL_EVENTS } from "../data/mockEvents";

export default function Home() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [activePassTickets, setActivePassTickets] = useState(null);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    setEvents(getStoredEvents());
    setTickets(getStoredTickets());
  }, []);

  const refreshData = () => {
    setEvents(getStoredEvents());
    setTickets(getStoredTickets());
  };

  const categories = [
    { id: "all", label: "All Events" },
    { id: "Parties & Nightlife", label: "🎉 Parties & Nightlife" },
    { id: "Concerts & Music", label: "🎵 Concerts & Live" },
    { id: "Tech & Business", label: "🚀 Tech & Summits" },
    { id: "Food & Festivals", label: "🍹 Food & Festivals" },
    { id: "Campus & Comedy", label: "🎭 Comedy & Stage" }
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
    const matchesCategory =
      activeCategory === "all" || evt.category.toLowerCase() === activeCategory.toLowerCase();

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

  const handleStartBooking = (bookingPayload) => {
    setSelectedEvent(null);
    setCheckoutData(bookingPayload);
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
    <div className="min-h-screen bg-[#11081a]">
      {/* Sticky Navigation */}
      <Navbar
        ticketsCount={tickets.length}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenCreateEvent={() => setIsCreateEventOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Hero Section styled after Rigitix */}
      <section className="rx-hero">
        <div className="rx-hero-glow-1" />
        <div className="rx-hero-glow-2" />

        <div className="rx-announcement-pill">
          <span className="accent-dot" />
          <span>Nà Mè Dèy Sell • Africa&apos;s Next-Gen Ticket Infrastructure</span>
        </div>

        <h1 className="rx-hero-title">
          Your event life, <span className="rx-highlight-lavender">simplified.</span>
        </h1>

        <p className="rx-hero-subtitle">
          Plan, promote, discover, and sell tickets sharp-sharp from one high-speed platform built for event creators, organizers, and verified attendees.
        </p>

        {/* Dual Split CTA Buttons */}
        <div className="rx-hero-actions">
          <button
            className="rx-btn rx-btn-primary"
            onClick={() => setIsCreateEventOpen(true)}
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

      {/* Trending Events Spotlight Slider (Rigitix signature layout) */}
      <section id="trending" className="rx-trending-section">
        <div className="rx-section-header-wrap">
          <div>
            <div className="rx-section-badge">
              <FlameIcon size={14} />
              <span>Happening Right Now</span>
            </div>
            <h2 className="rx-section-title">
              Trending <span style={{ color: "var(--brand-lavender)", fontStyle: "italic" }}>Events</span>.
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
              onSelect={setSelectedEvent}
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
                onSelect={setSelectedEvent}
              />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Nà Mè Dèy Sell (Rigitix 4-Pillar Features) */}
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
                <li><span className="rx-footer-link" onClick={() => setIsCreateEventOpen(true)}>For Organizers</span></li>
                <li><span className="rx-footer-link">For Promoters &amp; Affiliates</span></li>
                <li><span className="rx-footer-link">For Food &amp; Merch Vendors</span></li>
                <li><span className="rx-footer-link">NMDS XP Rewards</span></li>
              </ul>
            </div>

            {/* Col 3: Quick Links */}
            <div>
              <h4 className="rx-footer-heading">Experience</h4>
              <ul className="rx-footer-links">
                <li><span className="rx-footer-link" onClick={() => setIsMyTicketsOpen(true)}>My Pass Wallet</span></li>
                <li><span className="rx-footer-link" onClick={() => setIsScannerOpen(true)}>Gate Staff Scanner</span></li>
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
          onClose={() => setSelectedEvent(null)}
          onProceedToCheckout={handleStartBooking}
        />
      )}

      {checkoutData && (
        <CheckoutModal
          bookingData={checkoutData}
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

      {isCreateEventOpen && (
        <CreateEventModal
          onClose={() => setIsCreateEventOpen(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
}
