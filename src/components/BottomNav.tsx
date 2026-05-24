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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        const count = importPrompts(raw);
        onDataChange();
        toast.success(`Imported ${count} prompts`);
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const navItem = (active: boolean) =>
    `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <>
      {showSettings && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm glass border rounded-2xl shadow-xl p-5 space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm">Settings</h3>
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="max-w-lg mx-auto px-4 pb-3">
          <div className="glass border rounded-2xl shadow-md">
            <div className="flex items-center justify-around px-4 py-2">
              <button
                onClick={() => { onTabChange("prompts"); setShowSettings(false); }}
                aria-label="View prompts"
                className={navItem(activeTab === "prompts" && !showSettings)}
              >
                <List className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-[10px] font-medium">Prompts</span>
              </button>

              <button
                onClick={() => { onTabChange("add"); setShowSettings(false); }}
                aria-label="Add new prompt"
                className="relative -mt-7"
              >
                <div className={`rounded-xl p-3.5 border transition-colors ${
                  activeTab === "add" && !showSettings
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-primary border-primary/40 hover:bg-primary/10"
                }`}>
                  <Plus className="h-5 w-5" strokeWidth={1.75} />
                </div>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Open settings"
                className={navItem(showSettings)}
              >
                <Settings className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-[10px] font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
