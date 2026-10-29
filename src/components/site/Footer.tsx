import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="grid gap-12 px-6 pb-10 pt-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-white/50">{site.tagline}</p>
        </div>
        <div>
          <p className="mb-4 text-xs text-white/40">Social</p>
          <ul className="space-y-2">
            {site.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="text-sm text-white/70 transition-colors hover:text-white">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs text-white/40">About</p>
          <ul className="space-y-2">
            {site.footerAbout.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="text-sm text-white/70 transition-colors hover:text-white">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 px-6 py-5 md:flex-row md:items-center md:px-10">
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-4">
          {site.legal.map((s) => (
            <Link key={s.href} href={s.href} className="text-xs text-white/30 transition-colors hover:text-white/60">
              {s.label}
            </Link>
          ))}
          <Link href="/contact" className="text-xs text-white/30 transition-colors hover:text-white/60">
            Customer Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
