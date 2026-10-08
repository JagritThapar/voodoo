import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { one, run } from "./db";
export { hashPassword, verifyPassword } from "./password";

const COOKIE = "aes_session";
const SESSION_DAYS = 30;

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  role: "customer" | "admin";
  referral_code: string;
  referred_by: number | null;
  bank_account_name: string | null;
  bank_bsb: string | null;
  bank_account_number: string | null;
  created_at: string;
};

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await run("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)", sha256(token), userId, expires.toISOString());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE token_hash = ?", sha256(token));
  jar.delete(COOKIE);
}

export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const user = await one<User>(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
    sha256(token),
    new Date().toISOString(),
  );
  return user ?? null;
});

export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function newReferralCode(firstName: string): Promise<string> {
  const base = firstName.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 5) || "AES";
  for (;;) {
    const code = `${base}${crypto.randomInt(100, 9999)}`;
    if (!(await one("SELECT 1 FROM users WHERE referral_code = ?", code))) return code;
  }
}
