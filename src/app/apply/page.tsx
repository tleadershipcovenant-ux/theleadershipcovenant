import ReactDOM from "react-dom";
import type { Metadata } from "next";
import ApplyPageView from "@/components/forms/ApplyPageView";
import { EVENTS } from "@/content/events";
import { APPLY_PAGE } from "@/content/forms";

export const metadata: Metadata = {
  title: "Online Application & Seat Booking - The Leadership Covenant",
  description:
    "Reserve your seat in a few clicks. Complete your provisional registration or priority confirmation for 2026 leadership cohorts, summits, and workshops.",
  alternates: {
    canonical: "/apply",
  },
  openGraph: {
    title: "Online Application & Seat Booking - The Leadership Covenant",
    description:
      "Reserve your seat in a few clicks. Complete your provisional registration or priority confirmation for 2026 leadership cohorts, summits, and workshops.",
    url: "https://theleadershipcovenant.com/apply",
    siteName: "The Leadership Covenant",
    images: [
      {
        url: "/OG_Image.png",
        width: 1672,
        height: 941,
        alt: "The Leadership Covenant Seat Booking & Online Application",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Application & Seat Booking - The Leadership Covenant",
    description:
      "Reserve your seat in a few clicks. Complete your provisional registration or priority confirmation for 2026 leadership cohorts, summits, and workshops.",
    images: ["/OG_Image.png"],
  },
};

export default function ApplyPage() {
  const originalHero = APPLY_PAGE.hero.image;
  const webpHero = originalHero.replace(/\.png$/i, ".webp");

  ReactDOM.preload(webpHero, {
    as: "image",
    type: "image/webp",
    fetchPriority: "high",
  });
  ReactDOM.preload(originalHero, {
    as: "image",
    fetchPriority: "high",
  });

  return <ApplyPageView initialEvents={EVENTS} />;
}
