import { asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { blogCategories, careers, industries, users } from "@/db/schema";
import { CollectionManager } from "@/components/admin/collection-manager";
import { getCollection, type AdminField } from "@/lib/admin-config";
import { getCurrentUser } from "@/lib/auth";

type Props = { params: Promise<{ collection: string }> };
export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: Props) {
  const { collection } = await params;
  const config = getCollection(collection);
  if (!config) notFound();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!config.editorAllowed && user.role === "EDITOR") redirect("/admin");

  let fields: AdminField[] = config.fields.map((field) => ({ ...field, options: field.options ? [...field.options] : undefined }));
  if (collection === "projects") {
    const rows = await db.select({ id: industries.id, name: industries.name }).from(industries).orderBy(asc(industries.name));
    fields = fields.map((field) => field.key === "industryId" ? { ...field, options: [{ label: "No industry selected", value: "" }, ...rows.map((row) => ({ label: row.name, value: row.id }))] } : field);
  }
  if (collection === "blog") {
    const [categories, authors] = await Promise.all([
      db.select({ id: blogCategories.id, name: blogCategories.name }).from(blogCategories).orderBy(asc(blogCategories.name)),
      db.select({ id: users.id, name: users.name }).from(users).orderBy(asc(users.name)),
    ]);
    fields = fields.map((field) => {
      if (field.key === "categoryId") return { ...field, options: [{ label: "No category", value: "" }, ...categories.map((row) => ({ label: row.name, value: row.id }))] };
      if (field.key === "authorId") return { ...field, options: authors.map((row) => ({ label: row.name, value: row.id })) };
      return field;
    });
  }
  if (collection === "applications") {
    const rows = await db.select({ id: careers.id, title: careers.title }).from(careers).orderBy(asc(careers.title));
    fields = fields.map((field) => field.key === "careerId" ? { ...field, required: true, options: rows.map((row) => ({ label: row.title, value: row.id })) } : field);
  }

  return <CollectionManager collection={collection} label={config.label} singular={config.singular} description={config.description} fields={fields} titleKey={config.titleKey} searchKeys={config.searchKeys} statusKey={config.statusKey} canCreate={config.canCreate !== false} canDelete={user.role !== "EDITOR"} />;
}
