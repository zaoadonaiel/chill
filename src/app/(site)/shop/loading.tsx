export default function Loading() {
  return (
    <div className="flex-1 bg-paper px-4 py-8 md:px-10">
      <div className="mb-16 h-9 w-32 animate-pulse bg-black/10" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="aspect-square w-full animate-pulse bg-black/5" />
            <div className="h-3 w-2/3 animate-pulse bg-black/10" />
            <div className="h-3 w-1/3 animate-pulse bg-black/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
