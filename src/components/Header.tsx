import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between py-6 sm:py-8">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center shadow-md glow-primary">
          <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight gradient-text">Promptly</h1>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
