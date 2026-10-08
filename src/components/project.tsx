import Link from "next/link";
import { PROJECT_FLOW, PROJECT_STATUS, aud, fmtDate, type ProjectStatus } from "@/lib/constants";
import type { Project } from "@/lib/projects";
import { Badge } from "./ui";
import { CheckIcon, ChevronRight } from "./icons";

export function Stepper({ status, compact, dark }: { status: ProjectStatus; compact?: boolean; dark?: boolean }) {
  const idx = PROJECT_FLOW.indexOf(status as (typeof PROJECT_FLOW)[number]);
  if (idx < 0) return null;
  return (
    <ol className="flex items-start">
      {PROJECT_FLOW.map((s, i) => {
        const done = i < idx || (i === idx && i === PROJECT_FLOW.length - 1);
        const current = i === idx && !done;
        return (
          <li key={s} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && <span className={`absolute right-1/2 top-[13px] h-1 w-full ${i <= idx ? "bg-lime-400" : dark ? "bg-white/15" : "bg-cream-200"}`} />}
            <span
              className={`relative z-10 grid h-7 w-7 place-items-center rounded-full font-display text-xs font-black ${
                done ? "bg-lime-400 text-ink-900" : current ? "bg-volt-400 text-ink-900 ring-4 ring-volt-400/30"   : dark ? "bg-white/10 text-ink-300" : "bg-cream-200 text-ink-500"
              }`}
            >
              {done ? <CheckIcon width={14} height={14} strokeWidth={3} /> : i + 1}
            </span>
            {!compact && (
              <span className={`mt-2 hidden text-[11px] font-semibold uppercase leading-tight tracking-wide sm:block ${current ? (dark ? "text-white" : "text-ink-900") : dark ? "text-ink-400" : "text-ink-500"}`}>
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
    <Link href={`/projects/${project.id}`} className="card group block p-4 transition duration-200 hover:-translate-y-0.5 hover:border-ink-900 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight tracking-tight text-ink-900">{project.title}</p>
          <p className="mt-0.5 text-sm text-ink-500">
            {project.quote_price ? `Quote ${aud(project.quote_price)}` : `Estimate ${aud(project.estimate_low)}–${aud(project.estimate_high)}`} · {fmtDate(project.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Badge tone={st.tone}>{st.label}</Badge>
          <ChevronRight className="text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-ink-900" />
        </div>
      </div>
      <div className="mt-4"><Stepper status={project.status} compact /></div>
      {project.install_date && ["scheduled"].includes(project.status) && (
        <p className="mt-4 inline-flex rounded-md bg-volt-400 px-2 py-1 text-xs font-bold uppercase tracking-wider text-ink-900">Install day · {fmtDate(project.install_date)}</p>
      )}
    </Link>
  );
}
