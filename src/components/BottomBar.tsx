import { useEffect, useRef, useState } from "react";
import { Plus, Settings, Download, Upload, Moon, Sun, Search, X, LayoutGrid, Check, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Category } from "@/lib/types";
import {
  exportPrompts,
  importPrompts,
  addCategory,
  deleteCategory,
  renameCategory,
} from "@/lib/prompts-store";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const catsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!catsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) setCatsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [catsOpen]);

  useEffect(() => {
    if (searchOpen) requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchOpen]);

  useEffect(() => {
    if (search) setSearchOpen(true);
  }, [search]);

  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node) && !search) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [searchOpen, search]);

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

  const handleAddCat = () => {
    if (!newName.trim()) return;
    if (categories.some((c) => c.name.toLowerCase() === newName.trim().toLowerCase())) {
      toast.error("Category already exists");
      return;
    }
    addCategory(newName.trim());
    setNewName("");
    setAdding(false);
    onDataChange();
    toast.success("Category created");
  };

  const handleDeleteCat = (id: string) => {
    deleteCategory(id);
    if (selectedCategory === id) onSelectCategory(null);
    onDataChange();
    toast.success("Category deleted");
  };

  const handleRenameCat = (id: string) => {
    if (!editName.trim()) return;
    renameCategory(id, editName.trim());
    setEditingId(null);
    onDataChange();
  };

  const iconBtn = "h-11 w-11 rounded-full flex items-center justify-center transition-colors text-foreground/70 hover:text-foreground hover:bg-secondary";
  const iconBtnActive = "h-11 w-11 rounded-full flex items-center justify-center transition-colors bg-secondary text-foreground";

  return (
    <div
      className="sticky bottom-0 z-40 bg-background/90 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between gap-1">
        {/* Search */}
        <div ref={searchWrapRef} className="relative">
          {searchOpen ? (
            <div className="relative flex items-center animate-scale-in origin-left">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/40 pointer-events-none" strokeWidth={1.75} />
              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    if (search) onSearchChange("");
                    else setSearchOpen(false);
                  }
                }}
                onBlur={() => { if (!search) setSearchOpen(false); }}
                aria-label="Search prompts"
                placeholder="Search…"
                className="h-11 w-48 sm:w-64 pl-9 pr-8 bg-secondary border-0 rounded-full text-sm placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { onSearchChange(""); requestAnimationFrame(() => searchInputRef.current?.focus()); }}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-foreground/50 hover:text-foreground hover:bg-background"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search prompts"
              className={iconBtn}
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>
          )}
        </div>

        {/* Categories */}
        {!searchOpen && (
          <div className="relative" ref={catsRef}>
            <button
              onClick={() => setCatsOpen((v) => !v)}
              aria-label="Choose category"
              aria-expanded={catsOpen}
              className={`${catsOpen || selectedCategory ? iconBtnActive : iconBtn} relative`}
            >
              <LayoutGrid className="h-5 w-5" strokeWidth={1.75} />
              {selectedCategory && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-background"
                  style={{ backgroundColor: `hsl(${categories.find((c) => c.id === selectedCategory)?.color ?? "0 0% 50%"})` }}
                />
              )}
            </button>
            {catsOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 max-h-72 overflow-y-auto bg-card border border-border rounded-xl shadow-xl p-1.5 animate-scale-in origin-bottom z-50">
                <button
                  onClick={() => { onSelectCategory(null); setCatsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === null ? "bg-secondary font-semibold" : "hover:bg-secondary"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-foreground/40 shrink-0" />
                  All Prompts
                </button>
                {categories.map((cat) => (
                  <div key={cat.id} className="group/cat flex items-center">
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-1 w-full px-2 py-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          aria-label="Rename category"
                          className="h-8 text-xs flex-1 rounded-lg"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameCat(cat.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <button onClick={() => handleRenameCat(cat.id)} aria-label="Save" className="text-primary p-1">
                          <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                        <button onClick={() => setEditingId(null)} aria-label="Cancel" className="text-muted-foreground p-1">
                          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { onSelectCategory(selectedCategory === cat.id ? null : cat.id); setCatsOpen(false); }}
                          className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === cat.id ? "bg-secondary font-semibold" : "hover:bg-secondary"
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: `hsl(${cat.color})` }}
                          />
                          <span className="truncate">{cat.name}</span>
                        </button>
                        <div className="hidden group-hover/cat:flex items-center gap-0.5 pr-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingId(cat.id); setEditName(cat.name); }}
                            aria-label="Rename"
                            className="text-muted-foreground hover:text-foreground p-1"
                          >
                            <Pencil className="h-3 w-3" strokeWidth={1.75} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat.id); }}
                            aria-label="Delete"
                            className="text-muted-foreground hover:text-destructive p-1"
                          >
                            <Trash2 className="h-3 w-3" strokeWidth={1.75} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div className="my-1 border-t border-border" />
                {adding ? (
                  <div className="flex items-center gap-1 px-2 py-1">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Category name…"
                      aria-label="New category name"
                      className="h-8 text-xs flex-1 rounded-lg"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCat();
                        if (e.key === "Escape") { setAdding(false); setNewName(""); }
                      }}
                    />
                    <button onClick={handleAddCat} aria-label="Save" className="text-primary p-1">
                      <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button onClick={() => { setAdding(false); setNewName(""); }} aria-label="Cancel" className="text-muted-foreground p-1">
                      <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAdding(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary hover:bg-secondary transition-colors"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    New category
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* New (primary FAB) */}
        <button
          onClick={() => onTabChange(activeTab === "add" ? "prompts" : "add")}
          aria-label={activeTab === "add" ? "Close add prompt" : "Add new prompt"}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-95 transition"
        >
          {activeTab === "add" ? (
            <X className="h-5 w-5" strokeWidth={2.25} />
          ) : (
            <Plus className="h-5 w-5" strokeWidth={2.25} />
          )}
        </button>

        {/* Settings */}
        {!searchOpen && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open settings menu"
              aria-expanded={menuOpen}
              className={menuOpen ? iconBtnActive : iconBtn}
            >
              <Settings className="h-5 w-5" strokeWidth={1.75} />
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
        )}
      </div>
    </div>
  );
}
