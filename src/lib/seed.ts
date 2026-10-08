import type { DatabaseSync } from "node:sqlite";
import { DEFAULT_DESIGN, designTitle, estimate, type Design } from "./catalog";
import { hashPassword } from "./password";

const POSTS = [
  {
    kind: "offer",
    title: "Spring battery bonus: free EV charger",
    summary: "Book any battery of 16 kWh or more before 30 November and we'll install a 7 kW smart EV charger for free.",
    body: "Spring is the best time to add storage. Book any battery of 16 kWh or larger before 30 November 2026 and we'll supply and install a 7 kW smart EV charger at no extra cost (valued at $1,690). Standard single-phase install; conditions apply.",
    cta_label: "Design my system",
    cta_url: "/design",
    expires_at: "2026-11-30",
    days_ago: 2,
  },
  {
    kind: "news",
    title: "Cheaper Home Batteries Program: what changes in 2027",
    summary: "The federal battery discount steps down again on 1 January. Here's what it means for your quote.",
    body: "The federal Cheaper Home Batteries Program discount is calculated from small-scale technology certificates, and the number of certificates per kWh steps down every six months. Systems installed before the next step-down receive the higher discount. If you're on the fence, ask us for an updated quote and we'll show you the difference in dollars.",
    cta_label: "Read on our website",
    cta_url: "https://www.aussieenergysavers.com.au",
    expires_at: null,
    days_ago: 6,
  },
  {
    kind: "offer",
    title: "Refer 3 friends this quarter, get a $300 bonus",
    summary: "On top of your normal referral rewards, earn a $300 bonus when three of your referrals install this quarter.",
    body: "Our referral program already pays you for every install in your network. This quarter, when three of your direct referrals have their systems installed, we'll add a $300 bonus to your wallet. Share your link from the Refer tab.",
    cta_label: "Refer a friend",
    cta_url: "/referrals",
    expires_at: "2026-12-31",
    days_ago: 10,
  },
  {
    kind: "news",
    title: "Heat pump hot water: the quiet bill-killer",
    summary: "Hot water is up to a quarter of household energy. A heat pump running on your solar can cut that by 70%.",
    body: "Heat pumps move heat rather than generate it, using around a third of the electricity of an electric storage system. Paired with a timer that runs during solar hours, many households see hot water costs fall to almost nothing. Add one in the designer to see your estimate.",
    cta_label: "Add a heat pump",
    cta_url: "/design",
    expires_at: null,
    days_ago: 18,
  },
];

function insertUser(db: DatabaseSync, u: { email: string; first: string; last: string; suburb: string; state: string; code: string; referredBy?: number; role?: string; password: string; daysAgo: number }) {
  const r = db
    .prepare(
      `INSERT INTO users (email, password_hash, first_name, last_name, suburb, state, postcode, phone, role, referral_code, referred_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`,
    )
    .run(u.email, hashPassword(u.password), u.first, u.last, u.suburb, u.state, "2000", "0400 000 000", u.role ?? "customer", u.code, u.referredBy ?? null, `-${u.daysAgo} days`);
  return Number(r.lastInsertRowid);
}

function insertProject(db: DatabaseSync, userId: number, design: Partial<Design>, status: string, extra: { quote?: number; install?: string; daysAgo: number }) {
  const d: Design = { ...DEFAULT_DESIGN, ...design };
  const e = estimate(d);
  const r = db
    .prepare(
      `INSERT INTO projects (user_id, status, design, title, estimate_low, estimate_high, quote_price, quote_summary, quote_valid_until, install_date, installer, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now'))`,
    )
    .run(
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
  return Number(r.lastInsertRowid);
}

export function seed(db: DatabaseSync) {
  const hasUsers = () => (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n > 0;
  if (hasUsers()) return;

  db.exec("BEGIN IMMEDIATE");
  try {
    // Re-check under the write lock in case another process seeded first.
    if (hasUsers()) {
      db.exec("ROLLBACK");
      return;
    }
    insertUser(db, {
      email: process.env.ADMIN_EMAIL ?? "admin@aussieenergysavers.com.au",
      password: process.env.ADMIN_PASSWORD ?? "ChangeMe123!",
      first: "AES",
      last: "Admin",
      suburb: "Sydney",
      state: "NSW",
      code: "AESADMIN",
      role: "admin",
      daysAgo: 400,
    });

    const post = db.prepare(
      "INSERT INTO posts (kind, title, summary, body, cta_label, cta_url, expires_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?))",
    );
    for (const p of POSTS) post.run(p.kind, p.title, p.summary, p.body, p.cta_label, p.cta_url, p.expires_at, `-${p.days_ago} days`);

    if (process.env.SEED_DEMO !== "false") seedDemo(db);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

// A small demo network so every screen has something to show. Disable with SEED_DEMO=false.
function seedDemo(db: DatabaseSync) {
  const pw = "demo1234";
  const sarah = insertUser(db, { email: "demo@aes.test", password: pw, first: "Sarah", last: "Mitchell", suburb: "Parramatta", state: "NSW", code: "SARAH2026", daysAgo: 300 });
  const james = insertUser(db, { email: "james@aes.test", password: pw, first: "James", last: "Nguyen", suburb: "Blacktown", state: "NSW", code: "JAMES4821", referredBy: sarah, daysAgo: 220 });
  const priya = insertUser(db, { email: "priya@aes.test", password: pw, first: "Priya", last: "Patel", suburb: "Castle Hill", state: "NSW", code: "PRIYA7310", referredBy: sarah, daysAgo: 40 });
  const liam = insertUser(db, { email: "liam@aes.test", password: pw, first: "Liam", last: "O'Brien", suburb: "Penrith", state: "NSW", code: "LIAM5512", referredBy: james, daysAgo: 150 });
  const ava = insertUser(db, { email: "ava@aes.test", password: pw, first: "Ava", last: "Chen", suburb: "Ryde", state: "NSW", code: "AVA9034", referredBy: james, daysAgo: 20 });
  const noah = insertUser(db, { email: "noah@aes.test", password: pw, first: "Noah", last: "Williams", suburb: "Richmond", state: "NSW", code: "NOAH2207", referredBy: liam, daysAgo: 90 });

  // Sarah: one installed system awaiting a review, and a battery upgrade quote ready to accept.
  const p1 = insertProject(db, sarah, { solarKw: 6.6, panel: "value", inverter: "hybrid", quarterlyBill: 650 }, "connected", { quote: 6290, install: "2025-12-12", daysAgo: 290 });
  const p2 = insertProject(db, sarah, { solarKw: 0, battery: "b16", inverter: "hybrid", ev: "ev7" }, "quoted", { quote: 11490, daysAgo: 5 });
  const ev = db.prepare("INSERT INTO project_events (project_id, status, note, created_at) VALUES (?, ?, ?, datetime('now', ?))");
  [["requested", null, 290], ["quoted", "Site inspection complete — quote sent.", 286], ["accepted", null, 280], ["scheduled", "Install booked for 12 Dec.", 270], ["installed", "Install completed in one day.", 263], ["connected", "Meter reconfigured — your system is live!", 250]].forEach(([s, n, d]) => ev.run(p1, s, n, `-${d} days`));
  [["requested", null, 5], ["quoted", "Your battery quote is ready.", 2]].forEach(([s, n, d]) => ev.run(p2, s, n, `-${d} days`));
  const pwk = db.prepare("INSERT INTO paperwork (project_id, name, description, owner, status) VALUES (?, ?, ?, ?, ?)");
  [
    ["Signed contract", "Installation agreement.", "customer"],
    ["Deposit invoice", "Deposit secures your install date.", "customer"],
    ["Recent electricity bill", "For the network application.", "customer"],
    ["Network connection approval", "Approved by Endeavour Energy.", "aes"],
    ["STC assignment form", "Federal rebate certificates assigned.", "customer"],
    ["Certificate of Electrical Safety", "Issued after install.", "aes"],
    ["Meter upgrade / grid connection", "Meter reconfigured by your retailer.", "aes"],
    ["Warranty & handover pack", "Warranties and user guides.", "aes"],
  ].forEach(([n, desc, o]) => pwk.run(p1, n, desc, o, "approved"));

  const pj = insertProject(db, james, { solarKw: 10, battery: "b13" }, "connected", { quote: 19990, install: "2026-03-02", daysAgo: 200 });
  insertProject(db, priya, { solarKw: 13.2, battery: "b25", phase: "three" }, "quoted", { quote: 24990, daysAgo: 30 });
  const pl = insertProject(db, liam, { solarKw: 8 }, "installed", { quote: 8490, install: "2026-07-10", daysAgo: 120 });
  const pn = insertProject(db, noah, { solarKw: 10, battery: "b10" }, "installed", { quote: 15990, install: "2026-09-20", daysAgo: 60 });
  void pj; void pl; void pn;

  const ref = db.prepare(
    "INSERT INTO referrals (referrer_id, referred_user_id, name, email, phone, suburb, interest, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))",
  );
  const rJames = Number(ref.run(sarah, james, "James Nguyen", "james@aes.test", null, "Blacktown", "Solar + Battery", "installed", "-225 days").lastInsertRowid);
  ref.run(sarah, priya, "Priya Patel", "priya@aes.test", null, "Castle Hill", "Solar + Battery", "quoted", "-45 days");
  ref.run(sarah, null, "Tom Barrett", "tom.b@example.com", "0411 111 111", "Baulkham Hills", "Battery", "submitted", "-3 days");
  ref.run(sarah, null, "Mia Rossi", "mia@example.com", "0422 222 222", "Epping", "Solar", "lost", "-80 days");
  const rLiam = Number(ref.run(james, liam, "Liam O'Brien", "liam@aes.test", null, "Penrith", "Solar", "installed", "-155 days").lastInsertRowid);
  ref.run(james, ava, "Ava Chen", "ava@aes.test", null, "Ryde", "Not sure yet", "joined", "-20 days");
  const rNoah = Number(ref.run(liam, noah, "Noah Williams", "noah@aes.test", null, "Richmond", "Solar + Battery", "installed", "-95 days").lastInsertRowid);

  const payout = Number(
    db.prepare("INSERT INTO payouts (user_id, amount, status, account_name, bsb, account_number, reference, created_at, processed_at) VALUES (?, 500, 'paid', 'S Mitchell', '062-000', '12345678', 'AES-REF-1001', datetime('now','-150 days'), datetime('now','-147 days'))").run(sarah).lastInsertRowid,
  );
  db.prepare("UPDATE users SET bank_account_name = 'S Mitchell', bank_bsb = '062-000', bank_account_number = '12345678' WHERE id = ?").run(sarah);

  const com = db.prepare("INSERT INTO commissions (beneficiary_id, referral_id, level, amount, status, payout_id, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))");
  com.run(sarah, rJames, 1, 500, "paid", payout, "-170 days");
  com.run(james, rLiam, 1, 500, "approved", null, "-80 days");
  com.run(sarah, rLiam, 2, 150, "approved", null, "-80 days");
  com.run(liam, rNoah, 1, 500, "pending", null, "-15 days");
  com.run(james, rNoah, 2, 150, "pending", null, "-15 days");
  com.run(sarah, rNoah, 3, 50, "pending", null, "-15 days");
}
