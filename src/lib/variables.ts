// Detects {{variable}} placeholders in prompt content and fills them in.

const VAR_RE = /\{\{\s*([^{}]+?)\s*\}\}/g;

/** Unique variable names in first-seen order. */
export function extractVariables(content: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  VAR_RE.lastIndex = 0;
  while ((m = VAR_RE.exec(content)) !== null) {
    const name = m[1].trim();
    if (name && !seen.has(name)) {
      seen.add(name);
      out.push(name);
    }
  }
  return out;
}

export function hasVariables(content: string): boolean {
  VAR_RE.lastIndex = 0;
  return VAR_RE.test(content);
}

/** Replace every {{name}} with its value; blank values keep the placeholder. */
export function fillVariables(content: string, values: Record<string, string>): string {
  return content.replace(VAR_RE, (full, rawName) => {
    const name = String(rawName).trim();
    const value = values[name];
    return value && value.trim() ? value : full;
  });
}
