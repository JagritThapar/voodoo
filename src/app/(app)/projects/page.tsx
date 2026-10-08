import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { projectsFor } from "@/lib/projects";
import { Empty, PageHeader } from "@/components/ui";
import { ProjectCard } from "@/components/project";
import { PlusIcon } from "@/components/icons";

export const metadata = { title: "My projects" };

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await projectsFor(user.id);
  return (
    <>
      <PageHeader
        title="My projects"
        subtitle="Quotes, installs and paperwork for your home."
        action={<Link href="/design" className="btn-primary hidden sm:inline-flex"><PlusIcon width={16} height={16} /> New quote</Link>}
      />
      {projects.length ? (
        <div className="grid gap-3 md:grid-cols-2">{projects.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
      ) : (
        <Empty title="No projects yet" action={<Link href="/design" className="btn-sun">Design my system</Link>}>
          Design a solar, battery, EV charger or hot water system to get your first quote.
        </Empty>
      )}
    </>
  );
}
