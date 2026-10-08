import Link from "next/link";
import { signup } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/form";
import { Field } from "@/components/ui";
import { one } from "@/lib/db";
import { STATES } from "@/lib/catalog";

export const metadata = { title: "Create account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref = "" } = await searchParams;
  const referrer = ref
    ? await one<{ first_name: string }>("SELECT first_name FROM users WHERE referral_code = ? COLLATE NOCASE", ref)
    : undefined;

  return (
    <>
      {referrer && (
        <div className="mb-5 rounded-xl bg-sun-50 px-4 py-3 text-sm text-navy-900 ring-1 ring-sun-300/60">
          🎉 <strong>{referrer.first_name}</strong> invited you to Aussie Energy Savers.
        </div>
      )}
      <h1 className="text-2xl font-bold text-navy-950">Create your account</h1>
      <p className="mt-1 text-slate-600">Design a system, track your install and earn referral rewards.</p>
      <ActionForm action={signup} resetOnSuccess={false} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name"><input className="input" name="first_name" autoComplete="given-name" required /></Field>
          <Field label="Last name"><input className="input" name="last_name" autoComplete="family-name" required /></Field>
        </div>
        <Field label="Email"><input className="input" name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Mobile"><input className="input" name="phone" type="tel" autoComplete="tel" placeholder="04xx xxx xxx" /></Field>
        <div className="grid grid-cols-[1fr_auto_auto] gap-3">
          <Field label="Suburb"><input className="input" name="suburb" autoComplete="address-level2" /></Field>
          <Field label="State">
            <select className="input" name="state" defaultValue="NSW">{STATES.map((s) => <option key={s}>{s}</option>)}</select>
          </Field>
          <Field label="Postcode"><input className="input w-24" name="postcode" inputMode="numeric" maxLength={4} autoComplete="postal-code" /></Field>
        </div>
        <Field label="Password" hint="At least 8 characters."><input className="input" name="password" type="password" autoComplete="new-password" minLength={8} required /></Field>
        <Field label="Referral code (optional)"><input className="input uppercase" name="ref" defaultValue={ref} placeholder="e.g. SARAH2026" /></Field>
        <SubmitButton className="btn-sun w-full py-3" pendingText="Creating account…">Create account</SubmitButton>
        <p className="text-xs text-slate-500">By creating an account you agree to be contacted about your enquiry. We never share your details.</p>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account? <Link href="/login" className="font-semibold text-navy-700 underline">Sign in</Link>
      </p>
    </>
  );
}
