import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { all, one } from "@/lib/db";
import { PROJECT_STATUS, aud, fmtDate, type ProjectStatus } from "@/lib/constants";
import { Badge, Card, PageHeader, Stat } from "@/components/ui";
import { StarIcon } from "@/components/icons";

export const metadata = { title: "Overview" };

export default async function AdminHome() {
  await requireAdmin();
  const n = async (sql: string) => (await one<{ n: number | null }>(sql))?.n ?? 0;
  const stats = {
    customers: await n("SELECT COUNT(*) AS n FROM users WHERE role = 'customer'"),
    openQuotes: await n("SELECT COUNT(*) AS n FROM projects WHERE status = 'requested'"),
    inProgress: await n("SELECT COUNT(*) AS n FROM projects WHERE status IN ('accepted','scheduled')"),
    installed: await n("SELECT COUNT(*) AS n FROM projects WHERE status IN ('installed','connected')"),
    payouts: await n("SELECT SUM(amount) AS n FROM payouts WHERE status = 'requested'"),
    leads: await n("SELECT COUNT(*) AS n FROM referrals WHERE status = 'submitted'"),
    avgRating: (await one<{ n: number | null }>("SELECT AVG(rating) AS n FROM reviews"))?.n,
  };
  const requests = await all<{ id: number; title: string; status: ProjectStatus; first_name: string; last_name: string; suburb: string | null; estimate_low: number; estimate_high: number; created_at: string }>(
    `SELECT p.id, p.title, p.status, p.estimate_low, p.estimate_high, p.created_at, u.first_name, u.last_name, u.suburb
     FROM projects p JOIN users u ON u.id = p.user_id WHERE p.status IN ('requested','accepted') ORDER BY p.created_at DESC LIMIT 8`,
  );
  const reviews = await all<{ id: number; project_id: number; rating: number; installer_rating: number | null; title: string; body: string; created_at: string; first_name: string; last_name: string }>(
    `SELECT r.*, u.first_name, u.last_name FROM reviews r JOIN users u ON u.id = r.user_id ORDER BY r.created_at DESC LIMIT 10`,
  );
  const customers = await all<{ id: number; first_name: string; last_name: string; email: string; phone: string | null; suburb: string | null; created_at: string; referrer: string | null; projects: number; downline: number }>(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.suburb, u.created_at,
       (SELECT first_name || ' ' || last_name FROM users x WHERE x.id = u.referred_by) AS referrer,
       (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id) AS projects,
       (SELECT COUNT(*) FROM referrals r WHERE r.referrer_id = u.id) AS downline
     FROM users u WHERE u.role = 'customer' ORDER BY u.created_at DESC LIMIT 50`,
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Overview." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat accent label="New quote requests" value={stats.openQuotes} hint={<Link href="/admin/projects?status=requested" className="underline">Review</Link>} />
        <Stat label="Installs in progress" value={stats.inProgress} />
        <Stat label="Payouts to process" value={aud(stats.payouts)} hint={<Link href="/admin/payouts" className="underline">Process</Link>} />
        <Stat label="New referral leads" value={stats.leads} hint={<Link href="/admin/referrals" className="underline">Contact</Link>} />
        <Stat label="Customers" value={stats.customers} />
        <Stat label="Installed systems" value={stats.installed} />
        <Stat label="Average rating" value={stats.avgRating ? `${stats.avgRating.toFixed(1)} ★` : "—"} hint={`${reviews.length} recent reviews`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Needs action">
          {requests.length ? (
            <ul className="divide-y divide-cream-200">
              {requests.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/projects/${p.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-cream-50">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-900">{p.first_name} {p.last_name}: {p.title}</p>
                      <p className="text-xs text-ink-500">{p.suburb ?? "—"} · est. {aud(p.estimate_low)}–{aud(p.estimate_high)} · {fmtDate(p.created_at)}</p>
                    </div>
                    <Badge tone={PROJECT_STATUS[p.status].tone}>{p.status === "accepted" ? "Book install" : "Send quote"}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-500">All caught up.</p>}
        </Card>

        <Card title="Latest reviews">
          {reviews.length ? (
            <ul className="divide-y divide-cream-200">
              {reviews.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="flex gap-0.5 text-volt-400">{[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} width={14} height={14} filled={i <= r.rating} />)}</span>
                    <Link href={`/admin/projects/${r.project_id}`} className="text-xs text-ink-500 underline">{r.first_name} {r.last_name} · {fmtDate(r.created_at)}</Link>
                  </div>
                  <p className="mt-1 font-medium text-ink-900">{r.title}</p>
                  <p className="text-sm text-ink-600">{r.body}</p>
                  {r.installer_rating && <p className="mt-1 text-xs text-ink-500">Installer: {r.installer_rating}/5</p>}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-500">No reviews yet.</p>}
        </Card>
      </div>

      <Card title="Customers">
        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-ink-500">
              <tr><th className="px-4 py-2 sm:px-5">Name</th><th className="px-2 py-2">Contact</th><th className="px-2 py-2">Referred by</th><th className="px-2 py-2">Projects</th><th className="px-2 py-2">Referrals</th><th className="px-2 py-2">Joined</th></tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2.5 font-medium text-ink-900 sm:px-5">{c.first_name} {c.last_name}<span className="block text-xs font-normal text-ink-500">{c.suburb}</span></td>
                  <td className="px-2 py-2.5 text-ink-600">{c.email}<span className="block text-xs">{c.phone}</span></td>
                  <td className="px-2 py-2.5 text-ink-600">{c.referrer ?? "—"}</td>
                  <td className="px-2 py-2.5"><Link className="underline" href={`/admin/projects?user=${c.id}`}>{c.projects}</Link></td>
                  <td className="px-2 py-2.5">{c.downline}</td>
                  <td className="px-2 py-2.5 text-ink-600">{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
