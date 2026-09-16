import { ArrowRight, Braces, CheckCircle2, CircuitBoard, Fingerprint, Layers3, LockKeyhole, MoveUpRight, Radar, Scale, ShieldCheck, Waypoints } from "lucide-react";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, careers, industries, projects, services, solutions } from "@/db/schema";
import { EcosystemVisual, TechnologyFlow } from "@/components/public/ecosystem";
import { ServiceIcon } from "@/components/public/service-icon";
import { FinalCta, SectionHead } from "@/components/public/sections";
import { buildRouteMetadata, getSiteSettings } from "@/lib/site";

export const dynamic = "force-dynamic";
export async function generateMetadata() { return buildRouteMetadata("/", { title: "RedMug IT Solution", description: "Software, infrastructure and intelligence engineered as one connected technology ecosystem." }); }

export default async function HomePage() {
  const [settings, serviceRows, solutionRows, industryRows, projectRows, postRows, careerRows] = await Promise.all([
    getSiteSettings(),
    db.select().from(services).where(eq(services.status, "PUBLISHED")).orderBy(asc(services.displayOrder)).limit(8),
    db.select().from(solutions).where(eq(solutions.status, "PUBLISHED")).orderBy(asc(solutions.displayOrder)).limit(6),
    db.select().from(industries).where(eq(industries.status, "PUBLISHED")).orderBy(asc(industries.displayOrder)).limit(9),
    db.select().from(projects).where(eq(projects.status, "PUBLISHED")).orderBy(desc(projects.featured), desc(projects.updatedAt)).limit(2),
    db.select().from(blogPosts).where(eq(blogPosts.status, "PUBLISHED")).orderBy(desc(blogPosts.publishedAt)).limit(2),
    db.select().from(careers).where(eq(careers.status, "OPEN")).orderBy(desc(careers.updatedAt)).limit(1),
  ]);
  if (!settings) return <main id="main-content"><section className="page-hero"><div className="site-container"><h1>RedMug IT Solution</h1><p>Site configuration is being prepared.</p></div></section></main>;

  const pillars = [
    ["01", "Engineering First", "Systems are designed around operating requirements, clear constraints and maintainable decisions.", CircuitBoard],
    ["02", "Security by Design", "Security boundaries and responsible access are considered at the architecture stage, not added at the end.", ShieldCheck],
    ["03", "Scalable Architecture", "Technology should support the next operating stage without making today’s solution unnecessarily complex.", Layers3],
    ["04", "Long-Term Partnership", "Delivery includes the knowledge, visibility and support needed to keep systems useful over time.", Waypoints],
  ] as const;

  return <main id="main-content">
    <section className="hero"><div className="site-container hero-grid">
      <div className="hero-copy"><span className="eyebrow">Dubai · Technology systems</span><h1>{settings.heroTitle.split(" ").slice(0, 3).join(" ")} <span>{settings.heroTitle.split(" ").slice(3).join(" ")}</span></h1><p>{settings.heroSubtitle}</p><div className="hero-actions"><Link className="button button-primary" href="/contact">Start a project <ArrowRight size={16} /></Link><Link className="button button-secondary" href="/solutions">Explore solutions <MoveUpRight size={15} /></Link></div></div>
      <EcosystemVisual />
    </div></section>

    <section className="trust-strip" aria-label="Company facts"><div className="site-container trust-grid">
      <div className="trust-item"><small>Company</small><strong>Established {settings.establishedYear}</strong></div><div className="trust-item"><small>Customer signal</small><strong>{settings.googleRating}★ Google Rating</strong></div><div className="trust-item"><small>Public feedback</small><strong>{settings.googleReviewCount} Google Reviews</strong></div><div className="trust-item"><small>Operating base</small><strong>{settings.city}, UAE</strong></div>
    </div></section>

    <section className="section section-dark section-grid"><div className="site-container"><SectionHead eyebrow="Connected architecture" title="From physical signal to business action." description="One visual model for how RedMug connects devices, infrastructure, data and intelligence into useful operating systems." /><TechnologyFlow /></div></section>

    <section className="section"><div className="site-container"><SectionHead eyebrow="How we think" title="Technology Should Solve Problems, Not Create Them." description="Technical depth matters most when it results in systems that people can trust, understand and operate." /><div className="pillar-grid">{pillars.map(([index, title, text, Icon]) => <article className="pillar" key={title}><span>{index} / PRINCIPLE</span><Icon size={25} strokeWidth={1.4} /><strong>{title}</strong><p>{text}</p></article>)}</div></div></section>

    <section className="section section-dark"><div className="site-container"><SectionHead eyebrow="Capabilities" title="One technology ecosystem. Built around your operation." description="Software, infrastructure and intelligence are stronger when they are designed as connected parts of one system." href="/services" linkLabel="All services" /><div className="card-grid">{serviceRows.map((service, index) => <Link className="tech-card" href={`/services/${service.slug}`} key={service.id}><span className="card-index">0{index + 1} / SERVICE</span><MoveUpRight className="card-arrow" size={15} /><div className="card-icon"><ServiceIcon name={service.icon} size={20} /></div><h3>{service.name}</h3><p>{service.shortDescription}</p></Link>)}</div></div></section>

    <section className="section section-grid"><div className="site-container"><SectionHead eyebrow="Integrated solutions" title="Architecture that crosses technical boundaries." description="Start with the operating outcome, then connect the right capabilities around it." href="/solutions" /><div className="service-list-page">{solutionRows.map((solution, index) => <article className="tech-card" key={solution.id}><span className="card-index">S{String(index + 1).padStart(2,"0")}</span><div className="card-icon"><Radar size={20} /></div><h3>{solution.name}</h3><p>{solution.summary}</p></article>)}</div></div></section>

    <section className="section section-dark"><div className="site-container"><div className="split-feature"><div className="split-copy"><span className="eyebrow">Industry context</span><h2>Designed around how organizations actually operate.</h2><p>Each environment has different continuity, access, data and support requirements. RedMug shapes architecture around that context.</p><div className="logo-stack">{industryRows.map((industry) => <span key={industry.id}>{industry.name}</span>)}</div><br /><Link className="text-link" href="/industries">Explore industries <ArrowRight size={14} /></Link></div><div className="visual-panel"><div className="architecture-ring">CONTEXT → SYSTEM</div></div></div></div></section>

    <section className="section"><div className="site-container"><SectionHead eyebrow="Case study framework" title="Systems documented with clarity." description="Sample records demonstrate how approved RedMug case studies will be structured. No fictional client outcomes are claimed." href="/projects" linkLabel="View project library" />{projectRows.length ? <div className="project-grid">{projectRows.map((project) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.id}><div className="project-overlay">{project.isDemo && <span className="demo-badge">Sample data</span>}<small>{project.category}</small><h3>{project.name}</h3><p>{project.summary}</p></div></Link>)}</div> : <div className="empty-public">Approved case studies will appear here when published.</div>}</div></section>

    <section className="section section-dark section-grid"><div className="site-container"><SectionHead eyebrow="Technology stack" title="The right layer. The right tool. One coherent system." description="Technology choices follow architecture and operating requirements—not trends." /><div className="logo-stack">{["TypeScript","Next.js","PostgreSQL","Python","Cloud AI","MQTT","Edge","Azure","AWS","LAN / WAN","APIs","Monitoring"].map((item)=><span key={item}>{item}</span>)}</div></div></section>

    <section className="section"><div className="site-container"><SectionHead eyebrow="Delivery system" title="A controlled path from problem to operation." /><div className="ecosystem-flow">{["DISCOVER","DEFINE","ARCHITECT","BUILD","VALIDATE","DEPLOY","OPERATE"].map((step,index)=><div className="flow-step" key={step}><small>PHASE 0{index+1}</small><i/><b>{step}</b>{index<6&&<span className="flow-arrow"/>}</div>)}</div></div></section>

    <section className="section section-dark"><div className="site-container"><div className="split-feature"><div className="visual-panel"><div className="architecture-ring"><LockKeyhole size={40} /> SECURITY LAYER</div></div><div className="split-copy"><span className="eyebrow">Security posture</span><h2>Trust is an architectural decision.</h2><p>Identity, access, visibility and recoverability are part of the system design. Security is considered across software, network, cloud and physical infrastructure.</p><div className="check-list"><span>Clear system boundaries</span><span>Least-privilege access thinking</span><span>Operational monitoring and accountability</span><span>Resilience and recovery planning</span></div></div></div></div></section>

    <section className="section"><div className="site-container"><SectionHead eyebrow={`RedMug / ${settings.establishedYear}`} title="Building technology with purpose in Dubai." description="RedMug IT Solution brings engineering, infrastructure and digital systems together around practical business needs." href="/about" linkLabel="Our approach" /><div className="pillar-grid"><article className="pillar"><span>MISSION</span><Fingerprint/><strong>Purpose</strong><p>Improve how organizations operate through dependable, connected technology.</p></article><article className="pillar"><span>APPROACH</span><Braces/><strong>Systems thinking</strong><p>Design software, data, networks and security as parts of one architecture.</p></article><article className="pillar"><span>DISCIPLINE</span><Scale/><strong>Practical decisions</strong><p>Balance capability, complexity, operating cost and long-term maintainability.</p></article><article className="pillar"><span>OUTCOME</span><CheckCircle2/><strong>Operational clarity</strong><p>Give teams the visibility and control required to use technology with confidence.</p></article></div></div></section>

    <section className="section section-dark"><div className="site-container"><SectionHead eyebrow="Insights" title="Technical thinking for practical decisions." description="Notes on architecture, infrastructure, automation and connected systems." href="/blog" linkLabel="All insights" />{postRows.length ? <div className="insights-grid">{postRows.map(post=><Link className="insight-card" href={`/blog/${post.slug}`} key={post.id}><span className="insight-meta">{post.isDemo ? "Sample editorial · " : ""}{post.readingTime} min read</span><h3>{post.title}</h3><p>{post.excerpt}</p><span className="text-link">Read article <ArrowRight size={13}/></span></Link>)}</div>:<div className="empty-public">Insights will appear here when published.</div>}</div></section>

    <section className="section"><div className="site-container"><SectionHead eyebrow="Careers" title="Build useful systems with us." description="Open positions are managed directly by the RedMug team." href="/careers" linkLabel="View careers" />{careerRows.map(career=><div className="career-card" key={career.id}><div>{career.isDemo&&<span className="demo-badge">Sample opening</span>}<h3>{career.title}</h3><p>{career.department} · {career.location} · {career.employmentType}</p></div><Link className="button button-secondary" href={`/careers/${career.slug}`}>View position <ArrowRight size={14}/></Link></div>)}</div></section>

    <FinalCta title={settings.defaultCtaTitle} text={settings.defaultCtaText} />
  </main>;
}
