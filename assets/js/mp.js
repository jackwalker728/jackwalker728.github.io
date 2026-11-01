/* Tiny serverless multiplayer over WebRTC.
   Uses the free PeerJS matchmaking broker only to introduce browsers; game data then flows peer-to-peer.
   Players in the same world (room) find each other through fixed "slot" ids: room-0 … room-(N-1). */
const LIB = new URL("../vendor/peerjs.min.js", import.meta.url).href;
function loadLib() {
  return window.Peer ? Promise.resolve() : new Promise((res, rej) => { const s = document.createElement("script"); s.src = LIB; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}
function openPeer(id, opts) {
  return new Promise((res, rej) => {
    const p = new window.Peer(id, opts);
    const t = setTimeout(() => { p.destroy(); rej("timeout"); }, 9000);
    const onErr = e => { clearTimeout(t); p.destroy(); rej(e?.type || "error"); };
    p.on("error", onErr);
    p.on("open", () => { clearTimeout(t); p.off("error", onErr); res(p); });
  });
}
export async function joinRoom(room, { slots = 8, onJoin, onLeave, onData, server } = {}) {
  await loadLib();
  const opts = { debug: 0, ...(server || {}) };
  let peer = null, slot = -1;
  for (let k = 0; k < slots && !peer; k++) {
    try { peer = await openPeer(`${room}-${k}`, opts); slot = k; }
    catch (e) { if (e !== "unavailable-id") return null; }   // broker unreachable → stay single-player
  }
  if (!peer) return null;
  const conns = new Map(), rate = new Map();
  const setup = conn => {
    conn.on("open", () => { const known = conns.has(conn.peer); conns.set(conn.peer, conn); if (!known) onJoin?.(conn.peer); });
    conn.on("data", d => { const n = (rate.get(conn.peer) || 0) + 1; rate.set(conn.peer, n); if (n < 60) onData?.(conn.peer, d); }); // flood guard
    const gone = () => { if (conns.get(conn.peer) === conn) { conns.delete(conn.peer); onLeave?.(conn.peer); } };
    conn.on("close", gone); conn.on("error", gone);
  };
  setInterval(() => rate.clear(), 1000);
  peer.on("connection", setup);
  peer.on("error", () => {});                       // "peer-unavailable" for empty slots is expected
  peer.on("disconnected", () => { try { peer.reconnect(); } catch (e) {} });
  const knock = () => { for (let k = 0; k < slots; k++) { const id = `${room}-${k}`; if (k !== slot && !conns.has(id)) setup(peer.connect(id, { serialization: "json", reliable: true })); } };
  knock(); setInterval(knock, 20000);               // late joiners connect to us anyway; this heals missed links
  addEventListener("pagehide", () => peer.destroy());
  return {
    me: peer.id, slot,
    send(d, to) { for (const [id, c] of conns) if ((!to || to === id) && c.open) { try { c.send(d); } catch (e) {} } },
    get count() { return conns.size; },
    close() { peer.destroy(); }
  };
}
