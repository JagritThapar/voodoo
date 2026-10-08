// Product catalogue and indicative pricing for the system designer.
// Shared by the client (live estimate) and the server (authoritative estimate on submit).
// All figures are indicative only and should be tuned by the AES team.

export const STATES = ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "ACT", "NT"] as const;
export type AuState = (typeof STATES)[number];

// STC zone rating (MWh per kW) — approximate by state's main population centres.
const ZONE_RATING: Record<AuState, number> = {
  NSW: 1.382, VIC: 1.185, QLD: 1.382, SA: 1.382, WA: 1.382, TAS: 1.185, ACT: 1.382, NT: 1.536,
};
// Average daily peak sun hours.
const SUN_HOURS: Record<AuState, number> = {
  NSW: 4.3, VIC: 3.9, QLD: 4.7, SA: 4.6, WA: 4.8, TAS: 3.6, ACT: 4.5, NT: 5.4,
};

export const STC_PRICE = 37; // $ per certificate
export const STC_DEEMING_YEARS = 5; // remaining deeming period for 2026 installs (scheme ends 2030)
export const BATTERY_STCS_PER_KWH = 6.8; // Cheaper Home Batteries Program factor (indicative)
export const IMPORT_TARIFF = 0.32; // $ per kWh
export const FEED_IN_TARIFF = 0.05; // $ per kWh
export const SOLAR_VIC_REBATE = 1400; // Solar Victoria solar panel rebate, eligible homes (indicative)

export const PANEL_OPTIONS = [
  { id: "value", name: "Tier 1 Value", detail: "440W mono panels, 25-yr product warranty", perKw: 900 },
  { id: "premium", name: "Premium", detail: "Jinko Tiger Neo / Trina Vertex S+ 440–475W", perKw: 1100 },
  { id: "elite", name: "Elite", detail: "REC Alpha / Aiko ABC — highest efficiency, 25-yr warranty", perKw: 1450 },
] as const;

export const INVERTER_OPTIONS = [
  { id: "string", name: "String inverter", detail: "Fronius / GoodWe — reliable & economical", price: 1200, batteryReady: false },
  { id: "hybrid", name: "Hybrid inverter", detail: "Battery-ready now or later — Sungrow / GoodWe", price: 2300, batteryReady: true },
  { id: "micro", name: "Microinverters", detail: "Enphase IQ8 — panel-level optimisation for shaded roofs", price: 3800, batteryReady: false },
] as const;

export const BATTERY_OPTIONS = [
  { id: "none", name: "No battery", kwh: 0, price: 0 },
  { id: "b10", name: "10 kWh", kwh: 10, price: 9900 },
  { id: "b13", name: "13.5 kWh (Tesla Powerwall 3)", kwh: 13.5, price: 15500 },
  { id: "b16", name: "16 kWh", kwh: 16, price: 13900 },
  { id: "b25", name: "25 kWh", kwh: 25, price: 19900 },
  { id: "b40", name: "40 kWh", kwh: 40, price: 29900 },
  { id: "b50", name: "50 kWh", kwh: 50, price: 35900 },
] as const;

export const EV_OPTIONS = [
  { id: "none", name: "No EV charger", price: 0 },
  { id: "ev7", name: "7 kW smart charger (single phase)", price: 1690 },
  { id: "ev22", name: "22 kW smart charger (three phase)", price: 2390 },
] as const;

export const AIRCON_OPTIONS = [
  { id: "none", name: "No air conditioning", price: 0, rebate: 0 },
  { id: "split", name: "Split system (1 room)", price: 2490, rebate: 0 },
  { id: "multi", name: "Multi split (3 rooms)", price: 6990, rebate: 0 },
  { id: "ducted", name: "Ducted, whole home", price: 14900, rebate: 0 },
] as const;

export const WATER_OPTIONS = [
  { id: "none", name: "No water filtration", price: 0 },
  { id: "whole", name: "Whole-home filtration (fitted at the mains)", price: 3490 },
] as const;

export const HOT_WATER_OPTIONS = [
  { id: "none", name: "No hot water upgrade", price: 0, rebate: 0 },
  { id: "hp200", name: "Heat pump 200L (1–3 people)", price: 3990, rebate: 1000 },
  { id: "hp270", name: "Heat pump 270L (3–6 people)", price: 4590, rebate: 1100 },
  { id: "hp350", name: "Heat pump 350L (5+ people)", price: 5290, rebate: 1200 },
] as const;

export const ROOF_TYPES = ["Tin / Colorbond", "Tile (concrete)", "Tile (terracotta)", "Klip-Lok", "Flat", "Other / not sure"] as const;

export const SOLAR_SIZES = [0, 6.6, 8, 10, 13.2, 15, 20, 25, 30] as const;

export type Design = {
  state: AuState;
  postcode: string;
  quarterlyBill: number;
  roofType: string;
  storeys: 1 | 2 | 3;
  phase: "single" | "three";
  solarKw: number;
  panel: (typeof PANEL_OPTIONS)[number]["id"];
  inverter: (typeof INVERTER_OPTIONS)[number]["id"];
  battery: (typeof BATTERY_OPTIONS)[number]["id"];
  ev: (typeof EV_OPTIONS)[number]["id"];
  hotWater: (typeof HOT_WATER_OPTIONS)[number]["id"];
  aircon: (typeof AIRCON_OPTIONS)[number]["id"];
  water: (typeof WATER_OPTIONS)[number]["id"];
  birdProofing: boolean;
  notes: string;
};

export const DEFAULT_DESIGN: Design = {
  state: "VIC",
  postcode: "",
  quarterlyBill: 600,
  roofType: ROOF_TYPES[0],
  storeys: 1,
  phase: "single",
  solarKw: 10,
  panel: "premium",
  inverter: "hybrid",
  battery: "none",
  ev: "none",
  hotWater: "none",
  aircon: "none",
  water: "none",
  birdProofing: false,
  notes: "",
};

const pick = <T extends { id: string }>(list: readonly T[], id: string): T =>
  list.find((o) => o.id === id) ?? list[0];

/** Coerce untrusted input into a valid design. */
export function normaliseDesign(raw: Partial<Record<keyof Design, unknown>>): Design {
  const d = DEFAULT_DESIGN;
  const num = (v: unknown, fallback: number) => (Number.isFinite(Number(v)) ? Number(v) : fallback);
  const state = STATES.includes(raw.state as AuState) ? (raw.state as AuState) : d.state;
  const solarKw = SOLAR_SIZES.includes(num(raw.solarKw, d.solarKw) as (typeof SOLAR_SIZES)[number])
    ? num(raw.solarKw, d.solarKw)
    : d.solarKw;
  const storeys = [1, 2, 3].includes(num(raw.storeys, 1)) ? (num(raw.storeys, 1) as 1 | 2 | 3) : 1;
  return {
    state,
    postcode: String(raw.postcode ?? "").replace(/\D/g, "").slice(0, 4),
    quarterlyBill: Math.min(10000, Math.max(0, Math.round(num(raw.quarterlyBill, d.quarterlyBill)))),
    roofType: ROOF_TYPES.includes(raw.roofType as (typeof ROOF_TYPES)[number]) ? String(raw.roofType) : d.roofType,
    storeys,
    phase: raw.phase === "three" ? "three" : "single",
    solarKw,
    panel: pick(PANEL_OPTIONS, String(raw.panel)).id,
    inverter: pick(INVERTER_OPTIONS, String(raw.inverter)).id,
    battery: pick(BATTERY_OPTIONS, String(raw.battery)).id,
    ev: pick(EV_OPTIONS, String(raw.ev)).id,
    hotWater: pick(HOT_WATER_OPTIONS, String(raw.hotWater)).id,
    aircon: pick(AIRCON_OPTIONS, String(raw.aircon)).id,
    water: pick(WATER_OPTIONS, String(raw.water)).id,
    birdProofing: raw.birdProofing === true || raw.birdProofing === "true" || raw.birdProofing === "on",
    notes: String(raw.notes ?? "").slice(0, 1000),
  };
}

export type Estimate = {
  lines: { label: string; amount: number }[];
  gross: number;
  rebates: { label: string; amount: number }[];
  net: number;
  low: number;
  high: number;
  annualGenerationKwh: number;
  annualSavings: number;
  paybackYears: number | null;
  warnings: string[];
};

export function estimate(d: Design): Estimate {
  const panel = pick(PANEL_OPTIONS, d.panel);
  const inverter = pick(INVERTER_OPTIONS, d.inverter);
  const battery = pick(BATTERY_OPTIONS, d.battery);
  const ev = pick(EV_OPTIONS, d.ev);
  const hw = pick(HOT_WATER_OPTIONS, d.hotWater);
  const ac = pick(AIRCON_OPTIONS, d.aircon ?? "none");
  const water = pick(WATER_OPTIONS, d.water ?? "none");
  const warnings: string[] = [];

  const lines: Estimate["lines"] = [];
  if (d.solarKw > 0) {
    lines.push({ label: `${d.solarKw} kW solar — ${panel.name} panels`, amount: d.solarKw * panel.perKw });
    lines.push({ label: inverter.name, amount: inverter.price });
    if (d.storeys > 1) lines.push({ label: `${d.storeys}-storey access`, amount: (d.storeys - 1) * 450 });
    if (d.roofType.startsWith("Tile (terracotta)")) lines.push({ label: "Terracotta tile handling", amount: 350 });
    if (d.roofType === "Flat") lines.push({ label: "Tilt frames", amount: Math.round(d.solarKw * 90) });
    if (d.birdProofing) lines.push({ label: "Bird proofing mesh", amount: 690 });
  }
  if (battery.kwh > 0) {
    lines.push({ label: `Battery — ${battery.name}`, amount: battery.price });
    if (d.solarKw > 0 && !inverter.batteryReady && battery.id !== "b13") {
      warnings.push("Your inverter isn't battery-ready — we'll quote an AC-coupled battery or suggest a hybrid inverter.");
      lines.push({ label: "AC-coupling kit", amount: 900 });
    }
  }
  if (ev.price) lines.push({ label: ev.name, amount: ev.price });
  if (ev.id === "ev22" && d.phase === "single") warnings.push("22 kW chargers need three-phase power — a 7 kW charger may suit better.");
  if (hw.price) lines.push({ label: hw.name, amount: hw.price });
  if (ac.price) lines.push({ label: `Air con: ${ac.name}`, amount: ac.price });
  if (water.price) lines.push({ label: water.name, amount: water.price });
  if (d.solarKw > 10 && d.phase === "single") warnings.push("Systems over 10 kW on single phase may be export-limited by your network.");
  if (d.solarKw === 0 && battery.kwh === 0 && !ev.price && !hw.price && !ac.price && !water.price) warnings.push("Pick at least one product to get an estimate.");

  const gross = lines.reduce((s, l) => s + l.amount, 0);

  const rebates: Estimate["rebates"] = [];
  if (d.solarKw > 0) {
    const stcs = Math.floor(d.solarKw * ZONE_RATING[d.state] * STC_DEEMING_YEARS);
    rebates.push({ label: `Federal solar STCs (~${stcs} certificates)`, amount: stcs * STC_PRICE });
  }
  if (battery.kwh > 0) {
    const stcs = Math.floor(Math.min(battery.kwh, 50) * BATTERY_STCS_PER_KWH);
    rebates.push({ label: `Cheaper Home Batteries discount (~${stcs} STCs)`, amount: stcs * STC_PRICE });
  }
  if (d.solarKw > 0 && d.state === "VIC") rebates.push({ label: "Solar Victoria panel rebate (if eligible)", amount: SOLAR_VIC_REBATE });
  if (hw.rebate) rebates.push({ label: d.state === "VIC" ? "Heat pump STCs + Solar Victoria / VEU" : "Heat pump STC / state incentive", amount: hw.rebate });
  const rebateTotal = rebates.reduce((s, r) => s + r.amount, 0);
  const net = Math.max(0, gross - rebateTotal);

  const annualGenerationKwh = Math.round(d.solarKw * SUN_HOURS[d.state] * 365 * 0.8);
  const annualUsageKwh = (d.quarterlyBill * 4) / IMPORT_TARIFF;
  const selfUseRatio = Math.min(0.9, 0.35 + battery.kwh * 0.035);
  const selfUsed = Math.min(annualGenerationKwh * selfUseRatio, annualUsageKwh * 0.9);
  const exported = Math.max(0, annualGenerationKwh - selfUsed);
  let annualSavings = selfUsed * IMPORT_TARIFF + exported * FEED_IN_TARIFF;
  if (hw.price) annualSavings += 450;
  annualSavings = Math.round(Math.min(annualSavings, d.quarterlyBill * 4 + (hw.price ? 450 : 0)));
  const paybackYears = annualSavings > 0 ? Math.round((net / annualSavings) * 10) / 10 : null;

  const round100 = (n: number) => Math.round(n / 100) * 100;
  return {
    lines,
    gross,
    rebates,
    net,
    low: round100(net * 0.92),
    high: round100(net * 1.08),
    annualGenerationKwh,
    annualSavings,
    paybackYears,
    warnings,
  };
}

export function designTitle(d: Design): string {
  const parts: string[] = [];
  if (d.solarKw > 0) parts.push(`${d.solarKw} kW Solar`);
  const battery = pick(BATTERY_OPTIONS, d.battery);
  if (battery.kwh > 0) parts.push(`${battery.kwh} kWh Battery`);
  if (d.ev !== "none") parts.push("EV Charger");
  if (d.hotWater !== "none") parts.push("Heat Pump");
  if (d.aircon && d.aircon !== "none") parts.push("Air Con");
  if (d.water && d.water !== "none") parts.push("Water Filtration");
  return parts.join(" + ") || "Custom system";
}

export function designSummary(d: Design): string[] {
  const out: string[] = [];
  if (d.solarKw > 0) {
    out.push(`${d.solarKw} kW ${pick(PANEL_OPTIONS, d.panel).name} panels`);
    out.push(pick(INVERTER_OPTIONS, d.inverter).name);
  }
  if (d.battery !== "none") out.push(`Battery: ${pick(BATTERY_OPTIONS, d.battery).name}`);
  if (d.ev !== "none") out.push(pick(EV_OPTIONS, d.ev).name);
  if (d.hotWater !== "none") out.push(pick(HOT_WATER_OPTIONS, d.hotWater).name);
  if (d.aircon && d.aircon !== "none") out.push(`Air con: ${pick(AIRCON_OPTIONS, d.aircon).name}`);
  if (d.water && d.water !== "none") out.push(pick(WATER_OPTIONS, d.water).name);
  if (d.birdProofing) out.push("Bird proofing");
  out.push(`${d.roofType} roof, ${d.storeys} storey, ${d.phase} phase`);
  out.push(`${d.state}${d.postcode ? " " + d.postcode : ""} · ~$${d.quarterlyBill}/quarter bill`);
  return out;
}
