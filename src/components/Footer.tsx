import { BrandMark } from "@/components/BrandMark";

export function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 mb-6">
      <div className="border-t border-border pt-4 flex flex-wrap justify-between items-center gap-2 text-xs text-foreground/40 font-medium">
        <div className="flex items-center gap-2">
          <BrandMark className="h-3 w-3 text-primary" strokeWidth={2.25} />
          <span>Promptly · local-first · © {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-4">
          <a href="/llms.txt" className="hover:text-primary transition-colors">llms.txt</a>
          <a href="/sitemap.xml" className="hover:text-primary transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
