import { useState, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addPrompt, getCategories, getAllTags } from "@/lib/prompts-store";
import { MarkdownToolbar, useMarkdownShortcuts } from "@/components/MarkdownToolbar";
import { toast } from "sonner";
import { Plus, X, Eye, EyeOff } from "lucide-react";

interface QuickAddFormProps {
  onAdd: () => void;
  defaultCategory?: string | null;
  forceExpanded?: boolean;
}

export function QuickAddForm({ onAdd, defaultCategory = null, forceExpanded = false }: QuickAddFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(defaultCategory);
  const [expanded, setExpanded] = useState(forceExpanded);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const categories = getCategories();
  const existingTags = getAllTags();
  const quickAddShortcuts = useMarkdownShortcuts(contentRef, content, setContent);
  const filteredSuggestions = useMemo(() => {
    const q = tagsInput.toLowerCase().trim();
    return existingTags.filter(
      (t) => !selectedTags.includes(t) && (!q || t.includes(q))
    );
  }, [tagsInput, existingTags, selectedTags]);

  const addTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (normalized && !selectedTags.includes(normalized)) {
      setSelectedTags((prev) => [...prev, normalized]);
    }
    setTagsInput("");
    setShowTagSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagsInput.trim()) {
      e.preventDefault();
      addTag(tagsInput);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    const finalTags = [...selectedTags];
    if (tagsInput.trim()) {
      tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).forEach((t) => {
        if (!finalTags.includes(t)) finalTags.push(t);
      });
    }
    addPrompt({ title: title.trim(), content: content.trim(), tags: finalTags, category: categoryId });
    setTitle("");
    setContent("");
    setTagsInput("");
    setSelectedTags([]);
    setCategoryId(defaultCategory);
    setExpanded(false);
    onAdd();
    toast.success("Prompt added");
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-all p-5 flex items-center gap-3 text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Add a new prompt...</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
      <Input
        placeholder="Prompt title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="font-medium rounded-xl h-11"
      />
      <div className="rounded-xl border border-input bg-background p-2">
        <MarkdownToolbar textareaRef={contentRef} value={content} onChange={setContent} />
        <Textarea
          ref={contentRef}
          placeholder="Prompt content (supports markdown)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={quickAddShortcuts.handleKeyDown}
          rows={4}
          className="resize-none text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-1 min-h-[80px]"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="relative">
          <Input
            placeholder="Add tags..."
            value={tagsInput}
            onChange={(e) => { setTagsInput(e.target.value); setShowTagSuggestions(true); }}
            onFocus={() => setShowTagSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
            onKeyDown={handleTagInputKeyDown}
            className="text-sm rounded-xl"
          />
          {showTagSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full glass border rounded-xl shadow-lg max-h-32 overflow-y-auto animate-scale-in">
              {filteredSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary/5 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  onMouseDown={(e) => { e.preventDefault(); addTag(tag); }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {categories.length > 0 && (
          <select
            value={categoryId || ""}
            onChange={(e) => setCategoryId(e.target.value || null)}
            className="text-sm rounded-xl border border-input bg-background px-3 py-2 text-foreground w-full sm:w-auto"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(false)} className="rounded-xl">
          Cancel
        </Button>
        <Button type="submit" size="sm" className="rounded-xl gradient-bg border-0">
          <Plus className="h-4 w-4 mr-1" />
          Add Prompt
        </Button>
      </div>
    </form>
  );
}
