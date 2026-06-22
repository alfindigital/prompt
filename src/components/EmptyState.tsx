import { LibraryBig, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onNewPrompt?: () => void;
  onLoadStarter?: () => void;
}

export function EmptyState({ onNewPrompt, onLoadStarter }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="brand-mark-outline h-16 w-16 mb-6">
        <LibraryBig className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h2 className="font-display text-2xl font-bold mb-2 text-foreground">Your prompts, always one tap away</h2>
      <p className="text-sm text-foreground/65 max-w-[360px] leading-relaxed mb-6">
        Stop digging through chat history and notes. Save your best prompts once, organize with tags and
        categories, and reuse them anywhere — with fill-in <span className="text-primary font-semibold">{"{{variables}}"}</span>.
      </p>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <Button onClick={onNewPrompt} className="rounded-xl gap-1.5">
          <Plus className="h-4 w-4" strokeWidth={2} /> Add your first prompt
        </Button>
        <Button variant="secondary" onClick={onLoadStarter} className="rounded-xl gap-1.5">
          <Sparkles className="h-4 w-4" strokeWidth={2} /> Load starter pack
        </Button>
      </div>
    </div>
  );
}
