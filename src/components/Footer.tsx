export function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 mb-24 sm:mb-8">
      <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[13px] text-foreground/40 font-medium">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <img src="/brand-mark.svg" alt="" aria-hidden="true" className="h-3.5 w-3.5 [filter:brightness(0)_invert(1)]" />
          </div>
          <span className="font-display font-bold text-foreground">Promptly</span>
          <span>© {new Date().getFullYear()} AI Prompt Library</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Local-first</a>
          <a href="/llms.txt" className="hover:text-primary transition-colors">llms.txt</a>
          <a href="/sitemap.xml" className="hover:text-primary transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
