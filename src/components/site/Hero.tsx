"use client";

import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { site } from "@/lib/site";
import { Logo } from "./Logo";

type Ripple = { id: number; x: number; y: number; size: number };

export function Hero() {
  const router = useRouter();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  function enter(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const ripple = { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top, size };
    setRipples((r) => [...r, ripple]);
    router.prefetch("/shop");
    setTimeout(() => router.push("/shop"), 550);
  }

  return (
    <section
      onClick={enter}
      role="link"
      aria-label="Enter the shop"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push("/shop")}
      className="grain relative flex min-h-[calc(100svh-64px)] cursor-pointer select-none items-center justify-center overflow-hidden bg-black text-white md:min-h-[calc(100svh-72px)]"
    >
      <div className="absolute inset-0">
        {site.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={site.heroImage} alt="" className="h-full w-full object-cover opacity-85" draggable={false} />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_50%_35%,#2a2f36_0%,#0d0f12_45%,#000_75%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          onAnimationEnd={() => setRipples((all) => all.filter((x) => x.id !== r.id))}
        />
      ))}

      <div className="fade-up relative z-10 flex flex-col items-center px-6 text-center">
        <p className="mb-6 text-[11px] uppercase tracking-[0.4em] text-white/50">Fall / Winter Collection</p>
        <Logo size="xl" className="drop-shadow-2xl" />
        <p className="mt-6 max-w-md text-sm text-white/60">{site.tagline}</p>
      </div>

      <span className="pointer-events-none absolute bottom-10 left-0 right-0 z-10 animate-pulse text-center text-xs text-white/75 md:bottom-14">
        [ TOUCH ANYWHERE TO ENTER ]
      </span>
    </section>
  );
}
