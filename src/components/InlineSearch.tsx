import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface InlineSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export function InlineSearch({ value, onChange }: InlineSearchProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keep open when there is a query
  useEffect(() => {
    if (value) setOpen(true);
  }, [value]);

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Close when clicking outside (only if empty)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node) && !value) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, value]);

  const handleClear = () => {
    onChange("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search prompts"
        className="shrink-0 h-10 w-10 rounded-full bg-secondary text-foreground/70 hover:text-foreground hover:bg-secondary/70 flex items-center justify-center transition-colors"
      >
        <Search className="h-4 w-4" strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="shrink-0 relative flex items-center animate-scale-in origin-left"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/40 pointer-events-none" strokeWidth={1.75} />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (value) onChange("");
            else setOpen(false);
          }
        }}
        onBlur={() => { if (!value) setOpen(false); }}
        aria-label="Search prompts"
        placeholder="Search…"
        className="h-10 w-44 sm:w-64 pl-9 pr-8 bg-secondary border border-transparent focus:border-transparent rounded-full text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-foreground/50 hover:text-foreground hover:bg-background"
        >
          <X className="h-3 w-3" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
