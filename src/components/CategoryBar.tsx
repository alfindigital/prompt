import { ReactNode, useState } from "react";
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
  leading?: ReactNode;
}

export function CategoryBar({ categories, selectedCategory, onSelectCategory, onDataChange, leading }: CategoryBarProps) {
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
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      {leading}
      <button
        onClick={() => onSelectCategory(null)}
        className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
          selectedCategory === null
            ? "bg-ink text-ink-foreground"
            : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
        }`}
      >
        All Prompts
      </button>
      {categories.map((cat) => (
        <div key={cat.id} className="relative group/cat shrink-0">
          {editingId === cat.id ? (
            <div className="flex items-center gap-1 bg-secondary rounded-full pl-3 pr-1 py-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                aria-label="Rename category"
                className="h-7 text-xs w-28 rounded-full border-0 bg-transparent focus-visible:ring-0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(cat.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
              />
              <button onClick={() => handleRename(cat.id)} aria-label="Save" className="text-primary p-1">
                <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <button onClick={() => setEditingId(null)} aria-label="Cancel" className="text-muted-foreground p-1">
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <button
                onClick={() => onSelectCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? "bg-ink text-ink-foreground"
                    : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: `hsl(${cat.color})` }}
                />
                {cat.name}
              </button>
              <div className="hidden group-hover/cat:flex items-center gap-0.5 ml-1">
                <button
                  onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                  aria-label="Rename"
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <Pencil className="h-3 w-3" strokeWidth={1.75} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  aria-label="Delete"
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {adding ? (
        <div className="flex items-center gap-1 bg-secondary rounded-full pl-3 pr-1 py-1 shrink-0">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name..."
            aria-label="New category name"
            className="h-7 text-xs w-28 rounded-full border-0 bg-transparent focus-visible:ring-0"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") { setAdding(false); setNewName(""); }
            }}
          />
          <button onClick={handleAdd} aria-label="Save" className="text-primary p-1">
            <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button onClick={() => { setAdding(false); setNewName(""); }} aria-label="Cancel" className="text-muted-foreground p-1">
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 border-2 border-dashed border-border text-primary hover:border-primary rounded-full text-sm font-semibold whitespace-nowrap transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New
        </button>
      )}
    </div>
  );
}
