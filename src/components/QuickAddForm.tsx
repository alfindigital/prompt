import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addPrompt } from "@/lib/prompts-store";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface QuickAddFormProps {
  onAdd: () => void;
}

export function QuickAddForm({ onAdd }: QuickAddFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [expanded, setExpanded] = useState(false);

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
    addPrompt({ title: title.trim(), content: content.trim(), tags });
    setTitle("");
    setContent("");
    setTagsInput("");
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
      <Input
        placeholder="Tags (comma-separated)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        className="text-sm"
      />
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(false)}
        >
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
