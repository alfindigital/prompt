import { useEffect, useRef, useState } from "react";
import {
  Plus, Settings, Download, Upload, Moon, Sun, Search, X, LayoutGrid, Check, Pencil,
  Trash2, Home, Tags, FileText, ArrowUpDown, CheckSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Category } from "@/lib/types";
import { addCategory, deleteCategory, renameCategory, getCategoryTree } from "@/lib/prompts-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "prompts" | "add" | "settings";
type SortOption = "default" | "name" | "date" | "recent" | "used";

interface BottomBarProps {
  className?: string;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onDataChange: () => void;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  search: string;
  onSearchChange: (val: string) => void;
  themeDark: boolean;
  onToggleTheme: () => void;
  onExport: () => void;
  onImport: () => void;
  onImportText: () => void;
  onManageTags: () => void;
  
  onOpenPalette?: () => void;
  sortBy?: SortOption;
  onSortChange?: (v: SortOption) => void;
  selectMode?: boolean;
  onToggleSelect?: () => void;
}

export function BottomBar({
  className,
  activeTab,
  onTabChange,
  onDataChange,
  categories,
  selectedCategory,
  onSelectCategory,
  search,
  onSearchChange,
  themeDark,
  onToggleTheme,
  onExport,
  onImport,
  onImportText,
  onManageTags,
  
  onOpenPalette,
  sortBy = "default",
  onSortChange,
  selectMode = false,
  onToggleSelect,
}: BottomBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const catsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const tree = getCategoryTree();

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  useEffect(() => {
    if (!catsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) setCatsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCatsOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [catsOpen]);

  useEffect(() => {
    if (searchOpen) requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node) && !search) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [searchOpen, search]);

  const handleAddCat = () => {
    if (!newName.trim()) return;
    if (categories.some((c) => c.name.toLowerCase() === newName.trim().toLowerCase())) {
      toast.error("Category already exists");
      return;
    }
    addCategory(newName.trim(), newParent || null);
    setNewName("");
    setNewParent("");
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

  const isHome = activeTab === "prompts" && !selectedCategory && !search;

  const cellBase = "flex items-center justify-center h-11 w-11 rounded-full transition-colors";
  const cellIdle = `${cellBase} text-foreground/60 hover:text-foreground hover:bg-secondary/70`;
  const cellActive = `${cellBase} text-foreground bg-secondary`;

  const menuItem = "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors";

  return (
    <div
      className={cn("fixed inset-x-0 z-40 bottom-4 sm:bottom-6 flex justify-center pointer-events-none", className)}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
     <div className="relative pointer-events-auto">
      {/* Floating search bar above the dock — centered to viewport */}
      {searchOpen && (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-50 flex justify-center pointer-events-none px-4">
        <div ref={searchWrapRef} className="w-full max-w-md pointer-events-auto animate-fade-in">
          <div className="relative flex items-center bg-card/95 backdrop-blur-xl border border-border rounded-full shadow-2xl shadow-foreground/10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none" strokeWidth={1.75} />
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
              aria-label="Search prompts"
              placeholder="Search…"
              className="h-11 w-full pl-11 pr-10 bg-transparent border-0 rounded-full text-sm placeholder:text-foreground/45 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => { if (search) onSearchChange(""); setSearchOpen(false); }}
              aria-label="Close search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-foreground/50 hover:text-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
        </div>
      )}

      <div className="inline-flex items-center gap-1 px-2 py-2 rounded-full bg-card/85 backdrop-blur-xl border border-border/70 shadow-2xl shadow-foreground/15">
        {/* Home */}
        <button
          onClick={() => { onSelectCategory(null); onSearchChange(""); setSearchOpen(false); onTabChange("prompts"); }}
          aria-label="Home"
          className={isHome ? cellActive : cellIdle}
        >
          <Home className="h-5 w-5" strokeWidth={1.75} />
        </button>

        {/* Search */}
        <button
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Search prompts"
          aria-expanded={searchOpen}
          className={searchOpen || search ? cellActive : cellIdle}
        >
          <Search className="h-5 w-5" strokeWidth={1.75} />
        </button>

        {/* New (primary FAB) */}
        <button
          onClick={() => onTabChange(activeTab === "add" ? "prompts" : "add")}
          aria-label={activeTab === "add" ? "Close add prompt" : "Add new prompt"}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40 hover:shadow-primary/50 active:scale-95 transition mx-0.5"
        >
          {activeTab === "add" ? <X className="h-5 w-5" strokeWidth={2.25} /> : <Plus className="h-5 w-5" strokeWidth={2.25} />}
        </button>

        {/* Categories */}
        <div ref={catsRef} className="relative">
          <button
            onClick={() => setCatsOpen((v) => !v)}
            aria-label="Choose category"
            aria-expanded={catsOpen}
            className={`${catsOpen || selectedCategory ? cellActive : cellIdle} relative`}
          >
            <LayoutGrid className="h-5 w-5" strokeWidth={1.75} />
            {selectedCategory && (
              <span
                className="absolute top-1.5 right-3 w-2 h-2 rounded-full ring-2 ring-background"
                style={{ backgroundColor: `hsl(${categories.find((c) => c.id === selectedCategory)?.color ?? "0 0% 50%"})` }}
              />
            )}
          </button>
          {catsOpen && (
            <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-50 flex justify-center pointer-events-none px-4">
            <div className="w-full max-w-xs max-h-72 overflow-y-auto bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl shadow-foreground/10 p-1.5 animate-scale-in origin-bottom pointer-events-auto">
              <button
                onClick={() => { onSelectCategory(null); setCatsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === null ? "bg-secondary font-semibold" : "hover:bg-secondary"}`}
              >
                <span className="w-2 h-2 rounded-full bg-foreground/40 shrink-0" />
                All Prompts
              </button>
              {tree.map(({ category: cat, depth }) => (
                <div key={cat.id} className="group/cat flex items-center" style={{ paddingLeft: depth * 14 }}>
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-1 w-full px-2 py-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        aria-label="Rename category"
                        className="h-8 text-xs flex-1 rounded-lg"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleRenameCat(cat.id); if (e.key === "Escape") setEditingId(null); }}
                      />
                      <button onClick={() => handleRenameCat(cat.id)} aria-label="Save" className="text-primary p-1"><Check className="h-3.5 w-3.5" strokeWidth={1.75} /></button>
                      <button onClick={() => setEditingId(null)} aria-label="Cancel" className="text-muted-foreground p-1"><X className="h-3.5 w-3.5" strokeWidth={1.75} /></button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => { onSelectCategory(selectedCategory === cat.id ? null : cat.id); setCatsOpen(false); }}
                        className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? "bg-secondary font-semibold" : "hover:bg-secondary"}`}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: `hsl(${cat.color})` }} />
                        <span className="truncate">{cat.name}</span>
                      </button>
                      <div className="hidden group-hover/cat:flex items-center gap-0.5 pr-1">
                        <button onClick={(e) => { e.stopPropagation(); setEditingId(cat.id); setEditName(cat.name); }} aria-label="Rename" className="text-muted-foreground hover:text-foreground p-1"><Pencil className="h-3 w-3" strokeWidth={1.75} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat.id); }} aria-label="Delete" className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-3 w-3" strokeWidth={1.75} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div className="my-1 border-t border-border" />
              {adding ? (
                <div className="space-y-1 px-2 py-1">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Category name…"
                    aria-label="New category name"
                    className="h-8 text-xs rounded-lg"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddCat(); if (e.key === "Escape") { setAdding(false); setNewName(""); setNewParent(""); } }}
                  />
                  <div className="flex items-center gap-1">
                    <select
                      value={newParent}
                      onChange={(e) => setNewParent(e.target.value)}
                      aria-label="Parent category"
                      className="h-8 text-xs flex-1 rounded-lg border border-input bg-background px-2 text-foreground"
                    >
                      <option value="">Top level</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>↳ under {c.name}</option>)}
                    </select>
                    <button onClick={handleAddCat} aria-label="Save" className="text-primary p-1"><Check className="h-3.5 w-3.5" strokeWidth={1.75} /></button>
                    <button onClick={() => { setAdding(false); setNewName(""); setNewParent(""); }} aria-label="Cancel" className="text-muted-foreground p-1"><X className="h-3.5 w-3.5" strokeWidth={1.75} /></button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAdding(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary hover:bg-secondary transition-colors">
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  New category
                </button>
              )}
            </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open settings menu"
            aria-expanded={menuOpen}
            className={menuOpen ? cellActive : cellIdle}
          >
            <Settings className="h-5 w-5" strokeWidth={1.75} />
          </button>
          {menuOpen && (
            <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-50 flex justify-center pointer-events-none px-4">
            <div className="w-full max-w-xs bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl shadow-foreground/10 p-1.5 animate-scale-in origin-bottom pointer-events-auto">

              <button onClick={() => { setMenuOpen(false); onExport(); }} className={menuItem}>
                <Download className="h-4 w-4 text-primary" strokeWidth={1.75} /> Export backup
              </button>
              <button onClick={() => { setMenuOpen(false); onImport(); }} className={menuItem}>
                <Upload className="h-4 w-4 text-primary" strokeWidth={1.75} /> Import backup
              </button>
              <button onClick={() => { setMenuOpen(false); onImportText(); }} className={menuItem}>
                <FileText className="h-4 w-4 text-primary" strokeWidth={1.75} /> Import from text
              </button>
              <div className="my-1 border-t border-border" />
              {onSortChange && (
                <label className={`${menuItem} cursor-pointer relative`}>
                  <ArrowUpDown className="h-4 w-4 text-primary" strokeWidth={1.75} /> Sort by
                  <select
                    value={sortBy}
                    onChange={(e) => { setMenuOpen(false); onSortChange(e.target.value as SortOption); }}
                    aria-label="Sort prompts"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  >
                    <option value="default">Manual order</option>
                    <option value="name">Name A-Z</option>
                    <option value="date">Newest</option>
                    <option value="recent">Recently used</option>
                    <option value="used">Most used</option>
                  </select>
                </label>
              )}
              {onToggleSelect && (
                <button
                  onClick={() => { setMenuOpen(false); onToggleSelect(); }}
                  className={menuItem}
                >
                  <CheckSquare className={`h-4 w-4 ${selectMode ? "text-primary" : "text-primary"}`} strokeWidth={1.75} />
                  {selectMode ? "Cancel selection" : "Select prompts"}
                </button>
              )}
              <div className="my-1 border-t border-border" />
              <button onClick={() => { setMenuOpen(false); onManageTags(); }} className={menuItem}>
                <Tags className="h-4 w-4 text-primary" strokeWidth={1.75} /> Manage tags
              </button>
              <button onClick={onToggleTheme} className={menuItem}>
                {themeDark ? <Sun className="h-4 w-4 text-primary" strokeWidth={1.75} /> : <Moon className="h-4 w-4 text-primary" strokeWidth={1.75} />}
                {themeDark ? "Light mode" : "Dark mode"}
              </button>
            </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
