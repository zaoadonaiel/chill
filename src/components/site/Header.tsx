"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { cartCount, useCart } from "@/store/cart";
import { BagIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { Logo } from "./Logo";
import { SearchOverlay } from "./SearchOverlay";

export function Header() {
  const pathname = usePathname();
  // Overlays remember the page they were opened on, so navigating closes them.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchPath, setSearchPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const searchOpen = searchPath === pathname;
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null);
  const setSearchOpen = (open: boolean) => setSearchPath(open ? pathname : null);
  const count = useCart((s) => cartCount(s.items));
  const openCart = useCart((s) => s.open);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black text-white">
        <div className="relative flex h-16 items-center justify-between px-4 md:h-[72px] md:px-8">
          <nav className="hidden items-center gap-8 md:flex">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm transition-opacity hover:opacity-60">
                {item.label}
              </Link>
            ))}
          </nav>
          <button className="p-1 md:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <MenuIcon />
          </button>

          <Link href="/" className="absolute left-1/2 flex -translate-x-1/2 items-center" aria-label={`${site.name} home`}>
            <Logo />
          </Link>

          <div className="hidden items-center gap-6 text-sm md:flex">
            <span className="text-white/60">{site.currency.toUpperCase()} / $</span>
            <button className="transition-opacity hover:opacity-60" onClick={() => setSearchOpen(true)}>
              Search
            </button>
            <Link href="/account" className="transition-opacity hover:opacity-60">
              Account
            </Link>
            <button className="transition-opacity hover:opacity-60" onClick={openCart}>
              Bag ({count})
            </button>
          </div>
          <button className="relative p-1 md:hidden" aria-label="Open bag" onClick={openCart}>
            <BagIcon />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-black">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 bg-black text-white transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <button className="p-1" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <CloseIcon />
          </button>
          <Logo />
          <span className="w-6" />
        </div>
        <nav className="flex flex-col gap-6 px-6 pt-10">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="font-display text-5xl italic">
              {item.label}
            </Link>
          ))}
          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/70">
            <button className="text-left" onClick={() => setSearchOpen(true)}>
              Search
            </button>
            <Link href="/account">Account</Link>
            <span>{site.currency.toUpperCase()} / $</span>
          </div>
        </nav>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
