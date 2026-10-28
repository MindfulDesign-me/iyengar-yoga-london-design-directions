# Iyengar Yoga London · Design directions

Three homepage design directions for [Iyengar Yoga London](https://iyengaryogalondon.co.uk) (Iyengar Yoga Institute, Maida Vale), prepared by Mindful Design in October 2026 as an outreach invitation.

Published with GitHub Pages. Every page carries `noindex, nofollow`.

## Structure

```
index.html          The folio: what we heard, the shared booking journey, the three directions with live previews, comparison, research, next steps
a/home.html         Direction A · Alignment (chaptered editorial, Instrument Serif + Geist)
b/home.html         Direction B · Practice (booking first, Plus Jakarta Sans)
c/home.html         Direction C · Lineage (dark and cinematic, Archivo Expanded + IBM Plex Mono)
assets/data.js      Real programme from the live Mindbody timetable, workshops, tasters, course dates and prices (28 Oct to 3 Nov 2026)
assets/booking.js   One booking sheet shared by all three: Choose, Confirm, Booked (nothing is sent anywhere)
assets/booking.css  Sheet layout; each direction themes it through --bk-* tokens
assets/motion.js    Reveals, parallax and scroll progress; does nothing under prefers-reduced-motion
assets/fonts/       Self-hosted Google Fonts (SIL OFL), latin subset
assets/img/         The Institute's own photographs, converted to WebP
assets/shots/       Thumbnails for the index
```

## Principles

- Real content and photographs only, from iyengaryogalondon.co.uk.
- One way to book classes, livestreams, workshops, tasters, the beginners course, membership and Yogapasses.
- Mobile first; WCAG AA contrast; every scroll effect respects `prefers-reduced-motion`.
- No tracking, analytics or third-party requests.

## Signature moves

- **A · The adjustment:** photographs arrive a few degrees off true beside a plumb line and settle onto it as you scroll.
- **B · Find your level:** one answer filters the timetable, the up-next card, workshops and personal next steps.
- **C · Hold the pose:** a pinned scene where scrolling counts a held minute through arrive, stay, support and attend.

## Local preview

```bash
python3 -m http.server 4630
```
