import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { getCollection, type AdminField } from "@/lib/admin-config";
import { requireApiUser } from "@/lib/auth";
import { slugify } from "@/lib/validation";

export const dynamic = "force-dynamic";

type UnknownRecord = Record<string, unknown>;

function normalizeValue(field: AdminField, value: unknown) {
  if (field.key.endsWith("Id") && (value === "" || value === null || value === undefined)) return null;
  if (field.type === "boolean") return Boolean(value);
  if (field.type === "number") return value === "" || value === null ? 0 : Number(value);
  if (field.type === "list") {
    if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
    return String(value ?? "").split("\n").map((v) => v.trim()).filter(Boolean);
  }
  if (field.type === "jsonFaq") {
    if (Array.isArray(value)) return value;
    return String(value ?? "").split("\n").map((line) => {
      const [question, ...answer] = line.split("|");
      return { question: question?.trim(), answer: answer.join("|").trim() };
    }).filter((item) => item.question && item.answer);
  }
  if (field.type === "date") return value ? (field.key === "deadline" ? String(value).slice(0, 10) : new Date(String(value))) : null;
  return typeof value === "string" ? value.trim() : value ?? null;
}

function cleanInput(body: UnknownRecord, fields: AdminField[], creating: boolean, table: PgTable) {
  const tableColumns = getTableColumns(table);
  const clean: UnknownRecord = {};
  for (const field of fields) {
    if (!(field.key in body)) continue;
    const value = normalizeValue(field, body[field.key]);
    if (field.required && (value === "" || value === null || value === undefined)) throw new Error(`${field.label} is required`);
    clean[field.key] = value;
  }
  const name = clean.name || clean.title;
  if (name && fields.some((field) => field.key === "slug") && !clean.slug) clean.slug = slugify(String(name));
  if (clean.status === "PUBLISHED" && fields.some((field) => field.key === "publishedAt") && !clean.publishedAt) clean.publishedAt = new Date();
  // Only write columns the target table actually defines. blog_categories and
  // seo_settings have no is_demo column, so writing it unconditionally would fail.
  if (creating && "isDemo" in tableColumns) clean.isDemo = false;
  if ("updatedAt" in tableColumns) clean.updatedAt = new Date();
  if (creating && "createdAt" in tableColumns) clean.createdAt = new Date();
  return clean;
}

async function access(collectionKey: string, method: string) {
  const config = getCollection(collectionKey);
  if (!config) return { config: null, response: Response.json({ error: "Unknown CMS collection" }, { status: 404 }) };
  const auth = await requireApiUser(config.editorAllowed ? undefined : ["SUPER_ADMIN", "ADMIN"]);
  if (auth.error) return { config: null, response: auth.error };
  if (method === "DELETE" && auth.user?.role === "EDITOR") return { config: null, response: Response.json({ error: "Editors cannot delete content" }, { status: 403 }) };
  return { config, response: null };
}

export async function GET(_request: NextRequest, context: { params: Promise<{ collection: string }> }) {
  const { collection } = await context.params;
  const { config, response } = await access(collection, "GET");
  if (response || !config) return response;
  const columns = getTableColumns(config.table);
  const rows = await db.select().from(config.table).orderBy(desc(columns.updatedAt ?? columns.createdAt)).limit(1000);
  return Response.json({ records: rows });
}

export async function POST(request: NextRequest, context: { params: Promise<{ collection: string }> }) {
  const { collection } = await context.params;
  const { config, response } = await access(collection, "POST");
  if (response || !config) return response;
  if (config.canCreate === false) return Response.json({ error: "Records in this collection are created from the public workflow" }, { status: 405 });
  try {
    const body = await request.json() as UnknownRecord;
    const clean = cleanInput(body, config.fields, true, config.table);
    const [record] = await db.insert(config.table).values(clean).returning();
    return Response.json({ record, message: `${config.singular} created` }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create record";
    return Response.json({ error: message.includes("unique") ? "That slug or route is already in use" : message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ collection: string }> }) {
  const { collection } = await context.params;
  const { config, response } = await access(collection, "PUT");
  if (response || !config) return response;
  try {
    const body = await request.json() as UnknownRecord;
    const id = String(body.id || "");
    if (!id) return Response.json({ error: "Record ID is required" }, { status: 400 });
    const clean = cleanInput(body, config.fields, false, config.table);
    const columns = getTableColumns(config.table);
    const [record] = await db.update(config.table).set(clean).where(eq(columns.id, id)).returning();
    if (!record) return Response.json({ error: "Record not found" }, { status: 404 });
    return Response.json({ record, message: `${config.singular} updated` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update record";
    return Response.json({ error: message.includes("unique") ? "That slug or route is already in use" : message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ collection: string }> }) {
  const { collection } = await context.params;
  const { config, response } = await access(collection, "DELETE");
  if (response || !config) return response;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ error: "Record ID is required" }, { status: 400 });
  try {
    const columns = getTableColumns(config.table);
    const [deleted] = await db.delete(config.table).where(eq(columns.id, id)).returning();
    if (!deleted) return Response.json({ error: "Record not found" }, { status: 404 });
    return Response.json({ message: `${config.singular} deleted` });
  } catch {
    return Response.json({ error: "This record is in use and cannot be deleted" }, { status: 409 });
  }
}
