export interface SharedPromptPayload {
  title: string;
  content: string;
  tags: string[];
  category?: string | null;
}

// URL-safe base64 helpers that round-trip full Unicode without the deprecated
// escape()/unescape() pair.
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeSharedPrompt(payload: SharedPromptPayload): string {
  const json = JSON.stringify(payload);
  return bytesToBase64Url(new TextEncoder().encode(json));
}

export function decodeSharedPrompt(encoded: string): SharedPromptPayload | null {
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(encoded));
    const parsed = JSON.parse(json);
    if (
      parsed &&
      typeof parsed.title === "string" &&
      typeof parsed.content === "string" &&
      parsed.title.trim() &&
      parsed.content.trim()
    ) {
      return {
        title: parsed.title,
        content: parsed.content,
        tags: Array.isArray(parsed.tags) ? parsed.tags.filter((t: unknown) => typeof t === "string") : [],
        category: typeof parsed.category === "string" ? parsed.category : null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharedPromptPayload): string {
  const encoded = encodeSharedPrompt(payload);
  return `${window.location.origin}${window.location.pathname}?shared=${encoded}`;
}

// Rough token estimate (~4 chars/token) — good enough for context-window awareness.
export function estimateTokens(text: string): number {
  return Math.ceil(text.trim().length / 4);
}
