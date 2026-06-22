// A small, high-quality starter pack so a brand-new library isn't empty.
// Shows off categories, tags, markdown, and {{variables}} at a glance.

import { addCategory, addPrompt, getCategories } from "./prompts-store";

export interface StarterPrompt {
  title: string;
  content: string;
  tags: string[];
  category: string; // category *name*; mapped/created on import
}

export const STARTER_CATEGORIES = ["Writing", "Coding", "Marketing", "Productivity"];

export const STARTER_PROMPTS: StarterPrompt[] = [
  {
    title: "Polished email rewrite",
    category: "Writing",
    tags: ["email", "rewrite"],
    content:
      "Rewrite the email below so it is **clear, warm, and concise**. Keep my intent, fix grammar, and use short paragraphs.\n\nTone: {{tone}}\n\n---\n{{email}}",
  },
  {
    title: "Explain like I'm five",
    category: "Writing",
    tags: ["explain", "learning"],
    content:
      "Explain **{{topic}}** to a curious 5-year-old.\n\n- Use a simple everyday analogy\n- No jargon\n- End with one sentence I could repeat to sound smart",
  },
  {
    title: "Code reviewer",
    category: "Coding",
    tags: ["review", "debug"],
    content:
      "Act as a senior engineer reviewing this code. Point out:\n\n1. Correctness bugs\n2. Edge cases I missed\n3. Readability / naming issues\n4. A cleaner rewrite if warranted\n\n```{{language}}\n{{code}}\n```",
  },
  {
    title: "Regex builder",
    category: "Coding",
    tags: ["regex"],
    content:
      "Write a regular expression that matches **{{requirement}}**.\n\nReturn:\n- The regex\n- A short explanation of each part\n- 3 strings that match and 3 that don't",
  },
  {
    title: "Cold outreach DM",
    category: "Marketing",
    tags: ["outreach", "sales"],
    content:
      "Write a short, non-salesy DM to {{persona}} about {{offer}}.\n\nConstraints:\n- Under 60 words\n- One specific compliment\n- One clear, low-friction ask",
  },
  {
    title: "Hook generator",
    category: "Marketing",
    tags: ["copywriting", "social"],
    content:
      "Give me 10 scroll-stopping hooks for a post about **{{topic}}** aimed at {{audience}}. Mix curiosity, contrarian takes, and concrete numbers.",
  },
  {
    title: "Weekly plan from a brain dump",
    category: "Productivity",
    tags: ["planning"],
    content:
      "Here is my unstructured brain dump. Turn it into a realistic weekly plan grouped by priority, with time estimates and a 'do first' pick.\n\n---\n{{braindump}}",
  },
  {
    title: "Meeting notes → action items",
    category: "Productivity",
    tags: ["summary", "meetings"],
    content:
      "Summarize these meeting notes into:\n\n- **Decisions made**\n- **Action items** (owner + due date if mentioned)\n- **Open questions**\n\n---\n{{notes}}",
  },
];

/** Create the starter categories (reusing existing ones by name) and add the sample prompts. */
export function loadStarterPack(): number {
  const existing = getCategories();
  const byName = new Map(existing.map((c) => [c.name.toLowerCase(), c.id]));
  for (const name of STARTER_CATEGORIES) {
    if (!byName.has(name.toLowerCase())) {
      const cat = addCategory(name);
      byName.set(name.toLowerCase(), cat.id);
    }
  }
  let added = 0;
  for (const p of STARTER_PROMPTS) {
    addPrompt({
      title: p.title,
      content: p.content,
      tags: p.tags,
      category: byName.get(p.category.toLowerCase()) ?? null,
    });
    added++;
  }
  return added;
}
