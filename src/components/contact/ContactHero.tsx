"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ContactHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full transform-gpu"
    >
      <motion.h1
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="font-serif font-extrabold text-3xl sm:text-5xl lg:text-[54px] text-white leading-[1.12] tracking-tight max-w-3xl mx-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]"
      >
        Let&apos;s start a{" "}
        <span className="text-[#FFC400]">conversation.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="text-sm sm:text-base lg:text-lg text-white/95 mt-5 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]"
      >
        Whether you&apos;re exploring a program for your school, joining a camp, or just curious, we&apos;d love to hear from you.
      </motion.p>
    </motion.div>
  );
}

