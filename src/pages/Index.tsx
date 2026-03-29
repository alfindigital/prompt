import { useState, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { QuickAddForm } from "@/components/QuickAddForm";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { CategoryBar } from "@/components/CategoryBar";
import { PromptCard } from "@/components/PromptCard";
import { EmptyState } from "@/components/EmptyState";
import { getPrompts, getAllTags, getCategories } from "@/lib/prompts-store";

const Index = () => {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const prompts = useMemo(() => getPrompts(), [version]);
  const allTags = useMemo(() => getAllTags(), [version]);
  const categories = useMemo(() => getCategories(), [version]);

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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
    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    return result;
  }, [prompts, search, selectedTag, selectedCategory]);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <Header onDataChange={refresh} />

        <div className="space-y-5">
          <QuickAddForm onAdd={refresh} defaultCategory={selectedCategory} />

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <PromptCard key={p.id} prompt={p} onUpdate={refresh} categories={categories} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
