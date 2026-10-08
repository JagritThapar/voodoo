import "server-only";
import { all, one, run } from "./db";
import { REFERRAL_FLOW, REWARD_LEVELS, type ReferralStatus } from "./constants";

export type Referral = {
  id: number;
  referrer_id: number;
  referred_user_id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
  suburb: string | null;
  interest: string | null;
  notes: string | null;
  status: ReferralStatus;
  created_at: string;
  updated_at: string;
};

/**
 * Pays every eligible upline member for a referral that has been installed.
 * Level 1 is the person who made the referral; each further level walks up `referred_by`.
 * Idempotent thanks to UNIQUE(referral_id, level).
 */
export function awardCommissions(referralId: number) {
  const referral = one<Referral>("SELECT * FROM referrals WHERE id = ?", referralId);
  if (!referral) return;
  let beneficiary: number | null = referral.referrer_id;
  const seen = new Set<number>();
  for (const tier of REWARD_LEVELS) {
    if (beneficiary == null || seen.has(beneficiary)) break;
    seen.add(beneficiary);
    run(
      "INSERT OR IGNORE INTO commissions (beneficiary_id, referral_id, level, amount) VALUES (?, ?, ?, ?)",
      beneficiary,
      referralId,
      tier.level,
      tier.amount,
    );
    beneficiary = one<{ referred_by: number | null }>("SELECT referred_by FROM users WHERE id = ?", beneficiary)?.referred_by ?? null;
  }
}

/** Set a referral's status. Moving to `installed` triggers upline rewards. */
export function setReferralStatus(referralId: number, status: ReferralStatus) {
  run("UPDATE referrals SET status = ?, updated_at = datetime('now') WHERE id = ?", status, referralId);
  if (status === "installed") awardCommissions(referralId);
}

/** Moves the referral attached to a customer forward (never backwards) as their project progresses. */
export function advanceReferralForUser(userId: number, status: ReferralStatus) {
  const referral = one<Referral>("SELECT * FROM referrals WHERE referred_user_id = ?", userId);
  if (!referral || referral.status === "lost") return;
  const rank = (s: ReferralStatus) => REFERRAL_FLOW.indexOf(s as (typeof REFERRAL_FLOW)[number]);
  if (rank(status) > rank(referral.status)) setReferralStatus(referral.id, status);
}

/** Links a newly-registered user into the network, via referral code or a matching lead email. */
export function attachNewUser(user: { id: number; email: string; name: string; suburb: string | null }, code: string | null) {
  const referrer = code
    ? one<{ id: number }>("SELECT id FROM users WHERE referral_code = ? COLLATE NOCASE", code.trim())
    : undefined;

  // Prefer an existing lead for this email (from the same referrer if a code was used).
  const lead = referrer
    ? one<Referral>("SELECT * FROM referrals WHERE email = ? AND referrer_id = ? AND referred_user_id IS NULL ORDER BY id DESC", user.email, referrer.id)
    : one<Referral>("SELECT * FROM referrals WHERE email = ? AND referred_user_id IS NULL ORDER BY id DESC", user.email);

  const referrerId = referrer?.id ?? lead?.referrer_id;
  if (!referrerId || referrerId === user.id) return;

  run("UPDATE users SET referred_by = ? WHERE id = ?", referrerId, user.id);
  if (lead) {
    run("UPDATE referrals SET referred_user_id = ?, status = 'joined', updated_at = datetime('now') WHERE id = ?", user.id, lead.id);
  } else {
    run(
      "INSERT INTO referrals (referrer_id, referred_user_id, name, email, suburb, status) VALUES (?, ?, ?, ?, ?, 'joined')",
      referrerId,
      user.id,
      user.name,
      user.email,
      user.suburb,
    );
  }
}

export type Wallet = { pending: number; available: number; inPayout: number; paid: number; lifetime: number };

export function wallet(userId: number): Wallet {
  const r = one<Record<keyof Wallet, number | null>>(
    `SELECT
       SUM(CASE WHEN status = 'pending' THEN amount END) AS pending,
       SUM(CASE WHEN status = 'approved' AND payout_id IS NULL THEN amount END) AS available,
       SUM(CASE WHEN status = 'approved' AND payout_id IS NOT NULL THEN amount END) AS inPayout,
       SUM(CASE WHEN status = 'paid' THEN amount END) AS paid,
       SUM(CASE WHEN status != 'void' THEN amount END) AS lifetime
     FROM commissions WHERE beneficiary_id = ?`,
    userId,
  )!;
  return {
    pending: r.pending ?? 0,
    available: r.available ?? 0,
    inPayout: r.inPayout ?? 0,
    paid: r.paid ?? 0,
    lifetime: r.lifetime ?? 0,
  };
}

export type NetworkNode = {
  key: string;
  level: number;
  name: string;
  suburb: string | null;
  status: ReferralStatus;
  joined: string;
  earned: number;
  isMember: boolean;
  children: NetworkNode[];
};

const MAX_DEPTH = REWARD_LEVELS.length + 2;

/**
 * Builds the viewer's downline. Members (people with accounts) can have their own children;
 * leads without an account are leaves. Beyond level 1, surnames are reduced to an initial.
 */
export function buildNetwork(rootUserId: number): NetworkNode[] {
  const earnedByReferral = new Map(
    all<{ referral_id: number; total: number }>(
      "SELECT referral_id, SUM(amount) AS total FROM commissions WHERE beneficiary_id = ? AND status != 'void' GROUP BY referral_id",
      rootUserId,
    ).map((r) => [r.referral_id, r.total]),
  );

  const walk = (userId: number, level: number, seen: Set<number>): NetworkNode[] => {
    if (level > MAX_DEPTH) return [];
    const rows = all<Referral & { first_name: string | null; last_name: string | null; user_suburb: string | null; user_created: string | null }>(
      `SELECT r.*, u.first_name, u.last_name, u.suburb AS user_suburb, u.created_at AS user_created
       FROM referrals r LEFT JOIN users u ON u.id = r.referred_user_id
       WHERE r.referrer_id = ? ORDER BY r.created_at DESC`,
      userId,
    );
    return rows.map((r) => {
      const full = r.first_name ? `${r.first_name} ${r.last_name ?? ""}`.trim() : r.name;
      const parts = full.split(/\s+/);
      const name = level === 1 || parts.length < 2 ? full : `${parts[0]} ${parts[parts.length - 1][0]}.`;
      const isMember = r.referred_user_id != null && !seen.has(r.referred_user_id);
      return {
        key: `r${r.id}`,
        level,
        name,
        suburb: r.user_suburb ?? r.suburb,
        status: r.status,
        joined: r.user_created ?? r.created_at,
        earned: earnedByReferral.get(r.id) ?? 0,
        isMember,
        children: isMember ? walk(r.referred_user_id!, level + 1, new Set([...seen, r.referred_user_id!])) : [],
      };
    });
  };
  return walk(rootUserId, 1, new Set([rootUserId]));
}

export function flatten(nodes: NetworkNode[]): NetworkNode[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children)]);
}
