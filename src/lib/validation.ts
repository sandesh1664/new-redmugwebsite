import { z } from "zod";

const plainText = (min: number, max: number) => z.string().trim().min(min).max(max);

export const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(8).max(200),
});

export const contactSchema = z.object({
  name: plainText(2, 180),
  email: z.email().max(255),
  phone: z.string().trim().max(80).optional().default(""),
  company: z.string().trim().max(200).optional().default(""),
  serviceId: z.uuid().optional().or(z.literal("")),
  serviceName: z.string().trim().max(180).optional().default(""),
  budget: z.string().trim().max(100).optional().default(""),
  message: plainText(10, 5000),
  website: z.string().max(0).optional(),
});

export const applicationSchema = z.object({
  careerId: z.uuid(),
  applicantName: plainText(2, 180),
  email: z.email().max(255),
  phone: plainText(5, 80),
  resumeUrl: z.url().max(2000),
  coverLetter: z.string().trim().max(5000).optional().default(""),
  website: z.string().max(0).optional(),
});

export const settingsSchema = z.object({
  companyName: plainText(2, 200),
  establishedYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  logoUrl: z.string().trim().max(2000).optional().nullable(),
  faviconUrl: z.string().trim().max(2000).optional().nullable(),
  phone: plainText(3, 80),
  phoneSecondary: z.string().trim().max(80).optional().default(""),
  phoneMobile: z.string().trim().max(80).optional().default(""),
  email: z.union([z.email().max(255), z.literal("")]),
  address: plainText(5, 1000),
  city: plainText(2, 100),
  country: plainText(2, 100),
  googleRating: z.coerce.number().min(0).max(5),
  googleReviewCount: z.coerce.number().int().min(0),
  businessHours: z.string().trim().max(1000).optional().default(""),
  websiteUrl: z.url().max(2000),
  socialLinks: z.record(z.string(), z.string().max(2000)),
  footerContent: plainText(10, 2000),
  defaultCtaTitle: plainText(2, 200),
  defaultCtaText: plainText(5, 2000),
  heroTitle: plainText(5, 300),
  heroSubtitle: plainText(10, 2000),
});

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function zodErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message || "Please check the submitted information.";
}
