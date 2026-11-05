/* Concept Vault — themed canvas renderers (VFX) and Web Audio synth (SFX) */
(function () {
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  const mono = (px, wt = 500) => `${wt} ${Math.round(px)}px "JetBrains Mono", ui-monospace, monospace`;
  const disp = (px, wt = 800) => `${wt} ${Math.round(px)}px Anybody, "Arial Narrow", sans-serif`;

  const R = {};

  /* ---------------- HUB: constellation of 10 accents ---------------- */
  R.hub = () => {
    const cols = ["#ff2e88", "#39d0c8", "#5cc8ff", "#ffd60a", "#b388ff", "#ff453a", "#ffcc33", "#ffe14d", "#ffd9a0", "#3dffb5"];
    let P = [];
    return {
      init(w, h) { P = []; const n = Math.round(clamp(w * h / 14000, 40, 120)); for (let i = 0; i < n; i++) P.push({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-8, 8), vy: rnd(-14, -4), r: rnd(1, 2.6), c: cols[i % 10] }); },
      draw(c, w, h, t, m, dt) {
        c.fillStyle = "#08080b"; c.fillRect(0, 0, w, h);
        c.strokeStyle = "rgba(236,235,230,0.035)"; c.lineWidth = 1;
        const g = 64, off = (t * 6) % g;
        c.beginPath(); for (let x = -off; x < w; x += g) { c.moveTo(x, 0); c.lineTo(x, h); } for (let y = -off; y < h; y += g) { c.moveTo(0, y); c.lineTo(w, y); } c.stroke();
        for (const p of P) {
          if (m) { const dx = p.x - m.x, dy = p.y - m.y, d2 = dx * dx + dy * dy; if (d2 < 22000) { const f = 60 / (Math.sqrt(d2) + 8); p.x += dx * f * dt; p.y += dy * f * dt; } }
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.y < -10) { p.y = h + 10; p.x = rnd(0, w); } if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        }
        for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
          const a = P[i], b = P[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < 9000) { c.strokeStyle = a.c; c.globalAlpha = (1 - d / 9000) * 0.25; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
        }
        c.globalAlpha = 1;
        for (const p of P) { c.fillStyle = p.c; c.shadowColor = p.c; c.shadowBlur = 10; c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill(); }
        c.shadowBlur = 0;
      },
      click(x, y) { for (let i = 0; i < 10; i++) P.push({ x, y, vx: rnd(-80, 80), vy: rnd(-90, 20), r: rnd(1, 3), c: cols[i] }); if (P.length > 200) P.splice(0, 10); }
    };
  };

  /* ---------------- 01 FEED ---------------- */
  R.feed = () => {
    let posts = [], pops = [], W = 0, H = 0, sc = 1;
    const make = (w, h) => {
      W = w; H = h; sc = clamp(h / 700, 0.45, 1.2); posts = [];
      const cols = Math.max(2, Math.round(w / (260 * Math.max(sc, .6)))); const cw = w / cols;
      for (let col = 0; col < cols; col++) { let y = -rnd(0, 120 * sc); while (y < h + 200) { const ph = rnd(80, 160) * sc; posts.push({ x: col * cw + cw * 0.08, y, w: cw * 0.84, h: ph, fake: Math.random() < 0.3, sp: rnd(22, 38) * sc, col, seed: Math.random() }); y += ph + 16 * sc; } }
    };
    return {
      init: make,
      draw(c, w, h, t, m, dt) {
        c.fillStyle = "#0d0b14"; c.fillRect(0, 0, w, h);
        for (const p of posts) {
          p.y -= p.sp * dt;
          if (p.y + p.h < -20) { let my = -1e9; for (const q of posts) if (q.col === p.col) my = Math.max(my, q.y + q.h); p.y = my + 16 * sc; p.fake = Math.random() < 0.3; p.seed = Math.random(); }
          const near = m && m.x > p.x && m.x < p.x + p.w && m.y > p.y && m.y < p.y + p.h;
          c.fillStyle = near ? "rgba(255,46,136,0.16)" : "rgba(245,243,255,0.045)"; rr(c, p.x, p.y, p.w, p.h, 10 * sc + 2); c.fill();
          c.strokeStyle = p.fake ? "rgba(255,46,136,0.5)" : "rgba(245,243,255,0.1)"; c.lineWidth = 1; c.stroke();
          const av = 11 * sc + 3;
          c.fillStyle = `hsla(${(p.seed * 360) | 0},70%,62%,.85)`; c.beginPath(); c.arc(p.x + 12 * sc + av, p.y + 12 * sc + av, av, 0, TAU); c.fill();
          c.fillStyle = "rgba(245,243,255,.38)"; c.fillRect(p.x + 22 * sc + av * 2, p.y + 14 * sc + av * .4, p.w * 0.38, 6 * sc + 1);
          c.fillStyle = "rgba(245,243,255,.14)"; for (let i = 0; i < 3; i++) { const ly = p.y + 26 * sc + av * 2 + i * 12 * sc; if (ly < p.y + p.h - 22 * sc) c.fillRect(p.x + 12 * sc, ly, (p.w - 24 * sc) * (i === 2 ? .55 : 1), 5 * sc + 1); }
          c.fillStyle = p.fake ? "#ffd23f" : "rgba(62,240,255,.75)"; c.font = mono(Math.max(8, 11 * sc), 600); c.textAlign = "left"; c.textBaseline = "alphabetic";
          c.fillText("♥ " + Math.floor((p.seed * 900 + t * (p.fake ? 55 : 3)) % 99999).toLocaleString("en-IN"), p.x + 12 * sc, p.y + p.h - 10 * sc);
          if (p.fake || near) {
            c.save(); c.translate(p.x + p.w * 0.7, p.y + p.h * 0.52); c.rotate(-0.22);
            c.font = disp(Math.max(10, 20 * sc), 900); const tw = c.measureText("FAKE").width;
            c.strokeStyle = "#ff2e88"; c.lineWidth = 2; c.strokeRect(-tw / 2 - 6, -13 * sc - 3, tw + 12, 26 * sc + 6);
            c.fillStyle = "#ff2e88"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("FAKE", 0, 1); c.restore();
          }
        }
        if (Math.random() < dt * 2.2) pops.push({ x: rnd(0, w), y: h + 10, vy: rnd(-60, -120) * sc, life: 1, txt: ["+1", "♥", "SHARE", "+99", "!!", "FWD"][(Math.random() * 6) | 0], col: Math.random() < .5 ? "#ff2e88" : "#3ef0ff" });
        for (const p of pops) { p.y += p.vy * dt; p.life -= dt * 0.35; c.globalAlpha = clamp(p.life, 0, 1); c.fillStyle = p.col; c.font = mono(Math.max(9, 14 * sc), 700); c.textAlign = "center"; c.fillText(p.txt, p.x, p.y); }
        c.globalAlpha = 1; pops = pops.filter(p => p.life > 0);
        if (Math.random() < 0.07) { const k = c.canvas.width / w; const sy = rnd(0, h), sh = rnd(4, 26 * sc + 6), dx = rnd(-24, 24) * sc; try { c.drawImage(c.canvas, 0, sy * k, w * k, sh * k, dx, sy, w, sh); } catch (e) { } c.fillStyle = Math.random() < .5 ? "rgba(255,46,136,.12)" : "rgba(62,240,255,.12)"; c.fillRect(0, sy, w, sh); }
      },
      click(x, y) { for (let i = 0; i < 14; i++) pops.push({ x: x + rnd(-30, 30), y, vy: rnd(-180, -60) * sc, life: 1.4, txt: ["♥", "+1", "VIRAL", "♥", "+999"][(Math.random() * 5) | 0], col: ["#ff2e88", "#3ef0ff", "#ffd23f"][(Math.random() * 3) | 0] }); }
    };
  };

  /* ---------------- 02 WATER ---------------- */
  R.water = () => {
    let drops = [], rip = [], bub = [], lvl = 0.62, sc = 1;
    return {
      init(w, h) { sc = clamp(h / 700, .4, 1.2); bub = []; for (let i = 0; i < 40; i++) bub.push({ x: rnd(0, w), y: rnd(h * .4, h), r: rnd(1, 3) * sc + .5, s: rnd(10, 30) }); },
      draw(c, w, h, t, m, dt) {
        const target = 0.48 + 0.3 * Math.sin(t * 0.16); lvl += (target - lvl) * Math.min(1, dt * 1.5);
        const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0a2229"); g.addColorStop(1, "#020a0d"); c.fillStyle = g; c.fillRect(0, 0, w, h);
        const sy = h * (1 - lvl);
        c.strokeStyle = "rgba(232,194,122,.12)"; c.lineWidth = 1; // dry-bed cracks above the water line
        for (let i = 0; i < 9; i++) { const bx = (i * 137) % w, by = sy - 10 - ((i * 53) % Math.max(20, sy * .6)); c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 18 * sc, by + 6 * sc); c.lineTo(bx + 30 * sc, by - 4 * sc); c.moveTo(bx + 18 * sc, by + 6 * sc); c.lineTo(bx + 22 * sc, by + 18 * sc); c.stroke(); }
        const fills = ["rgba(57,208,200,.16)", "rgba(57,208,200,.22)", "rgba(16,110,120,.6)"];
        for (let L = 0; L < 3; L++) {
          c.beginPath(); c.moveTo(0, h);
          for (let x = 0; x <= w + 8; x += 8) {
            let y = sy + Math.sin(x * 0.012 + t * (0.8 + L * 0.3) + L) * (5 + L * 4) * (sc + .3) + Math.sin(x * 0.031 - t * 1.3) * 3 * sc;
            if (m) { const d = x - m.x; y -= 22 * sc * Math.exp(-(d * d) / 7200) * (m.active ? 1 : .5) * (0.6 + 0.4 * Math.sin(t * 4)); }
            for (const r of rip) { const d = Math.abs(x - r.x); const k = 1 - Math.abs(d - r.r) / 40; if (k > 0) y += Math.sin((d - r.r) * .2) * 7 * sc * r.a * k; }
            c.lineTo(x, y + L * 10 * sc);
          }
          c.lineTo(w, h); c.closePath(); c.fillStyle = fills[L]; c.fill();
          if (L === 0) { c.strokeStyle = "rgba(180,255,250,.55)"; c.lineWidth = 1.5; c.stroke(); }
        }
        c.strokeStyle = "rgba(180,255,250,.07)"; c.lineWidth = 2; // caustics
        for (let i = 0; i < 7; i++) { c.beginPath(); const yy = sy + 40 * sc + i * (h - sy) / 7; for (let x = 0; x <= w; x += 20) c.lineTo(x, yy + Math.sin(x * .02 + t * 1.2 + i) * 8 * sc); c.stroke(); }
        for (const b of bub) { b.y -= b.s * dt * sc; if (b.y < sy) { b.y = h + 5; b.x = rnd(0, w); } c.strokeStyle = "rgba(200,255,250,.35)"; c.lineWidth = 1; c.beginPath(); c.arc(b.x + Math.sin(t * 2 + b.s) * 3, b.y, b.r, 0, TAU); c.stroke(); }
        if (Math.random() < dt * 2.5) drops.push({ x: rnd(0, w), y: -10, vy: rnd(120, 220) * sc });
        c.strokeStyle = "rgba(190,255,250,.8)"; c.lineWidth = 1.6 * sc + .4;
        for (const d of drops) { d.vy += 700 * sc * dt; d.y += d.vy * dt; c.beginPath(); c.moveTo(d.x, d.y - 12 * sc); c.lineTo(d.x, d.y); c.stroke(); if (d.y > sy) { d.dead = 1; rip.push({ x: d.x, r: 0, a: 1 }); } }
        drops = drops.filter(d => !d.dead);
        for (const r of rip) { r.r += 110 * dt; r.a -= dt * .7; c.strokeStyle = `rgba(190,255,250,${clamp(r.a, 0, 1) * .6})`; c.lineWidth = 1.2; c.beginPath(); c.ellipse(r.x, sy + 2, r.r, r.r * .22, 0, 0, TAU); c.stroke(); }
        rip = rip.filter(r => r.a > 0);
        // gauge
        const gx = w - 46 * sc - 14; c.font = mono(Math.max(8, 11 * sc)); c.textAlign = "right"; c.textBaseline = "middle";
        for (let k = 0; k <= 4; k++) { const yy = h - h * k / 4; c.fillStyle = "rgba(232,194,122,.5)"; c.fillRect(gx, yy - .5, 12 * sc + 4, 1); if (k > 0 && k < 4) c.fillText(k * 25 + "%", gx - 6, yy); }
        const pct = Math.round(lvl * 100); c.fillStyle = pct < 30 ? "#ff6b4a" : "#39d0c8"; c.font = disp(Math.max(14, 34 * sc), 800); c.textAlign = "right"; c.fillText(pct + "%", gx + 14 * sc, sy - 18 * sc);
        c.font = mono(Math.max(7, 10 * sc)); c.fillStyle = "rgba(232,194,122,.8)"; c.fillText("SHARED LAKE · KEREPURA", gx + 14 * sc, sy - 44 * sc);
      },
      click(x, y) { rip.push({ x, r: 0, a: 1.4 }); for (let i = 0; i < 3; i++) drops.push({ x: x + rnd(-20, 20), y: y - 40, vy: 50 }); }
    };
  };

  /* ---------------- 03 X-RAY ---------------- */
  R.xray = () => {
    let sc = 1;
    function bodyPath(c, cx, top, s) {
      c.beginPath(); c.arc(cx, top + 42 * s, 30 * s, 0, TAU);
      c.moveTo(cx - 12 * s, top + 70 * s); c.lineTo(cx - 12 * s, top + 88 * s); c.moveTo(cx + 12 * s, top + 70 * s); c.lineTo(cx + 12 * s, top + 88 * s);
      c.moveTo(cx - 78 * s, top + 98 * s); c.quadraticCurveTo(cx, top + 82 * s, cx + 78 * s, top + 98 * s);
      c.lineTo(cx + 56 * s, top + 240 * s); c.lineTo(cx + 60 * s, top + 300 * s); c.lineTo(cx - 60 * s, top + 300 * s); c.lineTo(cx - 56 * s, top + 240 * s); c.closePath();
      c.moveTo(cx - 78 * s, top + 98 * s); c.lineTo(cx - 98 * s, top + 210 * s); c.lineTo(cx - 104 * s, top + 300 * s);
      c.moveTo(cx + 78 * s, top + 98 * s); c.lineTo(cx + 98 * s, top + 210 * s); c.lineTo(cx + 104 * s, top + 300 * s);
      c.moveTo(cx - 40 * s, top + 300 * s); c.lineTo(cx - 46 * s, top + 470 * s); c.moveTo(cx + 40 * s, top + 300 * s); c.lineTo(cx + 46 * s, top + 470 * s);
    }
    function organs(c, cx, top, s, t, bright) {
      const a = bright ? 1 : .14;
      c.lineWidth = bright ? 2 : 1;
      c.strokeStyle = `rgba(233,246,255,${a * .8})`; // ribs + spine
      for (let i = 0; i < 6; i++) { const y = top + 118 * s + i * 15 * s; c.beginPath(); c.ellipse(cx, y, (62 - i * 2) * s, 12 * s, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
      c.setLineDash([5 * s, 4 * s]); c.beginPath(); c.moveTo(cx, top + 86 * s); c.lineTo(cx, top + 300 * s); c.stroke(); c.setLineDash([]);
      c.fillStyle = `rgba(92,200,255,${a * .45})`; c.strokeStyle = `rgba(92,200,255,${a})`;
      c.beginPath(); c.ellipse(cx - 30 * s, top + 160 * s, 24 * s, 50 * s, .08, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(cx + 30 * s, top + 160 * s, 24 * s, 50 * s, -.08, 0, TAU); c.fill(); c.stroke();
      const beat = 1 + 0.14 * Math.pow(Math.max(0, Math.sin(t * 7.6)), 10);
      c.fillStyle = `rgba(255,90,95,${a * .95})`; c.beginPath(); c.ellipse(cx + 12 * s, top + 172 * s, 15 * s * beat, 18 * s * beat, -.4, 0, TAU); c.fill();
      c.fillStyle = `rgba(200,90,70,${a * .75})`; c.beginPath(); c.ellipse(cx - 24 * s, top + 220 * s, 34 * s, 15 * s, -.22, 0, TAU); c.fill();
      c.fillStyle = `rgba(255,170,120,${a * .7})`; c.beginPath(); c.ellipse(cx + 26 * s, top + 222 * s, 18 * s, 13 * s, .3, 0, TAU); c.fill();
      c.strokeStyle = `rgba(255,150,170,${a * .8})`; c.lineWidth = (bright ? 3 : 1.5) * s;
      c.beginPath(); for (let i = 0; i <= 60; i++) { const k = i / 60; const x = cx + Math.sin(k * TAU * 3) * 30 * s * (1 - k * .3); const y = top + 246 * s + k * 42 * s; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      if (bright) {
        c.font = mono(Math.max(8, 11 * s), 600); c.fillStyle = "#e9f6ff"; c.textBaseline = "middle";
        const lab = (tx, ty, ox, txt) => { c.strokeStyle = "rgba(233,246,255,.6)"; c.lineWidth = 1; c.beginPath(); c.moveTo(tx, ty); c.lineTo(ox, ty); c.stroke(); c.textAlign = ox > tx ? "left" : "right"; c.fillText(txt, ox + (ox > tx ? 4 : -4), ty); };
        lab(cx + 22 * s, top + 172 * s, cx + 130 * s, "HEART"); lab(cx - 40 * s, top + 150 * s, cx - 130 * s, "LUNG"); lab(cx - 40 * s, top + 222 * s, cx - 130 * s, "LIVER"); lab(cx + 40 * s, top + 222 * s, cx + 130 * s, "STOMACH"); lab(cx + 26 * s, top + 270 * s, cx + 130 * s, "INTESTINE");
      }
    }
    return {
      init(w, h) { sc = clamp(h / 700, .35, 1.3); },
      draw(c, w, h, t, m, dt) {
        c.fillStyle = "#050a18"; c.fillRect(0, 0, w, h);
        c.fillStyle = "rgba(92,200,255,.12)"; const gs = 26 * sc + 6; for (let x = gs / 2; x < w; x += gs) for (let y = gs / 2; y < h; y += gs) c.fillRect(x, y, 1.2, 1.2);
        const s = h / 540; const cx = w * .5 + (m ? (m.x - w / 2) * .04 : 0); const top = h * .06;
        c.strokeStyle = "rgba(92,200,255,.32)"; c.lineWidth = 1.5; bodyPath(c, cx, top, s); c.stroke();
        organs(c, cx, top, s, t, false);
        const by = m && m.active ? m.y : (((t * .2) % 1.3) - .15) * h; const bh = 90 * s + 20;
        c.save(); c.beginPath(); c.rect(0, by - bh / 2, w, bh); c.clip();
        c.fillStyle = "rgba(92,200,255,.07)"; c.fillRect(0, by - bh / 2, w, bh);
        c.shadowColor = "#5cc8ff"; c.shadowBlur = 14; c.strokeStyle = "rgba(160,225,255,.95)"; c.lineWidth = 2; bodyPath(c, cx, top, s); c.stroke(); c.shadowBlur = 0;
        organs(c, cx, top, s, t, true); c.restore();
        const lg = c.createLinearGradient(0, by - bh / 2, 0, by + bh / 2); lg.addColorStop(0, "rgba(92,200,255,0)"); lg.addColorStop(.5, "rgba(92,200,255,.0)"); lg.addColorStop(1, "rgba(92,200,255,0)");
        c.fillStyle = "#5cc8ff"; c.globalAlpha = .9; c.fillRect(0, by - bh / 2, w, 1.5); c.fillRect(0, by + bh / 2, w, 1.5); c.globalAlpha = 1;
        const k = 22 * sc + 6, p = 14; c.strokeStyle = "rgba(92,200,255,.8)"; c.lineWidth = 2;
        [[p, p, 1, 1], [w - p, p, -1, 1], [p, h - p, 1, -1], [w - p, h - p, -1, -1]].forEach(([x, y, a, b]) => { c.beginPath(); c.moveTo(x, y + k * b); c.lineTo(x, y); c.lineTo(x + k * a, y); c.stroke(); });
        c.font = mono(Math.max(8, 11 * sc)); c.fillStyle = "rgba(233,246,255,.75)"; c.textAlign = "left"; c.textBaseline = "top";
        c.fillText("DR. GLASS · MIRROR MODE", p + 8, p + 8); c.textAlign = "right"; c.fillText("SCAN Y " + String(Math.round(clamp(by / h, 0, 1) * 100)).padStart(3, "0") + "%", w - p - 8, p + 8);
        c.textBaseline = "bottom"; c.fillStyle = "#ff5a5f"; c.fillText("♥ " + (72 + Math.round(Math.sin(t * .5) * 4)) + " BPM", w - p - 8, h - p - 8);
      }
    };
  };

  /* ---------------- 04 DEFUSE ---------------- */
  R.defuse = () => {
    const cols = ["#ff3b30", "#ffd60a", "#4da3ff", "#34c759", "#e6e6e1"];
    let cut = [0, 0, 0, 0, 0], sparks = [], lastLoop = -1, geo = [], sc = 1;
    return {
      init(w, h) { sc = clamp(h / 700, .35, 1.3); },
      draw(c, w, h, t, m, dt) {
        c.fillStyle = "#0e0f0a"; c.fillRect(0, 0, w, h);
        const loop = Math.floor(t / 45); if (loop !== lastLoop) { lastLoop = loop; cut = [0, 0, 0, 0, 0]; }
        const remain = 45 - (t % 45);
        const sh = 16 * sc + 6;
        [0, h - sh].forEach(y0 => { c.save(); c.beginPath(); c.rect(0, y0, w, sh); c.clip(); c.fillStyle = "#ffd60a"; c.fillRect(0, y0, w, sh); c.fillStyle = "#0e0f0a"; const st = sh * 1.2, o = (t * 30) % (st * 2); for (let x = -st * 2 - o; x < w + st * 2; x += st * 2) { c.beginPath(); c.moveTo(x, y0 + sh); c.lineTo(x + st, y0); c.lineTo(x + st * 2, y0); c.lineTo(x + st, y0 + sh); c.closePath(); c.fill(); } c.restore(); });
        const bw = Math.min(w * .78, 640 * sc + 120), bh = bw * .56, bx = (w - bw) / 2, by = (h - bh) / 2 + 4;
        c.fillStyle = "#17180f"; rr(c, bx, by, bw, bh, 14 * sc); c.fill(); c.strokeStyle = "#3b3d2e"; c.lineWidth = 2; c.stroke();
        c.fillStyle = "#2b2c22"; [[bx + 14, by + 14], [bx + bw - 14, by + 14], [bx + 14, by + bh - 14], [bx + bw - 14, by + bh - 14]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 5 * sc + 2, 0, TAU); c.fill(); });
        const tx = bx + bw * .5, ty = by + bh * .24, blink = remain < 10 && (t * 4 | 0) % 2;
        c.fillStyle = "#050505"; rr(c, tx - bw * .26, ty - bh * .14, bw * .52, bh * .28, 8); c.fill();
        const secs = Math.floor(remain), cs = Math.floor((remain % 1) * 100);
        c.font = mono(bh * .19, 700); c.textAlign = "center"; c.textBaseline = "middle";
        c.fillStyle = "rgba(255,59,48,.12)"; c.fillText("88:88", tx, ty + 2);
        if (!blink) { c.shadowColor = "#ff3b30"; c.shadowBlur = 18; c.fillStyle = "#ff3b30"; c.fillText(`${String(secs).padStart(2, "0")}:${String(cs).padStart(2, "0")}`, tx, ty + 2); c.shadowBlur = 0; }
        const led = (t % 1) < .5; c.fillStyle = led ? "#ff3b30" : "#3a1010"; c.shadowColor = "#ff3b30"; c.shadowBlur = led ? 16 : 0; c.beginPath(); c.arc(bx + bw - 34 * sc - 10, by + 30 * sc + 8, 6 * sc + 2, 0, TAU); c.fill(); c.shadowBlur = 0;
        const x0 = bx + bw * .1, x1 = bx + bw * .9; geo = [];
        let nearest = -1, nd = 1e9;
        for (let i = 0; i < 5; i++) {
          const y = by + bh * (.5 + i * .095), sway = Math.sin(t * 1.4 + i) * 10 * sc;
          const pts = []; for (let k = 0; k <= 24; k++) { const u = k / 24; const x = lerp(x0, x1, u); const yy = y + Math.sin(u * Math.PI) * (16 * sc + sway) * (i % 2 ? -1 : 1); pts.push([x, yy]); }
          geo.push(pts);
          if (m && !cut[i]) for (const [px, py] of pts) { const d = Math.hypot(px - m.x, py - m.y); if (d < nd) { nd = d; nearest = i; } }
        }
        if (nd > 30 * sc + 14) nearest = -1;
        for (let i = 0; i < 5; i++) {
          const pts = geo[i];
          c.lineCap = "round"; c.strokeStyle = cols[i]; c.lineWidth = (i === nearest ? 7 : 4.5) * sc + 1; c.shadowColor = cols[i]; c.shadowBlur = i === nearest ? 18 : 4;
          if (!cut[i]) { c.beginPath(); pts.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
          else { c.beginPath(); for (let k = 0; k <= 10; k++) k ? c.lineTo(...pts[k]) : c.moveTo(...pts[k]); c.stroke(); c.beginPath(); for (let k = 14; k <= 24; k++) k > 14 ? c.lineTo(...pts[k]) : c.moveTo(...pts[k]); c.stroke(); if (Math.random() < .08) for (let s = 0; s < 3; s++) sparks.push({ x: pts[10][0], y: pts[10][1], vx: rnd(-80, 80), vy: rnd(-120, 20), l: .5 }); }
          c.shadowBlur = 0; c.fillStyle = "#3b3d2e"; c.fillRect(x0 - 12 * sc, pts[0][1] - 6 * sc, 10 * sc, 12 * sc); c.fillRect(x1 + 2 * sc, pts[24][1] - 6 * sc, 10 * sc, 12 * sc);
          c.fillStyle = "rgba(230,230,225,.55)"; c.font = mono(Math.max(7, 10 * sc)); c.textAlign = "right"; c.fillText("W" + (i + 1), x0 - 16 * sc, pts[0][1]);
        }
        for (const s of sparks) { s.vy += 300 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.l -= dt; c.fillStyle = `rgba(255,${180 + (Math.random() * 70 | 0)},80,${clamp(s.l * 2, 0, 1)})`; c.fillRect(s.x, s.y, 2.5, 2.5); }
        sparks = sparks.filter(s => s.l > 0);
        c.font = mono(Math.max(8, 11 * sc)); c.fillStyle = "rgba(230,230,225,.7)"; c.textAlign = "left"; c.textBaseline = "middle";
        c.fillText("NULL UNIT · LAYER: WIRE", bx + 16 * sc + 6, by + bh - 16 * sc - 6);
        c.textAlign = "right"; c.fillStyle = "#ffd60a"; c.fillText("WIRES CUT " + cut.filter(Boolean).length + "/5", bx + bw - 16 * sc - 6, by + bh - 16 * sc - 6);
      },
      click(x, y) { let best = -1, bd = 1e9; geo.forEach((pts, i) => pts.forEach(([px, py]) => { const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = i; } })); if (best >= 0 && bd < 60 && !cut[best]) { cut[best] = 1; const p = geo[best][12]; for (let s = 0; s < 30; s++) sparks.push({ x: p[0], y: p[1], vx: rnd(-220, 220), vy: rnd(-260, 60), l: rnd(.4, 1) }); return "cut"; } }
    };
  };

  /* ---------------- 05 TIME ---------------- */
  R.time = () => {
    let sc = 1, specks = [], split = .5;
    function gear(c, x, y, r, n, a) { c.beginPath(); for (let i = 0; i <= n * 2; i++) { const ang = a + i * Math.PI / n; const rr2 = i % 2 ? r * .84 : r; c.lineTo(x + Math.cos(ang) * rr2, y + Math.sin(ang) * rr2); } c.closePath(); c.stroke(); c.beginPath(); c.arc(x, y, r * .3, 0, TAU); c.stroke(); }
    return {
      init(w, h) { sc = clamp(h / 700, .35, 1.3); specks = []; for (let i = 0; i < 80; i++) specks.push([rnd(0, w), rnd(0, h), rnd(.5, 1.6)]); },
      draw(c, w, h, t, m, dt) {
        const target = m ? m.x / w : .5 + .28 * Math.sin(t * .35); split += (target - split) * Math.min(1, dt * 4); const sx = split * w;
        c.save(); c.beginPath(); c.rect(0, 0, sx, h); c.clip();
        const g1 = c.createRadialGradient(w * .3, h * .45, 10, w * .3, h * .45, Math.max(w, h) * .7); g1.addColorStop(0, "#3a2817"); g1.addColorStop(1, "#140c06"); c.fillStyle = g1; c.fillRect(0, 0, w, h);
        c.strokeStyle = "rgba(217,179,140,.45)"; c.lineWidth = 1.5 * sc + .5;
        const R0 = Math.min(w, h) * .2; gear(c, w * .18, h * .7, R0 * .9, 14, t * .4); gear(c, w * .18 + R0 * 1.62, h * .7 - R0 * .5, R0 * .6, 10, -t * .6 + .2); gear(c, w * .42, h * .2, R0 * .5, 9, t * .7);
        const cx = w * .3, cy = h * .4, cr = Math.min(w, h) * .2;
        c.strokeStyle = "rgba(217,179,140,.85)"; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, cr, 0, TAU); c.stroke(); c.beginPath(); c.arc(cx, cy, cr * .92, 0, TAU); c.stroke();
        c.fillStyle = "rgba(217,179,140,.85)"; c.font = `${Math.round(cr * .16)}px Georgia, serif`; c.textAlign = "center"; c.textBaseline = "middle";
        ["XII", "III", "VI", "IX"].forEach((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; c.fillText(n, cx + Math.cos(a) * cr * .74, cy + Math.sin(a) * cr * .74); });
        for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; const l = i % 5 ? .95 : .88; c.beginPath(); c.moveTo(cx + Math.cos(a) * cr * l, cy + Math.sin(a) * cr * l); c.lineTo(cx + Math.cos(a) * cr * .92, cy + Math.sin(a) * cr * .92); c.stroke(); }
        const hand = (a, l, wd) => { c.lineWidth = wd; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); c.stroke(); };
        hand(-Math.PI / 2 + t * .05, cr * .5, 4); hand(-Math.PI / 2 + t * .6, cr * .75, 2.5); c.strokeStyle = "#c0392b"; hand(-Math.PI / 2 + t * 6.283 / 6, cr * .82, 1);
        c.fillStyle = "rgba(255,230,190,.25)"; specks.forEach(([x, y, r]) => { if (Math.random() < .5) c.fillRect((x + t * 7) % w, y, r, r); });
        c.font = disp(Math.min(w, h) * .2, 900); c.fillStyle = "rgba(217,179,140,.12)"; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillText("1925", 16, h - 20);
        c.restore();
        c.save(); c.beginPath(); c.rect(sx, 0, w - sx, h); c.clip();
        const g2 = c.createLinearGradient(0, 0, 0, h); g2.addColorStop(0, "#0a0420"); g2.addColorStop(.58, "#22104a"); g2.addColorStop(1, "#05020f"); c.fillStyle = g2; c.fillRect(0, 0, w, h);
        const hz = h * .58, vx = w * .7;
        const sun = c.createLinearGradient(0, hz - h * .3, 0, hz); sun.addColorStop(0, "#00ffd5"); sun.addColorStop(1, "#b388ff"); c.fillStyle = sun; c.globalAlpha = .55;
        c.beginPath(); c.arc(vx, hz, h * .22, Math.PI, 0); c.fill(); c.globalAlpha = 1; c.fillStyle = "#0a0420"; for (let i = 0; i < 6; i++) c.fillRect(vx - h * .23, hz - i * h * .035 - 6, h * .46, 2 + i * .6);
        c.strokeStyle = "rgba(179,136,255,.6)"; c.lineWidth = 1;
        for (let i = -14; i <= 14; i++) { c.beginPath(); c.moveTo(vx, hz); c.lineTo(vx + i * w * .12, h); c.stroke(); }
        for (let i = 0; i < 14; i++) { const k = ((i + (t * .6) % 1) / 14); const y = hz + (h - hz) * k * k; c.globalAlpha = k; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.globalAlpha = 1;
        c.strokeStyle = "rgba(0,255,213,.7)"; c.lineWidth = 2 * sc + .5;
        for (let v = 0; v < 6; v++) { const bx2 = w * (.52 + v * .09); c.beginPath(); for (let y = h; y > h * (.25 + (v % 3) * .12); y -= 6) { const x = bx2 + Math.sin(y * .03 + t + v) * 14 * sc; y === h ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); }
        c.strokeStyle = "rgba(180,220,255,.25)"; c.lineWidth = 1; for (let i = 0; i < 70; i++) { const x = ((i * 97 + t * 260) % (w + 100)) - 50, y = ((i * 151 + t * 520) % h); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 6, y + 16 * sc); c.stroke(); }
        c.font = disp(Math.min(w, h) * .2, 900); c.fillStyle = "rgba(0,255,213,.12)"; c.textAlign = "right"; c.fillText("2125", w - 16, h - 20);
        c.restore();
        const gl = c.createLinearGradient(sx - 30, 0, sx + 30, 0); gl.addColorStop(0, "rgba(217,179,140,0)"); gl.addColorStop(.5, "rgba(255,255,255,.35)"); gl.addColorStop(1, "rgba(0,255,213,0)"); c.fillStyle = gl; c.fillRect(sx - 30, 0, 60, h);
        c.fillStyle = "#fff"; c.fillRect(sx - 1, 0, 2, h);
        const ly = h * .5, lr = 26 * sc + 8; c.strokeStyle = "#fff"; c.lineWidth = 2; c.beginPath(); c.arc(sx, ly, lr, 0, TAU); c.stroke(); c.beginPath(); c.arc(sx, ly, lr * .7, 0, TAU); c.stroke();
        c.font = mono(Math.max(8, 11 * sc), 600); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("◄ TILT ►", sx, ly + lr + 16 * sc);
      }
    };
  };

  /* ---------------- 06 OUT OF BODY (CCTV) ---------------- */
  R.body = () => {
    let fx = .5, gx = .5, cam = 2, cut = 0, next = 3.5, sc = 1;
    function fig(c, x, y, s, col, a) {
      c.globalAlpha = a; c.strokeStyle = col; c.fillStyle = col; c.lineCap = "round"; c.lineWidth = 16 * s;
      c.beginPath(); c.arc(x, y - 150 * s, 22 * s, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(x, y - 118 * s); c.lineTo(x, y - 40 * s); c.stroke();
      c.lineWidth = 11 * s; c.beginPath(); c.moveTo(x, y - 108 * s); c.lineTo(x - 36 * s, y - 64 * s); c.lineTo(x - 30 * s, y - 30 * s); c.moveTo(x, y - 108 * s); c.lineTo(x + 40 * s, y - 80 * s); c.lineTo(x + 66 * s, y - 92 * s); c.stroke();
      c.lineWidth = 13 * s; c.beginPath(); c.moveTo(x, y - 40 * s); c.lineTo(x - 20 * s, y + 30 * s); c.moveTo(x, y - 40 * s); c.lineTo(x + 22 * s, y + 30 * s); c.stroke();
      c.globalAlpha = 1;
    }
    return {
      init(w, h) { sc = clamp(h / 700, .3, 1.3); },
      draw(c, w, h, t, m, dt) {
        c.fillStyle = "#0b0b0b"; c.fillRect(0, 0, w, h);
        const hz = h * .42; c.strokeStyle = "rgba(242,242,242,.07)"; c.lineWidth = 1;
        for (let i = -10; i <= 10; i++) { c.beginPath(); c.moveTo(w / 2 + i * 20, hz); c.lineTo(w / 2 + i * w * .16, h); c.stroke(); }
        for (let i = 1; i < 9; i++) { const y = hz + (h - hz) * Math.pow(i / 9, 1.8); c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
        next -= dt; if (next < 0) { cut = .16; cam = cam % 3 + 1; next = rnd(3, 5); }
        const tgt = m ? m.x / w : .5 + .3 * Math.sin(t * .5); fx += (tgt - fx) * Math.min(1, dt * 2.2); gx += (tgt - gx) * Math.min(1, dt * .7);
        const mir = cam === 2; const X = v => (mir ? 1 - v : v) * w; const s = h / 520;
        const fy = h * .78;
        fig(c, X(gx) + 10 * s, fy, s * (cam === 3 ? .8 : 1), "#ff453a", .45);
        fig(c, X(fx), fy, s * (cam === 3 ? .8 : 1), "#f2f2f2", .9);
        const bxw = 90 * s, bxh = 230 * s, bx = X(fx) - bxw, byy = fy - 190 * s; c.strokeStyle = "#ffd60a"; c.lineWidth = 1.5; const q = 14 * s;
        [[bx, byy, 1, 1], [bx + bxw * 2, byy, -1, 1], [bx, byy + bxh, 1, -1], [bx + bxw * 2, byy + bxh, -1, -1]].forEach(([x, y, a, b]) => { c.beginPath(); c.moveTo(x, y + q * b); c.lineTo(x, y); c.lineTo(x + q * a, y); c.stroke(); });
        c.font = mono(Math.max(8, 11 * sc), 600); c.fillStyle = "#ffd60a"; c.textAlign = "left"; c.textBaseline = "bottom"; c.fillText("SUBJECT 07 · TRACKING", bx, byy - 6);
        c.fillStyle = "rgba(242,242,242,.06)"; for (let i = 0; i < 160; i++) c.fillRect(Math.random() * w, Math.random() * h, 2, 2);
        c.fillStyle = "rgba(0,0,0,.28)"; for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
        if (cut > 0) { cut -= dt; for (let i = 0; i < 900; i++) { const g = Math.random() * 255 | 0; c.fillStyle = `rgb(${g},${g},${g})`; c.fillRect(Math.random() * w, Math.random() * h, rnd(2, 8), 2); } c.fillStyle = "#fff"; c.font = mono(Math.max(10, 16 * sc), 700); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("SWITCHING CAMERA…", w / 2, h / 2); }
        const p = 16; c.textBaseline = "top"; c.font = mono(Math.max(9, 13 * sc), 600);
        if ((t * 1.4 | 0) % 2) { c.fillStyle = "#ff453a"; c.beginPath(); c.arc(p + 8, p + 9 * sc + 2, 6 * sc + 2, 0, TAU); c.fill(); }
        c.fillStyle = "#f2f2f2"; c.textAlign = "left"; c.fillText("REC", p + 22 * sc + 6, p + 2);
        c.textAlign = "right"; c.fillText("CAM 0" + cam + (mir ? " · MIRROR" : ""), w - p, p + 2);
        const tt = 72000 + t; const hh = String(Math.floor(tt / 3600) % 24).padStart(2, "0"), mm = String(Math.floor(tt / 60) % 60).padStart(2, "0"), ss = String(Math.floor(tt) % 60).padStart(2, "0");
        c.textBaseline = "bottom"; c.textAlign = "left"; c.fillText(`2026-11-05  ${hh}:${mm}:${ss}`, p, h - p);
        c.textAlign = "right"; c.fillText("HALDEN INSTITUTE", w - p, h - p);
        c.strokeStyle = "rgba(242,242,242,.6)"; c.lineWidth = 2; const k = 26 * sc + 6;
        [[p, p + 30 * sc + 10, 1, 1], [w - p, p + 30 * sc + 10, -1, 1], [p, h - p - 30 * sc - 10, 1, -1], [w - p, h - p - 30 * sc - 10, -1, -1]].forEach(([x, y, a, b]) => { c.beginPath(); c.moveTo(x, y + k * b); c.lineTo(x, y); c.lineTo(x + k * a, y); c.stroke(); });
      },
      click() { cut = .25; cam = cam % 3 + 1; next = rnd(3, 5); return "cut"; }
    };
  };

  /* ---------------- 07 BLOCK PARTY ---------------- */
  R.block = () => {
    let plats = [], hero = null, stars = [], parts = [], bgst = [], S = 20, W = 0, H = 0, got = 0;
    function placeStar() { const p = plats[(Math.random() * plats.length) | 0]; if (!p) return; stars.push({ x: p.x + p.w / 2, y: p.y - S * rnd(1.6, 3), ph: Math.random() * TAU }); }
    function build(w, h) {
      W = w; H = h; S = Math.max(10, Math.round(Math.min(h / 12, w / 18))); plats = []; stars = []; parts = []; got = 0;
      let x = 0, row = Math.floor(h / S) - 2;
      while (x < w + S * 4) { const len = 2 + ((Math.random() * 3) | 0); plats.push({ x, y: row * S, w: len * S, b: -1, user: 0, id: (Math.random() * 512) | 0 }); x += len * S + S * (1 + ((Math.random() * 2) | 0)); row = clamp(row + ((Math.random() * 3) | 0) - 1, 4, Math.floor(h / S) - 2); }
      hero = { x: S * .5, y: plats[0].y - S * 3, vy: 0, on: false };
      for (let i = 0; i < 3; i++) placeStar();
      bgst = []; for (let i = 0; i < 60; i++) bgst.push([rnd(0, w), rnd(0, h * .7), Math.random() * TAU]);
    }
    function block(c, p, t) {
      const pop = p.b >= 0 ? clamp((t - p.b) * 5, 0, 1) : 1; const sc2 = .6 + .4 * (1 - Math.pow(1 - pop, 3));
      for (let k = 0; k < p.w / S; k++) {
        const bx = p.x + k * S, cx = bx + S / 2, cy = p.y + S / 2, s2 = S * sc2;
        c.fillStyle = "#f6f1ff"; c.fillRect(cx - s2 / 2, cy - s2 / 2, s2, s2);
        c.fillStyle = "#1b1340"; const u = s2 / 7; c.fillRect(cx - s2 / 2 + u * .5, cy - s2 / 2 + u * .5, s2 - u, s2 - u);
        c.fillStyle = "#f6f1ff"; const bits = (p.id * 31 + k * 17) & 511;
        for (let i = 0; i < 9; i++) if (bits >> i & 1) c.fillRect(cx - u * 1.5 + (i % 3) * u, cy - u * 1.5 + ((i / 3) | 0) * u, u, u);
        c.fillStyle = "#7cff6b"; c.fillRect(cx - s2 / 2, cy - s2 / 2, s2, Math.max(2, u * .7));
      }
    }
    return {
      init: build,
      draw(c, w, h, t, m, dt) {
        const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#130d33"); g.addColorStop(1, "#2d1b69"); c.fillStyle = g; c.fillRect(0, 0, w, h);
        for (const [x, y, p] of bgst) { const a = .3 + .7 * Math.max(0, Math.sin(t * 2 + p)); c.fillStyle = `rgba(255,255,255,${a * .7})`; const z = Math.max(1, S / 10); c.fillRect(x, y, z, z); }
        c.fillStyle = "#ffcc33"; c.beginPath(); c.arc(w * .85, h * .16, S * 1.4, 0, TAU); c.fill(); c.fillStyle = "#130d33"; c.beginPath(); c.arc(w * .85 + S * .6, h * .16 - S * .3, S * 1.2, 0, TAU); c.fill();
        plats.forEach(p => block(c, p, t));
        const hw = S * .7, hh = S * .9, vx = S * 4.2, gr = S * 42;
        const prevY = hero.y; hero.vy += gr * dt; hero.y += hero.vy * dt; hero.x += vx * dt; hero.on = false;
        for (const p of plats) if (hero.x + hw > p.x && hero.x < p.x + p.w && prevY + hh <= p.y + 1 && hero.y + hh >= p.y) { hero.y = p.y - hh; hero.vy = 0; hero.on = true; }
        if (hero.on) { const fx = hero.x + hw + S * .35; const ahead = plats.some(p => fx > p.x && fx < p.x + p.w && Math.abs(p.y - (hero.y + hh)) < 2); if (!ahead) hero.vy = -S * 15.5; }
        if (hero.y > H + S * 3 || hero.x > W + S) { hero.x = S * .5; hero.y = (plats[0] ? plats[0].y : H / 2) - S * 3; hero.vy = 0; }
        const hx = hero.x, hy = hero.y, legs = hero.on ? Math.sin(t * 22) * S * .12 : 0;
        c.fillStyle = "#ff6fa8"; c.fillRect(hx, hy, hw, hh * .8);
        c.fillStyle = "#c2407a"; c.fillRect(hx + hw * .1, hy + hh * .8, hw * .3, hh * .2 + legs); c.fillRect(hx + hw * .6, hy + hh * .8, hw * .3, hh * .2 - legs);
        c.fillStyle = "#fff"; c.fillRect(hx + hw * .5, hy + hh * .2, hw * .22, hh * .22); c.fillRect(hx + hw * .78, hy + hh * .2, hw * .16, hh * .22);
        c.fillStyle = "#1b1340"; c.fillRect(hx + hw * .6, hy + hh * .27, hw * .1, hh * .12); c.fillRect(hx + hw * .84, hy + hh * .27, hw * .08, hh * .12);
        for (const s of stars) {
          const sy = s.y + Math.sin(t * 3 + s.ph) * S * .2, r = S * .45; c.save(); c.translate(s.x, sy); c.rotate(t * 1.5 + s.ph); c.fillStyle = "#ffcc33"; c.shadowColor = "#ffcc33"; c.shadowBlur = 12;
          c.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, rad = i % 2 ? r * .45 : r; c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } c.closePath(); c.fill(); c.restore();
          if (Math.abs(hx + hw / 2 - s.x) < S * .8 && Math.abs(hy + hh / 2 - sy) < S * .9) { s.dead = 1; got++; for (let i = 0; i < 16; i++) parts.push({ x: s.x, y: sy, vx: rnd(-1, 1) * S * 6, vy: rnd(-1, .3) * S * 6, l: .7, c: "#ffcc33" }); }
        }
        c.shadowBlur = 0; if (stars.some(s => s.dead)) { stars = stars.filter(s => !s.dead); setTimeout(placeStar, 900); }
        for (const p of parts) { p.vy += gr * .4 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt; c.fillStyle = p.c; c.globalAlpha = clamp(p.l * 1.6, 0, 1); const z = Math.max(2, S / 7); c.fillRect(p.x, p.y, z, z); }
        c.globalAlpha = 1; parts = parts.filter(p => p.l > 0);
        c.font = mono(Math.max(9, S * .55), 700); c.fillStyle = "#ffcc33"; c.textAlign = "left"; c.textBaseline = "top"; c.fillText("★ " + (got % 4) + "/3", S * .6, S * .6);
        if (m && m.active) { const gx2 = Math.floor(m.x / S) * S, gy2 = Math.floor(m.y / S) * S; c.strokeStyle = "rgba(124,255,107,.8)"; c.setLineDash([4, 4]); c.strokeRect(gx2 - S, gy2, S * 3, S); c.setLineDash([]); }
      },
      click(x, y, t) { const p = { x: Math.floor(x / S) * S - S, y: Math.floor(y / S) * S, w: S * 3, b: t, user: 1, id: (Math.random() * 512) | 0 }; plats.push(p); const users = plats.filter(q => q.user); if (users.length > 8) plats.splice(plats.indexOf(users[0]), 1); for (let i = 0; i < 14; i++) parts.push({ x: x, y: p.y, vx: rnd(-1, 1) * S * 5, vy: rnd(-1, 0) * S * 5, l: .6, c: "#7cff6b" }); return "place"; }
    };
  };

  /* ---------------- 08 LIVE WIRE ---------------- */
  R.wire = () => {
    let nodes = [], pairs = [], swap = 0, sparks = [], bgs = [], chain = 0, sc = 1;
    function bolt(c, a, b, col, wd) {
      const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(6, d / 22 | 0), nx = -(b.y - a.y) / (d || 1), ny = (b.x - a.x) / (d || 1);
      const pts = [[a.x, a.y]]; for (let i = 1; i < n; i++) { const k = i / n, o = rnd(-1, 1) * d * .07 * Math.sin(k * Math.PI); pts.push([lerp(a.x, b.x, k) + nx * o, lerp(a.y, b.y, k) + ny * o]); } pts.push([b.x, b.y]);
      c.strokeStyle = col; c.globalAlpha = .25; c.lineWidth = wd * 4; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke();
      c.globalAlpha = 1; c.lineWidth = wd; c.strokeStyle = "#fff"; c.stroke(); c.strokeStyle = col; c.lineWidth = wd * .6; c.stroke();
    }
    return {
      init(w, h) { sc = clamp(h / 700, .35, 1.3); nodes = []; const R0 = Math.min(w, h) * .32; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; nodes.push({ bx: w / 2 + Math.cos(a) * R0 * 1.25, by: h * .5 + Math.sin(a) * R0, ph: Math.random() * TAU, x: 0, y: 0, glow: 0 }); } bgs = []; for (let i = 0; i < 90; i++) bgs.push([rnd(0, w), rnd(0, h), rnd(.3, 1.2)]); },
      draw(c, w, h, t, m, dt) {
        c.fillStyle = "#070a12"; c.fillRect(0, 0, w, h);
        for (const [x, y, r] of bgs) { c.fillStyle = `rgba(232,236,255,${.15 + .2 * Math.sin(t + x)})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
        nodes.forEach(n => { n.x = n.bx + Math.sin(t * .6 + n.ph) * 14 * sc; n.y = n.by + Math.cos(t * .5 + n.ph) * 10 * sc; n.glow = Math.max(0, n.glow - dt * 2); });
        swap -= dt; if (swap < 0) { swap = 1.4; pairs = []; const k = 2 + ((Math.random() * 2) | 0); while (pairs.length < k) { const a = (Math.random() * 5) | 0, b = (a + 1 + ((Math.random() * 2) | 0)) % 5; if (!pairs.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a))) pairs.push([a, b]); } }
        const act = chain > 0 ? [[0, 1], [1, 2], [2, 3], [3, 4]] : pairs; chain = Math.max(0, chain - dt);
        act.forEach(([a, b], i) => { bolt(c, nodes[a], nodes[b], i % 2 ? "#4dd2ff" : "#ffe14d", 2 * sc + .8); nodes[a].glow = nodes[b].glow = 1; });
        if (m) { let best = null, bd = 1e9; nodes.forEach(n => { const d = Math.hypot(n.x - m.x, n.y - m.y); if (d < bd) { bd = d; best = n; } }); if (best && bd < Math.min(w, h) * .4) { bolt(c, m, best, "#ff5ec4", 1.6 * sc + .6); best.glow = 1; } c.fillStyle = "#ff5ec4"; c.beginPath(); c.arc(m.x, m.y, 5 * sc + 2, 0, TAU); c.fill(); }
        nodes.forEach((n, i) => {
          const r = (18 + n.glow * 8) * sc + 6; const g = c.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.4); g.addColorStop(0, `rgba(255,225,77,${.35 + n.glow * .4})`); g.addColorStop(1, "rgba(255,225,77,0)");
          c.fillStyle = g; c.beginPath(); c.arc(n.x, n.y, r * 2.4, 0, TAU); c.fill();
          c.fillStyle = "#0b1020"; c.strokeStyle = n.glow > .1 ? "#ffe14d" : "rgba(232,236,255,.5)"; c.lineWidth = 2; c.beginPath(); c.arc(n.x, n.y, r, 0, TAU); c.fill(); c.stroke();
          c.fillStyle = "#e8ecff"; c.font = mono(Math.max(8, 12 * sc), 700); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("P" + (i + 1), n.x, n.y);
        });
        const cs = 10 * sc + 4, gx = w - cs * 5 - 20, gy = 20; c.font = mono(Math.max(7, 9 * sc)); c.fillStyle = "rgba(232,236,255,.6)"; c.textAlign = "right"; c.textBaseline = "top"; c.fillText("CONTACT MATRIX", gx + cs * 5, gy - 2);
        for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const on = act.some(([a, b]) => (a === i && b === j) || (a === j && b === i)); c.fillStyle = i === j ? "rgba(232,236,255,.06)" : on ? "#ffe14d" : "rgba(232,236,255,.12)"; c.fillRect(gx + j * cs, gy + 14 * sc + 6 + i * cs, cs - 2, cs - 2); }
        for (const s of sparks) { s.vy += 200 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.l -= dt; c.fillStyle = `rgba(255,240,150,${clamp(s.l * 2, 0, 1)})`; c.fillRect(s.x, s.y, 2, 2); }
        sparks = sparks.filter(s => s.l > 0);
      },
      click(x, y) { chain = 1.4; for (let i = 0; i < 40; i++) sparks.push({ x, y, vx: rnd(-240, 240), vy: rnd(-240, 120), l: rnd(.3, 1) }); return "zap"; }
    };
  };

  /* ---------------- 09 HOUSE ---------------- */
  R.house = () => {
    let dark = null, dc = null, flick = 1, nextB = 5, black = 0, dust = [], lx = 0, ly = 0, eyes = null, sc = 1;
    return {
      init(w, h) { sc = clamp(h / 700, .35, 1.3); dark = document.createElement("canvas"); dark.width = Math.max(1, w | 0); dark.height = Math.max(1, h | 0); dc = dark.getContext("2d"); dust = []; for (let i = 0; i < 70; i++) dust.push({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-6, 6), vy: rnd(-4, 4), r: rnd(.5, 1.6) }); lx = w / 2; ly = h / 2; },
      draw(c, w, h, t, m, dt) {
        c.fillStyle = "#16110c"; c.fillRect(0, 0, w, h);
        c.strokeStyle = "rgba(232,220,192,.09)"; c.lineWidth = 1; const ds = 44 * sc + 16;
        for (let x = 0; x < w + ds; x += ds) for (let y = 0; y < h + ds; y += ds) { c.beginPath(); c.moveTo(x, y - ds * .35); c.lineTo(x + ds * .25, y); c.lineTo(x, y + ds * .35); c.lineTo(x - ds * .25, y); c.closePath(); c.stroke(); }
        c.fillStyle = "#0e0a07"; c.fillRect(0, h * .82, w, h * .18); c.strokeStyle = "rgba(232,220,192,.2)"; c.beginPath(); c.moveTo(0, h * .82); c.lineTo(w, h * .82); c.stroke();
        c.strokeStyle = "rgba(232,220,192,.3)"; c.lineWidth = 3; c.strokeRect(w * .74, h * .3, w * .16, h * .52); c.fillStyle = "rgba(232,220,192,.15)"; c.beginPath(); c.arc(w * .76, h * .58, 4, 0, TAU); c.fill();
        c.strokeRect(w * .12, h * .3, w * .14, h * .2);
        c.font = disp(Math.min(w * .09, h * .14), 900); c.fillStyle = "rgba(179,0,27,.75)"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("I CAN HEAR YOU", w * .45, h * .62);
        const bx = w * .45, byy = h * .2; c.strokeStyle = "rgba(232,220,192,.35)"; c.lineWidth = 1; c.beginPath(); c.moveTo(bx, 0); c.lineTo(bx, byy - 12 * sc); c.stroke();
        nextB -= dt; if (nextB < 0) { black = .45; nextB = rnd(5, 9); eyes = { x: rnd(w * .1, w * .9), y: rnd(h * .3, h * .75) }; }
        if (black > 0) { black -= dt; flick = 0; } else flick = .82 + .18 * Math.sin(t * 13) * Math.sin(t * 7.3) + (Math.random() < .03 ? -.5 : 0);
        const tx = m ? m.x : w * (.5 + .36 * Math.sin(t * .31)), ty = m ? m.y : h * (.55 + .25 * Math.sin(t * .47)); lx += (tx - lx) * Math.min(1, dt * 6); ly += (ty - ly) * Math.min(1, dt * 6);
        dc.globalCompositeOperation = "source-over"; dc.clearRect(0, 0, w, h); dc.fillStyle = "rgba(0,0,0,.95)"; dc.fillRect(0, 0, w, h); dc.globalCompositeOperation = "destination-out";
        const fr = Math.min(w, h) * .24; let g = dc.createRadialGradient(lx, ly, 0, lx, ly, fr); g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(.55, "rgba(0,0,0,.85)"); g.addColorStop(1, "rgba(0,0,0,0)"); dc.fillStyle = g; dc.beginPath(); dc.arc(lx, ly, fr, 0, TAU); dc.fill();
        if (flick > 0) { const br = Math.min(w, h) * .3 * flick; g = dc.createRadialGradient(bx, byy, 0, bx, byy, br); g.addColorStop(0, `rgba(0,0,0,${.9 * flick})`); g.addColorStop(1, "rgba(0,0,0,0)"); dc.fillStyle = g; dc.beginPath(); dc.arc(bx, byy, br, 0, TAU); dc.fill(); }
        c.drawImage(dark, 0, 0, w, h);
        if (flick > 0) { c.globalCompositeOperation = "lighter"; const bg = c.createRadialGradient(bx, byy, 0, bx, byy, 80 * sc + 20); bg.addColorStop(0, `rgba(255,217,160,${.9 * flick})`); bg.addColorStop(1, "rgba(255,217,160,0)"); c.fillStyle = bg; c.beginPath(); c.arc(bx, byy, 80 * sc + 20, 0, TAU); c.fill(); c.globalCompositeOperation = "source-over"; }
        c.fillStyle = flick > 0 ? "#ffd9a0" : "#2a2218"; c.beginPath(); c.ellipse(bx, byy, 9 * sc + 3, 12 * sc + 4, 0, 0, TAU); c.fill();
        for (const d of dust) { d.x += d.vx * dt; d.y += d.vy * dt; if (d.x < 0) d.x = w; if (d.x > w) d.x = 0; if (d.y < 0) d.y = h; if (d.y > h) d.y = 0; const dd = Math.hypot(d.x - lx, d.y - ly); const a = clamp(1 - dd / fr, 0, 1) * .8; if (a > 0) { c.fillStyle = `rgba(255,236,200,${a})`; c.beginPath(); c.arc(d.x, d.y, d.r, 0, TAU); c.fill(); } }
        if (black > 0 && eyes) { c.fillStyle = "#ff1a1a"; c.shadowColor = "#ff1a1a"; c.shadowBlur = 14; const e = 4 * sc + 2; c.beginPath(); c.arc(eyes.x - e * 3, eyes.y, e, 0, TAU); c.arc(eyes.x + e * 3, eyes.y, e, 0, TAU); c.fill(); c.shadowBlur = 0; }
        c.font = mono(Math.max(8, 11 * sc)); c.fillStyle = "rgba(255,217,160,.55)"; c.textAlign = "left"; c.textBaseline = "bottom"; c.fillText("HOME › listening" + ".".repeat((t * 2 | 0) % 4), 16, h - 14);
      },
      click() { black = .6; nextB = rnd(5, 9); eyes = null; return "black"; }
    };
  };

  /* ---------------- 10 SIXTH SENSE ---------------- */
  R.sense = () => {
    let mags = [], parts = [], blips = [], buf = [], ph = 0, bpm = 72, rings = [], ringT = 0, reveal = 0, sc = 1, lm = null, spd = 0;
    const ecg = p => { const g = (x, m, s) => Math.exp(-((x - m) * (x - m)) / (2 * s * s)); return .12 * g(p, .12, .025) - .18 * g(p, .235, .008) + 1 * g(p, .26, .01) - .3 * g(p, .285, .01) + .28 * g(p, .48, .04); };
    return {
      init(w, h) { sc = clamp(h / 700, .35, 1.3); mags = [[.28, .35], [.7, .3], [.55, .66]].map(([x, y]) => ({ x: x * w, y: y * h })); parts = []; for (let i = 0; i < 160; i++) parts.push({ x: rnd(0, w), y: rnd(0, h * .82), l: rnd(0, 3) }); buf = new Array(Math.max(10, Math.round(w / 3))).fill(0); },
      draw(c, w, h, t, m, dt) {
        const bgg = c.createRadialGradient(w / 2, h * .45, 10, w / 2, h * .45, Math.max(w, h) * .7); bgg.addColorStop(0, "#06231d"); bgg.addColorStop(1, "#02090b"); c.fillStyle = bgg; c.fillRect(0, 0, w, h);
        const cx = w / 2, cy = h * .44, R0 = Math.min(w, h * 1.1) * .4;
        c.strokeStyle = "rgba(61,255,181,.14)"; c.lineWidth = 1; for (let i = 1; i <= 4; i++) { c.beginPath(); c.arc(cx, cy, R0 * i / 4, 0, TAU); c.stroke(); }
        c.beginPath(); c.moveTo(cx - R0, cy); c.lineTo(cx + R0, cy); c.moveTo(cx, cy - R0); c.lineTo(cx, cy + R0); c.stroke();
        const sw = (t * 1.1) % TAU; for (let k = 0; k < 36; k++) { const a = sw - k * .022; c.strokeStyle = `rgba(61,255,181,${(1 - k / 36) * .32})`; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R0, cy + Math.sin(a) * R0); c.stroke(); }
        mags.forEach(mg => { let a = Math.atan2(mg.y - cy, mg.x - cx); if (a < 0) a += TAU; const d = ((sw - a) + TAU) % TAU; if (d < .05) blips.push({ x: mg.x, y: mg.y, l: 1.6 }); });
        for (const b of blips) { b.l -= dt * .7; const a = clamp(b.l, 0, 1); c.fillStyle = `rgba(61,255,181,${a})`; c.beginPath(); c.arc(b.x, b.y, 5 * sc + 2, 0, TAU); c.fill(); c.strokeStyle = `rgba(61,255,181,${a * .5})`; c.beginPath(); c.arc(b.x, b.y, (1.6 - b.l) * 30 * sc + 6, 0, TAU); c.stroke(); }
        blips = blips.filter(b => b.l > 0);
        c.lineWidth = 1.2;
        for (const p of parts) {
          let vx = 0, vy = 0; for (const mg of mags) { const dx = p.x - mg.x, dy = p.y - mg.y, d = Math.hypot(dx, dy) + 20; vx += (-dy / d) * 2600 / d + dx / d * 8; vy += (dx / d) * 2600 / d + dy / d * 8; }
          const sp = Math.hypot(vx, vy) || 1, k = Math.min(60, sp) * sc / sp; const ox = p.x, oy = p.y; p.x += vx * k * dt * 1.6; p.y += vy * k * dt * 1.6; p.l -= dt;
          if (p.l < 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h * .84) { p.x = rnd(0, w); p.y = rnd(0, h * .82); p.l = rnd(1, 3); continue; }
          c.strokeStyle = `rgba(61,255,181,${clamp(p.l, 0, 1) * .45})`; c.beginPath(); c.moveTo(ox, oy); c.lineTo(p.x, p.y); c.stroke();
        }
        if (reveal > 0) { reveal -= dt; mags.forEach(mg => { c.strokeStyle = `rgba(255,77,109,${clamp(reveal, 0, 1)})`; c.lineWidth = 2; c.beginPath(); c.arc(mg.x, mg.y, 16 * sc + 4, 0, TAU); c.stroke(); c.font = mono(Math.max(8, 10 * sc), 700); c.fillStyle = "#ff4d6d"; c.textAlign = "center"; c.fillText("ARTIFACT", mg.x, mg.y - 24 * sc - 6); }); }
        let near = 1e9; if (m) { mags.forEach(mg => { near = Math.min(near, Math.hypot(mg.x - m.x, mg.y - m.y)); }); if (lm) spd = lerp(spd, Math.hypot(m.x - lm.x, m.y - lm.y) / Math.max(dt, .001), .1); lm = { x: m.x, y: m.y }; }
        const field = m ? Math.round(25 + 420 / (1 + near / (30 * sc + 10))) : 25;
        ringT -= dt; if (m && ringT < 0) { rings.push({ x: m.x, y: m.y, r: 0, a: 1 }); ringT = clamp(.18 + near / (500 * sc), .18, 1.2); }
        for (const r of rings) { r.r += 120 * dt * (sc + .3); r.a -= dt * .9; c.strokeStyle = `rgba(199,255,240,${clamp(r.a, 0, 1) * .7})`; c.lineWidth = 1.5; c.beginPath(); c.arc(r.x, r.y, r.r, 0, TAU); c.stroke(); }
        rings = rings.filter(r => r.a > 0);
        if (m) { c.font = mono(Math.max(8, 11 * sc), 600); c.fillStyle = field > 120 ? "#ff4d6d" : "#c7fff0"; c.textAlign = "left"; c.textBaseline = "middle"; c.fillText(`FIELD ${field} µT`, m.x + 16, m.y - 12); const bars = clamp(Math.round(field / 60), 0, 8); for (let i = 0; i < 8; i++) { c.fillStyle = i < bars ? (field > 120 ? "#ff4d6d" : "#3dffb5") : "rgba(199,255,240,.15)"; c.fillRect(m.x + 16 + i * 7, m.y + 2, 5, 8); } }
        const tb = clamp(70 + spd * .03 + (m ? 300 / (1 + near / 20) : 0), 64, 132); bpm = lerp(bpm, tb, dt * .6);
        ph += dt * bpm / 60; const steps = Math.max(1, Math.round(dt * 120)); for (let i = 0; i < steps; i++) { buf.push(ecg((ph - (steps - 1 - i) * dt / steps * bpm / 60) % 1)); buf.shift(); }
        const eh = Math.min(70 * sc + 20, h * .14), ey = h - eh * .6 - 10; c.strokeStyle = "rgba(255,77,109,.18)"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, ey); c.lineTo(w, ey); c.stroke();
        c.strokeStyle = "#ff4d6d"; c.lineWidth = 2; c.shadowColor = "#ff4d6d"; c.shadowBlur = 10; c.beginPath(); buf.forEach((v, i) => { const x = i * w / (buf.length - 1), y = ey - v * eh * .7; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); c.shadowBlur = 0;
        c.font = disp(Math.max(14, 30 * sc), 800); c.fillStyle = "#ff4d6d"; c.textAlign = "left"; c.textBaseline = "bottom"; c.fillText(Math.round(bpm) + " BPM", 16, ey - eh * .75);
        c.font = mono(Math.max(8, 10 * sc)); c.fillStyle = "rgba(199,255,240,.7)"; c.textAlign = "right"; c.fillText("NERVE · GALAXY WATCH 4 · LIVE", w - 16, ey - eh * .75);
      },
      click() { reveal = 1.8; return "ping"; }
    };
  };

  /* ---------------- Stage manager ---------------- */
  const stages = new Set();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  class Stage {
    constructor(canvas, theme, opts = {}) {
      this.cv = canvas; this.c = canvas.getContext("2d"); this.theme = theme; this.r = R[theme](); this.t = rnd(0, 20); this.m = null; this.auto = !!opts.auto; this.maxDpr = opts.dpr || 1.5; this.visible = true; this.idx = opts.idx || 0; this.speed = 1;
      this.resize(); stages.add(this);
    }
    resize() { const w = this.cv.clientWidth || 300, h = this.cv.clientHeight || 200, d = Math.min(devicePixelRatio || 1, this.maxDpr); this.w = w; this.h = h; this.cv.width = Math.max(1, Math.round(w * d)); this.cv.height = Math.max(1, Math.round(h * d)); this.c.setTransform(d, 0, 0, d, 0, 0); this.r.init && this.r.init(w, h); }
    step(dt) {
      if (!this.visible) return; this.t += dt * this.speed;
      let m = this.m; if (!m && this.auto) { const k = this.idx * 1.7; m = { x: this.w * (.5 + .36 * Math.sin(this.t * .55 + k)), y: this.h * (.5 + .3 * Math.sin(this.t * .8 + k * 1.3)), active: false }; }
      try { this.r.draw(this.c, this.w, this.h, this.t, m, dt * this.speed); } catch (e) { console.error(this.theme, e); this.visible = false; }
    }
    click(x, y) { return this.r.click ? this.r.click(x, y, this.t) : null; }
    destroy() { stages.delete(this); }
  }
  let last = performance.now(), acc = 0;
  function frame(now) {
    let dt = Math.min(.05, (now - last) / 1000); last = now;
    if (reduce) { acc += dt; if (acc < .25) { requestAnimationFrame(frame); return; } dt = acc * .2; acc = 0; }
    stages.forEach(s => s.step(dt)); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------------- Audio ---------------- */
  const A = {
    ctx: null, out: null, on: true, amb: [], timers: [],
    ensure() { if (!this.ctx) { try { const C = window.AudioContext || window.webkitAudioContext; this.ctx = new C(); this.out = this.ctx.createGain(); this.out.gain.value = .55; const comp = this.ctx.createDynamicsCompressor(); this.out.connect(comp); comp.connect(this.ctx.destination); } catch (e) { this.ctx = null; } } if (this.ctx && this.ctx.state === "suspended") this.ctx.resume().catch(() => { }); return this.ctx; },
    ok() { return this.on && this.ctx && this.ctx.state === "running"; },
    tone(f, d, type = "sine", v = .2, w = 0, to = null, atk = .005) { if (!this.ok()) return; const c = this.ctx, t0 = c.currentTime + w, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + d); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + atk); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(g); g.connect(this.out); o.start(t0); o.stop(t0 + d + .05); },
    noise(d, v = .2, ft = "bandpass", f = 1000, q = 1, w = 0, fTo = null) { if (!this.ok()) return; const c = this.ctx, t0 = c.currentTime + w, n = Math.max(1, Math.floor(c.sampleRate * d)), b = c.createBuffer(1, n, c.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; const fl = c.createBiquadFilter(); fl.type = ft; fl.frequency.setValueAtTime(f, t0); if (fTo) fl.frequency.exponentialRampToValueAtTime(fTo, t0 + d); fl.Q.value = q; const g = c.createGain(); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + d); s.connect(fl); fl.connect(g); g.connect(this.out); s.start(t0); s.stop(t0 + d); },
    hover() { this.tone(1900, .045, "triangle", .035); },
    click() { this.tone(240, .09, "sine", .18, 0, 120); this.tone(1200, .03, "square", .03); },
    whoosh() { this.noise(.55, .22, "bandpass", 300, 1.2, 0, 4000); this.tone(90, .5, "sine", .12, 0, 40); },
    sting(th) {
      const T = this;
      ({
        hub() { [523, 659, 784].forEach((f, i) => T.tone(f, .5, "triangle", .07, i * .06)); },
        feed() { T.tone(1318, .12, "sine", .16); T.tone(1760, .18, "sine", .14, .1); T.tone(2637, .1, "triangle", .05, .2); },
        water() { T.tone(1400, .25, "sine", .2, 0, 260); T.noise(.3, .06, "lowpass", 900, .7, .05); T.tone(700, .4, "sine", .06, .18, 300); },
        xray() { T.tone(80, .9, "sawtooth", .05, 0, 160, .2); T.noise(.8, .05, "bandpass", 500, 4, 0, 3000); T.tone(1568, .12, "sine", .1, .7); },
        defuse() { [0, .35, .7].forEach(w => { T.noise(.03, .25, "highpass", 3000, 1, w); }); T.tone(2093, .15, "square", .05, 1.0); },
        time() { [880, 1320, 1760].forEach((f, i) => T.tone(f, 1.6, "sine", .09 / (i + 1), i * .02)); T.noise(.6, .04, "highpass", 2000, .5); },
        body() { T.noise(.25, .18, "highpass", 1500, .5); T.tone(60, .14, "sine", .4, .3, 40); T.tone(55, .16, "sine", .35, .55, 38); },
        block() { T.tone(392, .08, "square", .08); T.tone(523, .08, "square", .08, .08); T.tone(784, .16, "square", .08, .16); },
        wire() { T.noise(.18, .25, "bandpass", 2500, 6); T.tone(110, .25, "sawtooth", .08, 0, 55); T.noise(.08, .2, "highpass", 5000, 1, .2); },
        house() { T.tone(55, 2.2, "sine", .14, 0, 48, .6); T.tone(58.3, 2.2, "sine", .1, 0, 50, .6); T.noise(1.4, .05, "bandpass", 1800, 8, .4, 900); },
        sense() { T.tone(1046, 1.4, "sine", .16); T.tone(1046, 1.2, "sine", .06, .35); T.tone(1046, 1, "sine", .025, .7); }
      }[th] || (() => { }))();
    },
    act(kind) {
      const T = this; ({
        cut() { T.noise(.06, .3, "highpass", 2500); T.noise(.3, .12, "bandpass", 3000, 3, .03); },
        place() { T.tone(330, .07, "square", .07); T.tone(660, .1, "square", .06, .06); },
        zap() { T.noise(.25, .3, "bandpass", 2200, 5); T.tone(180, .2, "sawtooth", .1, 0, 60); },
        black() { T.tone(70, .5, "sine", .25, 0, 40); T.noise(.7, .06, "bandpass", 1200, 10, .1, 600); },
        ping() { T.tone(1318, .9, "sine", .16); T.tone(1318, .7, "sine", .05, .3); },
        drop() { T.tone(1200, .2, "sine", .16, 0, 300); },
        pop() { T.tone(880, .06, "triangle", .1); T.tone(1320, .08, "triangle", .08, .05); },
        scan() { T.tone(1568, .1, "sine", .1); T.tone(2093, .12, "sine", .08, .08); },
        tick() { T.noise(.03, .25, "highpass", 3000); }
      }[kind] || (() => { }))();
    },
    stopAmb() { this.amb.forEach(n => { try { n.g.gain.setTargetAtTime(0, this.ctx.currentTime, .3); n.src.forEach(s => s.stop(this.ctx.currentTime + 1.5)); } catch (e) { } }); this.amb = []; this.timers.forEach(clearInterval); this.timers = []; },
    ambient(th) {
      this.stopAmb(); if (!this.ok()) return; const c = this.ctx, T = this;
      const P = { hub: [[110, 164.8], "sine", 700], feed: [[220, 277], "triangle", 900], water: [[98, 147], "sine", 500], xray: [[60, 120], "sawtooth", 260], defuse: [[55], "square", 160], time: [[130.8, 196], "triangle", 800], body: [[50], "sawtooth", 140], block: [[196], "triangle", 600], wire: [[82, 82.6], "sawtooth", 380], house: [[41, 43.6], "sine", 220], sense: [[70, 105], "sine", 400] }[th];
      if (!P) return;
      const g = c.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(.05, c.currentTime, 1.2); const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = P[2]; lp.connect(g); g.connect(this.out);
      const srcs = P[0].map(f => { const o = c.createOscillator(); o.type = P[1]; o.frequency.value = f; const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .1 + Math.random() * .2; lg.gain.value = f * .01; lfo.connect(lg); lg.connect(o.frequency); o.connect(lp); o.start(); lfo.start(); return [o, lfo]; }).flat();
      this.amb.push({ g, src: srcs });
      const every = (ms, fn) => this.timers.push(setInterval(() => { if (T.ok()) fn(); }, ms));
      if (th === "defuse") every(1000, () => T.act("tick"));
      if (th === "sense") every(2600, () => T.tone(1046, .8, "sine", .035));
      if (th === "water") every(1700, () => T.tone(rnd(900, 1500), .18, "sine", .04, 0, 300));
      if (th === "feed") every(2300, () => T.tone([1318, 1568, 1760][(Math.random() * 3) | 0], .1, "sine", .04));
      if (th === "block") { const sc2 = [392, 440, 523, 587, 659, 784]; let i = 0; every(240, () => { if (i % 2 === 0) T.tone(sc2[(i * 7 + (i >> 3)) % 6], .12, "square", .02); i++; }); }
      if (th === "wire") every(900, () => Math.random() < .5 && T.noise(.05, .07, "bandpass", rnd(1500, 4000), 6));
      if (th === "house") every(4200, () => T.noise(1.2, .03, "bandpass", rnd(700, 1600), 9, 0, 500));
      if (th === "body") every(3800, () => T.noise(.12, .05, "highpass", 2000));
    }
  };

  window.FX = { Stage, stages, Audio: A, reduce };
})();
