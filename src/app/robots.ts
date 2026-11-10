import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

const DISALLOWED_PATHS = [
  "/AD_Admin",
  "/AD_Admin/",
  "/admin",
  "/admin/",
  "/login",
  "/api/admin",
  "/api/admin/",
  "/api/submit",
  "/api/upload",
];

const ALLOWED_PATHS = [
  "/",
  "/services",
  "/about",
  "/activities",
  "/summit",
  "/apply",
  "/online-booking",
  "/contact",
  "/privacy",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.xml",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 1. Default rule for all standard web crawlers
      {
        userAgent: "*",
        allow: ALLOWED_PATHS,
        disallow: DISALLOWED_PATHS,
      },
      // 2. Explicit full-access rules for Search Engines & AI Chatbots / Answer Engines
      {
        userAgent: [
          "Googlebot",
          "Googlebot-Image",
          "Google-Extended",
          "GoogleOther",
          "bingbot",
          "Applebot",
          "Applebot-Extended",
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "PerplexityBot",
          "Perplexity-User",
          "Meta-ExternalAgent",
          "Meta-ExternalFetcher",
          "FacebookBot",
          "DuckAssistBot",
          "DuckDuckBot",
          "YouBot",
          "cohere-ai",
          "Amazonbot",
          "CCBot",
        ],
        allow: ALLOWED_PATHS,
        disallow: DISALLOWED_PATHS,
      },
    ],
    host: SITE_URL,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
