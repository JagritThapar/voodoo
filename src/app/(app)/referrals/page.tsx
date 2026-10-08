import { requireUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { appUrl } from "@/lib/url";
import { INTERESTS, REFER_TABS, REFERRAL_FLOW, REFERRAL_STATUS, REWARD_LEVELS, aud, fmtDate } from "@/lib/constants";
import type { Referral } from "@/lib/referrals";
import { submitReferral } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/form";
import { SubTabs } from "@/components/nav";
import { ShareReferral } from "@/components/share";
import { Badge, Card, Empty, Field, PageHeader } from "@/components/ui";

export const metadata = { title: "Refer friends" };

export default async function ReferralsPage() {
  const user = await requireUser();
  const link = `${await appUrl()}/signup?ref=${user.referral_code}`;
  const referrals = await all<Referral & { earned: number | null }>(
    `SELECT r.*, (SELECT SUM(amount) FROM commissions c WHERE c.referral_id = r.id AND c.beneficiary_id = ? AND c.status != 'void') AS earned
     FROM referrals r WHERE r.referrer_id = ? ORDER BY r.created_at DESC`,
    user.id,
    user.id,
  );

  return (
    <>
      <PageHeader title="Refer & earn" subtitle="Share Aussie Energy Savers and get paid when your friends install." />
      <SubTabs tabs={REFER_TABS} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <Card title="Share your link">
            <ShareReferral code={user.referral_code} link={link} firstName={user.first_name} />
          </Card>

          <Card title="Refer someone directly">
            <p className="-mt-1 mb-4 text-sm text-slate-600">Pass on their details and our team will give them a friendly call. You&apos;ll see their progress below.</p>
            <ActionForm action={submitReferral}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Friend's name"><input className="input" name="name" required /></Field>
                <Field label="Mobile"><input className="input" name="phone" type="tel" placeholder="04xx xxx xxx" /></Field>
                <Field label="Email"><input className="input" name="email" type="email" /></Field>
                <Field label="Suburb"><input className="input" name="suburb" /></Field>
              </div>
              <Field label="Interested in">
                <select className="input" name="interest" defaultValue="Solar + Battery">{INTERESTS.map((i) => <option key={i}>{i}</option>)}</select>
              </Field>
              <Field label="Notes (optional)"><textarea className="input min-h-20" name="notes" maxLength={500} placeholder="Best time to call, anything we should know…" /></Field>
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-navy-900" />
                My friend has agreed to be contacted by Aussie Energy Savers.
              </label>
              <SubmitButton className="btn-primary w-full sm:w-auto" pendingText="Sending…">Send referral</SubmitButton>
            </ActionForm>
          </Card>
        </div>

        <Card title="How you earn">
          <p className="-mt-1 mb-4 text-sm text-slate-600">
            Rewards are paid when a referred household&apos;s system is <strong>installed</strong>, and you keep earning when the people you refer refer others.
          </p>
          <ol className="space-y-2">
            {REWARD_LEVELS.map((l) => (
              <li key={l.level} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-sm font-bold text-white">L{l.level}</span>
                <span className="flex-1 text-sm">
                  <span className="block font-semibold text-navy-950">{l.label}</span>
                  <span className="text-slate-500">{l.level === 1 ? "Someone you referred installs" : `An install ${l.level} steps down your network`}</span>
                </span>
                <span className="text-lg font-bold tabular-nums text-leaf-600">{aud(l.amount)}</span>
              </li>
            ))}
          </ol>
          <ul className="mt-4 space-y-1 text-xs text-slate-500">
            <li>• Rewards clear 14 days after install, then you can withdraw to your bank.</li>
            <li>• No rewards are paid for sign-ups alone, only for completed installs.</li>
            <li>• Referred customers must be new to Aussie Energy Savers.</li>
          </ul>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 font-semibold text-navy-950">Your referrals ({referrals.length})</h2>
      {referrals.length ? (
        <div className="space-y-2">
          {referrals.map((r) => {
            const idx = REFERRAL_FLOW.indexOf(r.status as (typeof REFERRAL_FLOW)[number]);
            return (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-950">{r.name}</p>
                    <p className="text-sm text-slate-500">{[r.suburb, r.interest, `referred ${fmtDate(r.created_at)}`].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="text-right">
                    <Badge tone={REFERRAL_STATUS[r.status].tone}>{REFERRAL_STATUS[r.status].label}</Badge>
                    {r.earned ? <p className="mt-1 text-sm font-semibold text-leaf-600">+{aud(r.earned)}</p> : null}
                  </div>
                </div>
                {idx >= 0 && (
                  <div className="mt-3 flex gap-1">
                    {REFERRAL_FLOW.map((s, i) => <span key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-leaf-500" : "bg-slate-200"}`} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Empty title="No referrals yet">Share your link or refer someone above. You&apos;ll be able to follow their progress here.</Empty>
      )}
    </>
  );
}
