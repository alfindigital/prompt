import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prompt, Category } from "@/lib/types";
import { updatePrompt, deletePrompt, duplicatePrompt } from "@/lib/prompts-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Copy, Trash2, Pencil, Check, X, Files } from "lucide-react";

interface PromptCardProps {
  prompt: Prompt;
  onUpdate: () => void;
  categories: Category[];
}

export function PromptCard({ prompt, onUpdate, categories }: PromptCardProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(prompt.title);
  const [editContent, setEditContent] = useState(prompt.content);
  const [editTags, setEditTags] = useState(prompt.tags.join(", "));
  const [editCategory, setEditCategory] = useState<string | null>(prompt.category);

  const category = categories.find((c) => c.id === prompt.category);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    updatePrompt(prompt.id, { last_used_at: new Date().toISOString() });
    onUpdate();
    toast.success("Copied to clipboard");
  };

  const handleFavorite = () => {
    updatePrompt(prompt.id, { is_favorite: !prompt.is_favorite });
    onUpdate();
  };

  const handleDelete = () => {
    const removed = deletePrompt(prompt.id);
    onUpdate();
    toast("Prompt deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          if (removed) {
            const all = JSON.parse(localStorage.getItem("prompt-library-prompts") || "[]");
            all.push(removed);
            localStorage.setItem("prompt-library-prompts", JSON.stringify(all));
            onUpdate();
            toast.success("Restored");
          }
        },
      },
    });
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("Title and content are required");
      return;
    }
    const tags = editTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    updatePrompt(prompt.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      tags,
      category: editCategory,
    });
    setEditing(false);
    onUpdate();
    toast.success("Prompt updated");
  };

  const handleCancelEdit = () => {
    setEditTitle(prompt.title);
    setEditContent(prompt.content);
    setEditTags(prompt.tags.join(", "));
    setEditCategory(prompt.category);
    setEditing(false);
  };

  return (
    <div className="group rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      {editing ? (
        <>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="font-medium"
            autoFocus
          />
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            className="resize-none text-sm"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="text-sm flex-1"
            />
            <select
              value={editCategory || ""}
              onChange={(e) => setEditCategory(e.target.value || null)}
              className="text-sm rounded-md border border-input bg-background px-3 py-2 text-foreground w-full sm:w-auto"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1.5 justify-end">
            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit}>
              <Check className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {category && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full mb-1"
                  style={{
                    backgroundColor: `hsl(${category.color} / 0.15)`,
                    color: `hsl(${category.color})`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(${category.color})` }} />
                  {category.name}
                </span>
              )}
              <h3 className="font-semibold text-sm leading-snug">{prompt.title}</h3>
            </div>
            <button onClick={handleFavorite} className="shrink-0 mt-0.5" aria-label="Toggle favorite">
              <Star
                className={`h-4 w-4 transition-colors ${
                  prompt.is_favorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground hover:text-yellow-400"
                }`}
              />
            </button>
          </div>

          <div className="prose-prompt text-sm line-clamp-4 overflow-hidden">
            <ReactMarkdown>{prompt.content}</ReactMarkdown>
          </div>

          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-[11px] text-muted-foreground">
              {prompt.last_used_at
                ? `Used ${new Date(prompt.last_used_at).toLocaleDateString()}`
                : new Date(prompt.created_at).toLocaleDateString()}
            </span>
            <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                duplicatePrompt(prompt.id);
                onUpdate();
                toast.success("Prompt duplicated");
              }}>
                <Files className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
