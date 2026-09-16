import { redirect } from "next/navigation";
import { MediaManager } from "@/components/admin/media-manager";
import { getCurrentUser } from "@/lib/auth";
export const dynamic="force-dynamic";export default async function MediaPage(){const user=await getCurrentUser();if(!user||user.role==="EDITOR")redirect("/admin");return <MediaManager/>}
