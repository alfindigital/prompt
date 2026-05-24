import { LibraryBig } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="brand-mark h-14 w-14 mb-5">
        <LibraryBig className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h2 className="font-display text-lg font-semibold mb-2">Start your prompt library</h2>
      <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
        Tap the <span className="text-primary font-semibold">+</span> button below to save your first prompt.
      </p>
    </div>
  );
}
