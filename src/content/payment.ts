/**
 * Payment account method displayed in Step 3 ("Secure Your Seat")
 * of the Online Activity Application Wizard (/activities#apply).
 *
 * Exclusively: United Bank Limited (UBL) with official corporate account & QR Scan to Pay.
 */

export type PaymentMethodId = "ubl";

export interface PaymentAccountMethod {
  id: PaymentMethodId;
  name: string;
  shortLabel: string;
  subtitle: string;
  logoSrc: string;
  qrCodeSrc: string;
  accountTitle: string;
  accountNumber?: string;
  iban: string;
  bankName: string;
  branchNote?: string;
  accentHex: string;
  accentBg: string;
  accentBorder: string;
  badgeText: string;
}

export const PAYMENT_METHODS: PaymentAccountMethod[] = [
  {
    id: "ubl",
    name: "United Bank Limited",
    shortLabel: "United Bank Limited",
    subtitle: "Official Corporate Account • IBFT / Raast",
    logoSrc: "/Social%20Icons/UBL-Bank-Logo.png",
    qrCodeSrc: "/Social%20Icons/UBL%20QR%27.jpeg",
    bankName: "United Bank Limited",
    accountTitle: "The Leadership Covenant Pvt. Ltd",
    iban: "PK46UNIL0109000385790301",
    branchNote:
      "Inter-Bank Funds Transfer (IBFT), Raast ID, and mobile banking transfers are supported 24/7 across all Pakistani banks and digital wallets.",
    accentHex: "#005696",
    accentBg: "bg-[#005696]/10",
    accentBorder: "border-[#005696]",
    badgeText: "UBL",
  },
];
