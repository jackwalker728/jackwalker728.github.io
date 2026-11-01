/* Jack's World — procedural top-down open world. Three.js, toon style, instanced decor, mobile-friendly. */
import { buildJack, randomLook, lookName, THREE } from "./jack3d.js";

const { C, A, $, esc, pick, toast } = window.Jack;
const WD = C.world || {}, P = C.profile, TAU = Math.PI * 2;
const touch = matchMedia("(pointer: coarse)").matches;
const LOW = touch || (navigator.hardwareConcurrency || 8) <= 4;
if (touch) document.body.classList.add("is-touch");

/* ---------- seed: every visitor gets a different world, shareable via ?seed= ---------- */
const url = new URL(location.href);
const seed = (url.searchParams.get("seed") || Math.random().toString(36).slice(2, 8)).slice(0, 16);
url.searchParams.set("seed", seed); history.replaceState(null, "", url);
function hash(s) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return h >>> 0; }
function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(hash(seed)), rr = (a, b) => a + R() * (b - a), rpick = a => a[Math.floor(R() * a.length)];

/* ---------- renderer / scene ---------- */
const host = $("#game");
const renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, LOW ? 1.25 : 1.75));
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const SKY = "#a8dcea"; scene.background = new THREE.Color(SKY); scene.fog = new THREE.Fog(SKY, 48, 100);
const cam = new THREE.PerspectiveCamera(touch ? 50 : 42, 1, .5, 220);
scene.add(new THREE.HemisphereLight("#ffffff", "#5b7a4a", 1.7));
const sun = new THREE.DirectionalLight("#fff3dc", 2.3); sun.position.set(30, 60, 20); scene.add(sun);

const grad = (() => { const t = new THREE.DataTexture(new Uint8Array([110, 185, 255]), 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const mc = new Map();
const M = c => mc.get(c) || (mc.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: grad })), mc.get(c));
const Bm = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: op < 1, opacity: op, depthWrite: op === 1 });
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) { const m = new THREE.Mesh(geo, typeof mat === "string" ? M(mat) : mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; }
const GEO = {
  box: (a, b, c) => new THREE.BoxGeometry(a, b, c), cyl: (a, b, h, s = 16) => new THREE.CylinderGeometry(a, b, h, s),
  cone: (r, h, s = 16) => new THREE.ConeGeometry(r, h, s), sph: (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h),
  tor: (r, t, rs = 8, ts = 32) => new THREE.TorusGeometry(r, t, rs, ts), disc: r => new THREE.CircleGeometry(r, 40)
};
function flat(m) { m.rotation.x = -Math.PI / 2; return m; }
function canvasSprite(w, h, draw, scale) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); s.scale.set(...scale); return s;
}
function rrect(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
function labelSprite(title, sub, color) {
  return canvasSprite(512, 150, (x, w) => {
    x.fillStyle = "rgba(14,11,18,.86)"; rrect(x, 6, 6, w - 12, 138, 34); x.fill();
    x.fillStyle = color; x.fillRect(40, 116, w - 80, 6);
    x.textAlign = "center"; x.fillStyle = "#f5f0e8"; x.font = "800 50px 'Bricolage Grotesque',system-ui,sans-serif"; x.fillText(title, w / 2, 64, w - 50);
    x.fillStyle = "#a99fb4"; x.font = "500 26px Inter,system-ui,sans-serif"; x.fillText(sub, w / 2, 100, w - 50);
  }, [7.2, 2.1, 1]);
}
const glyphSprite = (g, s = 2.4) => canvasSprite(128, 128, x => { x.font = "96px system-ui,'Apple Color Emoji','Segoe UI Emoji',sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(g, 64, 70); }, [s, s, 1]);

/* ---------- world layout: zones + paths (MST) + ponds ---------- */
const zones = [{ kind: "home", title: "Singleton HQ", sub: "Start here", x: 0, z: 0, r: 7, color: "#d43c55" }];
const others = [
  ...C.projects.map(p => ({ kind: "project", p, title: p.title, sub: `${p.engine} · ${p.status}`, r: 6, color: p.color })),
  { kind: "skills", title: "Skill Tower", sub: "What I can do", r: 6, color: "#41d3c9" },
  { kind: "hobbies", title: "Hobby Park", sub: "When I'm not compiling", r: 7, color: "#f3b94d" },
  { kind: "journey", title: "Memory Lane", sub: "The story so far", r: 6, color: "#7b5cff" },
  { kind: "mailbox", title: "Post Office", sub: "Final mission", r: 6, color: "#e04848" }
].sort(() => R() - .5);
for (const o of others) {
  for (let t = 0; t < 600; t++) {
    const a = R() * TAU, d = rr(17, 58), x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (zones.every(q => Math.hypot(q.x - x, q.z - z) > q.r + o.r + 11 - t / 100)) { Object.assign(o, { x, z }); zones.push(o); break; }
  }
}
const segs = []; { // Prim's MST + a couple of extra loops so it isn't a pure tree
  const inT = [0], rest = zones.map((_, i) => i).slice(1);
  while (rest.length) {
    let b = null;
    for (const i of inT) for (const j of rest) { const d = Math.hypot(zones[i].x - zones[j].x, zones[i].z - zones[j].z); if (!b || d < b.d) b = { i, j, d }; }
    segs.push([zones[b.i], zones[b.j]]); inT.push(b.j); rest.splice(rest.indexOf(b.j), 1);
  }
  for (let k = 0; k < 2; k++) { const a = rpick(zones), b = rpick(zones); if (a !== b && Math.hypot(a.x - b.x, a.z - b.z) < 45 && !segs.some(s => (s[0] === a && s[1] === b) || (s[0] === b && s[1] === a))) segs.push([a, b]); }
}
function segDist(px, pz, a, b) { const dx = b.x - a.x, dz = b.z - a.z, L = dx * dx + dz * dz || 1; const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (pz - a.z) * dz) / L)); return Math.hypot(px - (a.x + t * dx), pz - (a.z + t * dz)); }
const ponds = [];
for (let i = 0, n = 3 + Math.floor(R() * 3); i < n * 40 && ponds.length < n; i++) {
  const x = rr(-60, 60), z = rr(-60, 60), r = rr(3, 6.5);
  if (Math.hypot(x, z) < 60 && zones.every(q => Math.hypot(q.x - x, q.z - z) > q.r + r + 4) && segs.every(s => segDist(x, z, s[0], s[1]) > r + 3) && ponds.every(p => Math.hypot(p.x - x, p.z - z) > p.r + r + 4)) ponds.push({ x, z, r });
}

/* ---------- colliders (spatial grid) ---------- */
const grid = new Map(), CELL = 8;
const key = (cx, cz) => cx * 1000 + cz;
function addCol(x, z, r) { const k = key(Math.floor(x / CELL), Math.floor(z / CELL)); (grid.get(k) || grid.set(k, []).get(k)).push({ x, z, r }); }
function nearCols(x, z) { const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL), out = []; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const g = grid.get(key(cx + i, cz + j)); if (g) out.push(...g); } return out; }

/* ---------- ground, paths, ponds ---------- */
mesh(GEO.disc(140), "#7cc46b", 0, 0, 0, scene).rotation.x = -Math.PI / 2;
for (let i = 0; i < 26; i++) flat(mesh(GEO.disc(rr(4, 12)), rpick(["#73bb62", "#86cc74", "#6fb35f"]), rr(-70, 70), .01, rr(-70, 70), scene));
for (const [a, b] of segs) {
  const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
  const p = mesh(GEO.box(3, .06, d), "#e6d3a3", (a.x + b.x) / 2, .03, (a.z + b.z) / 2, scene); p.rotation.y = Math.atan2(dx, dz);
}
for (const p of ponds) {
  flat(mesh(GEO.disc(p.r + .7), "#e6d3a3", p.x, .025, p.z, scene));
  const w = flat(mesh(GEO.disc(p.r), Bm("#5ec8e8"), p.x, .05, p.z, scene)); w.userData.pond = 1;
  addCol(p.x, p.z, p.r - .3);
}

/* ---------- instanced decor: trees, rocks, flowers ---------- */
function okSpot(x, z, clear) {
  return zones.every(q => Math.hypot(q.x - x, q.z - z) > q.r + clear + 1.5) && segs.every(s => segDist(x, z, s[0], s[1]) > 2 + clear) && ponds.every(p => Math.hypot(p.x - x, p.z - z) > p.r + clear + .8);
}
const dummy = new THREE.Object3D(), col = new THREE.Color();
function instanced(geo, color, items, tint) {
  const im = new THREE.InstancedMesh(geo, M(color), items.length);
  items.forEach((it, i) => { dummy.position.set(it.x, it.y || 0, it.z); dummy.rotation.set(0, it.ry || 0, 0); dummy.scale.setScalar(it.s); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); if (tint) im.setColorAt(i, col.set(tint(it))); });
  scene.add(im); return im;
}
const trees = [], pines = [];
for (let i = 0, n = LOW ? 170 : 270; i < n * 6 && trees.length + pines.length < n; i++) {
  const a = R() * TAU, d = Math.sqrt(R()) * 64, x = Math.cos(a) * d, z = Math.sin(a) * d, s = rr(.8, 1.35);
  if (!okSpot(x, z, 1.2 * s)) continue;
  (R() < .35 ? pines : trees).push({ x, z, s, ry: R() * TAU }); addCol(x, z, .55 * s);
}
for (let i = 0, n = LOW ? 110 : 170; i < n; i++) { const a = i / n * TAU + R() * .05, d = rr(67, 80); (R() < .5 ? pines : trees).push({ x: Math.cos(a) * d, z: Math.sin(a) * d, s: rr(1.1, 1.8), ry: R() * TAU }); }
const greens = ["#3f9a4a", "#4fae55", "#5cbf5f", "#3a8f48"];
instanced(GEO.cyl(.22, .32, 1.6, 6), "#8a5a35", [...trees, ...pines].map(t => ({ ...t, y: .8 * t.s })));
instanced(new THREE.IcosahedronGeometry(1.45, 0), "#ffffff", trees.map(t => ({ ...t, y: 2.5 * t.s })), () => rpick(greens));
instanced(GEO.cone(1.35, 3.2, 7), "#ffffff", pines.map(t => ({ ...t, y: 3 * t.s })), () => rpick(["#2f7d45", "#35864a", "#2a7040"]));
const rocks = [];
for (let i = 0; i < 400 && rocks.length < 45; i++) { const x = rr(-62, 62), z = rr(-62, 62), s = rr(.5, 1.2); if (Math.hypot(x, z) < 62 && okSpot(x, z, s)) { rocks.push({ x, z, s, y: .3 * s, ry: R() * TAU }); addCol(x, z, .7 * s); } }
instanced(new THREE.DodecahedronGeometry(.8, 0), "#ffffff", rocks, () => rpick(["#9aa0a8", "#b3b8bf", "#8a9099"]));
const flowers = [];
for (let i = 0; i < (LOW ? 220 : 420); i++) { const x = rr(-64, 64), z = rr(-64, 64); if (okSpot(x, z, .2)) flowers.push({ x, z, s: rr(.7, 1.2), y: .18 }); }
instanced(GEO.sph(.18, 6, 4), "#ffffff", flowers, () => rpick(["#ff6b8b", "#ffd166", "#ffffff", "#c38bff", "#ff9f43"]));

/* ---------- zone landmarks ---------- */
const spinners = [], floaters = [];
function plaza(z, g) {
  mesh(GEO.cyl(z.r, z.r, .14, 40), "#efe3c8", 0, .07, 0, g);
  const ring = mesh(GEO.tor(z.r, .18, 6, 48), z.color, 0, .14, 0, g); ring.rotation.x = Math.PI / 2;
}
const BUILD = {
  home(z, g) {
    mesh(GEO.box(6, 4, 5), "#f6efe4", 0, 2, -1.5, g);
    const roof = mesh(GEO.cone(4.9, 3, 4), "#d43c55", 0, 5.5, -1.5, g); roof.rotation.y = Math.PI / 4;
    mesh(GEO.box(1.4, 2.4, .2), "#3a2a20", 0, 1.2, 1.05, g);
    [-1.9, 1.9].forEach(x => mesh(GEO.box(1.1, 1, .15), Bm("#ffe7a3"), x, 2.4, 1.05, g));
    addCol(z.x, z.z - 1.5, 3.4);
  },
  project(z, g) {
    const c = z.color, cat = z.p.category;
    mesh(GEO.cyl(1.6, 1.9, .8, 20), "#d9cdb2", 0, .4, 0, g);
    let core;
    if (cat === "Unity") { core = mesh(GEO.box(2.2, 2.2, 2.2), c, 0, 2.6, 0, g); spinners.push(core); }
    else if (cat === "Unreal") { core = mesh(GEO.cone(1.3, 5.5, 4), c, 0, 3.4, 0, g); const r = mesh(GEO.tor(1.7, .14), "#f3b94d", 0, 2.4, 0, g); r.rotation.x = Math.PI / 2; spinners.push(r); }
    else if (cat === "Web") { core = mesh(GEO.tor(1.8, .35, 10, 40), c, 0, 2.9, 0, g); const f = mesh(GEO.disc(1.5), Bm(c, .35), 0, 2.9, 0, g); f.material.side = THREE.DoubleSide; spinners.push(core, f); }
    else { mesh(GEO.box(2.2, 3.6, 1.6), "#2a2433", 0, 2.2, 0, g); mesh(GEO.box(1.7, 1.2, .05), Bm(c), 0, 2.8, .83, g); mesh(GEO.box(1.6, .5, .5), c, 0, 1.6, .9, g); mesh(GEO.sph(.15), "#d43c55", -.3, 1.95, 1.0, g); }
    const gl = glyphSprite(z.p.glyph); gl.position.set(0, 6.4, 0); g.add(gl); floaters.push(gl);
    addCol(z.x, z.z, 1.9);
  },
  skills(z, g) {
    ["#41d3c9", "#2fb3a9", "#f3b94d", "#d43c55", "#7b5cff"].forEach((c, i) => mesh(GEO.cyl(1.9 - i * .28, 2 - i * .28, 1.3, 16), c, 0, .65 + i * 1.3, 0, g));
    const top = mesh(GEO.sph(.6), Bm("#fff3b0"), 0, 7.2, 0, g); floaters.push(top);
    addCol(z.x, z.z, 2.1);
  },
  hobbies(z, g) {
    mesh(GEO.cyl(1.8, 2, .8, 20), "#d9cdb2", 0, .4, 0, g); flat(mesh(GEO.disc(1.5), Bm("#5ec8e8"), 0, .81, 0, g));
    (C.hobbies || []).slice(0, 6).forEach((h, i, a) => {
      const an = i / a.length * TAU, x = Math.cos(an) * 4.2, zz = Math.sin(an) * 4.2;
      mesh(GEO.cyl(.12, .12, 2.2, 6), "#8a5a35", x, 1.1, zz, g);
      const s = glyphSprite(h.icon, 1.6); s.position.set(x, 2.9, zz); g.add(s); floaters.push(s); addCol(z.x + x, z.z + zz, .35);
    });
    addCol(z.x, z.z, 2.1);
  },
  journey(z, g) {
    [-2.2, 2.2].forEach(x => { mesh(GEO.box(.8, 4.6, .8), "#7b5cff", x, 2.3, 0, g); addCol(z.x + x, z.z, .7); });
    mesh(GEO.box(5.6, .8, 1), "#5c43d6", 0, 4.9, 0, g);
    (C.journey || []).slice(0, 4).forEach((j, i) => { const s = canvasSprite(256, 64, (x, w) => { x.fillStyle = "#f6efe4"; rrect(x, 4, 4, w - 8, 56, 14); x.fill(); x.fillStyle = "#1a1420"; x.font = "700 30px Inter,system-ui"; x.textAlign = "center"; x.fillText(j.when, w / 2, 43); }, [2, .5, 1]); s.position.set(-3 + i * 2, .9, 3); g.add(s); });
  },
  mailbox(z, g) {
    mesh(GEO.cyl(.12, .12, 1.6, 6), "#5a5a66", 0, .8, 0, g);
    mesh(GEO.box(1.4, 1.1, 1.8), "#e04848", 0, 2.1, 0, g);
    mesh(GEO.cyl(.7, .7, 1.8, 16, 1), "#e04848", 0, 2.65, 0, g).rotation.x = Math.PI / 2;
    const flag = mesh(GEO.box(.08, .8, .5), "#f3b94d", .75, 2.9, -.4, g); z.flag = flag;
    addCol(z.x, z.z, 1.1);
  }
};
for (const z of zones) {
  const g = new THREE.Group(); g.position.set(z.x, 0, z.z); scene.add(g); z.g = g;
  plaza(z, g); BUILD[z.kind](z, g);
  z.label = labelSprite(z.title, z.sub, z.color); z.label.position.set(0, z.kind === "skills" ? 9 : 8.2, 0); g.add(z.label);
}

/* ---------- bugs (side quest) ---------- */
const bugs = [];
for (let i = 0; i < 6; i++) {
  const s = rpick(segs), t = rr(.25, .75), x = s[0].x + (s[1].x - s[0].x) * t + rr(-1, 1), z = s[0].z + (s[1].z - s[0].z) * t + rr(-1, 1);
  const m = mesh(GEO.box(.7, .7, .7), Bm("#ff3bd4"), x, .7, z, scene); bugs.push({ m, x, z, alive: true, ph: R() * 10 });
}

/* ---------- player (3D Jack) ---------- */
const W = C.wardrobe, look = randomLook(W);
const player = new THREE.Group(); scene.add(player);
const { g: jg, P: JP } = buildJack(W, look); jg.scale.setScalar(.58); jg.position.y = 3.1 * .58; player.add(jg);
const pShadow = flat(mesh(GEO.disc(.9), Bm("#000000", .25), 0, .06, 0, player));
let px = 0, pz = 6.5, vx = 0, vz = 0, yaw = 0, phase = 0;
player.position.set(px, 0, pz);

/* ---------- input ---------- */
const keys = {};
addEventListener("keydown", e => {
  if (e.target.closest && e.target.closest("input,textarea,.drawer")) return;
  keys[e.key.toLowerCase()] = true;
  if (["e", " ", "enter"].includes(e.key.toLowerCase())) { e.preventDefault(); interact(); }
  if (e.key === "Escape") { if ($("#card").open) $("#card").close(); else if (dialogOpen) closeDialog(); }
  if (e.key.startsWith("Arrow")) e.preventDefault();
});
addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
const stick = { x: 0, y: 0, id: null, ox: 0, oy: 0 };
const stickEl = $("#stick"), knob = $("#knob");
$("#pad").addEventListener("pointerdown", e => { stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stickEl.style.display = "block"; stickEl.style.left = e.clientX + "px"; stickEl.style.top = e.clientY + "px"; e.target.setPointerCapture(e.pointerId); });
$("#pad").addEventListener("pointermove", e => {
  if (e.pointerId !== stick.id) return;
  let dx = e.clientX - stick.ox, dy = e.clientY - stick.oy; const d = Math.hypot(dx, dy), m = 50;
  if (d > m) { dx = dx / d * m; dy = dy / d * m; }
  stick.x = dx / m; stick.y = dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`;
});
const endStick = e => { if (e.pointerId !== stick.id) return; stick.id = null; stick.x = stick.y = 0; stickEl.style.display = "none"; knob.style.transform = ""; };
$("#pad").addEventListener("pointerup", endStick); $("#pad").addEventListener("pointercancel", endStick);
$("#act").addEventListener("click", () => interact());

/* ---------- missions ---------- */
const projZones = zones.filter(z => z.kind === "project"), placeZones = zones.filter(z => ["skills", "hobbies", "journey"].includes(z.kind));
const Q = { hi: false, proj: new Set(), places: new Set(), bugs: 0, done: false };
const unlocked = () => Q.proj.size >= projZones.length;
function renderQuests() {
  const li = (done, txt, locked) => `<li class="${done ? "done" : ""} ${locked ? "locked" : ""}"><span>${done ? "✅" : locked ? "🔒" : "⬜"}</span><span>${txt}</span></li>`;
  $("#qlist").innerHTML =
    li(Q.hi, "Say hi at Singleton HQ") +
    li(unlocked(), `Visit my projects (${Q.proj.size}/${projZones.length})`) +
    li(Q.places.size >= placeZones.length, `Skills, hobbies & story (${Q.places.size}/${placeZones.length})`) +
    li(Q.bugs >= bugs.length, `Squash bugs (${Q.bugs}/${bugs.length}) · optional`) +
    li(Q.done, "Reach the Post Office", !unlocked());
}

/* ---------- dialog ---------- */
let dialogOpen = false, dq = [], dz = null, typing = null, full = "";
const lineEl = $("#line");
function openDialog(lines, zone) {
  dq = lines.slice(); dz = zone; dialogOpen = true; $("#dialog").classList.add("show"); document.body.classList.add("talking"); next();
}
function closeDialog() {
  dialogOpen = false; $("#dialog").classList.remove("show"); document.body.classList.remove("talking"); clearInterval(typing);
  const z = dz; dz = null; if (z) done(z);
}
function next() {
  if (typing) { clearInterval(typing); typing = null; if (lineEl.textContent !== full) { lineEl.textContent = full; return; } }
  if (!dq.length) return closeDialog();
  const l = dq.shift(), t = typeof l === "string" ? l : l.t;
  full = t; lineEl.textContent = ""; let i = 0;
  typing = setInterval(() => { i += 2; lineEl.textContent = t.slice(0, i); if (i >= t.length) { clearInterval(typing); typing = null; } }, 16);
  const b = typeof l === "object" && l.btn;
  $("#dbtn").innerHTML = b ? `<button class="btn primary" id="dlgbtn" style="padding:7px 14px">${esc(b.label)}</button>` : "";
  if (b) $("#dlgbtn").onclick = e => { e.stopPropagation(); b.act(); };
  $("#nexthint").textContent = dq.length ? (touch ? "tap ▶" : "E / click ▶") : (touch ? "tap ✕" : "E / click ✕");
  A.sfx("hover");
}
$("#dialog").addEventListener("click", () => next());

function card(p) {
  $("#card-in").innerHTML = `<div class="cover" style="--c:${esc(p.color)}">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : `<span class="glyph">${esc(p.glyph)}</span>`}<span class="status">${esc(p.status)}</span></div>
   <div class="dlg-body"><div class="meta">${esc(p.year)} · ${esc(p.engine)} · ${esc(p.role)}</div><h2 id="card-title">${esc(p.title)}</h2><p>${esc(p.details)}</p>
   ${p.highlights?.length ? `<h4>Highlights</h4><ul>${p.highlights.map(h => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
   ${p.links?.length ? `<div class="actions">${p.links.map(l => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</div>` : ""}</div>`;
  $("#card").showModal(); A.sfx("open");
}
$("#card-x").onclick = () => $("#card").close();

/* optional AI flavour line (uses the same Cloudflare Worker as the chat) */
async function aiLine(z) {
  const url = C.chat?.workerUrl; if (!url || z.ai !== undefined) return z.ai;
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 3500);
    const facts = `${z.p.title} (${z.p.year}, ${z.p.engine}, ${z.p.status}): ${z.p.summary} ${z.p.details}`;
    const r = await fetch(url, { method: "POST", signal: ctl.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: P.name, persona: C.chat.persona, knowledge: facts, messages: [{ role: "user", content: `We're standing next to ${z.p.title} in your portfolio game world. Introduce it in ONE funny sentence.` }] }) });
    z.ai = r.ok ? (await r.json()).reply || null : null;
  } catch (e) { z.ai = null; }
  return z.ai;
}

function linesFor(z) {
  if (z.kind === "home") return WD.home || ["Welcome to HQ!"];
  if (z.kind === "project") {
    const p = z.p, q = (WD.quips || {})[p.id];
    return [z.ai || q || `This is ${p.title}!`, p.summary, `Built with ${p.engine}. Status: ${p.status.toLowerCase()}. My role: ${p.role.toLowerCase()}.`,
      { t: p.highlights?.length ? `Favourite bit: ${p.highlights[0].replace(/^./, c => c.toLowerCase())}.` : "Want the full story?", btn: { label: "📁 Full details", act: () => card(p) } }];
  }
  if (z.kind === "skills") return ["Welcome to the Skill Tower. Each floor is something I can do.", ...C.skills.map(s => `${s.group}: ${s.items.join(", ")}.`)];
  if (z.kind === "hobbies") return ["Hobby Park! This is what I do while Unity is compiling.", ...C.hobbies.map(h => `${h.icon} ${h.title} — ${h.text}`)];
  if (z.kind === "journey") return ["Memory Lane — the story so far.", ...C.journey.map(j => `${j.when}: ${j.title} (${j.org}). ${j.text}`)];
  if (z.kind === "mailbox") return unlocked() ? [...(WD.mailbox || []), { t: "Ready for the credits?", btn: { label: "🎉 Finish", act: () => { closeDialog(); } } }]
    : [`${WD.mailboxLocked || "Come back after visiting all my projects."} (${Q.proj.size}/${projZones.length} projects seen)`];
  return ["…"];
}
async function talk(z) {
  if (z.kind === "project" && C.chat?.workerUrl && z.ai === undefined) { lineEl.textContent = "Jack is thinking…"; $("#dialog").classList.add("show"); await aiLine(z); }
  openDialog(linesFor(z), z);
}
function done(z) {
  const before = unlocked();
  if (z.kind === "home") Q.hi = true;
  if (z.kind === "project") Q.proj.add(z);
  if (placeZones.includes(z)) Q.places.add(z);
  if (z.kind !== "mailbox" || unlocked()) z.visited = true;
  if (!before && unlocked()) { toast("📬 Post Office unlocked! Check the map."); A.sfx("open"); }
  if (z.kind === "mailbox" && unlocked() && !Q.done) { Q.done = true; finish(); }
  renderQuests();
}
let near = null;
function interact() {
  if (!started || $("#card").open) return;
  if (dialogOpen) return next();
  if (near) { A.sfx("click"); talk(near); }
}

/* ---------- intro / ending ---------- */
let started = false, t0 = 0, elapsed = 0;
$("#seedtxt").textContent = `World #${seed} · Jack is wearing: ${lookName(W, look)}`;
$("#start").onclick = () => {
  $("#intro").hidden = true; started = true; t0 = performance.now(); A.init(); A.apply(); A.sfx("open");
  openDialog(WD.intro || ["Welcome to my world!"], null);
};
$("#share").onclick = async () => { try { await navigator.clipboard.writeText(location.href); toast("World link copied — send someone your exact map!"); } catch (e) { toast(location.href); } };
function fmt(s) { s = Math.floor(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
function finish() {
  started = false; A.sfx("open");
  const sk = C.skills.flatMap(s => s.items).slice(0, 6).join(", ");
  $("#endpanel").innerHTML = `<div class="seed">World #${esc(seed)} · finished in ${fmt(elapsed)} · ${Q.bugs}/${bugs.length} bugs squashed</div>
    <h1>You now know <em>${esc(P.name)}</em></h1>
    <ul><li><b>${esc(P.title)}</b> from ${esc(P.location)} — ${esc(P.status.toLowerCase())}.</li>
    <li>${C.projects.length} projects, including ${esc(C.projects.slice(0, 3).map(p => p.title).join(", "))}.</li>
    <li>Toolkit: ${esc(sk)}.</li><li>Leads Singleton Games. Has excellent hair.</li></ul>
    <div class="actions"><a class="btn primary" href="mailto:${esc(P.email)}">✉ Email me</a><a class="btn" href="resume.html">Resume</a><a class="btn" href="portfolio.html">Portfolio</a><a class="btn" href="world.html">🌍 New world</a></div>`;
  $("#end").hidden = false;
}

/* ---------- minimap ---------- */
const mm = $("#mini").getContext("2d"), MS = 280, msc = MS / 150;
function drawMini() {
  mm.clearRect(0, 0, MS, MS); mm.save(); mm.beginPath(); mm.arc(MS / 2, MS / 2, MS / 2, 0, TAU); mm.clip();
  mm.fillStyle = "#7cc46b"; mm.fillRect(0, 0, MS, MS);
  const X = x => MS / 2 + x * msc, Z = z => MS / 2 + z * msc;
  mm.strokeStyle = "#e6d3a3"; mm.lineWidth = 5; mm.beginPath(); for (const [a, b] of segs) { mm.moveTo(X(a.x), Z(a.z)); mm.lineTo(X(b.x), Z(b.z)); } mm.stroke();
  mm.fillStyle = "#5ec8e8"; for (const p of ponds) { mm.beginPath(); mm.arc(X(p.x), Z(p.z), p.r * msc, 0, TAU); mm.fill(); }
  for (const z of zones) {
    const locked = z.kind === "mailbox" && !unlocked();
    mm.fillStyle = locked ? "#6b6b74" : z.color; mm.beginPath(); mm.arc(X(z.x), Z(z.z), 10, 0, TAU); mm.fill();
    mm.lineWidth = 3; mm.strokeStyle = z.visited ? "#ffffff" : "rgba(14,11,18,.7)"; mm.stroke();
    if (z.visited) { mm.fillStyle = "#fff"; mm.font = "bold 13px system-ui"; mm.textAlign = "center"; mm.fillText("✓", X(z.x), Z(z.z) + 5); }
  }
  mm.fillStyle = "#ff3bd4"; for (const b of bugs) if (b.alive) mm.fillRect(X(b.x) - 3, Z(b.z) - 3, 6, 6);
  mm.translate(X(px), Z(pz)); mm.rotate(-yaw + Math.PI); mm.fillStyle = "#1a1420"; mm.strokeStyle = "#fff"; mm.lineWidth = 2.5;
  mm.beginPath(); mm.moveTo(0, -11); mm.lineTo(8, 8); mm.lineTo(-8, 8); mm.closePath(); mm.fill(); mm.stroke();
  mm.restore();
}

/* ---------- main loop ---------- */
let last = performance.now(), frame = 0, clock = 0, raf = 0;
function lerpAngle(a, b, t) { let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI; return a + d * t; }
function tick(now) {
  raf = requestAnimationFrame(tick);
  const dt = Math.min(.05, (now - last) / 1000); last = now; clock += dt; frame++;
  // movement
  let ix = 0, iz = 0;
  if (started && !dialogOpen && !$("#card").open) {
    ix = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0) + stick.x;
    iz = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0) + stick.y;
    const l = Math.hypot(ix, iz); if (l > 1) { ix /= l; iz /= l; }
  }
  const sp = keys.shift ? 13 : 8.5, k = 1 - Math.exp(-dt * 12);
  vx += (ix * sp - vx) * k; vz += (iz * sp - vz) * k;
  px += vx * dt; pz += vz * dt;
  for (const c of nearCols(px, pz)) { const dx = px - c.x, dz = pz - c.z, d = Math.hypot(dx, dz), m = c.r + .7; if (d < m && d > 1e-4) { px = c.x + dx / d * m; pz = c.z + dz / d * m; } }
  const pd = Math.hypot(px, pz); if (pd > 64) { px *= 64 / pd; pz *= 64 / pd; }
  player.position.set(px, 0, pz);
  const speed = Math.hypot(vx, vz), mv = Math.min(1, speed / 8.5);
  if (speed > .5) yaw = lerpAngle(yaw, Math.atan2(vx, vz), 1 - Math.exp(-dt * 12));
  else if (dialogOpen || !started) yaw = lerpAngle(yaw, 0, 1 - Math.exp(-dt * 6)); // face the visitor while talking
  player.rotation.y = yaw;
  phase += dt * (6 + speed * .9);
  const sw = Math.sin(phase) * mv;
  JP.legs[0].rotation.x = sw * .75; JP.legs[1].rotation.x = -sw * .75;
  JP.arms[0].rotation.x = -sw * .6; JP.arms[1].rotation.x = sw * .6;
  jg.position.y = 3.1 * .58 + Math.abs(Math.sin(phase)) * .18 * mv + Math.sin(clock * 2.2) * .03 * (1 - mv);
  JP.head.rotation.set(0, Math.sin(clock * .7) * .15 * (1 - mv), Math.sin(phase) * .05 * mv);
  JP.hair.scale.setScalar(1 + Math.abs(Math.sin(phase)) * .04 * mv);
  const bt = clock % 4; JP.eyes.forEach(e => e.scale.y = bt < .12 ? .1 : 1);
  pShadow.scale.setScalar(1 - Math.abs(Math.sin(phase)) * .12 * mv);
  // world animation
  for (const s of spinners) s.rotation.y += dt * .8;
  floaters.forEach((f, i) => f.position.y += Math.sin(clock * 2 + i) * .004);
  for (const b of bugs) {
    if (!b.alive) continue;
    b.m.rotation.y += dt * 3; b.m.position.y = .7 + Math.abs(Math.sin(clock * 5 + b.ph)) * .5;
    if (frame % 6 === 0) b.m.material.color.setHSL((clock * .5 + b.ph) % 1, .9, .6);
    if (started && Math.hypot(px - b.x, pz - b.z) < 1.4) {
      b.alive = false; scene.remove(b.m); Q.bugs++; A.sfx("boing"); toast(`🐛 ${pick(WD.bugs || ["Bug squashed!"])} (${Q.bugs}/${bugs.length})`); renderQuests();
    }
  }
  for (const z of zones) if (z.flag) z.flag.rotation.z = unlocked() ? -1.2 : 0;
  // proximity + labels
  if (frame % 5 === 0) {
    near = null; let bd = 1e9;
    for (const z of zones) {
      const d = Math.hypot(px - z.x, pz - z.z);
      z.label.material.opacity = Math.max(0, Math.min(1, (34 - d) / 10));
      if (d < z.r + 1.5 && d < bd) { bd = d; near = z; }
    }
    const pr = $("#prompt");
    if (near && started && !dialogOpen) { pr.textContent = `${touch ? "Tap 💬" : "Press E"} — ${near.title}${near.visited ? " ✓" : ""}`; pr.classList.add("show"); }
    else pr.classList.remove("show");
  }
  if (frame % 8 === 0) drawMini();
  if (started && frame % 30 === 0) { elapsed = (now - t0) / 1000; $("#timer").textContent = fmt(elapsed); }
  // camera follows
  const off = touch ? [0, 17, 19] : [0, 13.5, 16];
  const kc = 1 - Math.exp(-dt * 5);
  cam.position.x += (px + off[0] - cam.position.x) * kc; cam.position.y += (off[1] - cam.position.y) * kc; cam.position.z += (pz + off[2] - cam.position.z) * kc;
  cam.lookAt(cam.position.x, 1.2, cam.position.z - off[2] + .5);
  renderer.render(scene, cam);
}
function resize() { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
addEventListener("resize", resize); resize();
cam.position.set(px, 13.5, pz + 16);
document.addEventListener("visibilitychange", () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } });
renderQuests(); drawMini();
$("#loading").remove();
raf = requestAnimationFrame(tick);
if (url.searchParams.has("debug")) window.__world = { get near() { return near; }, zones, bugs, Q, tp: (x, z) => { px = x; pz = z; }, talk: z => talk(z), next: () => next(), get dialogOpen() { return dialogOpen; } };
