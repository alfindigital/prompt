
# Rombak UI/UX — Promptly Rebrand

## Arah desain
- **Mobile-first, compact**: padding lebih ketat, tap target tetap ≥40px, grid 1 kolom di mobile → 2 di sm → 3 di lg.
- **Light mode default** (hapus auto-dark, hapus persist "dark" jika belum ada pilihan).
- **Brand color**: purple solid `hsl(255 55% 52%)` sebagai primary tunggal. Hapus semua `gradient-text` / `gradient-bg` / `glow-primary` gradient. Teal accent dihapus agar konsisten satu warna brand.
- **Typography**: Syne (headings, 600/700) + Plus Jakarta Sans (body, 400/500/600). JetBrains Mono tetap untuk `code/pre`.
- **Icon style**: semua outline (Lucide stroke 1.75). App icon di header → mark monokrom outline ungu, bukan ikon Sparkles dalam kotak gradient. Favicon + theme toggle juga outline monokrom.
- **Less emoji**: sapu emoji di copy (EmptyState, QuickAddForm placeholder, toast, dll) → ganti ikon outline / text bersih.

## Perubahan file

### `index.html`
- `<html>` tanpa `class="dark"` default.
- Update `<title>`, meta description ke tone branded.
- Ganti favicon ke SVG mark outline ungu baru (`/brand-mark.svg`).
- Preload Syne + Plus Jakarta Sans (hapus Space Grotesk).

### `src/index.css`
- Ganti import Google Fonts → Syne + Plus Jakarta Sans + JetBrains Mono.
- Tokens light:
  - `--background: 250 25% 98%`
  - `--foreground: 255 25% 12%`
  - `--primary: 255 55% 52%` / fg `0 0% 100%`
  - `--secondary: 250 20% 94%`
  - `--muted-foreground: 255 10% 45%`
  - `--accent: 255 55% 52%` (= primary, hapus teal)
  - `--border: 250 15% 90%`, `--radius: 0.75rem`
- Tokens dark seimbang dengan primary `255 65% 68%`.
- Hapus `--gradient-primary`, `--gradient-end`, `.gradient-text`, `.gradient-bg`, `.glow-primary`.
- `body { font-family: 'Plus Jakarta Sans', ... }`, heading helper `.font-display { font-family: 'Syne'; letter-spacing: -0.02em; }`.
- Tambah utility `.brand-mark` (border outline + ikon stroke) untuk app icon.
- Kurangi animasi transisi global yang terlalu lambat → 200ms.

### `tailwind.config.ts`
- `fontFamily.display: ['Syne', ...]`, `fontFamily.sans: ['Plus Jakarta Sans', ...]`, `fontFamily.mono: ['JetBrains Mono', ...]`.
- Hapus referensi gradient.

### `src/components/Header.tsx`
- Brand mark: kotak `border border-primary/40 rounded-lg` berisi ikon outline (Library / Command stroke 1.75 ungu), bukan Sparkles dalam gradient.
- Judul: `font-display font-semibold text-foreground` (tanpa gradient-text). Mobile: judul lebih pendek "Promptly", subtitle "AI Prompt Library" disembunyikan di <sm.
- Padding header diperkecil untuk mobile.

### `src/components/ThemeToggle.tsx`
- Ganti jadi tombol ikon sederhana (Sun/Moon outline, stroke 1.75) tanpa track gradient. Ukuran 36px. State: `aria-pressed`.

### `src/components/BottomNav.tsx`, `NavLink.tsx`
- Ikon outline stroke 1.75, label kecil, indikator aktif: garis tipis ungu di atas + warna primary, hapus efek glow/gradient.
- Safe-area bawah dipertahankan.

### `src/components/QuickAddForm.tsx`, `EmptyState.tsx`, `SearchFilterBar.tsx`, `CategoryBar.tsx`, `PromptCard.tsx`, `SortablePromptCard.tsx`
- Sapu emoji di copy & placeholder, ganti ikon Lucide outline.
- Compact: padding kartu `p-3 sm:p-4`, radius `rounded-xl`, border `border-border` tipis, hover state subtle (tanpa scale berlebihan).
- Tombol primary: solid ungu, tanpa shadow gradient.
- Search bar full-width di mobile, sort/select stacked rapi.

### `src/pages/Index.tsx`
- Tidak ada perubahan logika; hanya menyesuaikan spacing/kelas untuk compact mobile-first (gap-4 → gap-3 di mobile, container `px-3 sm:px-5`).

### Brand mark / favicon
- Buat `public/brand-mark.svg` — outline monokrom (currentColor) ungu: glyph sederhana (mis. kurung kurawal `{ }` + dot, mewakili prompt). Dipakai sebagai favicon + di Header.
- Hapus referensi favicon lama jika perlu.

### Memory
- Update `mem://design/tokens` & `mem://index.md`: Syne + Plus Jakarta Sans, purple solid (no gradient), outline icons, light default.

## Yang TIDAK diubah
- Struktur data, localStorage store, routing, fitur DnD/select/bulk, share link, SEO JSON-LD, sitemap, Google verification meta.
