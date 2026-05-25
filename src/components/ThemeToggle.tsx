import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      aria-label="Toggle theme"
      aria-pressed={dark}
      className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-secondary text-foreground/70 hover:text-primary transition-colors"
    >
      {dark ? (
        <Moon className="h-5 w-5" strokeWidth={1.75} />
      ) : (
        <Sun className="h-5 w-5" strokeWidth={1.75} />
      )}
    </button>
  );
}
