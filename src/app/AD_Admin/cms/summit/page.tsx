"use client";

import CmsEditorShell from "@/components/admin/CmsEditorShell";

export default function CmsSummitPage() {
  return (
    <CmsEditorShell
      pageKey="summit"
      pageLabel="School Impact Summit 2026"
      pageCategory="Featured Summit"
      categoryColor="bg-orange-500/15 text-orange-300 border-orange-500/30"
      iconBg="bg-orange-500/15"
      iconColor="text-[#FF7900]"
      livePath="/summit"
    />
  );
}
