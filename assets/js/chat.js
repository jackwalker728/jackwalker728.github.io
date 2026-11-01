/* "Ask Jack" chat — instant built-in answers + optional real AI (Cloudflare Worker). */
(() => {
  const { C, A, $, esc, jackSVG, outfitFor } = window.Jack;
  const CH = C.chat || {}, P = C.profile;
  const STORE = "jack.chat.v1", AI_CAP = 25;

  /* ---------- built-in brain: FAQs + answers generated from content.js ---------- */
  const norm = s => " " + String(s).toLowerCase().replace(/[^a-z0-9+#\s]/g, " ").replace(/\s+/g, " ").trim() + " ";
  const list = a => a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a.at(-1) : a[0] || "";
  const entries = [
    ...(CH.faqs || []).map(f => ({ keys: f.keys, a: f.a, w: 2 })),
    { keys: ["hi", "hello", "hey", "yo", "namaste", "sup"], a: CH.greeting, w: .6 },
    { keys: ["skill", "skills", "tech", "stack", "engine", "engines", "language", "tools", "use", "unity", "unreal", "c#"],
      a: "My toolkit: " + (C.skills || []).map(s => `${s.group.toLowerCase()} — ${list(s.items)}`).join("; ") + ".", w: 1 },
    { keys: ["hobby", "hobbies", "free time", "fun", "weekend", "interests"],
      a: "Outside work: " + (C.hobbies || []).map(h => `${h.title.toLowerCase()} (${h.text.replace(/\.$/, "")})`).join("; ") + ".", w: 1 },
    { keys: ["contact", "email", "reach", "mail", "linkedin", "github", "socials"],
      a: `Email me at ${P.email} — or find me on ${list(P.socials.map(s => s.label))}. Links are in the Contact section.`, w: 1.2 },
    { keys: ["where", "live", "location", "based", "city", "bangalore", "india"], a: `I'm based in ${P.location}.`, w: .8 },
    { keys: ["projects", "games", "made", "built", "portfolio", "work on", "working on"],
      a: `I've built ${list(C.projects.map(p => p.title))}. Ask me about any of them!`, w: .9 },
    { keys: ["resume", "cv", "experience", "journey", "career"],
      a: (C.journey || []).map(j => `${j.when}: ${j.title} (${j.org})`).join(" · ") + ". The Resume page has the tidy version.", w: 1 },
    ...C.projects.map(p => ({
      keys: [p.title.toLowerCase(), p.id.replace(/-/g, " "), ...p.title.toLowerCase().split(/\s+/).filter(w => w.length > 3)],
      a: `${p.title} (${p.year}, ${p.engine}, ${p.status.toLowerCase()}): ${p.summary}`, w: 2.5
    }))
  ];
  function localAnswer(q) {
    const t = norm(q); let best = null, score = 0;
    for (const e of entries) {
      let s = 0;
      for (const k of e.keys) { const kk = norm(k); if (t.includes(kk)) s += kk.trim().split(" ").length; }
      s *= e.w; if (s > score) { score = s; best = e; }
    }
    return { a: best?.a, score };
  }

  /* knowledge sheet sent to the AI (it may only use these facts) */
  function knowledge() {
    const L = [`Name: ${P.fullName || P.name} (goes by ${P.name}). ${P.title}, ${P.location}. Status: ${P.status}.`, `Tagline: ${P.tagline}`, ...P.about,
      `Contact: ${P.email}; ${P.socials.map(s => `${s.label}: ${s.url}`).join("; ")}`,
      "PROJECTS:", ...C.projects.map(p => `- ${p.title} (${p.year}, ${p.engine}, ${p.status}, role: ${p.role}): ${p.summary} ${p.details} Highlights: ${(p.highlights || []).join("; ")}`),
      "SKILLS: " + C.skills.map(s => `${s.group}: ${s.items.join(", ")}`).join(" | "),
      "HOBBIES: " + C.hobbies.map(h => `${h.title} — ${h.text}`).join(" | "),
      "JOURNEY: " + C.journey.map(j => `${j.when}: ${j.title} at ${j.org} — ${j.text}`).join(" | "),
      ...(CH.extraFacts || []).map(f => `- ${f}`),
      ...(CH.faqs || []).map(f => `Q: ${f.keys[0]} A: ${f.a}`)];
    return L.join("\n");
  }

  /* ---------- UI ---------- */
  let hist = [], aiUsed = 0, busy = false;
  try { const s = JSON.parse(sessionStorage.getItem(STORE) || "{}"); hist = s.hist || []; aiUsed = s.aiUsed || 0; } catch (e) {}
  const save = () => { try { sessionStorage.setItem(STORE, JSON.stringify({ hist: hist.slice(-30), aiUsed })); } catch (e) {} };

  const face = jackSVG(outfitFor("velvet")).replace('viewBox="0 0 200 270"', 'viewBox="24 0 152 152"');
  const fab = document.createElement("button");
  fab.className = "chat-fab"; fab.setAttribute("aria-label", "Ask Jack a question"); fab.setAttribute("aria-expanded", "false");
  fab.innerHTML = `<span class="chat-face">${face}</span><span class="chat-fab-t">Ask Jack</span>`;
  const box = document.createElement("section");
  box.className = "chat"; box.hidden = true; box.setAttribute("aria-label", "Chat with Jack");
  box.innerHTML = `<header class="chat-head"><span class="chat-face">${face}</span><div><b>Ask Jack anything</b><small id="chat-mode"></small></div>
    <button class="icon-btn" id="chat-x" aria-label="Close chat">✕</button></header>
    <div class="chat-log" id="chat-log" aria-live="polite"></div>
    <div class="chat-sugg" id="chat-sugg"></div>
    <form class="chat-form" id="chat-form" autocomplete="off"><input id="chat-in" maxlength="300" placeholder="Ask about my projects, skills…" aria-label="Your question"><button class="btn primary" aria-label="Send">➤</button></form>`;
  document.body.append(fab, box);
  const log = $("#chat-log"), input = $("#chat-in");
  const aiOn = () => !!CH.workerUrl && aiUsed < AI_CAP;
  const mode = () => { $("#chat-mode").textContent = aiOn() ? "AI-powered · answers may be imperfect" : "Quick answers mode"; };

  function bubble(role, text, cls = "") {
    const d = document.createElement("div"); d.className = `msg ${role} ${cls}`;
    d.innerHTML = esc(text).replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');
    log.append(d); log.scrollTop = log.scrollHeight; return d;
  }
  function render() {
    log.innerHTML = ""; bubble("jack", CH.greeting || "Ask me anything!");
    hist.forEach(m => bubble(m.role === "user" ? "user" : "jack", m.content));
    $("#chat-sugg").innerHTML = (CH.suggestions || []).map(s => `<button class="chip" type="button">${esc(s)}</button>`).join("");
    mode();
  }
  function open(v) {
    box.hidden = !v; fab.classList.toggle("hide", v); fab.setAttribute("aria-expanded", v);
    if (v) { A.sfx("open"); if (!log.children.length) render(); setTimeout(() => input.focus(), 50); } else fab.focus();
  }
  fab.onclick = () => open(true);
  $("#chat-x").onclick = () => open(false);
  addEventListener("keydown", e => { if (e.key === "Escape" && !box.hidden) open(false); });
  $("#chat-sugg").onclick = e => { const b = e.target.closest(".chip"); if (b) ask(b.textContent); };
  $("#chat-form").onsubmit = e => { e.preventDefault(); ask(input.value); };

  async function askAI() {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch(CH.workerUrl, { method: "POST", signal: ctl.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: P.name, persona: CH.persona, knowledge: knowledge(), messages: hist.slice(-8) }) });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json(); if (!j.reply) throw new Error("empty");
      aiUsed++; return j.reply;
    } finally { clearTimeout(timer); }
  }

  async function ask(q) {
    q = String(q || "").trim(); if (!q || busy) return;
    busy = true; input.value = ""; A.sfx("click");
    bubble("user", q); hist.push({ role: "user", content: q });
    const typing = bubble("jack", "", "typing"); typing.innerHTML = "<i></i><i></i><i></i>";
    const loc = localAnswer(q);
    let reply = null;
    if (loc.score >= 2 || !aiOn()) reply = loc.score >= 0.6 ? loc.a : null;   // strong match → instant
    if (!reply && aiOn()) { try { reply = await askAI(); } catch (e) { reply = loc.score > 0 ? loc.a : null; } }
    if (!reply) reply = `Hmm, my offline brain doesn't know that one yet. Try asking about my projects or skills — or email me at ${P.email}!`;
    if (!aiOn() || loc.score >= 2) await new Promise(r => setTimeout(r, 350)); // tiny "thinking" beat
    typing.remove(); bubble("jack", reply); hist.push({ role: "assistant", content: reply });
    A.sfx("hover"); save(); mode(); busy = false;
    dispatchEvent(new CustomEvent("jack:say", { detail: reply }));
  }
})();
