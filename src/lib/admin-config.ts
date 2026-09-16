import type { PgTable } from "drizzle-orm/pg-core";
import {
  blogCategories,
  blogPosts,
  careers,
  contactMessages,
  galleryItems,
  industries,
  jobApplications,
  pages,
  projects,
  seoSettings,
  services,
  solutions,
  teamMembers,
  testimonials,
} from "@/db/schema";

export type FieldType = "text" | "textarea" | "number" | "select" | "boolean" | "date" | "url" | "list" | "jsonFaq";
export type AdminField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Array<string | { label: string; value: string }>;
  placeholder?: string;
  help?: string;
  table?: boolean;
};
export type CollectionConfig = {
  label: string;
  singular: string;
  description: string;
  table: PgTable;
  fields: AdminField[];
  titleKey: string;
  searchKeys: string[];
  statusKey?: string;
  editorAllowed: boolean;
  canCreate?: boolean;
};

const status = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const baseSeo: AdminField[] = [
  { key: "seoTitle", label: "SEO title", type: "text", placeholder: "Search result title" },
  { key: "seoDescription", label: "SEO description", type: "textarea", placeholder: "Concise search description" },
];
const list = (key: string, label: string, help?: string): AdminField => ({ key, label, type: "list", help: help || "One item per line" });

export const collections: Record<string, CollectionConfig> = {
  pages: {
    label: "Pages", singular: "Page", description: "Manage foundational website pages and hero messaging.", table: pages, titleKey: "title", searchKeys: ["title", "slug", "heroTitle"], editorAllowed: true,
    fields: [
      { key: "title", label: "Page title", type: "text", required: true, table: true }, { key: "slug", label: "Slug", type: "text", required: true, table: true },
      { key: "eyebrow", label: "Eyebrow", type: "text" }, { key: "heroTitle", label: "Hero title", type: "text", required: true },
      { key: "heroDescription", label: "Hero description", type: "textarea" }, { key: "content", label: "Page content", type: "textarea", required: true, help: "Use blank lines to separate sections." },
      ...baseSeo, { key: "status", label: "Status", type: "select", options: status, required: true, table: true },
    ],
  },
  services: {
    label: "Services", singular: "Service", description: "Publish and order RedMug's core technology capabilities.", table: services, titleKey: "name", searchKeys: ["name", "slug", "shortDescription"], statusKey: "status", editorAllowed: true,
    fields: [
      { key: "name", label: "Service name", type: "text", required: true, table: true }, { key: "slug", label: "Slug", type: "text", required: true, table: true },
      { key: "shortDescription", label: "Short description", type: "textarea", required: true }, { key: "fullDescription", label: "Full description", type: "textarea", required: true },
      { key: "icon", label: "Icon key", type: "text", placeholder: "Cpu" }, { key: "heroImage", label: "Hero image URL", type: "url" },
      list("features", "Capabilities"), list("technologies", "Technologies"), list("problems", "Problems we solve"), list("process", "Process"), list("benefits", "Benefits"), list("gallery", "Gallery media URLs"),
      { key: "faq", label: "FAQ", type: "jsonFaq", help: "One per line: Question | Answer" }, ...baseSeo,
      { key: "displayOrder", label: "Display order", type: "number", table: true }, { key: "status", label: "Status", type: "select", options: status, required: true, table: true },
    ],
  },
  solutions: {
    label: "Solutions", singular: "Solution", description: "Describe multi-disciplinary outcomes across RedMug capabilities.", table: solutions, titleKey: "name", searchKeys: ["name", "slug", "summary"], statusKey: "status", editorAllowed: true,
    fields: [
      { key: "name", label: "Solution name", type: "text", required: true, table: true }, { key: "slug", label: "Slug", type: "text", required: true, table: true }, { key: "summary", label: "Summary", type: "textarea", required: true },
      { key: "description", label: "Description", type: "textarea", required: true }, { key: "icon", label: "Icon key", type: "text" }, list("capabilities", "Capabilities"), ...baseSeo,
      { key: "displayOrder", label: "Display order", type: "number" }, { key: "status", label: "Status", type: "select", options: status, required: true, table: true },
    ],
  },
  industries: {
    label: "Industries", singular: "Industry", description: "Shape relevant technology narratives for each operating context.", table: industries, titleKey: "name", searchKeys: ["name", "slug", "overview"], statusKey: "status", editorAllowed: true,
    fields: [
      { key: "name", label: "Industry name", type: "text", required: true, table: true }, { key: "slug", label: "Slug", type: "text", required: true, table: true }, { key: "overview", label: "Overview", type: "textarea", required: true },
      list("challenges", "Challenges"), list("solutions", "Solutions"), ...baseSeo, { key: "displayOrder", label: "Display order", type: "number" }, { key: "status", label: "Status", type: "select", options: status, required: true, table: true },
    ],
  },
  projects: {
    label: "Projects", singular: "Project", description: "Build case studies without publishing unverified customer claims.", table: projects, titleKey: "name", searchKeys: ["name", "slug", "category", "summary"], statusKey: "status", editorAllowed: true,
    fields: [
      { key: "name", label: "Project name", type: "text", required: true, table: true }, { key: "slug", label: "Slug", type: "text", required: true, table: true }, { key: "category", label: "Category", type: "text", required: true, table: true },
      { key: "industryId", label: "Industry", type: "select", options: [] }, { key: "client", label: "Client", type: "text", help: "Leave blank until approved for publication." }, { key: "location", label: "Location", type: "text" }, { key: "summary", label: "Summary", type: "textarea", required: true },
      { key: "challenge", label: "Challenge", type: "textarea", required: true }, { key: "solution", label: "Solution", type: "textarea", required: true }, list("technologies", "Technologies"), list("results", "Verified results", "One verified result per line. Do not enter unsubstantiated claims."), list("gallery", "Gallery media URLs"),
      { key: "featuredImage", label: "Featured image URL", type: "url" }, { key: "featured", label: "Featured project", type: "boolean" }, { key: "publishedAt", label: "Published date", type: "date" }, ...baseSeo,
      { key: "status", label: "Status", type: "select", options: status, required: true, table: true },
    ],
  },
  "blog-categories": {
    label: "Blog Categories", singular: "Blog category", description: "Organize editorial content into reusable topic groups.", table: blogCategories, titleKey: "name", searchKeys: ["name", "slug", "description"], editorAllowed: true,
    fields: [
      { key: "name", label: "Category name", type: "text", required: true, table: true }, { key: "slug", label: "Slug", type: "text", required: true, table: true }, { key: "description", label: "Description", type: "textarea" },
    ],
  },
  blog: {
    label: "Blog", singular: "Blog post", description: "Draft, review and publish technical insights.", table: blogPosts, titleKey: "title", searchKeys: ["title", "slug", "excerpt"], statusKey: "status", editorAllowed: true,
    fields: [
      { key: "title", label: "Title", type: "text", required: true, table: true }, { key: "slug", label: "Slug", type: "text", required: true, table: true }, { key: "excerpt", label: "Excerpt", type: "textarea", required: true },
      { key: "content", label: "Article content", type: "textarea", required: true, help: "Markdown-style headings (##) are supported on the public page." }, { key: "featuredImage", label: "Featured image URL", type: "url" }, { key: "categoryId", label: "Category", type: "select", options: [] }, { key: "authorId", label: "Author", type: "select", options: [] }, list("tags", "Tags"),
      { key: "readingTime", label: "Reading time (minutes)", type: "number" }, { key: "publishedAt", label: "Publish date", type: "date" }, ...baseSeo,
      { key: "status", label: "Status", type: "select", options: status, required: true, table: true },
    ],
  },
  careers: {
    label: "Careers", singular: "Career", description: "Create openings and control whether applications are accepted.", table: careers, titleKey: "title", searchKeys: ["title", "department", "location"], statusKey: "status", editorAllowed: true,
    fields: [
      { key: "title", label: "Job title", type: "text", required: true, table: true }, { key: "slug", label: "Slug", type: "text", required: true }, { key: "department", label: "Department", type: "text", required: true, table: true },
      { key: "location", label: "Location", type: "text", required: true }, { key: "employmentType", label: "Employment type", type: "text", required: true }, { key: "experience", label: "Experience", type: "text" }, { key: "description", label: "Description", type: "textarea", required: true },
      list("responsibilities", "Responsibilities"), list("requirements", "Requirements"), list("benefits", "Benefits"), { key: "deadline", label: "Deadline", type: "date" }, ...baseSeo,
      { key: "status", label: "Status", type: "select", options: ["DRAFT", "OPEN", "CLOSED"], required: true, table: true },
    ],
  },
  team: {
    label: "Team", singular: "Team member", description: "Only publish verified RedMug team profiles.", table: teamMembers, titleKey: "name", searchKeys: ["name", "role", "bio"], statusKey: "status", editorAllowed: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true, table: true }, { key: "role", label: "Role", type: "text", required: true, table: true }, { key: "bio", label: "Bio", type: "textarea", required: true },
      { key: "photo", label: "Photo URL", type: "url" }, list("skills", "Skills"), { key: "linkedin", label: "LinkedIn URL", type: "url" }, { key: "email", label: "Email", type: "text" }, { key: "displayOrder", label: "Display order", type: "number" },
      { key: "status", label: "Status", type: "select", options: status, required: true, table: true },
    ],
  },
  testimonials: {
    label: "Testimonials", singular: "Testimonial", description: "Keep customer statements unpublished until identity and wording are verified.", table: testimonials, titleKey: "name", searchKeys: ["name", "company", "testimonial"], statusKey: "status", editorAllowed: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true, table: true }, { key: "company", label: "Company", type: "text", required: true, table: true }, { key: "position", label: "Position", type: "text" }, { key: "testimonial", label: "Testimonial", type: "textarea", required: true },
      { key: "photo", label: "Photo URL", type: "url" }, { key: "rating", label: "Rating", type: "number" }, { key: "featured", label: "Featured", type: "boolean" }, { key: "status", label: "Status", type: "select", options: status, required: true, table: true },
    ],
  },
  gallery: {
    label: "Gallery", singular: "Gallery item", description: "Curate approved office, team, installation and event photography.", table: galleryItems, titleKey: "title", searchKeys: ["title", "category", "caption"], statusKey: "status", editorAllowed: true,
    fields: [
      { key: "title", label: "Title", type: "text", required: true, table: true }, { key: "imageUrl", label: "Image URL", type: "url", required: true }, { key: "altText", label: "Alt text", type: "text", required: true }, { key: "caption", label: "Caption", type: "textarea" },
      { key: "category", label: "Category", type: "select", options: ["Office", "Team", "Projects", "Infrastructure", "CCTV", "Networking", "Hardware", "Events", "General"], table: true }, { key: "featured", label: "Featured", type: "boolean" }, { key: "displayOrder", label: "Display order", type: "number" }, { key: "status", label: "Status", type: "select", options: status, required: true, table: true },
    ],
  },
  contacts: {
    label: "Contact Messages", singular: "Contact message", description: "Qualify inquiries, track progress and keep internal context in one place.", table: contactMessages, titleKey: "name", searchKeys: ["name", "email", "company", "message"], statusKey: "status", editorAllowed: false, canCreate: false,
    fields: [
      { key: "name", label: "Name", type: "text", table: true }, { key: "email", label: "Email", type: "text", table: true }, { key: "phone", label: "Phone", type: "text" }, { key: "company", label: "Company", type: "text" }, { key: "serviceName", label: "Service", type: "text" },
      { key: "budget", label: "Budget", type: "text" }, { key: "message", label: "Message", type: "textarea" }, { key: "internalNotes", label: "Internal notes", type: "textarea" }, { key: "status", label: "Lead status", type: "select", options: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "CONVERTED", "CLOSED"], table: true },
    ],
  },
  applications: {
    label: "Job Applications", singular: "Application", description: "Review applications and move candidates through a clear workflow.", table: jobApplications, titleKey: "applicantName", searchKeys: ["applicantName", "email", "phone"], statusKey: "status", editorAllowed: false, canCreate: false,
    fields: [
      { key: "applicantName", label: "Applicant", type: "text", table: true }, { key: "email", label: "Email", type: "text", table: true }, { key: "careerId", label: "Applied position", type: "select", options: [], table: true }, { key: "phone", label: "Phone", type: "text" }, { key: "resumeUrl", label: "Resume URL", type: "url" }, { key: "coverLetter", label: "Cover letter", type: "textarea" }, { key: "internalNotes", label: "Internal notes", type: "textarea" },
      { key: "status", label: "Application status", type: "select", options: ["NEW", "REVIEWING", "SHORTLISTED", "INTERVIEW", "REJECTED", "HIRED"], table: true },
    ],
  },
  seo: {
    label: "SEO", singular: "SEO rule", description: "Control metadata, canonical URLs, Open Graph imagery and indexing per route.", table: seoSettings, titleKey: "route", searchKeys: ["route", "title", "description"], editorAllowed: false,
    fields: [
      { key: "route", label: "Route", type: "text", required: true, table: true }, { key: "title", label: "SEO title", type: "text", required: true, table: true }, { key: "description", label: "Meta description", type: "textarea", required: true }, { key: "canonicalUrl", label: "Canonical URL", type: "url" }, { key: "openGraphImage", label: "Open Graph image", type: "url" }, { key: "robots", label: "Robots", type: "select", options: ["index,follow", "noindex,follow", "noindex,nofollow"], table: true },
    ],
  },
};

export function getCollection(key: string) {
  return collections[key] ?? null;
}
