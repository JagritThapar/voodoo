"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, hashPassword, newReferralCode, requireUser, verifyPassword } from "@/lib/auth";
import { one, run, tx } from "@/lib/db";
import { designTitle, estimate, normaliseDesign } from "@/lib/catalog";
import { INTERESTS, MIN_PAYOUT, aud } from "@/lib/constants";
import { attachNewUser, wallet } from "@/lib/referrals";
import { setProjectStatus, type Paperwork, type Project } from "@/lib/projects";
import { saveUpload } from "@/lib/uploads";

export type FormState = { error?: string; ok?: string } | undefined;

const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- auth ---------- */

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const first = str(fd, "first_name", 60);
  const last = str(fd, "last_name", 60);
  const phone = str(fd, "phone", 30);
  const suburb = str(fd, "suburb", 80);
  const state = str(fd, "state", 3);
  const postcode = str(fd, "postcode", 4);
  const code = str(fd, "ref", 20) || null;

  if (!first || !last) return { error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (await one("SELECT 1 FROM users WHERE email = ?", email)) return { error: "An account with this email already exists. Try signing in." };
  if (code && !await one("SELECT 1 FROM users WHERE referral_code = ? COLLATE NOCASE", code))
    return { error: "That referral code wasn't found. Check it, or leave it blank." };

  const id = await tx(async () => {
    const { id } = await run(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, suburb, state, postcode, referral_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      email, hashPassword(password), first, last, phone || null, suburb || null, state || null, postcode || null, await newReferralCode(first),
    );
    await attachNewUser({ id, email, name: `${first} ${last}`, suburb: suburb || null }, code);
    return id;
  });
  await createSession(id);
  redirect("/dashboard?welcome=1");
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const user = await one<{ id: number; password_hash: string; role: string }>("SELECT id, password_hash, role FROM users WHERE email = ?", email);
  if (!user || !verifyPassword(password, user.password_hash)) return { error: "Incorrect email or password." };
  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

/* ---------- quotes & projects ---------- */

export async function requestQuote(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(String(fd.get("design") ?? "{}"));
  } catch {
    return { error: "Something went wrong reading your design. Please try again." };
  }
  const design = normaliseDesign(raw);
  const e = estimate(design);
  if (e.gross === 0) return { error: "Add at least one product to your design." };
  if (!/^\d{4}$/.test(design.postcode)) return { error: "Please enter your 4-digit postcode." };

  const id = await tx(async () => {
    const { id } = await run(
      "INSERT INTO projects (user_id, status, design, title, estimate_low, estimate_high) VALUES (?, 'requested', ?, ?, ?, ?)",
      user.id, JSON.stringify(design), designTitle(design), e.low, e.high,
    );
    const project = (await one<Project>("SELECT * FROM projects WHERE id = ?", id))!;
    await setProjectStatus(project, "requested", "We've received your design. An energy consultant will be in touch within 1 business day.");
    return id;
  });
  redirect(`/projects/${id}?new=1`);
}

async function ownProject(projectId: number) {
  const user = await requireUser();
  const project = await one<Project>("SELECT * FROM projects WHERE id = ? AND user_id = ?", projectId, user.id);
  if (!project) throw new Error("Project not found");
  return project;
}

export async function acceptQuote(projectId: number) {
  const project = await ownProject(projectId);
  if (project.status !== "quoted") return;
  await tx(async () => await setProjectStatus(project, "accepted", "Quote accepted — your paperwork checklist is ready."));
  revalidatePath(`/projects/${projectId}`);
}

export async function declineQuote(projectId: number) {
  const project = await ownProject(projectId);
  if (project.status !== "quoted" && project.status !== "requested") return;
  await tx(async () => await setProjectStatus(project, "declined", "Quote declined by customer."));
  revalidatePath(`/projects/${projectId}`);
}

export async function uploadPaperwork(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const doc = await one<Paperwork & { user_id: number }>(
    "SELECT pw.*, p.user_id FROM paperwork pw JOIN projects p ON p.id = pw.project_id WHERE pw.id = ?",
    Number(fd.get("paperwork_id")),
  );
  if (!doc || doc.user_id !== user.id) return { error: "Document not found." };
  if (doc.owner !== "customer" || doc.status === "approved") return { error: "This item doesn't need anything from you." };
  const saved = await saveUpload(fd.get("file") as File);
  if ("error" in saved) return saved;
  await run("UPDATE paperwork SET file_name = ?, file_path = ?, status = 'submitted', updated_at = datetime('now') WHERE id = ?", saved.name, saved.stored, doc.id);
  revalidatePath(`/projects/${doc.project_id}`);
  return { ok: "Uploaded — we'll review it shortly." };
}

export async function submitReview(_: FormState, fd: FormData): Promise<FormState> {
  const project = await ownProject(Number(fd.get("project_id")));
  if (project.status !== "installed" && project.status !== "connected") return { error: "You can review once your install is complete." };
  const rating = Number(fd.get("rating"));
  const installerRating = Number(fd.get("installer_rating")) || null;
  const title = str(fd, "title", 100);
  const body = str(fd, "body", 2000);
  if (!(rating >= 1 && rating <= 5)) return { error: "Please choose a star rating." };
  if (!title || body.length < 10) return { error: "Add a title and a few words about your experience." };
  if (await one("SELECT 1 FROM reviews WHERE project_id = ?", project.id)) return { error: "You've already reviewed this install." };
  await run(
    "INSERT INTO reviews (project_id, user_id, rating, title, body, installer_rating) VALUES (?, ?, ?, ?, ?, ?)",
    project.id, project.user_id, rating, title, body, installerRating,
  );
  revalidatePath(`/projects/${project.id}`);
  return { ok: "Thanks for the review. It goes straight to the team and your installer." };
}

/* ---------- referrals & payouts ---------- */

export async function submitReferral(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = str(fd, "name", 100);
  const email = str(fd, "email").toLowerCase();
  const phone = str(fd, "phone", 30);
  const suburb = str(fd, "suburb", 80);
  const interest = INTERESTS.includes(str(fd, "interest") as (typeof INTERESTS)[number]) ? str(fd, "interest") : "Not sure yet";
  const notes = str(fd, "notes", 500);
  if (!name) return { error: "Enter your friend's name." };
  if (!phone && !email) return { error: "Add a phone number or email so we can reach them." };
  if (email && !EMAIL_RE.test(email)) return { error: "That email doesn't look right." };
  if (fd.get("consent") !== "on") return { error: "Please confirm your friend is happy to be contacted." };
  if (email && email === user.email.toLowerCase()) return { error: "You can't refer yourself." };
  if (email && await one("SELECT 1 FROM users WHERE email = ?", email)) return { error: "This person already has an AES account." };
  if (email && await one("SELECT 1 FROM referrals WHERE email = ? AND status != 'lost'", email)) return { error: "This person has already been referred." };

  await run(
    "INSERT INTO referrals (referrer_id, name, email, phone, suburb, interest, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
    user.id, name, email || null, phone || null, suburb || null, interest, notes || null,
  );
  revalidatePath("/referrals");
  return { ok: `Sent. We'll reach out to ${name.split(" ")[0]} soon, and you can follow their progress below.` };
}

export async function saveBankDetails(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = str(fd, "account_name", 80);
  const bsb = str(fd, "bsb", 7).replace(/\D/g, "");
  const acct = str(fd, "account_number", 12).replace(/\D/g, "");
  if (!name) return { error: "Enter the account name." };
  if (bsb.length !== 6) return { error: "BSB must be 6 digits." };
  if (acct.length < 5 || acct.length > 10) return { error: "Account number must be 5–10 digits." };
  await run(
    "UPDATE users SET bank_account_name = ?, bank_bsb = ?, bank_account_number = ? WHERE id = ?",
    name, `${bsb.slice(0, 3)}-${bsb.slice(3)}`, acct, user.id,
  );
  revalidatePath("/earnings");
  return { ok: "Bank details saved." };
}

export async function requestPayout(): Promise<FormState> {
  const user = await requireUser();
  if (!user.bank_bsb || !user.bank_account_number || !user.bank_account_name) return { error: "Add your bank details first." };
  const result = await tx(async () => {
    const { available } = await wallet(user.id);
    if (available < MIN_PAYOUT) return { error: `You need at least ${aud(MIN_PAYOUT)} available to withdraw.` };
    const { id } = await run(
      "INSERT INTO payouts (user_id, amount, account_name, bsb, account_number) VALUES (?, ?, ?, ?, ?)",
      user.id, available, user.bank_account_name!, user.bank_bsb!, user.bank_account_number!,
    );
    await run("UPDATE commissions SET payout_id = ? WHERE beneficiary_id = ? AND status = 'approved' AND payout_id IS NULL", id, user.id);
    return { ok: `Payout of ${aud(available)} requested. Payments are made within 5 business days.` };
  });
  revalidatePath("/earnings");
  return result;
}

/* ---------- profile ---------- */

export async function updateProfile(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const first = str(fd, "first_name", 60);
  const last = str(fd, "last_name", 60);
  if (!first || !last) return { error: "Name is required." };
  await run(
    "UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, suburb = ?, state = ?, postcode = ? WHERE id = ?",
    first, last, str(fd, "phone", 30) || null, str(fd, "address", 200) || null, str(fd, "suburb", 80) || null,
    str(fd, "state", 3) || null, str(fd, "postcode", 4) || null, user.id,
  );
  const newPw = String(fd.get("new_password") ?? "");
  if (newPw) {
    if (newPw.length < 8) return { error: "New password must be at least 8 characters." };
    await run("UPDATE users SET password_hash = ? WHERE id = ?", hashPassword(newPw), user.id);
  }
  revalidatePath("/", "layout");
  return { ok: "Profile updated." };
}
