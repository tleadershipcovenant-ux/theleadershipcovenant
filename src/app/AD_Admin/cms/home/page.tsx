"use client";

import CmsEditorShell from "@/components/admin/CmsEditorShell";

export default function CmsHomePage() {
  return (
    <CmsEditorShell
      pageKey="home"
      pageLabel="Home Page Content & Impact Metrics"
      pageCategory="Landing"
      categoryColor="bg-blue-500/15 text-blue-300 border-blue-500/30"
      iconBg="bg-blue-500/15"
      iconColor="text-blue-400"
      livePath="/"
    />
  );
}
