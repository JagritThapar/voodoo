import { requireUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { wallet } from "@/lib/referrals";
import { COMMISSION_STATUS, MIN_PAYOUT, PAYOUT_STATUS, REFER_TABS, aud, fmtDate, rewardLabel } from "@/lib/constants";
import { requestPayout, saveBankDetails } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/form";
import { SubTabs } from "@/components/nav";
import { Badge, Card, Empty, Field, PageHeader, Stat } from "@/components/ui";

export const metadata = { title: "Earnings" };

type Row = { id: number; product: string; level: number; amount: number; status: string; created_at: string; name: string; referred_first: string | null; referred_last: string | null };
type Payout = { id: number; amount: number; status: string; reference: string | null; created_at: string; processed_at: string | null };

export default async function EarningsPage() {
  const user = await requireUser();
  const w = await wallet(user.id);
  const rows = await all<Row>(
    `SELECT c.id, c.product, c.level, c.amount, c.status, c.created_at, r.name, u.first_name AS referred_first, u.last_name AS referred_last
     FROM commissions c JOIN referrals r ON r.id = c.referral_id LEFT JOIN users u ON u.id = r.referred_user_id
     WHERE c.beneficiary_id = ? ORDER BY c.created_at DESC`,
    user.id,
  );
  const payouts = await all<Payout>("SELECT * FROM payouts WHERE user_id = ? ORDER BY created_at DESC", user.id);
  const display = (r: Row) => {
    const full = r.referred_first ? `${r.referred_first} ${r.referred_last ?? ""}`.trim() : r.name;
    const parts = full.split(/\s+/);
    return r.level === 1 || parts.length < 2 ? full : `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  return (
    <>
      <PageHeader title="Your rewards." />
      <SubTabs tabs={REFER_TABS} />

      <div className="grid grid-cols-2 gap-3">
        <Stat accent label="Available" value={aud(w.available)} />
        <Stat label="Pending" value={aud(w.pending + w.inPayout)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Withdraw">
          <p className="-mt-2 mb-4 text-sm text-ink-500">Minimum {aud(MIN_PAYOUT)}. Paid within 5 business days.</p>
          <ActionForm action={requestPayout} resetOnSuccess={false}>
            <SubmitButton className="btn-volt w-full" pendingText="Requesting…">
              Withdraw {aud(w.available)}
            </SubmitButton>
          </ActionForm>
        </Card>

        <Card title="Bank details">
          <ActionForm action={saveBankDetails} resetOnSuccess={false} className="space-y-3">
            <Field label="Account name"><input className="input" name="account_name" defaultValue={user.bank_account_name ?? ""} /></Field>
            <div className="grid grid-cols-[7rem_1fr] gap-3">
              <Field label="BSB"><input className="input" name="bsb" inputMode="numeric" defaultValue={user.bank_bsb ?? ""} placeholder="062-000" /></Field>
              <Field label="Account number"><input className="input" name="account_number" inputMode="numeric" defaultValue={user.bank_account_number ?? ""} /></Field>
            </div>
            <SubmitButton className="btn-ghost">Save bank details</SubmitButton>
          </ActionForm>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold text-ink-900">History</h2>
      {rows.length ? (
        <div className="card divide-y divide-cream-200">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-900 font-display text-xs font-black text-lime-400">L{r.level}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink-900">{display(r)} · {rewardLabel(r.product)}</p>
                <p className="text-xs text-ink-500">{fmtDate(r.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums text-ink-900">{aud(r.amount)}</p>
                <Badge tone={COMMISSION_STATUS[r.status].tone}>{COMMISSION_STATUS[r.status].label}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty title="No rewards yet" />
      )}

      {payouts.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-semibold text-ink-900">Payouts</h2>
          <div className="card divide-y divide-cream-200">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-ink-900">{aud(p.amount)}</p>
                  <p className="text-xs text-ink-500">Requested {fmtDate(p.created_at)}{p.reference ? ` · Ref ${p.reference}` : ""}</p>
                </div>
                <Badge tone={PAYOUT_STATUS[p.status].tone}>{PAYOUT_STATUS[p.status].label}</Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
