import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { buildNetwork, flatten, type NetworkNode } from "@/lib/referrals";
import { REFER_TABS, REFERRAL_STATUS, aud } from "@/lib/constants";
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
        <p className="truncate font-bold text-ink-900">{node.name}</p>
        <p className="text-xs text-ink-500">Level {node.level}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge tone={st.tone}>{node.status === "installed" ? "Installed" : st.label}</Badge>
        {node.earned > 0 && <span className="text-xs font-bold text-leaf-700">+{aud(node.earned)}</span>}
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

  return (
    <>
      <PageHeader title="Your network." />
      <SubTabs tabs={REFER_TABS} />

      <div className="grain mb-5 grid grid-cols-4 divide-x divide-white/10 rounded-brand bg-ink-900 py-4 text-center text-white">
        <div>
          <p className="stat-num text-3xl text-lime-400">{all.length}</p>
          <p className="eyebrow mt-1.5 text-ink-400">Total</p>
        </div>
        {[1, 2, 3].map((l) => (
          <div key={l}>
            <p className="stat-num text-3xl">{all.filter((n) => n.level === l).length}</p>
            <p className="eyebrow mt-1.5 text-ink-400">Level {l}</p>
          </div>
        ))}
      </div>

      {tree.length ? (
        <>
          <div className="rounded-2xl bg-cream-200/60 p-3 sm:p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-ink-900 p-3 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-400 font-display text-sm font-black text-ink-900">You</span>
              <p className="font-bold text-white">{user.first_name} {user.last_name}</p>
            </div>
            <ul className="ml-4 space-y-2 border-l-2 border-dashed border-cream-300 pl-4">
              {tree.map((n) => <Node key={n.key} node={n} />)}
            </ul>
          </div>
        </>
      ) : (
        <Empty title="No one yet" action={<Link href="/referrals" className="btn-volt">Refer a mate</Link>} />
      )}
    </>
  );
}
