"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  KeyRound,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  Sparkles,
  Database,
} from "lucide-react";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  adminEmail?: string;
}

export default function ChangePasswordModal({
  open,
  onClose,
  adminEmail = "tleadershipcovenant@gmail.com",
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string | null;
    newPassword?: string | null;
    confirmPassword?: string | null;
  }>({});

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    email: string;
    updatedAt: string;
  } | null>(null);

  const currentInputRef = useRef<HTMLInputElement | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setTouched({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      setFieldErrors({});
      setGeneralError(null);
      setSubmitting(false);
      setSuccessData(null);

      const timer = setTimeout(() => {
        currentInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, onClose]);

  if (!open) return null;

  // Validation helpers
  const validateCurrentPassword = (val: string): string | null => {
    if (!val) return "Current password is required.";
    if (val.length < 6) return "Current password must be at least 6 characters.";
    return null;
  };

  const validateNewPassword = (val: string, currVal: string): string | null => {
    if (!val) return "New password is required.";
    if (val.length < 6) return "New password must be at least 6 characters long.";
    if (val.length > 72) return "New password cannot exceed 72 characters.";
    if (currVal && val === currVal) {
      return "New password must be different from your current password.";
    }
    return null;
  };

  const validateConfirmPassword = (
    val: string,
    newVal: string
  ): string | null => {
    if (!val) return "Please confirm your new password.";
    if (val !== newVal) return "Passwords do not match. Please re-enter.";
    return null;
  };

  // Password strength calculation
  const hasMinLength = newPassword.length >= 6;
  const isDifferentFromCurrent =
    newPassword.length > 0 && newPassword !== currentPassword;
  const hasUpperAndLower =
    /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumberOrSymbol =
    /[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword);

  const strengthScore = [
    hasMinLength,
    isDifferentFromCurrent,
    hasUpperAndLower,
    hasNumberOrSymbol,
  ].filter(Boolean).length;

  const strengthMeta =
    newPassword.length === 0
      ? { label: "Enter new password", color: "bg-slate-200", text: "text-slate-400" }
      : !hasMinLength
      ? { label: "Too Short (Min 6 chars)", color: "bg-red-500", text: "text-red-600" }
      : strengthScore <= 2
      ? { label: "Fair Strength", color: "bg-[#F59E0B]", text: "text-[#D97706]" }
      : strengthScore === 3
      ? { label: "Good Strength", color: "bg-[#0284C7]", text: "text-[#0284C7]" }
      : { label: "Strong Security", color: "bg-[#10B981]", text: "text-[#059669]" };

  const passwordsMatch =
    confirmPassword.length >= 6 &&
    newPassword.length >= 6 &&
    confirmPassword === newPassword;

  // Input handlers
  const handleCurrentChange = (val: string) => {
    setCurrentPassword(val);
    setGeneralError(null);
    setFieldErrors((prev) => ({
      ...prev,
      currentPassword: touched.currentPassword
        ? validateCurrentPassword(val)
        : null,
      newPassword:
        touched.newPassword && newPassword
          ? validateNewPassword(newPassword, val)
          : prev.newPassword,
    }));
  };

  const handleNewChange = (val: string) => {
    setNewPassword(val);
    setGeneralError(null);
    setFieldErrors((prev) => ({
      ...prev,
      newPassword: touched.newPassword
        ? validateNewPassword(val, currentPassword)
        : null,
      confirmPassword:
        touched.confirmPassword && confirmPassword
          ? validateConfirmPassword(confirmPassword, val)
          : prev.confirmPassword,
    }));
  };

  const handleConfirmChange = (val: string) => {
    setConfirmPassword(val);
    setGeneralError(null);
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: touched.confirmPassword
        ? validateConfirmPassword(val, newPassword)
        : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const currErr = validateCurrentPassword(currentPassword);
    const newErr = validateNewPassword(newPassword, currentPassword);
    const confErr = validateConfirmPassword(confirmPassword, newPassword);

    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    setFieldErrors({
      currentPassword: currErr,
      newPassword: newErr,
      confirmPassword: confErr,
    });

    if (currErr || newErr || confErr) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        const errMsg =
          data?.error || "Failed to update password. Please try again.";
        if (data?.field === "currentPassword") {
          setFieldErrors((prev) => ({ ...prev, currentPassword: errMsg }));
        } else if (data?.field === "newPassword") {
          setFieldErrors((prev) => ({ ...prev, newPassword: errMsg }));
        } else if (data?.field === "confirmPassword") {
          setFieldErrors((prev) => ({ ...prev, confirmPassword: errMsg }));
        } else {
          setGeneralError(errMsg);
        }
        return;
      }

      setSuccessData({
        email: data.email || adminEmail,
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    } catch {
      setGeneralError(
        "Network error while connecting to the server. Please verify your connection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-[#001B33]/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        if (!submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-modal-title"
    >
      <div
        className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white border-2 border-[#C8EFE6] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Signature Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FFC400] via-[#FF7900] to-[#10B981]" />

        {/* Executive Dark Header */}
        <div className="bg-gradient-to-r from-[#001B33] via-[#0A2540] to-[#001B33] px-5 sm:px-6 py-4.5 sm:py-5 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-[#FF7900]/20 blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-[#10B981]/20 blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF7900] to-[#E56D00] text-white flex items-center justify-center shadow-lg shadow-[#FF7900]/30 border border-[#FFC400]/40 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#FFC400]">
                    Security &amp; Credentials
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-[9.5px] font-bold">
                    <Database className="w-2.5 h-2.5" />
                    <span>Supabase Auth</span>
                  </span>
                </div>
                <h2
                  id="change-password-modal-title"
                  className="font-serif font-black text-lg sm:text-xl text-white tracking-tight leading-snug mt-0.5"
                >
                  Change Admin Password
                </h2>
                <p className="text-[11px] text-[#D7F5EF] truncate">
                  Account: <strong className="text-white">{adminEmail}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              aria-label="Close modal"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {successData ? (
          <div className="p-6 sm:p-7 space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#10B981]/30 ring-4 ring-[#DCFCE7]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Database Updated</span>
              </div>
              <h3 className="font-serif font-black text-xl text-[#102E4D]">
                Password Changed Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your executive portal password for{" "}
                <strong className="text-[#102E4D]">{successData.email}</strong>{" "}
                has been encrypted and saved to Supabase Auth. Your current
                session has also been refreshed automatically.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EFFBF8] border border-[#C8EFE6] flex items-center justify-between text-xs text-[#102E4D]">
              <span className="font-bold flex items-center gap-1.5 text-[#047857]">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Bcrypt Encrypted in Supabase DB</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Active Immediately
              </span>
            </div>

            <div className="pt-1 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#001B33] to-[#102E4D] hover:from-[#102E4D] hover:to-[#001B33] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg transition-all cursor-pointer active:scale-98"
              >
                Done &amp; Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4" noValidate>
            {generalError && (
              <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">{generalError}</div>
              </div>
            )}

            {/* 1. CURRENT PASSWORD */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-current-password"
                className="text-[11px] font-black uppercase tracking-wider text-[#102E4D] flex items-center justify-between"
              >
                <span>
                  Current Password <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 normal-case">
                  Verified with database
                </span>
              </label>
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#005696] flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  ref={currentInputRef}
                  id="admin-current-password"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => handleCurrentChange(e.target.value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, currentPassword: true }));
                    setFieldErrors((prev) => ({
                      ...prev,
                      currentPassword: validateCurrentPassword(currentPassword),
                    }));
                  }}
                  placeholder="Enter your existing password"
                  disabled={submitting}
                  className={`w-full pl-13 pr-11 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-bold text-[#102E4D] placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-all ${
                    fieldErrors.currentPassword
                      ? "border-red-400 bg-red-50/40 focus:border-red-500"
                      : touched.currentPassword && !fieldErrors.currentPassword && currentPassword
                      ? "border-[#10B981] bg-[#F0FDF4]/30 focus:border-[#059669]"
                      : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#005696]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  tabIndex={-1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#102E4D] hover:bg-slate-100 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  aria-label={showCurrent ? "Hide current password" : "Show current password"}
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.currentPassword && (
                <p className="text-[11px] font-bold text-red-600 flex items-center gap-1.5 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.currentPassword}</span>
                </p>
              )}
            </div>

            {/* 2. NEW PASSWORD */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-new-password"
                className="text-[11px] font-black uppercase tracking-wider text-[#102E4D] flex items-center justify-between"
              >
                <span>
                  New Password <span className="text-red-500">*</span>
                </span>
                <span className={`text-[10.5px] font-extrabold normal-case ${strengthMeta.text}`}>
                  {strengthMeta.label}
                </span>
              </label>
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] text-[#FF7900] flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-new-password"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => handleNewChange(e.target.value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, newPassword: true }));
                    setFieldErrors((prev) => ({
                      ...prev,
                      newPassword: validateNewPassword(
                        newPassword,
                        currentPassword
                      ),
                    }));
                  }}
                  placeholder="Create a strong new password (min 6 chars)"
                  disabled={submitting}
                  className={`w-full pl-13 pr-11 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-bold text-[#102E4D] placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-all ${
                    fieldErrors.newPassword
                      ? "border-red-400 bg-red-50/40 focus:border-red-500"
                      : touched.newPassword && !fieldErrors.newPassword && newPassword
                      ? "border-[#10B981] bg-[#F0FDF4]/30 focus:border-[#059669]"
                      : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#FF7900]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  tabIndex={-1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#102E4D] hover:bg-slate-100 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {fieldErrors.newPassword && (
                <p className="text-[11px] font-bold text-red-600 flex items-center gap-1.5 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.newPassword}</span>
                </p>
              )}

              {/* Strength Meter Bar & Live Checklist */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-all duration-300 ${
                        newPassword.length > 0 && strengthScore >= step
                          ? strengthMeta.color
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10.5px] font-bold">
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasMinLength ? "text-[#059669]" : "text-slate-400"
                    }`}
                  >
                    <Check className="w-3 h-3 shrink-0" />
                    <span>At least 6 characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      isDifferentFromCurrent ? "text-[#059669]" : "text-slate-400"
                    }`}
                  >
                    <Check className="w-3 h-3 shrink-0" />
                    <span>Different from current</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasUpperAndLower ? "text-[#059669]" : "text-slate-400"
                    }`}
                  >
                    <Check className="w-3 h-3 shrink-0" />
                    <span>Upper &amp; lowercase letters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasNumberOrSymbol ? "text-[#059669]" : "text-slate-400"
                    }`}
                  >
                    <Check className="w-3 h-3 shrink-0" />
                    <span>Number or symbol</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. CONFIRM NEW PASSWORD */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-confirm-password"
                className="text-[11px] font-black uppercase tracking-wider text-[#102E4D] flex items-center justify-between"
              >
                <span>
                  Confirm New Password <span className="text-red-500">*</span>
                </span>
                {passwordsMatch && (
                  <span className="text-[10.5px] font-extrabold text-[#059669] normal-case inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Passwords match</span>
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  id="admin-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmChange(e.target.value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, confirmPassword: true }));
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateConfirmPassword(
                        confirmPassword,
                        newPassword
                      ),
                    }));
                  }}
                  placeholder="Re-enter your new password to confirm"
                  disabled={submitting}
                  className={`w-full pl-13 pr-11 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-bold text-[#102E4D] placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-all ${
                    fieldErrors.confirmPassword
                      ? "border-red-400 bg-red-50/40 focus:border-red-500"
                      : passwordsMatch
                      ? "border-[#10B981] bg-[#F0FDF4]/30 focus:border-[#059669]"
                      : "border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#10B981]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  tabIndex={-1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#102E4D] hover:bg-slate-100 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] font-bold text-red-600 flex items-center gap-1.5 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200/80">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC6200] text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg shadow-[#FF7900]/25 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

