import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["SUPER_ADMIN", "ADMIN", "EDITOR"]);
export const contentStatusEnum = pgEnum("content_status", ["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const leadStatusEnum = pgEnum("lead_status", ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "CONVERTED", "CLOSED"]);
export const applicationStatusEnum = pgEnum("application_status", ["NEW", "REVIEWING", "SHORTLISTED", "INTERVIEW", "REJECTED", "HIRED"]);
export const careerStatusEnum = pgEnum("career_status", ["DRAFT", "OPEN", "CLOSED"]);
export const mediaTypeEnum = pgEnum("media_type", ["IMAGE", "DOCUMENT", "VIDEO", "OTHER"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("EDITOR").notNull(),
  avatarUrl: text("avatar_url"),
  active: boolean("active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("users_email_idx").on(table.email)]);

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("sessions_token_idx").on(table.tokenHash), index("sessions_user_idx").on(table.userId)]);

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 300 }).default("").notNull(),
  caption: text("caption"),
  type: mediaTypeEnum("type").default("IMAGE").notNull(),
  category: varchar("category", { length: 100 }).default("General").notNull(),
  mimeType: varchar("mime_type", { length: 120 }),
  size: integer("size"),
  checksum: varchar("checksum", { length: 64 }),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("media_checksum_idx").on(table.checksum), index("media_category_idx").on(table.category)]);

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull(),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull(),
  icon: varchar("icon", { length: 80 }).default("Cpu").notNull(),
  heroImage: text("hero_image"),
  features: jsonb("features").$type<string[]>().default([]).notNull(),
  technologies: jsonb("technologies").$type<string[]>().default([]).notNull(),
  faq: jsonb("faq").$type<Array<{ question: string; answer: string }>>().default([]).notNull(),
  gallery: jsonb("gallery").$type<string[]>().default([]).notNull(),
  problems: jsonb("problems").$type<string[]>().default([]).notNull(),
  process: jsonb("process").$type<string[]>().default([]).notNull(),
  benefits: jsonb("benefits").$type<string[]>().default([]).notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  status: contentStatusEnum("status").default("DRAFT").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("services_slug_idx").on(table.slug), index("services_status_order_idx").on(table.status, table.displayOrder)]);

export const solutions = pgTable("solutions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 80 }).default("Workflow").notNull(),
  capabilities: jsonb("capabilities").$type<string[]>().default([]).notNull(),
  relatedServiceIds: jsonb("related_service_ids").$type<string[]>().default([]).notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  status: contentStatusEnum("status").default("DRAFT").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("solutions_slug_idx").on(table.slug), index("solutions_status_idx").on(table.status)]);

export const industries = pgTable("industries", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull(),
  overview: text("overview").notNull(),
  challenges: jsonb("challenges").$type<string[]>().default([]).notNull(),
  solutions: jsonb("solutions").$type<string[]>().default([]).notNull(),
  relatedServiceIds: jsonb("related_service_ids").$type<string[]>().default([]).notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  status: contentStatusEnum("status").default("DRAFT").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("industries_slug_idx").on(table.slug), index("industries_status_idx").on(table.status)]);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  industryId: uuid("industry_id").references(() => industries.id, { onDelete: "set null" }),
  client: varchar("client", { length: 200 }),
  location: varchar("location", { length: 180 }),
  summary: text("summary").notNull(),
  challenge: text("challenge").notNull(),
  solution: text("solution").notNull(),
  technologies: jsonb("technologies").$type<string[]>().default([]).notNull(),
  results: jsonb("results").$type<string[]>().default([]).notNull(),
  featuredImage: text("featured_image"),
  gallery: jsonb("gallery").$type<string[]>().default([]).notNull(),
  featured: boolean("featured").default(false).notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  status: contentStatusEnum("status").default("DRAFT").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("projects_slug_idx").on(table.slug), index("projects_status_idx").on(table.status), index("projects_industry_idx").on(table.industryId)]);

export const blogCategories = pgTable("blog_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
  description: text("description"),
  ...timestamps,
}, (table) => [uniqueIndex("blog_categories_slug_idx").on(table.slug)]);

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 240 }).notNull(),
  slug: varchar("slug", { length: 240 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  categoryId: uuid("category_id").references(() => blogCategories.id, { onDelete: "set null" }),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  readingTime: integer("reading_time").default(5).notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  status: contentStatusEnum("status").default("DRAFT").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("blog_posts_slug_idx").on(table.slug), index("blog_posts_status_date_idx").on(table.status, table.publishedAt), index("blog_posts_category_idx").on(table.categoryId)]);

export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  role: varchar("role", { length: 180 }).notNull(),
  bio: text("bio").notNull(),
  photo: text("photo"),
  skills: jsonb("skills").$type<string[]>().default([]).notNull(),
  linkedin: text("linkedin"),
  email: varchar("email", { length: 255 }),
  displayOrder: integer("display_order").default(0).notNull(),
  status: contentStatusEnum("status").default("DRAFT").notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [index("team_status_order_idx").on(table.status, table.displayOrder)]);

export const careers = pgTable("careers", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull(),
  department: varchar("department", { length: 160 }).notNull(),
  location: varchar("location", { length: 180 }).notNull(),
  employmentType: varchar("employment_type", { length: 100 }).notNull(),
  experience: varchar("experience", { length: 120 }),
  description: text("description").notNull(),
  responsibilities: jsonb("responsibilities").$type<string[]>().default([]).notNull(),
  requirements: jsonb("requirements").$type<string[]>().default([]).notNull(),
  benefits: jsonb("benefits").$type<string[]>().default([]).notNull(),
  deadline: date("deadline"),
  status: careerStatusEnum("status").default("DRAFT").notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("careers_slug_idx").on(table.slug), index("careers_status_idx").on(table.status)]);

export const jobApplications = pgTable("job_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  careerId: uuid("career_id").notNull().references(() => careers.id, { onDelete: "restrict" }),
  applicantName: varchar("applicant_name", { length: 180 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 80 }).notNull(),
  coverLetter: text("cover_letter"),
  resumeUrl: text("resume_url").notNull(),
  status: applicationStatusEnum("status").default("NEW").notNull(),
  internalNotes: text("internal_notes"),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [index("applications_career_idx").on(table.careerId), index("applications_status_idx").on(table.status), index("applications_created_idx").on(table.createdAt)]);

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 80 }),
  company: varchar("company", { length: 200 }),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
  serviceName: varchar("service_name", { length: 180 }),
  budget: varchar("budget", { length: 100 }),
  message: text("message").notNull(),
  status: leadStatusEnum("status").default("NEW").notNull(),
  internalNotes: text("internal_notes"),
  source: varchar("source", { length: 100 }).default("Website").notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [index("contacts_status_idx").on(table.status), index("contacts_created_idx").on(table.createdAt), index("contacts_email_idx").on(table.email)]);

export const testimonials = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  company: varchar("company", { length: 180 }).notNull(),
  position: varchar("position", { length: 180 }),
  testimonial: text("testimonial").notNull(),
  photo: text("photo"),
  rating: integer("rating").default(5).notNull(),
  featured: boolean("featured").default(false).notNull(),
  status: contentStatusEnum("status").default("DRAFT").notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [index("testimonials_status_idx").on(table.status)]);

export const galleryItems = pgTable("gallery_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  imageUrl: text("image_url").notNull(),
  altText: varchar("alt_text", { length: 300 }).notNull(),
  caption: text("caption"),
  category: varchar("category", { length: 120 }).default("General").notNull(),
  featured: boolean("featured").default(false).notNull(),
  status: contentStatusEnum("status").default("DRAFT").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [index("gallery_status_category_idx").on(table.status, table.category)]);

export const pages = pgTable("pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull(),
  eyebrow: varchar("eyebrow", { length: 120 }),
  heroTitle: varchar("hero_title", { length: 300 }).notNull(),
  heroDescription: text("hero_description"),
  content: text("content").notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  status: contentStatusEnum("status").default("DRAFT").notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("pages_slug_idx").on(table.slug), index("pages_status_idx").on(table.status)]);

export const siteSettings = pgTable("site_settings", {
  id: varchar("id", { length: 40 }).primaryKey().default("main"),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  establishedYear: integer("established_year").notNull(),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  phone: varchar("phone", { length: 80 }).notNull(),
  phoneSecondary: varchar("phone_secondary", { length: 80 }),
  phoneMobile: varchar("phone_mobile", { length: 80 }),
  email: varchar("email", { length: 255 }),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).default("Dubai").notNull(),
  country: varchar("country", { length: 100 }).default("United Arab Emirates").notNull(),
  googleRating: numeric("google_rating", { precision: 2, scale: 1 }).notNull(),
  googleReviewCount: integer("google_review_count").notNull(),
  businessHours: text("business_hours"),
  websiteUrl: text("website_url").notNull(),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}).notNull(),
  footerContent: text("footer_content").notNull(),
  defaultCtaTitle: varchar("default_cta_title", { length: 200 }).notNull(),
  defaultCtaText: text("default_cta_text").notNull(),
  heroTitle: varchar("hero_title", { length: 300 }).notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  ...timestamps,
});

export const seoSettings = pgTable("seo_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  route: varchar("route", { length: 300 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  canonicalUrl: text("canonical_url"),
  openGraphImage: text("open_graph_image"),
  robots: varchar("robots", { length: 80 }).default("index,follow").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("seo_route_idx").on(table.route)]);

export const usersRelations = relations(users, ({ many }) => ({ sessions: many(sessions), posts: many(blogPosts) }));
export const sessionsRelations = relations(sessions, ({ one }) => ({ user: one(users, { fields: [sessions.userId], references: [users.id] }) }));
export const projectsRelations = relations(projects, ({ one }) => ({ industry: one(industries, { fields: [projects.industryId], references: [industries.id] }) }));
export const postsRelations = relations(blogPosts, ({ one }) => ({
  category: one(blogCategories, { fields: [blogPosts.categoryId], references: [blogCategories.id] }),
  author: one(users, { fields: [blogPosts.authorId], references: [users.id] }),
}));
export const careersRelations = relations(careers, ({ many }) => ({ applications: many(jobApplications) }));
export const applicationsRelations = relations(jobApplications, ({ one }) => ({ career: one(careers, { fields: [jobApplications.careerId], references: [careers.id] }) }));
export const contactsRelations = relations(contactMessages, ({ one }) => ({ service: one(services, { fields: [contactMessages.serviceId], references: [services.id] }) }));
