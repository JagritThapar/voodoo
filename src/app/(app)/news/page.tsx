import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { fmtDate } from "@/lib/constants";
import { Badge, Empty, PageHeader } from "@/components/ui";
import { SunIcon, TagIcon } from "@/components/icons";

export const metadata = { title: "News & offers" };

export type Post = {
  id: number; kind: "news" | "offer"; title: string; summary: string; body: string;
  cta_label: string | null; cta_url: string | null; expires_at: string | null; published_at: string;
};

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  await requireUser();
  const { kind } = await searchParams;
  const filter = kind === "offer" || kind === "news" ? kind : null;
  const posts = await all<Post>(
    `SELECT * FROM posts WHERE (expires_at IS NULL OR expires_at >= date('now')) ${filter ? "AND kind = ?" : ""} ORDER BY published_at DESC`,
    ...(filter ? [filter] : []),
  );
  const tabs = [
    { k: null, label: "All" },
    { k: "offer", label: "Offers" },
    { k: "news", label: "News" },
  ];

  return (
    <>
      <PageHeader title="News & offers" subtitle="Rebate updates, member deals and energy tips." />
      <div className="mb-5 flex gap-2">
        {tabs.map((t) => (
          <Link key={t.label} href={t.k ? `/news?kind=${t.k}` : "/news"} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${filter === t.k ? "bg-navy-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>
            {t.label}
          </Link>
        ))}
      </div>
      {posts.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((p) => (
            <Link key={p.id} href={`/news/${p.id}`} className="card group overflow-hidden transition hover:border-slate-300">
              <div className={`flex h-28 items-end justify-between p-4 ${p.kind === "offer" ? "bg-gradient-to-br from-sun-300 to-sun-500" : "bg-gradient-to-br from-navy-700 to-navy-950"}`}>
                {p.kind === "offer" ? <TagIcon width={34} height={34} className="text-navy-950/70" /> : <SunIcon width={34} height={34} className="text-sun-300" />}
                <Badge tone={p.kind === "offer" ? "slate" : "amber"}>{p.kind === "offer" ? "Offer" : "News"}</Badge>
              </div>
              <div className="p-4">
                <p className="font-semibold text-navy-950 group-hover:underline">{p.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.summary}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {fmtDate(p.published_at)}{p.expires_at ? ` · ends ${fmtDate(p.expires_at)}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty title="Nothing here yet">Check back soon for the latest news and offers.</Empty>
      )}
    </>
  );
}
