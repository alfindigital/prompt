import { useState, useRef } from "react";
import { List, Plus, Settings, Download, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportPrompts, importPrompts } from "@/lib/prompts-store";
import { Prompt } from "@/lib/types";
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
    toast.success(`Exported ${data.length} prompts`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Prompt[];
        const count = importPrompts(data);
        onDataChange();
        toast.success(`Imported ${count} prompts`);
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      {/* Settings overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm glass border rounded-2xl shadow-xl p-5 space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-xl" onClick={handleExport}>
                <Download className="h-4 w-4 text-primary" />
                Export Prompts
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-xl" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 text-primary" />
                Import Prompts
              </Button>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="max-w-lg mx-auto px-4 pb-2">
          <div className="glass border rounded-2xl shadow-lg">
            <div className="flex items-center justify-around px-6 py-2.5">
              {/* Prompts */}
              <button
                onClick={() => { onTabChange("prompts"); setShowSettings(false); }}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                  activeTab === "prompts" && !showSettings
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-5 w-5" strokeWidth={activeTab === "prompts" && !showSettings ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">Prompts</span>
              </button>

              {/* Add - floating raised */}
              <button
                onClick={() => { onTabChange("add"); setShowSettings(false); }}
                className="relative -mt-8"
              >
                <div className={`rounded-2xl p-4 shadow-lg transition-all ${
                  activeTab === "add" && !showSettings
                    ? "gradient-bg text-white shadow-primary/40 scale-110 glow-primary"
                    : "gradient-bg text-white hover:shadow-primary/30 hover:scale-105 animate-[pulse_3s_ease-in-out_infinite]"
                }`}>
                  <Plus className="h-5 w-5" strokeWidth={2.5} />
                </div>
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                  showSettings
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Settings className="h-5 w-5" strokeWidth={showSettings ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
