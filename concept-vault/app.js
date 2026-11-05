/* Concept Vault — app: routing, hub, GDD detail pages, transitions */
(function () {
  const C = window.CONCEPTS, MX = window.MATRIX, { Stage, Audio: A, reduce } = window.FX;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const app = $("#app"), bg = $("#bg"), root = document.documentElement;
  let bgStage = null, cardStages = [], cleanup = [], current = "vault", busy = false, ambOn = false;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } } };
  if (store.get("vault-sfx") === "off") A.on = false;

  const CAT = { Educational: "Learning", Awareness: "Learning", AR: "AR", VR: "VR", IoT: "IoT" };
  const PLAT = { "fake-feed": "Any web browser", "water-debt": "TV + players' phones", "x-ray-mirror": "Laptop + webcam + TV", "defuse-the-table": "2–3 ARCore phones", "time-window": "1 ARCore phone", "out-of-body": "VR box + 3 tripod phones", "block-party": "Laptop + webcam + TV", "live-wire": "ESP32 + laptop", "house-is-listening": "Smart home + visitor's phone", "sixth-sense": "Galaxy Watch 4 + TV" };

  /* ---------- theme + background ---------- */
  function setTheme(accent, accent2) { root.style.setProperty("--accent", accent); root.style.setProperty("--accent2", accent2); }
  function setBg(theme) { if (bgStage) bgStage.destroy(); bgStage = new Stage(bg, theme, { dpr: 1.5 }); }

  /* ---------- HUB ---------- */
  function roomSVG() {
    return `<svg viewBox="0 0 540 540" role="img" aria-label="Floor plan of the 5 by 5 metre room showing where each concept is played">
      <defs><pattern id="g1" width="100" height="100" patternUnits="userSpaceOnUse" x="20" y="20"><path d="M100 0H0V100" fill="none" stroke="rgba(236,235,230,.09)"/></pattern></defs>
      <rect x="20" y="20" width="500" height="500" fill="url(#g1)" stroke="rgba(236,235,230,.55)" stroke-width="1.5"/>
      <rect class="zone" data-ids="time-window house-is-listening sixth-sense" x="26" y="26" width="488" height="488" rx="4" fill="none" stroke="#b388ff" stroke-width="1.5" stroke-dasharray="7 6"/>
      <rect class="zone" data-ids="out-of-body" x="214" y="214" width="300" height="300" rx="6" fill="rgba(255,69,58,.07)" stroke="#ff453a" stroke-width="1.5" stroke-dasharray="3 5"/>
      <rect class="zone" data-ids="live-wire" x="32" y="314" width="200" height="200" rx="6" fill="rgba(255,225,77,.08)" stroke="#ffe14d" stroke-width="1.5"/>
      <rect class="zone" data-ids="fake-feed water-debt x-ray-mirror defuse-the-table block-party" x="140" y="40" width="260" height="150" rx="6" fill="rgba(92,200,255,.08)" stroke="#5cc8ff" stroke-width="1.5"/>
      <rect x="190" y="24" width="160" height="9" rx="2" fill="#ecebe6"/><circle cx="270" cy="42" r="3.5" fill="#3dffb5"/>
      <rect x="225" y="120" width="90" height="46" rx="4" fill="rgba(236,235,230,.14)" stroke="rgba(236,235,230,.3)"/>
      <path d="M220 222l8 14h-16zM506 222l8 14h-16zM220 498l8 14h-16z" fill="#ff453a"/>
      <g font-family="JetBrains Mono, monospace" font-size="12" fill="rgba(236,235,230,.75)">
        <text x="270" y="16" text-anchor="middle" font-size="11">TV + WEBCAM · 5 m</text>
        <text x="270" y="147" text-anchor="middle" font-size="10">TABLE</text>
        <text x="148" y="58" fill="#5cc8ff">01 02 03 04 07</text>
        <text x="40" y="334" fill="#ffe14d">08 · 2×2 m</text>
        <text x="506" y="508" text-anchor="end" fill="#ff453a">06 · 3×3 m VR</text>
        <text x="36" y="44" fill="#b388ff">05 09 10 · full room</text>
        <text x="12" y="270" transform="rotate(-90 12 270)" text-anchor="middle" font-size="11">5 m</text>
      </g>
    </svg>`;
  }
  function hubHTML() {
    const cards = C.map((c, i) => `
      <div class="card" role="link" tabindex="0" data-id="${c.id}" data-cat="${CAT[c.cat]}" style="--a:${c.accent}" aria-label="Open concept ${c.num}: ${esc(c.title)}">
        <div class="thumb"><canvas data-theme="${c.theme}" data-i="${i}"></canvas><span class="num">${c.num}</span><span class="tag">${c.cat}</span></div>
        <div class="body"><h3>${esc(c.title)}</h3><p>${esc(c.tagline)}</p>
          <div class="meta"><span>${esc(c.players)}</span><span>${esc(c.session)}</span></div></div>
        <span class="go" aria-hidden="true">→</span>
      </div>`).join("");
    const pips = (n, a) => `<span class="pips" style="--a:${a}">${[1, 2, 3, 4, 5].map(k => `<i class="${k <= n ? "on" : ""}"></i>`).join("")}</span>`;
    const rows = C.map(c => { const s = MX[c.id], tot = s.reduce((a, b) => a + b, 0); return `<tr data-go="${c.id}" style="--a:${c.accent}"><td class="mono" style="color:${c.accent}">${c.num}</td><td><b>${esc(c.title)}</b></td><td>${c.cat}</td><td>${esc(c.players)}</td>${s.map(v => `<td>${pips(v, c.accent)}</td>`).join("")}<td class="tot tnum">${tot}<small style="color:var(--dim);font-size:12px">/20</small></td></tr>`; }).join("");
    const refs = C.reduce((a, c) => a + c.games.length + c.papers.length, 0);
    return `
    <section class="wrap hero enter">
      <div class="hl">
        <div class="eyebrow"><span>Final year project</span><i></i><span>Concept pitch</span><i></i><span>Jury review</span></div>
        <h1 class="mega" id="mega"><span class="ln a">Ten worlds.</span><span class="ln b">One gets built.</span></h1>
      </div>
      <div>
        <p class="lede">Ten playable concepts across learning, awareness, AR, VR and IoT, each designed to fit one 5×5 m room. Open any card for its full game design document, prototype plan and research references.</p>
        <div class="stats">
          <div class="stat"><b class="tnum">10</b><span>Concepts</span></div>
          <div class="stat"><b class="tnum">3</b><span>Learning &amp; awareness</span></div>
          <div class="stat"><b class="tnum">3</b><span>XR · 2 AR + 1 VR</span></div>
          <div class="stat"><b class="tnum">4</b><span>IoT &amp; mixed reality</span></div>
        </div>
      </div>
      <aside class="room" id="room"><h3><span>Installation floor plan</span><span>1 square = 1 m</span></h3>${roomSVG()}
        <div class="legend">
          <span><i style="background:#5cc8ff"></i>TV + table zone</span><span><i style="background:#ffe14d"></i>Live Wire patch</span>
          <span><i style="background:#ff453a"></i>VR safe area + tripods</span><span><i style="background:#b388ff"></i>Room-scale experiences</span>
        </div></aside>
    </section>
    <section class="wrap">
      <div class="bar"><h2>The concepts</h2>
        <div class="filters" role="group" aria-label="Filter concepts">
          ${["All", "Learning", "AR", "VR", "IoT"].map((f, i) => `<button class="chip" data-f="${f}" aria-pressed="${i === 0}">${f === "Learning" ? "Learning &amp; awareness" : f}</button>`).join("")}
        </div></div>
      <div class="grid" id="grid">${cards}</div>
      <div class="matrix">
        <div class="hd"><h2>Jury matrix</h2><small>Designer's self-assessment, 1–5 per criterion. Click a row to open the concept.</small></div>
        <div class="mtable"><table class="m"><thead><tr><th>#</th><th>Concept</th><th>Type</th><th>Players</th><th>Novelty</th><th>Prototype feasibility</th><th>Demo wow</th><th>Social impact</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table></div>
      </div>
      <div class="foot"><span>${refs} research references across 10 GDDs</span><span>Present with <kbd>←</kbd> <kbd>→</kbd> · <kbd>Esc</kbd> for the hub · click the background to play with it</span></div>
    </section>`;
  }
  function mountHub() {
    app.innerHTML = hubHTML(); setTheme("#ecebe6", "#9a99a3"); setBg("hub");
    $("#crumb").innerHTML = "10 concepts · <em>1 room</em>";
    const io = new IntersectionObserver(es => es.forEach(e => { const s = e.target._stage; if (s) s.visible = e.isIntersecting; }), { rootMargin: "100px" });
    $$("#grid canvas").forEach(cv => { const s = new Stage(cv, cv.dataset.theme, { auto: true, dpr: 1.25, idx: +cv.dataset.i }); cv._stage = s; cardStages.push(s); io.observe(cv); });
    cleanup.push(() => io.disconnect());
    const room = $("#room");
    $$(".card").forEach(card => {
      const cv = $("canvas", card), s = cv._stage;
      card.addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(); s.m = { x: e.clientX - r.left, y: e.clientY - r.top, active: true }; });
      card.addEventListener("pointerenter", () => { s.speed = 1.8; });
      card.addEventListener("pointerleave", () => { s.m = null; s.speed = 1; });
      card.addEventListener("click", () => { A.click(); go(card.dataset.id); });
      card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(card.dataset.id); } });
    });
    $$(".chip").forEach(ch => ch.addEventListener("click", () => {
      $$(".chip").forEach(x => x.setAttribute("aria-pressed", x === ch)); const f = ch.dataset.f;
      $$(".card").forEach(cd => cd.classList.toggle("hide", f !== "All" && cd.dataset.cat !== f)); A.click();
    }));
    $$("tr[data-go]").forEach(tr => tr.addEventListener("click", () => go(tr.dataset.go)));
    const mega = $("#mega"), hero = $(".hero");
    $$(".ln", mega).forEach(ln => { ln.innerHTML = [...ln.textContent].map(ch => ch === " " ? " " : `<span class="ch">${esc(ch)}</span>`).join(""); });
    const chs = $$(".ch", mega);
    const onMove = e => { if (reduce) return; chs.forEach(s => { const r = s.getBoundingClientRect(), d = (e.clientX - (r.left + r.width / 2)), dy = (e.clientY - (r.top + r.height / 2)); const k = Math.exp(-(d * d + dy * dy * .6) / (2 * 140 * 140)); s.style.setProperty("--cw", (70 + 80 * k).toFixed(1)); }); };
    const onLeave = () => chs.forEach(s => s.style.removeProperty("--cw"));
    hero.addEventListener("pointermove", onMove); hero.addEventListener("pointerleave", onLeave);
  }

  /* ---------- DETAIL ---------- */
  const SECS = [["concept", "Concept & description"], ["audience", "Target audience"], ["fiction", "World & fiction"], ["pov", "Player POV gameplay"], ["shots", "Concept shots"], ["usp", "USP"], ["loop", "Core loop"], ["experience", "Player experience"], ["systems", "Game systems"], ["interact", "Interactivity"], ["visual", "Visual & audio style"], ["tech", "Technology"], ["scope", "Scope & roadmap"], ["money", "Monetization"], ["research", "Research & references"]];
  function loopSVG(steps) {
    const n = steps.length, cx = 210, cy = 210, R0 = 150;
    let s = `<svg viewBox="0 0 420 420" role="img" aria-label="Core loop with ${n} steps">`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R0}" fill="none" stroke="rgba(236,235,230,.12)" stroke-width="2"/>`;
    s += `<circle class="spin" cx="${cx}" cy="${cy}" r="${R0}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-dasharray="70 872"/>`;
    for (let i = 0; i < n; i++) { const a = (-90 + (i + .5) * 360 / n) * Math.PI / 180, x = cx + Math.cos(a) * R0, y = cy + Math.sin(a) * R0, deg = (-90 + (i + .5) * 360 / n) + 90; s += `<path d="M-6 -7 L4 0 L-6 7" fill="none" stroke="var(--accent)" stroke-width="2" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})"/>`; }
    steps.forEach((st, i) => { const a = (-90 + i * 360 / n) * Math.PI / 180, x = cx + Math.cos(a) * R0, y = cy + Math.sin(a) * R0; s += `<g class="lnode" data-i="${i}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="30" fill="#0c0c11" stroke="var(--accent)" stroke-width="2"/><text x="${x.toFixed(1)}" y="${(y + 6).toFixed(1)}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="17" font-weight="600" fill="var(--accent)">0${i + 1}</text></g>`; });
    s += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-family="Anybody, sans-serif" font-weight="800" font-size="30" fill="#ecebe6" style="font-variation-settings:'wdth' 120">CORE</text><text x="${cx}" y="${cy + 26}" text-anchor="middle" font-family="Anybody, sans-serif" font-weight="800" font-size="30" fill="#ecebe6" style="font-variation-settings:'wdth' 120">LOOP</text>`;
    return s + `</svg>`;
  }
  function curveSVG(cv, id) {
    const n = cv.v.length, x0 = 56, x1 = 770, yb = 206, yt = 22;
    const P = cv.v.map((v, i) => [x0 + i * (x1 - x0) / (n - 1), yb - v * (yb - yt)]);
    let d = `M${P[0][0]},${P[0][1]}`;
    for (let i = 0; i < n - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2; const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]; d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`; }
    const peak = cv.v.indexOf(Math.max(...cv.v));
    let s = `<svg viewBox="0 0 800 262" role="img" aria-label="Player experience intensity curve"><defs><linearGradient id="cg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".45"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>`;
    [0, .25, .5, .75, 1].forEach(k => { const y = yb - k * (yb - yt); s += `<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="rgba(236,235,230,.07)"/>`; });
    s += `<text x="${x0 - 10}" y="${yt + 4}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="#9a99a3">HIGH</text><text x="${x0 - 10}" y="${yb + 4}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="#9a99a3">LOW</text>`;
    s += `<path d="${d} L${x1},${yb} L${x0},${yb} Z" fill="url(#cg-${id})"/><path class="draw" d="${d}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>`;
    P.forEach(([x, y], i) => { s += `<circle cx="${x}" cy="${y}" r="${i === peak ? 7 : 5}" fill="${i === peak ? "var(--accent)" : "#0c0c11"}" stroke="var(--accent)" stroke-width="2"/>`; s += `<text x="${x}" y="236" text-anchor="middle" font-family="Figtree, sans-serif" font-size="14" fill="#dad9e0">${esc(cv.labels[i])}</text><text x="${x}" y="254" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#9a99a3">PHASE 0${i + 1}</text>`; });
    s += `<text x="${P[peak][0]}" y="${P[peak][1] - 14}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="var(--accent)">PEAK</text>`;
    return s + `</svg>`;
  }
  const sh = (i, t) => `<div class="sh"><span class="n">§${String(i + 1).padStart(2, "0")}</span><h2>${t}</h2></div>`;
  function detailHTML(c, i) {
    const prev = C[(i + C.length - 1) % C.length], next = C[(i + 1) % C.length];
    const EX = (window.EXTRA || {})[c.id] || {};
    const tot = c.weeks.reduce((a, w) => a + w[1], 0); let acc = 0;
    const gantt = c.weeks.map(([n, w]) => { const l = acc / tot * 100, wd = w / tot * 100; acc += w; return `<div class="gr"><span>${esc(n)}</span><div class="track" style="--tw:${tot}"><div class="gb" style="left:${l}%;width:${wd}%">${w}w</div></div></div>`; }).join("");
    let gi = 0, pi = 0;
    const ref = (r, pre) => { const [t, src, note, url] = r; const inner = `<span class="ix">${pre}</span><span><b>${esc(t)}</b><span class="src">${esc(src)}</span><span class="nt">${esc(note)}</span></span><span class="out">${url ? "Open ↗" : "Title only"}</span>`; return url ? `<a class="ref" href="${esc(url)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="ref">${inner}</div>`; };
    const S = {
      concept: `<div class="desc">${(EX.desc || []).map(p => `<p>${esc(p)}</p>`).join("")}</div><div class="kv"><div>Elevator pitch</div><div>${esc(c.logline)}</div><div>Genre</div><div>${esc(c.genre)}</div><div>Platform</div><div>${esc(c.platform)}</div><div>Players</div><div>${esc(c.players)}</div><div>Space needed</div><div>${esc(c.space)} <span style="color:var(--dim)">(within a 5×5 m room)</span></div><div>Session length</div><div>${esc(c.session)}</div></div>`,
      audience: `<div class="two" style="margin-bottom:12px"><div class="mini"><span class="k">Primary</span><b>${esc(c.audience.primary)}</b></div><div class="mini"><span class="k">Secondary</span><b>${esc(c.audience.secondary)}</b></div></div><div class="cards3">${c.audience.personas.map(([n, d]) => `<div class="mini"><span class="k">Persona</span><b>${esc(n)}</b><span>${esc(d)}</span></div>`).join("")}</div>`,
      fiction: `<p style="font-size:18px;line-height:1.65">${esc(c.fiction)}</p>`,
      shots: window.SHOTS_HTML ? window.SHOTS_HTML(c) : "",
      pov: `<p class="pov-intro">One complete session, seen through the player's eyes. Timestamps are approximate; the highlighted beat is the moment to show the jury live.</p><ol class="pov">${(EX.pov || []).map(([tm, h, p], k) => `<li class="${k === EX.demo ? "demo" : ""}"><span class="tm">${esc(tm)}</span><div><h3>${esc(h)}</h3><p>${esc(p)}</p>${k === EX.demo ? '<span class="dm">Jury demo moment</span>' : ""}</div></li>`).join("")}</ol>`,
      usp: `<div class="usp-h">${esc(c.uspHead)}</div><ol class="usp-l">${c.usp.map(u => `<li>${esc(u)}</li>`).join("")}</ol>`,
      loop: `<div class="loopwrap">${loopSVG(c.loop)}<ol class="loop-l">${c.loop.map((st, k) => `<li data-i="${k}"><b>0${k + 1}</b><span>${esc(st)}</span></li>`).join("")}<li style="border-style:dashed;color:var(--dim)"><b>↻</b><span>Repeat with rising difficulty</span></li></ol></div>`,
      experience: `<div class="curve">${curveSVG(c.curve, c.id)}</div><p style="margin-top:10px;color:var(--dim);font-size:14px">Intended emotional intensity across one session. The peak is the moment the jury should see during the demo.</p>`,
      systems: `<div class="cards3">${c.systems.map(([n, d], k) => `<div class="mini"><span class="k">System ${String(k + 1).padStart(2, "0")}</span><b>${esc(n)}</b><span>${esc(d)}</span></div>`).join("")}</div>`,
      interact: `<div class="itab"><table class="i"><thead><tr><th>Player input</th><th>Game action</th><th>Feedback (VFX / SFX / haptics)</th></tr></thead><tbody>${c.interact.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>`,
      visual: `<div class="pal">${c.palette.map(h => `<button class="sw" style="background:${h}" data-hex="${h}" aria-label="Copy colour ${h}"><span>${h}</span></button>`).join("")}</div><div class="kw">${c.keywords.map(k => `<span>${esc(k)}</span>`).join("")}</div><div class="two"><div class="mini"><span class="k">Visual direction</span><span>${esc(c.visual)}</span></div><div class="mini"><span class="k">Audio direction</span><span>${esc(c.audio)}</span></div></div><button class="sting" data-sting="${c.theme}"><span class="eq"><i></i><i></i><i></i><i></i></span>Play the theme sting</button>`,
      tech: `<div class="techg">${Object.entries(c.tech).map(([k, v]) => `<div><h4>${esc(k)}</h4><div class="chips">${v.map(x => `<span>${esc(x)}</span>`).join("")}</div></div>`).join("")}</div><h4 style="margin:0 0 8px;font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--dim);font-weight:400">DATA FLOW</h4><div class="flow">${c.arch.map((a, k) => `${k ? '<div class="ar" aria-hidden="true"><i></i></div>' : ""}<div class="nd"><small>STAGE ${k + 1}</small>${esc(a)}</div>`).join("")}</div>`,
      scope: `<div class="scope2"><div class="mini p"><span class="k">Jury prototype · build first</span><ul>${c.proto.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div><div class="mini"><span class="k">Full game · after selection</span><ul>${c.full.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div><div class="gantt"><div class="wk"><span>Roadmap · ${tot} weeks</span><div>${Array.from({ length: tot }, (_, k) => `<span>W${k + 1}</span>`).join("")}</div></div>${gantt}</div><div class="risks">${c.risks.map(r => `<div><b>RISK</b><span>${esc(r)}</span></div>`).join("")}</div>`,
      money: `<div class="cards3">${c.money.map(([n, d], k) => `<div class="mini"><span class="k">Model ${String.fromCharCode(65 + k)}</span><b>${esc(n)}</b><span>${esc(d)}</span></div>`).join("")}</div>`,
      research: `<div class="refs"><div><h3>Similar games &amp; projects · ${c.games.length}</h3>${c.games.map(g => ref(g, "G" + (++gi))).join("")}</div><div><h3>Research papers &amp; articles · ${c.papers.length}</h3>${c.papers.map(p => ref(p, "R" + (++pi))).join("")}</div></div>`
    };
    return `
    <section class="wrap dhero enter">
      <div class="bignum" aria-hidden="true">${c.num}</div>
      <div class="row"><span class="pill">${c.cat}</span><span class="pill" style="border-color:var(--line);color:var(--dim)">Concept ${c.num} / 10</span></div>
      <h1 class="dtitle" id="dtitle">${esc(c.title)}</h1>
      <p class="dtag">${esc(c.tagline)}</p>
      <p class="dlog">${esc(c.logline)}</p>
      <div class="facts"><div><span>Players</span><b>${esc(c.players)}</b></div><div><span>Space</span><b>${esc(c.space)}</b></div><div><span>Session</span><b>${esc(c.session)}</b></div><div><span>Hardware</span><b>${esc(PLAT[c.id])}</b></div></div>
      <div class="boggle"><small>Mind-boggle moment</small><p>${esc(c.mind)}</p></div>
      <p class="mono" style="margin-top:14px;font-size:11.5px;letter-spacing:.08em;color:var(--dim);text-transform:uppercase">The background is a live sketch of the game · move and click on it</p>
    </section>
    <section class="wrap dbody">
      <nav class="toc" aria-label="GDD sections">${SECS.map(([k, t], j) => `<a href="#${c.id}" data-sec="${k}">${String(j + 1).padStart(2, "0")} · ${t}</a>`).join("")}</nav>
      <div class="secs">${SECS.map(([k, t], j) => `<section class="sec" id="s-${k}">${sh(j, t)}${S[k]}</section>`).join("")}</div>
    </section>
    <section class="wrap pn">
      <button data-go="${prev.id}" style="--a:${prev.accent}"><small>← Previous · ${prev.num}</small><b>${esc(prev.title)}</b></button>
      <button class="nx" data-go="${next.id}" style="--a:${next.accent}"><small>Next · ${next.num} →</small><b>${esc(next.title)}</b></button>
    </section>`;
  }
  function scramble(el) {
    if (reduce || !el) return; const fin = el.textContent, glyph = "▓▒░#%&@$*+=<>/\\";
    let f = 0; const tot = 22; const id = setInterval(() => { f++; el.textContent = [...fin].map((ch, k) => ch === " " ? " " : (k / fin.length < f / tot ? ch : glyph[(Math.random() * glyph.length) | 0])).join(""); if (f >= tot) { clearInterval(id); el.textContent = fin; } }, 34);
    cleanup.push(() => { clearInterval(id); el.textContent = fin; });
  }
  function mountDetail(c) {
    const i = C.indexOf(c); app.innerHTML = detailHTML(c, i); setTheme(c.accent, c.accent2); setBg(c.theme);
    $("#crumb").innerHTML = `<em>${c.num}</em> / ${esc(c.title)}`;
    scramble($("#dtitle"));
    if (window.SHOTS_MOUNT) window.SHOTS_MOUNT(c, Stage, cleanup);
    const links = $$(".toc a"); links.forEach(a => a.addEventListener("click", e => { e.preventDefault(); const t = $("#s-" + a.dataset.sec); t && t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); A.click(); }));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const k = e.target.id.slice(2); links.forEach(a => a.classList.toggle("on", a.dataset.sec === k)); } }), { rootMargin: "-40% 0px -55% 0px" });
    $$(".sec").forEach(s => io.observe(s)); cleanup.push(() => io.disconnect());
    let li = 0; const nodes = $$(".lnode"), items = $$(".loop-l li[data-i]");
    const cyc = () => { nodes.forEach((n, k) => n.classList.toggle("on", k === li)); items.forEach((n, k) => n.classList.toggle("on", k === li)); li = (li + 1) % nodes.length; };
    cyc(); const lid = setInterval(cyc, 1400); cleanup.push(() => clearInterval(lid));
    $$(".sw").forEach(b => b.addEventListener("click", () => { A.act("pop"); const h = b.dataset.hex, sp = $("span", b); const done = () => { sp.textContent = "Copied"; setTimeout(() => sp.textContent = h, 900); }; try { navigator.clipboard.writeText(h).then(done, () => { sp.textContent = h; }); } catch (e) { } }));
    $$(".sting").forEach(b => b.addEventListener("click", () => { A.ensure(); A.sting(b.dataset.sting); }));
    $$(".pn button").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
  }

  /* ---------- routing + transitions ---------- */
  function clear() { cleanup.forEach(f => { try { f(); } catch (e) { } }); cleanup = []; cardStages.forEach(s => s.destroy()); cardStages = []; }
  function render(id) {
    clear(); const c = C.find(x => x.id === id); current = c ? c.id : "vault";
    if (c) mountDetail(c); else mountHub();
    window.scrollTo(0, 0);
    const th = c ? c.theme : "hub"; if (A.ok()) { A.sting(th); A.ambient(th); ambOn = true; }
  }
  let skipHash = 0;
  function go(id) { if (id === current || busy) return; transition(id); try { skipHash = Date.now(); location.hash = id; } catch (e) { } }
  function transition(id) {
    const c = C.find(x => x.id === id), sh2 = $("#shutter"), txt = $("#shtext");
    if (reduce || busy) { render(id); return; }
    busy = true; sh2.style.setProperty("--sc", c ? c.accent : "#ecebe6"); sh2.style.setProperty("--sc2", c ? c.accent2 : "#08080b");
    txt.textContent = c ? c.num + " · " + c.title : "Concept vault"; sh2.className = ""; void sh2.offsetWidth; sh2.className = "in"; txt.className = ""; void txt.offsetWidth; txt.className = "show"; A.whoosh();
    setTimeout(() => { render(id); sh2.className = "out"; setTimeout(() => { sh2.className = ""; busy = false; }, 560); }, 520);
  }
  window.addEventListener("hashchange", () => { if (Date.now() - skipHash < 800) return; const id = location.hash.slice(1); if ((C.some(x => x.id === id) ? id : "vault") !== current) transition(id); });

  /* ---------- global input ---------- */
  let hovered = null;
  document.addEventListener("mouseover", e => { const t = e.target.closest(".card,.chip,.tbtn,.pn button,.sw,a.ref,.sting,tr[data-go],.toc a"); if (t && t !== hovered) { hovered = t; A.hover(); } if (!t) hovered = null; });
  window.addEventListener("pointermove", e => { if (bgStage) bgStage.m = { x: e.clientX, y: e.clientY, active: true }; });
  document.addEventListener("pointerleave", () => { if (bgStage) bgStage.m = null; });
  window.addEventListener("pointerdown", e => {
    const fresh = !A.ctx; A.ensure();
    if (A.on && !ambOn) setTimeout(() => { if (A.ok()) { A.ambient(current === "vault" ? "hub" : C.find(x => x.id === current).theme); ambOn = true; } }, 60);
    if (e.target.closest("a,button,.card,.sec,.room,.matrix,.facts,.boggle,.stats,input,table,.top")) return;
    if (bgStage) { const k = bgStage.click(e.clientX, e.clientY); A.act(k || { hub: "pop", feed: "pop", water: "drop", xray: "scan", time: "ping" }[bgStage.theme] || "pop"); }
  });
  document.addEventListener("keydown", e => {
    if (e.target.closest("input,textarea")) return; A.ensure();
    const i = C.findIndex(x => x.id === current);
    if (e.key === "ArrowRight") { e.preventDefault(); go(C[(i + 1) % C.length].id); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(i < 0 ? C[C.length - 1].id : C[(i + C.length - 1) % C.length].id); }
    else if (e.key === "Escape" || e.key.toLowerCase() === "h") { if (current !== "vault") go("vault"); }
  });
  let rt = 0; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => FX.stages.forEach(s => s.resize()), 150); });

  const snd = $("#snd"); snd.setAttribute("aria-pressed", A.on);
  snd.addEventListener("click", () => { A.on = !A.on; snd.setAttribute("aria-pressed", A.on); $("#sndl").textContent = A.on ? "Sound on" : "Sound off"; store.set("vault-sfx", A.on ? "on" : "off"); if (A.on) { A.ensure(); setTimeout(() => { A.click(); A.ambient(current === "vault" ? "hub" : C.find(x => x.id === current).theme); ambOn = true; }, 60); } else { A.stopAmb(); ambOn = false; } });
  $("#sndl").textContent = A.on ? "Sound on" : "Sound off";
  $("#fs").addEventListener("click", () => { try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => { }); } catch (e) { } });
  $("#home").addEventListener("click", e => { e.preventDefault(); go("vault"); });

  /* ---------- boot ---------- */
  render(location.hash.slice(1));
  const boot = $("#boot");
  if (reduce) boot.classList.add("done");
  else {
    const pre = $("#bootlog"), lines = ["> mounting concept vault", "> loading 10 game design documents", "> calibrating webcams, watches and smart bulbs", "> 5×5 m room ready"]; let k = 0;
    const tick = setInterval(() => { if (k < lines.length) { pre.textContent += (k ? "\n" : "") + lines[k] + "  ok"; k++; } else clearInterval(tick); }, 260);
    requestAnimationFrame(() => $("#boot .meter i").style.width = "100%");
    const end = () => { boot.classList.add("done"); clearInterval(tick); };
    setTimeout(end, 1500); boot.addEventListener("click", end);
  }
})();
