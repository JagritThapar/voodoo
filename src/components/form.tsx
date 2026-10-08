"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions";

const PendingContext = createContext(false);

export function SubmitButton({ children, className = "btn-primary", pendingText }: { children: ReactNode; className?: string; pendingText?: string }) {
  const { pending: formPending } = useFormStatus();
  const pending = useContext(PendingContext) || formPending;
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingText ?? "Saving…" : children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error)
    return <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{state.error}</p>;
  if (state.ok)
    return <p role="status" className="rounded-xl bg-leaf-50 px-3 py-2 text-sm font-medium text-leaf-700">{state.ok}</p>;
  return null;
}

/**
 * A form bound to a server action returning FormState. Shows the result message, keeps the
 * user's input when there's an error (React would otherwise reset it), and clears on success.
 */
export function ActionForm({
  action,
  children,
  className = "space-y-4",
  resetOnSuccess = true,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };
  return (
    <form ref={ref} onSubmit={onSubmit} className={className}>
      <PendingContext.Provider value={pending}>
        <FormMessage state={state} />
        {children}
      </PendingContext.Provider>
    </form>
  );
}
