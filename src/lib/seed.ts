import type { Client, InArgs, Transaction } from "@libsql/client";
import { DEFAULT_DESIGN, designTitle, estimate, type Design } from "./catalog";
import { hashPassword } from "./password";

type Q = (sql: string, ...args: unknown[]) => Promise<number>; // returns last insert id

const POSTS = [
  {
    kind: "offer",
    title: "Your solar works all day. Make it work at night too.",
    summary: "Book a 16 kWh or larger battery before 30 November and we'll fit a 7 kW smart EV charger at cost.",
    body: "If you're exporting solar for a few cents and buying it back at peak rates at night, a right-sized battery fixes that. Book a battery of 16 kWh or more before 30 November 2026 and we'll supply and fit a 7 kW smart EV charger at cost, so your car charges from your own sunshine too. The Cheaper Home Batteries discount is applied upfront, and $0 upfront finance is available. Standard single-phase install; eligibility applies.",
    cta_label: "Design my system",
    cta_url: "/design",
    expires_at: "2026-11-30",
    days_ago: 2,
  },
  {
    kind: "news",
    title: "Cheaper Home Batteries: what changes on 1 January",
    summary: "The federal battery discount steps down again in the new year. Here's what it means for your quote, in dollars.",
    body: "The federal Cheaper Home Batteries discount is worked out from small-scale technology certificates, and the number of certificates per kWh steps down every six months. Systems installed before the next step-down get the higher discount. Ask us for an updated quote and we'll show you the difference in dollars, then handle the claim for you.",
    cta_label: "Read on our website",
    cta_url: "https://www.aussieenergysavers.com.au",
    expires_at: null,
    days_ago: 6,
  },
  {
    kind: "offer",
    title: "Three referrals installed this quarter? $300 bonus.",
    summary: "On top of your usual rewards: when three people you referred have their systems installed this quarter, we add $300.",
    body: "Your referral rewards already pay you for every install in your network. This quarter, when three of your direct referrals have their systems installed, we'll add a $300 bonus to your wallet. Share your link from the Refer tab.",
    cta_label: "Refer a mate",
    cta_url: "/referrals",
    expires_at: "2026-12-31",
    days_ago: 10,
  },
  {
    kind: "news",
    title: "Old hot water unit? Replace it once, with the rebate.",
    summary: "A heat pump running on your solar can cut hot water costs by around 70%. Solar Victoria and VEU help with the price.",
    body: "Hot water is up to a quarter of a household's energy use. Heat pumps move heat rather than make it, using about a third of the electricity of an electric storage unit, and with a timer set to solar hours the running cost drops to almost nothing. In Victoria, Solar Victoria and VEU incentives can take a big chunk off the price. We check what you qualify for and do the forms. Add one in the designer to see your estimate.",
    cta_label: "Add a heat pump",
    cta_url: "/design",
    expires_at: null,
    days_ago: 18,
  },
];

async function insertUser(q: Q, u: { email: string; first: string; last: string; suburb: string; state: string; code: string; referredBy?: number; role?: string; password: string; daysAgo: number }) {
  return q(
    `INSERT INTO users (email, password_hash, first_name, last_name, suburb, state, postcode, phone, role, referral_code, referred_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`,
    u.email, hashPassword(u.password), u.first, u.last, u.suburb, u.state, "3752", "0400 000 000", u.role ?? "customer", u.code, u.referredBy ?? null, `-${u.daysAgo} days`,
  );
}

async function insertProject(q: Q, userId: number, design: Partial<Design>, status: string, extra: { quote?: number; install?: string; daysAgo: number }) {
  const d: Design = { ...DEFAULT_DESIGN, ...design };
  const e = estimate(d);
  return q(
    `INSERT INTO projects (user_id, status, design, title, estimate_low, estimate_high, quote_price, quote_summary, quote_valid_until, install_date, installer, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now'))`,
    userId,
    status,
    JSON.stringify(d),
    designTitle(d),
    e.low,
    e.high,
    extra.quote ?? null,
    extra.quote ? "Includes all hardware, standard installation, switchboard work, network application and STC/battery discount applied." : null,
    extra.quote ? "2026-11-15" : null,
    extra.install ?? null,
    extra.install ? "Dan Kelly (A-grade electrician, CEC accredited)" : null,
    `-${extra.daysAgo} days`,
  );
}

export async function seed(client: Client) {
  const hasUsers = async (c: Client | Transaction) => Number((await c.execute("SELECT COUNT(*) AS n FROM users")).rows[0].n) > 0;
  if (await hasUsers(client)) return;

  const t = await client.transaction("write");
  try {
    // Re-check under the write lock in case another process seeded first.
    if (await hasUsers(t)) return;
    const q: Q = async (sql, ...args) => Number((await t.execute({ sql, args: args as InArgs })).lastInsertRowid ?? 0);

    await insertUser(q, {
      email: process.env.ADMIN_EMAIL ?? "admin@aussieenergysavers.com.au",
      password: process.env.ADMIN_PASSWORD ?? "ChangeMe123!",
      first: "AES",
      last: "Admin",
      suburb: "South Morang",
      state: "VIC",
      code: "AESADMIN",
      role: "admin",
      daysAgo: 400,
    });
    for (const p of POSTS) {
      await q(
        "INSERT INTO posts (kind, title, summary, body, cta_label, cta_url, expires_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))",
        p.kind, p.title, p.summary, p.body, p.cta_label, p.cta_url, p.expires_at, `-${p.days_ago} days`,
      );
    }
    if (process.env.SEED_DEMO !== "false") await seedDemo(q);
    await t.commit();
  } finally {
    t.close();
  }
}

// A small demo network so every screen has something to show. Disable with SEED_DEMO=false.
async function seedDemo(q: Q) {
  const pw = "demo1234";
  const sarah = await insertUser(q, { email: "demo@aes.test", password: pw, first: "Sarah", last: "Mitchell", suburb: "Doreen", state: "VIC", code: "SARAH2026", daysAgo: 300 });
  const james = await insertUser(q, { email: "james@aes.test", password: pw, first: "James", last: "Nguyen", suburb: "Epping", state: "VIC", code: "JAMES4821", referredBy: sarah, daysAgo: 220 });
  const priya = await insertUser(q, { email: "priya@aes.test", password: pw, first: "Priya", last: "Patel", suburb: "Mernda", state: "VIC", code: "PRIYA7310", referredBy: sarah, daysAgo: 40 });
  const liam = await insertUser(q, { email: "liam@aes.test", password: pw, first: "Liam", last: "O'Brien", suburb: "Craigieburn", state: "VIC", code: "LIAM5512", referredBy: james, daysAgo: 150 });
  const ava = await insertUser(q, { email: "ava@aes.test", password: pw, first: "Ava", last: "Chen", suburb: "Bundoora", state: "VIC", code: "AVA9034", referredBy: james, daysAgo: 20 });
  const noah = await insertUser(q, { email: "noah@aes.test", password: pw, first: "Noah", last: "Williams", suburb: "Mildura", state: "VIC", code: "NOAH2207", referredBy: liam, daysAgo: 90 });

  // Sarah: one installed system awaiting a review, and a battery upgrade quote ready to accept.
  const p1 = await insertProject(q, sarah, { solarKw: 6.6, panel: "value", inverter: "hybrid", quarterlyBill: 650 }, "connected", { quote: 6290, install: "2025-12-12", daysAgo: 290 });
  const p2 = await insertProject(q, sarah, { solarKw: 0, battery: "b16", inverter: "hybrid", ev: "ev7" }, "quoted", { quote: 11490, daysAgo: 5 });
  const events: [number, string, string | null, number][] = [
    [p1, "requested", null, 290], [p1, "quoted", "Site inspection complete — quote sent.", 286], [p1, "accepted", null, 280],
    [p1, "scheduled", "Install booked for 12 Dec.", 270], [p1, "installed", "Install completed in one day.", 263],
    [p1, "connected", "Meter reconfigured. Your system is live.", 250],
    [p2, "requested", null, 5], [p2, "quoted", "Your battery quote is ready.", 2],
  ];
  for (const [pid, s, n, d] of events) {
    await q("INSERT INTO project_events (project_id, status, note, created_at) VALUES (?, ?, ?, datetime('now', ?))", pid, s, n, `-${d} days`);
  }
  const docs = [
    ["Signed contract", "Installation agreement.", "customer"],
    ["Deposit invoice", "Deposit secures your install date.", "customer"],
    ["Recent electricity bill", "For the network application.", "customer"],
    ["Network connection approval", "Approved by Jemena.", "aes"],
    ["STC assignment form", "Federal rebate certificates assigned.", "customer"],
    ["Certificate of Electrical Safety", "Issued after install.", "aes"],
    ["Meter upgrade / grid connection", "Meter reconfigured by your retailer.", "aes"],
    ["Warranty & handover pack", "Warranties and user guides.", "aes"],
  ];
  for (const [n, desc, o] of docs) {
    await q("INSERT INTO paperwork (project_id, name, description, owner, status) VALUES (?, ?, ?, ?, ?)", p1, n, desc, o, "approved");
  }

  await insertProject(q, james, { solarKw: 10, battery: "b13" }, "connected", { quote: 19990, install: "2026-03-02", daysAgo: 200 });
  await insertProject(q, priya, { solarKw: 13.2, battery: "b25", phase: "three" }, "quoted", { quote: 24990, daysAgo: 30 });
  await insertProject(q, liam, { solarKw: 8 }, "installed", { quote: 8490, install: "2026-07-10", daysAgo: 120 });
  await insertProject(q, noah, { solarKw: 10, battery: "b10" }, "installed", { quote: 15990, install: "2026-09-20", daysAgo: 60 });

  const ref = (...a: unknown[]) =>
    q("INSERT INTO referrals (referrer_id, referred_user_id, name, email, phone, suburb, interest, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))", ...a);
  const rJames = await ref(sarah, james, "James Nguyen", "james@aes.test", null, "Epping", "Solar + Battery", "installed", "-225 days");
  await ref(sarah, priya, "Priya Patel", "priya@aes.test", null, "Mernda", "Solar + Battery", "quoted", "-45 days");
  await ref(sarah, null, "Tom Barrett", "tom.b@example.com", "0411 111 111", "Thomastown", "Battery", "submitted", "-3 days");
  await ref(sarah, null, "Mia Rossi", "mia@example.com", "0422 222 222", "Lalor", "Solar", "lost", "-80 days");
  const rLiam = await ref(james, liam, "Liam O'Brien", "liam@aes.test", null, "Craigieburn", "Solar", "installed", "-155 days");
  await ref(james, ava, "Ava Chen", "ava@aes.test", null, "Bundoora", "Not sure yet", "joined", "-20 days");
  const rNoah = await ref(liam, noah, "Noah Williams", "noah@aes.test", null, "Mildura", "Solar + Battery", "installed", "-95 days");

  const payout = await q(
    "INSERT INTO payouts (user_id, amount, status, account_name, bsb, account_number, reference, created_at, processed_at) VALUES (?, 500, 'paid', 'S Mitchell', '062-000', '12345678', 'AES-REF-1001', datetime('now','-150 days'), datetime('now','-147 days'))",
    sarah,
  );
  await q("UPDATE users SET bank_account_name = 'S Mitchell', bank_bsb = '062-000', bank_account_number = '12345678' WHERE id = ?", sarah);

  const commissions: [number, number, number, number, string, number | null, string][] = [
    [sarah, rJames, 1, 500, "paid", payout, "-170 days"],
    [james, rLiam, 1, 500, "approved", null, "-80 days"],
    [sarah, rLiam, 2, 150, "approved", null, "-80 days"],
    [liam, rNoah, 1, 500, "pending", null, "-15 days"],
    [james, rNoah, 2, 150, "pending", null, "-15 days"],
    [sarah, rNoah, 3, 50, "pending", null, "-15 days"],
  ];
  for (const c of commissions) {
    await q("INSERT INTO commissions (beneficiary_id, referral_id, level, amount, status, payout_id, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))", ...c);
  }
}
