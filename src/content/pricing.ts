/**
 * Activity Registration Pricing & Early Bird Promotional Offers.
 *
 * Public Apply Form rule:
 * ONLY The School Impact Summit 2026 shows a registration fee.
 * All other activities do not show any price.
 *
 * The optional `customEvent` argument is used only by the admin CMS preview.
 */

import type { LeadershipEvent } from "@/content/events";

export interface ActivityPricingResult {
  hasPricing: boolean;
  regularPrice?: number;
  payablePrice?: number;
  formattedRegularPrice?: string;
  formattedPayablePrice?: string;
  isEarlyBirdActive: boolean;
  savings?: number;
  formattedSavings?: string;
  discountPercent?: number;
  deadlineText?: string;
  note?: string;
}

function formatMoney(amount: number, currency = "PKR"): string {
  return `${currency} ${amount.toLocaleString("en-US")}`;
}

export function getActivityPricing(
  slug?: string,
  customEvent?: Partial<LeadershipEvent> | null
): ActivityPricingResult {
  if (!slug && !customEvent) {
    return { hasPricing: false, isEarlyBirdActive: false };
  }

  const targetSlug = customEvent?.slug || slug || "";
  const cmsPrice =
    customEvent &&
    typeof customEvent.regularPrice === "number" &&
    customEvent.regularPrice > 0
      ? customEvent.regularPrice
      : 0;

  if (cmsPrice > 0) {
    const regular = cmsPrice;
    const discountPercent =
      typeof customEvent?.discountPercent === "number"
        ? customEvent.discountPercent
        : 0;
    const currency = customEvent?.currency || "PKR";
    const deadlineStr = customEvent?.offerEndDate || "";
    const earlyBirdDeadline = deadlineStr ? new Date(deadlineStr) : null;
    const now = new Date();
    const startStr = customEvent?.offerStartDate;
    const afterStart = startStr ? now >= new Date(startStr) : true;
    const beforeEnd =
      earlyBirdDeadline && !isNaN(earlyBirdDeadline.getTime())
        ? now <= earlyBirdDeadline
        : true;
    const isEarlyBirdActive =
      customEvent?.isOfferActive !== false &&
      afterStart &&
      beforeEnd &&
      discountPercent > 0;
    const payable = isEarlyBirdActive
      ? Math.round(regular * (1 - discountPercent / 100))
      : regular;
    const savings = isEarlyBirdActive ? regular - payable : 0;
    let deadlineFormatted = "the offer deadline";
    if (customEvent?.offerEndDate) {
      const d = new Date(customEvent.offerEndDate);
      if (!isNaN(d.getTime())) {
        deadlineFormatted = d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }

    return {
      hasPricing: true,
      regularPrice: regular,
      payablePrice: payable,
      formattedRegularPrice: formatMoney(regular, currency),
      formattedPayablePrice: formatMoney(payable, currency),
      isEarlyBirdActive,
      savings,
      formattedSavings: savings > 0 ? formatMoney(savings, currency) : undefined,
      discountPercent: isEarlyBirdActive ? discountPercent : undefined,
      deadlineText: deadlineFormatted,
      note: customEvent?.offerLabel,
    };
  }

  if (
    targetSlug === "school-impact-summit-2026" ||
    targetSlug === "summit" ||
    targetSlug.includes("school-impact-summit")
  ) {
    const regular = 5000;
    const earlyBirdDeadline = new Date("2026-11-07T23:59:59+05:00");
    const now = new Date();
    const isEarlyBirdActive = now <= earlyBirdDeadline;
    const discountPercent = 20;
    const payable = isEarlyBirdActive
      ? Math.round(regular * (1 - discountPercent / 100))
      : regular;
    const savings = isEarlyBirdActive ? regular - payable : 0;

    return {
      hasPricing: true,
      regularPrice: regular,
      payablePrice: payable,
      formattedRegularPrice: "PKR 5,000",
      formattedPayablePrice: `PKR ${payable.toLocaleString("en-US")}`,
      isEarlyBirdActive,
      savings,
      formattedSavings:
        savings > 0 ? `PKR ${savings.toLocaleString("en-US")}` : undefined,
      discountPercent: isEarlyBirdActive ? discountPercent : undefined,
      deadlineText: "7th Nov. 2026",
    };
  }

  return { hasPricing: false, isEarlyBirdActive: false };
}

