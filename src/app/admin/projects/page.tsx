import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { all } from "@/lib/db";
import { PROJECT_STATUS, aud, fmtDate, type ProjectStatus } from "@/lib/constants";
import { Badge, Empty, PageHeader } from "@/components/ui";

export const metadata = { title: "Projects" };

export default async function AdminProjects({ searchParams }: { searchParams: Promise<{ status?: string; user?: string }> }) {
  await requireAdmin();
  const { status, user } = await searchParams;
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (status && status in PROJECT_STATUS) { where.push("p.status = ?"); params.push(status); }
  if (user) { where.push("p.user_id = ?"); params.push(Number(user)); }
  const rows = await all<{ id: number; title: string; status: ProjectStatus; quote_price: number | null; estimate_low: number; estimate_high: number; install_date: string | null; updated_at: string; first_name: string; last_name: string; suburb: string | null }>(
    `SELECT p.*, u.first_name, u.last_name, u.suburb FROM projects p JOIN users u ON u.id = p.user_id
     ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY p.updated_at DESC LIMIT 200`,
    ...params,
  );
  return (
    <>
      <PageHeader title="Projects" subtitle="Quote requests through to grid connection." />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/projects" className={`rounded-full px-3 py-1 text-sm font-semibold ${!status ? "bg-navy-900 text-white" : "bg-white ring-1 ring-slate-200"}`}>All</Link>
        {(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((s) => (
          <Link key={s} href={`/admin/projects?status=${s}`} className={`rounded-full px-3 py-1 text-sm font-semibold ${status === s ? "bg-navy-900 text-white" : "bg-white ring-1 ring-slate-200"}`}>
            {PROJECT_STATUS[s].label}
          </Link>
        ))}
      </div>
      {rows.length ? (
        <div className="card divide-y divide-slate-100">
          {rows.map((p) => (
            <Link key={p.id} href={`/admin/projects/${p.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50">
              <div className="min-w-0">
                <p className="truncate font-medium text-navy-950">#{p.id} {p.first_name} {p.last_name}: {p.title}</p>
                <p className="text-xs text-slate-500">
                  {p.suburb ?? "—"} · {p.quote_price ? `quoted ${aud(p.quote_price)}` : `est. ${aud(p.estimate_low)}–${aud(p.estimate_high)}`}
                  {p.install_date ? ` · install ${fmtDate(p.install_date)}` : ""} · updated {fmtDate(p.updated_at)}
                </p>
              </div>
              <Badge tone={PROJECT_STATUS[p.status].tone}>{PROJECT_STATUS[p.status].label}</Badge>
            </Link>
          ))}
        </div>
      ) : <Empty title="No projects match" />}
    </>
  );
}
