"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import { requestQuote } from "@/app/actions";
import {
  AIRCON_OPTIONS, BATTERY_OPTIONS, EV_OPTIONS, HOT_WATER_OPTIONS, WATER_OPTIONS, INVERTER_OPTIONS, PANEL_OPTIONS, ROOF_TYPES, SOLAR_SIZES, STATES,
  estimate, type Design,
} from "@/lib/catalog";
import { aud } from "@/lib/constants";
import { FormMessage, SubmitButton } from "@/components/form";
import { BatteryIcon, CarIcon, DropIcon, FanIcon, FilterIcon, HomeIcon, SunIcon } from "@/components/icons";

function Section({ n, icon, title, subtitle, children }: { n: number; icon: ReactNode; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="card p-4 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-900 text-volt-400">{icon}</span>
        <div>
          <p className="eyebrow text-ink-400">Step {n}</p>
          <h2 className="text-lg font-bold leading-tight tracking-tight text-ink-900">{title}</h2>
        </div>
        {subtitle && <p className="ml-auto hidden max-w-[16rem] text-right text-sm text-ink-500 sm:block">{subtitle}</p>}
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
  const grid = cols ? { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-3 sm:grid-cols-4" }[cols] : "sm:grid-cols-2";
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
          <span className="block font-bold leading-snug text-ink-900">{o.title}</span>
          {o.price && <span className="mt-1 block text-sm font-semibold tabular-nums text-leaf-700">{o.price}</span>}
          {o.detail && <span className="mt-0.5 block text-xs text-ink-500">{o.detail}</span>}
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
      <div className="grain bg-ink-900 p-5 text-white sm:p-6">
        <p className="eyebrow text-volt-400">Estimate after rebates</p>
        <p className="stat-num mt-2 text-4xl text-lime-400">
          {e.gross ? `${aud(e.low)}–${aud(e.high).replace("$", "")}` : "—"}
        </p>
        {e.gross > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/15 pt-4">
            <div><p className="eyebrow text-ink-400">Saves / yr</p><p className="stat-num mt-1 text-2xl text-white">{aud(e.annualSavings)}</p></div>
            <div><p className="eyebrow text-ink-400">Payback</p><p className="stat-num mt-1 text-2xl text-white">{e.paybackYears ? `~${e.paybackYears} yrs` : "—"}</p></div>
          </div>
        )}
      </div>
      <div className="space-y-3 p-5 text-sm">
        {e.lines.map((l) => (
          <div key={l.label} className="flex justify-between gap-3"><span className="text-ink-600">{l.label}</span><span className="whitespace-nowrap tabular-nums">{aud(l.amount)}</span></div>
        ))}
        {e.rebates.map((r) => (
          <div key={r.label} className="flex justify-between gap-3 font-semibold text-leaf-700"><span>{r.label}</span><span className="whitespace-nowrap tabular-nums">−{aud(r.amount)}</span></div>
        ))}
        {e.gross > 0 && (
          <div className="flex items-baseline justify-between border-t-2 border-ink-900 pt-3 font-bold text-ink-900"><span>Indicative total</span><span className="stat-num text-2xl">{aud(e.net)}</span></div>
        )}
        {e.annualGenerationKwh > 0 && <p className="text-xs text-ink-500">Expected generation ≈ {e.annualGenerationKwh.toLocaleString()} kWh/yr.</p>}
        {e.warnings.map((w) => <p key={w} className="rounded-lg bg-volt-400 px-3 py-2 text-xs font-semibold text-ink-900">{w}</p>)}
        <form action={action} className="space-y-3 pt-2">
          <input type="hidden" name="design" value={JSON.stringify(d)} />
          <FormMessage state={state} />
          <SubmitButton className="btn-volt w-full py-3.5 text-base" pendingText="Sending…">Request my quote</SubmitButton>
          <p className="text-xs text-ink-500">Indicative only. Includes federal rebates and, in VIC, Solar Victoria where you&apos;re eligible. We check what you qualify for and do the forms. No hard sell, no obligation.</p>
        </form>
      </div>
    </div>
  );

  return (
    <div className="grid gap-5 pb-16 lg:grid-cols-[1fr_340px] lg:pb-0">
      <div className="space-y-4">
        <Section n={1} icon={<HomeIcon />} title="Your home" subtitle="Helps us size the system and estimate rebates.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="block">
              <span className="label">State</span>
              <select className="input" value={d.state} onChange={(ev) => set("state", ev.target.value as Design["state"])}>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label">Postcode</span>
              <input className="input" inputMode="numeric" maxLength={4} value={d.postcode} onChange={(ev) => set("postcode", ev.target.value.replace(/\D/g, ""))} placeholder="3752" />
            </label>
            <label className="col-span-2 block">
              <span className="label">Roof type</span>
              <select className="input" value={d.roofType} onChange={(ev) => set("roofType", ev.target.value)}>
                {ROOF_TYPES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="label flex justify-between"><span>Quarterly electricity bill</span><span className="font-semibold text-ink-900">{aud(d.quarterlyBill)}</span></span>
            <input type="range" min={100} max={2500} step={50} value={d.quarterlyBill} onChange={(ev) => set("quarterlyBill", Number(ev.target.value))} className="w-full accent-ink-900" />
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

        <Section n={2} icon={<SunIcon />} title="Solar panels" subtitle="Most homes suit 6.6–13.2 kW.">
          <span className="label">System size</span>
          <Options cols={4} value={d.solarKw} onChange={(v) => set("solarKw", v)} options={SOLAR_SIZES.map((s) => ({ value: s, title: s ? `${s} kW` : "No solar", detail: s ? `~${Math.round(s / 0.44)} panels` : "Already have it" }))} />
          {d.solarKw > 0 && (
            <>
              <span className="label mt-4">Panel range</span>
              <Options value={d.panel} onChange={(v) => set("panel", v)} options={PANEL_OPTIONS.map((p) => ({ value: p.id, title: p.name, detail: p.detail }))} />
              <span className="label mt-4">Inverter</span>
              <Options value={d.inverter} onChange={(v) => set("inverter", v)} options={INVERTER_OPTIONS.map((p) => ({ value: p.id, title: p.name, detail: p.detail }))} />
              <label className="mt-4 flex items-center gap-3 text-sm">
                <input type="checkbox" className="h-5 w-5 accent-ink-900" checked={d.birdProofing} onChange={(ev) => set("birdProofing", ev.target.checked)} />
                Add bird proofing (stops pigeons nesting under panels)
              </label>
            </>
          )}
        </Section>

        <Section n={3} icon={<BatteryIcon />} title="Home battery" subtitle="Store daytime solar for the evening. Federal discount applied.">
          <Options value={d.battery} onChange={(v) => set("battery", v)} options={BATTERY_OPTIONS.map((b) => ({ value: b.id, title: b.name, price: b.price ? aud(b.price) : undefined }))} />
        </Section>

        <Section n={4} icon={<CarIcon />} title="EV charging" subtitle="Charge your car from your own solar.">
          <Options value={d.ev} onChange={(v) => set("ev", v)} options={EV_OPTIONS.map((o) => ({ value: o.id, title: o.name, price: o.price ? aud(o.price) : undefined }))} />
        </Section>

        <Section n={5} icon={<DropIcon />} title="Hot water heat pump" subtitle="Replace gas or old electric hot water, with the rebate.">
          <Options value={d.hotWater} onChange={(v) => set("hotWater", v)} options={HOT_WATER_OPTIONS.map((o) => ({ value: o.id, title: o.name, price: o.price ? aud(o.price) : undefined }))} />
        </Section>

        <Section n={6} icon={<FanIcon />} title="Air conditioning" subtitle="Split, multi split or ducted, room by room or whole home.">
          <Options value={d.aircon} onChange={(v) => set("aircon", v)} options={AIRCON_OPTIONS.map((o) => ({ value: o.id, title: o.name, price: o.price ? aud(o.price) : undefined }))} />
        </Section>

        <Section n={7} icon={<FilterIcon />} title="Water filtration" subtitle="Fitted at the mains, so every tap runs filtered.">
          <Options value={d.water} onChange={(v) => set("water", v)} options={WATER_OPTIONS.map((o) => ({ value: o.id, title: o.name, price: o.price ? aud(o.price) : undefined }))} />
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
        <div className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-20 border-b border-white/10 bg-ink-800 px-4 py-2.5 lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div>
              <p className="eyebrow text-ink-400">After rebates</p>
              <p className="stat-num text-xl text-lime-400">{aud(e.low)}–{aud(e.high).replace("$", "")}</p>
            </div>
            <a href="#summary-mobile" onClick={(ev) => { ev.preventDefault(); document.getElementById("summary-mobile")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-volt">Review</a>
          </div>
        </div>
      )}
    </div>
  );
}
