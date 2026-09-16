import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "./index";
import {
  blogCategories,
  blogPosts,
  careers,
  contactMessages,
  galleryItems,
  industries,
  pages,
  projects,
  seoSettings,
  services,
  siteSettings,
  solutions,
  teamMembers,
  testimonials,
  users,
} from "./schema";

async function seed() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@redmug.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "RedMugAdmin!2019";
  const existingAdmin = await db.select({ id: users.id }).from(users).where(eq(users.email, adminEmail)).limit(1);
  let adminId = existingAdmin[0]?.id;
  if (!adminId) {
    const [admin] = await db.insert(users).values({
      name: "RedMug Administrator",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "SUPER_ADMIN",
    }).returning({ id: users.id });
    adminId = admin.id;
  }

  const companyFacts = {
    id: "main",
    companyName: "RedMug IT Solution Co. L.L.C.",
    establishedYear: 2019,
    logoUrl: "/brand/redmug-mark.svg",
    faviconUrl: "/favicon.svg",
    phone: "+971 4 254 6441",
    phoneSecondary: "+971 4 265 0127",
    phoneMobile: "+971 54 266 7644",
    email: "redmugitsolutions@gmail.com",
    address: "Dar Al Wuheida Building, 44 24 St, Hor Al Anz East, Dubai, United Arab Emirates",
    city: "Dubai",
    country: "United Arab Emirates",
    googleRating: "4.8",
    googleReviewCount: 12,
    businessHours: "Sunday to Friday, 9:00 – 18:00 (Gulf Standard Time)",
    websiteUrl: "https://redmugitsolution.ae",
    socialLinks: {
      TikTok: "https://www.tiktok.com/@redmugitsolution1",
      X: "https://x.com/Redmugit2024",
      Facebook: "https://www.facebook.com/RedMug IT Solution L.L.C",
      LinkedIn: "https://www.linkedin.com/company/redmug-it-solution-l-l-c",
    },
    footerContent: "RedMug IT Solution Co. L.L.C is a Dubai-based technology company working across software, AI, IoT, networking, CCTV and security systems, cloud and IT support.",
    defaultCtaTitle: "Let’s engineer what comes next.",
    defaultCtaText: "Tell us where your technology needs to go. We’ll help define a secure, practical path forward.",
    heroTitle: "Technology That Moves Your Business Forward.",
    heroSubtitle: "Intelligent technology, secure infrastructure and connected systems built for the businesses of tomorrow.",
  };
  await db.insert(siteSettings).values(companyFacts).onConflictDoUpdate({ target: siteSettings.id, set: companyFacts });

  const serviceSeeds = [
    ["Software Development", "software-development", "Purpose-built software for complex business operations.", "We design and develop dependable web, mobile and enterprise software around real operating requirements. RedMug builds application software for internal operations and customer-facing systems, including cloud-hosted applications.", "Code2",
      ["Web and mobile applications", "Enterprise and back-office platforms", "Cloud application development", "API and system integration", "Ongoing application support"], ["TypeScript", "Next.js", "PostgreSQL", "Node.js", "Cloud hosting"],
      ["Disconnected tools and spreadsheets", "Manual data entry between systems", "Software that no longer matches the operation", "No clear ownership of an existing system"],
      ["Requirements discovery", "Architecture and design", "Iterative build and review", "Testing and handover", "Support and iteration"],
      ["Software that matches the actual workflow", "Fewer manual handoffs between systems", "A system the team can be trained on", "A documented, maintainable codebase"],
      [{ question: "Do you build mobile applications as well as web?", answer: "Yes. RedMug builds web applications and mobile applications, and advises on which approach fits the workflow and budget." }, { question: "Can you take over an existing system?", answer: "We start with a technical review of the current application, then agree on a support or rebuild plan." }],
      "Backup Storage · Application Development · Disaster Recovery are delivered as cloud-hosted software services."] as const,
    ["AI & Machine Learning", "ai-machine-learning", "Applied intelligence that supports better business decisions.", "We build practical AI workflows, data systems and automation with measurable operational purpose, focused on decisions your team actually makes.", "BrainCircuit",
      ["AI workflow design", "Intelligent automation", "Data pipelines", "Document and image processing", "Decision support dashboards"], ["Python", "Machine Learning", "Cloud AI services", "Vector search"],
      ["Repetitive manual review work", "Data trapped in unusable formats", "No visibility of operational patterns", "AI pilots that never reach production"],
      ["Use-case assessment", "Data readiness review", "Model and workflow build", "Human-in-the-loop validation", "Production monitoring"],
      ["Less manual review effort", "Decisions supported by consistent data", "Automations that stay auditable", "Clear human oversight"],
      [{ question: "Do we need a large dataset to start?", answer: "Not always. We assess what data exists first and will say when AI is not the right tool for the problem." }],
      "Applied to operations, documents, monitoring and customer workflows."] as const,
    ["IoT Solutions", "iot-solutions", "Connected devices, telemetry and control systems.", "We connect physical operations to secure digital platforms for monitoring, control and informed action across sites and assets.", "RadioTower",
      ["Device and sensor integration", "Remote asset monitoring", "Telemetry platforms", "Alerting and thresholds", "Edge connectivity"], ["MQTT", "Edge computing", "Cloud IoT", "LoRaWAN"],
      ["Assets monitored by manual rounds", "No warning before equipment failure", "Site data that never reaches decision makers", "Unsupported consumer-grade devices"],
      ["Site and asset survey", "Connectivity design", "Device deployment", "Dashboard configuration", "Operational handover"],
      ["Live visibility of remote assets", "Earlier warning of abnormal conditions", "Fewer manual site visits", "Data retained for review"],
      [{ question: "Can you work with devices we already own?", answer: "Where a device exposes a supported protocol we integrate it. We will tell you when replacement is the more reliable option." }],
      "Used for facilities, equipment, energy and site monitoring."] as const,
    ["Networking", "networking", "Reliable network foundations for connected organizations.", "We plan and implement wired, wireless and multi-site networks with security and maintainability built in, including structured cabling and Wi-Fi coverage.", "Network",
      ["Structured cabling", "LAN / WAN design", "Wi-Fi coverage and surveys", "Multi-site connectivity", "Firewall and segmentation", "Performance monitoring"], ["LAN/WAN", "Wi-Fi 6", "Firewalling", "VLAN segmentation", "SD-WAN"],
      ["Dead zones and unstable Wi-Fi", "Flat networks with no segregation", "Unclear cabling documentation", "Frequent unexplained outages"],
      ["Network survey", "Topology design", "Cabling and hardware install", "Configuration and testing", "Documentation handover"],
      ["Predictable connectivity", "Clear network documentation", "Segmented, contained security zones", "A network that supports growth"],
      [{ question: "Do you work in occupied offices?", answer: "Yes. We plan cabling and hardware work to limit disruption and can schedule around operating hours." }],
      "Core infrastructure for every other RedMug service."] as const,
    ["CCTV & Security Systems", "cctv-security-systems", "Integrated visibility and physical security systems.", "RedMug supplies all types of CCTV cameras and installs them for homes and businesses across Dubai. The company states more than 300 completed installations, and supports each system after handover. We help you choose the right camera for each position if you are unsure.", "ScanEye",
      ["CCTV setup and installation", "CCTV maintenance and servicing", "High-definition camera supply", "Smart remote monitoring on mobile", "Wi-Fi and wired camera options", "Warning signage and compliance labelling"], ["IP cameras", "HD cameras", "NVR / DVR", "Mobile remote viewing", "Motion detection", "Two-way audio"],
      ["Blind spots around a property", "No usable footage after an incident", "Cameras that cannot be viewed remotely", "Poor night-time image quality", "Unsupported or unmaintained systems"],
      ["Site survey and coverage plan", "Camera selection", "Cabling and mounting", "Recording and remote access setup", "Handover and maintenance"],
      ["Coverage of the areas that matter", "Recorded evidence when incidents occur", "Live viewing from a mobile device", "Day and night recording", "Company-backed 2-year warranty on installations"],
      [{ question: "Do you supply the cameras as well as install them?", answer: "Yes. RedMug supplies all types of CCTV cameras and will recommend the most suitable option for each position and budget." }, { question: "How many installations has RedMug completed?", answer: "RedMug states more than 300 installations across homes and businesses in Dubai. We are happy to arrange a reference for your property type." }, { question: "Is there a warranty?", answer: "RedMug promotes a 2-year warranty on CCTV installations. Current warranty terms are confirmed in your quotation." }, { question: "Can I view cameras on my phone?", answer: "Yes. Systems are configured for smart remote monitoring so you can view live and recorded footage from a mobile device." }],
      "Homes, villas, retail, warehouses and offices across Dubai."] as const,
    ["Cloud Solutions", "cloud-solutions", "Cloud environments designed for resilience and control.", "We help businesses adopt, migrate and operate cloud infrastructure without losing visibility or governance, covering backup storage, application development and disaster recovery.", "Cloud",
      ["Backup storage", "Disaster recovery", "Cloud application development", "Migration planning and execution", "Hybrid and on-premise bridges", "Cost and access governance"], ["Microsoft Azure", "AWS", "Containers", "Object storage", "Backup and replication"],
      ["Backups that have never been tested", "Single point of failure on site", "Servers at end of life", "No recovery plan with defined timings"],
      ["Current state review", "Recovery objectives agreed", "Landing zone and migration plan", "Backup and restore testing", "Operational handover"],
      ["Tested, restorable backups", "Defined recovery time objectives", "Reduced on-site hardware dependency", "Access controlled and reviewed"],
      [{ question: "How often are backups tested?", answer: "Backups are only useful if they restore. We schedule restore tests and report the outcome rather than assuming success." }],
      "Backup, disaster recovery and hosted application workloads."] as const,
    ["IT Support", "it-support", "Responsive support backed by preventative operations.", "We keep business technology available through structured support, monitoring and lifecycle planning, with clear escalation paths.", "LifeBuoy",
      ["Managed support desk", "Endpoint and device management", "Infrastructure monitoring", "Patch and lifecycle management", "On-site and remote response"], ["Remote monitoring", "Service desk tooling", "Endpoint management", "Backup verification"],
      ["Untracked recurring issues", "No named person responsible for IT", "Ageing hardware with no plan", "Downtime with unclear cause"],
      ["Environment audit", "Support scope agreement", "Monitoring and tooling rollout", "Response process definition", "Monthly reporting"],
      ["A named team accountable for IT", "Issues tracked to resolution", "Fewer surprise failures", "Predictable hardware replacement"],
      [{ question: "Do you support offices outside Dubai?", answer: "Yes, remote support covers any location, with on-site visits arranged where required." }],
      "Ongoing operations for supported environments."] as const,
    ["Business Automation", "business-automation", "Connected workflows that reduce manual overhead.", "We map recurring processes and implement automation that keeps people in control while removing unnecessary work between systems.", "Workflow",
      ["Workflow automation", "System integration", "Approval and notification flows", "Operational dashboards", "Document generation"], ["APIs", "Integration middleware", "Workflow engines", "Reporting platforms"],
      ["Repeated manual steps between tools", "Approvals lost in email", "Reporting assembled by hand", "No single record of a request"],
      ["Process mapping", "Exception design", "Automation build", "Pilot with the team", "Rollout and monitoring"],
      ["Fewer manual handoffs", "Traceable approvals", "Reporting that updates itself", "Staff time redirected to real work"],
      [{ question: "Will automation remove the ability to intervene?", answer: "No. Every workflow is designed with explicit review points so people can approve, correct or stop the process." }],
      "Operations, sales administration, HR and finance workflows."] as const,
  ];

  for (const [index, seed] of serviceSeeds.entries()) {
    const [name, slug, shortDescription, fullDescription, icon, features, technologies, problems, process, benefits, faq, gallery] = seed;
    await db.insert(services).values({
      name, slug, shortDescription, fullDescription, icon, features: [...features], technologies: [...technologies],
      problems: [...problems], process: [...process], benefits: [...benefits], faq: [...faq],
      gallery: [`/brand/redmug-mark.svg`],
      seoTitle: `${name} in Dubai | RedMug IT Solution`,
      seoDescription: `${shortDescription} Explore RedMug's ${name.toLowerCase()} capabilities.`,
      status: "PUBLISHED", displayOrder: index, isDemo: false, publishedAt: new Date(),
    }).onConflictDoNothing();
  }

  const solutionSeeds = [
    ["Smart Business Systems", "smart-business-systems", "Connect workflows, data and teams through a coherent digital operating layer."],
    ["IoT Monitoring", "iot-monitoring", "Turn device telemetry into visible, actionable operations."],
    ["AI Automation", "ai-automation", "Apply intelligence to repeatable decisions while maintaining human oversight."],
    ["Network Infrastructure", "network-infrastructure", "Create a reliable connectivity foundation across sites and teams."],
    ["Security Infrastructure", "security-infrastructure", "Unify visibility, access and operational resilience."],
    ["Cloud Transformation", "cloud-transformation", "Move workloads deliberately with governance and continuity in mind."],
  ] as const;
  for (let i = 0; i < solutionSeeds.length; i++) {
    const [name, slug, summary] = solutionSeeds[i];
    await db.insert(solutions).values({ name, slug, summary, description: summary, capabilities: ["Architecture", "Implementation", "Operational support"], status: "PUBLISHED", displayOrder: i, isDemo: false }).onConflictDoNothing();
  }

  const industrySeeds = ["Education", "Healthcare", "Retail", "Hospitality", "Logistics", "Construction", "Real Estate", "Corporate", "Government"];
  for (let i = 0; i < industrySeeds.length; i++) {
    const name = industrySeeds[i];
    await db.insert(industries).values({
      name, slug: name.toLowerCase().replaceAll(" ", "-"), overview: `Technology architecture shaped around the operating demands of ${name.toLowerCase()} organizations.`,
      challenges: ["System continuity", "Secure connectivity", "Operational visibility"], solutions: ["Infrastructure planning", "Connected platforms", "Ongoing support"], status: "PUBLISHED", displayOrder: i, isDemo: false,
    }).onConflictDoNothing();
  }

  const categories = [
    { name: "Engineering Notes", slug: "engineering-notes", description: "Practical technology architecture and delivery guidance." },
    { name: "Infrastructure", slug: "infrastructure", description: "Networks, cloud and connected operations." },
  ];
  const categoryIds: string[] = [];
  for (const category of categories) {
    const [row] = await db.insert(blogCategories).values(category).onConflictDoUpdate({ target: blogCategories.slug, set: { name: category.name } }).returning({ id: blogCategories.id });
    categoryIds.push(row.id);
  }

  const postSeeds = [
    { title: "A Practical Framework for Planning Business Automation", slug: "sample-planning-business-automation", excerpt: "A sample editorial guide to identifying automation opportunities without losing operational control.", content: "Sample editorial content — not a customer claim.\n\nAutomation works best when it starts with a clear operating problem. Map the current workflow, identify decision points, and define where human review remains important.\n\n## Start with the system boundary\n\nDocument what enters the process, which systems own the data, and what a successful outcome looks like.\n\n## Design for exceptions\n\nReliable automation is not only a happy path. It provides visibility when information is incomplete or a decision requires review.", categoryId: categoryIds[0] },
    { title: "What a Resilient Multi-Site Network Plan Should Cover", slug: "sample-resilient-multi-site-network", excerpt: "A sample briefing on availability, security boundaries and maintainable network operations.", content: "Sample editorial content — not a project claim.\n\nA multi-site network plan should make failure modes explicit. Connectivity, identity, monitoring and recovery all need clear ownership.\n\n## Design for operations\n\nArchitecture is only successful when teams can understand, monitor and maintain it after deployment.", categoryId: categoryIds[1] },
  ];
  for (const post of postSeeds) {
    await db.insert(blogPosts).values({ ...post, authorId: adminId, tags: ["Sample", "Technology Planning"], readingTime: 4, status: "PUBLISHED", publishedAt: new Date(), isDemo: true, seoTitle: post.title, seoDescription: post.excerpt }).onConflictDoNothing();
  }

  const [industry] = await db.select({ id: industries.id }).from(industries).limit(1);
  const projectSeeds = [
    { name: "Sample: Connected Operations Architecture", slug: "sample-connected-operations-architecture", category: "Infrastructure Concept", summary: "A clearly labeled sample case-study structure demonstrating how a connected operations engagement can be documented.", challenge: "Sample scenario: disconnected operational data limits visibility across a growing environment.", solution: "Sample approach: define a secure data path from devices through network and cloud layers into an operational dashboard.", technologies: ["IoT", "Secure Networking", "Cloud Platform"], results: ["No client result claimed — sample record for CMS demonstration."], featured: true },
    { name: "Sample: Business Workflow Platform", slug: "sample-business-workflow-platform", category: "Software Concept", summary: "A clearly labeled sample showing the CMS structure for a future software case study.", challenge: "Sample scenario: recurring requests move between teams through manual channels.", solution: "Sample approach: map the process and build a controlled workflow with auditability and clear ownership.", technologies: ["Web Application", "API Integration", "PostgreSQL"], results: ["No client result claimed — sample record for CMS demonstration."], featured: false },
  ];
  for (const project of projectSeeds) {
    await db.insert(projects).values({ ...project, industryId: industry?.id, client: "Demo record — no client", location: "Sample only", status: "PUBLISHED", publishedAt: new Date(), isDemo: true, seoTitle: project.name, seoDescription: project.summary }).onConflictDoNothing();
  }

  await db.insert(careers).values({
    title: "Sample Opening — Technology Project Coordinator", slug: "sample-technology-project-coordinator", department: "Operations", location: "Dubai, UAE", employmentType: "Full-time", experience: "CMS-configurable", description: "This is a sample vacancy used to demonstrate the application workflow. It is not an active RedMug vacancy unless confirmed by an administrator.", responsibilities: ["Coordinate technical workstreams", "Maintain clear project documentation"], requirements: ["Clear written communication", "Structured approach to delivery"], benefits: ["Benefits are configurable when a real role is published"], status: "OPEN", isDemo: true,
  }).onConflictDoNothing();

  const demoTeam = await db.select({ id: teamMembers.id }).from(teamMembers).where(eq(teamMembers.isDemo, true)).limit(1);
  if (!demoTeam.length) await db.insert(teamMembers).values({ name: "Demo Team Profile", role: "Sample role — replace before publishing", bio: "This profile is intentionally marked as demo content. No real employee identity is represented.", skills: ["Sample skill"], displayOrder: 0, status: "DRAFT", isDemo: true });

  const demoTestimonial = await db.select({ id: testimonials.id }).from(testimonials).where(eq(testimonials.isDemo, true)).limit(1);
  if (!demoTestimonial.length) await db.insert(testimonials).values({ name: "Sample Testimonial", company: "Demo only — not a customer", position: "Sample record", testimonial: "This is sample CMS content and is intentionally unpublished. Replace it with a verified customer statement before publishing.", rating: 5, featured: false, status: "DRAFT", isDemo: true });

  const demoLead = await db.select({ id: contactMessages.id }).from(contactMessages).where(eq(contactMessages.isDemo, true)).limit(1);
  if (!demoLead.length) await db.insert(contactMessages).values({ name: "Demo Lead", email: "demo@example.invalid", company: "Sample data", budget: "To be discussed", message: "Sample inquiry for demonstrating the lead workflow. This is not a real prospect.", status: "NEW", internalNotes: "Safe to delete. Seeded demo record.", isDemo: true });

  const demoGallery = await db.select({ id: galleryItems.id }).from(galleryItems).where(eq(galleryItems.isDemo, true)).limit(1);
  if (!demoGallery.length) await db.insert(galleryItems).values({ title: "Sample gallery record", imageUrl: "/brand/redmug-mark.svg", altText: "Sample gallery record awaiting approved RedMug photography", caption: "Sample CMS record. Upload approved company photography, then replace or delete this item.", category: "General", featured: false, status: "DRAFT", isDemo: true });

  const photoQueue = [
    ["Upload: CCTV installation set", "CCTV", "Upload the real installation photographs — technicians mounting cameras, ladder work, cabling and recording equipment. Publish once approved."],
    ["Upload: office and team photography", "Team", "Upload the RedMug office and team photographs for the About page and Team section."],
    ["Upload: building and signage", "Office", "Upload the Dar Al Wuheida Building exterior and signage photograph."],
    ["Upload: networking and hardware", "Infrastructure", "Upload rack, switch, cabling and hardware installation photographs."],
  ] as const;
  for (const [title, category, caption] of photoQueue) {
    const existing = await db.select({ id: galleryItems.id }).from(galleryItems).where(eq(galleryItems.title, title)).limit(1);
    if (existing.length) continue;
    await db.insert(galleryItems).values({ title, imageUrl: "/brand/redmug-mark.svg", altText: `${title} — awaiting RedMug photography upload`, caption, category, featured: false, status: "DRAFT", displayOrder: 0, isDemo: false });
  }

  const pageSeeds = [
    { title: "About RedMug", slug: "about", eyebrow: "Company", heroTitle: "Building Technology With Purpose Since 2019.", heroDescription: "RedMug brings software, infrastructure and connected systems together around practical business outcomes.", content: "RedMug IT Solution is a Dubai-based technology company established in 2019. We approach technology as an operating system for the business: software, infrastructure, connectivity and security must work together.\n\nOur mission is to help organizations build dependable technology environments that improve visibility, efficiency and resilience.\n\nOur engineering philosophy starts with the problem, defines the constraints and creates architecture that teams can operate with confidence." },
    { title: "Contact", slug: "contact", eyebrow: "Start a conversation", heroTitle: "Bring Us the Problem. We’ll Help Define the System.", heroDescription: "Share what you are building, improving or trying to make more reliable.", content: "Tell us enough to understand the context. A RedMug representative can then follow up using the contact details you provide." },
  ];
  for (const page of pageSeeds) await db.insert(pages).values({ ...page, status: "PUBLISHED", isDemo: false, seoTitle: `${page.title} | RedMug IT Solution`, seoDescription: page.heroDescription }).onConflictDoNothing();

  const seoSeeds = [
    { route: "/", title: "RedMug IT Solution | Technology & Infrastructure Dubai", description: "Software, AI, IoT, networking, security, cloud and IT support engineered as one connected technology ecosystem." },
    { route: "/services", title: "Technology Services | RedMug IT Solution", description: "Explore RedMug software, AI, IoT, networking, security, cloud and support capabilities in Dubai." },
    { route: "/contact", title: "Contact RedMug IT Solution Dubai", description: "Discuss your technology, infrastructure or digital operations needs with RedMug IT Solution." },
  ];
  for (const item of seoSeeds) await db.insert(seoSettings).values(item).onConflictDoNothing();

  console.log(`Seed complete. Admin login: ${adminEmail} (password from ADMIN_PASSWORD or documented development default)`);
  await pool.end();
}

seed().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
