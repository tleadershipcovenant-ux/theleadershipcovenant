import React from "react";
import Link from "next/link";
import { MdArrowForward, MdExplore } from "react-icons/md";

export default function NotFound() {
  return (
    <main className="w-full pt-[68px] md:pt-[112px] min-h-[70vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-xl mx-auto text-center space-y-5 bg-white p-8 sm:p-10 rounded-3xl border border-[#D7F5EF] shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-[#001B33] text-[#FFC400] flex items-center justify-center mx-auto shadow-md">
          <MdExplore className="text-3xl" />
        </div>

        <h1 className="font-num font-extrabold text-5xl text-[#102E4D] tracking-tight">
          404
        </h1>

        <div className="w-16 h-1 bg-[#FFC400] mx-auto rounded-full" />

        <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-medium">
          The requested page could not be located. It may have been relocated or updated.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] text-white font-bold text-xs sm:text-sm hover:from-[#E56D00] hover:to-[#CC5F00] transition-all inline-flex items-center gap-2 shadow-md"
          >
            <span>Return to Home</span>
            <MdArrowForward className="text-base" />
          </Link>
          <Link
            href="/services"
            className="px-6 py-2.5 rounded-xl border border-[#102E4D]/30 text-[#102E4D] font-semibold text-xs sm:text-sm hover:border-[#102E4D] hover:bg-[#EFFBF8] transition-all"
          >
            Explore Programs
          </Link>
        </div>
      </div>
    </main>
  );
}
