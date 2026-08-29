import { useEffect, useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { extractVariables, fillVariables } from "@/lib/variables";
import { toast } from "sonner";

interface FillVariablesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  /** Called after a successful copy so the caller can record usage. */
  onCopied?: () => void;
}

export function FillVariablesDialog({ open, onOpenChange, title, content, onCopied }: FillVariablesDialogProps) {
  const variables = useMemo(() => extractVariables(content), [content]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({});
      setCopied(false);
    }
  }, [open, content]);

  const preview = useMemo(() => fillVariables(content, values), [content, values]);
  const remaining = variables.filter((v) => !values[v]?.trim()).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      onCopied?.();
      toast.success(remaining > 0 ? "Copied (some variables left blank)" : "Copied to clipboard");
      window.setTimeout(() => onOpenChange(false), 600);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-2xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="font-display">Fill in variables</DialogTitle>
          <DialogDescription>
            {variables.length} placeholder{variables.length !== 1 ? "s" : ""} in “{title}”. Leave a field blank to keep its {"{{placeholder}}"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
          {variables.map((v) => (
            <div key={v} className="space-y-1">
              <label className="text-xs font-semibold text-foreground/70" htmlFor={`var-${v}`}>
                {v}
              </label>
              {v.toLowerCase().match(/text|content|body|email|notes|code|braindump|message/) ? (
                <Textarea
                  id={`var-${v}`}
                  value={values[v] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                  rows={2}
                  className="text-sm rounded-xl resize-none"
                  placeholder={`Value for ${v}`}
                  autoFocus={variables[0] === v}
                />
              ) : (
                <Input
                  id={`var-${v}`}
                  value={values[v] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                  className="text-sm rounded-xl"
                  placeholder={`Value for ${v}`}
                  autoFocus={variables[0] === v}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-secondary/40 p-3 max-h-40 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1">Preview</p>
          <pre className="text-xs whitespace-pre-wrap font-sans text-foreground/80">{preview}</pre>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleCopy} className="rounded-xl gap-1.5">
            {copied ? <Check className="h-4 w-4" strokeWidth={2.25} /> : <Copy className="h-4 w-4" />}
            Copy filled prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
