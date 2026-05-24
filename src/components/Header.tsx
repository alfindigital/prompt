import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="flex items-center justify-between py-4 sm:py-6">
      <div className="flex items-center gap-2.5">
        <img src="/brand-mark.svg" alt="" aria-hidden="true" className="h-9 w-9" />
        <div className="flex flex-col leading-tight">
          <h1 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-foreground">
            Promptly
          </h1>
          <span className="hidden sm:block text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
            AI Prompt Library
          </span>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
