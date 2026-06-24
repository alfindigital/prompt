import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { PromptMarkdown } from "@/components/PromptMarkdown";
import type { SharedPromptPayload } from "@/lib/share";

interface SharedPromptDialogProps {
  payload: SharedPromptPayload | null;
  onSave: () => void;
  onDismiss: () => void;
}

/** Preview/confirm a prompt arriving via a ?shared= link instead of silently adding it. */
export function SharedPromptDialog({ payload, onSave, onDismiss }: SharedPromptDialogProps) {
  return (
    <Dialog open={!!payload} onOpenChange={(o) => { if (!o) onDismiss(); }}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" /> Someone shared a prompt
          </DialogTitle>
          <DialogDescription>Review it, then save it to your library.</DialogDescription>
        </DialogHeader>

        {payload && (
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold">{payload.title}</h3>
            {payload.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {payload.tags.map((t) => (
                  <span key={t} className="text-[11px] font-semibold text-foreground/55 bg-secondary rounded-full px-2.5 py-0.5">#{t}</span>
                ))}
              </div>
            )}
            <div className="rounded-xl border border-border bg-card p-3 max-h-60 overflow-y-auto">
              <PromptMarkdown>{payload.content}</PromptMarkdown>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onDismiss} className="rounded-xl">Dismiss</Button>
          <Button onClick={onSave} className="rounded-xl">Save to my library</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
