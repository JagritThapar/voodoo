import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
const ALLOWED_EXT = new Set([".pdf", ".jpg", ".jpeg", ".png", ".heic", ".webp"]);

export async function saveUpload(file: File): Promise<{ name: string; stored: string } | { error: string }> {
  if (!file || file.size === 0) return { error: "Choose a file to upload." };
  if (file.size > 10 * 1024 * 1024) return { error: "Files must be under 10 MB." };
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return { error: "Upload a PDF or photo (JPG, PNG, HEIC)." };
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const stored = `${crypto.randomUUID()}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, stored), Buffer.from(await file.arrayBuffer()));
  return { name: path.basename(file.name).slice(0, 120), stored };
}
