import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { REWARD_LEVELS, aud } from "@/lib/constants";
import { BoltIcon, ClipboardIcon, Logo, NetworkIcon, NewsIcon, StarIcon, SunIcon } from "@/components/icons";

export default async function Landing() {
  const user = await getUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  const features = [
    { icon: SunIcon, title: "Design & quote", text: "Build your solar, battery, EV charger or heat pump system and see an instant price estimate with rebates." },
    { icon: ClipboardIcon, title: "Track everything", text: "Follow your quote, install date and every piece of paperwork in one place, and upload documents from your phone." },
    { icon: StarIcon, title: "Review your install", text: "Tell us how we went. Your feedback goes straight to the team and your installer." },
    { icon: NetworkIcon, title: "Refer & earn", text: "Get paid when friends install, and when their friends install too. Watch your whole network grow." },
    { icon: NewsIcon, title: "News & offers", text: "Rebate changes, member-only deals and energy tips, straight to your app." },
  ];

  return (
    <div className="min-h-dvh bg-navy-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo className="text-white" />
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn text-white hover:bg-white/10">Sign in</Link>
          <Link href="/signup" className="btn-sun hidden sm:inline-flex">Create account</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sun-300">
              <BoltIcon width={14} height={14} /> The Aussie Energy Savers customer app
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Your energy upgrade, <span className="text-sun-400">all in one app.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-navy-100">
              Design your system and get a quote, follow your install from paperwork to switch-on, and earn rewards for every friend you bring along.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn-sun px-6 py-3 text-base">Get started, it&apos;s free</Link>
              <Link href="/login" className="btn border border-white/25 px-6 py-3 text-base text-white hover:bg-white/10">I already have an account</Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white/[.06] p-5 ring-1 ring-white/10 sm:p-6">
            <p className="text-sm font-semibold text-sun-300">How referral rewards work</p>
            <p className="mt-1 text-sm text-navy-100">You&apos;re paid when a referred household&apos;s system is installed, up to {REWARD_LEVELS.length} levels deep.</p>
            <div className="mt-5 space-y-3">
              {REWARD_LEVELS.map((l, i) => (
                <div key={l.level} className="flex items-center gap-3 rounded-2xl bg-white/[.06] p-3" style={{ marginLeft: i * 16 }}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sun-400 text-sm font-bold text-navy-950">L{l.level}</span>
                  <span className="flex-1 text-sm">{l.label}</span>
                  <span className="text-lg font-bold tabular-nums text-sun-300">{aud(l.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14 text-slate-900">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
          {features.map((f) => (
            <div key={f.title} className="card p-5">
              <f.icon className="text-sun-500" width={26} height={26} />
              <h3 className="mt-3 font-semibold text-navy-950">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-6xl px-4 text-center text-sm text-slate-500 sm:px-6">
          Aussie Energy Savers ·{" "}
          <a className="underline" href="https://www.aussieenergysavers.com.au" target="_blank" rel="noreferrer">aussieenergysavers.com.au</a>
        </p>
      </section>
    </div>
  );
}
