import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { exportPrompts, importPrompts } from "@/lib/prompts-store";
import { toast } from "sonner";
import { Prompt } from "@/lib/types";
import { useRef } from "react";

interface HeaderProps {
  onDataChange: () => void;
}

export function Header({ onDataChange }: HeaderProps) {
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
    <header className="flex flex-col sm:flex-row sm:items-center justify-between py-6 gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Prompt Library</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Your reusable prompt collection</p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Import</span>
        </Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>
    </header>
  );
}
