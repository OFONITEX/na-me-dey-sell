"use client";

import { useState } from "react";
import { TicketIcon, QrCodeIcon, PlusIcon, SearchIcon, SparklesIcon, ChevronDownIcon } from "./Icons";

export default function Navbar({
  ticketsCount,
  onOpenMyTickets,
  onOpenScanner,
  onOpenCreateEvent,
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory
}) {
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  return (
    <header className="rx-nav-sticky">
      <div className="rx-nav-container">
        {/* Brand with Gold Logo */}
        <div className="brand-logo-link" onClick={() => onSelectCategory("all")}>
          <img
            src="/logo-gold.png"
            alt="Nà Mè Dèy Sell"
            className="brand-logo-img"
          />
          <span className="brand-tagline-pill">Official Tickets</span>
        </div>

        {/* Desktop Navigation Links modeled after Rigitix */}
        <nav className="nav-links-row hidden md:flex">
          {/* Solutions Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button
              type="button"
              className="nav-link-item"
              onClick={() => setSolutionsOpen(!solutionsOpen)}
            >
              <span>Solutions</span>
              <ChevronDownIcon size={14} />
            </button>

            {solutionsOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "220px",
                  background: "#0E0E14",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "12px",
                  padding: "8px",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.8), 0 0 20px rgba(212, 175, 55, 0.15)",
                  zIndex: 100
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#fff",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onClick={() => {
                    setSolutionsOpen(false);
                    onOpenCreateEvent();
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  For Organizers
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "rgba(255,255,255,0.8)",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                  onClick={() => setSolutionsOpen(false)}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  For Promoters & Affiliates
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "rgba(255,255,255,0.8)",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                  onClick={() => setSolutionsOpen(false)}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  For Vendors
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#F5D061",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                  onClick={() => setSolutionsOpen(false)}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span>NMDS XP Rewards</span>
                  <span style={{ fontSize: "9px", background: "#D4AF37", color: "#070709", padding: "2px 5px", borderRadius: "3px", fontWeight: "900" }}>HOT</span>
                </div>
              </div>
            )}
          </div>

          <a href="#trending" className="nav-link-item">Trending</a>
          <a href="#how-it-works" className="nav-link-item">How It Works</a>
          <a href="#features" className="nav-link-item">Why Us</a>
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Gate Scanner */}
          <button
            className="nav-link-item"
            onClick={onOpenScanner}
            title="Gate Staff Ticket Validator"
            style={{ border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "6px" }}
          >
            <QrCodeIcon size={16} />
            <span className="hidden sm:inline">Gate Scanner</span>
          </button>

          {/* My Tickets Pass Wallet */}
          <button
            className="btn-ticket-wallet"
            onClick={onOpenMyTickets}
            title="View your booked passes"
          >
            <TicketIcon size={16} />
            <span>My Passes</span>
            {ticketsCount > 0 && <span className="badge-ticket-counter">{ticketsCount}</span>}
          </button>

          {/* Rigitix Signature Split Button: Create Event */}
          <button
            className="rx-btn rx-btn-primary"
            onClick={onOpenCreateEvent}
            title="Sell tickets on Nà Mè Dèy Sell"
          >
            <span className="rx-btn-text">Create Event</span>
            <span className="rx-btn-icon">
              <PlusIcon size={16} />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
