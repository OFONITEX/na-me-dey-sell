"use client";

import { useState, useEffect } from "react";
import AdminDashboard from "../../components/AdminDashboard";
import { getAuthUser, subscribeAuth, isSuperAdmin } from "../../lib/authService";
import Link from "next/link";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCurrentUser(getAuthUser());

    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  if (!isMounted) return null;

  const userIsSuperAdmin = isSuperAdmin(currentUser);

  return (
    <div style={{ minHeight: "100vh", background: "#070709", display: "flex", flexDirection: "column" }}>
      {/* Return to Marketplace bar */}
      <div style={{ padding: "12px 24px", background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(212, 175, 55, 0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "8px", color: "#F5D061", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}
        >
          <span>← Back to Nà Mè Dèy Sell Public Marketplace</span>
        </a>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Root URL: /admin</span>
      </div>

      {!userIsSuperAdmin ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ maxWidth: "460px", width: "100%", background: "#0E0E14", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "16px", padding: "32px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.9)" }}>
            <div style={{ width: "56px", height: "56px", margin: "0 auto 16px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", fontSize: "24px" }}>
              🔒
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", margin: "0 0 8px" }}>
              Super Admin Access Restricted
            </h2>
            <p style={{ fontSize: "13px", color: "#948B75", lineHeight: 1.6, margin: "0 0 24px" }}>
              This portal is restricted to authorized platform Super Administrators (<strong>brinoekanem@gmail.com</strong> and <strong>iamrhobbinraynerhq01@gmail.com</strong>).
              {currentUser?.email ? (
                <> Connected account <strong>{currentUser.email}</strong> does not possess root administrative permissions.</>
              ) : (
                <> Please return to the homepage and sign in with an authorized Super Admin account.</>
              )}
            </p>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "10px 24px",
                background: "linear-gradient(135deg, #D4AF37 0%, #F5D061 100%)",
                borderRadius: "8px",
                color: "#070709",
                fontWeight: "800",
                fontSize: "13px",
                textDecoration: "none"
              }}
            >
              Return to Marketplace
            </a>
          </div>
        </div>
      ) : (
        <AdminDashboard
          currentUser={currentUser}
          isOpen={true}
          onClose={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/";
            }
          }}
          onEventsRefresh={() => {}}
        />
      )}
    </div>
  );
}
