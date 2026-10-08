import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { buildNetwork, flatten, type NetworkNode } from "@/lib/referrals";
import { REFER_TABS, REFERRAL_STATUS, REWARD_LEVELS, aud, fmtDate } from "@/lib/constants";
import { SubTabs } from "@/components/nav";
import { Badge, Empty, PageHeader } from "@/components/ui";

export const metadata = { title: "My network" };

const LEVEL_COLORS = ["bg-ink-900 text-volt-400", "bg-volt-400 text-ink-900", "bg-lime-400 text-ink-900", "bg-leaf-600 text-white", "bg-ink-400 text-white"];

function Node({ node }: { node: NetworkNode }) {
  const st = REFERRAL_STATUS[node.status];
  const row = (
    <div className="flex items-center gap-3 rounded-xl border border-cream-300 bg-white p-3">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-sm font-black ${LEVEL_COLORS[(node.level - 1) % LEVEL_COLORS.length]}`}>
        {node.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink-900">{node.name}</p>
        <p className="truncate text-xs text-ink-500">
          Level {node.level}{node.suburb ? ` · ${node.suburb}` : ""} · {fmtDate(node.joined)}
          {node.children.length > 0 && ` · ${node.children.length} referral${node.children.length > 1 ? "s" : ""}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge tone={st.tone}>{node.status === "installed" ? "Installed" : st.label}</Badge>
        {node.earned > 0 && <span className="text-xs font-semibold text-leaf-700">+{aud(node.earned)} to you</span>}
      </div>
    </div>
  );
  if (!node.children.length) return <li>{row}</li>;
  return (
    <li>
      <details open={node.level < 3} className="group">
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">{row}</summary>
        <ul className="ml-4 mt-2 space-y-2 border-l-2 border-dashed border-cream-300 pl-4">
          {node.children.map((c) => <Node key={c.key} node={c} />)}
        </ul>
      </details>
    </li>
  );
}

export default async function NetworkPage() {
  const user = await requireUser();
  const tree = await buildNetwork(user.id);
  const all = flatten(tree);
  const levels = Array.from(new Set(all.map((n) => n.level))).sort((a, b) => a - b);

  return (
    <>
      <PageHeader eyebrow="Refer & earn" title="Your network." accent="Every level." subtitle="Everyone who has joined through you, and the people they've referred." />
      <SubTabs tabs={REFER_TABS} />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="grain rounded-brand bg-ink-900 p-4 text-white sm:p-5">
          <p className="eyebrow text-volt-400">Network</p>
          <p className="stat-num mt-2 text-4xl text-lime-400">{all.length}</p>
          <p className="mt-1.5 text-xs text-ink-300">{all.filter((n) => n.status === "installed").length} installed</p>
        </div>
        {REWARD_LEVELS.map((l) => {
          const nodes = all.filter((n) => n.level === l.level);
          return (
            <div key={l.level} className="card p-4 sm:p-5">
              <p className="eyebrow text-ink-500">Level {l.level}</p>
              <p className="stat-num mt-2 text-4xl text-ink-900">{nodes.length}</p>
              <p className="mt-1.5 text-xs text-ink-500">{aud(nodes.reduce((s, n) => s + n.earned, 0))} earned · {aud(l.amount)}/install</p>
            </div>
          );
        })}
      </div>

      {tree.length ? (
        <>
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-ink-500">
            {levels.map((l) => (
              <span key={l} className="inline-flex items-center gap-1.5">
                <span className={`h-3 w-3 rounded ${LEVEL_COLORS[(l - 1) % LEVEL_COLORS.length].split(" ")[0]}`} /> Level {l}
              </span>
            ))}
          </div>
          <div className="rounded-2xl bg-cream-200/60 p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-ink-900 p-3 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-400 font-display text-sm font-black text-ink-900">You</span>
              <p className="font-bold text-white">{user.first_name} {user.last_name}</p>
            </div>
            <ul className="ml-4 space-y-2 border-l-2 border-dashed border-cream-300 pl-4">
              {tree.map((n) => <Node key={n.key} node={n} />)}
            </ul>
          </div>
          <p className="mt-3 text-xs text-ink-500">For privacy, people beyond your direct referrals are shown by first name and initial.</p>
        </>
      ) : (
        <Empty title="Your network starts with one referral" action={<Link href="/referrals" className="btn-volt">Refer a friend</Link>}>
          When friends join with your link, they appear here. When their friends join, you&apos;ll see them too.
        </Empty>
      )}
    </>
  );
}
