"use client";

import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { FormEvent, useState } from "react";

type Service = { id: string; name: string };
type Errors = Partial<Record<"name" | "email" | "message", string>>;

function validate(data: Record<string, FormDataEntryValue>): Errors {
  const errors: Errors = {};
  if (String(data.name || "").trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email || ""))) errors.email = "Please enter a valid email address.";
  if (String(data.message || "").trim().length < 10) errors.message = "Tell us a little more (at least 10 characters).";
  return errors;
}

export function ContactForm({ services, preselectedServiceId, context = "" }: { services: Service[]; preselectedServiceId?: string; context?: string }) {
  const [state, setState] = useState<{ loading: boolean; error: string; success: string }>({ loading: false, error: "", success: "" });
  const [errors, setErrors] = useState<Errors>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const fieldErrors = validate(data);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) { (form.querySelector("[aria-invalid='true']") as HTMLElement | null)?.focus(); return; }
    setState({ loading: true, error: "", success: "" });
    const selected = services.find((service) => service.id === data.serviceId);
    data.serviceName = selected?.name || "";
    if (context && !String(data.message).includes(context)) data.message = `${context}\n\n${data.message}`;
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send your message");
      form.reset();
      setState({ loading: false, error: "", success: `Thank you. Your inquiry has been received. Reference ${result.reference}.` });
    } catch (error) {
      setState({ loading: false, error: error instanceof Error ? error.message : "Could not send your message", success: "" });
    }
  }

  return (
    <form className="public-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field"><label htmlFor="name">Name *</label><input className="input" id="name" name="name" autoComplete="name" required minLength={2} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />{errors.name && <span className="field-error" id="name-error">{errors.name}</span>}</div>
        <div className="field"><label htmlFor="email">Work email *</label><input className="input" id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />{errors.email && <span className="field-error" id="email-error">{errors.email}</span>}</div>
        <div className="field"><label htmlFor="phone">Phone</label><input className="input" id="phone" name="phone" type="tel" autoComplete="tel" /></div>
        <div className="field"><label htmlFor="company">Company</label><input className="input" id="company" name="company" autoComplete="organization" /></div>
        <div className="field"><label htmlFor="serviceId">Area of interest</label><select className="select" id="serviceId" name="serviceId" defaultValue={preselectedServiceId || ""}><option value="">Select a service</option>{services.map((service) => <option value={service.id} key={service.id}>{service.name}</option>)}</select></div>
        <div className="field"><label htmlFor="budget">Indicative budget</label><select className="select" id="budget" name="budget" defaultValue=""><option value="">Prefer to discuss</option><option>AED 10k–30k</option><option>AED 30k–75k</option><option>AED 75k–150k</option><option>AED 150k+</option></select></div>
        <div className="field full"><label htmlFor="message">What do you need to solve? *</label><textarea className="textarea" id="message" name="message" required minLength={10} placeholder="Describe the context, current system and desired outcome." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-error" : undefined} />{errors.message && <span className="field-error" id="message-error">{errors.message}</span>}</div>
        <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      </div>
      {state.error && <div className="form-message error" role="alert">{state.error}</div>}
      {state.success && <div className="form-message success" role="status"><CheckCircle2 size={16} /> {state.success}</div>}
      <button className="button button-primary" disabled={state.loading} style={{ justifySelf: "start" }}>
        {state.loading ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={15} />}{state.loading ? "Sending…" : "Send inquiry"}
      </button>
      <small style={{ color: "var(--muted-2)", fontSize: 12 }}>Your details are stored securely and used only to respond to this inquiry.</small>
    </form>
  );
}
