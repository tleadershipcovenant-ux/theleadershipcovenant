"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

/**
 * Wraps public-facing site navigation, footer, and floating WhatsApp button,
 * hiding them completely on:
 * 1. The dedicated admin subdomain (admin.leadershipcovenant.com.pk)
 * 2. Any local or production /AD_Admin routes (/AD_Admin, /ad_admin, /admin, /login, /registrations, /contacts, /cms)
 * so only the clean Executive Admin Portal is displayed without any public website elements.
 */
export default function PublicSiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdminHost, setIsAdminHost] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (
        host === "admin.leadershipcovenant.com.pk" ||
        host.startsWith("admin.")
      ) {
        setIsAdminHost(true);
      }
    }
  }, []);

  const normalizedPath = (pathname || "").toLowerCase();
  const isAdminRoute =
    isAdminHost ||
    normalizedPath.startsWith("/ad_admin") ||
    normalizedPath.startsWith("/admin") ||
    normalizedPath === "/login" ||
    normalizedPath.startsWith("/registrations") ||
    normalizedPath.startsWith("/contacts") ||
    normalizedPath.startsWith("/cms");

  // NEVER render public website navbar, footer, or floating WhatsApp on admin routes or subdomain
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
