"use client";

import CmsEditorShell from "@/components/admin/CmsEditorShell";

export default function CmsFormsPage() {
  return (
    <CmsEditorShell
      pageKey="forms"
      pageLabel="Application & Contact Forms Copy"
      pageCategory="Configuration"
      categoryColor="bg-violet-500/15 text-violet-300 border-violet-500/30"
      iconBg="bg-violet-500/15"
      iconColor="text-violet-400"
      livePath="/apply"
    />
  );
}

