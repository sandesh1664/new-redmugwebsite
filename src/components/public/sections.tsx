import { ArrowRight, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/public/motion";

type Crumb = { label: string; href?: string };

export function PageHero({ eyebrow, title, description, crumbs, children }: { eyebrow: string; title: string; description?: string | null; crumbs?: Crumb[]; children?: React.ReactNode }) {
  return (
    <section className="page-hero">
      <div className="site-container">
        {crumbs && crumbs.length > 0 && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {crumbs.map((crumb) => <span key={crumb.label}>/ {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}</span>)}
          </nav>
        )}
        <Reveal><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}{children}</Reveal>
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, description, href, linkLabel = "Explore all", align = "split" }: { eyebrow: string; title: string; description?: string; href?: string; linkLabel?: string; align?: "split" | "center" }) {
  return (
    <Reveal className={`section-head ${align === "center" ? "center" : ""}`}>
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
      {(description || href) && (
        <div>
          {description && <p>{description}</p>}
          {href && <Link className="text-link" href={href}>{linkLabel} <ArrowRight size={14} /></Link>}
        </div>
      )}
    </Reveal>
  );
}

export function FinalCta({ title, text, eyebrow = "Next step" }: { title: string; text: string; eyebrow?: string }) {
  return (
    <section className="cta-section" aria-labelledby="final-cta-title">
      <div className="site-container cta-inner">
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
          <h2 id="final-cta-title">{title}</h2>
          <p>{text}</p>
        </Reveal>
        <Reveal className="cta-actions" delay={120}>
          <Link className="button button-primary" href="/contact">Start a Project <ArrowRight size={16} /></Link>
          <Link className="button button-secondary" href="/contact#contact-form">Talk to Our Team <MessageSquareText size={16} /></Link>
        </Reveal>
      </div>
    </section>
  );
}

export function RichText({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/).filter(Boolean);
  return (
    <div className="prose">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) return <h2 key={index}>{block.slice(3)}</h2>;
        if (block.startsWith("### ")) return <h3 key={index}>{block.slice(4)}</h3>;
        if (block.split("\n").every((line) => line.startsWith("- "))) return <ul key={index}>{block.split("\n").map((line) => <li key={line}>{line.slice(2)}</li>)}</ul>;
        return <p key={index}>{block}</p>;
      })}
    </div>
  );
}
