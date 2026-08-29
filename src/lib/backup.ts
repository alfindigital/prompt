const LAST_EXPORT_KEY = "prompt-library-last-export";

export function markExported(): void {
  try {
    localStorage.setItem(LAST_EXPORT_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
}
