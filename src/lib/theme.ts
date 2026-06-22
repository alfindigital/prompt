// Single source of truth for theme toggling so the <html> class, localStorage,
// and the live theme-color meta never drift apart.

const LIGHT = "#7c5cff";
const DARK = "#0d0a1a";

export function isDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function setThemeColor(dark: boolean) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]#active-theme-color');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.id = "active-theme-color";
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", dark ? DARK : LIGHT);
}

export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    /* ignore */
  }
  setThemeColor(dark);
}

export function toggleTheme(): boolean {
  const next = !isDark();
  applyTheme(next);
  return next;
}
