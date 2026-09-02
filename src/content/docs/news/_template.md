---
# Copy this file to start a post: news/fall-kickoff-recap.md
# The file name becomes the URL, e.g. /news/fall-kickoff-recap/
# Files starting with _ are ignored, so this template never publishes.
title: Post title
description: One or two sentences. This shows under the title on the News page.
date: 2026-01-31
author: Your name
template: splash
editUrl: false
# Optional. Shows at the top of the post and as the thumbnail on the News page.
# The photo has to live in src/assets/ for this to work.
# cover: ../../../assets/news/my-post/photo.JPG
# coverAlt: What is happening in the photo, for anyone who cannot see it.
---

Write the post here in normal Markdown. Headings, lists, links, and images all
work the same way they do elsewhere on the site.

Photos go in `src/assets/` and are referenced with a relative path so Astro
resizes them:

![Alt text describing the photo](../../../assets/projects/andrew.jpg)

For a photo with a caption under it, rename the file to `.mdx` and use the
Figure component. Everything above still works the same way:

    import Figure from '../../../components/Figure.astro';
    import photo from '../../../assets/news/my-post/photo.JPG';

    <Figure
        src={photo}
        alt="What is in the photo, for anyone who cannot see it."
        caption="The line printed under the photo."
    />

Phone photos are usually 4 to 5 MB. Leave them at full size; the build resizes
them and only ships versions a browser will actually use.
