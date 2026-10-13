"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { one, run, tx } from "@/lib/db";
import { PROJECT_STATUS, REFERRAL_STATUS, REWARD_PRODUCTS, type ProjectStatus, type ReferralStatus, type RewardProduct } from "@/lib/constants";
import { setProjectStatus, type Project } from "@/lib/projects";
import { awardCommissions, setReferralStatus } from "@/lib/referrals";
import { saveUpload } from "@/lib/uploads";
import type { FormState } from "../actions";

const str = (fd: FormData, k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max);

export async function adminUpdateProject(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const project = await one<Project>("SELECT * FROM projects WHERE id = ?", Number(fd.get("id")));
  if (!project) return { error: "Project not found." };
  const status = str(fd, "status") as ProjectStatus;
  if (!(status in PROJECT_STATUS)) return { error: "Invalid status." };
  const price = str(fd, "quote_price") ? Math.round(Number(str(fd, "quote_price"))) : null;
  if (price != null && !(price > 0)) return { error: "Quote price must be a positive number." };
  if (status === "quoted" && price == null) return { error: "Add a quote price before sending the quote." };

  await tx(async () => {
    await run(
      `UPDATE projects SET quote_price = ?, quote_summary = ?, quote_valid_until = ?, install_date = ?, installer = ?, updated_at = datetime('now') WHERE id = ?`,
      price, str(fd, "quote_summary", 2000) || null, str(fd, "quote_valid_until", 10) || null,
      str(fd, "install_date", 10) || null, str(fd, "installer", 120) || null, project.id,
    );
    await setProjectStatus(project, status, str(fd, "note") || undefined);
  });
  revalidatePath("/admin", "layout");
  return { ok: "Project updated." };
}

export async function adminUpdatePaperwork(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const status = str(fd, "status");
  if (!["pending", "action_required", "submitted", "approved"].includes(status)) return { error: "Invalid status." };
  const file = fd.get("file") as File | null;
  if (file && file.size > 0) {
    const saved = await saveUpload(file);
    if ("error" in saved) return saved;
    await run("UPDATE paperwork SET file_name = ?, file_path = ? WHERE id = ?", saved.name, saved.stored, id);
  }
  await run("UPDATE paperwork SET status = ?, updated_at = datetime('now') WHERE id = ?", status, id);
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

export async function adminSetReferral(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status") as ReferralStatus;
  if (!(status in REFERRAL_STATUS)) return;
  const id = Number(fd.get("id"));
  const product = str(fd, "product") as RewardProduct;
  await tx(async () => {
    await setReferralStatus(id, status);
    // Leads without an app account have no project to read products from, so staff pick the product.
    if (status === "installed" && REWARD_PRODUCTS.some((p) => p.key === product)) await awardCommissions(id, 0, [product]);
  });
  revalidatePath("/admin", "layout");
}

export async function adminSetCommission(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status");
  if (status !== "approved" && status !== "void") return;
  // Only commissions not yet in a payout can change.
  await run("UPDATE commissions SET status = ? WHERE id = ? AND payout_id IS NULL AND status IN ('pending', 'approved')", status, Number(fd.get("id")));
  revalidatePath("/admin", "layout");
}

export async function adminApproveAllClearing() {
  await requireAdmin();
  await run("UPDATE commissions SET status = 'approved' WHERE status = 'pending' AND created_at <= datetime('now', '-14 days')");
  revalidatePath("/admin", "layout");
}

export async function adminProcessPayout(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const decision = str(fd, "decision");
  await tx(async () => {
    const payout = await one<{ status: string }>("SELECT status FROM payouts WHERE id = ?", id);
    if (payout?.status !== "requested") return;
    if (decision === "paid") {
      await run("UPDATE payouts SET status = 'paid', reference = ?, processed_at = datetime('now') WHERE id = ?", str(fd, "reference", 60) || null, id);
      await run("UPDATE commissions SET status = 'paid' WHERE payout_id = ?", id);
    } else if (decision === "rejected") {
      await run("UPDATE payouts SET status = 'rejected', processed_at = datetime('now') WHERE id = ?", id);
      await run("UPDATE commissions SET payout_id = NULL WHERE payout_id = ?", id);
    }
  });
  revalidatePath("/admin", "layout");
}

export async function adminCreatePost(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const kind = str(fd, "kind") === "offer" ? "offer" : "news";
  const title = str(fd, "title", 140);
  const summary = str(fd, "summary", 300);
  const body = str(fd, "body", 5000);
  if (!title || !summary || !body) return { error: "Title, summary and body are required." };
  const ctaUrl = str(fd, "cta_url", 300);
  if (ctaUrl && !ctaUrl.startsWith("/") && !ctaUrl.startsWith("https://")) return { error: "Button link must start with / or https://" };
  await run(
    "INSERT INTO posts (kind, title, summary, body, cta_label, cta_url, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    kind, title, summary, body, str(fd, "cta_label", 40) || null, ctaUrl || null, str(fd, "expires_at", 10) || null,
  );
  revalidatePath("/", "layout");
  return { ok: "Published." };
}

export async function adminDeletePost(fd: FormData) {
  await requireAdmin();
  await run("DELETE FROM posts WHERE id = ?", Number(fd.get("id")));
  revalidatePath("/", "layout");
}
