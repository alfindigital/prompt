import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardPaste } from "lucide-react";
import { importFromText } from "@/lib/prompts-store";
import { toast } from "sonner";

interface ImportTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ImportTextDialog({ open, onOpenChange, onUpdate }: ImportTextDialogProps) {
  const [text, setText] = useState("");

  const handleImport = () => {
    const count = importFromText(text);
    if (count === 0) {
      toast.error("Nothing to import");
      return;
    }
    onUpdate();
    onOpenChange(false);
    setText("");
    toast.success(`Imported ${count} prompt${count !== 1 ? "s" : ""}`);
  };

  const pasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      setText((prev) => (prev ? prev + "\n" + clip : clip));
    } catch {
      toast.error("Clipboard access blocked by browser");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Import from text</DialogTitle>
          <DialogDescription>
            Paste Markdown or plain text. Each <code>#</code> or <code>##</code> heading becomes a new prompt;
            text without headings is imported as one prompt.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={"# My first prompt\nWrite a haiku about {{topic}}.\n\n# Another prompt\n..."}
          className="text-sm rounded-xl resize-none font-mono"
          autoFocus
        />

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={pasteFromClipboard} className="rounded-xl gap-1.5">
            <ClipboardPaste className="h-4 w-4" /> Paste from clipboard
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleImport} className="rounded-xl" disabled={!text.trim()}>Import</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
