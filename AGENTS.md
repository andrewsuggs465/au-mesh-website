# AU Mesh Club website

Astro + Starlight site for the Auburn University Mesh Club (aumesh.club),
deployed to GitHub Pages via `.github/workflows/deploy.yml`. Migrated from a
Zensical/mkdocs site — URLs under `/documentation/`, `/join/`, `/projects/`,
and `/resources/` intentionally match the old site; don't restructure them
without adding redirects.

Key conventions:

- Events live in `src/data/events.yaml` (one file, officer-edited); rendering
  and upcoming/past logic is in `src/lib/events.ts` + `src/components/`.
- The theme (mint `#68ea95` on `#1B1B1D`, Outfit/JetBrains Mono, dark-only) is
  in `src/styles/custom.css`, ported from the old site's `extra.css`. The
  `ThemeProvider`/`ThemeSelect` overrides pin dark mode — keep it dark-only.
- Site is maintained by rotating club officers of varying skill: prefer boring,
  editable Markdown/YAML over clever abstractions, and keep everything static
  (GitHub Pages, no backend).

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
