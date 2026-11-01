/* Jack's World v2 — big procedural open world: roads, vehicles, NPCs, animals, day/night, collectibles, physics toys.
   Three.js, toon style, instanced decor, mobile-friendly. Content comes from data/content.js. */
import { buildJack, randomLook, lookName, getEnv, THREE } from "./jack3d.js";
import { RoundedBoxGeometry } from "../vendor/RoundedBoxGeometry.js";
import { joinRoom } from "./mp.js";
import { EffectComposer } from "../vendor/pp/EffectComposer.js";
import { RenderPass } from "../vendor/pp/RenderPass.js";
import { UnrealBloomPass } from "../vendor/pp/UnrealBloomPass.js";
import { OutputPass } from "../vendor/pp/OutputPass.js";

const { C, A, $, esc, pick, toast } = window.Jack;
const WD = C.world || {}, P = C.profile, TAU = Math.PI * 2;
const touch = matchMedia("(pointer: coarse)").matches;
const LOW = touch || (navigator.hardwareConcurrency || 8) <= 4;
if (touch) document.body.classList.add("is-touch");
const WR = 230; // world radius: wander past it and you get whisked back to HQ
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function probeHit(v) { let hit = false; const s = Math.sin(v.yaw), c = Math.cos(v.yaw); for (const [off, r] of v.probes) { const p = { x: v.x + s * off, z: v.z + c * off }, ox = p.x, oz = p.z; if (pushOut(p, r)) { v.x += p.x - ox; v.z += p.z - oz; hit = true; } } return hit; }
const angDiff = (a, b) => ((a - b + Math.PI) % TAU + TAU) % TAU - Math.PI;

/* ---------- seed: every visitor gets a different world, shareable via ?seed= ---------- */
const url = new URL(location.href);
// default = today's shared "live" world (so visitors meet); ?solo gives a private random world; ?seed=… joins a specific world
const solo = url.searchParams.has("solo");
const seed = (url.searchParams.get("seed") || (solo ? Math.random().toString(36).slice(2, 8) : "live-" + new Date().toISOString().slice(0, 10))).slice(0, 24);
if (!seed.startsWith("live-") || url.searchParams.has("seed")) { url.searchParams.set("seed", seed); history.replaceState(null, "", url); }
function hash(s) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return h >>> 0; }
function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const R = rng(hash(seed)), rr = (a, b) => a + R() * (b - a), rpick = a => a[Math.floor(R() * a.length)];

/* ---------- renderer / scene ---------- */
const host = $("#game");
const renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, LOW ? 1.25 : 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
const SHADOWS = !LOW, BLOOM = !LOW; if (SHADOWS) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
const ENV = getEnv(renderer);
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const skyC = new THREE.Color("#a8dcea"); scene.background = skyC; scene.fog = new THREE.Fog(skyC, 85, 240);
const cam = new THREE.PerspectiveCamera(touch ? 50 : 42, 1, .5, 700);
const hemi = new THREE.HemisphereLight("#ffffff", "#5b7a4a", 1.7); scene.add(hemi);
const sun = new THREE.DirectionalLight("#fff3dc", 2.3); sun.position.set(30, 60, 20); scene.add(sun); scene.add(sun.target);
if (SHADOWS) { sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = sc.bottom = -42; sc.right = sc.top = 42; sc.near = 1; sc.far = 170; sun.shadow.bias = -.0004; sun.shadow.normalBias = .05; }

const grad = (() => { const t = new THREE.DataTexture(new Uint8Array([110, 185, 255]), 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const mc = new Map();
const M = c => mc.get(c) || (mc.set(c, new THREE.MeshStandardMaterial({ color: c, roughness: .85 })), mc.get(c));
const withEnv = m => { m.envMap = ENV; return m; };
const PAINT = c => withEnv(new THREE.MeshPhysicalMaterial({ color: c, roughness: .32, metalness: .15, clearcoat: 1, clearcoatRoughness: .08 }));
const CHROME = withEnv(new THREE.MeshStandardMaterial({ color: "#d4d8de", roughness: .2, metalness: 1 }));
const TYRE = new THREE.MeshStandardMaterial({ color: "#1b1b20", roughness: .95 });
const GLASSM = withEnv(new THREE.MeshPhysicalMaterial({ color: "#bfe7ff", roughness: .05, transparent: true, opacity: .35, clearcoat: 1, depthWrite: false }));
const WATER = withEnv(new THREE.MeshPhysicalMaterial({ color: "#3fa9cf", roughness: .06, metalness: .1, clearcoat: 1 }));
const glow = m => { if (BLOOM) m.color.multiplyScalar(2.4); return m; };
const Bm = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: op < 1, opacity: op, depthWrite: op === 1, toneMapped: false });
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) { const m = new THREE.Mesh(geo, typeof mat === "string" ? M(mat) : mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; }
const GEO = {
  box: (a, b, c) => new THREE.BoxGeometry(a, b, c), cyl: (a, b, h, s = 16) => new THREE.CylinderGeometry(a, b, h, s),
  cone: (r, h, s = 16) => new THREE.ConeGeometry(r, h, s), sph: (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h),
  tor: (r, t, rs = 8, ts = 32) => new THREE.TorusGeometry(r, t, rs, ts), disc: r => new THREE.CircleGeometry(r, 40),
  cap: (r, l) => new THREE.CapsuleGeometry(r, l, 4, 10), rbox: (a, b, c, r = .1) => new RoundedBoxGeometry(a, b, c, 3, r)
};
function tex(w, h, draw, rx = 1, ry = 1) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t; }
function speckle(x, w, h, n, a) { for (let i = 0; i < n; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? "255,255,255" : "0,0,0"},${Math.random() * a})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }
const FM = new Map(), MF = c => FM.get(c) || (FM.set(c, new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true })), FM.get(c));
const grassTex = tex(512, 512, (x, w, h) => {
  x.fillStyle = "#77c066"; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) { const r = 20 + Math.random() * 80, gx = Math.random() * w, gy = Math.random() * h, c = Math.random() < .5 ? "140,210,110" : "70,140,62"; for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { const gr = x.createRadialGradient(gx + ox, gy + oy, 0, gx + ox, gy + oy, r); gr.addColorStop(0, `rgba(${c},.3)`); gr.addColorStop(1, `rgba(${c},0)`); x.fillStyle = gr; x.fillRect(gx + ox - r, gy + oy - r, r * 2, r * 2); } }
  for (let i = 0; i < 9000; i++) { x.strokeStyle = `rgba(${Math.random() < .5 ? "165,225,135" : "55,115,50"},${.25 + Math.random() * .35})`; const bx = Math.random() * w, by = Math.random() * h; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + (Math.random() - .5) * 3, by - 3 - Math.random() * 5); x.stroke(); }
}, 45, 45);
const asphaltTex = tex(256, 256, (x, w, h) => { x.fillStyle = "#4b4f59"; x.fillRect(0, 0, w, h); speckle(x, w, h, 6000, .14); x.fillStyle = "#ece9df"; x.fillRect(12, 0, 6, h); x.fillRect(w - 18, 0, 6, h); x.fillStyle = "#f3d36b"; x.fillRect(w / 2 - 4, 0, 8, h * .55); });
const tilesTex = tex(256, 256, (x, w, h) => { x.fillStyle = "#cbbd9f"; x.fillRect(0, 0, w, h); const s = w / 4; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = `hsl(38,${28 + Math.random() * 10}%,${80 + Math.random() * 7}%)`; x.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); } speckle(x, w, h, 1500, .06); }, 3, 3);
const woodTex = tex(128, 128, (x, w, h) => { x.fillStyle = "#9a6a3e"; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(60,35,15,${.15 + Math.random() * .25})`; x.lineWidth = 1 + Math.random() * 2; const y = Math.random() * h; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w * .3, y + (Math.random() - .5) * 8, w * .6, y + (Math.random() - .5) * 8, w, y); x.stroke(); } });
const plasterTex = tex(256, 256, (x, w, h) => { x.fillStyle = "#f4ece0"; x.fillRect(0, 0, w, h); speckle(x, w, h, 4000, .05); }, 2, 2);
const stoneTex = tex(256, 256, (x, w, h) => { x.fillStyle = "#bdb2a0"; x.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { x.fillStyle = `hsl(35,${10 + Math.random() * 8}%,${62 + Math.random() * 10}%)`; x.fillRect(c * 64 + (r % 2) * 32 + 2, r * 32 + 2, 60, 28); } speckle(x, w, h, 2500, .08); });
const rampTex = tex(128, 128, (x, w, h) => { x.fillStyle = "#ff8a3d"; x.fillRect(0, 0, w, h); x.fillStyle = "#fff3e0"; for (let i = -1; i < 3; i++) { x.beginPath(); x.moveTo(0, i * 64 + 22); x.lineTo(w / 2, i * 64); x.lineTo(w, i * 64 + 22); x.lineTo(w, i * 64 + 42); x.lineTo(w / 2, i * 64 + 20); x.lineTo(0, i * 64 + 42); x.fill(); } }, .35, .35);
const signTex = (text, bg, fg, w = 512, h = 96, font = 64) => tex(w, h, (x) => { x.fillStyle = bg; rrect(x, 0, 0, w, h, 18); x.fill(); x.fillStyle = fg; x.font = `800 ${font}px 'Bricolage Grotesque',system-ui,sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, w / 2, h / 2 + 3, w - 30); });
const PLAZA = new THREE.MeshStandardMaterial({ map: tilesTex, roughness: .92 }), WOOD = new THREE.MeshStandardMaterial({ map: woodTex, roughness: .8 }), WALL = new THREE.MeshStandardMaterial({ map: plasterTex, roughness: .95 }), STONE = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: .9 });
const IRON = new THREE.MeshStandardMaterial({ color: "#2e3038", roughness: .45, metalness: .6 });
const decal = (t, w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }));
const flat = m => { m.rotation.x = -Math.PI / 2; m.userData.noCast = 1; return m; };
function canvasSprite(w, h, draw, scale) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false })); s.scale.set(...scale); return s;
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
const blob = (parent, r) => SHADOWS ? null : flat(mesh(GEO.disc(r), Bm("#000000", .22), 0, .05, 0, parent));

/* ---------- layout: zones + roads (MST) + ponds ---------- */
const zones = [{ kind: "home", title: "Singleton HQ", sub: "Start here", x: 0, z: 0, r: 7, color: "#d43c55" }];
const others = [
  ...C.projects.map(p => ({ kind: "project", p, title: p.title, sub: `${p.engine} · ${p.status}`, r: 6, color: p.color })),
  { kind: "skills", title: "Skill Tower", sub: "What I can do", r: 6, color: "#41d3c9" },
  { kind: "hobbies", title: "Hobby Park", sub: "When I'm not compiling", r: 7, color: "#f3b94d" },
  { kind: "journey", title: "Memory Lane", sub: "The story so far", r: 6, color: "#7b5cff" },
  { kind: "pitch", title: "Kickabout Pitch", sub: "Score a goal (cars allowed)", r: 13, color: "#5cbf5f" },
  { kind: "mailbox", title: "Post Office", sub: "Final mission", r: 6, color: "#e04848" }
].sort(() => R() - .5);
for (const o of others) {
  for (let t = 0; t < 800; t++) {
    const a = R() * TAU, d = rr(34, WR - 40), x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (zones.every(q => Math.hypot(q.x - x, q.z - z) > q.r + o.r + 46 - t / 20)) { Object.assign(o, { x, z }); zones.push(o); break; }
  }
}
const segs = []; {
  const inT = [0], rest = zones.map((_, i) => i).slice(1);
  while (rest.length) {
    let b = null;
    for (const i of inT) for (const j of rest) { const d = Math.hypot(zones[i].x - zones[j].x, zones[i].z - zones[j].z); if (!b || d < b.d) b = { i, j, d }; }
    segs.push([zones[b.i], zones[b.j]]); inT.push(b.j); rest.splice(rest.indexOf(b.j), 1);
  }
  for (let k = 0; k < 8 && segs.length < zones.length + 2; k++) { const a = rpick(zones), b = rpick(zones); if (a !== b && Math.hypot(a.x - b.x, a.z - b.z) < 130 && !segs.some(s => (s[0] === a && s[1] === b) || (s[0] === b && s[1] === a))) segs.push([a, b]); }
}
function segDist(px, pz, a, b) { const dx = b.x - a.x, dz = b.z - a.z, L = dx * dx + dz * dz || 1; const t = clamp(((px - a.x) * dx + (pz - a.z) * dz) / L, 0, 1); return Math.hypot(px - (a.x + t * dx), pz - (a.z + t * dz)); }
const roadDist = (x, z) => segs.reduce((m, s) => Math.min(m, segDist(x, z, s[0], s[1])), 1e9);
const onRoad = (s, t, off = 0) => { const dx = s[1].x - s[0].x, dz = s[1].z - s[0].z, L = Math.hypot(dx, dz); return { x: s[0].x + dx * t + (-dz / L) * off, z: s[0].z + dz * t + (dx / L) * off, a: Math.atan2(dx, dz) }; };
const ponds = [];
for (let i = 0, n = 5 + Math.floor(R() * 4); i < n * 60 && ponds.length < n; i++) {
  const x = rr(-WR + 20, WR - 20), z = rr(-WR + 20, WR - 20), r = rr(4, 10);
  if (Math.hypot(x, z) < WR - 12 && zones.every(q => Math.hypot(q.x - x, q.z - z) > q.r + r + 5) && roadDist(x, z) > r + 5 && ponds.every(p => Math.hypot(p.x - x, p.z - z) > p.r + r + 5)) ponds.push({ x, z, r });
}

/* ---------- colliders (spatial grid) ---------- */
const grid = new Map(), CELL = 10, key = (cx, cz) => cx * 1000 + cz;
function addCol(x, z, r) { const k = key(Math.floor(x / CELL), Math.floor(z / CELL)); (grid.get(k) || grid.set(k, []).get(k)).push({ x, z, r }); }
function addBox(x, z, hw, hd) { const b = { x, z, hw, hd, box: true }; for (let cx = Math.floor((x - hw) / CELL); cx <= Math.floor((x + hw) / CELL); cx++) for (let cz = Math.floor((z - hd) / CELL); cz <= Math.floor((z + hd) / CELL); cz++) { const k = key(cx, cz); (grid.get(k) || grid.set(k, []).get(k)).push(b); } }
function nearCols(x, z) { const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL), out = new Set(); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const g = grid.get(key(cx + i, cz + j)); if (g) for (const c of g) out.add(c); } return out; }
function sep(a, b, minD, share) { const dx = a.x - b.x, dz = a.z - b.z, d = Math.hypot(dx, dz); if (d < minD && d > 1e-4) { const o = minD - d; a.x += dx / d * o * share; a.z += dz / d * o * share; b.x -= dx / d * o * (1 - share); b.z -= dz / d * o * (1 - share); return true; } return false; }
function pushOut(o, rad) { let hit = false; for (const c of nearCols(o.x, o.z)) {
    if (c.box) { const qx = clamp(o.x, c.x - c.hw, c.x + c.hw), qz = clamp(o.z, c.z - c.hd, c.z + c.hd), bx = o.x - qx, bz = o.z - qz, bd = Math.hypot(bx, bz);
      if (bd < rad) { if (bd < 1e-4) { const px = c.hw - Math.abs(o.x - c.x), pz = c.hd - Math.abs(o.z - c.z); if (px < pz) o.x = c.x + Math.sign(o.x - c.x || 1) * (c.hw + rad); else o.z = c.z + Math.sign(o.z - c.z || 1) * (c.hd + rad); } else { o.x = qx + bx / bd * rad; o.z = qz + bz / bd * rad; } hit = true; } continue; }
    const dx = o.x - c.x, dz = o.z - c.z, d = Math.hypot(dx, dz), m = c.r + rad; if (d < m && d > 1e-4) { o.x = c.x + dx / d * m; o.z = c.z + dz / d * m; hit = true; } } return hit; }

/* ---------- ground, roads, ponds ---------- */
grassTex.repeat.multiplyScalar((WR + 260) / 270);
flat(mesh(GEO.disc(WR + 260), new THREE.MeshStandardMaterial({ map: grassTex, roughness: .97 }), 0, 0, 0, scene));
const dashes = [];
for (const [a, b] of segs) {
  const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), ang = Math.atan2(dx, dz), mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
  mesh(GEO.box(7.4, .04, d), "#e6d3a3", mx, .02, mz, scene).rotation.y = ang;
  const at = asphaltTex.clone(); at.repeat.set(1, d / 7); at.needsUpdate = true;
  mesh(GEO.box(5.6, .06, d), new THREE.MeshStandardMaterial({ map: at, roughness: .88 }), mx, .03, mz, scene).rotation.y = ang;
  [-1, 1].forEach(sd => { const k = mesh(GEO.box(.28, .14, d - 2), "#c9c6bd", mx + Math.cos(ang) * 2.95 * sd, .07, mz - Math.sin(ang) * 2.95 * sd, scene); k.rotation.y = ang; });
}
for (const p of ponds) { flat(mesh(GEO.disc(p.r + .8), "#e6d3a3", p.x, .025, p.z, scene)); flat(mesh(GEO.disc(p.r), WATER, p.x, .05, p.z, scene)); addCol(p.x, p.z, p.r - .4); }

/* ---------- instanced decor ---------- */
function okSpot(x, z, clear) { return zones.every(q => Math.hypot(q.x - x, q.z - z) > q.r + clear + 1.5) && roadDist(x, z) > 4.2 + clear && ponds.every(p => Math.hypot(p.x - x, p.z - z) > p.r + clear + .8); }
const dummy = new THREE.Object3D(), col = new THREE.Color();
function instanced(geo, mat, items, tint) {
  const im = new THREE.InstancedMesh(geo, typeof mat === "string" ? M(mat) : mat, items.length);
  items.forEach((it, i) => { dummy.position.set(it.x, it.y || 0, it.z); dummy.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0); const sc = it.s ?? 1; dummy.scale.set(it.sx ?? sc, it.sy ?? sc, it.sz ?? sc); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); if (tint) im.setColorAt(i, col.set(tint(it))); });
  scene.add(im); return im;
}
instanced(GEO.box(.28, .02, 2.2), "#f3d36b", dashes).userData.noCast = 1;
const trees = [], pines = [];
{ const NT = LOW ? 60 : 95, groves = Array.from({ length: 15 }, () => { const a = R() * TAU, d = Math.sqrt(R()) * (WR - 12); return { x: Math.cos(a) * d, z: Math.sin(a) * d, r: rr(5, 13) }; });
  for (let i = 0; i < NT * 10 && trees.length + pines.length < NT; i++) {
    const gv = groves[i % groves.length], a = R() * TAU, dd = Math.sqrt(R()) * gv.r, x = gv.x + Math.cos(a) * dd, z = gv.z + Math.sin(a) * dd, s = rr(.9, 1.5);
    if (Math.hypot(x, z) > WR - 4 || !okSpot(x, z, 1.2 * s)) continue;
    (R() < .35 ? pines : trees).push({ x, z, s, ry: R() * TAU }); addCol(x, z, .55 * s);
  } }
const greens = ["#3f9a4a", "#4fae55", "#5cbf5f", "#3a8f48"];
instanced(GEO.cyl(.15, .3, 1.9, 7), MF("#6f4628"), [...trees, ...pines].map(t => ({ ...t, y: .95 * t.s })));
const lobes = [];
trees.forEach(t => { const c = Math.cos(t.ry), sn = Math.sin(t.ry), tint = rpick(greens); [[0, 2.6, 0, 1], [.65, 2.25, .25, .72], [-.55, 2.35, -.3, .7], [.1, 3.2, -.15, .62], [-.2, 2.2, .6, .6]].forEach(([ox, oy, oz, k]) => lobes.push({ x: t.x + (ox * c + oz * sn) * t.s, y: oy * t.s, z: t.z + (-ox * sn + oz * c) * t.s, s: 1.35 * k * t.s, ry: R() * TAU, tint })); });
instanced(new THREE.IcosahedronGeometry(1, 1), MF("#ffffff"), lobes, it => "#" + new THREE.Color(it.tint).offsetHSL(0, .02, (R() - .5) * .07).getHexString());
const tiers = []; pines.forEach(t => { const tint = rpick(["#2f7d45", "#35864a", "#2a7040"]); [[2.1, 1.5, 2.1], [3.1, 1.15, 1.8], [3.95, .8, 1.5]].forEach(([y, r, h]) => tiers.push({ x: t.x, z: t.z, y: y * t.s, ry: R() * TAU, sx: r * t.s, sz: r * t.s, sy: h * t.s, tint })); });
instanced(GEO.cone(1, 1, 8), MF("#ffffff"), tiers, it => it.tint);
const bushes = []; for (let i = 0; i < (LOW ? 30 : 55); i++) { const x = rr(-WR, WR), z = rr(-WR, WR); if (Math.hypot(x, z) < WR && okSpot(x, z, .6)) bushes.push({ x, z, s: rr(.6, 1.1), y: .45 }); }
instanced(new THREE.IcosahedronGeometry(.9, 1), MF("#ffffff"), bushes, () => rpick(["#4fae55", "#62c062", "#3f9a4a"]));
const rocks = []; for (let i = 0; i < 900 && rocks.length < 34; i++) { const x = rr(-WR, WR), z = rr(-WR, WR), s = rr(.5, 1.3); if (Math.hypot(x, z) < WR && okSpot(x, z, s)) { rocks.push({ x, z, s, y: .28 * s, ry: R() * TAU, sx: s * rr(.8, 1.3), sy: s * rr(.55, .9), sz: s * rr(.8, 1.2) }); addCol(x, z, .7 * s); } }
instanced(new THREE.DodecahedronGeometry(.8, 1), MF("#ffffff"), rocks, () => rpick(["#9aa0a8", "#b3b8bf", "#8a9099"]));
const flowers = []; let fcx = 0, fcz = 0; for (let i = 0; i < 16 * 16; i++) { if (i % 16 === 0) { fcx = rr(-WR, WR); fcz = rr(-WR, WR); } const x = fcx + rr(-3.5, 3.5), z = fcz + rr(-3.5, 3.5); if (Math.hypot(x, z) < WR && okSpot(x, z, .2)) flowers.push({ x, z, s: rr(.7, 1.2), y: .4 }); }
instanced(GEO.cyl(.015, .02, .4, 4), "#3f8f3a", flowers.map(f => ({ ...f, y: .2 }))).userData.noCast = 1;
instanced(GEO.sph(.13, 8, 6), "#ffffff", flowers, () => rpick(["#ff6b8b", "#ffd166", "#ffffff", "#c38bff", "#ff9f43"])).userData.noCast = 1;
const tufts = []; for (let i = 0; i < (LOW ? 700 : 1400); i++) { const a = R() * TAU, d = Math.sqrt(R()) * (WR + 10), x = Math.cos(a) * d, z = Math.sin(a) * d; if (okSpot(x, z, .1)) tufts.push({ x, z, y: .2, s: rr(.7, 1.3), rx: rr(-.25, .25), rz: rr(-.25, .25), ry: R() * TAU }); }
instanced(GEO.cone(.09, .45, 3), MF("#ffffff"), tufts, () => rpick(["#5cae4f", "#6fbf5b", "#4f9a45", "#86c66a"])).userData.noCast = 1;
// horizon: two rings of soft rolling hills far past the edge
{ const rings = [[], []];
  for (let L = 0; L < 2; L++) for (let i = 0, n = L ? 30 : 42; i < n; i++) { const a = i / n * TAU + R() * .12, s = L ? rr(50, 85) : rr(22, 40), d = WR + (L ? 70 : 16) + s * .95 + rr(0, 10); rings[L].push({ x: Math.cos(a) * d, z: Math.sin(a) * d, y: -s * .18, s, sy: s * (L ? rr(.45, .7) : rr(.35, .55)), ry: R() * TAU }); }
  rings.forEach((it, L) => { instanced(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshLambertMaterial({ color: L ? "#86ad9c" : "#62a35a", flatShading: true }), it).userData.noCast = 1; });
}
const cloudTex = tex(256, 256, (x, w, h) => { for (let i = 0; i < 12; i++) { const cx = Math.random() * w, cy = Math.random() * h, r = 18 + Math.random() * 42; for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { const g = x.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, r); g.addColorStop(0, "rgba(0,0,0,.6)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(cx + ox - r, cy + oy - r, r * 2, r * 2); } } });
cloudTex.repeat.set(5, 5);
const cloudShade = new THREE.Mesh(new THREE.PlaneGeometry((WR + 60) * 2, (WR + 60) * 2), new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, opacity: .2, depthWrite: false, color: "#000000" }));
cloudShade.rotation.x = -Math.PI / 2; cloudShade.position.y = .1; cloudShade.renderOrder = 1; scene.add(cloudShade);
// pond life: lily pads, reeds, rim stones
{ const pads = [], reeds = [], stones = [];
  for (const p of ponds) {
    for (let i = 0; i < 6; i++) { const a = R() * TAU, d = R() * (p.r - 1.2); pads.push({ x: p.x + Math.cos(a) * d, z: p.z + Math.sin(a) * d, y: .08, ry: R() * TAU, s: rr(.7, 1.2) }); }
    for (let i = 0, n = Math.floor(p.r * 3); i < n; i++) { const a = i / n * TAU + R() * .2; stones.push({ x: p.x + Math.cos(a) * (p.r + .5), z: p.z + Math.sin(a) * (p.r + .5), y: .12, ry: R() * TAU, sx: rr(.35, .6), sy: rr(.2, .35), sz: rr(.35, .6) }); }
    for (let k = 0; k < 3; k++) { const a = R() * TAU; for (let i = 0; i < 7; i++) reeds.push({ x: p.x + Math.cos(a) * (p.r - .2) + rr(-.5, .5), z: p.z + Math.sin(a) * (p.r - .2) + rr(-.5, .5), y: .6, rx: rr(-.15, .15), rz: rr(-.15, .15), s: rr(.8, 1.3) }); }
  }
  instanced(new THREE.CylinderGeometry(.45, .45, .03, 12, 1, false, .3, TAU - .6), "#3f9a4a", pads).userData.noCast = 1;
  instanced(new THREE.DodecahedronGeometry(1, 0), MF("#9aa0a8"), stones);
  instanced(GEO.cone(.05, 1.3, 4), "#6b8f3a", reeds); }
// lamp posts along roads (glow at night)
const lampMat = new THREE.MeshBasicMaterial({ color: "#6b6b74", toneMapped: false }), lamps = [];
segs.forEach(s => { const d = Math.hypot(s[1].x - s[0].x, s[1].z - s[0].z); for (let t = 14, k = 0; t < d - 8; t += 20, k++) { const p = onRoad(s, t / d, k % 2 ? 4.6 : -4.6), c0 = onRoad(s, t / d, 0); if (zones.every(q => Math.hypot(q.x - p.x, q.z - p.z) > q.r + 1.5)) { const L = Math.hypot(c0.x - p.x, c0.z - p.z); p.dx = (c0.x - p.x) / L; p.dz = (c0.z - p.z) / L; lamps.push(p); addCol(p.x, p.z, .35); } } });
instanced(GEO.cyl(.07, .13, 3.8, 10), IRON, lamps.map(l => ({ x: l.x, z: l.z, y: 1.9 })));
instanced(GEO.cyl(.22, .27, .35, 10), IRON, lamps.map(l => ({ x: l.x, z: l.z, y: .17 })));
instanced(GEO.box(.08, .08, 1.15), IRON, lamps.map(l => ({ x: l.x + l.dx * .5, z: l.z + l.dz * .5, y: 3.75, ry: Math.atan2(l.dx, l.dz) })));
instanced(GEO.cone(.34, .3, 12), IRON, lamps.map(l => ({ x: l.x + l.dx * 1.05, z: l.z + l.dz * 1.05, y: 3.66 })));
instanced(GEO.sph(.17, 12, 8), lampMat, lamps.map(l => ({ x: l.x + l.dx * 1.05, z: l.z + l.dz * 1.05, y: 3.5 }))).userData.noCast = 1;

/* ---------- zone landmarks ---------- */
const spinners = [], floaters = [], glowMats = [];
const BUILD = {
  home(z, g) {
    mesh(GEO.rbox(6.8, .4, 5.8, .08), STONE, 0, .2, -1.5, g);
    mesh(GEO.rbox(6, 3.6, 5, .1), WALL, 0, 2.2, -1.5, g);
    [-1, 1].forEach(s => { mesh(GEO.rbox(3.8, .28, 6.2, .06), "#c4384f", s * 1.62, 5.0, -1.5, g).rotation.z = -s * .55; });
    const gg = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-3, 0), new THREE.Vector2(3, 0), new THREE.Vector2(0, 1.75)]), { depth: 4.9, bevelEnabled: false }); gg.translate(0, 0, -2.45); mesh(gg, WALL, 0, 4.0, -1.5, g);
    mesh(GEO.box(.7, 1.7, .7), "#a65a45", 1.7, 5.45, -2.6, g); mesh(GEO.box(.85, .14, .85), "#3a3a44", 1.7, 6.35, -2.6, g);
    mesh(GEO.box(1.7, 2.7, .16), "#5a3b22", 0, 1.75, 1.02, g); mesh(GEO.box(1.3, 2.45, .1), WOOD, 0, 1.62, 1.08, g); mesh(GEO.sph(.07, 10, 8), CHROME, .45, 1.6, 1.15, g);
    mesh(GEO.rbox(2.5, .12, 1.2, .04), "#c4384f", 0, 3.3, 1.5, g).rotation.x = .22;
    mesh(GEO.rbox(2.2, .2, .9, .04), STONE, 0, .1, 1.55, g);
    const front = [[-1.95, 2.45, 1.02, 0], [1.95, 2.45, 1.02, 0], [-3.02, 2.45, -1.5, Math.PI / 2], [3.02, 2.45, -1.5, Math.PI / 2]];
    front.forEach(([x, y, zz, ry]) => { const w = new THREE.Group(); w.position.set(x, y, zz); w.rotation.y = ry; g.add(w); const m = Bm("#ffe7a3"); glowMats.push(m);
      mesh(GEO.box(1.35, 1.2, .14), "#ffffff", 0, 0, 0, w); mesh(GEO.box(1.1, .95, .06), m, 0, 0, .06, w); mesh(GEO.box(.06, .95, .08), "#ffffff", 0, 0, .08, w); mesh(GEO.box(1.1, .06, .08), "#ffffff", 0, 0, .08, w); mesh(GEO.box(1.5, .1, .32), "#ffffff", 0, -.65, .12, w); });
    const sg = decal(signTex("SINGLETON GAMES", "#c4384f", "#ffffff"), 3.3, .62); sg.position.set(0, 3.62, 1.04); g.add(sg);
    [-1.25, 1.25].forEach(x => { mesh(GEO.cyl(.3, .22, .5, 14), "#b5633f", x, .25, 1.75, g); mesh(new THREE.IcosahedronGeometry(.42, 1), MF("#4fae55"), x, .75, 1.75, g); });
    addBox(z.x, z.z - 1.5, 3.1, 2.6);
  },
  project(z, g) {
    const c = z.color, cat = z.p.category;
    mesh(GEO.cyl(2.2, 2.4, .3, 32), STONE, 0, .15, 0, g); mesh(GEO.cyl(1.6, 1.8, .6, 32), "#e3dac6", 0, .6, 0, g);
    mesh(GEO.tor(1.62, .05, 8, 48), CHROME, 0, .9, 0, g).rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + Math.PI / 4; mesh(GEO.box(.22, .1, .22), Bm(c), Math.cos(a) * 2, .33, Math.sin(a) * 2, g); }
    const holo = mesh(GEO.tor(2.05, .035, 8, 64), glow(Bm(c, .6)), 0, 2.7, 0, g); holo.rotation.x = Math.PI / 2 - .25; spinners.push(holo);
    if (cat === "Unity") spinners.push(mesh(GEO.box(2.2, 2.2, 2.2), c, 0, 2.6, 0, g));
    else if (cat === "Unreal") { mesh(GEO.cone(1.3, 5.5, 4), c, 0, 3.4, 0, g); const r = mesh(GEO.tor(1.7, .14), "#f3b94d", 0, 2.4, 0, g); r.rotation.x = Math.PI / 2; spinners.push(r); }
    else if (cat === "Web") { const t = mesh(GEO.tor(1.8, .35, 10, 40), c, 0, 2.9, 0, g); const f = mesh(GEO.disc(1.5), Bm(c, .35), 0, 2.9, 0, g); f.material.side = THREE.DoubleSide; spinners.push(t, f); }
    else { mesh(GEO.box(2.2, 3.6, 1.6), "#2a2433", 0, 2.2, 0, g); mesh(GEO.box(1.7, 1.2, .05), Bm(c), 0, 2.8, .83, g); mesh(GEO.box(1.6, .5, .5), c, 0, 1.6, .9, g); mesh(GEO.sph(.15), "#d43c55", -.3, 1.95, 1.0, g); }
    const gl = glyphSprite(z.p.glyph); gl.position.set(0, 6.4, 0); g.add(gl); floaters.push(gl);
    addCol(z.x, z.z, 2.35);
  },
  skills(z, g) { ["#41d3c9", "#2fb3a9", "#f3b94d", "#d43c55", "#7b5cff"].forEach((c, i) => mesh(GEO.cyl(1.9 - i * .28, 2 - i * .28, 1.3, 16), c, 0, .65 + i * 1.3, 0, g)); floaters.push(mesh(GEO.sph(.6), Bm("#fff3b0"), 0, 7.2, 0, g)); addCol(z.x, z.z, 2.1); },
  hobbies(z, g) {
    mesh(GEO.cyl(1.8, 2, .8, 20), "#d9cdb2", 0, .4, 0, g); flat(mesh(GEO.disc(1.5), Bm("#5ec8e8"), 0, .81, 0, g));
    (C.hobbies || []).slice(0, 6).forEach((h, i, a) => { const an = i / a.length * TAU, x = Math.cos(an) * 4.2, zz = Math.sin(an) * 4.2; mesh(GEO.cyl(.12, .12, 2.2, 6), "#8a5a35", x, 1.1, zz, g); const s = glyphSprite(h.icon, 1.6); s.position.set(x, 2.9, zz); g.add(s); floaters.push(s); addCol(z.x + x, z.z + zz, .35); });
    addCol(z.x, z.z, 2.1);
  },
  journey(z, g) {
    [-2.2, 2.2].forEach(x => { mesh(GEO.rbox(1.1, .4, 1.1, .05), STONE, x, .2, 0, g); mesh(GEO.rbox(.8, 4.2, .8, .08), STONE, x, 2.5, 0, g); mesh(GEO.rbox(1.05, .3, 1.05, .05), STONE, x, 4.65, 0, g); addCol(z.x + x, z.z, .75); });
    mesh(GEO.rbox(6, .7, 1.1, .1), STONE, 0, 5.1, 0, g);
    const ml = decal(signTex("MEMORY LANE", "#5c43d6", "#ffffff"), 3.6, .55); ml.position.set(0, 5.1, .57); g.add(ml);
    (C.journey || []).slice(0, 4).forEach((j, i) => { const s = canvasSprite(256, 64, (x, w) => { x.fillStyle = "#f6efe4"; rrect(x, 4, 4, w - 8, 56, 14); x.fill(); x.fillStyle = "#1a1420"; x.font = "700 30px Inter,system-ui"; x.textAlign = "center"; x.fillText(j.when, w / 2, 43); }, [2, .5, 1]); s.position.set(-3 + i * 2, .9, 3); g.add(s); });
  },
  pitch(z, g) {
    const pt = tex(64, 512, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#5fbf5a" : "#6ecd66"; x.fillRect(0, i * h / 8, w, h / 8); } speckle(x, w, h, 900, .06); });
    mesh(GEO.box(16, .06, 22), new THREE.MeshStandardMaterial({ map: pt, roughness: .95 }), 0, .04, 0, g);
    [[-7.8, 10.8], [7.8, 10.8], [-7.8, -10.8], [7.8, -10.8]].forEach(([x, zz]) => { mesh(GEO.cyl(.04, .04, 1.4, 6), "#f6f1e8", x, .7, zz, g); mesh(GEO.box(.02, .3, .45), Bm("#ff4060"), x, 1.25, zz + .22, g); });
    mesh(GEO.rbox(3, .12, .5, .04), WOOD, 0, .5, 12.2, g); [-1.2, 1.2].forEach(x => mesh(GEO.box(.1, .5, .4), IRON, x, .25, 12.2, g)); addCol(z.x, z.z + 12.2, .9);
    [[0, 11, 16, .3], [0, -11, 16, .3], [8, 0, .3, 22], [-8, 0, .3, 22], [0, 0, 16, .25]].forEach(([x, zz, w, d]) => mesh(GEO.box(w, .07, d), "#ffffff", x, .06, zz, g));
    [-2.6, 2.6].forEach(x => { mesh(GEO.cyl(.15, .15, 2.4, 8), "#ffffff", x, 1.2, -10, g); addCol(z.x + x, z.z - 10, .3); });
    mesh(GEO.box(5.5, .25, .25), "#ffffff", 0, 2.4, -10, g);
    const nt = tex(128, 64, (x, w, h) => { x.strokeStyle = "rgba(255,255,255,.9)"; x.lineWidth = 2; for (let i = 0; i <= w; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j <= h; j += 8) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } }, 2, 2);
    const nm = new THREE.MeshStandardMaterial({ map: nt, transparent: true, alphaTest: .3, side: THREE.DoubleSide, roughness: 1 });
    mesh(new THREE.PlaneGeometry(5.2, 2.3), nm, 0, 1.15, -11.25, g); [-2.65, 2.65].forEach(x => mesh(new THREE.PlaneGeometry(1.2, 2.3), nm, x, 1.15, -10.6, g).rotation.y = Math.PI / 2);
    z.goal = { x: z.x, z: z.z - 10 }; addBox(z.x, z.z - 11.25, 2.7, .12); addBox(z.x - 2.75, z.z - 10.6, .1, .7); addBox(z.x + 2.75, z.z - 10.6, .1, .7);
  },
  mailbox(z, g) {
    const red = PAINT("#c8202f");
    mesh(GEO.cyl(.66, .7, .25, 28), STONE, 0, .12, 0, g);
    mesh(GEO.cyl(.55, .55, 1.7, 32), red, 0, 1.1, 0, g);
    mesh(new THREE.SphereGeometry(.56, 32, 12, 0, TAU, 0, Math.PI / 2), red, 0, 1.95, 0, g);
    mesh(GEO.cyl(.59, .59, .12, 32), "#1a1a20", 0, 1.95, 0, g); mesh(GEO.sph(.08, 12, 8), "#1a1a20", 0, 2.5, 0, g);
    mesh(GEO.box(.46, .07, .12), "#1a1a20", 0, 1.62, .52, g);
    const pl = decal(signTex("POST", "#f3d36b", "#1a1a20", 256, 110, 72), .6, .26); pl.position.set(0, 1.2, .56); g.add(pl);
    z.flag = mesh(GEO.box(.08, .7, .4), "#f3b94d", .64, 2.05, -.2, g);
    addCol(z.x, z.z, .75);
  }
};
for (const z of zones) {
  const g = new THREE.Group(); g.position.set(z.x, 0, z.z); scene.add(g); z.g = g;
  if (z.kind !== "pitch") { mesh(GEO.cyl(z.r, z.r, .14, 48), PLAZA, 0, .07, 0, g); const ring = mesh(GEO.tor(z.r, .18, 6, 48), z.color, 0, .14, 0, g); ring.rotation.x = Math.PI / 2; }
  BUILD[z.kind](z, g);
  z.label = labelSprite(z.title, z.sub, z.color); z.label.position.set(0, z.kind === "skills" ? 9 : 8.2, 0); g.add(z.label);
}
const pitch = zones.find(z => z.kind === "pitch");

/* ---------- ramps (stunt jumps) ---------- */
const ramps = [], rampGeo = (() => { const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(6, 0), new THREE.Vector2(6, 1.5)]); const g = new THREE.ExtrudeGeometry(s, { depth: 4.6, bevelEnabled: false }); g.translate(-3, 0, -2.3); g.rotateY(-Math.PI / 2); return g; })();
for (let i = 0; i < 40 && ramps.length < 7; i++) {
  const s = rpick(segs), d = Math.hypot(s[1].x - s[0].x, s[1].z - s[0].z); if (d < 30) continue;
  const p = onRoad(s, rr(.3, .7)); const a = p.a + (R() < .5 ? Math.PI : 0);
  if (ramps.every(r => Math.hypot(r.x - p.x, r.z - p.z) > 25) && zones.every(q => Math.hypot(q.x - p.x, q.z - p.z) > q.r + 6)) {
    const m = mesh(rampGeo, new THREE.MeshStandardMaterial({ map: rampTex, roughness: .7 }), p.x, 0, p.z, scene); m.rotation.y = a; const rp = { x: p.x, z: p.z, s: Math.sin(a), c: Math.cos(a) }; ramps.push(rp);
    [-2.8, 2.8].forEach(lx => { const lz = -3.6, cx = rp.x + lx * rp.c + lz * rp.s, cz = rp.z - lx * rp.s + lz * rp.c; mesh(GEO.cone(.22, .6, 14), "#ff7a1a", cx, .35, cz, scene); mesh(GEO.cyl(.15, .17, .1, 14), Bm("#ffffff"), cx, .38, cz, scene); mesh(GEO.box(.45, .06, .45), "#1a1a20", cx, .03, cz, scene); addCol(cx, cz, .3); });
  }
}
function groundAt(x, z) { for (const r of ramps) { const dx = x - r.x, dz = z - r.z; const lz = dx * r.s + dz * r.c, lx = dx * r.c - dz * r.s; if (Math.abs(lx) < 2.3 && lz > -3 && lz < 3) return (lz + 3) / 6 * 1.5; } return 0; }

/* ---------- interactables: coffee stall, signposts ---------- */
const stall = (() => {
  for (let i = 0; i < 60; i++) { const a = R() * TAU, x = Math.cos(a) * 15, z = Math.sin(a) * 15; if (roadDist(x, z) > 5 && zones.every(q => Math.hypot(q.x - x, q.z - z) > q.r + 3)) return { x, z }; }
  return { x: 14, z: -10 };
})();
{ const g = new THREE.Group(); g.position.set(stall.x, 0, stall.z); g.rotation.y = Math.atan2(-stall.x, -stall.z); scene.add(g);
  mesh(GEO.rbox(3.2, 1.15, 1.4, .06), WOOD, 0, .58, 0, g); mesh(GEO.rbox(3.4, .1, 1.6, .03), "#f6efe4", 0, 1.2, 0, g);
  [-1.55, 1.55].forEach(x => [-.7, .7].forEach(zz => mesh(GEO.cyl(.05, .05, 2.8, 8), IRON, x, 1.4, zz, g)));
  for (let i = 0; i < 6; i++) mesh(GEO.rbox(.6, .1, 2.0, .03), i % 2 ? "#c4384f" : "#ffffff", -1.5 + i * .6, 2.85, 0, g).rotation.x = .1;
  [[-.9, .35], [-.4, .3], [.9, .3]].forEach(([x, r]) => { mesh(GEO.cyl(r, r * .9, .5, 18), CHROME, x, 1.5, -.2, g); mesh(GEO.cyl(r * 1.02, r * 1.02, .05, 18), "#2e3038", x, 1.77, -.2, g); });
  for (let i = 0; i < 4; i++) { mesh(GEO.cyl(.07, .055, .14, 12), CHROME, .1 + i * .18, 1.32, .4, g); }
  [-1, 1].forEach(x => { mesh(GEO.cyl(.22, .22, .08, 14), "#c4384f", x, .75, 1.25, g); mesh(GEO.cyl(.04, .04, .72, 6), IRON, x, .36, 1.25, g); });
  const sg = decal(signTex("FILTER COFFEE", "#3a2a20", "#f3d36b"), 2.4, .45); sg.position.set(0, 2.45, .82); g.add(sg);
  const s = glyphSprite("☕", 1.6); s.position.set(0, 3.8, 0); g.add(s); floaters.push(s);
  addCol(stall.x, stall.z, 1.8); }
const signs = [];
(WD.signs || []).slice(0, 8).forEach((text, i) => {
  for (let k = 0; k < 20; k++) {
    const s = rpick(segs), p = onRoad(s, rr(.2, .8), R() < .5 ? 5.2 : -5.2);
    if (signs.every(o => Math.hypot(o.x - p.x, o.z - p.z) > 20) && zones.every(q => Math.hypot(q.x - p.x, q.z - p.z) > q.r + 3)) {
      const g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = p.a; scene.add(g);
      mesh(GEO.box(.16, 2.4, .16), WOOD, 0, 1.2, 0, g); const ar = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-.9, -.35), new THREE.Vector2(.6, -.35), new THREE.Vector2(.95, 0), new THREE.Vector2(.6, .35), new THREE.Vector2(-.9, .35)]), { depth: .08, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 2 }); mesh(ar, WOOD, 0, 2.05, -.04, g); const st = decal(signTex("READ ME", "#f6efe4", "#3a2a20", 256, 96, 54), 1.2, .45); st.position.set(-.1, 2.05, .07); g.add(st);
      signs.push({ x: p.x, z: p.z, text }); addCol(p.x, p.z, .4); break;
    }
  }
});

/* ---------- collectibles: tokens + bugs ---------- */
const tokens = [];
for (let i = 0; i < 70 && tokens.length < 60; i++) {
  let x, z;
  if (i % 2) { const p = onRoad(rpick(segs), rr(.15, .85), rr(-1.5, 1.5)); x = p.x; z = p.z; } else { x = rr(-WR + 8, WR - 8); z = rr(-WR + 8, WR - 8); if (Math.hypot(x, z) > WR - 6 || !okSpot(x, z, .5)) continue; }
  tokens.push({ x, z, alive: true, ph: R() * TAU });
}
const coinTex = tex(128, 128, (x, w, h) => { x.fillStyle = "#e8b93a"; x.fillRect(0, 0, w, h); x.strokeStyle = "#b8862a"; x.lineWidth = 8; x.beginPath(); x.arc(64, 64, 52, 0, TAU); x.stroke(); x.fillStyle = "#b8862a"; x.font = "900 72px system-ui,sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("S", 64, 68); });
const GOLD = withEnv(new THREE.MeshStandardMaterial({ color: "#ffd04a", metalness: .65, roughness: .3, emissive: "#7a5200", emissiveIntensity: .45 })), GOLDF = withEnv(new THREE.MeshStandardMaterial({ map: coinTex, metalness: .6, roughness: .35, emissive: "#7a5200", emissiveIntensity: .35 }));
const tokMesh = new THREE.InstancedMesh(GEO.cyl(.5, .5, .12, 24), [GOLD, GOLDF, GOLDF], tokens.length); scene.add(tokMesh);
const bugs = [];
for (let i = 0; i < 8; i++) { const p = onRoad(rpick(segs), rr(.2, .8), rr(-1.5, 1.5)); bugs.push({ m: mesh(GEO.box(.7, .7, .7), Bm("#ff3bd4"), p.x, .7, p.z, scene), x: p.x, z: p.z, alive: true, ph: R() * 10 }); }

/* ---------- particles (confetti, hearts, sparks) ---------- */
const PN = 220, parts = [], pim = new THREE.InstancedMesh(GEO.box(.2, .2, .2), new THREE.MeshBasicMaterial({ color: "#ffffff" }), PN);
for (let i = 0; i < PN; i++) { parts.push({ life: 0 }); pim.setColorAt(i, col.set("#ffffff")); dummy.scale.setScalar(0); dummy.updateMatrix(); pim.setMatrixAt(i, dummy.matrix); }
pim.userData.noCast = 1; scene.add(pim); let pIdx = 0;
function burst(x, y, z, n = 30, colors = ["#ff6b8b", "#ffd166", "#41d3c9", "#7b5cff", "#ffffff"], power = 7) {
  for (let i = 0; i < n; i++) { const p = parts[pIdx], j = pIdx; pIdx = (pIdx + 1) % PN; Object.assign(p, { x, y, z, vx: (Math.random() - .5) * power, vy: Math.random() * power + 3, vz: (Math.random() - .5) * power, life: 1 + Math.random() }); pim.setColorAt(j, col.set(colors[i % colors.length])); }
  pim.instanceColor.needsUpdate = true;
}

/* ---------- vehicles ---------- */
const vehicles = [];
function plate(text) { return decal(signTex(text, "#f6f1e8", "#1a1a20", 256, 64, 40), .62, .16); }
function makeBike(color, x, z, yaw) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); scene.add(g); blob(g, 1.1);
  const wheels = [.95, -.95].map(zz => { const w = mesh(GEO.tor(.42, .13, 12, 28), TYRE, 0, .5, zz, body); w.rotation.y = Math.PI / 2; const rim = mesh(GEO.tor(.29, .035, 8, 24), CHROME, 0, 0, 0, w); for (let k = 0; k < 5; k++) mesh(GEO.box(.03, .56, .03), CHROME, 0, 0, 0, w).rotation.z = k / 5 * Math.PI; mesh(GEO.cyl(.08, .08, .16, 12), CHROME, 0, 0, 0, w).rotation.x = Math.PI / 2; return w; });
  [.95, -.95].forEach(zz => { const mg = mesh(new THREE.TorusGeometry(.52, .07, 6, 16, Math.PI * .7), PAINT(color), 0, .52, zz, body); mg.rotation.set(0, Math.PI / 2, Math.PI * .15); });
  mesh(GEO.rbox(.42, .55, 1.25, .12), PAINT(color), 0, .98, .05, body);
  mesh(GEO.rbox(.5, .32, .7, .14), PAINT(darkerHex(color)), 0, 1.3, .32, body);
  mesh(GEO.rbox(.36, .14, .85, .06), "#1b1b20", 0, 1.32, -.38, body);
  mesh(GEO.box(.08, .95, .08), CHROME, -.12, 1.0, .85, body).rotation.x = -.35; mesh(GEO.box(.08, .95, .08), CHROME, .12, 1.0, .85, body).rotation.x = -.35;
  mesh(GEO.box(.08, .08, .9), CHROME, 0, .6, -.5, body).rotation.x = .25;
  mesh(GEO.cyl(.04, .04, 1.0, 10), "#1b1b20", 0, 1.48, .72, body).rotation.z = Math.PI / 2;
  [-1, 1].forEach(s => { mesh(GEO.cyl(.012, .012, .3, 6), CHROME, s * .4, 1.62, .7, body); mesh(GEO.box(.14, .08, .02), CHROME, s * .4, 1.78, .7, body); });
  mesh(GEO.cyl(.16, .12, .14, 16), PAINT(darkerHex(color)), 0, 1.22, 1.12, body).rotation.x = Math.PI / 2; mesh(GEO.cyl(.13, .13, .02, 16), Bm("#fff6c2"), 0, 1.22, 1.2, body).rotation.x = Math.PI / 2;
  mesh(GEO.box(.3, .1, .06), Bm("#ff4060"), 0, 1.18, -.85, body);
  const pl = plate("KA 03 JK"); pl.position.set(0, .95, -.98); pl.rotation.y = Math.PI; body.add(pl);
  return { kind: "bike", name: "electric bike", g, body, wheels, wr: .5, x, z, y: 0, vy: 0, prevG: 0, yaw, speed: 0, r: 1.1, maxS: 30, turn: 3.2, seat: [0, .88, -.35], legs: -1.15, knees: 0, lean: true, probes: [[-.55, .62], [.55, .62]] };
}
function makeCar(color, x, z, yaw) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); scene.add(g); blob(g, 2.2);
  mesh(GEO.rbox(2.3, .75, 3.9, .28), PAINT(color), 0, .9, 0, body);
  mesh(GEO.rbox(2.2, .3, 1.3, .14), PAINT(color), 0, 1.35, 1.15, body);
  mesh(GEO.rbox(2.2, .3, .9, .14), PAINT(color), 0, 1.35, -1.45, body);
  mesh(GEO.rbox(2.36, .3, 3.95, .14), PAINT(darkerHex(color)), 0, .52, 0, body);
  mesh(GEO.box(2, .2, 1.4), "#1b1b20", 0, 1.3, -.35, body);
  [-.5, .5].forEach(x => { mesh(GEO.rbox(.75, .2, .7, .06), "#2a2433", x, 1.42, -.35, body); mesh(GEO.rbox(.75, .8, .18, .08), "#2a2433", x, 1.75, -.75, body); mesh(GEO.rbox(.45, .25, .14, .06), "#2a2433", x, 2.3, -.78, body); });
  const sw = mesh(GEO.tor(.2, .03, 8, 24), "#1b1b20", -.5, 1.75, .3, body); sw.rotation.x = -.6;
  mesh(GEO.box(2.1, .65, .06), GLASSM, 0, 1.82, .62, body).rotation.x = -.4; mesh(GEO.box(2.15, .05, .1), CHROME, 0, 2.12, .5, body).rotation.x = -.4;
  [-1, 1].forEach(s => { mesh(GEO.rbox(.12, .14, .22, .04), PAINT(color), s * 1.22, 1.55, .55, body); mesh(GEO.box(.02, .1, .17), CHROME, s * 1.29, 1.55, .55, body); });
  mesh(GEO.rbox(2.35, .25, .25, .1), CHROME, 0, .6, 2.0, body); mesh(GEO.rbox(2.35, .25, .25, .1), CHROME, 0, .6, -2.0, body);
  mesh(GEO.box(1.1, .28, .05), "#1b1b20", 0, .95, 1.96, body); for (let i = 0; i < 4; i++) mesh(GEO.box(1.05, .03, .06), CHROME, 0, .85 + i * .07, 1.97, body);
  [-.78, .78].forEach(x => { mesh(GEO.cyl(.17, .17, .06, 16), Bm("#fff6c2"), x, .97, 1.96, body).rotation.x = Math.PI / 2; mesh(GEO.rbox(.4, .14, .06, .03), Bm("#ff4060"), x, .97, -1.97, body); });
  const pf = plate("KA 03 JK 404"); pf.position.set(0, .62, 2.14); body.add(pf); const pb = plate("KA 03 JK 404"); pb.position.set(0, .62, -2.14); pb.rotation.y = Math.PI; body.add(pb);
  const wheels = [[-1.12, 1.25], [1.12, 1.25], [-1.12, -1.25], [1.12, -1.25]].map(([wx, wz]) => { const w = mesh(GEO.cyl(.48, .48, .36, 24), TYRE, wx, .48, wz, body); w.rotation.z = Math.PI / 2; mesh(GEO.cyl(.3, .3, .38, 20), CHROME, 0, 0, 0, w); for (let k = 0; k < 5; k++) mesh(GEO.box(.05, .39, .5), CHROME, 0, 0, 0, w).rotation.y = k / 5 * Math.PI; return w; });
  return { kind: "car", name: "convertible", g, body, wheels, wr: .48, spinAxis: "y", x, z, y: 0, vy: 0, prevG: 0, yaw, speed: 0, r: 1.9, maxS: 26, turn: 2.4, seat: [-.5, .75, -.35], legs: -1.45, knees: 0, lean: false, probes: [[-1.05, 1.15], [0, 1.15], [1.05, 1.15]] };
}
function darkerHex(c) { return "#" + new THREE.Color(c).multiplyScalar(.7).getHexString(); }
function spawnVehicle(fn, color, near) {
  for (let i = 0; i < 80; i++) {
    let x, z, yaw;
    if (near) { const a = R() * TAU; x = near.x + Math.cos(a) * (near.r + 4); z = near.z + Math.sin(a) * (near.r + 4); yaw = R() * TAU; }
    else { const p = onRoad(rpick(segs), rr(.2, .8), R() < .5 ? 3.6 : -3.6); x = p.x; z = p.z; yaw = p.a; }
    const o = { x, z }; if (!pushOut(o, 2.2) && vehicles.every(v => Math.hypot(v.x - x, v.z - z) > 6)) { const v = fn(color, x, z, yaw); vehicles.push(v); return v; }
  }
}
spawnVehicle(makeBike, "#f3f3f0", zones[0]); spawnVehicle(makeCar, "#d43c55", zones[0]);
spawnVehicle(makeBike, "#41d3c9"); spawnVehicle(makeCar, "#f3b94d"); if (!LOW) spawnVehicle(makeCar, "#7b5cff");
vehicles.forEach(v => { v.g.position.set(v.x, 0, v.z); v.g.rotation.y = v.yaw; });

/* ---------- street furniture + sky ---------- */
for (const z of zones) {
  if (z.kind === "pitch") continue;
  for (let k = 0; k < 2; k++) {
    for (let t = 0; t < 12; t++) {
      const a = R() * TAU, x = z.x + Math.cos(a) * (z.r + 2.2), zz = z.z + Math.sin(a) * (z.r + 2.2);
      if (roadDist(x, zz) < 5 || !zones.every(q => q === z || Math.hypot(q.x - x, q.z - zz) > q.r + 3)) continue;
      const o = { x, z: zz }; if (pushOut(o, 1)) continue;
      const g = new THREE.Group(); g.position.set(x, 0, zz); g.rotation.y = Math.atan2(z.x - x, z.z - zz); scene.add(g);
      for (let i = 0; i < 3; i++) mesh(GEO.rbox(1.7, .06, .16, .02), WOOD, 0, .52, -.18 + i * .18, g);
      for (let i = 0; i < 2; i++) mesh(GEO.rbox(1.7, .16, .05, .02), WOOD, 0, .75 + i * .2, -.32, g).rotation.x = -.15;
      [-.7, .7].forEach(bx => { mesh(GEO.box(.07, .5, .5), IRON, bx, .25, -.05, g); mesh(GEO.box(.07, .45, .07), IRON, bx, .75, -.34, g); });
      mesh(GEO.cyl(.25, .22, .8, 14), "#3f8f5a", 1.25, .4, 0, g); mesh(GEO.cyl(.27, .27, .06, 14), "#2e3038", 1.25, .82, 0, g);
      addCol(x, zz, .9); break;
    }
  }
}
const clouds = [];
for (let i = 0; i < 16; i++) {
  const g = new THREE.Group(); g.position.set(rr(-WR - 60, WR + 60), rr(42, 60), rr(-WR - 60, WR + 60)); g.userData.v = rr(.6, 1.6); scene.add(g); clouds.push(g);
  for (let k = 0, n = 4 + Math.floor(R() * 4); k < n; k++) { const c = mesh(GEO.sph(rr(3, 6), 14, 10), "#ffffff", rr(-6, 6), rr(-1, 1.5), rr(-3, 3), g); c.scale.y = .6; c.userData.noCast = 1; }
}

/* ---------- NPCs ---------- */
const W = C.wardrobe;
const npcs = [], names = (WD.npcNames || ["NPC"]).slice().sort(() => R() - .5);
function makeNPC(i) {
  const g = new THREE.Group(); scene.add(g); blob(g, .7);
  const skin = rpick(["#8b5a3c", "#a8714d", "#6e4329", "#c58c62", "#9a6646"]), shirt = rpick(["#41d3c9", "#f3b94d", "#7b5cff", "#d43c55", "#5cbf5f", "#ff9f43", "#f4f4f1"]), pants = rpick(["#2a2433", "#3b5a8a", "#5a5a66", "#c9b38c"]);
  const legs = [-1, 1].map(s => { const l = new THREE.Group(); l.position.set(s * .2, .75, 0); mesh(GEO.cap(.15, .35), pants, 0, -.35, 0, l); g.add(l); return l; });
  mesh(GEO.cap(.45, .45), shirt, 0, 1.3, 0, g);
  const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * .55, 1.55, 0); mesh(GEO.cap(.12, .4), shirt, 0, -.3, 0, a); mesh(GEO.sph(.13, 8, 6), skin, 0, -.6, 0, a); g.add(a); return a; });
  const head = new THREE.Group(); head.position.y = 2.25; g.add(head);
  mesh(GEO.sph(.55, 16, 12), skin, 0, 0, 0, head);
  [-.19, .19].forEach(x => mesh(GEO.sph(.07, 8, 6), "#1a1210", x, .05, .5, head));
  const hs = R();
  if (hs < .35) mesh(new THREE.SphereGeometry(.6, 16, 8, 0, TAU, 0, Math.PI / 2.2), rpick(["#1a1311", "#3a2a20", "#6b4128"]), 0, .05, -.02, head);
  else if (hs < .6) { mesh(new THREE.SphereGeometry(.6, 16, 8, 0, TAU, 0, Math.PI / 2), rpick(["#d43c55", "#41d3c9", "#2a2433"]), 0, .1, 0, head); mesh(GEO.cyl(.45, .45, .06, 16), "#2a2433", 0, .12, .35, head).scale.z = 1.2; }
  else if (hs < .8) { mesh(new THREE.SphereGeometry(.6, 16, 8, 0, TAU, 0, Math.PI / 2.2), "#1a1311", 0, .05, -.02, head); mesh(GEO.sph(.25, 10, 8), "#1a1311", 0, .62, -.25, head); }
  const p = rpick(zones);
  return { g, legs, knees: legs.map(l => l.add(new THREE.Group()).children.at(-1)), arms, head, name: names[i % names.length], x: p.x + rr(-p.r - 4, p.r + 4), z: p.z + rr(-p.r - 4, p.r + 4), y: 0, vy: 0, yaw: R() * TAU, tx: 0, tz: 0, wait: rr(0, 3), ph: R() * 10, kv: null };
}
for (let i = 0; i < (LOW ? 8 : 14); i++) { const n = makeNPC(i); pushOut(n, .6); npcs.push(n); }
function npcTarget(n) {
  if (Math.random() < .6) { const z = pick(zones); n.tx = z.x + (Math.random() - .5) * z.r * 2.4; n.tz = z.z + (Math.random() - .5) * z.r * 2.4; }
  else { const p = onRoad(pick(segs), Math.random(), (Math.random() < .5 ? 1 : -1) * 3.2); n.tx = p.x; n.tz = p.z; }
}
npcs.forEach(npcTarget);

/* ---------- animals: dogs, cows, birds ---------- */
const dogs = [];
for (let i = 0; i < 3; i++) {
  const g = new THREE.Group(); scene.add(g); blob(g, .6);
  const c = rpick(["#b0793f", "#d9b48a", "#5a3d2a", "#f1e6d4"]);
  mesh(GEO.cap(.3, .7), c, 0, .7, 0, g).rotation.x = Math.PI / 2;
  const head = mesh(GEO.sph(.33, 12, 10), c, 0, 1.05, .6, g);
  mesh(GEO.sph(.12, 8, 6), "#1a1210", 0, -.05, .32, head);
  [-1, 1].forEach(s => { const e = mesh(GEO.cone(.12, .3, 6), darkerHex(c), s * .18, .3, 0, head); e.rotation.z = -s * .4; mesh(GEO.sph(.05, 6, 4), "#1a1210", s * .12, .08, .28, head); });
  const tail = mesh(GEO.cap(.06, .35), c, 0, .95, -.55, g); tail.rotation.x = -.8;
  const legs = [[-.18, .38], [.18, .38], [-.18, -.38], [.18, -.38]].map(([x, z]) => mesh(GEO.cyl(.08, .08, .5, 6), c, x, .25, z, g));
  const home = i === 0 ? zones[0] : pick(zones.slice(1));
  dogs.push({ g, head, tail, legs, x: home.x + 6, z: home.z + 5, hx: home.x + 6, hz: home.z + 5, yaw: 0, ph: R() * 10, petted: false, tx: home.x, tz: home.z, wait: 0 });
}
const cows = [];
for (let i = 0; i < 2; i++) {
  const g = new THREE.Group(); scene.add(g); blob(g, 1.3);
  mesh(GEO.box(1.2, 1.1, 2.2), "#f6f1e8", 0, 1.3, 0, g);
  [[.4, 1.6, .5], [-.35, 1.2, -.4], [.2, 1.5, -.7]].forEach(([x, y, z]) => mesh(GEO.sph(.3, 8, 6), "#1a1420", x * 1.5, y, z, g).scale.set(.4, 1, 1));
  const head = mesh(GEO.box(.8, .75, .8), "#f6f1e8", 0, 1.7, 1.35, g); mesh(GEO.box(.7, .35, .3), "#f0a3a8", 0, -.2, .42, head);
  [-1, 1].forEach(s => mesh(GEO.cone(.08, .35, 6), "#f3e3c8", s * .32, .5, 0, head));
  [[-.4, .7], [.4, .7], [-.4, -.7], [.4, -.7]].forEach(([x, z]) => mesh(GEO.cyl(.13, .13, .8, 6), "#f6f1e8", x, .4, z, g));
  const p = onRoad(rpick(segs), rr(.3, .7), rr(-2, 2));
  cows.push({ g, x: p.x, z: p.z, hx: p.x, hz: p.z, yaw: R() * TAU, tx: p.x, tz: p.z, wait: 0 });
}
const birds = Array.from({ length: LOW ? 14 : 26 }, () => ({ r: rr(20, 120), a: R() * TAU, h: rr(16, 30), sp: rr(.05, .12) * (R() < .5 ? 1 : -1), cx: rr(-30, 30), cz: rr(-30, 30) }));
const birdMesh = new THREE.InstancedMesh(GEO.cone(.3, .9, 4), new THREE.MeshBasicMaterial({ color: "#2b2b35" }), birds.length); birdMesh.userData.noCast = 1; scene.add(birdMesh);

/* ---------- football ---------- */
const ball = { m: mesh(GEO.sph(.6, 16, 12), "#ffffff", pitch.x, .6, pitch.z, scene), x: pitch.x, z: pitch.z, vx: 0, vz: 0, y: .6, vy: 0, cool: 0 };
mesh(GEO.tor(.6, .06, 6, 20), "#1a1420", 0, 0, 0, ball.m); mesh(GEO.tor(.6, .06, 6, 20), "#1a1420", 0, 0, 0, ball.m).rotation.y = Math.PI / 2;

/* ---------- player (3D Jack) ---------- */
const look = randomLook(W);
const player = new THREE.Group(); scene.add(player);
const { g: jg, P: JP } = buildJack(W, look); const JS = .58; jg.scale.setScalar(JS); jg.position.y = 3.1 * JS; player.add(jg);
const pShadow = blob(player, .9);
const me = { x: 0, z: 6.5, y: 0, vy: 0, prevG: 0 };
let vx = 0, vz = 0, yaw = 0, phase = 0, lastStep = 0, edgeWarned = false, zoom = 1, driving = null, buffT = 0, airStart = 0;
player.position.set(me.x, 0, me.z);

/* ---------- input ---------- */
const keys = {};
addEventListener("keydown", e => {
  if (e.target.closest && e.target.closest("input,textarea,.drawer")) return;
  const k = e.key.toLowerCase(); if (keys[k] && ["e", "enter", " ", "f", "h"].includes(k)) return; keys[k] = true;
  if (k === "e" || k === "enter") { e.preventDefault(); interact(); }
  if (k === " ") { e.preventDefault(); if (dialogOpen) next(); else if (!driving) action2(); }
  if (/^[1-6]$/.test(k)) emote(+k - 1);
  if (k === "f") { if (driving) exitVehicle(); else if (target?.type === "vehicle") enterVehicle(target.obj); }
  if (k === "h" && driving) honk();
  if (e.key === "Escape") { if ($("#card").open) $("#card").close(); else if (dialogOpen) closeDialog(); }
  if (e.key.startsWith("Arrow")) e.preventDefault();
});
addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
addEventListener("wheel", e => { if (!started || e.target.closest?.(".drawer,dialog,.quests")) return; zoom = clamp(zoom * (1 + Math.sign(e.deltaY) * .08), .7, 1.7); }, { passive: true });
document.querySelectorAll("#emotes button").forEach((b, i) => b.addEventListener("click", () => emote(i)));
addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
const stick = { x: 0, y: 0, id: null, ox: 0, oy: 0 }, stickEl = $("#stick"), knob = $("#knob");
$("#pad").addEventListener("pointerdown", e => { stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stickEl.style.display = "block"; stickEl.style.left = e.clientX + "px"; stickEl.style.top = e.clientY + "px"; e.target.setPointerCapture(e.pointerId); });
$("#pad").addEventListener("pointermove", e => { if (e.pointerId !== stick.id) return; let dx = e.clientX - stick.ox, dy = e.clientY - stick.oy; const d = Math.hypot(dx, dy), m = 50; if (d > m) { dx = dx / d * m; dy = dy / d * m; } stick.x = dx / m; stick.y = dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`; });
const endStick = e => { if (e.pointerId !== stick.id) return; stick.id = null; stick.x = stick.y = 0; stickEl.style.display = "none"; knob.style.transform = ""; };
$("#pad").addEventListener("pointerup", endStick); $("#pad").addEventListener("pointercancel", endStick);
$("#act").addEventListener("click", () => interact());
$("#act2").addEventListener("click", () => dialogOpen ? next() : action2());

/* ---------- missions ---------- */
const projZones = zones.filter(z => z.kind === "project"), placeZones = zones.filter(z => ["skills", "hobbies", "journey"].includes(z.kind));
const Q = { hi: false, proj: new Set(), places: new Set(), done: false, tokens: 0, bugs: 0, bike: false, car: false, dogs: new Set(), goal: false, air: false, coffee: false };
const TOKEN_GOAL = 30;
const unlocked = () => Q.proj.size >= projZones.length;
const sideList = () => [
  [Q.tokens >= TOKEN_GOAL, `Collect ${TOKEN_GOAL} tokens (${Math.min(Q.tokens, TOKEN_GOAL)}/${TOKEN_GOAL})`], [Q.bugs >= bugs.length, `Squash bugs (${Q.bugs}/${bugs.length})`],
  [Q.bike, "Ride a bike"], [Q.car, "Drive a car"], [Q.dogs.size >= dogs.length, `Pet the dogs (${Q.dogs.size}/${dogs.length})`],
  [Q.goal, "Score a goal"], [Q.air, "Get 1s of airtime off a ramp"], [Q.coffee, "Drink filter coffee"]];
let sideOpen = !touch;
function renderQuests() {
  const li = (done, txt, locked) => `<li class="${done ? "done" : ""} ${locked ? "locked" : ""}"><span>${done ? "✅" : locked ? "🔒" : "⬜"}</span><span>${txt}</span></li>`;
  const side = sideList(), sd = side.filter(s => s[0]).length;
  $("#qlist").innerHTML = li(Q.hi, "Say hi at Singleton HQ") + li(unlocked(), `Visit my projects (${Q.proj.size}/${projZones.length})`) +
    li(Q.places.size >= placeZones.length, `Skills, hobbies & story (${Q.places.size}/${placeZones.length})`) + li(Q.done, "Reach the Post Office", !unlocked()) +
    `<li class="sidehead" id="sidehead">${sideOpen ? "▾" : "▸"} Side quests ${sd}/${side.length}</li>` + (sideOpen ? side.map(s => li(s[0], s[1])).join("") : "");
  $("#tok").textContent = Q.tokens;
}
$("#qlist").addEventListener("click", e => { if (e.target.closest("#sidehead")) { sideOpen = !sideOpen; renderQuests(); } });

/* ---------- dialog ---------- */
let dialogOpen = false, dq = [], dz = null, typing = null, full = "", talkingNPC = null;
const lineEl = $("#line");
function openDialog(lines, zone, who = "Jack") { dq = lines.slice(); dz = zone; dialogOpen = true; $("#who").textContent = who; $("#dialog").classList.add("show"); document.body.classList.add("talking"); next(); }
function closeDialog() { dialogOpen = false; $("#dialog").classList.remove("show"); document.body.classList.remove("talking"); clearInterval(typing); talkingNPC = null; const z = dz; dz = null; if (z) done(z); }
function next() {
  if (typing) { clearInterval(typing); typing = null; if (lineEl.textContent !== full) { lineEl.textContent = full; return; } }
  if (!dq.length) return closeDialog();
  const l = dq.shift(), t = typeof l === "string" ? l : l.t; full = t; lineEl.textContent = ""; let i = 0;
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

/* optional AI flavour line (same Cloudflare Worker as the chat) */
async function aiLine(z) {
  const u = C.chat?.workerUrl; if (!u || z.ai !== undefined) return z.ai;
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 3500);
    const facts = `${z.p.title} (${z.p.year}, ${z.p.engine}, ${z.p.status}): ${z.p.summary} ${z.p.details}`;
    const r = await fetch(u, { method: "POST", signal: ctl.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: P.name, persona: C.chat.persona, knowledge: facts, messages: [{ role: "user", content: `We're standing next to ${z.p.title} in your portfolio game world. Introduce it in ONE funny sentence.` }] }) });
    z.ai = r.ok ? (await r.json()).reply || null : null;
  } catch (e) { z.ai = null; }
  return z.ai;
}
function compass(dx, dz) { const a = Math.atan2(dx, -dz), i = Math.round(a / (Math.PI / 4)); return ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][(i + 8) % 8]; }
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
  if (z.kind === "pitch") return ["The Kickabout Pitch! Kick the ball into the goal. Yes, you can use the car. No, there's no referee."];
  if (z.kind === "mailbox") return unlocked() ? [...(WD.mailbox || []), { t: "Ready for the credits?", btn: { label: "🎉 Finish", act: () => closeDialog() } }]
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
function npcTalk(n) {
  const mb = zones.find(z => z.kind === "mailbox"), p = pick(C.projects);
  const pool = [...(WD.npc || []), `Have you seen ${p.title}? ${p.summary}`, `Psst — the Post Office is somewhere ${compass(mb.x - n.x, mb.z - n.z)} of here.`];
  talkingNPC = n; openDialog([`Hi, I'm ${n.name}.`, pick(pool)], null, n.name);
}

/* ---------- vehicles: enter / exit / honk ---------- */
function enterVehicle(v) {
  driving = v; v.vx = v.vz = 0; v.speed = 0; AU.engineOn(v); v.body.add(player); player.position.set(...v.seat); player.rotation.set(0, 0, 0); if (pShadow) pShadow.visible = false;
  JP.legs.forEach(l => l.rotation.x = v.legs); JP.knees.forEach(k => k.rotation.x = v.knees); JP.arms.forEach(a => a.rotation.x = -1.05); JP.elbows.forEach(e => e.rotation.x = -.45);
  if (v.kind === "bike") Q.bike = true; else Q.car = true;
  const pal = dogs.filter(d => !d.riding && d.mode === "follow").map(d => [d, Math.hypot(d.x - v.x, d.z - v.z)]).filter(([d, dd]) => dd < 30).sort((a, b) => a[1] - b[1])[0];
  if (pal) { const d = pal[0]; d.riding = v; v.dog = d; v.body.add(d.g); d.g.position.set(...(v.kind === "car" ? [.5, 1.5, -.35] : [0, 1.38, -.9])); d.g.rotation.set(0, 0, 0); d.legs.forEach(l => l.rotation.x = 0); setTimeout(() => { A.sfx("bark"); toast(v.kind === "car" ? "🐶 The dog hopped into the passenger seat. Road trip!" : "🐶 The dog jumped on the back seat. Hold on, buddy!"); }, 1600); }
  A.sfx("open"); toast(`🛵 You're on the ${v.name}! ${touch ? "Drag to drive · pull back to brake · 📯 honk · 💬 exit" : "WASD drive · S brake/reverse · Space drift · Shift boost · H honk · F exit"}`); renderQuests();
}
function exitVehicle() {
  const v = driving; if (!v) return; driving = null; v.vx = v.vz = 0; AU.engineOff();
  scene.add(player); JP.knees.forEach(k => k.rotation.x = 0); JP.elbows.forEach(e => e.rotation.x = 0);
  for (let k = 0; k < 8; k++) { const a = v.yaw + Math.PI / 2 + k * Math.PI / 4, t = { x: v.x + Math.sin(a) * (v.r + 1.3), z: v.z + Math.cos(a) * (v.r + 1.3) }; const blocked = pushOut(t, .7) || groundAt(t.x, t.z) > .1 || vehicles.some(o => o !== v && Math.hypot(o.x - t.x, o.z - t.z) < o.r + .8); if (!blocked || k === 7) { me.x = t.x; me.z = t.z; break; } }
  me.y = 0; me.vy = 0; if (pShadow) pShadow.visible = true;
  if (v.dog) { const d = v.dog; v.dog = null; d.riding = null; scene.add(d.g); const o = { x: me.x + 1.3, z: me.z + .9 }; pushOut(o, .5); d.x = o.x; d.z = o.z; d.g.position.set(d.x, 0, d.z); } yaw = v.yaw; v.speed = 0; A.sfx("click");
}
function honk() { A.sfx("honk"); mp?.send({ t: "h" }); if (driving.dog) setTimeout(() => A.sfx("bark"), 250); if (cows.some(c => Math.hypot(c.x - driving.x, c.z - driving.z) < 14)) setTimeout(() => { A.sfx("moo"); toast(`🐄 ${pick(WD.cow || ["Moo."])}`); }, 350); npcs.forEach(n => { if (Math.hypot(n.x - driving.x, n.z - driving.z) < 10 && !n.kv) n.vy = 5; }); }
function action2() { if (!started) return; if (driving) return honk(); if (me.y <= me.prevG + .05) { me.y += .1; me.vy = 10; A.sfx("jump"); } }

/* ---------- interaction targets ---------- */
let target = null;
function findTarget() {
  let best = null, bs = 1e9;
  const c = (type, obj, x, z, range, label) => { const d = Math.hypot(me.x - x, me.z - z), s = d / range; if (d < range && s < bs) { bs = s; best = { type, obj, label }; } };
  if (driving) { if (Math.abs(driving.speed) < 9) for (const z of zones) c("zone", z, z.x, z.z, z.r + 3, `Talk — ${z.title}`); return best; }
  for (const z of zones) c("zone", z, z.x, z.z, z.r + 1.5, `Talk — ${z.title}${z.visited ? " ✓" : ""}`);
  for (const n of npcs) c("npc", n, n.x, n.z, 2.8, `Chat — ${n.name}`);
  for (const d of dogs) c("dog", d, d.x, d.z, 2.6, d.mode === "follow" ? "Tell the dog to stay ✋" : d.mode === "stay" ? "Call the dog: follow me 🐾" : "Pet the dog 🐶");
  for (const w of cows) c("cow", w, w.x, w.z, 3.4, "Say hi to the cow 🐄");
  for (const s of signs) c("sign", s, s.x, s.z, 2.6, "Read the sign");
  c("stall", stall, stall.x, stall.z, 3.6, "Grab filter coffee ☕");
  for (const v of vehicles) if (!v.remote) c("vehicle", v, v.x, v.z, v.r + 2, `Ride the ${v.name} ${v.kind === "bike" ? "🏍️" : "🚗"}`);
  return best;
}
function interact() {
  if (!started || $("#card").open) return;
  if (dialogOpen) return next();
  const t = target;
  if (!t) { if (driving) exitVehicle(); return; }
  A.sfx("click");
  if (t.type === "zone") { if (driving) driving.speed = 0; talk(t.obj); }
  else if (t.type === "npc") npcTalk(t.obj);
  else if (t.type === "dog") { const d = t.obj; Q.dogs.add(d); d.petted = true; renderQuests();
    if (d.mode === "follow") { d.mode = "stay"; A.sfx("click"); toast("✋ Sit… stay. He'll wait right here. (E again to call him)"); }
    else { const was = d.mode; d.mode = "follow"; A.sfx("bark"); burst(d.x, 1.8, d.z, 14, ["#ff6b8b", "#ff9fb8"], 4); toast(was === "stay" ? "🐾 Here, boy! He's following you again." : `🐶 ${pick(WD.dog || ["Good boy!"])} He follows you now (E again: stay).`); } }
  else if (t.type === "cow") { A.sfx("moo"); toast(`🐄 ${pick(WD.cow || ["Moo."])}`); }
  else if (t.type === "sign") openDialog([t.obj.text], null, "Signpost");
  else if (t.type === "stall") { buffT = 20; Q.coffee = true; A.sfx("coin"); burst(stall.x, 2, stall.z, 16, ["#c9b38c", "#ffffff"], 4); toast(`☕ ${pick(WD.coffee || ["Coffee! Speed boost."])}`); renderQuests(); }
  else if (t.type === "vehicle") enterVehicle(t.obj);
}

/* ---------- intro / ending ---------- */
let started = false, t0 = 0, elapsed = 0;
$("#seedtxt").textContent = `World #${seed} · Jack is wearing: ${lookName(W, look)}`;
$("#mpnote").innerHTML = solo ? '🎲 Private world, just you. <a href="world.html">🌐 Join the live world</a>' : '🌐 Live world: other visitors show up here too. <a href="world.html?solo=1">🎲 Play a private world</a>';
$("#start").onclick = () => { $("#intro").hidden = true; $("#emotes").hidden = false; started = true; t0 = performance.now(); A.init(); A.apply(); A.sfx("open"); openDialog(WD.intro || ["Welcome to my world!"], null); };
$("#share").onclick = async () => { try { await navigator.clipboard.writeText(location.href); toast("World link copied — send someone your exact map!"); } catch (e) { toast(location.href); } };
const fmt = s => { s = Math.floor(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
function finish() {
  started = false; A.sfx("goal");
  for (let i = 0; i < 5; i++) setTimeout(() => burst(me.x + (Math.random() - .5) * 8, 4, me.z + (Math.random() - .5) * 8, 40, undefined, 10), i * 300);
  const sk = C.skills.flatMap(s => s.items).slice(0, 6).join(", "), side = sideList(), sd = side.filter(s => s[0]).length;
  setTimeout(() => {
    $("#endpanel").innerHTML = `<div class="seed">World #${esc(seed)} · ${fmt(elapsed)} · ${sd}/${side.length} side quests · 🪙 ${Q.tokens}</div>
    <h1>You now know <em>${esc(P.name)}</em></h1>
    <ul><li><b>${esc(P.title)}</b> from ${esc(P.location)} — ${esc(P.status.toLowerCase())}.</li>
    <li>${C.projects.length} projects, including ${esc(C.projects.slice(0, 3).map(p => p.title).join(", "))}.</li>
    <li>Toolkit: ${esc(sk)}.</li><li>Leads Singleton Games. Has excellent hair.</li></ul>
    <div class="actions"><a class="btn primary" href="mailto:${esc(P.email)}">✉ Email me</a><a class="btn" href="resume.html">Resume</a><a class="btn" href="portfolio.html">Portfolio</a><button class="btn" id="keepplay">🚗 Keep exploring</button><a class="btn" href="world.html">🌍 New world</a></div>`;
    $("#end").hidden = false; $("#keepplay").onclick = () => { $("#end").hidden = true; started = true; };
  }, 1400);
}

/* ---------- day / night ---------- */
const KF = [[0, "#a8dcea", 1.7, 2.3, 0], [.4, "#a8dcea", 1.7, 2.3, 0], [.48, "#f7b28a", 1.25, 1.4, .35], [.56, "#1d2547", .6, .3, 1], [.86, "#1d2547", .6, .3, 1], [.94, "#f2c9a0", 1.2, 1.3, .35], [1, "#a8dcea", 1.7, 2.3, 0]].map(k => [k[0], new THREE.Color(k[1]), k[2], k[3], k[4]]);
const lampOff = new THREE.Color("#6b6b74"), lampOn = new THREE.Color("#ffd77a"), winDay = new THREE.Color("#ffe7a3"), DAY = 300;
let night = 0;
function dayNight(t) {
  let i = 0; while (KF[i + 1][0] < t) i++;
  const a = KF[i], b = KF[i + 1], f = (t - a[0]) / (b[0] - a[0] || 1);
  skyC.copy(a[1]).lerp(b[1], f); scene.fog.color.copy(skyC);
  hemi.intensity = a[2] + (b[2] - a[2]) * f; sun.intensity = a[3] + (b[3] - a[3]) * f; night = a[4] + (b[4] - a[4]) * f;
  const gb = BLOOM ? 1 + night * 2.6 : 1; lampMat.color.copy(lampOff).lerp(lampOn, night).multiplyScalar(gb); glowMats.forEach(m => m.color.copy(winDay).lerp(lampOn, night).multiplyScalar(gb));
  cloudShade.material.opacity = .2 * (1 - night);
  $("#tod").textContent = night > .5 ? "🌙" : f > 0 && a[4] !== b[4] ? "🌇" : "☀️";
}

/* ---------- minimap ---------- */
const mm = $("#mini").getContext("2d"), MS = 280, msc = MS / ((WR + 12) * 2);
function drawMini() {
  mm.clearRect(0, 0, MS, MS); mm.save(); mm.beginPath(); mm.arc(MS / 2, MS / 2, MS / 2, 0, TAU); mm.clip();
  mm.fillStyle = night > .5 ? "#3d6a45" : "#7cc46b"; mm.fillRect(0, 0, MS, MS);
  const X = x => MS / 2 + x * msc, Z = z => MS / 2 + z * msc;
  mm.strokeStyle = "#555a66"; mm.lineWidth = 4; mm.beginPath(); for (const [a, b] of segs) { mm.moveTo(X(a.x), Z(a.z)); mm.lineTo(X(b.x), Z(b.z)); } mm.stroke();
  mm.fillStyle = "#5ec8e8"; for (const p of ponds) { mm.beginPath(); mm.arc(X(p.x), Z(p.z), p.r * msc, 0, TAU); mm.fill(); }
  for (const z of zones) {
    const locked = z.kind === "mailbox" && !unlocked();
    mm.fillStyle = locked ? "#6b6b74" : z.color; mm.beginPath(); mm.arc(X(z.x), Z(z.z), 8, 0, TAU); mm.fill();
    mm.lineWidth = 3; mm.strokeStyle = z.visited ? "#ffffff" : "rgba(14,11,18,.7)"; mm.stroke();
    if (z.visited) { mm.fillStyle = "#fff"; mm.font = "bold 11px system-ui"; mm.textAlign = "center"; mm.fillText("✓", X(z.x), Z(z.z) + 4); }
  }
  mm.fillStyle = "#ff3bd4"; for (const b of bugs) if (b.alive) mm.fillRect(X(b.x) - 2.5, Z(b.z) - 2.5, 5, 5);
  mm.fillStyle = "#ffffff"; for (const v of vehicles) if (v !== driving) mm.fillRect(X(v.x) - 3, Z(v.z) - 3, 6, 6);
  mm.fillStyle = "#6b4128"; mm.fillRect(X(stall.x) - 3, Z(stall.z) - 3, 6, 6);
  mm.fillStyle = "#41d3c9"; for (const r of remotes.values()) { mm.beginPath(); mm.arc(X(r.x), Z(r.z), 5.5, 0, TAU); mm.fill(); }
  mm.translate(X(me.x), Z(me.z)); mm.rotate(-(driving ? driving.yaw : yaw) + Math.PI); mm.fillStyle = "#1a1420"; mm.strokeStyle = "#fff"; mm.lineWidth = 2.5;
  mm.beginPath(); mm.moveTo(0, -10); mm.lineTo(7, 7); mm.lineTo(-7, 7); mm.closePath(); mm.fill(); mm.stroke();
  mm.restore();
}

/* ---------- emotes: quick reactions every Jack in this world can see ---------- */
const EMO = [["👋", "wave"], ["😂", "laugh"], ["❤️", "love"], ["👍", "nice"], ["💃", "dance"], ["❓", "huh"]];
const emoTex = EMO.map(([e]) => tex(128, 128, (x, w, h) => { x.fillStyle = "rgba(0,0,0,.18)"; x.beginPath(); x.arc(w / 2, h / 2 + 4, 52, 0, TAU); x.fill(); x.fillStyle = "#ffffff"; x.beginPath(); x.arc(w / 2, h / 2, 52, 0, TAU); x.fill(); x.font = "68px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(e, w / 2, h / 2 + 5); }));
const myEmo = { y: 4.5, t: 0, cd: 0 };
function playEmote(e, parent, i, loud = true) {
  if (!e.spr) { e.spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: emoTex[i], depthTest: false, transparent: true })); e.spr.renderOrder = 30; parent.add(e.spr); }
  else if (e.spr.parent !== parent) parent.add(e.spr);
  e.spr.material.map = emoTex[i]; e.i = i; e.t = 2.4; e.on = true;
  if (loud) A.sfx("pop");
  if (EMO[i][1] === "love") { const p = new THREE.Vector3(); parent.getWorldPosition(p); burst(p.x, 3, p.z, 12, ["#ff6b8b", "#ff9fb8", "#ffffff"], 3); }
}
function emote(i) {
  if (!started || dialogOpen || myEmo.cd > 0 || !EMO[i]) return; myEmo.cd = .7;
  playEmote(myEmo, player, i); mp?.send({ t: "e", i });
  if (EMO[i][1] === "wave") npcs.forEach(n => { if (!n.kv && Math.hypot(n.x - me.x, n.z - me.z) < 11) n.waveT = 1.4 + Math.random() * .8; });
  if (EMO[i][1] === "love") dogs.forEach(d => { if (!d.riding && Math.hypot(d.x - me.x, d.z - me.z) < 8) setTimeout(() => A.sfx("bark"), 300); });
}
function emoteAnim(e, P, body, dt, seated) {
  if (!e?.spr) return;
  if (dt) e.t -= dt;
  if (e.t <= 0) { if (e.on) { e.on = false; e.spr.visible = false; body.rotation.set(0, 0, 0); P.head.rotation.x = P.head.rotation.z = 0; } return; }
  const age = 2.4 - e.t, pop = Math.min(1, age * 7) * Math.min(1, e.t * 4), c = clock, kind = EMO[e.i][1];
  e.spr.visible = true; e.spr.position.y = e.y + age * .25; e.spr.scale.setScalar(1.9 * pop * (1 + Math.sin(age * 9) * .04));
  if (seated) return;
  if (kind === "wave") { P.arms[1].rotation.x = -2.7 + Math.sin(c * 14) * .35; }
  else if (kind === "laugh") { body.rotation.z = Math.sin(c * 32) * .07; P.head.rotation.x = -.25; P.arms.forEach(a => a.rotation.x = -.5); }
  else if (kind === "love") { P.arms.forEach(a => a.rotation.x = -1.3); P.head.rotation.z = Math.sin(c * 4) * .15; }
  else if (kind === "nice") { P.arms[0].rotation.x = -1.7; }
  else if (kind === "dance") { body.rotation.y = age * 7; body.position.y += Math.abs(Math.sin(c * 10)) * .25; P.arms[0].rotation.x = -2.5 + Math.sin(c * 10) * .5; P.arms[1].rotation.x = -2.5 - Math.sin(c * 10) * .5; }
  else if (kind === "huh") { P.head.rotation.z = .35; P.arms.forEach(a => a.rotation.x = -.9); }
}

/* ---------- the edge of the world: no walls, you just get whisked home ---------- */
function respawn() {
  const v = driving, p = { x: rr(-3, 3), z: v ? 17 : 9 }; pushOut(p, v ? 2 : .8);
  if (v) { Object.assign(v, { x: p.x, z: p.z, y: 0, prevG: 0, vy: 0, yaw: 0, vx: 0, vz: 0, speed: 0 }); v.g.position.set(v.x, 0, v.z); v.g.rotation.set(0, 0, 0); }
  me.x = p.x; me.z = p.z; me.y = 0; me.vy = 0; vx = vz = 0;
  for (const d of dogs) if (d.mode === "follow" && !d.riding) { d.x = p.x + 2; d.z = p.z + 1.5; }
  cam.position.x = me.x; cam.position.z = me.z + 16;
  burst(me.x, 1.5, me.z, 30, ["#7b5cff", "#41d3c9", "#ffffff"], 7); A.sfx("whoosh"); toast("🌀 Whoosh! Back to Singleton HQ.");
}
function surfaceAt(x, z) { if (roadDist(x, z) < 2.9) return "road"; for (const q of zones) if (Math.hypot(q.x - x, q.z - z) < q.r) return "stone"; return "grass"; }

/* ---------- natural audio: engine, tyres, footsteps, wind, birds, crickets (all on the SFX bus) ---------- */
const AU = (() => {
  let ctx = null, bus = null, nb = null, amb = null, eng = null, birdT = 2, crickT = 1;
  function ready() {
    if (ctx) return ctx.state === "running";
    if (!A.ctx || !A.bus) return false; ctx = A.ctx; bus = A.bus;
    nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const w = loopNoise("lowpass", 320, .7), wg = gain(.02); w.f.connect(wg).connect(bus); amb = { wf: w.f, wg };
    return ctx.state === "running";
  }
  const gain = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
  function loopNoise(type, fq, q) { const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = fq; f.Q.value = q; s.connect(f); s.start(0, Math.random() * 1.5); return { s, f }; }
  const out = () => { if (!ctx.createStereoPanner) return bus; const p = ctx.createStereoPanner(); p.pan.value = Math.random() * 1.6 - .8; p.connect(bus); return p; };
  function engineOn(v) {
    if (!ready() || eng) return;
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = gain(0); o1.type = "sawtooth"; o2.type = "sine";
    f.type = "lowpass"; f.frequency.value = 300; f.Q.value = 1.5; o1.connect(f); o2.connect(f); f.connect(g).connect(bus); o1.start(); o2.start();
    const tyre = loopNoise("bandpass", 1300, 1.4), tg = gain(0); tyre.f.connect(tg).connect(bus);
    const road = loopNoise("lowpass", 200, .5), rg = gain(0); road.f.connect(rg).connect(bus);
    eng = { o1, o2, f, g, tyre, tg, road, rg, base: v.kind === "bike" ? 62 : 40, bike: v.kind === "bike" };
  }
  function engine(v) {
    if (!eng || !ctx) return; const t = ctx.currentTime, sp = Math.min(1.4, Math.abs(v.speed) / v.maxS), th = Math.max(0, v.thr || 0);
    const fr = eng.base * (1 + sp * 2.1 + th * .2) * (1 + Math.sin(t * 7) * .004);
    eng.o1.frequency.setTargetAtTime(fr, t, .09); eng.o2.frequency.setTargetAtTime(fr * .5, t, .09);
    eng.f.frequency.setTargetAtTime(220 + sp * (eng.bike ? 1100 : 800) + th * 300, t, .12);
    eng.g.gain.setTargetAtTime((eng.bike ? .035 : .05) + sp * .045 + th * .03, t, .12);
    eng.tg.gain.setTargetAtTime(v.slip > 5 ? Math.min(.09, (v.slip - 5) * .015) : 0, t, .06);
    eng.rg.gain.setTargetAtTime(v.y > v.prevG + .05 ? 0 : sp * .08, t, .2);
  }
  function engineOff() { if (!eng) return; const e = eng, t = ctx.currentTime; eng = null; [e.g, e.tg, e.rg].forEach(g => g.gain.setTargetAtTime(0, t, .12)); setTimeout(() => [e.o1, e.o2, e.tyre.s, e.road.s].forEach(n => { try { n.stop(); } catch (_) {} }), 900); }
  function step(surf, k) {
    if (!ready()) return; const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = gain(0);
    s.buffer = nb; s.playbackRate.value = .8 + Math.random() * .4; f.type = "bandpass"; f.frequency.value = (surf === "road" ? 1500 : surf === "stone" ? 1900 : 900) * (.85 + Math.random() * .3); f.Q.value = surf === "grass" ? .7 : 1.6;
    const v = (surf === "grass" ? .1 : .13) * (.5 + k * .5), d = surf === "grass" ? .1 : .06;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .006); g.gain.exponentialRampToValueAtTime(.0005, t + d);
    s.connect(f).connect(g).connect(bus); s.start(t, Math.random() * 1.8, d + .02);
  }
  function bird() {
    const t = ctx.currentTime, o = out(), n = 2 + Math.floor(Math.random() * 4), f0 = 2300 + Math.random() * 1700, gap = .08 + Math.random() * .06, up = 1.25 + Math.random() * .5;
    for (let i = 0; i < n; i++) { const s = t + i * gap, osc = ctx.createOscillator(), g = gain(0); osc.type = "sine"; osc.frequency.setValueAtTime(f0, s); osc.frequency.exponentialRampToValueAtTime(f0 * up, s + .04); osc.frequency.exponentialRampToValueAtTime(f0 * .92, s + .08);
      g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(.022, s + .012); g.gain.exponentialRampToValueAtTime(.0005, s + .09); osc.connect(g).connect(o); osc.start(s); osc.stop(s + .11); }
  }
  function cricket() {
    const t = ctx.currentTime, o = out(), f0 = 4200 + Math.random() * 600;
    for (let i = 0; i < 3; i++) { const s = t + i * .045, osc = ctx.createOscillator(), g = gain(0); osc.type = "sine"; osc.frequency.value = f0;
      g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(.012, s + .006); g.gain.exponentialRampToValueAtTime(.0004, s + .035); osc.connect(g).connect(o); osc.start(s); osc.stop(s + .045); }
  }
  function ambience(dt, night, speed) {
    if (!ready()) return; const t = ctx.currentTime;
    amb.wg.gain.setTargetAtTime(.018 + Math.min(.05, speed * .0018), t, .6); amb.wf.frequency.setTargetAtTime(260 + speed * 14, t, .6);
    if ((birdT -= dt) <= 0) { birdT = 1.8 + Math.random() * 4.5; if (night < .5) bird(); }
    if ((crickT -= dt) <= 0) { crickT = .7 + Math.random() * .9; if (night > .5) cricket(); }
  }
  return { engineOn, engine, engineOff, step, ambience };
})();

/* ---------- post: soft bloom on lamps, windows and holograms (desktop) ---------- */
let composer = null;
if (BLOOM) {
  try {
    const rt = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt); composer.addPass(new RenderPass(scene, cam));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .5, .6, 1.25)); composer.addPass(new OutputPass());
  } catch (e) { composer = null; }
}

/* ---------- simulation helpers ---------- */
function vertical(o, dt, onLand) { // ground + ramps + gravity; returns true when airborne
  const g = groundAt(o.x, o.z);
  if (o.y <= g + .03) { o.vy = Math.max(0, (g - o.prevG) / Math.max(dt, 1e-3)); o.y = g; if (o.vy > 0 && g === 0) o.vy = 0; o.prevG = g; return false; }
  o.vy -= 30 * dt; o.y += o.vy * dt; o.prevG = g;
  if (o.y <= g) { o.y = g; o.vy = 0; onLand && onLand(); return false; }
  return true;
}
let crashCool = 0;

/* ---------- multiplayer: other visitors' Jacks (peer-to-peer, same world = same room) ---------- */
const remotes = new Map(), DUO = WD.duo || [];
let mp = null, duo = null, netT = 0;
const myName = lookName(W, look);
const SLOTS = [["top", "tops"], ["pants", "pants"], ["shoes", "shoes"], ["hat", "hats"], ["glasses", "glasses"], ["neck", "neck"], ["hand", "hand"]];
const cleanLook = l => Object.fromEntries(SLOTS.map(([k, list]) => [k, W[list].some(x => x.id === l?.[k]) ? l[k] : W[list][0].id]));
const num = (v, lo, hi) => { v = +v; return Number.isFinite(v) ? clamp(v, lo, hi) : 0; };
function updateOnline() { const el = $("#online"); if (!mp) { el.hidden = true; return; } el.hidden = false; el.textContent = remotes.size ? `🌐 ${remotes.size + 1} Jacks in this world` : "🌐 Live world · waiting for other Jacks"; }
function addRemote(id, lk) {
  if (remotes.has(id)) return remotes.get(id);
  const L = cleanLook(lk), g = new THREE.Group(); scene.add(g);
  const { g: body, P: RP } = buildJack(W, L); body.scale.setScalar(JS); body.position.y = 3.1 * JS; g.add(body);
  if (SHADOWS) body.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const name = lookName(W, L), tag = labelSprite("Another Jack", name, "#41d3c9"); tag.scale.set(4.4, 1.3, 1); tag.position.y = 4.4; g.add(tag);
  const r = { id, g, body, P: RP, name, x: me.x + 4, z: me.z + 2, y: 0, yaw: 0, tx: me.x + 4, tz: me.z + 2, ty: 0, tyaw: 0, veh: -1, seen: performance.now(), phase: 0, cool: 3 };
  g.position.set(r.x, 0, r.z); remotes.set(id, r);
  toast(`👋 Another Jack (${name}) just spawned into your world!`); A.sfx("open"); updateOnline(); return r;
}
function remoteLeaveVehicle(r) { const v = vehicles[r.veh]; if (v) v.remote = null; scene.add(r.g); r.P.legs.forEach(l => l.rotation.x = 0); r.P.arms.forEach(a => a.rotation.x = 0); r.veh = -1; }
function removeRemote(id) { const r = remotes.get(id); if (!r) return; if (r.veh >= 0) remoteLeaveVehicle(r); scene.remove(r.g); remotes.delete(id); if (duo?.r === r) endDuo(); toast(`💨 ${r.name} Jack left the world.`); updateOnline(); }
function onNet(id, d) {
  if (!d || typeof d !== "object") return;
  if (d.t === "hi") { addRemote(id, d.look); return; }
  if (d.t === "who") { mp?.send({ t: "hi", look }, id); return; }
  const r = remotes.get(id); if (!r) { if (d.t === "s") mp?.send({ t: "who" }, id); return; }
  r.seen = performance.now();
  if (d.t === "s") {
    r.tx = num(d.x, -WR - 5, WR + 5); r.tz = num(d.z, -WR - 5, WR + 5); r.ty = num(d.y, 0, 40); r.tyaw = num(d.r, -1e3, 1e3);
    const vi = Number.isInteger(d.v) && d.v >= 0 && d.v < vehicles.length ? d.v : -1;
    if (vi !== r.veh) {
      if (r.veh >= 0) remoteLeaveVehicle(r);
      const v = vehicles[vi];
      if (v && v !== driving && !v.remote) { v.remote = r; r.veh = vi; v.tx = r.tx; v.tz = r.tz; v.tyaw = r.tyaw; v.body.add(r.g); r.g.position.set(...v.seat); r.g.rotation.set(0, 0, 0); r.P.legs.forEach(l => l.rotation.x = v.legs); r.P.arms.forEach(a => a.rotation.x = -1); }
    }
    if (r.veh >= 0) { const v = vehicles[r.veh]; v.tx = r.tx; v.tz = r.tz; v.ty = r.ty; v.tyaw = r.tyaw; }
  } else if (d.t === "c" && Number.isInteger(d.i) && d.i >= 0 && d.i < DUO.length) startDuo(r, d.i, false);
  else if (d.t === "h" && Math.hypot(r.x - me.x, r.z - me.z) < 30) A.sfx("honk");
  else if (d.t === "e" && Number.isInteger(d.i) && d.i >= 0 && d.i < EMO.length) { r.emo = r.emo || { y: 5.6, t: 0 }; playEmote(r.emo, r.g, d.i, Math.hypot(r.x - me.x, r.z - me.z) < 30); }
}
// speech bubbles above heads for Jack-to-Jack chats (text only ever comes from our own script list)
const bub = document.createElement("div"); bub.className = "mpbub"; document.body.append(bub);
let bubObj = null; const tmpV = new THREE.Vector3();
function startDuo(r, i, iAmA) {
  if (duo) return; r.cool = 45;
  const a = iAmA ? myName : r.name, b = iAmA ? r.name : myName;
  duo = { r, i: 0, t: .4, lines: DUO[i].map(([sp, txt]) => ({ me: (sp === "A") === iAmA, text: txt.replaceAll("{A}", a).replaceAll("{B}", b) })) };
}
function endDuo() { duo = null; bubObj = null; bub.classList.remove("show"); }
function netTick(dt, now) {
  for (const r of [...remotes.values()]) {
    if (now - r.seen > 8000) { removeRemote(r.id); continue; }
    const k = 1 - Math.exp(-dt * 10);
    if (r.veh >= 0) {
      const v = vehicles[r.veh], ox = v.x, oz = v.z;
      v.x += (v.tx - v.x) * k; v.z += (v.tz - v.z) * k; v.y += ((v.ty || 0) - v.y) * k; v.yaw = lerpA(v.yaw, v.tyaw, k);
      v.g.position.set(v.x, v.y, v.z); v.g.rotation.y = v.yaw;
      const sp = Math.hypot(v.x - ox, v.z - oz) / Math.max(dt, 1e-3); v.wheels.forEach(w => w.rotation.x += sp * dt / v.wr); r.x = v.x; r.z = v.z;
    } else {
      const ox = r.x, oz = r.z; r.x += (r.tx - r.x) * k; r.z += (r.tz - r.z) * k; r.y += (r.ty - r.y) * k; r.yaw = lerpA(r.yaw, r.tyaw, k);
      const spd = Math.hypot(r.x - ox, r.z - oz) / Math.max(dt, 1e-3), mv = Math.min(1, spd / 8.5); r.phase += dt * (6 + spd * .9);
      const sw = Math.sin(r.phase) * mv; r.P.legs[0].rotation.x = sw * .75; r.P.legs[1].rotation.x = -sw * .75; r.P.arms[0].rotation.x = -sw * .6; r.P.arms[1].rotation.x = sw * .6;
      r.body.position.y = 3.1 * JS + Math.abs(Math.sin(r.phase)) * .18 * mv; r.g.position.set(r.x, r.y, r.z); r.g.rotation.y = r.yaw;
      emoteAnim(r.emo, r.P, r.body, 0, false);
      if (!driving) sep(me, r, 1.2, 1);
    }
    if (r.emo) { if (r.veh >= 0) emoteAnim(r.emo, r.P, r.body, 0, true); r.emo.t -= dt; }
    r.cool -= dt;
    if (!duo && r.cool <= 0 && mp && mp.me < r.id && Math.hypot(r.x - me.x, r.z - me.z) < 6 && DUO.length) { const i = Math.floor(Math.random() * DUO.length); mp.send({ t: "c", i }, r.id); startDuo(r, i, true); }
  }
  if (duo) {
    if (!remotes.has(duo.r.id)) endDuo();
    else if ((duo.t -= dt) <= 0) { const l = duo.lines[duo.i++]; if (!l) endDuo(); else { bubObj = l.me ? player : duo.r.g; bub.textContent = l.text; bub.classList.remove("show"); void bub.offsetWidth; bub.classList.add("show"); A.sfx("hover"); duo.t = 2.9; } }
  }
  if (bubObj) { bubObj.getWorldPosition(tmpV); tmpV.y += 4.3; tmpV.project(cam); bub.style.transform = `translate(${(tmpV.x * .5 + .5) * innerWidth}px,${(-tmpV.y * .5 + .5) * innerHeight}px) translate(-50%,-100%)`; }
  if (mp && mp.count && (netT -= dt) <= 0) { netT = .1; mp.send({ t: "s", x: +me.x.toFixed(2), z: +me.z.toFixed(2), y: +(driving ? driving.y : me.y).toFixed(2), r: +(driving ? driving.yaw : yaw).toFixed(3), v: driving ? vehicles.indexOf(driving) : -1 }); }
}
if (!solo && "RTCPeerConnection" in window) {
  const ph = url.searchParams.get("peerhost"), server = ph ? { host: ph.split(":")[0], port: +ph.split(":")[1] || 9000, path: "/", secure: false } : null;
  joinRoom("jackwalker728-world-" + hash(seed).toString(36), { server, onJoin: id => mp?.send({ t: "hi", look }, id), onLeave: removeRemote, onData: onNet })
    .then(m => { mp = m; if (m) { updateOnline(); m.send({ t: "hi", look }); } }).catch(() => {});
}

/* ---------- main loop ---------- */
let last = performance.now(), frame = 0, clock = 0, raf = 0;
function tick(now) {
  raf = requestAnimationFrame(tick);
  const dt = Math.min(.05, (now - last) / 1000); last = now; clock += dt; frame++; crashCool -= dt; buffT -= dt;
  const canMove = started && !dialogOpen && !$("#card").open;
  let ix = 0, iz = 0;
  if (canMove) {
    ix = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0) + stick.x;
    iz = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0) + stick.y;
    const l = Math.hypot(ix, iz); if (l > 1) { ix /= l; iz /= l; }
  }
  const mag = Math.hypot(ix, iz);

  if (driving) { // ----- vehicle physics: momentum + tyre grip, drift, brake & reverse (screen-relative steering)
    const v = driving, airborne = v.y > v.prevG + .05, hb = !!keys[" "];
    const max = v.maxS * (keys.shift ? 1.3 : 1) * (buffT > 0 ? 1.12 : 1), acc = v.acc || v.maxS * 1.05;
    const fx = Math.sin(v.yaw), fz = Math.cos(v.yaw);
    let f = v.vx * fx + v.vz * fz, l = v.vx * fz - v.vz * fx, yr = 0, thr = 0;
    if (!airborne) {
      if (mag > .1) {
        const want = Math.atan2(ix, iz), diff = angDiff(want, v.yaw);
        if (Math.abs(diff) > 2.3 && f > 2.5) { f = Math.max(0, f - 34 * mag * dt); thr = -1; }            // pull back while rolling = brake
        else if (Math.abs(diff) > 2.3) { yr = clamp(angDiff(want + Math.PI, v.yaw) * 3, -v.turn, v.turn) * clamp(-f / 4, .3, 1); f = Math.max(-8, f - acc * .6 * mag * dt); thr = .4; } // reverse
        else {
          const steer = clamp(Math.abs(f) / 7, .3, 1) * (1 - .3 * clamp(f / v.maxS, 0, 1)) * (hb ? 1.5 : 1);
          yr = clamp(diff * 4, -v.turn, v.turn) * steer;
          thr = mag * clamp(Math.cos(diff) * 1.4, .2, 1) * (hb ? .15 : 1);
          f += acc * thr * (1 - clamp(f / max, 0, 1.2) ** 2) * dt;
        }
      }
      if (thr <= 0 || hb) f *= Math.exp(-dt * (hb ? .8 : thr < 0 ? 0 : .75));
      f -= f * .06 * dt;
      l *= Math.exp(-dt * (hb ? 1.5 : Math.abs(yr) > v.turn * .8 && f > 15 ? 4 : v.kind === "bike" ? 11 : 8)); // tyres bite unless you yank it at speed or handbrake
      v.yaw += yr * dt;
    }
    v.vx = fx * f + fz * l; v.vz = fz * f - fx * l; v.thr = thr; v.slip = airborne ? 0 : Math.abs(l);
    const sp = Math.hypot(v.vx, v.vz), steps = Math.max(1, Math.ceil(sp * dt / .35)); let hit = false, nx = 0, nz = 0;
    for (let i = 0; i < steps; i++) {
      const ox = v.x, oz = v.z; v.x += v.vx * dt / steps; v.z += v.vz * dt / steps;
      if (groundAt(v.x, v.z) - v.y > .6) { v.x = ox; v.z = oz; nx -= v.vx; nz -= v.vz; hit = true; break; }
      const px = v.x, pz = v.z; if (probeHit(v)) { nx += v.x - px; nz += v.z - pz; hit = true; }
    }
    const bounce = (nx, nz, e) => { const vn = v.vx * nx + v.vz * nz; if (vn >= 0) return 0; v.vx -= (1 + e) * vn * nx; v.vz -= (1 + e) * vn * nz; return -vn; };
    if (hit) { const nl = Math.hypot(nx, nz); if (nl > 1e-5) { const imp = bounce(nx / nl, nz / nl, .25); v.vx *= .85; v.vz *= .85; if (imp > 9 && crashCool < 0) { crashCool = .8; burst(v.x + fx * v.r, .6, v.z + fz * v.r, 8, ["#e9e2d0", "#ffffff"], 3); } } }
    const push = (cx, cz, m) => { const dx = v.x - cx, dz = v.z - cz, d = Math.hypot(dx, dz); if (d >= m || d < 1e-3) return 0; v.x = cx + dx / d * m; v.z = cz + dz / d * m; return bounce(dx / d, dz / d, .3); };
    for (const o of vehicles) if (o !== v) push(o.x, o.z, v.r + o.r);
    for (const c of cows) if (push(c.x, c.z, v.r + 1.3) > 5 && crashCool < 0) { crashCool = 2; A.sfx("moo"); toast("🐄 The cow wins. The cow always wins."); }
    v.speed = v.vx * Math.sin(v.yaw) + v.vz * Math.cos(v.yaw);
    const lean = Math.min(1, Math.abs(v.speed) / 10);
    if (v.lean) v.body.rotation.z += (clamp(-yr * lean * .3, -.6, .6) - v.body.rotation.z) * Math.min(1, dt * 7);
    else { v.body.rotation.z += (clamp(yr * lean * .03, -.07, .07) - v.body.rotation.z) * Math.min(1, dt * 6); v.body.rotation.x += ((thr < 0 ? .045 : -thr * .025) - v.body.rotation.x) * Math.min(1, dt * 5); }
    if (v.slip > 5 && frame % 3 === 0) burst(v.x - fx * v.r * .8, .25, v.z - fz * v.r * .8, 2, ["#efefef", "#d6d6d6"], 1.2);
    AU.engine(v);
    const wasAir = airborne;
    const air = vertical(v, dt, () => { const t = (now - airStart) / 1000; if (t > .6) { toast(`🔥 Airtime ${t.toFixed(1)}s!`); A.sfx("jump"); burst(v.x, .5, v.z, 18, ["#ff8a3d", "#ffd166"], 6); } if (t >= 1) { Q.air = true; renderQuests(); } });
    if (air && !wasAir) airStart = now;
    v.g.position.set(v.x, v.y, v.z); v.g.rotation.y = v.yaw; v.g.rotation.x = air ? clamp(-v.vy * .02, -.35, .35) : 0;
    v.wheels.forEach(w => w.rotation.x += v.speed * dt / v.wr);
    me.x = v.x; me.z = v.z;
    JP.head.rotation.set(0, Math.sin(clock * .7) * .1, 0);
    jg.position.y = 3.1 * JS + Math.sin(clock * 20) * .015 * Math.min(1, Math.abs(v.speed) / 10);
  } else { // ----- on foot
    const sp = (keys.shift ? 13 : 8.5) * (buffT > 0 ? 1.4 : 1), k = 1 - Math.exp(-dt * 12);
    vx += (ix * sp - vx) * k; vz += (iz * sp - vz) * k;
    const ox = me.x, oz = me.z; me.x += vx * dt; me.z += vz * dt;
    if (groundAt(me.x, me.z) - me.y > .6) { me.x = ox; me.z = oz; }
    for (const n of npcs) if (!n.kv) sep(me, n, 1.15, .45);
    for (const d of dogs) if (!d.riding) sep(me, d, 1.05, .2);
    for (const c of cows) sep(me, c, 1.9, 1);
    avoidVehicles(me, .6); pushOut(me, .7);
    vertical(me, dt);
    player.position.set(me.x, me.y, me.z);
    const speed = Math.hypot(vx, vz), mv = Math.min(1, speed / 8.5);
    if (speed > .5) yaw = lerpA(yaw, Math.atan2(vx, vz), 1 - Math.exp(-dt * 12)); else if (dialogOpen || !started) yaw = lerpA(yaw, 0, 1 - Math.exp(-dt * 6));
    player.rotation.y = yaw; phase += dt * (6 + speed * .9);
    { const st = Math.sin(phase); if (mv > .15 && me.y <= me.prevG + .05 && st * lastStep < 0) AU.step(surfaceAt(me.x, me.z), mv); lastStep = st; }
    const sw = Math.sin(phase) * mv, airF = me.y > me.prevG + .05;
    JP.legs[0].rotation.x = airF ? -.6 : sw * .75; JP.legs[1].rotation.x = airF ? .4 : -sw * .75;
    JP.arms[0].rotation.x = airF ? -2.2 : -sw * .6; JP.arms[1].rotation.x = airF ? -2.2 : sw * .6;
    JP.knees[0].rotation.x = airF ? .9 : Math.max(0, sw) * 1.1; JP.knees[1].rotation.x = airF ? .5 : Math.max(0, -sw) * 1.1; JP.elbows.forEach(e => e.rotation.x = -.3);
    jg.position.y = 3.1 * JS + Math.abs(Math.sin(phase)) * .18 * mv + Math.sin(clock * 2.2) * .03 * (1 - mv);
    JP.head.rotation.set(0, Math.sin(clock * .7) * .15 * (1 - mv), Math.sin(phase) * .05 * mv);
    if (pShadow) { pShadow.position.y = .05 - me.y + groundAt(me.x, me.z); pShadow.scale.setScalar(Math.max(.4, 1 - (me.y - groundAt(me.x, me.z)) * .15)); }
  }
  { const ent = driving || me, dc = Math.hypot(ent.x, ent.z);
    if (started && dc > WR - 14 && !edgeWarned) { edgeWarned = true; toast("🌄 Edge of Jack's world ahead. Keep going and you'll be whisked back to HQ."); }
    if (dc < WR - 30) edgeWarned = false;
    if (dc > WR + 6) respawn(); }
  emoteAnim(myEmo, JP, jg, dt, !!driving);
  { const hs = 1 + Math.abs(Math.sin(clock * 4)) * .015; JP.hair.scale.set(hs, hs * JP.hairBaseY, hs); }
  const bt = clock % 4; JP.eyes.forEach(e => e.scale.y = bt < .12 ? .1 : 1);
  const mover = driving || { x: me.x, z: me.z, speed: Math.hypot(vx, vz), r: .7, yaw };
  if (started) AU.ambience(dt, night, Math.abs(mover.speed || 0));
  cloudTex.offset.x += dt * .0035; cloudTex.offset.y += dt * .0012; myEmo.cd -= dt;

  // ----- NPCs
  for (const n of npcs) {
    const dP = Math.hypot(n.x - me.x, n.z - me.z);
    if (n.kv) { n.x += n.kv.x * dt; n.z += n.kv.z * dt; n.g.rotation.x += dt * 8; pushOut(n, .6); }
    else if (talkingNPC === n || n.waveT > 0 || (dP < 3.2 && !driving)) { n.yaw = lerpA(n.yaw, Math.atan2(me.x - n.x, me.z - n.z), dt * 6); n.legs.forEach(l => l.rotation.x *= .8); if (n.waveT > 0) { n.waveT -= dt; n.arms[1].rotation.x = n.waveT > 0 ? -2.7 + Math.sin(clock * 14) * .35 : 0; } }
    else if (n.wait > 0) { n.wait -= dt; n.arms[1].rotation.z = Math.sin(clock * 3 + n.ph) * .2; }
    else {
      const dx = n.tx - n.x, dz = n.tz - n.z, d = Math.hypot(dx, dz);
      if (d < 1) { n.wait = 2 + Math.random() * 5; npcTarget(n); }
      else { n.x += dx / d * 2.4 * dt; n.z += dz / d * 2.4 * dt; n.yaw = lerpA(n.yaw, Math.atan2(dx, dz), dt * 5); if (pushOut(n, .6)) { n.stuck = (n.stuck || 0) + dt; if (n.stuck > 2) { n.stuck = 0; npcTarget(n); } } }
      const s = Math.sin(clock * 8 + n.ph); n.legs[0].rotation.x = s * .6; n.legs[1].rotation.x = -s * .6; n.knees[0].rotation.x = Math.max(0, s) * .9; n.knees[1].rotation.x = Math.max(0, -s) * .9; n.arms[0].rotation.x = -s * .5; n.arms[1].rotation.x = s * .5;
    }
    if (driving && !n.kv && Math.hypot(n.x - driving.x, n.z - driving.z) < driving.r + .7 && Math.abs(driving.speed) > 6) {
      const dx = n.x - driving.x, dz = n.z - driving.z, d = Math.hypot(dx, dz) || 1, f = Math.abs(driving.speed) * .7;
      n.kv = { x: dx / d * f, z: dz / d * f }; n.vy = 9; driving.vx *= .6; driving.vz *= .6; if (crashCool < 0) { crashCool = 1.5; toast(`😵 ${n.name}: "My hitbox! I'll respawn, don't worry."`); }
    }
    for (const m of npcs) if (m !== n && !m.kv) sep(n, m, 1.1, .5);
    if (!n.kv) { avoidVehicles(n, .55); pushOut(n, .55); }
    if (n.vy || n.y > 0) { n.vy -= 30 * dt; n.y += n.vy * dt; if (n.y <= 0) { n.y = 0; n.vy = 0; if (n.kv) { n.kv = null; n.g.rotation.x = 0; } } }
    n.g.position.set(n.x, n.y, n.z); n.g.rotation.y = n.yaw;
  }
  // ----- dogs: a petted dog follows you; tell it to stay and it sits and waits; strays wander and sniff
  for (const d of dogs) {
    if (d.riding) { d.tail.rotation.y = Math.sin(clock * 22) * .6; d.head.rotation.y = Math.sin(clock * 1.3) * .4; continue; }
    const dP = Math.hypot(d.x - me.x, d.z - me.z); let tx, tz, sp = 0;
    if (d.mode === "follow") {
      if (dP > 45) { const a = (driving ? driving.yaw : yaw) + Math.PI, o = { x: me.x + Math.sin(a) * 4, z: me.z + Math.cos(a) * 4 }; pushOut(o, .5); d.x = o.x; d.z = o.z; }
      else if (dP > 2.6) { tx = me.x; tz = me.z; sp = Math.min(driving ? 16 : 10, dP * 1.6); if (frame % 420 === 0 && dP < 10) A.sfx("bark"); }
    } else if (d.mode === "stay") d.yaw = lerpA(d.yaw, Math.atan2(me.x - d.x, me.z - d.z), dt * 3);
    else if (dP < 7 && dP > 2.4 && !driving) { tx = me.x; tz = me.z; sp = 3.5; }
    else if (d.wait > 0) d.wait -= dt;
    else { const dd = Math.hypot(d.tx - d.x, d.tz - d.z); if (dd < 1) { d.tx = d.hx + (Math.random() - .5) * 16; d.tz = d.hz + (Math.random() - .5) * 16; d.wait = 1 + Math.random() * 3; } else { tx = d.tx; tz = d.tz; sp = 3; } }
    if (sp) { const dx = tx - d.x, dz = tz - d.z, dd = Math.hypot(dx, dz) || 1; d.x += dx / dd * sp * dt; d.z += dz / dd * sp * dt; d.yaw = lerpA(d.yaw, Math.atan2(dx, dz), dt * 8); avoidVehicles(d, .5); pushOut(d, .5); }
    d.sit = (d.sit || 0) + ((d.mode === "stay" ? 1 : 0) - (d.sit || 0)) * Math.min(1, dt * 6);
    const run = sp > 0 ? 1 : 0, s = Math.sin(clock * 14 + d.ph) * run;
    d.legs.forEach((l, i) => l.rotation.x = (i % 2 ? s : -s) * .6 - (i > 1 ? d.sit * 1.1 : 0));
    d.tail.rotation.y = Math.sin(clock * (dP < 6 ? 22 : 8)) * .6;
    d.g.position.set(d.x, Math.abs(s) * .08 + d.sit * .12, d.z); d.g.rotation.y = d.yaw; d.g.rotation.x = -d.sit * .38;
  }
  // ----- cows: slow and unbothered
  for (const c of cows) {
    if (c.wait > 0) c.wait -= dt;
    else { const dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz); if (d < .5) { c.tx = c.hx + (Math.random() - .5) * 14; c.tz = c.hz + (Math.random() - .5) * 14; c.wait = 3 + Math.random() * 6; } else { c.x += dx / d * 1 * dt; c.z += dz / d * 1 * dt; c.yaw = lerpA(c.yaw, Math.atan2(dx, dz), dt * 2); pushOut(c, 1.2); } }
    c.g.position.set(c.x, 0, c.z); c.g.rotation.y = c.yaw;
  }
  // ----- birds
  birds.forEach((b, i) => { b.a += b.sp * dt; dummy.position.set(b.cx + Math.cos(b.a) * b.r, b.h + Math.sin(clock * 2 + i) * .5, b.cz + Math.sin(b.a) * b.r); dummy.rotation.set(Math.PI / 2, 0, -b.a - (b.sp > 0 ? 0 : Math.PI)); dummy.scale.set(1 + Math.sin(clock * 12 + i) * .4, 1, 1); dummy.updateMatrix(); birdMesh.setMatrixAt(i, dummy.matrix); });
  birdMesh.instanceMatrix.needsUpdate = true;
  // ----- football
  {
    const b = ball, dx = b.x - mover.x, dz = b.z - mover.z, d = Math.hypot(dx, dz), m = mover.r + .6;
    if (d < m && d > 1e-3) { const sp = Math.max(6, Math.abs(mover.speed) * 1.25); b.vx = dx / d * sp; b.vz = dz / d * sp; b.vy = Math.min(8, sp * .25); A.sfx("kick"); }
    const ox = b.x, oz = b.z;
    const bs = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vz) * dt / .3));
    for (let i = 0; i < bs; i++) {
      b.x += b.vx * dt / bs; b.z += b.vz * dt / bs; const bo = { x: b.x, z: b.z };
      if (pushOut(bo, .6)) { const nx = bo.x - b.x, nz = bo.z - b.z, nl = Math.hypot(nx, nz) || 1, dot = (b.vx * nx + b.vz * nz) / nl; if (dot < 0) { b.vx -= 1.6 * dot * nx / nl; b.vz -= 1.6 * dot * nz / nl; } b.x = bo.x; b.z = bo.z; }
      avoidVehicles(b, .6);
    }
    b.vx *= Math.exp(-dt * .9); b.vz *= Math.exp(-dt * .9);
    b.vy -= 25 * dt; b.y += b.vy * dt; if (b.y < .6) { b.y = .6; b.vy = Math.abs(b.vy) > 2 ? -b.vy * .45 : 0; }
    b.m.position.set(b.x, b.y, b.z); b.m.rotation.x += b.vz * dt / .6; b.m.rotation.z -= b.vx * dt / .6;
    const gz = pitch.goal; b.cool -= dt;
    if (b.cool < 0 && Math.abs(b.x - gz.x) < 2.4 && oz >= gz.z && b.z < gz.z && b.y < 2.4) {
      b.cool = 2; A.sfx("goal"); burst(gz.x, 2, gz.z, 50, undefined, 9); toast("⚽ GOOOAL! The crowd (of NPCs) goes wild."); Q.goal = true; renderQuests();
      setTimeout(() => { b.x = pitch.x; b.z = pitch.z; b.vx = b.vz = 0; }, 1600);
    }
    if (Math.hypot(b.x - pitch.x, b.z - pitch.z) > 45 && b.cool < 0) { b.x = pitch.x; b.z = pitch.z; b.vx = b.vz = 0; }
  }
  // ----- tokens
  tokens.forEach((t, i) => {
    if (t.alive && started && Math.hypot(me.x - t.x, me.z - t.z) < (driving ? driving.r + .6 : 1.3)) { t.alive = false; Q.tokens++; A.sfx("coin"); burst(t.x, 1.2, t.z, 6, ["#f3c94d", "#fff3b0"], 3); if (Q.tokens === TOKEN_GOAL) toast(`🪙 ${TOKEN_GOAL} tokens! Side quest complete.`); renderQuests(); }
    dummy.position.set(t.x, 1.1 + Math.sin(clock * 3 + t.ph) * .2, t.z); dummy.rotation.set(Math.PI / 2, 0, clock * 3 + t.ph); dummy.scale.setScalar(t.alive ? 1 : 0); dummy.updateMatrix(); tokMesh.setMatrixAt(i, dummy.matrix);
  });
  tokMesh.instanceMatrix.needsUpdate = true;
  // ----- bugs
  for (const b of bugs) {
    if (!b.alive) continue;
    b.m.rotation.y += dt * 3; b.m.position.y = .7 + Math.abs(Math.sin(clock * 5 + b.ph)) * .5;
    if (frame % 6 === 0) b.m.material.color.setHSL((clock * .5 + b.ph) % 1, .9, .6);
    if (started && Math.hypot(me.x - b.x, me.z - b.z) < (driving ? driving.r + .8 : 1.4)) { b.alive = false; scene.remove(b.m); Q.bugs++; A.sfx("pop"); burst(b.x, 1, b.z, 20, ["#ff3bd4", "#41d3c9"], 6); toast(`🐛 ${pick(WD.bugs || ["Bug squashed!"])} (${Q.bugs}/${bugs.length})`); renderQuests(); }
  }
  // ----- particles
  let anyP = false;
  parts.forEach((p, i) => { if (p.life <= 0) return; anyP = true; p.life -= dt; p.vy -= 15 * dt; p.x += p.vx * dt; p.y = Math.max(.1, p.y + p.vy * dt); p.z += p.vz * dt; dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(p.life * 5, p.life * 3, 0); dummy.scale.setScalar(p.life > 0 ? Math.min(1, p.life) : 0); dummy.updateMatrix(); pim.setMatrixAt(i, dummy.matrix); });
  if (anyP || frame % 30 === 0) pim.instanceMatrix.needsUpdate = true;
  for (const c of clouds) { c.position.x += dt * c.userData.v; if (c.position.x > WR + 80) c.position.x = -WR - 80; }
  // ----- world anim
  for (const s of spinners) s.rotation.y += dt * .8;
  floaters.forEach((f, i) => f.position.y += Math.sin(clock * 2 + i) * .004);
  for (const z of zones) if (z.flag) z.flag.rotation.z = unlocked() ? -1.2 : 0;
  if (frame % 10 === 0) dayNight(((clock / DAY) + .08) % 1);
  netTick(dt, now);
  // ----- proximity / prompt / HUD
  if (frame % 4 === 0) {
    target = started ? findTarget() : null;
    for (const z of zones) z.label.material.opacity = clamp((40 - Math.hypot(me.x - z.x, me.z - z.z)) / 12, 0, 1);
    const pr = $("#prompt");
    if (started && !dialogOpen && (target || driving)) {
      const kE = touch ? "💬" : "E";
      pr.textContent = driving ? (target ? `${kE} — ${target.label} · ` : "") + (touch ? "💬 exit · 📯 honk" : "F exit · H honk · Shift boost") : `${kE} — ${target.label}`;
      pr.classList.add("show");
    } else pr.classList.remove("show");
    $("#act").textContent = driving && !target ? "🚪" : target?.type === "vehicle" ? "🚗" : target?.type === "dog" ? "🐶" : target?.type === "stall" ? "☕" : "💬";
    $("#act2").textContent = driving ? "📯" : "⤴";
    $("#boost").hidden = !(buffT > 0);
  }
  if (frame % 8 === 0) drawMini();
  if (started && frame % 30 === 0) { elapsed = (now - t0) / 1000; $("#timer").textContent = fmt(elapsed); }
  if (SHADOWS) { sun.position.set(me.x + 30, 60, me.z + 20); sun.target.position.set(me.x, 0, me.z); }
  // ----- camera follows (pulls back with speed, looks ahead)
  const spd = Math.abs(mover.speed || 0), kz = Math.min(1, spd / 26);
  const offY = ((touch ? 17 : 13.5) + kz * 9) * zoom, offZ = ((touch ? 19 : 16) + kz * 8) * zoom;
  const ax = driving ? Math.sin(driving.yaw) * driving.speed * .35 : 0, az = driving ? Math.cos(driving.yaw) * driving.speed * .35 : 0;
  const tx = me.x + ax, tz = me.z + az, kc = 1 - Math.exp(-dt * 4);
  cam.position.x += (tx - cam.position.x) * kc; cam.position.y += (offY - cam.position.y) * kc; cam.position.z += (tz + offZ - cam.position.z) * kc;
  cam.lookAt(cam.position.x, 1.2, cam.position.z - offZ + .5);
  if (composer) composer.render(); else renderer.render(scene, cam);
}
function avoidVehicles(o, r) { for (const v of vehicles) { if (v === driving) continue; const dx = o.x - v.x, dz = o.z - v.z, d = Math.hypot(dx, dz), m = v.r + r; if (d < m && d > 1e-3) { o.x = v.x + dx / d * m; o.z = v.z + dz / d * m; } } }
function lerpA(a, b, t) { return a + angDiff(b, a) * t; }
function resize() { renderer.setSize(innerWidth, innerHeight, false); composer?.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
addEventListener("resize", resize); resize();
cam.position.set(me.x, 13.5, me.z + 16);
document.addEventListener("visibilitychange", () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } });
scene.traverse(o => { if (!o.isMesh) return; o.receiveShadow = true; if (!SHADOWS || o.userData.noCast || o.castShadow) return; const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox(); if ((g.boundingBox.max.y - g.boundingBox.min.y) * o.scale.y > .2) o.castShadow = true; });
dayNight(.08); renderQuests(); drawMini();
$("#loading").remove();
raf = requestAnimationFrame(tick);
if (url.searchParams.has("debug")) window.__world = { get remotes() { return remotes; }, get mp() { return mp; }, get duo() { return duo; }, get frame() { return frame; }, pen: (x, z, r) => { const o = { x, z }; pushOut(o, r); return Math.hypot(o.x - x, o.z - z); }, rampY: (x, z) => groundAt(x, z), ramps, get near() { return target?.type === "zone" ? target.obj : null; }, get target() { return target; }, zones, bugs, tokens, vehicles, npcs, dogs, ball, pitch, Q, me, tp: (x, z) => { if (driving) { driving.x = x; driving.z = z; } else { me.x = x; me.z = z; } }, enter: v => enterVehicle(v), exit: () => exitVehicle(), get driving() { return driving; }, talk: z => talk(z), next: () => next(), get dialogOpen() { return dialogOpen; }, keys, emote, myEmo, respawn, tod: t => { clock = ((t - .08 + 1) % 1) * DAY; }, get clock() { return clock; }, get zoom() { return zoom; }, set zoom(z) { zoom = z; } };
