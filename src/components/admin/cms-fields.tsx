"use client";

import React from "react";
import { Upload, X } from "lucide-react";

export const cmsInputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-[#102E4D] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7900]/25 focus:border-[#FF7900] transition-all";

export function CmsField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
        {label}
      </span>
      {hint ? (
        <span className="block text-[11px] text-slate-500 leading-tight">
          {hint}
        </span>
      ) : null}
      {children}
    </label>
  );
}

export function CmsStringList({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            className={cmsInputClass}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...values];
              next[index] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
            className="w-9 h-9 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
            title="Remove"
          >
            <X className="w-4 h-4 mx-auto" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="text-[11px] font-bold text-[#FF7900] hover:underline"
      >
        + Add item
      </button>
    </div>
  );
}

export function CmsImageField({
  value,
  onChange,
  onUpload,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  onUpload: () => Promise<string | null>;
  label?: string;
}) {
  return (
    <div className="space-y-2 p-3 rounded-xl border border-[#C8EFE6] bg-[#EFFBF8]/40">
      <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#102E4D]">
        {label}
      </span>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className={cmsInputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/photo.jpg or uploaded URL"
        />
        <button
          type="button"
          onClick={async () => {
            const url = await onUpload();
            if (url) onChange(url);
          }}
          className="h-10 px-3 rounded-xl bg-[#005696] hover:bg-[#004477] text-white text-[11px] font-bold inline-flex items-center justify-center gap-1.5 shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
      </div>
      {value ? (
        <img
          src={value}
          alt={label}
          className="max-h-24 rounded-lg border border-[#C8EFE6] object-cover"
        />
      ) : null}
    </div>
  );
}
