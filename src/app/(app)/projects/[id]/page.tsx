import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { all, one } from "@/lib/db";
import { designSummary } from "@/lib/catalog";
import { COMPANY, PAPERWORK_STATUS, PROJECT_STATUS, aud, fmtDate } from "@/lib/constants";
import { parseDesign, type Paperwork, type Project, type ProjectEvent, type Review } from "@/lib/projects";
import { acceptQuote, declineQuote } from "@/app/actions";
import { Badge, Card, PageHeader } from "@/components/ui";
import { Stepper } from "@/components/project";
import { CheckIcon, FileIcon, StarIcon } from "@/components/icons";
import { ReviewForm, UploadForm } from "./client";

export const metadata = { title: "Project" };

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ new?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const project = one<Project>("SELECT * FROM projects WHERE id = ? AND user_id = ?", Number(id), user.id);
  if (!project) notFound();

  const design = parseDesign(project);
  const paperwork = all<Paperwork>("SELECT * FROM paperwork WHERE project_id = ? ORDER BY id", project.id);
  const events = all<ProjectEvent>("SELECT * FROM project_events WHERE project_id = ? ORDER BY created_at DESC, id DESC", project.id);
  const review = one<Review>("SELECT * FROM reviews WHERE project_id = ?", project.id);
  const st = PROJECT_STATUS[project.status];
  const installed = project.status === "installed" || project.status === "connected";
  const done = paperwork.filter((p) => p.status === "approved").length;

  return (
    <div className="space-y-4">
      <PageHeader title={project.title} back="/projects" subtitle={<>Project #{project.id} · created {fmtDate(project.created_at)}</>} action={<Badge tone={st.tone}>{st.label}</Badge>} />

      {isNew && (
        <div className="flex gap-3 rounded-2xl bg-leaf-50 p-4 text-sm text-leaf-700 ring-1 ring-leaf-100">
          <CheckIcon className="shrink-0" />
          <p><strong>Quote request sent!</strong> An energy consultant will contact you within 1 business day to confirm a few details and send your fixed-price quote.</p>
        </div>
      )}

      <Card><Stepper status={project.status} /></Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Your quote">
          {project.quote_price ? (
            <>
              <p className="text-3xl font-bold tabular-nums text-navy-950">{aud(project.quote_price)}</p>
              <p className="text-sm text-slate-500">Inc. GST, after rebates{project.quote_valid_until ? ` · valid until ${fmtDate(project.quote_valid_until)}` : ""}</p>
              {project.quote_summary && <p className="mt-3 text-sm text-slate-700">{project.quote_summary}</p>}
              {project.status === "quoted" && (
                <div className="mt-4 flex gap-2">
                  <form action={acceptQuote.bind(null, project.id)} className="flex-1"><button className="btn-sun w-full">Accept quote</button></form>
                  <form action={declineQuote.bind(null, project.id)}><button className="btn-ghost">Decline</button></form>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-2xl font-bold tabular-nums text-navy-950">{aud(project.estimate_low)} – {aud(project.estimate_high)}</p>
              <p className="text-sm text-slate-500">Instant estimate after rebates</p>
              {project.status === "requested" && (
                <>
                  <p className="mt-3 text-sm text-slate-700">We&apos;re preparing your fixed-price quote. Questions? Call {COMPANY.phone}.</p>
                  <form action={declineQuote.bind(null, project.id)} className="mt-3"><button className="text-sm font-medium text-slate-500 underline">Cancel this request</button></form>
                </>
              )}
            </>
          )}
        </Card>

        <Card title="Your system">
          <ul className="space-y-1.5 text-sm">
            {designSummary(design).map((s) => (
              <li key={s} className="flex gap-2"><CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-leaf-500" />{s}</li>
            ))}
          </ul>
          {design.notes && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">“{design.notes}”</p>}
        </Card>
      </div>

      {(project.install_date || project.installer) && (
        <Card title="Installation">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-slate-500">Install date</dt><dd className="font-semibold text-navy-950">{fmtDate(project.install_date)}</dd></div>
            <div><dt className="text-slate-500">Installer</dt><dd className="font-semibold text-navy-950">{project.installer ?? "To be confirmed"}</dd></div>
          </dl>
        </Card>
      )}

      {paperwork.length > 0 && (
        <div id="paperwork" className="scroll-mt-20">
          <Card title="Paperwork" action={<span className="text-sm text-slate-500">{done}/{paperwork.length} complete</span>}>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-leaf-500" style={{ width: `${(done / paperwork.length) * 100}%` }} />
            </div>
            <ul className="divide-y divide-slate-100">
              {paperwork.map((p) => {
                const ps = PAPERWORK_STATUS[p.status];
                const canUpload = p.owner === "customer" && p.status !== "approved";
                return (
                  <li key={p.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-navy-950">{p.name}</p>
                        <p className="text-sm text-slate-500">{p.description}</p>
                        {p.file_name && (
                          <a href={`/api/files/${p.id}`} className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-navy-700 underline">
                            <FileIcon width={14} height={14} /> {p.file_name}
                          </a>
                        )}
                      </div>
                      <Badge tone={ps.tone}>{p.owner === "aes" && p.status === "pending" ? "With AES" : ps.label}</Badge>
                    </div>
                    {canUpload && <UploadForm paperworkId={p.id} label={p.file_name ? "Replace" : "Upload"} />}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      )}

      {installed && (
        <div id="review" className="scroll-mt-20">
          <Card title="Your review">
            {review ? (
              <div>
                <div className="flex gap-0.5 text-sun-400">{[1, 2, 3, 4, 5].map((n) => <StarIcon key={n} filled={n <= review.rating} />)}</div>
                <p className="mt-2 font-semibold text-navy-950">{review.title}</p>
                <p className="mt-1 text-sm text-slate-700">{review.body}</p>
                <p className="mt-2 text-xs text-slate-500">Posted {fmtDate(review.created_at)}. Thank you! Reviews help other Aussie families choose with confidence.</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-slate-600">How did we go? Your feedback goes straight to our team and your installer.</p>
                <ReviewForm projectId={project.id} />
              </>
            )}
          </Card>
        </div>
      )}

      <Card title="Timeline">
        <ol className="relative space-y-4 border-l-2 border-slate-100 pl-5">
          {events.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-navy-700 ring-4 ring-white" />
              <p className="text-sm font-semibold text-navy-950">{PROJECT_STATUS[e.status as Project["status"]]?.label ?? e.status}</p>
              {e.note && <p className="text-sm text-slate-600">{e.note}</p>}
              <p className="text-xs text-slate-400">{fmtDate(e.created_at)}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
