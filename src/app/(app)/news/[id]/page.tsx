import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { one } from "@/lib/db";
import { fmtDate } from "@/lib/constants";
import { Badge, PageHeader } from "@/components/ui";
import type { Post } from "../page";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const post = await one<Post>("SELECT * FROM posts WHERE id = ?", Number(id));
  if (!post) notFound();
  const external = post.cta_url?.startsWith("http");
  return (
    <article className="mx-auto max-w-2xl">
      <PageHeader back="/news" title={post.title} subtitle={<span className="flex items-center gap-2"><Badge tone={post.kind === "offer" ? "amber" : "sky"}>{post.kind === "offer" ? "Offer" : "News"}</Badge> {fmtDate(post.published_at)}</span>} />
      <div className="card p-5 sm:p-6">
        <p className="text-lg font-medium text-navy-950">{post.summary}</p>
        <div className="mt-4 space-y-3 whitespace-pre-line text-slate-700">{post.body}</div>
        {post.expires_at && <p className="mt-4 text-sm font-medium text-sun-600">Offer ends {fmtDate(post.expires_at)}.</p>}
        {post.cta_url && (
          external ? (
            <a href={post.cta_url} target="_blank" rel="noreferrer" className="btn-sun mt-6">{post.cta_label ?? "Learn more"}</a>
          ) : (
            <Link href={post.cta_url} className="btn-sun mt-6">{post.cta_label ?? "Learn more"}</Link>
          )
        )}
      </div>
    </article>
  );
}
