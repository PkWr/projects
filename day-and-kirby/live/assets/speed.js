/*
	Speed bar for the live pieces.
	A small control, bottom centre, shown when the pointer moves or the screen is tapped and hidden again when idle.
	Slide right for faster (shorter time between compositions), left for slower.

	SpeedBar({ value, min, max, key }) returns { ms, shown(), due() }.
	  value: default time between compositions, in ms
	  min / max: fastest and slowest, in ms
	  key: name to remember the viewer's choice under (this browser only)
	URL options: ?every=12 sets the time in seconds; ?ui=0 hides the bar.
*/
window.SpeedBar = function ({ value, min, max, key }) {
	const params = new URLSearchParams(location.search);
	const clamp = v => Math.min(max, Math.max(min, v));
	let ms = value;
	try { const saved = Number(localStorage.getItem(key)); if (saved) ms = clamp(saved); } catch (e) {}
	if (Number(params.get("every"))) ms = clamp(Number(params.get("every")) * 1000);
	let last = Date.now();

	// slider position 0..1000, log scale, right = faster
	const toPos = v => Math.round(1000 * Math.log(max / v) / Math.log(max / min));
	const toMs = p => max * Math.pow(min / max, p / 1000);
	const label = v => v < 10000 ? `every ${+(v / 1000).toFixed(1)} s`
		: v < 60000 ? `every ${Math.round(v / 1000)} s`
		: `every ${+(v / 60000).toFixed(v < 600000 ? 1 : 0)} min`;

	if (params.get("ui") !== "0") {
		const css = document.createElement("style");
		css.textContent = `
			.speed-bar { position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%); z-index: 2147483647;
				display: flex; align-items: center; gap: 10px; padding: 8px 14px;
				background: rgba(0,0,0,.72); color: #fff; border-radius: 999px;
				font: italic 300 13px/1 'IBM Plex Mono', monospace; letter-spacing: 0;
				opacity: 0; pointer-events: none; transition: opacity .3s; user-select: none; }
			.speed-bar.on { opacity: 1; pointer-events: auto; }
			.speed-bar input { width: 140px; accent-color: #ffe100; margin: 0; }
			.speed-bar output { min-width: 9.5em; text-align: right; font-style: normal; }
			.speed-bar.framed { bottom: 64px; } /* inside a project page: sit above the page's caption and credit */
			@media (max-width: 480px) { .speed-bar input { width: 96px; } .speed-bar .end { display: none; } }`;
		document.head.appendChild(css);

		const bar = document.createElement("div");
		bar.className = "speed-bar";
		try { if (window.self !== window.top) bar.classList.add("framed"); } catch (e) { bar.classList.add("framed"); }
		const end = v => label(v).replace("every ", "");
		bar.innerHTML = `<span class="end">${end(max)}</span>
			<input type="range" min="0" max="1000" step="1" aria-label="Speed: time between compositions">
			<span class="end">${end(min)}</span><output aria-live="polite"></output>`;
		const input = bar.querySelector("input"), out = bar.querySelector("output");
		input.value = toPos(ms); out.textContent = label(ms);
		input.addEventListener("input", () => {
			ms = clamp(toMs(+input.value)); out.textContent = label(ms);
			try { localStorage.setItem(key, String(Math.round(ms))); } catch (e) {}
		});
		document.body.appendChild(bar);

		let hideTimer;
		const show = () => {
			bar.classList.add("on");
			clearTimeout(hideTimer);
			hideTimer = setTimeout(() => { if (!bar.matches(":hover, :focus-within")) bar.classList.remove("on"); }, 2500);
		};
		["pointermove", "pointerdown", "keydown"].forEach(t => window.addEventListener(t, show, { passive: true }));
		bar.addEventListener("pointerleave", show);
	}

	return {
		get ms() { return ms; },
		shown() { last = Date.now(); },            // call when a new composition appears
		due() { return Date.now() - last >= ms; }  // time for the next one?
	};
};
