import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all } from "@/lib/db";
import { fmtDate } from "@/lib/constants";
import { Empty, PageHeader } from "@/components/ui";
import { BoltIcon, TagIcon } from "@/components/icons";

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
      <PageHeader eyebrow="News & offers" title="What's new." accent="What's on." subtitle="Rebate changes, member offers and plain-English energy tips from the AES team." />
      <div className="mb-5 flex gap-2">
        {tabs.map((t) => (
          <Link key={t.label} href={t.k ? `/news?kind=${t.k}` : "/news"} className={`rounded-full px-4 py-2 text-sm font-bold transition ${filter === t.k ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-cream-300 hover:ring-ink-900"}`}>
            {t.label}
          </Link>
        ))}
      </div>
      {posts.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((p, idx) => {
            const offer = p.kind === "offer";
            return (
              <Link
                key={p.id}
                href={`/news/${p.id}`}
                className={`group flex flex-col justify-between rounded-brand p-5 transition duration-200 hover:-translate-y-0.5 sm:p-6 ${
                  offer ? "bg-volt-400 text-ink-900" : "grain bg-ink-900 text-white"
                } ${idx === 0 ? "md:col-span-2 md:min-h-64" : "min-h-56"}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`eyebrow ${offer ? "text-ink-900" : "text-volt-400"}`}>{offer ? "Offer" : "News"}</span>
                  {offer ? <TagIcon width={22} height={22} /> : <BoltIcon width={22} height={22} className="text-lime-400" />}
                </div>
                <div className="mt-8">
                  <p className={`font-display font-black leading-[.95] tracking-tight [font-stretch:80%] [font-variation-settings:'wdth'_80] ${idx === 0 ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{p.title}</p>
                  <p className={`mt-3 line-clamp-2 max-w-xl text-sm ${offer ? "text-ink-700" : "text-ink-300"}`}>{p.summary}</p>
                  <p className={`mt-4 text-xs font-semibold uppercase tracking-wider ${offer ? "text-ink-700" : "text-ink-400"}`}>
                    {fmtDate(p.published_at)}{p.expires_at ? ` · ends ${fmtDate(p.expires_at)}` : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <Empty title="Nothing here yet">Check back soon for the latest news and offers.</Empty>
      )}
    </>
  );
}
