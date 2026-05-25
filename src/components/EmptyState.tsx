import { LibraryBig } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="brand-mark-outline h-16 w-16 mb-6">
        <LibraryBig className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h2 className="font-display text-xl font-bold mb-2 text-foreground">Start your prompt library</h2>
      <p className="text-sm text-foreground/60 max-w-[320px] leading-relaxed">
        Tap the <span className="text-primary font-bold">+</span> button below to save your first prompt.
      </p>
    </div>
  );
}
