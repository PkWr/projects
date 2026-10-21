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
  const ASSETS = new URL(".", document.currentScript ? document.currentScript.src : location.href).href;   // .../assets/
  // ---------- Analytics ----------
  // GoatCounter: free, privacy-friendly page counts, no cookies (so no consent banner needed).
  // Dashboard: https://pkwr.goatcounter.com  -  set to "" to switch analytics off.
  const GOATCOUNTER = "https://pkwr.goatcounter.com/count";
  if (GOATCOUNTER && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && location.protocol !== "file:") {
    const gc = document.createElement("script");
    gc.async = true;
    gc.src = "https://gc.zgo.at/count.js";
    gc.dataset.goatcounter = GOATCOUNTER;
    document.head.append(gc);
  }

  const ICON = {
    pause: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="4" y="2.5" width="1.6" height="11" fill="currentColor"/><rect x="10.4" y="2.5" width="1.6" height="11" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.5 2.5 L13 8 L4.5 13.5 Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    full: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/></svg>'
  };
  // Shown at the end of the home page only
  const CONTACT = { id: "contact", title: "Contact", contact: {
    text: "For collaborations, enquiries and sales please contact Patrick Walker.",
    email: "fao@pkwr.co", handle: "@PkWr" } };
  const dataEl = document.getElementById("project-data");
  if (!dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  // Text can live in a Markdown file next to the page (copied from Obsidian); it overrides the built-in text.
  if (data.content) await applyMarkdown(data, data.content);
  if (data.pool) {
    const pooled = await gatherPool(data.menu || [], data.poolPerProject);
    // fall back to the page's own "slides" if the projects can't be read
    // (e.g. when index.html is opened straight from disk rather than via a web server)
    if (pooled.length) data.slides = pooled;
  }
  data.slides = data.slides || [];
  build(data);

  // Fetch each project page, read its slide list, and pool the still images.
  async function gatherPool(menu, perProject) {
    const lists = await Promise.all(menu.map(async m => {
      try {
        const base = new URL(m.href, location.href);
        const html = await (await fetch(base)).text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const pd = JSON.parse(doc.getElementById("project-data").textContent);
        if (pd.pool) return [];                                         // a theme page, not a project
        if (pd.content) await applyMarkdown(pd, pd.content, base);   // pick up captions/credits edited in Obsidian
        return (pd.slides || [])
          .filter(s => !s.type || s.type === "image" || s.type === "embed")
          .slice(0, perProject || Infinity)          // e.g. dust home: a few images from each project
          .map(s => ({
            ...s,
            // live pieces join the home rotation for a few seconds each
            ...(s.type === "embed" ? { duration: s.homeDuration || 8000 } : {}),
            src: s.type === "embed" ? s.src : (Array.isArray(s.src) ? s.src.map(x => new URL(x, base).href) : new URL(s.src, base).href),
            caption: m.label + (m.meta ? ", " + m.meta : ""),
            // keep a photo credit from the project page's caption, if it has one
            credit: /^(photo(graph(y|er|s))?|image|credit)s?\s*:/i.test(s.caption || "") ? s.caption : "",
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
    const AUTOPLAY_MS = data.autoplay === false ? 0 : (data.autoplay || 8000);
    const skipMissing = !!data.pool;   // on the home page, quietly skip images that don't exist yet
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Portrait screens (phones): pairs of portrait images, marked "fit": "contain", are shown one at a
    // time so each is seen whole; other pairs (e.g. squares) stack top and bottom via the CSS.
    if (window.matchMedia("(orientation: portrait)").matches) {
      data.slides = data.slides.flatMap(s => {
        if (!Array.isArray(s.src) || s.fit !== "contain") return [s];
        const caps = (s.caption || "").split("  ·  ");
        return s.src.map((src, k) => Object.assign({}, s, {
          src, fit: undefined,
          alt: [].concat(s.alt || "")[k] || "",
          caption: caps.length === s.src.length ? caps[k] : s.caption,
        }));
      });
    }

    // ---------- Build stage ----------
    const stage = el("section", { class: "stage", tabindex: "0", "aria-roledescription": "carousel", "aria-label": data.title + " images" });

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
        // "src" can be a list of two images, shown side by side (good for portraits)
        const srcs = [].concat(s.src), alts = [].concat(s.alt || "");
        if (srcs.length > 1) slide.classList.add("pair");
        srcs.forEach((src, k) => {
          const img = el("img", { alt: alts[k] || alts[0] || "", decoding: "async", loading: i < 2 ? "eager" : "lazy" });
          img.onerror = onMissing;
          img.src = src;
          slide.append(img);
        });
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
    // Way home: the PkWr mark over the image, top left (not on the home page itself).
    // A page can point somewhere else with "back" and "backLabel" (e.g. dust projects lead back to the dust page).
    const homeHref = data.back || "../";
    const homeLabel = data.backLabel || "PkWr";
    const hasWayBack = !data.home || !!data.back;
    if (hasWayBack) stage.append(el("a", { class: "home-link", href: homeHref, title: homeLabel }, homeLabel));
    if (data.slides.length < 2) prevNum.hidden = curNum.hidden = nextNum.hidden = playBtn.hidden = true;

    // ---------- Build panel ----------
    const drawer = el("aside", { class: "drawer", "aria-label": data.home ? "Menu and biography" : "Project information" });
    const strip = el("button", { class: "strip", type: "button", "aria-expanded": "false", "aria-controls": "project-panel" },
      el("span", { class: "strip-label" }, data.stripLabel || [data.credit || "Patrick Walker", data.title, "Info"].join("  ·  ")),
      el("span", { class: "strip-icon", "aria-hidden": "true" }, "+"));
    const panel = el("div", { class: "panel", id: "project-panel" });
    panel.append(el("header", {},
      !hasWayBack ? (data.eyebrow ? el("p", { class: "eyebrow" }, data.eyebrow) : "")
        : el("p", { class: "eyebrow" }, el("a", { class: "crumb", href: homeHref }, homeLabel), data.eyebrow ? "  /  " + data.eyebrow : ""),
      el("h1", {}, data.title),
      data.subtitle ? el("p", { class: "subtitle" }, data.subtitle) : ""));

    // ---------- Sections ----------
    // Pages can list "sections" explicitly; otherwise they're built from the older keys.
    const sections = data.sections || [
      data.menu && data.menu.length ? { id: "projects", title: "Projects", menu: data.menu } : null,
      data.summary ? { id: "summary", title: data.summaryTitle || "Summary", text: data.summary } : null,
      data.details ? { id: "details", title: "Details", details: data.details } : null,
      data.links && data.links.length ? { id: "links", title: data.linksTitle || "Links", links: data.links } : null,
      data.related && data.related.length ? { id: "related", title: "Related", related: data.related } : null
    ].filter(Boolean);
    if (data.home && data.contact !== false && !sections.some(s => s.id === "contact")) sections.push(CONTACT);

    let menuLinks = [];
    const subnavLinks = [];
    const subnav = el("nav", { class: "subnav", "aria-label": "Sections" });
    const subnavList = el("ul");
    subnav.append(subnavList);
    if (sections.length > 1) panel.append(subnav);

    const sectionEls = sections.map((s, i) => {
      const id = "sec-" + (s.id || slug(s.title) || i);
      const sec = el("section", { class: "sec", id });
      if (s.title) sec.append(el("h2", {}, s.title));
      if (s.text) [].concat(s.text).forEach(t => sec.append(el("p", {}, t)));
      if (s.list) {
        const ul = el("ul", { class: "plain" });
        s.list.forEach(t => ul.append(el("li", {}, t)));
        sec.append(ul);
      }
      if (s.details) {
        const dl = el("dl", { class: "meta" });
        s.details.forEach(([k, v]) => dl.append(el("dt", {}, k), el("dd", {}, v)));
        sec.append(dl);
      }
      if (s.menu) {
        sec.classList.add("menu");
        const ul = el("ul");
        s.menu.forEach(m => {
          const ext = isExternal(m.href);   // other sites open in a new tab, marked with an arrow
          const a = el("a", ext ? { href: m.href, target: "_blank", rel: "noopener", class: "ext" } : { href: m.href },
            el("span", { class: "menu-label" }, ...lines(m.label)), m.meta ? el("span", { class: "menu-meta" }, m.meta) : "");
          a.dataset.project = m.href;
          menuLinks.push(a);
          ul.append(el("li", {}, a));
        });
        sec.append(ul);
      }
      if (s.links) {
        sec.classList.add("links");
        const ul = el("ul");
        s.links.forEach(l => {
          const external = isExternal(l.href);
          ul.append(el("li", {}, el("a", external ? { href: l.href, target: "_blank", rel: "noopener" } : { href: l.href }, l.label)));
        });
        sec.append(ul);
      }
      if (s.contact) {
        sec.append(el("p", {}, s.contact.text));
        sec.append(el("p", { class: "contact-line" },
          el("a", { href: "mailto:" + s.contact.email }, s.contact.email),
          s.contact.handle ? "  ·  " + s.contact.handle : ""));
      }
      if (s.related) {
        sec.classList.add("related");
        const ul = el("ul");
        s.related.forEach(l => ul.append(el("li", {}, el("a", { href: l.href }, l.label))));
        sec.append(ul);
      }
      panel.append(sec);
      const a = el("a", { href: "#" + id }, s.navTitle || s.title || "");
      a.addEventListener("click", e => {
        e.preventDefault();
        sec.style.scrollMarginTop = (subnav.offsetHeight + 16) + "px";   // clear the sticky sub-nav
        // keep the clicked section highlighted while the scroll settles
        lockUntil = Date.now() + 1200;
        subnavLinks.forEach(x => x.classList.toggle("is-active", x === a));
        sec.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      });
      subnavLinks.push(a);
      subnavList.append(el("li", {}, a));
      return sec;
    });

    // highlight the section currently in view
    let lockUntil = 0;
    function markSection() {
      if (sectionEls.length < 2 || Date.now() < lockUntil) return;
      const scroller = panel.scrollHeight > panel.clientHeight + 2 ? panel : document.scrollingElement;
      const navBottom = subnav.getBoundingClientRect().bottom + 28;
      let active = 0;
      sectionEls.forEach((s, i) => { if (s.getBoundingClientRect().top <= navBottom) active = i; });
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) active = sectionEls.length - 1;
      subnavLinks.forEach((a, i) => a.classList.toggle("is-active", i === active));
    }
    panel.addEventListener("scroll", markSection, { passive: true });
    window.addEventListener("scroll", markSection, { passive: true });
    window.addEventListener("resize", markSection);
    panel.append(el("footer", {},
      data.home ? el("span", {}, "© " + new Date().getFullYear()) : el("a", { href: homeHref }, "← " + (data.backLabel || "All projects")),
      el("span", {}, data.credit || "Patrick Walker")));

    drawer.append(strip, panel);
    root.append(stage, drawer);
    root.classList.add("panel-hidden");
    if (data.theme) root.classList.add("theme-" + data.theme);   // e.g. "dust": red in place of yellow
    // Favicon: a yellow square for PkWr, a red square for dust
    const iconName = data.theme === "dust" ? "dust" : "pkwr";
    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(l => l.remove());
    document.head.append(
      el("link", { rel: "icon", href: ASSETS + "favicon-" + iconName + ".ico", sizes: "any" }),
      el("link", { rel: "apple-touch-icon", href: ASSETS + "apple-touch-icon-" + iconName + ".png" }));
    requestAnimationFrame(markSection);

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
      caption.replaceChildren(
        s.href ? el("a", { href: s.href, class: "caption-link" }, (s.caption || "") + "  →") : (s.caption || ""),
        s.credit ? el("span", { class: "caption-credit" }, "  ·  " + s.credit) : "");
      updateNums();
      menuLinks.forEach(a => a.classList.toggle("is-current", a.dataset.project === s.project));
      restartTimer();
    }

    // manual moves (clicks, keys, swipes) use a quick fade; autoplay uses the slow ambient one
    function go(i, dir = 1) { stage.classList.add("quick"); show(i, dir); }

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
      const s = data.slides[current];
      if (!s || !playing) return;
      // live embeds and videos stay put unless they're given their own "duration"
      if (s.type && s.type !== "image" && !s.duration) return;
      timer = setTimeout(() => { stage.classList.remove("quick"); show(current + 1); }, s.duration || AUTOPLAY_MS);
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
    // a small bounce of the strip when the mouse starts moving again (closed panel only, at most every few seconds)
    let lastBounce = 0;
    function bounce() {
      const now = Date.now();
      if (!root.classList.contains("panel-hidden") || now - lastBounce < 4000) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      lastBounce = now;
      strip.classList.remove("bounce"); void strip.offsetWidth; strip.classList.add("bounce");
    }
    strip.addEventListener("animationend", () => strip.classList.remove("bounce"));
    let firstMove = true;
    function wake(e) {
      const wasIdle = root.classList.contains("ui-idle");
      if (e && e.type === "mousemove" && (wasIdle || firstMove)) { firstMove = false; bounce(); }
      root.classList.remove("ui-idle");
      clearTimeout(idleTimer);
      if (!overBar) idleTimer = setTimeout(() => root.classList.add("ui-idle"), IDLE_MS);
    }
    stageBar.addEventListener("mouseenter", () => { overBar = true; wake(); });
    stageBar.addEventListener("mouseleave", () => { overBar = false; wake(); });
    ["mousemove", "pointerdown", "keydown", "touchstart", "wheel"].forEach(ev => document.addEventListener(ev, wake, { passive: true }));
    wake();

    prevZone.onclick = () => go(current - 1, -1);
    nextZone.onclick = () => go(current + 1);
    controls.addEventListener("click", e => {
      const a = e.target.closest("button")?.dataset.action;
      if (a === "prev") go(current - 1, -1);
      if (a === "next") go(current + 1);
      if (a === "play") setPlaying(!playing);
      if (a === "full") {
        if (document.fullscreenElement) document.exitFullscreen();
        else (stage.requestFullscreen || stage.webkitRequestFullscreen)?.call(stage);
      }
    });

    // Home: hovering a project name brings up one of its images
    if (canHover) menuLinks.forEach(a => a.addEventListener("mouseenter", () => {
      const idx = data.slides.map((s, i) => s.project === a.dataset.project && !slides[i].classList.contains("broken") ? i : -1).filter(i => i >= 0);
      if (idx.length && data.slides[current].project !== a.dataset.project) go(idx[Math.floor(Math.random() * idx.length)]);
    }));

    document.addEventListener("keydown", e => {
      if (e.target.closest("input, textarea")) return;
      if (e.key === "ArrowRight") go(current + 1);
      else if (e.key === "ArrowLeft") go(current - 1, -1);
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

    // ---------- carry the open panel across pages ----------
    // Clicking a link inside the panel (e.g. home menu -> project) opens the next page with the panel already out.
    const CARRY_KEY = "pkwr-panel";
    panel.addEventListener("click", e => {
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.href.startsWith("mailto:") || a.getAttribute("href").startsWith("#")) return;
      if (new URL(a.href, location.href).origin !== location.origin) return;
      try { sessionStorage.setItem(CARRY_KEY, pinned ? "pinned" : "open"); } catch (err) {}
    });
    let carried = null;
    try { carried = sessionStorage.getItem(CARRY_KEY); sessionStorage.removeItem(CARRY_KEY); } catch (err) {}
    if (carried && !window.matchMedia("(max-width: 860px)").matches) {
      root.classList.add("no-anim");                 // appear already open, no slide-in
      setPanel(true, carried === "pinned");
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("no-anim")));
      // if it wasn't pinned and the pointer turns out to be over the image, close as normal
      if (carried !== "pinned" && canHover) {
        document.addEventListener("mousemove", function first(e) {
          document.removeEventListener("mousemove", first);
          if (!drawer.contains(e.target) && !pinned) closeTimer = setTimeout(() => setPanel(false), CLOSE_DELAY_MS);
        });
      }
    }

    // swipe
    let x0 = null;
    stage.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) dx < 0 ? go(current + 1) : go(current - 1, -1);
      x0 = null;
    });

    // pause while tab hidden
    document.addEventListener("visibilitychange", () => document.hidden ? clearTimeout(timer) : restartTimer());

    document.title = data.home ? `${data.title} | Projects` : `${data.title} | Patrick Walker`;
    show(0);
  }

  // ---------- helpers ----------
  // A label can break onto a new line with <br>, e.g. "Selected projects<br>2000–2020"
  function lines(text) {
    return String(text).split(/<br\s*\/?>/i).flatMap((t, i) => i ? [document.createElement("br"), t] : [t]);
  }
  function el(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    kids.forEach(k => k && n.append(k));
    return n;
  }
  // Links to other sites open in a new tab. Our own two sites (PkWr and dust) open in place.
  // Note: pkwr.co/staging/..., .../live/ pieces and the *.pkwr.co live pieces are separate pieces, so they still count as external.
  function isExternal(href) {
    if (!/^https?:/i.test(href)) return false;
    return !/^https?:\/\/(pkwr\.github\.io\/(projects|dust)|(www\.)?du\.st|(www\.)?pkwr\.co)(\/|$)/i.test(href) || /pkwr\.co\/(staging\/|[^?#]*\/live\/)/i.test(href);
  }

  function pad(n) { return String(n).padStart(2, "0"); }
  // ---------- Markdown content ----------
  async function applyMarkdown(d, file, base = location.href) {
    let src;
    try {
      const r = await fetch(new URL(file, base), { cache: "no-cache" });
      if (!r.ok) return;
      src = await r.text();
    } catch (e) { return; }               // e.g. opened from disk: keep the built-in text
    const md = parseMarkdown(src);
    if (md.title) d.title = md.title;
    if (md.eyebrow !== undefined) d.eyebrow = md.eyebrow;
    if (md.subtitle !== undefined) d.subtitle = md.subtitle;
    if (md.sections.length) {
      d.sections = md.sections;
      // every menu group (e.g. Projects, Research & teaching) feeds the home rotation
      const menus = md.sections.filter(s => s.menu).flatMap(s => s.menu).filter(m => !/^https?:/i.test(m.href));
      if (menus.length) d.menu = menus;
    }
    // "## Scenes" in a note: each link becomes a live slide, shown before any images
    if (md.scenes && md.scenes.length) {
      const dur = d.sceneDuration || 15000;
      d.slides = md.scenes.map(s => ({ type: "embed", src: s.src, caption: s.caption, duration: dur }))
        .concat((d.slides || []).filter(s => s.type !== "embed"));
    }
    const byFile = {};
    (md.images || []).forEach(im => { byFile[im.src] = im; });
    (d.slides || []).forEach(sl => {
      if (sl.type && sl.type !== "image") return;
      if (Array.isArray(sl.src)) {
        const found = sl.src.map(x => byFile[x]);
        if (!found.some(Boolean)) return;
        sl.alt = sl.src.map((x, k) => (found[k] && found[k].alt) || [].concat(sl.alt || "")[k] || "");
        const caps = [...new Set(found.map(f => f && f.caption).filter(Boolean))];
        sl.caption = caps.join("  ·  ");
      } else if (byFile[sl.src]) {
        const im = byFile[sl.src];
        if (im.alt) sl.alt = im.alt; sl.caption = im.caption;
      }
    });
  }

  function parseMarkdown(src) {
    src = src.replace(/^\uFEFF/, "").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").replace(/<!--[\s\S]*?-->/g, "");
    const out = { sections: [] };
    let sec = null, para = [], intro = true, inImages = false, inScenes = false;
    const flush = () => {
      const p = para.join(" ").trim(); para = [];
      if (!p) return;
      if (intro) { if (out.subtitle === undefined) out.subtitle = p; }
      else if (sec) (sec.text = sec.text || []).push(p);
    };
    for (const raw of src.split(/\r?\n/)) {
      const line = raw.trim();
      let m;
      if ((m = line.match(/^#\s+(.+)/)) && !out.title) { out.title = m[1].trim(); continue; }
      if ((m = line.match(/^##\s+(.+)/))) {
        flush(); intro = false;
        const title = m[1].trim();
        inImages = /^images\b/i.test(title);
        inScenes = /^(scenes|live)\b/i.test(title);
        if (inImages || inScenes) { sec = null; continue; }
        sec = { id: slug(title), title };
        out.sections.push(sec);
        continue;
      }
      if (!line) { flush(); continue; }
      if (intro) {
        if ((m = line.match(/^[*_](.+)[*_]$/))) out.eyebrow = m[1].trim();
        else para.push(line);
        continue;
      }
      if (inScenes) {
        // - [Scene name](https://…)   or just a bare link
        if ((m = line.match(/^[-*]\s+\[(.+?)\]\((\S+?)\)/)) || (m = line.match(/^[-*]?\s*<?(https?:\/\/\S+?)>?$/))) {
          const src = m[2] || m[1], caption = m[2] ? m[1].trim() : "";
          (out.scenes = out.scenes || []).push({ src, caption });
        }
        continue;
      }
      if (inImages) {
        if ((m = line.match(/^[-*]\s+`([^`]+)`:?\s*(.*)$/))) {
          let rest = m[2], caption = "";
          const c = rest.match(/\*([^*]*)\*\s*$/);
          if (c) { caption = c[1].trim(); rest = rest.slice(0, c.index); }
          (out.images = out.images || []).push({ src: m[1].trim(), alt: rest.trim(), caption });
        }
        continue;
      }
      if (!sec) continue;
      if (line.startsWith("|")) {
        flush();
        const cells = line.replace(/^\||\|$/g, "").split("|").map(c => c.trim());
        if (cells.every(c => /^:?-*:?$/.test(c))) continue;   // header or separator row
        (sec.details = sec.details || []).push([cells[0], cells.slice(1).join(" | ")]);
        continue;
      }
      if ((m = line.match(/^[-*]\s+(.+)/))) {
        flush();
        const item = m[1].trim();
        let l;
        if ((l = item.match(/^Related:\s*\[(.+?)\]\((.+?)\)/i))) (sec.related = sec.related || []).push({ label: l[1], href: l[2] });
        else if ((l = item.match(/^\[(.+?)\]\((.+?)\)\s*(.*)$/))) {
          if (/projects|research|teaching|themes|dust|pkwr/i.test(sec.title)) (sec.menu = sec.menu || []).push({ label: l[1], href: l[2], meta: l[3].trim() });
          else (sec.links = sec.links || []).push({ label: l[1], href: l[2] });
        }
        else (sec.list = sec.list || []).push(item);
        continue;
      }
      para.push(line);
    }
    flush();
    return out;
  }

  function slug(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function missing(s) {
    return el("div", { class: "slide-missing" }, el("strong", {}, "Image not found"), s.src, el("br"), s.alt || "");
  }
})();
