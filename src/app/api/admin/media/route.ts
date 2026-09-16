import crypto from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireApiUser } from "@/lib/auth";
import { MEDIA_DIR } from "@/app/api/media/[file]/route";

const MAX_SIZE = 8 * 1024 * 1024;
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "application/pdf"]);

function storagePath(url: string) {
  const fileName = url.split("/").pop() || "";
  if (!/^[A-Za-z0-9._-]+$/.test(fileName) || fileName.includes("..")) return null;
  const resolved = path.join(MEDIA_DIR, fileName);
  return path.dirname(resolved) === MEDIA_DIR ? resolved : null;
}

export async function GET() {
  const auth = await requireApiUser(["SUPER_ADMIN", "ADMIN"]);
  if (auth.error) return auth.error;
  const records = await db.select().from(media).orderBy(desc(media.createdAt));
  return Response.json({ records });
}

export async function POST(request: Request) {
  const auth = await requireApiUser(["SUPER_ADMIN", "ADMIN"]);
  if (auth.error) return auth.error;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return Response.json({ error: "Choose a file to upload" }, { status: 400 });
  if (file.size > MAX_SIZE) return Response.json({ error: "Files must be 8 MB or smaller" }, { status: 400 });
  if (!allowed.has(file.type)) return Response.json({ error: "Supported formats: JPG, PNG, WebP, GIF, SVG and PDF" }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
  const [duplicate] = await db.select().from(media).where(eq(media.checksum, checksum)).limit(1);
  if (duplicate) return Response.json({ record: duplicate, duplicate: true, message: "Existing identical media item reused" });
  const extension = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "") || (file.type === "application/pdf" ? ".pdf" : ".bin");
  const storedName = `${checksum.slice(0, 20)}${extension}`;
  await mkdir(MEDIA_DIR, { recursive: true });
  await writeFile(path.join(MEDIA_DIR, storedName), buffer);
  const [record] = await db.insert(media).values({
    fileName: file.name.slice(0, 255), url: `/api/media/${storedName}`, altText: String(form.get("altText") || "").slice(0, 300), caption: String(form.get("caption") || "").slice(0, 2000), category: String(form.get("category") || "General").slice(0, 100),
    type: file.type.startsWith("image/") ? "IMAGE" : file.type === "application/pdf" ? "DOCUMENT" : "OTHER", mimeType: file.type, size: file.size, checksum, uploadedBy: auth.user!.id,
  }).returning();
  return Response.json({ record, message: "Media uploaded" }, { status: 201 });
}

export async function PUT(request: Request) {
  const auth = await requireApiUser(["SUPER_ADMIN", "ADMIN"]);
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body?.id) return Response.json({ error: "Media ID is required" }, { status: 400 });
  const [record] = await db.update(media).set({ altText: String(body.altText || "").slice(0, 300), caption: String(body.caption || "").slice(0, 2000), category: String(body.category || "General").slice(0, 100), updatedAt: new Date() }).where(eq(media.id, String(body.id))).returning();
  return Response.json({ record, message: "Media details updated" });
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser(["SUPER_ADMIN", "ADMIN"]);
  if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Media ID is required" }, { status: 400 });
  const [record] = await db.delete(media).where(eq(media.id, id)).returning();
  if (record) {
    const filePath = storagePath(record.url);
    if (filePath) await unlink(filePath).catch(() => undefined);
  }
  return Response.json({ message: "Media deleted" });
}
