import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="flex items-center justify-between py-4 sm:py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Prompt Library</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Your reusable prompt collection</p>
      </div>
      <ThemeToggle />
    </header>
  );
}
