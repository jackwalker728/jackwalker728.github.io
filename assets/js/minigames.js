/* Jack's mini arcade: 30-second bite-size versions of my games, played on cabinets in the world.
   One shell (overlay, timer, score, best, input) + one small function per game. Canvas only, no assets. */
const { A } = window.Jack;
const LW = 360, LH = 540, TAU = Math.PI * 2, BEST_KEY = "jack.arcade.best";
const rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let best = {}; try { best = JSON.parse(localStorage.getItem(BEST_KEY)) || {}; } catch (e) {}
const saveBest = () => { try { localStorage.setItem(BEST_KEY, JSON.stringify(best)); } catch (e) {} };
const emojiFont = n => `${n}px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif`;

function shape(c, k, x, y, r, fill, stroke) {
  c.beginPath();
  if (k === 0) c.arc(x, y, r, 0, TAU);
  else if (k === 1) c.rect(x - r * .9, y - r * .9, r * 1.8, r * 1.8);
  else { c.moveTo(x, y - r * 1.05); c.lineTo(x + r, y + r * .8); c.lineTo(x - r, y + r * .8); c.closePath(); }
  if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 3; c.stroke(); }
}
const keyL = I => I.keys.has("arrowleft") || I.keys.has("a"), keyR = I => I.keys.has("arrowright") || I.keys.has("d");
const keyU = I => I.keys.has("arrowup") || I.keys.has("w"), keyD = I => I.keys.has("arrowdown") || I.keys.has("s");

const GAMES = {
  /* MorphRush — endless runner meets shape matching */
  morphrush: () => {
    const COL = ["#ff5d8f", "#41d3c9", "#f3b94d"]; let me = 0, gates = [], spawn = .4, scroll = 0;
    const s = { score: 0, help: "Morph to fit each gate · 1 / 2 / 3, ← → or tap a shape",
      update(dt, I) {
        ["1", "2", "3"].forEach((k, i) => { if (I.pressed.has(k)) me = i; });
        if (I.pressed.has("arrowleft") || I.pressed.has("a")) me = (me + 2) % 3;
        if (I.pressed.has("arrowright") || I.pressed.has("d")) me = (me + 1) % 3;
        if (I.tap && I.tap.y > LH - 100) me = clamp(Math.floor(I.tap.x / (LW / 3)), 0, 2);
        const sp = 170 + s.score * 9; scroll += sp * dt;
        if ((spawn -= dt) <= 0) { gates.push({ y: -30, k: Math.floor(Math.random() * 3) }); spawn = Math.max(.7, 1.5 - s.score * .04); }
        for (const g of gates) { g.y += sp * dt; if (!g.done && g.y >= 360) { g.done = true; if (g.k === me) { s.score++; A.sfx("coin"); I.boom(LW / 2, 360, COL[me]); } else { I.hurt(3); A.sfx("deny"); } } }
        gates = gates.filter(g => g.y < LH);
      },
      draw(c) {
        c.fillStyle = "#15102a"; c.fillRect(0, 0, LW, LH);
        c.strokeStyle = "rgba(123,92,255,.35)"; c.lineWidth = 2; for (let y = (scroll % 40) - 40; y < LH - 100; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(LW, y); c.stroke(); }
        for (const g of gates) { c.globalAlpha = g.done ? .25 : 1; c.fillStyle = "#3b2f63"; c.fillRect(0, g.y - 16, LW, 32); shape(c, g.k, LW / 2, g.y, 20, "#15102a", COL[g.k]); c.globalAlpha = 1; }
        shape(c, me, LW / 2, 360, 17, COL[me], "#ffffff");
        for (let i = 0; i < 3; i++) { const x = LW / 6 + i * LW / 3; c.fillStyle = i === me ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.06)"; c.fillRect(i * LW / 3 + 6, LH - 92, LW / 3 - 12, 84); shape(c, i, x, LH - 50, 18, COL[i]); c.fillStyle = "#fff"; c.font = "600 12px monospace"; c.fillText(i + 1, i * LW / 3 + 14, LH - 76); }
      } };
    return s;
  },

  /* Back-to-Back Arcade — the retro versus shooter, solo edition */
  "retro-arcade": () => {
    let x = LW / 2, shots = [], foes = [], cd = 0, wave = 0, dir = 1;
    const s = { score: 0, help: "← → or drag to move · you fire automatically",
      update(dt, I) {
        x += ((keyR(I) ? 1 : 0) - (keyL(I) ? 1 : 0)) * 280 * dt; if (I.ptr.down) x += (I.ptr.x - x) * Math.min(1, dt * 12); x = clamp(x, 20, LW - 20);
        if ((cd -= dt) <= 0) { cd = .2; shots.push({ x, y: LH - 64 }); }
        if (!foes.length) { wave++; dir = 1; for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) foes.push({ x: 45 + i * 52, y: 50 + r * 42, k: r }); }
        let edge = false; for (const f of foes) { f.x += dir * (34 + wave * 14) * dt; if (f.x < 16 || f.x > LW - 16) edge = true; }
        if (edge) { dir *= -1; foes.forEach(f => { f.y += 14; f.x = clamp(f.x, 16, LW - 16); }); }
        for (const b of shots) { b.y -= 430 * dt; for (const f of foes) if (!f.dead && !b.dead && Math.abs(b.x - f.x) < 17 && Math.abs(b.y - f.y) < 14) { f.dead = b.dead = true; s.score++; A.sfx("pop"); I.boom(f.x, f.y, ["#ff5d8f", "#41d3c9", "#f3b94d"][f.k]); } }
        for (const f of foes) if (!f.dead && f.y > LH - 90) { f.dead = true; I.hurt(3); }
        foes = foes.filter(f => !f.dead); shots = shots.filter(b => !b.dead && b.y > -10);
      },
      draw(c, t) {
        c.fillStyle = "#07060d"; c.fillRect(0, 0, LW, LH);
        for (let i = 0; i < 40; i++) { c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect((i * 97) % LW, (i * 53 + t * 30) % LH, 2, 2); }
        for (const f of foes) { c.fillStyle = ["#ff5d8f", "#41d3c9", "#f3b94d"][f.k]; const w = Math.sin(t * 8) > 0 ? 4 : 0; c.fillRect(f.x - 13, f.y - 8, 26, 14); c.fillRect(f.x - 17, f.y - 2 + w, 6, 8); c.fillRect(f.x + 11, f.y - 2 + w, 6, 8); c.fillStyle = "#07060d"; c.fillRect(f.x - 7, f.y - 4, 4, 4); c.fillRect(f.x + 3, f.y - 4, 4, 4); }
        c.fillStyle = "#fff6c8"; for (const b of shots) c.fillRect(b.x - 2, b.y - 7, 4, 12);
        c.fillStyle = "#ffffff"; c.fillRect(x - 16, LH - 56, 32, 12); c.fillRect(x - 5, LH - 66, 10, 12); c.fillStyle = "#d43c55"; c.fillRect(x - 16, LH - 46, 32, 4);
        c.strokeStyle = "rgba(255,93,143,.35)"; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(0, LH - 90); c.lineTo(LW, LH - 90); c.stroke(); c.setLineDash([]);
      } };
    return s;
  },

  /* Sector404 — you're an AI: copy a variable from one object, paste it where it causes trouble */
  sector404: () => {
    const LV = [
      ["Open the DOOR", ["🚪", "door", "locked", "true"], ["📦", "crate", "locked", "false"], ["💡", "lamp", "on", "true"]],
      ["Bridge the gap", ["🌉", "bridge", "length", "2"], ["🪜", "ladder", "length", "6"], ["🐌", "snail", "speed", "0.1"]],
      ["Sneak past the GUARD", ["💂", "guard", "awake", "true"], ["🐈", "cat", "awake", "false"], ["☕", "coffee", "hot", "true"]],
      ["Move the BOULDER", ["🪨", "boulder", "mass", "900"], ["🪶", "feather", "mass", "0.01"], ["🐘", "elephant", "mass", "5000"]],
      ["Walk through the WALL", ["🧱", "wall", "solid", "true"], ["👻", "ghost", "solid", "false"], ["🪑", "chair", "solid", "true"]],
      ["Put out the FIRE", ["🔥", "fire", "hot", "true"], ["🧊", "ice", "hot", "false"], ["☀️", "sun", "hot", "true"]],
      ["Shrink the GIANT", ["🗿", "giant", "size", "50"], ["🐜", "ant", "size", "0.1"], ["🏢", "tower", "size", "300"]],
      ["Wake the ROBOT", ["🤖", "robot", "power", "off"], ["🔋", "battery", "power", "on"], ["🧸", "teddy", "fluffy", "yes"]]
    ];
    let order = [], lv = null, cards = [], clip = null, shake = 0, win = 0;
    const next = () => { if (!order.length) order = LV.map((_, i) => i).sort(() => Math.random() - .5); const L = LV[order.pop()]; lv = { goal: L[0], target: L[1], need: L[2] }; cards = [L[1], L[2], L[3]].map(o => ({ o, v: o[3] })).sort(() => Math.random() - .5); clip = null; };
    next();
    const pickCard = (i, I) => {
      const cd = cards[i]; if (!cd) return;
      if (clip && cd.o === lv.target) {
        if (clip[0] === lv.target[2]) cd.v = clip[1];
        if (clip[0] === lv.need[2] && clip[1] === lv.need[3]) { s.score++; win = .7; A.sfx("goal"); I.boom(LW / 2, 140 + i * 110, "#41d3c9", 24); }
        else { shake = .35; I.hurt(3); A.sfx("deny"); clip = null; }
      } else { clip = [cd.o[2], cd.v, cd.o[1]]; A.sfx("click"); }
    };
    const s = { score: 0, time: 40, help: "Tap an object to COPY its variable, tap the target to PASTE · keys 1-3",
      update(dt, I) {
        shake -= dt; if (win > 0 && (win -= dt) <= 0) next();
        if (win > 0) return;
        ["1", "2", "3"].forEach((k, i) => { if (I.pressed.has(k)) pickCard(i, I); });
        if (I.tap) cards.forEach((_, i) => { const y = 140 + i * 110; if (I.tap.y > y - 45 && I.tap.y < y + 45) pickCard(i, I); });
      },
      draw(c) {
        c.fillStyle = "#0b1410"; c.fillRect(0, 0, LW, LH);
        c.fillStyle = "#3ddc84"; c.font = "600 12px monospace"; c.fillText("> objective:", 18, 40); c.font = "700 19px system-ui,sans-serif"; c.fillStyle = "#eafff2"; c.fillText(lv.goal, 18, 66);
        cards.forEach((cd, i) => {
          const y = 140 + i * 110, tgt = cd.o === lv.target, dx = tgt && shake > 0 ? Math.sin(shake * 60) * 6 : 0;
          c.fillStyle = tgt ? "#1c3a2a" : "#13241b"; c.strokeStyle = tgt ? "#3ddc84" : "#2d4a3a"; c.lineWidth = 2; c.beginPath(); c.roundRect(14 + dx, y - 45, LW - 28, 90, 12); c.fill(); c.stroke();
          c.font = emojiFont(38); c.fillText(cd.o[0], 30 + dx, y + 14);
          c.fillStyle = "#9fd8b4"; c.font = "600 13px monospace"; c.fillText(`${i + 1}  ${cd.o[1]}${tgt ? "  ← target" : ""}`, 90 + dx, y - 14);
          c.fillStyle = "#eafff2"; c.font = "700 17px monospace"; c.fillText(`${cd.o[2]} = ${cd.v}`, 90 + dx, y + 16);
        });
        c.fillStyle = "#13241b"; c.fillRect(0, LH - 80, LW, 80); c.fillStyle = "#3ddc84"; c.font = "600 12px monospace"; c.fillText("clipboard", 18, LH - 52);
        c.fillStyle = "#eafff2"; c.font = "700 17px monospace"; c.fillText(clip ? `${clip[0]} = ${clip[1]}  (from ${clip[2]})` : "— empty —", 18, LH - 26);
        if (win > 0) { c.fillStyle = "rgba(61,220,132,.2)"; c.fillRect(0, 0, LW, LH); c.fillStyle = "#3ddc84"; c.font = "800 30px monospace"; c.textAlign = "center"; c.fillText("ACCESS GRANTED", LW / 2, LH / 2); c.textAlign = "left"; }
      } };
    return s;
  },

  /* Circuit Smasher — shunt colour-coded zombies into the matching powerline slot */
  "circuit-smasher": () => {
    const COL = ["#ff5d8f", "#41d3c9", "#f3b94d"], bike = { x: LW / 2, y: LH - 80, a: -Math.PI / 2, v: 0 }, zs = [];
    const add = () => zs.push({ x: rnd(40, LW - 40), y: rnd(230, LH - 60), vx: 0, vy: 0, c: Math.floor(Math.random() * 3), ph: Math.random() * 9 });
    for (let i = 0; i < 5; i++) add();
    const s = { score: 0, time: 40, help: "Steer with ← → (↑ gas, ↓ brake) or hold & drag · push zombies into their colour",
      update(dt, I) {
        let thr = keyU(I) ? 1 : keyD(I) ? -.6 : .55;
        if (keyL(I)) bike.a -= 3.4 * dt; if (keyR(I)) bike.a += 3.4 * dt;
        if (I.ptr.down) { const want = Math.atan2(I.ptr.y - bike.y, I.ptr.x - bike.x); let d = ((want - bike.a + Math.PI) % TAU + TAU) % TAU - Math.PI; bike.a += clamp(d, -4 * dt, 4 * dt); thr = 1; }
        bike.v += (thr * 230 - bike.v) * Math.min(1, dt * 2.5);
        bike.x += Math.cos(bike.a) * bike.v * dt; bike.y += Math.sin(bike.a) * bike.v * dt;
        if (bike.x < 14 || bike.x > LW - 14) { bike.x = clamp(bike.x, 14, LW - 14); bike.a = Math.PI - bike.a; }
        if (bike.y < 70 || bike.y > LH - 14) { bike.y = clamp(bike.y, 70, LH - 14); bike.a = -bike.a; }
        for (const z of zs) {
          z.ph += dt; const dx = z.x - bike.x, dy = z.y - bike.y, d = Math.hypot(dx, dy);
          if (d < 28 && d > .1) { const f = 60 + bike.v * 1.1; z.vx = dx / d * f + Math.cos(bike.a) * bike.v * .6; z.vy = dy / d * f + Math.sin(bike.a) * bike.v * .6; z.x = bike.x + dx / d * 28; z.y = bike.y + dy / d * 28; A.sfx("kick"); }
          z.x += z.vx * dt + Math.sin(z.ph * 2) * 8 * dt; z.y += z.vy * dt; z.vx *= Math.exp(-dt * 1.6); z.vy *= Math.exp(-dt * 1.6);
          if (z.x < 14 || z.x > LW - 14) { z.x = clamp(z.x, 14, LW - 14); z.vx *= -.7; }
          if (z.y > LH - 14) { z.y = LH - 14; z.vy *= -.7; }
          if (z.y < 62) {
            const slot = Math.floor(z.x / (LW / 3));
            if (slot === z.c) { z.dead = true; s.score++; A.sfx("coin"); I.boom(z.x, 50, COL[z.c], 22); }
            else { z.y = 64; z.vy = Math.abs(z.vy) * .6 + 60; A.sfx("deny"); }
          }
        }
        for (let i = zs.length - 1; i >= 0; i--) if (zs[i].dead) { zs.splice(i, 1); add(); }
      },
      draw(c, t) {
        c.fillStyle = "#1b1f26"; c.fillRect(0, 0, LW, LH);
        c.strokeStyle = "rgba(255,255,255,.05)"; for (let y = 80; y < LH; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(LW, y); c.stroke(); }
        for (let i = 0; i < 3; i++) { c.fillStyle = COL[i]; c.globalAlpha = .25 + Math.abs(Math.sin(t * 3 + i)) * .2; c.fillRect(i * LW / 3 + 4, 0, LW / 3 - 8, 56); c.globalAlpha = 1; c.font = emojiFont(26); c.fillText("⚡", i * LW / 3 + LW / 6 - 14, 38); }
        c.fillStyle = "#555b66"; c.fillRect(0, 56, LW, 4);
        for (const z of zs) { c.fillStyle = COL[z.c]; c.beginPath(); c.arc(z.x, z.y, 14, 0, TAU); c.fill(); c.fillStyle = "#1b1f26"; c.fillRect(z.x - 7, z.y - 4, 4, 4); c.fillRect(z.x + 3, z.y - 4, 4, 4); c.fillRect(z.x - 5, z.y + 5, 10, 2); }
        c.save(); c.translate(bike.x, bike.y); c.rotate(bike.a); c.fillStyle = "#ffffff"; c.fillRect(-16, -5, 32, 10); c.fillStyle = "#d43c55"; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fill(); c.fillStyle = "#111"; c.fillRect(-18, -3, 6, 6); c.fillRect(12, -3, 6, 6); c.restore();
      } };
    return s;
  },

  /* REVERSE — history changed one thing while you rewound. Spot it. */
  reverse: () => {
    const POOL = ["🏺", "📻", "📺", "🎩", "🚲", "🗿", "🪔", "📜", "👑", "🦖", "🛸", "🎷", "🧭", "⚓", "🍵", "🎈", "🕯️", "🪕", "📷", "🧸"];
    let items = [], phase = "look", pt = 0, changed = -1, wrong = 0;
    const round = () => { const p = POOL.slice().sort(() => Math.random() - .5); items = [0, 1, 2, 3, 4, 5].map(i => ({ e: p[i], x: 70 + (i % 3) * 110 + rnd(-14, 14), y: 150 + Math.floor(i / 3) * 170 + rnd(-14, 14) })); changed = Math.floor(Math.random() * 6); items.spare = p[6]; phase = "look"; pt = Math.max(1.2, 2.6 - s.score * .15); };
    const s = { score: 0, help: "Memorise the scene, then tap the one thing history changed",
      update(dt, I) {
        wrong -= dt; pt -= dt;
        if (phase === "look" && pt <= 0) { phase = "rewind"; pt = .7; A.sfx("whoosh"); }
        else if (phase === "rewind" && pt <= 0) { phase = "find"; items[changed].e = items.spare; }
        else if (phase === "find" && I.tap) {
          let hit = -1, bd = 60; items.forEach((it, i) => { const d = Math.hypot(I.tap.x - it.x, I.tap.y - it.y); if (d < bd) { bd = d; hit = i; } });
          if (hit === changed) { s.score++; A.sfx("coin"); I.boom(items[hit].x, items[hit].y, "#f3b94d", 18); round(); }
          else if (hit >= 0) { wrong = .3; I.hurt(3); A.sfx("deny"); }
        }
      },
      draw(c, t) {
        const sep = phase === "look"; c.fillStyle = sep ? "#3a2c1c" : "#141a2b"; c.fillRect(0, 0, LW, LH);
        c.fillStyle = sep ? "#f3d9a4" : "#cfe3ff"; c.font = "700 16px monospace"; c.fillText(sep ? "📼 1987 — remember this" : phase === "find" ? "Now — what changed?" : "", 18, 50);
        if (phase === "rewind") { for (let y = 0; y < LH; y += 6) { c.fillStyle = `rgba(255,255,255,${Math.random() * .08})`; c.fillRect(0, y, LW, 3); } c.fillStyle = "#fff"; c.font = "800 34px monospace"; c.textAlign = "center"; c.fillText("◀◀ REWIND", LW / 2, LH / 2); c.textAlign = "left"; return; }
        c.textAlign = "center"; c.textBaseline = "middle"; c.font = emojiFont(54);
        items.forEach(it => { c.fillStyle = "rgba(255,255,255,.06)"; c.beginPath(); c.arc(it.x, it.y, 42, 0, TAU); c.fill(); c.fillStyle = "#fff"; c.fillText(it.e, it.x, it.y + 2); });
        c.textAlign = "left"; c.textBaseline = "alphabetic";
        if (sep) { c.fillStyle = "rgba(243,201,120,.12)"; c.fillRect(0, 0, LW, LH); c.fillStyle = "#f3d9a4"; c.fillRect(18, LH - 40, (LW - 36) * Math.max(0, pt / 2.6), 6); }
        if (wrong > 0) { c.fillStyle = "rgba(255,60,80,.25)"; c.fillRect(0, 0, LW, LH); }
      } };
    round(); return s;
  },

  /* Wasteland Chorus — swing your phone like a weapon. Here: swipe through the horde. */
  "wasteland-chorus": () => {
    let zs = [], spawn = 0, trail = [], last = null, arcs = [];
    const C = { x: LW / 2, y: LH / 2 + 30 };
    const kill = z => { z.dead = true; s.score++; A.sfx("kick"); I0.boom(z.x, z.y, "#9be36b", 10); };
    let I0;
    const s = { score: 0, help: "Swipe through zombies to swing · or arrow keys to swing that way",
      update(dt, I) {
        I0 = I;
        if ((spawn -= dt) <= 0) { spawn = Math.max(.35, 1 - s.score * .03); const a = Math.random() * TAU, r = 330; zs.push({ x: C.x + Math.cos(a) * r, y: C.y + Math.sin(a) * r, sp: 42 + s.score * 2 + rnd(0, 20), ph: Math.random() * 9 }); }
        for (const z of zs) { const dx = C.x - z.x, dy = C.y - z.y, d = Math.hypot(dx, dy); z.ph += dt; z.x += dx / d * z.sp * dt + Math.sin(z.ph * 4) * 10 * dt; z.y += dy / d * z.sp * dt; if (d < 24) { z.dead = true; I.hurt(3); A.sfx("deny"); } }
        if (I.ptr.down) {
          const p = { x: I.ptr.x, y: I.ptr.y };
          if (last) { const len = Math.hypot(p.x - last.x, p.y - last.y); if (len / Math.max(dt, 1e-3) > 380) for (const z of zs) if (!z.dead) { const t = clamp(((z.x - last.x) * (p.x - last.x) + (z.y - last.y) * (p.y - last.y)) / (len * len || 1), 0, 1); if (Math.hypot(z.x - (last.x + t * (p.x - last.x)), z.y - (last.y + t * (p.y - last.y))) < 26) kill(z); } }
          trail.push({ ...p, t: .25 }); last = p;
        } else last = null;
        const dirs = [["arrowup", -Math.PI / 2], ["w", -Math.PI / 2], ["arrowdown", Math.PI / 2], ["s", Math.PI / 2], ["arrowleft", Math.PI], ["a", Math.PI], ["arrowright", 0], ["d", 0]];
        for (const [k, a] of dirs) if (I.pressed.has(k)) { arcs.push({ a, t: .2 }); A.sfx("whoosh"); for (const z of zs) if (!z.dead) { const d = Math.hypot(z.x - C.x, z.y - C.y), za = Math.atan2(z.y - C.y, z.x - C.x), da = Math.abs(((za - a + Math.PI) % TAU + TAU) % TAU - Math.PI); if (d < 140 && da < .7) kill(z); } }
        zs = zs.filter(z => !z.dead); trail.forEach(p => p.t -= dt); trail = trail.filter(p => p.t > 0); arcs.forEach(a => a.t -= dt); arcs = arcs.filter(a => a.t > 0);
      },
      draw(c) {
        c.fillStyle = "#3a2a1e"; c.fillRect(0, 0, LW, LH);
        c.fillStyle = "rgba(255,180,90,.06)"; for (let i = 0; i < 18; i++) c.fillRect((i * 71) % LW, (i * 131) % LH, 40, 3);
        for (const a of arcs) { c.strokeStyle = `rgba(255,240,200,${a.t * 4})`; c.lineWidth = 10; c.beginPath(); c.arc(C.x, C.y, 110, a.a - .7, a.a + .7); c.stroke(); }
        c.font = emojiFont(30); c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff";
        for (const z of zs) c.fillText("🧟", z.x, z.y);
        c.font = emojiFont(36); c.fillText("🧍", C.x, C.y); c.textAlign = "left"; c.textBaseline = "alphabetic";
        if (trail.length > 1) { c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 5; c.lineCap = "round"; c.beginPath(); trail.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.stroke(); }
      } };
    return s;
  }
};

/* ---------- shell ---------- */
let open = false;
export const arcade = { get open() { return open; }, has: id => !!GAMES[id], best: id => best[id] || 0 };
const css = `.arc{position:fixed;inset:0;z-index:30;display:grid;place-items:center;background:rgba(8,6,14,.82);backdrop-filter:blur(6px);padding:10px}
.arc-box{position:relative;background:#120e1c;border:2px solid rgba(255,255,255,.14);border-radius:18px;padding:10px;box-shadow:0 30px 80px rgba(0,0,0,.5);max-width:100%;width:min-content}
.arc-top{display:flex;align-items:center;gap:10px;color:#fff;padding:2px 4px 8px;font:700 15px system-ui,sans-serif}
.arc-top b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.arc-hud{font:600 13px monospace;color:#f3c94d;white-space:nowrap}
.arc-x{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:15px}
.arc canvas{display:block;height:min(72vh,540px);aspect-ratio:2/3;max-width:calc(100vw - 44px);border-radius:12px;touch-action:none;background:#000}
.arc-help{color:rgba(255,255,255,.65);font:12.5px system-ui,sans-serif;text-align:center;padding:8px 4px 2px}
.arc-end{position:absolute;inset:0;display:grid;place-items:center;background:rgba(10,8,20,.86);border-radius:18px;text-align:center;color:#fff}
.arc-end[hidden]{display:none}.arc-end h2{font:800 30px system-ui,sans-serif;margin:0 0 6px}.arc-end p{opacity:.8;margin:0 0 18px}
.arc-end button{margin:4px;padding:10px 18px;border-radius:99px;font:700 14px system-ui,sans-serif;background:#fff;color:#120e1c}.arc-end button+button{background:rgba(255,255,255,.14);color:#fff}`;
export function playGame(id, title, onEnd) {
  if (open || !GAMES[id]) return; open = true;
  if (!document.getElementById("arc-css")) { const st = document.createElement("style"); st.id = "arc-css"; st.textContent = css; document.head.append(st); }
  const root = document.createElement("div"); root.className = "arc";
  root.innerHTML = `<div class="arc-box"><div class="arc-top"><b></b><span class="arc-hud"></span><button class="arc-x" aria-label="Close">✕</button></div><canvas></canvas><div class="arc-help"></div><div class="arc-end" hidden><div><h2></h2><p></p><button class="again">▶ Play again</button><button class="back">Back to world</button></div></div></div>`;
  document.body.append(root);
  const cv = root.querySelector("canvas"), c = cv.getContext("2d"), hud = root.querySelector(".arc-hud"), end = root.querySelector(".arc-end");
  const dpr = Math.min(2, devicePixelRatio || 1); cv.width = LW * dpr; cv.height = LH * dpr;
  root.querySelector("b").textContent = `🕹️ ${title}`;
  const I = { keys: new Set(), pressed: new Set(), ptr: { x: 0, y: 0, down: false }, tap: null, hurt: s => { st.left -= s; st.flash = .25; }, boom: (x, y, col, n = 12) => { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = rnd(40, 180); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: rnd(.3, .7), col }); } } };
  let parts = [], game, st, raf = 0, last = 0, runT = 0, playedScore = 0;
  const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * LW, y: (e.clientY - r.top) / r.height * LH }; };
  cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); Object.assign(I.ptr, pos(e), { down: true }); I.tap = pos(e); });
  cv.addEventListener("pointermove", e => Object.assign(I.ptr, pos(e)));
  const up = () => { I.ptr.down = false; }; cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up); cv.addEventListener("lostpointercapture", up);
  const kd = e => { const k = e.key.toLowerCase(); if (k === "escape") return close(); if (!I.keys.has(k)) I.pressed.add(k); I.keys.add(k); if (k.startsWith("arrow") || k === " ") e.preventDefault(); e.stopPropagation(); };
  const ku = e => { I.keys.delete(e.key.toLowerCase()); e.stopPropagation(); };
  addEventListener("keydown", kd, true); addEventListener("keyup", ku, true);
  function start() { game = GAMES[id](); st = { left: game.time || 30, flash: 0 }; parts = []; runT = 0; end.hidden = true; root.querySelector(".arc-help").textContent = game.help; I.keys.clear(); last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; runT += dt;
    game.update(dt, I); st.left -= dt; st.flash -= dt; I.tap = null; I.pressed.clear();
    c.setTransform(dpr, 0, 0, dpr, 0, 0); game.draw(c, runT);
    parts.forEach(p => { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; c.globalAlpha = Math.max(0, p.t * 2); c.fillStyle = p.col; c.fillRect(p.x - 3, p.y - 3, 6, 6); }); c.globalAlpha = 1; parts = parts.filter(p => p.t > 0);
    if (st.flash > 0) { c.fillStyle = "rgba(255,50,70,.22)"; c.fillRect(0, 0, LW, LH); }
    hud.textContent = `⭐ ${game.score}  ·  ⏱ ${Math.max(0, Math.ceil(st.left))}s`;
    if (st.left <= 0) return finish();
    raf = requestAnimationFrame(loop);
  }
  function finish() {
    const sc = game.score, nb = sc > (best[id] || 0); if (nb) { best[id] = sc; saveBest(); }
    playedScore = Math.max(playedScore, sc);
    end.querySelector("h2").textContent = nb && sc ? `New best: ${sc}!` : `Score: ${sc}`;
    end.querySelector("p").textContent = `Best: ${best[id] || 0}`; end.hidden = false; A.sfx(nb && sc ? "goal" : "open");
    end.querySelector(".again").focus();
  }
  function close() { cancelAnimationFrame(raf); removeEventListener("keydown", kd, true); removeEventListener("keyup", ku, true); root.remove(); open = false; onEnd?.(Math.max(playedScore, game?.score || 0), best[id] || 0); }
  end.querySelector(".again").onclick = start; end.querySelector(".back").onclick = close; root.querySelector(".arc-x").onclick = close;
  start(); A.sfx("open");
}
