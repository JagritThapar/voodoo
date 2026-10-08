import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { PAYOUT_STATUS, aud, fmtDate } from "@/lib/constants";
import { adminProcessPayout } from "../actions";
import { Badge, Card, Empty, PageHeader } from "@/components/ui";

export const metadata = { title: "Payouts" };

type Row = { id: number; amount: number; status: string; account_name: string; bsb: string; account_number: string; reference: string | null; created_at: string; processed_at: string | null; name: string; email: string };

export default async function AdminPayouts() {
  await requireAdmin();
  const rows = await all<Row>(
    `SELECT p.*, u.first_name || ' ' || u.last_name AS name, u.email FROM payouts p JOIN users u ON u.id = p.user_id
     ORDER BY p.status = 'requested' DESC, p.created_at DESC LIMIT 200`,
  );
  const open = rows.filter((r) => r.status === "requested");
  const done = rows.filter((r) => r.status !== "requested");
  return (
    <div className="space-y-6">
      <PageHeader title="Payouts" subtitle={`${open.length} to process · ${aud(open.reduce((s, r) => s + r.amount, 0))}`} />
      {open.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {open.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold tabular-nums text-ink-900">{aud(p.amount)}</p>
                  <p className="text-sm text-ink-600">{p.name} · {p.email}</p>
                  <p className="text-xs text-ink-500">Requested {fmtDate(p.created_at)}</p>
                </div>
                <Badge tone="amber">To pay</Badge>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-cream-50 p-3 font-mono text-sm">
                <div><dt className="font-sans text-xs text-ink-500">Name</dt><dd>{p.account_name}</dd></div>
                <div><dt className="font-sans text-xs text-ink-500">BSB</dt><dd>{p.bsb}</dd></div>
                <div><dt className="font-sans text-xs text-ink-500">Account</dt><dd>{p.account_number}</dd></div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={adminProcessPayout} className="flex flex-1 gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="decision" value="paid" />
                  <input className="input min-w-0 flex-1 py-2 text-sm" name="reference" placeholder="Bank transfer reference" />
                  <button className="btn-primary">Mark paid</button>
                </form>
                <form action={adminProcessPayout}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="decision" value="rejected" />
                  <button className="btn-danger">Reject</button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      ) : <Empty title="No payouts waiting" />}

      {done.length > 0 && (
        <Card title="History">
          <ul className="divide-y divide-cream-200 text-sm">
            {done.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <span>{p.name} · {aud(p.amount)} <span className="text-ink-500">· {fmtDate(p.processed_at)}{p.reference ? ` · ${p.reference}` : ""}</span></span>
                <Badge tone={PAYOUT_STATUS[p.status].tone}>{PAYOUT_STATUS[p.status].label}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
