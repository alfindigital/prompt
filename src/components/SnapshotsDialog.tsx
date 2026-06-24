import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Clock } from "lucide-react";
import { getSnapshots } from "@/lib/backup";
import { importPrompts } from "@/lib/prompts-store";
import { toast } from "sonner";

interface SnapshotsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

/**
 * Local auto-snapshots — a safety net if an import/delete goes wrong even when
 * the user never exported a file. Restoring merges the snapshot back in.
 */
export function SnapshotsDialog({ open, onOpenChange, onUpdate }: SnapshotsDialogProps) {
  const snapshots = open ? getSnapshots() : [];

  const restore = (index: number) => {
    const snap = snapshots[index];
    if (!snap) return;
    importPrompts({ prompts: snap.prompts, categories: snap.categories });
    onUpdate();
    onOpenChange(false);
    toast.success("Snapshot restored", { description: `${snap.prompts.length} prompts merged back in` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Local snapshots</DialogTitle>
          <DialogDescription>
            Promptly automatically keeps the last few versions of your library on this device. Restore one if
            something went wrong.
          </DialogDescription>
        </DialogHeader>

        {snapshots.length === 0 ? (
          <p className="text-sm text-foreground/55 py-6 text-center">No snapshots yet.</p>
        ) : (
          <ul className="space-y-2">
            {snapshots.map((snap, i) => (
              <li key={snap.saved_at} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/40 px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="h-4 w-4 text-foreground/40 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{new Date(snap.saved_at).toLocaleString()}</p>
                    <p className="text-[11px] text-foreground/50">
                      {snap.prompts.length} prompts · {snap.categories.length} categories
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="h-8 rounded-lg gap-1.5 shrink-0" onClick={() => restore(i)}>
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
