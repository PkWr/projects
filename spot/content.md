---
title: Spot
type: project-page
page: https://pkwr.github.io/projects/spot/
tags: [project-pages]
---

<!-- This note IS the text on the website. Edit freely, then run publish.sh in ~/Sites/projects. -->
<!-- House style: third person ("Patrick Walker", never "I", "my" or "we"); no bold. -->

# Spot

*Research & teaching*

Image-processing and motion tooling, 2026

## Summary

Spot is image-processing and motion tooling that runs in a web browser, made for GD v/x AI. It cycles through photographs and processes them live, from a phone to the six walls of the Igloo Immersive Suite.

## Description

Spot processes photographs as they play: duotone, pixelate, halftone and ASCII effects; moving strips with echo trails; blend overlays; and 3D forms that wrap images or bend them like glass.

It needs no specialist hardware, account, subscription or upload. The same tooling scales from a phone to a desktop to the six walls of the Igloo, where it first ran as Spot Room on 15 October 2026, and it works in real time, with no render pass. Spot Reel is the showreel.

Spot is the first tooling output of GD v/x AI, after its proof of concept, Concrete (2025).

## How it's made

It began as a background piece for a two-hour outreach workshop with technical college students on 10 July 2026: a single web page of live image processing, which took the photos students shot during the session and processed them on the wall in real time while they photographed and drew by hand. The first version was built in six days, by Patrick Walker working with an AI coding assistant to a fixed written brief: three files, no server, no login, and a set of seed images so it would still run if the wifi failed.

It has grown through use since. Pixelation, halftone, ASCII and duotone effects; 3D forms that wrap each image round a shape; a live camera layer; a second window for controls; and stage sizes for a phone, a desktop and the Igloo's six walls. In October 2026 it was named Spot; Spot Room is the Igloo version, Spot Reel the showreel. Scenes can be saved as links, which is how the scenes on this page are shown. It is still plain HTML, CSS and JavaScript, with no server and no build step.

Making it was a collaboration. Patrick Walker brought creative practice, context and insight; working with the AI elevated them, extending what could be built and how quickly. The AI is in the making, not the running: every effect is a drawing technique, not a generative model.

## Energy & sustainability

Every piece of making has an energy cost, and digital work tends to hide its own. Spot tries to keep its cost small and in view. It runs on the device already in the room: the phone, the laptop, or the Igloo's own computer. It works in real time, with no render pass and no exported video. Nothing is uploaded or stored on a server, because there is no server.

Industry motion tools assume high-spec hardware. Adobe After Effects asks for at least 16 GB of memory and, on Windows, a dedicated graphics card with 4 GB of its own memory. For 4K work it recommends 32 GB or more, fast SSDs and extra high-speed drives for media. TouchDesigner, widely used for live and immersive work, needs a graphics card with at least 4 GB, recommends 8 GB or more, and keeps several features for recent Nvidia cards. Large immersive shows run Notch content on dedicated media servers such as disguise's GX 3+, built round a graphics card with 96 GB of memory. Top-end graphics cards can draw up to 575 watts on their own, before the rest of the computer. Specs like these also push people to upgrade, and making new hardware has an energy cost of its own.

Spot asks for none of this: a web browser on the device already in the room, a phone included.

It does as little as the look needs. Most effects are simple 2D drawing techniques applied to one image at a time. The 3D library only loads when 3D forms are switched on, and the images ship with the page rather than coming from a cloud service.

AI enters the same question, as it did in Concrete. Here it was used to build the tooling, not to run it. Its energy was spent once, in development, and not again each time Spot plays. That matters in a current discourse focused on the growing electricity and water demands of data centres.

Spot is designed to use far less energy than a render-based workflow; measuring that, in the studio and in the Igloo, is part of the project.

Requirements as published by Adobe (After Effects 26, 2026), Derivative (TouchDesigner) and disguise (GX 3+); graphics card figure for Nvidia's RTX 5090.

## Details

| | |
|---|---|
| Type | Image-processing and motion tooling |
| Year | 2026 |
| Author | Patrick Walker |
| Part of | GD v/x AI |
| Versions | Spot Room (the Igloo), Spot Reel (the showreel) |
| Made with | HTML, CSS and JavaScript; three.js for 3D forms; no server |

## Themes

- [Energy & Sustainability](../themes/energy-and-sustainability/)

## Links

- [Live: Spot](https://spot.pkwr.co/)
- [About Spot](https://spot.pkwr.co/about.html)
- Related: [GD v/x AI](../gd-vx-ai/)
- Related: [Concrete, 2025](../concrete/)

## Scenes

<!-- Each link is a live scene from Spot, shown in turn (15 seconds each).
     Add one per line:  - [Scene name](link)   Remove all lines to go back to the default view. -->

- [Scene 1](https://spot.pkwr.co/?scene=zTY_NboNADITfZc4cIAGl8q1NW_USNQpV7xYs1BJ40bJESaO8e8XPNtz2m_GM1zcoCBtEOINueKsqU_jXwXqrBhRHi3KUi2nYz9IHN9XoH0RBSbYS-ALa7B7CibW07d40TS6_BpREeO4LkSm5yQKNsTRe6MRtN-dCJGc_OPZidVq_t-od9x6UpGmEvDOmnAq3Aca-LMLBns2RddJAWRzh3bq2_9SpdX67mlUKUBIHe28H9Y-JvONCtF7l51N22YLf7MT4K-gpDHw5Pptm3Zl34__SbcDBVVwYEOqG-x6LfOBapbqC0rD8xWgJGq-c8CQtKM3-zR8ZbXRS-MEZ3O9_)
