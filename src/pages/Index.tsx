import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Header } from "@/components/Header";
import { QuickAddForm } from "@/components/QuickAddForm";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { CategoryBar } from "@/components/CategoryBar";
import { SortablePromptCard } from "@/components/SortablePromptCard";
import { EmptyState } from "@/components/EmptyState";
import { BottomNav } from "@/components/BottomNav";
import { getPrompts, getAllTags, getCategories, reorderPrompts, deletePrompts } from "@/lib/prompts-store";
import { Button } from "@/components/ui/button";
import { Trash2, CheckSquare, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

type Tab = "prompts" | "add" | "settings";
type SortOption = "default" | "name" | "date" | "used";

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

  // Bulk select state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = prompts;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }
    if (selectedTags.length > 0) {
      result = result.filter((p) => selectedTags.every((t) => p.tags.includes(t)));
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (sortBy !== "default") {
      result = [...result].sort((a, b) => {
        if (sortBy === "name") return a.title.localeCompare(b.title);
        if (sortBy === "date") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === "used") {
          const aTime = a.last_used_at ? new Date(a.last_used_at).getTime() : 0;
          const bTime = b.last_used_at ? new Date(b.last_used_at).getTime() : 0;
          return bTime - aTime;
        }
        return 0;
      });
    }
    return result;
  }, [prompts, search, selectedTags, selectedCategory, sortBy]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
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

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const removed = deletePrompts(Array.from(selectedIds));
    const count = removed.length;
    setSelectedIds(new Set());
    setSelectMode(false);
    refresh();
    toast(`${count} prompt${count > 1 ? "s" : ""} deleted`, {
      action: {
        label: "Undo",
        onClick: () => {
          const all = JSON.parse(localStorage.getItem("prompt-library-prompts") || "[]");
          all.push(...removed);
          localStorage.setItem("prompt-library-prompts", JSON.stringify(all));
          refresh();
          toast.success("Restored");
        },
      },
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Header />

        <div className="space-y-5">
          {activeTab === "add" ? (
            <div key="add" className="animate-fade-in">
              <QuickAddForm onAdd={() => { refresh(); setActiveTab("prompts"); }} defaultCategory={selectedCategory} forceExpanded />
            </div>
          ) : (
            <div key="prompts" className="animate-fade-in">
              <div className="space-y-5">
              <CategoryBar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onDataChange={refresh}
              />

              {prompts.length > 0 && (
                <div className="space-y-3">
                  <SearchFilterBar
                    search={search}
                    onSearchChange={setSearch}
                    allTags={allTags}
                    selectedTags={selectedTags}
                    onTagToggle={(tag) => setSelectedTags((prev) =>
                      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                    )}
                    onClearTags={() => setSelectedTags([])}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {filtered.length} prompt{filtered.length !== 1 ? "s" : ""}
                    </span>
                    <Button
                      size="sm"
                      variant={selectMode ? "secondary" : "ghost"}
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setSelectMode(!selectMode);
                        setSelectedIds(new Set());
                      }}
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      {selectMode ? "Cancel" : "Select"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Bulk action bar */}
              {selectMode && selectedIds.size > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-fade-in">
                  <span className="text-sm font-medium text-destructive flex-1">
                    {selectedIds.size} selected
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleSelectAll}>
                    {selectedIds.size === filtered.length ? "Deselect all" : "Select all"}
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={handleBulkDelete}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              )}

              {prompts.length === 0 ? (
                <EmptyState />
              ) : filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">
                  No prompts match your search.
                </p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={filtered.map((p) => p.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filtered.map((p) => (
                        <SortablePromptCard
                          key={p.id}
                          prompt={p}
                          onUpdate={refresh}
                          categories={categories}
                          selectMode={selectMode}
                          selected={selectedIds.has(p.id)}
                          onToggleSelect={toggleSelect}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} onDataChange={refresh} />
    </div>
  );
};

export default Index;
