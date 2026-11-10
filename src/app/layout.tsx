import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import PublicSiteShell from "@/components/layout/PublicSiteShell";
import { SITE, SITE_URL } from "@/config/site";
import { GlobalStructuredData } from "@/components/seo/StructuredData";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Leadership Covenant - Learn. Develop. Lead. Transform.",
    template: "%s | The Leadership Covenant",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [
    { name: SITE.name, url: SITE_URL },
    { name: "Ubaid ur Rehman", url: `${SITE_URL}/about` },
  ],
  creator: SITE.name,
  publisher: `${SITE.name} (${SITE.affiliation})`,
  category: "Education & Leadership Development",
  keywords: [
    "The Leadership Covenant",
    "FranklinCovey Education Pakistan",
    "FranklinCovey Education North Region",
    "Leader in Me Pakistan",
    "LeaderU Pakistan",
    "School Impact Summit 2026",
    "The 7 Habits of Highly Effective People Pakistan",
    "Professional Development for Educators Islamabad",
    "Student Leadership Camps Pakistan",
    "School Leadership Transformation Islamabad",
    "Principal's Academy Pakistan",
    "Ubaid ur Rehman Leadership",
    "Fazal Niazi FranklinCovey",
  ],
  alternates: {
    canonical: "/",
    types: {
      "text/plain": [
        { url: "/llms.txt", title: "AI & LLM Knowledge Summary" },
        { url: "/llms-full.txt", title: "Complete AI Knowledge Base" },
      ],
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/Logo_For_Navbar_Fotter.png",
    shortcut: "/Logo_For_Navbar_Fotter.png",
    apple: "/Logo_For_Navbar_Fotter.png",
  },
  openGraph: {
    title: "The Leadership Covenant - Learn. Develop. Lead. Transform.",
    description: SITE.description,
    url: SITE_URL,
    siteName: SITE.name,
    images: [
      {
        url: "/OG_Image.png",
        width: 1672,
        height: 941,
        alt: "The Leadership Covenant — FranklinCovey Education North Region",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Leadership Covenant - Learn. Develop. Lead. Transform.",
    description: SITE.description,
    images: ["/OG_Image.png"],
  },
  other: {
    "geo.region": "PK-IS",
    "geo.placename": "Islamabad, Pakistan",
    "geo.position": "33.6938;73.0151",
    ICBM: "33.6938, 73.0151",
    "ai-content-declaration": `${SITE_URL}/llms-full.txt`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${playfair.variable} ${jakarta.variable} ${inter.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-background text-[#111c2d] antialiased selection:bg-[#ffbe3b] selection:text-[#00153d]"
      >
        <GlobalStructuredData />
        <PublicSiteShell>{children}</PublicSiteShell>
      </body>
    </html>
  );
}
