/* Shared: settings, chiptune audio, cartoon Jack, helpers */
(() => {
  const C = window.CONTENT || {};
  const KEY = "jack.settings.v1";
  const S = { music: false, sfx: true, master: 0.8, musicVol: 0.5, sfxVol: 0.7,
              motion: !matchMedia("(prefers-reduced-motion: reduce)").matches };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const root = document.documentElement;
  root.classList.toggle("no-motion", !S.motion);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* ---------- Audio: tiny WebAudio chiptune, no files ---------- */
  const A = (() => {
    let ctx, master, mus, fx, soft, mlp, timer = null, step = 0, nextT = 0;
    const mf = m => 440 * Math.pow(2, (m - 69) / 12);
    function init() {
      if (ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC(); master = ctx.createGain(); mus = ctx.createGain(); fx = ctx.createGain();
      soft = ctx.createBiquadFilter(); soft.type = "lowpass"; soft.frequency.value = 1600; soft.connect(fx);
      mlp = ctx.createBiquadFilter(); mlp.type = "lowpass"; mlp.frequency.value = 2600; mlp.connect(mus);
      mus.connect(master); fx.connect(master); master.connect(ctx.destination); apply();
    }
    function apply() {
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      master.gain.value = S.master; mus.gain.value = S.music ? S.musicVol * 0.35 : 0; fx.gain.value = S.sfx ? S.sfxVol * 0.85 : 0;
      S.music ? start() : stop();
    }
    // soft attack + natural decay; optional pitch glide (f2) and a warm low-pass route (lp)
    function tone(f, t, d, type, g, dest, f2) {
      const o = ctx.createOscillator(), a = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      a.gain.setValueAtTime(0.0001, t); a.gain.linearRampToValueAtTime(g, t + Math.min(.015, d * .3)); a.gain.exponentialRampToValueAtTime(0.0005, t + d);
      o.connect(a); a.connect(dest); o.start(t); o.stop(t + d + 0.05);
    }
    let nb = null;
    function noise(t, d, fq, q, g, dest, type = "bandpass", f2) {
      if (!nb) { nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const c = nb.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1; }
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), a = ctx.createGain(); s.buffer = nb; s.loop = true;
      f.type = type; f.frequency.setValueAtTime(fq, t); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + d); f.Q.value = q;
      a.gain.setValueAtTime(0.0001, t); a.gain.linearRampToValueAtTime(g, t + Math.min(.02, d * .3)); a.gain.exponentialRampToValueAtTime(0.0005, t + d);
      s.connect(f); f.connect(a); a.connect(dest); s.start(t, Math.random() * .5); s.stop(t + d + .05);
    }
    // [freq, offset, dur, wave, gain, glideTo, lowpass]  or  ["n", offset, dur, filterFreq, Q, gain, filterType, sweepTo]
    const SFX = {
      click: [[1400, 0, .05, "sine", .16, 950]],
      hover: [[900, 0, .06, "sine", .07]],
      open:  [[523, 0, .2, "sine", .16], [784, .07, .24, "sine", .12], [1047, .14, .34, "sine", .08]],
      boing: [[420, 0, .14, "sine", .14, 260]],
      pop:   [[520, 0, .09, "sine", .2, 1100], ["n", 0, .03, 2600, 1, .05]],
      deny:  [[320, 0, .14, "triangle", .16, 230], [250, .12, .2, "triangle", .14, 180]],
      coin:  [[1319, 0, .14, "sine", .15], [1976, .06, .32, "sine", .11], [3951, .06, .12, "sine", .02]],
      honk:  [[349, 0, .34, "sawtooth", .12, 0, 1], [440, 0, .34, "sawtooth", .1, 0, 1]],
      bark:  [["n", 0, .09, 900, 2.5, .3, "bandpass", 450], [560, 0, .08, "triangle", .12, 330], ["n", .17, .08, 950, 2.5, .24, "bandpass", 480], [600, .17, .07, "triangle", .1, 360]],
      moo:   [[150, 0, .8, "sawtooth", .12, 118, 1], [75, 0, .8, "sine", .12, 62]],
      jump:  [[240, 0, .16, "sine", .14, 520], ["n", 0, .14, 500, .8, .05, "bandpass", 1600]],
      kick:  [["n", 0, .06, 240, 1, .35, "lowpass"], [150, 0, .09, "sine", .26, 70]],
      whoosh: [["n", 0, .55, 260, .9, .2, "bandpass", 2600], [180, 0, .5, "sine", .07, 560]],
      goal:  [["n", 0, 1.6, 1100, .5, .12, "bandpass", 800], [523, 0, .35, "sine", .12], [659, .12, .35, "sine", .12], [784, .24, .35, "sine", .12], [1047, .36, .7, "sine", .1]]
    };
    function sfx(n) {
      init(); if (!ctx || !S.sfx) return; if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime;
      (SFX[n] || SFX.click).forEach(e => e[0] === "n" ? noise(t + e[1], e[2], e[3], e[4], e[5], fx, e[6], e[7]) : tone(e[0], t + e[1], e[2], e[3], e[4], e[6] ? soft : fx, e[5] || 0));
    }
    const E = 60 / 112 / 2, prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
    const lead = [69,72,76,72, 74,72,69,67, 65,69,72,69, 67,65,64,62, 64,67,72,67, 64,67,71,74, 72,0,71,0, 67,0,0,0];
    function sched() {
      while (nextT < ctx.currentTime + 0.15) {
        const ch = prog[Math.floor(step / 8) % 4];
        if (step % 2 === 0) tone(mf(ch[0] - 12), nextT, E * 1.8, "sine", .4, mlp);
        tone(mf(ch[step % 3] + 12), nextT, E * .9, "triangle", .07, mlp);
        const l = lead[step % 32]; if (l && Math.floor(step / 32) % 2) tone(mf(l), nextT, E * 1.2, "triangle", .1, mlp);
        step++; nextT += E;
      }
    }
    function start() { if (timer) return; nextT = ctx.currentTime + .05; timer = setInterval(sched, 30); }
    function stop() { clearInterval(timer); timer = null; }
    // browsers need a gesture before sound; unlock on first interaction
    const unlock = () => { init(); apply(); removeEventListener("pointerdown", unlock); removeEventListener("keydown", unlock); };
    addEventListener("pointerdown", unlock); addEventListener("keydown", unlock);
    document.addEventListener("visibilitychange", () => { if (ctx) document.hidden ? ctx.suspend() : ctx.resume(); });
    return { init, apply, sfx, get ctx() { return ctx; }, get bus() { return fx; } };
  })();

  /* ---------- Cartoon Jack (SVG, scales to any size) ---------- */
  function outfitFor(id) {
    const list = C.outfits || [];
    return (!id || id === "random") ? pick(list) : (list.find(o => o.id === id) || list[0]);
  }
  const CURLS = [[100,20,22],[76,26,21],[124,26,21],[54,40,20],[146,40,20],[40,60,18],[160,60,18],[36,82,15],[164,82,15],
                 [64,50,18],[136,50,18],[88,40,18],[112,40,18],[100,48,16],[78,57,14],[122,57,14],[60,70,12],[140,70,12]];
  function jackSVG(f) {
    f = f || outfitFor();
    const uid = Math.random().toString(36).slice(2, 7);
    const skin = "#8b5a3c", shade = "#6b4128", hair = "#15100e", top = f.jacket || f.shirt;
    const fill = f.style === "polo" ? `url(#p${uid})` : top;
    let detail = "";
    if (f.style === "bandhgala") detail =
      `<rect x="89" y="150" width="22" height="66" fill="${f.shirt}"/><rect x="82" y="142" width="36" height="12" rx="5" fill="${f.jacket}"/>
       <g fill="#e2b04a"><circle cx="86" cy="170" r="2.4"/><circle cx="86" cy="186" r="2.4"/><circle cx="86" cy="202" r="2.4"/></g>
       <g fill="#a3283b"><circle cx="117" cy="172" r="2"/><circle cx="117" cy="188" r="2"/><circle cx="117" cy="204" r="2"/></g>`;
    else if (f.style === "suit") detail =
      `<polygon points="84,148 116,148 100,196" fill="${f.shirt}"/><polygon points="97,152 103,152 106,186 100,196 94,186" fill="${f.tie}"/>
       <path d="M84 148L100 196M116 148L100 196" stroke="#000" stroke-opacity=".4" stroke-width="3"/><rect x="120" y="172" width="12" height="4" rx="1" fill="#2c3050"/>`;
    else if (f.style === "polo") detail =
      `<polygon points="82,146 100,160 118,146 112,139 88,139" fill="#232d46"/><path d="M100 160V178" stroke="#1b2336" stroke-width="2"/>`;
    else detail =
      `<circle cx="100" cy="184" r="11" fill="none" stroke="#2b2b2b" stroke-width="1.6"/><path d="M93 184q3.5-5 7 0t7 0M96 179h0M104 179h0" stroke="#2b2b2b" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
    const watch = f.style === "suit" ? "" : `<rect x="43" y="199" width="18" height="5" rx="2" fill="#ebe8e2"/>`;
    const curls = CURLS.map(([x, y, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x - r * .5} ${y + r * .1}a${r * .5} ${r * .5} 0 0 1 ${r * .85} -${r * .35}" stroke="#3a2a22" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join("");
    return `<svg class="jk" viewBox="0 0 200 270" role="img" aria-label="Cartoon Jack wearing ${esc(f.name)}">
<defs><pattern id="p${uid}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${f.shirt}"/><path d="M0 0L10 10M10 0L0 10" stroke="#fff" stroke-opacity=".12"/><circle cx="5" cy="5" r="1.6" fill="${f.dots || "#fff"}"/></pattern></defs>
<ellipse cx="100" cy="262" rx="48" ry="6" fill="#000" opacity=".28"/>
<g class="jk-body">
 <rect x="74" y="208" width="22" height="44" rx="8" fill="${f.pants}"/><rect x="104" y="208" width="22" height="44" rx="8" fill="${f.pants}"/>
 <ellipse cx="85" cy="252" rx="15" ry="7" fill="${f.shoes}"/><ellipse cx="115" cy="252" rx="15" ry="7" fill="${f.shoes}"/>
 <rect x="42" y="156" width="20" height="50" rx="10" fill="${fill}"/><rect x="138" y="156" width="20" height="50" rx="10" fill="${fill}"/>
 <rect x="58" y="146" width="84" height="72" rx="24" fill="${fill}"/>${detail}
 <circle cx="52" cy="210" r="9" fill="${skin}"/><circle cx="148" cy="210" r="9" fill="${skin}"/>${watch}
 <rect x="88" y="132" width="24" height="18" fill="${shade}"/>
 <g class="jk-head">
  <ellipse cx="54" cy="104" rx="8" ry="11" fill="${shade}"/><ellipse cx="146" cy="104" rx="8" ry="11" fill="${shade}"/>
  <ellipse cx="100" cy="100" rx="46" ry="50" fill="${skin}"/>
  <ellipse cx="70" cy="118" rx="6" ry="3" fill="#c46a55" opacity=".35"/><ellipse cx="130" cy="118" rx="6" ry="3" fill="#c46a55" opacity=".35"/>
  <path d="M72 90Q82 84 92 89M108 89Q118 84 128 90" stroke="${hair}" stroke-width="5" stroke-linecap="round" fill="none"/>
  <g class="jk-blink"><ellipse cx="82" cy="103" rx="7.5" ry="6.5" fill="#fff8f0"/><ellipse cx="118" cy="103" rx="7.5" ry="6.5" fill="#fff8f0"/>
   <g class="jk-pupils"><circle cx="82" cy="104" r="3.8" fill="#1a1210"/><circle cx="118" cy="104" r="3.8" fill="#1a1210"/><circle cx="83.3" cy="102.6" r="1.1" fill="#fff"/><circle cx="119.3" cy="102.6" r="1.1" fill="#fff"/></g></g>
  <path d="M100 106Q97 116 94 119Q100 123 106 119" stroke="${shade}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M55 104C56 134 74 156 100 158C126 156 144 134 145 104C141 112 139 124 128 130C118 134 112 127 100 127C88 127 82 134 72 130C61 124 59 112 55 104Z" fill="${hair}" opacity=".93"/>
  <path d="M84 129Q92 122 100 125Q108 122 116 129Q108 127 100 128Q92 127 84 129Z" fill="${hair}"/>
  <path d="M89 133Q100 144 111 133Q100 137 89 133Z" fill="#fff" stroke="#3a1d16" stroke-width="1.5" stroke-linejoin="round"/>
  <g class="jk-hair" fill="${hair}">${curls}</g>
 </g>
</g></svg>`;
  }

  /* eyes follow the pointer (rAF-throttled) */
  let mx = innerWidth / 2, my = innerHeight / 3, raf = 0;
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(look); }, { passive: true });
  function look() {
    raf = 0;
    $$(".jk-pupils").forEach(p => {
      const r = p.ownerSVGElement.getBoundingClientRect(); if (!r.width) return;
      const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height * .38), d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 300) * 2.6;
      p.setAttribute("transform", `translate(${(dx / d * k).toFixed(2)} ${(dy / d * k).toFixed(2)})`);
    });
  }

  /* ---------- Toast ---------- */
  let tt;
  function toast(msg) {
    let t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 3200);
  }

  /* ---------- Settings drawer (any page with #gear) ---------- */
  function row(k, label, type) {
    return type === "toggle"
      ? `<label class="row"><span>${label}</span><input type="checkbox" class="switch" data-k="${k}"></label>`
      : `<label class="row"><span>${label}</span><input type="range" min="0" max="100" data-k="${k}"></label>`;
  }
  function mountSettings() {
    const btn = $("#gear"); if (!btn) return;
    const d = document.createElement("aside"); d.className = "drawer"; d.setAttribute("aria-label", "Settings");
    d.innerHTML = `<div class="drawer-head"><h2>Settings</h2><button class="icon-btn x" aria-label="Close settings">✕</button></div>
      <p class="drawer-sec">Audio</p>${row("music", "Music", "toggle")}${row("musicVol", "Music volume", "range")}${row("sfx", "Sound effects", "toggle")}${row("sfxVol", "SFX volume", "range")}${row("master", "Master volume", "range")}
      <p class="drawer-sec">Display</p>${row("motion", "Animations", "toggle")}
      <p class="drawer-note">Saved on this device. Graphics quality and the phone controller arrive with the World.</p>`;
    const scrim = document.createElement("div"); scrim.className = "scrim";
    document.body.append(scrim, d);
    const open = v => { d.classList.toggle("open", v); scrim.classList.toggle("open", v); if (v) { A.sfx("open"); $(".x", d).focus(); } else btn.focus(); };
    btn.addEventListener("click", () => open(true));
    scrim.onclick = $(".x", d).onclick = () => open(false);
    addEventListener("keydown", e => { if (e.key === "Escape" && d.classList.contains("open")) open(false); });
    $$("[data-k]", d).forEach(inp => {
      const k = inp.dataset.k;
      if (inp.type === "checkbox") { inp.checked = !!S[k]; inp.onchange = () => { S[k] = inp.checked; commit(k); }; }
      else { inp.value = Math.round(S[k] * 100); inp.oninput = () => { S[k] = inp.value / 100; commit(k); }; }
    });
  }
  function commit(k) {
    save(); A.init(); A.apply(); root.classList.toggle("no-motion", !S.motion);
    if (k === "sfx" || k === "sfxVol") A.sfx("click");
  }

  document.addEventListener("DOMContentLoaded", () => {
    mountSettings();
    document.addEventListener("click", e => { if (e.target.closest("[data-sfx]")) A.sfx(e.target.closest("[data-sfx]").dataset.sfx || "click"); });
    $$(".yr").forEach(el => el.textContent = new Date().getFullYear());
  });

  window.Jack = { C, S, A, $, $$, esc, pick, outfitFor, jackSVG, toast };
})();
