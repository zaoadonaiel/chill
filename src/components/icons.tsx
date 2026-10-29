type IconProps = { className?: string };

export function MenuIcon({ className }: IconProps) {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" className={className} aria-hidden>
      <path d="M0 1h22M0 8h22M0 15h22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className} aria-hidden>
      <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BagIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDown({ className }: IconProps) {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={className} aria-hidden>
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FilterIcon({ className }: IconProps) {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" className={className} aria-hidden>
      <path d="M0 1h12M2 5h8M4 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Line-art garment used when a product has no photos yet.
export function GarmentPlaceholder({ className }: IconProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden>
      <path
        d="M72 38c6 10 16 16 28 16s22-6 28-16l34 14 20 52-24 9-8-20v83H50v-83l-8 20-24-9 20-52 34-14z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M82 40c2 18 10 30 18 30s16-12 18-30" stroke="currentColor" strokeWidth="2" />
      <path d="M78 140h44v22H78z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
