import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { all, one } from "@/lib/db";
import { designSummary } from "@/lib/catalog";
import { PAPERWORK_STATUS, PROJECT_STATUS, WARRANTIES, aud, fmtDate } from "@/lib/constants";
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
  const project = await one<Project>("SELECT * FROM projects WHERE id = ? AND user_id = ?", Number(id), user.id);
  if (!project) notFound();

  const design = parseDesign(project);
  const paperwork = await all<Paperwork>("SELECT * FROM paperwork WHERE project_id = ? ORDER BY id", project.id);
  const events = await all<ProjectEvent>("SELECT * FROM project_events WHERE project_id = ? ORDER BY created_at DESC, id DESC", project.id);
  const review = await one<Review>("SELECT * FROM reviews WHERE project_id = ?", project.id);
  const st = PROJECT_STATUS[project.status];
  const installed = project.status === "installed" || project.status === "connected";
  const done = paperwork.filter((p) => p.status === "approved").length;

  return (
    <div className="space-y-4">
      <PageHeader keepCase eyebrow={`Project #${project.id}`} title={project.title} back="/projects" subtitle={<>Created {fmtDate(project.created_at)}</>} action={<Badge tone={st.tone}>{st.label}</Badge>} />

      {isNew && (
        <div className="flex gap-3 rounded-brand bg-lime-400 p-4 text-sm text-ink-900">
          <CheckIcon className="shrink-0" />
          <p><strong>Quote request sent.</strong> An energy consultant will call within 1 business day to confirm a few details, then send your fixed written price.</p>
        </div>
      )}

      <section className="grain rounded-brand bg-ink-900 p-5 sm:p-6"><Stepper status={project.status} dark /></section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Your quote">
          {project.quote_price ? (
            <>
              <p className="stat-num text-5xl text-ink-900">{aud(project.quote_price)}</p>
              <p className="text-sm text-ink-500">Inc. GST, after rebates{project.quote_valid_until ? ` · valid until ${fmtDate(project.quote_valid_until)}` : ""}</p>
              {project.quote_summary && <p className="mt-3 text-sm text-ink-700">{project.quote_summary}</p>}
              {project.status === "quoted" && (
                <div className="mt-4 flex gap-2">
                  <form action={acceptQuote.bind(null, project.id)} className="flex-1"><button className="btn-volt w-full">Accept quote</button></form>
                  <form action={declineQuote.bind(null, project.id)}><button className="btn-ghost">Decline</button></form>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="stat-num text-4xl text-ink-900">{aud(project.estimate_low)}–{aud(project.estimate_high).replace("$", "")}</p>
              <p className="text-sm text-ink-500">Instant estimate after rebates</p>
              {project.status === "requested" && (
                <>
                  <p className="mt-3 text-sm text-ink-700">We&apos;re preparing your quote.</p>
                  <form action={declineQuote.bind(null, project.id)} className="mt-3"><button className="text-sm font-medium text-ink-500 underline">Cancel this request</button></form>
                </>
              )}
            </>
          )}
        </Card>

        <Card title="Your system">
          <ul className="space-y-1.5 text-sm">
            {designSummary(design).map((s) => (
              <li key={s} className="flex gap-2"><CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-leaf-700" />{s}</li>
            ))}
          </ul>
          
        </Card>
      </div>

      {(project.install_date || project.installer) && (
        <Card title="Installation">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-ink-500">Install date</dt><dd className="font-semibold text-ink-900">{fmtDate(project.install_date)}</dd></div>
            <div><dt className="text-ink-500">Installer</dt><dd className="font-semibold text-ink-900">{project.installer ?? "To be confirmed"}</dd></div>
          </dl>
        </Card>
      )}

      {paperwork.length > 0 && (
        <div id="paperwork" className="scroll-mt-20">
          <Card title="Paperwork" action={<span className="text-sm text-ink-500">{done}/{paperwork.length} complete</span>}>
            <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-cream-200">
              <div className="h-full rounded-full bg-lime-400" style={{ width: `${(done / paperwork.length) * 100}%` }} />
            </div>
            <ul className="divide-y divide-cream-200">
              {paperwork.map((p) => {
                const ps = PAPERWORK_STATUS[p.status];
                const canUpload = p.owner === "customer" && p.status !== "approved";
                return (
                  <li key={p.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900">{p.name}</p>
                        {canUpload && <p className="text-sm text-ink-500">{p.description}</p>}
                        {p.file_name && (
                          <a href={`/api/files/${p.id}`} className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-leaf-700 underline">
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
                <div className="flex gap-0.5 text-volt-400">{[1, 2, 3, 4, 5].map((n) => <StarIcon key={n} filled={n <= review.rating} />)}</div>
                <p className="mt-2 font-semibold text-ink-900">{review.title}</p>
                <p className="mt-1 text-sm text-ink-700">{review.body}</p>
                <p className="mt-2 text-xs text-ink-500">{fmtDate(review.created_at)}</p>
              </div>
            ) : (
              <>

                <ReviewForm projectId={project.id} />
              </>
            )}
          </Card>
        </div>
      )}

      {installed && (
        <section className="grain rounded-brand bg-ink-900 p-5 text-white sm:p-6">
          <p className="eyebrow text-volt-400">Warranties</p>
          <h2 className="display mt-2 text-3xl">Covered for years.<span className="block text-lime-400">In writing.</span></h2>
          <ul className="mt-5 space-y-2.5">
            {WARRANTIES.map((w) => (
              <li key={w.item} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 sm:grid-cols-[10rem_1fr]">
                <span className="text-xs font-semibold uppercase leading-tight tracking-wide text-ink-300">{w.item}</span>
                <span className="flex h-7 items-center justify-end whitespace-nowrap rounded bg-lime-400 px-2 font-display text-xs font-black text-ink-900" style={{ width: `max(${w.pct}%, 4.5rem)` }}>{w.years}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Card title="Timeline">
        <ol className="relative space-y-4 border-l-2 border-cream-200 pl-5">
          {events.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[28px] top-1 h-3.5 w-3.5 rounded-full bg-lime-400 ring-4 ring-white" />
              <p className="text-sm font-semibold text-ink-900">{PROJECT_STATUS[e.status as Project["status"]]?.label ?? e.status}</p>
              {e.note && <p className="text-sm text-ink-600">{e.note}</p>}
              <p className="text-xs text-ink-400">{fmtDate(e.created_at)}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
