import { useEffect, useRef, useState } from "react";
import { Search, Plus, Settings, Download, Upload, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { exportPrompts, importPrompts } from "@/lib/prompts-store";
import { toast } from "sonner";

type Tab = "prompts" | "add" | "settings";

interface HeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onDataChange: () => void;
}

const MAX_BYTES = 5 * 1024 * 1024;

export function Header({ search, onSearchChange, activeTab, onTabChange, onDataChange }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleExport = () => {
    const data = exportPrompts();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompts-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
    toast.success(`Exported ${data.prompts.length} prompts`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (!/\.json$/i.test(file.name)) return toast.error("File must be a .json backup");
    if (file.size === 0) return toast.error("Backup file is empty");
    if (file.size > MAX_BYTES) return toast.error(`Backup too large (max 5 MB)`);

    const reader = new FileReader();
    reader.onerror = () => toast.error("Could not read file");
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text !== "string") return toast.error("Could not read file contents");
      let raw: unknown;
      try { raw = JSON.parse(text); }
      catch (err) {
        const msg = err instanceof Error ? err.message : "unknown";
        return toast.error("Invalid JSON", { description: msg });
      }
      try {
        const result = importPrompts(raw);
        onDataChange();
        const parts: string[] = [];
        if (result.promptsAdded) parts.push(`${result.promptsAdded} added`);
        if (result.promptsUpdated) parts.push(`${result.promptsUpdated} updated`);
        if (result.categoriesAdded) parts.push(`${result.categoriesAdded} categories`);
        toast.success("Backup restored", { description: parts.length ? parts.join(" · ") : "No new prompts" });
        setMenuOpen(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        toast.error("Backup is not valid", { description: msg });
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        {/* Brand */}
        <button
          onClick={() => onTabChange("prompts")}
          className="flex items-center gap-2 shrink-0 group"
          aria-label="Promptly home"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
            <BrandMark className="h-4 w-4" strokeWidth={2} />
          </div>
          <span className="font-display text-base font-bold tracking-tight text-foreground hidden xs:inline sm:inline">
            Promptly
          </span>
        </button>

        {/* Search (grows) */}
        <div className="relative flex-1 min-w-[140px] order-3 sm:order-2 basis-full sm:basis-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/40 pointer-events-none" strokeWidth={1.75} />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search prompts"
            placeholder="Search title, content, tag…"
            className="w-full h-9 pl-9 pr-8 bg-secondary/60 border border-transparent hover:border-border rounded-full text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-foreground/50 hover:text-foreground hover:bg-secondary"
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 order-2 sm:order-3 ml-auto">
          <Button
            size="sm"
            onClick={() => onTabChange(activeTab === "add" ? "prompts" : "add")}
            className="h-9 rounded-full gap-1.5 px-3 sm:px-4 text-xs font-semibold"
            aria-label="Add new prompt"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            <span className="hidden sm:inline">{activeTab === "add" ? "Close" : "New"}</span>
          </Button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open settings menu"
              aria-expanded={menuOpen}
              className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                menuOpen ? "bg-secondary text-foreground" : "text-foreground/60 hover:text-foreground hover:bg-secondary/70"
              }`}
            >
              <Settings className="h-4 w-4" strokeWidth={1.75} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl p-1.5 animate-scale-in origin-top-right z-50">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors"
                >
                  <Download className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  Export prompts
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors"
                >
                  <Upload className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  Import backup
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json"
                  aria-label="Import prompts JSON file"
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
            )}
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
