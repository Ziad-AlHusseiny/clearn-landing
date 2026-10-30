# Clearn — landing page

The marketing page for [Clearn](https://clearn.vercel.app) ("Clear it. Learn it. Earn it."), in English and Egyptian
Arabic, with scroll animations.

**Live:** https://ziad-alhusseiny.github.io/clearn-landing/ (add `?lang=ar` for Arabic)

Plain HTML, CSS and JavaScript — no build step. GitHub Pages serves this repository's `main` branch as it is.

## Preview locally

```bash
python3 -m http.server 8090
```

Then open http://127.0.0.1:8090. Opening `index.html` straight from the disk also works.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page. Its English text is also what shows without JavaScript. |
| `i18n.js` | Every string in English and Arabic, plus the live demo question. |
| `styles.css` | The Clearn brand styles. `.fx` turns on the layouts the scroll animations need. |
| `main.js` | Language switch, the live question, the compare slider and the GSAP scroll animations. |
| `vendor/` | GSAP 3.14.2 + ScrollTrigger ([GSAP standard licence](https://gsap.com/standard-license), no charge). |
| `fonts/` | IBM Plex Sans, Sans Arabic and Mono (SIL Open Font License, see `fonts/OFL.txt`). |
| `img/` | Real screenshots of the app (the study progress in them is demo data) and `og.jpg` for link previews. |

## Rules

- Real screenshots and real counts only. When the counts change, update `data-count` in `index.html` and the
  `try.p` / `numbers.note` strings in `i18n.js` (with the new date).
- No price claims, no semester number, no university logo; the "independent student project" line stays in the footer.
- No personal contact details (phone numbers, emails) on the page.

Clearn is an independent student project, not an official EELU service. Developed by
[Ziad Al-Husseiny](https://github.com/Ziad-AlHusseiny).
