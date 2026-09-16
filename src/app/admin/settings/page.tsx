import { redirect } from "next/navigation";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { SettingsManager } from "@/components/admin/settings-manager";
import { getCurrentUser } from "@/lib/auth";
export const dynamic="force-dynamic";export default async function SettingsPage(){const user=await getCurrentUser();if(!user||user.role==="EDITOR")redirect("/admin");const[settings]=await db.select().from(siteSettings).limit(1);if(!settings)return <div className="admin-empty"><h3>Site settings are not initialized</h3><p>Run the database seed to create the primary settings record.</p></div>;return <SettingsManager settings={settings}/>}
