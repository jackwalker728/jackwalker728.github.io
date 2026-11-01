/* =========================================================
   ALL PORTFOLIO CONTENT LIVES HERE.
   The future management portal will edit this file for you.
   Until then: edit text below, commit, and GitHub Pages updates.
   ========================================================= */
window.CONTENT = {
  profile: {
    name: "Jack",
    fullName: "Jack",                       // your full name for the resume
    title: "Game Developer",
    location: "Bangalore, India",
    status: "Open to game dev roles & collabs",
    tagline: "I build weird, playable things in Unity, Unreal and the browser — usually with a phone duct-taped to the controls.",
    about: [
      "I'm a game developer from Bangalore who lives in the strange corners of game tech: phones as motion controllers, soft-body slimes, LLM-driven NPCs and jam installations built to pull a crowd.",
      "I lead Singleton Games. Yes, there is only one instance of me. No, you cannot call new() on me.",
      "Right now I'm digging into ML/AI for games — making characters and levels that think (a little) for themselves."
    ],
    email: "you@example.com",
    socials: [
      { label: "GitHub",   url: "https://github.com/your-username" },
      { label: "itch.io",  url: "https://your-username.itch.io" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/your-username" }
    ],
    resumePdf: "",            // e.g. "assets/Jack-Resume.pdf" — leave empty to hide the download button
    defaultOutfit: "random"   // "random" or an outfit id below
  },

  /* "Ask Jack" chat box.
     - Works instantly with no setup (built-in answers from this file).
     - Paste your Cloudflare Worker URL into workerUrl to switch on real AI (see worker/README.md). */
  chat: {
    workerUrl: "",
    persona: "Warm, funny, a bit self-roasting game developer from Bangalore. Loves game-dev puns. Honest and humble, never arrogant.",
    greeting: "Hey! I'm Jack — well, the chattier copy. Ask me about my projects, my skills, or why my hair needs its own physics budget.",
    suggestions: ["What do you do?", "Best project?", "What tech do you use?", "Are you open to work?", "Hobbies?"],
    // Extra facts the AI may use (education, favourite games, tools, achievements…). One fact per line.
    extraFacts: [],
    // Hand-written answers. keys = words/phrases that trigger the answer.
    faqs: [
      { keys: ["what do you do", "who are you", "about you", "yourself", "introduce", "what you do"],
        a: "I make games — Unity, Unreal and browser stuff — usually the weird kind: phones as motion controllers, slimes that hack levels, NPCs that talk back. I also lead a small team called Singleton Games." },
      { keys: ["best project", "favourite project", "favorite project", "proudest", "coolest"],
        a: "Probably Sector404 — you play as an AI that solves levels like prompts by copying and pasting variables between objects. Also you're a slime. Peak game design." },
      { keys: ["open to work", "hire", "hiring", "job", "available", "freelance", "collab", "internship", "work with you"],
        a: "Yes! I'm open to game-dev roles and collabs. Drop me an email from the Contact section — I reply faster than my Unity project compiles." },
      { keys: ["singleton", "team", "lead"],
        a: "I lead Singleton Games, a small indie team. Yes, there's only one of me. The design pattern was inevitable." },
      { keys: ["hair", "curly", "curls"],
        a: "The hair is real, fully procedural, and has never once respected a collision mesh." }
    ]
  },

  /* Open world ("Enter Jack's World"). Every visitor gets a different procedurally generated map. */
  world: {
    intro: [
      "Welcome to my world! It's generated just for you — nobody else will ever walk this exact map.",
      "Missions are top-left. Talk to every place, squash some bugs, and by the end you'll know me better than my compiler does."
    ],
    home: [
      "This is Singleton Games HQ. Population: one instance. Rent: also one instance.",
      "My projects are scattered around — just follow the sandy paths. The map in the corner helps too."
    ],
    quips: {
      "sector404": "Behold Sector404 — the only game where you're a slime with admin rights.",
      "wasteland-chorus": "Wasteland Chorus! The apocalypse, but the survivors actually want to talk to you.",
      "circuit-smasher": "Circuit Smasher. Zombies + powerlines = shockingly good gameplay.",
      "morphrush": "MorphRush: change your shape or eat the wall. Life lessons, really.",
      "reverse": "REVERSE — built solo in 72 hours. I rewound history. Sleep schedule not included.",
      "retro-arcade": "The Back-to-Back Arcade: two screens, two players, and your actual face in the game."
    },
    bugs: [
      "Squashed a NullReferenceException!",
      "That bug had been living in my physics code rent-free.",
      "Off-by-one error eliminated. Or was it two?",
      "A wild race condition appeared… and lost.",
      "That one only ever showed up on Fridays.",
      "Bug squashed. It's not a feature anymore."
    ],
    npcNames: ["Placeholder Pete", "QA Priya", "Intern Ishaan", "Bug Bounty Bala", "Shader Shreya", "Lag Lakshmi", "Patch Notes Prakash", "Respawn Ravi", "Hitbox Hema", "Tutorial Tara", "Loot Box Lokesh", "Frame Drop Farah", "Null Pointer Nikhil", "Cutscene Kavya"],
    npc: [
      "I'm an NPC. My whole personality is this sentence.",
      "Jack built me in an afternoon. I'm still waiting for my backstory DLC.",
      "Bugs glow pink. Squash them. QA will finally sleep.",
      "Hop on a bike — it's faster. Helmets are procedurally generated.",
      "Try the filter coffee stall near HQ. Jack runs on it. So does this world.",
      "I asked Jack for a raise. He increased my Y position.",
      "Those golden tokens? Singleton tokens. Collect them. Don't ask what they buy.",
      "There's a pitch somewhere. Cars are allowed. Referees are not.",
      "Ramps on the roads are for jumping. The physics engine said yes.",
      "I've walked this exact path 400 times. Please tell my dev I'm tired."
    ],
    signs: [
      "Speed limit: whatever your frame rate allows.",
      "Caution: procedurally generated potholes ahead. Probably.",
      "This sign has no collision. Wait — yes it does.",
      "You are here. (Results may vary per seed.)",
      "Bangalore traffic simulation: coming in a future update.",
      "Warning: cows have right of way. Always.",
      "Respawn point: not here. Drive carefully.",
      "Fun fact: this whole world is under 1 MB of code."
    ],
    coffee: ["Filter coffee acquired! Speed +40% for 20 seconds.", "Strong, sweet, frothy. You can now outrun a compile.", "Kaapi power! Your legs are now Unity's fixed timestep."],
    dog: ["Good boy! +1 happiness.", "The dog wags. The dog approves of your portfolio choices.", "Petted! This dog now follows you forever (or until you drive off)."],
    cow: ["Moo. (Translation: 'nice portfolio')", "The cow stares into your soul. Respect.", "Moo. The cow has right of way and it knows it."],
    crash: ["Oops! Physics says hi.", "That tree was there first.", "Insurance does not cover procedural trees."],
    mailboxLocked: "The Post Office opens once you've seen all my projects. No skipping to the credits!",
    mailbox: ["You made it! You've seen my games, my skills and my questionable hobbies.", "Here's my contact card. Use it wisely — or just say hi."]
  },

  /* Jack's lines. Funny is mandatory. */
  lines: {
    greet: [
      "Hi! Yes, the hair is real. No, it doesn't have physics. Yet.",
      "Welcome! Pick a door. Any door. Except 03 — that one's still compiling.",
      "I'm Jack. I make games, and occasionally they make sense.",
      "Poke me. I dare you."
    ],
    poke: [
      "Ow. That's my Singleton instance you're poking.",
      "Outfit swap! Same Jack, new texture.",
      "Careful, I'm not frame-rate independent.",
      "That tickles. Also, hire me.",
      "Every poke costs me 1 HP. Luckily I have 404.",
      "Hair volume: unpatched. Working as intended."
    ],
    world: [
      "My world is still generating. Procedurally. Very slowly.",
      "Door 03 is locked. I'm still teaching myself to walk.",
      "Coming soon: an entire world made of me. Terrifying, I know."
    ],
    twin: [
      "Wait… there's another me in a different tab? That breaks the Singleton pattern.",
      "I sense another Jack nearby. Only one of us gets the curls."
    ]
  },

  /* Wardrobe — colours are editable. style: bandhgala | tee | polo | suit */
  outfits: [
    { id: "velvet", name: "Velvet Boss",    style: "bandhgala", jacket: "#7d1526", shirt: "#f3efe7", pants: "#c9b38c", shoes: "#3a2a20" },
    { id: "rider",  name: "Weekend Rider",  style: "tee",       shirt: "#f4f4f1", pants: "#1d1d24", shoes: "#8d8b86" },
    { id: "sofa",   name: "Sofa Mode",      style: "polo",      shirt: "#2f3b59", dots: "#f0a04b", pants: "#3a3a46", shoes: "#e6e0d4" },
    { id: "formal", name: "Interview Mode", style: "suit",      jacket: "#18171d", shirt: "#f2c6c4", tie: "#111015", pants: "#18171d", shoes: "#0b0b0d" }
  ],

  /* 3D wardrobe — visitors mix & match. First item in hats/glasses/neck/hand = "none".
     top styles: bandhgala | tee | polo | suit | hoodie | kurta | jersey
     "word" is used to build funny outfit names like "Cowboy Nerdy Hoodie Hacker". */
  wardrobe: {
    skin: "#8b5a3c", hair: "#1a1311",
    tops: [
      { id: "velvet", name: "Velvet Boss",    style: "bandhgala", color: "#7d1526", shirt: "#f3efe7", accent: "#e2b04a" },
      { id: "tee",    name: "Weekend Rider",  style: "tee",       color: "#f4f4f1", accent: "#2b2b2b" },
      { id: "polo",   name: "Sofa Mode",      style: "polo",      color: "#2f3b59", accent: "#f0a04b" },
      { id: "suit",   name: "Interview Mode", style: "suit",      color: "#1f1e26", shirt: "#f2c6c4", accent: "#111015" },
      { id: "hoodie", name: "Hoodie Hacker",  style: "hoodie",    color: "#2fb3a9", accent: "#ffffff" },
      { id: "kurta",  name: "Festival Kurta", style: "kurta",     color: "#f2b84b", accent: "#b52f46" },
      { id: "jersey", name: "Team Singleton", style: "jersey",    color: "#d43c55", accent: "#ffffff", number: "404" }
    ],
    pants: [
      { id: "beige", name: "Chinos", color: "#c9b38c" }, { id: "black", name: "Black jeans", color: "#1d1d24" },
      { id: "denim", name: "Denim", color: "#3b5a8a" },  { id: "joggers", name: "Joggers", color: "#5a5a66" }
    ],
    shoes: [
      { id: "white", name: "Sneakers", color: "#eeeae2" }, { id: "brown", name: "Loafers", color: "#3a2a20" },
      { id: "red", name: "Red kicks", color: "#d43c55" },  { id: "crocs", name: "Crocs", color: "#8d8b86" }
    ],
    hats: [
      { id: "none", name: "No hat" },
      { id: "cap", name: "Cap", word: "Sporty", color: "#d43c55" },
      { id: "beanie", name: "Beanie", word: "Cozy", color: "#41d3c9" },
      { id: "cowboy", name: "Cowboy hat", word: "Cowboy", color: "#9a6532" },
      { id: "crown", name: "Crown", word: "Royal", color: "#f3b94d" },
      { id: "headphones", name: "Headphones", word: "Lo-fi", color: "#d43c55" },
      { id: "party", name: "Party hat", word: "Party", color: "#7b5cff" }
    ],
    glasses: [
      { id: "none", name: "No glasses" },
      { id: "round", name: "Round", word: "Scholarly", color: "#c9a14a" },
      { id: "shades", name: "Shades", word: "Cool", color: "#111111" },
      { id: "nerd", name: "Nerd frames", word: "Nerdy", color: "#111111" },
      { id: "3d", name: "3D glasses", word: "Retro", color: "#f4f4f1" },
      { id: "vr", name: "VR headset", word: "Virtual", color: "#41d3c9" }
    ],
    neck: [
      { id: "none", name: "Nothing" },
      { id: "chain", name: "Gold chain", word: "Bling", color: "#f3b94d" },
      { id: "scarf", name: "Scarf", word: "Windy", color: "#d43c55" },
      { id: "bowtie", name: "Bow tie", word: "Fancy", color: "#7b5cff" },
      { id: "lanyard", name: "Jam badge", word: "Jam-ready", color: "#41d3c9" }
    ],
    hand: [
      { id: "none", name: "Empty" },
      { id: "controller", name: "Controller", color: "#d43c55" },
      { id: "coffee", name: "Filter coffee", color: "#9a6532" },
      { id: "phone", name: "Phone", color: "#41d3c9" },
      { id: "sword", name: "Pixel sword", color: "#dfe8f2" }
    ]
  },

  /* category drives the filter chips. image: optional path/URL (16:9 looks best). */
  projects: [
    {
      id: "sector404", title: "Sector404", year: "2026", category: "Unity", engine: "Unity · C#",
      status: "In development", glyph: "🧪", color: "#2aa79f", featured: true,
      summary: "You play as an AI that solves levels like prompts — scan objects, copy their variables, paste them where they cause trouble.",
      details: "Every object in a level is hackable: its variables are exposed and can be copied from one object to another. Obstacles have code you can manipulate. The player is a procedurally generated soft-body slime with a scanner beam and a clipboard.",
      highlights: [
        "Hackable-entity system that exposes object variables for copy/paste",
        "Soft-body spring-physics slime player (SystemicSlime)",
        "Procedural level shapes built from TextMeshPro glyphs with data-flow effects",
        "Token/heart economy — run out of tokens and the prompt fails"
      ],
      role: "Solo — design & code", tags: ["Unity", "C#", "Puzzle", "Systems"], image: "", links: []
    },
    {
      id: "wasteland-chorus", title: "Wasteland Chorus", year: "2026", category: "Unreal", engine: "Unreal Engine 5",
      status: "R&D", glyph: "☢️", color: "#b8722c", featured: true,
      summary: "Post-apocalyptic survival with MetaHuman survivors who actually talk back — and a phone you swing like a weapon.",
      details: "A survival concept exploring MetaHuman characters, LLM-driven NPC dialogue and a custom smartphone motion-controller pipeline that streams phone sensors to Unreal over WebSocket.",
      highlights: [
        "MetaHuman characters with Live Link facial capture",
        "LLM-driven NPC conversations",
        "Phone gyro/accelerometer streamed over WebSocket as a motion controller"
      ],
      role: "Solo — tech & design", tags: ["Unreal", "MetaHuman", "AI NPCs", "Motion control"], image: "", links: []
    },
    {
      id: "circuit-smasher", title: "Circuit Smasher", year: "2026", category: "Unity", engine: "Unity 6 · URP",
      status: "Prototype", glyph: "⚡", color: "#5b4bd6", featured: true,
      summary: "A vehicular arcade game: ride a bike, shunt colour-coded zombies into powerline slots. Electrifying. Literally.",
      details: "Arcade prototype where a bike rider herds colour-matched zombies into powerline slot grids. Built in Unity 6 URP with a tuning-friendly setup.",
      highlights: ["Vehicle + physics shunting", "Colour-matching slot grids", "Designer-friendly tuning values"],
      role: "Solo", tags: ["Unity", "URP", "Arcade"], image: "", links: []
    },
    {
      id: "morphrush", title: "MorphRush", year: "2026", category: "Web", engine: "HTML5 · JavaScript",
      status: "Playable", glyph: "🔷", color: "#2f7fd6", featured: false,
      summary: "Endless runner meets shape-and-colour matching. Morph to fit the gate or eat the wall.",
      details: "A browser game in a single self-contained file, with multiple control schemes, swipe input and difficulty that ramps up in stages.",
      highlights: ["Runs in any browser, no install", "Swipe + keyboard controls", "Progressive difficulty stages"],
      role: "Solo", tags: ["Web", "JavaScript", "Mobile"], image: "", links: []
    },
    {
      id: "reverse", title: "REVERSE", year: "2026", category: "Game Jam", engine: "Mobile AR",
      status: "Jam entry", glyph: "⏪", color: "#c2364b", featured: true,
      summary: "ICAT Game Jam 2026: find an old CRT in AR, press reverse on history, jump in and change one thing — then don't get caught.",
      details: "A solo 72-hour jam game for the theme REVERSE. You load a disc marked with a world event, play it backwards, pull a glowing orb to step into the scene in 3D, change something in 10 seconds and escape unseen.",
      highlights: ["Solo, 72 hours", "AR-anchored retro TV setup", "Comedic take on rewriting history"],
      role: "Solo", tags: ["AR", "Mobile", "Game Jam"], image: "", links: []
    },
    {
      id: "retro-arcade", title: "Back-to-Back Arcade", year: "2026", category: "Game Jam", engine: "Unity",
      status: "Installation", glyph: "🕹️", color: "#d68a1e", featured: false,
      summary: "A two-player retro versus installation: two screens back to back, two gamepads — and webcams that put your real face in the game.",
      details: "Built for a 3-day 'retro arcade' jam as a public installation for 100+ players. One PC drives two monitors facing opposite directions; each side's webcam drops the player's face into the game.",
      highlights: ["Dual-screen, one-PC setup", "Webcam faces in-game", "Designed for crowds and spectators"],
      role: "Lead", tags: ["Unity", "Installation", "Local multiplayer"], image: "", links: []
    }
  ],

  skills: [
    { group: "Engines",   items: ["Unity (URP)", "Unreal Engine 5", "HTML5 / Canvas"] },
    { group: "Code",      items: ["C#", "Blueprints", "JavaScript"] },
    { group: "Tech I love", items: ["Procedural generation", "Soft-body physics", "AR", "LLM-driven NPCs", "MetaHuman & Live Link", "Phone motion controllers"] },
    { group: "People",    items: ["Team lead", "Game jams", "Rapid prototyping"] }
  ],

  hobbies: [
    { icon: "🏁", title: "Game jams",      text: "72 hours, no sleep, one idea that's either genius or a crime." },
    { icon: "📱", title: "Weird controllers", text: "If it has a gyroscope, I will try to turn it into a sword." },
    { icon: "🏍️", title: "Riding",         text: "Two wheels, Bangalore traffic, zero respawns." },
    { icon: "🤖", title: "AI tinkering",   text: "Teaching NPCs to talk. Some of them won't stop." }
  ],

  journey: [
    { when: "Now",   title: "Team Lead",                 org: "Singleton Games", text: "Leading a small indie team. There can only be one (lead)." },
    { when: "2026",  title: "Solo entry — REVERSE",      org: "ICAT Game Jam",   text: "Built a mobile AR history-rewinding game in 72 hours, alone." },
    { when: "2026",  title: "Retro arcade installation", org: "3-day game jam",  text: "Dual-screen versus game built for a crowd of 100+." },
    { when: "Earlier", title: "Started making games",    org: "Unity → Unreal → Web", text: "Edit this line with your origin story." }
  ]
};
