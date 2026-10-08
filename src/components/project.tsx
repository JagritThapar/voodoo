import Link from "next/link";
import { PROJECT_FLOW, PROJECT_STATUS, aud, fmtDate, type ProjectStatus } from "@/lib/constants";
import type { Project } from "@/lib/projects";
import { Badge } from "./ui";
import { CheckIcon, ChevronRight } from "./icons";

export function Stepper({ status, compact }: { status: ProjectStatus; compact?: boolean }) {
  const idx = PROJECT_FLOW.indexOf(status as (typeof PROJECT_FLOW)[number]);
  if (idx < 0) return null;
  return (
    <ol className="flex items-start">
      {PROJECT_FLOW.map((s, i) => {
        const done = i < idx || (i === idx && i === PROJECT_FLOW.length - 1);
        const current = i === idx && !done;
        return (
          <li key={s} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && <span className={`absolute right-1/2 top-3 h-0.5 w-full ${i <= idx ? "bg-leaf-500" : "bg-slate-200"}`} />}
            <span
              className={`relative z-10 grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${
                done ? "bg-leaf-500 text-white" : current ? "bg-sun-400 text-navy-950 ring-4 ring-sun-100" : "bg-slate-200 text-slate-500"
              }`}
            >
              {done ? <CheckIcon width={14} height={14} strokeWidth={3} /> : i + 1}
            </span>
            {!compact && (
              <span className={`mt-1.5 hidden text-[11px] leading-tight sm:block ${current ? "font-semibold text-navy-950" : "text-slate-500"}`}>
                {PROJECT_STATUS[s].step}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const st = PROJECT_STATUS[project.status];
  return (
    <Link href={`/projects/${project.id}`} className="card block p-4 transition hover:border-slate-300 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-navy-950">{project.title}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {project.quote_price ? `Quote ${aud(project.quote_price)}` : `Estimate ${aud(project.estimate_low)}–${aud(project.estimate_high)}`} · {fmtDate(project.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Badge tone={st.tone}>{st.label}</Badge>
          <ChevronRight className="text-slate-400" />
        </div>
      </div>
      <div className="mt-4"><Stepper status={project.status} compact /></div>
      {project.install_date && ["scheduled"].includes(project.status) && (
        <p className="mt-3 text-sm font-medium text-violet-700">Install day: {fmtDate(project.install_date)}</p>
      )}
    </Link>
  );
}
