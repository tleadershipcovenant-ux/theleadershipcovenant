"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Eye,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import {
  APPLY_PAGE,
  normalizeApplyCms,
  type ApplyPageContent,
} from "@/content/forms";
import {
  CmsField,
  CmsImageField,
  CmsStringList,
  cmsInputClass,
} from "@/components/admin/cms-fields";

export default function ApplyCmsEditor() {
  const [content, setContent] = useState<ApplyPageContent>(APPLY_PAGE);
  const [visible, setVisible] = useState(true);
  const [original, setOriginal] = useState(
    JSON.stringify({ ...APPLY_PAGE, _visible: true })
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadResolveRef = useRef<((url: string | null) => void) | null>(null);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify({ ...content, _visible: visible }) !== original,
    [content, visible, original]
  );

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms", { cache: "no-store" });
      if (!res.ok) {
        setContent(APPLY_PAGE);
        setVisible(true);
        setOriginal(JSON.stringify({ ...APPLY_PAGE, _visible: true }));
        return;
      }
      const json = await res.json();
      const raw = json.pages?.forms?.content || {};
      const normalized = normalizeApplyCms(raw);
      const isVisible = raw._visible !== false;
      setContent(normalized);
      setVisible(isVisible);
      setOriginal(JSON.stringify({ ...normalized, _visible: isVisible }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const body = { ...content, _visible: visible };
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_key: "forms", content: body }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to publish.");
      const saved = normalizeApplyCms(json.page.content);
      const isVisible = json.page.content._visible !== false;
      setContent(saved);
      setVisible(isVisible);
      setOriginal(JSON.stringify({ ...saved, _visible: isVisible }));
      setFeedback({
        type: "success",
        text: "Submit / Apply page published to Firebase. The live /apply page will use this content.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to publish changes.",
      });
    } finally {
      setSaving(false);
    }
  }, [content, visible]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave]);

  const handleReset = async () => {
    if (!window.confirm("Reset the Submit / Apply page back to live website defaults?")) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", page_key: "forms" }),
      });
      const json = await res.json();
      if (res.ok && json.page) {
        const saved = normalizeApplyCms(json.page.content);
        const isVisible = json.page.content._visible !== false;
        setContent(saved);
        setVisible(isVisible);
        setOriginal(JSON.stringify({ ...saved, _visible: isVisible }));
        setFeedback({ type: "success", text: "Submit / Apply page restored to defaults." });
      }
    } finally {
      setResetting(false);
    }
  };

  const handleUpload = async (): Promise<string | null> =>
    new Promise((resolve) => {
      uploadResolveRef.current = resolve;
      fileInputRef.current?.click();
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      uploadResolveRef.current?.(null);
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "cms");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.url) {
        uploadResolveRef.current?.(json.url);
        setFeedback({ type: "success", text: "Image uploaded." });
      } else {
        uploadResolveRef.current?.(null);
        setFeedback({ type: "error", text: json.error || "Upload failed." });
      }
    } catch {
      uploadResolveRef.current?.(null);
    }
    e.target.value = "";
  };

  const patchHero = (partial: Partial<ApplyPageContent["hero"]>) =>
    setContent({ ...content, hero: { ...content.hero, ...partial } });
  const patchHeader = (partial: Partial<ApplyPageContent["formHeader"]>) =>
    setContent({ ...content, formHeader: { ...content.formHeader, ...partial } });
  const patchSteps = (partial: Partial<ApplyPageContent["steps"]>) =>
    setContent({ ...content, steps: { ...content.steps, ...partial } });
  const patchStep1 = (partial: Partial<ApplyPageContent["step1"]>) =>
    setContent({ ...content, step1: { ...content.step1, ...partial } });
  const patchStep2 = (partial: Partial<ApplyPageContent["step2"]>) =>
    setContent({ ...content, step2: { ...content.step2, ...partial } });
  const patchStep3 = (partial: Partial<ApplyPageContent["step3"]>) =>
    setContent({ ...content, step3: { ...content.step3, ...partial } });
  const patchSuccess = (partial: Partial<ApplyPageContent["success"]>) =>
    setContent({ ...content, success: { ...content.success, ...partial } });

  return (
    <div className="space-y-5 pb-16">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Link href="/AD_Admin/cms" className="flex items-center gap-1.5 text-slate-500 hover:text-[#FF7900] font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            CMS Overview Hub
          </Link>
          <span>/</span>
          <span className="text-[#102E4D] font-extrabold">Submit / Apply Page</span>
        </div>
        {hasUnsavedChanges ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 font-extrabold text-[10.5px]">
            Unsaved changes · Ctrl+S
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl bg-white border-2 border-[#C8EFE6] shadow-xl overflow-hidden">
        <div className="relative bg-gradient-to-r from-[#001B33] via-[#082038] to-[#001428] p-5 sm:p-7 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />
          <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[#FFC400] text-[10px] font-extrabold uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  Live CMS Editor
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Firestore Synced
                </span>
              </div>
              <h1 className="font-serif font-extrabold text-xl sm:text-2xl">Submit / Apply Page CMS</h1>
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                Same sections as the live /apply booking page: hero, form header, wizard steps, booking option cards, payment copy, and success receipt. Public layout stays unchanged.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <Link href="/apply" target="_blank" className="h-10 px-3.5 rounded-xl border border-white/20 bg-white/10 text-white text-xs font-bold inline-flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-[#38BDF8]" />
                Preview
              </Link>
              <button type="button" onClick={() => setVisible((v) => !v)} className={`h-10 px-3.5 rounded-xl border text-xs font-bold inline-flex items-center gap-2 ${visible ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200" : "border-white/15 bg-white/5 text-slate-300"}`}>
                <Eye className="w-3.5 h-3.5" />
                {visible ? "Live" : "Hidden"}
              </button>
              <button type="button" onClick={handleReset} disabled={resetting} className="h-10 px-3.5 rounded-xl border border-white/15 bg-white/5 text-slate-300 text-xs font-bold">
                <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" />
                {resetting ? "Resetting…" : "Reset"}
              </button>
              <button type="button" onClick={handleSave} disabled={saving || loading} className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#FF7900] via-[#FF8800] to-[#E56D00] text-white text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? "Publishing…" : "Publish Changes"}
              </button>
            </div>
          </div>
        </div>

        {feedback ? (
          <div className={`px-6 py-2.5 border-b flex items-center gap-2.5 text-xs font-semibold ${feedback.type === "success" ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]" : "bg-red-50 text-red-700 border-red-200"}`}>
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="flex-1">{feedback.text}</span>
            <button type="button" onClick={() => setFeedback(null)}>✕</button>
          </div>
        ) : null}

        <div className="px-5 py-3 bg-[#F9FCFB] border-b border-[#C8EFE6] flex gap-2 overflow-x-auto">
          {[
            { id: "cms-apply-hero", label: "01 · Hero" },
            { id: "cms-apply-header", label: "02 · Form header" },
            { id: "cms-apply-steps", label: "03 · Wizard steps" },
            { id: "cms-apply-step1", label: "04 · Participant fields" },
            { id: "cms-apply-step2", label: "05 · Booking cards" },
            { id: "cms-apply-step3", label: "06 · Payment copy" },
            { id: "cms-apply-success", label: "07 · Success receipt" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => document.getElementById(tab.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#C8EFE6] bg-white text-[#102E4D] whitespace-nowrap"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          ) : (
            <>
              <section id="cms-apply-hero" className="rounded-2xl border-2 border-[#C8EFE6] bg-white p-5 space-y-4">
                <h2 className="font-serif font-bold text-lg text-[#102E4D]">Hero banner</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CmsField label="Heading"><input className={cmsInputClass} value={content.hero.heading} onChange={(e) => patchHero({ heading: e.target.value })} /></CmsField>
                  <CmsField label="Gold highlight"><input className={cmsInputClass} value={content.hero.headingHighlight} onChange={(e) => patchHero({ headingHighlight: e.target.value })} /></CmsField>
                </div>
                <CmsField label="Subheading"><textarea rows={3} className={cmsInputClass} value={content.hero.body} onChange={(e) => patchHero({ body: e.target.value })} /></CmsField>
                <CmsImageField value={content.hero.image} onChange={(image) => patchHero({ image })} onUpload={handleUpload} label="Hero background" />
                <div className="relative overflow-hidden rounded-2xl bg-[#001B33] min-h-[180px] text-white p-6 flex items-center justify-center text-center">
                  <img src={content.hero.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  <div className="relative z-10">
                    <h3 className="font-serif font-extrabold text-2xl">{content.hero.heading}<br /><span className="text-[#FFC400]">{content.hero.headingHighlight}</span></h3>
                    <p className="text-xs text-white/90 mt-3 max-w-md mx-auto">{content.hero.body}</p>
                  </div>
                </div>
              </section>

              <section id="cms-apply-header" className="rounded-2xl border-2 border-[#C8EFE6] bg-white p-5 space-y-4">
                <h2 className="font-serif font-bold text-lg text-[#102E4D]">Form header card</h2>
                <CmsField label="Form title"><input className={cmsInputClass} value={content.formHeader.title} onChange={(e) => patchHeader({ title: e.target.value })} /></CmsField>
                <CmsField label="Form subtitle"><textarea rows={2} className={cmsInputClass} value={content.formHeader.subtitle} onChange={(e) => patchHeader({ subtitle: e.target.value })} /></CmsField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CmsField label="WhatsApp button label"><input className={cmsInputClass} value={content.formHeader.whatsappLabel} onChange={(e) => patchHeader({ whatsappLabel: e.target.value })} /></CmsField>
                  <CmsField label="WhatsApp URL"><input className={cmsInputClass} value={content.formHeader.whatsappUrl} onChange={(e) => patchHeader({ whatsappUrl: e.target.value })} /></CmsField>
                </div>
                <CmsField label="Loading text"><input className={cmsInputClass} value={content.loadingText} onChange={(e) => setContent({ ...content, loadingText: e.target.value })} /></CmsField>
              </section>

              <section id="cms-apply-steps" className="rounded-2xl border-2 border-[#C8EFE6] bg-white p-5 space-y-4">
                <h2 className="font-serif font-bold text-lg text-[#102E4D]">Wizard step tabs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CmsField label="Step 1 title"><input className={cmsInputClass} value={content.steps.step1Title} onChange={(e) => patchSteps({ step1Title: e.target.value })} /></CmsField>
                  <CmsField label="Step 1 subtitle"><input className={cmsInputClass} value={content.steps.step1Subtitle} onChange={(e) => patchSteps({ step1Subtitle: e.target.value })} /></CmsField>
                  <CmsField label="Step 2 title"><input className={cmsInputClass} value={content.steps.step2Title} onChange={(e) => patchSteps({ step2Title: e.target.value })} /></CmsField>
                  <CmsField label="Step 2 subtitle"><input className={cmsInputClass} value={content.steps.step2Subtitle} onChange={(e) => patchSteps({ step2Subtitle: e.target.value })} /></CmsField>
                  <CmsField label="Step 3 (reservation) title"><input className={cmsInputClass} value={content.steps.step3ReservationTitle} onChange={(e) => patchSteps({ step3ReservationTitle: e.target.value })} /></CmsField>
                  <CmsField label="Step 3 (reservation) subtitle"><input className={cmsInputClass} value={content.steps.step3ReservationSubtitle} onChange={(e) => patchSteps({ step3ReservationSubtitle: e.target.value })} /></CmsField>
                  <CmsField label="Step 3 (payment) title"><input className={cmsInputClass} value={content.steps.step3PaymentTitle} onChange={(e) => patchSteps({ step3PaymentTitle: e.target.value })} /></CmsField>
                  <CmsField label="Step 3 (payment) subtitle"><input className={cmsInputClass} value={content.steps.step3PaymentSubtitle} onChange={(e) => patchSteps({ step3PaymentSubtitle: e.target.value })} /></CmsField>
                </div>
              </section>

              <section id="cms-apply-step1" className="rounded-2xl border-2 border-[#C8EFE6] bg-white p-5 space-y-4">
                <h2 className="font-serif font-bold text-lg text-[#102E4D]">Step 1 · Participant fields</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CmsField label="Section title"><input className={cmsInputClass} value={content.step1.sectionTitle} onChange={(e) => patchStep1({ sectionTitle: e.target.value })} /></CmsField>
                  <CmsField label="Step badge"><input className={cmsInputClass} value={content.step1.stepBadge} onChange={(e) => patchStep1({ stepBadge: e.target.value })} /></CmsField>
                  {(["fullName", "email", "phone", "role", "activity", "notes"] as const).map((key) => (
                    <React.Fragment key={key}>
                      <CmsField label={`${key} label`}>
                        <input className={cmsInputClass} value={content.step1[key].label} onChange={(e) => patchStep1({ [key]: { ...content.step1[key], label: e.target.value } })} />
                      </CmsField>
                      <CmsField label={`${key} placeholder`}>
                        <input className={cmsInputClass} value={content.step1[key].placeholder} onChange={(e) => patchStep1({ [key]: { ...content.step1[key], placeholder: e.target.value } })} />
                      </CmsField>
                    </React.Fragment>
                  ))}
                  <CmsField label="Activity dropdown heading"><input className={cmsInputClass} value={content.step1.activityDropdownHeading} onChange={(e) => patchStep1({ activityDropdownHeading: e.target.value })} /></CmsField>
                  <CmsField label="Summary heading"><input className={cmsInputClass} value={content.step1.summaryHeading} onChange={(e) => patchStep1({ summaryHeading: e.target.value })} /></CmsField>
                  <CmsField label="Live preview badge"><input className={cmsInputClass} value={content.step1.summaryLivePreview} onChange={(e) => patchStep1({ summaryLivePreview: e.target.value })} /></CmsField>
                  <CmsField label="Notes optional tag"><input className={cmsInputClass} value={content.step1.notes.optionalTag || ""} onChange={(e) => patchStep1({ notes: { ...content.step1.notes, optionalTag: e.target.value } })} /></CmsField>
                  <CmsField label="Empty state title"><input className={cmsInputClass} value={content.step1.emptyTitle} onChange={(e) => patchStep1({ emptyTitle: e.target.value })} /></CmsField>
                  <CmsField label="Next button"><input className={cmsInputClass} value={content.step1.nextButton} onChange={(e) => patchStep1({ nextButton: e.target.value })} /></CmsField>
                </div>
                <CmsField label="Empty state body"><textarea rows={2} className={cmsInputClass} value={content.step1.emptyBody} onChange={(e) => patchStep1({ emptyBody: e.target.value })} /></CmsField>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <CmsField label="Terms prefix"><input className={cmsInputClass} value={content.step1.termsPrefix} onChange={(e) => patchStep1({ termsPrefix: e.target.value })} /></CmsField>
                  <CmsField label="Terms link label"><input className={cmsInputClass} value={content.step1.termsLabel} onChange={(e) => patchStep1({ termsLabel: e.target.value })} /></CmsField>
                  <CmsField label="Terms suffix"><input className={cmsInputClass} value={content.step1.termsSuffix} onChange={(e) => patchStep1({ termsSuffix: e.target.value })} /></CmsField>
                </div>
              </section>

              <section id="cms-apply-step2" className="rounded-2xl border-2 border-[#C8EFE6] bg-white p-5 space-y-4">
                <h2 className="font-serif font-bold text-lg text-[#102E4D]">Step 2 · Booking option cards</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border-2 border-[#102E4D]/20 p-4 space-y-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">Reservation card</p>
                    <CmsField label="Badge"><input className={cmsInputClass} value={content.step2.reservation.badge} onChange={(e) => patchStep2({ reservation: { ...content.step2.reservation, badge: e.target.value } })} /></CmsField>
                    <CmsField label="Title"><input className={cmsInputClass} value={content.step2.reservation.title} onChange={(e) => patchStep2({ reservation: { ...content.step2.reservation, title: e.target.value } })} /></CmsField>
                    <CmsField label="Body"><textarea rows={3} className={cmsInputClass} value={content.step2.reservation.body} onChange={(e) => patchStep2({ reservation: { ...content.step2.reservation, body: e.target.value } })} /></CmsField>
                    <div className="grid grid-cols-2 gap-2">
                      <CmsField label="Advance label"><input className={cmsInputClass} value={content.step2.reservation.advanceLabel} onChange={(e) => patchStep2({ reservation: { ...content.step2.reservation, advanceLabel: e.target.value } })} /></CmsField>
                      <CmsField label="Advance value"><input className={cmsInputClass} value={content.step2.reservation.advanceValue} onChange={(e) => patchStep2({ reservation: { ...content.step2.reservation, advanceValue: e.target.value } })} /></CmsField>
                    </div>
                    <CmsField label="Benefit bullets (CRUD)">
                      <CmsStringList values={content.step2.reservation.bullets} onChange={(bullets) => patchStep2({ reservation: { ...content.step2.reservation, bullets } })} placeholder="Add a benefit" />
                    </CmsField>
                  </div>
                  <div className="rounded-xl border-2 border-[#FF7900]/30 p-4 space-y-3">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF7900]">Secure Your Seat card</p>
                    <CmsField label="Badge"><input className={cmsInputClass} value={content.step2.secureSeat.badge} onChange={(e) => patchStep2({ secureSeat: { ...content.step2.secureSeat, badge: e.target.value } })} /></CmsField>
                    <CmsField label="Title"><input className={cmsInputClass} value={content.step2.secureSeat.title} onChange={(e) => patchStep2({ secureSeat: { ...content.step2.secureSeat, title: e.target.value } })} /></CmsField>
                    <CmsField label="Body"><textarea rows={3} className={cmsInputClass} value={content.step2.secureSeat.body} onChange={(e) => patchStep2({ secureSeat: { ...content.step2.secureSeat, body: e.target.value } })} /></CmsField>
                    <div className="grid grid-cols-2 gap-2">
                      <CmsField label="Partner eyebrow"><input className={cmsInputClass} value={content.step2.secureSeat.partnerEyebrow} onChange={(e) => patchStep2({ secureSeat: { ...content.step2.secureSeat, partnerEyebrow: e.target.value } })} /></CmsField>
                      <CmsField label="Partner name"><input className={cmsInputClass} value={content.step2.secureSeat.partnerName} onChange={(e) => patchStep2({ secureSeat: { ...content.step2.secureSeat, partnerName: e.target.value } })} /></CmsField>
                    </div>
                    <CmsField label="Benefit bullets (CRUD)">
                      <CmsStringList values={content.step2.secureSeat.bullets} onChange={(bullets) => patchStep2({ secureSeat: { ...content.step2.secureSeat, bullets } })} placeholder="Add a benefit" />
                    </CmsField>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CmsField label="Participant label"><input className={cmsInputClass} value={content.step2.participantLabel} onChange={(e) => patchStep2({ participantLabel: e.target.value })} /></CmsField>
                  <CmsField label="Activity label"><input className={cmsInputClass} value={content.step2.activityLabel} onChange={(e) => patchStep2({ activityLabel: e.target.value })} /></CmsField>
                  <CmsField label="Edit details"><input className={cmsInputClass} value={content.step2.editButton} onChange={(e) => patchStep2({ editButton: e.target.value })} /></CmsField>
                  <CmsField label="Back button"><input className={cmsInputClass} value={content.step2.backButton} onChange={(e) => patchStep2({ backButton: e.target.value })} /></CmsField>
                  <CmsField label="Complete reservation"><input className={cmsInputClass} value={content.step2.completeReservation} onChange={(e) => patchStep2({ completeReservation: e.target.value })} /></CmsField>
                  <CmsField label="Completing reservation"><input className={cmsInputClass} value={content.step2.completingReservation} onChange={(e) => patchStep2({ completingReservation: e.target.value })} /></CmsField>
                  <CmsField label="Next payment"><input className={cmsInputClass} value={content.step2.nextPayment} onChange={(e) => patchStep2({ nextPayment: e.target.value })} /></CmsField>
                  <CmsField label="Select option prompt"><input className={cmsInputClass} value={content.step2.selectOption} onChange={(e) => patchStep2({ selectOption: e.target.value })} /></CmsField>
                </div>
              </section>

              <section id="cms-apply-step3" className="rounded-2xl border-2 border-[#C8EFE6] bg-white p-5 space-y-4">
                <h2 className="font-serif font-bold text-lg text-[#102E4D]">Step 3 · Payment copy</h2>
                <p className="text-xs text-slate-500">Bank IBAN, QR, and account numbers stay in Payment Accounts CMS. This section edits the submit-page wording only.</p>
                <CmsField label="Heading"><input className={cmsInputClass} value={content.step3.paymentHeading} onChange={(e) => patchStep3({ paymentHeading: e.target.value })} /></CmsField>
                <CmsField label="Subheading"><textarea rows={2} className={cmsInputClass} value={content.step3.paymentSubheading} onChange={(e) => patchStep3({ paymentSubheading: e.target.value })} /></CmsField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CmsField label="Fee payable label"><input className={cmsInputClass} value={content.step3.feePayableLabel} onChange={(e) => patchStep3({ feePayableLabel: e.target.value })} /></CmsField>
                  <CmsField label="Transaction label"><input className={cmsInputClass} value={content.step3.transactionLabel} onChange={(e) => patchStep3({ transactionLabel: e.target.value })} /></CmsField>
                  <CmsField label="Transaction placeholder"><input className={cmsInputClass} value={content.step3.transactionPlaceholder} onChange={(e) => patchStep3({ transactionPlaceholder: e.target.value })} /></CmsField>
                  <CmsField label="Optional tag"><input className={cmsInputClass} value={content.step3.optionalTag} onChange={(e) => patchStep3({ optionalTag: e.target.value })} /></CmsField>
                  <CmsField label="Submit button"><input className={cmsInputClass} value={content.step3.submitButton} onChange={(e) => patchStep3({ submitButton: e.target.value })} /></CmsField>
                  <CmsField label="Back button"><input className={cmsInputClass} value={content.step3.backButton} onChange={(e) => patchStep3({ backButton: e.target.value })} /></CmsField>
                  <CmsField label="Submitting button"><input className={cmsInputClass} value={content.step3.submittingButton} onChange={(e) => patchStep3({ submittingButton: e.target.value })} /></CmsField>
                </div>
              </section>

              <section id="cms-apply-success" className="rounded-2xl border-2 border-[#C8EFE6] bg-white p-5 space-y-4">
                <h2 className="font-serif font-bold text-lg text-[#102E4D]">Success & receipt copy</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CmsField label="Reservation status"><input className={cmsInputClass} value={content.success.reservationStatus} onChange={(e) => patchSuccess({ reservationStatus: e.target.value })} /></CmsField>
                  <CmsField label="Secured status"><input className={cmsInputClass} value={content.success.securedStatus} onChange={(e) => patchSuccess({ securedStatus: e.target.value })} /></CmsField>
                  <CmsField label="Reservation headline"><input className={cmsInputClass} value={content.success.reservationHeadline} onChange={(e) => patchSuccess({ reservationHeadline: e.target.value })} /></CmsField>
                  <CmsField label="Secured headline"><input className={cmsInputClass} value={content.success.securedHeadline} onChange={(e) => patchSuccess({ securedHeadline: e.target.value })} /></CmsField>
                </div>
                <CmsField label="Reservation body"><textarea rows={3} className={cmsInputClass} value={content.success.reservationBody} onChange={(e) => patchSuccess({ reservationBody: e.target.value })} /></CmsField>
                <CmsField label="Secured body"><textarea rows={3} className={cmsInputClass} value={content.success.securedBody} onChange={(e) => patchSuccess({ securedBody: e.target.value })} /></CmsField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CmsField label="Receipt title"><input className={cmsInputClass} value={content.success.receiptTitle} onChange={(e) => patchSuccess({ receiptTitle: e.target.value })} /></CmsField>
                  <CmsField label="WhatsApp button"><input className={cmsInputClass} value={content.success.whatsappButton} onChange={(e) => patchSuccess({ whatsappButton: e.target.value })} /></CmsField>
                  <CmsField label="Submit another"><input className={cmsInputClass} value={content.success.submitAnother} onChange={(e) => patchSuccess({ submitAnother: e.target.value })} /></CmsField>
                  <CmsField label="Booking option reserved"><input className={cmsInputClass} value={content.success.optionReserved} onChange={(e) => patchSuccess({ optionReserved: e.target.value })} /></CmsField>
                  <CmsField label="Booking option secured"><input className={cmsInputClass} value={content.success.optionSecured} onChange={(e) => patchSuccess({ optionSecured: e.target.value })} /></CmsField>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
