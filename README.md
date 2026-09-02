# abdulkadir-yz.github.io

Personal CV and portfolio site — a Lord of the Rings themed single page.

**Live:** https://abdulkadir-yz.github.io/

## Structure

Static HTML/CSS/JS. No build step, no dependencies — GitHub Pages serves the
files as they are.

```
index.html        markup and content (the only place content lives)
css/base.css      design tokens, reset, typography, reduced-motion
css/components.css nav, buttons, cards, badges, terminal, footer
css/sections.css  per-section layout, responsive and print rules
script.js         theme toggle, nav, terminal typing, ember canvas, reveals
assets/           favicons
```

## Notes

- Two themes: Shadow of Mordor (dark, default) and Light of Valinor. The
  choice is kept in `localStorage`.
- Every animation is behind `prefers-reduced-motion` — the ember canvas stops
  entirely, the terminal shows one finished line instead of typing.
- The page carries Open Graph tags and a JSON-LD `Person` block for search
  engines and link previews.
- `@media print` strips the canvas, nav and decoration so Ctrl+P yields a
  readable CV.

## Editing

Content is written directly in `index.html`. Sections are marked with
`<!-- ===== CHAPTER N — TITLE ===== -->` comments.
