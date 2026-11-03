"use client";

import CmsEditorShell from "@/components/admin/CmsEditorShell";

export default function CmsSitePage() {
  return (
    <CmsEditorShell
      pageKey="site"
      pageLabel="Global Site Settings & Ticker Announcements"
      pageCategory="Configuration"
      categoryColor="bg-purple-500/15 text-purple-300 border-purple-500/30"
      iconBg="bg-purple-500/15"
      iconColor="text-purple-400"
      livePath="/"
    />
  );
}
