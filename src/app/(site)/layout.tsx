import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { SessionSync } from "@/components/site/SessionSync";
import { isSupabaseConfigured } from "@/lib/env";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-col bg-black">
      {!isSupabaseConfigured && (
        <div className="bg-amber-300 px-4 py-2 text-center text-xs text-black">
          Store not connected — add your Supabase keys to <code>.env.local</code> (see README).
        </div>
      )}
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      <CartDrawer />
      <SessionSync />
    </div>
  );
}
