import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand/logo";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site";

export const metadata = { title: "Administrator sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Only same-origin relative paths may be used as a post-login destination. */
function safeRedirect(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value;
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeRedirect(next));
  const settings = await getSiteSettings();
  return <main className="login-page">
    <section className="login-visual"><BrandMark logoUrl={settings?.logoUrl} size={46}/><div><h1>Operate the entire RedMug technology platform.</h1><p>Securely manage content, leads, media, people, settings and site visibility from one connected system.</p></div><span className="eyebrow">Protected administrative system</span></section>
    <section className="login-panel"><div className="login-card"><span className="eyebrow">Authorized access</span><h2>Welcome back.</h2><p>Use your RedMug administrator account to continue.</p><LoginForm redirectTo={safeRedirect(next)}/><div className="security-note">Sessions are encrypted in transit, HTTP-only and invalidated on logout.</div></div></section>
  </main>;
}
