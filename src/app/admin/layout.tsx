import type { ReactNode } from "react";
import { count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site";
export const dynamic="force-dynamic";
export default async function AdminLayout({children}:{children:ReactNode}){const user=await getCurrentUser();if(!user)redirect("/login");const[newRows,settings]=await Promise.all([db.select({value:count()}).from(contactMessages).where(eq(contactMessages.status,"NEW")),getSiteSettings()]);return <AdminShell user={user} newLeads={newRows[0].value} logoUrl={settings?.logoUrl}>{children}</AdminShell>}
