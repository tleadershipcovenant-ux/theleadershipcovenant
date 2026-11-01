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
  const [isAdminSubdomain, setIsAdminSubdomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (
        host === "admin.leadershipcovenant.com.pk" ||
        host.startsWith("admin.")
      ) {
        setIsAdminSubdomain(true);
      }
    }
  }, []);

  const isCleanAdminRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname?.startsWith("/registrations") ||
    pathname?.startsWith("/contacts") ||
    pathname?.startsWith("/cms");

  const isAdminRoute =
    pathname?.startsWith("/AD_Admin") ||
    (isAdminSubdomain && isCleanAdminRoute);

  // If on admin route or admin subdomain, do not render public site header/footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Double check client window location to prevent flashes on admin subdomain
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (
      host === "admin.leadershipcovenant.com.pk" ||
      host.startsWith("admin.")
    ) {
      return <>{children}</>;
    }
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
