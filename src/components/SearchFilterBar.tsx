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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              className="text-[10px] px-2 py-0.5 rounded-full border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
            >
              Clear
            </button>
          )}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
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
