import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { COMPANY, PROOF } from "@/lib/constants";
import { CheckList, RewardTable } from "@/components/ui";
import { Logo } from "@/components/icons";

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
          <p className="eyebrow text-volt-400">Victorian owned</p>
          <h1 className="display mt-4 text-[clamp(3.2rem,11vw,7.5rem)]">
            Smart energy.
            <span className="block text-lime-400">Made easy.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg text-ink-200">
            Get a price, track your install and earn from referrals.
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

      {/* What you can do */}
      <section className="bg-cream-100 text-ink-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="display text-4xl sm:text-5xl">Everything.<span className="block">One place.</span></h2>
          <div className="mt-8">
            <CheckList items={[{ title: "Design and price your system" }, { title: "Track every step of your install" }, { title: "Upload paperwork from your phone" }, { title: "Rebates claimed for you" }]} />
          </div>
        </div>
      </section>

      {/* Refer & earn */}
      <section className="grain">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <h2 className="display text-4xl sm:text-5xl">
            Bring a mate.
            <span className="block text-lime-400">Get paid.</span>
          </h2>
          <RewardTable dark />
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-lime-400 text-ink-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="display text-4xl sm:text-5xl">Talk to the team.</h2>
            <a href={`tel:${tel}`} className="stat-num mt-4 block text-4xl hover:underline">{COMPANY.phone}</a>
          </div>
          <Link href="/signup" className="btn-primary px-7 py-3.5 text-base">Create your account</Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-ink-400 sm:px-6">
        {COMPANY.name} · {COMPANY.address} · ABN {COMPANY.abn} ·{" "}
        <a className="underline hover:text-white" href={COMPANY.website} target="_blank" rel="noreferrer">aussieenergysavers.com.au</a>
      </footer>
    </div>
  );
}
