/* Concept Vault: studio projects (11 My Gecko, 12 Magzzele, 13 HEAP).
   Same GDD shape as data.js, plus EXTRA (description + player POV) and MATRIX scores. */
(function () {
  const S = [
{
  id: "my-gecko", num: "11", title: "My Gecko", cat: "Studio", theme: "gecko",
  accent: "#7ee081", accent2: "#ffd38a",
  players: "1 player · shared mode", space: "Any phone, anywhere", session: "1–3 min · 10 min at night",
  tagline: "A tiny gecko that checks on you, so you don't have to ask.",
  logline: "A cozy comfort companion for Android. Open the app and a gecko asks three gentle questions, reads your mood from the answers and comforts you in the way that fits, with rain, small talk and quiet puzzles at night. You never have to decide anything.",
  mind: "On day five the gecko remembers that Tuesday was hard and asks about it in its own words, so the check-in feels like a friend noticing, not a form.",
  genre: "Comfort companion · virtual pet · cozy puzzle",
  platform: "Android phone (Unity build), fully offline",
  audience: {
    primary: "Young adults who zone out, feel low or can't switch off at night",
    secondary: "Long-distance friends who want a small, gentle ritual to share every day",
    personas: [
      ["Tara, 21", "Opens apps to stop thinking, then closes them the moment they ask too much."],
      ["A long-distance pair", "Two friends in different cities who want one small thing to share daily."],
      ["Night owl, 24", "Lies awake scrolling and needs something calmer than a feed."]
    ]
  },
  fiction: "A small leaf-green gecko lives in a tiny glass house behind a rainy window on your phone. It has been waiting for you all day. It doesn't know much about the world outside, but it is very good at noticing how you are, and it keeps a little diary of every visit so it never forgets.",
  uspHead: "Comfort with zero decisions.",
  usp: [
    "Three taps and you're understood: the app reads your mood and picks the right kind of comfort for you.",
    "A companion that learns: past moods shape tomorrow's questions, so it never feels like the same form twice.",
    "Offline and private: the mood diary never leaves the phone, and the shared mode is opt-in."
  ],
  loop: ["Open the app", "Answer 3 gentle questions", "Gecko reads your mood", "Comfort that fits", "Diary remembers"],
  curve: { labels: ["Arrive", "Questions", "Understood", "Comfort", "Night puzzle", "Drift off"], v: [.35, .5, .8, .92, .6, .25] },
  systems: [
    ["Mood check-in", "3 questions × 4 answers drawn from a large pool, so the wording changes daily; answers map to an energy and calm score."],
    ["Mood memory", "A local diary of past check-ins tunes question choice, tone and the gecko's greetings over time."],
    ["Comfort library", "Rain and company, breathing with the gecko, kind notes, or one tiny step like drinking water, chosen by mood."],
    ["Night mode", "After dark the app dims and offers simple 2D puzzles with no timer and no fail state, to quiet the mind before sleep."],
    ["Shared mode", "Two phones care for one gecko: shared goals, secret notes, a 'hold hands' button and a wall of memories."]
  ],
  interact: [
    ["Tap one of four answers", "Mood check-in", "Gecko tilts its head, soft marimba chime"],
    ["Press and hold the gecko", "Comfort pet", "Its eyes close and the phone purrs with a light haptic"],
    ["Breathe with the gecko", "Calm exercise", "Its throat glows in and out in time with your breath"],
    ["Slide a puzzle tile", "Night puzzle", "The rain softens as the puzzle completes"],
    ["Hold hands (shared mode)", "Both partners press at once", "Both phones vibrate together and a tiny heart appears"]
  ],
  palette: ["#0b1a1f", "#7ee081", "#ffd38a", "#ff9bb3", "#e6f4ef"],
  keywords: ["Rainy window", "Soft 3D gecko", "Lamp-warm night", "Tiny diary"],
  visual: "A small glass house behind a rainy window at night, lit by one warm lamp. The gecko is a soft, rounded 3D model with big eyes. The interface is almost nothing: three rounded answer cards and the gecko.",
  audio: "Rain on glass, a distant roll of thunder, soft marimba chimes for answers and a purr-like haptic when you hold the gecko.",
  tech: {
    Engine: ["Unity (Android build)"],
    Libraries: ["Unity Mobile Notifications", "Local JSON mood diary", "Procedural gecko rig (placeholder model)"],
    Hardware: ["Any Android phone", "Headphones for the rain"]
  },
  arch: ["Check-in answers", "Mood scorer", "Mood diary", "Comfort picker", "Gecko + rain scene"],
  proto: ["3-question check-in with mood scoring", "Gecko reacts with 4 comfort styles", "Mood diary across days", "1 night-mode puzzle"],
  full: ["Large question pool with daily variety", "Greetings that learn from the diary", "Two-phone shared mode", "Gentle check-in notifications"],
  weeks: [["Check-in and mood model", 1], ["Gecko scene and rain", 2], ["Diary and learning", 1], ["Night puzzles", 1], ["Playtesting", 1]],
  risks: [
    "Repetition makes it feel robotic: a large rotating question pool and greetings built from the diary",
    "It is not a therapy tool: if answers stay very low for days, the gecko gently points to real people and helplines"
  ],
  money: [
    ["Free core", "The check-in, the gecko and night puzzles stay free, with no ads."],
    ["Cosmetic packs", "Optional gecko colours and window scenes."],
    ["Wellbeing editions", "Licensed versions for college counselling centres and wellbeing programmes."]
  ],
  games: [
    ["Finch: Self Care Pet", "Finch Care, 2021", "A virtual bird grows as you complete self-care goals, the closest relative of this app.", "https://apps.apple.com/gb/app/id1528595748"],
    ["Kind Words (lo fi chill beats to write to)", "Popcannibal, 2019", "Anonymous kind letters in a cozy room; gentle, low-pressure play that comforts people.", "https://www.engadget.com/2020-03-28-kind-words-social-network-nice.html"],
    ["Neko Atsume: Kitty Collector", "Hit-Point, 2014", "A near-effortless pet game you check in on, a model for low-friction daily visits.", "https://en.wikipedia.org/wiki/Neko_Atsume"]
  ],
  papers: [
    ["Delivering CBT to Young Adults Using a Fully Automated Conversational Agent (Woebot): A Randomized Controlled Trial", "Fitzpatrick, Darcy and Vierhile · JMIR Mental Health, 2017", "Two weeks of chatting with a friendly bot reduced symptoms in college students compared with an information-only group.", "https://mental.jmir.org/2017/2/e19/"],
    ["Serious Games and Gamification for Mental Health: Current Status and Promising Directions", "Fleming et al. · Frontiers in Psychiatry, 2017", "How game elements can widen the reach of mental-health support and keep people engaged.", "https://www.frontiersin.org/articles/10.3389/fpsyt.2016.00215/full"],
    ["Need better sleep? Consider the cognitive shuffle", "Simon Fraser University · EurekAlert!, 2016", "Luc Beaudoin's serial diverse imagining technique for quieting a racing mind, the inspiration for night mode.", "https://www.eurekalert.org/news-releases/577613"]
  ]
},
{
  id: "magzzele", num: "12", title: "Magzzele", cat: "Studio", theme: "grove",
  accent: "#ff7a90", accent2: "#8fd3c7",
  players: "2 players (online co-op)", space: "Two PCs, anywhere (Steam P2P)", session: "Endless · one in-game day ≈ 17 min",
  tagline: "Two dreamers, one thread. Grow a friend from bones and let it sing.",
  logline: "An endless two-player online co-op puzzle game. By day you farm body parts from bone-seeds, at dusk you stitch them onto a strange companion, and by night you dig into an endless dream underground for wordless co-op puzzles. Every finished companion takes root as a singing tree.",
  mind: "Walk away from your partner and the world drains to black and white, but secret glyphs appear that only the lonely one can see. The best puzzles make you choose to split up.",
  genre: "Co-op puzzle · farming · creature building · music",
  platform: "PC (Windows), Unity 6.3 LTS, online co-op over Steam P2P",
  audience: {
    primary: "Pairs of friends and couples aged 16–35 who play cozy and puzzle games together online",
    secondary: "Long-distance friends looking for a game that rewards talking to each other",
    personas: [
      ["Two friends, 19 and 20", "Play Stardew Valley together every weekend and want something stranger."],
      ["A long-distance couple", "Want a game that literally cannot be played without both of them."],
      ["The puzzle fan", "Loves wordless observation puzzles like the Her Trees series."]
    ]
  },
  fiction: "Two lonely dreamers wake up on the same monochrome dream-farm, Marrowgrove. The soil grows bones. A workbench waits at dusk for a companion that is never quite finished. Beneath the farm, the dream goes down forever through libraries, ribcage caverns, clockwork mires and a root sea. The only colour in the world comes from the invisible thread between the two of them.",
  uspHead: "A game that needs exactly two people.",
  usp: [
    "The Thread: the distance between the players changes the world itself, colour and harmony when together, hidden clues when apart.",
    "Every puzzle is split across two roles, so neither player can solve it alone.",
    "Progress you can hear: every finished companion becomes a tree that adds a layer to the grove's song."
  ],
  loop: ["Day: plant and water bone-seeds", "Dusk: stitch parts onto the companion", "Night: dig and solve co-op puzzles", "Sleep: both vote, crops grow", "Companion becomes a singing tree"],
  curve: { labels: ["Wake together", "Farm", "Stitch", "Descend", "Split sight", "Tree sings"], v: [.4, .45, .62, .75, .95, .85] },
  systems: [
    ["The Thread", "Thread strength falls from 1 to 0 as the players move from 6 to 14 tiles apart; it controls colour, music, watering and the hidden layer."],
    ["Bone farming", "Till, plant, water (only while together), grow and harvest seven crops that yield hearts, ribs, eyes, lungs, hands, legs and teeth."],
    ["Companion builder", "A random body plan such as '3 eyes, 0 limbs, 1 core'; every attached part gives both players an ability."],
    ["Endless underground", "Seed-generated layers 64 tiles deep with a new biome each time, puzzle rooms, seed caches and a Nightmare every 10th layer."],
    ["Singing grove", "Each tree plays 8-bar stems from its parts, kept in sync to the bar; nearby trees cross-pollinate into hybrids."]
  ],
  interact: [
    ["Walk away from your partner", "The Thread weakens", "World fades to monochrome, the harmony thins to one eerie solo"],
    ["Stand on a pan (Bone Scale)", "Add your weight", "The scale tilts with a hollow wooden knock"],
    ["Place a glyph on the shared 3×3 grid", "Enter an answer", "The glyph inks in on both screens"],
    ["Attach a part at the workbench", "The companion grows", "A wet squish and a new stem joins the song"],
    ["Both press the bed", "Sleep vote", "The day ends, crops grow and the game saves"]
  ],
  palette: ["#0d0d0d", "#f2efe6", "#ff7a90", "#8fd3c7", "#e8b04b"],
  keywords: ["Hand-drawn monochrome", "Colour by closeness", "Gentle-creepy", "Living music"],
  visual: "Hand-drawn black-and-white sprites at 480×270, scaled up pixel-perfect. Colour only appears through a full-screen Thread shader, in a capsule around and between the two players. Bones, organs and decay are shown softly and with humour.",
  audio: "Soft, warm and slightly detuned. Each grove has one key and tempo, and every body part brings its own stem: a kick drum for hearts, bone marimba for ribs, choir for lungs and a music box for eyes.",
  tech: {
    Engine: ["Unity 6.3 LTS", "2D URP"],
    Libraries: ["FishNet (host-authoritative)", "FishySteamworks + Steamworks.NET", "Unity Input System", "Unity Test Framework"],
    Hardware: ["2 PCs with Steam"]
  },
  arch: ["Player input", "ServerRpc request", "Host validates in Core", "Replicated state", "Thread shader + grove music"],
  proto: ["Two players connected over Steam P2P", "The Thread: colour vs monochrome by distance", "One Split Sight puzzle on the shared glyph grid", "Attach parts to one companion"],
  full: ["3 biomes, 7 crops and 6 body parts", "Bone Scale puzzles and the first Nightmare", "Singing grove with hybrids", "Save, rejoin and a 60-minute soak test"],
  weeks: [["Lobby and connection", 1], ["Shared world and the Thread", 2], ["Farming and companion", 2], ["Puzzle framework", 2], ["Grove music and playtests", 1]],
  risks: [
    "Steam P2P can only be tested in builds on two PCs: the Tugboat transport covers editor tests, AppID 480 covers development",
    "Desync between the two machines: everything is generated from seeds, only changes are sent, and world hashes are compared in soak tests"
  ],
  money: [
    ["Premium on Steam", "One purchase, with a friend pass so one owner can invite a partner."],
    ["Biome expansions", "New underground biomes with their own stems and puzzles."],
    ["Songbook export", "Players export their own grove's song as music."]
  ],
  games: [
    ["Birth", "Madison Karrh, 2023", "Build a companion from spare bones and organs to ease loneliness; the creepy-cute heart of this idea.", "https://en.wikipedia.org/wiki/Birth_(video_game)"],
    ["HER TREES series", "stonetreebook, 2022 onwards", "Wordless black-and-white observation puzzles with a gentle hint system.", "https://stonetreebook.itch.io/her-trees"],
    ["My Singing Monsters", "Big Blue Bubble, 2012", "Every creature adds a layer to a growing song, the model for the singing grove.", "https://en.wikipedia.org/wiki/My_Singing_Monsters"]
  ],
  papers: [
    ["To Asymmetry and Beyond!: Improving Social Connectedness by Increasing Designed Interdependence in Cooperative Play", "Harris and Hancock · CHI 2019", "Different roles and deliberate interdependence made co-op players feel more connected, the basis of the split-role puzzles.", "https://uwaterloo.ca/touchlab/references/asymmetry-and-beyond-improving-social-connectedness"],
    ["Birth review: make your soulmate from spare bones and organs", "Simon Parkin · The Guardian, 2023", "How Birth turns loneliness into gentle, creepy-cute puzzles.", "https://www.theguardian.com/games/2023/mar/04/birth-madison-karrh-review-make-your-soulmate-from-spare-bones-and-organs"],
    ["A delightfully melodic take on the monster-breeding game", "Kotaku", "Why a song that grows with every creature keeps players coming back.", "https://kotaku.com/a-delightfully-melodic-take-on-the-monster-breeding-gam-5951778"],
    ["Steam Matchmaking & Lobbies", "Steamworks documentation", "The friends-only lobby and invite flow that connects the two players.", "https://partner.steamgames.com/doc/features/multiplayer/matchmaking"]
  ]
},
{
  id: "heap", num: "13", title: "HEAP", cat: "Studio", theme: "heap",
  accent: "#39ff88", accent2: "#ff3b6b",
  players: "Massively multiplayer", space: "PC, online", session: "Drop-in · seasons of 6–8 weeks",
  tagline: "You are a program made of pixels. The Collector is always coming.",
  logline: "A persistent, seasonal multiplayer 3D voxel world inside a living computer. Players are programs whose pixels are their health, size, inventory and currency. Everything decays, a garbage collector sweeps the world, and each season the machine shuts down and its legacy seeds the next one.",
  mind: "Your health bar and your wallet are the same thing: your body. Give pixels away and they last; steal them and they rot in your hands.",
  genre: "Survival sandbox MMO · voxel · systemic",
  platform: "PC (Windows), Unity 6.3 URP client with .NET 10 servers",
  audience: {
    primary: "Sandbox and survival players aged 18–35 (Minecraft, Rust and Noita fans)",
    secondary: "Programmers and tinkerers who enjoy systems about code, memory and logic",
    personas: [
      ["The builder, 23", "Loves base building but finds that worlds which last forever go stale."],
      ["The programmer, 27", "Wants a world where fork() and malloc are actual powers."],
      ["The storyteller", "Leaves notes and lineages that outlive their character."]
    ]
  },
  fiction: "Inside a vast running computer, every program is a body of tiny pixels. The world is memory: volatile blocks that vanish in seconds, committed blocks that last a while, and blocks kept safe only while something still references them. The Collector, the machine's garbage collector, sweeps through and deletes whatever nobody points to. Each machine lives for one season, from Boot to Runtime to Leak to Shutdown, and when it dies, what its programs gave and built becomes the myth that seeds the next machine.",
  uspHead: "Garbage collection as a game world.",
  usp: [
    "Pixels are everything: health, size, inventory and currency in one body, so every trade and fight changes who you are.",
    "Given pixels last and taken pixels rot, so generosity is a survival strategy, not just a nice idea.",
    "Seasons end on purpose: each machine shuts down and its legacy becomes the seed and mythology of the next."
  ],
  loop: ["Mine and malloc pixels", "Build blocks and Process Cores", "Keep what you love referenced", "Survive the Collector's sweep", "Give, leave notes, pass to heirs"],
  curve: { labels: ["Boot", "Gather", "Build", "Sweep", "Leak", "Shutdown"], v: [.4, .55, .65, .92, .8, 1] },
  systems: [
    ["Pixel bodies", "Up to 1,728 micro-voxels per program; every pixel remembers whether it was read from the world, given or taken."],
    ["Decay and references", "Volatile, committed, referenced and swapped blocks with their own lifetimes; blocks near a fed Process Core stay safe."],
    ["The Collector", "Sweeps scheduled by the Machine Controller delete anything nobody references, like a real garbage collector."],
    ["Seasons and legacy", "Boot, Runtime, Leak and Shutdown phases; a save port and the Collector's Log carry a legacy into the next machine's seed."],
    ["Sharded world", "Region servers each own a range of addresses along a Hilbert curve; the world is regenerated from a seed and only diffs are stored."]
  ],
  interact: [
    ["Mine a block", "Pixels flow into your body", "Your cube grows a little, with a soft data chirp"],
    ["Eject pixels to build", "Place a block", "The block snaps in; its colour shows its memory type"],
    ["Feed a Process Core", "Protect nearby blocks", "A ring of light marks the safe radius"],
    ["Give pixels to another player", "A stable gift", "Golden pixels arc across and both bodies glow"],
    ["Stand outside any reference", "The Collector's sweep", "A red scanline passes and blocks dissolve into static"]
  ],
  palette: ["#050807", "#39ff88", "#ff3b6b", "#f7f3e3", "#6c7cff"],
  keywords: ["dealloc() look", "Phosphor glow", "Bitmap font", "Voxel decay"],
  visual: "A dealloc() look: procedural textures, a bitmap font, phosphor-green glow, bloom, film grain and colour fringing. Blocks show their memory type at a glance, and the Collector arrives as a red scanline that dissolves the world into static.",
  audio: "Synthesised audio throughout: data chirps, a low machine hum, and one melody per machine with a motif for each civilisation that grows inside it.",
  tech: {
    Engine: ["Unity 6.3 LTS (URP)", "Burst + Jobs meshing", ".NET 10 servers"],
    Libraries: ["LiteNetLib (UDP)", "VContainer + UniTask", "Shared deterministic C# package (PCG32)", "OpenTelemetry"],
    Infrastructure: ["Region server cluster", "PostgreSQL, Valkey, NATS", "Docker, later Kubernetes + Agones"]
  },
  arch: ["Client input", "Region server (30 Hz)", "Shared simulation rules", "Diff store with time-to-live", "Client regenerates world from seed"],
  proto: ["Playable 3D slice: voxel world, pixel body, monsters", "Process Cores, decay and the Collector", "Season phases and shutdown into the next machine", "Live tuning in the Master Developer Tool"],
  full: ["Thousands of players per machine across region servers", "Client prediction and server reconciliation", "Dungeons that collapse on discovery and evolving monster genomes", "Abilities as syscalls: fork(), kill -9, malloc"],
  weeks: [["Session tickets and fixed-point maths", 1], ["Chunk format and streaming", 2], ["Prediction and snapshots", 2], ["Diff store and decay", 1], ["Region handoff and load bots", 2]],
  risks: [
    "MMO scale is huge for a small team: start with one region and an integrated server, then scale out",
    "Client and server must agree bit for bit: shared code, integer maths, PCG32 and golden-value tests in both runtimes"
  ],
  money: [
    ["Buy to play", "One purchase for the client; every season is free."],
    ["Season pass", "Cosmetic rewards per machine season, never pay-to-win pixels."],
    ["Legacy cosmetics", "Memorial skins and lineage banners that carry across machines."]
  ],
  games: [
    ["Noita", "Nolla Games, 2020", "A world where every pixel is simulated, the closest ancestor of pixel bodies.", "https://pcgamer.com/noita-is-a-hilarious-horrifying-wizard-death-experiment-where-every-pixel-is-simulated"],
    ["EVE Online", "CCP Games, 2003", "One shared persistent world for every player, the model for a single living machine.", "https://en.wikipedia.org/wiki/Eve_Online"],
    ["Bitburner", "Open-source browser game", "A programming game about hacking servers, proof that code-themed play has an audience.", "https://bitburner-official.github.io/"]
  ],
  papers: [
    ["Fast-Paced Multiplayer (Part II): Client-Side Prediction and Server Reconciliation", "Gabriel Gambetta", "The prediction and reconciliation model planned for HEAP's client.", "https://gabrielgambetta.com/client-side-prediction-server-reconciliation.html"],
    ["Source Multiplayer Networking", "Valve Developer Community", "Snapshots, interpolation and lag compensation in an authoritative server.", "https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking"],
    ["Infinite Space: An Argument for Single-Sharded Architecture in MMOs", "CCP Games · Game Developer", "Why one shared world beats many copies, and how EVE splits it across server nodes.", "https://gamedeveloper.com/design/infinite-space-an-argument-for-single-sharded-architecture-in-mmos"],
    ["Exploring the Tech and Design of Noita", "Petri Purho · GDC 2019", "How a world where every pixel is simulated is built and kept fast.", "https://gdcvault.com/play/1025695/Exploring-the-Tech-and-Design"]
  ]
}
  ];

  const X = {
    "my-gecko": {
      desc: [
        "My Gecko is a small comfort companion for Android, made for people who zone out, feel low or lie awake at night and don't have the energy to explain how they feel. It started as a gift for a long-distance friend. Instead of a mood tracker full of sliders and journals, it's a single gecko behind a rainy window that does the asking for you.",
        "Every time you open it, the gecko asks three short, gentle questions, each with four answers to tap. The questions come from a large pool and are phrased like small talk, so they change every day. From your answers it works out your mood and picks the comfort that fits: quiet company and rain, a breathing exercise where its throat glows in time with you, a kind note, or one tiny step like drinking some water. You never have to choose anything.",
        "It also remembers. A private diary on the phone records each check-in, so the gecko greets you differently after a hard week and notices when things get better. After dark, night mode dims the screen and offers simple 2D puzzles with no timer and no way to fail, designed to slow a racing mind before sleep. A shared mode lets two friends in different places care for the same gecko, leave secret notes and press 'hold hands' at the same time."
      ],
      pov: [
        ["0:00", "Opening the app", "It's late and you open the app without really thinking. Rain is falling on a dark window, a warm lamp flicks on, and a small green gecko wakes up and blinks at you."],
        ["0:10", "Three little questions", "A card slides up: 'Did today feel heavy or light?' Four rounded answers sit below it. You tap 'A bit heavy'. The gecko tilts its head. Two more questions follow, each softer than the last."],
        ["0:40", "Being understood", "The gecko says it thinks you're tired and a little far away today, and that's okay. It doesn't ask you to pick anything. The rain gets a little louder and the lamp glows warmer."],
        ["1:00", "Breathing together", "It curls up on the windowsill. Its throat glows slowly in and out, and a tiny line says 'breathe with me'. You find yourself matching it for four or five breaths without being told to."],
        ["2:00", "It remembers", "Before you go, it says, 'You said Tuesday was heavy too. I'll be here tomorrow.' A small drawing of rain is added to today's page in its diary."],
        ["3:00", "Night mode", "Past midnight the screen dims to deep blue. The gecko yawns and nudges a small puzzle towards you: slide the leaves so the raindrops reach the flower. There's no timer and no score."],
        ["8:00", "Drifting off", "As the last tile clicks into place, the rain gets softer and softer. The gecko falls asleep first. You put the phone down."]
      ],
      demo: 2
    },
    "magzzele": {
      desc: [
        "Magzzele is an endless online co-op puzzle game for exactly two players, built in Unity 6.3 and connected over Steam P2P. Its world is called Marrowgrove. It blends the wordless observation puzzles of the Her Trees series, the creepy-cute companion building of Birth, the farm-by-day, dig-by-night rhythm of Stardew Valley and Terraria, and the growing song of My Singing Monsters.",
        "The heart of it is the Thread. When the two players stay close, the world around and between them blooms into colour, watering counts, villagers wake up and the music plays in full harmony. When they walk apart, everything drains to black and white and the music thins to one eerie solo, but a hidden layer appears: ghost glyphs, shadow ledges and secret objects that only a lonely player can see. Many puzzles depend on choosing when to split up and when to come back together.",
        "By day the pair farm body parts from bone-seeds. At dusk they stitch them onto a shared companion that asks for a random body plan, and at night they dig down through endless, seed-generated dream layers full of two-role puzzles. A finished companion walks to the grove and takes root as a singing tree that adds its parts' stems to the music. The project foundation is built (Steam bootstrap, transport selection, deterministic seeds and tuning), with the lobby, the Thread and puzzles next on the roadmap."
      ],
      pov: [
        ["0:00", "Waking up together", "You open your eyes on a black-and-white farm. Your friend's character stands a few tiles away and a soft band of colour glows between you. Their voice in your headset says, 'I can see colour around you.'"],
        ["1:30", "Watering only works together", "You plant a heart seed. When you water it alone across the field, the water fizzles. Your friend walks over, the colour reaches you, and the next splash sinks in with a little sparkle."],
        ["5:00", "Dusk at the workbench", "The sky turns amber. The workbench asks for '3 eyes, 0 limbs, 1 core'. You attach a heart you grew yesterday. It squishes into place, and a low kick drum starts playing from the half-built body."],
        ["8:00", "Going under", "At night the root opens. You both drop into the Library Strata as pages of ink fall around you. Your partner wanders off to explore, and their side of the world turns grey."],
        ["10:00", "Split sight", "A puzzle room. You see a page covered in glyphs; your friend sees only a stencil with nine holes. You read glyphs aloud, they tell you where the holes are, and together you fill the shared 3×3 grid. Seal. The door opens on both screens."],
        ["14:00", "Walking apart on purpose", "A ledge is missing. You walk away until the world goes monochrome, and a shadow ledge appears that only you can see. You guide your friend across it by voice, step by step."],
        ["17:00", "A tree sings", "Back on the surface, the companion is complete. It walks to the grove, roots itself and becomes a tree. Its stems join the song, and you both stop talking to listen."]
      ],
      demo: 4
    },
    "heap": {
      desc: [
        "HEAP (subtitle: a dealloc() World) is a massive, persistent, seasonal multiplayer 3D voxel world set inside a living computer. Every player is a program made of pixels, and those pixels are everything at once: your health, your size, your inventory and your money. Mine the world and your body grows; build and you spend yourself; get hit and you shrink.",
        "Nothing lasts unless something holds on to it. Blocks decay according to their memory type, Process Cores keep nearby blocks referenced and safe, and the Collector, the machine's garbage collector, sweeps through and deletes whatever nobody points to. Pixels remember where they came from: pixels given to you are the most stable, while pixels taken by killing or raiding are corrupted and rot fast. Generosity becomes a survival strategy.",
        "Each machine lives for one season of six to eight weeks, moving through Boot, Runtime, Leak and Shutdown. When it shuts down, the Collector's Log records who lived and what they gave, and that legacy becomes the seed and mythology of the next machine. The project already has a server-authoritative architecture with a .NET 10 server and a shared deterministic simulation package, plus a playable single-player 3D slice with the world, monsters, the Collector, cores, heirs, notes and season shutdown."
      ],
      pov: [
        ["0:00", "Boot", "The screen fills with scrolling memory addresses, then resolves into a glowing voxel landscape. You're a small cube of green pixels. A counter reads 96: that's your health, your size and your money."],
        ["1:00", "Reading the world", "You mine a block. Pixels stream into your body and your cube gets slightly bigger. Nearby, a note hangs in the air, left by a long-gone player: // don't trust the cache."],
        ["4:00", "Building costs you", "You eject 64 pixels to place a committed wall and feel yourself shrink. You spend more to build a Process Core and feed it, and a ring of light shows the radius it will protect."],
        ["8:00", "The sweep", "A hum rises. A red scanline crosses the horizon: the Collector. Everything outside a core's radius dissolves into static, including the bridge you left unprotected. You stand inside your ring and watch the world around it vanish."],
        ["12:00", "Given, not taken", "A stranger is down to a handful of pixels. You give them twenty. Golden pixels arc between you and stay stable, while the pixels a raider took from them earlier are already rotting."],
        ["Week 7", "Leak", "Weeks later the machine enters its Leak phase. Memory turns unstable, monsters evolve, and everyone races to the save port with whatever they want to keep."],
        ["Week 8", "Shutdown", "The machine goes dark. Your name enters the Collector's Log alongside what you gave. When the next machine boots, a memorial to your lineage is part of its world."]
      ],
      demo: 3
    }
  };

  window.CONCEPTS.push(...S);
  window.EXTRA = Object.assign(window.EXTRA || {}, X);
  Object.assign(window.MATRIX, { "my-gecko": [3, 5, 3, 5], "magzzele": [4, 3, 4, 4], "heap": [5, 2, 4, 3] });
})();
