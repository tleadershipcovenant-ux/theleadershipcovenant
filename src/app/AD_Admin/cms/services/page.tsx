"use client";

import CmsEditorShell from "@/components/admin/CmsEditorShell";

export default function CmsServicesPage() {
  return (
    <CmsEditorShell
      pageKey="services"
      pageLabel="Services & Flagship Programs"
      pageCategory="Core Offerings"
      categoryColor="bg-teal-500/15 text-teal-300 border-teal-500/30"
      iconBg="bg-teal-500/15"
      iconColor="text-teal-400"
      livePath="/services"
    />
  );
}
