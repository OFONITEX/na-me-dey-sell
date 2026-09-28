"use client";

import { useState } from "react";
import {
  CloseIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  SparklesIcon,
  ShieldCheckIcon
} from "./Icons";
import { registerUser, loginUser } from "../lib/authService";
import { triggerConfetti } from "../lib/confetti";

export default function AuthModal({
  isOpen,
  initialMode = "register", // "register" | "login"
  promptReason = "", // e.g. "to complete your ticket purchase"
  onClose,
  onSuccess
}) {
  const [mode, setMode] = useState(initialMode); // "register" | "login"
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Register Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const user = await registerUser({
        fullName,
        email,
        phone,
        password
      });

      triggerConfetti();
      setSuccessMessage(`Welcome aboard, ${user.fullName.split(" ")[0]}! Your account is ready.`);

      setTimeout(() => {
        if (onSuccess) onSuccess(user);
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to create account. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const user = await loginUser({
        identifier: loginIdentifier,
        password: loginPassword
      });

      setSuccessMessage(`Welcome back, ${user.fullName.split(" ")[0]}!`);

      setTimeout(() => {
        if (onSuccess) onSuccess(user);
        if (onClose) onClose();
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || "Sign in failed. Check your email/phone and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(5, 5, 8, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "linear-gradient(180deg, #13131A 0%, #0B0B0F 100%)",
          border: "1px solid rgba(212, 175, 55, 0.35)",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 40px rgba(212, 175, 55, 0.18)",
          overflow: "hidden",
          position: "relative",
          animation: "modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Top Gold Accent Glow Line */}
        <div
          style={{
            height: "3px",
            background: "linear-gradient(90deg, transparent, #D4AF37, #F5D061, transparent)",
            width: "100%"
          }}
        />

        {/* Modal Header */}
        <div
          style={{
            padding: "24px 28px 16px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "11px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#D4AF37",
                  background: "rgba(212, 175, 55, 0.12)",
                  border: "1px solid rgba(212, 175, 55, 0.25)",
                  padding: "3px 8px",
                  borderRadius: "20px"
                }}
              >
                <SparklesIcon size={12} />
                <span>Nà Mè Dèy Sell Account</span>
              </span>
            </div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "800",
                color: "#ffffff",
                letterSpacing: "-0.02em",
                margin: 0
              }}
            >
              {mode === "register" ? "Create Your Account" : "Welcome Back"}
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#E2D9BC",
                marginTop: "4px",
                marginBottom: 0
              }}
            >
              {mode === "register"
                ? "Join thousands of attendees and event creators across Africa."
                : "Sign in with your Email or Phone number to access your tickets."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#E2D9BC",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
              e.currentTarget.style.color = "#E2D9BC";
            }}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Action Prompt Reason Banner (if supplied) */}
        {promptReason && (
          <div
            style={{
              margin: "0 28px 16px",
              padding: "10px 14px",
              background: "rgba(212, 175, 55, 0.1)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "12px",
              color: "#F5D061"
            }}
          >
            <ShieldCheckIcon size={16} style={{ flexShrink: 0, color: "#D4AF37" }} />
            <span>
              Please <strong>create an account</strong> or <strong>sign in</strong> {promptReason}.
            </span>
          </div>
        )}

        {/* Tab Switcher: Register / Login */}
        <div
          style={{
            display: "flex",
            margin: "0 28px 20px",
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "4px"
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            style={{
              flex: 1,
              padding: "10px 0",
              fontSize: "13px",
              fontWeight: "700",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: mode === "register" ? "linear-gradient(135deg, #D4AF37 0%, #A67C1E 100%)" : "transparent",
              color: mode === "register" ? "#070709" : "#E2D9BC",
              boxShadow: mode === "register" ? "0 4px 12px rgba(212, 175, 55, 0.3)" : "none"
            }}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            style={{
              flex: 1,
              padding: "10px 0",
              fontSize: "13px",
              fontWeight: "700",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: mode === "login" ? "linear-gradient(135deg, #D4AF37 0%, #A67C1E 100%)" : "transparent",
              color: mode === "login" ? "#070709" : "#E2D9BC",
              boxShadow: mode === "login" ? "0 4px 12px rgba(212, 175, 55, 0.3)" : "none"
            }}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              margin: "0 28px 16px",
              padding: "12px 14px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#FCA5A5",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            <AlertTriangleIcon size={16} style={{ flexShrink: 0, color: "#EF4444" }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              margin: "0 28px 16px",
              padding: "12px 14px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#6EE7B7",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            <CheckCircleIcon size={18} style={{ flexShrink: 0, color: "#10B981" }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Register Form */}
        {mode === "register" ? (
          <form onSubmit={handleRegisterSubmit} style={{ padding: "0 28px 28px" }}>
            {/* Full Name */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#E2D9BC",
                  marginBottom: "6px"
                }}
              >
                Full Name <span style={{ color: "#D4AF37" }}>*</span>
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    color: "rgba(212, 175, 55, 0.7)",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chukwuma Adebayo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 14px 0 42px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border 0.2s"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#E2D9BC",
                  marginBottom: "6px"
                }}
              >
                Email Address <span style={{ color: "#D4AF37" }}>*</span>
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    color: "rgba(212, 175, 55, 0.7)",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <MailIcon size={18} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. chukwuma@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 14px 0 42px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border 0.2s"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#E2D9BC"
                  }}
                >
                  Phone Number <span style={{ color: "#D4AF37" }}>*</span>
                </label>
                <span style={{ fontSize: "11px", color: "#D4AF37", fontWeight: "600" }}>
                  🇳🇬 Nigeria / Int&apos;l
                </span>
              </div>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    color: "rgba(212, 175, 55, 0.7)",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <PhoneIcon size={18} />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="0801 234 5678 or +234..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 14px 0 42px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border 0.2s"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
                />
              </div>
              <div style={{ fontSize: "11px", color: "rgba(226, 217, 188, 0.7)", marginTop: "4px" }}>
                Used for instant SMS ticket delivery and door admission verify.
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#E2D9BC",
                  marginBottom: "6px"
                }}
              >
                Password <span style={{ color: "#D4AF37" }}>*</span>
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    color: "rgba(212, 175, 55, 0.7)",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <LockIcon size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 46px 0 42px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border 0.2s"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "transparent",
                    border: "none",
                    color: "rgba(226, 217, 188, 0.7)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="rx-btn rx-btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                opacity: isLoading ? 0.7 : 1
              }}
            >
              <span className="rx-btn-text" style={{ flex: 1, textAlign: "center" }}>
                {isLoading ? "Creating Account..." : "Create Account & Continue"}
              </span>
              <span className="rx-btn-icon">
                <ArrowRightIcon size={16} />
              </span>
            </button>

            {/* Switch to Sign In */}
            <div
              style={{
                textAlign: "center",
                marginTop: "16px",
                fontSize: "12px",
                color: "#E2D9BC"
              }}
            >
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#F5D061",
                  fontWeight: "700",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} style={{ padding: "0 28px 28px" }}>
            {/* Identifier: Email or Phone */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#E2D9BC",
                  marginBottom: "6px"
                }}
              >
                Email or Phone Number <span style={{ color: "#D4AF37" }}>*</span>
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    color: "rgba(212, 175, 55, 0.7)",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <MailIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter email or registered phone number"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 14px 0 42px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border 0.2s"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#E2D9BC"
                  }}
                >
                  Password <span style={{ color: "#D4AF37" }}>*</span>
                </label>
              </div>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    color: "rgba(212, 175, 55, 0.7)",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <LockIcon size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 46px 0 42px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    color: "#ffffff",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border 0.2s"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.12)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "transparent",
                    border: "none",
                    color: "rgba(226, 217, 188, 0.7)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="rx-btn rx-btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                opacity: isLoading ? 0.7 : 1
              }}
            >
              <span className="rx-btn-text" style={{ flex: 1, textAlign: "center" }}>
                {isLoading ? "Signing In..." : "Sign In to Account"}
              </span>
              <span className="rx-btn-icon">
                <ArrowRightIcon size={16} />
              </span>
            </button>

            {/* Switch to Register */}
            <div
              style={{
                textAlign: "center",
                marginTop: "16px",
                fontSize: "12px",
                color: "#E2D9BC"
              }}
            >
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#F5D061",
                  fontWeight: "700",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Create Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
