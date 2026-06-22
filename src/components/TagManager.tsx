import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, Trash2, X, Tag as TagIcon } from "lucide-react";
import { getTagCounts, renameTag, deleteTag } from "@/lib/prompts-store";
import { toast } from "sonner";

interface TagManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  version: number;
}

export function TagManager({ open, onOpenChange, onUpdate, version }: TagManagerProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Re-read whenever the dialog opens or data version changes.
  const tags = open ? getTagCounts() : [];
  void version;

  const handleRename = (tag: string) => {
    const next = editValue.trim().toLowerCase();
    if (next && next !== tag) {
      renameTag(tag, next);
      onUpdate();
      toast.success(`Renamed “${tag}” → “${next}”`);
    }
    setEditing(null);
  };

  const handleDelete = (tag: string) => {
    deleteTag(tag);
    setConfirmDelete(null);
    onUpdate();
    toast.success(`Removed tag “${tag}”`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Manage tags</DialogTitle>
          <DialogDescription>Rename or remove tags across every prompt at once.</DialogDescription>
        </DialogHeader>

        {tags.length === 0 ? (
          <p className="text-sm text-foreground/55 py-6 text-center">No tags yet.</p>
        ) : (
          <ul className="max-h-[50vh] overflow-y-auto space-y-1 pr-1">
            {tags.map(({ tag, count }) => (
              <li key={tag} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary/50">
                {editing === tag ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      className="h-8 text-sm rounded-lg flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(tag);
                        if (e.key === "Escape") setEditing(null);
                      }}
                    />
                    <button onClick={() => handleRename(tag)} aria-label="Save" className="text-primary p-1">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditing(null)} aria-label="Cancel" className="text-foreground/50 p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <TagIcon className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
                    <span className="flex-1 text-sm truncate">{tag}</span>
                    <span className="text-[11px] text-foreground/45 tabular-nums">{count}</span>
                    <button
                      onClick={() => { setEditing(tag); setEditValue(tag); }}
                      aria-label={`Rename ${tag}`}
                      className="text-foreground/50 hover:text-foreground p-1"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => (confirmDelete === tag ? handleDelete(tag) : setConfirmDelete(tag))}
                      aria-label={confirmDelete === tag ? `Confirm remove ${tag}` : `Remove ${tag}`}
                      className={confirmDelete === tag ? "text-destructive p-1" : "text-foreground/50 hover:text-destructive p-1"}
                    >
                      {confirmDelete === tag ? <Check className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
