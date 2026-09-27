"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#070709",
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
        textAlign: "center",
        padding: "40px 20px"
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "8px", color: "#D4AF37" }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: "14px", color: "#999", maxWidth: "400px", marginBottom: "24px" }}>
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={() => reset()}
        style={{
          background: "#D4AF37",
          color: "#070709",
          border: "none",
          borderRadius: "8px",
          padding: "12px 28px",
          fontSize: "14px",
          fontWeight: "800",
          cursor: "pointer"
        }}
      >
        Try Again
      </button>
    </div>
  );
}
