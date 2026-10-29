import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pages } from "@/content/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}

export async function generateMetadata({ params }: PageProps<"/[page]">): Promise<Metadata> {
  const { page } = await params;
  return { title: pages[page]?.title };
}

export default async function ContentPage({ params }: PageProps<"/[page]">) {
  const { page } = await params;
  const content = pages[page];
  if (!content) notFound();

  return (
    <div className="flex-1 bg-paper px-4 py-16 md:px-10 md:py-24">
      <article className="mx-auto max-w-2xl">
        {content.eyebrow && <p className="text-[11px] uppercase tracking-[0.3em] text-black/50">{content.eyebrow}</p>}
        <h1 className="mt-3 font-display text-5xl italic leading-[0.95] md:text-7xl">{content.title}</h1>
        {content.intro && <p className="mt-6 text-lg leading-relaxed text-black/70">{content.intro}</p>}

        <div className="mt-12 divide-y divide-line border-y border-line">
          {content.sections.map((s, i) => (
            <section key={i} className="py-6">
              {s.heading && <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest">{s.heading}</h2>}
              <p className="text-sm leading-relaxed text-black/70">{s.body}</p>
            </section>
          ))}
          {content.links?.map((l) => (
            <Link key={l.href} href={l.href} className="group flex items-center justify-between py-5">
              <span className="font-display text-3xl italic">{l.label}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </div>
      </article>
    </div>
  );
}
