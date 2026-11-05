import React from "react";
import ReactDOM from "react-dom";
import type { Metadata } from "next";
import SummitPageView from "@/components/summit/SummitPageView";

export const metadata: Metadata = {
  title: "The School Impact Summit 2026 - The Leadership Covenant",
  description:
    "The School Impact Summit 2026: 28 November 2026, Islamabad. Objectives, who should attend, speakers, past highlights and testimonials. Register online in minutes.",
  alternates: {
    canonical: "/summit",
  },
  openGraph: {
    title: "The School Impact Summit 2026 - The Leadership Covenant",
    description:
      "The School Impact Summit 2026: 28 November 2026, Islamabad. Objectives, who should attend, speakers, past highlights and testimonials. Register online in minutes.",
    url: "https://theleadershipcovenant.com/summit",
    siteName: "The Leadership Covenant",
    images: [
      {
        url: "/OG_Image.png",
        width: 1672,
        height: 941,
        alt: "The School Impact Summit 2026 - The Leadership Covenant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The School Impact Summit 2026 - The Leadership Covenant",
    description:
      "The School Impact Summit 2026: 28 November 2026, Islamabad. Objectives, who should attend, speakers, past highlights and testimonials. Register online in minutes.",
    images: ["/OG_Image.png"],
  },
};

export default function SummitPage() {
  ReactDOM.preload("/Submit/Hero.webp", {
    as: "image",
    fetchPriority: "high",
  });
  ReactDOM.preload("/Submit/Mobile%20devices%20hero%20section.webp", {
    as: "image",
    fetchPriority: "high",
  });

  return <SummitPageView />;
}
