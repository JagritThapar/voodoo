import Link from "next/link";
import { login } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/form";
import { Field } from "@/components/ui";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-navy-950">Welcome back</h1>
      <p className="mt-1 text-slate-600">Sign in to track your system and referrals.</p>
      <ActionForm action={login} resetOnSuccess={false} className="mt-6 space-y-4">
        <Field label="Email"><input className="input" name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Password"><input className="input" name="password" type="password" autoComplete="current-password" required /></Field>
        <SubmitButton className="btn-primary w-full py-3" pendingText="Signing in…">Sign in</SubmitButton>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-slate-600">
        New to AES? <Link href="/signup" className="font-semibold text-navy-700 underline">Create an account</Link>
      </p>
    </>
  );
}
