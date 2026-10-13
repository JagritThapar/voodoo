import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { projectsFor } from "@/lib/projects";
import { buildNetwork, flatten, wallet } from "@/lib/referrals";
import { PROJECT_STATUS, TOP_REWARD, aud, fmtDate } from "@/lib/constants";
import { Stat } from "@/components/ui";
import { Stepper } from "@/components/project";
import { BoltIcon, ChevronRight, StarIcon, TagIcon, UsersIcon } from "@/components/icons";

export const metadata = { title: "Home" };

type Post = { id: number; kind: string; title: string };

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
  const posts = await all<Post>("SELECT id, kind, title FROM posts WHERE expires_at IS NULL OR expires_at >= date('now') ORDER BY published_at DESC LIMIT 3");

  const current = active[0];
  const st = current ? PROJECT_STATUS[current.status] : null;

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
            <p className="font-bold">
              {current.title}
              {current.install_date && current.status === "scheduled" ? <span className="text-ink-300"> · install {fmtDate(current.install_date)}</span> : null}
            </p>
            <div className="mt-4 rounded-2xl bg-white/[.06] p-4">
              <Stepper status={current.status} dark />
            </div>
            <Link href={`/projects/${current.id}`} className="btn-volt mt-5">View project <ChevronRight width={18} height={18} /></Link>
          </div>
        ) : (
          <div className="mt-6">
            <Link href="/design" className="btn-volt">Design my system <ChevronRight width={18} height={18} /></Link>
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


      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-bold tracking-tight">Referral rewards</h2>
          <Link href="/earnings" className="text-sm font-bold text-leaf-700 hover:underline">Earnings</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat accent label="Available" value={aud(w.available)} />
          <Stat label="Network" value={network.length} />
        </div>
        <Link href="/referrals" className="group mt-3 flex items-center gap-4 rounded-brand bg-ink-900 p-4 font-bold text-white transition hover:bg-ink-800">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-volt-400 text-ink-900"><UsersIcon /></span>
          <span className="flex-1">Refer a mate · up to {aud(TOP_REWARD)}</span>
          <ChevronRight className="text-volt-400 transition group-hover:translate-x-0.5" />
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-bold tracking-tight">News & offers</h2>
          <Link href="/news" className="text-sm font-bold text-leaf-700 hover:underline">All</Link>
        </div>
        <ul className="card divide-y divide-cream-200 px-4 sm:px-5">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/news/${p.id}`} className="group flex items-center gap-3 py-3.5">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${p.kind === "offer" ? "bg-volt-400 text-ink-900" : "bg-ink-900 text-lime-400"}`}>
                  {p.kind === "offer" ? <TagIcon width={16} height={16} /> : <BoltIcon width={16} height={16} />}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold text-ink-900 group-hover:underline">{p.title}</span>
                <ChevronRight className="shrink-0 text-ink-400" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
