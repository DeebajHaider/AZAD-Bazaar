# AZAD-Bazaar

AZAD-Bazaar is a new application focused on improving the user interface and user experience gaps found in the original Bazaar app. The name "AZAD" is derived from the first names of the project founders: Abdul Wasay (A), Zuhair (Z), and Deebaj (D).

## TL;DR

A modern, accessible, and easy-to-use marketplace UI that keeps Bazaar's strengths while removing common usability pain points: discoverability, dense layouts, poor accessibility support, and confusing checkout flows.

## Why this project

Bazaar is a popular marketplace, but many users and evaluators have reported repeated UI deficiencies that reduce engagement and increase errors. AZAD-Bazaar targets those issues by:

- Redesigning navigation and content hierarchy for better discoverability.
- Prioritizing accessibility (keyboard navigation, screen-reader labels, contrast, and focus states).
- Simplifying product pages and the checkout flow to reduce cognitive load.
- Being modular so UI improvements can be adopted incrementally.

## Key features (planned)

- Clean, responsive product and category pages.
- Improved search with instant suggestions and filters.
- Accessible components (ARIA roles, keyboard shortcuts, focus outlines).
- Streamlined cart and checkout with clear progress indicators.
- Theme support (light/dark) and localization scaffolding.

## Project status

This repository contains the initial project scaffold and UI-focused work. See the issues and project board for planned improvements.

## Quick start (assumptions)

Assumptions: this is a web application using a standard JS toolchain (Node.js + package manager). If the project uses a different stack, follow the repo-specific guidance instead.

Open a terminal (PowerShell) at the project root and run:

```powershell
# install deps (if a package.json exists)
npm install

# start the dev server (if applicable)
npm start
```

If the repository uses another stack (Python, Flutter, etc.), check project-specific files (`package.json`, `pyproject.toml`, `requirements.txt`, `pubspec.yaml`) and follow those instructions.

## Contributing

Contributions are welcome. Small, focused pull requests are best. Suggested workflow:

1. Create a feature branch named `feat/short-description`.
2. Add tests or visual snapshots for UI changes where possible.
3. Open a PR with a clear description and screenshots or GIFs for UI changes.

## Suggested next steps

- Add a LICENSE (e.g., MIT) if you want to make the project open-source.
- Add screenshots or an animated GIF in `docs/` or `assets/` to show the UI improvements.
- Add a `CONTRIBUTING.md` with code guidelines and PR checklist.
- Add a minimal CI workflow to run linting and tests on PRs.

## A note on the name

AZAD stands for Abdul Wasay (A), Zuhair (Z), and Deebaj (D). It also evokes the word "azad" (which means "free" in several South Asian languages), reflecting our aim to free users from frustrating UI patterns.

---

If you'd like, I can also:
- Add a `LICENSE` file (MIT) and a `CONTRIBUTING.md`.
- Add screenshots or placeholder images to the README.
- Detect the repo stack and tailor the Quick Start instructions exactly.

Tell me which of these follow-ups you want next.