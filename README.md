# AU Mesh Club Website

Source for [aumesh.club](https://aumesh.club), the Auburn University Mesh Club
site. It's an [Astro](https://astro.build) + [Starlight](https://starlight.astro.build)
site hosted on GitHub Pages. Pushing to `main` rebuilds and deploys it.

## Editing content

Most updates are one file and can be done in the GitHub web editor. Commit the
change and the site redeploys in a couple of minutes (see the **Actions** tab).

| To change... | Edit |
| :--- | :--- |
| An event | `src/data/events.yaml` (one entry per event; notes at the top of the file). Past events drop to "Past events" on their own. |
| The workshop list | `src/data/workshops.yaml` (one entry per workshop; notes at the top) |
| A docs page | The matching file under `src/content/docs/documentation/` |
| A new docs page | Add a `.md` file under `src/content/docs/documentation/meshtastic/` — copy the frontmatter from an existing one |
| Homepage text or links | `src/content/docs/index.mdx` |
| The resources list | `src/content/docs/resources.md` |
| A news post | Copy `src/content/docs/news/_template.md` to `news/your-post.md`; the filename becomes the URL |
| A build photo | Put the photo in `src/assets/projects/`, add an entry to `src/data/projects.yaml` |
| An image on a page | Put it in `src/assets/` and link it with a relative path so Astro resizes it; files in `public/` are served as-is |

Navigation (sidebar and header links) lives in `astro.config.mjs`.

## Running locally

Needs [Node.js](https://nodejs.org) 22.12+.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # output in ./dist/
```

## Layout

```
src/
├── content/docs/     Markdown/MDX for every page
│   ├── index.mdx         homepage
│   ├── events.mdx        events (rendered from events.yaml)
│   ├── workshops.mdx     workshops (rendered from workshops.yaml)
│   ├── projects.mdx      build gallery
│   ├── resources.md      link list
│   ├── news/             posts
│   ├── tools/            link budget calculator, mesh map
│   └── documentation/    the docs section
├── data/            YAML lists officers edit (events, workshops, projects)
├── assets/projects/ build photos
├── components/      header, footer, event cards, quick-link cards
├── lib/             event/workshop sorting, link budget math
└── styles/          the mint-on-black theme
astro.config.mjs     site config: nav, social links, redirects
public/              favicon, logos, CNAME
.github/workflows/   build and deploy to GitHub Pages
```

## Deployment

A push to `main` runs the GitHub Actions workflow, which builds the site and
publishes it to GitHub Pages at `aumesh.club` (domain set by `public/CNAME`).
The workflow also runs weekly so the events page stays current on its own.
