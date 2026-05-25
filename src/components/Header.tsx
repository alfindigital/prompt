import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 -mx-3 sm:-mx-5 mb-5 px-3 sm:px-5 border-b border-primary/20 bg-primary/[0.06] backdrop-blur-md supports-[backdrop-filter]:bg-primary/[0.05]">
      <div className="flex items-center justify-between py-3 sm:py-4">
        <div className="flex items-center gap-2.5">
          <span className="brand-mark h-9 w-9">
            <img src="/brand-mark.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="flex flex-col leading-tight">
            <h1 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-foreground">
              Promptly
            </h1>
            <span className="hidden sm:block text-[11px] font-medium text-primary/80 tracking-wide uppercase">
              AI Prompt Library
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
