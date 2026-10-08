import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { projectsFor } from "@/lib/projects";
import { buildNetwork, flatten, wallet } from "@/lib/referrals";
import { PROJECT_STATUS, REWARD_LEVELS, aud, fmtDate } from "@/lib/constants";
import { Card, Stat } from "@/components/ui";
import { ProjectCard, Stepper } from "@/components/project";
import { BoltIcon, ChevronRight, StarIcon, TagIcon, UsersIcon } from "@/components/icons";

export const metadata = { title: "Home" };

type Post = { id: number; kind: string; title: string; summary: string; published_at: string };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser();
  const { welcome } = await searchParams;
  const projects = await projectsFor(user.id);
  const active = projects.filter((p) => p.status !== "declined" && p.status !== "cancelled");
  const needsReview = await all<{ id: number; title: string }>(
    `SELECT p.id, p.title FROM projects p LEFT JOIN reviews r ON r.project_id = p.id
     WHERE p.user_id = ? AND p.status IN ('installed','connected') AND r.id IS NULL`,
    user.id,
  );
  const actions = await all<{ project_id: number; n: number }>(
    `SELECT pw.project_id, COUNT(*) AS n FROM paperwork pw JOIN projects p ON p.id = pw.project_id
     WHERE p.user_id = ? AND pw.status = 'action_required' GROUP BY pw.project_id`,
    user.id,
  );
  const w = await wallet(user.id);
  const network = flatten(await buildNetwork(user.id));
  const posts = await all<Post>("SELECT id, kind, title, summary, published_at FROM posts WHERE expires_at IS NULL OR expires_at >= date('now') ORDER BY published_at DESC LIMIT 4");

  const current = active[0];
  const st = current ? PROJECT_STATUS[current.status] : null;
  const offer = posts.find((p) => p.kind === "offer");

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="grain -mx-4 -mt-6 overflow-hidden bg-ink-900 px-4 pb-8 pt-8 text-white sm:mx-0 sm:mt-0 sm:rounded-brand sm:p-8">
        <p className="eyebrow text-volt-400">{welcome ? "Welcome aboard" : "G'day"}</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">
          {user.first_name}.
          <span className="block text-lime-400">{current ? st!.step + "." : "Let's get started."}</span>
        </h1>
        {current ? (
          <div className="mt-6 max-w-2xl">
            <p className="text-ink-300">
              <span className="font-bold text-white">{current.title}</span> · {st!.label}
              {current.install_date && current.status === "scheduled" ? ` · install ${fmtDate(current.install_date)}` : ""}
            </p>
            <div className="mt-5 rounded-2xl bg-white/[.06] p-4">
              <Stepper status={current.status} dark />
            </div>
            <Link href={`/projects/${current.id}`} className="btn-volt mt-5">View project <ChevronRight width={18} height={18} /></Link>
          </div>
        ) : (
          <div className="mt-5 max-w-lg">
            <p className="text-pretty text-ink-300">Design your system and see a price after rebates in a couple of minutes. We&apos;ll follow up with a fixed written quote.</p>
            <Link href="/design" className="btn-volt mt-5">Design my system <ChevronRight width={18} height={18} /></Link>
          </div>
        )}
      </section>

      {(needsReview.length > 0 || actions.length > 0) && (
        <section aria-label="To do" className="space-y-2">
          {actions.map((a) => (
            <Link key={a.project_id} href={`/projects/${a.project_id}#paperwork`} className="group flex items-center gap-4 rounded-brand bg-volt-400 p-4 text-ink-900 transition hover:bg-volt-300">
              <span className="stat-num grid h-11 w-11 place-items-center rounded-xl bg-ink-900 text-xl text-volt-400">{a.n}</span>
              <span className="flex-1 font-bold">Paperwork needs you</span>
              <ChevronRight className="transition group-hover:translate-x-0.5" />
            </Link>
          ))}
          {needsReview.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}#review`} className="group flex items-center gap-4 rounded-brand bg-lime-400 p-4 text-ink-900 transition hover:bg-lime-300">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-900 text-volt-400"><StarIcon filled /></span>
              <span className="flex-1 font-bold">How did your {p.title} install go?</span>
              <ChevronRight className="transition group-hover:translate-x-0.5" />
            </Link>
          ))}
        </section>
      )}

      {active.length > 1 && (
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl font-bold tracking-tight">Your projects</h2>
            <Link href="/projects" className="text-sm font-bold text-leaf-700 hover:underline">See all</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">{active.slice(0, 2).map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-bold tracking-tight">Referral rewards</h2>
          <Link href="/earnings" className="text-sm font-bold text-leaf-700 hover:underline">Earnings</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <Stat accent label="Available" value={aud(w.available)} hint="Ready to withdraw" />
          <Stat label="Clearing" value={aud(w.pending)} hint="From recent installs" />
          <Stat label="Lifetime" value={aud(w.lifetime)} />
          <Stat label="Network" value={network.length} hint={`${network.filter((n) => n.level === 1).length} direct`} />
        </div>
        <Link href="/referrals" className="group mt-3 flex items-center gap-4 rounded-brand bg-ink-900 p-4 text-white transition hover:bg-ink-800 sm:p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-volt-400 text-ink-900"><UsersIcon /></span>
          <span className="flex-1">
            <span className="block font-bold">Refer a mate</span>
            <span className="text-sm text-ink-300">Earn {aud(REWARD_LEVELS[0].amount)} when they install, plus rewards from their referrals.</span>
          </span>
          <ChevronRight className="text-volt-400 transition group-hover:translate-x-0.5" />
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        {offer && (
          <Link href={`/news/${offer.id}`} className="group relative isolate flex min-h-56 flex-col justify-end overflow-hidden rounded-brand p-5 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/photos/home-dusk.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-900 via-ink-900/60 to-transparent" />
            <span className="eyebrow text-volt-400">Offer</span>
            <span className="mt-2 text-2xl font-bold leading-tight tracking-tight">{offer.title}</span>
            <span className="mt-1 line-clamp-2 text-sm text-ink-200">{offer.summary}</span>
          </Link>
        )}
        <Card title="News & offers" action={<Link href="/news" className="text-sm font-bold text-leaf-700 hover:underline">All</Link>}>
          <ul className="divide-y divide-cream-200">
            {posts.filter((p) => p.id !== offer?.id).map((p) => (
              <li key={p.id}>
                <Link href={`/news/${p.id}`} className="group flex gap-3 py-3">
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${p.kind === "offer" ? "bg-volt-400 text-ink-900" : "bg-ink-900 text-lime-400"}`}>
                    {p.kind === "offer" ? <TagIcon width={16} height={16} /> : <BoltIcon width={16} height={16} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold leading-snug text-ink-900 group-hover:underline">{p.title}</span>
                    <span className="line-clamp-1 text-sm text-ink-500">{p.summary}</span>
                    <span className="text-xs text-ink-400">{fmtDate(p.published_at)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
