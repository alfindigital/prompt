import { useEffect, useState } from "react";
import { ShieldCheck, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSafetyDismissed, dismissSafety, shouldRemindExport, getLastExport } from "@/lib/backup";

interface DataSafetyBannerProps {
  promptCount: number;
  onExport: () => void;
  version: number;
}

/**
 * Honest, low-key reminder that data is browser-local. Shows a stronger
 * "back up now" nudge once it's been a while since the last export.
 */
export function DataSafetyBanner({ promptCount, onExport, version }: DataSafetyBannerProps) {
  const [hidden, setHidden] = useState(true);
  const [remind, setRemind] = useState(false);

  useEffect(() => {
    if (promptCount === 0) {
      setHidden(true);
      return;
    }
    const needsReminder = shouldRemindExport(promptCount);
    setRemind(needsReminder);
    setHidden(!needsReminder && isSafetyDismissed());
  }, [promptCount, version]);

  if (hidden) return null;

  const lastExport = getLastExport();

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3 animate-fade-in">
      <ShieldCheck className="h-5 w-5 text-primary shrink-0" strokeWidth={1.75} />
      <p className="text-xs text-foreground/70 flex-1 leading-relaxed">
        {remind ? (
          <>
            <span className="font-semibold text-foreground">Time to back up.</span>{" "}
            {lastExport
              ? `Last export was ${lastExport.toLocaleDateString()}.`
              : "You haven't exported a backup yet."}{" "}
            Your prompts live only in this browser.
          </>
        ) : (
          <>
            <span className="font-semibold text-foreground">Your prompts live only in this browser.</span>{" "}
            Export a backup to keep them safe or move to another device.
          </>
        )}
      </p>
      <Button size="sm" className="h-8 rounded-lg gap-1.5 shrink-0" onClick={onExport}>
        <Download className="h-3.5 w-3.5" /> Export
      </Button>
      {!remind && (
        <button
          onClick={() => { dismissSafety(); setHidden(true); }}
          aria-label="Dismiss"
          className="text-foreground/40 hover:text-foreground shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
