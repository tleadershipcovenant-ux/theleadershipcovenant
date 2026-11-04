"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  EVENTS,
  CATEGORY_LABELS,
  getMonthTheme,
  getEventLifecycle,
  EVENT_LIFECYCLE_LABELS,
  isOpenEnrollmentEvent,
  type LeadershipEvent,
} from "@/content/events";
import { useCmsContent } from "@/lib/cms-client";
import { FORM_COPY } from "@/content/forms";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/content/payment";
import { getActivityPricing } from "@/content/pricing";
import {
  downloadOfficialReceipt,
  formatBookingReference,
  printOfficialReceipt,
  shareOfficialReceipt,
  type ReceiptPayload,
} from "@/lib/receipt";
import {
  validateScreenshotFile,
  compressScreenshotImage,
  type CompressionResult,
} from "@/lib/image-compressor";

const PartyConfetti = dynamic(() => import("@/components/PartyConfetti"), {
  ssr: false,
});
const ContinuousCelebration = dynamic(
  () => import("@/components/ContinuousCelebration"),
  { ssr: false }
);
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CalendarCheck2,
  ShieldCheck,
  PartyPopper,
  Copy,
  Check,
  ImagePlus,
  Camera,
  Trash2,
  UploadCloud,
  Clock,
  MapPin,
  Award,
  Sparkles,
  Info,
  Download,
  Printer,
  Share2,
  QrCode,
  Landmark,
  ExternalLink,
  BadgePercent,
  Tag,
  Hourglass,
  ChevronDown,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface ApplyFormProps {
  initialActivity?: string;
  initialEvents?: LeadershipEvent[];
}

type BookingMode = "reservation" | "secure_seat";
type WizardStep = 1 | 2 | 3 | "complete";

export function ApplyForm({
  initialActivity = "",
  initialEvents = EVENTS,
}: ApplyFormProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [bookingMode, setBookingMode] = useState<BookingMode | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("ubl");
  const [paymentTab, setPaymentTab] = useState<"iban" | "qr">("iban");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
  const activityDropdownRef = useRef<HTMLDivElement>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    activity_slug: initialActivity || "",
    transaction_ref: "",
    message: "",
    website: "", // honeypot
  });

  // Dynamic Live CMS Subscription
  const { content: cmsData } = useCmsContent<{ events?: LeadershipEvent[] }>(
    "events",
    { events: initialEvents }
  );

  const allEvents = useMemo(() => {
    if (
      cmsData?.events &&
      Array.isArray(cmsData.events) &&
      cmsData.events.length > 0
    ) {
      return cmsData.events;
    }
    return initialEvents && initialEvents.length > 0 ? initialEvents : EVENTS;
  }, [cmsData, initialEvents]);

  const activeEvents = useMemo(() => {
    return allEvents.filter((ev) => !ev.hidden);
  }, [allEvents]);

  // Payment screenshot state
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [compressingScreenshot, setCompressingScreenshot] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [uploadedScreenshotData, setUploadedScreenshotData] = useState<{
    url: string;
    publicId: string;
  } | null>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const uploadPromiseRef = useRef<Promise<{ url: string; publicId: string } | null> | null>(null);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const wizardTopRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>("");
  const [issuedAt, setIssuedAt] = useState<string>("");
  const [receiptFeedback, setReceiptFeedback] = useState<
    "downloaded" | "shared" | "copied" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isServerBusy, setIsServerBusy] = useState(false);
  const [todayIsoDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (initialActivity) {
      setFormData((prev) => ({ ...prev, activity_slug: initialActivity }));
      setStep((prevStep) => {
        if (prevStep === "complete") {
          setDirection(-1);
          return 1;
        }
        return prevStep;
      });
    }
  }, [initialActivity]);

  // Revoke object URL on unmount/change
  useEffect(() => {
    return () => {
      if (screenshotPreview) {
        URL.revokeObjectURL(screenshotPreview);
      }
    };
  }, [screenshotPreview]);

  // Click outside to close activity dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        activityDropdownRef.current &&
        !activityDropdownRef.current.contains(event.target as Node)
      ) {
        setActivityDropdownOpen(false);
      }
    }
    if (activityDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activityDropdownOpen]);

  const selectedEvent = useMemo(() => {
    if (!formData.activity_slug) return undefined;
    const target = formData.activity_slug.trim().toLowerCase();
    return (
      activeEvents.find((e) => (e.slug || "").trim().toLowerCase() === target) ||
      allEvents.find((e) => (e.slug || "").trim().toLowerCase() === target)
    );
  }, [formData.activity_slug, activeEvents, allEvents]);

  const selectableEvents = useMemo(() => {
    const list = [...activeEvents];
    // If an activity is selected in formData but is hidden or not in activeEvents (e.g. newly published or testing), ensure it is present in selectable list
    if (
      selectedEvent &&
      !list.some(
        (e) => (e.slug || "").trim().toLowerCase() === (selectedEvent.slug || "").trim().toLowerCase()
      )
    ) {
      list.unshift(selectedEvent);
    }

    return list
      .filter((event) => {
        // Always include currently selected activity even if lifecycle is previous
        if (
          formData.activity_slug &&
          (event.slug || "").trim().toLowerCase() ===
            formData.activity_slug.trim().toLowerCase()
        ) {
          return true;
        }
        return getEventLifecycle(event, todayIsoDate) !== "previous";
      })
      .sort((a, b) => {
        const lifecycleOrder = {
          enrollment_open: 0,
          upcoming: 1,
          previous: 2,
        };
        const aLife = getEventLifecycle(a, todayIsoDate);
        const bLife = getEventLifecycle(b, todayIsoDate);
        const lifecycleDifference =
          (lifecycleOrder[aLife] ?? 1) - (lifecycleOrder[bLife] ?? 1);
        return (
          lifecycleDifference ||
          (a.startDate || "").localeCompare(b.startDate || "") ||
          (a.title || "").localeCompare(b.title || "")
        );
      });
  }, [activeEvents, selectedEvent, formData.activity_slug, todayIsoDate]);

  const activityPricing = useMemo(() => {
    return getActivityPricing(
      selectedEvent?.slug || formData.activity_slug,
      selectedEvent
    );
  }, [selectedEvent, formData.activity_slug]);

  // Selected event helper details for live preview, step navigation, and completion receipt
  const selectedDateObj = useMemo(() => {
    if (!selectedEvent?.startDate) return null;
    const d = new Date(
      selectedEvent.startDate.includes("T")
        ? selectedEvent.startDate
        : selectedEvent.startDate + "T00:00:00"
    );
    return isNaN(d.getTime()) ? null : d;
  }, [selectedEvent?.startDate]);

  const selectedMonthTheme = useMemo(() => {
    if (!selectedDateObj) return getMonthTheme(new Date().getMonth());
    return getMonthTheme(selectedDateObj.getMonth());
  }, [selectedDateObj]);

  const selectedIsOpen = useMemo(() => {
    return selectedEvent ? isOpenEnrollmentEvent(selectedEvent) : false;
  }, [selectedEvent]);

  const selectedLifecycle = useMemo(() => {
    return selectedEvent
      ? getEventLifecycle(selectedEvent, todayIsoDate)
      : null;
  }, [selectedEvent, todayIsoDate]);

  const activePaymentAccount =
    PAYMENT_METHODS.find((m) => m.id === paymentMethod) ?? PAYMENT_METHODS[0];

  const scrollWizardIntoView = () => {
    if (typeof window === "undefined") return;
    const formElement =
      document.getElementById("apply-form") || wizardTopRef.current;
    if (formElement) {
      const navOffset = window.innerWidth >= 768 ? 120 : 80;
      const elementPosition = formElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  const navigateToStep = (target: 1 | 2 | 3) => {
    if (typeof step === "number") {
      setDirection(target >= step ? 1 : -1);
    } else {
      setDirection(1);
    }
    setError(null);
    setStep(target);
    scrollWizardIntoView();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setError(null);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = (): boolean => {
    if (formData.full_name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (formData.phone.trim().length < 7) {
      setError("Please enter a valid phone / WhatsApp number.");
      return false;
    }
    if (formData.role.trim().length < 2) {
      setError("Please enter your role (e.g. Principal, Teacher, Parent).");
      return false;
    }
    if (!formData.activity_slug) {
      setError("Please select an activity from the dropdown.");
      return false;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy to continue.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    navigateToStep(2);
  };

  const handleTabClick = (tabNum: 1 | 2 | 3) => {
    if (step === "complete" || loading) return;
    if (tabNum === step) return;
    if (tabNum === 1) {
      navigateToStep(1);
      return;
    }
    if (tabNum === 2) {
      if (step === 1 && !validateStep1()) return;
      navigateToStep(2);
      return;
    }
    if (tabNum === 3) {
      if (step === 1 && !validateStep1()) return;
      if (bookingMode !== "secure_seat") {
        setError(
          "Select 'Secure Your Seat' in Step 02 to open Payment & Receipt Upload."
        );
        if (step !== 2) navigateToStep(2);
        return;
      }
      navigateToStep(3);
    }
  };

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      window.setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  const startBackgroundScreenshotUpload = (file: File) => {
    setIsUploadingScreenshot(true);
    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("purpose", "screenshot");
    uploadForm.append(
      "activity_slug",
      formData.activity_slug || "school-impact-summit-2026"
    );

    const promise = (async () => {
      try {
        const controller = new AbortController();
        const tId = setTimeout(() => controller.abort(), 12000);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
          signal: controller.signal,
        });
        clearTimeout(tId);
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.ok) {
          const data = {
            url: String(json.url || ""),
            publicId: String(json.publicId || ""),
          };
          setUploadedScreenshotData(data);
          return data;
        }
        return null;
      } catch {
        return null;
      } finally {
        setIsUploadingScreenshot(false);
      }
    })();

    uploadPromiseRef.current = promise;
  };

  const processScreenshotFile = async (file: File | undefined | null) => {
    if (!file) return;
    setError(null);
    setCompressingScreenshot(true);
    setUploadedScreenshotData(null);
    uploadPromiseRef.current = null;

    try {
      // 1. Validate if image is a genuine receipt screenshot (MIME, min dimensions, aspect ratio)
      const validation = await validateScreenshotFile(file);
      if (!validation.isValid) {
        setError(validation.error || "Please upload a valid receipt screenshot.");
        setCompressingScreenshot(false);
        return;
      }

      // 2. High-performance client-side compression:
      // Limits to 1400x1800 at 0.82 quality, reducing high-res phone captures down to ~150-280 KB
      // while keeping every transaction text & bank reference razor sharp
      const result = await compressScreenshotImage(file, {
        maxSizeBytes: 1.5 * 1024 * 1024,
        maxWidth: 1400,
        maxHeight: 1800,
        initialQuality: 0.82,
      });

      if (screenshotPreview) {
        URL.revokeObjectURL(screenshotPreview);
      }
      setScreenshotFile(result.compressedFile);
      setScreenshotPreview(result.previewUrl);
      setCompressionStats(result);

      // 3. Immediately kick off background upload so it's ready before user clicks submit!
      startBackgroundScreenshotUpload(result.compressedFile);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to optimize screenshot. Please try another image."
      );
    } finally {
      setCompressingScreenshot(false);
    }
  };

  const clearScreenshot = () => {
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setCompressionStats(null);
    setUploadedScreenshotData(null);
    uploadPromiseRef.current = null;
    setIsUploadingScreenshot(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const submitFinalApplication = async (mode: BookingMode) => {
    setError(null);
    setIsServerBusy(false);

    if (mode === "secure_seat" && !screenshotFile) {
      setError(
        "Please upload or capture your payment screenshot to secure your seat."
      );
      return;
    }

    setLoading(true);

    try {
      let uploadedScreenshotUrl = uploadedScreenshotData?.url || "";
      let uploadedScreenshotPublicId = uploadedScreenshotData?.publicId || "";

      // For secure_seat: ensure screenshot is uploaded
      if (mode === "secure_seat" && screenshotFile && !uploadedScreenshotUrl) {
        // If background upload is already running, wait for it
        if (uploadPromiseRef.current) {
          const awaited = await uploadPromiseRef.current;
          if (awaited?.url) {
            uploadedScreenshotUrl = awaited.url;
            uploadedScreenshotPublicId = awaited.publicId;
          }
        }

        // If not uploaded yet, upload now with robust 12s timeout
        if (!uploadedScreenshotUrl) {
          const uploadForm = new FormData();
          uploadForm.append("file", screenshotFile);
          uploadForm.append("purpose", "screenshot");
          uploadForm.append(
            "activity_slug",
            formData.activity_slug || "school-impact-summit-2026"
          );

          const uploadController = new AbortController();
          const uploadTimeout = setTimeout(() => uploadController.abort(), 12000);

          try {
            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: uploadForm,
              signal: uploadController.signal,
            });
            clearTimeout(uploadTimeout);
            const uploadJson = await uploadRes.json().catch(() => ({}));

            if (!uploadRes.ok || !uploadJson.ok) {
              if (uploadRes.status >= 500) {
                setIsServerBusy(true);
                throw new Error(
                  "Server is busy. Our team is working on that. Please apply later or contact us directly on WhatsApp."
                );
              }
              throw new Error(
                uploadJson.error ||
                  "Failed to upload payment screenshot. Please try again."
              );
            }
            uploadedScreenshotUrl = String(uploadJson.url || "");
            uploadedScreenshotPublicId = String(uploadJson.publicId || "");
          } catch (uploadErr: unknown) {
            clearTimeout(uploadTimeout);
            if (
              uploadErr instanceof Error &&
              uploadErr.message.includes("Server is busy")
            ) {
              throw uploadErr;
            }
            setIsServerBusy(true);
            throw new Error(
              "Server is busy. Our team is working on that. Please apply later or contact us directly on WhatsApp."
            );
          }
        }
      }

      // Fast Submission to /api/submit with 10s safeguard
      const submitController = new AbortController();
      const submitTimeout = setTimeout(() => submitController.abort(), 10000);

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: submitController.signal,
        body: JSON.stringify({
          type: "application",
          ...formData,
          booking_mode: mode,
          payment_method: mode === "secure_seat" ? paymentMethod : undefined,
          screenshot_name:
            mode === "secure_seat" && screenshotFile
              ? `${screenshotFile.name} (${formatFileSize(screenshotFile.size)})`
              : undefined,
          screenshot_url: uploadedScreenshotUrl || undefined,
          screenshot_public_id: uploadedScreenshotPublicId || undefined,
        }),
      });
      clearTimeout(submitTimeout);

      if (!res.ok) {
        setIsServerBusy(true);
        throw new Error(
          "Server is busy. Our team is working on that. Please apply later or contact us directly on WhatsApp."
        );
      }

      const json = await res.json().catch(() => ({}));
      if (!json || !json.ok) {
        setIsServerBusy(true);
        throw new Error(
          "Server is busy. Our team is working on that. Please apply later or contact us directly on WhatsApp."
        );
      }

      const refCode = formatBookingReference(
        typeof json.id === "string" && json.id.trim().length >= 4
          ? json.id
          : `TLC-26-${Array.from(crypto.getRandomValues(new Uint8Array(5)))
              .map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32])
              .join("")}`
      );

      const nowFormatted = new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      setSubmissionId(refCode);
      setIssuedAt(nowFormatted);
      setReceiptFeedback(null);
      setDirection(1);
      setStep("complete");
      setIsServerBusy(false);
      scrollWizardIntoView();
    } catch (err: unknown) {
      setIsServerBusy(true);
      setError(
        err instanceof Error
          ? err.message
          : "Server is busy. Our team is working on that. Please apply later or contact us directly on WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    clearScreenshot();
    setBookingMode(null);
    setPaymentMethod("ubl");
    setPaymentTab("iban");
    setAgreeTerms(false);
    setActivityDropdownOpen(false);
    setSubmissionId("");
    setIssuedAt("");
    setReceiptFeedback(null);
    setError(null);
    setIsServerBusy(false);
    setUploadedScreenshotData(null);
    uploadPromiseRef.current = null;
    setIsUploadingScreenshot(false);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      role: "",
      activity_slug: "",
      transaction_ref: "",
      message: "",
      website: "",
    });
    setDirection(-1);
    setStep(1);
  };

  const labelClass =
    "block text-xs font-black text-[#102E4D] uppercase tracking-wider mb-1.5";
  const getInputClass = (isFilled: boolean) =>
    `w-full px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#FF7900] focus:ring-4 focus:ring-[#FF7900]/15 ${
      isFilled
        ? "border-[#102E4D] bg-[#F7FCFB] text-[#102E4D]"
        : "border-[#C8EFE6] bg-white text-[#102E4D] hover:border-[#102E4D]/45"
    }`;
  const inputClass = getInputClass(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLETION CELEBRATION VIEW (Landscape Receipt + Top-to-Bottom Celebration)
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === "complete") {
    const firstName = formData.full_name.trim().split(" ")[0] || "Leader";
    const isSecured = bookingMode === "secure_seat";

    const formattedEventDate = selectedEvent?.startDate
      ? new Date(
          selectedEvent.startDate.includes("T")
            ? selectedEvent.startDate
            : selectedEvent.startDate + "T00:00:00"
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "2026 Schedule";

    const displayRef = formatBookingReference(submissionId);
    const completePricing = getActivityPricing(selectedEvent?.slug, selectedEvent);
    const feeLabel = completePricing.hasPricing
      ? completePricing.isEarlyBirdActive && completePricing.discountPercent
        ? `${completePricing.formattedPayablePrice} (Early Bird ${completePricing.discountPercent}% Off)`
        : completePricing.formattedPayablePrice
      : undefined;

    const receiptPayload: ReceiptPayload = {
      referenceId: displayRef,
      issuedAt:
        issuedAt ||
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      fullName: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role.trim(),
      activityTitle: selectedEvent?.title || "Leadership Activity",
      activityCategory: selectedEvent
        ? CATEGORY_LABELS[selectedEvent.category] || selectedEvent.category
        : "Leadership Program",
      activityDate: formattedEventDate,
      activitySchedule: selectedEvent?.schedule || "Full Day PKT",
      activityCity:
        selectedEvent?.locationNote || selectedEvent?.city || "Islamabad",
      isSecured,
      feeLabel,
      paymentMethodName: isSecured ? activePaymentAccount.name : undefined,
      transactionRef: formData.transaction_ref.trim() || undefined,
      screenshotName: screenshotFile?.name || undefined,
      screenshotPreviewUrl: screenshotPreview,
    };

    const handleDownloadReceipt = async () => {
      try {
        await downloadOfficialReceipt(receiptPayload);
        setReceiptFeedback("downloaded");
        window.setTimeout(() => setReceiptFeedback(null), 2600);
      } catch {
        // Fallback ignored cleanly
      }
    };

    const handlePrintReceipt = () => {
      printOfficialReceipt(receiptPayload);
    };

    const handleShareReceipt = async () => {
      try {
        const res = await shareOfficialReceipt(receiptPayload);
        if (res === "shared") {
          setReceiptFeedback("shared");
          window.setTimeout(() => setReceiptFeedback(null), 2600);
        } else if (res === "copied") {
          setReceiptFeedback("copied");
          window.setTimeout(() => setReceiptFeedback(null), 2600);
        }
      } catch {
        // Fallback ignored cleanly
      }
    };

    return (
      <div
        ref={wizardTopRef}
        className="relative rounded-3xl bg-gradient-to-br from-[#EFFBF8] via-white to-[#F0FDF4]/40 border-2 border-[#C8EFE6] p-3 sm:p-7 lg:p-9 shadow-xl overflow-hidden"
      >
        {/* Top Signature Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#102E4D] via-[#FF7900] to-[#FFC400] rounded-t-3xl pointer-events-none z-10" />

        {/* Continuous Ambient Celebration Particles (loops gently and smoothly) */}
        <ContinuousCelebration />

        {/* Initial Viewport Confetti Blast */}
        <PartyConfetti />

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-stretch transform-gpu"
        >
          {/* Left Landscape Column: Professional Success Crest + Thanks Message + Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between p-4 sm:p-6 lg:p-7 rounded-2xl bg-white/85 border-2 border-[#C8EFE6] shadow-sm backdrop-blur-xs text-center lg:text-left space-y-4">
            <div className="space-y-3.5">
              {/* Professional Success Setting (Clean Static Check + Proper Icon Styled Text) */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white flex items-center justify-center shadow-md shadow-[#16A34A]/20 ring-4 ring-[#EFFBF8] border border-white shrink-0">
                  <Check className="w-6 h-6 stroke-[3] text-white" />
                </div>

                <div className="space-y-0.5 text-left">
                  {/* Fully Styled Text (Not a badge) with Proper Icon & Increased Font Size */}
                  <div className="flex items-start gap-2 text-xs sm:text-base font-black uppercase tracking-wider text-[#15803D]">
                    {isSecured ? (
                      <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0" />
                    ) : (
                      <CalendarCheck2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                    )}
                    <span className="min-w-0">
                      {isSecured ? "Priority Seat Secured" : "Reservation Confirmed"}
                    </span>
                  </div>
                  <p className="text-[11.5px] font-semibold text-slate-400">
                    Official Booking Verified
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#102E4D] tracking-tight leading-tight mt-1">
                  {isSecured ? `Congratulations, ${firstName}!` : `Thank You, ${firstName}!`}
                </h3>

                <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mt-2 max-w-lg mx-auto lg:mx-0">
                  {isSecured
                    ? "Your priority seat has been locked and payment record registered. Save, print, or share your official booking receipt on the right."
                    : "Your provisional reservation has been recorded at zero upfront cost. Save, print, or share your official booking receipt on the right. Our team will contact you within 24 hours to confirm attendance."}
                </p>
              </div>

              {/* Next Steps Progress Indicators */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#EFFBF8]/80 border border-[#C8EFE6] grid grid-cols-3 gap-2 text-center text-xs">
                <div className="space-y-0.5">
                  <div className="w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center mx-auto text-[10px] font-black shadow-xs">
                    ✓
                  </div>
                  <p className="font-bold text-[#102E4D] text-[10.5px] sm:text-[11px] truncate">
                    {isSecured ? "Seat Secured" : "Spot Reserved"}
                  </p>
                  <span className="text-[9px] font-semibold text-emerald-700 block">
                    Confirmed
                  </span>
                </div>
                <div className="space-y-0.5 border-x border-[#C8EFE6]">
                  <div className="w-5 h-5 rounded-full bg-[#FF7900] text-white flex items-center justify-center mx-auto text-[10px] font-black shadow-xs">
                    2
                  </div>
                  <p className="font-bold text-[#102E4D] text-[10.5px] sm:text-[11px] truncate">
                    {isSecured ? "Payment Verified" : "Team Callback"}
                  </p>
                  <span className="text-[9px] font-semibold text-[#FF7900] block">
                    Within 24 Hours
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="w-5 h-5 rounded-full bg-white border border-[#C8EFE6] text-[#102E4D] flex items-center justify-center mx-auto text-[10.5px] font-black shadow-xs">
                    3
                  </div>
                  <p className="font-bold text-[#102E4D] text-[10.5px] sm:text-[11px] truncate">
                    Joining Pass
                  </p>
                  <span className="text-[9px] font-semibold text-slate-500 block">
                    Digital Kit
                  </span>
                </div>
              </div>
            </div>

            {/* Post-Completion Actions: Compact, Crisp Left/Right Aligned Buttons */}
            <div className="pt-3 border-t border-[#D7F5EF] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
              <a
                href={`https://wa.me/923192091249?text=${encodeURIComponent(
                  `Assalam-o-Alaikum! I have completed my ${
                    isSecured ? "Seat Confirmation" : "Reservation"
                  } (Ref #${displayRef}) for "${
                    selectedEvent?.title || "Upcoming Activity"
                  }" under ${formData.full_name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-10 w-full sm:w-auto h-9 px-3.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-[11.5px] sm:text-xs tracking-wide shadow-xs hover:shadow-sm transition-all inline-flex items-center justify-center gap-1.5 shrink-0 whitespace-normal cursor-pointer active:scale-98"
              >
                <FaWhatsapp className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Connect on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={resetWizard}
                className="min-h-10 w-full sm:w-auto h-9 px-3.5 rounded-lg border border-[#102E4D]/25 hover:border-[#102E4D] bg-white hover:bg-[#EFFBF8] text-[#102E4D] font-bold text-[11.5px] sm:text-xs tracking-wide shadow-2xs transition-all inline-flex items-center justify-center gap-1.5 shrink-0 whitespace-normal cursor-pointer active:scale-98 sm:ml-auto"
              >
                <span>Submit Another Application</span>
              </button>
            </div>
          </div>

          {/* Right Landscape Column: Compact Website-Themed Summary Receipt (Full Details in Download & Print) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="h-full rounded-2xl bg-white border-2 border-[#BCE8DF] text-left shadow-[0_14px_34px_rgba(16,46,77,0.08)] overflow-hidden flex flex-col justify-between">
              <div>
                {/* Top Website Colorful Accent Strip + Midnight Navy Header */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />
                <div className="bg-gradient-to-r from-[#001B33] via-[#102E4D] to-[#001B33] text-white px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border-2 border-[#FFC400]/70 p-1 shrink-0 flex items-center justify-center shadow-sm">
                      <img
                        src="/Logo_For_Navbar_Fotter.png"
                        alt="The Leadership Covenant"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#FFC400] block truncate">
                        The Leadership Covenant
                      </span>
                      <h4 className="font-serif font-bold text-base sm:text-[17px] text-white leading-snug truncate">
                        Official Booking Receipt
                      </h4>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto text-center shrink-0 bg-[#FFC400]/10 border border-[#FFC400]/50 rounded-xl px-3.5 py-2 shadow-2xs">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#D7F5EF] block">
                      Booking Ref
                    </span>
                    <span className="font-num text-xs sm:text-[13px] font-extrabold text-[#FFC400] break-all block mt-0.5">
                      #{displayRef}
                    </span>
                  </div>
                </div>

                {/* Website Mint Status & Issued Sub-Bar */}
                <div className="bg-gradient-to-r from-[#EFFBF8] via-[#EBF9F4] to-[#DDEFF7]/80 border-b border-[#C8EFE6] px-3 sm:px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="max-w-full inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-[10px] sm:text-[10.5px] font-extrabold uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
                    <span>
                      {isSecured ? "Seat Secured • UBL" : "Provisional Reserved"}
                    </span>
                  </span>
                  <span className="font-num text-[11px] font-semibold text-slate-500 break-words">
                    {receiptPayload.issuedAt}
                  </span>
                </div>

                {/* Concise Essential Summary Body (Full Details Exported in Download & Print) */}
                <div className="p-3 sm:p-5 space-y-3.5 text-xs sm:text-[13px]">
                  {selectedEvent && (
                    <div className="rounded-xl bg-gradient-to-r from-[#EFFBF8] to-[#DDEFF7]/60 border border-[#C8EFE6] px-4 py-3 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF7900] block">
                        Selected Activity
                      </span>
                      <div className="font-bold text-sm sm:text-[15px] text-[#102E4D] leading-snug">
                        {selectedEvent.title}
                      </div>
                      <div className="font-num text-xs font-semibold text-slate-600 flex items-start gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#102E4D]/70 shrink-0" />
                        <span className="min-w-0 break-words">
                          {formattedEventDate} • {selectedEvent.city}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="divide-y divide-slate-100 px-0.5">
                    <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 py-2">
                      <span className="text-slate-500 font-medium shrink-0">
                        Participant
                      </span>
                      <span className="w-full sm:w-auto font-bold text-[#102E4D] text-left sm:text-right break-words">
                        {formData.full_name}
                      </span>
                    </div>

                    <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 py-2">
                      <span className="text-slate-500 font-medium shrink-0">
                        Booking Option
                      </span>
                      <span className="w-full sm:w-auto font-bold text-[#102E4D] inline-flex items-center gap-1.5 text-left sm:text-right break-words">
                        {isSecured && (
                          <span className="w-4.5 h-4.5 rounded bg-white border border-slate-200 p-0.5 inline-flex items-center justify-center shrink-0">
                            <img
                              src={activePaymentAccount.logoSrc}
                              alt={activePaymentAccount.shortLabel}
                              className="w-full h-full object-contain"
                            />
                          </span>
                        )}
                        <span>
                          {isSecured
                            ? "Priority Seat (UBL Transfer)"
                            : "Reserve Now • Pay Later"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {isSecured && screenshotPreview && screenshotFile && (
                    <div className="rounded-xl bg-[#ECFDF5]/80 border border-[#A7F3D0] px-3 py-2 flex items-center gap-2.5">
                      <img
                        src={screenshotPreview}
                        alt="Uploaded payment proof"
                        className="w-8 h-8 rounded-lg object-cover border border-[#86EFAC] shrink-0"
                      />
                      <span className="text-xs font-bold text-[#15803D] truncate">
                        Payment Proof Attached ✓
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] font-medium text-slate-400 text-center pt-0.5">
                    {isSecured
                      ? "Download or print receipt for full registration & schedule details"
                      : "Download or print receipt for full details, UBL bank & QR payment"}
                  </p>
                </div>
              </div>

              {/* Receipt Footer Toolbar: Professional Compact Download • Print • Share Buttons */}
              <div className="px-3 sm:px-5 py-3.5 bg-gradient-to-r from-[#EFFBF8] via-white to-[#DDEFF7]/60 border-t-2 border-[#C8EFE6] space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    className="min-h-11 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#102E4D] to-[#001B33] hover:from-[#001B33] hover:to-[#001426] text-white text-[11.5px] sm:text-xs font-bold tracking-wide shadow-xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 border border-white/10"
                  >
                    {receiptFeedback === "downloaded" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#34D399]" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-[#FFC400]" />
                        <span>Download</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="min-h-11 w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#EFFBF8] text-[#102E4D] border-2 border-[#102E4D]/20 hover:border-[#FF7900] text-[11.5px] sm:text-xs font-bold tracking-wide shadow-2xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#FF7900]" />
                    <span>Print</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareReceipt}
                    className="min-h-11 w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#EFFBF8] text-[#102E4D] border-2 border-[#102E4D]/20 hover:border-[#102E4D] text-[11.5px] sm:text-xs font-bold tracking-wide shadow-2xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    {receiptFeedback === "shared" ||
                    receiptFeedback === "copied" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>
                          {receiptFeedback === "copied" ? "Copied" : "Shared"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>

                {receiptFeedback === "copied" && (
                  <p className="text-[11px] font-semibold text-[#15803D] text-center pt-0.5">
                    Receipt details copied to clipboard, ready to paste &amp; share!
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMATED TABS + UPPER STEP GUIDANCE + 3D LANDSCAPE WIZARD
  // ═══════════════════════════════════════════════════════════════════════════
  const stepsMeta: Array<{
    num: 1 | 2 | 3;
    title: string;
    subtitle: string;
  }> = [
    {
      num: 1,
      title: "Participant Details",
      subtitle: "Contact info & activity",
    },
    {
      num: 2,
      title: "Booking Option",
      subtitle: "Reservation or Secure Seat",
    },
    {
      num: 3,
      title:
        bookingMode === "reservation"
          ? "Instant Confirmation"
          : "Payment & Receipt",
      subtitle:
        bookingMode === "reservation"
          ? "Complete reservation"
          : "UBL Bank & Scan to Pay",
    },
  ];

  const activeStepNum: 1 | 2 | 3 = typeof step === "number" ? step : 1;

  return (
    <div ref={wizardTopRef} className="space-y-6">
      {/* 1. Animated Step Tabs Bar + Contextual Upper Guidance */}
      <div className="rounded-2xl bg-[#EFFBF8] border border-[#C8EFE6] p-2.5 sm:p-3 shadow-2xs space-y-3">
        {/* Interactive 3-Tab Strip with Sliding layoutId Pill */}
        <div
          role="tablist"
          aria-label="Application steps"
          className="grid grid-cols-1 md:grid-cols-3 gap-2"
        >
          {stepsMeta.map((tab) => {
            const isCurrent = activeStepNum === tab.num;
            const isCompleted = activeStepNum > tab.num;
            const isLocked =
              tab.num === 3 &&
              activeStepNum < 3 &&
              bookingMode !== "secure_seat";

            return (
              <button
                key={tab.num}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                onClick={() => handleTabClick(tab.num)}
                className={`relative rounded-xl px-4 py-3 text-left transition-colors flex items-center gap-3.5 overflow-hidden ${
                  isLocked
                    ? "opacity-65 cursor-pointer hover:opacity-90"
                    : "cursor-pointer"
                }`}
              >
                {isCurrent && (
                  <motion.div
                    layoutId="applyActiveStepPill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-[#102E4D] shadow-md"
                  />
                )}

                {!isCurrent && (
                  <div
                    className={`absolute inset-0 rounded-xl border transition-colors ${
                      isCompleted
                        ? "bg-white border-[#16A34A]/35 hover:border-[#16A34A]"
                        : "bg-white/75 border-[#D7F5EF] hover:bg-white"
                    }`}
                  />
                )}

                {/* Number / Check Badge */}
                <span
                  className={`relative z-10 w-9 h-9 rounded-xl font-num font-extrabold text-xs flex items-center justify-center shrink-0 transition-all ${
                    isCurrent
                      ? "bg-[#FF7900] text-white shadow-sm"
                      : isCompleted
                      ? "bg-[#16A34A] text-white"
                      : "bg-[#EFFBF8] border border-[#D7F5EF] text-[#102E4D]"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : `0${tab.num}`}
                </span>

                {/* Tab Title & Subtitle */}
                <div className="relative z-10 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs sm:text-sm font-extrabold truncate ${
                        isCurrent ? "text-white" : "text-[#102E4D]"
                      }`}
                    >
                      {tab.title}
                    </span>
                    <span
                      className={`font-num text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        isCurrent
                          ? "bg-white/15 text-[#FFC400]"
                          : isCompleted
                          ? "bg-[#ECFDF5] text-[#15803D]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isCurrent ? "Active" : isCompleted ? "Done" : "Step"}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isCurrent ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {tab.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Smooth Progress Bar */}
        <div className="px-2 pt-1 pb-0.5">
          <div className="h-1.5 w-full rounded-full bg-[#D7F5EF] overflow-hidden">
            <motion.div
              initial={false}
              animate={{
                width:
                  activeStepNum === 1
                    ? "34%"
                    : activeStepNum === 2
                    ? "68%"
                    : "100%",
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#102E4D] via-[#FF7900] to-[#FFC400]"
            />
          </div>
        </div>
      </div>

      {/* Inline Validation / Submission Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className={
              isServerBusy
                ? "p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                : "p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 shadow-2xs"
            }
          >
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle
                className={`w-5 h-5 shrink-0 ${
                  isServerBusy ? "text-[#FF7900]" : "text-red-500"
                } mt-0.5 sm:mt-0`}
              />
              <span className="font-semibold">{error}</span>
            </div>
            {isServerBusy && (
              <a
                href="https://wa.me/923192091249"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
              >
                <FaWhatsapp className="text-sm" />
                <span>WhatsApp (+92 319 2091249)</span>
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Smooth Animated Stage for Form Steps */}
      <div className="relative">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ─────────────────────── STEP 1: LANDSCAPE PARTICIPANT DETAILS + LIVE EVENT PREVIEW ─────────────────────── */}
          {step === 1 && (
            <motion.form
              key="step-1"
              custom={direction}
              initial={{
                opacity: 0,
                x: direction > 0 ? 28 : -28,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: direction > 0 ? -28 : 28,
              }}
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              onSubmit={handleStep1Next}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch transform-gpu"
            >
              {/* Honeypot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Left Landscape Column (7 cols): Form Inputs with Colorful Card & Border */}
              <div className="lg:col-span-7 relative z-30 space-y-4 sm:space-y-4.5 flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#EFFBF8]/60 via-white to-[#F0FDF4]/30 border-2 border-[#C8EFE6] shadow-sm overflow-visible">
                {/* Top Signature Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#102E4D] via-[#FF7900] to-[#FFC400] rounded-t-2xl pointer-events-none" />

                {/* Section Header */}
                <div className="pb-3 border-b border-[#C8EFE6]/60 flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#102E4D] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF7900]" />
                    Participant Information
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Step 01 of 03
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="apply-name" className={labelClass}>
                      Full Name <span className="text-[#FF7900]">*</span>
                    </label>
                    <input
                      id="apply-name"
                      name="full_name"
                      type="text"
                      required
                      placeholder="e.g. Salman Ahmed"
                      value={formData.full_name}
                      onChange={handleChange}
                      className={getInputClass(Boolean(formData.full_name.trim()))}
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label htmlFor="apply-email" className={labelClass}>
                      Email Address <span className="text-[#FF7900]">*</span>
                    </label>
                    <input
                      id="apply-email"
                      name="email"
                      type="email"
                      required
                      placeholder="salman@school.edu.pk"
                      value={formData.email}
                      onChange={handleChange}
                      className={getInputClass(Boolean(formData.email.trim()))}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="apply-phone" className={labelClass}>
                      Phone / WhatsApp <span className="text-[#FF7900]">*</span>
                    </label>
                    <input
                      id="apply-phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+92 300 1234567"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${getInputClass(Boolean(formData.phone.trim()))} font-num`}
                      autoComplete="tel"
                    />
                  </div>

                  <div>
                    <label htmlFor="apply-role" className={labelClass}>
                      Your Role / Title <span className="text-[#FF7900]">*</span>
                    </label>
                    <input
                      id="apply-role"
                      name="role"
                      type="text"
                      required
                      placeholder="e.g. Principal, Teacher, Parent"
                      value={formData.role}
                      onChange={handleChange}
                      className={getInputClass(Boolean(formData.role.trim()))}
                    />
                  </div>
                </div>

                {/* Custom Colorful & Professional Activity / Cohort Selector */}
                <div ref={activityDropdownRef} className="relative z-40">
                  <label htmlFor="apply-activity" className={labelClass}>
                    Select Activity / Cohort{" "}
                    <span className="text-[#FF7900]">*</span>
                  </label>

                  {/* Hidden Native Input for standard Form Validation & submission */}
                  <input
                    type="hidden"
                    id="apply-activity"
                    name="activity_slug"
                    value={formData.activity_slug}
                    required
                  />

                  {/* Custom Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setActivityDropdownOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={activityDropdownOpen}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer select-none shadow-2xs ${
                      activityDropdownOpen
                        ? "border-[#FF7900] ring-4 ring-[#FF7900]/15 bg-white"
                        : Boolean(selectedEvent)
                        ? "border-[#102E4D] bg-[#F7FCFB]"
                        : "border-[#C8EFE6] bg-white hover:border-[#102E4D]/45"
                    }`}
                  >
                    {selectedEvent ? (
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Mini Month Date Badge */}
                        <div className="w-[56px] sm:w-[60px] shrink-0 rounded-xl overflow-hidden bg-white border border-slate-200/90 shadow-2xs text-center flex flex-col justify-between">
                          <div
                            className={`bg-gradient-to-r ${selectedMonthTheme.gradient} text-white text-[9px] sm:text-[9.5px] font-black uppercase py-0.5 leading-none`}
                          >
                            {selectedDateObj
                              ? selectedDateObj.toLocaleDateString("en-US", {
                                  month: "short",
                                })
                              : "2026"}
                          </div>
                          <div className="font-num font-extrabold text-[17px] sm:text-[19px] leading-tight text-[#102E4D] py-0.5">
                            {selectedDateObj
                              ? selectedDateObj
                                  .getDate()
                                  .toString()
                                  .padStart(2, "0")
                              : "TLC"}
                          </div>
                          <div className="font-num text-[7.5px] sm:text-[8px] font-bold uppercase tracking-tight text-slate-500 pb-1 pt-0.5 whitespace-nowrap px-0.5 leading-none">
                            {selectedDateObj ? (
                              <>
                                {selectedDateObj.toLocaleDateString("en-US", {
                                  weekday: "short",
                                })}{" "}
                                · {selectedDateObj.getFullYear()}
                              </>
                            ) : (
                              selectedEvent.city || "Islamabad"
                            )}
                          </div>
                        </div>

                        {/* Title & Category Line */}
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] sm:text-[11.5px] font-extrabold uppercase tracking-wider text-[#FF7900] truncate leading-tight">
                            {CATEGORY_LABELS[selectedEvent.category] ||
                              selectedEvent.category}
                          </p>
                          <div className="font-bold text-sm sm:text-[15.5px] text-[#102E4D] truncate mt-0.5">
                            {selectedEvent.title}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 text-slate-400 min-w-0">
                        <CalendarCheck2 className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium truncate">
                          Choose an upcoming 2026 activity or cohort…
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      {selectedEvent && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border whitespace-nowrap hidden sm:inline-flex ${
                            selectedLifecycle === "previous"
                              ? "bg-[#FFEDD5] text-[#C2410C] border-[#FB923C]"
                              : selectedLifecycle === "enrollment_open"
                              ? "bg-[#DCFCE7] text-[#166534] border-[#4ADE80]"
                              : "bg-[#E0F2FE] text-[#075985] border-[#7DD3FC]"
                          }`}
                        >
                          {EVENT_LIFECYCLE_LABELS[
                            getEventLifecycle(selectedEvent, todayIsoDate)
                          ]}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          activityDropdownOpen ? "rotate-180 text-[#FF7900]" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Colorful Animated Dropdown Popover */}
                  <AnimatePresence>
                    {activityDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute z-[100] left-0 right-0 mt-2 max-h-72 sm:max-h-80 overflow-y-auto overscroll-contain rounded-2xl bg-white border-2 border-[#102E4D]/25 ring-2 ring-[#C8EFE6] shadow-2xl p-2 space-y-1 focus:outline-none scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-[#FF7900]"
                      >
                        <div className="px-3 py-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100">
                          <span>Upcoming 2026 Leadership Activities</span>
                          <span className="font-num text-[10px] text-slate-500">
                            {selectableEvents.length} Available
                          </span>
                        </div>

                        <div className="space-y-1 pt-1 pb-1">
                          {selectableEvents.map((event) => {
                            const isDateValid =
                              Boolean(event.startDate) &&
                              !isNaN(
                                new Date(
                                  event.startDate.includes("T")
                                    ? event.startDate
                                    : event.startDate + "T00:00:00"
                                ).getTime()
                              );
                            const d = isDateValid
                              ? new Date(
                                  event.startDate.includes("T")
                                    ? event.startDate
                                    : event.startDate + "T00:00:00"
                                )
                              : null;
                            const monthTheme = d
                              ? getMonthTheme(d.getMonth())
                              : getMonthTheme(0);
                            const isSelected =
                              (formData.activity_slug || "").trim().toLowerCase() ===
                              (event.slug || "").trim().toLowerCase();
                            const lifecycle = getEventLifecycle(
                              event,
                              todayIsoDate
                            );
                            const isOpen = lifecycle === "enrollment_open";
                            const weekdayShort = d
                              ? d.toLocaleDateString("en-US", {
                                  weekday: "short",
                                })
                              : "TLC";
                            const monthShort = d
                              ? d.toLocaleDateString("en-US", {
                                  month: "short",
                                })
                              : "2026";
                            const dayStr = d
                              ? d.getDate().toString().padStart(2, "0")
                              : "01";
                            const yearStr = d ? d.getFullYear() : 2026;

                            return (
                              <button
                                key={event.slug}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    activity_slug: event.slug,
                                  }));
                                  setActivityDropdownOpen(false);
                                  setError(null);
                                }}
                                className={`w-full text-left p-2 sm:p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer group ${
                                  isSelected
                                    ? "bg-[#EFFBF8] border-[#102E4D] ring-2 ring-[#102E4D]/10 shadow-xs"
                                    : "bg-white border-slate-100 hover:border-[#C8EFE6] hover:bg-[#EFFBF8]/50"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  {/* Compact Month Mini Date Badge */}
                                  <div className="w-[52px] sm:w-[56px] shrink-0 rounded-lg overflow-hidden bg-white border border-slate-200/90 shadow-2xs text-center flex flex-col justify-between group-hover:scale-105 transition-transform">
                                    <div
                                      className={`bg-gradient-to-r ${monthTheme.gradient} text-white text-[8.5px] sm:text-[9px] font-black uppercase py-0.5 leading-none`}
                                    >
                                      {monthShort}
                                    </div>
                                    <div className="font-num font-extrabold text-[16px] sm:text-[17px] leading-tight text-[#102E4D] py-0.5">
                                      {dayStr}
                                    </div>
                                    <div className="font-num text-[7px] sm:text-[7.5px] font-bold uppercase tracking-tight text-slate-500 pb-1 pt-0.5 whitespace-nowrap px-0.5 leading-none">
                                      {weekdayShort} · {yearStr}
                                    </div>
                                  </div>

                                  {/* Event Info: Clean Category & Title Only */}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10.5px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#FF7900] truncate leading-tight">
                                      {CATEGORY_LABELS[event.category] ||
                                        event.category}
                                    </p>
                                    <h5 className="font-bold text-[13.5px] sm:text-[15px] text-[#102E4D] group-hover:text-[#FF7900] transition-colors truncate mt-0.5">
                                      {event.title}
                                    </h5>
                                  </div>
                                </div>

                                {/* Status & Active Checkmark */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wide border whitespace-nowrap hidden sm:inline-flex ${
                                      lifecycle === "previous"
                                        ? "bg-[#FFEDD5] text-[#C2410C] border-[#FB923C]"
                                        : isOpen
                                        ? "bg-[#DCFCE7] text-[#166534] border-[#4ADE80]"
                                        : "bg-[#E0F2FE] text-[#075985] border-[#7DD3FC]"
                                    }`}
                                  >
                                    {EVENT_LIFECYCLE_LABELS[lifecycle]}
                                  </span>

                                  <div
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? "bg-[#102E4D] border-[#102E4D] text-[#FFC400]"
                                        : "border-slate-200 bg-white group-hover:border-slate-300"
                                    }`}
                                  >
                                    {isSelected ? (
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    ) : (
                                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400" />
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label htmlFor="apply-message" className={labelClass}>
                    Notes or Group Details{" "}
                    <span className="text-[11px] font-medium normal-case text-slate-400">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    id="apply-message"
                    name="message"
                    rows={2}
                    placeholder="Share your school/organization name, group size, or any questions..."
                    value={formData.message}
                    onChange={handleChange}
                    className={`${getInputClass(Boolean(formData.message.trim()))} resize-none min-h-[76px]`}
                  />
                </div>
              </div>

              {/* Right Column (5 cols): Streamlined Selected Activity Summary & Highlighted Pricing */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#001B33] via-[#052847] to-[#00162B] text-white p-5 sm:p-6 border-2 border-[#FFC400]/45 shadow-xl relative overflow-hidden ring-2 ring-[#FF7900]/25">
                {/* Top Signature Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#34D399] pointer-events-none" />

                <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-[#FFC400]/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-[#FF7900]/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#FFC400] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                      Selected Activity Summary
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                      Live Preview
                    </span>
                  </div>

                  {selectedEvent ? (
                    <div className="space-y-4">
                      {/* Compact Event Title & Date Badge */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-[64px] sm:w-[68px] shrink-0 rounded-xl overflow-hidden bg-white border border-white/20 shadow-sm text-center flex flex-col justify-between">
                          <div
                            className={`bg-gradient-to-r ${selectedMonthTheme.gradient} text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest py-0.5 sm:py-1 leading-none`}
                          >
                            {selectedDateObj
                              ? selectedDateObj.toLocaleDateString("en-US", {
                                  month: "short",
                                })
                              : "2026"}
                          </div>
                          <div className="font-num font-extrabold text-[20px] sm:text-[22px] leading-tight text-[#102E4D] tracking-tight pt-1 sm:pt-1.5">
                            {selectedDateObj
                              ? selectedDateObj
                                  .getDate()
                                  .toString()
                                  .padStart(2, "0")
                              : "TLC"}
                          </div>
                          <div className="font-num text-[8.5px] sm:text-[9px] font-semibold uppercase tracking-tight text-slate-500 pb-1.5 pt-0.5 whitespace-nowrap px-0.5">
                            {selectedDateObj ? (
                              <>
                                {selectedDateObj.toLocaleDateString("en-US", {
                                  weekday: "short",
                                })}{" "}
                                · {selectedDateObj.getFullYear()}
                              </>
                            ) : (
                              selectedEvent.city || "Islamabad"
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFC400]">
                            {CATEGORY_LABELS[selectedEvent.category] ||
                              selectedEvent.category ||
                              "Leadership Program"}
                          </p>
                          <h4 className="font-serif font-bold text-lg sm:text-xl text-white leading-snug mt-0.5">
                            {selectedEvent.title}
                          </h4>
                          <p
                            className={`text-xs font-extrabold tracking-wider mt-1 uppercase ${
                              selectedIsOpen
                                ? "text-[#34D399]"
                                : selectedEvent.statusTone === "limited"
                                ? "text-[#FBBF24]"
                                : "text-[#38BDF8]"
                            }`}
                          >
                            {(
                              EVENT_LIFECYCLE_LABELS[
                                getEventLifecycle(selectedEvent, todayIsoDate)
                              ] || "Upcoming Event"
                            ).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {/* Three Points (Duration, Location, Pass/Kit) Styled Micro-Pills */}
                      <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                        {selectedEvent.slug === "school-impact-summit-2026" ? (
                          <>
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                              <div className="w-6 h-6 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] flex items-center justify-center shrink-0">
                                <Hourglass className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-white">
                                1-Day Regional Summit
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                              <div className="w-6 h-6 rounded-lg bg-[#FF7900]/15 border border-[#FF7900]/30 text-[#FF7900] flex items-center justify-center shrink-0">
                                <MapPin className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-white">
                                Islamabad
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                              <div className="w-6 h-6 rounded-lg bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] flex items-center justify-center shrink-0">
                                <Award className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-white">
                                Summit Participant Kit &amp; Certificate
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                              <div className="w-6 h-6 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] flex items-center justify-center shrink-0">
                                <Hourglass className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-white">
                                {selectedEvent.duration ||
                                  "Scheduled Cohort Session"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                              <div className="w-6 h-6 rounded-lg bg-[#FF7900]/15 border border-[#FF7900]/30 text-[#FF7900] flex items-center justify-center shrink-0">
                                <MapPin className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-white">
                                {selectedEvent.venue
                                  ? `${selectedEvent.venue} (${selectedEvent.city || "Islamabad"})`
                                  : selectedEvent.city || "Islamabad, Pakistan"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                              <div className="w-6 h-6 rounded-lg bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] flex items-center justify-center shrink-0">
                                <Award className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-white">
                                {selectedEvent.certificate ||
                                  selectedEvent.format ||
                                  "Official Certificate of Completion"}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Prominent Bolded & Highlighted Pricing & Offer Box */}
                      {activityPricing.hasPricing ? (
                        <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-br from-[#FFC400]/20 via-[#FF7900]/12 to-[#16A34A]/10 border-2 border-[#FFC400]/50 shadow-inner space-y-3 relative overflow-hidden ring-1 ring-white/10">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#FFC400] flex items-center gap-1.5">
                              <BadgePercent className="w-4 h-4 text-[#FFC400]" />
                              Registration Fee &amp; Offer
                            </span>
                            {activityPricing.isEarlyBirdActive && (
                              <span className="shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white text-[10px] font-black uppercase tracking-wider shadow-xs border border-white/20">
                                20% OFF
                              </span>
                            )}
                          </div>

                          {activityPricing.isEarlyBirdActive ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                                <span className="font-num font-black text-2xl sm:text-3xl lg:text-4xl text-[#FFC400] tracking-tight shrink-0 drop-shadow-xs">
                                  {activityPricing.formattedPayablePrice}
                                </span>
                                <span className="font-num text-xs sm:text-sm text-slate-300 font-semibold line-through decoration-red-400/80 decoration-[1.5px] shrink-0">
                                  {activityPricing.formattedRegularPrice}
                                </span>
                                <span className="shrink-0 whitespace-nowrap text-[11px] sm:text-xs font-black font-num text-[#34D399] bg-[#34D399]/20 border border-[#34D399]/40 px-2.5 py-0.5 rounded-md inline-flex items-center">
                                  Save {activityPricing.formattedSavings}
                                </span>
                              </div>

                              <div className="pt-2 border-t border-white/15 flex items-start gap-2 text-xs text-slate-200">
                                <Clock className="w-4 h-4 text-[#FF7900] shrink-0 mt-0.5" />
                                <p className="leading-relaxed">
                                  <strong className="text-white">
                                    20% Early Bird Offer:
                                  </strong>{" "}
                                  Valid till{" "}
                                  <strong className="text-[#FFC400]">
                                    {activityPricing.deadlineText}
                                  </strong>
                                  .
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="font-num font-black text-3xl text-white">
                                {activityPricing.formattedPayablePrice}
                              </div>
                              <p className="text-xs text-slate-300">
                                Standard Delegate Registration Fee.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-white/6 border border-white/10 space-y-1 text-xs">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Activity Enrollment
                          </div>
                          <div className="font-semibold text-white">
                            Provisional Hold Available
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Hold your spot with zero upfront cost in Step 02, or
                            secure priority confirmed admission.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-2.5">
                      <div className="w-11 h-11 rounded-xl bg-white/10 text-[#FFC400] flex items-center justify-center mx-auto">
                        <CalendarCheck2 className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-white">
                        No Activity Selected Yet
                      </p>
                      <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                        Select an activity from the dropdown on the left to
                        preview date, venue, and registration fee details here.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 1 Action Bar: Terms & Conditions Checkbox + Next CTA with Colorful Border Container */}
              <div className="lg:col-span-12 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#EFFBF8] via-white to-[#EFFBF8] border-2 border-[#C8EFE6] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <label className="flex items-start sm:items-center gap-3 cursor-pointer text-xs sm:text-sm text-slate-700 font-semibold select-none group">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (e.target.checked) setError(null);
                    }}
                    className="mt-0.5 sm:mt-0 w-4.5 h-4.5 rounded border-2 border-slate-300 text-[#FF7900] focus:ring-[#FF7900] accent-[#FF7900] cursor-pointer"
                  />
                  <span>
                    I agree to the{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#102E4D] font-bold underline hover:text-[#FF7900]"
                    >
                      Terms &amp; Conditions
                    </a>{" "}
                    and Privacy Policy.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7900] via-[#FF8C1A] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[0_6px_20px_rgba(255,121,0,0.32)] hover:shadow-[0_8px_26px_rgba(255,121,0,0.45)] transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0 border border-white/25"
                >
                  <span>Next: Choose Booking Option</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </motion.form>
          )}

          {/* ─────────── STEP 2: BOOKING OPTION (RESERVATION vs SECURE YOUR SEAT) ─────────── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              initial={{
                opacity: 0,
                x: direction > 0 ? 28 : -28,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: direction > 0 ? -28 : 28,
              }}
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              className="space-y-6 transform-gpu"
            >
              {/* Landscape Applicant Context Bar */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#EFFBF8] via-white to-[#EFFBF8] border-2 border-[#C8EFE6] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#102E4D]" />
                    Participant:{" "}
                    <strong className="text-[#102E4D]">
                      {formData.full_name}
                    </strong>{" "}
                    ({formData.role})
                  </span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="font-num text-slate-600 font-semibold">
                    {formData.phone}
                  </span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="truncate max-w-[260px] sm:max-w-none">
                    Activity:{" "}
                    <strong className="text-[#102E4D]">
                      {selectedEvent?.title}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToStep(1)}
                  className="px-3 py-1 rounded-lg border border-[#FF7900]/30 bg-[#FFF8F1] hover:bg-[#FF7900] text-[#FF7900] hover:text-white text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                >
                  Edit Details
                </button>
              </div>

              {/* Two Compact, Colorful & High-Performance Interactive Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                {/* OPTION 1: RESERVATION (Pay Later • Zero Cost Hold) */}
                <motion.button
                  type="button"
                  whileHover={{ y: -2, transition: { duration: 0.15, ease: "easeOut" } }}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => {
                    setError(null);
                    setBookingMode("reservation");
                  }}
                  className={`text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden select-none ${
                    bookingMode === "reservation"
                      ? "border-[#102E4D] bg-gradient-to-br from-[#EFFBF8] via-white to-[#EFFBF8]/90 shadow-lg ring-4 ring-[#102E4D]/15"
                      : "border-[#C8EFE6] bg-white hover:border-[#102E4D]/45 hover:shadow-sm"
                  }`}
                >
                  {/* Top Active Accent Line */}
                  {bookingMode === "reservation" && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#102E4D] pointer-events-none" />
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#102E4D] text-[#FFC400] flex items-center justify-center shadow-sm shrink-0">
                          <CalendarCheck2 className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#102E4D]/10 text-[#102E4D] border border-[#102E4D]/20">
                            Zero Upfront Cost
                          </span>
                          <h4 className="font-serif font-extrabold text-lg sm:text-xl text-[#102E4D] mt-0.5 leading-tight">
                            Reservation
                          </h4>
                        </div>
                      </div>

                      <div
                        className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          bookingMode === "reservation"
                            ? "border-[#102E4D] bg-[#102E4D] text-white shadow-xs"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {bookingMode === "reservation" && (
                          <Check className="w-3 h-3 stroke-[3]" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Hold your provisional spot for free. Our team will contact you within 24 hours to confirm attendance.
                    </p>

                    {/* Cost Preview */}
                    <div className="p-2.5 rounded-xl bg-white/80 border border-[#C8EFE6] flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">Advance Due</span>
                      <span className="font-num font-black text-sm text-[#102E4D]">PKR 0 (Free Hold)</span>
                    </div>

                    {/* 2 Clear, Required Bullet Points */}
                    <div className="space-y-2 pt-2.5 border-t border-[#C8EFE6]/70 text-xs text-slate-700 font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <span>Instant provisional hold (No advance fee)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <span>Pay later after details are confirmed</span>
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* OPTION 2: SECURE YOUR SEAT (Exclusive UBL Official Payment) */}
                <motion.button
                  type="button"
                  whileHover={{ y: -2, transition: { duration: 0.15, ease: "easeOut" } }}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => {
                    setError(null);
                    setBookingMode("secure_seat");
                  }}
                  className={`text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden select-none ${
                    bookingMode === "secure_seat"
                      ? "border-[#FF7900] bg-gradient-to-br from-[#FFF8F1] via-white to-[#FFF8F1]/90 shadow-lg ring-4 ring-[#FF7900]/20"
                      : "border-[#C8EFE6] bg-white hover:border-[#FF7900]/55 hover:shadow-sm"
                  }`}
                >
                  {/* Top Active Accent Line */}
                  {bookingMode === "secure_seat" && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF7900] via-[#FFC400] to-[#E56D00] pointer-events-none" />
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7900] to-[#E56D00] text-white flex items-center justify-center shadow-sm shrink-0">
                          <ShieldCheck className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/30">
                            Guaranteed Priority
                          </span>
                          <h4 className="font-serif font-extrabold text-lg sm:text-xl text-[#102E4D] mt-0.5 leading-tight">
                            Secure Your Seat
                          </h4>
                        </div>
                      </div>

                      <div
                        className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          bookingMode === "secure_seat"
                            ? "border-[#FF7900] bg-[#FF7900] text-white shadow-xs"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {bookingMode === "secure_seat" && (
                          <Check className="w-3 h-3 stroke-[3]" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Lock your official confirmed admission right away via United Bank Limited (UBL) transfer or instant Scan to Pay.
                    </p>

                    {/* Compact Integrated UBL Method & Fee Strip */}
                    <div className="p-2.5 rounded-xl bg-white/95 border border-[#FF7900]/30 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src="/Social%20Icons/UBL-Bank-Logo.png"
                          alt="United Bank Limited"
                          className="w-6 h-6 object-contain shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[#FF7900] leading-none">
                            Official Partner
                          </p>
                          <p className="text-xs font-black text-[#102E4D] truncate mt-0.5">
                            United Bank Limited (UBL)
                          </p>
                        </div>
                      </div>

                      {activityPricing.hasPricing ? (
                        <div className="text-right shrink-0 font-num">
                          <span className="font-black text-sm text-[#FF7900] block leading-none">
                            {activityPricing.formattedPayablePrice}
                          </span>
                          {activityPricing.isEarlyBirdActive && (
                            <span className="text-[9px] font-bold text-[#16A34A] leading-tight block mt-0.5">
                              20% Early Bird
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="shrink-0 text-[10px] font-extrabold text-[#005696] bg-[#EFFBF8] border border-[#C8EFE6] px-2 py-0.5 rounded-md">
                          IBAN &amp; QR
                        </span>
                      )}
                    </div>

                    {/* 2 Clear, Required Bullet Points (UBL Exclusive) */}
                    <div className="space-y-2 pt-2.5 border-t border-[#FF7900]/25 text-xs text-slate-700 font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF7900] shrink-0" />
                        <span>100% Guaranteed priority admission &amp; kit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#FF7900] shrink-0" />
                        <span>Official UBL IBAN &amp; Instant Scan QR</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Step 2 Landscape Action Bar in Colorful Styled Container */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#EFFBF8] via-white to-[#EFFBF8] border-2 border-[#C8EFE6] shadow-xs flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigateToStep(1)}
                  className="px-6 py-3.5 rounded-xl border-2 border-[#C8EFE6] bg-white hover:bg-slate-50 hover:border-[#102E4D]/40 text-xs sm:text-sm font-bold text-[#102E4D] uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Details</span>
                </button>

                {bookingMode === "reservation" ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => submitFinalApplication("reservation")}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#166534] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[0_6px_20px_rgba(22,163,74,0.32)] hover:shadow-[0_8px_26px_rgba(22,163,74,0.45)] transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Completing Reservation...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Reservation Now</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : bookingMode === "secure_seat" ? (
                  <button
                    type="button"
                    onClick={() => navigateToStep(3)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7900] via-[#FF8C1A] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[0_6px_20px_rgba(255,121,0,0.32)] hover:shadow-[0_8px_26px_rgba(255,121,0,0.45)] transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 border border-white/25"
                  >
                    <span>Next: Payment &amp; Screenshot Upload</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setError(
                        "Please select either Reservation or Secure Your Seat above to continue."
                      )
                    }
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Select a Booking Option Above</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ─────── STEP 3: PAYMENT & RECEIPT UPLOAD ─────── */}
          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              initial={{
                opacity: 0,
                x: direction > 0 ? 28 : -28,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: direction > 0 ? -28 : 28,
              }}
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              className="space-y-6 transform-gpu"
            >
              {/* Side-by-Side Landscape Grid: Left = Payment Accounts, Right = Receipt Upload */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* LEFT COLUMN (6 cols): Official UBL Corporate Account & QR Scan to Pay */}
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <h4 className="font-serif font-extrabold text-xl text-[#102E4D]">
                      <span className="font-num text-[#FF7900] mr-1">1.</span>{" "}
                      Payment Method &amp; Account
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Pay via United Bank Limited (UBL) IBAN transfer or scan the official QR code below.
                    </p>
                  </div>

                  {/* Dynamic Activity Fee Indicator if Pricing is Configured */}
                  {activityPricing.hasPricing && (
                    <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#EFFBF8] to-[#FFF8F1] border border-[#C8EFE6] flex items-center justify-between gap-3 text-xs sm:text-sm">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                          Registration Fee Payable
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-num font-extrabold text-[#102E4D] text-lg">
                            {activityPricing.formattedPayablePrice}
                          </span>
                          {activityPricing.isEarlyBirdActive && (
                            <span className="font-num text-xs sm:text-sm text-slate-400 font-semibold line-through decoration-red-400/80 decoration-[1.5px]">
                              {activityPricing.formattedRegularPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      {activityPricing.isEarlyBirdActive && (
                        <span className="px-2.5 py-1 rounded-full bg-[#16A34A] text-white text-[10.5px] font-black uppercase tracking-wider shadow-2xs">
                          20% Early Bird
                        </span>
                      )}
                    </div>
                  )}

                  {/* Dual Mode Switcher: Bank Transfer (IBAN) vs Scan to Pay (QR) */}
                  <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#EFFBF8] border border-[#C8EFE6]">
                    <button
                      type="button"
                      onClick={() => setPaymentTab("iban")}
                      className={`relative py-3 px-3 rounded-xl text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        paymentTab === "iban"
                          ? "text-[#102E4D]"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {paymentTab === "iban" ? (
                        <motion.div
                          layoutId="applyPaymentViewTab"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }}
                          className="absolute inset-0 rounded-xl bg-white shadow-sm border-2 border-[#005696]"
                        />
                      ) : (
                        <div className="absolute inset-0 rounded-xl bg-white/50 hover:bg-white/80 transition-colors" />
                      )}
                      <Landmark
                        className={`relative z-10 w-4 h-4 ${
                          paymentTab === "iban"
                            ? "text-[#005696]"
                            : "text-slate-500"
                        }`}
                      />
                      <span className="relative z-10">Bank Transfer (IBAN)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentTab("qr")}
                      className={`relative py-3 px-3 rounded-xl text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        paymentTab === "qr"
                          ? "text-[#102E4D]"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {paymentTab === "qr" ? (
                        <motion.div
                          layoutId="applyPaymentViewTab"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }}
                          className="absolute inset-0 rounded-xl bg-white shadow-sm border-2 border-[#005696]"
                        />
                      ) : (
                        <div className="absolute inset-0 rounded-xl bg-white/50 hover:bg-white/80 transition-colors" />
                      )}
                      <QrCode
                        className={`relative z-10 w-4 h-4 ${
                          paymentTab === "qr"
                            ? "text-[#005696]"
                            : "text-slate-500"
                        }`}
                      />
                      <span className="relative z-10">Scan to Pay (QR)</span>
                    </button>
                  </div>

                  {/* Active Payment View: IBAN or QR */}
                  <AnimatePresence mode="wait">
                    {paymentTab === "iban" ? (
                      <motion.div
                        key="view-iban"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="p-5 sm:p-6 rounded-2xl bg-[#001B33] text-white border border-white/10 shadow-lg space-y-4 relative overflow-hidden"
                      >
                        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#005696]/30 blur-2xl pointer-events-none" />

                        {/* Card Header with UBL Logo */}
                        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/10 relative z-10">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md border border-white/25">
                              <img
                                src={activePaymentAccount.logoSrc}
                                alt={activePaymentAccount.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#FFC400] block">
                                {activePaymentAccount.subtitle}
                              </span>
                              <h5 className="font-serif font-bold text-lg sm:text-xl text-white mt-0.5 truncate">
                                {activePaymentAccount.name}
                              </h5>
                            </div>
                          </div>
                          <span className="hidden sm:inline-flex px-3 py-1 rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider text-white shadow-xs shrink-0 bg-[#005696]">
                            Official Account
                          </span>
                        </div>

                        {/* Account Details */}
                        <div className="space-y-3.5 text-xs sm:text-sm relative z-10">
                          <div>
                            <div className="text-[10.5px] uppercase tracking-wider text-slate-400 font-semibold">
                              Title of Account
                            </div>
                            <div className="font-bold text-white text-base sm:text-lg mt-0.5">
                              {activePaymentAccount.accountTitle}
                            </div>
                          </div>

                          <div>
                            <div className="text-[10.5px] uppercase tracking-wider text-slate-400 font-semibold">
                              IBAN (Inter-Bank Funds Transfer / Raast)
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-1 p-3 rounded-xl bg-white/6 border border-white/10">
                              <span className="font-num font-extrabold text-sm sm:text-base text-[#FFC400] tracking-wider break-all">
                                {activePaymentAccount.iban}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(activePaymentAccount.iban, "iban")
                                }
                                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-auto"
                              >
                                {copiedField === "iban" ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-[#34D399]" />
                                    <span>Copied IBAN</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy IBAN</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Supported Networks Note */}
                        {activePaymentAccount.branchNote && (
                          <p className="text-xs text-slate-300 leading-relaxed pt-1 relative z-10">
                            {activePaymentAccount.branchNote}
                          </p>
                        )}

                        {/* Switch to QR banner */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 relative z-10">
                          <span className="text-[11px] text-slate-400">
                            Have a mobile banking app?
                          </span>
                          <button
                            type="button"
                            onClick={() => setPaymentTab("qr")}
                            className="text-xs font-bold text-[#FFC400] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Switch to Scan to Pay QR &rarr;</span>
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="view-qr"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="p-5 sm:p-6 rounded-2xl bg-[#001B33] text-white border border-white/10 shadow-lg space-y-4 relative overflow-hidden"
                      >
                        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#005696]/30 blur-2xl pointer-events-none" />

                        {/* Card Header with UBL Logo */}
                        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/10 relative z-10">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md border border-white/25">
                              <img
                                src={activePaymentAccount.logoSrc}
                                alt={activePaymentAccount.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#FFC400] block">
                                United Bank Limited
                              </span>
                              <h5 className="font-serif font-bold text-lg sm:text-xl text-white mt-0.5 truncate">
                                Official UBL QR Code
                              </h5>
                            </div>
                          </div>
                          <span className="hidden sm:inline-flex px-3 py-1 rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider text-white shadow-xs shrink-0 bg-[#005696]">
                            Scan to Pay
                          </span>
                        </div>

                        {/* QR Code Presentation Box */}
                        <div className="p-4 rounded-2xl bg-white text-center space-y-3 relative z-10 shadow-sm border border-slate-200">
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Scan with Any Banking / Wallet App
                          </p>
                          <div className="relative inline-block mx-auto p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                            <img
                              src={activePaymentAccount.qrCodeSrc}
                              alt="UBL Official Scan to Pay QR Code"
                              className="w-52 h-52 sm:w-60 sm:h-60 object-contain mx-auto rounded-lg"
                            />
                          </div>
                          <div className="pt-1">
                            <div className="text-xs font-bold text-[#102E4D]">
                              {activePaymentAccount.accountTitle}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Scan via UBL Digital App or any Raast-enabled banking app.
                            </p>
                          </div>
                        </div>

                        {/* Quick IBAN Copy Bar below QR */}
                        <div className="p-3 rounded-xl bg-white/6 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                              Need IBAN instead?
                            </span>
                            <span className="font-num text-xs text-[#FFC400] font-bold truncate block">
                              {activePaymentAccount.iban}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(activePaymentAccount.iban, "iban")
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {copiedField === "iban" ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#34D399]" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy IBAN</span>
                                </>
                              )}
                            </button>
                            <a
                              href={activePaymentAccount.qrCodeSrc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Open QR Full Size"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Enlarge</span>
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* RIGHT COLUMN (6 cols): Upload Screenshot (Gallery / Camera) + Transaction Ref */}
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <h4 className="font-serif font-extrabold text-xl text-[#102E4D]">
                      <span className="font-num text-[#FF7900] mr-1">2.</span>{" "}
                      Upload Payment Screenshot{" "}
                      <span className="text-[#FF7900]">*</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Attach your transfer receipt from Gallery or snap a live photo using Camera.
                    </p>
                  </div>

                  {/* Hidden File Inputs: Gallery & Camera */}
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => processScreenshotFile(e.target.files?.[0])}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => processScreenshotFile(e.target.files?.[0])}
                    className="hidden"
                  />

                  {compressingScreenshot ? (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-[#FF7900] bg-[#FFF8F1] text-center">
                      <Loader2 className="w-8 h-8 text-[#FF7900] animate-spin mx-auto mb-3" />
                      <p className="text-sm font-extrabold text-[#102E4D]">
                        Validating &amp; Optimizing Receipt Image...
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Ensuring sharp text &amp; compressing below the 2 MB limit
                      </p>
                    </div>
                  ) : !screenshotFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        processScreenshotFile(e.dataTransfer.files?.[0]);
                      }}
                      className={`p-6 sm:p-7 rounded-2xl border-2 border-dashed text-center transition-all ${
                        isDragging
                          ? "border-[#FF7900] bg-[#FFF8F1]"
                          : "border-[#C5EDE4] bg-[#EFFBF8]/65 hover:border-[#FF7900]/60"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white border border-[#D7F5EF] text-[#FF7900] flex items-center justify-center mx-auto mb-3 shadow-xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-extrabold text-[#102E4D]">
                        Drop Receipt Screenshot Here
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Supports PNG, JPG, WEBP or HEIC • Auto-compressed to{" "}
                        <span className="font-num font-bold text-[#102E4D]">under 2 MB</span>
                      </p>

                      <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#102E4D] hover:bg-[#001B33] text-white text-xs font-bold tracking-wide shadow-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ImagePlus className="w-4 h-4 text-[#FFC400]" />
                          <span>Upload from Gallery</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-[#EFFBF8] text-[#102E4D] border border-[#102E4D]/25 hover:border-[#102E4D] text-xs font-bold tracking-wide shadow-xs transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-[#FF7900]" />
                          <span>Take Photo (Camera)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-[#ECFDF5]/65 border-2 border-[#16A34A]/45 flex flex-col sm:flex-row items-center gap-4">
                      {screenshotPreview && (
                        <a
                          href={screenshotPreview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-24 h-24 rounded-xl overflow-hidden border border-[#16A34A]/30 bg-white shrink-0 shadow-xs block"
                          title="Preview uploaded screenshot"
                        >
                          <img
                            src={screenshotPreview}
                            alt="Uploaded payment screenshot preview"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      )}

                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-extrabold text-[#15803D] uppercase tracking-wider">
                          <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Receipt Attached</span>
                          </span>
                          {isUploadingScreenshot && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF7900] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Syncing...
                            </span>
                          )}
                          {uploadedScreenshotData && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Check className="w-3 h-3" />
                              Ready to Submit
                            </span>
                          )}
                        </div>
                        <p className="font-num text-sm font-bold text-[#102E4D] truncate mt-1">
                          {screenshotFile.name}
                        </p>
                        <p className="font-num text-xs text-slate-500 mt-0.5">
                          {formatFileSize(screenshotFile.size)}
                          {compressionStats && compressionStats.savingsPercent > 0 && (
                            <span className="text-[#15803D] font-bold ml-1.5">
                              (Saved {compressionStats.savingsPercent}% • &lt; 2 MB)
                            </span>
                          )}{" "}
                          • {activePaymentAccount.name}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#102E4D] text-xs font-bold text-[#102E4D] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ImagePlus className="w-3.5 h-3.5 text-[#FF7900]" />
                            <span>Gallery</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#102E4D] text-xs font-bold text-[#102E4D] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#FF7900]" />
                            <span>Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={clearScreenshot}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Optional Transaction ID field */}
                  <div>
                    <label htmlFor="apply-tid" className={labelClass}>
                      Transaction ID / Reference{" "}
                      <span className="text-[11px] font-medium normal-case text-slate-400">
                        (Optional)
                      </span>
                    </label>
                    <input
                      id="apply-tid"
                      name="transaction_ref"
                      type="text"
                      placeholder="e.g. TID 8392019482"
                      value={formData.transaction_ref}
                      onChange={handleChange}
                      className={`${getInputClass(Boolean(formData.transaction_ref.trim()))} font-num`}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3 Landscape Action Bar */}
              <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#D7F5EF]">
                <button
                  type="button"
                  onClick={() => navigateToStep(2)}
                  className="px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-[#102E4D] uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Booking Options</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => submitFinalApplication("secure_seat")}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Securing Your Seat...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete &amp; Secure My Seat</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
