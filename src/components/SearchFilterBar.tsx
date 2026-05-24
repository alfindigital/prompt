import { Input } from "@/components/ui/input";
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
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          type="search"
          placeholder="Search prompts..."
          aria-label="Search prompts"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-11 rounded-xl bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {selectedTags.length > 0 && (
            <button
              onClick={onClearTags}
              className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
            >
              Clear
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
