import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/brand/logo";

type Settings = {
  companyName: string;
  logoUrl: string | null;
  phone: string;
  phoneSecondary: string | null;
  phoneMobile: string | null;
  email: string | null;
  address: string;
  footerContent: string;
  socialLinks: Record<string, string>;
  establishedYear: number;
  businessHours?: string | null;
};

type LinkItem = { name: string; slug: string };

const telHref = (value: string) => `tel:${value.replace(/[^\d+]/g, "")}`;

export function PublicFooter({ settings, services, solutions, legalPages = [] }: { settings: Settings; services: LinkItem[]; solutions: LinkItem[]; legalPages?: Array<{ title: string; slug: string }> }) {
  const numbers = [settings.phone, settings.phoneSecondary, settings.phoneMobile].filter(Boolean) as string[];
  const socials = Object.entries(settings.socialLinks).filter(([, url]) => Boolean(url));
  return (
    <footer className="public-footer">
      <div className="site-container">
        <div className="footer-main">
          <div className="footer-brand">
            <BrandMark logoUrl={settings.logoUrl} />
            <p>{settings.footerContent}</p>
            <div className="system-status"><i /> Systems online · Dubai, UAE</div>
            {socials.length > 0 && (
              <div className="social-row" aria-label="Social profiles">
                {socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer noopener">{name} <ArrowUpRight size={12} /></a>)}
              </div>
            )}
          </div>

          <div className="footer-col">
            <span>Services</span>
            {services.length ? services.map((item) => <Link key={item.slug} href={`/services/${item.slug}`}>{item.name}</Link>) : <Link href="/services">All services</Link>}
          </div>

          <div className="footer-col">
            <span>Solutions</span>
            {solutions.length ? solutions.map((item) => <Link key={item.slug} href="/solutions">{item.name}</Link>) : <Link href="/solutions">All solutions</Link>}
            <Link href="/industries">Industries</Link>
          </div>

          <div className="footer-col">
            <span>Company</span>
            <Link href="/about">About</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/blog">Insights</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className="footer-col footer-contact-col">
            <span>Contact</span>
            <div className="footer-contact">
              {numbers.map((number) => <div key={number}><Phone size={14} /><a href={telHref(number)}>{number}</a></div>)}
              {settings.email && <div><Mail size={14} /><a href={`mailto:${settings.email}`}>{settings.email}</a></div>}
              <div><MapPin size={14} /><span>{settings.address}</span></div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {settings.companyName} · Established {settings.establishedYear}</span>
          <nav aria-label="Legal">
            {legalPages.map((page) => <Link key={page.slug} href={`/${page.slug}`}>{page.title}</Link>)}
            <Link href="/admin">Admin</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
