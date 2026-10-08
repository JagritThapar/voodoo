import { notFound } from "next/navigation";
import { all, one } from "@/lib/db";
import { designSummary, estimate } from "@/lib/catalog";
import { PAPERWORK_STATUS, PROJECT_STATUS, aud, fmtDate, type ProjectStatus } from "@/lib/constants";
import { parseDesign, type Paperwork, type Project, type ProjectEvent, type Review } from "@/lib/projects";
import { requireAdmin, type User } from "@/lib/auth";
import { adminUpdatePaperwork, adminUpdateProject } from "../../actions";
import { ActionForm, SubmitButton } from "@/components/form";
import { Badge, Card, Field, PageHeader } from "@/components/ui";

export default async function AdminProject({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const project = one<Project>("SELECT * FROM projects WHERE id = ?", Number(id));
  if (!project) notFound();
  const customer = one<User>("SELECT * FROM users WHERE id = ?", project.user_id)!;
  const design = parseDesign(project);
  const est = estimate(design);
  const paperwork = all<Paperwork>("SELECT * FROM paperwork WHERE project_id = ? ORDER BY id", project.id);
  const events = all<ProjectEvent>("SELECT * FROM project_events WHERE project_id = ? ORDER BY created_at DESC, id DESC", project.id);
  const review = one<Review>("SELECT * FROM reviews WHERE project_id = ?", project.id);

  return (
    <div className="space-y-4">
      <PageHeader back="/admin/projects" title={`#${project.id} ${project.title}`} subtitle={`${customer.first_name} ${customer.last_name} · ${fmtDate(project.created_at)}`} action={<Badge tone={PROJECT_STATUS[project.status].tone}>{PROJECT_STATUS[project.status].label}</Badge>} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <Card title="Customer">
            <dl className="space-y-1 text-sm">
              <div><dt className="inline text-slate-500">Email: </dt><dd className="inline"><a className="underline" href={`mailto:${customer.email}`}>{customer.email}</a></dd></div>
              <div><dt className="inline text-slate-500">Phone: </dt><dd className="inline">{customer.phone ? <a className="underline" href={`tel:${customer.phone}`}>{customer.phone}</a> : "—"}</dd></div>
              <div><dt className="inline text-slate-500">Address: </dt><dd className="inline">{[customer.address, customer.suburb, customer.state, customer.postcode].filter(Boolean).join(", ") || "—"}</dd></div>
            </dl>
          </Card>
          <Card title="Requested design">
            <ul className="list-disc space-y-1 pl-5 text-sm">{designSummary(design).map((s) => <li key={s}>{s}</li>)}</ul>
            {design.notes && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">“{design.notes}”</p>}
            <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm">
              {est.lines.map((l) => <div key={l.label} className="flex justify-between"><span className="text-slate-600">{l.label}</span><span>{aud(l.amount)}</span></div>)}
              {est.rebates.map((r) => <div key={r.label} className="flex justify-between text-leaf-700"><span>{r.label}</span><span>−{aud(r.amount)}</span></div>)}
              <div className="flex justify-between font-semibold"><span>Calculator net</span><span>{aud(est.net)}</span></div>
            </div>
          </Card>
          {review && (
            <Card title={`Customer review: ${review.rating}/5`}>
              <p className="font-medium">{review.title}</p>
              <p className="text-sm text-slate-600">{review.body}</p>
              {review.installer_rating && <p className="mt-1 text-xs text-slate-500">Installer rating: {review.installer_rating}/5</p>}
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card title="Update project">
            <ActionForm action={adminUpdateProject} resetOnSuccess={false} className="space-y-3">
              <input type="hidden" name="id" value={project.id} />
              <Field label="Status">
                <select className="input" name="status" defaultValue={project.status}>
                  {(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((s) => <option key={s} value={s}>{PROJECT_STATUS[s].label}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quote price (inc GST, after rebates)"><input className="input" name="quote_price" type="number" min={0} step={10} defaultValue={project.quote_price ?? ""} /></Field>
                <Field label="Quote valid until"><input className="input" name="quote_valid_until" type="date" defaultValue={project.quote_valid_until ?? ""} /></Field>
              </div>
              <Field label="Quote summary"><textarea className="input min-h-20" name="quote_summary" defaultValue={project.quote_summary ?? ""} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Install date"><input className="input" name="install_date" type="date" defaultValue={project.install_date ?? ""} /></Field>
                <Field label="Installer"><input className="input" name="installer" defaultValue={project.installer ?? ""} /></Field>
              </div>
              <Field label="Timeline note to customer (optional)"><input className="input" name="note" placeholder="e.g. Install booked, our team arrives 7:30am" /></Field>
              <SubmitButton>Save &amp; notify timeline</SubmitButton>
              <p className="text-xs text-slate-500">Setting status to Installed or System live marks the customer&apos;s referral as installed and creates rewards for their upline.</p>
            </ActionForm>
          </Card>

          {paperwork.length > 0 && (
            <Card title="Paperwork">
              <ul className="divide-y divide-slate-100">
                {paperwork.map((p) => (
                  <li key={p.id} className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{p.name} <span className="text-xs font-normal text-slate-500">({p.owner === "customer" ? "customer" : "AES"})</span></p>
                      <Badge tone={PAPERWORK_STATUS[p.status].tone}>{PAPERWORK_STATUS[p.status].label}</Badge>
                    </div>
                    {p.file_name && <a className="text-sm text-navy-700 underline" href={`/api/files/${p.id}`}>{p.file_name}</a>}
                    <ActionForm action={adminUpdatePaperwork} resetOnSuccess={false} className="mt-2 flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <select className="input w-auto py-1.5 text-sm" name="status" defaultValue={p.status}>
                        {Object.entries(PAPERWORK_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <input type="file" name="file" accept=".pdf,image/*" className="max-w-[12rem] text-xs" />
                      <SubmitButton className="btn-ghost px-3 py-1.5">Save</SubmitButton>
                    </ActionForm>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Timeline">
            <ul className="space-y-2 text-sm">
              {events.map((e) => (
                <li key={e.id}><span className="font-medium">{PROJECT_STATUS[e.status as ProjectStatus]?.label ?? e.status}</span> · <span className="text-slate-500">{fmtDate(e.created_at)}</span>{e.note && <span className="block text-slate-600">{e.note}</span>}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
