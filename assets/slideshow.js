/*
  Project page slideshow.
  Each page includes a <script type="application/json" id="project-data"> block
  and this file builds the full-screen slideshow + sliding info panel from it.

  Slide types:
    { "src": "images/01.jpg", "alt": "...", "caption": "...", "fit": "contain" }   image (fills the frame by default; "contain" shows it whole)
    { "type": "video", "src": "images/clip.mp4", "poster": "...", "caption": "..." }
    { "type": "embed", "src": "https://foxes.pkwr.co", "caption": "..." }     live piece in an iframe

  Home page: set "home": true and "pool": true, and list projects in "menu".
  The images are then gathered from each project page and shuffled, so the
  home page stays in sync as projects are added or changed.
*/
(async function () {
  const ICON = {
    pause: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="4" y="2.5" width="1.6" height="11" fill="currentColor"/><rect x="10.4" y="2.5" width="1.6" height="11" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.5 2.5 L13 8 L4.5 13.5 Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    full: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/></svg>'
  };
  const dataEl = document.getElementById("project-data");
  if (!dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  if (data.pool) {
    const pooled = await gatherPool(data.menu || []);
    // fall back to the page's own "slides" if the projects can't be read
    // (e.g. when index.html is opened straight from disk rather than via a web server)
    if (pooled.length) data.slides = pooled;
  }
  data.slides = data.slides || [];
  build(data);

  // Fetch each project page, read its slide list, and pool the still images.
  async function gatherPool(menu) {
    const lists = await Promise.all(menu.map(async m => {
      try {
        const base = new URL(m.href, location.href);
        const html = await (await fetch(base)).text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const pd = JSON.parse(doc.getElementById("project-data").textContent);
        return (pd.slides || [])
          .filter(s => !s.type || s.type === "image")
          .map(s => ({
            ...s,
            src: new URL(s.src, base).href,
            caption: m.label + (m.meta ? ", " + m.meta : ""),
            href: m.href,
            project: m.href
          }));
      } catch (e) { return []; }
    }));
    const all = lists.flat();
    for (let i = all.length - 1; i > 0; i--) {           // shuffle
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }

  function build(data) {
    const root = document.querySelector(".project");
    const AUTOPLAY_MS = data.autoplay === false ? 0 : (data.autoplay || 2000);
    const skipMissing = !!data.pool;   // on the home page, quietly skip images that don't exist yet
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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
      const onMissing = () => {
        if (skipMissing) { slide.classList.add("broken"); if (current === i) show(current + 1); else updateNums(); }
        else slide.replaceChildren(missing(s));
      };

      if (type === "embed") {
        slide.dataset.embed = s.src; // loaded lazily when shown
      } else if (type === "video") {
        const v = el("video", { muted: "", loop: "", playsinline: "", preload: "metadata" });
        v.muted = true;
        if (s.poster) v.poster = s.poster;
        v.src = s.src;
        v.onerror = onMissing;
        slide.append(v);
      } else {
        const img = el("img", { alt: s.alt || "", decoding: "async", loading: i < 2 ? "eager" : "lazy" });
        img.onerror = onMissing;
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
    const btn = (label, action, aria, cls) => el("button", { type: "button", "data-action": action, "aria-label": aria, class: cls }, label);
    // numbers do the navigating: previous · current · next
    const prevNum = btn("", "prev", "Previous image", "num");
    const curNum = el("span", { class: "num current", "aria-current": "true" });
    const nextNum = btn("", "next", "Next image", "num");
    const playBtn = btn("", "play", "Pause slideshow", "icon");
    const fullBtn = btn("", "full", "Full screen", "icon");
    fullBtn.innerHTML = ICON.full;
    const controls = el("div", { class: "controls" }, prevNum, curNum, nextNum, playBtn, fullBtn);
    const stageBar = el("div", { class: "stage-bar" }, caption, controls);
    stage.append(stageBar);
    if (data.slides.length < 2) prevNum.hidden = nextNum.hidden = playBtn.hidden = true;

    // ---------- Build panel ----------
    const drawer = el("aside", { class: "drawer", "aria-label": data.home ? "Menu and biography" : "Project information" });
    const strip = el("button", { class: "strip", type: "button", "aria-expanded": "false", "aria-controls": "project-panel" },
      el("span", { class: "strip-label" }, data.stripLabel || [data.credit || "Patrick Walker", data.title, "Info"].join("  ·  ")),
      el("span", { class: "strip-icon", "aria-hidden": "true" }, "+"));
    const panel = el("div", { class: "panel", id: "project-panel" });
    panel.append(el("header", {},
      data.eyebrow ? el("p", { class: "eyebrow" }, data.eyebrow) : "",
      el("h1", {}, data.title),
      data.subtitle ? el("p", { class: "subtitle" }, data.subtitle) : ""));

    let menuLinks = [];
    if (data.menu && data.menu.length) {
      const ul = el("ul");
      data.menu.forEach(m => {
        const a = el("a", { href: m.href }, el("span", { class: "menu-label" }, m.label), m.meta ? el("span", { class: "menu-meta" }, m.meta) : "");
        a.dataset.project = m.href;
        menuLinks.push(a);
        ul.append(el("li", {}, a));
      });
      panel.append(el("nav", { class: "menu", "aria-label": "Projects" }, el("h2", {}, "Projects"), ul));
    }
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
      data.links.forEach(l => ul.append(el("li", {}, el("a", { href: l.href, target: l.href.startsWith("mailto:") ? "_self" : "_blank", rel: "noopener" }, l.label))));
      panel.append(el("section", { class: "links" }, el("h2", {}, data.linksTitle || "Links"), ul));
    }
    if (data.related && data.related.length) {
      const ul = el("ul");
      data.related.forEach(l => ul.append(el("li", {}, el("a", { href: l.href }, l.label))));
      panel.append(el("section", { class: "related" }, el("h2", {}, "Related"), ul));
    }
    panel.append(el("footer", {},
      data.home ? el("span", {}, "© " + new Date().getFullYear()) : el("a", { href: "../" }, "← All projects"),
      el("span", {}, data.credit || "Patrick Walker")));

    drawer.append(strip, panel);
    root.append(stage, drawer);
    root.classList.add("panel-hidden");

    // ---------- Behaviour ----------
    let current = 0, timer = null, playing = AUTOPLAY_MS > 0 && data.slides.length > 1;

    function show(i, dir = 1) {
      const n = slides.length;
      if (!n) return;
      let k = ((i % n) + n) % n, guard = 0;
      while (slides[k].classList.contains("broken") && guard++ < n) k = (((k + dir) % n) + n) % n;
      current = k;
      slides.forEach((s, idx) => {
        const on = idx === current;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-hidden", on ? "false" : "true");
        const v = s.querySelector("video");
        if (v) on ? v.play().catch(() => {}) : v.pause();
        // load embeds on demand, unload when away to save CPU
        if (s.dataset.embed) {
          if (on && !s.querySelector("iframe")) {
            s.replaceChildren(el("iframe", { src: s.dataset.embed, title: data.slides[idx].caption || "Live piece", loading: "lazy", allow: "fullscreen" }));
          } else if (!on && s.querySelector("iframe")) {
            s.replaceChildren();
          }
        }
      });
      const s = data.slides[current];
      stage.classList.toggle("has-iframe", (s.type || "image") === "embed");
      caption.replaceChildren(s.href ? el("a", { href: s.href, class: "caption-link" }, (s.caption || "") + "  →") : (s.caption || ""));
      updateNums();
      menuLinks.forEach(a => a.classList.toggle("is-current", a.dataset.project === s.project));
      restartTimer();
    }

    // number among the images that actually exist
    function updateNums() {
      const live = slides.map((sl, j) => sl.classList.contains("broken") ? -1 : j).filter(j => j >= 0);
      const m = live.length || 1, pos = Math.max(0, live.indexOf(current));
      curNum.textContent = pad(pos + 1);
      prevNum.textContent = pad(((pos - 1 + m) % m) + 1);
      // on the first slide, don't show the wrap-around number (it reads as a total)
      prevNum.style.visibility = pos === 0 ? "hidden" : "";
      nextNum.textContent = pad(((pos + 1) % m) + 1);
    }

    function restartTimer() {
      clearTimeout(timer);
      progress.classList.remove("running");
      progress.style.width = "0";
      const s = data.slides[current];
      // don't auto-advance away from live embeds or videos
      if (!s || !playing || (s.type && s.type !== "image")) return;
      void progress.offsetWidth;
      progress.style.transitionDuration = AUTOPLAY_MS + "ms";
      progress.classList.add("running");
      progress.style.width = "100%";
      timer = setTimeout(() => show(current + 1), AUTOPLAY_MS);
    }

    function setPlaying(p) {
      playing = p;
      playBtn.innerHTML = p ? ICON.pause : ICON.play;
      playBtn.setAttribute("aria-label", p ? "Pause slideshow" : "Play slideshow");
      restartTimer();
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) playing = false;
    playBtn.innerHTML = playing ? ICON.pause : ICON.play;
    playBtn.setAttribute("aria-label", playing ? "Pause slideshow" : "Play slideshow");

    // ---------- fade the overlay after inactivity ----------
    const IDLE_MS = data.idle || 2500;
    let idleTimer = null, overBar = false;
    function wake() {
      root.classList.remove("ui-idle");
      clearTimeout(idleTimer);
      if (!overBar) idleTimer = setTimeout(() => root.classList.add("ui-idle"), IDLE_MS);
    }
    stageBar.addEventListener("mouseenter", () => { overBar = true; wake(); });
    stageBar.addEventListener("mouseleave", () => { overBar = false; wake(); });
    ["mousemove", "pointerdown", "keydown", "touchstart", "wheel"].forEach(ev => document.addEventListener(ev, wake, { passive: true }));
    wake();

    prevZone.onclick = () => show(current - 1, -1);
    nextZone.onclick = () => show(current + 1);
    controls.addEventListener("click", e => {
      const a = e.target.closest("button")?.dataset.action;
      if (a === "prev") show(current - 1, -1);
      if (a === "next") show(current + 1);
      if (a === "play") setPlaying(!playing);
      if (a === "full") {
        if (document.fullscreenElement) document.exitFullscreen();
        else (stage.requestFullscreen || stage.webkitRequestFullscreen)?.call(stage);
      }
    });

    // Home: hovering a project name brings up one of its images
    if (canHover) menuLinks.forEach(a => a.addEventListener("mouseenter", () => {
      const idx = data.slides.map((s, i) => s.project === a.dataset.project && !slides[i].classList.contains("broken") ? i : -1).filter(i => i >= 0);
      if (idx.length && data.slides[current].project !== a.dataset.project) show(idx[Math.floor(Math.random() * idx.length)]);
    }));

    document.addEventListener("keydown", e => {
      if (e.target.closest("input, textarea")) return;
      if (e.key === "ArrowRight") show(current + 1);
      else if (e.key === "ArrowLeft") show(current - 1, -1);
      else if (e.key === " " && document.activeElement === stage) { e.preventDefault(); setPlaying(!playing); }
      else if (e.key === "i") setPanel(!isOpen(), true);
      else if (e.key === "Escape" && isOpen()) setPanel(false);
      else if (e.key === "f") controls.querySelector('[data-action="full"]').click();
    });

    // ---------- Info drawer: hover to peek, click to pin ----------
    const CLOSE_DELAY_MS = data.closeDelay || 1500;   // linger after the mouse leaves, so it doesn't snap shut
    let pinned = false, closeTimer = null;
    function isOpen() { return !root.classList.contains("panel-hidden"); }
    function setPanel(open, pin = false) {
      clearTimeout(closeTimer);
      pinned = open && pin;
      root.classList.toggle("panel-hidden", !open);
      root.classList.toggle("panel-pinned", pinned);
      strip.setAttribute("aria-expanded", String(open));
    }
    strip.addEventListener("click", () => {
      // a click after a hover-peek pins it open; the next click closes
      if (isOpen() && pinned) setPanel(false);
      else setPanel(true, true);
    });
    if (canHover) {
      strip.addEventListener("mouseenter", () => { if (!isOpen()) setPanel(true); });
      drawer.addEventListener("mouseenter", () => clearTimeout(closeTimer));
      drawer.addEventListener("mouseleave", () => {
        if (pinned) return;
        closeTimer = setTimeout(() => setPanel(false), CLOSE_DELAY_MS);
      });
    }

    // swipe
    let x0 = null;
    stage.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) dx < 0 ? show(current + 1) : show(current - 1, -1);
      x0 = null;
    });

    // pause while tab hidden
    document.addEventListener("visibilitychange", () => document.hidden ? clearTimeout(timer) : restartTimer());

    document.title = data.home ? `${data.title} | Projects` : `${data.title} | Patrick Walker`;
    show(0);
  }

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
