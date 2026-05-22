import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prompt, Category } from "@/lib/types";
import { updatePrompt, deletePrompt, duplicatePrompt } from "@/lib/prompts-store";
import { MarkdownToolbar, useMarkdownShortcuts } from "@/components/MarkdownToolbar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Copy, Trash2, Pencil, Check, X, Files, Share2, Link, FileText, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const editContentRef = useRef<HTMLTextAreaElement>(null);
  const editShortcuts = useMarkdownShortcuts(editContentRef, editContent, setEditContent);

  const category = categories.find((c) => c.id === prompt.category);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    updatePrompt(prompt.id, { last_used_at: new Date().toISOString() });
    onUpdate();
    toast.success("Copied to clipboard");
  };

  const handleCopyFormatted = async () => {
    const lines = [`# ${prompt.title}`, ""];
    if (prompt.tags.length > 0) lines.push(`Tags: ${prompt.tags.join(", ")}`, "");
    lines.push(prompt.content);
    await navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Copied as formatted text");
  };

  const handleShareLink = async () => {
    const payload = {
      title: prompt.title,
      content: prompt.content,
      tags: prompt.tags,
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const url = `${window.location.origin}${window.location.pathname}?shared=${encoded}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard");
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
    <div className="group rounded-2xl border bg-card p-4 sm:p-5 card-hover flex flex-col gap-3">
      {editing ? (
        <>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="font-medium rounded-xl"
            autoFocus
          />
          <div className="rounded-xl border border-input bg-background p-2">
            <MarkdownToolbar textareaRef={editContentRef} value={editContent} onChange={setEditContent} />
            <Textarea
              ref={editContentRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={editShortcuts.handleKeyDown}
              rows={4}
              className="resize-none text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-1 min-h-[80px]"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="text-sm flex-1 rounded-xl"
            />
            <select
              value={editCategory || ""}
              onChange={(e) => setEditCategory(e.target.value || null)}
              className="text-sm rounded-xl border border-input bg-background px-3 py-2 text-foreground w-full sm:w-auto"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-1.5 justify-end">
            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="rounded-xl">
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} className="rounded-xl gradient-bg border-0">
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
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5"
                  style={{
                    backgroundColor: `hsl(${category.color} / 0.12)`,
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
                    : "text-muted-foreground/40 hover:text-yellow-400"
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
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <span className="text-[10px] text-muted-foreground/60">
              {prompt.last_used_at
                ? `Used ${new Date(prompt.last_used_at).toLocaleDateString()}`
                : new Date(prompt.created_at).toLocaleDateString()}
            </span>
            <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg">
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={handleCopyFormatted} className="gap-2 text-xs">
                    <FileText className="h-3.5 w-3.5" />
                    Copy as formatted text
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareLink} className="gap-2 text-xs">
                    <Link className="h-3.5 w-3.5" />
                    Copy share link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => {
                duplicatePrompt(prompt.id);
                onUpdate();
                toast.success("Prompt duplicated");
              }}>
                <Files className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
