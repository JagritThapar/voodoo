import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { fmtDate } from "@/lib/constants";
import { adminCreatePost, adminDeletePost } from "../actions";
import { ActionForm, SubmitButton } from "@/components/form";
import { Badge, Card, Field, PageHeader } from "@/components/ui";

export const metadata = { title: "News & offers" };

export default async function AdminNews() {
  await requireAdmin();
  const posts = all<{ id: number; kind: string; title: string; summary: string; expires_at: string | null; published_at: string }>(
    "SELECT id, kind, title, summary, expires_at, published_at FROM posts ORDER BY published_at DESC",
  );
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div>
        <PageHeader title="News & offers" subtitle="Posts appear on every customer's home screen." />
        <Card title="New post">
          <ActionForm action={adminCreatePost} className="space-y-3">
            <Field label="Type">
              <select className="input" name="kind" defaultValue="offer"><option value="offer">Offer</option><option value="news">News</option></select>
            </Field>
            <Field label="Title"><input className="input" name="title" maxLength={140} required /></Field>
            <Field label="Summary" hint="One or two sentences shown on cards."><textarea className="input min-h-16" name="summary" maxLength={300} required /></Field>
            <Field label="Body"><textarea className="input min-h-32" name="body" required /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Button label"><input className="input" name="cta_label" placeholder="Design my system" /></Field>
              <Field label="Button link"><input className="input" name="cta_url" placeholder="/design or https://…" /></Field>
            </div>
            <Field label="Expires (offers)"><input className="input" type="date" name="expires_at" /></Field>
            <SubmitButton pendingText="Publishing…">Publish</SubmitButton>
          </ActionForm>
        </Card>
      </div>
      <div className="space-y-2 lg:pt-[4.5rem]">
        {posts.map((p) => {
          const expired = p.expires_at && p.expires_at < new Date().toISOString().slice(0, 10);
          return (
            <div key={p.id} className="card flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2"><Badge tone={p.kind === "offer" ? "amber" : "sky"}>{p.kind}</Badge>{expired && <Badge tone="slate">Expired</Badge>}</div>
                <p className="mt-1 font-medium text-navy-950">{p.title}</p>
                <p className="line-clamp-2 text-sm text-slate-600">{p.summary}</p>
                <p className="text-xs text-slate-400">{fmtDate(p.published_at)}{p.expires_at ? ` → ${fmtDate(p.expires_at)}` : ""}</p>
              </div>
              <form action={adminDeletePost}><input type="hidden" name="id" value={p.id} /><button className="btn-danger px-2.5 py-1.5 text-xs">Delete</button></form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
