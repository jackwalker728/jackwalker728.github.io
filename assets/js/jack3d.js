/* Cute 3D chibi Jack — procedural (no model files), toon-shaded, dress-up ready.
   Usage: const j = mountJack3D(el, { wardrobe, look, onPoke }); j.setLook(look); j.poke(); */
import * as THREE from "../vendor/three.module.min.js";
import { RoomEnvironment } from "../vendor/RoomEnvironment.js";
let ENV = null;
export function getEnv(renderer) { if (!ENV) { const pm = new THREE.PMREMGenerator(renderer); ENV = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose(); } return ENV; }

const TAU = Math.PI * 2;
const grad = (() => { const t = new THREE.DataTexture(new Uint8Array([95, 175, 255]), 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const cache = new Map();
const M = (c, side) => { const k = c + (side || ""); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, side: side ? THREE.DoubleSide : THREE.FrontSide })); return cache.get(k); };
const B = (c, op = 1) => { const k = "b" + c + op; if (!cache.has(k)) cache.set(k, new THREE.MeshBasicMaterial({ color: c, transparent: op < 1, opacity: op, depthWrite: op === 1 })); return cache.get(k); };
const OUT = new THREE.MeshBasicMaterial({ color: 0x170e13, side: THREE.BackSide });

const G = {
  sph: (r, w = 24, h = 16) => new THREE.SphereGeometry(r, w, h),
  dome: (r = 1) => new THREE.SphereGeometry(r, 28, 12, 0, TAU, 0, Math.PI / 2),
  cap: (r, l) => new THREE.CapsuleGeometry(r, l, 6, 16),
  cyl: (a, b, h, s = 24, open = false) => new THREE.CylinderGeometry(a, b, h, s, 1, open),
  cone: (r, h, s = 20) => new THREE.ConeGeometry(r, h, s),
  tor: (r, t, arc = TAU, rs = 10, ts = 36) => new THREE.TorusGeometry(r, t, rs, ts, arc),
  box: (x, y, z) => new THREE.BoxGeometry(x, y, z),
  circ: (r, a = 0, l = TAU) => new THREE.CircleGeometry(r, 24, a, l),
  shape: pts => new THREE.ShapeGeometry(new THREE.Shape(pts.map(p => new THREE.Vector2(...p))))
};
function mesh(geo, mat, pos, rot, scl, outline) {
  const m = new THREE.Mesh(geo, typeof mat === "string" ? M(mat) : mat);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scl) typeof scl === "number" ? m.scale.setScalar(scl) : m.scale.set(...scl);
  if (outline) { geo.computeBoundingSphere(); const o = new THREE.Mesh(geo, OUT); o.scale.setScalar(1 + outline / geo.boundingSphere.radius); m.add(o); }
  return m;
}
const darker = (c, k = .8) => "#" + new THREE.Color(c).multiplyScalar(k).getHexString();
const find = (list, id) => list.find(x => x.id === id) || list[0];
function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function canvasTex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

/* ---------------- outfit pieces ---------------- */
const TOP = { // extra details on the torso (front of torso is z≈0.58)
  bandhgala(b, t) {
    b.add(mesh(G.box(.24, .8, .04), t.shirt, [0, -1.62, .55]));
    [-1.35, -1.6, -1.85].forEach(y => b.add(mesh(G.sph(.04, 10, 8), t.accent, [-.17, y, .59])));
    [-1.4, -1.7].forEach(y => b.add(mesh(G.sph(.035, 10, 8), darker(t.color, 1.3), [.24, y, .57])));
    b.add(mesh(G.cyl(.3, .34, .14, 24, true), M(t.color, 1), [0, -1.0, 0]));
  },
  tee(b, t) {
    b.add(mesh(G.tor(.11, .022), t.accent, [0, -1.6, .585]));
    b.add(mesh(G.box(.1, .025, .02), t.accent, [0, -1.6, .59]));
    b.add(mesh(G.box(.025, .1, .02), t.accent, [0, -1.6, .59]));
  },
  polo(b, t) {
    [-1, 1].forEach(s => b.add(mesh(G.box(.24, .11, .04), darker(t.color, .75), [s * .13, -1.08, .48], [-.4, 0, s * .45])));
    b.add(mesh(G.box(.08, .3, .03), darker(t.color, .8), [0, -1.3, .56]));
    [-1.22, -1.36].forEach(y => b.add(mesh(G.sph(.025, 8, 6), t.accent, [0, y, .58])));
  },
  suit(b, t) {
    b.add(mesh(G.shape([[-.22, 0], [.22, 0], [0, -.58]]), M(t.shirt, 1), [0, -1.12, .555], [-.2, 0, 0]));
    b.add(mesh(G.shape([[-.045, 0], [.045, 0], [.07, -.36], [0, -.46], [-.07, -.36]]), M(t.accent, 1), [0, -1.14, .575], [-.2, 0, 0]));
    b.add(mesh(G.box(.14, .05, .03), "#2c3050", [.3, -1.48, .52], [0, .45, 0]));
  },
  hoodie(b, t) {
    b.add(mesh(G.tor(.42, .17), t.color, [0, -1.0, -.14], [Math.PI / 2 - .35, 0, 0], 0, .03));
    b.add(mesh(G.box(.62, .26, .05), darker(t.color, .85), [0, -1.98, .53]));
    [-1, 1].forEach(s => b.add(mesh(G.cap(.022, .22), t.accent, [s * .1, -1.32, .575])));
  },
  kurta(b, t) {
    b.add(mesh(G.cyl(.6, .72, .55), t.color, [0, -2.3, 0], 0, 0, .03));
    b.add(mesh(G.box(.1, .62, .03), t.accent, [0, -1.4, .565]));
    [-1.2, -1.4, -1.6].forEach(y => b.add(mesh(G.sph(.03, 8, 6), "#f6efe0", [0, y, .59])));
    b.add(mesh(G.cyl(.3, .33, .13, 24, true), M(t.accent, 1), [0, -1.0, 0]));
  },
  jersey(b, t) {
    [-1.36, -1.94].forEach(y => b.add(mesh(G.cyl(.59, .59, .06, 32, true), M(t.accent, 1), [0, y, 0])));
    const tex = canvasTex(256, 160, x => { x.fillStyle = t.accent; x.font = "900 118px system-ui,Arial,sans-serif"; x.textAlign = "center"; x.fillText(t.number || "01", 128, 128); });
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true }); m.userData.own = 1;
    b.add(mesh(new THREE.PlaneGeometry(.5, .31), m, [0, -1.65, .59]));
  }
};
function polo(t) {
  const tex = canvasTex(64, 64, x => { x.fillStyle = t.color; x.fillRect(0, 0, 64, 64); x.strokeStyle = "rgba(255,255,255,.13)"; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 0); x.lineTo(64, 64); x.moveTo(64, 0); x.lineTo(0, 64); x.stroke(); x.fillStyle = t.accent; x.beginPath(); x.arc(32, 32, 6, 0, 7); x.fill(); });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(7, 3);
  const m = new THREE.MeshToonMaterial({ map: tex, gradientMap: grad }); m.userData.own = 1; return m;
}

const HAT = {
  cap(h, c) { h.add(mesh(G.dome(), c, [0, .7, -.05], 0, [1.2, .82, 1.2], .03)); h.add(mesh(G.cyl(.62, .62, .05, 28), darker(c, .85), [0, .76, 1.02], [.22, 0, 0], [1, 1, 1.2])); h.add(mesh(G.sph(.08, 10, 8), darker(c, .85), [0, 1.52, -.05])); },
  beanie(h, c) { h.add(mesh(G.dome(), c, [0, .62, 0], 0, [1.22, 1.02, 1.22], .03)); h.add(mesh(G.tor(1.18, .15), darker(c, .85), [0, .66, 0], [Math.PI / 2, 0, 0], 0, .02)); h.add(mesh(G.sph(.25, 14, 10), "#f6f1e8", [0, 1.68, 0], 0, 0, .03)); },
  cowboy(h, c) { h.add(mesh(G.cyl(.72, .86, .72), c, [0, 1.32, 0], 0, 0, .03)); h.add(mesh(G.cyl(1.85, 1.85, .05, 40), c, [0, .98, 0], 0, 0, .02)); h.add(mesh(G.tor(1.85, .07, TAU, 8, 48), c, [0, 1.03, 0], [Math.PI / 2, 0, 0])); h.add(mesh(G.cyl(.87, .87, .14, 28, true), M("#2a1a12", 1), [0, 1.04, 0])); },
  crown(h, c) { h.add(mesh(G.cyl(.62, .56, .34, 28, true), M(c, 1), [0, 1.52, 0], 0, 0, .02)); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; h.add(mesh(G.cone(.1, .26, 8), c, [Math.sin(a) * .6, 1.82, Math.cos(a) * .6])); } h.add(mesh(G.sph(.08, 10, 8), "#d43c55", [0, 1.52, .6])); },
  headphones(h, c) { h.add(mesh(G.tor(1.5, .075, Math.PI, 8, 32), "#222228", [0, .05, 0], 0, 0, .02)); [-1, 1].forEach(s => { h.add(mesh(G.cyl(.34, .34, .26), "#222228", [s * 1.5, .05, 0], [0, 0, Math.PI / 2], 0, .03)); h.add(mesh(G.tor(.3, .05), c, [s * 1.64, .05, 0], [0, Math.PI / 2, 0])); }); },
  party(h, c) { h.add(mesh(G.cone(.42, 1.0, 24), c, [0, 1.95, .05], [.1, 0, .18], 0, .03)); h.add(mesh(G.sph(.14, 12, 10), "#f3b94d", [-.17, 2.44, .1], 0, 0, .02)); }
};

function frames(g, mk, lens) { // shared glasses rig
  [-1, 1].forEach(s => { const f = mk(s); f.position.set(s * .32, .03, 1.03); g.add(f); if (lens) g.add(mesh(lens.geo(), lens.mat(s), [s * .32, .03, 1.025], 0, lens.scl)); });
  g.add(mesh(G.cap(.022, .12), g.userData.c, [0, .08, 1.04], [0, 0, Math.PI / 2]));
  [-1, 1].forEach(s => g.add(mesh(G.box(.035, .035, 1.1), g.userData.c, [s * .76, .06, .5], [0, -s * .43, 0])));
}
const GLASSES = {
  round(g, c) { g.userData.c = c; frames(g, () => mesh(G.tor(.2, .03), c), { geo: () => G.circ(.19), mat: () => B("#cfefff", .25) }); },
  shades(g, c) { g.userData.c = c; frames(g, () => mesh(G.tor(.21, .035), c, 0, 0, [1.12, .85, 1]), { geo: () => G.circ(.2), mat: () => B("#0d0d12"), scl: [1.1, .82, 1] }); g.add(mesh(G.box(.95, .045, .04), c, [0, .21, 1.02])); },
  nerd(g, c) { g.userData.c = c; frames(g, () => mesh(G.tor(.25, .045, TAU, 6, 4), c, 0, [0, 0, Math.PI / 4]), { geo: () => G.circ(.17), mat: () => B("#cfefff", .2), scl: [1.1, 1, 1] }); },
  "3d"(g, c) { g.userData.c = c; frames(g, () => mesh(G.tor(.25, .04, TAU, 6, 4), c, 0, [0, 0, Math.PI / 4]), { geo: () => G.circ(.17, Math.PI / 4, TAU), mat: s => B(s < 0 ? "#ff3048" : "#22d6ff", .6), scl: [1.1, 1, 1] }); },
  vr(g, c) { g.add(mesh(G.box(1.05, .44, .42), "#f3f0ea", [0, .05, .98], 0, 0, .03)); g.add(mesh(G.box(.94, .3, .02), B("#151520"), [0, .05, 1.2])); g.add(mesh(G.box(.6, .03, .01), B(c), [0, .05, 1.215])); g.add(mesh(G.tor(1.06, .05), "#26262e", [0, .05, 0], [Math.PI / 2, 0, 0])); }
};

const NECK = {
  chain(b, c) { b.add(mesh(G.tor(.4, .028, TAU, 8, 40), c, [0, -1.14, .14], [Math.PI / 2 - .5, 0, 0])); b.add(mesh(new THREE.OctahedronGeometry(.08), c, [0, -1.36, .56], 0, [1, 1.3, .6])); },
  scarf(b, c) { b.add(mesh(G.tor(.42, .14), c, [0, -1.04, .04], [Math.PI / 2 - .2, 0, 0], 0, .02)); b.add(mesh(G.cap(.1, .42), c, [.22, -1.48, .6], [.2, 0, .18], 0, .02)); },
  bowtie(b, c) { [-1, 1].forEach(s => b.add(mesh(G.cone(.1, .18, 4), c, [s * .1, -1.1, .55], [0, 0, s * Math.PI / 2], 0, .015))); b.add(mesh(G.sph(.055, 10, 8), c, [0, -1.1, .57])); },
  lanyard(b, c) { b.add(mesh(G.tor(.36, .018, TAU, 6, 32), c, [0, -1.25, .2], [Math.PI / 2 - .95, 0, 0])); b.add(mesh(G.box(.26, .34, .02), "#f6f1e8", [0, -1.66, .6], 0, 0, .015)); b.add(mesh(G.box(.26, .08, .025), c, [0, -1.53, .605])); }
};

const HAND = {
  controller(h, c) { h.add(mesh(G.box(.44, .2, .12), "#25232c", [0, 0, 0], 0, 0, .02)); [-1, 1].forEach(s => h.add(mesh(G.sph(.1, 12, 8), "#25232c", [s * .2, -.06, 0]))); [[.1, .03], [.15, -.02]].forEach(([x, y]) => h.add(mesh(G.sph(.03, 8, 6), c, [x, y, .07]))); h.add(mesh(G.box(.1, .03, .02), "#9a97a6", [-.12, 0, .07])); },
  coffee(h, c) { h.add(mesh(G.cyl(.13, .1, .3), "#f6f1e8", [0, .05, 0], 0, 0, .02)); h.add(mesh(G.cyl(.135, .12, .12, 20, true), M(c, 1), [0, .03, 0])); h.add(mesh(G.cyl(.14, .14, .04), "#3a2a20", [0, .21, 0])); },
  phone(h, c) { h.add(mesh(G.box(.2, .36, .035), "#18171d", [0, .05, 0], 0, 0, .015)); h.add(mesh(G.box(.17, .31, .01), B(c), [0, .05, .022])); },
  sword(h, c) { h.add(mesh(G.cap(.04, .14), "#3a2a20", [0, 0, 0])); h.add(mesh(G.box(.32, .05, .07), "#f3b94d", [0, .12, 0])); h.add(mesh(G.box(.08, .85, .025), B(c), [0, .58, 0], 0, 0, .02)); }
};

/* ---------------- character ---------------- */
function build(W, L) {
  const P = {}, g = new THREE.Group();
  const skin = W.skin, hairC = W.hair, shade = darker(skin, .82);
  const top = find(W.tops, L.top), pants = find(W.pants, L.pants).color, shoe = find(W.shoes, L.shoes).color;
  const topMat = top.style === "polo" ? polo(top) : M(top.color);

  // body
  const body = P.body = new THREE.Group(); g.add(body);
  P.legs = [-1, 1].map(s => { // leg pivots at the hip so the world can animate walking
    const l = new THREE.Group(); l.position.set(s * .25, -2.2, 0);
    l.add(mesh(G.cap(.2, .32), pants, [0, -.32, 0], 0, 0, .03));
    l.add(mesh(G.sph(.25), shoe, [s * .02, -.75, .1], 0, [1, .62, 1.45], .03));
    body.add(l); return l;
  });
  body.add(mesh(G.cap(.58, .45), topMat, [0, -1.65, 0], 0, 0, .035));
  TOP[top.style]?.(body, top);
  body.add(mesh(G.cyl(.22, .25, .3), shade, [0, -.95, 0]));
  const neck = find(W.neck, L.neck); if (NECK[neck.id]) NECK[neck.id](body, neck.color);

  // arms (pivot at shoulder)
  P.arms = [-1, 1].map(s => {
    const a = new THREE.Group(); a.position.set(s * .6, -1.18, 0); a.rotation.z = s * .28; a.userData.base = s * .28;
    a.add(mesh(G.cap(.16, .32), topMat, [0, -.25, 0], 0, 0, .03));
    a.add(mesh(G.cap(.145, .3), top.style === "tee" ? M(skin) : topMat, [0, -.62, 0], 0, 0, .03));
    a.add(mesh(G.sph(.19), skin, [0, -.92, 0], 0, 0, .03));
    body.add(a); return a;
  });
  const item = find(W.hand, L.hand);
  if (HAND[item.id]) { const h = new THREE.Group(); h.position.set(0, -.98, .2); h.rotation.z = -.28; HAND[item.id](h, item.color); P.arms[1].add(h); }

  // head
  const head = P.head = new THREE.Group(); g.add(head);
  head.add(mesh(G.sph(1, 36, 28), skin, 0, 0, 0, .035));
  [-1, 1].forEach(s => head.add(mesh(G.sph(.2), shade, [s * .98, -.02, 0], 0, [.6, 1, .9], .03)));
  P.eyes = [-1, 1].map(s => {
    const e = new THREE.Group(); e.position.set(s * .32, .02, .9);
    e.add(mesh(G.sph(.13), "#1b1210", 0, 0, [1, 1.3, .6]));
    e.add(mesh(G.sph(.045, 10, 8), B("#ffffff"), [.045, .075, .07]));
    e.add(mesh(G.sph(.022, 8, 6), B("#ffffff"), [-.035, -.06, .075]));
    head.add(e); return e;
  });
  [-1, 1].forEach(s => head.add(mesh(G.cap(.048, .2), hairC, [s * .33, .29, .93], [0, s * .33, Math.PI / 2 - s * .12])));
  head.add(mesh(G.sph(.085), shade, [0, -.12, .98], 0, [1.15, .85, .8]));
  [-1, 1].forEach(s => { const b = mesh(G.circ(.12), B("#e5786a", .45), [s * .56, -.17, .83]); b.lookAt(b.position.clone().multiplyScalar(2)); head.add(b); });
  // beard + moustache + smile
  head.add(mesh(new THREE.SphereGeometry(1.04, 36, 12, Math.PI / 2 - 1.35, 2.7, 1.9, 1.15), M(hairC, 1)));
  [-1, 1].forEach(s => head.add(mesh(G.cap(.056, .16), hairC, [s * .11, -.3, .985], [0, 0, Math.PI / 2 - s * .3])));
  const mouth = new THREE.Group(); mouth.position.set(0, -.44, .965); mouth.rotation.x = .42; head.add(mouth);
  mouth.add(mesh(G.circ(.16, Math.PI, Math.PI), B("#fffaf2")));
  mouth.add(mesh(G.tor(.165, .034, Math.PI, 8, 20), "#3a1414", [0, 0, .005], [0, 0, Math.PI]));

  // big curly hair — one instanced draw call (+ one for the outline)
  const hat = find(W.hats, L.hat), covered = ["cap", "beanie", "cowboy"].includes(hat.id);
  const r = rng(404), pts = [], N = 170;
  for (let i = 0; i < N; i++) {
    const y = 1 - (i + .5) / N * 2, rr = Math.sqrt(1 - y * y), a = i * 2.39996, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    if (y < (z < -.3 ? -.55 : -.12)) continue;
    if (z > .25 && y < .6) continue;
    if (y < .15 && Math.abs(x) > .8 && z > -.3) continue;
    if (covered && y > .3) continue;
    pts.push([x, y, z]);
  }
  const hg = G.sph(1, 10, 8), hair = P.hair = new THREE.Group();
  const im = new THREE.InstancedMesh(hg, M(hairC), pts.length), io = new THREE.InstancedMesh(hg, OUT, pts.length);
  const d = new THREE.Object3D(), col = new THREE.Color();
  pts.forEach((p, i) => {
    const s = .3 + r() * .15, R = 1.12 + r() * .1;
    d.position.set(p[0] * R * 1.04, p[1] * R + .06, p[2] * R); d.scale.setScalar(s); d.updateMatrix(); im.setMatrixAt(i, d.matrix);
    d.scale.setScalar(s + .035); d.updateMatrix(); io.setMatrixAt(i, d.matrix);
    im.setColorAt(i, col.set(hairC).offsetHSL(0, 0, (r() - .5) * .07));
  });
  hair.add(io, im); head.add(hair);

  P.hairBaseY = hat.id === "crown" || hat.id === "party" ? .9 : 1;
  if (HAT[hat.id]) HAT[hat.id](head, hat.color);
  const gl = find(W.glasses, L.glasses);
  if (GLASSES[gl.id]) { const gg = new THREE.Group(); GLASSES[gl.id](gg, gl.color); head.add(gg); }
  P.knees = P.legs.map(l => l.add(new THREE.Group()).children.at(-1)); P.elbows = P.arms.map(a => a.add(new THREE.Group()).children.at(-1));
  return { g, P };
}

export { build as buildJack, THREE };
export function lookName(W, L) {
  const w = [find(W.hats, L.hat).word, find(W.glasses, L.glasses).word, find(W.neck, L.neck).word].filter(Boolean);
  return [...w.slice(0, 2), find(W.tops, L.top).name].join(" ");
}
export function randomLook(W, rnd = Math.random) {
  const p = (a, none = 0) => (none && rnd() < none ? a[0] : a[1 + Math.floor(rnd() * (a.length - 1))] || a[0]).id;
  const any = a => a[Math.floor(rnd() * a.length)].id;
  return { top: any(W.tops), pants: any(W.pants), shoes: any(W.shoes), hat: p(W.hats, .45), glasses: p(W.glasses, .5), neck: p(W.neck, .55), hand: p(W.hand, .6) };
}

export function mountJack3D(el, { wardrobe: W, look, onPoke } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const cv = renderer.domElement; cv.style.cssText = "width:100%;height:100%;display:block;touch-action:manipulation";
  el.innerHTML = ""; el.appendChild(cv);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(28, 1, .1, 60); cam.position.set(0, -.45, 11.5); cam.lookAt(0, -.68, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a5a7a, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3); sun.position.set(3, 5, 7); scene.add(sun);
  const rim = new THREE.DirectionalLight(0xff8fa3, 1.4); rim.position.set(-5, 2, -4); scene.add(rim);
  const root = new THREE.Group(); scene.add(root);
  const shadow = mesh(G.circ(1.1), B("#000000", .28), [0, -3.14, 0], [-Math.PI / 2, 0, 0], [1.25, 1.25, 1]); scene.add(shadow);

  let cur = null, P = null, L = { ...(look || randomLook(W)) };
  function apply(l) {
    L = { ...L, ...l };
    if (cur) { root.remove(cur); cur.traverse(o => { if (o.geometry && o.geometry !== shadow.geometry) o.geometry.dispose(); if (o.material?.userData?.own) { o.material.map?.dispose(); o.material.dispose(); } }); }
    const b = build(W, L); cur = b.g; P = b.P; root.add(cur);
  }
  apply(L);

  // look-at pointer
  let ty = 0, tp = 0, yaw = 0, pitch = 0, lastMove = -9;
  const onMove = e => { const r = el.getBoundingClientRect(); ty = Math.max(-.55, Math.min(.55, (e.clientX - (r.left + r.width / 2)) / innerWidth * 1.8)); tp = Math.max(-.3, Math.min(.3, (e.clientY - (r.top + r.height * .35)) / innerHeight * 1.1)); lastMove = clock; };
  addEventListener("pointermove", onMove, { passive: true });

  // animation state
  let clock = 0, last = performance.now(), blinkAt = 1.5, wave = 2.2, jy = 0, jv = 0, squash = 0, spinT = 0, pending = null, raf = 0, visible = true;
  function poke(next) {
    if (spinT > 0) return;
    jv = 7.5; spinT = .65; pending = next || randomLook(W);
    onPoke && onPoke(pending);
  }
  cv.addEventListener("click", () => poke());

  function frame(now) {
    raf = 0; if (!visible || document.hidden) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; clock += dt; const t = clock;
    const bob = Math.sin(t * 2.2);
    // jump physics
    if (jv || jy > 0) { jv -= 24 * dt; jy += jv * dt; if (jy <= 0) { jy = 0; jv = 0; squash = .22; } }
    squash = Math.max(0, squash - dt * 1.4);
    root.position.y = bob * .04 + jy;
    const sq = squash * Math.sin(squash * 30);
    root.scale.set(1 + sq * .6, 1 - sq * .6, 1 + sq * .6);
    shadow.scale.set(1.25 - jy * .15, 1.25 - jy * .15, 1);
    // spin + swap outfit at the halfway point
    if (spinT > 0) { spinT -= dt; root.rotation.y = (1 - Math.max(0, spinT) / .65) * TAU; if (pending && spinT < .33) { apply(pending); pending = null; } }
    else root.rotation.y = 0;
    // head follows pointer (idles when no pointer, e.g. phones)
    if (t - lastMove > 3) { ty = Math.sin(t * .5) * .35; tp = Math.sin(t * .37) * .08; }
    yaw += (ty - yaw) * Math.min(1, dt * 6); pitch += (tp - pitch) * Math.min(1, dt * 6);
    P.head.rotation.set(pitch, yaw, Math.sin(t * 1.1) * .04);
    P.body.rotation.y = yaw * .25;
    P.body.scale.set(1 + bob * .008, 1 - bob * .008, 1);
    const hs = 1 + Math.sin(t * 4.4) * .012 + jv * .004;
    P.hair.scale.set(hs, hs * P.hairBaseY, hs);
    // arms: idle sway, wave on arrival
    P.arms[0].rotation.x = Math.sin(t * 2.2) * .08;
    P.arms[1].rotation.x = -Math.sin(t * 2.2) * .08;
    if (wave > 0) { wave -= dt; P.arms[1].rotation.z = 2.5 + Math.sin(t * 12) * .35; if (wave <= 0) P.arms[1].rotation.z = P.arms[1].userData.base; }
    else P.arms[1].rotation.z += (P.arms[1].userData.base - P.arms[1].rotation.z) * .2;
    // blink
    const bt = t - blinkAt, ey = bt > 0 && bt < .12 ? .1 : 1;
    if (bt >= .12) blinkAt = t + 2 + Math.random() * 3;
    P.eyes.forEach(e => e.scale.y = ey);
    renderer.render(scene, cam);
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  const size = () => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  new ResizeObserver(size).observe(el); size();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; start(); }).observe(el);
  document.addEventListener("visibilitychange", start);
  start();

  return {
    get look() { return { ...L }; },
    setLook(l) { apply(l); jv = Math.max(jv, 4); },
    poke, wave() { wave = 1.6; }
  };
}
