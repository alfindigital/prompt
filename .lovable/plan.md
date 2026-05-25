## Arah desain (LOCKED dari pilihan user)

- **Palet Lavender Cream**: bg `#faf8ff` / surface `#ece6ff` / primary `#7c5cff` / ink `#1a1330`
- **Tipografi**: Urbanist (700/800) untuk heading, Epilogue (400/500/600) untuk body
- **Layout**: hero-grid — sticky header → hero ungu solid → kategori chips → grid kartu → footer → floating bottom nav dark
- **Light mode default**. Tetap mobile-first tapi komposisi desktop matches prototype.

## Update design token (`src/index.css`)

Ganti seluruh `:root` ke palet Lavender Cream (HSL):
- `--background: 260 100% 98%` (#faf8ff)
- `--foreground: 260 45% 13%` (#1a1330)
- `--card: 0 0% 100%`
- `--primary: 252 100% 68%` (#7c5cff), `--primary-foreground: 0 0% 100%`
- `--secondary / --muted: 258 100% 95%` (#ece6ff)
- `--accent: 252 100% 68%`
- `--border: 258 100% 95%`
- `--ring: 252 100% 68%`
- `--radius: 1rem` (kartu pakai `rounded-[32px]` langsung)
- Tambah token `--ink: 260 45% 13%` untuk bottom nav dark dan teks deep
- Dark mode: scale-balanced version dengan primary `252 100% 72%`, bg `260 45% 8%`, surface `260 35% 14%` (sekadar parity, tidak jadi default)

Hapus background radial-glow + dot pattern di `body` (sudah tidak cocok dengan hero solid ungu). Body cukup solid `bg-background`. Hero & nav yang membawa warna brand.

Update `@import` Google Fonts → Urbanist + Epilogue + JetBrains Mono (hapus Syne + Plus Jakarta).
`body { font-family: 'Epilogue' }`, `.font-display { font-family: 'Urbanist'; letter-spacing: -0.02em; }`.

## Update Tailwind (`tailwind.config.ts`)

- `fontFamily.display: ['Urbanist', ...]`
- `fontFamily.sans: ['Epilogue', ...]`
- `fontFamily.mono: ['JetBrains Mono', ...]`

## Komponen

### `src/components/Header.tsx` (sticky branded)
- `sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border`
- Logo: kotak `w-8 h-8 bg-primary rounded-lg` berisi SVG outline putih (brand-mark) — bukan border outline lagi
- Judul "Promptly" font-display bold + subtitle uppercase tracking-widest text-primary text-[10px]
- ThemeToggle tetap di kanan

### `src/components/Hero.tsx` (BARU)
- `bg-primary text-primary-foreground px-6 py-12 md:py-20`
- Headline 2 baris: "Your thoughts, structured." (Urbanist extrabold, 4xl→6xl)
- Sub-copy text-white/80
- **Search input embedded** di hero: `bg-white/10 border-white/20 rounded-2xl` dengan icon Search outline
- Search input ini menggantikan SearchFilterBar di top — SearchFilterBar lama dipindah jadi komponen filter tag/sort di bawah category bar (tetap dipakai tapi tanpa search field, atau search field di-bridge ke hero via lift state)
- Simpler: hero search drives `search` state di `Index.tsx`; SearchFilterBar lama tetap untuk tag filter + clear tags only

### `src/components/CategoryBar.tsx`
- Style ulang: chips `px-6 py-3 rounded-full text-sm font-semibold`
- Aktif: `bg-ink text-white` (pakai token `--ink` via class `bg-foreground text-background`)
- Tidak aktif: `bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground`
- Tombol "+ New" tetap ada, style border-dashed primary

### `src/components/PromptCard.tsx`
- Container: `bg-card border border-border p-6 rounded-[32px] hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col`
- Header card: category pill `bg-secondary text-primary text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1` + star icon outline (filled ketika favorit)
- Title `font-display text-xl font-bold group-hover:text-primary`
- Body snippet `text-sm text-foreground/60 line-clamp-3 mb-6 leading-relaxed`
- Footer card: `border-t border-secondary/50 pt-6` — tags uppercase prefix `#`, action buttons di kanan dalam `p-2 bg-secondary/40 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground`
- Edit mode tetap fungsional, hanya container styling ikut padding/radius baru

### `src/components/EmptyState.tsx`
- Tetap dipakai saat 0 prompt, styling padding besar, ikon outline dalam square primary/10
- Pesan jangan kekanak-kanakan, profesional singkat

### `src/components/Footer.tsx`
- Sederhana: max-w-7xl, dua baris flex — kiri "Promptly · © 2026 AI Prompt Library", kanan link "Cloud Sync · Terms · Privacy" (link mati / `#` saja karena belum ada halaman; tidak nambah route)
- Text `text-[13px] text-foreground/40 font-medium`, hover `text-primary`

### `src/components/BottomNav.tsx`
- Container: `bg-foreground` (ink dark) `rounded-full p-2 shadow-2xl shadow-foreground/40 border border-white/5`
- Tab Prompts/Settings: text `text-primary` saat aktif, `text-white/40` saat idle, label uppercase tracking-wider text-[9px]
- Tombol + di tengah: `w-12 h-12 bg-primary rounded-full shadow-lg shadow-primary/30`
- Hapus tampilan "glass" lama dan border ungu lembut

### `src/pages/Index.tsx`
- Layout baru:
  ```
  <Header />
  <Hero searchValue=... onSearchChange=... />
  <main max-w-7xl px-4 -mt-6>
    <CategoryBar />
    <SearchFilterBar minimal /> (tag chips + clear, optional)
    <sort + select toolbar />
    <grid prompts />
    {empty/no-results state}
  </main>
  <Footer />
  <BottomNav />
  ```
- Container utama `max-w-7xl` (bukan `max-w-4xl` lagi) supaya 3 kolom kartu lega di desktop
- Padding `px-4 sm:px-6`, gap kartu `gap-6`
- Hapus `pb-28` → cukup `pb-32` agar tidak ketabrak bottom nav
- Pertahankan: DnD reorder, select mode + bulk delete, share-import effect, sort options

### `index.html`
- Update title/meta description copywriting jadi lebih editorial branded
- Tetap pakai `brand-mark.svg` favicon (tetap outline monokrom)
- Preload font ganti ke Urbanist + Epilogue

### Memory update
- `mem://design/tokens` — replace dengan palet Lavender Cream + Urbanist/Epilogue
- `mem://index.md` Core — update font name + warna `#7c5cff`

## Yang TIDAK diubah
- Data, localStorage store, routing, fitur DnD/select/bulk/share-link/import-export
- SEO JSON-LD, sitemap, Google verification meta
- Logic prompt CRUD, hooks

## Catatan teknis
- Semua warna tetap via token HSL semantik (tidak ada hex hardcode di komponen) — palet hex prototype diterjemahkan ke variabel `--background`, `--primary`, dll. di `index.css`
- Ikon tetap Lucide outline stroke 1.75
- Hero ungu solid (bukan gradient) → kompatibel dengan rule "primary purple solid, NO gradient"
