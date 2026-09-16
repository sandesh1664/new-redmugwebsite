"use client";

import { LoaderCircle, Send, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";

type Service = { id: string; name: string };
export function ContactForm({ services }: { services: Service[] }) {
  const [state, setState] = useState<{ loading: boolean; error: string; success: string }>({ loading: false, error: "", success: "" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState({ loading: true, error: "", success: "" });
    const form = event.currentTarget; const data = Object.fromEntries(new FormData(form));
    const selected = services.find((service) => service.id === data.serviceId); data.serviceName = selected?.name || "";
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send your message");
      form.reset(); setState({ loading: false, error: "", success: `Thank you. Your inquiry has been saved. Reference ${result.reference}.` });
    } catch (error) { setState({ loading: false, error: error instanceof Error ? error.message : "Could not send your message", success: "" }); }
  }
  return <form className="public-form" onSubmit={submit} noValidate>
    <div className="form-grid">
      <div className="field"><label htmlFor="name">Name *</label><input className="input" id="name" name="name" autoComplete="name" required minLength={2} /></div>
      <div className="field"><label htmlFor="email">Work email *</label><input className="input" id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="field"><label htmlFor="phone">Phone</label><input className="input" id="phone" name="phone" type="tel" autoComplete="tel" /></div>
      <div className="field"><label htmlFor="company">Company</label><input className="input" id="company" name="company" autoComplete="organization" /></div>
      <div className="field"><label htmlFor="serviceId">Area of interest</label><select className="select" id="serviceId" name="serviceId"><option value="">Select a service</option>{services.map((service) => <option value={service.id} key={service.id}>{service.name}</option>)}</select></div>
      <div className="field"><label htmlFor="budget">Indicative budget</label><select className="select" id="budget" name="budget"><option value="">Prefer to discuss</option><option>AED 10k–30k</option><option>AED 30k–75k</option><option>AED 75k–150k</option><option>AED 150k+</option></select></div>
      <div className="field full"><label htmlFor="message">What do you need to solve? *</label><textarea className="textarea" id="message" name="message" required minLength={10} placeholder="Describe the context, current system and desired outcome." /></div>
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    </div>
    {state.error && <div className="form-message error" role="alert">{state.error}</div>}{state.success && <div className="form-message success" role="status"><CheckCircle2 size={15} /> {state.success}</div>}
    <button className="button button-primary" disabled={state.loading}>{state.loading ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={15} />}{state.loading ? "Saving inquiry…" : "Send inquiry"}</button>
  </form>;
}
