import React from "react";
import { SITE, SITE_URL, MAIN_NAV } from "@/config/site";
import { SERVICES } from "@/content/services";
import { EVENTS, CATEGORY_LABELS, type LeadershipEvent } from "@/content/events";
import { ABOUT_CONTENT } from "@/content/about";
import {
  SUMMIT_DEFAULT_SPEAKERS,
  SUMMIT_DEFAULT_VIDEOS,
  SUMMIT_CONTENT,
} from "@/content/summit";
import { getActivityPricing } from "@/content/pricing";

function toAbsUrl(path: string): string {
  if (!path) return `${SITE_URL}/OG_Image.png`;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean.replace(/ /g, "%20")}`;
}

function JsonLdScript({ data, id }: { data: Record<string, unknown>; id: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * 1. Global Organization, LocalBusiness & WebSite Knowledge Graph (rendered in RootLayout)
 */
export function GlobalStructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["EducationalOrganization", "Organization", "LocalBusiness"],
        "@id": `${SITE_URL}/#organization`,
        name: SITE.name,
        alternateName: [
          SITE.affiliation,
          "TLC Pakistan",
          "The Leadership Covenant Pakistan",
        ],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: `${SITE_URL}/Logo_For_Navbar_Fotter.png`,
          contentUrl: `${SITE_URL}/Logo_For_Navbar_Fotter.png`,
          caption: SITE.name,
        },
        image: `${SITE_URL}/OG_Image.png`,
        description: SITE.description,
        slogan: SITE.tagline,
        email: SITE.email,
        telephone: SITE.telephone,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE.address.line1,
          addressLocality: SITE.address.city,
          addressRegion: "Islamabad Capital Territory",
          addressCountry: SITE.address.countryCode,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 33.6938,
          longitude: 73.0151,
        },
        hasMap: SITE.mapsUrl,
        founder: {
          "@type": "Person",
          "@id": `${SITE_URL}/#ceo`,
          name: ABOUT_CONTENT.ceo.name,
          jobTitle: ABOUT_CONTENT.ceo.role,
          description: ABOUT_CONTENT.ceo.credential,
          image: toAbsUrl(ABOUT_CONTENT.ceo.photo),
          worksFor: {
            "@id": `${SITE_URL}/#organization`,
          },
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: SITE.telephone,
            email: SITE.email,
            contactType: "customer service",
            areaServed: "PK",
            availableLanguage: ["English", "Urdu"],
          },
        ],
        areaServed: [
          { "@type": "Country", name: "Pakistan" },
          { "@type": "City", name: "Islamabad" },
          { "@type": "City", name: "Rawalpindi" },
          { "@type": "City", name: "Peshawar" },
          { "@type": "City", name: "Swat" },
          { "@type": "City", name: "Abbottabad" },
        ],
        knowsAbout: [
          "Leader in Me",
          "LeaderU",
          "The 7 Habits of Highly Effective People",
          "The 4 Disciplines of Execution (4DX)",
          "Leading at the Speed of Trust",
          "The 7 Habits of Highly Effective Families",
          "Educational Leadership",
          "Whole-School Transformation",
          "Professional Development for Educators",
          "Student Leadership Camps",
        ],
        sameAs: [
          SITE.social.linkedin,
          SITE.social.facebook,
          SITE.social.instagram,
          SITE.social.whatsapp,
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE.name,
        alternateName: SITE.affiliation,
        description: SITE.description,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        inLanguage: "en-US",
      },
      ...MAIN_NAV.map((item, idx) => ({
        "@type": "SiteNavigationElement",
        "@id": `${SITE_URL}/#nav-${idx + 1}`,
        position: idx + 1,
        name: item.label,
        url: `${SITE_URL}${item.href === "/" ? "" : item.href}`,
      })),
    ],
  };

  return <JsonLdScript id="tlc-global-jsonld" data={graph} />;
}

/**
 * 2. Home Page Structured Data (WebPage + Featured Programs + Upcoming Events + FAQPage)
 */
export function HomeStructuredData() {
  const activeEvents = EVENTS.filter((e) => !e.hidden);

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: `${SITE.name} - ${SITE.tagline}`,
        description: SITE.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}/OG_Image.png`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What is The Leadership Covenant?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `${SITE.name} (${SITE.affiliation}) helps schools, students, educators, and families unlock their leadership potential through Leader in Me (EY–12 whole-school transformation), LeaderU (higher education), educator professional development, student leadership camps, family sessions, and The School Impact Summit.`,
            },
          },
          {
            "@type": "Question",
            name: "What is Leader in Me and how does it help schools in Pakistan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Leader in Me is FranklinCovey Education's flagship EY–12 whole-school transformation process built on The 7 Habits of Highly Effective People. It embeds leadership, character, and life skills into daily school culture, empowering students, teachers, and families.",
            },
          },
          {
            "@type": "Question",
            name: "When and where is The School Impact Summit 2026?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `The School Impact Summit 2026 takes place on 28 November 2026 in Islamabad, Pakistan. Educators, principals, and school leaders can register online at ${SITE_URL}/summit or ${SITE_URL}/apply.`,
            },
          },
          {
            "@type": "Question",
            name: "How do I apply or reserve a seat for an upcoming leadership cohort or camp?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Visit ${SITE_URL}/apply to select your desired 2026–2027 activity, enter your participant details, and choose either Provisional Seat Reservation (with 24-hour coordinator callback) or Priority Confirmed Seat (via UBL transfer with instant official digital receipt).`,
            },
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#upcoming-events-list`,
        name: "Upcoming Leadership Activities & Programs",
        itemListElement: activeEvents.slice(0, 8).map((ev, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url:
            ev.detailPath === "/summit"
              ? `${SITE_URL}/summit`
              : `${SITE_URL}/apply?activity=${encodeURIComponent(ev.slug)}`,
          name: ev.title,
        })),
      },
    ],
  };

  return <JsonLdScript id="tlc-home-jsonld" data={data} />;
}

/**
 * 3. Services Page Structured Data
 */
export function ServicesStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Our Services",
            item: `${SITE_URL}/services`,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "Leadership Programs & Educational Services by The Leadership Covenant",
        description:
          "Whole-school transformation, higher education leadership, educator professional development, youth camps, family sessions, and leadership podcast.",
        itemListElement: SERVICES.map((s, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Service",
            "@id": `${SITE_URL}/services#${s.id}`,
            name: s.title,
            category: s.badge,
            slogan: s.tagline,
            description: s.body,
            image: toAbsUrl(s.image),
            provider: { "@id": `${SITE_URL}/#organization` },
            areaServed: { "@type": "Country", name: "Pakistan" },
            url: `${SITE_URL}/services#${s.id}`,
          },
        })),
      },
    ],
  };

  return <JsonLdScript id="tlc-services-jsonld" data={data} />;
}

/**
 * 4. About / Our Story Page Structured Data
 */
export function AboutStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Our Story",
            item: `${SITE_URL}/about`,
          },
        ],
      },
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about#webpage`,
        url: `${SITE_URL}/about`,
        name: ABOUT_CONTENT.meta.title,
        description: ABOUT_CONTENT.meta.description,
        mainEntity: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return <JsonLdScript id="tlc-about-jsonld" data={data} />;
}

/**
 * 5. Activities / Calendar Page Structured Data (EducationEvent for every active cohort)
 */
export function ActivitiesStructuredData({
  events = EVENTS,
}: {
  events?: LeadershipEvent[];
}) {
  const visibleEvents = events.filter((e) => !e.hidden);

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Upcoming Activities",
            item: `${SITE_URL}/activities`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/activities#webpage`,
        url: `${SITE_URL}/activities`,
        name: "Upcoming Leadership Activities, Camps, Summits & Workshops — The Leadership Covenant",
        description:
          "Explore 2026–2027 leadership camps, cohorts, summits, family sessions and educator workshops across Islamabad, Peshawar, Swat and Northern Pakistan.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      ...visibleEvents.map((ev) => {
        const pricing = getActivityPricing(ev.slug, ev);
        const eventUrl =
          ev.detailPath === "/summit"
            ? `${SITE_URL}/summit`
            : `${SITE_URL}/apply?activity=${encodeURIComponent(ev.slug)}`;

        return {
          "@type": "EducationEvent",
          "@id": `${SITE_URL}/activities#${ev.slug}`,
          name: ev.title,
          description: ev.overview || ev.description,
          startDate: ev.startDate,
          endDate: ev.endDate || ev.startDate,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode:
            "https://schema.org/OfflineEventAttendanceMode",
          url: eventUrl,
          image: [toAbsUrl(ev.image)],
          location: {
            "@type": "Place",
            name: ev.venue || ev.city,
            address: {
              "@type": "PostalAddress",
              addressLocality: ev.city,
              addressCountry: "PK",
            },
          },
          organizer: {
            "@id": `${SITE_URL}/#organization`,
          },
          performer: {
            "@type": "Organization",
            name: ev.facilitator || SITE.affiliation,
          },
          ...(pricing.hasPricing && pricing.payablePrice
            ? {
                offers: {
                  "@type": "Offer",
                  url: eventUrl,
                  price: pricing.payablePrice,
                  priceCurrency: ev.currency || "PKR",
                  availability: "https://schema.org/InStock",
                  validFrom: "2026-01-01",
                },
              }
            : {
                offers: {
                  "@type": "Offer",
                  url: eventUrl,
                  availability: "https://schema.org/InStock",
                },
              }),
          keywords: [
            CATEGORY_LABELS[ev.category] || ev.category,
            ev.city,
            ev.tag1,
            ev.tag2,
            ev.tag3,
          ]
            .filter(Boolean)
            .join(", "),
        };
      }),
    ],
  };

  return <JsonLdScript id="tlc-activities-jsonld" data={data} />;
}

/**
 * 6. The School Impact Summit 2026 Structured Data (EducationEvent + Speakers + Videos + FAQ)
 */
export function SummitStructuredData() {
  const summitPricing = getActivityPricing("school-impact-summit-2026");

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Activities",
            item: `${SITE_URL}/activities`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "The School Impact Summit 2026",
            item: `${SITE_URL}/summit`,
          },
        ],
      },
      {
        "@type": "EducationEvent",
        "@id": `${SITE_URL}/summit#event`,
        name: "The School Impact Summit 2026",
        description: SUMMIT_CONTENT.meta.description,
        startDate: "2026-11-28",
        endDate: "2026-11-28",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        url: `${SITE_URL}/summit`,
        image: [
          `${SITE_URL}/Submit/Hero.webp`,
          `${SITE_URL}/OG_Image.png`,
        ],
        location: {
          "@type": "Place",
          name: "Islamabad, Pakistan",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Islamabad",
            addressRegion: "Islamabad Capital Territory",
            addressCountry: "PK",
          },
        },
        organizer: {
          "@id": `${SITE_URL}/#organization`,
        },
        performer: SUMMIT_DEFAULT_SPEAKERS.map((sp) => ({
          "@type": "Person",
          name: sp.name,
          jobTitle: sp.title,
          description: sp.bio,
          image: toAbsUrl(sp.image),
        })),
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/apply?activity=school-impact-summit-2026`,
          price: summitPricing.payablePrice || 20000,
          priceCurrency: "PKR",
          availability: "https://schema.org/InStock",
          validFrom: "2026-01-01",
        },
      },
      ...SUMMIT_DEFAULT_VIDEOS.map((vid) => ({
        "@type": "VideoObject",
        name: vid.title,
        description: vid.description,
        thumbnailUrl: [vid.thumbnail],
        uploadDate: "2026-01-15T08:00:00+05:00",
        embedUrl: `https://www.youtube.com/embed/${vid.youtubeId}`,
        contentUrl: `https://www.youtube.com/watch?v=${vid.youtubeId}`,
      })),
    ],
  };

  return <JsonLdScript id="tlc-summit-jsonld" data={data} />;
}

/**
 * 7. Online Application & Seat Booking Page Structured Data
 */
export function ApplyStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Online Application & Seat Booking",
            item: `${SITE_URL}/apply`,
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/apply#webpage`,
        url: `${SITE_URL}/apply`,
        name: "Online Application & Seat Booking — The Leadership Covenant",
        description:
          "Reserve your seat in minutes for 2026–2027 leadership cohorts, The School Impact Summit 2026, educator workshops, and student camps.",
        potentialAction: {
          "@type": "RegisterAction",
          target: `${SITE_URL}/apply`,
          name: "Register for a Leadership Activity or Summit",
        },
      },
    ],
  };

  return <JsonLdScript id="tlc-apply-jsonld" data={data} />;
}

/**
 * 8. Contact Us Page Structured Data
 */
export function ContactStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Contact Us",
            item: `${SITE_URL}/contact`,
          },
        ],
      },
      {
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contact#webpage`,
        url: `${SITE_URL}/contact`,
        name: "Contact Us — The Leadership Covenant Islamabad",
        description: `Connect with ${SITE.name} (${SITE.affiliation}) at ${SITE.address.full}. Call or WhatsApp ${SITE.whatsappDisplay} or email ${SITE.email}.`,
        mainEntity: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return <JsonLdScript id="tlc-contact-jsonld" data={data} />;
}

/**
 * 9. Privacy Policy Page Structured Data
 */
export function PrivacyStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Privacy Policy & Data Governance",
            item: `${SITE_URL}/privacy`,
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/privacy#webpage`,
        url: `${SITE_URL}/privacy`,
        name: "Privacy Policy & Data Governance — The Leadership Covenant",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
    ],
  };

  return <JsonLdScript id="tlc-privacy-jsonld" data={data} />;
}
