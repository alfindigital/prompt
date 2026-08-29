import { useEffect, useRef, useState } from "react";
import {
  Search, Plus, Settings, Sun, Moon, Download, Upload, FileText,
  Tags, X,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

interface TopNavProps {
  search: string;
  onSearchChange: (v: string) => void;
  onNewPrompt: () => void;
  onBrandClick: () => void;
  themeDark: boolean;
  onToggleTheme: () => void;
  onExport: () => void;
  onImport: () => void;
  onImportText: () => void;
  onManageTags: () => void;
  
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export function TopNav({
  search, onSearchChange, onNewPrompt, onBrandClick,
  themeDark, onToggleTheme, onExport, onImport, onImportText,
  onManageTags, searchInputRef,
}: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (search.trim()) setSearchOpen(true);
  }, []);

  useEffect(() => {
    if (searchOpen) requestAnimationFrame(() => searchInputRef?.current?.focus());
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  const item = "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors";

  const btnBase = "h-10 w-10 rounded-full flex items-center justify-center transition-colors";
  const btnIdle = `${btnBase} bg-card border border-border text-foreground/70 hover:text-foreground hover:border-primary/40`;
  const btnActive = `${btnBase} bg-secondary text-foreground border border-transparent`;

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/70 hidden sm:block relative">
      <h1 className="sr-only">Promptly — AI Prompt Library</h1>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
        {/* Brand */}
        <button
          onClick={onBrandClick}
          className="flex items-center gap-2.5 shrink-0 group active:scale-95 transition-transform"
          aria-label="Promptly home"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-sm">
            <BrandMark className="h-[22px] w-[22px]" strokeWidth={2} />
          </div>
          <div className="hidden sm:flex flex-col items-start leading-none">
            <span className="font-display text-[22px] font-semibold tracking-tight text-foreground">
              Promptly
            </span>
            <span className="text-[10px] font-medium text-foreground/50 tracking-[0.18em] uppercase mt-1">
              Prompt Library
            </span>
          </div>
        </button>

        <div className="flex-1" />

        {/* Desktop actions — icon-only */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search prompts"
            aria-expanded={searchOpen}
            title="Search prompts"
            className={searchOpen || search ? btnActive : btnIdle}
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>

          <button
            onClick={onNewPrompt}
            aria-label="New prompt"
            title="New prompt"
            className="h-10 w-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground border border-primary hover:bg-primary/90 shadow-sm active:scale-95 transition"
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={2.25} />
          </button>

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open settings menu"
              aria-expanded={menuOpen}
              title="Settings"
              className={menuOpen ? btnActive : btnIdle}
            >
              <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-64 bg-card border border-border rounded-2xl shadow-xl shadow-ink/10 p-1.5 animate-scale-in origin-top-right z-50">
                <button onClick={() => { setMenuOpen(false); onExport(); }} className={item}>
                  <Download className="h-4 w-4 text-primary" strokeWidth={1.75} /> Export backup
                </button>
                <button onClick={() => { setMenuOpen(false); onImport(); }} className={item}>
                  <Upload className="h-4 w-4 text-primary" strokeWidth={1.75} /> Import backup
                </button>
                <button onClick={() => { setMenuOpen(false); onImportText(); }} className={item}>
                  <FileText className="h-4 w-4 text-primary" strokeWidth={1.75} /> Import from text
                </button>
                <div className="my-1 border-t border-border" />
                <button onClick={() => { setMenuOpen(false); onManageTags(); }} className={item}>
                  <Tags className="h-4 w-4 text-primary" strokeWidth={1.75} /> Manage tags
                </button>
                <button onClick={onToggleTheme} className={item}>
                  {themeDark
                    ? <Sun className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    : <Moon className="h-4 w-4 text-primary" strokeWidth={1.75} />}
                  {themeDark ? "Light mode" : "Dark mode"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop search: expands from icon to a centered floating bar */}
      {searchOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+0.75rem)] z-50 w-[min(28rem,calc(100vw-2rem))] animate-fade-in">
          <div ref={searchWrapRef} className="relative flex items-center bg-card/95 backdrop-blur-xl border border-border rounded-full shadow-xl shadow-foreground/10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none" strokeWidth={1.75} />
            <input
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  if (search) onSearchChange("");
                  else setSearchOpen(false);
                }
              }}
              aria-label="Search prompts"
              placeholder="Search…"
              className="h-11 w-full pl-11 pr-10 bg-transparent border-0 rounded-full text-sm placeholder:text-foreground/45 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => { if (search) onSearchChange(""); setSearchOpen(false); }}
              aria-label="Close search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-foreground/50 hover:text-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
