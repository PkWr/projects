# Project pages

Simple GitHub Pages site: one page per project, full-screen slideshow on the left, project details on the right (stacks on phones). No build step, no dependencies.

```
index.html            project list
assets/style.css      shared design
assets/slideshow.js   shared slideshow
foxes/                index.html + images/
concrete/             index.html + images/
_template/            copy this to start a new project
```

## Adding images

Drop images into each project's `images/` folder using the names in that page's `slides` list (`01.jpg`, `02.jpg` …), or change the names in the list. Any slide whose file is missing shows a grey "Image not found" note, so it's obvious what's still needed.

Suggested sizes: around 2400px on the long edge, JPEG quality ~80, ideally under 600KB each.

Currently expected:

- **foxes/images/**: `01–03.jpg` the three etchings (shown whole, not cropped), `04.jpg` Nodes installation view. Slide 5 embeds the live piece from foxes.pkwr.co.
- **concrete/images/**: done, `01–15.jpg` (festival photos by Andy Brown, then install shots).

## Slide options

```json
{ "src": "images/01.jpg", "alt": "...", "caption": "..." }                    image, fills the frame (cropped)
{ "src": "images/01.jpg", "alt": "...", "caption": "...", "fit": "contain" }  image, shown whole (good for portraits)
{ "src": "images/01.jpg", "alt": "...", "position": "center top" }            choose which part stays in view when cropped
{ "type": "video", "src": "images/clip.mp4", "poster": "images/01.jpg" }     muted looping video
{ "type": "embed", "src": "https://foxes.pkwr.co", "caption": "..." }       live web piece in a frame
```

The slideshow auto-advances every 6 seconds on image slides and stops on video/embed slides. Set `"autoplay": false` (or a number of milliseconds) at the top of a page's data block to change that.

Keys: ← → to move, `i` hides the details panel, `f` full screen, space pauses.

## Adding a project

1. Copy `_template/` to a new folder, e.g. `schwalbe/`.
2. Edit the data block in its `index.html` and add images.
3. Add a card for it in the root `index.html`.

## Publishing on GitHub Pages

1. Create a repo (e.g. `PkWr/projects`) and push this folder's contents to `main`.
2. Repo **Settings → Pages** → Source: *Deploy from a branch* → `main` / root.
3. Live at `https://pkwr.github.io/projects/` within a minute or two.

For a custom domain such as `projects.pkwr.co`, add it under Settings → Pages and point a CNAME record at `pkwr.github.io`.

The `.nojekyll` file stops GitHub processing the site (so the `_template` folder is served as-is).
