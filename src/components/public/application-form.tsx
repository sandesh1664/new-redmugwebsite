"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";

export function ApplicationForm({ careerId }: { careerId: string }) {
  const [state, setState] = useState({ loading: false, error: "", success: "" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState({ loading: true, error: "", success: "" });
    const form = event.currentTarget; const data = { ...Object.fromEntries(new FormData(form)), careerId };
    try {
      const response = await fetch("/api/applications", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Application could not be saved");
      form.reset(); setState({ loading: false, error: "", success: `Application saved. Reference ${result.reference}.` });
    } catch (error) { setState({ loading: false, error: error instanceof Error ? error.message : "Application could not be saved", success: "" }); }
  }
  return <form className="public-form" onSubmit={submit} noValidate>
    <div className="field"><label htmlFor="applicantName">Full name *</label><input className="input" id="applicantName" name="applicantName" required /></div>
    <div className="form-grid"><div className="field"><label htmlFor="app-email">Email *</label><input className="input" id="app-email" name="email" type="email" required /></div><div className="field"><label htmlFor="app-phone">Phone *</label><input className="input" id="app-phone" name="phone" type="tel" required /></div></div>
    <div className="field"><label htmlFor="resumeUrl">Resume URL *</label><input className="input" id="resumeUrl" name="resumeUrl" type="url" required placeholder="Secure Google Drive, OneDrive or portfolio URL" /><small>Use a shareable HTTPS link. Uploaded documents remain under your control.</small></div>
    <div className="field"><label htmlFor="coverLetter">Cover letter</label><textarea className="textarea" id="coverLetter" name="coverLetter" /></div><input className="honeypot" name="website" tabIndex={-1} autoComplete="off" />
    {state.error && <div className="form-message error" role="alert">{state.error}</div>}{state.success && <div className="form-message success"><CheckCircle2 size={15} /> {state.success}</div>}
    <button className="button button-primary" disabled={state.loading}>{state.loading && <LoaderCircle className="animate-spin" size={16} />}{state.loading ? "Saving application…" : "Submit application"}</button>
  </form>;
}
