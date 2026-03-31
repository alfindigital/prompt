import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between py-5 sm:py-7">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg border-2 border-primary/60 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Promptly</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
