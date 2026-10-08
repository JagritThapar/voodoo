import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { COMPANY, PROOF, REWARD_LEVELS, aud } from "@/lib/constants";
import { CheckList } from "@/components/ui";
import { BatteryIcon, CarIcon, DropIcon, Logo, SunIcon } from "@/components/icons";

export default async function Landing() {
  const user = await getUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  const tel = COMPANY.phone.replace(/\s/g, "");

  return (
    <div className="min-h-dvh bg-ink-900 text-white">
      {/* Cover */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/photos/crew-roof.jpg" alt="Aussie Energy Savers installers fitting solar panels on a roof" className="absolute inset-0 -z-20 h-full w-full object-cover object-[60%_30%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-900/70 via-ink-900/45 to-ink-900" />

        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-5 sm:px-6">
          <Logo reverse className="h-12 sm:h-14" />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="btn px-4 text-white hover:bg-white/10">Sign in</Link>
            <Link href="/signup" className="btn-volt hidden sm:inline-flex">Create account</Link>
          </nav>
        </header>

        <div className="mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pt-28">
          <p className="eyebrow text-volt-400">Customer app · Victorian owned</p>
          <h1 className="display mt-4 text-[clamp(3.2rem,11vw,7.5rem)]">
            Smart energy.
            <span className="block text-lime-400">Made easy.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg text-ink-200">
            Design your system and get a price. Follow your install from first visit to final rebate. Get paid when your friends go solar too.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn-volt px-7 py-3.5 text-base">Get started</Link>
            <Link href="/login" className="btn border border-white/25 px-7 py-3.5 text-base text-white hover:border-white">I already have an account</Link>
          </div>

          <dl className="mt-16 grid grid-cols-2 gap-y-6 border-t border-white/15 pt-6 sm:grid-cols-4">
            {PROOF.map((p, i) => (
              <div key={p.label} className={`pr-4 ${i % 2 ? "border-l border-white/15 pl-4 sm:pl-6" : "sm:border-l sm:border-white/15 sm:pl-6 sm:first:border-0 sm:first:pl-0"}`}>
                <dt className="sr-only">{p.label}</dt>
                <dd className="stat-num text-4xl text-volt-400 sm:text-5xl">{p.value}</dd>
                <dd className="eyebrow mt-2 text-ink-300">{p.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Made easy */}
      <section className="bg-cream-100 text-ink-900">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow text-leaf-700">What the app does</p>
            <h2 className="display mt-3 text-5xl sm:text-6xl">
              Everything.<span className="block">One place.</span>
            </h2>
            <p className="mt-5 max-w-md text-pretty text-ink-600">
              The same team from quote to sign-off, and now the same app. No chasing emails, no lost paperwork.
            </p>
            <p className="mt-6 text-sm font-bold"><span className="highlight">One app. One clear answer.</span></p>
          </div>
          <CheckList
            items={[
              { title: "Design it in minutes", text: "Solar, batteries, heat pumps, air con, EV charging and water filtration, with an instant price after rebates." },
              { title: "See every step", text: "Quote, approvals, install day, compliance and handover, tracked live." },
              { title: "Paperwork handled", text: "Upload a bill or sign a form from your phone. We lodge the rest." },
              { title: "Rebates claimed for you", text: "Federal STCs, Cheaper Home Batteries, Solar Victoria and VEU." },
              { title: "Tell us how we went", text: "Review your install and your crew once it's done." },
            ]}
          />
        </div>
      </section>

      {/* Refer & earn */}
      <section className="grain">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-volt-400">Refer & earn</p>
            <h2 className="display mt-3 text-5xl sm:text-6xl">
              Bring a mate.
              <span className="block text-lime-400">Get paid.</span>
            </h2>
            <p className="mt-5 max-w-md text-pretty text-ink-300">
              You earn when someone you refer has their system installed, and again when the people they refer install too. Rewards are for installs only, never sign-ups.
            </p>
          </div>
          <ol className="space-y-3">
            {REWARD_LEVELS.map((l, i) => (
              <li key={l.level} className="flex items-center gap-4 rounded-brand bg-white/[.05] p-4 ring-1 ring-white/10" style={{ marginLeft: `${i * 1.5}rem` }}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lime-400 font-display text-lg font-black text-ink-900">L{l.level}</span>
                <span className="flex-1 font-semibold">{l.label}</span>
                <span className="stat-num text-3xl text-volt-400">{aud(l.amount)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Services strip */}
      <section className="border-y border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-6 text-sm font-bold uppercase tracking-wider text-ink-300 sm:px-6">
          <span className="inline-flex items-center gap-2"><SunIcon className="text-volt-400" /> Solar</span>
          <span className="inline-flex items-center gap-2"><BatteryIcon className="text-volt-400" /> Batteries</span>
          <span className="inline-flex items-center gap-2"><DropIcon className="text-volt-400" /> Hot water & filtration</span>
          <span className="inline-flex items-center gap-2"><CarIcon className="text-volt-400" /> EV charging</span>
          <span className="text-ink-400">Air conditioning</span>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-lime-400 text-ink-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Start your journey</p>
            <h2 className="display mt-2 text-4xl sm:text-5xl">Tell us about your home.</h2>
            <a href={`tel:${tel}`} className="stat-num mt-4 block text-4xl hover:underline">{COMPANY.phone}</a>
          </div>
          <Link href="/signup" className="btn-primary px-7 py-3.5 text-base">Create your account</Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-ink-400 sm:px-6">
        {COMPANY.name} · {COMPANY.address} · ABN {COMPANY.abn} ·{" "}
        <a className="underline hover:text-white" href={COMPANY.website} target="_blank" rel="noreferrer">aussieenergysavers.com.au</a>
        <p className="mt-2">Rebates and eligibility are subject to program rules. Finance is subject to approval.</p>
      </footer>
    </div>
  );
}
