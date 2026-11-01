"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  FileText,
  Eye,
  Database,
  School,
  HeartHandshake,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Cookie,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

interface PolicySection {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  topGradient: string;
  iconBg: string;
  iconColor: string;
  badgeText: string;
  content: React.ReactNode;
}

export default function PrivacyContent() {
  const [activeTab, setActiveTab] = useState<string>("scope");

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      if (window.history.pushState) {
        window.history.pushState(null, "", `#${id}`);
      }
    }
  };

  // Active Scroll Spy: Highlights the index card link corresponding to the section in view
  useEffect(() => {
    const sectionIds = [
      "scope",
      "collection",
      "purpose",
      "students",
      "sharing",
      "security",
      "cookies",
      "rights",
      "trademarks",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const POLICY_SECTIONS: PolicySection[] = [
    {
      id: "scope",
      number: "01",
      title: "Institutional Scope & Framework",
      subtitle: "Who this policy covers across Pakistan and our regional operations",
      icon: School,
      topGradient: "from-[#102E4D] via-[#001B33] to-[#FFC400]",
      iconBg: "bg-[#102E4D]/10 border-[#102E4D]/20",
      iconColor: "text-[#102E4D]",
      badgeText: "Governance Scope",
      content: (
        <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            The Leadership Covenant (&ldquo;TLC&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates as an authorized regional partner of FranklinCovey Education in Pakistan. This Privacy &amp; Data Governance Policy applies to all individuals, institutions, and organizations interacting with our programs, digital platforms, and physical confluences.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <h4 className="font-bold text-[#102E4D] text-xs sm:text-[13px] mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                Institutional Deployments
              </h4>
              <p className="text-[11.5px] sm:text-xs text-slate-600">
                Leader in Me® partner schools, LeaderU college &amp; university tracks, and customized school governance frameworks.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <h4 className="font-bold text-[#102E4D] text-xs sm:text-[13px] mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                Events &amp; Confluences
              </h4>
              <p className="text-[11.5px] sm:text-xs text-slate-600">
                The School Impact Summit, executive masterclasses, youth experiential camps, and family parenting forums.
              </p>
            </div>
          </div>
          <p>
            By enrolling, inquiring, or registering through our website, online forms, or contracted school agreements, you acknowledge and agree to the data collection and governance principles described herein.
          </p>
        </div>
      ),
    },
    {
      id: "collection",
      number: "02",
      title: "Information We Collect",
      subtitle: "Categorization of institutional, educator, parent, and participant records",
      icon: Database,
      topGradient: "from-[#FF7900] via-[#E56D00] to-[#FFC400]",
      iconBg: "bg-[#FF7900]/10 border-[#FF7900]/25",
      iconColor: "text-[#FF7900]",
      badgeText: "Data Categories",
      content: (
        <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            We strictly limit our data collection to information reasonably required to deliver high-quality leadership coaching, ensure personal safety, and maintain official certification records:
          </p>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#102E4D]/10 text-[#102E4D] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-num">
                1
              </div>
              <div>
                <strong className="text-[#102E4D]">Educational &amp; Institutional Profiles:</strong> Name of institution, campus location, leadership role (Principal, Director, Section Head, Educator), official administrative email, and school size.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#FF7900]/10 text-[#FF7900] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-num">
                2
              </div>
              <div>
                <strong className="text-[#102E4D]">Participant Identity &amp; Contact:</strong> Full legal name, gender, personal or professional email address, WhatsApp/mobile telephone number, and CNIC/National ID where mandated for verifiable government-recognized certificates.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-num">
                3
              </div>
              <div>
                <strong className="text-[#102E4D]">Student &amp; Minor Registrations:</strong> Full name, age, grade level, school, parent or legal guardian emergency contact information, and specific dietary or emergency medical notes for residential and day youth camps.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-num">
                4
              </div>
              <div>
                <strong className="text-[#102E4D]">Transaction &amp; Billing Records:</strong> Institutional invoice logs, bank transfer transaction reference numbers, and billing receipts. <em>Note: We never process, store, or have access to raw debit/credit card numbers or online banking passwords on our local servers.</em>
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "purpose",
      number: "03",
      title: "How We Utilize Collected Data",
      subtitle: "Educational delivery, certifications, and institutional execution support",
      icon: Eye,
      topGradient: "from-[#16A34A] via-[#15803D] to-[#22C55E]",
      iconBg: "bg-[#16A34A]/10 border-[#16A34A]/25",
      iconColor: "text-[#16A34A]",
      badgeText: "Authorized Uses",
      content: (
        <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Personal and institutional data entrusted to The Leadership Covenant is used solely for designated educational objectives:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="font-bold text-[#102E4D] text-xs sm:text-[13px] mb-1">
                Workshop &amp; Summit Operations
              </div>
              <p className="text-[11.5px] sm:text-xs text-slate-600">
                Issuing personalized summit access credentials, organizing session rosters, printing attendee name badges, and managing venue logistics.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="font-bold text-[#102E4D] text-xs sm:text-[13px] mb-1">
                Certification &amp; Accreditations
              </div>
              <p className="text-[11.5px] sm:text-xs text-slate-600">
                Generating authentic certificates of completion, tracking coach-led hours, and verifying professional credentials for academic accreditation.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="font-bold text-[#102E4D] text-xs sm:text-[13px] mb-1">
                Implementation Follow-Through
              </div>
              <p className="text-[11.5px] sm:text-xs text-slate-600">
                Distributing post-summit 90-day impact scorecards, execution roadmaps, and FranklinCovey digital resource toolkits to enrolled school leaders.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="font-bold text-[#102E4D] text-xs sm:text-[13px] mb-1">
                Direct Communications
              </div>
              <p className="text-[11.5px] sm:text-xs text-slate-600">
                Sending confirmation notices, schedule adjustments, emergency weather advisories for outdoor camps, and response emails to incoming queries.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "students",
      number: "04",
      title: "Student & Minor Data Protection",
      subtitle: "Enhanced safeguards for children, youth camps, and classroom leadership participants",
      icon: HeartHandshake,
      topGradient: "from-[#E11D48] via-[#BE123C] to-[#FB7185]",
      iconBg: "bg-[#E11D48]/10 border-[#E11D48]/25",
      iconColor: "text-[#E11D48]",
      badgeText: "Youth Safeguards",
      content: (
        <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-[13px] flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Our Child Safeguarding Pledge:</span> We hold ourselves to the highest ethical and legal standards when handling data regarding minors under 18 years of age.
            </div>
          </div>
          <p>
            We implement strict protective guardrails for student camps, Leader in Me® student activities, and collegiate LeaderU modules:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span><strong>Mandatory Parental / Institutional Consent:</strong> No student under 18 may participate in off-campus residential retreats or public workshops without verified parent/guardian consent.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span><strong>Media &amp; Photographic Privacy:</strong> Photos and videos from student programs are taken solely for educational progress and storytelling. Faces are not published with identifying sensitive details, and parents/schools may request non-photography status at any time.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span><strong>No Commercial Targeting:</strong> We never profile, track, or serve advertisements to minors. Student records are segregated and access is restricted to verified program facilitators.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "sharing",
      number: "05",
      title: "Data Confidentiality & Third-Party Disclosure",
      subtitle: "Zero selling of data and strict contractual non-disclosure agreements",
      icon: UserCheck,
      topGradient: "from-[#2563EB] via-[#1D4ED8] to-[#60A5FA]",
      iconBg: "bg-[#2563EB]/10 border-[#2563EB]/25",
      iconColor: "text-[#2563EB]",
      badgeText: "Zero-Sale Policy",
      content: (
        <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-[#102E4D]">
            The Leadership Covenant does not sell, lease, trade, or monetize personal information to external marketers, advertisers, or third-party data brokers. Ever.
          </p>
          <p>
            Information is disclosed only under strictly controlled operational situations:
          </p>
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-[#102E4D] block text-xs sm:text-[13px]">1. Certified Master Facilitators:</strong>
              <span className="text-[11.5px] sm:text-xs text-slate-600">
                Accredited FranklinCovey Education master trainers receive attendance lists solely to conduct scheduled workshops, assess leadership deliverables, and provide contextual feedback.
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-[#102E4D] block text-xs sm:text-[13px]">2. Trusted Technology Infrastructure:</strong>
              <span className="text-[11.5px] sm:text-xs text-slate-600">
                Secure cloud hosting providers, database infrastructure, and automated notification services (such as transactional email dispatch) operate under binding confidentiality and data protection agreements.
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-[#102E4D] block text-xs sm:text-[13px]">3. Statutory Compliance:</strong>
              <span className="text-[11.5px] sm:text-xs text-slate-600">
                Disclosures required by applicable laws of the Islamic Republic of Pakistan, court orders, or lawful requests by public authorities to protect human life, physical safety, or prevent fraud.
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "security",
      number: "06",
      title: "Security Measures & Data Retention",
      subtitle: "Encryption, access controls, and transparent retention schedules",
      icon: Lock,
      topGradient: "from-[#102E4D] via-[#001B33] to-[#FF7900]",
      iconBg: "bg-[#102E4D]/10 border-[#102E4D]/25",
      iconColor: "text-[#102E4D]",
      badgeText: "Security Protocols",
      content: (
        <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            We deploy multi-layered physical, technical, and administrative safeguards designed to protect personal data against accidental loss, unauthorized access, destruction, or disclosure:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
              <Lock className="w-4 h-4 text-[#102E4D] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#102E4D] text-xs sm:text-[12.5px] block">SSL / TLS 1.3 Encryption</strong>
                <span className="text-[11px] sm:text-xs text-slate-600">All data in transit across our websites and forms is protected with end-to-end HTTPS encryption.</span>
              </div>
            </li>
            <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#102E4D] text-xs sm:text-[12.5px] block">Role-Based Access</strong>
                <span className="text-[11px] sm:text-xs text-slate-600">Internal access to registration rosters is restricted exclusively to authorized operational team members.</span>
              </div>
            </li>
          </ul>
          <p>
            <strong>Retention Schedule:</strong> We retain participant records only for as long as required to maintain valid certification verification for schools, honor ongoing institutional contracts, and comply with tax and audit laws. Non-essential operational forms are safely purged periodically.
          </p>
        </div>
      ),
    },
    {
      id: "cookies",
      number: "07",
      title: "Cookies & Digital Tracking",
      subtitle: "Transparent browser storage and session optimization",
      icon: Cookie,
      topGradient: "from-[#FFC400] via-[#FF7900] to-[#E56D00]",
      iconBg: "bg-[#FFC400]/15 border-[#FFC400]/30",
      iconColor: "text-[#FF7900]",
      badgeText: "Cookie Policy",
      content: (
        <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Our website uses minimal, purpose-driven cookies and local storage tokens to deliver an optimal browsing experience:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF7900] shrink-0 mt-0.5" />
              <span><strong>Strictly Necessary Cookies:</strong> Required to maintain form navigation, filter preferences in our Activity Explorer, and ensure basic cyber-security defenses.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF7900] shrink-0 mt-0.5" />
              <span><strong>Performance &amp; Diagnostics:</strong> Anonymized metrics to evaluate page load speeds, responsive viewport rendering, and server error diagnostics.</span>
            </li>
          </ul>
          <p>
            You can configure your browser to block or alert you about cookies; however, some interactive features (such as real-time activity filtering) may operate with reduced functionality.
          </p>
        </div>
      ),
    },
    {
      id: "rights",
      number: "08",
      title: "Your Rights & Data Choices",
      subtitle: "How to access, update, rectify, or request deletion of your records",
      icon: FileText,
      topGradient: "from-[#16A34A] via-[#102E4D] to-[#FFC400]",
      iconBg: "bg-[#16A34A]/10 border-[#16A34A]/25",
      iconColor: "text-[#16A34A]",
      badgeText: "User Rights",
      content: (
        <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            Schools, educators, parents, and learners hold the following fundamental rights regarding personal data held by The Leadership Covenant:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-[#102E4D] block text-xs sm:text-[13px]">Right of Access &amp; Portability</strong>
              <p className="text-[11.5px] sm:text-xs text-slate-600 mt-1">
                Request a formal copy of your registered personal and institutional information stored in our systems.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-[#102E4D] block text-xs sm:text-[13px]">Right to Rectification</strong>
              <p className="text-[11.5px] sm:text-xs text-slate-600 mt-1">
                Correct inaccurate contact records, misattributed school designations, or updated email addresses.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-[#102E4D] block text-xs sm:text-[13px]">Right to Erasure (&ldquo;To Be Forgotten&rdquo;)</strong>
              <p className="text-[11.5px] sm:text-xs text-slate-600 mt-1">
                Request permanent deletion of non-statutory records when they are no longer required for active program fulfillment.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-[#102E4D] block text-xs sm:text-[13px]">Communication Opt-Out</strong>
              <p className="text-[11.5px] sm:text-xs text-slate-600 mt-1">
                Easily withdraw consent from informational newsletters, summit invites, or promotional announcements.
              </p>
            </div>
          </div>
          <p className="text-slate-600 text-xs">
            To exercise any of these rights, simply email our data governance desk at{" "}
            <a href="mailto:theleadershipcovenant@gmail.com" className="text-[#FF7900] font-bold underline">
              theleadershipcovenant@gmail.com
            </a>
            . We acknowledge and process requests within 48 business hours.
          </p>
        </div>
      ),
    },
    {
      id: "trademarks",
      number: "09",
      title: "Intellectual Property & FranklinCovey Trademarks",
      subtitle: "Authorized global partner deployment and content rights",
      icon: ExternalLink,
      topGradient: "from-[#102E4D] via-[#001B33] to-[#FFC400]",
      iconBg: "bg-[#102E4D]/10 border-[#102E4D]/25",
      iconColor: "text-[#102E4D]",
      badgeText: "IP Compliance",
      content: (
        <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <p>
            <strong>FranklinCovey Education Trademarks:</strong> FranklinCovey®, Leader in Me®, The 4 Disciplines of Execution (4DX)®, and The 7 Habits of Highly Effective People® are registered trademarks owned by Franklin Covey Co.
          </p>
          <p>
            The Leadership Covenant operates under sanctioned regional licensing agreements across Pakistan. All training materials, workbooks, video modules, and rubrics distributed during our sessions are protected by international copyright laws and may not be reproduced, broadcast, or distributed outside contracted institutional scopes without explicit written permission.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. AT-A-GLANCE SUMMARY STRIP                               */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="w-full py-8 sm:py-10 bg-[#EFFBF8]/50 border-b border-[#D7F5EF]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#D7F5EF] shadow-2xs flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-bold text-sm sm:text-base text-[#102E4D] block">
                  Zero Data Selling
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  We never monetize or rent your personal records.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#D7F5EF] shadow-2xs flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#FF7900]/10 text-[#FF7900] flex items-center justify-center mb-2">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-bold text-sm sm:text-base text-[#102E4D] block">
                  Youth-First Privacy
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Strict parental consent for all students under 18.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#D7F5EF] shadow-2xs flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#102E4D]/10 text-[#102E4D] flex items-center justify-center mb-2">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-bold text-sm sm:text-base text-[#102E4D] block">
                  Encrypted Transit
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Full TLS 1.3 protocol and role-based access control.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#D7F5EF] shadow-2xs flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center mb-2">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-bold text-sm sm:text-base text-[#102E4D] block">
                  Full Rights &amp; Access
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Inspect, rectify, or request deletion within 48h.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. MAIN POLICY LAYOUT: LOCKED SIDEBAR + SCROLLING CARDS    */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="w-full py-12 sm:py-16 relative">
        {/* Background ambient accents contained safely to not block sticky positioning */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#D7F5EF]/60 blur-3xl transform-gpu" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-[#DDEFF7]/60 blur-3xl transform-gpu" />
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Locked Sticky Index Navigation Card (Desktop) */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-28 xl:top-32 self-start space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-[#D7F5EF] shadow-md max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-[#FF7900]" />
                  <span className="font-serif font-bold text-sm text-[#102E4D] tracking-tight">
                    Policy Index &amp; Navigation
                  </span>
                </div>
                <nav className="space-y-1">
                  {POLICY_SECTIONS.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        activeTab === sec.id
                          ? "bg-[#102E4D] text-[#FFC400] shadow-2xs translate-x-1"
                          : "text-slate-600 hover:bg-slate-100 hover:text-[#102E4D]"
                      }`}
                    >
                      <span className="truncate pr-2">{sec.title}</span>
                      <span className="font-num opacity-60 text-[10px] shrink-0 font-mono">
                        {sec.number}
                      </span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Quick Contact Card inside Sticky Sidebar */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#001B33] to-[#0A2644] text-white border border-white/10 shadow-md">
                <h4 className="font-serif font-bold text-sm text-white mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#FFC400]" />
                  Need Privacy Support?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
                  Our Data Protection desk assists with record verifications, certificates, or school governance inquiries.
                </p>
                <a
                  href="mailto:theleadershipcovenant@gmail.com"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFC400] hover:text-[#FF7900] transition-colors"
                >
                  <span>theleadershipcovenant@gmail.com</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </aside>

            {/* Right Column: Full Articulated Policy Cards */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              {/* Mobile Sticky Quick Jump Pill Bar */}
              <div className="lg:hidden sticky top-[68px] md:top-[112px] z-20 -mx-4 px-4 py-2 bg-white/95 backdrop-blur-md border-b border-[#D7F5EF] overflow-x-auto no-scrollbar flex items-center gap-1.5 shadow-xs">
                {POLICY_SECTIONS.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => scrollToSection(e, sec.id)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                      activeTab === sec.id
                        ? "bg-[#102E4D] text-[#FFC400]"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span className="font-num mr-1 opacity-60">{sec.number}.</span>
                    {sec.title.split(" ")[0]}
                  </a>
                ))}
              </div>
              {POLICY_SECTIONS.map((sec, idx) => {
                const IconComponent = sec.icon;

                return (
                  <motion.article
                    key={sec.id}
                    id={sec.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{
                      duration: 0.45,
                      delay: 0.04 * idx,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="scroll-mt-28 sm:scroll-mt-32 rounded-3xl bg-white border border-[#D7F5EF] hover:border-[#FFC400] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group transform-gpu"
                  >
                    {/* Top colored accent stripe */}
                    <div
                      className={`h-1.5 w-full bg-gradient-to-r ${sec.topGradient}`}
                    />

                    <div className="p-6 sm:p-8">
                      {/* Section Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl border flex items-center justify-center ${sec.iconBg} ${sec.iconColor} shadow-2xs group-hover:scale-105 transition-transform duration-200 shrink-0`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-num text-[11px] font-extrabold uppercase tracking-wider text-[#FF7900]">
                                Section {sec.number}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {sec.badgeText}
                              </span>
                            </div>
                            <h2 className="font-serif font-extrabold text-lg sm:text-xl lg:text-2xl text-[#102E4D] group-hover:text-[#FF7900] transition-colors leading-tight tracking-tight mt-1">
                              {sec.title}
                            </h2>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mb-5 font-medium leading-snug">
                        {sec.subtitle}
                      </p>

                      <div className="pt-4 border-t border-slate-100">
                        {sec.content}
                      </div>
                    </div>
                  </motion.article>
                );
              })}

              {/* ────────────────────────────────────────────────────────── */}
              {/* 3. OFFICIAL GRIEVANCE & CONTACT CARD                       */}
              {/* ────────────────────────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl bg-gradient-to-br from-[#001B33] via-[#0B2540] to-[#001B33] text-white p-7 sm:p-9 shadow-xl border border-white/15 relative overflow-hidden transform-gpu"
              >
                {/* Top Gold Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent opacity-90" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FFC400] mb-2.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Official Governance &amp; DPO Desk</span>
                  </div>

                  <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-snug">
                    Have questions about your records or student privacy?
                  </h3>
                  <div className="w-16 h-1 bg-[#FFC400] mt-3 rounded-full" />

                  <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-xl leading-relaxed">
                    Our leadership governance desk is available to assist school principals, institutional trustees, educators, and parents.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-white/10 text-xs text-slate-200">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#FFC400] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold mb-0.5">Headquarters:</strong>
                        <span>House 171, Street 68, Sector F-10/3, Islamabad, Pakistan</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-[#FFC400] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold mb-0.5">Direct Correspondence:</strong>
                        <a
                          href="mailto:theleadershipcovenant@gmail.com"
                          className="text-[#FFC400] hover:underline"
                        >
                          theleadershipcovenant@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      href="/contact#contact"
                      className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7900] to-[#E56D00] hover:from-[#E56D00] hover:to-[#CC5F00] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-98"
                    >
                      <span>Contact Us Online</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/summit"
                      className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 hover:border-[#FFC400] bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider transition-all active:scale-98"
                    >
                      <span>Explore Summit 2026</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

