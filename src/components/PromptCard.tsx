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
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimerRef = useRef<number | null>(null);

  const [editTitle, setEditTitle] = useState(prompt.title);
  const [editContent, setEditContent] = useState(prompt.content);
  const [editTags, setEditTags] = useState(prompt.tags.join(", "));
  const [editCategory, setEditCategory] = useState<string | null>(prompt.category);
  const [editShowPreview, setEditShowPreview] = useState(false);
  const editContentRef = useRef<HTMLTextAreaElement>(null);
  const editShortcuts = useMarkdownShortcuts(editContentRef, editContent, setEditContent);

  const category = categories.find((c) => c.id === prompt.category);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    updatePrompt(prompt.id, { last_used_at: new Date().toISOString() });
    onUpdate();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
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

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = window.setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current);
    setConfirmDelete(false);
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
    <div className="group bg-card border border-border p-5 sm:p-6 rounded-[28px] card-hover flex flex-col">
      {editing ? (
        <>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            aria-label="Prompt title"
            className="font-display font-bold text-lg rounded-xl mb-3"
            autoFocus
          />
          <div className="rounded-xl border border-input bg-background p-2 mb-3">
            <div className="flex items-center justify-between gap-2">
              <MarkdownToolbar textareaRef={editContentRef} value={editContent} onChange={setEditContent} />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditShowPreview((v) => !v)}
                className="h-7 px-2 text-xs rounded-lg shrink-0"
                title={editShowPreview ? "Hide preview" : "Show preview"}
              >
                {editShowPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span className="ml-1 hidden sm:inline">Preview</span>
              </Button>
            </div>
            <div className={editShowPreview ? "grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1" : ""}>
              <Textarea
                ref={editContentRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={editShortcuts.handleKeyDown}
                aria-label="Prompt content"
                rows={4}
                className="resize-none text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-1 min-h-[80px]"
              />
              {editShowPreview && (
                <div className="prose-prompt text-sm p-1 min-h-[80px] border-l sm:pl-3 border-border/40 overflow-auto">
                  {editContent.trim() ? (
                    <ReactMarkdown>{editContent}</ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground/50 italic">Preview will appear here...</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <Input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Tags (comma-separated)"
              aria-label="Tags"
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
            <Button size="sm" onClick={handleSaveEdit} className="rounded-xl">
              <Check className="h-3.5 w-3.5 mr-1" strokeWidth={1.75} />
              Save
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-start mb-4">
            {category ? (
              <span className="px-3 py-1 bg-secondary text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                {category.name}
              </span>
            ) : (
              <span className="px-3 py-1 bg-secondary text-foreground/50 text-[10px] font-bold uppercase tracking-wider rounded-full">
                Uncategorized
              </span>
            )}
            <button onClick={handleFavorite} aria-label="Toggle favorite" className="shrink-0">
              <Star
                className={`h-5 w-5 transition-colors ${
                  prompt.is_favorite
                    ? "fill-primary text-primary"
                    : "text-foreground/15 hover:text-primary"
                }`}
                strokeWidth={1.75}
              />
            </button>
          </div>

          <h3 className="font-display text-lg sm:text-xl font-bold mb-2 leading-tight group-hover:text-primary transition-colors">
            {prompt.title}
          </h3>

          <div className="prose-prompt text-sm line-clamp-3 mb-6 text-foreground/60 leading-relaxed flex-1">
            <ReactMarkdown>{prompt.content}</ReactMarkdown>
          </div>

          <div className="mt-auto pt-5 border-t border-border flex items-center justify-between gap-2">
            <div className="flex gap-2 flex-wrap min-w-0">
              {prompt.tags.length > 0 ? (
                prompt.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-foreground/30">
                  {prompt.last_used_at
                    ? `Used ${new Date(prompt.last_used_at).toLocaleDateString()}`
                    : new Date(prompt.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={handleCopy}
                aria-label={copied ? "Copied" : "Copy prompt"}
                className={`p-2 rounded-xl transition-all ${
                  copied
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {copied ? (
                  <Check className="h-4 w-4 animate-fade-in" strokeWidth={2.25} />
                ) : (
                  <Copy className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Share prompt"
                    className="p-2 bg-secondary/60 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Share2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
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
                  <DropdownMenuItem onClick={() => { duplicatePrompt(prompt.id); onUpdate(); toast.success("Prompt duplicated"); }} className="gap-2 text-xs">
                    <Files className="h-3.5 w-3.5" />
                    Duplicate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                onClick={() => setEditing(true)}
                aria-label="Edit prompt"
                className="p-2 bg-secondary/60 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={handleDeleteClick}
                aria-label={confirmDelete ? "Confirm delete" : "Delete prompt"}
                title={confirmDelete ? "Click again to confirm" : "Delete prompt"}
                className={`p-2 rounded-xl transition-all ${
                  confirmDelete
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-secondary/60 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                }`}
              >
                {confirmDelete ? (
                  <Check className="h-4 w-4 animate-fade-in" strokeWidth={2.25} />
                ) : (
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
