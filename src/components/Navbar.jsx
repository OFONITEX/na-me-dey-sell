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
  MailIcon,
  CrownIcon,
  MenuIcon,
  CloseIcon
} from "./Icons";
import { isSuperAdmin } from "../lib/authService";

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  ticketsCount = 0,
  onOpenMyTickets,
  onOpenScanner,
  onOpenCreateEvent,
  onOpenOrganizerDashboard,
  onOpenAdminDashboard,
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory
}) {
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userIsAdmin = isSuperAdmin(user);

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

        {/* Desktop Navigation Links */}
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
                    if (onOpenOrganizerDashboard) onOpenOrganizerDashboard();
                    else onOpenCreateEvent();
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  For Organizers (Dashboard)
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

                {userIsAdmin && (
                  <>
                    <div style={{ height: "1px", background: "rgba(212, 175, 55, 0.2)", margin: "4px 0" }} />
                    <div
                      style={{
                        padding: "10px 14px",
                        fontSize: "12px",
                        fontWeight: "800",
                        color: "#F5D061",
                        background: "rgba(212, 175, 55, 0.1)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                      onClick={() => {
                        setSolutionsOpen(false);
                        if (onOpenAdminDashboard) onOpenAdminDashboard();
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.25)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.1)"}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CrownIcon size={14} style={{ color: "#D4AF37" }} />
                        <span>Super Admin Portal</span>
                      </span>
                      <span style={{ fontSize: "9px", background: "#D4AF37", color: "#070709", padding: "2px 5px", borderRadius: "3px", fontWeight: "900" }}>ROOT</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <a href="#trending" className="nav-link-item">Trending</a>
          <a href="#how-it-works" className="nav-link-item">How It Works</a>
          <a href="#features" className="nav-link-item">Why Us</a>
        </nav>

        {/* Action Controls */}
        <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Super Admin Command Portal Button (Tablet & Desktop) */}
          {userIsAdmin && (
            <button
              className="nav-link-item hidden md:flex"
              onClick={onOpenAdminDashboard}
              title="Super Admin Portal — View All Accounts, Payments & Activities"
              style={{
                border: "1px solid #D4AF37",
                borderRadius: "8px",
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.35) 0%, rgba(245, 208, 97, 0.15) 100%)",
                color: "#F5D061",
                fontWeight: "900",
                alignItems: "center",
                gap: "7px",
                padding: "6px 12px",
                boxShadow: "0 0 18px rgba(212, 175, 55, 0.35)",
                cursor: "pointer"
              }}
            >
              <CrownIcon size={16} style={{ color: "#F5D061" }} />
              <span className="hidden lg:inline">👑 Super Admin Portal</span>
              <span className="lg:hidden">👑 Admin</span>
              <span style={{
                fontSize: "10px",
                background: "#D4AF37",
                color: "#070709",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: "900"
              }}>
                ⚡ ALL
              </span>
            </button>
          )}

          {/* Gate Scanner (Desktop only) */}
          <button
            className="nav-link-item hidden lg:flex"
            onClick={onOpenScanner}
            title="Gate Staff Ticket Validator"
            style={{ border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "6px" }}
          >
            <QrCodeIcon size={16} />
            <span>Gate Scanner</span>
          </button>

          {/* My Tickets Pass Wallet */}
          <button
            className="btn-ticket-wallet"
            onClick={onOpenMyTickets}
            title="View your booked passes"
            style={{ padding: "7px 12px" }}
          >
            <TicketIcon size={16} />
            <span className="hidden sm:inline">My Passes</span>
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
                      {userIsAdmin ? (
                        <span style={{ fontSize: "9px", fontWeight: "900", background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)", color: "#070709", padding: "1px 5px", borderRadius: "4px", letterSpacing: "0.05em" }}>
                          SUPERADMIN
                        </span>
                      ) : (
                        <ShieldCheckIcon size={14} style={{ color: "#10B981" }} />
                      )}
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
                  {userIsAdmin && (
                    <div
                      onClick={() => {
                        setUserDropdownOpen(false);
                        if (onOpenAdminDashboard) onOpenAdminDashboard();
                      }}
                      style={{
                        padding: "9px 12px",
                        fontSize: "12px",
                        fontWeight: "800",
                        color: "#070709",
                        background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                        boxShadow: "0 2px 8px rgba(212, 175, 55, 0.35)"
                      }}
                    >
                      <CrownIcon size={14} style={{ color: "#070709" }} />
                      <span>Super Admin Command</span>
                    </div>
                  )}

                  <div
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onOpenOrganizerDashboard) onOpenOrganizerDashboard();
                    }}
                    style={{
                      padding: "9px 12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#F5D061",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(212, 175, 55, 0.08)",
                      marginBottom: "6px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(212, 175, 55, 0.08)"}
                  >
                    <TicketIcon size={14} style={{ color: "#D4AF37" }} />
                    <span>Organizer Dashboard</span>
                  </div>

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

          {/* Primary Action Split Button: Create Event (Desktop/Tablet) */}
          <button
            className="rx-btn rx-btn-primary hidden md:inline-flex"
            onClick={onOpenCreateEvent}
            title="Sell tickets on Nà Mè Dèy Sell"
          >
            <span className="rx-btn-text">Create Event</span>
            <span className="rx-btn-icon">
              <PlusIcon size={16} />
            </span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="rx-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              background: mobileMenuOpen ? "rgba(212, 175, 55, 0.25)" : "rgba(212, 175, 55, 0.12)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              borderRadius: "8px",
              color: "#F5D061",
              width: "36px",
              height: "36px",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0
            }}
          >
            {mobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-drawer md:hidden"
          style={{
            position: "fixed",
            top: "58px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(7, 7, 9, 0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(212, 175, 55, 0.25)",
            padding: "16px 16px 40px",
            overflowY: "auto",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          {/* Super Admin Quick Access Card */}
          {userIsAdmin && (
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminDashboard();
              }}
              style={{
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(245, 208, 97, 0.1) 100%)",
                border: "1px solid #D4AF37",
                borderRadius: "12px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(212, 175, 55, 0.25)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CrownIcon size={22} style={{ color: "#F5D061" }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: "#ffffff" }}>
                    👑 Super Admin Portal
                  </div>
                  <div style={{ fontSize: "11px", color: "#F5D061" }}>
                    View all activities, payments &amp; accounts
                  </div>
                </div>
              </div>
              <span style={{ fontSize: "10px", background: "#D4AF37", color: "#070709", padding: "4px 8px", borderRadius: "4px", fontWeight: "900" }}>
                OPEN
              </span>
            </div>
          )}

          {/* User profile or Auth buttons */}
          {user ? (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#D4AF37", color: "#070709", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                  {user.initials || user.fullName?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#ffffff" }}>{user.fullName}</div>
                  <div style={{ fontSize: "11px", color: "#E2D9BC" }}>{user.email}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenOrganizerDashboard();
                  }}
                  style={{ flex: 1, padding: "8px", background: "rgba(212, 175, 55, 0.15)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "8px", color: "#F5D061", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  Organizer Studio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "#F87171", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth("to sign in to your account");
                }}
                style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "10px", color: "#ffffff", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth("to create your account");
                }}
                style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)", border: "none", borderRadius: "10px", color: "#070709", fontSize: "13px", fontWeight: "800", cursor: "pointer" }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Primary Action: Create Event */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCreateEvent();
            }}
            className="rx-btn rx-btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <span className="rx-btn-text" style={{ flex: 1, textAlign: "center", padding: "12px" }}>+ Create an Event</span>
            <span className="rx-btn-icon"><PlusIcon size={16} /></span>
          </button>

          {/* Secondary Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMyTickets();
              }}
              style={{ padding: "12px", background: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "10px", color: "#ffffff", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}
            >
              <TicketIcon size={16} style={{ color: "#D4AF37" }} />
              <span>My Passes ({ticketsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenScanner();
              }}
              style={{ padding: "12px", background: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.25)", borderRadius: "10px", color: "#ffffff", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}
            >
              <QrCodeIcon size={16} style={{ color: "#D4AF37" }} />
              <span>Gate Scanner</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#948B75", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
              Quick Navigation
            </div>
            <a
              href="#trending"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: "10px 12px", color: "#E2D9BC", textDecoration: "none", fontSize: "14px", fontWeight: "600", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}
            >
              🔥 Trending Events
            </a>
            <a
              href="#events-section"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: "10px 12px", color: "#E2D9BC", textDecoration: "none", fontSize: "14px", fontWeight: "600", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}
            >
              🎟️ Explore All Tickets
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: "10px 12px", color: "#E2D9BC", textDecoration: "none", fontSize: "14px", fontWeight: "600", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}
            >
              🛡️ Why Nà Mè Dèy Sell
            </a>
          </div>

          {/* Solutions List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#948B75", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
              Solutions &amp; Ecosystem
            </div>
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOrganizerDashboard();
              }}
              style={{ padding: "8px 12px", color: "#F5D061", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              • For Organizers (Dashboard &amp; Studio)
            </div>
            <div style={{ padding: "8px 12px", color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
              • For Promoters &amp; Affiliates
            </div>
            <div style={{ padding: "8px 12px", color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
              • For Food &amp; Merch Vendors
            </div>
            <div style={{ padding: "8px 12px", color: "#D4AF37", fontSize: "13px", fontWeight: "700" }}>
              • NMDS XP Rewards &amp; Badges
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
