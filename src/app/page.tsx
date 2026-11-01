import type { Metadata } from "next";
import ReactDOM from "react-dom";
import HeroSlider from "@/components/HeroSlider";
import StatsSection from "@/components/StatsSection";
import HomeUpcomingSection from "@/components/home/HomeUpcomingSection";
import AboutSection from "@/components/AboutSection";
import HomeServicesSection from "@/components/home/HomeServicesSection";
import HomeVoicesSection from "@/components/home/HomeVoicesSection";
import HomeCtaSection from "@/components/home/HomeCtaSection";
import { HOME_CONTENT } from "@/content/home";

export const metadata: Metadata = {
  title: HOME_CONTENT.meta.title,
  description: HOME_CONTENT.meta.description,
  openGraph: {
    title: HOME_CONTENT.meta.title,
    description: HOME_CONTENT.meta.description,
    url: "https://theleadershipcovenant.com",
    siteName: "The Leadership Covenant",
    images: [
      {
        url: "/OG_Image.png",
        width: 1672,
        height: 941,
        alt: "The Leadership Covenant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_CONTENT.meta.title,
    description: HOME_CONTENT.meta.description,
    images: ["/OG_Image.png"],
  },
};

export default function Home() {
  ReactDOM.preload("/Hero%20Section/H1.png", { as: "image", fetchPriority: "high" });

  return (
    <main className="w-full pt-[68px] md:pt-[112px]">
      <div className="flex flex-col w-full">
        {/* 1. Hero Section */}
        <div id="hero" className="w-full">
          <HeroSlider />
        </div>

        {/* 2. Reach (Stats Strip) */}
        <StatsSection />

        {/* 3. Upcoming Activities (Animated Continuous Moving Slider) */}
        <HomeUpcomingSection />

        {/* 4. Our Story & The Covenant */}
        <AboutSection />

        {/* 5. What We Do / Our Services (Auto-moving & Scrollable Slider) */}
        <HomeServicesSection />

        {/* 6. The Principle We Live By & Testimonials */}
        <HomeVoicesSection />

        {/* 7. Call to Action Banner */}
        <HomeCtaSection />
      </div>
    </main>
  );
}
