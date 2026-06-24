import { useEffect } from "react";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator,
} from "@/components/ui/command";
import {
  Plus, Search as SearchIcon, Download, Upload, Moon, Sun, X, LayoutGrid, Star, Copy, Sparkles,
} from "lucide-react";
import { isDark } from "@/lib/theme";
import { hasVariables } from "@/lib/variables";
import type { Prompt, Category } from "@/lib/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompts: Prompt[];
  categories: Category[];
  onNewPrompt: () => void;
  onSelectCategory: (id: string | null) => void;
  onCopyPrompt: (prompt: Prompt) => void;
  onClearFilters: () => void;
  onExport: () => void;
  onImport: () => void;
  onToggleTheme: () => void;
}

export function CommandPalette({
  open, onOpenChange, prompts, categories, onNewPrompt, onSelectCategory,
  onCopyPrompt, onClearFilters, onExport, onImport, onToggleTheme,
}: CommandPaletteProps) {
  // Global Cmd/Ctrl+K toggles the palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const run = (fn: () => void) => {
    onOpenChange(false);
    // Defer so the dialog closes cleanly before side-effects (e.g. opening another dialog).
    window.setTimeout(fn, 0);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search prompts or run a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(onNewPrompt)}>
            <Plus className="mr-2 h-4 w-4" /> New prompt
          </CommandItem>
          <CommandItem onSelect={() => run(onClearFilters)}>
            <X className="mr-2 h-4 w-4" /> Clear filters
          </CommandItem>
          <CommandItem onSelect={() => run(onToggleTheme)}>
            {isDark() ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            Toggle theme
          </CommandItem>
          <CommandItem onSelect={() => run(onExport)}>
            <Download className="mr-2 h-4 w-4" /> Export backup
          </CommandItem>
          <CommandItem onSelect={() => run(onImport)}>
            <Upload className="mr-2 h-4 w-4" /> Import backup
          </CommandItem>
        </CommandGroup>

        {categories.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Categories">
              <CommandItem onSelect={() => run(() => onSelectCategory(null))}>
                <LayoutGrid className="mr-2 h-4 w-4" /> All prompts
              </CommandItem>
              {categories.map((c) => (
                <CommandItem key={c.id} value={`category ${c.name}`} onSelect={() => run(() => onSelectCategory(c.id))}>
                  <span className="mr-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${c.color})` }} />
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {prompts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Prompts (Enter to copy)">
              {prompts.slice(0, 50).map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.title} ${p.tags.join(" ")}`}
                  onSelect={() => run(() => onCopyPrompt(p))}
                >
                  {p.is_favorite ? (
                    <Star className="mr-2 h-4 w-4 fill-primary text-primary" />
                  ) : hasVariables(p.content) ? (
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4 text-foreground/50" />
                  )}
                  <span className="truncate">{p.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
