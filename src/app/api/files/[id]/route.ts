import { getUser } from "@/lib/auth";
import { one } from "@/lib/db";
import { readUpload } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return new Response("Unauthorised", { status: 401 });
  const { id } = await params;
  const doc = await one<{ file_name: string | null; file_path: string | null; user_id: number }>(
    "SELECT pw.file_name, pw.file_path, p.user_id FROM paperwork pw JOIN projects p ON p.id = pw.project_id WHERE pw.id = ?",
    Number(id),
  );
  if (!doc?.file_path || (doc.user_id !== user.id && user.role !== "admin")) return new Response("Not found", { status: 404 });
  const file = await readUpload(doc.file_path);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file.data, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.file_name ?? "document")}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
