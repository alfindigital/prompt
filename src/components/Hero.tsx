import { Search, X } from "lucide-react";

interface HeroProps {
  search: string;
  onSearchChange: (val: string) => void;
}

export function Hero({ search, onSearchChange }: HeroProps) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] mb-4">
            Your thoughts,
            <br />
            structured.
          </h2>
          <p className="text-primary-foreground/80 text-base sm:text-lg mb-7 sm:mb-9 max-w-md leading-relaxed">
            The definitive vault for your finest AI interactions. Save, refine, and deploy in one click.
          </p>
          <div className="relative flex items-center">
            <Search
              className="absolute left-4 h-5 w-5 text-primary-foreground/50 pointer-events-none"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search your prompt library"
              placeholder="Search your library..."
              className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-primary-foreground/10 border border-primary-foreground/20 rounded-2xl text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 backdrop-blur-sm transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-4 text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
