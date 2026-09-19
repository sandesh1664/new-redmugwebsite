"use client";

import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { FormEvent, useState } from "react";

type Errors = Partial<Record<"applicantName" | "email" | "phone" | "resumeUrl", string>>;

function validate(data: Record<string, FormDataEntryValue>): Errors {
  const errors: Errors = {};
  if (String(data.applicantName || "").trim().length < 2) errors.applicantName = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email || ""))) errors.email = "Please enter a valid email address.";
  if (String(data.phone || "").trim().length < 5) errors.phone = "Please enter a phone number.";
  try { const url = new URL(String(data.resumeUrl || "")); if (url.protocol !== "https:") throw new Error(); } catch { errors.resumeUrl = "Please provide a secure https:// link to your resume."; }
  return errors;
}

export function ApplicationForm({ careerId }: { careerId: string }) {
  const [state, setState] = useState({ loading: false, error: "", success: "" });
  const [errors, setErrors] = useState<Errors>({});
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Object.fromEntries(new FormData(form));
    const fieldErrors = validate(raw);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;
    setState({ loading: true, error: "", success: "" });
    try {
      const response = await fetch("/api/applications", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...raw, careerId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Application could not be saved");
      form.reset();
      setState({ loading: false, error: "", success: `Application received. Reference ${result.reference}.` });
    } catch (error) {
      setState({ loading: false, error: error instanceof Error ? error.message : "Application could not be saved", success: "" });
    }
  }
  const err = (key: keyof Errors) => errors[key] ? <span className="field-error" id={`${key}-error`}>{errors[key]}</span> : null;
  return (
    <form className="public-form" onSubmit={submit} noValidate>
      <div className="field"><label htmlFor="applicantName">Full name *</label><input className="input" id="applicantName" name="applicantName" autoComplete="name" required aria-invalid={Boolean(errors.applicantName)} />{err("applicantName")}</div>
      <div className="form-grid">
        <div className="field"><label htmlFor="app-email">Email *</label><input className="input" id="app-email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} />{err("email")}</div>
        <div className="field"><label htmlFor="app-phone">Phone *</label><input className="input" id="app-phone" name="phone" type="tel" autoComplete="tel" required aria-invalid={Boolean(errors.phone)} />{err("phone")}</div>
      </div>
      <div className="field"><label htmlFor="resumeUrl">Resume URL *</label><input className="input" id="resumeUrl" name="resumeUrl" type="url" required placeholder="https:// Google Drive, OneDrive or portfolio link" aria-invalid={Boolean(errors.resumeUrl)} />{err("resumeUrl")}<small>Use a shareable HTTPS link. Uploaded documents remain under your control.</small></div>
      <div className="field"><label htmlFor="coverLetter">Cover letter</label><textarea className="textarea" id="coverLetter" name="coverLetter" /></div>
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {state.error && <div className="form-message error" role="alert">{state.error}</div>}
      {state.success && <div className="form-message success" role="status"><CheckCircle2 size={16} /> {state.success}</div>}
      <button className="button button-primary" disabled={state.loading} style={{ justifySelf: "start" }}>{state.loading ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={15} />}{state.loading ? "Submitting…" : "Submit application"}</button>
    </form>
  );
}
