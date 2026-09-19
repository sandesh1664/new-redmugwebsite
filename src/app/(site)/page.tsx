import { ArrowRight, BarChart3, Bot, BrainCircuit, CircuitBoard, Eye, Fingerprint, Headset, KeyRound, Layers3, LockKeyhole, MessagesSquare, MoveUpRight, Radar, ScanEye, ScanSearch, ShieldCheck, Waypoints, Workflow } from "lucide-react";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, industries, projects, services, solutions } from "@/db/schema";
import { HeroVisual, TechnologyFlow } from "@/components/public/ecosystem";
import { Counter, Reveal } from "@/components/public/motion";
import { ServiceIcon, industryIcon } from "@/components/public/service-icon";
import { FinalCta, SectionHead } from "@/components/public/sections";
import { SceneLoader } from "@/components/three/scene-loader";
import { CoreFallback } from "@/components/public/ecosystem";
import { buildRouteMetadata, getSiteSettings } from "@/lib/site";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return buildRouteMetadata("/", { title: "RedMug IT Solution | Technology & Infrastructure Dubai", description: "Software, AI, IoT, networking, CCTV & security, cloud and IT support engineered as one connected technology ecosystem in Dubai." });
}

const pillars = [
  ["Engineering Expertise", "Systems are designed around operating requirements, clear constraints and maintainable decisions — not trends.", CircuitBoard],
  ["End-to-End Solutions", "From structured cabling and cameras to cloud platforms and software, one team owns the whole stack.", Layers3],
  ["Security First", "Access, segmentation and monitoring are considered at the architecture stage, not bolted on afterwards.", ShieldCheck],
  ["Scalable Architecture", "Technology that supports the next operating stage without making today's solution unnecessarily complex.", Waypoints],
  ["Reliable Support", "Delivery includes the documentation, monitoring and response process needed to keep systems useful.", Headset],
  ["Business-Focused Technology", "Every recommendation is measured against the operating outcome it is meant to improve.", BarChart3],
] as const;

const securityAreas = [
  ["Network Security", "Firewalling, VLAN segmentation and controlled remote access.", ShieldCheck],
  ["CCTV & Surveillance", "IP camera coverage, recording and mobile remote viewing.", ScanEye],
  ["Access Control", "Managed entry, identity-linked permissions and audit trails.", KeyRound],
  ["Infrastructure Security", "Hardened racks, cabling discipline and patched hardware.", LockKeyhole],
  ["Data Protection", "Tested backups, defined recovery objectives and retention.", Fingerprint],
  ["Monitoring", "Alerting on abnormal conditions across sites and assets.", Radar],
] as const;

const aiCapabilities = [
  ["AI Automation", "Automate repetitive review and routing work with explicit human checkpoints.", Bot],
  ["Intelligent Assistants", "Assistants grounded in your own documents and operating data.", MessagesSquare],
  ["RAG Systems", "Retrieval-augmented pipelines that answer from verified sources, not guesses.", ScanSearch],
  ["Predictive Analytics", "Surface patterns in operational data early enough to act on them.", BarChart3],
  ["Computer Vision", "Document and image processing for inspection and verification workflows.", Eye],
  ["Business Intelligence", "Decision-support dashboards that update themselves.", BrainCircuit],
] as const;

export default async function HomePage() {
  const [settings, serviceRows, solutionRows, industryRows, projectRows, postRows] = await Promise.all([
    getSiteSettings(),
    db.select().from(services).where(eq(services.status, "PUBLISHED")).orderBy(asc(services.displayOrder)).limit(8),
    db.select().from(solutions).where(eq(solutions.status, "PUBLISHED")).orderBy(asc(solutions.displayOrder)).limit(6),
    db.select().from(industries).where(eq(industries.status, "PUBLISHED")).orderBy(asc(industries.displayOrder)).limit(10),
    db.select().from(projects).where(eq(projects.status, "PUBLISHED")).orderBy(desc(projects.featured), desc(projects.updatedAt)).limit(2),
    db.select().from(blogPosts).where(eq(blogPosts.status, "PUBLISHED")).orderBy(desc(blogPosts.publishedAt)).limit(2),
  ]);
  if (!settings) return <main id="main-content"><section className="page-hero"><div className="site-container"><h1>RedMug IT Solution</h1><p>Site configuration is being prepared.</p></div></section></main>;

  // Technology ecosystem is derived from what the CMS says RedMug actually uses.
  const techGroups = groupTechnologies(serviceRows.flatMap((s) => s.technologies));
  const yearsOperating = new Date().getFullYear() - settings.establishedYear;

  return (
    <main id="main-content">
      {/* HERO */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-bg" aria-hidden="true" /><div className="hero-glow" aria-hidden="true" />
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <Reveal><span className="badge"><i /> Engineering the digital future</span></Reveal>
            <Reveal delay={80}>
              <h1 id="hero-title">
                <span>Smart Technology.</span>
                <span className="accent-blue">Secure Infrastructure.</span>
                <span className="accent-outline">Scalable Software.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}><p>{settings.heroSubtitle}</p></Reveal>
            <Reveal delay={240} className="hero-actions">
              <Link className="button button-primary" href="/contact">Start a Project <ArrowRight size={16} /></Link>
              <Link className="button button-secondary" href="/solutions">Explore Solutions <MoveUpRight size={15} /></Link>
            </Reveal>
            <Reveal delay={320} className="hero-meta">
              <span>Software</span><span>AI &amp; ML</span><span>IoT</span><span>Networking</span><span>CCTV &amp; Security</span><span>Cloud</span>
            </Reveal>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* TRUST / STATS — only figures stored in the CMS */}
      <section className="trust-strip" aria-label="Company facts">
        <div className="site-container trust-grid">
          <div className="trust-item"><small>Technology capabilities</small><strong><Counter value={serviceRows.length} suffix="+" /></strong><span>Connected service lines</span></div>
          <div className="trust-item"><small>Operating since</small><strong>{settings.establishedYear}</strong><span>{yearsOperating}+ years in {settings.city}</span></div>
          <div className="trust-item"><small>Customer signal</small><strong>{settings.googleRating}<em>★</em></strong><span>{settings.googleReviewCount} public Google reviews</span></div>
          <div className="trust-item"><small>Industries served</small><strong><Counter value={industryRows.length} /></strong><span>Operating contexts</span></div>
        </div>
      </section>

      {/* FLOW */}
      <section className="section section-grid">
        <div className="site-container">
          <SectionHead eyebrow="Connected architecture" title="From physical signal to business action." description="One model for how RedMug connects devices, infrastructure, data and intelligence into useful operating systems." />
          <Reveal><TechnologyFlow /></Reveal>
        </div>
      </section>

      {/* WHY REDMUG */}
      <section className="section section-dark section-line-top" aria-labelledby="why-title">
        <div className="site-container">
          <SectionHead eyebrow="Why RedMug" title="Technology should solve problems, not create them." description="Technical depth matters most when it results in systems that people can trust, understand and operate every day." />
          <div className="pillar-grid">
            {pillars.map(([title, text, Icon], index) => (
              <Reveal as="article" className="pillar" key={title} delay={index * 60}>
                <span>0{index + 1} / PRINCIPLE</span><Icon size={24} strokeWidth={1.5} /><strong>{title}</strong><p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" aria-labelledby="services-title">
        <div className="site-container">
          <SectionHead eyebrow="Capabilities" title="One technology ecosystem. Built around your operation." description="Software, infrastructure and intelligence are stronger when they are designed as connected parts of one system." href="/services" linkLabel="All services" />
          {serviceRows.length ? (
            <div className="card-grid">
              {serviceRows.map((service, index) => (
                  <Link className="tech-card reveal" href={`/services/${service.slug}`} key={service.id} style={{ ["--reveal-delay" as string]: `${(index % 4) * 60}ms` }}>
                    <span className="card-index">0{index + 1} / SERVICE</span>
                    <MoveUpRight className="card-arrow" size={15} aria-hidden="true" />
                    <div className="card-icon"><ServiceIcon name={service.icon} size={20} /></div>
                    <h3>{service.name}</h3>
                    <p>{service.shortDescription}</p>
                    {service.features.length > 0 && <div className="card-tags">{service.features.slice(0, 3).map((f) => <span key={f}>{f}</span>)}</div>}
                  </Link>
              ))}
            </div>
          ) : <div className="empty-public">Services will appear here once published from the admin panel.</div>}
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="section section-dark section-grid section-line-top" aria-labelledby="solutions-title">
        <div className="site-container">
          <SectionHead eyebrow="Integrated solutions" title="Architecture that crosses technical boundaries." description="Start with the operating outcome, then connect the right capabilities around it." href="/solutions" linkLabel="All solutions" />
          {solutionRows.length ? (
            <div className="service-list-page">
              {solutionRows.map((solution, index) => (
                <Reveal as="article" className="tech-card" key={solution.id} delay={(index % 3) * 70}>
                  <span className="card-index">S{String(index + 1).padStart(2, "0")} / SOLUTION</span>
                  <div className="card-icon"><ServiceIcon name={solution.icon} size={20} /></div>
                  <h3>{solution.name}</h3>
                  <p>{solution.summary}</p>
                  {solution.capabilities.length > 0 && <div className="card-tags">{solution.capabilities.slice(0, 3).map((c) => <span key={c}>{c}</span>)}</div>}
                  <Link className="text-link card-cta" href="/solutions" style={{ fontSize: 13 }}>Explore solution <ArrowRight size={13} /></Link>
                </Reveal>
              ))}
            </div>
          ) : <div className="empty-public">Solutions will appear here once published.</div>}
        </div>
      </section>

      {/* SECURITY */}
      <section className="section" aria-labelledby="security-title">
        <div className="site-container">
          <Reveal className="security-panel">
            <div className="security-visual" role="img" aria-label="3D security shield with scanning perimeter">
              <SceneLoader variant="shield" fallback={<CoreFallback label="SECURE CORE" />} />
              <div className="scan-line" aria-hidden="true" />
              <span className="hud tl">PERIMETER · MONITORED</span><span className="hud br">ACCESS · CONTROLLED</span>
            </div>
            <div>
              <span className="eyebrow">Security infrastructure</span>
              <h2 id="security-title" style={{ fontSize: "clamp(30px,3.4vw,44px)", letterSpacing: "-.04em", lineHeight: 1.06, margin: "16px 0 14px", fontWeight: 600 }}>Visibility, access and resilience — designed as one layer.</h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.75, margin: 0 }}>Physical and network security are treated as a single system: what the cameras see, who can enter, how the network is segmented and how quickly the business can recover.</p>
              <div className="security-list">
                {securityAreas.map(([title, text, Icon]) => <div key={title}><Icon size={17} /><span><b>{title}</b><span>{text}</span></span></div>)}
              </div>
              <div style={{ marginTop: 26 }}><Link className="button button-secondary button-sm" href="/services/cctv-security-systems">CCTV &amp; security systems <ArrowRight size={14} /></Link></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="section section-dark section-line-top" aria-labelledby="industries-title">
        <div className="site-container">
          <SectionHead eyebrow="Industry context" title="Designed around how organizations actually operate." description="Each environment has different continuity, access, data and support requirements. Architecture is shaped around that context." href="/industries" linkLabel="All industries" />
          {industryRows.length ? (
            <div className="industry-grid">
              {industryRows.map((industry, index) => (
                  <Link className="industry-tile reveal" href={`/industries#${industry.slug}`} key={industry.id} style={{ ["--reveal-delay" as string]: `${(index % 5) * 50}ms` }}>
                    <i><ServiceIcon name={industryIcon(industry.name)} size={18} /></i>
                    <div><b>{industry.name}</b><small>{industry.challenges.slice(0, 2).join(" · ")}</small></div>
                  </Link>
              ))}
            </div>
          ) : <div className="empty-public">Industries will appear here once published.</div>}
        </div>
      </section>

      {/* AI */}
      <section className="section section-grid" aria-labelledby="ai-title">
        <div className="site-container ai-grid">
          <Reveal>
            <span className="eyebrow">AI &amp; future technology</span>
            <h2 id="ai-title" style={{ fontSize: "clamp(30px,3.6vw,46px)", letterSpacing: "-.04em", lineHeight: 1.06, margin: "16px 0 14px", fontWeight: 600 }}>Applied intelligence with human oversight built in.</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.75, margin: 0 }}>RedMug builds practical AI workflows that start with a real operating problem, use the data you already have, and keep people in control of every decision that matters.</p>
            <div className="capability-list">
              {aiCapabilities.map(([title, text, Icon]) => <div key={title}><i><Icon size={16} /></i><span><b>{title}</b><span>{text}</span></span></div>)}
            </div>
            <div style={{ marginTop: 26 }}><Link className="button button-blue button-sm" href="/services/ai-machine-learning">AI &amp; machine learning <ArrowRight size={14} /></Link></div>
          </Reveal>
          <Reveal className="ai-visual" delay={120}>
            <div role="img" aria-label="3D neural network visualization" style={{ position: "absolute", inset: 0 }}>
              <SceneLoader variant="neural" fallback={<CoreFallback label="AI CORE" />} />
            </div>
            <span className="hud tl">MODEL · INFERENCE</span><span className="hud br">HUMAN-IN-THE-LOOP</span>
          </Reveal>
        </div>
      </section>

      {/* TECH STACK */}
      {techGroups.length > 0 && (
        <section className="section section-dark section-line-top" aria-labelledby="stack-title">
          <div className="site-container">
            <SectionHead eyebrow="Technology ecosystem" title="The tools behind the systems." description="Drawn directly from the technologies listed across RedMug's published services." />
            <div className="stack-grid">
              {techGroups.map(([group, items], index) => (
                <Reveal className="stack-group" key={group} delay={index * 60}>
                  <small>{group}</small>
                  <div className="logo-stack">{items.map((item) => <span key={item}>{item}</span>)}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROJECTS */}
      <section className="section" aria-labelledby="projects-title">
        <div className="site-container">
          <SectionHead eyebrow="Case studies" title="The system, the reasoning and the result." description="Only approved case studies are presented as real work. Development records are always marked as sample data." href="/projects" linkLabel="All projects" />
          {projectRows.length ? (
            <div className="project-grid">
              {projectRows.map((project, index) => (
                  <Link className="project-card reveal" href={`/projects/${project.slug}`} key={project.id} style={{ ["--reveal-delay" as string]: `${index * 100}ms` }}>
                    {project.featuredImage && <div className="project-media" style={{ backgroundImage: `url('${project.featuredImage}')` }} aria-hidden="true" />}
                    <div className="project-overlay">
                      <small>{project.isDemo && <span className="demo-badge">Sample data</span>}<span>{project.category}</span></small>
                      <h3>{project.name}</h3>
                      <p>{project.summary}</p>
                      {project.technologies.length > 0 && <div className="card-tags">{project.technologies.slice(0, 4).map((t) => <span key={t}>{t}</span>)}</div>}
                      <span className="text-link">View case study <ArrowRight size={13} /></span>
                    </div>
                  </Link>
              ))}
            </div>
          ) : <div className="empty-public">Approved project case studies will appear here when published.</div>}
        </div>
      </section>

      {/* INSIGHTS */}
      {postRows.length > 0 && (
        <section className="section section-dark section-line-top" aria-labelledby="insights-title">
          <div className="site-container">
            <SectionHead eyebrow="Insights" title="Technical thinking for practical decisions." href="/blog" linkLabel="All insights" />
            <div className="insights-grid">
              {postRows.map((post, index) => (
                  <Link className="insight-card reveal" href={`/blog/${post.slug}`} key={post.id} style={{ ["--reveal-delay" as string]: `${index * 80}ms` }}>
                    <span className="insight-meta">{post.isDemo && "Sample editorial · "}{post.readingTime} min read · {post.publishedAt?.toLocaleDateString("en-AE", { dateStyle: "medium" })}</span>
                    <h3>{post.title}</h3><p>{post.excerpt}</p>
                    <span className="text-link">Read article <ArrowRight size={13} /></span>
                  </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <FinalCta eyebrow="Ready to build something smarter?" title={settings.defaultCtaTitle} text={settings.defaultCtaText} />
    </main>
  );
}

/** Buckets free-text technology names into ecosystem groups for display. */
function groupTechnologies(all: string[]): Array<[string, string[]]> {
  const unique = Array.from(new Set(all.map((t) => t.trim()).filter(Boolean)));
  const buckets: Record<string, string[]> = { Frontend: [], Backend: [], Database: [], "AI & Data": [], Cloud: [], Infrastructure: [], "Security & IoT": [] };
  const rules: Array<[RegExp, string]> = [
    [/camera|nvr|dvr|cctv|motion|audio|mqtt|edge|lorawan|iot|remote viewing/i, "Security & IoT"],
    [/react|next\.js|typescript|tailwind|vue|angular|flutter/i, "Frontend"],
    [/node|python|fastapi|django|\.net|java|php|api|middleware|workflow engine/i, "Backend"],
    [/postgres|mongo|mysql|sql|redis|vector/i, "Database"],
    [/machine learning|pytorch|scikit|llm|ai |^ai|analytics|reporting/i, "AI & Data"],
    [/aws|azure|cloud|container|docker|kubernetes|backup|object storage|replication|hosting/i, "Cloud"],
    [/lan|wan|wi-fi|network|vlan|sd-wan|firewall|cabling|linux|monitoring|service desk|endpoint/i, "Infrastructure"],
    [/camera|nvr|dvr|cctv|motion|audio|mqtt|edge|lorawan|iot|remote viewing/i, "Security & IoT"],
  ];
  for (const tech of unique) {
    const match = rules.find(([re]) => re.test(tech));
    buckets[match ? match[1] : "Infrastructure"].push(tech);
  }
  return Object.entries(buckets).filter(([, items]) => items.length > 0);
}
