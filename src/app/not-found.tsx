import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <div className="site-container not-found-inner">
        <span className="eyebrow">Error / 404</span>
        <h1>That system path doesn’t exist.</h1>
        <p>The page may have moved, been unpublished, or never existed. Return to a known route.</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/">Homepage <ArrowRight size={15} /></Link>
          <Link className="button button-secondary" href="/services">Explore services</Link>
          <Link className="button button-secondary" href="/contact">Contact RedMug</Link>
        </div>
      </div>
    </main>
  );
}
