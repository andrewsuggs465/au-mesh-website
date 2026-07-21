# AU Mesh Club Website

The website for the Auburn University Mesh Club, live at **[aumesh.club](https://aumesh.club)**.
Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build),
deployed automatically to GitHub Pages on every push.

This README is written for future officers — you don't need to be a web
developer to keep the site up to date.

## Common tasks (no local setup needed)

You can do all of these directly in the GitHub web editor. Edit the file,
commit, and the site rebuilds and deploys itself in a couple of minutes
(watch the **Actions** tab).

| I want to… | Edit this |
| :--- | :--- |
| Add or change an **event** | `src/data/events.yaml` — one entry per event, instructions are at the top of the file. Past events move to "Past events" automatically. |
| Update the **workshops** lineup | `src/content/docs/workshops.mdx` |
| Edit a **docs page** | The matching file under `src/content/docs/documentation/` |
| Add a **new docs page** | Add a `.md` file under `src/content/docs/documentation/meshtastic/` with `title:` frontmatter (copy an existing file's header) |
| Change **homepage** text or links | `src/content/docs/index.mdx` |
| Update **join/resources/projects** | `src/content/docs/join.mdx`, `resources.md`, `projects.md` |
| Add an **image** | Upload to `public/images/`, reference it as `/images/filename.png` |

## Running locally

Requires [Node.js](https://nodejs.org) 18+.

```sh
npm install      # first time only
npm run dev      # dev server at http://localhost:4321
npm run build    # production build to ./dist/
```

## How the site is put together

```
src/
├── content/docs/            # every page on the site (Markdown/MDX)
│   ├── index.mdx            #   homepage hub
│   ├── events.mdx           #   events page (rendered from events.yaml)
│   ├── workshops.mdx        #   workshop tracks
│   ├── join.mdx             #   how to join
│   ├── projects.md          #   member build gallery
│   ├── resources.md         #   link collection
│   └── documentation/       #   the docs section
├── data/events.yaml         # ← the events list officers edit
├── components/              # event cards, quick-link cards, header
├── styles/custom.css        # the mint-on-black AU Mesh theme
└── lib/events.ts            # upcoming/past event sorting
astro.config.mjs             # site config: nav sidebar, social links
public/                      # images, logos, favicon, CNAME
.github/workflows/deploy.yml # build + deploy to GitHub Pages
```

Site-wide navigation (the sidebar and header links) is configured in
`astro.config.mjs`.

## Deployment

Pushing to `main`/`master` triggers the GitHub Actions workflow, which builds
the site and publishes it to GitHub Pages at the custom domain `aumesh.club`
(set by `public/CNAME`). The workflow also rebuilds weekly so the events page
stays current without anyone pushing.
