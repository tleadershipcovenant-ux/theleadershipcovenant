"use client";

import CmsEditorShell from "@/components/admin/CmsEditorShell";

export default function CmsContactPage() {
  return (
    <CmsEditorShell
      pageKey="contact"
      pageLabel="Contact Us & Regional Office"
      pageCategory="Organization"
      categoryColor="bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
      iconBg="bg-cyan-500/15"
      iconColor="text-cyan-400"
      livePath="/contact"
    />
  );
}

