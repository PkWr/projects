---
title: Form
type: project-page
page: https://pkwr.github.io/projects/form/
tags: [project-pages]
---

<!-- This note IS the text on the website. Edit freely, then run publish.sh in ~/Sites/projects. -->
<!-- House style: third person ("Patrick Walker", never "I", "my" or "we"); no bold. -->

# Form

*Research & teaching*

This hole is a line some time next week.<br>A generative tool based on a publication by Patrick Walker.

## Summary

Draw a shape on a grid, or take a symbol or a letter at random, choose a rule, and Form works out every way the rule can make it up, one step at a time. It began as a small printed book, in which a T is made up eleven ways, and now runs in a web browser. What it makes can be played as an animation, laid out as a contact sheet and printed, saved as a GIF or video, or bound as an A5 book.

## Description

The book 11 ways I can make you up takes a T built from blocks and moves one block at a time. Each move leaves the old place marked. Each version is shown alongside the others, as form, direction, cumulative solid, cumulative transparency and cumulative density. The book draws on the Stations of the Cross, a sequence told in fixed steps; on Paul Klee's idea of taking a line for a walk; and on Rudolf Koch's The Book of Signs, a catalogue of simple symbols drawn from a small set of marks. It also follows Karl Gerstner's Designing Programmes, in which a design is set out as a rule that generates a field of related outcomes instead of a single fixed result.

Form turns that rule into a tool. Each cell of the grid is empty or holds a square, a circle, an arch or a half-square triangle. The arch and the triangle turn four ways, which gives eleven states per cell. The book's rule is Move: one block moves and stays joined to the rest, and its old place stays marked. Form adds two more rules, Change, where a block becomes another shape in the same place, and Grow, where the shape is built up from nothing. Each can act on one, two, three or all of the blocks in a step. Unmake is the rule run the other way: it takes blocks away one at a time and adds nothing back, and it follows by default. The rule is a sentence in the control panel, and tapping its words changes it. The results come as one sequence, titled by the rules chosen, for example "36 ways I can make you up, two blocks at a time and unmake you".

Five treatments show the same set differently: plain form, direction (stripes along each move), cumulative solid, transparency (ghosting) that fades with each step, and cumulative density, fine lines at different angles that build into a mesh.

The step-by-step order is deliberate: draw, see the results, and only then the outputs, with the book last. Going back to edit the shape is always possible. Starters come from two sets: signs and shapes, some in the manner of Koch, and a small 5×5 pixel typeface of capitals and numbers drawn for Form. The grid is 5, 7 or 9 across, and a separate demo page runs the sentence and the loop on its own.

## Publication model

Form treats the publication as an on-demand object. No edition is printed in advance. Each book is generated in the browser from the pattern the reader has drawn, then exported as A5 pages imposed two to a sheet of SRA4 landscape (320 × 225 mm) in booklet order, with bleed and crop marks. The reader prints it double-sided at full size, folds it, binds it and trims it to the marks. Production therefore moves to the reader, so there is no stock, no fulfilment and no server. The plain A5 export serves the same book on screen.

Because the book follows from the pattern, the pattern can identify it. The colophon prints a pattern code. The code records the shape, cropped to its bounding box, the grid size, the rules and how many blocks act at a time. The same shape drawn in a different place on the same grid gives the same code. A T of six squares on a 9×9 grid, made up and unmade two blocks at a time, is 3J4MZ-3V6XU-VW7S. The order in which blocks are taken away or added is seeded from the code and no date is printed, so entering a code regenerates the identical book.

The space of possible patterns is vast. With eleven states per cell, a 5×5 grid allows more than 10²⁶ patterns, a 7×7 grid more than 10⁵¹ and a 9×9 grid more than 10⁸⁴, before shifted copies are counted as one. A hand-drawn pattern is, in practice, one of a kind. Identical copies remain possible, though. Two pairs of starters make the same shape and so share a code (the letter X and a St Andrew cross, the letter Y and a life rune), very simple shapes coincide, and the random starter only fills the grid, so it never changes the code. The code makes that visible, so uniqueness becomes a property a reader can test, not a claim the publication makes for itself. Two readers can compare codes to learn whether they hold the same book.

## How it's made

Form has been built since 31 October 2026 by Patrick Walker, working with an AI coding assistant, from the book's own rules rather than from a template. The assistant was used to write and check the code. The design decisions, the rules and the treatments come from the publication. Every effect is a drawing technique, not a generative model, and nothing is generated by AI when the tool runs.

It is plain HTML, CSS and JavaScript, with no server, no accounts and no build step. Everything is made in the browser: the drawings are SVG, and the GIF encoder and the PDF writer for the book are written by hand, so nothing is uploaded. The book is imposed for printing, with two A5 pages on each A4 landscape sheet in booklet order, or as plain pages.

It shares its look and approach with [Spot](../spot/), the motion tooling made for [GD v/x AI](../gd-vx-ai/).

## Energy & sustainability

Form runs on the device already in the room, in a web browser, with no server. The drawings, the GIF and video, and the PDF book are all made on the device, and nothing is uploaded. Books are printed on demand, so none is made in advance. Form uses this to explore material use as on demand: paper and ink are spent only when a reader wants a book, and only for the pattern they have drawn.

AI enters the same question as in [Concrete](../concrete/) and [Spot](../spot/). The assistant was used to build Form, not to run it, so its energy was spent once, in development. The energy used to build Form has not been measured separately.

## Details

| | |
|---|---|
| Type | Generative tool and publication |
| Year | 2026 |
| Author | Patrick Walker |
| Based on | 11 ways I can make you up (printed publication) |
| Made with | HTML, CSS and JavaScript; SVG output; no server |
| Outputs | Animated SVG, contact sheet, print A3 to A0, GIF and video, A5 book (PDF), demo page |
| Model | Print on demand: each book is generated from the reader's pattern, identified by a pattern code |

## Themes

- [Energy & Sustainability](../themes/energy-and-sustainability/)
- [Working Backwards](../themes/working-backwards/)

## Links

- [Live: Form](https://form.pkwr.co/)
- [About Form](https://form.pkwr.co/about.html)
- Related: [GD v/x AI](../gd-vx-ai/)
