---
title: GD v/x AI
type: project-page
page: https://pkwr.github.io/projects/gd-vx-ai/
tags: [project-pages]
---

<!-- This note IS the text on the website. Edit freely, then run publish.sh in ~/Sites/projects. -->

# GD v/x AI

*Research & teaching*

Graphic Design versus, divided by, multiplied by AI

## Summary

A Scholarship of Teaching and Learning project at Sheffield Hallam University, asking whether AI supplants creativity in graphic design, or co-enables and augments it.

## Description

Most classroom use of AI in graphic design means prompting for images, text or layouts. GD v/x AI tests an alternative: students and staff co-developing new AI tooling and processes together, moving AI from tool-use into shared creative practice.

Concrete (2025) is its first proof of concept.

At its centre is Spot, motion tooling that runs in a web browser: no specialist hardware, no account, no subscription, and nothing uploaded. The same tooling scales from a phone to a desktop to the six walls of the Igloo Immersive Suite, where it first ran in October 2026, and it works in real time, with no render pass.

## How it's made

It began as a background piece for a two-hour outreach workshop with technical college students on 10 July 2026: a single web page that took the photos students shot during the session and remixed them live on the wall while they photographed and drew by hand. The first version was built in six days, by Patrick Walker working with an AI coding assistant to a fixed written brief: three files, no server, no login, and a set of seed images so it would still run if the wifi failed.

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
| Type | Scholarship of Teaching and Learning (SoTL) project |
| Course | BA (Hons) Graphic Design, Sheffield Hallam University |
| Period | 2025 to 2027 |
| Lead | Patrick Walker |
| Team | Paul Allen, Georgia Burns, Matt Edgar, Jake Goodall, Muiz, Jenni Whitehead |

## Themes

- [Energy & Sustainability](../themes/energy-and-sustainability/)

## Links

- [Live: Spot](https://pkwr.github.io/GD-Remix-Process/)
- [About Spot](https://pkwr.github.io/GD-Remix-Process/about.html)
- Related: [Concrete, 2025](../concrete/)

## Scenes

<!-- Each link is a live scene from the GD Remix Process app, shown in turn (15 seconds each).
     Add one per line:  - [Scene name](link)   Remove all lines to go back to the default view. -->

- [Scene 1](https://pkwr.github.io/GD-Remix-Process/?scene=zTY_NboNADITfZc4cIAGl8q1NW_USNQpV7xYs1BJ40bJESaO8e8XPNtz2m_GM1zcoCBtEOINueKsqU_jXwXqrBhRHi3KUi2nYz9IHN9XoH0RBSbYS-ALa7B7CibW07d40TS6_BpREeO4LkSm5yQKNsTRe6MRtN-dCJGc_OPZidVq_t-od9x6UpGmEvDOmnAq3Aca-LMLBns2RddJAWRzh3bq2_9SpdX67mlUKUBIHe28H9Y-JvONCtF7l51N22YLf7MT4K-gpDHw5Pptm3Zl34__SbcDBVVwYEOqG-x6LfOBapbqC0rD8xWgJGq-c8CQtKM3-zR8ZbXRS-MEZ3O9_)
