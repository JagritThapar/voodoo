import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { projectsFor } from "@/lib/projects";
import { buildNetwork, flatten, wallet } from "@/lib/referrals";
import { REWARD_LEVELS, aud, fmtDate } from "@/lib/constants";
import { Card, Stat } from "@/components/ui";
import { ProjectCard } from "@/components/project";
import { ChevronRight, StarIcon, SunIcon, TagIcon, UsersIcon } from "@/components/icons";

export const metadata = { title: "Home" };

type Post = { id: number; kind: string; title: string; summary: string; published_at: string };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser();
  const { welcome } = await searchParams;
  const projects = projectsFor(user.id);
  const active = projects.filter((p) => p.status !== "declined" && p.status !== "cancelled");
  const needsReview = all<{ id: number; title: string }>(
    `SELECT p.id, p.title FROM projects p LEFT JOIN reviews r ON r.project_id = p.id
     WHERE p.user_id = ? AND p.status IN ('installed','connected') AND r.id IS NULL`,
    user.id,
  );
  const actions = all<{ project_id: number; n: number }>(
    `SELECT pw.project_id, COUNT(*) AS n FROM paperwork pw JOIN projects p ON p.id = pw.project_id
     WHERE p.user_id = ? AND pw.status = 'action_required' GROUP BY pw.project_id`,
    user.id,
  );
  const w = wallet(user.id);
  const network = flatten(buildNetwork(user.id));
  const posts = all<Post>("SELECT id, kind, title, summary, published_at FROM posts WHERE expires_at IS NULL OR expires_at >= date('now') ORDER BY published_at DESC LIMIT 3");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">{welcome ? "Welcome aboard," : "G'day,"}</p>
        <h1 className="text-3xl font-bold tracking-tight text-navy-950">{user.first_name} 👋</h1>
      </div>

      {welcome && (
        <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 p-5 text-white">
          <p className="font-semibold">Your account is ready.</p>
          <p className="mt-1 text-sm text-navy-100">Start by designing your system. You&apos;ll see an instant estimate including rebates, and we&apos;ll send you a firm quote.</p>
          <Link href="/design" className="btn-sun mt-4">Design my system</Link>
        </div>
      )}

      {(needsReview.length > 0 || actions.length > 0) && (
        <div className="space-y-2">
          {actions.map((a) => (
            <Link key={a.project_id} href={`/projects/${a.project_id}#paperwork`} className="flex items-center gap-3 rounded-2xl bg-sun-50 p-4 ring-1 ring-sun-300/60">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-sun-400 font-bold text-navy-950">{a.n}</span>
              <span className="flex-1 text-sm font-medium text-navy-950">Paperwork needs your attention</span>
              <ChevronRight className="text-slate-500" />
            </Link>
          ))}
          {needsReview.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}#review`} className="flex items-center gap-3 rounded-2xl bg-leaf-50 p-4 ring-1 ring-leaf-100">
              <StarIcon className="text-sun-500" filled />
              <span className="flex-1 text-sm font-medium text-navy-950">How did your {p.title} install go? Leave a review</span>
              <ChevronRight className="text-slate-500" />
            </Link>
          ))}
        </div>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-navy-950">My projects</h2>
          <Link href="/projects" className="text-sm font-semibold text-navy-700">See all</Link>
        </div>
        {active.length ? (
          <div className="grid gap-3 md:grid-cols-2">{active.slice(0, 2).map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        ) : (
          <Link href="/design" className="card flex items-center gap-4 p-5 hover:border-slate-300">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sun-100 text-sun-600"><SunIcon width={26} height={26} /></span>
            <span className="flex-1">
              <span className="block font-semibold text-navy-950">Design your system</span>
              <span className="text-sm text-slate-600">Solar, battery, EV charging & hot water, with an instant estimate.</span>
            </span>
            <ChevronRight className="text-slate-400" />
          </Link>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-navy-950">Referral rewards</h2>
          <Link href="/earnings" className="text-sm font-semibold text-navy-700">Earnings</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat accent label="Available" value={aud(w.available)} hint="Ready to withdraw" />
          <Stat label="Clearing" value={aud(w.pending)} hint="From recent installs" />
          <Stat label="Lifetime" value={aud(w.lifetime)} />
          <Stat label="Network" value={network.length} hint={`${network.filter((n) => n.level === 1).length} direct`} />
        </div>
        <Link href="/referrals" className="mt-3 flex items-center gap-3 rounded-2xl bg-sun-400 p-4 text-navy-950 transition hover:bg-sun-500">
          <UsersIcon />
          <span className="flex-1 font-semibold">Refer a friend and earn up to {aud(REWARD_LEVELS[0].amount)}</span>
          <ChevronRight />
        </Link>
      </section>

      <Card title="Latest news & offers" action={<Link href="/news" className="text-sm font-semibold text-navy-700">All</Link>}>
        <ul className="divide-y divide-slate-100">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/news/${p.id}`} className="flex gap-3 py-3">
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${p.kind === "offer" ? "bg-sun-100 text-sun-600" : "bg-navy-50 text-navy-700"}`}>
                  {p.kind === "offer" ? <TagIcon width={16} height={16} /> : <SunIcon width={16} height={16} />}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-navy-950">{p.title}</span>
                  <span className="line-clamp-1 text-sm text-slate-500">{p.summary}</span>
                  <span className="text-xs text-slate-400">{fmtDate(p.published_at)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
