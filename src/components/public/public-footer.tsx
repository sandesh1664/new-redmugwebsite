import { ArrowUpRight } from "lucide-react";
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
};

const telHref = (value: string) => `tel:${value.replace(/[^\d+]/g, "")}`;

export function PublicFooter({ settings }: { settings: Settings }) {
  const numbers = [settings.phone, settings.phoneSecondary, settings.phoneMobile].filter(Boolean) as string[];
  return (
    <footer className="public-footer">
      <div className="site-container">
        <div className="footer-main">
          <div><BrandMark logoUrl={settings.logoUrl} /><p>{settings.footerContent}</p><div className="system-status"><i /> Systems online · Dubai, UAE</div></div>
          <div className="footer-col"><span>Explore</span><Link href="/services">Services</Link><Link href="/solutions">Solutions</Link><Link href="/industries">Industries</Link><Link href="/projects">Projects</Link></div>
          <div className="footer-col"><span>Company</span><Link href="/about">About</Link><Link href="/blog">Insights</Link><Link href="/careers">Careers</Link><Link href="/contact">Contact</Link></div>
          <div className="footer-col"><span>Connect</span>{numbers.map((number) => <a key={number} href={telHref(number)}>{number}</a>)}{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}{Object.entries(settings.socialLinks).map(([name, url]) => url ? <a key={name} href={url} target="_blank" rel="noreferrer">{name}<ArrowUpRight size={12} /></a> : null)}</div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} {settings.companyName}</span><span>Established {settings.establishedYear} · {settings.address}</span><Link href="/admin">Admin</Link></div>
      </div>
    </footer>
  );
}
