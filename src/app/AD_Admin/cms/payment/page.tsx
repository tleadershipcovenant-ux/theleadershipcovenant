"use client";

import CmsEditorShell from "@/components/admin/CmsEditorShell";

export default function CmsPaymentPage() {
  return (
    <CmsEditorShell
      pageKey="payment"
      pageLabel="Payment Methods & Accounts"
      pageCategory="Banking & Finance"
      categoryColor="bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      iconBg="bg-emerald-500/15"
      iconColor="text-emerald-400"
      livePath="/online-booking"
    />
  );
}
