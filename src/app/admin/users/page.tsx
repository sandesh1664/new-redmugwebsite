import { redirect } from "next/navigation";
import { UsersManager } from "@/components/admin/users-manager";
import { getCurrentUser } from "@/lib/auth";
export const dynamic="force-dynamic";export default async function UsersPage(){const user=await getCurrentUser();if(!user||user.role!=="SUPER_ADMIN")redirect("/admin");return <UsersManager/>}
