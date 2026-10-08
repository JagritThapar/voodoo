import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { COMMISSION_STATUS, REFERRAL_STATUS, aud, fmtDate, type ReferralStatus } from "@/lib/constants";
import { adminApproveAllClearing, adminSetCommission, adminSetReferral } from "../actions";
import { Badge, Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Referrals" };

export default async function AdminReferrals() {
  await requireAdmin();
  const referrals = await all<{ id: number; name: string; email: string | null; phone: string | null; suburb: string | null; interest: string | null; notes: string | null; status: ReferralStatus; created_at: string; referred_user_id: number | null; referrer: string }>(
    `SELECT r.*, u.first_name || ' ' || u.last_name AS referrer FROM referrals r JOIN users u ON u.id = r.referrer_id ORDER BY r.status = 'submitted' DESC, r.created_at DESC LIMIT 300`,
  );
  const commissions = await all<{ id: number; level: number; amount: number; status: string; payout_id: number | null; created_at: string; beneficiary: string; referral: string }>(
    `SELECT c.*, u.first_name || ' ' || u.last_name AS beneficiary, r.name AS referral
     FROM commissions c JOIN users u ON u.id = c.beneficiary_id JOIN referrals r ON r.id = c.referral_id
     ORDER BY c.status = 'pending' DESC, c.created_at DESC LIMIT 300`,
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Referrals" subtitle="Leads from customers, and the rewards they generate." />
      <Card title={`Referral leads (${referrals.length})`}>
        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-ink-500">
              <tr><th className="px-4 py-2 sm:px-5">Lead</th><th className="px-2 py-2">Contact</th><th className="px-2 py-2">Referred by</th><th className="px-2 py-2">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {referrals.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3 sm:px-5">
                    <p className="font-medium text-ink-900">{r.name} {r.referred_user_id && <Badge tone="sky">Has account</Badge>}</p>
                    <p className="text-xs text-ink-500">{[r.suburb, r.interest, fmtDate(r.created_at)].filter(Boolean).join(" · ")}</p>
                    {r.notes && <p className="mt-1 text-xs text-ink-600">“{r.notes}”</p>}
                  </td>
                  <td className="px-2 py-3 text-ink-600">{r.phone && <a className="block underline" href={`tel:${r.phone}`}>{r.phone}</a>}{r.email && <a className="block underline" href={`mailto:${r.email}`}>{r.email}</a>}</td>
                  <td className="px-2 py-3 text-ink-600">{r.referrer}</td>
                  <td className="px-2 py-3">
                    <form action={adminSetReferral} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <select name="status" defaultValue={r.status} className="input w-auto py-1.5 text-sm">
                        {(Object.keys(REFERRAL_STATUS) as ReferralStatus[]).map((s) => <option key={s} value={s}>{REFERRAL_STATUS[s].label}</option>)}
                      </select>
                      <button className="btn-ghost px-3 py-1.5">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-500">Setting a lead to “Installed” creates rewards for the referrer and their upline. Leads with accounts update automatically as their project progresses.</p>
      </Card>

      <Card
        title="Rewards"
        action={<form action={adminApproveAllClearing}><button className="btn-ghost px-3 py-1.5 text-xs">Approve all cleared (14+ days)</button></form>}
      >
        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-ink-500">
              <tr><th className="px-4 py-2 sm:px-5">Beneficiary</th><th className="px-2 py-2">From install</th><th className="px-2 py-2">Level</th><th className="px-2 py-2">Amount</th><th className="px-2 py-2">Status</th><th className="px-2 py-2" /></tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {commissions.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2.5 font-medium sm:px-5">{c.beneficiary}</td>
                  <td className="px-2 py-2.5 text-ink-600">{c.referral} · {fmtDate(c.created_at)}</td>
                  <td className="px-2 py-2.5">L{c.level}</td>
                  <td className="px-2 py-2.5 tabular-nums">{aud(c.amount)}</td>
                  <td className="px-2 py-2.5"><Badge tone={COMMISSION_STATUS[c.status].tone}>{c.payout_id && c.status === "approved" ? "In payout" : COMMISSION_STATUS[c.status].label}</Badge></td>
                  <td className="px-2 py-2.5">
                    {!c.payout_id && (c.status === "pending" || c.status === "approved") && (
                      <div className="flex gap-1">
                        {c.status === "pending" && (
                          <form action={adminSetCommission}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value="approved" /><button className="btn-ghost px-2 py-1 text-xs">Approve</button></form>
                        )}
                        <form action={adminSetCommission}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value="void" /><button className="btn-danger px-2 py-1 text-xs">Void</button></form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
