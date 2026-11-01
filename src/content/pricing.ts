/**
 * Activity Registration Pricing & Early Bird Promotional Offers.
 *
 * Current Rule:
 * The School Impact Summit 2026 (slug: "school-impact-summit-2026"):
 * - Standard fee: PKR 5,000
 * - 20% Early Bird Discount valid until 7th November 2026 23:59:59 PKT.
 * - Early Bird fee: PKR 4,000 (Save PKR 1,000)
 * - After 7th Nov 2026, the fee automatically changes back to PKR 5,000.
 */

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

export function getActivityPricing(slug?: string): ActivityPricingResult {
  if (!slug) {
    return { hasPricing: false, isEarlyBirdActive: false };
  }

  // Check for School Impact Summit 2026
  if (
    slug === "school-impact-summit-2026" ||
    slug === "summit" ||
    slug.includes("school-impact-summit")
  ) {
    const regular = 5000;
    // 7th November 2026 at 23:59:59 Pakistan Standard Time (UTC+5)
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

