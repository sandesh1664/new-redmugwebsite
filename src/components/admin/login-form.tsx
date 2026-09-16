"use client";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
export function LoginForm({ redirectTo = "/admin" }: { redirectTo?: string }) {
  const router = useRouter();
  const [state, setState] = useState({ loading: false, error: "" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ loading: true, error: "" });
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login failed");
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      setState({ loading: false, error: error instanceof Error ? error.message : "Login failed" });
    }
  }
  return <form className="public-form" onSubmit={submit}>
    <div className="field"><label htmlFor="email">Email address</label><input className="input" id="email" name="email" type="email" autoComplete="username" required/></div>
    <div className="field"><label htmlFor="password">Password</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" minLength={8} required/></div>
    {state.error && <div className="form-message error" role="alert">{state.error}</div>}
    <button className="button button-primary" disabled={state.loading}>{state.loading?<LoaderCircle className="animate-spin" size={16}/>:<LockKeyhole size={16}/>} {state.loading?"Verifying…":"Sign in securely"}</button>
  </form>;
}
