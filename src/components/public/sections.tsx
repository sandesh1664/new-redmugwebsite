import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string | null }) {
  return <section className="page-hero"><div className="site-container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div></section>;
}

export function SectionHead({ eyebrow, title, description, href, linkLabel = "Explore all" }: { eyebrow: string; title: string; description?: string; href?: string; linkLabel?: string }) {
  return <div className="section-head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{description && <p>{description}{href && <><br /><br /><Link className="text-link" href={href}>{linkLabel} <ArrowRight size={14} /></Link></>}</p>}</div>;
}

export function FinalCta({ title, text }: { title: string; text: string }) {
  return <section className="cta-section"><div className="site-container cta-inner"><div><h2>{title}</h2><p>{text}</p></div><Link className="button button-primary" href="/contact">Start a project <ArrowRight size={16} /></Link></div></section>;
}

export function RichText({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/).filter(Boolean);
  return <div className="prose">{blocks.map((block, index) => {
    if (block.startsWith("## ")) return <h2 key={index}>{block.slice(3)}</h2>;
    if (block.startsWith("### ")) return <h3 key={index}>{block.slice(4)}</h3>;
    if (block.split("\n").every((line) => line.startsWith("- "))) return <ul key={index}>{block.split("\n").map((line) => <li key={line}>{line.slice(2)}</li>)}</ul>;
    return <p key={index}>{block}</p>;
  })}</div>;
}
