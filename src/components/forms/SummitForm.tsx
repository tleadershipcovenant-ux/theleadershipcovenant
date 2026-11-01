"use client";

import React, { useState } from "react";
import { FORM_COPY, SUMMIT_SLUG } from "@/content/forms";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export function SummitForm() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    organization: "",
    message: "",
    website: "", // honeypot
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "summit",
          activity_slug: SUMMIT_SLUG,
          ...formData,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to register. Please check your fields.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const firstName = formData.full_name.trim().split(" ")[0] || "there";
    return (
      <div className="p-8 sm:p-10 rounded-2xl text-center bg-[#EFFBF8] border border-[#D7F5EF] shadow-sm">
        <div className="w-14 h-14 rounded-full bg-[#16A34A]/15 text-[#15803D] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="font-serif font-bold text-2xl text-[#102E4D] mb-2">
          Seat Reserved, {firstName}!
        </h3>
        <p className="font-num text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto mb-6">
          {FORM_COPY.summit.success}
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setFormData({
              full_name: "",
              email: "",
              phone: "",
              role: "",
              organization: "",
              message: "",
              website: "",
            });
          }}
          className="px-5 py-2.5 rounded-xl border border-[#102E4D] text-[#102E4D] hover:bg-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          Register Another Colleague
        </button>
      </div>
    );
  }

  const labelClass =
    "block text-xs font-bold text-[#102E4D] uppercase tracking-wider mb-1.5";
  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-[#D7F5EF] bg-[#EFFBF8]/35 focus:bg-white text-xs sm:text-sm text-[#102E4D] placeholder:text-slate-400 focus:outline-none focus:border-[#FF7900] focus:ring-2 focus:ring-[#FF7900]/15 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field (hidden from users) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-summit">Website</label>
        <input
          type="text"
          id="website-summit"
          name="website"
          value={formData.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="summit-name" className={labelClass}>
            Full name <span className="text-[#FF7900]">*</span>
          </label>
          <input
            id="summit-name"
            name="full_name"
            type="text"
            required
            placeholder="e.g. Maria Tariq"
            value={formData.full_name}
            onChange={handleChange}
            className={inputClass}
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="summit-email" className={labelClass}>
            Email <span className="text-[#FF7900]">*</span>
          </label>
          <input
            id="summit-email"
            name="email"
            type="email"
            required
            placeholder="maria@school.edu.pk"
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="summit-phone" className={labelClass}>
            Phone <span className="text-[#FF7900]">*</span>
          </label>
          <input
            id="summit-phone"
            name="phone"
            type="tel"
            required
            placeholder="+92 321 9876543"
            value={formData.phone}
            onChange={handleChange}
            className={`${inputClass} font-num`}
            autoComplete="tel"
          />
        </div>

        <div>
          <label htmlFor="summit-role" className={labelClass}>
            Role <span className="text-[#FF7900]">*</span>
          </label>
          <input
            id="summit-role"
            name="role"
            type="text"
            required
            placeholder="e.g. Principal / School Head"
            value={formData.role}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="summit-org" className={labelClass}>
          Organization / School <span className="text-[#FF7900]">*</span>
        </label>
        <input
          id="summit-org"
          name="organization"
          type="text"
          required
          placeholder="e.g. Beaconhouse / Roots Millennium / City School"
          value={formData.organization}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="summit-message" className={labelClass}>
          Anything we should know?{" "}
          <span className="text-[11px] font-medium normal-case text-slate-400">(Optional)</span>
        </label>
        <textarea
          id="summit-message"
          name="message"
          rows={3}
          placeholder="Questions regarding group seats, timings, or venue details..."
          value={formData.message}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
        />
      </div>

      <p className="text-[11.5px] text-slate-500 leading-relaxed">
        {FORM_COPY.summit.consent}
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-98"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Registering seat...</span>
          </>
        ) : (
          <>
            <span>{FORM_COPY.summit.submit}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
