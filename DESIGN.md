# MizanApp.tr Design System Specification (`DESIGN.md`)
> *Engineered following `ui-ux-pro-max-skill`, `Leonxlnx/taste-skill`, `VoltAgent/awesome-design-md`, and `kylezantos/design-motion-principles`.*

---

## 1. Design Philosophy & Anti-Slop Manifesto
- **No AI Slop:** Eliminate generic rainbow gradients, oversized empty cards, and decorative visual noise that lacks financial meaning.
- **Swiss Grid & High-Density Fintech:** Data density with generous typographic breathing room. Every pixel serves investor decision-making.
- **Color Discipline:**
  - **Base Canvas:** `slate-950` (`#020617`), `slate-900/70` surface cards.
  - **Borders & Dividers:** Subtle, crisp borders with 1px `border-white/[0.06]` or `border-slate-800/80`.
  - **Primary Accent (Islamic Emerald):** `emerald-500` (`#10b981`), `emerald-400` (`#34d399`), and `emerald-600` (`#059669`). Used strictly for halal compliance, positive returns, and primary actions.
  - **Risk & Alert Accents:**
    - `amber-400` / `amber-500`: **Çıkma İhtimali / Riskli Eşik (Watchlist)** and Grace Period tolerance.
    - `rose-500` / `rose-400`: **Katılımdan Çıktı (Kapsam Dışı)** and critical ratio breaches.
  - **Typography (Monospace Numbers):** All monetary amounts, lot sizes, ratios, and percentages use tabular monospace figures (`font-mono`) to prevent visual jitter during live updates.

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
