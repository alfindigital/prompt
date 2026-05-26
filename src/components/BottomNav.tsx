import { useState, useRef } from "react";
import { List, Plus, Settings, Download, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportPrompts, importPrompts } from "@/lib/prompts-store";
import { toast } from "sonner";

type Tab = "prompts" | "add" | "settings";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onDataChange: () => void;
}

export function BottomNav({ activeTab, onTabChange, onDataChange }: BottomNavProps) {
  const [showSettings, setShowSettings] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportPrompts();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompts-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.prompts.length} prompts & ${data.categories.length} categories`);
  };

  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;

    if (!/\.json$/i.test(file.name) && file.type && !file.type.includes("json")) {
      toast.error("File must be a .json backup");
      return;
    }
    if (file.size === 0) {
      toast.error("Backup file is empty");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`Backup too large (max ${MAX_BYTES / 1024 / 1024} MB)`);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => toast.error("Could not read file");
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text !== "string") {
        toast.error("Could not read file contents");
        return;
      }
      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown error";
        toast.error("Invalid JSON", { description: msg });
        return;
      }
      try {
        const result = importPrompts(raw);
        onDataChange();
        const parts: string[] = [];
        if (result.promptsAdded) parts.push(`${result.promptsAdded} added`);
        if (result.promptsUpdated) parts.push(`${result.promptsUpdated} updated`);
        if (result.categoriesAdded) parts.push(`${result.categoriesAdded} categories`);
        toast.success("Backup restored", {
          description: parts.length ? parts.join(" · ") : "No new prompts found",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown validation error";
        toast.error("Backup is not valid", { description: msg });
      }
    };
    reader.readAsText(file);
  };


  const navItem = (active: boolean) =>
    `flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-full transition-colors ${
      active ? "text-primary" : "text-white/40 hover:text-white"
    }`;

  return (
    <>
      {showSettings && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-card border border-border rounded-2xl shadow-xl p-5 space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base">Settings</h3>
              <button onClick={() => setShowSettings(false)} aria-label="Close settings" className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-xl" onClick={handleExport}>
                <Download className="h-4 w-4 text-primary" strokeWidth={1.75} />
                Export Prompts
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-xl" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 text-primary" strokeWidth={1.75} />
                Import Prompts
              </Button>
              <input ref={fileRef} type="file" accept=".json" aria-label="Import prompts JSON file" className="hidden" onChange={handleImport} />
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom px-4 pb-4 pointer-events-none">
        <div className="max-w-sm mx-auto pointer-events-auto">
          <div className="bg-ink rounded-full p-2 flex items-center justify-between shadow-2xl shadow-ink/40 border border-white/5">
            <button
              onClick={() => { onTabChange("prompts"); setShowSettings(false); }}
              aria-label="View prompts"
              className={navItem(activeTab === "prompts" && !showSettings)}
            >
              <List className="h-5 w-5" strokeWidth={1.75} />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Prompts</span>
            </button>

            <button
              onClick={() => { onTabChange("add"); setShowSettings(false); }}
              aria-label="Add new prompt"
              className="mx-2"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                activeTab === "add" && !showSettings
                  ? "bg-white text-ink shadow-lg shadow-white/20"
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/40 hover:bg-primary/90"
              }`}>
                <Plus className="h-6 w-6" strokeWidth={2.25} />
              </div>
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Open settings"
              className={navItem(showSettings)}
            >
              <Settings className="h-5 w-5" strokeWidth={1.75} />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Settings</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
