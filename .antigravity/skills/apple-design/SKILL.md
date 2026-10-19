---
name: apple-design
description: Apple Human Interface Guidelines and Cupertino Design System. High-density typography (SF Pro), hairline borders, edge-to-edge content, action blue / emerald accents, frosted glass (backdrop-blur-2xl with white/[0.04] overlays), restrained micro-interactions, and premium tactile depth.
---

# Apple Design System

Full specification in `DESIGN.md`. Follow strict Apple Human Interface Guidelines:
- Glassmorphism & Depth: `backdrop-blur-2xl bg-slate-950/70 border border-white/[0.08]` with subtle inner hairline rings.
- Typography: SF Pro Display / Text hierarchy, tight negative letter spacing on headings, tabular numbers (`font-mono` / `tabular-nums`).
- Color & Restraint: 95% monochromatic chrome, color applied strictly to data (Emerald for compliant, Amber for risk, Rose for breach).
- Micro-interactions: 180-250ms spring transitions, active button scaling `active:scale-[0.98]`, subtle hover elevations.
