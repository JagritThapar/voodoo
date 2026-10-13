// Shared, client-safe constants.

export const COMPANY = {
  name: "Aussie Energy Savers",
  short: "AES",
  tagline: ["Smart energy.", "Made easy."],
  website: "https://www.aussieenergysavers.com.au",
  phone: "03 7056 9256",
  email: "hello@aussieenergysavers.com.au",
  address: "4 Gilguy Place, South Morang VIC",
  abn: "58 681 100 676",
};

/** Proof points from the AES capability statement. */
export const PROOF = [
  { value: "500+", label: "Homes upgraded" },
  { value: "10MW+", label: "Solar delivered" },
  { value: "28 yrs", label: "Combined experience" },
  { value: "10+", label: "Install crews" },
];

/** Written warranties, as listed in the capability statement. */
export const WARRANTIES = [
  { item: "Panels", years: "25+ yrs", pct: 100 },
  { item: "Batteries", years: "10+ yrs", pct: 40 },
  { item: "Air conditioning", years: "7+ yrs", pct: 28 },
  { item: "Water filtration", years: "7 yrs", pct: 28 },
  { item: "Heat pumps", years: "5+ yrs", pct: 20 },
  { item: "Our workmanship", years: "5 yrs", pct: 20 },
];

/**
 * Multi-level referral rewards, paid per product when a referred customer's system is installed.
 * `amounts[0]` goes to whoever referred them (level 1), `amounts[1]` to that person's referrer, and so on.
 * Rewards come only from completed installs (never sign-ups), so this stays a sales referral scheme.
 * Products not listed here (e.g. air con) don't earn a reward.
 */
export const REWARD_PRODUCTS = [
  { key: "battery", label: "Battery", amounts: [200, 100, 50] },
  { key: "solar", label: "Solar panels", amounts: [75, 50, 25] },
  { key: "heat_pump", label: "Heat pump", amounts: [75, 50, 25] },
  { key: "water_filter", label: "Water filter", amounts: [75, 50, 25] },
  { key: "ev_charger", label: "EV charger", amounts: [75, 50, 25] },
] as const;
export type RewardProduct = (typeof REWARD_PRODUCTS)[number]["key"];
export const REWARD_DEPTH = 3;
export const TOP_REWARD = Math.max(...REWARD_PRODUCTS.map((p) => p.amounts[0]));
export const rewardLabel = (key: string) => REWARD_PRODUCTS.find((p) => p.key === key)?.label ?? "Install";

export const MIN_PAYOUT = 100;

export const REFER_TABS = [
  { href: "/referrals", label: "Refer" },
  { href: "/network", label: "Network" },
  { href: "/earnings", label: "Earnings" },
];

export const PROJECT_FLOW = ["requested", "quoted", "accepted", "scheduled", "installed", "connected"] as const;
export type ProjectStatus = (typeof PROJECT_FLOW)[number] | "declined" | "cancelled";

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; step: string; tone: Tone }> = {
  requested: { label: "Quote requested", step: "Assess & design", tone: "amber" },
  quoted: { label: "Quote ready", step: "Your quote", tone: "sky" },
  accepted: { label: "Quote accepted", step: "Approvals & rebates", tone: "sky" },
  scheduled: { label: "Install booked", step: "Install", tone: "violet" },
  installed: { label: "Installed", step: "Compliance & handover", tone: "green" },
  connected: { label: "System live", step: "You save", tone: "green" },
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
  installed: { label: "Installed", tone: "green" },
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

export const INTERESTS = ["Battery", "Solar + Battery", "Solar", "Heat pump", "Water filter", "EV charger", "Air con", "Not sure yet"] as const;

export const aud = (n: number) =>
  n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

export const fmtDate = (s: string | null | undefined) =>
  s ? new Date(s.includes("T") || s.length <= 10 ? s : s.replace(" ", "T") + "Z").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—";
