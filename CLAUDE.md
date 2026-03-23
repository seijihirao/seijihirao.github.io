# CLAUDE.md

## Project Overview

Personal website (seiji.life) — static site served from `public/`. Includes a main portfolio page and multiple sub-pages (boardgames, shizen, wedding, etc.), each as a self-contained static app in its own directory.

## Tech Stack

- Vanilla HTML/JS/CSS (no build framework)
- Tailwind CSS + DaisyUI for styling
- Handlebars for templating
- TSParticles for particle effects
- AOS for scroll animations
- `serve` for local dev server

## Commands

- `npm install` — install dependencies
- `npm start` — generate boardgames config and serve `public/`
- `npm run build` — generate boardgames config only

## Project Structure

```
public/                  # Static site root (served directly)
├── index.html           # Main portfolio page
├── assets/              # Static assets (images, fonts, etc.)
├── components/          # Reusable JS/CSS components (card.js, card.css)
├── data/                # JSON config files (AOS, particles, tailwind, themes)
└── <name>/              # Sub-pages (boardgames, shizen, wedding, etc.)
    └── index.html       # Each sub-page is a self-contained static app
package.json             # Project config & scripts
tsconfig.json            # TypeScript config
```

## Conventions

- No build step for the main site — files in `public/` are served as-is
- Config data lives in `public/data/*.json`
- Environment variables may be used for boardgames config generation
