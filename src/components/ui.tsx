import Link from "next/link";
import type { ReactNode } from "react";
import { REWARD_PRODUCTS, aud, type Tone } from "@/lib/constants";
import { ChevronLeft } from "./icons";

// Square-ish status flags rather than generic pills; each tone stays inside the brand palette.
const TONES: Record<Tone, string> = {
  amber: "bg-volt-400 text-ink-900",
  sky: "bg-ink-900 text-white",
  violet: "bg-ink-900 text-volt-400",
  green: "bg-lime-400 text-ink-900",
  slate: "bg-cream-200 text-ink-600",
  rose: "bg-rose-100 text-rose-800",
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wider ${TONES[tone]}`}>
      {children}
    </span>
  );
}

/**
 * Brand headline: two lines in the capability-statement style (first line ink, second line accent).
 * Pass `accent` for the second line, e.g. title="Refer &" accent="earn."
 */
export function PageHeader({
  title, accent, eyebrow, subtitle, back, action, keepCase,
}: { title: string; accent?: string; eyebrow?: string; subtitle?: ReactNode; back?: string; action?: ReactNode; /** For user/product text such as "13.2 kW Solar": no uppercase. */ keepCase?: boolean }) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-500 transition hover:text-ink-900">
            <ChevronLeft width={16} height={16} /> Back
          </Link>
        )}
        {eyebrow && <p className="eyebrow mb-2 text-leaf-700">{eyebrow}</p>}
        <h1 className={`display text-balance text-ink-900 ${keepCase ? "text-3xl normal-case sm:text-4xl" : "text-4xl sm:text-5xl"}`}>
          {title}
          {accent && <span className="block text-leaf-600">{accent}</span>}
        </h1>
        {subtitle && <p className="mt-3 max-w-xl text-pretty text-ink-600">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function Card({ children, className = "", title, action }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode }) {
  return (
    <section className={`card p-4 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-bold tracking-tight text-ink-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Big-number tile. `accent` renders the ink version with a lime figure, like the capability statement stats. */
export function Stat({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-brand p-4 sm:p-5 ${accent ? "grain bg-ink-900 text-white" : "card"}`}>
      <div className={`eyebrow ${accent ? "text-volt-400" : "text-ink-500"}`}>{label}</div>
      <div className={`stat-num mt-2 text-3xl sm:text-4xl ${accent ? "text-lime-400" : "text-ink-900"}`}>{value}</div>
      {hint && <div className={`mt-1.5 text-xs ${accent ? "text-ink-300" : "text-ink-500"}`}>{hint}</div>}
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-brand border-2 border-dashed border-cream-300 px-6 py-12 text-center">
      <p className="display text-2xl text-ink-900">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-sm text-pretty text-sm text-ink-600">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}

/** Lime check-circle list, as used for "The AES way" on the capability statement. */
export function CheckList({ items, dark }: { items: { title: string; text?: string }[]; dark?: boolean }) {
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.title} className="flex gap-3">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime-400 text-ink-900">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
          </span>
          <span>
            <span className={`block font-bold ${dark ? "text-white" : "text-ink-900"}`}>{i.title}</span>
            {i.text && <span className={`block text-sm ${dark ? "text-ink-300" : "text-ink-600"}`}>{i.text}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Reward amounts per product and network level, straight from REWARD_PRODUCTS. */
export function RewardTable({ dark }: { dark?: boolean }) {
  const levels = REWARD_PRODUCTS[0].amounts.map((_, i) => i + 1);
  return (
    <table className="w-full text-left">
      <thead>
        <tr className={`eyebrow ${dark ? "text-ink-400" : "text-ink-500"}`}>
          <th className="pb-2 font-bold">Installed</th>
          {levels.map((l) => <th key={l} className="pb-2 text-right font-bold">Level {l}</th>)}
        </tr>
      </thead>
      <tbody className={`divide-y ${dark ? "divide-white/10" : "divide-cream-200"}`}>
        {REWARD_PRODUCTS.map((p) => (
          <tr key={p.key}>
            <td className={`py-2.5 font-bold ${dark ? "text-white" : "text-ink-900"}`}>{p.label}</td>
            {p.amounts.map((a, i) => (
              <td key={i} className={`stat-num py-2.5 text-right text-xl ${i === 0 ? (dark ? "text-volt-400" : "text-leaf-700") : dark ? "text-ink-200" : "text-ink-700"}`}>{aud(a)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
