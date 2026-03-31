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
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-card border rounded-xl shadow-lg p-4 space-y-3 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export Prompts
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Import Prompts
              </Button>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md safe-area-bottom">
        <div className="max-w-4xl mx-auto flex items-center justify-around px-4 py-2">
          {/* Prompts */}
          <button
            onClick={() => { onTabChange("prompts"); setShowSettings(false); }}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
              activeTab === "prompts" && !showSettings
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-5 w-5" />
            <span className="text-[10px] font-medium">Prompts</span>
          </button>

          {/* Add - prominent */}
          <button
            onClick={() => { onTabChange("add"); setShowSettings(false); }}
            className="flex flex-col items-center gap-0.5 -mt-4"
          >
            <div className={`rounded-full p-3 shadow-lg transition-colors ${
              activeTab === "add" && !showSettings
                ? "bg-primary text-primary-foreground"
                : "bg-primary/90 text-primary-foreground hover:bg-primary"
            }`}>
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Add</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
              showSettings
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
}
