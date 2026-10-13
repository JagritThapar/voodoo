import { requireUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { appUrl } from "@/lib/url";
import { INTERESTS, REFER_TABS, REFERRAL_STATUS, aud } from "@/lib/constants";
import type { Referral } from "@/lib/referrals";
import { submitReferral } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/form";
import { SubTabs } from "@/components/nav";
import { ShareReferral } from "@/components/share";
import { Badge, Card, Empty, Field, PageHeader, RewardTable } from "@/components/ui";

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
      <PageHeader title="Bring a mate." accent="Get paid." />
      <SubTabs tabs={REFER_TABS} />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card title="Share your link">
            <ShareReferral code={user.referral_code} link={link} firstName={user.first_name} />
          </Card>

          <Card title="Or send us their details">
            <ActionForm action={submitReferral}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name"><input className="input" name="name" required /></Field>
                <Field label="Mobile"><input className="input" name="phone" type="tel" /></Field>
                <Field label="Email"><input className="input" name="email" type="email" /></Field>
                <Field label="Interested in">
                  <select className="input" name="interest" defaultValue="Battery">{INTERESTS.map((i) => <option key={i}>{i}</option>)}</select>
                </Field>
              </div>
              <label className="flex items-start gap-3 text-sm text-ink-700">
                <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-ink-900" />
                They&apos;re happy for us to contact them.
              </label>
              <SubmitButton className="btn-volt w-full sm:w-auto" pendingText="Sending…">Send referral</SubmitButton>
            </ActionForm>
          </Card>
        </div>

        <section className="grain self-start rounded-brand bg-ink-900 p-5 text-white sm:p-6">
          <h2 className="mb-4 text-lg font-bold">What you earn per install</h2>
          <RewardTable dark />
          <p className="mt-4 text-xs text-ink-400">Level 1 is someone you refer. Levels 2 and 3 are people they refer. Paid on installs only.</p>
        </section>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold text-ink-900">Your referrals</h2>
      {referrals.length ? (
        <ul className="card divide-y divide-cream-200 px-4 sm:px-5">
          {referrals.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-3.5">
              <span className="min-w-0">
                <span className="block truncate font-bold text-ink-900">{r.name}</span>
                {r.interest && <span className="block truncate text-sm text-ink-500">{r.interest}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {r.earned ? <span className="text-sm font-bold text-leaf-700">+{aud(r.earned)}</span> : null}
                <Badge tone={REFERRAL_STATUS[r.status].tone}>{REFERRAL_STATUS[r.status].label}</Badge>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty title="No referrals yet" />
      )}
    </>
  );
}
