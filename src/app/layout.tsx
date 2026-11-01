import type { Metadata } from "next";
import { headers } from "next/headers";
import { Playfair_Display, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import PublicSiteShell from "@/components/layout/PublicSiteShell";

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
  metadataBase: new URL("https://theleadershipcovenant.com"),
  title: {
    default: "The Leadership Covenant - Learn. Develop. Lead. Transform.",
    template: "%s | The Leadership Covenant",
  },
  description:
    "The Leadership Covenant helps schools, students, educators and families unlock their leadership potential through Leader in Me, LeaderU, camps and transformational processes.",
  icons: {
    icon: "/Logo_For_Navbar_Fotter.png",
    shortcut: "/Logo_For_Navbar_Fotter.png",
    apple: "/Logo_For_Navbar_Fotter.png",
  },
  openGraph: {
    title: "The Leadership Covenant - Learn. Develop. Lead. Transform.",
    description:
      "The Leadership Covenant helps schools, students, educators and families unlock their leadership potential through Leader in Me, LeaderU, camps and transformational processes.",
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
    title: "The Leadership Covenant - Learn. Develop. Lead. Transform.",
    description:
      "The Leadership Covenant helps schools, students, educators and families unlock their leadership potential through Leader in Me, LeaderU, camps and transformational processes.",
    images: ["/OG_Image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let isAdminSubdomain = false;
  try {
    const headersList = await headers();
    const host = (
      headersList.get("x-forwarded-host") ||
      headersList.get("host") ||
      ""
    ).toLowerCase();
    isAdminSubdomain =
      host === "admin.leadershipcovenant.com.pk" || host.startsWith("admin.");
  } catch {
    // Non-blocking fallback during build / static optimization
  }

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
        {isAdminSubdomain ? (
          children
        ) : (
          <PublicSiteShell>{children}</PublicSiteShell>
        )}
      </body>
    </html>
  );
}
