import { PAYMENT_METHODS } from "@/content/payment";

export interface ReceiptPayload {
  referenceId: string;
  issuedAt: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  activityTitle: string;
  activityCategory: string;
  activityDate: string;
  activitySchedule: string;
  activityCity: string;
  isSecured: boolean;
  feeLabel?: string;
  paymentMethodName?: string;
  transactionRef?: string;
  screenshotName?: string;
  screenshotPreviewUrl?: string | null;
}

const OFFICIAL_UBL = PAYMENT_METHODS[0];
const SAFE_UBL_LOGO_SRC = "/Social%20Icons/UBL-Bank-Logo.png";
const SAFE_UBL_QR_SRC = "/Social%20Icons/UBL%20QR%27.jpeg";

/**
 * Normalizes any raw submission or reference ID into a clean, compact,
 * executive booking reference code (e.g., "TLC-26-R60MP").
 */
export function formatBookingReference(rawRef: string): string {
  const trimmed = (rawRef || "").trim().replace(/^#/, "");
  if (/^TLC-\d{2}-[A-Z0-9]{4,6}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const clean = trimmed
    .replace(/^(sub_|TLC[-_]?)/i, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  const suffix = clean.slice(-5) || clean.slice(0, 5) || "10482";
  return `TLC-26-${suffix.padStart(4, "0")}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (maxWidth <= 0) return "";
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (
    trimmed.length > 0 &&
    ctx.measureText(trimmed + "…").width > maxWidth
  ) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed + "…";
}

/**
 * Safely loads an image asset for canvas rendering.
 */
function loadCanvasImage(src: string): Promise<HTMLImageElement | null> {
  if (typeof window === "undefined" || typeof Image === "undefined") {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawContainedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  padding = 0
) {
  const availW = boxW - padding * 2;
  const availH = boxH - padding * 2;
  const natW = img.naturalWidth || availW;
  const natH = img.naturalHeight || availH;
  const ratio = Math.min(availW / natW, availH / natH);
  const drawW = natW * ratio;
  const drawH = natH * ratio;
  const drawX = boxX + (boxW - drawW) / 2;
  const drawY = boxY + (boxH - drawH) / 2;
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

/**
 * Generates a high-DPI (2x Retina) official website-themed PNG receipt Blob
 * containing all complete participant, activity, schedule, and booking details,
 * plus official UBL bank details & scannable QR code on reservation receipts.
 */
export async function generateReceiptPngBlob(
  data: ReceiptPayload
): Promise<Blob> {
  const width = 1080;
  // Give reservation receipts extra height to house the UBL Bank + QR payment voucher cleanly
  const height = data.isSecured ? 780 : 868;
  const dpr = 2;

  const [logoImg, ublLogoImg, ublQrImg] = await Promise.all([
    loadCanvasImage("/Logo_For_Navbar_Fotter.png"),
    loadCanvasImage(SAFE_UBL_LOGO_SRC),
    data.isSecured ? Promise.resolve(null) : loadCanvasImage(SAFE_UBL_QR_SRC),
  ]);

  const formattedRef = formatBookingReference(data.referenceId);
  const refDisplay = `#${formattedRef}`;

  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  ctx.scale(dpr, dpr);

  // 1. Website-Themed Soft Mint -> Icy Blue Outer Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#EFFBF8");
  bgGrad.addColorStop(0.55, "#F4FCFA");
  bgGrad.addColorStop(1, "#DDEFF7");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const topGlow = ctx.createRadialGradient(120, 80, 10, 120, 80, 260);
  topGlow.addColorStop(0, "rgba(215, 245, 239, 0.85)");
  topGlow.addColorStop(1, "rgba(215, 245, 239, 0)");
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, 420, 360);

  const bottomGlow = ctx.createRadialGradient(
    width - 120,
    height - 80,
    10,
    width - 120,
    height - 80,
    260
  );
  bottomGlow.addColorStop(0, "rgba(255, 196, 0, 0.14)");
  bottomGlow.addColorStop(1, "rgba(255, 196, 0, 0)");
  ctx.fillStyle = bottomGlow;
  ctx.fillRect(width - 420, height - 360, 420, 360);

  // 2. Main Receipt Card Container
  const cardX = 36;
  const cardY = 32;
  const cardW = width - 72; // 1008
  const cardH = height - 64; // 716 (secured) or 804 (reservation)

  ctx.save();
  ctx.shadowColor = "rgba(16, 46, 77, 0.14)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 24);
  ctx.fill();
  ctx.restore();

  // Clip inside rounded card
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 24);
  ctx.clip();

  // 3. Executive Midnight Navy Header (y = 32..176, h = 144)
  const headerH = 144;
  const headerGrad = ctx.createLinearGradient(
    cardX,
    cardY,
    cardX + cardW,
    cardY + headerH
  );
  headerGrad.addColorStop(0, "#001B33");
  headerGrad.addColorStop(0.55, "#102E4D");
  headerGrad.addColorStop(1, "#001B33");
  ctx.fillStyle = headerGrad;
  ctx.fillRect(cardX, cardY, cardW, headerH);

  const headerGlow = ctx.createRadialGradient(
    cardX + cardW - 140,
    cardY + 72,
    10,
    cardX + cardW - 140,
    cardY + 72,
    240
  );
  headerGlow.addColorStop(0, "rgba(255, 196, 0, 0.14)");
  headerGlow.addColorStop(1, "rgba(255, 196, 0, 0)");
  ctx.fillStyle = headerGlow;
  ctx.fillRect(cardX + cardW - 400, cardY, 400, headerH);

  // Top 7px Website Signature Colorful Bar
  const topBarGrad = ctx.createLinearGradient(
    cardX,
    cardY,
    cardX + cardW,
    cardY
  );
  topBarGrad.addColorStop(0, "#FFC400");
  topBarGrad.addColorStop(0.45, "#FF7900");
  topBarGrad.addColorStop(0.8, "#10B981");
  topBarGrad.addColorStop(1, "#FFC400");
  ctx.fillStyle = topBarGrad;
  ctx.fillRect(cardX, cardY, cardW, 7);

  // Dynamically measure Reference Badge so text NEVER overflows or goes outside
  const refLabelText = "BOOKING REFERENCE";
  ctx.font = "700 10px Inter, system-ui, sans-serif";
  const refLabelW = ctx.measureText(refLabelText).width;

  ctx.font = "800 20px Inter, system-ui, sans-serif";
  const refCodeW = ctx.measureText(refDisplay).width;

  const refBoxW = Math.min(
    290,
    Math.max(208, Math.ceil(Math.max(refLabelW, refCodeW)) + 44)
  );
  const refBoxH = 76;
  const refBoxX = cardX + cardW - 36 - refBoxW;
  const refBoxY = cardY + 38;

  ctx.fillStyle = "rgba(255, 196, 0, 0.09)";
  ctx.strokeStyle = "rgba(255, 196, 0, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(refBoxX, refBoxY, refBoxW, refBoxH, 16);
  ctx.fill();
  ctx.stroke();

  const refCenterX = refBoxX + refBoxW / 2;
  ctx.textAlign = "center";
  ctx.fillStyle = "#D7F5EF";
  ctx.font = "700 10px Inter, system-ui, sans-serif";
  ctx.fillText(refLabelText, refCenterX, refBoxY + 27);

  ctx.fillStyle = "#FFC400";
  ctx.font = "800 20px Inter, system-ui, sans-serif";
  ctx.fillText(
    truncateText(ctx, refDisplay, refBoxW - 24),
    refCenterX,
    refBoxY + 55
  );
  ctx.textAlign = "left";

  // Crisp Pure White Rounded Emblem Container for Official Logo
  const logoBoxX = cardX + 36;
  const logoBoxY = cardY + 38;
  const logoBoxSize = 76;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, 16);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(255, 196, 0, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, 16);
  ctx.stroke();

  if (logoImg) {
    drawContainedImage(ctx, logoImg, logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, 6);
  }

  // Brand Title & Eyebrow beside Logo
  const textX = logoBoxX + logoBoxSize + 20;
  const maxHeaderTextW = refBoxX - textX - 24;

  ctx.fillStyle = "#FFC400";
  ctx.font = "800 11px Inter, system-ui, sans-serif";
  ctx.fillText(
    truncateText(
      ctx,
      "FRANKLINCOVEY EDUCATION  •  NORTH REGION PARTNER",
      maxHeaderTextW
    ),
    textX,
    cardY + 56
  );

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 26px Georgia, serif";
  ctx.fillText(
    truncateText(ctx, "The Leadership Covenant", maxHeaderTextW),
    textX,
    cardY + 87
  );

  ctx.fillStyle = "#D7F5EF";
  ctx.font = "500 13px Inter, system-ui, sans-serif";
  ctx.fillText(
    truncateText(
      ctx,
      data.isSecured
        ? "Official Activity Registration & Booking Receipt"
        : "Official Provisional Reservation & Payment Voucher",
      maxHeaderTextW
    ),
    textX,
    cardY + 113
  );

  // 4. Status & Issued Metadata Strip (y = 176..226, h = 50)
  const bannerY = cardY + headerH;
  const bannerH = 50;
  const bannerGrad = ctx.createLinearGradient(
    cardX,
    bannerY,
    cardX + cardW,
    bannerY
  );
  bannerGrad.addColorStop(0, "#EFFBF8");
  bannerGrad.addColorStop(0.5, "#E8F8F3");
  bannerGrad.addColorStop(1, "#DDEFF7");
  ctx.fillStyle = bannerGrad;
  ctx.fillRect(cardX, bannerY, cardW, bannerH);

  ctx.strokeStyle = "#C8EFE6";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX, bannerY + bannerH);
  ctx.lineTo(cardX + cardW, bannerY + bannerH);
  ctx.stroke();

  const statusLabel = data.isSecured
    ? "PRIORITY SEAT CONFIRMED  •  UBL BANK TRANSFER"
    : "PROVISIONAL RESERVATION CONFIRMED  •  PAY LATER";
  ctx.font = "800 11.5px Inter, system-ui, sans-serif";
  const statusLabelW = ctx.measureText(statusLabel).width;
  const pillX = cardX + 36;
  const pillY = bannerY + 11;
  const pillW = 30 + statusLabelW + 16;
  const pillH = 28;

  ctx.fillStyle = "#DCFCE7";
  ctx.strokeStyle = "#86EFAC";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#16A34A";
  ctx.beginPath();
  ctx.arc(pillX + 15, pillY + pillH / 2, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#15803D";
  ctx.font = "800 11.5px Inter, system-ui, sans-serif";
  ctx.fillText(statusLabel, pillX + 27, pillY + 18.5);

  ctx.fillStyle = "#102E4D";
  ctx.font = "600 12px Inter, system-ui, sans-serif";
  const issuedStr = `Issued On: ${data.issuedAt}`;
  const issuedW = ctx.measureText(issuedStr).width;
  ctx.fillText(issuedStr, cardX + cardW - 36 - issuedW, bannerY + 29.5);

  // 5. Two Website-Themed Detail Cards (2 Columns)
  const gridY = bannerY + bannerH + 20;
  const gridH = 290;
  const boxGap = 24;
  const boxW = (cardW - 72 - boxGap) / 2; // 456
  const col1BoxX = cardX + 36;
  const col2BoxX = col1BoxX + boxW + boxGap;

  const drawSectionCard = (
    boxX: number,
    title: string,
    accentColor: string,
    headerBg: string,
    cardBg: string,
    borderColor: string,
    dividerColor: string,
    rows: Array<{ label: string; value: string }>
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(boxX, gridY, boxW, gridH, 16);
    ctx.fillStyle = cardBg;
    ctx.fill();
    ctx.clip();

    const subHeaderH = 38;
    ctx.fillStyle = headerBg;
    ctx.fillRect(boxX, gridY, boxW, subHeaderH);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX, gridY + subHeaderH);
    ctx.lineTo(boxX + boxW, gridY + subHeaderH);
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.roundRect(boxX + 18, gridY + 11, 4, 16, 2);
    ctx.fill();

    ctx.fillStyle = "#102E4D";
    ctx.font = "800 11px Inter, system-ui, sans-serif";
    ctx.fillText(title, boxX + 30, gridY + 23.5);

    const innerX = boxX + 20;
    const innerMaxW = boxW - 40;
    const firstRowY = gridY + subHeaderH + 20;
    const rowStep = 60;

    rows.forEach((row, idx) => {
      const y = firstRowY + idx * rowStep;
      ctx.fillStyle = "#64748B";
      ctx.font = "700 10px Inter, system-ui, sans-serif";
      ctx.fillText(row.label.toUpperCase(), innerX, y);

      ctx.fillStyle = "#102E4D";
      ctx.font = "700 14.5px Inter, system-ui, sans-serif";
      ctx.fillText(
        truncateText(ctx, row.value || "—", innerMaxW),
        innerX,
        y + 21
      );

      if (idx < rows.length - 1) {
        ctx.strokeStyle = dividerColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(innerX, y + 35);
        ctx.lineTo(boxX + boxW - 20, y + 35);
        ctx.stroke();
      }
    });

    ctx.restore();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX, gridY, boxW, gridH, 16);
    ctx.stroke();
  };

  drawSectionCard(
    col1BoxX,
    "PARTICIPANT INFORMATION",
    "#102E4D",
    "#EFFBF8",
    "#FAFEFD",
    "#C8EFE6",
    "#E6F6F2",
    [
      { label: "Participant Full Name", value: data.fullName },
      { label: "Role / Designation", value: data.role },
      { label: "Email Address", value: data.email },
      { label: "Phone / WhatsApp", value: data.phone },
    ]
  );

  drawSectionCard(
    col2BoxX,
    "ACTIVITY & SCHEDULE DETAILS",
    "#FF7900",
    "#EDF6FB",
    "#FAFCFE",
    "#CFE6F3",
    "#E6F0F7",
    [
      { label: "Selected Activity", value: data.activityTitle },
      { label: "Program Category", value: data.activityCategory },
      {
        label: "Event Date & Schedule",
        value: `${data.activityDate}  •  ${data.activitySchedule}`,
      },
      { label: "Location / Venue", value: data.activityCity },
    ]
  );

  // 6. Bottom Section:
  // - If Secured: 3-column Payment & Verification Summary Card
  // - If Reservation (!data.isSecured): Official UBL Bank Details + Scannable QR Code Voucher
  if (data.isSecured) {
    const sumX = cardX + 36;
    const sumY = gridY + gridH + 18;
    const sumW = cardW - 72; // 936
    const sumH = 114;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(sumX, sumY, sumW, sumH, 16);
    const sumGrad = ctx.createLinearGradient(sumX, sumY, sumX + sumW, sumY);
    sumGrad.addColorStop(0, "#ECFDF5");
    sumGrad.addColorStop(0.55, "#EFFBF8");
    sumGrad.addColorStop(1, "#EDF6FB");
    ctx.fillStyle = sumGrad;
    ctx.fill();
    ctx.clip();

    ctx.fillStyle = "#16A34A";
    ctx.fillRect(sumX, sumY, 6, sumH);

    const sumColW = (sumW - 12) / 3;
    const drawSummaryCol = (
      colIndex: number,
      eyebrow: string,
      headline: string,
      subline: string,
      headlineColor = "#102E4D"
    ) => {
      const cx = sumX + 24 + colIndex * sumColW;
      const maxW = sumColW - 36;

      ctx.fillStyle = "#64748B";
      ctx.font = "800 10px Inter, system-ui, sans-serif";
      ctx.fillText(eyebrow.toUpperCase(), cx, sumY + 30);

      ctx.fillStyle = headlineColor;
      ctx.font = "800 14.5px Inter, system-ui, sans-serif";
      ctx.fillText(truncateText(ctx, headline, maxW), cx, sumY + 55);

      ctx.fillStyle = "#475569";
      ctx.font = "600 12px Inter, system-ui, sans-serif";
      ctx.fillText(truncateText(ctx, subline, maxW), cx, sumY + 79);

      if (colIndex > 0) {
        ctx.strokeStyle = "#CFEAE2";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sumX + 6 + colIndex * sumColW, sumY + 20);
        ctx.lineTo(sumX + 6 + colIndex * sumColW, sumY + sumH - 20);
        ctx.stroke();
      }
    };

    drawSummaryCol(
      0,
      "Booking Option & Fee",
      "Priority Seat Secured",
      data.feeLabel || "Paid via Official UBL Bank Transfer",
      "#15803D"
    );

    drawSummaryCol(
      1,
      "Payment & Verification",
      data.transactionRef
        ? `TID: ${data.transactionRef}`
        : "Payment Screenshot Attached ✓",
      data.screenshotName || "Official UBL Account Transfer"
    );

    drawSummaryCol(
      2,
      "Next Step & Joining Pass",
      "Joining Pass & Kit Dispatch",
      "Sent once bank transfer is verified"
    );

    ctx.restore();

    ctx.strokeStyle = "#A7F3D0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(sumX, sumY, sumW, sumH, 16);
    ctx.stroke();
  } else {
    // OFFICIAL UBL BANK DETAILS + SCANNABLE QR CODE VOUCHER FOR RESERVATION RECEIPTS
    const payX = cardX + 36;
    const payY = gridY + gridH + 18; // 554
    const payW = cardW - 72; // 936
    const payH = 204; // ends at 758

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(payX, payY, payW, payH, 18);
    const payGrad = ctx.createLinearGradient(payX, payY, payX + payW, payY);
    payGrad.addColorStop(0, "#F2F9FD");
    payGrad.addColorStop(0.55, "#EFFBF8");
    payGrad.addColorStop(1, "#FFFDF5");
    ctx.fillStyle = payGrad;
    ctx.fill();
    ctx.clip();

    // Payment Card Header Bar
    const payHeadH = 38;
    const payHeadGrad = ctx.createLinearGradient(payX, payY, payX + payW, payY);
    payHeadGrad.addColorStop(0, "#E4F1FA");
    payHeadGrad.addColorStop(1, "#E6F7F2");
    ctx.fillStyle = payHeadGrad;
    ctx.fillRect(payX, payY, payW, payHeadH);

    ctx.strokeStyle = "#B8DDF0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(payX, payY + payHeadH);
    ctx.lineTo(payX + payW, payY + payHeadH);
    ctx.stroke();

    // Accent bar + header title
    ctx.fillStyle = "#005696";
    ctx.beginPath();
    ctx.roundRect(payX + 18, payY + 11, 4, 16, 2);
    ctx.fill();

    ctx.fillStyle = "#102E4D";
    ctx.font = "800 11px Inter, system-ui, sans-serif";
    ctx.fillText(
      "OFFICIAL PAYMENT DETAILS  •  UBL BANK TRANSFER & SCAN TO PAY",
      payX + 30,
      payY + 23.5
    );

    const feeRightText = data.feeLabel
      ? `Payable Fee: ${data.feeLabel}`
      : "IBFT  •  Raast  •  Mobile Banking";
    ctx.fillStyle = "#FF7900";
    ctx.font = "800 11.5px Inter, system-ui, sans-serif";
    const feeRightW = ctx.measureText(feeRightText).width;
    ctx.fillText(feeRightText, payX + payW - 20 - feeRightW, payY + 23.5);

    // Right QR Panel Container inside Payment Card
    const qrPanelW = 176;
    const qrPanelX = payX + payW - qrPanelW;
    const bodyY = payY + payHeadH;
    const bodyH = payH - payHeadH; // 166

    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.fillRect(qrPanelX, bodyY, qrPanelW, bodyH);

    ctx.strokeStyle = "#C5E3F2";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(qrPanelX, bodyY);
    ctx.lineTo(qrPanelX, payY + payH);
    ctx.stroke();

    // QR Code Frame + Image
    const qrBoxSize = 118;
    const qrBoxX = qrPanelX + (qrPanelW - qrBoxSize) / 2;
    const qrBoxY = bodyY + 14;

    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#005696";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 12);
    ctx.fill();
    ctx.stroke();

    if (ublQrImg) {
      const prevSmooth = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      drawContainedImage(ctx, ublQrImg, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 6);
      ctx.imageSmoothingEnabled = prevSmooth;
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#005696";
    ctx.font = "800 10px Inter, system-ui, sans-serif";
    ctx.fillText(
      "SCAN TO PAY (UBL QR)",
      qrPanelX + qrPanelW / 2,
      qrBoxY + qrBoxSize + 19
    );
    ctx.textAlign = "left";

    // Left UBL Logo Badge inside Payment Card Body
    const ublBadgeSize = 68;
    const ublBadgeX = payX + 22;
    const ublBadgeY = bodyY + 20;

    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "rgba(0, 86, 150, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(ublBadgeX, ublBadgeY, ublBadgeSize, ublBadgeSize, 14);
    ctx.fill();
    ctx.stroke();

    if (ublLogoImg) {
      drawContainedImage(
        ctx,
        ublLogoImg,
        ublBadgeX,
        ublBadgeY,
        ublBadgeSize,
        ublBadgeSize,
        6
      );
    }

    // Mini UBL tag below logo badge
    const ublPillY = ublBadgeY + ublBadgeSize + 10;
    ctx.fillStyle = "#E0F2FE";
    ctx.beginPath();
    ctx.roundRect(ublBadgeX, ublPillY, ublBadgeSize, 22, 11);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = "#005696";
    ctx.font = "800 9.5px Inter, system-ui, sans-serif";
    ctx.fillText("UBL BANK", ublBadgeX + ublBadgeSize / 2, ublPillY + 14.5);
    ctx.textAlign = "left";

    // Center Bank Account Details (Bank Name, Account Title, Highlighted IBAN, WhatsApp note)
    const infoX = ublBadgeX + ublBadgeSize + 20; // payX + 110
    const infoMaxW = qrPanelX - infoX - 22; // ~628px

    // Row 1: Bank Name & Account Title side by side
    ctx.fillStyle = "#64748B";
    ctx.font = "700 9.5px Inter, system-ui, sans-serif";
    ctx.fillText("BANK NAME", infoX, bodyY + 24);

    ctx.fillStyle = "#102E4D";
    ctx.font = "800 14px Inter, system-ui, sans-serif";
    ctx.fillText(OFFICIAL_UBL.bankName, infoX, bodyY + 43);

    const titleColX = infoX + 236;
    ctx.fillStyle = "#64748B";
    ctx.font = "700 9.5px Inter, system-ui, sans-serif";
    ctx.fillText("ACCOUNT TITLE", titleColX, bodyY + 24);

    ctx.fillStyle = "#102E4D";
    ctx.font = "800 14px Inter, system-ui, sans-serif";
    ctx.fillText(
      truncateText(ctx, OFFICIAL_UBL.accountTitle, qrPanelX - titleColX - 20),
      titleColX,
      bodyY + 43
    );

    // Row 2: Highlighted Official IBAN Pill Box
    const ibanBoxY = bodyY + 56;
    const ibanBoxH = 54;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#93C5FD";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(infoX, ibanBoxY, infoMaxW, ibanBoxH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#005696";
    ctx.font = "800 9.5px Inter, system-ui, sans-serif";
    ctx.fillText(
      "OFFICIAL IBAN  (24/7 IBFT  •  RAAST  •  ALL BANKS & WALLETS)",
      infoX + 14,
      ibanBoxY + 19
    );

    ctx.fillStyle = "#001B33";
    ctx.font = "800 16px Inter, system-ui, sans-serif";
    ctx.fillText(OFFICIAL_UBL.iban, infoX + 14, ibanBoxY + 41);

    // Row 3: Verification instruction
    ctx.fillStyle = "#475569";
    ctx.font = "600 11.5px Inter, system-ui, sans-serif";
    ctx.fillText(
      truncateText(
        ctx,
        `Share transfer screenshot on WhatsApp (+92 319 209 1249) quoting Ref #${formattedRef} to receive your joining pass.`,
        infoMaxW
      ),
      infoX,
      bodyY + 136
    );

    ctx.restore();

    ctx.strokeStyle = "#B8DDF0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(payX, payY, payW, payH, 18);
    ctx.stroke();
  }

  // 7. Bottom Institutional Footer Bar
  const footerH = 56;
  const footerY = cardY + cardH - footerH;
  const footerGrad = ctx.createLinearGradient(
    cardX,
    footerY,
    cardX + cardW,
    footerY
  );
  footerGrad.addColorStop(0, "#EFFBF8");
  footerGrad.addColorStop(1, "#E7F6F2");
  ctx.fillStyle = footerGrad;
  ctx.fillRect(cardX, footerY, cardW, footerH);

  ctx.strokeStyle = "#C8EFE6";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX, footerY);
  ctx.lineTo(cardX + cardW, footerY);
  ctx.stroke();

  ctx.fillStyle = "#102E4D";
  ctx.font = "700 12px Inter, system-ui, sans-serif";
  ctx.fillText(
    "The Leadership Covenant  •  WhatsApp / Tel: +92 319 209 1249  •  Islamabad, Pakistan",
    cardX + 36,
    footerY + 32.5
  );

  const badgeText = "VERIFIED E-RECEIPT";
  ctx.font = "800 10.5px Inter, system-ui, sans-serif";
  const badgeTextW = ctx.measureText(badgeText).width;
  const vBadgeW = 28 + badgeTextW + 14;
  const vBadgeH = 28;
  const vBadgeX = cardX + cardW - 36 - vBadgeW;
  const vBadgeY = footerY + (footerH - vBadgeH) / 2;

  ctx.fillStyle = "#001B33";
  ctx.beginPath();
  ctx.roundRect(vBadgeX, vBadgeY, vBadgeW, vBadgeH, 14);
  ctx.fill();

  ctx.fillStyle = "#FFC400";
  ctx.beginPath();
  ctx.arc(vBadgeX + 14, vBadgeY + vBadgeH / 2, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFC400";
  ctx.font = "800 10.5px Inter, system-ui, sans-serif";
  ctx.fillText(badgeText, vBadgeX + 24, vBadgeY + 18);

  // Outer Card Border
  ctx.restore();
  ctx.strokeStyle = "#BCE8DF";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 24);
  ctx.stroke();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to encode receipt image"));
    }, "image/png");
  });
}

/**
 * Triggers an immediate PNG download of the official receipt.
 */
export async function downloadOfficialReceipt(
  data: ReceiptPayload
): Promise<void> {
  const formattedRef = formatBookingReference(data.referenceId);
  const blob = await generateReceiptPngBlob({
    ...data,
    referenceId: formattedRef,
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `TLC-Receipt-${formattedRef}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 3000);
}

/**
 * Opens a clean, website-themed print-ready voucher window with all complete details,
 * including UBL Bank Details + Scannable QR Code on provisional reservation receipts.
 */
export function printOfficialReceipt(data: ReceiptPayload): void {
  const printWin = window.open("", "_blank", "width=940,height=900");
  if (!printWin) return;

  const formattedRef = formatBookingReference(data.referenceId);
  const statusText = data.isSecured
    ? "PRIORITY SEAT CONFIRMED • UBL BANK TRANSFER"
    : "PROVISIONAL RESERVATION CONFIRMED • PAY LATER";

  const feeSummary =
    data.feeLabel ||
    (data.isSecured
      ? "Paid via Official UBL Bank Transfer"
      : "IBFT • Raast • Mobile Banking");

  const proofSummary = data.isSecured
    ? data.transactionRef
      ? `TID: ${escapeHtml(data.transactionRef)}${
          data.screenshotName ? ` (${escapeHtml(data.screenshotName)})` : ""
        }`
      : escapeHtml(data.screenshotName || "Payment Screenshot Attached ✓")
    : "Pay Later • Official UBL Bank / QR Supported";

  const bottomPaymentHtml = data.isSecured
    ? `
      <div class="summary-strip">
        <div class="sum-col">
          <div class="sum-eyebrow">Booking Option &amp; Fee</div>
          <div class="sum-head" style="color:#15803D;">Priority Seat Secured</div>
          <div class="sum-sub">${escapeHtml(feeSummary)}</div>
        </div>
        <div class="sum-col">
          <div class="sum-eyebrow">Payment &amp; Verification</div>
          <div class="sum-head">Proof Submitted</div>
          <div class="sum-sub">${proofSummary}</div>
        </div>
        <div class="sum-col">
          <div class="sum-eyebrow">Next Step</div>
          <div class="sum-head">Joining Pass &amp; Kit</div>
          <div class="sum-sub">Dispatched once transfer is verified</div>
        </div>
      </div>
      ${
        data.screenshotPreviewUrl
          ? `<div class="proof-box">
              <div class="proof-title">Attached Payment Screenshot Proof</div>
              <img src="${escapeHtml(data.screenshotPreviewUrl)}" alt="Payment Proof" />
            </div>`
          : ""
      }`
    : `
      <div class="ubl-voucher">
        <div class="ubl-voucher-head">
          <span class="ubl-head-left"><span class="ubl-bar"></span> Official Payment Details • UBL Bank Transfer &amp; Scan to Pay</span>
          <span class="ubl-head-fee">${
            data.feeLabel
              ? `Payable Fee: ${escapeHtml(data.feeLabel)}`
              : "IBFT • Raast • Mobile Banking"
          }</span>
        </div>
        <div class="ubl-voucher-body">
          <div class="ubl-brand-col">
            <div class="ubl-logo-box">
              <img src="${SAFE_UBL_LOGO_SRC}" alt="United Bank Limited" />
            </div>
            <span class="ubl-tag">UBL BANK</span>
          </div>
          <div class="ubl-details-col">
            <div class="ubl-meta-grid">
              <div>
                <div class="field-label">Bank Name</div>
                <div class="field-val">${escapeHtml(OFFICIAL_UBL.bankName)}</div>
              </div>
              <div>
                <div class="field-label">Account Title</div>
                <div class="field-val">${escapeHtml(OFFICIAL_UBL.accountTitle)}</div>
              </div>
            </div>
            <div class="iban-box">
              <div class="iban-label">Official IBAN (24/7 IBFT • Raast • All Banks &amp; Wallets)</div>
              <div class="iban-val">${escapeHtml(OFFICIAL_UBL.iban)}</div>
            </div>
            <div class="ubl-note">
              Share transfer screenshot on WhatsApp (<strong>+92 319 209 1249</strong>) quoting <strong>Ref #${escapeHtml(formattedRef)}</strong> to receive your official joining pass.
            </div>
          </div>
          <div class="ubl-qr-col">
            <div class="qr-frame">
              <img src="${SAFE_UBL_QR_SRC}" alt="Scan to Pay UBL QR" />
            </div>
            <div class="qr-caption">Scan to Pay (UBL QR)</div>
          </div>
        </div>
      </div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt #${escapeHtml(formattedRef)} - The Leadership Covenant</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #EFFBF8 0%, #F4FCFA 55%, #DDEFF7 100%);
      color: #102E4D;
      padding: 24px 18px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .toolbar {
      max-width: 860px;
      margin: 0 auto 14px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn {
      padding: 9px 18px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.15);
      font-weight: 700;
      font-size: 12.5px;
      cursor: pointer;
      background: linear-gradient(90deg, #102E4D, #001B33);
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(16, 46, 77, 0.15);
    }
    .voucher {
      max-width: 860px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 2px solid #BCE8DF;
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(16, 46, 77, 0.10);
    }
    .accent {
      height: 7px;
      background: linear-gradient(90deg, #FFC400 0%, #FF7900 45%, #10B981 80%, #FFC400 100%);
    }
    .header {
      background: linear-gradient(90deg, #001B33 0%, #102E4D 55%, #001B33 100%);
      color: #FFFFFF;
      padding: 22px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
    }
    .logo-badge {
      width: 62px;
      height: 62px;
      background: #FFFFFF;
      border: 2px solid rgba(255, 196, 0, 0.7);
      border-radius: 14px;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .logo-badge img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .eyebrow {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: #FFC400;
      margin-bottom: 4px;
    }
    .brand {
      font-family: Georgia, "Playfair Display", serif;
      font-size: 23px;
      font-weight: 800;
      line-height: 1.15;
      color: #FFFFFF;
    }
    .sub {
      font-size: 12px;
      color: #D7F5EF;
      margin-top: 4px;
      font-weight: 500;
    }
    .ref-box {
      border: 1.5px solid rgba(255, 196, 0, 0.55);
      background: rgba(255, 196, 0, 0.09);
      padding: 10px 18px;
      border-radius: 14px;
      text-align: center;
      flex-shrink: 0;
    }
    .ref-label {
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #D7F5EF;
      font-weight: 700;
    }
    .ref-code {
      font-size: 18px;
      font-weight: 800;
      color: #FFC400;
      margin-top: 4px;
      white-space: nowrap;
      font-family: Inter, system-ui, sans-serif;
    }
    .status-strip {
      background: linear-gradient(90deg, #EFFBF8 0%, #E8F8F3 50%, #DDEFF7 100%);
      border-bottom: 1.5px solid #C8EFE6;
      padding: 10px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      font-size: 12px;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: #DCFCE7;
      border: 1px solid #86EFAC;
      color: #15803D;
      padding: 4px 12px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 10.5px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #16A34A;
      display: inline-block;
    }
    .issued {
      color: #102E4D;
      font-weight: 600;
      font-size: 11.5px;
    }
    .body {
      padding: 20px 28px;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .detail-card {
      border-radius: 14px;
      overflow: hidden;
      border: 1.5px solid #C8EFE6;
      background: #FAFEFD;
    }
    .detail-card.alt {
      border-color: #CFE6F3;
      background: #FAFCFE;
    }
    .card-head {
      padding: 9px 15px;
      background: #EFFBF8;
      border-bottom: 1px solid #C8EFE6;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #102E4D;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .detail-card.alt .card-head {
      background: #EDF6FB;
      border-bottom-color: #CFE6F3;
    }
    .bar-dot {
      width: 4px;
      height: 14px;
      border-radius: 2px;
      background: #102E4D;
      display: inline-block;
    }
    .detail-card.alt .bar-dot {
      background: #FF7900;
    }
    .card-rows {
      padding: 4px 15px;
    }
    .field {
      padding: 8px 0;
      border-bottom: 1px solid #E8F5F1;
    }
    .detail-card.alt .field {
      border-bottom-color: #E6F0F7;
    }
    .field:last-child {
      border-bottom: none;
    }
    .field-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748B;
      margin-bottom: 2px;
    }
    .field-val {
      font-size: 13px;
      font-weight: 700;
      color: #102E4D;
      word-break: break-word;
    }
    .summary-strip {
      margin-top: 16px;
      border-radius: 14px;
      border: 1.5px solid #A7F3D0;
      border-left: 5px solid #16A34A;
      background: linear-gradient(90deg, #ECFDF5 0%, #EFFBF8 55%, #EDF6FB 100%);
      padding: 14px 18px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }
    .sum-col {
      padding-right: 10px;
      border-right: 1px solid #CFEAE2;
    }
    .sum-col:last-child {
      border-right: none;
      padding-right: 0;
    }
    .sum-eyebrow {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748B;
      margin-bottom: 4px;
    }
    .sum-head {
      font-size: 13px;
      font-weight: 800;
      color: #102E4D;
      margin-bottom: 2px;
    }
    .sum-sub {
      font-size: 11.5px;
      font-weight: 600;
      color: #475569;
    }
    /* Official UBL Bank + QR Payment Voucher inside Reservation Receipt */
    .ubl-voucher {
      margin-top: 16px;
      border-radius: 16px;
      border: 1.5px solid #B8DDF0;
      background: linear-gradient(90deg, #F2F9FD 0%, #EFFBF8 55%, #FFFDF5 100%);
      overflow: hidden;
    }
    .ubl-voucher-head {
      background: linear-gradient(90deg, #E4F1FA 0%, #E6F7F2 100%);
      border-bottom: 1px solid #B8DDF0;
      padding: 9px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .ubl-head-left {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #102E4D;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ubl-bar {
      width: 4px;
      height: 14px;
      border-radius: 2px;
      background: #005696;
      display: inline-block;
    }
    .ubl-head-fee {
      font-size: 11px;
      font-weight: 800;
      color: #FF7900;
    }
    .ubl-voucher-body {
      display: grid;
      grid-template-columns: auto 1fr 154px;
      align-items: center;
      gap: 16px;
      padding: 14px 16px;
    }
    .ubl-brand-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 7px;
    }
    .ubl-logo-box {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: #FFFFFF;
      border: 1.5px solid rgba(0, 86, 150, 0.35);
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ubl-logo-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .ubl-tag {
      background: #E0F2FE;
      color: #005696;
      font-size: 9px;
      font-weight: 800;
      padding: 3px 9px;
      border-radius: 999px;
      letter-spacing: 0.05em;
    }
    .ubl-details-col {
      min-width: 0;
    }
    .ubl-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 12px;
      margin-bottom: 8px;
    }
    .iban-box {
      background: #FFFFFF;
      border: 1.5px solid #93C5FD;
      border-radius: 10px;
      padding: 7px 12px;
      margin-bottom: 7px;
    }
    .iban-label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #005696;
      margin-bottom: 2px;
    }
    .iban-val {
      font-size: 14.5px;
      font-weight: 800;
      color: #001B33;
      font-family: Inter, system-ui, sans-serif;
      letter-spacing: 0.02em;
    }
    .ubl-note {
      font-size: 11px;
      color: #475569;
      line-height: 1.35;
    }
    .ubl-qr-col {
      border-left: 1.5px solid #C5E3F2;
      padding-left: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .qr-frame {
      width: 108px;
      height: 108px;
      background: #FFFFFF;
      border: 1.5px solid #005696;
      border-radius: 10px;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      image-rendering: crisp-edges;
    }
    .qr-caption {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #005696;
      margin-top: 6px;
      text-align: center;
    }
    .proof-box {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed #CBD5E1;
    }
    .proof-title {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #047857;
      margin-bottom: 8px;
    }
    .proof-box img {
      max-height: 120px;
      border-radius: 10px;
      border: 1.5px solid #C8EFE6;
    }
    .footer {
      background: linear-gradient(90deg, #EFFBF8 0%, #E7F6F2 100%);
      border-top: 1.5px solid #C8EFE6;
      padding: 12px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      color: #102E4D;
      font-weight: 700;
    }
    .verified-badge {
      background: #001B33;
      color: #FFC400;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    @media (max-width: 640px) {
      body {
        padding: 10px 8px;
      }
      .toolbar {
        justify-content: stretch;
        margin-bottom: 10px;
      }
      .btn {
        width: 100%;
        min-height: 44px;
      }
      .voucher {
        border-radius: 16px;
      }
      .header {
        padding: 16px 14px;
        flex-direction: column;
        align-items: stretch;
        gap: 14px;
      }
      .brand-wrap {
        gap: 10px;
      }
      .logo-badge {
        width: 52px;
        height: 52px;
        border-radius: 12px;
      }
      .eyebrow {
        font-size: 8px;
        letter-spacing: 0.07em;
      }
      .brand {
        font-size: 19px;
      }
      .sub {
        font-size: 10px;
        line-height: 1.35;
      }
      .ref-box {
        width: 100%;
        padding: 9px 12px;
      }
      .ref-code {
        font-size: 17px;
        overflow-wrap: anywhere;
        white-space: normal;
      }
      .status-strip {
        padding: 10px 14px;
        flex-direction: column;
        align-items: stretch;
        gap: 7px;
      }
      .status-pill {
        justify-content: center;
        text-align: center;
        line-height: 1.3;
      }
      .issued {
        text-align: center;
      }
      .body {
        padding: 14px;
      }
      .cards-grid,
      .summary-strip {
        grid-template-columns: 1fr;
      }
      .summary-strip {
        gap: 10px;
        padding: 12px 14px;
      }
      .sum-col {
        padding: 0 0 10px;
        border-right: none;
        border-bottom: 1px solid #CFEAE2;
      }
      .sum-col:last-child {
        padding-bottom: 0;
        border-bottom: none;
      }
      .ubl-voucher-head {
        flex-direction: column;
        align-items: stretch;
        gap: 7px;
      }
      .ubl-head-left {
        line-height: 1.35;
      }
      .ubl-head-fee {
        text-align: left;
      }
      .ubl-voucher-body {
        grid-template-columns: 1fr;
        gap: 14px;
        padding: 14px;
      }
      .ubl-brand-col {
        flex-direction: row;
        justify-content: flex-start;
      }
      .ubl-details-col {
        width: 100%;
      }
      .ubl-meta-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      .iban-val {
        font-size: 12px;
        overflow-wrap: anywhere;
      }
      .ubl-qr-col {
        border-left: none;
        border-top: 1.5px solid #C5E3F2;
        padding: 14px 0 0;
      }
      .footer {
        padding: 12px 14px;
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        text-align: center;
        line-height: 1.4;
      }
      .verified-badge {
        align-self: center;
      }
    }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .voucher { box-shadow: none; border: 1.5px solid #BCE8DF; }
      .toolbar { display: none !important; }
      @page { size: auto; margin: 8mm; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="voucher">
    <div class="accent"></div>
    <div class="header">
      <div class="brand-wrap">
        <div class="logo-badge">
          <img src="/Logo_For_Navbar_Fotter.png" alt="The Leadership Covenant" />
        </div>
        <div>
          <div class="eyebrow">FranklinCovey Education • North Region Partner</div>
          <div class="brand">The Leadership Covenant</div>
          <div class="sub">${
            data.isSecured
              ? "Official Activity Registration &amp; Booking Receipt"
              : "Official Provisional Reservation &amp; Payment Voucher"
          }</div>
        </div>
      </div>
      <div class="ref-box">
        <div class="ref-label">Booking Reference</div>
        <div class="ref-code">#${escapeHtml(formattedRef)}</div>
      </div>
    </div>
    <div class="status-strip">
      <span class="status-pill"><span class="status-dot"></span> ${escapeHtml(statusText)}</span>
      <span class="issued">Issued On: ${escapeHtml(data.issuedAt)}</span>
    </div>
    <div class="body">
      <div class="cards-grid">
        <div class="detail-card">
          <div class="card-head"><span class="bar-dot"></span> Participant Information</div>
          <div class="card-rows">
            <div class="field">
              <div class="field-label">Participant Full Name</div>
              <div class="field-val">${escapeHtml(data.fullName)}</div>
            </div>
            <div class="field">
              <div class="field-label">Role / Designation</div>
              <div class="field-val">${escapeHtml(data.role)}</div>
            </div>
            <div class="field">
              <div class="field-label">Email Address</div>
              <div class="field-val">${escapeHtml(data.email)}</div>
            </div>
            <div class="field">
              <div class="field-label">Phone / WhatsApp</div>
              <div class="field-val">${escapeHtml(data.phone)}</div>
            </div>
          </div>
        </div>
        <div class="detail-card alt">
          <div class="card-head"><span class="bar-dot"></span> Activity &amp; Schedule Details</div>
          <div class="card-rows">
            <div class="field">
              <div class="field-label">Selected Activity</div>
              <div class="field-val">${escapeHtml(data.activityTitle)}</div>
            </div>
            <div class="field">
              <div class="field-label">Program Category</div>
              <div class="field-val">${escapeHtml(data.activityCategory)}</div>
            </div>
            <div class="field">
              <div class="field-label">Event Date &amp; Schedule</div>
              <div class="field-val">${escapeHtml(data.activityDate)} • ${escapeHtml(data.activitySchedule)}</div>
            </div>
            <div class="field">
              <div class="field-label">Location / Venue</div>
              <div class="field-val">${escapeHtml(data.activityCity)}</div>
            </div>
          </div>
        </div>
      </div>
      ${bottomPaymentHtml}
    </div>
    <div class="footer">
      <span>The Leadership Covenant • WhatsApp / Tel: +92 319 209 1249 • Islamabad, Pakistan</span>
      <span class="verified-badge">● Verified E-Receipt</span>
    </div>
  </div>
  <script>
    (function () {
      var imgs = Array.prototype.slice.call(document.images);
      Promise.all(
        imgs.map(function (img) {
          if (img.complete) return Promise.resolve();
          return new Promise(function (res) {
            img.onload = res;
            img.onerror = res;
          });
        })
      ).then(function () {
        setTimeout(function () { window.focus(); window.print(); }, 180);
      });
    })();
  </script>
</body>
</html>`;

  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
}

/**
 * Shares the official receipt via native Web Share API (including PNG file if supported)
 * or copies the formatted receipt text to clipboard as fallback.
 */
export async function shareOfficialReceipt(
  data: ReceiptPayload
): Promise<"shared" | "copied" | "cancelled"> {
  const formattedRef = formatBookingReference(data.referenceId);
  const normalizedData: ReceiptPayload = {
    ...data,
    referenceId: formattedRef,
  };

  const summaryLines = [
    `The Leadership Covenant - Official Booking Receipt`,
    `Reference: #${formattedRef}`,
    `Participant: ${data.fullName} (${data.role})`,
    `Activity: ${data.activityTitle}`,
    `Schedule: ${data.activityDate} • ${data.activitySchedule} (${data.activityCity})`,
    `Status: ${
      data.isSecured
        ? `Priority Seat Confirmed (${data.paymentMethodName || "UBL Transfer"})`
        : "Provisional Reservation (Pay Later)"
    }`,
  ];

  if (!data.isSecured) {
    summaryLines.push(
      `UBL Account: ${OFFICIAL_UBL.accountTitle} (IBAN: ${OFFICIAL_UBL.iban})`
    );
  }
  summaryLines.push(`Issued: ${data.issuedAt}`);

  const summaryText = summaryLines.join("\n");
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : undefined;

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      const blob = await generateReceiptPngBlob(normalizedData);
      const receiptFile = new File(
        [blob],
        `TLC-Receipt-${formattedRef}.png`,
        { type: "image/png" }
      );

      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [receiptFile] })
      ) {
        await navigator.share({
          title: `Booking Receipt #${formattedRef}`,
          text: summaryText,
          files: [receiptFile],
        });
        return "shared";
      }

      await navigator.share({
        title: `Booking Receipt #${formattedRef} - The Leadership Covenant`,
        text: summaryText,
        url: shareUrl,
      });
      return "shared";
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(
      shareUrl ? `${summaryText}\n${shareUrl}` : summaryText
    );
    return "copied";
  }

  return "cancelled";
}
