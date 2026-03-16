# Sprint Week Town Hall — Lovable Build Brief

## Overview

Build a **React single-page application** that serves as an interactive slide deck presentation for TBDC's Sprint Week internal Town Hall (March 26, 2025). The full component code is provided in `SprintWeekTownHall.jsx` — this document covers project setup, design system, implementation notes, and the graphics handoff checklist.

---

## Project Setup

### Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 19+ (via Vite) | Single-page app, no routing needed |
| CSS | Inline styles + Tailwind CSS v4 for utilities | Design tokens are defined as JS constants in the component |
| Icons | Lucide React | `npm install lucide-react` |
| Fonts | Google Fonts (4 families) | Loaded via `<link>` in `index.html` |
| Animation | CSS keyframes (built into component) | No external animation library needed for MVP |

### Font Loading

Add these to `index.html` `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Instrument+Serif:ital@1&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### Global Styles

Add to `index.css` or `App.css`:

```css
@import "tailwindcss";

html, body, #root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0A1628;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar { display: none; }
body { -ms-overflow-style: none; scrollbar-width: none; }
```

### Tailwind v4 Theme (if using Tailwind utilities beyond inline styles)

```css
@theme {
  --color-navy: #0A1628;
  --color-navy-light: #0f1f38;
  --color-teal: #00A88E;
  --color-teal-dark: #008c76;
  --color-warm-white: #FAF8F5;
  --color-sand: #F0ECE3;
  --color-charcoal: #1E293B;
  --color-slate-custom: #64748B;
  --color-gold: #D4A843;
}
```

---

## Design System (Quick Reference)

```
COLORS:     Navy #0A1628 | Teal #00A88E | Warm White #FAF8F5 | Sand #F0ECE3 | Charcoal #1E293B | Gold #D4A843
FONTS:      Headings: Plus Jakarta Sans 700/800 | Accent: Instrument Serif Italic | Body: Inter 400/500 | Labels: JetBrains Mono 400/700
RADIUS:     Buttons: rounded-full | Cards: 16px | Icon badges: 12px
SLIDES:     100vw × 100vh, viewport-locked, no scrolling
BACKGROUNDS: Alternate navy → light → navy → light (never two same backgrounds adjacent)
```

### Background Alternation Rule

The slides must alternate backgrounds to create visual rhythm:
- **Navy (#0A1628)** — Title slides, section dividers, dark emphasis
- **Warm White (#FAF8F5)** — Standard content, card grids
- **Sand (#F0ECE3)** — Alternate content slides, lighter emphasis

Never place two slides with the same background color back to back.

### Typography Hierarchy

| Element | Font | Size (clamp) | Weight | Color on Dark | Color on Light |
|---|---|---|---|---|---|
| Slide Title | Plus Jakarta Sans | clamp(2rem, 5vw, 3.75rem) | 800 | white | charcoal |
| Accent Text | Instrument Serif | Same as title | italic | teal | teal |
| Eyebrow | JetBrains Mono | 13px | 700, uppercase, tracking | teal | teal |
| Body Text | Inter | clamp(1rem, 1.5vw, 1.25rem) | 400 | white/70 | charcoal/80 |
| Slide Counter | JetBrains Mono | 14px | 700 | white/50 | — |

---

## Component Architecture

The provided `SprintWeekTownHall.jsx` is a single-file component containing everything:

### Structural Components
- `NoiseOverlay` — Fixed SVG noise texture (global, z-9999, pointer-events-none)
- `ProgressBar` — 2px teal bar at top of viewport showing slide progress
- `ControlBar` — Fixed bottom bar with prev/next arrows, slide counter, fullscreen toggle; auto-hides after 3s of inactivity
- `TableOfContents` — Left-panel overlay triggered by "Slides" button or `T` key
- `Slide` — Viewport-locked wrapper (100vw × 100vh)
- `SlideContent` — Padded, max-width-constrained content area

### Reusable Content Components
- `Eyebrow` — Mono, teal, uppercase label
- `SlideTitle` — H1 with heading font
- `AccentText` — Instrument Serif italic teal span
- `BodyText` — Inter body paragraph
- `TealBullet` — Custom bullet list with teal circle dots
- `DarkCard` — Glassmorphism card for navy backgrounds
- `LightCard` — White card with teal left accent for light backgrounds
- `PlaceholderGraphic` — Dashed-border placeholder for images (to be replaced)

### Slide Manifest (16 slides)

| # | Component | Background | Layout | Type |
|---|---|---|---|---|
| 01 | Slide01 | Navy | Centered | Title |
| 02 | Slide02 | Warm White | Two-column (text + placeholder) | Content |
| 03 | Slide03 | Navy | Centered | Section Divider |
| 04 | Slide04 | Sand | Heading + 2-col cards | Card Grid |
| 05 | Slide05 | Navy | Heading + 3-col cards | Card Grid |
| 06 | Slide06 | Warm White | Two-column (text + 2×2 cards) | Content |
| 07 | Slide07 | Navy | Centered + stat pills | Stats |
| 08 | Slide08 | Sand | Centered | Section Divider |
| 09 | Slide09 | Navy | Two-column | Content |
| 10 | Slide10 | Warm White | Heading + 4-col cards | Card Grid |
| 11 | Slide11 | Navy | Centered + pills | Content |
| 12 | Slide12 | Sand | Centered | Section Divider |
| 13 | Slide13 | Navy | Two-column (text + placeholder) | Content |
| 14 | Slide14 | Warm White | Heading + 3×2 cards | Card Grid |
| 15 | Slide15 | Navy | Heading + 2-col cards + contact bar | Content |
| 16 | Slide16 | Navy | Centered | Closing/CTA |

---

## Keyboard & Gesture Controls

| Input | Action |
|---|---|
| `→` / `Space` / `Enter` | Next slide |
| `←` / `Backspace` | Previous slide |
| `F` | Toggle fullscreen |
| `Escape` | Exit fullscreen / close TOC |
| `Home` | First slide |
| `End` | Last slide |
| `T` | Toggle Table of Contents |
| `1`–`9` | Jump to slide N |

### Touch/Click (nice-to-have for MVP)
- Click right half of screen → Next
- Click left half of screen → Previous
- Swipe left/right for mobile

---

## Implementation Notes for Lovable

1. **The JSX file is complete and self-contained.** Drop `SprintWeekTownHall.jsx` into your `src/` directory and render it as the root component (or import it into `App.jsx`).

2. **No external CSS framework required beyond Tailwind base.** All styling is inline via the `style` prop to ensure design token fidelity. Tailwind is only needed if you want to layer in responsive utilities.

3. **Placeholder graphics are intentional.** The `PlaceholderGraphic` components show where real photography will go. Leave them in place — the marketing team will provide final images.

4. **The component uses `clamp()` for responsive typography.** This ensures text scales smoothly between mobile and projector resolutions without breakpoint jumps.

5. **Auto-hide behavior on the ControlBar**: Show on mouse movement, hide after 3 seconds of inactivity. The logic is in a `useEffect` with a timeout ref.

6. **Fullscreen uses the native Fullscreen API.** The toggle is in the control bar and responds to the `F` key.

7. **Animation is minimal CSS (no GSAP dependency for MVP).** Slide transitions use a `slideIn` keyframe (fade + translateY). If you want to add GSAP later for staggered element entrances, the design doc specifies: `y:30, opacity:0, stagger:0.08, duration:0.7, ease:power3.out, delay:0.2`.

8. **Responsive grid layouts**: On viewports under 768px, multi-column grids should collapse to single column. The inline grid styles use fixed column counts — you may want to add Tailwind responsive classes or media queries for mobile.

9. **Accessibility**: The component includes `aria-label` on all buttons, an `aria-live="polite"` region for slide announcements, and `:focus-visible` outline styles.

---

## Enhancement Opportunities (Post-MVP)

These are not required for the initial build but are documented in the TBDC design system:

- **GSAP staggered entrances** — Animate individual elements on each slide after the slide transition
- **Animated counter component** — For any stat/metric slides (pattern provided in design doc)
- **Swipe gesture support** — Touch navigation for mobile/tablet
- **Presenter notes panel** — Hidden panel showing speaker notes per slide (toggled with `N` key)
- **Dot indicators** — Small dots at bottom center showing slide position
- **Breathing animation** — Subtle scale pulse on accent text in CTA/closing slides

---

## Graphics Handoff Checklist

The following placeholder graphics appear in the presentation and will need to be replaced with real photography or designed assets. Each is currently rendered by the `PlaceholderGraphic` component with a descriptive label.

| Slide | Location | Placeholder Label | Recommended Asset |
|---|---|---|---|
| Slide 01 (Title) | Background, 6% opacity | *(background gradient used)* | Subtle Toronto skyline photo, desaturated, very low opacity |
| Slide 02 (Why This Matters) | Right column | "Photo: Founders networking at TBDC event" | Candid photo of founders or attendees at a previous TBDC event, warm and professional |
| Slide 13 (Support Roles) | Right column | "Photo: Team supporting an event check-in" | Photo of TBDC team members at an event registration desk or setup |
| Slide 16 (Closing) | Background, 6% opacity | *(radial gradient used)* | Optional: Toronto skyline or TBDC office interior, used at very low opacity behind the closing message |

### Photography Guidelines (from TBDC design system)
- Images on dark slides should be extremely subtle: `opacity: 0.06` for background textures, `bg-navy/85` overlay for more visible backgrounds
- Inline images: `border-radius: 16px`, `box-shadow: 0 25px 50px rgba(0,0,0,0.25)`, `object-fit: cover`
- All photos should feel warm, professional, and energetic — reflecting the Sprint Week founder experience

### Additional Visual Assets (Optional)
- TBDC logo (for title slide or control bar)
- Country flags for the participating founder cohort (if available from programming team)
- Sprint Week event app screenshot (for Slide 15)

---

## File Delivery

| File | Description |
|---|---|
| `SprintWeekTownHall.jsx` | Complete React component — the entire presentation |
| This document | Build brief, design specs, and graphics checklist |

Both files should be sufficient for Lovable to scaffold the project, install dependencies, and render the presentation immediately.
