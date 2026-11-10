import React from "react";
import ReactDOM from "react-dom";
import type { Metadata } from "next";
import AboutAnimatedView from "@/components/about/AboutAnimatedView";
import { SITE_URL } from "@/config/site";
import { AboutStructuredData } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Our Story - The Leadership Covenant",
  description:
    "The vision, mission, values and CEO message behind The Leadership Covenant. Authorized FranklinCovey Education North Region partner in Pakistan.",
  keywords: [
    "About The Leadership Covenant",
    "Our Story The Leadership Covenant",
    "Ubaid ur Rehman CEO",
    "FranklinCovey Education North Region",
    "Leadership Vision and Mission Pakistan",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Our Story - The Leadership Covenant",
    description:
      "The vision, mission, values and CEO message behind The Leadership Covenant.",
    url: `${SITE_URL}/about`,
    siteName: "The Leadership Covenant",
    images: [
      {
        url: "/OG_Image.png",
        width: 1672,
        height: 941,
        alt: "Our Story - The Leadership Covenant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Story - The Leadership Covenant",
    description:
      "The vision, mission, values and CEO message behind The Leadership Covenant.",
    images: ["/OG_Image.png"],
  },
};

export default function AboutPage() {
  ReactDOM.preload("/Our%20story/S1.webp", {
    as: "image",
    type: "image/webp",
    fetchPriority: "high",
  });
  ReactDOM.preload("/Our%20story/S1.png", {
    as: "image",
    fetchPriority: "high",
  });

  return (
    <>
      <AboutStructuredData />
      <AboutAnimatedView />
    </>
  );
}
