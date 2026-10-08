import Link from "next/link";
import { login } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/form";
import { Field } from "@/components/ui";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="display text-4xl text-ink-900">Welcome back.</h1>
      <p className="mt-2 text-ink-600">Sign in to track your system, paperwork and referrals.</p>
      <ActionForm action={login} resetOnSuccess={false} className="mt-6 space-y-4">
        <Field label="Email"><input className="input" name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Password"><input className="input" name="password" type="password" autoComplete="current-password" required /></Field>
        <SubmitButton className="btn-volt w-full py-3.5 text-base" pendingText="Signing in…">Sign in</SubmitButton>
      </ActionForm>
      <p className="mt-6 text-center text-sm text-ink-600">
        New to AES? <Link href="/signup" className="font-semibold text-leaf-700 underline">Create an account</Link>
      </p>
    </>
  );
}
