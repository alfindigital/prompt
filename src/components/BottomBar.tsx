import { useEffect, useRef, useState } from "react";
import { Plus, Settings, Download, Upload, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBar } from "@/components/CategoryBar";
import { InlineSearch } from "@/components/InlineSearch";
import { Category } from "@/lib/types";
import { exportPrompts, importPrompts } from "@/lib/prompts-store";
import { toast } from "sonner";

type Tab = "prompts" | "add" | "settings";

interface BottomBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onDataChange: () => void;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  search: string;
  onSearchChange: (val: string) => void;
}

const MAX_BYTES = 5 * 1024 * 1024;

export function BottomBar({
  activeTab,
  onTabChange,
  onDataChange,
  categories,
  selectedCategory,
  onSelectCategory,
  search,
  onSearchChange,
}: BottomBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });
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
    <div
      className="sticky bottom-0 z-40 bg-background/90 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 pb-2 space-y-2">
        {/* Categories + search */}
        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          onDataChange={onDataChange}
          leading={<InlineSearch value={search} onChange={onSearchChange} />}
        />

        {/* Action row */}
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            onClick={() => onTabChange(activeTab === "add" ? "prompts" : "add")}
            className="h-11 px-5 rounded-full gap-1.5 text-sm font-semibold shadow-md shadow-primary/25"
            aria-label={activeTab === "add" ? "Close add prompt" : "Add new prompt"}
          >
            {activeTab === "add" ? (
              <X className="h-4 w-4" strokeWidth={2.25} />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={2.25} />
            )}
            {activeTab === "add" ? "Close" : "New prompt"}
          </Button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open settings menu"
              aria-expanded={menuOpen}
              className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors ${
                menuOpen ? "bg-secondary text-foreground" : "bg-secondary/70 text-foreground/70 hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Settings className="h-4 w-4" strokeWidth={1.75} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-56 bg-card border border-border rounded-xl shadow-xl p-1.5 animate-scale-in origin-bottom-right z-50">
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
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => {
                    const next = !dark;
                    setDark(next);
                    document.documentElement.classList.toggle("dark", next);
                    localStorage.setItem("theme", next ? "dark" : "light");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors"
                >
                  {dark ? (
                    <Sun className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  ) : (
                    <Moon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  )}
                  {dark ? "Light mode" : "Dark mode"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
