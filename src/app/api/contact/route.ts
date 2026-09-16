import { NextRequest } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { contactSchema, zodErrorMessage } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  // Generous by design: the honeypot and server validation carry spam protection,
  // and a shared proxy address must not block a genuine inquiry.
  if (!checkRateLimit(`contact:${ip}`, 30)) return Response.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  const { website, serviceId, ...data } = parsed.data;
  if (website) return Response.json({ success: true });
  const [lead] = await db.insert(contactMessages).values({
    ...data,
    serviceId: serviceId || null,
    source: "Website contact form",
    status: "NEW",
    isDemo: false,
  }).returning({ id: contactMessages.id });

  const webhook = process.env.LEAD_NOTIFICATION_WEBHOOK;
  if (webhook) fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "new_contact", leadId: lead.id, name: data.name, email: data.email }) }).catch(() => undefined);
  return Response.json({ success: true, reference: lead.id.slice(0, 8).toUpperCase() }, { status: 201 });
}
