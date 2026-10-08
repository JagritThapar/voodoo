"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import { requestQuote } from "@/app/actions";
import {
  BATTERY_OPTIONS, EV_OPTIONS, HOT_WATER_OPTIONS, INVERTER_OPTIONS, PANEL_OPTIONS, ROOF_TYPES, SOLAR_SIZES, STATES,
  estimate, type Design,
} from "@/lib/catalog";
import { aud } from "@/lib/constants";
import { FormMessage, SubmitButton } from "@/components/form";
import { BatteryIcon, CarIcon, DropIcon, HomeIcon, SunIcon } from "@/components/icons";

function Section({ icon, title, subtitle, children }: { icon: ReactNode; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-sun-100 text-sun-600">{icon}</span>
        <div>
          <h2 className="font-semibold text-navy-950">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Options<T extends string | number>({
  value, onChange, options, cols,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; title: ReactNode; detail?: ReactNode; price?: ReactNode }[];
  /** Number of columns for short "chip" choices; omit for a list of products (1 column on phones). */
  cols?: 2 | 3 | 4;
}) {
  const grid = cols ? { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-3 sm:grid-cols-4" }[cols] : "sm:grid-cols-2 xl:grid-cols-3";
  return (
    <div className={`grid gap-2 ${grid}`} role="radiogroup">
      {options.map((o) => (
        <button
          type="button"
          role="radio"
          aria-checked={o.value === value}
          key={String(o.value)}
          data-active={o.value === value}
          onClick={() => onChange(o.value)}
          className="chip-option"
        >
          <span className="flex items-start justify-between gap-2">
            <span className="font-semibold text-navy-950">{o.title}</span>
            {o.price && <span className="whitespace-nowrap text-sm text-slate-500">{o.price}</span>}
          </span>
          {o.detail && <span className="mt-0.5 block text-xs text-slate-500">{o.detail}</span>}
        </button>
      ))}
    </div>
  );
}

export function Designer({ initial }: { initial: Design }) {
  const [d, setD] = useState<Design>(initial);
  const [state, action] = useActionState(requestQuote, undefined);
  const set = <K extends keyof Design>(k: K, v: Design[K]) => setD((prev) => ({ ...prev, [k]: v }));
  const e = useMemo(() => estimate(d), [d]);

  const summary = (
    <div className="card overflow-hidden">
      <div className="bg-navy-900 p-5 text-white">
        <p className="text-xs font-medium uppercase tracking-wide text-navy-100">Estimated price after rebates</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">
          {e.gross ? `${aud(e.low)} – ${aud(e.high)}` : "—"}
        </p>
        {e.gross > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-navy-100">Est. yearly savings</p><p className="font-semibold">{aud(e.annualSavings)}</p></div>
            <div><p className="text-navy-100">Payback</p><p className="font-semibold">{e.paybackYears ? `~${e.paybackYears} yrs` : "—"}</p></div>
          </div>
        )}
      </div>
      <div className="space-y-3 p-5 text-sm">
        {e.lines.map((l) => (
          <div key={l.label} className="flex justify-between gap-3"><span className="text-slate-600">{l.label}</span><span className="whitespace-nowrap tabular-nums">{aud(l.amount)}</span></div>
        ))}
        {e.rebates.map((r) => (
          <div key={r.label} className="flex justify-between gap-3 text-leaf-700"><span>{r.label}</span><span className="whitespace-nowrap tabular-nums">−{aud(r.amount)}</span></div>
        ))}
        {e.gross > 0 && (
          <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold text-navy-950"><span>Indicative total</span><span className="tabular-nums">{aud(e.net)}</span></div>
        )}
        {e.annualGenerationKwh > 0 && <p className="text-xs text-slate-500">Expected generation ≈ {e.annualGenerationKwh.toLocaleString()} kWh/yr.</p>}
        {e.warnings.map((w) => <p key={w} className="rounded-lg bg-sun-50 px-3 py-2 text-xs text-navy-900">{w}</p>)}
        <form action={action} className="space-y-3 pt-2">
          <input type="hidden" name="design" value={JSON.stringify(d)} />
          <FormMessage state={state} />
          <SubmitButton className="btn-sun w-full py-3" pendingText="Sending…">Request my quote</SubmitButton>
          <p className="text-xs text-slate-500">Estimates are indicative and include current federal rebates. Your consultant will confirm a fixed price after reviewing your roof and switchboard. No obligation.</p>
        </form>
      </div>
    </div>
  );

  return (
    <div className="grid gap-5 pb-16 lg:grid-cols-[1fr_340px] lg:pb-0">
      <div className="space-y-4">
        <Section icon={<HomeIcon />} title="Your home" subtitle="Helps us size the system and estimate rebates.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="block">
              <span className="label">State</span>
              <select className="input" value={d.state} onChange={(ev) => set("state", ev.target.value as Design["state"])}>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">Postcode</span>
              <input className="input" inputMode="numeric" maxLength={4} value={d.postcode} onChange={(ev) => set("postcode", ev.target.value.replace(/\D/g, ""))} placeholder="2150" />
            </label>
            <label className="col-span-2 block">
              <span className="label">Roof type</span>
              <select className="input" value={d.roofType} onChange={(ev) => set("roofType", ev.target.value)}>
                {ROOF_TYPES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="label flex justify-between"><span>Quarterly electricity bill</span><span className="font-semibold text-navy-950">{aud(d.quarterlyBill)}</span></span>
            <input type="range" min={100} max={2500} step={50} value={d.quarterlyBill} onChange={(ev) => set("quarterlyBill", Number(ev.target.value))} className="w-full accent-navy-900" />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="label">Storeys</span>
              <Options cols={3} value={d.storeys} onChange={(v) => set("storeys", v)} options={[1, 2, 3].map((n) => ({ value: n as 1 | 2 | 3, title: `${n}` }))} />
            </div>
            <div>
              <span className="label">Power supply</span>
              <Options cols={2} value={d.phase} onChange={(v) => set("phase", v)} options={[{ value: "single", title: "Single phase" }, { value: "three", title: "Three phase" }]} />
            </div>
          </div>
        </Section>

        <Section icon={<SunIcon />} title="Solar panels" subtitle="Most homes suit 6.6–13.2 kW.">
          <span className="label">System size</span>
          <Options cols={4} value={d.solarKw} onChange={(v) => set("solarKw", v)} options={SOLAR_SIZES.map((s) => ({ value: s, title: s ? `${s} kW` : "No solar", detail: s ? `~${Math.round(s / 0.44)} panels` : "Already have it" }))} />
          {d.solarKw > 0 && (
            <>
              <span className="label mt-4">Panel range</span>
              <Options value={d.panel} onChange={(v) => set("panel", v)} options={PANEL_OPTIONS.map((p) => ({ value: p.id, title: p.name, detail: p.detail }))} />
              <span className="label mt-4">Inverter</span>
              <Options value={d.inverter} onChange={(v) => set("inverter", v)} options={INVERTER_OPTIONS.map((p) => ({ value: p.id, title: p.name, detail: p.detail }))} />
              <label className="mt-4 flex items-center gap-3 text-sm">
                <input type="checkbox" className="h-5 w-5 accent-navy-900" checked={d.birdProofing} onChange={(ev) => set("birdProofing", ev.target.checked)} />
                Add bird proofing (stops pigeons nesting under panels)
              </label>
            </>
          )}
        </Section>

        <Section icon={<BatteryIcon />} title="Home battery" subtitle="Store daytime solar for the evening. Federal discount applied.">
          <Options value={d.battery} onChange={(v) => set("battery", v)} options={BATTERY_OPTIONS.map((b) => ({ value: b.id, title: b.name, price: b.price ? aud(b.price) : undefined }))} />
        </Section>

        <Section icon={<CarIcon />} title="EV charger">
          <Options value={d.ev} onChange={(v) => set("ev", v)} options={EV_OPTIONS.map((o) => ({ value: o.id, title: o.name, price: o.price ? aud(o.price) : undefined }))} />
        </Section>

        <Section icon={<DropIcon />} title="Hot water heat pump">
          <Options value={d.hotWater} onChange={(v) => set("hotWater", v)} options={HOT_WATER_OPTIONS.map((o) => ({ value: o.id, title: o.name, price: o.price ? aud(o.price) : undefined }))} />
        </Section>

        <section className="card p-4 sm:p-5">
          <label className="block">
            <span className="label">Anything else we should know?</span>
            <textarea className="input min-h-24" maxLength={1000} value={d.notes} onChange={(ev) => set("notes", ev.target.value)} placeholder="Shading, existing system, best time to call, pool pump…" />
          </label>
        </section>

        <div id="summary-mobile" className="scroll-mt-20 lg:hidden">{summary}</div>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-10">{summary}</div>
      </aside>

      {e.gross > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">Estimate after rebates</p>
              <p className="font-bold tabular-nums text-navy-950">{aud(e.low)} – {aud(e.high)}</p>
            </div>
            <a href="#summary-mobile" onClick={(ev) => { ev.preventDefault(); document.getElementById("summary-mobile")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-primary">Review</a>
          </div>
        </div>
      )}
    </div>
  );
}
