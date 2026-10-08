import fs from "node:fs/promises";
import path from "node:path";
import { getUser } from "@/lib/auth";
import { one } from "@/lib/db";
import { UPLOAD_DIR } from "@/lib/uploads";

const TYPES: Record<string, string> = {
  ".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".heic": "image/heic",
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return new Response("Unauthorised", { status: 401 });
  const { id } = await params;
  const doc = one<{ file_name: string | null; file_path: string | null; user_id: number }>(
    "SELECT pw.file_name, pw.file_path, p.user_id FROM paperwork pw JOIN projects p ON p.id = pw.project_id WHERE pw.id = ?",
    Number(id),
  );
  if (!doc?.file_path || (doc.user_id !== user.id && user.role !== "admin")) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, path.basename(doc.file_path)));
    return new Response(data, {
      headers: {
        "Content-Type": TYPES[path.extname(doc.file_path)] ?? "application/octet-stream",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.file_name ?? "document")}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
