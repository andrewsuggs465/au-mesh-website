# AU Mesh Club Website

Source for [aumesh.club](https://aumesh.club), the Auburn University Mesh Club
site. It's an [Astro](https://astro.build) + [Starlight](https://starlight.astro.build)
site hosted on GitHub Pages. Pushing to `main` rebuilds and deploys it.

## Editing content

Most updates are one file and can be done in the GitHub web editor. Commit the
change and the site redeploys in a couple of minutes (see the **Actions** tab).

| To change... | Edit |
| :--- | :--- |
| An event, meeting, or workshop | `src/data/calendar.yaml` (one entry per item; notes at the top of the file). It feeds the Calendar page, the homepage "next up" card, and the `/aumesh.ics` feed. Past entries drop into "Past events" on their own. |
| A docs page | The matching file under `src/content/docs/documentation/` |
| A new docs page | Add a `.md` file under `src/content/docs/documentation/meshtastic/`, copying the frontmatter from an existing one |
| Lecture notes | `src/content/docs/documentation/lectures/`, one file per talk, linking the slides on Box. Graphics go in `src/assets/lectures/` and are linked with a relative path, so Astro sizes them and the page does not jump while they load. |
| Homepage text or links | `src/content/docs/index.mdx`. The "Quick links" tiles are `<HubCard>` blocks and the "What we do" tiles are `<InfoCard>` blocks; edit, reorder, or delete them in place. |
| The resources list | `src/content/docs/resources.md` |
| A news post | Copy `src/content/docs/news/_template.md` to `news/your-post.md`; the filename becomes the URL. Set `cover:` in the frontmatter for the photo at the top of the post and the thumbnail on the News page. For captioned photos in the body, save it as `.mdx` and use `<Figure>`. |
| A build photo | Put the photo in `src/assets/projects/`, add an entry to `src/data/projects.yaml` |
| An image on a page | Put it in `src/assets/` and link it with a relative path so Astro resizes it; files in `public/` are served as-is |

The header nav is the `links` array in `src/components/Header.astro`. The docs
sidebar is in `astro.config.mjs`, along with redirects for old URLs.

## Running locally

Needs [Node.js](https://nodejs.org) 22.12+.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # output in ./dist/
npm test         # checks on the CSMA model
```

## Layout

```
src/
├── content/docs/     Markdown/MDX for every page
│   ├── index.mdx         homepage
│   ├── calendar.mdx      meetings, workshops, and events, plus the .ics feed
│   ├── projects.mdx      build gallery
│   ├── resources.md      link list
│   ├── news/             posts
│   ├── tools/            link budget calculator, CSMA walkthrough, mesh map
│   └── documentation/    Meshtastic guide and lecture notes
├── data/            YAML lists officers edit (calendar, projects)
├── assets/projects/ build photos
├── components/      header, footer, calendar, CSMA sim, quick-link cards
├── lib/             calendar merging and .ics output, link budget math, CSMA model
├── pages/           aumesh.ics.ts, the subscribable calendar feed
└── styles/          the mint-on-black theme
astro.config.mjs     site config: nav, social links, redirects
public/              favicon, logos, CNAME
.github/workflows/   build and deploy to GitHub Pages
```

## Deployment

A push to `main` runs the GitHub Actions workflow, which builds the site and
publishes it to GitHub Pages at `aumesh.club` (domain set by `public/CNAME`).
The workflow also runs weekly so the calendar stays current on its own.

That weekly rebuild is what makes `https://aumesh.club/aumesh.ics` worth
subscribing to: anyone who adds it as a calendar subscription picks up new
events without touching anything. The file is generated from the two YAML
files by `src/pages/aumesh.ics.ts`.
