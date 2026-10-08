import "server-only";
import crypto from "node:crypto";
import path from "node:path";
import { one, run } from "./db";

// Files are stored in the database so the app needs no persistent disk (e.g. Render free + Turso).
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = {
  ".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".heic": "image/heic",
};

export async function saveUpload(file: File): Promise<{ name: string; stored: string } | { error: string }> {
  if (!file || file.size === 0) return { error: "Choose a file to upload." };
  if (file.size > MAX_BYTES) return { error: "Files must be under 5 MB. Try a photo instead of a scan, or compress the PDF." };
  const ext = path.extname(file.name).toLowerCase();
  if (!TYPES[ext]) return { error: "Upload a PDF or photo (JPG, PNG, HEIC)." };
  const id = crypto.randomUUID();
  await run("INSERT INTO files (id, mime, data) VALUES (?, ?, ?)", id, TYPES[ext], new Uint8Array(await file.arrayBuffer()));
  return { name: path.basename(file.name).slice(0, 120), stored: id };
}

export async function readUpload(id: string) {
  const row = await one<{ mime: string; data: ArrayBuffer }>("SELECT mime, data FROM files WHERE id = ?", id);
  return row ? { mime: row.mime, data: new Uint8Array(row.data) } : null;
}
