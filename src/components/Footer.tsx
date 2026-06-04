import { BrandMark } from "@/components/BrandMark";

export function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 mb-28 sm:mb-24">
      <div className="rounded-3xl bg-card border border-border/60 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-md shadow-primary/25">
            <BrandMark className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-sm font-bold text-foreground">Promptly</span>
            <span className="text-[11px] font-medium text-foreground/50">Local-first prompt library</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
          <span className="text-[11px] font-medium text-foreground/40">
            © {new Date().getFullYear()} Promptly
          </span>
          <div className="flex gap-4 text-[11px] font-semibold">
            <a href="/llms.txt" className="text-foreground/50 hover:text-primary transition-colors">llms.txt</a>
            <a href="/sitemap.xml" className="text-foreground/50 hover:text-primary transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
