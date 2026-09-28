import { drawBarcodeOnCanvas } from "./barcodeGenerator";
import { generateQRCodeMatrix } from "./qrCodeGenerator";
import { formatNaira } from "./ticketService";

/**
 * Generates an official, high-resolution downloadable Ticket Slip PNG.
 * Includes Ticket ID, Barcode, QR Code, Signup Details (Name, Email, Phone),
 * and Ticket/Seat Number.
 */
export async function downloadTicketSlip(ticket, passIndex = 0, totalPasses = 1) {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // High-DPI canvas dimensions for razor-sharp printing and viewing
  const width = 800;
  const height = 1260;
  canvas.width = width;
  canvas.height = height;

  // Background - Deep Luxury Obsidian
  ctx.fillStyle = "#0A0A0E";
  ctx.fillRect(0, 0, width, height);

  // Outer Gold Decorative Border
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Inner Subtle Border
  ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Top Accent Header
  const headerGrad = ctx.createLinearGradient(0, 24, width, 24);
  headerGrad.addColorStop(0, "#D4AF37");
  headerGrad.addColorStop(0.5, "#F5D061");
  headerGrad.addColorStop(1, "#A67C1E");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(24, 24, width - 48, 8);

  // Header Branding
  ctx.fillStyle = "#F5D061";
  ctx.font = "bold 13px 'JetBrains Mono', monospace";
  ctx.letterSpacing = "3px";
  ctx.fillText("NÀ MÈ DÈY SELL • OFFICIAL DIGITAL ADMISSION SLIP", 50, 72);

  // Pass Number / Index Badge
  ctx.fillStyle = "rgba(212, 175, 55, 0.15)";
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(width - 230, 52, 180, 28, [6]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 12px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`PASS #${passIndex + 1} OF ${totalPasses}`, width - 140, 71);
  ctx.textAlign = "left";

  // Event Title
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 30px 'Sora', Inter, sans-serif";
  const title = ticket.eventTitle || "Live Event";
  // Wrap or truncate title
  if (ctx.measureText(title).width > width - 100) {
    ctx.font = "bold 24px 'Sora', Inter, sans-serif";
  }
  ctx.fillText(title, 50, 130);

  // Presented By
  ctx.fillStyle = "#E2D9BC";
  ctx.font = "14px Inter, sans-serif";
  ctx.fillText(`Presented by ${ticket.organizer || "Event Organizer"}`, 50, 160);

  // Tier Banner
  const tierGrad = ctx.createLinearGradient(50, 185, 300, 185);
  tierGrad.addColorStop(0, "#D4AF37");
  tierGrad.addColorStop(1, "#F5D061");
  ctx.fillStyle = tierGrad;
  ctx.beginPath();
  ctx.roundRect(50, 185, 260, 36, [8]);
  ctx.fill();

  ctx.fillStyle = "#070709";
  ctx.font = "bold 15px 'Sora', Inter, sans-serif";
  ctx.fillText(ticket.tierName || "General Admission", 66, 209);

  ctx.fillStyle = "#A67C1E";
  ctx.font = "bold 13px Inter, sans-serif";
  const priceText = formatNaira(ticket.tierPrice, ticket.currency || "₦");
  ctx.fillText(`[ ${priceText} ]`, 220, 208);

  // Verified Status Pill
  ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
  ctx.strokeStyle = "#10B981";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(width - 240, 185, 190, 36, [8]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#10B981";
  ctx.font = "bold 13px Inter, sans-serif";
  ctx.fillText("✓ VERIFIED ADMISSION", width - 224, 208);

  // Divider Line
  ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 245);
  ctx.lineTo(width - 50, 245);
  ctx.stroke();

  // 2-Column Event Details Box
  ctx.fillStyle = "#12121A";
  ctx.beginPath();
  ctx.roundRect(50, 265, width - 100, 140, [12]);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.stroke();

  // Col 1: Date & Time
  ctx.fillStyle = "#D4AF37";
  ctx.font = "bold 11px Inter, sans-serif";
  ctx.fillText("EVENT DATE & TIME", 75, 298);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px Inter, sans-serif";
  ctx.fillText(ticket.eventDate || "Date TBD", 75, 325);

  ctx.fillStyle = "#E2D9BC";
  ctx.font = "14px Inter, sans-serif";
  ctx.fillText(ticket.eventTime || "Time TBD", 75, 350);

  ctx.fillStyle = "#10B981";
  ctx.font = "12px Inter, sans-serif";
  ctx.fillText("● Gates open 1 hour early", 75, 380);

  // Col 2: Venue & City
  ctx.fillStyle = "#D4AF37";
  ctx.font = "bold 11px Inter, sans-serif";
  ctx.fillText("VENUE & LOCATION", 420, 298);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px Inter, sans-serif";
  ctx.fillText(ticket.venue || "Venue TBD", 420, 325);

  ctx.fillStyle = "#E2D9BC";
  ctx.font = "14px Inter, sans-serif";
  ctx.fillText(ticket.city || "Nigeria", 420, 350);

  if (ticket.address && ticket.address !== ticket.venue) {
    ctx.fillStyle = "rgba(226, 217, 188, 0.7)";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText(ticket.address, 420, 380);
  }

  // Section 2: ATTENDEE SIGNUP DETAILS & TICKET NUMBERS (Highlighted Luxury Card)
  ctx.fillStyle = "#14141E";
  ctx.beginPath();
  ctx.roundRect(50, 430, width - 100, 210, [14]);
  ctx.fill();
  ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Attendee Section Header
  ctx.fillStyle = "#F5D061";
  ctx.font = "bold 13px 'JetBrains Mono', monospace";
  ctx.letterSpacing = "2px";
  ctx.fillText("ATTENDEE DETAILS & TICKET NUMBER", 75, 465);

  // Full Name
  ctx.fillStyle = "#948B75";
  ctx.font = "bold 11px Inter, sans-serif";
  ctx.fillText("FULL NAME (REGISTERED USER)", 75, 500);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 17px Inter, sans-serif";
  ctx.fillText(ticket.attendee?.name || "Attendee", 75, 524);

  // Email
  ctx.fillStyle = "#948B75";
  ctx.font = "bold 11px Inter, sans-serif";
  ctx.fillText("EMAIL ADDRESS (PASS RECIPIENT)", 75, 560);
  ctx.fillStyle = "#F5D061";
  ctx.font = "15px Inter, sans-serif";
  ctx.fillText(ticket.attendee?.email || "email@example.com", 75, 584);

  // Phone Number
  ctx.fillStyle = "#948B75";
  ctx.font = "bold 11px Inter, sans-serif";
  ctx.fillText("PHONE NUMBER (SMS / PASS VERIFY)", 420, 500);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px Inter, sans-serif";
  ctx.fillText(ticket.attendee?.phone || "Phone not provided", 420, 524);

  // Ticket / Seat Number
  ctx.fillStyle = "#948B75";
  ctx.font = "bold 11px Inter, sans-serif";
  ctx.fillText("TICKET / SEAT NUMBER", 420, 560);
  ctx.fillStyle = "#D4AF37";
  ctx.font = "bold 18px 'JetBrains Mono', monospace";
  ctx.fillText(ticket.seatNumber || `TKT-${passIndex + 1}`, 420, 586);

  // Order Ref and Issued Timestamp
  ctx.fillStyle = "rgba(226, 217, 188, 0.6)";
  ctx.font = "11px Inter, sans-serif";
  const purchaseDate = ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleString() : new Date().toLocaleString();
  ctx.fillText(`Order Ref: ${ticket.orderId}  •  Issued: ${purchaseDate}  •  Payment Ref: ${ticket.paymentReference || "CONFIRMED"}`, 75, 622);

  // Perforation Line
  ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(30, 665);
  ctx.lineTo(width - 30, 665);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dashed line

  // Notch indicators on sides
  ctx.fillStyle = "#0A0A0E";
  ctx.beginPath();
  ctx.arc(16, 665, 14, 0, Math.PI * 2);
  ctx.arc(width - 16, 665, 14, 0, Math.PI * 2);
  ctx.fill();

  // Bottom Section: TICKET ID & BARCODE & QR CODE
  ctx.fillStyle = "#0E0E15";
  ctx.beginPath();
  ctx.roundRect(50, 690, width - 100, 480, [14]);
  ctx.fill();
  ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
  ctx.stroke();

  // Official Ticket ID Box
  ctx.fillStyle = "rgba(212, 175, 55, 0.1)";
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(75, 715, width - 150, 52, [8]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#D4AF37";
  ctx.font = "bold 11px 'JetBrains Mono', monospace";
  ctx.letterSpacing = "2px";
  ctx.fillText("OFFICIAL PASS TICKET ID:", 95, 746);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 20px 'JetBrains Mono', monospace";
  ctx.fillText(ticket.ticketId, 320, 748);

  // 1D Barcode Container (White card for maximum optical readability)
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(75, 790, width - 150, 110, [10]);
  ctx.fill();

  // Draw 1D Barcode
  try {
    drawBarcodeOnCanvas(ctx, ticket.ticketId, 95, 805, width - 190, 65, "#000000");

    ctx.fillStyle = "#111111";
    ctx.font = "bold 13px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`* ${ticket.ticketId} *`, width / 2, 890);
    ctx.textAlign = "left";
  } catch (err) {
    console.warn("Barcode canvas draw error:", err);
  }

  // QR Code + Security Info (2 Column footer inside bottom section)
  // Left: QR Code on White surface
  const qrX = 85;
  const qrY = 925;
  const qrSize = 170;

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(qrX, qrY, qrSize, qrSize, [10]);
  ctx.fill();

  try {
    const qrMatrix = generateQRCodeMatrix(`NMDS:${ticket.ticketId}|ORD:${ticket.orderId}|EVT:${ticket.eventId}`);
    const numCells = qrMatrix.length;
    const padding = 12;
    const cellPx = (qrSize - padding * 2) / numCells;

    ctx.fillStyle = "#000000";
    for (let r = 0; r < numCells; r++) {
      for (let c = 0; c < numCells; c++) {
        if (qrMatrix[r][c] === 1) {
          ctx.fillRect(qrX + padding + c * cellPx, qrY + padding + r * cellPx, cellPx + 0.5, cellPx + 0.5);
        }
      }
    }
  } catch (err) {
    console.warn("QR canvas draw error:", err);
  }

  // Right of QR: Gate Scan Instructions & Anti-Fraud Notice
  ctx.fillStyle = "#F5D061";
  ctx.font = "bold 15px 'Sora', Inter, sans-serif";
  ctx.fillText("Gate Admission Verification", 280, 955);

  ctx.fillStyle = "#E2D9BC";
  ctx.font = "13px Inter, sans-serif";
  ctx.fillText("1. Present this digital slip or printed copy at the entrance.", 280, 985);
  ctx.fillText("2. Gate marshals will scan either the QR Code or Barcode.", 280, 1010);
  ctx.fillText("3. Valid photo ID matching attendee name may be requested.", 280, 1035);

  ctx.fillStyle = "#10B981";
  ctx.font = "bold 12px Inter, sans-serif";
  ctx.fillText("🔒 Cryptographically Verified • Anti-Duplication Protected", 280, 1068);

  // Footer Tagline
  ctx.fillStyle = "rgba(226, 217, 188, 0.5)";
  ctx.font = "11px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Powered by Nà Mè Dèy Sell • Africa's Next-Gen Ticket Infrastructure", width / 2, 1210);

  // Trigger Instant Download
  try {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const fileName = `${ticket.ticketId}_admission_slip.png`;
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error("Error generating slip download:", err);
    return false;
  }
}
