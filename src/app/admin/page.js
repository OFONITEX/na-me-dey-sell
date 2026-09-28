"use client";

import { useState, useEffect } from "react";
import AdminDashboard from "../../components/AdminDashboard";
import { getAuthUser, subscribeAuth } from "../../lib/authService";
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
    </div>
  );
}
