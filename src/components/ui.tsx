import Link from "next/link";
import type { ReactNode } from "react";
import type { Tone } from "@/lib/constants";
import { ChevronLeft } from "./icons";

const TONES: Record<Tone, string> = {
  amber: "bg-sun-50 text-sun-600 ring-sun-300/60",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  green: "bg-leaf-50 text-leaf-700 ring-leaf-100",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle, back, action }: { title: string; subtitle?: ReactNode; back?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
            <ChevronLeft width={16} height={16} /> Back
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "", title, action }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode }) {
  return (
    <section className={`card p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="font-semibold text-navy-950">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? "bg-navy-900 text-white" : "card"}`}>
      <div className={`text-xs font-medium uppercase tracking-wide ${accent ? "text-navy-100" : "text-slate-500"}`}>{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      {hint && <div className={`mt-0.5 text-xs ${accent ? "text-navy-100" : "text-slate-500"}`}>{hint}</div>}
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
      <p className="font-semibold text-navy-950">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
