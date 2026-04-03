import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Category } from "@/lib/types";
import { addCategory, deleteCategory, renameCategory } from "@/lib/prompts-store";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  onDataChange: () => void;
}

export function CategoryBar({ categories, selectedCategory, onSelectCategory, onDataChange }: CategoryBarProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
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

  const handleDelete = (id: string) => {
    deleteCategory(id);
    if (selectedCategory === id) onSelectCategory(null);
    onDataChange();
    toast.success("Category deleted");
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) return;
    renameCategory(id, editName.trim());
    setEditingId(null);
    onDataChange();
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Categories</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
            selectedCategory === null
              ? "gradient-bg text-white shadow-sm glow-primary"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-0.5 group/cat">
            {editingId === cat.id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-7 text-xs w-24 rounded-full"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(cat.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <button onClick={() => handleRename(cat.id)} className="text-primary hover:text-primary/80">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onSelectCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? "shadow-sm text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  style={
                    selectedCategory === cat.id
                      ? { backgroundColor: `hsl(${cat.color})` }
                      : undefined
                  }
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${cat.color})` }}
                  />
                  {cat.name}
                </button>
                <div className="hidden group-hover/cat:flex items-center">
                  <button
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                    className="text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-muted-foreground hover:text-destructive p-0.5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {adding ? (
          <div className="flex items-center gap-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name..."
              className="h-7 text-xs w-24 rounded-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setAdding(false); setNewName(""); }
              }}
            />
            <button onClick={handleAdd} className="text-primary hover:text-primary/80">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => { setAdding(false); setNewName(""); }} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            New
          </button>
        )}
      </div>
    </div>
  );
}
