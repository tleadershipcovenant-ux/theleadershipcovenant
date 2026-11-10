import ReactDOM from "react-dom";
import type { Metadata } from "next";
import ServicesPageView from "@/components/services/ServicesPageView";
import { SERVICES_PAGE } from "@/content/services";
import { SITE_URL } from "@/config/site";
import { ServicesStructuredData } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Our Services - The Leadership Covenant",
  description:
    "Leader in Me, LeaderU, Professional Development for educators, Leadership Camps, Family Sessions, Open Sessions and our podcast Change Starts Here.",
  keywords: [
    "Leader in Me Pakistan",
    "LeaderU Higher Education",
    "Professional Development for Educators",
    "Student Leadership Camps Pakistan",
    "7 Habits Family Sessions",
    "Leadership Podcast Change Starts Here",
    "FranklinCovey Education Services",
  ],
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Our Services & Leadership Programs - The Leadership Covenant",
    description:
      "Leader in Me, LeaderU, Professional Development for educators, Leadership Camps, Family Sessions, Open Sessions and our podcast Change Starts Here.",
    url: `${SITE_URL}/services`,
    siteName: "The Leadership Covenant",
    images: [
      {
        url: "/OG_Image.png",
        width: 1672,
        height: 941,
        alt: "The Leadership Covenant Services & Programs",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Services & Leadership Programs - The Leadership Covenant",
    description:
      "Leader in Me, LeaderU, Professional Development for educators, Leadership Camps, Family Sessions, Open Sessions and our podcast Change Starts Here.",
    images: ["/OG_Image.png"],
  },
};

export default function ServicesPage() {
  const originalImg = SERVICES_PAGE.hero.image.replace(/ /g, "%20");
  const webpImg = originalImg.replace(/\.png$/i, ".webp");

  ReactDOM.preload(webpImg, {
    as: "image",
    type: "image/webp",
    fetchPriority: "high",
  });
  ReactDOM.preload(originalImg, {
    as: "image",
    fetchPriority: "high",
  });

  return (
    <>
      <ServicesStructuredData />
      <ServicesPageView />
    </>
  );
}
