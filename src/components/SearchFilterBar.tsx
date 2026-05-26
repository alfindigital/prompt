import { Search, X } from "lucide-react";

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearTags: () => void;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  allTags,
  selectedTags,
  onTagToggle,
  onClearTags,
}: SearchFilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative flex items-center">
        <Search
          className="absolute left-4 h-4 w-4 text-foreground/40 pointer-events-none"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Filter prompts by title, content, or tags"
          placeholder="Filter by title, content, or tag..."
          className="w-full pl-11 pr-10 py-2.5 bg-secondary/60 border border-border rounded-full text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear filter"
            className="absolute right-3 p-1 rounded-full text-foreground/50 hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {selectedTags.length > 0 && (
            <button
              onClick={onClearTags}
              className="text-[11px] font-semibold px-3 py-1 rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
            >
              Clear tags
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground/70 hover:bg-secondary/70 hover:text-foreground"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
