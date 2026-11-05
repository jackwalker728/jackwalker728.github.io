/* Concept Vault — "Concept shots": device mockups (live renderer + HUD), isometric room setups,
   AI image prompts, and optional real images loaded from shots/<id>-<n>.jpg */
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const P = (n, k = 80) => `<div class="hud-bar"><i style="width:${k}%"></i></div>`;

  const S = {
    "fake-feed": {
      screens: [
        { frame: "phone", canvas: true, cap: "In-game feed at level 4: followers soaring, Trust Meter cracking", hud: `<div class="hud top"><b>VIRAL</b><span>1.2M followers</span></div><div class="hud bot"><small>TRUST METER</small>${P(0, 28)}</div>` },
        { frame: "phone", canvas: false, cap: "The Mirror: sort your own feed into real or fake", hud: `<div class="ui"><small>YOUR FEED · 4 / 12</small><div class="ui-card"><div class="ui-av"></div><b>Forwarded many times</b><p>"Doctors are HIDING this one cure. Share before it's deleted!!"</p><em class="ui-src">Source: health-news-today.co</em></div><div class="ui-btns"><span class="no">✕ FAKE</span><span class="yes">✓ REAL</span></div><small>Tell spotted: urgency + fake source</small></div>` }
      ],
      room: [["table", 2.5, 1.7], ["person", 2.5, 2.7, { phone: 1 }], ["label", 2.5, 1.7, "Laptop or kiosk"], ["label", 2.5, 2.7, "1 player"]],
      prompts: [
        "Key art: a teenager's face lit by a phone in a dark bedroom; the phone shows a glitchy social feed with pink FAKE stamps and exploding like counters; neon magenta and cyan; satirical poster style; 16:9",
        "Mobile game UI screenshot: parody social app with post cards, a huge follower counter, a cracked Trust Meter bar at the top, RGB glitch effects; magenta #ff2e88 and cyan #3ef0ff on near-black; clean flat UI; 9:16"
      ]
    },
    "water-debt": {
      screens: [
        { frame: "tv", canvas: true, cap: "TV view on day 4: the shared lake draining faster than anyone expects", hud: `<div class="hud top"><b>KEREPURA · DAY 4</b><span>Heatwave alert</span></div>` },
        { frame: "phone", canvas: false, cap: "Player phone: secret role, today's need card and the pump", hud: `<div class="ui"><small>YOUR ROLE</small><b class="ui-big">Shakti Textiles</b><div class="ui-card"><b>Export order</b><p>400 litres pays 40 coins</p></div><small>PUMP · 400 L</small><div class="ui-slider"><i style="width:66%"></i></div><div class="ui-btns"><span class="yes" style="flex:1">HOLD TO PUMP</span></div><small>Coins: 112</small></div>` }
      ],
      room: [["tv", 2.5, 0], ["sofa", 2.5, 2.9], ["person", 1.7, 2.9, { phone: 1, sit: 1 }], ["person", 2.25, 3.0, { phone: 1, sit: 1 }], ["person", 2.8, 3.0, { phone: 1, sit: 1 }], ["person", 3.35, 2.9, { phone: 1, sit: 1 }], ["label", 2.5, 0, "TV host + lake"], ["label", 3.35, 2.9, "3–6 phones"]],
      prompts: [
        "Top-down paper-cut diorama of an Indian city around a shrinking blue lake, pipes from houses, farms and factories leading into it, dusty sand tones, warm afternoon light, tilt-shift; 16:9",
        "Candid photo: five young people on a sofa holding phones, laughing and pointing at a TV that shows a draining lake infographic, cosy Bengaluru living room; 16:9"
      ]
    },
    "x-ray-mirror": {
      screens: [
        { frame: "tv", canvas: true, cap: "Mirror mode: organs mapped on the player, scan beam sweeping", hud: `<div class="hud bot center"><b class="big">TOUCH YOUR LIVER</b><span>Combo ×4 · 00:42</span></div>` },
        { frame: "tv", canvas: false, cap: "End-of-session scan report", hud: `<div class="ui wide"><small>SCAN REPORT · DR. GLASS</small><div class="ui-row"><div><b class="ui-big">86%</b><small>accuracy</small></div><div><b class="ui-big">0.9 s</b><small>fastest</small></div><div><b class="ui-big">Liver</b><small>most missed</small></div></div><div class="ui-slider"><i style="width:86%"></i></div></div>` }
      ],
      room: [["tv", 2.5, 0, { cam: 1 }], ["mark", 2.5, 2.1], ["person", 2.5, 2.1, { arm: 1 }], ["label", 2.5, 0, "TV + webcam"], ["label", 2.5, 2.1, "Stand ~2 m away"]],
      prompts: [
        "A teenager standing in front of a large TV that acts as a mirror; the reflection shows a glowing cyan skeleton, lungs and a red heart overlaid on their body; medical HUD frame; dark blue room; cinematic; 16:9",
        "Game UI screenshot of an AR anatomy mirror: webcam silhouette with stylised organs, big prompt 'TOUCH YOUR LIVER', combo meter, radiograph-blue palette; 16:9"
      ]
    },
    "defuse-the-table": {
      screens: [
        { frame: "phone", canvas: true, cap: "WIRE role: the bomb's physical layer over the real table", hud: `<div class="hud top"><b>ROLE · WIRE</b><span>Strikes ●○○</span></div>` },
        { frame: "phone", canvas: false, cap: "GLYPH role: the same bomb, a completely different view", hud: `<div class="ui"><small>ROLE · GLYPH</small><div class="ui-glyphs"><span>☾</span><span>△</span><span class="hot">✶</span><span>◇</span><span>☾</span><span>⌘</span></div><p class="ui-note">"Moon above slot three. What colour is your third wire?"</p><small>02:41 remaining</small></div>` }
      ],
      room: [["table", 2.5, 2.5, { marker: 1 }], ["person", 2.5, 1.6, { phone: 1 }], ["person", 1.65, 3.15, { phone: 1 }], ["person", 3.35, 3.15, { phone: 1 }], ["label", 2.5, 2.5, "Printed marker"], ["label", 3.35, 3.15, "2–3 AR phones"]],
      prompts: [
        "Three friends around a wooden table holding phones up; each phone screen shows a different holographic layer of the same bomb (wires, glyphs, timer); yellow hazard accents; tense but fun lighting; 16:9",
        "AR phone screenshot: holographic metal bomb on a real wooden table with five coloured wires and a red seven-segment timer, industrial HUD; 9:16"
      ]
    },
    "time-window": {
      screens: [
        { frame: "phone", canvas: true, cap: "Mid-tilt: 1925 and 2125 sharing the same spot in the room", hud: `<div class="hud lens"></div><div class="hud top"><b>CHRONO-LENS</b><span>1925 ◄ ► 2125</span></div>` },
        { frame: "phone", canvas: false, cap: "Clue journal: what you've found in each era", hud: `<div class="ui"><small>JOURNAL · DR. MEERA IYER</small><div class="ui-card"><b>1925 · Workshop</b><p>Grandfather clock stopped at 4:17</p></div><div class="ui-card"><b>2125 · Ruin</b><p>Rusted safe, 4-digit lock</p></div><div class="ui-card dim"><b>2125 · ???</b><p>Something glows in the branches…</p></div></div>` }
      ],
      room: [["zone", 0, 0], ["ghost", 1.1, 1.0, { c: "#d9b38c", t: "Workbench · 1925" }], ["ghost", 4.0, 1.1, { c: "#00ffd5", t: "Safe · 2125" }], ["ghost", 3.7, 3.8, { c: "#b388ff", t: "Tree · 2125", tall: 1 }], ["person", 2.2, 2.8, { phone: 1 }], ["label", 2.2, 2.8, "Walk + tilt"]],
      prompts: [
        "One room split into three eras: left a 1925 brass inventor's workshop in sepia, centre an empty modern room, right a flooded neon overgrown 2125 ruin; a person holds a phone like a lens; cinematic; 16:9",
        "AR phone screenshot with an ornate brass lens frame showing a futuristic flooded room with neon vines and a rusted safe; 9:16"
      ]
    },
    "out-of-body": {
      screens: [
        { frame: "vr", canvas: true, cap: "Inside the headset: you, seen from tripod camera 2", hud: "" },
        { frame: "tv", canvas: true, cap: "Spectator TV: the crowd watches what the player sees", hud: `<div class="hud bot"><b>TRIAL 3 · THE CUP</b><span>Distortion: mirror</span></div>` }
      ],
      room: [["tripod", 0.3, 0.3], ["tripod", 4.7, 0.3], ["tripod", 0.3, 4.7], ["tv", 2.5, 0], ["table", 3.6, 1.8, { small: 1 }], ["person", 2.4, 2.6, { vr: 1, arm: 1 }], ["person", 3.6, 3.4, { c: "#9a99a3" }], ["label", 2.4, 2.6, "Player in VR box"], ["label", 3.6, 3.4, "Spotter"], ["label", 0.3, 4.7, "3 tripod phones"]],
      prompts: [
        "A person wearing a VR headset reaching for a cup, seen from a security camera in the corner of a room; CCTV overlay with REC dot and timestamp; eerie clinical lab mood; 16:9",
        "Side-by-side VR view showing the wearer from a third-person camera angle, grainy CCTV look, red ghost double exposure; 2:1"
      ]
    },
    "block-party": {
      screens: [
        { frame: "tv", canvas: true, cap: "TV: Pip running across platforms that are real blocks", hud: `<div class="hud top"><b>LEVEL 3</b><span>Blocks 4 / 6</span></div>` },
        { frame: "tv", canvas: false, cap: "What the webcam sees: marker blocks on the table", hud: `<div class="ui wide cam"><small>WEBCAM · TABLE VIEW</small><div class="ui-table"><span style="left:12%;top:58%"></span><span style="left:30%;top:46%"></span><span style="left:50%;top:52%" class="sp"></span><span style="left:70%;top:34%"></span></div></div>` }
      ],
      room: [["tv", 2.5, 0], ["table", 2.5, 1.4, { blocks: 1, cam: 1 }], ["person", 2.5, 2.4, { arm: 1 }], ["label", 2.5, 1.4, "Webcam + marker blocks"], ["label", 2.5, 0, "TV"]],
      prompts: [
        "A child placing wooden blocks with printed square markers on a table; a TV behind shows a cute pixel-art hero jumping on matching platforms under a purple night sky; warm cosy lighting; 16:9",
        "Pixel-art platformer screenshot: tiny pink hero, chunky white blocks with marker patterns, three yellow stars, glowing exit door, deep violet sky; 16:9"
      ]
    },
    "live-wire": {
      screens: [
        { frame: "tv", canvas: true, cap: "TV: arcs between whoever is touching, live contact matrix", hud: `<div class="hud bot"><b>DISTRICT 3</b><span>Hold 2.4 s</span></div>` },
        { frame: "tv", canvas: false, cap: "Pattern card shown before each round", hud: `<div class="ui wide"><small>NEXT PATTERN</small><b class="ui-big">P1 — P3 &nbsp; · &nbsp; P2 — P4 &nbsp; · &nbsp; P5 — P1</b><p class="ui-note">Hands, elbows, fingertips… anything counts.</p></div>` }
      ],
      room: [["tv", 2.5, 0], ["box", 2.5, 1.2, { t: "ESP32" }], ["person", 1.7, 2.3, { wire: 1 }], ["person", 2.5, 1.9, { wire: 1 }], ["person", 3.3, 2.3, { wire: 1 }], ["person", 2.0, 3.1, { wire: 1 }], ["person", 3.0, 3.1, { wire: 1 }], ["label", 2.5, 1.2, "ESP32 + handles"], ["label", 3.0, 3.1, "3–5 players · 2×2 m"]],
      prompts: [
        "Five strangers in a dark room holding copper handles, touching hands and elbows, glowing electric arcs between them, a TV showing a constellation city lighting up; joyful; 16:9",
        "Game screen: five glowing nodes in a ring connected by yellow and cyan lightning bolts, dark navy background, small contact-matrix HUD; 16:9"
      ]
    },
    "house-is-listening": {
      screens: [
        { frame: "phone", canvas: false, cap: "Your own phone, mid-experience", hud: `<div class="ui call"><small>INCOMING CALL</small><b class="ui-big">HOME</b><span class="ui-sub">calling…</span><div class="ui-pulse"></div><div class="ui-btns"><span class="no">Decline</span><span class="yes">Answer</span></div></div>` },
        { frame: "tv", canvas: true, cap: "The room: one bulb, your flashlight, something on the wall", hud: `<div class="hud top"><b>▮ HOME</b><span>Do you understand me?</span></div>` }
      ],
      room: [["tv", 2.5, 0, { cam: 1 }], ["bulb", 1.6, 1.6], ["bulb", 3.6, 1.8], ["fan", 4.4, 0.7], ["speaker", 0.6, 0.7], ["person", 2.5, 2.8, { phone: 1 }], ["label", 1.6, 1.6, "Smart bulbs"], ["label", 4.4, 0.7, "Fan on smart plug"], ["label", 0.6, 0.7, "Speaker"], ["label", 2.5, 2.8, "Visitor + own phone"]],
      prompts: [
        "A dim room lit by a single warm hanging bulb; a person holds a phone showing an incoming call from 'HOME'; faint red text 'I CAN HEAR YOU' on old wallpaper; analog-horror mood; 16:9",
        "Phone screen mockup: incoming call screen from 'HOME' with VHS noise and warm amber accents; 9:16"
      ]
    },
    "sixth-sense": {
      screens: [
        { frame: "watch", canvas: true, cap: "On the wrist: field strength and pulse", hud: "" },
        { frame: "tv", canvas: true, cap: "Mission control on the TV for spectators", hud: `<div class="hud top"><b>SENSE DIVISION</b><span>Artifacts 2 / 6</span></div>` }
      ],
      room: [["tv", 2.5, 0], ["prop", 0.8, 1.2, { t: "Books" }], ["prop", 4.2, 1.5, { t: "Box" }], ["prop", 1.1, 4.0, { t: "Chair" }], ["prop", 3.9, 3.9, { t: "Step box" }], ["person", 2.4, 2.6, { watch: 1, arm: 1 }], ["label", 0.8, 1.2, "Hidden magnet"], ["label", 2.4, 2.6, "Galaxy Watch 4"], ["label", 2.5, 0, "Mission control"]],
      prompts: [
        "A person in a dark room wearing a smartwatch with a faint green glow, reaching towards a stack of old books; a TV behind shows a sonar radar and a live red heartbeat line; spy thriller; 16:9",
        "Mission-control dashboard UI: green radar sweep with blips, magnetic field lines, red ECG line, 'HR 84 BPM' readout, dark teal background; 16:9"
      ]
    }
  };

  /* ---------- isometric room sketch ---------- */
  function roomSVG(items, accent) {
    const k = 52, ox = 330, oy = 70;
    const iso = (x, y, h = 0) => [ox + (x - y) * k, oy + (x + y) * k * .5 - h * k * .9];
    const pt = (x, y, h) => iso(x, y, h).map(v => v.toFixed(1)).join(",");
    const poly = (pts, fill, stroke, extra = "") => `<polygon points="${pts.map(p => pt(...p)).join(" ")}" fill="${fill}" stroke="${stroke || "none"}" ${extra}/>`;
    let s = `<svg viewBox="0 0 660 360" role="img" aria-label="Room setup sketch">`;
    s += poly([[0, 0, 0], [5, 0, 0], [5, 0, 2.4], [0, 0, 2.4]], "rgba(236,235,230,.035)", "rgba(236,235,230,.18)");
    s += poly([[0, 0, 0], [0, 5, 0], [0, 5, 2.4], [0, 0, 2.4]], "rgba(236,235,230,.05)", "rgba(236,235,230,.18)");
    s += poly([[0, 0, 0], [5, 0, 0], [5, 5, 0], [0, 5, 0]], "rgba(236,235,230,.04)", "rgba(236,235,230,.35)");
    for (let i = 1; i < 5; i++) { s += `<line x1="${iso(i, 0)[0]}" y1="${iso(i, 0)[1]}" x2="${iso(i, 5)[0]}" y2="${iso(i, 5)[1]}" stroke="rgba(236,235,230,.07)"/><line x1="${iso(0, i)[0]}" y1="${iso(0, i)[1]}" x2="${iso(5, i)[0]}" y2="${iso(5, i)[1]}" stroke="rgba(236,235,230,.07)"/>`; }
    const [a5, b5] = [iso(5, 5), iso(0, 5)];
    s += `<text x="${(iso(5, 0)[0] + a5[0]) / 2 + 14}" y="${(iso(5, 0)[1] + a5[1]) / 2 + 10}" class="rl">5 m</text><text x="${(b5[0] + a5[0]) / 2}" y="${(b5[1] + a5[1]) / 2 + 22}" class="rl" text-anchor="middle">5 m</text>`;
    const box = (x, y, w, d, h, h0, top, side1, side2) => poly([[x, y + d, h0], [x + w, y + d, h0], [x + w, y + d, h0 + h], [x, y + d, h0 + h]], side1) + poly([[x + w, y, h0], [x + w, y + d, h0], [x + w, y + d, h0 + h], [x + w, y, h0 + h]], side2) + poly([[x, y, h0 + h], [x + w, y, h0 + h], [x + w, y + d, h0 + h], [x, y + d, h0 + h]], top);
    const labels = [];
    const draw = {
      zone() { return poly([[.1, .1, .01], [4.9, .1, .01], [4.9, 4.9, .01], [.1, 4.9, .01]], "none", accent, `stroke-dasharray="6 6" stroke-width="1.5"`); },
      mark(x, y) { return poly([[x - .35, y - .35, .01], [x + .35, y - .35, .01], [x + .35, y + .35, .01], [x - .35, y + .35, .01]], "none", accent, `stroke-dasharray="4 4"`); },
      tv(x, y, o = {}) { let r = poly([[x - .9, .02, .9], [x + .9, .02, .9], [x + .9, .02, 1.85], [x - .9, .02, 1.85]], "#0b0b10", accent, `stroke-width="2"`) + poly([[x - .8, .03, 1], [x + .8, .03, 1], [x + .8, .03, 1.75], [x - .8, .03, 1.75]], accent, "", `opacity=".28"`); if (o.cam) { const c = iso(x, .03, 1.95); r += `<circle cx="${c[0]}" cy="${c[1]}" r="4" fill="#3dffb5"/>`; } return r; },
      table(x, y, o = {}) { const w = o.small ? .6 : 1.2, d = o.small ? .5 : .8; let r = box(x - w / 2, y - d / 2, w, d, .06, .7, "#2a2a33", "#1c1c23", "#24242c"); [[x - w / 2 + .05, y + d / 2 - .05], [x + w / 2 - .05, y + d / 2 - .05], [x + w / 2 - .05, y - d / 2 + .05]].forEach(([lx, ly]) => { const a = iso(lx, ly, 0), b = iso(lx, ly, .7); r += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#3a3a44" stroke-width="3"/>`; });
        if (o.marker) { r += poly([[x - .15, y - .15, .77], [x + .15, y - .15, .77], [x + .15, y + .15, .77], [x - .15, y + .15, .77]], "#ecebe6") + poly([[x - .08, y - .08, .771], [x + .08, y - .08, .771], [x + .08, y + .08, .771], [x - .08, y + .08, .771]], "#111"); }
        if (o.blocks) [[-.35, .1], [-.05, -.15], [.25, .05]].forEach(([dx, dy]) => { r += box(x + dx, y + dy, .14, .14, .14, .76, "#ecebe6", "#bdbcb6", "#d4d3cd"); });
        if (o.cam) { const a = iso(x, y - .35, .76), b = iso(x, y - .35, 1.25); r += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#9a99a3" stroke-width="2"/><circle cx="${b[0]}" cy="${b[1]}" r="5" fill="#3dffb5"/>`; } return r; },
      sofa(x, y) { return box(x - 1.1, y - .1, 2.2, .7, .45, 0, "#2b2633", "#1d1924", "#25202c") + box(x - 1.1, y + .45, 2.2, .2, .9, 0, "#2b2633", "#1d1924", "#25202c"); },
      person(x, y, o = {}) {
        const c = o.c || accent, h = o.sit ? 1.25 : 1.7, f = iso(x, y, 0), sh = iso(x, y, h - .3), hd = iso(x, y, h - .1), hip = iso(x, y, o.sit ? .45 : .9);
        let r = `<ellipse cx="${f[0]}" cy="${f[1]}" rx="18" ry="8" fill="rgba(0,0,0,.45)"/>`;
        if (!o.sit) r += `<line x1="${f[0] - 5}" y1="${f[1]}" x2="${hip[0] - 3}" y2="${hip[1]}" stroke="${c}" stroke-width="7" stroke-linecap="round" opacity=".85"/><line x1="${f[0] + 5}" y1="${f[1]}" x2="${hip[0] + 3}" y2="${hip[1]}" stroke="${c}" stroke-width="7" stroke-linecap="round" opacity=".85"/>`;
        r += `<line x1="${hip[0]}" y1="${hip[1]}" x2="${sh[0]}" y2="${sh[1]}" stroke="${c}" stroke-width="15" stroke-linecap="round"/>`;
        const hand = o.arm ? [sh[0] + 26, sh[1] - 6] : [sh[0] + 14, sh[1] + 22];
        r += `<line x1="${sh[0] + 4}" y1="${sh[1] + 2}" x2="${hand[0]}" y2="${hand[1]}" stroke="${c}" stroke-width="6" stroke-linecap="round"/><line x1="${sh[0] - 4}" y1="${sh[1] + 2}" x2="${sh[0] - 12}" y2="${sh[1] + 26}" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`;
        r += `<circle cx="${hd[0]}" cy="${hd[1] - 10}" r="10" fill="${c}"/>`;
        if (o.vr) r += `<rect x="${hd[0] - 11}" y="${hd[1] - 15}" width="22" height="9" rx="3" fill="#111" stroke="#ecebe6"/>`;
        if (o.phone) r += `<rect x="${hand[0] - 4}" y="${hand[1] - 9}" width="8" height="13" rx="2" fill="#ecebe6"/><rect x="${hand[0] - 3}" y="${hand[1] - 8}" width="6" height="10" fill="${accent}" opacity=".7"/>`;
        if (o.watch) r += `<circle cx="${hand[0]}" cy="${hand[1]}" r="5" fill="#111" stroke="#3dffb5" stroke-width="2"/>`;
        if (o.wire) r += `<rect x="${hand[0] - 3}" y="${hand[1] - 6}" width="6" height="12" rx="2" fill="#c87533"/>`;
        return r;
      },
      tripod(x, y) { const top = iso(x, y, 1.4); let r = ""; [[-.18, .1], [.18, .1], [0, -.2]].forEach(([dx, dy]) => { const b = iso(x + dx, y + dy, 0); r += `<line x1="${b[0]}" y1="${b[1]}" x2="${top[0]}" y2="${top[1]}" stroke="#9a99a3" stroke-width="2"/>`; }); return r + `<rect x="${top[0] - 6}" y="${top[1] - 12}" width="12" height="16" rx="2" fill="#ecebe6"/><circle cx="${top[0]}" cy="${top[1] - 4}" r="2.5" fill="#ff453a"/>`; },
      bulb(x, y) { const a = iso(x, y, 2.4), b = iso(x, y, 2.05); return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#9a99a3"/><circle cx="${b[0]}" cy="${b[1]}" r="26" fill="${accent}" opacity=".18"/><circle cx="${b[0]}" cy="${b[1]}" r="7" fill="${accent}"/>`; },
      fan(x, y) { const c = iso(x, y, .9), b = iso(x, y, 0); return `<line x1="${b[0]}" y1="${b[1]}" x2="${c[0]}" y2="${c[1]}" stroke="#9a99a3" stroke-width="3"/><circle cx="${c[0]}" cy="${c[1]}" r="16" fill="none" stroke="#ecebe6" stroke-width="2"/><path d="M${c[0]} ${c[1]} l10 -6 M${c[0]} ${c[1]} l-10 -6 M${c[0]} ${c[1]} l0 12" stroke="#ecebe6" stroke-width="2"/>`; },
      speaker(x, y) { return box(x - .15, y - .15, .3, .3, .55, 0, "#2c2c35", "#1b1b22", "#24242c") + `<circle cx="${iso(x, y + .15, .3)[0] - 3}" cy="${iso(x, y + .15, .3)[1]}" r="5" fill="none" stroke="${accent}"/>`; },
      box(x, y, o = {}) { return box(x - .2, y - .15, .4, .3, .12, .0, "#1d4d3a", "#123227", "#173d2f") + (o.t ? `<text x="${iso(x, y, .3)[0]}" y="${iso(x, y, .3)[1]}" class="rl" text-anchor="middle">${esc(o.t)}</text>` : ""); },
      prop(x, y, o = {}) { const c = iso(x, y, .6); return box(x - .25, y - .2, .5, .4, .45, 0, "#2c2a24", "#1e1c18", "#26241f") + `<circle cx="${c[0]}" cy="${c[1] + 6}" r="14" fill="none" stroke="${accent}" stroke-dasharray="3 3"/>`; },
      ghost(x, y, o = {}) { const h = o.tall ? 2.1 : .9; return `<g opacity=".8">${box(x - .35, y - .3, .7, .6, h, 0, "none", "none", "none").replace(/fill="none"/g, `fill="${o.c}" fill-opacity=".08" stroke="${o.c}" stroke-dasharray="4 3"`)}</g><text x="${iso(x, y, h + .15)[0]}" y="${iso(x, y, h + .15)[1]}" class="rl" text-anchor="middle" fill="${o.c}">${esc(o.t)}</text>`; },
      label(x, y, t) { labels.push([x, y, t]); return ""; }
    };
    items.slice().sort((p, q) => (p[0] === "zone" ? -1 : 0) - (q[0] === "zone" ? -1 : 0) || (p[1] + p[2]) - (q[1] + q[2])).forEach(([kind, x, y, o]) => { s += draw[kind] ? draw[kind](x, y, o) : ""; });
    labels.forEach(([x, y, t], i) => { const a = iso(x, y, 2.0), tw = t.length * 7.4 + 8; let right = (x - y) >= 0; if (!right && a[0] - 60 - tw < 4) right = true; if (right && a[0] + 60 + tw > 656) right = false; const tx = a[0] + (right ? 60 : -60), ty = Math.max(18, a[1] - 22 - (i % 2) * 14); s += `<line x1="${a[0]}" y1="${a[1]}" x2="${tx}" y2="${ty}" stroke="rgba(236,235,230,.35)"/><circle cx="${a[0]}" cy="${a[1]}" r="2.5" fill="${accent}"/><text x="${tx + (right ? 4 : -4)}" y="${ty + 4}" class="rl lb" text-anchor="${right ? "start" : "end"}">${esc(t)}</text>`; });
    return s + `</svg>`;
  }

  /* ---------- section HTML ---------- */
  function frameHTML(sh, i, theme) {
    const canv = sh.canvas ? (sh.frame === "vr" ? `<div class="lens l"><canvas data-theme="${theme}" data-i="${i}"></canvas></div><div class="lens r"><canvas data-theme="${theme}" data-i="${i}"></canvas></div>` : `<canvas data-theme="${theme}" data-i="${i}"></canvas>`) : "";
    return `<figure class="shot"><div class="dev ${sh.frame}"><div class="scr${sh.canvas ? "" : " flat"}">${canv}${sh.hud || ""}</div></div><figcaption><span class="mono">Shot ${String.fromCharCode(65 + i)}</span>${esc(sh.cap)}</figcaption></figure>`;
  }
  window.SHOTS_HTML = function (c) {
    const d = S[c.id]; if (!d) return "";
    return `<p class="pov-intro">Illustrated mockups of the game running on its real hardware, drawn live in the browser, plus a sketch of the room setup. AI concept art added to the site's <code>shots/</code> folder appears here automatically.</p>
      <div class="shots">${d.screens.map((sh, i) => frameHTML(sh, i, c.theme)).join("")}</div>
      <figure class="roomshot">${roomSVG(d.room, c.accent)}<figcaption><span class="mono">Shot ${String.fromCharCode(65 + d.screens.length)}</span>Installation setup inside the 5×5 m room</figcaption></figure>
      <div class="aiart" data-id="${c.id}"></div>
      <div class="prompts"><h4>AI image prompts for concept art</h4>${d.prompts.map((p, k) => `<div class="pr"><span class="mono">${["KEY ART", "SCREENSHOT"][k] || "PROMPT"}</span><p>${esc(p)}</p><button class="cp" data-p="${esc(p)}">Copy</button></div>`).join("")}<small>Save the results as <code>shots/${c.id}-1.jpg</code>, <code>-2.jpg</code>, <code>-3.jpg</code> in the <code>concept-vault</code> folder.</small></div>`;
  };
  window.SHOTS_MOUNT = function (c, Stage, cleanup) {
    const stages = [];
    document.querySelectorAll(".shots canvas").forEach(cv => { const s = new Stage(cv, cv.dataset.theme, { auto: true, dpr: 1.25, idx: +cv.dataset.i * 3 + 1 }); stages.push(s); cv.closest(".scr").addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(); s.m = { x: e.clientX - r.left, y: e.clientY - r.top, active: true }; }); cv.closest(".scr").addEventListener("pointerleave", () => s.m = null); });
    const io = new IntersectionObserver(es => es.forEach(e => stages.forEach(s => { if (e.target.contains(s.cv)) s.visible = e.isIntersecting; })), { rootMargin: "120px" });
    document.querySelectorAll(".shot").forEach(f => io.observe(f));
    cleanup.push(() => { io.disconnect(); stages.forEach(s => s.destroy()); });
    const wrap = document.querySelector(".aiart");
    if (wrap) [1, 2, 3].forEach(n => { ["jpg", "png", "webp"].forEach(ext => { const img = new Image(); img.alt = `${c.title} concept art ${n}`; img.onload = () => { if (wrap.querySelector(`[data-n="${n}"]`)) return; const f = document.createElement("figure"); f.dataset.n = n; f.appendChild(img); wrap.appendChild(f); wrap.classList.add("has"); }; img.src = `shots/${c.id}-${n}.${ext}`; }); });
    document.querySelectorAll(".prompts .cp").forEach(b => b.addEventListener("click", () => { const done = () => { b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy", 1000); }; try { navigator.clipboard.writeText(b.dataset.p).then(done, () => { b.textContent = "Select text"; }); } catch (e) { } }));
  };
})();
