export function Footer() {
  return (
    <footer className="mt-12 -mx-3 sm:-mx-5 px-3 sm:px-5 border-t border-primary/20 bg-primary/[0.05]">
      <div className="max-w-4xl mx-auto py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="brand-mark h-7 w-7">
            <img src="/brand-mark.svg" alt="" aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="font-display font-semibold text-sm text-foreground">Promptly</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">— AI Prompt Library</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Promptly. Crafted with care.
        </p>
      </div>
    </footer>
  );
}
