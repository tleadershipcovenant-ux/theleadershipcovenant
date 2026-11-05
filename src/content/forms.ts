/**
 * Client-safe form constants shared by browser forms, /api/submit,
 * and the Apply / Submit CMS editor.
 */

export const INTEREST_OPTIONS = [
  { value: "general", label: "General enquiry" },
  { value: "leader-in-me", label: "Leader in Me" },
  { value: "leaderu", label: "LeaderU" },
  { value: "professional-development", label: "Professional Development" },
  { value: "leadership-camps", label: "Leadership Camps" },
  { value: "family-sessions", label: "Family Sessions" },
  { value: "open-sessions", label: "Open Sessions" },
  { value: "podcast", label: "Podcast" },
  { value: "partnership", label: "Partnership" },
] as const;

export type InterestValue = (typeof INTEREST_OPTIONS)[number]["value"];

export const SUMMIT_SLUG = "school-impact-summit-2026";

export type ActivityOption = { value: string; label: string };

export const FORM_COPY = {
  application: {
    consent: "By submitting you agree to be contacted by our team about this application.",
    submit: "Submit application",
  },
  summit: {
    consent: "By submitting you agree to be contacted by our team about this registration.",
    submit: "Register now",
    success:
      "You're registered interest for The School Impact Summit 2026 (28 November, Islamabad). We'll confirm your seat and share joining details within one working day.",
  },
  contact: {
    helper: "We reply within one working day.",
    submit: "Send message",
    success: "Thanks for reaching out. We reply within one working day.",
  },
};

export interface ApplyFieldCopy {
  label: string;
  placeholder: string;
  optionalTag?: string;
}

export interface ApplyBookingOptionCopy {
  badge: string;
  title: string;
  body: string;
  bullets: string[];
}

export interface ApplyPageContent {
  hero: {
    heading: string;
    headingHighlight: string;
    body: string;
    image: string;
    imageAlt: string;
  };
  formHeader: {
    title: string;
    subtitle: string;
    whatsappLabel: string;
    whatsappUrl: string;
  };
  loadingText: string;
  steps: {
    step1Title: string;
    step1Subtitle: string;
    step2Title: string;
    step2Subtitle: string;
    step3ReservationTitle: string;
    step3ReservationSubtitle: string;
    step3PaymentTitle: string;
    step3PaymentSubtitle: string;
  };
  step1: {
    sectionTitle: string;
    stepBadge: string;
    fullName: ApplyFieldCopy;
    email: ApplyFieldCopy;
    phone: ApplyFieldCopy;
    role: ApplyFieldCopy;
    schoolName: ApplyFieldCopy;
    addressWithCity: ApplyFieldCopy;
    activity: ApplyFieldCopy;
    activityDropdownHeading: string;
    notes: ApplyFieldCopy;
    summaryHeading: string;
    summaryLivePreview: string;
    emptyTitle: string;
    emptyBody: string;
    termsPrefix: string;
    termsLabel: string;
    termsSuffix: string;
    nextButton: string;
  };
  step2: {
    participantLabel: string;
    activityLabel: string;
    editButton: string;
    reservation: ApplyBookingOptionCopy & {
      advanceLabel: string;
      advanceValue: string;
    };
    secureSeat: ApplyBookingOptionCopy & {
      partnerEyebrow: string;
      partnerName: string;
    };
    backButton: string;
    completeReservation: string;
    completingReservation: string;
    nextPayment: string;
    selectOption: string;
  };
  step3: {
    paymentHeading: string;
    paymentSubheading: string;
    feePayableLabel: string;
    transactionLabel: string;
    transactionPlaceholder: string;
    optionalTag: string;
    backButton: string;
    submitButton: string;
    submittingButton: string;
  };
  success: {
    verifiedLabel: string;
    reservationHeadline: string;
    securedHeadline: string;
    reservationBody: string;
    securedBody: string;
    reservationStatus: string;
    securedStatus: string;
    reservationStep1: string;
    securedStep1: string;
    confirmedLabel: string;
    reservationStep2: string;
    securedStep2: string;
    withinHoursLabel: string;
    step3Title: string;
    step3Status: string;
    whatsappButton: string;
    submitAnother: string;
    receiptTitle: string;
    receiptOrg: string;
    bookingRefLabel: string;
    statusSecured: string;
    statusReserved: string;
    selectedActivityLabel: string;
    participantLabel: string;
    bookingOptionLabel: string;
    optionSecured: string;
    optionReserved: string;
  };
  application: typeof FORM_COPY.application;
  summit: typeof FORM_COPY.summit;
  contact: typeof FORM_COPY.contact;
}

export const APPLY_PAGE: ApplyPageContent = {
  hero: {
    heading: "Online Application &",
    headingHighlight: "Seat Booking.",
    body: "Select your activity, choose free provisional reservation or priority seat confirmation, and receive instant confirmation.",
    image: "/Apply%20now/O1.png",
    imageAlt: "Online Application and Seat Booking - The Leadership Covenant",
  },
  formHeader: {
    title: "Seat Booking & Registration Form",
    subtitle:
      "Use the interactive steps below to complete your provisional reservation or priority seat confirmation.",
    whatsappLabel: "Need help? WhatsApp Us",
    whatsappUrl: "https://wa.me/923192091249",
  },
  loadingText: "Loading online booking system...",
  steps: {
    step1Title: "Participant Details",
    step1Subtitle: "Contact info & activity",
    step2Title: "Booking Option",
    step2Subtitle: "Reservation or Secure Seat",
    step3ReservationTitle: "Instant Confirmation",
    step3ReservationSubtitle: "Complete reservation",
    step3PaymentTitle: "Payment & Receipt",
    step3PaymentSubtitle: "UBL Bank & Scan to Pay",
  },
  step1: {
    sectionTitle: "Participant Information",
    stepBadge: "Step 01 of 03",
    fullName: { label: "Full Name", placeholder: "e.g. Salman Ahmed" },
    email: { label: "Email Address", placeholder: "salman@school.edu.pk" },
    phone: { label: "Phone / WhatsApp", placeholder: "+92 300 1234567" },
    role: {
      label: "Your Role / Title",
      placeholder: "e.g. Principal, Teacher, Parent",
    },
    schoolName: {
      label: "School Name",
      placeholder: "e.g. Beaconhouse, Roots Millennium, etc.",
    },
    addressWithCity: {
      label: "Address with city",
      placeholder: "e.g. Sector F-8/4, Islamabad",
    },
    activity: {
      label: "Select Activity / Cohort",
      placeholder: "Choose an upcoming 2026 activity or cohort…",
    },
    activityDropdownHeading: "Upcoming 2026 Leadership Activities",
    notes: {
      label: "Notes or Group Details",
      optionalTag: "(Optional)",
      placeholder:
        "Share your school/organization name, group size, or any questions...",
    },
    summaryHeading: "Selected Activity Summary",
    summaryLivePreview: "Live Preview",
    emptyTitle: "No Activity Selected Yet",
    emptyBody:
      "Select an activity from the dropdown on the left to preview date, venue, and registration fee details here.",
    termsPrefix: "I agree to the",
    termsLabel: "Terms & Conditions",
    termsSuffix: "and Privacy Policy.",
    nextButton: "Next: Choose Booking Option",
  },
  step2: {
    participantLabel: "Participant:",
    activityLabel: "Activity:",
    editButton: "Edit Details",
    reservation: {
      badge: "Zero Upfront Cost",
      title: "Reservation",
      body: "Hold your provisional spot for free. Our team will contact you within 24 hours to confirm attendance.",
      advanceLabel: "Advance Due",
      advanceValue: "PKR 0 (Free Hold)",
      bullets: [
        "Instant provisional hold (No advance fee)",
        "Pay later after details are confirmed",
      ],
    },
    secureSeat: {
      badge: "Guaranteed Priority",
      title: "Secure Your Seat",
      body: "Lock your official confirmed admission right away via United Bank Limited (UBL) transfer or instant Scan to Pay.",
      partnerEyebrow: "Official Partner",
      partnerName: "United Bank Limited (UBL)",
      bullets: [
        "100% Guaranteed priority admission & kit",
        "Official UBL IBAN & Instant Scan QR",
      ],
    },
    backButton: "Back to Details",
    completeReservation: "Complete Reservation Now",
    completingReservation: "Completing Reservation...",
    nextPayment: "Next: Payment & Screenshot Upload",
    selectOption: "Select a Booking Option Above",
  },
  step3: {
    paymentHeading: "Payment Method & Account",
    paymentSubheading:
      "Pay via United Bank Limited (UBL) IBAN transfer or scan the official QR code below.",
    feePayableLabel: "Registration Fee Payable",
    transactionLabel: "Transaction ID / Reference",
    transactionPlaceholder: "e.g. TID 8392019482",
    optionalTag: "(Optional)",
    backButton: "Back to Booking Options",
    submitButton: "Complete & Secure My Seat",
    submittingButton: "Securing Your Seat...",
  },
  success: {
    verifiedLabel: "Official Booking Verified",
    reservationHeadline: "Thank You",
    securedHeadline: "Congratulations",
    reservationBody:
      "Your provisional reservation has been recorded at zero upfront cost. Save, print, or share your official booking receipt on the right. Our team will contact you within 24 hours to confirm attendance.",
    securedBody:
      "Your priority seat has been locked and payment record registered. Save, print, or share your official booking receipt on the right.",
    reservationStatus: "Reservation Confirmed",
    securedStatus: "Priority Seat Secured",
    reservationStep1: "Spot Reserved",
    securedStep1: "Seat Secured",
    confirmedLabel: "Confirmed",
    reservationStep2: "Team Callback",
    securedStep2: "Payment Verified",
    withinHoursLabel: "Within 24 Hours",
    step3Title: "Joining Pass",
    step3Status: "Digital Kit",
    whatsappButton: "Connect on WhatsApp",
    submitAnother: "Submit Another Application",
    receiptTitle: "Official Booking Receipt",
    receiptOrg: "The Leadership Covenant",
    bookingRefLabel: "Booking Ref",
    statusSecured: "Seat Secured • UBL",
    statusReserved: "Provisional Reserved",
    selectedActivityLabel: "Selected Activity",
    participantLabel: "Participant",
    bookingOptionLabel: "Booking Option",
    optionSecured: "Priority Seat (UBL Transfer)",
    optionReserved: "Reserve Now • Pay Later",
  },
  application: { ...FORM_COPY.application },
  summit: { ...FORM_COPY.summit },
  contact: { ...FORM_COPY.contact },
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asField(raw: unknown, fallback: ApplyFieldCopy): ApplyFieldCopy {
  const rec = asRecord(raw);
  return {
    label: String(rec.label || fallback.label),
    placeholder: String(rec.placeholder || fallback.placeholder),
    optionalTag: rec.optionalTag
      ? String(rec.optionalTag)
      : fallback.optionalTag,
  };
}

function asOption(
  raw: unknown,
  fallback: ApplyBookingOptionCopy
): ApplyBookingOptionCopy {
  const rec = asRecord(raw);
  const bullets = Array.isArray(rec.bullets)
    ? (rec.bullets as string[]).filter((item) => typeof item === "string")
    : fallback.bullets;
  return {
    badge: String(rec.badge || fallback.badge),
    title: String(rec.title || fallback.title),
    body: String(rec.body || fallback.body),
    bullets: bullets.length > 0 ? bullets : fallback.bullets,
  };
}

export function normalizeApplyCms(
  raw: Record<string, unknown> | null | undefined
): ApplyPageContent {
  const d = APPLY_PAGE;
  const source = asRecord(raw);
  const hero = asRecord(source.hero);
  const formHeader = asRecord(source.formHeader);
  const steps = asRecord(source.steps);
  const step1 = asRecord(source.step1);
  const step2 = asRecord(source.step2);
  const reservation = asRecord(step2.reservation);
  const secureSeat = asRecord(step2.secureSeat);
  const step3 = asRecord(source.step3);
  const success = asRecord(source.success);
  const application = asRecord(source.application);
  const summit = asRecord(source.summit);
  const contact = asRecord(source.contact);

  return {
    hero: {
      heading: String(hero.heading || d.hero.heading),
      headingHighlight: String(hero.headingHighlight || d.hero.headingHighlight),
      body: String(hero.body || d.hero.body),
      image: String(hero.image || d.hero.image),
      imageAlt: String(hero.imageAlt || d.hero.imageAlt),
    },
    formHeader: {
      title: String(formHeader.title || d.formHeader.title),
      subtitle: String(formHeader.subtitle || d.formHeader.subtitle),
      whatsappLabel: String(formHeader.whatsappLabel || d.formHeader.whatsappLabel),
      whatsappUrl: String(formHeader.whatsappUrl || d.formHeader.whatsappUrl),
    },
    loadingText: String(source.loadingText || d.loadingText),
    steps: {
      step1Title: String(steps.step1Title || d.steps.step1Title),
      step1Subtitle: String(steps.step1Subtitle || d.steps.step1Subtitle),
      step2Title: String(steps.step2Title || d.steps.step2Title),
      step2Subtitle: String(steps.step2Subtitle || d.steps.step2Subtitle),
      step3ReservationTitle: String(
        steps.step3ReservationTitle || d.steps.step3ReservationTitle
      ),
      step3ReservationSubtitle: String(
        steps.step3ReservationSubtitle || d.steps.step3ReservationSubtitle
      ),
      step3PaymentTitle: String(
        steps.step3PaymentTitle || d.steps.step3PaymentTitle
      ),
      step3PaymentSubtitle: String(
        steps.step3PaymentSubtitle || d.steps.step3PaymentSubtitle
      ),
    },
    step1: {
      ...d.step1,
      ...step1,
      fullName: asField(step1.fullName, d.step1.fullName),
      email: asField(step1.email, d.step1.email),
      phone: asField(step1.phone, d.step1.phone),
      role: asField(step1.role, d.step1.role),
      schoolName: asField(step1.schoolName, d.step1.schoolName),
      addressWithCity: asField(step1.addressWithCity, d.step1.addressWithCity),
      activity: asField(step1.activity, d.step1.activity),
      notes: asField(step1.notes, d.step1.notes),
    },
    step2: {
      ...d.step2,
      ...step2,
      reservation: {
        ...asOption(reservation, d.step2.reservation),
        advanceLabel: String(
          reservation.advanceLabel || d.step2.reservation.advanceLabel
        ),
        advanceValue: String(
          reservation.advanceValue || d.step2.reservation.advanceValue
        ),
      },
      secureSeat: {
        ...asOption(secureSeat, d.step2.secureSeat),
        partnerEyebrow: String(
          secureSeat.partnerEyebrow || d.step2.secureSeat.partnerEyebrow
        ),
        partnerName: String(
          secureSeat.partnerName || d.step2.secureSeat.partnerName
        ),
      },
    },
    step3: {
      ...d.step3,
      ...step3,
    },
    success: {
      ...d.success,
      ...success,
    },
    application: {
      consent: String(application.consent || d.application.consent),
      submit: String(application.submit || d.application.submit),
    },
    summit: {
      consent: String(summit.consent || d.summit.consent),
      submit: String(summit.submit || d.summit.submit),
      success: String(summit.success || d.summit.success),
    },
    contact: {
      helper: String(contact.helper || d.contact.helper),
      submit: String(contact.submit || d.contact.submit),
      success: String(contact.success || d.contact.success),
    },
  };
}
