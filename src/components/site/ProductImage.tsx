import { GarmentPlaceholder } from "@/components/icons";

export function ProductImage({
  src,
  alt,
  className = "",
  imgClassName = "",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-white/60 ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-contain ${imgClassName}`} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-white to-[#e6ebf0] text-black/15">
          <GarmentPlaceholder className={`w-1/2 ${imgClassName}`} />
        </div>
      )}
    </div>
  );
}
