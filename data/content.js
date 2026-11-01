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
      "my-gecko": "This is Mochi. He asks better questions than I do, and he's a lizard.",
      "reverse": "The First Of Us — built solo in 72 hours. I rewound history. Sleep schedule not included.",
      "retro-arcade": "fowlplay, the back-to-back arcade: two screens, two players, and your actual face in the game.",
      "morphrush": "MorphRush: change your shape or eat the wall. Life lessons, really.",
      "get-up": "Get UP. A game about cleaning your room. My mum says it's the most realistic thing I've ever made.",
      "egg-celeration": "Egg-celeration. You don't control the egg. You control the ground. The egg has no say in this.",
      "chroma-crate-clear": "Chroma Crate Clear: seven slots, infinite regret. Every level is solvable. I checked. With maths.",
      "dealloc": "dealloc(): a game where helping someone literally costs you pieces of yourself. Very healthy. Totally normal jam idea.",
      "kaatru": "Traditional boat racing, Mandaadi style. Six captains, one boat's worth of balance between them.",
      "heap": "HEAP: dealloc() got promoted. Same rules, one entire computer to fall apart in.",
      "magzzele": "magzzele: a puzzle game you literally can't solve alone. Bring a friend. Or a very patient stranger."
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
    cow: ["Moo. (Translation: 'nice portfolio')", "The cow stares into your soul. Respect.", "Moo. The cow has right of way and it knows it."],
    crash: ["Oops! Physics says hi.", "That tree was there first.", "Insurance does not cover procedural trees."],
    /* When two visitors' Jacks meet in the live world. A = the Jack who walked up, B = the other one.
       {A} and {B} become their outfit names, e.g. "Royal Velvet Boss". */
    duo: [
      [["A", "Wait… are you me?"], ["B", "I'm the {B} build. You're the {A} build."], ["A", "This breaks the Singleton pattern."], ["B", "Shh. Don't tell the recruiter."]],
      [["A", "Nice outfit. Very {B}."], ["B", "Thanks, it's procedurally generated."], ["A", "Mine too. Same tailor."], ["B", "Our tailor is Math.random()."]],
      [["A", "Who let you into my world?"], ["B", "Same seed, bro."], ["A", "Then I'm the main character."], ["B", "We're both NPCs to someone."]],
      [["A", "Race you to the Post Office?"], ["B", "I'll take the car."], ["A", "I'll take the bike."], ["B", "The cow will win anyway."]],
      [["A", "Did you push to main without testing?"], ["B", "…"], ["A", "Yeah. Me too."], ["B", "It's fine. It's a portfolio."]],
      [["A", "How many bugs have you squashed?"], ["B", "Enough to feel something."], ["A", "Don't open the console."], ["B", "Never open the console."]],
      [["A", "Is my hair really this big?"], ["B", "Bigger. It has its own hitbox."], ["A", "Respect."], ["B", "Respect."]],
      [["A", "Hire me, I'm the original Jack."], ["B", "Hire me, I'm the patched version."], ["A", "…Hire both of us?"], ["B", "Two Jacks, one salary. Deal."]],
      [["A", "Have you had the filter coffee?"], ["B", "Three. I can see sounds now."], ["A", "That's not the coffee."], ["B", "That's the frame rate."]],
      [["A", "What's your high score on the arcade?"], ["B", "Classified."], ["A", "So… zero?"], ["B", "It's a soft launch."]]
    ],
    mailboxLocked: "The Post Office opens once you've seen 6 of my projects. No skipping to the credits!",
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
      "id": "sector404",
      "title": "Sector404",
      "year": "2026",
      "category": "Unity",
      "engine": "Unity · C# · TextMeshPro",
      "status": "In development",
      "glyph": "🧪",
      "color": "#2aa79f",
      "featured": true,
      "summary": "You play as an AI that solves levels like prompts — scan objects, copy their variables, paste them where they cause trouble.",
      "details": "In Sector404 you play as an AI that solves each level like a prompt. Every object in a level is hackable: its variables are exposed and can be copied from one object and pasted onto another. Obstacles have code you can change, so you solve puzzles by moving properties around instead of by brute force.\nThe player is a procedurally generated soft-body slime with a raycast scanner beam and a clipboard. Level shapes (squares, triangles, circles and more) are built from TextMeshPro glyphs, with data-flow and scanner effects. You spend tokens (hearts), and if you run out, the prompt fails.\nNext step: plugging in a real LLM to generate whole levels at runtime from the game's parameters.",
      "highlights": [
        "Hackable-entity system that exposes object variables for copy/paste",
        "Soft-body spring-physics slime player (SystemicSlime)",
        "Raycast scanner beam and clipboard (PlayerHacker)",
        "Procedural level shapes built from TextMeshPro glyphs with data-flow effects",
        "Token/heart economy with i-frames and dialogue on damage",
        "Planned: an LLM that generates entire levels at runtime"
      ],
      "role": "Solo — design & code",
      "tags": [
        "Unity",
        "C#",
        "Systems",
        "AI NPCs",
        "Puzzle",
        "Experimental"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "wasteland-chorus",
      "title": "Wasteland Chorus",
      "year": "2026",
      "category": "Unreal",
      "engine": "Unreal Engine 5",
      "status": "R&D",
      "glyph": "☢️",
      "color": "#b8722c",
      "featured": true,
      "summary": "Post-apocalyptic survival with MetaHuman survivors who actually talk back — and a phone you swing like a weapon.",
      "details": "A survival concept exploring MetaHuman characters, LLM-driven NPC dialogue and a custom smartphone motion-controller pipeline that streams phone sensors to Unreal over WebSocket.",
      "highlights": [
        "MetaHuman characters with Live Link facial capture",
        "LLM-driven NPC conversations",
        "Phone gyro/accelerometer streamed over WebSocket as a motion controller"
      ],
      "role": "Solo — tech & design",
      "tags": [
        "Unreal",
        "MetaHuman",
        "AI NPCs",
        "Motion control"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "circuit-smasher",
      "title": "Circuit Smasher",
      "year": "2026",
      "category": "Unity",
      "engine": "Unity 6 · URP · C# · New Input System",
      "status": "Prototype",
      "glyph": "⚡",
      "color": "#5b4bd6",
      "featured": true,
      "summary": "A vehicular arcade game: ride a bike, shunt colour-coded zombies into powerline slots. Electrifying. Literally.",
      "details": "An arcade game where you ride a bike down a 5-lane highway and shunt colour-coded ragdoll zombies into gaps in zombie walls and powerline slot grids. Complete a chain of 3 or more of the same colour to zap and clear it. It's an endless runner and a match-3 puzzle in one.\nThe enemy types change how you play. Standard Infected (red, green, blue) can be matched. Heavy Brutes can't be moved, and touching one ends the run. Hazmat zombies insulate and break chains, so you have to ram them out. Frayed Powerlines are environmental hazards.\nIt started as a Unity 6 URP prototype (eight C# scripts, scene setup docs and a tuning reference). It then grew into Z-RUNNER, a portrait mobile version whose prototype is entirely code-generated: editor scripts build the materials, prefabs and scene, with no hand-made binary assets.",
      "highlights": [
        "Endless runner meets match-3: shunt zombies to complete colour chains",
        "Vehicle and ragdoll physics shunting",
        "Enemy variety: Standard, Heavy Brute, Hazmat insulator, Frayed Powerline hazard",
        "Fully code-generated prototype: editor scripts build the materials, prefabs and scene",
        "Designer-friendly tuning values"
      ],
      "role": "Solo",
      "tags": [
        "Unity",
        "URP",
        "C#",
        "Mobile",
        "Arcade",
        "Runner",
        "Puzzle"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "my-gecko",
      "title": "My Gecko",
      "year": "2026",
      "category": "Unity",
      "engine": "Unity 6 · URP · C# · Android",
      "status": "In development",
      "glyph": "🦎",
      "color": "#6f9f7a",
      "featured": false,
      "summary": "A cozy comfort app for a friend: a gecko on a rainy windowsill reads your mood from three playful taps and picks the right kind of nice thing to do.",
      "details": "A cozy comfort app I'm building as a gift for a friend. A little gecko named Mochi lives on a rainy windowsill. When you open the app, Mochi asks three playful tap questions ('If you were a little animal right now, which one?'), quietly works out how you're feeling, and picks a comfort activity: sitting together, slow breathing, popping raindrops, a grounding game or a found treasure. You never have to make a decision.\nMochi remembers past visits, learns which activities actually help, has its own little life (Kevin the snail keeps escaping) and grows closer over time. At night it switches to slow sleepy puzzles that wind down to sleep.\nVersion 2 turns it into a shared space for two: one co-op gecko pet, shared goals, daily photo adventures, a sealed secret-notes jar revealed once a year, and 'hold hands', where comfort messages only appear while both friends hold the screen at the same time.",
      "highlights": [
        "Procedural, touch-following gecko (IK legs, head and eye tracking)",
        "Mood read from 3 indirect tap questions, scored into 5 states",
        "Learns which comfort activity helps most (bandit-style learner)",
        "560+ hand-written gecko lines with memory slots and no-repeat rules",
        "Rain audio synthesized entirely in code, no sound files",
        "Night mode with sleepy puzzles that end on their own",
        "v2: co-op pet, hold-hands messages, secret notes jar, on-device photo checks"
      ],
      "role": "Solo — design, code & writing",
      "tags": [
        "Unity",
        "C#",
        "URP",
        "Mobile",
        "Systems",
        "Puzzle",
        "Experimental"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "reverse",
      "title": "The First Of Us",
      "year": "2026",
      "category": "Game Jam",
      "engine": "Mobile AR · 3D",
      "status": "Jam entry",
      "glyph": "⏪",
      "color": "#c2364b",
      "featured": true,
      "summary": "ICAT Game Jam 2026: find an old CRT in AR, press reverse on history, jump in and change one thing — then don't get caught.",
      "details": "A solo 72-hour game for ICAT Game Jam 2026, theme REVERSE. You find an old CRT TV and tape setup anchored in the real world through AR, and load a disc labelled with a world event. Your old remote breaks mid-rewind, so you dig a new one out of your grandfather's lab. This one doesn't rewind: it has a REVERSE button. Press it and the event plays backwards, with the credits rolling first.\nPause at the right moment and pull a glowing orb to step into the scene in 3D. You have 10 seconds to change something, then 10 more to avoid the one person in the scene (ducking behind them works) before you escape back to an altered present.\nThe full vision is one continuous comedic reel of history from Adam and Eve to today, with each event boiled down to one main character and a ridiculous twist.",
      "highlights": [
        "Solo, 72 hours, ICAT Game Jam 2026",
        "AR-anchored retro CRT and tape setup in your real room",
        "The REVERSE button plays history backwards, credits first",
        "Step into the scene: 10 s to change it, 10 s to not get caught",
        "Comedic take on rewriting history"
      ],
      "role": "Solo",
      "tags": [
        "AR",
        "Mobile",
        "Game Jam",
        "Narrative",
        "Experimental"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "retro-arcade",
      "title": "fowlplay",
      "year": "2026",
      "category": "Game Jam",
      "engine": "Unity",
      "status": "Installation",
      "glyph": "🕹️",
      "color": "#d68a1e",
      "featured": false,
      "summary": "A two-player retro versus installation: two screens back to back, two gamepads — and webcams that put your real face in the game.",
      "details": "fowlplay was built for a 3-day jam with the theme 'retro arcade', and run as a public installation for 100+ players and 100+ spectators. One PC drives two monitors placed back to back, facing opposite directions. Each side has its own gamepad and webcam, and the webcam puts that player's real face into the game. You're playing head-to-head against someone standing right behind you, without being able to see them.\nThe aim: retro arcade feel built with modern tech. It's funny, competitive and loud enough to pull in a crowd.",
      "highlights": [
        "Dual-screen, back-to-back setup from one PC",
        "Webcams put players' real faces in the game",
        "Gamepad-only controls: instant pick-up-and-play",
        "Designed for 100+ players and spectators",
        "Built fast in Unity with a Claude MCP workflow"
      ],
      "role": "Lead",
      "tags": [
        "Unity",
        "Installation",
        "Game Jam",
        "Arcade",
        "Local multiplayer"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "morphrush",
      "title": "MorphRush",
      "year": "2026",
      "category": "Web",
      "engine": "HTML5 · JavaScript",
      "status": "Playable",
      "glyph": "🔷",
      "color": "#2f7fd6",
      "featured": false,
      "summary": "Endless runner meets shape-and-colour matching. Morph to fit the gate or eat the wall.",
      "details": "A browser game in a single self-contained file, with multiple control schemes, swipe input and difficulty that ramps up in stages.",
      "highlights": [
        "Runs in any browser, no install",
        "Swipe + keyboard controls",
        "Progressive difficulty stages"
      ],
      "role": "Solo",
      "tags": [
        "Web",
        "JavaScript",
        "Mobile"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "get-up",
      "title": "Get UP",
      "year": "2026",
      "category": "Other",
      "engine": "Roblox (3D, hand-drawn style)",
      "status": "In development",
      "glyph": "🧹",
      "color": "#e9a86b",
      "featured": false,
      "summary": "A calm, hand-drawn cleaning game: a girl having a hard time cleans her tiny city apartment bit by bit, and colour comes back to the world as she goes.",
      "details": "Get UP starts with a girl struggling with depression waking up on her rooftop balcony in a huge city. She goes down to her messy two-room apartment (bedroom and bathroom, kitchen and laundry) and cleans it little by little. As her space gets cleaner, so does she, and her mood lifts.\nThe art is clearly hand-drawn. Everything starts dull, dark and desaturated, and colour returns as you clean. Moving objects get a 2–3 frame 'wiggle' animation. There are no rush or fail states: you can just hang out, use the computer, or flick the lights on and off.",
      "highlights": [
        "Colour returns to the world as you clean",
        "Hand-drawn look with 2–3 frame wiggle animation",
        "Calm, satisfying, no-pressure pacing",
        "Optional idle interactions around the apartment"
      ],
      "role": "Solo: design & art direction",
      "tags": [
        "Roblox",
        "Narrative",
        "Experimental"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "egg-celeration",
      "title": "The Egg",
      "year": "2026",
      "category": "Unity",
      "engine": "Unity · C#",
      "status": "Prototype",
      "glyph": "🥚",
      "color": "#e8b531",
      "featured": false,
      "summary": "A mobile endless runner where you don't steer the egg, you shape the road: drag your finger to raise bumps and ramps and keep the egg rolling.",
      "details": "Egg-celeration is an endless mobile runner. An egg rolls forward along a procedurally generated road at a constant speed, and the player controls the road's height by dragging a finger up or down. Ramps send it flying, bumps slow it down, and a bad curve ends the run. It was inspired by Draw the Road 3D.\nThe road is a smooth mesh that gets rebuilt every frame from a ring buffer of height points, and its MeshCollider updates in place. The egg is one Rigidbody sphere sitting on four raycast spring-damper suspensions.",
      "highlights": [
        "Player-sculpted road: drag to raise and lower the terrain in real time",
        "Road mesh and collider rebuilt every frame from a ring buffer",
        "Raycast spring-damper suspension (physics v4)",
        "35° camera with lazy Y-follow for dramatic jumps"
      ],
      "role": "Solo: design & code",
      "tags": [
        "Unity",
        "C#",
        "Mobile",
        "Systems",
        "Runner"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "chroma-crate-clear",
      "title": "Chroma Crate Clear",
      "year": "2026",
      "category": "Unity",
      "engine": "Unity · C# · DOTween",
      "status": "In development",
      "glyph": "🧊",
      "color": "#e0457b",
      "featured": false,
      "summary": "A 3D puzzle meets match-3: tap arrow blocks out of a cluster, fill a 7-slot tray, and clear colours in threes before the tray fills up.",
      "details": "Chroma Crate Clear is a mobile puzzle game that combines 3D block removal with match-3. Each level is a 3D cluster of arrow-marked blocks. Tap one, and if its path is clear it flies into a 7-slot tray. Three of the same colour clear out. If the tray fills up, you lose.\nLevels are generated by a 'reverse build' algorithm, which places trios of blocks with guaranteed exit paths, so every level can be solved and nothing soft-locks.",
      "highlights": [
        "Reverse-build level generator: every level is guaranteed solvable",
        "3D spatial puzzle combined with a 7-slot match-3 tray",
        "Planned: flow-chain multiplier, multi-cell blocks, daily seed mode",
        "Juice: DOTween animation, haptics, pitch-ladder audio, micro-pauses"
      ],
      "role": "Solo: design & code",
      "tags": [
        "Unity",
        "C#",
        "Mobile",
        "Systems",
        "Puzzle"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "dealloc",
      "title": "dealloc()",
      "year": "2026",
      "category": "Game Jam",
      "engine": "BYOG 2026 jam · procedural",
      "status": "Jam entry",
      "glyph": "🧩",
      "color": "#7a5cff",
      "featured": false,
      "summary": "BYOG 2026 jam entry for 'Everything Is Temporary': you're a little pixel-body program that spends itself, piece by piece, to help a companion.",
      "details": "dealloc() was my entry to BYOG (Build Your Own Game) 2026, theme 'Everything Is Temporary'. You play a program made of pixels. Every time you help your companion, you use up part of your own body, so the game ends with a small life lesson about what you give away. The entire game is procedurally generated.\nNext step: grow it into a huge, fully procedural open-world multiplayer game set inside a computer. It keeps the dealloc() rules and uses a dense, futuristic micro-pixel 3D look instead of Minecraft-style blocks.",
      "highlights": [
        "Theme: Everything Is Temporary",
        "Your body is the resource: helping costs you pixels",
        "Fully procedurally generated",
        "Planned expansion: procedural open-world multiplayer inside a computer"
      ],
      "role": "Solo",
      "tags": [
        "Game Jam",
        "Systems",
        "Narrative",
        "Experimental"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "kaatru",
      "title": "Sailboat Racing",
      "year": "2026",
      "category": "Unity",
      "engine": "Unity · C# · online multiplayer",
      "status": "R&D",
      "glyph": "⛵",
      "color": "#1f7fb8",
      "featured": false,
      "summary": "A chaotic 2–6 player online party game about traditional coastal sailboat racing, with wobbly bodies, simple controls and lots of yelling.",
      "details": "This game is inspired by the coastal boat racing in the Tamil film Mandaadi. You play the Mandaadi, the captain of a traditional sailboat, racing against other crews. It started as a competitive 2–6 player online sailing game. In October 2026 it changed direction into a very funny co-op party game with sloppy, wobbly body physics and no complicated mechanics.",
      "highlights": [
        "2–6 players online",
        "Wobbly ragdoll-style body physics",
        "Rooted in Tamil coastal boat-racing culture",
        "Simple controls, built for laughs"
      ],
      "role": "Solo: design & code",
      "tags": [
        "Unity",
        "C#",
        "Arcade",
        "Local multiplayer"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "heap",
      "title": "HEAP",
      "year": "2026",
      "category": "Other",
      "engine": "3D · procedural · multiplayer",
      "status": "Idea",
      "glyph": "💾",
      "color": "#00c2d1",
      "featured": false,
      "summary": "The big sequel to dealloc(): a huge, fully procedural open-world multiplayer game that takes place inside a computer, where your body is still the currency.",
      "details": "HEAP grows my BYOG 2026 jam game dealloc() into a massive, fully procedurally generated open-world multiplayer game with Minecraft-scale freedom, set inside a computer. It keeps dealloc()'s core rule: you're a program made of pixels, and helping others costs you parts of yourself.\nIt's 3D, but it doesn't use blocks. The look is dense and futuristic, made of tiny micro-pixels.",
      "highlights": [
        "Expands the dealloc() jam game",
        "Fully procedural open world inside a computer",
        "Multiplayer, Minecraft-scale freedom",
        "Dense futuristic micro-pixel 3D look (no blocks)"
      ],
      "role": "Solo: design & code",
      "tags": [
        "Systems",
        "Survival",
        "Experimental"
      ],
      "image": "",
      "links": []
    },
    {
      "id": "magzzele",
      "title": "magzzele",
      "year": "2026",
      "category": "Other",
      "engine": "2D · Steam P2P",
      "status": "Idea",
      "glyph": "🧲",
      "color": "#4fae8c",
      "featured": false,
      "summary": "An endless 2D co-op puzzle game for exactly two players: dreamy puzzles plus Stardew/Terraria-style building, with a My Singing Monsters musical charm.",
      "details": "magzzele is a 2D puzzle game built for exactly two players working together. It mixes the dreamy puzzle feel of Her Trees: Puzzle Dream and Birth with the cosy building and exploring of Stardew Valley and Terraria, and adds the musical, collectible charm of My Singing Monsters. It's endless, so the world and puzzles keep going instead of ending after a fixed number of levels. Online co-op runs on Steam P2P networking.",
      "highlights": [
        "Co-op for exactly 2 players",
        "Endless: no final level",
        "Puzzle + cosy sandbox crossover",
        "Steam P2P networking"
      ],
      "role": "Solo: design & code",
      "tags": [
        "Systems",
        "Puzzle",
        "Local multiplayer"
      ],
      "image": "",
      "links": []
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
