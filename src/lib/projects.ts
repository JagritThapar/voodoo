import "server-only";
import { all, one, run } from "./db";
import type { Design } from "./catalog";
import type { ProjectStatus } from "./constants";
import { advanceReferralForUser } from "./referrals";

export type Project = {
  id: number;
  user_id: number;
  status: ProjectStatus;
  design: string;
  title: string;
  estimate_low: number;
  estimate_high: number;
  quote_price: number | null;
  quote_summary: string | null;
  quote_valid_until: string | null;
  install_date: string | null;
  installer: string | null;
  created_at: string;
  updated_at: string;
};

export type Paperwork = {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  owner: "customer" | "aes";
  status: "pending" | "action_required" | "submitted" | "approved";
  file_name: string | null;
  file_path: string | null;
  updated_at: string;
};

export type ProjectEvent = { id: number; project_id: number; status: string; note: string | null; created_at: string };

export type Review = {
  id: number;
  project_id: number;
  user_id: number;
  rating: number;
  title: string;
  body: string;
  installer_rating: number | null;
  created_at: string;
};

export const parseDesign = (p: Project) => JSON.parse(p.design) as Design;

export function paperworkTemplate(d: Design): Omit<Paperwork, "id" | "project_id" | "updated_at" | "file_name" | "file_path">[] {
  const items: ReturnType<typeof paperworkTemplate> = [
    { name: "Signed contract", description: "Review and sign your installation agreement.", owner: "customer", status: "action_required" },
    { name: "Deposit invoice", description: "Deposit secures your install date.", owner: "customer", status: "action_required" },
    { name: "Recent electricity bill", description: "Upload a copy so we can lodge your network application.", owner: "customer", status: "action_required" },
    { name: "Network connection approval", description: "We apply to your distributor (DNSP) on your behalf.", owner: "aes", status: "pending" },
  ];
  if (d.solarKw > 0 || d.battery !== "none" || d.hotWater !== "none")
    items.push({ name: "STC assignment form", description: "Assigns your federal rebate certificates to AES.", owner: "customer", status: "pending" });
  if (d.state === "VIC")
    items.push({ name: "Solar Victoria eligibility", description: "Your rebate eligibility number from Solar Victoria.", owner: "customer", status: "pending" });
  items.push(
    { name: "Certificate of Electrical Safety", description: "Issued by your licensed electrician after install.", owner: "aes", status: "pending" },
    { name: "Meter upgrade / grid connection", description: "Your retailer swaps or reconfigures your meter.", owner: "aes", status: "pending" },
    { name: "Warranty & handover pack", description: "Product warranties, single line diagram and user guides.", owner: "aes", status: "pending" },
  );
  return items;
}

export function createPaperwork(projectId: number, d: Design) {
  if (one("SELECT 1 FROM paperwork WHERE project_id = ?", projectId)) return;
  for (const p of paperworkTemplate(d)) {
    run("INSERT INTO paperwork (project_id, name, description, owner, status) VALUES (?, ?, ?, ?, ?)", projectId, p.name, p.description, p.owner, p.status);
  }
}

const REFERRAL_SYNC: Partial<Record<ProjectStatus, Parameters<typeof advanceReferralForUser>[1]>> = {
  requested: "quote_requested",
  quoted: "quoted",
  accepted: "quoted",
  scheduled: "quoted",
  installed: "installed",
  connected: "installed",
};

/** Single place that changes a project's status: logs the timeline and keeps referrals in sync. */
export function setProjectStatus(project: Project, status: ProjectStatus, note?: string) {
  if (project.status !== status) {
    run("UPDATE projects SET status = ?, updated_at = datetime('now') WHERE id = ?", status, project.id);
    run("INSERT INTO project_events (project_id, status, note) VALUES (?, ?, ?)", project.id, status, note ?? null);
  } else if (note) {
    run("INSERT INTO project_events (project_id, status, note) VALUES (?, ?, ?)", project.id, status, note);
  }
  if (status === "accepted" || status === "scheduled" || status === "installed" || status === "connected") {
    createPaperwork(project.id, parseDesign(project));
  }
  const sync = REFERRAL_SYNC[status];
  if (sync) advanceReferralForUser(project.user_id, sync);
}

export function projectsFor(userId: number) {
  return all<Project>("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC, id DESC", userId);
}
