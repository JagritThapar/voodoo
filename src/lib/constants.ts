// Shared, client-safe constants.

export const COMPANY = {
  name: "Aussie Energy Savers",
  short: "AES",
  website: "https://www.aussieenergysavers.com.au",
  phone: "1300 000 000", // TODO: replace with the real AES number
  email: "hello@aussieenergysavers.com.au",
};

/**
 * Multi-level referral rewards, paid when a referred customer's system is installed.
 * Level 1 = you referred them directly; level 2 = someone you referred referred them; etc.
 * Rewards are only ever earned from completed installs (never from sign-ups), which keeps
 * the program a product-sales referral scheme rather than a recruitment scheme.
 */
export const REWARD_LEVELS = [
  { level: 1, amount: 500, label: "Direct referral" },
  { level: 2, amount: 150, label: "Referral of your referral" },
  { level: 3, amount: 50, label: "Third level" },
] as const;

export const MIN_PAYOUT = 100;

export const REFER_TABS = [
  { href: "/referrals", label: "Refer" },
  { href: "/network", label: "Network" },
  { href: "/earnings", label: "Earnings" },
];

export const PROJECT_FLOW = ["requested", "quoted", "accepted", "scheduled", "installed", "connected"] as const;
export type ProjectStatus = (typeof PROJECT_FLOW)[number] | "declined" | "cancelled";

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; step: string; tone: Tone }> = {
  requested: { label: "Quote requested", step: "Quote requested", tone: "amber" },
  quoted: { label: "Quote ready", step: "Quote ready", tone: "sky" },
  accepted: { label: "Quote accepted", step: "Quote accepted", tone: "sky" },
  scheduled: { label: "Install scheduled", step: "Install booked", tone: "violet" },
  installed: { label: "Installed", step: "Installed", tone: "green" },
  connected: { label: "System live", step: "Grid connected", tone: "green" },
  declined: { label: "Declined", step: "Declined", tone: "slate" },
  cancelled: { label: "Cancelled", step: "Cancelled", tone: "slate" },
};

export const REFERRAL_FLOW = ["submitted", "joined", "quote_requested", "quoted", "installed"] as const;
export type ReferralStatus = (typeof REFERRAL_FLOW)[number] | "lost";

export const REFERRAL_STATUS: Record<ReferralStatus, { label: string; tone: Tone }> = {
  submitted: { label: "Referred", tone: "slate" },
  joined: { label: "Joined app", tone: "sky" },
  quote_requested: { label: "Quote requested", tone: "amber" },
  quoted: { label: "Quoted", tone: "violet" },
  installed: { label: "Installed — reward earned", tone: "green" },
  lost: { label: "Not proceeding", tone: "rose" },
};

export const PAPERWORK_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "slate" },
  action_required: { label: "Action required", tone: "amber" },
  submitted: { label: "Submitted", tone: "sky" },
  approved: { label: "Complete", tone: "green" },
};

export const COMMISSION_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Clearing", tone: "amber" },
  approved: { label: "Available", tone: "green" },
  paid: { label: "Paid", tone: "slate" },
  void: { label: "Void", tone: "rose" },
};

export const PAYOUT_STATUS: Record<string, { label: string; tone: Tone }> = {
  requested: { label: "Processing", tone: "amber" },
  paid: { label: "Paid", tone: "green" },
  rejected: { label: "Rejected", tone: "rose" },
};

export type Tone = "amber" | "sky" | "violet" | "green" | "slate" | "rose";

export const INTERESTS = ["Solar", "Battery", "Solar + Battery", "EV charger", "Hot water heat pump", "Not sure yet"] as const;

export const aud = (n: number) =>
  n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

export const fmtDate = (s: string | null | undefined) =>
  s ? new Date(s.includes("T") || s.length <= 10 ? s : s.replace(" ", "T") + "Z").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—";
