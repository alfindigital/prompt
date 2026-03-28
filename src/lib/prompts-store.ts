import { Prompt } from "./types";

const STORAGE_KEY = "prompt-library-prompts";

function read(): Prompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(prompts: Prompt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

export function getPrompts(): Prompt[] {
  return read().sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function addPrompt(data: Omit<Prompt, "id" | "created_at" | "last_used_at" | "is_favorite">): Prompt {
  const prompt: Prompt = {
    ...data,
    id: crypto.randomUUID(),
    is_favorite: false,
    created_at: new Date().toISOString(),
    last_used_at: null,
  };
  const all = read();
  all.push(prompt);
  write(all);
  return prompt;
}

export function updatePrompt(id: string, updates: Partial<Prompt>): Prompt | null {
  const all = read();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  write(all);
  return all[idx];
}

export function deletePrompt(id: string): Prompt | null {
  const all = read();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const [removed] = all.splice(idx, 1);
  write(all);
  return removed;
}

export function importPrompts(prompts: Prompt[]): number {
  const all = read();
  const existingIds = new Set(all.map((p) => p.id));
  let count = 0;
  for (const p of prompts) {
    if (existingIds.has(p.id)) {
      const idx = all.findIndex((x) => x.id === p.id);
      all[idx] = p;
    } else {
      all.push(p);
    }
    count++;
  }
  write(all);
  return count;
}

export function exportPrompts(): Prompt[] {
  return read();
}

export function getAllTags(): string[] {
  const all = read();
  const tagSet = new Set<string>();
  all.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}
