/* Semi-realistic 3D Jack (and NPC variants) — procedural, PBR-shaded, dress-up ready.
   Units are metres. Feet at y=0, facing +z. No model files: everything is built from code.
   Usage: const j = mountJack3D(el, { wardrobe, look, onPoke }); j.setLook(look); j.poke();
          const { g, P } = buildJack(W, look, { lite, skin, hair, hairColor, beard }); // for the world */
import * as THREE from "../vendor/three.module.min.js";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";

const TAU = Math.PI * 2;
let ENV = null;
export function getEnv(renderer) {
  if (!ENV) { const pm = new THREE.PMREMGenerator(renderer); ENV = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose(); }
  return ENV;
}

/* ---------- materials (cached) ---------- */
const cache = new Map();
const mat = (k, make) => cache.get(k) || (cache.set(k, make()), cache.get(k));
const std = (c, r = .85, m = 0) => mat(`s${c}${r}${m}`, () => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m }));
const phys = (k, o) => mat(k, () => new THREE.MeshPhysicalMaterial(o));
const SKIN = c => phys("skin" + c, { color: new THREE.Color(c).offsetHSL(0, -.12, .02), roughness: .55, sheen: .3, sheenColor: new THREE.Color("#c4785a"), sheenRoughness: .5, clearcoat: .08, clearcoatRoughness: .6 });
const LIP = c => phys("lip" + c, { color: c, roughness: .35, clearcoat: .4, clearcoatRoughness: .3 });
const HAIR = c => phys("hair" + c, { color: c, roughness: .6, sheen: 1, sheenColor: new THREE.Color("#7a685e"), sheenRoughness: .35 });
const CLOTH = (c, r = .88) => std(c, r);
const VELVET = c => phys("vel" + c, { color: c, roughness: .95, sheen: 1, sheenColor: new THREE.Color(c).offsetHSL(0, -.1, .22), sheenRoughness: .25 });
const METAL = c => std(c, .28, 1);
const LEATHER = c => phys("lea" + c, { color: c, roughness: .42, clearcoat: .7, clearcoatRoughness: .25 });
const GLOSS = c => phys("gl" + c, { color: c, roughness: .15, clearcoat: 1, clearcoatRoughness: .05 });
const BASIC = (c, op = 1) => mat(`b${c}${op}`, () => new THREE.MeshBasicMaterial({ color: c, transparent: op < 1, opacity: op, depthWrite: op === 1 }));
const GLASS = (c, op) => mat(`g${c}${op}`, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: .05, transparent: true, opacity: op, clearcoat: 1, depthWrite: false }));

/* ---------- geometry helpers ---------- */
const G = {
  sph: (r, w = 24, h = 18) => new THREE.SphereGeometry(r, w, h),
  part: (r, w, h, ps, pl, ts, tl) => new THREE.SphereGeometry(r, w, h, ps, pl, ts, tl),
  cap: (r, l, s = 14) => new THREE.CapsuleGeometry(r, l, 6, s),
  cyl: (a, b, h, s = 28, open = false) => new THREE.CylinderGeometry(a, b, h, s, 1, open),
  cone: (r, h, s = 20) => new THREE.ConeGeometry(r, h, s),
  tor: (r, t, arc = TAU, rs = 10, ts = 28) => new THREE.TorusGeometry(r, t, rs, ts, arc),
  box: (x, y, z) => new THREE.BoxGeometry(x, y, z),
  plane: (w, h) => new THREE.PlaneGeometry(w, h),
  shape: pts => new THREE.ShapeGeometry(new THREE.Shape(pts.map(p => new THREE.Vector2(...p))))
};
function mesh(geo, material, pos, rot, scl, parent) {
  const m = new THREE.Mesh(geo, material);
  if (pos) m.position.set(...pos); if (rot) m.rotation.set(...rot);
  if (scl) typeof scl === "number" ? m.scale.setScalar(scl) : m.scale.set(...scl);
  m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m;
}
const find = (list, id) => list.find(x => x.id === id) || list[0];
const darker = (c, k = .8) => "#" + new THREE.Color(c).multiplyScalar(k).getHexString();
function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function canvasTex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
const own = m => { m.userData.own = 1; return m; };

/* ---------- body shape: torso profile (lathe) ---------- */
const PROF = [[.001, .86], [.15, .88], [.165, .97], [.162, 1.06], [.168, 1.16], [.186, 1.27], [.197, 1.34], [.174, 1.405], [.116, 1.445], [.06, 1.468], [.001, 1.472]];
const WID = 1.1, DEP = .66;
function rAt(y) { for (let i = 0; i < PROF.length - 1; i++) { const [r0, y0] = PROF[i], [r1, y1] = PROF[i + 1]; if (y >= y0 && y <= y1) return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return .12; }
const fz = y => rAt(y) * DEP + .002;
const torsoGeo = () => new THREE.LatheGeometry(PROF.map(([r, y]) => new THREE.Vector2(r, y)), 44);
function ring(y, h, color, parent, m) { const r = rAt(y) + .003; return mesh(G.cyl(r, r, h, 40, true), m || CLOTH(color), [0, y, 0], null, [WID, 1, DEP], parent); }

/* ---------- tops ---------- */
const TOP = {
  bandhgala(b, t) {
    const v = VELVET(t.color);
    mesh(G.box(.07, .44, .008), CLOTH(t.shirt, .8), [0, 1.2, fz(1.2)], null, null, b);
    [1.04, 1.14, 1.24, 1.34].forEach(y => mesh(G.sph(.0065, 10, 8), METAL("#d4a64a"), [-.045, y, fz(y) + .004], null, null, b));
    [1.09, 1.19, 1.29].forEach(y => mesh(G.sph(.007, 8, 6), VELVET(darker(t.color, 1.45)), [.05, y, fz(y) + .003], null, [1, 1, .4], b));
    mesh(G.cyl(.063, .067, .05, 28, true), v, [0, 1.462, 0], null, null, b).material.side = THREE.DoubleSide;
    mesh(G.cyl(.168, .176, .14, 40, true), v, [0, .88, 0], null, [WID, 1, DEP], b);
  },
  tee(b, t) {
    const tex = canvasTex(256, 256, x => { x.strokeStyle = "#2b2b2b"; x.lineWidth = 7; x.lineCap = "round"; x.beginPath(); x.arc(128, 128, 70, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(78, 140); x.quadraticCurveTo(104, 100, 128, 140); x.quadraticCurveTo(152, 180, 178, 140); x.stroke(); x.fillStyle = "#2b2b2b"; x.beginPath(); x.arc(100, 105, 8, 0, TAU); x.arc(156, 105, 8, 0, TAU); x.fill(); });
    mesh(G.plane(.13, .13), own(new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .9 })), [0, 1.22, fz(1.22) + .002], null, null, b);
  },
  polo(b, t) {
    [-1, 1].forEach(s => mesh(G.box(.07, .035, .01), CLOTH(darker(t.color, .75)), [s * .035, 1.455, .058], [-.5, 0, s * .5], null, b));
    mesh(G.box(.028, .1, .006), CLOTH(darker(t.color, .8)), [0, 1.39, fz(1.39)], null, null, b);
    [1.42, 1.37].forEach(y => mesh(G.sph(.005, 8, 6), CLOTH(t.accent), [0, y, fz(y) + .005], null, null, b));
  },
  suit(b, t) {
    mesh(G.shape([[-.065, 0], [.065, 0], [0, -.2]]), CLOTH(t.shirt, .7), [0, 1.455, fz(1.4) + .004], [-.12, 0, 0], null, b);
    mesh(G.shape([[-.012, 0], [.012, 0], [.02, -.15], [0, -.18], [-.02, -.15]]), GLOSS(t.accent), [0, 1.44, fz(1.4) + .008], [-.12, 0, 0], null, b);
    [-1, 1].forEach(s => mesh(G.box(.035, .22, .006), CLOTH(darker(t.color, .7), .6), [s * .05, 1.33, fz(1.33) + .006], [0, 0, s * .32], null, b));
    mesh(G.box(.045, .015, .006), CLOTH("#2c3050"), [.1, 1.3, fz(1.3) - .004], [0, .45, 0], null, b);
    mesh(G.cyl(.168, .176, .14, 40, true), CLOTH(t.color, .6), [0, .88, 0], null, [WID, 1, DEP], b);
  },
  hoodie(b, t) {
    mesh(G.tor(.09, .04), CLOTH(t.color), [0, 1.43, -.07], [Math.PI / 2 - .5, 0, 0], [1.2, 1, 1], b);
    mesh(G.box(.2, .09, .015), CLOTH(darker(t.color, .88)), [0, 1.02, fz(1.02) + .004], null, null, b);
    [-1, 1].forEach(s => mesh(G.cap(.004, .08, 6), CLOTH(t.accent), [s * .03, 1.36, fz(1.36) + .006], null, null, b));
  },
  kurta(b, t) {
    mesh(G.cyl(.168, .186, .34, 40, true), CLOTH(t.color, .9), [0, .74, 0], null, [WID, 1, DEP * 1.05], b).material.side = THREE.DoubleSide;
    mesh(G.box(.03, .26, .006), CLOTH(t.accent), [0, 1.33, fz(1.33) + .003], null, null, b);
    [1.4, 1.34, 1.28].forEach(y => mesh(G.sph(.005, 8, 6), METAL("#e9e4d8"), [0, y, fz(y) + .007], null, null, b));
    mesh(G.cyl(.06, .064, .04, 28, true), CLOTH(t.accent), [0, 1.462, 0], null, null, b);
  },
  jersey(b, t) {
    ring(1.0, .03, t.accent, b); ring(1.3, .03, t.accent, b);
    const tex = canvasTex(256, 160, x => { x.fillStyle = t.accent; x.font = "900 118px system-ui,Arial,sans-serif"; x.textAlign = "center"; x.fillText(t.number || "01", 128, 128); });
    mesh(G.plane(.16, .1), own(new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .8 })), [0, 1.17, fz(1.17) + .003], null, null, b);
  }
};
function polo(t) {
  const tex = canvasTex(64, 64, x => { x.fillStyle = t.color; x.fillRect(0, 0, 64, 64); x.strokeStyle = "rgba(255,255,255,.13)"; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 0); x.lineTo(64, 64); x.moveTo(64, 0); x.lineTo(0, 64); x.stroke(); x.fillStyle = t.accent; x.beginPath(); x.arc(32, 32, 6, 0, 7); x.fill(); });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(14, 6);
  return own(new THREE.MeshStandardMaterial({ map: tex, roughness: .9 }));
}

/* ---------- hats / glasses / neck / hand items (metres; head-local for hats & glasses) ---------- */
const HAT = {
  cap(h, c) { mesh(G.part(1, 32, 14, 0, TAU, 0, Math.PI / 2), CLOTH(c), [0, .1, -.01], null, [.152, .1, .162], h); mesh(G.cyl(.085, .085, .007, 28), CLOTH(darker(c, .85)), [0, .108, .145], [.18, 0, 0], [1, 1, 1.35], h); mesh(G.sph(.011, 10, 8), CLOTH(darker(c, .85)), [0, .2, -.01], null, null, h); },
  beanie(h, c) { mesh(G.part(1, 32, 14, 0, TAU, 0, Math.PI / 2), CLOTH(c, .95), [0, .075, -.01], null, [.155, .16, .165], h); mesh(G.tor(.155, .022, TAU, 10, 40), CLOTH(darker(c, .85), .95), [0, .082, -.01], [Math.PI / 2, 0, 0], [1, 1.06, 1], h); mesh(G.sph(.035, 14, 10), CLOTH("#f6f1e8", .98), [0, .245, -.01], null, null, h); },
  cowboy(h, c) { mesh(G.cyl(.1, .12, .12, 28), LEATHER(c), [0, .215, 0], null, null, h); mesh(G.cyl(.28, .28, .008, 40), LEATHER(c), [0, .155, 0], null, null, h); mesh(G.tor(.28, .01, TAU, 8, 48), LEATHER(c), [0, .162, 0], [Math.PI / 2, 0, 0], null, h); mesh(G.cyl(.121, .121, .022, 28, true), CLOTH("#2a1a12"), [0, .168, 0], null, null, h); },
  crown(h, c) { const m = METAL(c); mesh(G.cyl(.085, .08, .055, 28, true), m, [0, .222, 0], null, null, h).material.side = THREE.DoubleSide; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; mesh(G.cone(.014, .04, 8), m, [Math.sin(a) * .083, .268, Math.cos(a) * .083], null, null, h); } mesh(G.sph(.011, 10, 8), GLOSS("#d43c55"), [0, .222, .085], null, null, h); },
  headphones(h, c) { mesh(G.tor(.175, .011, Math.PI, 8, 32), GLOSS("#222228"), [0, .03, 0], null, null, h); [-1, 1].forEach(s => { mesh(G.cyl(.046, .046, .035, 24), GLOSS("#222228"), [s * .17, .0, 0], [0, 0, Math.PI / 2], null, h); mesh(G.tor(.04, .006, TAU, 8, 24), GLOSS(c), [s * .189, 0, 0], [0, Math.PI / 2, 0], null, h); }); },
  party(h, c) { mesh(G.cone(.06, .17, 24), GLOSS(c), [0, .285, .01], [.05, 0, .14], null, h); mesh(G.sph(.016, 10, 8), CLOTH("#f3b94d", .95), [-.024, .37, .015], null, null, h); }
};
function glassesRig(h, c, lens, frameGeo, lensGeo, lensScl) {
  [-1, 1].forEach(s => { mesh(frameGeo(), c, [s * .037, .006, .113], frameGeo.rot || null, null, h); if (lens) mesh(lensGeo(), lens(s), [s * .037, .006, .112], null, lensScl, h); });
  mesh(G.cap(.0022, .014, 6), c, [0, .012, .116], [0, 0, Math.PI / 2], null, h);
  [-1, 1].forEach(s => mesh(G.box(.003, .003, .115), c, [s * .078, .01, .058], [0, -s * .3, 0], null, h));
}
const GLASSES = {
  round(h, c) { const f = () => G.tor(.021, .0023, TAU, 8, 32); glassesRig(h, METAL(c), () => GLASS("#cfefff", .18), f, () => new THREE.CircleGeometry(.02, 32)); },
  shades(h, c) { const f = () => G.tor(.022, .003, TAU, 8, 32); glassesRig(h, GLOSS(c), () => GLOSS("#0b0b10"), f, () => new THREE.CircleGeometry(.021, 32), [1.12, .85, 1]); },
  nerd(h, c) { const f = () => G.tor(.026, .0042, TAU, 6, 4); f.rot = [0, 0, Math.PI / 4]; glassesRig(h, GLOSS(c), () => GLASS("#cfefff", .15), f, () => new THREE.CircleGeometry(.018, 32), [1.1, 1, 1]); },
  "3d"(h, c) { const f = () => G.tor(.026, .0042, TAU, 6, 4); f.rot = [0, 0, Math.PI / 4]; glassesRig(h, GLOSS(c), s => GLASS(s < 0 ? "#ff3048" : "#22d6ff", .65), f, () => new THREE.CircleGeometry(.018, 4, Math.PI / 4), [1.25, 1.25, 1]); },
  vr(h, c) { mesh(G.box(.2, .085, .08), GLOSS("#f3f0ea"), [0, .01, .12], null, null, h); mesh(G.box(.18, .065, .004), GLOSS("#151520"), [0, .01, .161], null, null, h); mesh(G.box(.12, .004, .002), BASIC(c), [0, .01, .1635], null, null, h); mesh(G.tor(.112, .008, TAU, 8, 40), CLOTH("#26262e"), [0, .01, 0], [Math.PI / 2, 0, 0], [1, 1.1, 1], h); }
};
const NECK = {
  chain(b, c) { mesh(G.tor(.075, .003, TAU, 6, 48), METAL(c), [0, 1.42, .03], [Math.PI / 2 - .55, 0, 0], null, b); mesh(new THREE.OctahedronGeometry(.012), METAL(c), [0, 1.355, fz(1.355) + .01], null, [1, 1.3, .6], b); },
  scarf(b, c) { mesh(G.tor(.073, .03, TAU, 10, 32), CLOTH(c, .95), [0, 1.455, 0], [Math.PI / 2 - .15, 0, 0], null, b); mesh(G.cap(.026, .14), CLOTH(c, .95), [.04, 1.33, fz(1.33) + .03], [.15, 0, .15], null, b); },
  bowtie(b, c) { [-1, 1].forEach(s => mesh(G.cone(.018, .032, 4), GLOSS(c), [s * .02, 1.435, .08], [0, 0, s * Math.PI / 2], null, b)); mesh(G.sph(.008, 10, 8), GLOSS(c), [0, 1.435, .083], null, null, b); },
  lanyard(b, c) { mesh(G.tor(.085, .0025, TAU, 6, 40), CLOTH(c), [0, 1.36, .045], [Math.PI / 2 - .95, 0, 0], null, b); mesh(G.box(.055, .075, .004), CLOTH("#f6f1e8", .6), [0, 1.2, fz(1.2) + .012], null, null, b); mesh(G.box(.055, .016, .005), CLOTH(c), [0, 1.23, fz(1.23) + .013], null, null, b); }
};
const HAND = {
  controller(h, c) { mesh(G.box(.14, .05, .035), GLOSS("#25232c"), [0, -.02, .05], null, null, h); [-1, 1].forEach(s => mesh(G.sph(.026, 12, 10), GLOSS("#25232c"), [s * .06, -.035, .05], null, null, h)); [[.035, -.01], [.05, -.022]].forEach(([x, y]) => mesh(G.sph(.007, 8, 6), GLOSS(c), [x, y, .07], null, null, h)); },
  coffee(h, c) { mesh(G.cyl(.032, .025, .085, 20), GLOSS("#f6f1e8"), [0, .0, .05], null, null, h); mesh(G.cyl(.033, .03, .03, 20, true), CLOTH(c), [0, -.005, .05], null, null, h); mesh(G.cyl(.034, .034, .008, 20), GLOSS("#3a2a20"), [0, .046, .05], null, null, h); },
  phone(h, c) { mesh(G.box(.07, .14, .009), GLOSS("#18171d"), [0, .0, .045], null, null, h); mesh(G.box(.062, .128, .002), BASIC(c), [0, .0, .0505], null, null, h); },
  sword(h, c) { mesh(G.cap(.012, .07, 8), LEATHER("#3a2a20"), [0, .0, .04], null, null, h); mesh(G.box(.1, .014, .02), METAL("#f3b94d"), [0, .05, .04], null, null, h); mesh(G.box(.024, .5, .006), METAL(c), [0, .31, .04], null, null, h); }
};

/* ---------- hair ---------- */
function curls(parent, hairC, n, place, size, seed) {
  if (!n) return;
  const r = rng(seed), d = new THREE.Object3D(), col = new THREE.Color(), pts = [];
  for (let i = 0; i < n * 4 && pts.length < n; i++) { const p = place(r); if (p) pts.push(p); }
  const im = new THREE.InstancedMesh(G.tor(size, size * .42, TAU, 6, 10), HAIR(hairC), pts.length);
  pts.forEach((p, i) => { d.position.set(...p); d.rotation.set(r() * TAU, r() * TAU, r() * TAU); d.scale.setScalar(.75 + r() * .6); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, col.set(hairC).offsetHSL(0, 0, (r() - .5) * .05)); });
  im.castShadow = true; parent.add(im);
}
function hairStyle(head, style, hairC, lite, nCurls = 1100) {
  const hg = new THREE.Group(); head.add(hg); const H = HAIR(hairC);
  const side = () => mesh(G.part(.104, 32, 20, Math.PI / 2 + .85, TAU - 1.7, .2, 2.0), H, [0, .02, 0], null, [1, 1.15, 1.1], hg);
  if (style === "afro") {
    const C = [0, .078, -.012], RX = .148, RY = .135, RZ = .158;
    mesh(G.part(1, 36, 22, 0, TAU, 0, 1.62), H, C, null, [RX * .93, RY * .93, RZ * .93], hg); side();
    const place = r => { const u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u), k = .94 + r() * .1; const x = C[0] + s * Math.cos(a) * RX * k, y = C[1] + u * RY * k, z = C[2] + s * Math.sin(a) * RZ * k; if (y < .062 && z > .03) return null; if (y < -.02) return null; return [x, y, z]; };
    curls(hg, hairC, lite ? 0 : nCurls, place, .0085, 404);
    const bulk = new THREE.InstancedMesh(G.sph(1, 10, 8), H, lite ? 40 : 220), d = new THREE.Object3D(), r = rng(7);
    for (let i = 0; i < bulk.count; i++) { let p; do p = place(r); while (!p); d.position.set(...p); d.scale.setScalar(.014 + r() * .012); d.updateMatrix(); bulk.setMatrixAt(i, d.matrix); }
    bulk.castShadow = true; hg.add(bulk);
  } else if (style === "short") { mesh(G.part(.108, 32, 18, 0, TAU, 0, 1.55), H, [0, .025, -.004], null, [1, 1.12, 1.1], hg); side(); }
  else if (style === "bun") { mesh(G.part(.108, 32, 18, 0, TAU, 0, 1.55), H, [0, .025, -.004], null, [1, 1.12, 1.1], hg); side(); mesh(G.sph(.045, 16, 12), H, [0, .12, -.09], null, null, hg); }
  else if (style === "long") { mesh(G.part(.11, 32, 18, 0, TAU, 0, 1.6), H, [0, .025, -.006], null, [1, 1.12, 1.1], hg); side(); mesh(G.cap(.085, .16, 16), H, [0, -.09, -.06], null, [1.25, 1, .55], hg); }
  return hg;
}

/* ---------- face ---------- */
const HEAD = [[.001, -.152], [.03, -.149], [.056, -.134], [.074, -.11], [.085, -.082], [.092, -.05], [.097, -.015], [.1, .02], [.099, .055], [.093, .088], [.081, .115], [.06, .137], [.032, .15], [.001, .154]];
const HZ = 1.1;
function hr(y) { for (let i = 0; i < HEAD.length - 1; i++) { const [r0, y0] = HEAD[i], [r1, y1] = HEAD[i + 1]; if (y >= y0 && y <= y1) return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return .05; }
const hf = y => hr(y) * HZ; // z of the face surface at height y
function face(head, skinC, hairC, lite, beardOn, nBeard = 420) {
  const S = SKIN(skinC), shade = SKIN(darker(skinC, .78)), H = HAIR(hairC);
  mesh(new THREE.LatheGeometry(HEAD.map(([r, y]) => new THREE.Vector2(r, y)), 48), S, null, null, [1, 1, HZ], head);
  [-1, 1].forEach(s => { const e = mesh(G.sph(.028, 16, 12), S, [s * .098, -.005, -.01], [0, s * .3, 0], [.42, 1, .75], head); if (!lite) mesh(G.sph(.016, 10, 8), shade, [s * .006, 0, .004], null, [.6, .8, .6], e); });
  const ez = hf(.006) - .0095;
  const eyes = [-1, 1].map(s => {
    const e = new THREE.Group(); e.position.set(s * .035, .006, ez); head.add(e);
    mesh(G.sph(.0135, 24, 18), GLOSS("#f1ebe3"), [0, 0, 0], null, null, e);
    if (!lite) { mesh(G.sph(.0074, 20, 14), std("#3b2416", .35), [0, 0, .0105], null, [1, 1, .45], e); mesh(G.sph(.0036, 12, 10), std("#050403", .2), [0, 0, .0135], null, [1, 1, .4], e); mesh(G.sph(.0015, 8, 6), BASIC("#ffffff"), [.003, .003, .0145], null, null, e); }
    else mesh(G.sph(.0075, 12, 10), std("#2a1a10", .3), [0, 0, .009], null, [1, 1, .5], e);
    if (!lite) mesh(G.part(.0148, 20, 10, 0, TAU, 0, Math.PI * .33), S, [0, .0005, .0005], [.35, 0, 0], null, e);
    if (!lite) mesh(G.part(.0146, 20, 8, 0, TAU, Math.PI * .74, Math.PI * .26), S, [0, 0, 0], [-.15, 0, 0], null, e);
    return e;
  });
  [-1, 1].forEach(s => mesh(G.cap(.0055, .028, 8), H, [s * .037, .034, hf(.034) + .001], [0, s * .25, Math.PI / 2 - s * .1], [1, 1.25, .8], head));
  mesh(G.cap(.0095, .03, 10), S, [0, -.008, hf(-.008) - .002], [.4, 0, 0], null, head);
  mesh(G.sph(.0135, 16, 12), S, [0, -.031, hf(-.031) + .007], null, [1.1, .9, 1], head);
  [-1, 1].forEach(s => { mesh(G.sph(.0095, 12, 10), S, [s * .0135, -.035, hf(-.035) + .001], null, null, head); if (!lite) mesh(G.sph(.0035, 8, 6), BASIC("#2a1510"), [s * .007, -.041, hf(-.041) + .006], null, null, head); });
  const lip = LIP(darker(skinC, .62)), bz = beardOn ? .006 : 0;
  mesh(G.cap(.0058, .028, 8), lip, [0, -.06, hf(-.06) + .002 + bz], [0, 0, Math.PI / 2], [1, 1, .8], head);
  mesh(G.tor(.018, .006, Math.PI, 8, 16), lip, [0, -.06, hf(-.06) + .001 + bz], [0, 0, Math.PI], [1, .75, .8], head);
  if (!lite) mesh(G.box(.024, .0055, .003), GLOSS("#f2ede4"), [0, -.0652, hf(-.065) + .001 + bz], null, null, head);
  if (beardOn) {
    const pts = HEAD.filter(([, y]) => y < -.042).map(([r, y]) => new THREE.Vector2(r * 1.065, y - .002));
    pts.push(new THREE.Vector2(hr(-.042) * 1.06, -.042));
    mesh(new THREE.LatheGeometry(pts, 40, -1.85, 3.7), H, null, null, [1, 1, HZ], head).material.side = THREE.DoubleSide;
    [-1, 1].forEach(s => mesh(G.cap(.007, .026, 8), H, [s * .015, -.05, hf(-.05) + .009], [0, 0, Math.PI / 2 - s * .32], [1, 1, .8], head));
    if (!lite) curls(head, hairC, nBeard, r => { const y = -.15 + r() * .118, a = -1.8 + r() * 3.6, rr = hr(y) * 1.075; const x = Math.sin(a) * rr, z = Math.cos(a) * rr * HZ; if (Math.abs(x) < .024 && y > -.075 && y < -.046) return null; return [x, y, z]; }, .0055, 99);
  }
  return eyes;
}

/* ---------- full character ---------- */
export function buildJack(W, L, o = {}) {
  const lite = !!o.lite, P = {}, g = new THREE.Group();
  const skin = o.skin || W.skin, hairC = o.hairColor || W.hair, S = SKIN(skin);
  const top = find(W.tops, L.top), pantsI = find(W.pants, L.pants), shoeI = find(W.shoes, L.shoes);
  const topMat = top.style === "polo" ? polo(top) : top.style === "bandhgala" ? VELVET(top.color) : CLOTH(top.color, top.style === "suit" ? .62 : .88);
  const pantsMat = CLOTH(pantsI.color, /jean|denim/i.test(pantsI.name) ? .95 : .85);
  const shoeMat = /loafer/i.test(shoeI.name) ? LEATHER(shoeI.color) : CLOTH(shoeI.color, .7);
  const body = P.body = new THREE.Group(); g.add(body);
  mesh(torsoGeo(), topMat, null, null, [WID, 1, DEP], body);
  mesh(G.cyl(.05, .057, .13, 24), S, [0, 1.49, -.005], null, null, body);
  [-1, 1].forEach(s => mesh(G.sph(.063, 20, 16), topMat, [s * .19, 1.36, 0], null, [1, .9, .95], body));
  TOP[top.style]?.(body, top);
  mesh(G.sph(.165, 28, 18), pantsMat, [0, .92, 0], null, [1.06, .5, .7], body);
  if (["tee", "polo", "jersey", "hoodie"].includes(top.style)) ring(.955, .028, null, body, LEATHER("#2a1d16"));
  P.knees = [];
  P.legs = [-1, 1].map(s => {
    const hip = new THREE.Group(); hip.position.set(s * .09, .9, 0); body.add(hip);
    mesh(G.cap(.071, .3, 16), pantsMat, [0, -.2, 0], null, null, hip);
    const knee = new THREE.Group(); knee.position.y = -.44; hip.add(knee); P.knees.push(knee);
    mesh(G.cap(.057, .32, 16), pantsMat, [0, -.19, 0], null, null, knee);
    mesh(G.sph(.062, 20, 14), shoeMat, [0, -.405, .035], null, [.85, .58, 1.85], knee);
    mesh(G.cyl(.054, .056, .014, 20), CLOTH(/sneak|kick/i.test(shoeI.name) ? "#f2f0ea" : darker(shoeI.color, .6), .7), [0, -.432, .035], null, [1, 1, 2.1], knee);
    return hip;
  });
  const shortSleeve = top.style === "tee" || top.style === "jersey";
  P.elbows = []; P.hands = [];
  P.arms = [-1, 1].map(s => {
    const sh = new THREE.Group(); sh.position.set(s * .205, 1.37, 0); sh.rotation.z = s * .1; sh.userData.base = s * .1; body.add(sh);
    mesh(G.cap(.048, .2, 16), topMat, [0, -.14, 0], null, null, sh);
    if (shortSleeve) { mesh(G.cyl(.054, .056, .06, 20, true), topMat, [0, -.2, 0], null, null, sh); mesh(G.cap(.042, .1, 14), S, [0, -.2, 0], null, null, sh); }
    const el = new THREE.Group(); el.position.y = -.29; sh.add(el); P.elbows.push(el);
    mesh(G.cap(.041, .19, 16), shortSleeve ? S : topMat, [0, -.12, 0], null, null, el);
    if (!shortSleeve) mesh(G.cyl(.045, .046, .02, 20), topMat, [0, -.225, 0], null, null, el);
    const hand = new THREE.Group(); hand.position.y = -.27; el.add(hand); P.hands.push(hand);
    mesh(G.sph(.045, 18, 14), S, [0, -.035, 0], null, [.6, 1.15, .85], hand);
    if (!lite) { mesh(G.cap(.012, .03, 8), S, [-s * .018, -.02, .025], [.6, 0, s * .4], null, hand); mesh(G.box(.05, .05, .045), S, [0, -.07, .006], [.25, 0, 0], [.95, .6, .8], hand); }
    if (s === -1 && !lite && top.style !== "suit") { mesh(G.cyl(.046, .046, .018, 24, true), GLOSS("#e9e6e0"), [0, -.205, 0], null, null, el); mesh(G.cyl(.02, .02, .008, 20), GLOSS("#1a1a20"), [0, -.205, .046], [Math.PI / 2, 0, 0], null, el); }
    return sh;
  });
  const item = find(W.hand, L.hand);
  if (HAND[item.id]) HAND[item.id](P.hands[1], item.color);
  const neck = find(W.neck, L.neck); if (NECK[neck.id]) NECK[neck.id](body, neck.color);
  const head = P.head = new THREE.Group(); head.position.set(0, 1.6, .005); body.add(head);
  P.eyes = face(head, skin, hairC, lite, o.beard ?? true, o.beardCurls);
  P.hair = hairStyle(head, o.hair || "afro", hairC, lite, o.curls);
  const hat = find(W.hats, L.hat); P.hairBaseY = 1;
  if (HAT[hat.id]) { HAT[hat.id](head, hat.color); if (!["headphones", "crown", "party"].includes(hat.id)) P.hairBaseY = .82; }
  const gl = find(W.glasses, L.glasses); if (GLASSES[gl.id]) GLASSES[gl.id](head, gl.color);
  P.hair.scale.y = P.hairBaseY;
  if (ENV) g.traverse(m => { const mt = m.material; if (mt && mt.isMeshStandardMaterial && !mt.envMap) { mt.envMap = ENV; mt.envMapIntensity = .8; mt.needsUpdate = true; } });
  return { g, P };
}
export { THREE };
export function lookName(W, L) {
  const w = [find(W.hats, L.hat).word, find(W.glasses, L.glasses).word, find(W.neck, L.neck).word].filter(Boolean);
  return [...w.slice(0, 2), find(W.tops, L.top).name].join(" ");
}
export function randomLook(W, r = Math.random) {
  const p = (a, none = 0) => (none && r() < none ? a[0] : a[1 + Math.floor(r() * (a.length - 1))] || a[0]).id;
  const any = a => a[Math.floor(r() * a.length)].id;
  return { top: any(W.tops), pants: any(W.pants), shoes: any(W.shoes), hat: p(W.hats, .45), glasses: p(W.glasses, .5), neck: p(W.neck, .55), hand: p(W.hand, .6) };
}
export function disposeTree(root) { root.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material?.userData?.own) { o.material.map?.dispose(); o.material.dispose(); } }); }

/* ---------- landing-page viewer ---------- */
export function mountJack3D(el, { wardrobe: W, look, onPoke } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const cv = renderer.domElement; cv.style.cssText = "width:100%;height:100%;display:block;touch-action:manipulation";
  el.innerHTML = ""; el.appendChild(cv);
  const scene = new THREE.Scene(); scene.environment = getEnv(renderer);
  const cam = new THREE.PerspectiveCamera(22, 1, .1, 50); cam.position.set(0, 1.05, 5.7); cam.lookAt(0, .93, 0);
  scene.add(new THREE.HemisphereLight("#fff4ea", "#3a2e40", .5));
  const key = new THREE.DirectionalLight("#fff1e0", 2.6); key.position.set(2.2, 3.5, 3.2); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = key.shadow.camera.bottom = -1.4; key.shadow.camera.right = key.shadow.camera.top = 1.4; key.shadow.bias = -.0004; key.shadow.normalBias = .02; scene.add(key);
  const rim = new THREE.DirectionalLight("#ff9fb0", 2.2); rim.position.set(-2.5, 2, -2.5); scene.add(rim);
  const fill = new THREE.DirectionalLight("#9fd8ff", .6); fill.position.set(-3, 1, 2); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.2, 48), new THREE.ShadowMaterial({ opacity: .35 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const root = new THREE.Group(); scene.add(root);

  let cur = null, P = null, L = { ...(look || randomLook(W)) };
  function apply(l) { L = { ...L, ...l }; if (cur) { root.remove(cur); disposeTree(cur); } const b = buildJack(W, L, matchMedia("(pointer: coarse)").matches ? { curls: 600, beardCurls: 240 } : {}); cur = b.g; P = b.P; root.add(cur); }
  apply(L);

  let ty = 0, tp = 0, yaw = 0, pitch = 0, lastMove = -9, clock = 0;
  addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); ty = Math.max(-.6, Math.min(.6, (e.clientX - (r.left + r.width / 2)) / innerWidth * 2)); tp = Math.max(-.3, Math.min(.35, (e.clientY - (r.top + r.height * .18)) / innerHeight * 1.2)); lastMove = clock; }, { passive: true });
  let last = performance.now(), blinkAt = 1.5, wave = 2.4, jy = 0, jv = 0, squash = 0, spinT = 0, pending = null, raf = 0, visible = true;
  function poke(next) { if (spinT > 0) return; jv = 3.2; spinT = .7; pending = next || randomLook(W); onPoke && onPoke(pending); }
  cv.addEventListener("click", () => poke());
  function frame(now) {
    raf = 0; if (!visible || document.hidden) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; clock += dt; const t = clock;
    if (jv || jy > 0) { jv -= 11 * dt; jy += jv * dt; if (jy <= 0) { jy = 0; jv = 0; squash = .18; } }
    squash = Math.max(0, squash - dt * 1.2);
    const sq = squash * Math.sin(squash * 30);
    root.position.y = jy; root.scale.set(1 + sq * .4, 1 - sq * .4, 1 + sq * .4);
    if (spinT > 0) { spinT -= dt; root.rotation.y = (1 - Math.max(0, spinT) / .7) * TAU; if (pending && spinT < .35) { apply(pending); pending = null; } } else root.rotation.y = 0;
    if (t - lastMove > 3) { ty = Math.sin(t * .5) * .35; tp = Math.sin(t * .37) * .06; }
    yaw += (ty - yaw) * Math.min(1, dt * 5); pitch += (tp - pitch) * Math.min(1, dt * 5);
    P.head.rotation.set(pitch, yaw, Math.sin(t * 1.1) * .03);
    P.body.rotation.y = yaw * .2;
    const br = Math.sin(t * 1.6); P.body.position.y = br * .003; P.body.rotation.z = Math.sin(t * .6) * .012;
    P.hair.scale.set(1 + br * .006, P.hairBaseY * (1 + br * .006), 1 + br * .006);
    P.arms[0].rotation.x = Math.sin(t * 1.6) * .04; P.arms[0].rotation.z = P.arms[0].userData.base;
    if (wave > 0) { wave -= dt; P.arms[1].rotation.z = 2.7; P.arms[1].rotation.x = 0; P.elbows[1].rotation.z = .5 + Math.sin(t * 12) * .35; if (wave <= 0) P.elbows[1].rotation.z = 0; }
    else { P.arms[1].rotation.z += (P.arms[1].userData.base - P.arms[1].rotation.z) * .15; P.arms[1].rotation.x = -Math.sin(t * 1.6) * .04; P.elbows.forEach(e => e.rotation.x = -.12); }
    const bt = t - blinkAt, ey = bt > 0 && bt < .12 ? .12 : 1; if (bt >= .12) blinkAt = t + 2 + Math.random() * 3;
    P.eyes.forEach(e => e.scale.y = ey);
    renderer.render(scene, cam); raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const size = () => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(el); size();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; start(); }).observe(el);
  document.addEventListener("visibilitychange", start); start();
  return { get look() { return { ...L }; }, setLook(l) { apply(l); jv = Math.max(jv, 1.6); }, poke, wave() { wave = 1.6; } };
}
