import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Star, Copy, Check, Share2, Link as LinkIcon, FileText, Files, Pencil, Sparkles,
  History, RotateCcw, ExternalLink,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PromptMarkdown } from "@/components/PromptMarkdown";
import { usePromptActions } from "@/hooks/use-prompt-actions";
import { restoreRevision } from "@/lib/prompts-store";
import { hasVariables } from "@/lib/variables";
import { estimateTokens } from "@/lib/share";
import type { Prompt, Category } from "@/lib/types";
import { toast } from "sonner";

interface PromptDetailDialogProps {
  prompt: Prompt;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onRequestEdit: () => void;
  onRequestFill: () => void;
}

export function PromptDetailDialog({
  prompt, categories, open, onOpenChange, onUpdate, onRequestEdit, onRequestFill,
}: PromptDetailDialogProps) {
  const actions = usePromptActions(prompt, onUpdate);
  const [showHistory, setShowHistory] = useState(false);
  const category = categories.find((c) => c.id === prompt.category);
  const variableCount = hasVariables(prompt.content);
  const history = prompt.history ?? [];

  const handleRestore = (index: number) => {
    restoreRevision(prompt.id, index);
    onUpdate();
    toast.success("Reverted to earlier version");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader className="space-y-0">
          <div className="flex items-center justify-between gap-2 pr-6">
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${category ? "bg-secondary text-primary" : "bg-secondary text-foreground/50"}`}>
              {category ? category.name : "Uncategorized"}
            </span>
            <button onClick={actions.toggleFavorite} aria-label="Toggle favorite">
              <Star
                className={`h-5 w-5 transition-colors ${prompt.is_favorite ? "fill-primary text-primary" : "text-foreground/25 hover:text-primary"}`}
                strokeWidth={1.75}
              />
            </button>
          </div>
          <DialogTitle className="font-display text-2xl pt-2 text-left">{prompt.title}</DialogTitle>
        </DialogHeader>

        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {prompt.tags.map((t) => (
              <span key={t} className="text-[11px] font-semibold text-foreground/55 bg-secondary rounded-full px-2.5 py-0.5">#{t}</span>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-4">
          <PromptMarkdown>{prompt.content}</PromptMarkdown>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-foreground/55">
          <span>{prompt.content.length.toLocaleString()} chars</span>
          <span>~{estimateTokens(prompt.content).toLocaleString()} tokens</span>
          {(prompt.use_count ?? 0) > 0 && <span>Used {prompt.use_count}×</span>}
          {prompt.last_used_at && <span>Last used {new Date(prompt.last_used_at).toLocaleDateString()}</span>}
          <span>Created {new Date(prompt.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {variableCount ? (
            <Button onClick={() => { onOpenChange(false); onRequestFill(); }} className="rounded-xl gap-1.5">
              <Sparkles className="h-4 w-4" /> Fill &amp; copy
            </Button>
          ) : (
            <Button onClick={actions.copy} className="rounded-xl gap-1.5">
              {actions.copied ? <Check className="h-4 w-4" strokeWidth={2.25} /> : <Copy className="h-4 w-4" />}
              Copy
            </Button>
          )}

          <Button variant="secondary" onClick={() => actions.openIn("chatgpt")} className="rounded-xl gap-1.5">
            <ExternalLink className="h-4 w-4" /> ChatGPT
          </Button>
          <Button variant="secondary" onClick={() => actions.openIn("claude")} className="rounded-xl gap-1.5">
            <ExternalLink className="h-4 w-4" /> Claude
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-xl gap-1.5">
                <Share2 className="h-4 w-4" /> More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={actions.copyFormatted} className="gap-2 text-xs">
                <FileText className="h-3.5 w-3.5" /> Copy as formatted text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={actions.shareLink} className="gap-2 text-xs">
                <LinkIcon className="h-3.5 w-3.5" /> Copy share link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={actions.duplicate} className="gap-2 text-xs">
                <Files className="h-3.5 w-3.5" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { onOpenChange(false); onRequestEdit(); }} className="gap-2 text-xs">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {history.length > 0 && (
          <div className="border-t border-border pt-3">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-2 text-xs font-semibold text-foreground/60 hover:text-foreground"
            >
              <History className="h-3.5 w-3.5" />
              Version history ({history.length})
            </button>
            {showHistory && (
              <ul className="mt-2 space-y-1.5">
                {history.map((rev, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-secondary/40 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{rev.title}</p>
                      <p className="text-[10px] text-foreground/50">{new Date(rev.saved_at).toLocaleString()}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 rounded-lg shrink-0" onClick={() => handleRestore(i)}>
                      <RotateCcw className="h-3 w-3" /> Restore
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
