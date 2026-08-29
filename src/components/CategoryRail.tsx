import { useState } from "react";
import { Plus, Check, X, Pencil, Trash2 } from "lucide-react";
import { Category } from "@/lib/types";
import { addCategory, deleteCategory, renameCategory, getCategoryTree } from "@/lib/prompts-store";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CategoryRailProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  onDataChange: () => void;
  totalCount: number;
}

export function CategoryRail({
  categories, selectedCategory, onSelectCategory, onDataChange, totalCount,
}: CategoryRailProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const tree = getCategoryTree();

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Category already exists");
      return;
    }
    addCategory(name, null);
    setNewName("");
    setAdding(false);
    onDataChange();
    toast.success("Category created");
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    renameCategory(id, editName.trim());
    setEditingId(null);
    onDataChange();
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    if (selectedCategory === id) onSelectCategory(null);
    onDataChange();
    toast.success("Category deleted");
  };

  const chipBase = "shrink-0 h-9 inline-flex items-center gap-2 px-4 rounded-full text-[13px] font-medium transition-all border";
  const chipIdle = "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-foreground";
  const chipActive = "border-transparent bg-ink text-ink-foreground";

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0 py-1">
      <button
        onClick={() => onSelectCategory(null)}
        className={`${chipBase} ${selectedCategory === null ? chipActive : chipIdle}`}
      >
        All
        <span className={`text-[10px] font-semibold tabular-nums ${selectedCategory === null ? "text-ink-foreground/60" : "text-foreground/40"}`}>
          {totalCount}
        </span>
      </button>

      {tree.map(({ category: cat }) => {
        const isActive = selectedCategory === cat.id;
        const isEditing = editingId === cat.id;
        return (
          <div key={cat.id} className="shrink-0 group/cat relative flex items-center">
            {isEditing ? (
              <div className="flex items-center gap-1 bg-card border border-primary/40 rounded-full pl-3 pr-1 h-9">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  aria-label="Rename category"
                  className="h-7 text-xs w-32 border-0 focus-visible:ring-0 px-0"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(cat.id); if (e.key === "Escape") setEditingId(null); }}
                />
                <button onClick={() => handleRename(cat.id)} aria-label="Save" className="text-primary p-1"><Check className="h-3.5 w-3.5" /></button>
                <button onClick={() => setEditingId(null)} aria-label="Cancel" className="text-muted-foreground p-1"><X className="h-3.5 w-3.5" /></button>
              </div>
            ) : (
              <button
                onClick={() => onSelectCategory(isActive ? null : cat.id)}
                onDoubleClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                className={`${chipBase} ${isActive ? chipActive : chipIdle}`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: `hsl(${cat.color})` }}
                />
                {cat.name}
              </button>
            )}
            {isActive && !isEditing && (
              <div className="hidden sm:flex absolute -top-2 -right-1 items-center gap-0.5 bg-card border border-border rounded-full p-0.5 shadow-sm opacity-0 group-hover/cat:opacity-100 transition-opacity">
                <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} aria-label="Rename" className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => handleDelete(cat.id)} aria-label="Delete" className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
              </div>
            )}
          </div>
        );
      })}

      {adding ? (
        <div className="shrink-0 flex items-center gap-1 bg-card border border-primary/40 rounded-full pl-3 pr-1 h-9">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name…"
            aria-label="New category name"
            className="h-7 text-xs w-36 border-0 focus-visible:ring-0 px-0"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewName(""); } }}
          />
          <button onClick={handleAdd} aria-label="Save" className="text-primary p-1"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={() => { setAdding(false); setNewName(""); }} aria-label="Cancel" className="text-muted-foreground p-1"><X className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="shrink-0 h-9 inline-flex items-center gap-1.5 px-3 rounded-full text-[13px] font-medium border border-dashed border-border text-foreground/55 hover:text-primary hover:border-primary/60 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          New
        </button>
      )}
    </div>
  );
}
