import { site } from "@/lib/site";

export function Logo({ className = "", size = "md" }: { className?: string; size?: "md" | "xl" }) {
  if (site.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={site.logo}
        alt={site.name}
        className={`${size === "xl" ? "w-full max-w-md" : "h-6"} w-auto object-contain ${className}`}
      />
    );
  }
  return (
    <span
      className={`font-display italic leading-none tracking-tight ${
        size === "xl" ? "text-[22vw] md:text-[14rem]" : "text-[28px]"
      } ${className}`}
    >
      {site.wordmark}
    </span>
  );
}
