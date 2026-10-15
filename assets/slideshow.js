/*
  Project page slideshow.
  Each page includes a <script type="application/json" id="project-data"> block
  and this file builds the slideshow + details panel from it.

  Slide types:
    { "src": "images/01.jpg", "alt": "...", "caption": "...", "fit": "contain" }   image (fills the frame by default; "contain" shows it whole)
    { "type": "video", "src": "images/clip.mp4", "poster": "...", "caption": "..." }
    { "type": "embed", "src": "https://foxes.pkwr.co", "caption": "..." }     live piece in an iframe
*/
(function () {
  const dataEl = document.getElementById("project-data");
  if (!dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  const root = document.querySelector(".project");
  const AUTOPLAY_MS = data.autoplay === false ? 0 : (data.autoplay || 2000);

  // ---------- Build stage ----------
  const stage = el("section", { class: "stage", tabindex: "0", "aria-roledescription": "carousel", "aria-label": data.title + " images" });
  const progress = el("div", { class: "progress" });
  stage.append(progress);

  const slides = data.slides.map((s, i) => {
    const slide = el("figure", { class: "slide", "aria-roledescription": "slide", "aria-label": `${i + 1} of ${data.slides.length}` });
    slide.style.margin = "0";
    if (s.fit) slide.dataset.fit = s.fit;
    if (s.position) slide.style.setProperty("--pos", s.position);
    const type = s.type || "image";

    if (type === "embed") {
      slide.dataset.embed = s.src; // loaded lazily when shown
    } else if (type === "video") {
      const v = el("video", { muted: "", loop: "", playsinline: "", preload: "metadata" });
      v.muted = true;
      if (s.poster) v.poster = s.poster;
      v.src = s.src;
      v.onerror = () => slide.replaceChildren(missing(s));
      slide.append(v);
    } else {
      const img = el("img", { alt: s.alt || "", decoding: "async", loading: i < 2 ? "eager" : "lazy" });
      img.onerror = () => slide.replaceChildren(missing(s));
      img.src = s.src;
      slide.append(img);
    }
    stage.append(slide);
    return slide;
  });

  const prevZone = el("button", { class: "zone prev", "aria-label": "Previous image" });
  const nextZone = el("button", { class: "zone next", "aria-label": "Next image" });
  stage.append(prevZone, nextZone);

  const caption = el("div", { class: "caption", "aria-live": "polite" });
  const counter = el("span", { class: "counter" });
  const btn = (label, action, aria) => el("button", { type: "button", "data-action": action, "aria-label": aria }, label);
  const playBtn = btn("Pause", "play", "Pause slideshow");
  const controls = el("div", { class: "controls" },
    btn("←", "prev", "Previous"), counter, btn("→", "next", "Next"),
    playBtn, btn("Info", "panel", "Hide project details"), btn("⤢", "full", "Full screen"));
  stage.append(el("div", { class: "stage-bar" }, caption, controls));
  if (data.slides.length < 2) playBtn.hidden = true;

  // ---------- Build panel ----------
  const panel = el("aside", { class: "panel" });
  const header = el("header", {},
    data.eyebrow ? el("p", { class: "eyebrow" }, data.eyebrow) : "",
    el("h1", {}, data.title),
    data.subtitle ? el("p", { class: "subtitle" }, data.subtitle) : "");
  panel.append(header);

  if (data.summary) {
    const sum = el("div", { class: "summary" });
    [].concat(data.summary).forEach(p => sum.append(el("p", {}, p)));
    panel.append(sum);
  }
  if (data.details) {
    const dl = el("dl", { class: "meta" });
    data.details.forEach(([k, v]) => dl.append(el("dt", {}, k), el("dd", {}, v)));
    panel.append(dl);
  }
  if (data.links && data.links.length) {
    const ul = el("ul");
    data.links.forEach(l => ul.append(el("li", {}, el("a", { href: l.href, target: "_blank", rel: "noopener" }, l.label))));
    panel.append(el("section", { class: "links" }, el("h2", {}, "Links"), ul));
  }
  if (data.related && data.related.length) {
    const ul = el("ul");
    data.related.forEach(l => ul.append(el("li", {}, el("a", { href: l.href }, l.label))));
    panel.append(el("section", { class: "related" }, el("h2", {}, "Related"), ul));
  }
  panel.append(el("footer", {},
    el("a", { href: "../" }, "← All projects"),
    el("span", {}, data.credit || "Patrick Walker")));

  root.append(stage, panel);

  // ---------- Behaviour ----------
  let current = 0, timer = null, playing = AUTOPLAY_MS > 0 && data.slides.length > 1;

  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      const on = n === current;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
      const v = s.querySelector("video");
      if (v) on ? v.play().catch(() => {}) : v.pause();
      // load embeds on demand, unload when away to save CPU
      if (s.dataset.embed) {
        if (on && !s.querySelector("iframe")) {
          s.replaceChildren(el("iframe", { src: s.dataset.embed, title: data.slides[n].caption || "Live piece", loading: "lazy", allow: "fullscreen" }));
        } else if (!on && s.querySelector("iframe")) {
          s.replaceChildren();
        }
      }
    });
    const s = data.slides[current];
    stage.classList.toggle("has-iframe", (s.type || "image") === "embed");
    caption.textContent = s.caption || "";
    counter.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
    restartTimer();
  }

  function restartTimer() {
    clearTimeout(timer);
    progress.classList.remove("running");
    progress.style.width = "0";
    const s = data.slides[current];
    // don't auto-advance away from live embeds or videos
    if (!playing || (s.type && s.type !== "image")) return;
    void progress.offsetWidth;
    progress.style.transitionDuration = AUTOPLAY_MS + "ms";
    progress.classList.add("running");
    progress.style.width = "100%";
    timer = setTimeout(() => show(current + 1), AUTOPLAY_MS);
  }

  function setPlaying(p) {
    playing = p;
    playBtn.textContent = p ? "Pause" : "Play";
    playBtn.setAttribute("aria-label", p ? "Pause slideshow" : "Play slideshow");
    restartTimer();
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) playing = false;
  playBtn.textContent = playing ? "Pause" : "Play";

  prevZone.onclick = () => show(current - 1);
  nextZone.onclick = () => show(current + 1);
  controls.addEventListener("click", e => {
    const a = e.target.closest("button")?.dataset.action;
    if (a === "prev") show(current - 1);
    if (a === "next") show(current + 1);
    if (a === "play") setPlaying(!playing);
    if (a === "panel") {
      const hidden = root.classList.toggle("panel-hidden");
      e.target.setAttribute("aria-label", hidden ? "Show project details" : "Hide project details");
    }
    if (a === "full") {
      if (document.fullscreenElement) document.exitFullscreen();
      else (stage.requestFullscreen || stage.webkitRequestFullscreen)?.call(stage);
    }
  });

  document.addEventListener("keydown", e => {
    if (e.target.closest("input, textarea")) return;
    if (e.key === "ArrowRight") show(current + 1);
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === " " && document.activeElement === stage) { e.preventDefault(); setPlaying(!playing); }
    else if (e.key === "i") root.classList.toggle("panel-hidden");
    else if (e.key === "f") controls.querySelector('[data-action="full"]').click();
  });

  // swipe
  let x0 = null;
  stage.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  // pause while tab hidden
  document.addEventListener("visibilitychange", () => document.hidden ? clearTimeout(timer) : restartTimer());

  document.title = `${data.title} | Patrick Walker`;
  show(0);

  // ---------- helpers ----------
  function el(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    kids.forEach(k => k && n.append(k));
    return n;
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function missing(s) {
    return el("div", { class: "slide-missing" }, el("strong", {}, "Image not found"), s.src, el("br"), s.alt || "");
  }
})();
