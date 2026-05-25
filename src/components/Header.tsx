import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/BrandMark";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20 text-primary-foreground">
            <BrandMark className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-lg font-bold tracking-tight text-foreground leading-none">
              Promptly
            </h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.18em] mt-1">
              AI Prompt Library
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
