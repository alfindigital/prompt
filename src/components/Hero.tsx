import { Search, X } from "lucide-react";

interface HeroProps {
  search: string;
  onSearchChange: (val: string) => void;
}

export function Hero({ search, onSearchChange }: HeroProps) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="relative flex items-center max-w-2xl">
          <Search
            className="absolute left-4 h-4 w-4 text-primary-foreground/60 pointer-events-none"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search your prompt library"
            placeholder="Search your library..."
            className="w-full pl-11 pr-10 py-2.5 bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl text-sm text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 backdrop-blur-sm transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
