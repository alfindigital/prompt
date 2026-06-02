import { BrandMark } from "@/components/BrandMark";

interface HeaderProps {
  onBrandClick?: () => void;
}

export function Header({ onBrandClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center">
        <button
          onClick={onBrandClick}
          className="flex items-center gap-2 group"
          aria-label="Promptly home"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
            <BrandMark className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          </div>
          <span className="font-display text-sm sm:text-base font-bold tracking-tight text-foreground">
            Promptly
          </span>
        </button>
      </div>
    </header>
  );
}
