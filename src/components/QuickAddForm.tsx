import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addPrompt, getCategories } from "@/lib/prompts-store";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface QuickAddFormProps {
  onAdd: () => void;
  defaultCategory?: string | null;
  forceExpanded?: boolean;
}

export function QuickAddForm({ onAdd, defaultCategory = null, forceExpanded = false }: QuickAddFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(defaultCategory);
  const [expanded, setExpanded] = useState(forceExpanded);

  const categories = getCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    addPrompt({ title: title.trim(), content: content.trim(), tags, category: categoryId });
    setTitle("");
    setContent("");
    setTagsInput("");
    setCategoryId(defaultCategory);
    setExpanded(false);
    onAdd();
    toast.success("Prompt added");
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors p-4 flex items-center gap-3 text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Add a new prompt...</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4 space-y-3 shadow-sm">
      <Input
        placeholder="Prompt title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="font-medium"
      />
      <Textarea
        placeholder="Prompt content (supports markdown)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="resize-none text-sm"
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Tags (comma-separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="text-sm flex-1"
        />
        {categories.length > 0 && (
          <select
            value={categoryId || ""}
            onChange={(e) => setCategoryId(e.target.value || null)}
            className="text-sm rounded-md border border-input bg-background px-3 py-2 text-foreground w-full sm:w-auto"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Prompt
        </Button>
      </div>
    </form>
  );
}
