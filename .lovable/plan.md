

# Prompt Library SPA

## Overview
A minimalist, single-page Prompt Library app with Google OAuth, Supabase backend, and a clean card-based UI for managing reusable prompts.

## Backend (Supabase)

### Database
- **`prompts`** table with columns: `id` (uuid PK), `user_id` (uuid, references auth.users, not null), `title` (text, not null), `content` (text, not null), `tags` (text[]), `is_favorite` (boolean, default false), `created_at` (timestamptz, default now()), `last_used_at` (timestamptz, nullable)
- **RLS policies**: Enable RLS, allow authenticated users to SELECT/INSERT/UPDATE/DELETE only rows where `user_id = auth.uid()`

### Auth
- Google OAuth via Supabase Auth
- Auth gate component wrapping the app — redirect to login if unauthenticated

## Pages & Components

### Auth Gate
- Full-screen centered login with "Sign in with Google" button
- On success, render main app; on no session, show login

### Main App (single page)
- **Header**: App title, user avatar, sign-out button
- **Quick Add Form**: Inline form at top — title input, content textarea, comma-separated tags input, submit button. No modal.
- **Search & Filter Bar**: Search input for real-time filtering across title/content/tags. Row of clickable tag chips (aggregated from all user prompts) to filter by tag.
- **Prompt Grid**: Responsive card grid (1 col mobile, 2 col tablet, 3 col desktop)
  - Each card shows: title, rendered markdown content (truncated), tag chips, favorite toggle (star icon), copy button, delete button, edit button
  - Sorted: favorites first, then by `created_at` desc
- **Empty State**: Friendly illustration/text with CTA pointing to the quick add form

### Card Interactions
- **Copy**: One-click copies content to clipboard, updates `last_used_at`, shows toast confirmation
- **Favorite toggle**: Optimistic UI toggle of `is_favorite`
- **Edit**: Inline or expandable edit mode on the card
- **Delete**: With confirmation toast/undo

### Export/Import
- **Export**: Button in header/toolbar downloads all prompts as JSON file
- **Import**: File upload button parses JSON and upserts prompts

## Key Libraries
- `react-markdown` for rendering markdown content
- `@supabase/supabase-js` for auth & database
- `sonner` (already installed) for toast notifications
- shadcn/ui components for buttons, inputs, cards, dialogs

## UX Details
- Optimistic updates on favorite toggle, add, delete
- Real-time search filters client-side from cached prompt list
- Mobile-first: stacked layout, touch-friendly tap targets
- Minimal, clean aesthetic with the existing shadcn design tokens

