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
import { getPrompts, getAllTags, getCategories, reorderPrompts } from "@/lib/prompts-store";

type Tab = "prompts" | "add" | "settings";

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
    return result;
  }, [prompts, search, selectedTags, selectedCategory]);

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
                <SearchFilterBar
                  search={search}
                  onSearchChange={setSearch}
                  allTags={allTags}
                  selectedTag={selectedTag}
                  onTagSelect={setSelectedTag}
                />
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
                        <SortablePromptCard key={p.id} prompt={p} onUpdate={refresh} categories={categories} />
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
