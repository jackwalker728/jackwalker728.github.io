/* Jack's World v2 — big procedural open world: roads, vehicles, NPCs, animals, day/night, collectibles, physics toys.
   Three.js, toon style, instanced decor, mobile-friendly. Content comes from data/content.js. */
import { buildJack, randomLook, lookName, getEnv, THREE } from "./jack3d.js";

const { C, A, $, esc, pick, toast } = window.Jack;
const WD = C.world || {}, P = C.profile, TAU = Math.PI * 2;
const touch = matchMedia("(pointer: coarse)").matches;
const LOW = touch || (navigator.hardwareConcurrency || 8) <= 4;
if (touch) document.body.classList.add("is-touch");
const WR = 140; // playable radius
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function probeHit(v) { let hit = false; const s = Math.sin(v.yaw), c = Math.cos(v.yaw); for (const [off, r] of v.probes) { const p = { x: v.x + s * off, z: v.z + c * off }, ox = p.x, oz = p.z; if (pushOut(p, r)) { v.x += p.x - ox; v.z += p.z - oz; hit = true; } } return hit; }
const angDiff = (a, b) => ((a - b + Math.PI) % TAU + TAU) % TAU - Math.PI;

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
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
const SHADOWS = !LOW; if (SHADOWS) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
const ENV = getEnv(renderer);
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const skyC = new THREE.Color("#a8dcea"); scene.background = skyC; scene.fog = new THREE.Fog(skyC, 70, 175);
const cam = new THREE.PerspectiveCamera(touch ? 50 : 42, 1, .5, 320);
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
const Bm = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: op < 1, opacity: op, depthWrite: op === 1, toneMapped: false });
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) { const m = new THREE.Mesh(geo, typeof mat === "string" ? M(mat) : mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; }
const GEO = {
  box: (a, b, c) => new THREE.BoxGeometry(a, b, c), cyl: (a, b, h, s = 16) => new THREE.CylinderGeometry(a, b, h, s),
  cone: (r, h, s = 16) => new THREE.ConeGeometry(r, h, s), sph: (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h),
  tor: (r, t, rs = 8, ts = 32) => new THREE.TorusGeometry(r, t, rs, ts), disc: r => new THREE.CircleGeometry(r, 40),
  cap: (r, l) => new THREE.CapsuleGeometry(r, l, 4, 10)
};
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
    const a = R() * TAU, d = rr(26, WR - 18), x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (zones.every(q => Math.hypot(q.x - x, q.z - z) > q.r + o.r + 18 - t / 50)) { Object.assign(o, { x, z }); zones.push(o); break; }
  }
}
const segs = []; {
  const inT = [0], rest = zones.map((_, i) => i).slice(1);
  while (rest.length) {
    let b = null;
    for (const i of inT) for (const j of rest) { const d = Math.hypot(zones[i].x - zones[j].x, zones[i].z - zones[j].z); if (!b || d < b.d) b = { i, j, d }; }
    segs.push([zones[b.i], zones[b.j]]); inT.push(b.j); rest.splice(rest.indexOf(b.j), 1);
  }
  for (let k = 0; k < 8 && segs.length < zones.length + 2; k++) { const a = rpick(zones), b = rpick(zones); if (a !== b && Math.hypot(a.x - b.x, a.z - b.z) < 80 && !segs.some(s => (s[0] === a && s[1] === b) || (s[0] === b && s[1] === a))) segs.push([a, b]); }
}
function segDist(px, pz, a, b) { const dx = b.x - a.x, dz = b.z - a.z, L = dx * dx + dz * dz || 1; const t = clamp(((px - a.x) * dx + (pz - a.z) * dz) / L, 0, 1); return Math.hypot(px - (a.x + t * dx), pz - (a.z + t * dz)); }
const roadDist = (x, z) => segs.reduce((m, s) => Math.min(m, segDist(x, z, s[0], s[1])), 1e9);
const onRoad = (s, t, off = 0) => { const dx = s[1].x - s[0].x, dz = s[1].z - s[0].z, L = Math.hypot(dx, dz); return { x: s[0].x + dx * t + (-dz / L) * off, z: s[0].z + dz * t + (dx / L) * off, a: Math.atan2(dx, dz) }; };
const ponds = [];
for (let i = 0, n = 5 + Math.floor(R() * 4); i < n * 60 && ponds.length < n; i++) {
  const x = rr(-120, 120), z = rr(-120, 120), r = rr(4, 9);
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
    const dx = o.x - c.x, dz = o.z - c.z, d = Math.hypot(dx, dz), m = c.r + rad; if (d < m && d > 1e-4) { o.x = c.x + dx / d * m; o.z = c.z + dz / d * m; hit = true; } } const pd = Math.hypot(o.x, o.z); if (pd > WR) { o.x *= WR / pd; o.z *= WR / pd; hit = true; } return hit; }

/* ---------- ground, roads, ponds ---------- */
flat(mesh(GEO.disc(270), "#7cc46b", 0, 0, 0, scene));
for (let i = 0; i < 60; i++) { const a = R() * TAU, d = Math.sqrt(R()) * 190; flat(mesh(GEO.disc(rr(6, 18)), rpick(["#73bb62", "#86cc74", "#6fb35f"]), Math.cos(a) * d, .01, Math.sin(a) * d, scene)); }
const dashes = [];
for (const [a, b] of segs) {
  const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), ang = Math.atan2(dx, dz), mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
  mesh(GEO.box(7.4, .04, d), "#e6d3a3", mx, .02, mz, scene).rotation.y = ang;
  mesh(GEO.box(5.6, .06, d), "#555a66", mx, .03, mz, scene).rotation.y = ang;
  for (let s = 3; s < d - 3; s += 5) dashes.push({ x: a.x + dx * s / d, z: a.z + dz * s / d, ry: ang, s: 1, y: .07 });
}
for (const p of ponds) { flat(mesh(GEO.disc(p.r + .8), "#e6d3a3", p.x, .025, p.z, scene)); flat(mesh(GEO.disc(p.r), WATER, p.x, .05, p.z, scene)); addCol(p.x, p.z, p.r - .4); }

/* ---------- instanced decor ---------- */
function okSpot(x, z, clear) { return zones.every(q => Math.hypot(q.x - x, q.z - z) > q.r + clear + 1.5) && roadDist(x, z) > 4.2 + clear && ponds.every(p => Math.hypot(p.x - x, p.z - z) > p.r + clear + .8); }
const dummy = new THREE.Object3D(), col = new THREE.Color();
function instanced(geo, mat, items, tint) {
  const im = new THREE.InstancedMesh(geo, typeof mat === "string" ? M(mat) : mat, items.length);
  items.forEach((it, i) => { dummy.position.set(it.x, it.y || 0, it.z); dummy.rotation.set(it.rx || 0, it.ry || 0, 0); dummy.scale.setScalar(it.s ?? 1); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); if (tint) im.setColorAt(i, col.set(tint(it))); });
  scene.add(im); return im;
}
instanced(GEO.box(.28, .02, 2.2), "#f3d36b", dashes).userData.noCast = 1;
const trees = [], pines = [];
for (let i = 0, n = LOW ? 380 : 650; i < n * 5 && trees.length + pines.length < n; i++) {
  const a = R() * TAU, d = Math.sqrt(R()) * (WR - 2), x = Math.cos(a) * d, z = Math.sin(a) * d, s = rr(.8, 1.4);
  if (!okSpot(x, z, 1.2 * s)) continue;
  (R() < .35 ? pines : trees).push({ x, z, s, ry: R() * TAU }); addCol(x, z, .55 * s);
}
for (let i = 0, n = LOW ? 220 : 340; i < n; i++) { const a = R() * TAU, d = rr(WR + 3, WR + 26); (R() < .5 ? pines : trees).push({ x: Math.cos(a) * d, z: Math.sin(a) * d, s: rr(1.2, 2), ry: R() * TAU }); }
const greens = ["#3f9a4a", "#4fae55", "#5cbf5f", "#3a8f48"];
instanced(GEO.cyl(.22, .32, 1.6, 6), "#8a5a35", [...trees, ...pines].map(t => ({ ...t, y: .8 * t.s })));
instanced(new THREE.IcosahedronGeometry(1.45, 0), "#ffffff", trees.map(t => ({ ...t, y: 2.5 * t.s })), () => rpick(greens));
instanced(GEO.cone(1.35, 3.2, 7), "#ffffff", pines.map(t => ({ ...t, y: 3 * t.s })), () => rpick(["#2f7d45", "#35864a", "#2a7040"]));
const bushes = []; for (let i = 0; i < (LOW ? 120 : 220); i++) { const x = rr(-WR, WR), z = rr(-WR, WR); if (Math.hypot(x, z) < WR && okSpot(x, z, .6)) bushes.push({ x, z, s: rr(.6, 1.1), y: .45 }); }
instanced(new THREE.IcosahedronGeometry(.9, 0), "#ffffff", bushes, () => rpick(["#4fae55", "#62c062", "#3f9a4a"]));
const rocks = []; for (let i = 0; i < 900 && rocks.length < 110; i++) { const x = rr(-WR, WR), z = rr(-WR, WR), s = rr(.5, 1.3); if (Math.hypot(x, z) < WR && okSpot(x, z, s)) { rocks.push({ x, z, s, y: .3 * s, ry: R() * TAU }); addCol(x, z, .7 * s); } }
instanced(new THREE.DodecahedronGeometry(.8, 0), "#ffffff", rocks, () => rpick(["#9aa0a8", "#b3b8bf", "#8a9099"]));
const flowers = []; for (let i = 0; i < (LOW ? 450 : 900); i++) { const x = rr(-WR, WR), z = rr(-WR, WR); if (Math.hypot(x, z) < WR && okSpot(x, z, .2)) flowers.push({ x, z, s: rr(.7, 1.2), y: .18 }); }
instanced(GEO.sph(.18, 6, 4), "#ffffff", flowers, () => rpick(["#ff6b8b", "#ffd166", "#ffffff", "#c38bff", "#ff9f43"])).userData.noCast = 1;
// lamp posts along roads (glow at night)
const lampMat = new THREE.MeshBasicMaterial({ color: "#6b6b74" }), lamps = [];
segs.forEach(s => { const d = Math.hypot(s[1].x - s[0].x, s[1].z - s[0].z); for (let t = 14, k = 0; t < d - 8; t += 20, k++) { const p = onRoad(s, t / d, k % 2 ? 4.6 : -4.6); if (zones.every(q => Math.hypot(q.x - p.x, q.z - p.z) > q.r + 1.5)) { lamps.push(p); addCol(p.x, p.z, .35); } } });
instanced(GEO.cyl(.12, .16, 3.4, 6), "#3a3a44", lamps.map(l => ({ ...l, y: 1.7 })));
instanced(GEO.sph(.32, 10, 8), lampMat, lamps.map(l => ({ ...l, y: 3.5 })));

/* ---------- zone landmarks ---------- */
const spinners = [], floaters = [], glowMats = [];
const BUILD = {
  home(z, g) {
    mesh(GEO.box(6, 4, 5), "#f6efe4", 0, 2, -1.5, g);
    const roof = mesh(GEO.cone(4.9, 3, 4), "#d43c55", 0, 5.5, -1.5, g); roof.rotation.y = Math.PI / 4;
    mesh(GEO.box(1.4, 2.4, .2), "#3a2a20", 0, 1.2, 1.05, g);
    [-1.9, 1.9].forEach(x => { const m = Bm("#ffe7a3"); glowMats.push(m); mesh(GEO.box(1.1, 1, .15), m, x, 2.4, 1.05, g); });
    addBox(z.x, z.z - 1.5, 3, 2.5);
  },
  project(z, g) {
    const c = z.color, cat = z.p.category;
    mesh(GEO.cyl(1.6, 1.9, .8, 20), "#d9cdb2", 0, .4, 0, g);
    if (cat === "Unity") spinners.push(mesh(GEO.box(2.2, 2.2, 2.2), c, 0, 2.6, 0, g));
    else if (cat === "Unreal") { mesh(GEO.cone(1.3, 5.5, 4), c, 0, 3.4, 0, g); const r = mesh(GEO.tor(1.7, .14), "#f3b94d", 0, 2.4, 0, g); r.rotation.x = Math.PI / 2; spinners.push(r); }
    else if (cat === "Web") { const t = mesh(GEO.tor(1.8, .35, 10, 40), c, 0, 2.9, 0, g); const f = mesh(GEO.disc(1.5), Bm(c, .35), 0, 2.9, 0, g); f.material.side = THREE.DoubleSide; spinners.push(t, f); }
    else { mesh(GEO.box(2.2, 3.6, 1.6), "#2a2433", 0, 2.2, 0, g); mesh(GEO.box(1.7, 1.2, .05), Bm(c), 0, 2.8, .83, g); mesh(GEO.box(1.6, .5, .5), c, 0, 1.6, .9, g); mesh(GEO.sph(.15), "#d43c55", -.3, 1.95, 1.0, g); }
    const gl = glyphSprite(z.p.glyph); gl.position.set(0, 6.4, 0); g.add(gl); floaters.push(gl);
    addCol(z.x, z.z, 1.9);
  },
  skills(z, g) { ["#41d3c9", "#2fb3a9", "#f3b94d", "#d43c55", "#7b5cff"].forEach((c, i) => mesh(GEO.cyl(1.9 - i * .28, 2 - i * .28, 1.3, 16), c, 0, .65 + i * 1.3, 0, g)); floaters.push(mesh(GEO.sph(.6), Bm("#fff3b0"), 0, 7.2, 0, g)); addCol(z.x, z.z, 2.1); },
  hobbies(z, g) {
    mesh(GEO.cyl(1.8, 2, .8, 20), "#d9cdb2", 0, .4, 0, g); flat(mesh(GEO.disc(1.5), Bm("#5ec8e8"), 0, .81, 0, g));
    (C.hobbies || []).slice(0, 6).forEach((h, i, a) => { const an = i / a.length * TAU, x = Math.cos(an) * 4.2, zz = Math.sin(an) * 4.2; mesh(GEO.cyl(.12, .12, 2.2, 6), "#8a5a35", x, 1.1, zz, g); const s = glyphSprite(h.icon, 1.6); s.position.set(x, 2.9, zz); g.add(s); floaters.push(s); addCol(z.x + x, z.z + zz, .35); });
    addCol(z.x, z.z, 2.1);
  },
  journey(z, g) {
    [-2.2, 2.2].forEach(x => { mesh(GEO.box(.8, 4.6, .8), "#7b5cff", x, 2.3, 0, g); addCol(z.x + x, z.z, .7); });
    mesh(GEO.box(5.6, .8, 1), "#5c43d6", 0, 4.9, 0, g);
    (C.journey || []).slice(0, 4).forEach((j, i) => { const s = canvasSprite(256, 64, (x, w) => { x.fillStyle = "#f6efe4"; rrect(x, 4, 4, w - 8, 56, 14); x.fill(); x.fillStyle = "#1a1420"; x.font = "700 30px Inter,system-ui"; x.textAlign = "center"; x.fillText(j.when, w / 2, 43); }, [2, .5, 1]); s.position.set(-3 + i * 2, .9, 3); g.add(s); });
  },
  pitch(z, g) {
    mesh(GEO.box(16, .06, 22), "#6fcf6a", 0, .04, 0, g);
    [[0, 11, 16, .3], [0, -11, 16, .3], [8, 0, .3, 22], [-8, 0, .3, 22], [0, 0, 16, .25]].forEach(([x, zz, w, d]) => mesh(GEO.box(w, .07, d), "#ffffff", x, .06, zz, g));
    [-2.6, 2.6].forEach(x => { mesh(GEO.cyl(.15, .15, 2.4, 8), "#ffffff", x, 1.2, -10, g); addCol(z.x + x, z.z - 10, .3); });
    mesh(GEO.box(5.5, .25, .25), "#ffffff", 0, 2.4, -10, g);
    const net = mesh(GEO.box(5.2, 2.3, .05), Bm("#ffffff", .25), 0, 1.15, -11.2, g);
    z.goal = { x: z.x, z: z.z - 10 }; addBox(z.x, z.z - 11.25, 2.7, .12); addBox(z.x - 2.75, z.z - 10.6, .1, .7); addBox(z.x + 2.75, z.z - 10.6, .1, .7);
  },
  mailbox(z, g) {
    mesh(GEO.cyl(.12, .12, 1.6, 6), "#5a5a66", 0, .8, 0, g);
    mesh(GEO.box(1.4, 1.1, 1.8), "#e04848", 0, 2.1, 0, g);
    mesh(GEO.cyl(.7, .7, 1.8, 16), "#e04848", 0, 2.65, 0, g).rotation.x = Math.PI / 2;
    z.flag = mesh(GEO.box(.08, .8, .5), "#f3b94d", .75, 2.9, -.4, g);
    addCol(z.x, z.z, 1.1);
  }
};
for (const z of zones) {
  const g = new THREE.Group(); g.position.set(z.x, 0, z.z); scene.add(g); z.g = g;
  if (z.kind !== "pitch") { mesh(GEO.cyl(z.r, z.r, .14, 40), "#efe3c8", 0, .07, 0, g); const ring = mesh(GEO.tor(z.r, .18, 6, 48), z.color, 0, .14, 0, g); ring.rotation.x = Math.PI / 2; }
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
    const m = mesh(rampGeo, "#ff8a3d", p.x, 0, p.z, scene); m.rotation.y = a; ramps.push({ x: p.x, z: p.z, s: Math.sin(a), c: Math.cos(a) });
  }
}
function groundAt(x, z) { for (const r of ramps) { const dx = x - r.x, dz = z - r.z; const lz = dx * r.s + dz * r.c, lx = dx * r.c - dz * r.s; if (Math.abs(lx) < 2.3 && lz > -3 && lz < 3) return (lz + 3) / 6 * 1.5; } return 0; }

/* ---------- interactables: coffee stall, signposts ---------- */
const stall = (() => {
  for (let i = 0; i < 60; i++) { const a = R() * TAU, x = Math.cos(a) * 15, z = Math.sin(a) * 15; if (roadDist(x, z) > 5 && zones.every(q => Math.hypot(q.x - x, q.z - z) > q.r + 3)) return { x, z }; }
  return { x: 14, z: -10 };
})();
{ const g = new THREE.Group(); g.position.set(stall.x, 0, stall.z); g.rotation.y = Math.atan2(-stall.x, -stall.z); scene.add(g);
  mesh(GEO.box(3, 1.2, 1.4), "#8a5a35", 0, .6, 0, g); mesh(GEO.box(3.4, .12, 2), "#f3b94d", 0, 2.6, 0, g);
  [-1.5, 1.5].forEach(x => mesh(GEO.cyl(.08, .08, 2.6, 6), "#5a5a66", x, 1.3, -.6, g));
  for (let i = 0; i < 4; i++) mesh(GEO.box(.85, .14, 2.02), i % 2 ? "#d43c55" : "#ffffff", -1.275 + i * .85, 2.72, 0, g);
  mesh(GEO.cyl(.2, .16, .35, 10), "#c9b38c", .6, 1.38, .2, g);
  const s = glyphSprite("☕", 1.8); s.position.set(0, 3.8, 0); g.add(s); floaters.push(s);
  addCol(stall.x, stall.z, 1.7); }
const signs = [];
(WD.signs || []).slice(0, 8).forEach((text, i) => {
  for (let k = 0; k < 20; k++) {
    const s = rpick(segs), p = onRoad(s, rr(.2, .8), R() < .5 ? 5.2 : -5.2);
    if (signs.every(o => Math.hypot(o.x - p.x, o.z - p.z) > 20) && zones.every(q => Math.hypot(q.x - p.x, q.z - p.z) > q.r + 3)) {
      const g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = p.a; scene.add(g);
      mesh(GEO.cyl(.1, .1, 2, 6), "#8a5a35", 0, 1, 0, g); mesh(GEO.box(1.8, .9, .1), "#f6efe4", 0, 2.1, 0, g); mesh(GEO.box(1.4, .08, .12), "#1a1420", 0, 2.2, 0, g); mesh(GEO.box(1, .08, .12), "#1a1420", 0, 1.95, 0, g);
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
const tokMesh = new THREE.InstancedMesh(GEO.cyl(.5, .5, .14, 16), M("#f3c94d"), tokens.length); scene.add(tokMesh);
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
function makeBike(color, x, z, yaw) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); scene.add(g); blob(g, 1.1);
  const wheels = [.95, -.95].map(zz => { const w = mesh(GEO.tor(.42, .14, 10, 24), TYRE, 0, .5, zz, body); w.rotation.y = Math.PI / 2; mesh(GEO.cyl(.24, .24, .2, 16), CHROME, 0, .5, zz, body).rotation.z = Math.PI / 2; return w; });
  mesh(GEO.box(.44, .55, 1.5), PAINT(color), 0, 1.0, 0, body); mesh(GEO.box(.36, .14, .8), "#1b1b20", 0, 1.32, -.35, body);
  mesh(GEO.box(.12, .9, .12), CHROME, 0, 1.0, .85, body).rotation.x = -.35;
  mesh(GEO.cyl(.05, .05, 1.0, 8), CHROME, 0, 1.5, .72, body).rotation.z = Math.PI / 2;
  mesh(GEO.sph(.14, 10, 8), Bm("#fff6c2"), 0, 1.25, 1.12, body); mesh(GEO.box(.3, .12, .3), Bm("#ff4060"), 0, 1.15, -.92, body);
  return { kind: "bike", name: "electric bike", g, body, wheels, wr: .5, x, z, y: 0, vy: 0, prevG: 0, yaw, speed: 0, r: 1.1, maxS: 30, turn: 3.2, seat: [0, .13, -.32], legs: -1.0, knees: 1.15, lean: true, probes: [[-.55, .62], [.55, .62]] };
}
function makeCar(color, x, z, yaw) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); scene.add(g); blob(g, 2.2);
  mesh(GEO.box(2.3, .8, 3.8), PAINT(color), 0, .9, 0, body); mesh(GEO.box(2.36, .32, 3.9), PAINT(darkerHex(color)), 0, .52, 0, body);
  mesh(GEO.box(2, .2, 1.2), "#1b1b20", 0, 1.35, -.4, body);
  [-.5, .5].forEach(x => mesh(GEO.box(.8, .8, .25), "#2a2433", x, 1.55, -.95, body));
  mesh(GEO.box(2.1, .7, .08), GLASSM, 0, 1.6, .55, body).rotation.x = -.35;
  mesh(GEO.box(2.3, .25, .25), CHROME, 0, .6, 1.95, body); mesh(GEO.box(2.3, .25, .25), CHROME, 0, .6, -1.95, body);
  [-.75, .75].forEach(x => { mesh(GEO.sph(.16, 10, 8), Bm("#fff6c2"), x, .95, 1.92, body); mesh(GEO.box(.35, .15, .1), Bm("#ff4060"), x, .95, -1.93, body); });
  const wheels = [[-1.12, 1.25], [1.12, 1.25], [-1.12, -1.25], [1.12, -1.25]].map(([wx, wz]) => { const w = mesh(GEO.cyl(.48, .48, .36, 18), TYRE, wx, .48, wz, body); w.rotation.z = Math.PI / 2; mesh(GEO.cyl(.28, .28, .38, 14), CHROME, wx, .48, wz, body).rotation.z = Math.PI / 2; return w; });
  return { kind: "car", name: "convertible", g, body, wheels, wr: .48, spinAxis: "y", x, z, y: 0, vy: 0, prevG: 0, yaw, speed: 0, r: 1.9, maxS: 26, turn: 2.4, seat: [-.5, .2, -.35], legs: -1.45, knees: 1.45, lean: false, probes: [[-1.05, 1.15], [0, 1.15], [1.05, 1.15]] };
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

/* ---------- NPCs ---------- */
const W = C.wardrobe;
const npcs = [], names = (WD.npcNames || ["NPC"]).slice().sort(() => R() - .5);
function makeNPC(i) {
  const { g: body, P: NP } = buildJack(W, randomLook(W, R), { lite: true, skin: rpick(["#8b5a3c", "#a8714d", "#6e4329", "#c58c62", "#9a6646", "#d8a27a"]), hair: rpick(["short", "bun", "long", "short", "bald"]), hairColor: rpick(["#1a1311", "#3a2a20", "#6b4128", "#2a2a2a"]), beard: R() < .35 });
  body.scale.setScalar(1.4 * rr(.92, 1.04));
  const g = new THREE.Group(); g.add(body); scene.add(g); blob(g, .7);
  const p = rpick(zones);
  return { g, legs: NP.legs, knees: NP.knees, arms: NP.arms, head: NP.head, name: names[i % names.length], x: p.x + rr(-p.r - 4, p.r + 4), z: p.z + rr(-p.r - 4, p.r + 4), y: 0, vy: 0, yaw: R() * TAU, tx: 0, tz: 0, wait: rr(0, 3), ph: R() * 10, kv: null };
}
for (let i = 0; i < (LOW ? 6 : 10); i++) { const n = makeNPC(i); pushOut(n, .6); npcs.push(n); }
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
const { g: jg, P: JP } = buildJack(W, look, { curls: LOW ? 250 : 420, beardCurls: LOW ? 80 : 160 }); const JS = 1.4; jg.scale.setScalar(JS); player.add(jg);
const pShadow = blob(player, .9);
const me = { x: 0, z: 6.5, y: 0, vy: 0, prevG: 0 };
let vx = 0, vz = 0, yaw = 0, phase = 0, driving = null, buffT = 0, airStart = 0;
player.position.set(me.x, 0, me.z);

/* ---------- input ---------- */
const keys = {};
addEventListener("keydown", e => {
  if (e.target.closest && e.target.closest("input,textarea,.drawer")) return;
  const k = e.key.toLowerCase(); if (keys[k] && ["e", "enter", " ", "f", "h"].includes(k)) return; keys[k] = true;
  if (k === "e" || k === "enter") { e.preventDefault(); interact(); }
  if (k === " ") { e.preventDefault(); dialogOpen ? next() : action2(); }
  if (k === "f") { if (driving) exitVehicle(); else if (target?.type === "vehicle") enterVehicle(target.obj); }
  if (k === "h" && driving) honk();
  if (e.key === "Escape") { if ($("#card").open) $("#card").close(); else if (dialogOpen) closeDialog(); }
  if (e.key.startsWith("Arrow")) e.preventDefault();
});
addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
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
  driving = v; v.body.add(player); player.position.set(...v.seat); player.rotation.set(0, 0, 0); if (pShadow) pShadow.visible = false;
  JP.legs.forEach(l => l.rotation.x = v.legs); JP.knees.forEach(k => k.rotation.x = v.knees); JP.arms.forEach(a => a.rotation.x = -1.05); JP.elbows.forEach(e => e.rotation.x = -.45);
  if (v.kind === "bike") Q.bike = true; else Q.car = true;
  A.sfx("open"); toast(`🛵 You're on the ${v.name}! ${touch ? "Drag to drive · 📯 honk · 💬 exit" : "WASD drive · Shift boost · H honk · F exit"}`); renderQuests();
}
function exitVehicle() {
  const v = driving; if (!v) return; driving = null;
  scene.add(player); JP.knees.forEach(k => k.rotation.x = 0); JP.elbows.forEach(e => e.rotation.x = 0);
  for (let k = 0; k < 8; k++) { const a = v.yaw + Math.PI / 2 + k * Math.PI / 4, t = { x: v.x + Math.sin(a) * (v.r + 1.3), z: v.z + Math.cos(a) * (v.r + 1.3) }; const blocked = pushOut(t, .7) || groundAt(t.x, t.z) > .1 || vehicles.some(o => o !== v && Math.hypot(o.x - t.x, o.z - t.z) < o.r + .8); if (!blocked || k === 7) { me.x = t.x; me.z = t.z; break; } }
  me.y = 0; me.vy = 0; if (pShadow) pShadow.visible = true; yaw = v.yaw; v.speed = 0; A.sfx("click");
}
function honk() { A.sfx("honk"); if (cows.some(c => Math.hypot(c.x - driving.x, c.z - driving.z) < 14)) setTimeout(() => { A.sfx("moo"); toast(`🐄 ${pick(WD.cow || ["Moo."])}`); }, 350); npcs.forEach(n => { if (Math.hypot(n.x - driving.x, n.z - driving.z) < 10 && !n.kv) n.vy = 5; }); }
function action2() { if (!started) return; if (driving) return honk(); if (me.y <= me.prevG + .05) { me.y += .1; me.vy = 10; A.sfx("jump"); } }

/* ---------- interaction targets ---------- */
let target = null;
function findTarget() {
  let best = null, bs = 1e9;
  const c = (type, obj, x, z, range, label) => { const d = Math.hypot(me.x - x, me.z - z), s = d / range; if (d < range && s < bs) { bs = s; best = { type, obj, label }; } };
  if (driving) { if (Math.abs(driving.speed) < 9) for (const z of zones) c("zone", z, z.x, z.z, z.r + 3, `Talk — ${z.title}`); return best; }
  for (const z of zones) c("zone", z, z.x, z.z, z.r + 1.5, `Talk — ${z.title}${z.visited ? " ✓" : ""}`);
  for (const n of npcs) c("npc", n, n.x, n.z, 2.8, `Chat — ${n.name}`);
  for (const d of dogs) c("dog", d, d.x, d.z, 2.6, "Pet the dog 🐶");
  for (const w of cows) c("cow", w, w.x, w.z, 3.4, "Say hi to the cow 🐄");
  for (const s of signs) c("sign", s, s.x, s.z, 2.6, "Read the sign");
  c("stall", stall, stall.x, stall.z, 3.6, "Grab filter coffee ☕");
  for (const v of vehicles) c("vehicle", v, v.x, v.z, v.r + 2, `Ride the ${v.name} ${v.kind === "bike" ? "🏍️" : "🚗"}`);
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
  else if (t.type === "dog") { const d = t.obj; Q.dogs.add(d); d.petted = true; A.sfx("bark"); burst(d.x, 1.8, d.z, 14, ["#ff6b8b", "#ff9fb8"], 4); toast(`🐶 ${pick(WD.dog || ["Good boy!"])}`); renderQuests(); }
  else if (t.type === "cow") { A.sfx("moo"); toast(`🐄 ${pick(WD.cow || ["Moo."])}`); }
  else if (t.type === "sign") openDialog([t.obj.text], null, "Signpost");
  else if (t.type === "stall") { buffT = 20; Q.coffee = true; A.sfx("coin"); burst(stall.x, 2, stall.z, 16, ["#c9b38c", "#ffffff"], 4); toast(`☕ ${pick(WD.coffee || ["Coffee! Speed boost."])}`); renderQuests(); }
  else if (t.type === "vehicle") enterVehicle(t.obj);
}

/* ---------- intro / ending ---------- */
let started = false, t0 = 0, elapsed = 0;
$("#seedtxt").textContent = `World #${seed} · Jack is wearing: ${lookName(W, look)}`;
$("#start").onclick = () => { $("#intro").hidden = true; started = true; t0 = performance.now(); A.init(); A.apply(); A.sfx("open"); openDialog(WD.intro || ["Welcome to my world!"], null); };
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
  lampMat.color.copy(lampOff).lerp(lampOn, night); glowMats.forEach(m => m.color.copy(winDay).lerp(lampOn, night));
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
  mm.translate(X(me.x), Z(me.z)); mm.rotate(-(driving ? driving.yaw : yaw) + Math.PI); mm.fillStyle = "#1a1420"; mm.strokeStyle = "#fff"; mm.lineWidth = 2.5;
  mm.beginPath(); mm.moveTo(0, -10); mm.lineTo(7, 7); mm.lineTo(-7, 7); mm.closePath(); mm.fill(); mm.stroke();
  mm.restore();
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

  if (driving) { // ----- vehicle physics (screen-relative arcade steering)
    const v = driving, airborne = v.y > v.prevG + .05;
    const max = v.maxS * (keys.shift ? 1.3 : 1) * (buffT > 0 ? 1.12 : 1);
    if (mag > .1 && !airborne) {
      const want = Math.atan2(ix, iz), diff = angDiff(want, v.yaw);
      v.yaw += clamp(diff, -v.turn * dt, v.turn * dt);
      const tgt = mag * max * Math.max(.25, Math.cos(diff));
      v.speed += (tgt - v.speed) * (1 - Math.exp(-dt * 1.3));
      if (v.lean) v.body.rotation.z += (clamp(-diff, -.6, .6) * Math.min(1, v.speed / 12) - v.body.rotation.z) * Math.min(1, dt * 6);
    } else { v.speed *= Math.exp(-dt * (airborne ? .1 : 1.1)); if (v.lean) v.body.rotation.z *= 1 - Math.min(1, dt * 4); }
    const steps = Math.max(1, Math.ceil(Math.abs(v.speed * dt) / .35)); let hit = false;
    for (let i = 0; i < steps && !hit; i++) {
      const ox = v.x, oz = v.z; v.x += Math.sin(v.yaw) * v.speed * dt / steps; v.z += Math.cos(v.yaw) * v.speed * dt / steps;
      if (groundAt(v.x, v.z) - v.y > .6) { v.x = ox; v.z = oz; hit = true; }
      else hit = probeHit(v);
    }
    if (hit) { if (Math.abs(v.speed) > 6 && crashCool < 0) { crashCool = 1.2; A.sfx("boing"); burst(v.x, 1, v.z, 10, ["#ffd166", "#ffffff"], 5); if (Math.abs(v.speed) > 16) toast(`💥 ${pick(WD.crash || ["Oops!"])}`); } v.speed *= -.3; }
    for (const o of vehicles) if (o !== v) { const dx = v.x - o.x, dz = v.z - o.z, d = Math.hypot(dx, dz), m = v.r + o.r; if (d < m && d > 1e-3) { v.x = o.x + dx / d * m; v.z = o.z + dz / d * m; v.speed *= -.3; } }
    for (const c of cows) { const dx = v.x - c.x, dz = v.z - c.z, d = Math.hypot(dx, dz), m = v.r + 1.3; if (d < m && d > 1e-3) { v.x = c.x + dx / d * m; v.z = c.z + dz / d * m; if (Math.abs(v.speed) > 5 && crashCool < 0) { crashCool = 2; A.sfx("moo"); toast("🐄 The cow wins. The cow always wins."); } v.speed *= -.4; } }
    const wasAir = airborne;
    const air = vertical(v, dt, () => { const t = (now - airStart) / 1000; if (t > .6) { toast(`🔥 Airtime ${t.toFixed(1)}s!`); A.sfx("jump"); burst(v.x, .5, v.z, 18, ["#ff8a3d", "#ffd166"], 6); } if (t >= 1) { Q.air = true; renderQuests(); } });
    if (air && !wasAir) airStart = now;
    v.g.position.set(v.x, v.y, v.z); v.g.rotation.y = v.yaw; v.g.rotation.x = air ? clamp(-v.vy * .02, -.35, .35) : 0;
    v.wheels.forEach(w => { if (v.kind === "bike") w.rotation.x += v.speed * dt / v.wr; else w.rotation.x += v.speed * dt / v.wr; });
    me.x = v.x; me.z = v.z;
    JP.head.rotation.set(0, Math.sin(clock * .7) * .1, 0);
    jg.position.y = Math.sin(clock * 20) * .012 * Math.min(1, Math.abs(v.speed) / 10);
  } else { // ----- on foot
    const sp = (keys.shift ? 13 : 8.5) * (buffT > 0 ? 1.4 : 1), k = 1 - Math.exp(-dt * 12);
    vx += (ix * sp - vx) * k; vz += (iz * sp - vz) * k;
    const ox = me.x, oz = me.z; me.x += vx * dt; me.z += vz * dt;
    if (groundAt(me.x, me.z) - me.y > .6) { me.x = ox; me.z = oz; }
    for (const n of npcs) if (!n.kv) sep(me, n, 1.15, .45);
    for (const d of dogs) sep(me, d, 1.05, .2);
    for (const c of cows) sep(me, c, 1.9, 1);
    avoidVehicles(me, .6); pushOut(me, .7);
    vertical(me, dt);
    player.position.set(me.x, me.y, me.z);
    const speed = Math.hypot(vx, vz), mv = Math.min(1, speed / 8.5);
    if (speed > .5) yaw = lerpA(yaw, Math.atan2(vx, vz), 1 - Math.exp(-dt * 12)); else if (dialogOpen || !started) yaw = lerpA(yaw, 0, 1 - Math.exp(-dt * 6));
    player.rotation.y = yaw; phase += dt * (6 + speed * .9);
    const sw = Math.sin(phase) * mv, airF = me.y > me.prevG + .05;
    JP.legs[0].rotation.x = airF ? -.6 : sw * .75; JP.legs[1].rotation.x = airF ? .4 : -sw * .75;
    JP.arms[0].rotation.x = airF ? -2.2 : -sw * .6; JP.arms[1].rotation.x = airF ? -2.2 : sw * .6;
    JP.knees[0].rotation.x = airF ? .9 : Math.max(0, sw) * 1.1; JP.knees[1].rotation.x = airF ? .5 : Math.max(0, -sw) * 1.1; JP.elbows.forEach(e => e.rotation.x = -.3);
    jg.position.y = Math.abs(Math.sin(phase)) * .08 * mv + Math.sin(clock * 2.2) * .008 * (1 - mv);
    JP.head.rotation.set(0, Math.sin(clock * .7) * .15 * (1 - mv), Math.sin(phase) * .05 * mv);
    if (pShadow) { pShadow.position.y = .05 - me.y + groundAt(me.x, me.z); pShadow.scale.setScalar(Math.max(.4, 1 - (me.y - groundAt(me.x, me.z)) * .15)); }
  }
  { const hs = 1 + Math.abs(Math.sin(clock * 4)) * .015; JP.hair.scale.set(hs, hs * JP.hairBaseY, hs); }
  const bt = clock % 4; JP.eyes.forEach(e => e.scale.y = bt < .12 ? .1 : 1);
  const mover = driving || { x: me.x, z: me.z, speed: Math.hypot(vx, vz), r: .7, yaw };

  // ----- NPCs
  for (const n of npcs) {
    const dP = Math.hypot(n.x - me.x, n.z - me.z);
    if (n.kv) { n.x += n.kv.x * dt; n.z += n.kv.z * dt; n.g.rotation.x += dt * 8; pushOut(n, .6); }
    else if (talkingNPC === n || (dP < 3.2 && !driving)) { n.yaw = lerpA(n.yaw, Math.atan2(me.x - n.x, me.z - n.z), dt * 6); n.legs.forEach(l => l.rotation.x *= .8); }
    else if (n.wait > 0) { n.wait -= dt; n.arms[1].rotation.z = Math.sin(clock * 3 + n.ph) * .2; }
    else {
      const dx = n.tx - n.x, dz = n.tz - n.z, d = Math.hypot(dx, dz);
      if (d < 1) { n.wait = 2 + Math.random() * 5; npcTarget(n); }
      else { n.x += dx / d * 2.4 * dt; n.z += dz / d * 2.4 * dt; n.yaw = lerpA(n.yaw, Math.atan2(dx, dz), dt * 5); if (pushOut(n, .6)) { n.stuck = (n.stuck || 0) + dt; if (n.stuck > 2) { n.stuck = 0; npcTarget(n); } } }
      const s = Math.sin(clock * 8 + n.ph); n.legs[0].rotation.x = s * .6; n.legs[1].rotation.x = -s * .6; n.knees[0].rotation.x = Math.max(0, s) * .9; n.knees[1].rotation.x = Math.max(0, -s) * .9; n.arms[0].rotation.x = -s * .5; n.arms[1].rotation.x = s * .5;
    }
    if (driving && !n.kv && Math.hypot(n.x - driving.x, n.z - driving.z) < driving.r + .7 && Math.abs(driving.speed) > 6) {
      const dx = n.x - driving.x, dz = n.z - driving.z, d = Math.hypot(dx, dz) || 1, f = Math.abs(driving.speed) * .7;
      n.kv = { x: dx / d * f, z: dz / d * f }; n.vy = 9; driving.speed *= .6; A.sfx("boing"); if (crashCool < 0) { crashCool = 1.5; toast(`😵 ${n.name}: "My hitbox! I'll respawn, don't worry."`); }
    }
    for (const m of npcs) if (m !== n && !m.kv) sep(n, m, 1.1, .5);
    if (!n.kv) { avoidVehicles(n, .55); pushOut(n, .55); }
    if (n.vy || n.y > 0) { n.vy -= 30 * dt; n.y += n.vy * dt; if (n.y <= 0) { n.y = 0; n.vy = 0; if (n.kv) { n.kv = null; n.g.rotation.x = 0; } } }
    n.g.position.set(n.x, n.y, n.z); n.g.rotation.y = n.yaw;
  }
  // ----- dogs: follow the player when close, otherwise wander
  for (const d of dogs) {
    const dP = Math.hypot(d.x - me.x, d.z - me.z); let tx, tz, sp = 0;
    if (dP < 18 && dP > 2.6) { tx = me.x; tz = me.z; sp = Math.min(driving ? 14 : 9, dP * 1.6); if (frame % 240 === 0 && dP < 10) A.sfx("bark"); }
    else if (dP >= 18) { if (d.wait > 0) d.wait -= dt; else { const dd = Math.hypot(d.tx - d.x, d.tz - d.z); if (dd < 1) { d.tx = d.hx + (Math.random() - .5) * 16; d.tz = d.hz + (Math.random() - .5) * 16; d.wait = 1 + Math.random() * 3; } else { tx = d.tx; tz = d.tz; sp = 3; } } }
    if (sp) { const dx = tx - d.x, dz = tz - d.z, dd = Math.hypot(dx, dz) || 1; d.x += dx / dd * sp * dt; d.z += dz / dd * sp * dt; d.yaw = lerpA(d.yaw, Math.atan2(dx, dz), dt * 8); avoidVehicles(d, .5); pushOut(d, .5); }
    const run = sp > 0 ? 1 : 0, s = Math.sin(clock * 14 + d.ph) * run;
    d.legs.forEach((l, i) => l.rotation.x = (i % 2 ? s : -s) * .6);
    d.tail.rotation.y = Math.sin(clock * (dP < 6 ? 22 : 8)) * .6;
    d.g.position.set(d.x, Math.abs(s) * .08, d.z); d.g.rotation.y = d.yaw;
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
    if (d < m && d > 1e-3) { const sp = Math.max(6, Math.abs(mover.speed) * 1.25); b.vx = dx / d * sp; b.vz = dz / d * sp; b.vy = Math.min(8, sp * .25); A.sfx("hover"); }
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
    if (started && Math.hypot(me.x - b.x, me.z - b.z) < (driving ? driving.r + .8 : 1.4)) { b.alive = false; scene.remove(b.m); Q.bugs++; A.sfx("boing"); burst(b.x, 1, b.z, 20, ["#ff3bd4", "#41d3c9"], 6); toast(`🐛 ${pick(WD.bugs || ["Bug squashed!"])} (${Q.bugs}/${bugs.length})`); renderQuests(); }
  }
  // ----- particles
  let anyP = false;
  parts.forEach((p, i) => { if (p.life <= 0) return; anyP = true; p.life -= dt; p.vy -= 15 * dt; p.x += p.vx * dt; p.y = Math.max(.1, p.y + p.vy * dt); p.z += p.vz * dt; dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(p.life * 5, p.life * 3, 0); dummy.scale.setScalar(p.life > 0 ? Math.min(1, p.life) : 0); dummy.updateMatrix(); pim.setMatrixAt(i, dummy.matrix); });
  if (anyP || frame % 30 === 0) pim.instanceMatrix.needsUpdate = true;
  // ----- world anim
  for (const s of spinners) s.rotation.y += dt * .8;
  floaters.forEach((f, i) => f.position.y += Math.sin(clock * 2 + i) * .004);
  for (const z of zones) if (z.flag) z.flag.rotation.z = unlocked() ? -1.2 : 0;
  if (frame % 10 === 0) dayNight(((clock / DAY) + .08) % 1);
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
  const offY = (touch ? 17 : 13.5) + kz * 9, offZ = (touch ? 19 : 16) + kz * 8;
  const ax = driving ? Math.sin(driving.yaw) * driving.speed * .35 : 0, az = driving ? Math.cos(driving.yaw) * driving.speed * .35 : 0;
  const tx = me.x + ax, tz = me.z + az, kc = 1 - Math.exp(-dt * 4);
  cam.position.x += (tx - cam.position.x) * kc; cam.position.y += (offY - cam.position.y) * kc; cam.position.z += (tz + offZ - cam.position.z) * kc;
  cam.lookAt(cam.position.x, 1.2, cam.position.z - offZ + .5);
  renderer.render(scene, cam);
}
function avoidVehicles(o, r) { for (const v of vehicles) { if (v === driving) continue; const dx = o.x - v.x, dz = o.z - v.z, d = Math.hypot(dx, dz), m = v.r + r; if (d < m && d > 1e-3) { o.x = v.x + dx / d * m; o.z = v.z + dz / d * m; } } }
function lerpA(a, b, t) { return a + angDiff(b, a) * t; }
function resize() { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
addEventListener("resize", resize); resize();
cam.position.set(me.x, 13.5, me.z + 16);
document.addEventListener("visibilitychange", () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } });
scene.traverse(o => { if (!o.isMesh) return; o.receiveShadow = true; if (!SHADOWS || o.userData.noCast || o.castShadow) return; const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox(); if ((g.boundingBox.max.y - g.boundingBox.min.y) * o.scale.y > .2) o.castShadow = true; });
dayNight(.08); renderQuests(); drawMini();
$("#loading").remove();
raf = requestAnimationFrame(tick);
if (url.searchParams.has("debug")) window.__world = { get frame() { return frame; }, pen: (x, z, r) => { const o = { x, z }; pushOut(o, r); return Math.hypot(o.x - x, o.z - z); }, rampY: (x, z) => groundAt(x, z), ramps, get near() { return target?.type === "zone" ? target.obj : null; }, get target() { return target; }, zones, bugs, tokens, vehicles, npcs, dogs, ball, pitch, Q, me, tp: (x, z) => { if (driving) { driving.x = x; driving.z = z; } else { me.x = x; me.z = z; } }, enter: v => enterVehicle(v), exit: () => exitVehicle(), get driving() { return driving; }, talk: z => talk(z), next: () => next(), get dialogOpen() { return dialogOpen; }, keys };
