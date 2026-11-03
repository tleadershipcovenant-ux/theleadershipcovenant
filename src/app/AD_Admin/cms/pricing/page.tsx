"use client";

import CmsEditorShell from "@/components/admin/CmsEditorShell";

export default function CmsPricingPage() {
  return (
    <CmsEditorShell
      pageKey="pricing"
      pageLabel="Pricing & Early Bird Rules"
      pageCategory="Commercial Rules"
      categoryColor="bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      iconBg="bg-emerald-500/15"
      iconColor="text-emerald-400"
      livePath="/apply"
    />
  );
}
