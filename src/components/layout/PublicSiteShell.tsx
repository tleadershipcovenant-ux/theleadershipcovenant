"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

/**
 * Wraps public-facing site navigation, footer, and floating WhatsApp button,
 * hiding them completely on the dedicated admin subdomain (admin.leadershipcovenant.com.pk)
 * and on /AD_Admin routes, so the Admin Portal renders its own dedicated executive navbar and drawer.
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

  const isAdminRoute =
    isAdminHost ||
    pathname?.startsWith("/AD_Admin") ||
    pathname === "/login" ||
    pathname?.startsWith("/registrations") ||
    pathname?.startsWith("/contacts") ||
    pathname?.startsWith("/cms");

  // Never render public website navbar/footer on admin routes or admin subdomain
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
