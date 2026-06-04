import { BrandMark } from "@/components/BrandMark";

interface HeaderProps {
  onBrandClick?: () => void;
}

export function Header({ onBrandClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <button
          onClick={onBrandClick}
          className="flex items-center gap-2.5 group active:scale-95 transition-transform"
          aria-label="Promptly home"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-105 transition-all">
            <BrandMark className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={2} />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
              Promptly
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-foreground/40 tracking-wider uppercase mt-0.5">
              Prompt Library
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
