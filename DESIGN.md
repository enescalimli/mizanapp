# MizanApp.tr Design System Specification (`DESIGN.md`)
> *Engineered following `apple-design`, `Leonxlnx/taste-skill`, `VoltAgent/awesome-design-md`, and `kylezantos/design-motion-principles`.*

---

## 1. Design Philosophy & Official 60-30-10 Color Architecture (Northline System)
- **No AI Slop:** Eliminate generic rainbow gradients, navy/blue SaaS cliches, oversized empty cards, and decorative visual noise that lacks financial meaning.
- **Swiss Grid & High-Density Fintech:** Data density with generous typographic breathing room. Every pixel serves investor decision-making.
- **Official 60-30-10 Brand & UI Color System (Fixed Northline Palette — No Palette Switcher):**
  - **60% Dominant Canvas (`--mizan-bg-60`):** Midnight Black (`#08080C`) in Dark Mode (default) / Soft Alabaster (`#F4F5F7`) in Light Mode, with subtle atmospheric radial lime glow (`.mizan-glow-bg`).
  - **30% Secondary Surfaces & Ink (`--mizan-surface-30` / `--mizan-ink-30`):** Dark Frosted Glass (`#0D0E14` / `#111218` / `rgba(17, 18, 24, 0.72)`) and Pure White (`#FFFFFF`) in Dark Mode; Pure White (`#FFFFFF`) cards and Midnight Ink (`#08080C`) in Light Mode, with `backdrop-filter: blur(28px) saturate(180%)`.
  - **10% Accent (`--mizan-accent-10`):** Electric Lime (`#C6F432`) in Dark Mode and Crisp Emerald (`#10B981`) for Light Mode text/icon readability. Reserved strictly for primary CTAs (`.mizan-accent-btn`), editorial italic focal words, active navigation pills, and key highlight badges.
  - **Specular Hairline Borders & Dividers:** Crisp `1px` borders with `rgba(255, 255, 255, 0.14)` (top specular edge `rgba(255, 255, 255, 0.28)`) on dark surfaces, or `rgba(0, 0, 0, 0.08)` on light surfaces.
  - **Semantic Status Micro-Accents (Strictly Scoped to Financial Data Badges):**
    - `emerald-400` / `emerald-500` (`#34d399` / `#10b981`): **Katılıma Uygun (Uyumlu)** badge dot/text and positive price ticks only.
    - `amber-400` / `amber-500` (`#fbbf24` / `#f59e0b`): **Çıkma İhtimali / Kritik Eşik (Watchlist)** and purification ratio warnings only.
    - `rose-400` / `rose-500` (`#fb7185` / `#f43f5e`): **Katılımdan Çıktı (Kapsam Dışı)** and threshold breaches only.
  - **Typography (Monospace Numbers):** All monetary amounts, lot sizes, ratios, and percentages use tabular monospace figures (`font-mono` / `JetBrains Mono`) to prevent visual jitter. Editorial italicized serif (`Instrument Serif` / `Newsreader`) is used for high-contrast typographic focal words.

---

## 2. Motion & Micro-Interaction Principles (Emil Kowalski Restraint)
- **Duration & Easing:**
  - Standard interactions: `200ms cubic-bezier(0.16, 1, 0.3, 1)` (crisp, confident).
  - Hover effects: subtle elevation, `hover:border-emerald-500/40`, `hover:bg-slate-800/60`.
  - Button presses: `active:scale-[0.98]` tactile click response.
- **Live Price Ticks:**
  - Flash transitions for live quote changes (`bg-emerald-500/20` for upward ticks, `bg-rose-500/20` for downward ticks, fading over `800ms`).
  - Subtle breathing green dot for active WebSocket / streaming data engine.
- **Non-Intrusive Alarms:**
  - Alarms are **never** rendered as screen-blocking giant banners.
  - Alarms live in an elegant **Notification Bell Badge & Slide-over Drawer** + contextual table pill badges (`🔴 Katılımdan Çıktı`, `⚠️ Çıkma İhtimali`).

---

## 3. Financial Mathematical Integrity
- **Zero-Float Policy:** Strict `decimal.js` execution across all portfolio market values, holding period pro-rata factor calculation, exit purification deductions, and zakat obligations.
- **Holding Period Invariance:** Days held are strictly calculated as the calendar delta between `purchaseDate` and `valuationDate` (`daysHeld = differenceInDays(today, purchaseDate)`).
