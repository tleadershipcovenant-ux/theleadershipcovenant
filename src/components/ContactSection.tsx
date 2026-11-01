"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { INTEREST_OPTIONS, FORM_COPY } from "@/content/forms";

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

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const interestParam = params.get("interest");
    if (
      interestParam &&
      INTEREST_OPTIONS.some((opt) => opt.value === interestParam)
    ) {
      setFormData((prev) => ({ ...prev, interest: interestParam }));
    }

    // Auto-scroll directly to the Enquiry Form when navigated with hash or interest query
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

    if (formData.name.trim().length < 2) {
      setErrorMessage("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (formData.organization.trim().length < 2) {
      setErrorMessage("Please enter your school or organization name.");
      return;
    }
    if (formData.message.trim().length < 5) {
      setErrorMessage("Please enter a brief message (at least 5 characters).");
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
          phone: formData.phone.trim() || undefined,
          organization: formData.organization.trim(),
          interest: formData.interest,
          message: formData.message.trim(),
          website: formData.website,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.ok) {
        throw new Error(
          json.error || "Unable to submit your message. Please check your inputs."
        );
      }

      const refCode =
        typeof json.id === "string"
          ? json.id.replace(/^sub_/, "TLC-").toUpperCase()
          : `TLC-${Date.now().toString(36).toUpperCase()}`;

      setReferenceId(refCode);
      setFormSubmitted(true);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong while sending your message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass =
    "block text-xs font-extrabold text-[#102E4D] uppercase tracking-wider mb-1.5";
  const inputWrapperClass = "relative flex items-center";
  const inputClass =
    "w-full pl-10 pr-4 py-3 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/45 focus:bg-white text-sm text-[#102E4D] placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-3 focus:ring-[#FF7900]/15 transition-all shadow-2xs";

  return (
    <section
      className="w-full py-14 sm:py-20 relative overflow-hidden scroll-mt-24"
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
          <div className="h-2 w-full bg-gradient-to-r from-[#102E4D] via-[#FFC400] to-[#FF7900]" />

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT PANEL (5 cols): Executive Direct Channels & Social Connect */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#001B33] via-[#06233F] to-[#001325] text-white p-7 sm:p-9 lg:p-11 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
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
                    Connect with our Islamabad office via WhatsApp, email, or in person for school partnerships, workshops, and camp enquiries.
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
                            handleCopy(
                              "theleadershipcovenant@gmail.com",
                              "email"
                            )
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

              {/* Anchored Bottom Social Media Bar — Clean, Uniform, Borderless Icons */}
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
              className="lg:col-span-7 p-7 sm:p-9 lg:p-11 bg-white flex flex-col justify-center scroll-mt-28 md:scroll-mt-36 relative"
            >
              {/* Anchor alias */}
              <span id="enquiry" className="absolute -top-32 opacity-0 pointer-events-none" />
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

              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="p-7 sm:p-9 rounded-2xl bg-gradient-to-br from-[#EFFBF8] via-white to-[#EFFBF8]/70 border border-[#C8EFE6] text-center space-y-4 shadow-xs"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white flex items-center justify-center mx-auto shadow-md">
                    <MdCheckCircle className="text-3xl" />
                  </div>

                  {referenceId && (
                    <span className="inline-block font-num text-xs font-extrabold text-[#102E4D] bg-white px-3 py-1 rounded-lg border border-[#D7F5EF]">
                      Enquiry Ref #{referenceId}
                    </span>
                  )}

                  <h4 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#102E4D]">
                    Message Received!
                  </h4>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    {FORM_COPY.contact.success}
                  </p>

                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/923192091249?text=${encodeURIComponent(
                        `Assalam-o-Alaikum! I just submitted an enquiry${referenceId ? ` (Ref #${referenceId})` : ""
                        } from ${formData.organization || formData.name}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold tracking-wide shadow-sm transition-all inline-flex items-center justify-center gap-2"
                    >
                      <FaWhatsapp className="text-base" />
                      <span>Chat on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setFormSubmitted(false);
                        setReferenceId("");
                        setErrorMessage("");
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          organization: "",
                          interest: "general",
                          message: "",
                          website: "",
                        });
                      }}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#102E4D]/25 hover:border-[#102E4D] bg-white hover:bg-[#EFFBF8] text-[#102E4D] text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-5">
                  {/* Honeypot */}
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

                  {/* Inline Error Alert */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="font-medium">{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Quick Topic Chips */}
                  <div>
                    <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                      Quick Topic Selection
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {QUICK_TOPICS.map((topic) => {
                        const isSelected = formData.interest === topic.value;
                        return (
                          <button
                            key={topic.value}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, interest: topic.value })
                            }
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${isSelected
                                ? "bg-[#102E4D] text-[#FFC400] border-[#102E4D] shadow-xs"
                                : "bg-[#EFFBF8] text-[#102E4D] border-[#D7F5EF] hover:bg-[#D7F5EF]"
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
                    <div>
                      <label htmlFor="name" className={labelClass}>
                        Your Name <span className="text-[#FF7900]">*</span>
                      </label>
                      <div className={inputWrapperClass}>
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          id="name"
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            setErrorMessage("");
                            setFormData({ ...formData, name: e.target.value });
                          }}
                          className={inputClass}
                          placeholder="e.g. Ayesha Khan"
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Email Address <span className="text-[#FF7900]">*</span>
                      </label>
                      <div className={inputWrapperClass}>
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          id="email"
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setErrorMessage("");
                            setFormData({ ...formData, email: e.target.value });
                          }}
                          className={inputClass}
                          placeholder="ayesha@school.edu.pk"
                          autoComplete="email"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Phone / WhatsApp & School / Organization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-phone" className={labelClass}>
                        Phone / WhatsApp{" "}
                        <span className="text-[11px] font-medium normal-case text-slate-400">
                          (Optional)
                        </span>
                      </label>
                      <div className={inputWrapperClass}>
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          id="contact-phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className={`${inputClass} font-num`}
                          placeholder="+92 300 1234567"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="organization" className={labelClass}>
                        School / Organization{" "}
                        <span className="text-[#FF7900]">*</span>
                      </label>
                      <div className={inputWrapperClass}>
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                        <input
                          id="organization"
                          required
                          type="text"
                          value={formData.organization}
                          onChange={(e) => {
                            setErrorMessage("");
                            setFormData({
                              ...formData,
                              organization: e.target.value,
                            });
                          }}
                          className={inputClass}
                          placeholder="School or Organization Name"
                          autoComplete="organization"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Program Interest Dropdown */}
                  <div>
                    <label htmlFor="interest" className={labelClass}>
                      I&apos;m Interested In
                    </label>
                    <div className={inputWrapperClass}>
                      <Compass className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <select
                        id="interest"
                        value={formData.interest}
                        onChange={(e) =>
                          setFormData({ ...formData, interest: e.target.value })
                        }
                        className={`${inputClass} bg-white font-semibold`}
                      >
                        {INTEREST_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Message */}
                  <div>
                    <label htmlFor="message" className={labelClass}>
                      Your Message <span className="text-[#FF7900]">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquareText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => {
                          setErrorMessage("");
                          setFormData({ ...formData, message: e.target.value });
                        }}
                        className={`${inputClass} resize-none`}
                        placeholder="Tell us about your school, goals, cohort size, or enquiry..."
                      />
                    </div>
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
                        WhatsApp our team
                      </a>
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-98"
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

