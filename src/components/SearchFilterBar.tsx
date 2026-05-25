interface SearchFilterBarProps {
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearTags: () => void;
}

export function SearchFilterBar({
  allTags,
  selectedTags,
  onTagToggle,
  onClearTags,
}: SearchFilterBarProps) {
  if (allTags.length === 0) return null;

  return (
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
  );
}
