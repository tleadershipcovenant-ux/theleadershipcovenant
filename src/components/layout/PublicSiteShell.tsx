"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

/**
 * Wraps public-facing site navigation, footer, and floating WhatsApp button,
 * hiding them completely on hidden `/AD_Admin` routes so the Admin Portal
 * renders its own dedicated executive navbar and vertical drawer.
 */
export default function PublicSiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/AD_Admin");

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

