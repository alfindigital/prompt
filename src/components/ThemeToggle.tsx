import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      aria-label="Toggle theme"
      className="relative h-9 w-16 rounded-full bg-secondary/70 hover:bg-secondary p-1 transition-colors duration-500"
    >
      {/* Track icons */}
      <Sun className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400 transition-opacity duration-300"
        style={{ opacity: dark ? 0.5 : 0 }} />
      <Moon className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary/40 transition-opacity duration-300"
        style={{ opacity: dark ? 0 : 0.5 }} />

      {/* Sliding thumb */}
      <span
        className="block h-7 w-7 rounded-full shadow-md transition-all duration-500 ease-[cubic-bezier(0.68,-0.15,0.27,1.15)] flex items-center justify-center"
        style={{
          transform: dark ? "translateX(28px)" : "translateX(0)",
          background: dark
            ? "linear-gradient(135deg, hsl(250 60% 65%), hsl(280 65% 62%))"
            : "linear-gradient(135deg, hsl(38 92% 55%), hsl(32 95% 50%))",
        }}
      >
        {dark ? (
          <Moon className="h-3.5 w-3.5 text-white transition-transform duration-500 rotate-0" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-white transition-transform duration-500 rotate-0" />
        )}
      </span>
    </button>
  );
}
