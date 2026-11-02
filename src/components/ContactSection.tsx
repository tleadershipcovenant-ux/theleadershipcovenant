"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdLocationOn,
  MdMail,
  MdArrowForward,
  MdCheckCircle,
  MdAccessTime,
} from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import {
  User,
  Mail,
  Phone,
  Building2,
  Compass,
  MessageSquareText,
  AlertCircle,
  Loader2,
  Check,
  Copy,
  ChevronDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { INTEREST_OPTIONS, FORM_COPY, type InterestValue } from "@/content/forms";

const SOCIAL_CHANNELS = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/franklincovey-education-north-region/",
    iconSrc: "/Social%20Icons/linkedin-app-icon.svg",
    bgClass: "",
  },
  {
    name: "Facebook",
    href: "https://web.facebook.com/profile.php?id=61592161942804",
    iconSrc: "/Social%20Icons/facebook-round-color-icon.svg",
    bgClass: "bg-[#0866FF]",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/franklincoveyeducation_north/",
    iconSrc: "/Social%20Icons/ig-instagram-icon.svg",
    bgClass: "",
  },
] as const;

const QUICK_TOPICS = [
  { value: "general", label: "General" },
  { value: "leader-in-me", label: "Leader in Me" },
  { value: "leaderu", label: "LeaderU" },
  { value: "professional-development", label: "Educator PD" },
  { value: "leadership-camps", label: "Student Camps" },
  { value: "partnership", label: "School Partnership" },
] as const;

// Enhanced metadata for "I'm Interested In" dropdown options
const INTEREST_DETAILS: Record<
  string,
  { label: string; tag: string; badgeColor: string }
> = {
  general: {
    label: "General Enquiry",
    tag: "Information & Guidance",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  "leader-in-me": {
    label: "Leader in Me",
    tag: "Whole-School Culture",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  leaderu: {
    label: "LeaderU",
    tag: "Higher Education & Youth",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  "professional-development": {
    label: "Professional Development",
    tag: "Educators & Teachers",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  "leadership-camps": {
    label: "Leadership Camps",
    tag: "Student Immersion",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
  },
  "family-sessions": {
    label: "Family Sessions",
    tag: "Parents & Community",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  "open-sessions": {
    label: "Open Sessions",
    tag: "Public Cohorts",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
  },
  podcast: {
    label: "Podcast & Media",
    tag: "Thought Leadership",
    badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
  partnership: {
    label: "School Partnership & MOUs",
    tag: "Institutional Alliance",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    interest: "general",
    message: "",
    website: "", // honeypot
  });

  // Validation state tracking
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    organization: false,
    message: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({
    name: null,
    email: null,
    phone: null,
    organization: null,
    message: null,
  });

  // Dropdown open state for "I'm Interested In"
  const [interestDropdownOpen, setInterestDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isServerBusy, setIsServerBusy] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setInterestDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync URL query params with selected interest
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const interestParam = params.get("interest");
    if (
      interestParam &&
      INTEREST_OPTIONS.some((opt) => opt.value === interestParam)
    ) {
      setFormData((prev) => ({ ...prev, interest: interestParam }));
    }

    if (
      window.location.hash === "#enquiry-form" ||
      window.location.hash === "#enquiry" ||
      interestParam
    ) {
      const scrollTimer = window.setTimeout(() => {
        const formEl = document.getElementById("enquiry-form");
        if (formEl) {
          formEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 120);
      return () => window.clearTimeout(scrollTimer);
    }
  }, []);

  // Field validation rules
  const validateField = (name: string, value: string): string | null => {
    const clean = value.trim();
    switch (name) {
      case "name":
        if (!clean) return "Your full name is required.";
        if (clean.length < 2) return "Name must be at least 2 characters.";
        return null;
      case "email":
        if (!clean) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
          return "Please enter a valid email address (e.g. name@school.edu.pk).";
        }
        return null;
      case "phone": {
        if (!clean) return "Phone / WhatsApp number is required.";
        const digits = clean.replace(/\D/g, "");
        if (digits.length < 7) {
          return "Please enter a valid phone number with at least 7 digits.";
        }
        return null;
      }
      case "organization":
        if (!clean) return "School or organization name is required.";
        if (clean.length < 2) return "Please enter your full institution name.";
        return null;
      case "message":
        if (!clean) return "Your message is required.";
        if (clean.length < 10) {
          return "Please enter at least 10 characters to describe your enquiry.";
        }
        return null;
      default:
        return null;
    }
  };

  const handleFieldChange = (
    field: "name" | "email" | "phone" | "organization" | "message",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage("");
    setIsServerBusy(false);

    if (touched[field]) {
      const err = validateField(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleFieldBlur = (
    field: "name" | "email" | "phone" | "organization" | "message"
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsServerBusy(false);

    // Validate all fields on submit
    const nErr = validateField("name", formData.name);
    const eErr = validateField("email", formData.email);
    const pErr = validateField("phone", formData.phone);
    const oErr = validateField("organization", formData.organization);
    const mErr = validateField("message", formData.message);

    setTouched({
      name: true,
      email: true,
      phone: true,
      organization: true,
      message: true,
    });

    setFieldErrors({
      name: nErr,
      email: eErr,
      phone: pErr,
      organization: oErr,
      message: mErr,
    });

    if (nErr || eErr || pErr || oErr || mErr) {
      setErrorMessage("Please correct the highlighted fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          full_name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          organization: formData.organization.trim(),
          interest: formData.interest,
          message: formData.message.trim(),
          website: formData.website,
        }),
      });

      // Handle server or database outage gracefully
      if (!response.ok) {
        setIsServerBusy(true);
        setErrorMessage(
          "Server is busy. Our team is working on that. Please try again in a few moments or contact us directly on WhatsApp."
        );
        return;
      }

      const json = await response.json().catch(() => ({}));

      if (!json || !json.ok) {
        setIsServerBusy(true);
        setErrorMessage(
          "Server is busy. Our team is working on that. Please try again in a few moments or contact us directly on WhatsApp."
        );
        return;
      }

      const refCode =
        typeof json.id === "string"
          ? json.id.replace(/^sub_/, "TLC-").toUpperCase()
          : `TLC-INQ-${Date.now().toString(36).toUpperCase()}`;

      setReferenceId(refCode);
      setFormSubmitted(true);
      setIsServerBusy(false);
    } catch (err: unknown) {
      console.warn("[CONTACT SUBMISSION NETWORK/SERVER ERROR]", err);
      setIsServerBusy(true);
      setErrorMessage(
        "Server is busy. Our team is working on that. Please try again in a few moments or contact us directly on WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormSubmitted(false);
    setReferenceId("");
    setErrorMessage("");
    setIsServerBusy(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      organization: "",
      interest: "general",
      message: "",
      website: "",
    });
    setTouched({
      name: false,
      email: false,
      phone: false,
      organization: false,
      message: false,
    });
    setFieldErrors({
      name: null,
      email: null,
      phone: null,
      organization: null,
      message: null,
    });
  };

  /**
   * Helper to return rich border styles:
   * 1. Invalid & Touched -> Rose colored border + warning background
   * 2. Has Input Added -> Mint/Emerald colored border + subtle glow
   * 3. Focused -> Orange brand border
   * 4. Default -> Soft mint border
   */
  const getFieldInputClass = (
    fieldName: "name" | "email" | "phone" | "organization" | "message",
    value: string
  ) => {
    const isFieldTouched = touched[fieldName];
    const isError = Boolean(fieldErrors[fieldName]);
    const hasValue = Boolean(value && value.trim().length > 0);

    const base =
      "w-full rounded-xl text-sm font-semibold transition-all duration-200 shadow-2xs focus:outline-none";

    if (isFieldTouched && isError) {
      return `${base} border-2 border-rose-400 bg-rose-50/25 text-rose-950 placeholder:text-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-200/50`;
    }

    if (hasValue && !isError) {
      return `${base} border-2 border-[#10B981] bg-[#F0FDF4]/40 text-[#102E4D] placeholder:text-slate-400 focus:border-[#FF7900] focus:ring-4 focus:ring-[#FF7900]/15`;
    }

    return `${base} border border-[#C8EFE6] bg-[#EFFBF8]/50 hover:border-[#A2E3D4] text-[#102E4D] placeholder:text-slate-400 focus:border-[#FF7900] focus:ring-4 focus:ring-[#FF7900]/15 focus:bg-white`;
  };

  const labelClass =
    "block text-xs font-extrabold text-[#102E4D] uppercase tracking-wider";

  const selectedInterestMeta =
    INTEREST_DETAILS[formData.interest] || {
      label: formData.interest,
      tag: "Programme",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    };

  return (
    <section
      className="w-full py-12 sm:py-18 lg:py-22 relative overflow-hidden scroll-mt-24"
      id="contact"
    >
      {/* Background ambient accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#D7F5EF]/60 blur-3xl pointer-events-none transform-gpu" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#DDEFF7]/60 blur-3xl pointer-events-none transform-gpu" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Executive Contact Container */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl border border-[#C8EFE6] shadow-[0_24px_60px_-15px_rgba(16,46,77,0.12)] overflow-hidden transform-gpu will-change-transform"
        >
          {/* Top signature gradient line */}
          <div className="h-2 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900]" />

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT PANEL (5 cols): Executive Direct Channels & Social Connect */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#001B33] via-[#06233F] to-[#001325] text-white p-6 sm:p-9 lg:p-11 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
              {/* Subtle Ambient Accents */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FFC400]/[0.08] rounded-full blur-3xl pointer-events-none transform-gpu" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#FF7900]/[0.08] rounded-full blur-3xl pointer-events-none transform-gpu" />

              <div className="relative z-10">
                {/* Panel Header */}
                <div className="pb-6 border-b border-white/10">
                  <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#FFC400] mb-2.5">
                    <span className="w-5 h-[2px] bg-[#FFC400] inline-block" />
                    <span>Direct Channels</span>
                  </span>
                  <h3 className="font-serif font-extrabold text-2xl sm:text-[30px] text-white leading-tight tracking-tight">
                    Reach our team directly.
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-slate-300/90 mt-2.5 leading-relaxed">
                    Connect with our Islamabad office via WhatsApp, email, or in
                    person for school partnerships, workshops, and camp enquiries.
                  </p>
                </div>

                {/* Clean Structured Contact List */}
                <div className="divide-y divide-white/10">
                  {/* 1. Visit Us */}
                  <div className="py-4.5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/12 text-[#FFC400] flex items-center justify-center shrink-0 mt-0.5">
                      <MdLocationOn className="text-lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400 block">
                        Visit Our Office
                      </span>
                      <p className="text-sm font-bold text-white mt-0.5">
                        The Leadership Covenant
                      </p>
                      <p className="font-num text-xs sm:text-[13px] text-slate-300 mt-0.5 leading-relaxed">
                        171, St. 68, F-10/3, Islamabad, Pakistan
                      </p>
                    </div>
                  </div>

                  {/* 2. WhatsApp Us */}
                  <div className="py-4.5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] flex items-center justify-center shrink-0 mt-0.5">
                      <FaWhatsapp className="text-lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400">
                          Phone &amp; WhatsApp
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy("+923192091249", "phone")}
                          className="text-[11px] font-semibold text-slate-400 hover:text-[#FFC400] inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy number"
                        >
                          {copiedKey === "phone" ? (
                            <>
                              <Check className="w-3 h-3 text-[#34D399]" />
                              <span className="text-[#34D399]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-num text-sm sm:text-[15px] font-extrabold text-white mt-0.5 tracking-wide">
                        +92 319 2091249
                      </p>
                      <a
                        href="https://wa.me/923192091249"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FFC400] hover:text-white font-bold text-xs mt-1 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Message Ubaid on WhatsApp</span>
                        <MdArrowForward className="text-sm" />
                      </a>
                    </div>
                  </div>

                  {/* 3. Email Us */}
                  <div className="py-4.5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/12 text-[#FFC400] flex items-center justify-center shrink-0 mt-0.5">
                      <MdMail className="text-lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400">
                          Official Email
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy("theleadershipcovenant@gmail.com", "email")
                          }
                          className="text-[11px] font-semibold text-slate-400 hover:text-[#FFC400] inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy email"
                        >
                          {copiedKey === "email" ? (
                            <>
                              <Check className="w-3 h-3 text-[#34D399]" />
                              <span className="text-[#34D399]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <a
                        href="mailto:theleadershipcovenant@gmail.com"
                        className="text-xs sm:text-[13.5px] font-semibold text-white hover:text-[#FFC400] transition-colors mt-1 block truncate"
                      >
                        theleadershipcovenant@gmail.com
                      </a>
                      <p className="text-[11.5px] text-slate-400 mt-0.5">
                        Direct inbox for proposals &amp; institutional queries
                      </p>
                    </div>
                  </div>

                  {/* 4. Advisory Hours */}
                  <div className="py-4.5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/12 text-[#FFC400] flex items-center justify-center shrink-0 mt-0.5">
                      <MdAccessTime className="text-lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-slate-400 block">
                        Advisory Hours
                      </span>
                      <p className="font-num text-xs sm:text-[13.5px] font-bold text-white mt-0.5">
                        Monday – Saturday • 9:00 AM – 6:00 PM
                      </p>
                      <p className="text-[11.5px] text-slate-400 mt-0.5">
                        Pakistan Standard Time (PKT)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anchored Bottom Social Media Bar */}
              <div className="relative z-10 pt-5 mt-4 border-t border-white/12 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFC400] block">
                    Follow Us
                  </span>
                  <span className="text-[11.5px] text-slate-400">
                    Official social channels
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {SOCIAL_CHANNELS.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${social.name}`}
                      title={social.name}
                      className={`w-8 h-8 rounded-[7px] overflow-hidden inline-flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 transition-transform duration-200 ${social.bgClass}`}
                    >
                      <img
                        src={social.iconSrc}
                        alt={social.name}
                        className="w-full h-full object-contain"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL (7 cols): Executive Enquiry Form */}
            <div
              id="enquiry-form"
              className="lg:col-span-7 p-6 sm:p-9 lg:p-11 bg-white flex flex-col justify-center scroll-mt-28 md:scroll-mt-36 relative"
            >
              <span
                id="enquiry"
                className="absolute -top-32 opacity-0 pointer-events-none"
              />

              {/* Form Header */}
              <div className="pb-5 mb-6 border-b border-slate-100">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF7900] block mb-1">
                  Advisory &amp; General Enquiries
                </span>
                <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#102E4D]">
                  Enquiry Form
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  {FORM_COPY.contact.helper}
                </p>
              </div>

              {/* SUCCESS STATE */}
              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="p-6 sm:p-9 rounded-3xl bg-gradient-to-br from-[#EFFBF8] via-white to-[#F0FDF4] border-2 border-[#C8EFE6] text-center space-y-5 shadow-lg relative overflow-hidden"
                >
                  {/* Decorative top ribbon */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#10B981] via-[#FFC400] to-[#FF7900]" />

                  {/* Celebratory Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#10B981]/25 ring-4 ring-[#10B981]/20">
                    <MdCheckCircle className="text-3xl" />
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#059669] text-xs font-extrabold uppercase tracking-widest mb-2 border border-[#10B981]/30">
                      <Check className="w-3.5 h-3.5" /> Enquiry Received
                    </span>
                    <h4 className="font-serif font-black text-2xl sm:text-3xl text-[#102E4D]">
                      Thank You for Reaching Out!
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1.5 leading-relaxed font-medium">
                      Your inquiry has been successfully sent to our leadership
                      team. We will review your request and get back to you
                      within one working day.
                    </p>
                  </div>

                  {/* Reference Code Card with Quick Copy */}
                  {referenceId && (
                    <div className="inline-flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-[#C8EFE6] shadow-xs">
                      <div className="text-left">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Reference Code
                        </span>
                        <span className="font-num font-black text-sm sm:text-base text-[#102E4D]">
                          {referenceId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(referenceId, "ref")}
                        className="p-1.5 rounded-lg bg-[#EFFBF8] hover:bg-[#D7F5EF] text-[#102E4D] transition-colors cursor-pointer"
                        title="Copy Reference Code"
                      >
                        {copiedKey === "ref" ? (
                          <Check className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Submission Summary Details */}
                  <div className="bg-white/90 rounded-2xl p-4 border border-[#C8EFE6] text-left text-xs space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Name:</span>
                      <span className="font-bold text-[#102E4D]">
                        {formData.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>School / Organization:</span>
                      <span className="font-bold text-[#102E4D]">
                        {formData.organization}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Topic / Interest:</span>
                      <span className="font-bold text-[#FF7900]">
                        {INTEREST_OPTIONS.find((o) => o.value === formData.interest)
                          ?.label || formData.interest}
                      </span>
                    </div>
                  </div>

                  {/* Primary & Secondary Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/923192091249?text=${encodeURIComponent(
                        `Assalam-o-Alaikum! I just submitted an enquiry (Ref #${referenceId}) regarding ${
                          INTEREST_OPTIONS.find((o) => o.value === formData.interest)
                            ?.label || formData.interest
                        } from ${formData.organization || formData.name}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold tracking-wide shadow-md shadow-[#25D366]/25 transition-all inline-flex items-center justify-center gap-2"
                    >
                      <FaWhatsapp className="text-base" />
                      <span>Chat Directly on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-[#102E4D]/20 hover:border-[#102E4D] bg-white hover:bg-[#EFFBF8] text-[#102E4D] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Send Another Enquiry
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* THE ENQUIRY FORM */
                <form
                  onSubmit={handleSubmitInquiry}
                  noValidate
                  className="space-y-5"
                >
                  {/* Honeypot Field */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="contact-website">Website</label>
                    <input
                      id="contact-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                    />
                  </div>

                  {/* DEDICATED SERVER BUSY ALERT */}
                  <AnimatePresence>
                    {isServerBusy && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm space-y-3 shadow-xs"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#FF7900] flex items-center justify-center shrink-0 mt-0.5">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-sm sm:text-base text-[#102E4D]">
                              Server is currently busy
                            </h5>
                            <p className="text-slate-600 mt-0.5 leading-relaxed font-medium">
                              Our team is actively working on that. Please try
                              submitting again or connect directly with our
                              representative on WhatsApp for instant assistance.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          <a
                            href="https://wa.me/923192091249"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <FaWhatsapp className="text-sm" />
                            <span>WhatsApp Team (+92 319 2091249)</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setIsServerBusy(false);
                              setErrorMessage("");
                            }}
                            className="px-4 py-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-[#102E4D] text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Dismiss &amp; Retry</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Standard Form Error Alert */}
                  <AnimatePresence>
                    {errorMessage && !isServerBusy && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <span className="font-semibold">{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Quick Topic Chips */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Quick Topic Selection
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Tap to prefill interest
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {QUICK_TOPICS.map((topic) => {
                        const isSelected = formData.interest === topic.value;
                        return (
                          <button
                            key={topic.value}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                interest: topic.value,
                              });
                              setInterestDropdownOpen(false);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-[#102E4D] text-[#FFC400] border-[#102E4D] shadow-xs scale-102"
                                : "bg-[#EFFBF8] text-[#102E4D] border-[#D7F5EF] hover:bg-[#D7F5EF] hover:border-[#C8EFE6]"
                            }`}
                          >
                            {topic.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Row 1: Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="name" className={labelClass}>
                          Your Name <span className="text-[#FF7900]">*</span>
                        </label>
                        {touched.name && !fieldErrors.name && formData.name && (
                          <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <User
                          className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors ${
                            touched.name && fieldErrors.name
                              ? "text-rose-500"
                              : formData.name
                              ? "text-[#10B981]"
                              : "text-slate-400"
                          }`}
                        />
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleFieldChange("name", e.target.value)
                          }
                          onBlur={() => handleFieldBlur("name")}
                          className={`${getFieldInputClass(
                            "name",
                            formData.name
                          )} pl-10 pr-4 py-3 sm:py-3.5`}
                          placeholder="e.g. Salman Ahmed"
                          autoComplete="name"
                        />
                      </div>
                      {touched.name && fieldErrors.name && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="email" className={labelClass}>
                          Email Address <span className="text-[#FF7900]">*</span>
                        </label>
                        {touched.email && !fieldErrors.email && formData.email && (
                          <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <Mail
                          className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors ${
                            touched.email && fieldErrors.email
                              ? "text-rose-500"
                              : formData.email
                              ? "text-[#10B981]"
                              : "text-slate-400"
                          }`}
                        />
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleFieldChange("email", e.target.value)
                          }
                          onBlur={() => handleFieldBlur("email")}
                          className={`${getFieldInputClass(
                            "email",
                            formData.email
                          )} pl-10 pr-4 py-3 sm:py-3.5`}
                          placeholder="salman@school.edu.pk"
                          autoComplete="email"
                        />
                      </div>
                      {touched.email && fieldErrors.email && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone / WhatsApp & School / Organization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="contact-phone" className={labelClass}>
                          Phone / WhatsApp <span className="text-[#FF7900]">*</span>
                        </label>
                        {touched.phone && !fieldErrors.phone && formData.phone && (
                          <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <Phone
                          className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors ${
                            touched.phone && fieldErrors.phone
                              ? "text-rose-500"
                              : formData.phone
                              ? "text-[#10B981]"
                              : "text-slate-400"
                          }`}
                        />
                        <input
                          id="contact-phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleFieldChange("phone", e.target.value)
                          }
                          onBlur={() => handleFieldBlur("phone")}
                          className={`${getFieldInputClass(
                            "phone",
                            formData.phone
                          )} pl-10 pr-4 py-3 sm:py-3.5 font-num`}
                          placeholder="+92 300 1234567"
                          autoComplete="tel"
                        />
                      </div>
                      {touched.phone && fieldErrors.phone && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* School / Organization */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="organization" className={labelClass}>
                          School / Organization{" "}
                          <span className="text-[#FF7900]">*</span>
                        </label>
                        {touched.organization &&
                          !fieldErrors.organization &&
                          formData.organization && (
                            <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1">
                              <Check className="w-3 h-3" /> Valid
                            </span>
                          )}
                      </div>
                      <div className="relative flex items-center">
                        <Building2
                          className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors ${
                            touched.organization && fieldErrors.organization
                              ? "text-rose-500"
                              : formData.organization
                              ? "text-[#10B981]"
                              : "text-slate-400"
                          }`}
                        />
                        <input
                          id="organization"
                          type="text"
                          value={formData.organization}
                          onChange={(e) =>
                            handleFieldChange("organization", e.target.value)
                          }
                          onBlur={() => handleFieldBlur("organization")}
                          className={`${getFieldInputClass(
                            "organization",
                            formData.organization
                          )} pl-10 pr-4 py-3 sm:py-3.5`}
                          placeholder="e.g. Beaconhouse / Army Public School"
                          autoComplete="organization"
                        />
                      </div>
                      {touched.organization && fieldErrors.organization && (
                        <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.organization}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: HIGHLY STYLED CUSTOM "I'M INTERESTED IN" DROPDOWN */}
                  <div className="relative" ref={dropdownRef}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="interest-trigger" className={labelClass}>
                        I&apos;m Interested In{" "}
                        <span className="text-[#FF7900]">*</span>
                      </label>
                      <span className="text-[11px] text-[#10B981] font-bold inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Selected:{" "}
                        {selectedInterestMeta.label}
                      </span>
                    </div>

                    {/* Accessible Trigger Button */}
                    <button
                      id="interest-trigger"
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={interestDropdownOpen}
                      onClick={() =>
                        setInterestDropdownOpen((prev) => !prev)
                      }
                      className={`w-full text-left pl-10 pr-10 py-3 sm:py-3.5 rounded-xl border-2 transition-all relative flex items-center justify-between cursor-pointer ${
                        interestDropdownOpen
                          ? "border-[#FF7900] bg-white ring-4 ring-[#FF7900]/15"
                          : "border-[#10B981] bg-[#F0FDF4]/35 hover:bg-[#F0FDF4]/60"
                      }`}
                    >
                      <Compass
                        className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors ${
                          interestDropdownOpen
                            ? "text-[#FF7900]"
                            : "text-[#10B981]"
                        }`}
                      />

                      <div className="min-w-0 pr-2">
                        <span className="text-sm font-bold text-[#102E4D] block truncate">
                          {selectedInterestMeta.label}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {selectedInterestMeta.tag}
                        </span>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 absolute right-3.5 transition-transform duration-200 ${
                          interestDropdownOpen ? "rotate-180 text-[#FF7900]" : ""
                        }`}
                      />
                    </button>

                    {/* Styled Floating Dropdown Menu for All Devices */}
                    <AnimatePresence>
                      {interestDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.18 }}
                          role="listbox"
                          className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border-2 border-[#C8EFE6] shadow-[0_20px_45px_-10px_rgba(0,27,51,0.2)] overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 backdrop-blur-md"
                        >
                          <div className="p-2 bg-[#F8FCFB] border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                            <span>Select Your Area of Interest</span>
                            <span>{INTEREST_OPTIONS.length} Options</span>
                          </div>

                          {INTEREST_OPTIONS.map((opt) => {
                            const isSelected = formData.interest === opt.value;
                            const meta = INTEREST_DETAILS[opt.value] || {
                              label: opt.label,
                              tag: "Programme",
                              badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
                            };

                            return (
                              <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    interest: opt.value,
                                  });
                                  setInterestDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-[#EFFBF8] text-[#102E4D]"
                                    : "hover:bg-[#F8FCFB] text-slate-700"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-sm ${
                                        isSelected
                                          ? "font-extrabold text-[#102E4D]"
                                          : "font-semibold"
                                      }`}
                                    >
                                      {opt.label}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.badgeColor} hidden sm:inline-block`}
                                    >
                                      {meta.tag}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5 sm:hidden">
                                    {meta.tag}
                                  </p>
                                </div>

                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <Check className="w-3 h-3" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Hidden Native Select for Browser Autofill & Accessibility */}
                    <select
                      id="interest"
                      name="interest"
                      tabIndex={-1}
                      aria-hidden="true"
                      value={formData.interest}
                      onChange={(e) =>
                        setFormData({ ...formData, interest: e.target.value })
                      }
                      className="sr-only pointer-events-none"
                    >
                      {INTEREST_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Row 4: Message */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="message" className={labelClass}>
                        Your Message <span className="text-[#FF7900]">*</span>
                      </label>
                      {touched.message && !fieldErrors.message && formData.message && (
                        <span className="text-[11px] text-emerald-600 font-bold inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> Valid
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <MessageSquareText
                        className={`w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none transition-colors ${
                          touched.message && fieldErrors.message
                            ? "text-rose-500"
                            : formData.message
                            ? "text-[#10B981]"
                            : "text-slate-400"
                        }`}
                      />
                      <textarea
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          handleFieldChange("message", e.target.value)
                        }
                        onBlur={() => handleFieldBlur("message")}
                        className={`${getFieldInputClass(
                          "message",
                          formData.message
                        )} pl-10 pr-4 py-3 sm:py-3.5 resize-none leading-relaxed`}
                        placeholder="Tell us about your school, goals, cohort size, or specific enquiry..."
                      />
                    </div>
                    {touched.message && fieldErrors.message && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Action Row */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      Prefer instant chat?{" "}
                      <a
                        href="https://wa.me/923192091249"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#102E4D] hover:text-[#FF7900] underline transition-colors"
                      >
                        WhatsApp our team (+92 319 2091249)
                      </a>
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7900] via-[#FF6D00] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-98 min-h-[48px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <span>{FORM_COPY.contact.submit}</span>
                          <MdArrowForward className="text-base" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
