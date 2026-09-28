"use client";

import { useState } from "react";
import {
  TicketIcon,
  QrCodeIcon,
  PlusIcon,
  ChevronDownIcon,
  UserIcon,
  ShieldCheckIcon,
  LogOutIcon,
  PhoneIcon,
  MailIcon
} from "./Icons";

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  ticketsCount = 0,
  onOpenMyTickets,
  onOpenScanner,
  onOpenCreateEvent,
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory
}) {
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
                  For Promoters &amp; Affiliates
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
        <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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

          {/* User Account / Profile Section */}
          {user ? (
            <div
              className="relative"
              style={{ position: "relative" }}
              onMouseLeave={() => setUserDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(212, 175, 55, 0.12)",
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  borderRadius: "24px",
                  padding: "4px 12px 4px 6px",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#F5D061"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.4)"}
              >
                {/* Initials Avatar */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #D4AF37 0%, #A67C1E 100%)",
                    color: "#070709",
                    fontWeight: "900",
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(212, 175, 55, 0.4)"
                  }}
                >
                  {user.initials || (user.fullName ? user.fullName[0].toUpperCase() : "U")}
                </div>

                <span
                  className="hidden sm:inline"
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#F5D061",
                    maxWidth: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {user.fullName ? user.fullName.split(" ")[0] : "Account"}
                </span>

                <ChevronDownIcon size={12} style={{ color: "rgba(212, 175, 55, 0.7)" }} />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "8px",
                    width: "260px",
                    background: "#0E0E14",
                    border: "1px solid rgba(212, 175, 55, 0.35)",
                    borderRadius: "14px",
                    padding: "12px",
                    boxShadow: "0 20px 45px rgba(0,0,0,0.9), 0 0 25px rgba(212, 175, 55, 0.2)",
                    zIndex: 100,
                    animation: "fadeIn 0.15s ease-out"
                  }}
                >
                  {/* User Profile Card */}
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(212, 175, 55, 0.15)",
                      borderRadius: "10px",
                      marginBottom: "8px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#ffffff" }}>
                        {user.fullName}
                      </span>
                      <ShieldCheckIcon size={14} style={{ color: "#10B981" }} />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        color: "#E2D9BC",
                        marginBottom: "4px"
                      }}
                    >
                      <MailIcon size={12} style={{ color: "#D4AF37" }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.email}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        color: "#F5D061"
                      }}
                    >
                      <PhoneIcon size={12} style={{ color: "#D4AF37" }} />
                      <span>{user.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenMyTickets();
                    }}
                    style={{
                      padding: "9px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#E2D9BC",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <TicketIcon size={14} style={{ color: "#D4AF37" }} />
                    <span>My Passes ({ticketsCount})</span>
                  </div>

                  <div
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenCreateEvent();
                    }}
                    style={{
                      padding: "9px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#E2D9BC",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <PlusIcon size={14} style={{ color: "#D4AF37" }} />
                    <span>Create New Event</span>
                  </div>

                  <div
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenScanner();
                    }}
                    style={{
                      padding: "9px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#E2D9BC",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <QrCodeIcon size={14} style={{ color: "#D4AF37" }} />
                    <span>Gate Scanner</span>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: "rgba(212, 175, 55, 0.2)", margin: "6px 0" }} />

                  {/* Sign Out */}
                  <div
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                    style={{
                      padding: "9px 12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#EF4444",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <LogOutIcon size={14} style={{ color: "#EF4444" }} />
                    <span>Sign Out</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated: Sign In / Create Account Buttons */
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                onClick={() => onOpenAuth("to sign in to your account")}
                className="nav-link-item"
                style={{
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#E2D9BC",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth("to get started and book tickets")}
                style={{
                  padding: "8px 14px",
                  fontSize: "12px",
                  fontWeight: "800",
                  color: "#070709",
                  background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 14px rgba(212, 175, 55, 0.35)",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <UserIcon size={14} />
                <span>Create Account</span>
              </button>
            </div>
          )}

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
