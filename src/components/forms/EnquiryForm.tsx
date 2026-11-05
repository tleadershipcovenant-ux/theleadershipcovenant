"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { INTEREST_OPTIONS, FORM_COPY } from "@/content/forms";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";

interface EnquiryFormProps {
  defaultInterest?: string;
}

export function EnquiryForm({ defaultInterest = "general" }: EnquiryFormProps) {
  const searchParams = useSearchParams();
  const queryInterest = searchParams?.get("interest") || defaultInterest;

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    organization: "",
    address_with_city: "",
    interest: queryInterest,
    message: "",
    website: "", // honeypot
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (queryInterest) {
      setFormData((prev) => ({ ...prev, interest: queryInterest }));
    }
  }, [queryInterest]);

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
          type: "contact",
          ...formData,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to send message. Please check the fields.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card p-8 sm:p-10 text-center bg-white border border-teal/30 shadow-lg animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-mint-100 text-teal-800 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-2xl text-navy-900 mb-2">
          Message Received
        </h3>
        <p className="text-muted text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-6">
          {FORM_COPY.contact.success}
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setFormData({
              full_name: "",
              email: "",
              phone: "",
              organization: "",
              address_with_city: "",
              interest: "general",
              message: "",
              website: "",
            });
          }}
          className="btn btn-outline text-xs uppercase tracking-wider py-2"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-9 bg-white shadow-md space-y-5">
      {/* Honeypot field (hidden from users) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-contact">Website</label>
        <input
          type="text"
          id="website-contact"
          name="website"
          value={formData.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-danger text-sm flex items-start gap-2.5 animate-fade-up">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label htmlFor="contact-name" className="field-label">
            Your name <span className="text-danger">*</span>
          </label>
          <input
            id="contact-name"
            name="full_name"
            type="text"
            required
            placeholder="e.g. Dr. Salman Ahmed"
            value={formData.full_name}
            onChange={handleChange}
            className="field-input"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="field-label">
            Email <span className="text-danger">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="salman@organization.org"
            value={formData.email}
            onChange={handleChange}
            className="field-input"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label htmlFor="contact-phone" className="field-label">
            Phone / WhatsApp <span className="text-danger">*</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            placeholder="+92 300 1234567"
            value={formData.phone}
            onChange={handleChange}
            className="field-input font-num"
            autoComplete="tel"
          />
        </div>

        <div>
          <label htmlFor="contact-address" className="field-label">
            Address with city <span className="text-danger">*</span>
          </label>
          <input
            id="contact-address"
            name="address_with_city"
            type="text"
            required
            placeholder="e.g. Sector F-8/4, Islamabad"
            value={formData.address_with_city}
            onChange={handleChange}
            className="field-input"
            autoComplete="street-address"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label htmlFor="contact-org" className="field-label">
            Organization <span className="text-danger">*</span>
          </label>
          <input
            id="contact-org"
            name="organization"
            type="text"
            required
            placeholder="School or company name"
            value={formData.organization}
            onChange={handleChange}
            className="field-input"
            autoComplete="organization"
          />
        </div>

        <div>
          <label htmlFor="contact-interest" className="field-label">
            I&apos;m interested in
          </label>
          <select
            id="contact-interest"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            className="field-input"
          >
            {INTEREST_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="field-label">
          Message <span className="text-danger">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          placeholder="Tell us about your team, school, or inquiry..."
          value={formData.message}
          onChange={handleChange}
          className="field-input"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <span className="text-xs text-muted font-medium">
          {FORM_COPY.contact.helper}
        </span>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full sm:w-auto px-7 justify-center font-bold text-sm shadow-md disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>{FORM_COPY.contact.submit}</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
