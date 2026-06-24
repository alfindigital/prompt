# Promptly — AI Prompt Library

A fast, **local-first** library for your AI prompts. Save, tag, categorize, search,
and reuse your best prompts right in the browser. No sign-up, no servers — your data
lives in `localStorage` and never leaves your device.

## Features

- **Save & organize** prompts with tags and **nested categories**
- **Fill-in `{{variables}}`** — placeholders are detected and you fill them in before copying
- **Command palette** (`Ctrl`/`Cmd` + `K`) for search and quick actions
- **Full-text search**, tag filters, and sort by name / newest / recently used / most used
- **Version history** with one-click restore, plus automatic local snapshots
- **Markdown** editing + preview, with code-block copy buttons
- **Open in ChatGPT / Claude**, copy as formatted text, or share via link
- **Bulk actions**: favorite, move to category, add tags, delete (with undo)
- **Import / export** JSON backups, or import loose prompts from Markdown/text
- **Installable, offline-ready PWA** with light/dark themes

## Tech

Vite + React + TypeScript + Tailwind + shadcn/ui. State persists to `localStorage`;
a service worker caches the app shell for offline use.

## Develop

```bash
bun install
bun run dev       # start dev server
bun run test      # unit tests (vitest)
bun run lint      # eslint
bun run build     # production build
```

## Data & privacy

Everything is stored locally in your browser. Use **Export backup** regularly (and the
automatic local snapshots) to avoid losing data when clearing browser storage or
switching devices.
