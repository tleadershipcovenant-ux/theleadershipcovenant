"use client";

import CmsEditorShell from "@/components/admin/CmsEditorShell";

export default function CmsAboutPage() {
  return (
    <CmsEditorShell
      pageKey="about"
      pageLabel="Our Story, Covenant & CEO Message"
      pageCategory="Organization"
      categoryColor="bg-amber-500/15 text-amber-300 border-amber-500/30"
      iconBg="bg-amber-500/15"
      iconColor="text-amber-400"
      livePath="/about"
    />
  );
}
