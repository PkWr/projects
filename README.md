# Project pages

Simple GitHub Pages site: one page per project, full-screen slideshow on the left, project details on the right (stacks on phones). No build step, no dependencies.

```
index.html            home page (text: content.md)
assets/site.css       shared design
assets/site.js        shared slideshow
publish.sh            copies Obsidian notes in and pushes
foxes/                index.html + images/
concrete/             index.html + images/
_template/            copy this to start a new project
```

## Adding images

Drop images into each project's `images/` folder using the names in that page's `slides` list (`01.jpg`, `02.jpg` …), or change the names in the list. Any slide whose file is missing shows a grey "Image not found" note, so it's obvious what's still needed.

Suggested sizes: around 2400px on the long edge, JPEG quality ~80, ideally under 600KB each.

Currently expected:

- **foxes/images/**: done, `01–11.jpg` (three prints, four generated images, plates, workshop, code detail). Opens on the live piece.
- **concrete/images/**: done, `01–15.jpg` (festival photos by Andy Brown, then install shots).

## Slide options

```json
{ "src": "images/01.jpg", "alt": "...", "caption": "..." }                    image, fills the frame (cropped)
{ "src": "images/01.jpg", "alt": "...", "caption": "...", "fit": "contain" }  image, shown whole (good for portraits)
{ "src": "images/01.jpg", "alt": "...", "position": "center top" }            choose which part stays in view when cropped
{ "type": "video", "src": "images/clip.mp4", "poster": "images/01.jpg" }     muted looping video
{ "type": "embed", "src": "https://foxes.pkwr.co", "caption": "..." }       live web piece in a frame
```

The slideshow holds each image for 8 seconds with a slow 5s crossfade and gentle drift (clicks and keys use a quick fade). Live embeds stay put unless given a "duration". Set `"autoplay": false` (or a number of milliseconds) at the top of a page's data block to change that.

Info: hover the strip on the right edge to peek, click to keep it open. Over the image: click the outer numbers (e.g. 15 · 01 · 02) to go back or forward; the controls fade after 2.5s without activity. Keys: ← → to move, `i` toggles the panel, Esc closes it, `f` full screen, space pauses.

## Editing text (from Obsidian)

The words on each page come from a Markdown note, not the HTML:

- Obsidian `Projects/Project Pages/Home - About.md`  ->  `content.md` (home)
- Obsidian `Projects/Project Pages/<project>/<Name>.md`  ->  `<project>/content.md`

Edit the note in Obsidian, then in Terminal:

```bash
cd ~/Sites/projects
bash publish.sh "what changed"
```

That copies the notes in, commits and pushes. Note format: `# Title`, an optional `*eyebrow*` line and a subtitle line, then `## Section` headings. Paragraphs become text, `- item` becomes a list, `| Label | Value |` rows become the details table, `- [Label](url)` becomes a link, `- Related: [Label](../project/)` a related link. On the home note, links under `## Projects` become the menu (`- [Concrete](concrete/) 2025`). Under `## Images`, each line sets an image's description and caption: `` - `images/01.jpg`: description *caption* ``. Under `## Scenes`, each `- [Name](link)` becomes a live slide (15 seconds each), shown before any images.

If a note is missing, the page falls back to the text built into its `index.html`.

## Adding a project

1. Copy `_template/` to a new folder, e.g. `schwalbe/`.
2. Edit the data block in its `index.html` and add images.
3. Copy `_template/Project name.md` into Obsidian as `Project Pages/<project>/<Name>.md` and write the text there.
4. Add a line for it under `## Projects` in `Home - About.md`, then `bash publish.sh`.

## Publishing on GitHub Pages

1. Create a repo (e.g. `PkWr/projects`) and push this folder's contents to `main`.
2. Repo **Settings → Pages** → Source: *Deploy from a branch* → `main` / root.
3. Live at `https://pkwr.github.io/projects/` within a minute or two.

For a custom domain such as `projects.pkwr.co`, add it under Settings → Pages and point a CNAME record at `pkwr.github.io`.

The `.nojekyll` file stops GitHub processing the site (so the `_template` folder is served as-is).
