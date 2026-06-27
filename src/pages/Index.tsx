import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Header } from "@/components/Header";
import { BottomBar } from "@/components/BottomBar";
import { QuickAddForm } from "@/components/QuickAddForm";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { SortablePromptCard } from "@/components/SortablePromptCard";
import { EmptyState } from "@/components/EmptyState";
import { CommandPalette } from "@/components/CommandPalette";
import { FillVariablesDialog } from "@/components/FillVariablesDialog";
import { SharedPromptDialog } from "@/components/SharedPromptDialog";
import { TagManager } from "@/components/TagManager";
import { ImportTextDialog } from "@/components/ImportTextDialog";
import { SnapshotsDialog } from "@/components/SnapshotsDialog";
import { DataSafetyBanner } from "@/components/DataSafetyBanner";
import {
  getPrompts, getAllTags, getCategories, reorderPrompts, deletePrompts, addPrompt,
  markUsed, bulkSetCategory, bulkAddTags, bulkSetFavorite, restorePrompts,
  getCategoryWithDescendants, exportPrompts, importPrompts,
} from "@/lib/prompts-store";
import { maybeSnapshot, markExported } from "@/lib/backup";
import { loadStarterPack } from "@/lib/starter-prompts";
import { decodeSharedPrompt, type SharedPromptPayload } from "@/lib/share";
import { hasVariables } from "@/lib/variables";
import { isDark, toggleTheme as toggleThemeFn } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, CheckSquare, Check, Search, Star, X, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import type { Prompt } from "@/lib/types";

type Tab = "prompts" | "add" | "settings";
type SortOption = "default" | "name" | "date" | "recent" | "used";
const SORT_OPTIONS: SortOption[] = ["default", "name", "date", "recent", "used"];
const MAX_BYTES = 5 * 1024 * 1024;

const Index = () => {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const [activeTab, setActiveTab] = useState<Tab>("prompts");

  const prompts = useMemo(() => getPrompts(), [version]);
  const allTags = useMemo(() => getAllTags(), [version]);
  const categories = useMemo(() => getCategories(), [version]);

  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkTag, setBulkTag] = useState("");

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [fillPrompt, setFillPrompt] = useState<Prompt | null>(null);
  const [sharedPayload, setSharedPayload] = useState<SharedPromptPayload | null>(null);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [importTextOpen, setImportTextOpen] = useState(false);
  const [snapshotsOpen, setSnapshotsOpen] = useState(false);
  const [themeDark, setThemeDark] = useState(false);

  const hydratedRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const topSearchRef = useRef<HTMLInputElement>(null);

  // --- Hydrate state from the URL once, handle shared links + manifest shortcuts ---
  useEffect(() => {
    setThemeDark(isDark());
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setSearch(q);
    const cat = params.get("cat");
    if (cat) setSelectedCategory(cat);
    const tags = params.get("tags");
    if (tags) setSelectedTags(tags.split(",").filter(Boolean));
    const sort = params.get("sort");
    if (sort && SORT_OPTIONS.includes(sort as SortOption)) setSortBy(sort as SortOption);

    const action = params.get("action");
    if (action === "new") setActiveTab("add");
    if (action === "search") requestAnimationFrame(() => topSearchRef.current?.focus());

    const shared = params.get("shared");
    if (shared) {
      const payload = decodeSharedPrompt(shared);
      if (payload) setSharedPayload(payload);
      else toast.error("Invalid share link");
    }

    maybeSnapshot();
    hydratedRef.current = true;
  }, []);

  // --- Reflect filter/sort state into the URL so views are bookmarkable ---
  useEffect(() => {
    if (!hydratedRef.current) return;
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (selectedCategory) params.set("cat", selectedCategory);
    if (selectedTags.length) params.set("tags", selectedTags.join(","));
    if (sortBy !== "default") params.set("sort", sortBy);
    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [search, selectedCategory, selectedTags, sortBy]);

  const filtered = useMemo(() => {
    let result = prompts;
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query) ||
          p.tags.some((t) => t.includes(query))
      );
    }
    if (selectedTags.length > 0) {
      result = result.filter((p) => selectedTags.every((t) => p.tags.includes(t)));
    }
    if (selectedCategory) {
      const ids = new Set(getCategoryWithDescendants(selectedCategory));
      result = result.filter((p) => p.category && ids.has(p.category));
    }
    if (sortBy !== "default") {
      result = [...result].sort((a, b) => {
        if (sortBy === "name") return a.title.localeCompare(b.title);
        if (sortBy === "date") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === "recent") {
          const aTime = a.last_used_at ? new Date(a.last_used_at).getTime() : 0;
          const bTime = b.last_used_at ? new Date(b.last_used_at).getTime() : 0;
          return bTime - aTime;
        }
        if (sortBy === "used") {
          const diff = (b.use_count ?? 0) - (a.use_count ?? 0);
          if (diff !== 0) return diff;
          const aTime = a.last_used_at ? new Date(a.last_used_at).getTime() : 0;
          const bTime = b.last_used_at ? new Date(b.last_used_at).getTime() : 0;
          return bTime - aTime;
        }
        return 0;
      });
    }
    return result;
  }, [prompts, search, selectedTags, selectedCategory, sortBy]);

  const filtersActive = !!search.trim() || selectedTags.length > 0 || !!selectedCategory;
  const dragDisabled = sortBy !== "default" || filtersActive;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = filtered.findIndex((p) => p.id === active.id);
      const newIndex = filtered.findIndex((p) => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = [...filtered];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);
      reorderPrompts(newOrder.map((p) => p.id));
      refresh();
    },
    [filtered, refresh]
  );

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab !== "prompts") {
      setSelectMode(false);
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedTags([]);
    setSelectedCategory(null);
  }, []);

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
    setBulkConfirm(false);
    setBulkTag("");
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const removed = deletePrompts(Array.from(selectedIds));
    const count = removed.length;
    exitSelectMode();
    refresh();
    toast(`${count} prompt${count > 1 ? "s" : ""} deleted`, {
      action: {
        label: "Undo",
        onClick: () => {
          restorePrompts(removed);
          refresh();
          toast.success("Restored");
        },
      },
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((p) => p.id)));
  };

  const ids = () => Array.from(selectedIds);
  const handleBulkCategory = (value: string) => {
    bulkSetCategory(ids(), value || null);
    refresh();
    toast.success(value ? "Moved to category" : "Category removed");
  };
  const handleBulkAddTag = () => {
    const t = bulkTag.trim();
    if (!t) return;
    bulkAddTags(ids(), [t]);
    setBulkTag("");
    refresh();
    toast.success(`Tagged ${selectedIds.size} prompts “${t.toLowerCase()}”`);
  };
  const handleBulkFavorite = () => {
    bulkSetFavorite(ids(), true);
    refresh();
    toast.success("Added to favorites");
  };

  // --- Export / import (lifted so the palette + banner can trigger them) ---
  const handleExport = useCallback(() => {
    const data = exportPrompts();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompts-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    markExported();
    refresh();
    toast.success(`Exported ${data.prompts.length} prompts`);
  }, [refresh]);

  const handleImportClick = useCallback(() => fileRef.current?.click(), []);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (!/\.json$/i.test(file.name)) return toast.error("File must be a .json backup");
    if (file.size === 0) return toast.error("Backup file is empty");
    if (file.size > MAX_BYTES) return toast.error("Backup too large (max 5 MB)");

    const reader = new FileReader();
    reader.onerror = () => toast.error("Could not read file");
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text !== "string") return toast.error("Could not read file contents");
      let raw: unknown;
      try { raw = JSON.parse(text); }
      catch (err) {
        return toast.error("Invalid JSON", { description: err instanceof Error ? err.message : "unknown" });
      }
      try {
        const result = importPrompts(raw);
        refresh();
        const parts: string[] = [];
        if (result.promptsAdded) parts.push(`${result.promptsAdded} added`);
        if (result.promptsUpdated) parts.push(`${result.promptsUpdated} updated`);
        if (result.categoriesAdded) parts.push(`${result.categoriesAdded} categories`);
        toast.success("Backup restored", { description: parts.length ? parts.join(" · ") : "No new prompts" });
      } catch (err) {
        toast.error("Backup is not valid", { description: err instanceof Error ? err.message : "Unknown error" });
      }
    };
    reader.readAsText(file);
  };

  const handleToggleTheme = useCallback(() => {
    setThemeDark(toggleThemeFn());
  }, []);

  const handleLoadStarter = () => {
    const count = loadStarterPack();
    refresh();
    toast.success(`Added ${count} starter prompts`);
  };

  const handleNewPrompt = () => handleTabChange("add");

  // Palette: copy a prompt, or open the fill dialog if it has variables.
  const handleCopyPrompt = (p: Prompt) => {
    if (hasVariables(p.content)) {
      setFillPrompt(p);
      return;
    }
    navigator.clipboard.writeText(p.content).then(
      () => { markUsed(p.id); refresh(); toast.success("Copied to clipboard"); },
      () => toast.error("Couldn't copy")
    );
  };

  const saveShared = () => {
    if (!sharedPayload) return;
    addPrompt({
      title: sharedPayload.title,
      content: sharedPayload.content,
      tags: sharedPayload.tags,
      category: null,
    });
    refresh();
    setSharedPayload(null);
    window.history.replaceState({}, "", window.location.pathname);
    toast.success(`Saved “${sharedPayload.title}”`);
  };
  const dismissShared = () => {
    setSharedPayload(null);
    window.history.replaceState({}, "", window.location.pathname);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onBrandClick={() => handleTabChange("prompts")} />

      <input
        ref={fileRef}
        type="file"
        accept=".json"
        aria-label="Import prompts JSON file"
        className="hidden"
        onChange={handleImportFile}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-6 pb-32 sm:pb-36" aria-label="Prompt library">
        {activeTab === "add" ? (
          <div key="add" className="animate-enter">
            <QuickAddForm onAdd={() => { refresh(); setActiveTab("prompts"); }} defaultCategory={selectedCategory} forceExpanded />
          </div>
        ) : (
          <div key="prompts" className="animate-enter space-y-5">
            <DataSafetyBanner promptCount={prompts.length} onExport={handleExport} version={version} />

            {prompts.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm px-3 py-2.5 sm:px-4 sm:py-3 space-y-3">
                {/* Visible search — discoverable, syncs with the dock + ?q= */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none" strokeWidth={1.75} />
                  <Input
                    ref={topSearchRef}
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search prompts…"
                    aria-label="Search prompts"
                    className="h-9 pl-9 rounded-xl text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <SearchFilterBar
                      allTags={allTags}
                      selectedTags={selectedTags}
                      onTagToggle={(tag) => setSelectedTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )}
                      onClearTags={() => setSelectedTags([])}
                    />
                    <span className="text-[11px] font-semibold text-foreground/55 uppercase tracking-wider shrink-0">
                      {filtered.length} prompt{filtered.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      aria-label="Sort prompts"
                      className="h-8 text-xs font-semibold rounded-full bg-secondary border-0 px-3 pr-7 text-foreground focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="default">Manual order</option>
                      <option value="name">Name A-Z</option>
                      <option value="date">Newest</option>
                      <option value="recent">Recently used</option>
                      <option value="used">Most used</option>
                    </select>
                    <Button
                      size="sm"
                      variant={selectMode ? "secondary" : "ghost"}
                      className="h-8 text-xs gap-1.5 rounded-full font-semibold px-3"
                      onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
                    >
                      <CheckSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {selectMode ? "Cancel" : "Select"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk action bar */}
            {selectMode && selectedIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-secondary/60 border border-border animate-fade-in">
                <span className="text-sm font-semibold flex-1 min-w-[8rem]">{selectedIds.size} selected</span>
                <Button size="sm" variant="ghost" className="h-8 text-xs rounded-lg" onClick={handleSelectAll}>
                  {selectedIds.size === filtered.length ? "Deselect all" : "Select all"}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 rounded-lg" onClick={handleBulkFavorite}>
                  <Star className="h-3.5 w-3.5" /> Favorite
                </Button>
                <select
                  defaultValue=""
                  aria-label="Move selected to category"
                  onChange={(e) => { handleBulkCategory(e.target.value); e.target.value = ""; }}
                  className="h-8 text-xs font-semibold rounded-lg bg-background border border-border px-2 text-foreground"
                >
                  <option value="" disabled>Move to…</option>
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <Input
                    value={bulkTag}
                    onChange={(e) => setBulkTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleBulkAddTag(); }}
                    placeholder="add tag…"
                    aria-label="Add tag to selected"
                    className="h-8 w-24 text-xs rounded-lg"
                  />
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs gap-1 rounded-lg"
                  onClick={() => {
                    if (!bulkConfirm) {
                      setBulkConfirm(true);
                      window.setTimeout(() => setBulkConfirm(false), 3000);
                      return;
                    }
                    setBulkConfirm(false);
                    handleBulkDelete();
                  }}
                >
                  {bulkConfirm ? <><Check className="h-3.5 w-3.5" strokeWidth={2.25} /> Confirm</> : <><Trash2 className="h-3.5 w-3.5" /> Delete</>}
                </Button>
              </div>
            )}

            <h2 className="sr-only">Your prompts</h2>
            {prompts.length === 0 ? (
              <EmptyState onNewPrompt={handleNewPrompt} onLoadStarter={handleLoadStarter} />
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-sm text-foreground/55">No prompts match your search.</p>
                <Button variant="secondary" size="sm" className="rounded-xl gap-1.5" onClick={clearFilters}>
                  <X className="h-3.5 w-3.5" /> Clear filters
                </Button>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filtered.map((p) => p.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {filtered.map((p, i) => (
                      <div
                        key={p.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${Math.min(i, 12) * 35}ms`, animationFillMode: "backwards" }}
                      >
                        <SortablePromptCard
                          prompt={p}
                          onUpdate={refresh}
                          categories={categories}
                          selectMode={selectMode}
                          selected={selectedIds.has(p.id)}
                          onToggleSelect={toggleSelect}
                          dragDisabled={dragDisabled}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}
      </main>

      <BottomBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onDataChange={refresh}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        search={search}
        onSearchChange={setSearch}
        themeDark={themeDark}
        onToggleTheme={handleToggleTheme}
        onExport={handleExport}
        onImport={handleImportClick}
        onImportText={() => setImportTextOpen(true)}
        onManageTags={() => setTagManagerOpen(true)}
        onRestoreSnapshots={() => setSnapshotsOpen(true)}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        prompts={prompts}
        categories={categories}
        onNewPrompt={handleNewPrompt}
        onSelectCategory={setSelectedCategory}
        onCopyPrompt={handleCopyPrompt}
        onClearFilters={clearFilters}
        onExport={handleExport}
        onImport={handleImportClick}
        onToggleTheme={handleToggleTheme}
      />

      {fillPrompt && (
        <FillVariablesDialog
          open={!!fillPrompt}
          onOpenChange={(o) => { if (!o) setFillPrompt(null); }}
          title={fillPrompt.title}
          content={fillPrompt.content}
          onCopied={() => { markUsed(fillPrompt.id); refresh(); }}
        />
      )}

      <SharedPromptDialog payload={sharedPayload} onSave={saveShared} onDismiss={dismissShared} />
      <TagManager open={tagManagerOpen} onOpenChange={setTagManagerOpen} onUpdate={refresh} version={version} />
      <ImportTextDialog open={importTextOpen} onOpenChange={setImportTextOpen} onUpdate={refresh} />
      <SnapshotsDialog open={snapshotsOpen} onOpenChange={setSnapshotsOpen} onUpdate={refresh} />
    </div>
  );
};

export default Index;
