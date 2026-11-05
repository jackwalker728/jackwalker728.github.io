/* Concept Vault — GDD data for 10 concepts */
window.CONCEPTS = [
{
  id: "fake-feed", num: "01", title: "Fake Feed", cat: "Educational", theme: "feed",
  accent: "#ff2e88", accent2: "#3ef0ff",
  players: "Single player", space: "Desk or phone", session: "12–15 min",
  tagline: "Run the fake-news farm. Learn every trick by using it.",
  logline: "A satirical narrative-strategy game where you play a rising misinformation tycoon. Each level teaches one manipulation technique by making you use it to grow followers, until the final level turns the mirror on your own feed.",
  mind: "The last level fills your screen with realistic forwards built from the exact tricks you just used. You realise you have been the target all along.",
  genre: "Narrative strategy · satirical simulation · serious game",
  platform: "Web (desktop and mobile browser), with a kiosk mode for exhibitions",
  audience: {
    primary: "Students aged 14–24 who live on WhatsApp and Instagram",
    secondary: "Teachers, parents and NGOs running media-literacy workshops",
    personas: [
      ["Riya, 17", "Forwards memes to six family groups a day and has never checked a source."],
      ["Mr. Rao, 52", "School teacher who needs a 15-minute classroom activity with measurable results."],
      ["Arjun, 21", "Engineering student who is sure he can't be fooled."]
    ]
  },
  fiction: "TruthBuzz is a fictional city of two million phones. A shiny media startup hires you as Head of Engagement, and your boss is an AI called VIRAL that pays cash for every like. Six badges unlock new tools: Impersonation, Emotion, Polarisation, Conspiracy, Discredit and Trolling. A rival fact-checker, Kavya from ClearLens, tracks your posts, and the city's Trust Meter cracks a little every time you rise.",
  uspHead: "Inoculation through role reversal.",
  usp: [
    "Players learn manipulation by doing it, the same approach that measurably improved fake-news detection in Cambridge's Bad News studies.",
    "Built for an Indian context: WhatsApp forwards, family groups, regional languages and festival-season rumours.",
    "The ending generates a believable feed from the player's own choices, so the lesson lands personally."
  ],
  loop: ["Pick a target topic", "Craft the post", "Deploy bots and timing", "Followers vs trust react", "Unlock a badge or get debunked"],
  curve: { labels: ["Hook", "Power trip", "Escalation", "Doubt", "Reveal", "Reflect"], v: [0.4, 0.72, 0.86, 0.58, 0.97, 0.5] },
  systems: [
    ["Virality engine", "Reach = emotion × timing × network. Each post spreads through a simulated graph of 2,000 accounts."],
    ["Trust Meter", "A city-wide credibility bar. Every lie raises followers short-term and lowers trust long-term."],
    ["Fact-checker AI", "Kavya's chance to debunk rises with sloppy posts: wrong logos, impossible dates, recycled photos."],
    ["Badge progression", "Six techniques, each introduced, practised, then combined in a boss scenario."],
    ["Feed Mirror ending", "Procedurally assembles a feed from your posts and hides real tells for the player to spot."]
  ],
  interact: [
    ["Tap a headline variant", "Choose emotional framing", "Follower counter ticks up, emoji reactions burst"],
    ["Drag a source logo onto the post", "Impersonate a trusted outlet", "Verified tick glitches, a distrust shiver"],
    ["Bot-army slider", "Speed of spread", "Network graph lights up node by node"],
    ["Timing wheel", "Post at peak hour", "Notification storm, phone-ping chorus"],
    ["Swipe away a fact-check", "Discredit the checker", "Trust Meter cracks with a glass sound"]
  ],
  palette: ["#0d0b14", "#ff2e88", "#3ef0ff", "#f5f3ff", "#ffd23f"],
  keywords: ["Glitch-pop", "Parody UI", "Notification overload", "Satire"],
  visual: "A parody social app that slowly corrupts. It starts clean, with pastel cards and soft shadows. As your influence grows, RGB splits, red FAKE stamps and runaway scrolling take over the screen.",
  audio: "Phone pings, slot-machine counters, and a crowd murmur that slowly becomes an angry roar.",
  tech: { "Engine": ["HTML5 + TypeScript", "Phaser 3 or React"], "Libraries": ["D3.js spread graph", "i18n (English / Kannada / Hindi)"], "Hardware": ["Any phone or laptop"] },
  arch: ["Scenario JSON", "Choice engine", "Virality sim", "Feed renderer", "Pre/post quiz analytics"],
  proto: ["1 scenario covering 3 techniques", "Follower and Trust meters", "Fake feed renderer", "Pre/post headline quiz"],
  full: ["6 techniques across 18 scenarios", "3 languages", "Teacher dashboard", "Classroom leaderboard mode"],
  weeks: [["Research and writing", 2], ["Choice engine", 2], ["Feed UI and VFX", 2], ["Quiz and analytics", 1], ["Playtesting", 1]],
  risks: ["Political sensitivity: use fictional parties, people and topics", "Avoid teaching real harm: every trick is shown alongside the tell that exposes it"],
  money: [
    ["Grant-funded free game", "Media-literacy NGOs, CSR budgets and public-interest grants fund a free web release."],
    ["School licence", "Teacher dashboard with pre/post assessment reports per class."],
    ["Custom editions", "Branded versions for governments or platforms running awareness campaigns."]
  ],
  games: [
    ["Bad News", "DROG and University of Cambridge, 2018", "Players become a fake-news tycoon and learn six techniques. The direct inspiration.", "https://www.cam.ac.uk/research/news/fake-news-vaccine-works-pre-bunk-game-reduces-susceptibility-to-disinformation"],
    ["Harmony Square", "Cambridge Social Decision-Making Lab and DROG, 2020", "A follow-up inoculation game about political polarisation in a small town.", ""],
    ["Papers, Please", "Lucas Pope, 2013", "Inspection under pressure, a reference for how small documents carry moral weight.", ""]
  ],
  papers: [
    ["Good News about Bad News: Gamified Inoculation Boosts Confidence and Cognitive Immunity Against Fake News", "Basol, Roozenbeek and van der Linden · Journal of Cognition, 2020", "A randomised trial (N = 196) showing players got better at spotting misinformation techniques.", "https://doi.org/10.5334/joc.91"],
    ["Fake news 'vaccine' works: pre-bunk game reduces susceptibility to disinformation", "University of Cambridge, 2019", "Reports a study of about 15,000 players: perceived reliability of fake news fell by 21% on average.", "https://www.cam.ac.uk/research/news/fake-news-vaccine-works-pre-bunk-game-reduces-susceptibility-to-disinformation"],
    ["How a fake news game can help fight against online misinformation", "Institute for Public Relations", "A summary of the six techniques and the key findings.", "https://instituteforpr.org/how-a-fake-news-game-can-help-fight-against-online-misinformation"],
    ["Prebunking interventions based on inoculation theory can reduce susceptibility across cultures", "Roozenbeek, van der Linden and Nygren · HKS Misinformation Review", "Evidence that the approach works outside English-speaking countries.", "https://misinforeview.hks.harvard.edu/article/author/thomas-nygren"]
  ]
},
{
  id: "water-debt", num: "02", title: "Water Debt", cat: "Awareness", theme: "water",
  accent: "#39d0c8", accent2: "#e8c27a",
  players: "3–6 players", space: "Seated around one TV (about 2×3 m)", session: "15–20 min",
  tagline: "Everyone drinks from one lake. Nobody is told.",
  logline: "A local multiplayer social-dilemma game. Each player runs a household, farm or factory on their own phone, and all of them secretly draw from one shared reservoir shown on the TV. Selfish play wins rounds, and it also kills the lake.",
  mind: "The lake is never introduced as shared. Players discover it themselves when it drains far faster than their own usage could explain, and that realisation is the lesson.",
  genre: "Social dilemma · party strategy · serious game",
  platform: "TV or laptop as host, with players' phones as browser controllers (join by QR code)",
  audience: {
    primary: "College students and school groups aged 13 and up",
    secondary: "Civic bodies, water NGOs and corporate CSR workshops",
    personas: [
      ["Neha, 19", "Lives in a hostel and has never wondered where the tanker water comes from."],
      ["Facilitator", "A teacher running a 20-minute session who needs an instant debrief."],
      ["Ravi, 34", "Apartment association member arguing about borewell drilling."]
    ]
  },
  fiction: "It is 2031 in Kerepura, a Bengaluru-inspired city of lakes. Each player is a different stakeholder: a family, a paddy farmer, a textile factory, a tech park, a tanker operator. The monsoon is failing. A city broadcast reports borewell levels every in-game day, and underneath the city one aquifer connects everyone.",
  uspHead: "The lesson is discovered, not told.",
  usp: [
    "The hidden-commons reveal creates genuine surprise and argument in the room.",
    "Grounded in real events: in early 2024, about half of Bengaluru's roughly 13,900 borewells were reported dry.",
    "Ends with a guided debrief and concrete conservation actions."
  ],
  loop: ["Get today's need card", "Choose how much to draw", "Earn coins", "TV shows lake and events", "Negotiate or vote on rules"],
  curve: { labels: ["Comfort", "Greed", "Confusion", "Panic", "Reveal", "Pact"], v: [0.3, 0.66, 0.55, 0.96, 0.8, 0.6] },
  systems: [
    ["Shared aquifer sim", "One stock, rainfall-driven recharge and a nonlinear collapse below 20%."],
    ["Asymmetric roles", "Each role has different needs, payouts and temptations."],
    ["Event deck", "Heatwave, failed monsoon, pipeline burst, tanker strike."],
    ["Governance unlock", "After the reveal, players can vote on quotas, rainwater harvesting or fines."],
    ["Debrief generator", "Charts every player's usage against the lake level for discussion."]
  ],
  interact: [
    ["Phone slider", "Litres to draw", "TV water level drops, bubbling SFX"],
    ["Hold to pump", "Draw harder", "Phone vibrates more strongly"],
    ["Vote buttons", "Set a quota", "Recharge animation on the lake"],
    ["Tap a neighbour's icon", "Trade water", "Animated pipe between the two players"],
    ["Shake the phone", "Rain-dance emote", "A shared laugh moment on the TV"]
  ],
  palette: ["#04161c", "#39d0c8", "#e8c27a", "#f4efe6", "#ff6b4a"],
  keywords: ["Paper-cut city", "Top-down lake", "Water vs sand", "Live infographic"],
  visual: "A paper-cut diorama city around a lake, seen from above. Water is the only saturated colour, and as it drains the whole city fades to dusty sand.",
  audio: "Drips, pump clunks and city ambience, with a heartbeat that kicks in when the lake falls below 20%.",
  tech: { "Engine": ["Node.js + Socket.IO", "Canvas or Phaser TV view"], "Libraries": ["QR join codes", "Chart.js debrief"], "Hardware": ["1 TV or laptop", "Players' phones"] },
  arch: ["Phones (web)", "Socket server", "Aquifer sim", "TV renderer", "Debrief charts"],
  proto: ["4 roles over 7 in-game days", "Shared lake on TV", "Phone draw slider", "Reveal and a basic debrief chart"],
  full: ["8 roles and an event deck", "Voting and governance", "Kannada and Hindi UI", "Facilitator mode"],
  weeks: [["Simulation design", 1], ["Networking", 2], ["TV and phone UI", 2], ["Debrief", 1], ["Playtests", 2]],
  risks: ["Players without phones: keep 2 spare devices", "Feeling preachy: the reveal must stay player-driven"],
  money: [
    ["Workshop kit", "Licensed to schools and colleges, with a facilitator guide."],
    ["Sponsored editions", "Co-branded with water boards and NGOs."],
    ["CSR sessions", "Corporate sustainability training delivered as a game session."]
  ],
  games: [
    ["Fishbanks", "John Sterman, Dennis Meadows et al., MIT", "The classic multiplayer commons simulation used in universities.", "https://sustainabilityscience.org/course/part-0-introduction/unit-0-2-tragedies.html"],
    ["Fish Banks Ltd.", "Dennis Meadows · System Dynamics Society", "The original board and computer version, with debrief slides.", "https://systemdynamics.org/?p=2094"],
    ["Frostpunk", "11 bit studios, 2018", "Survival under scarcity where every rule you pass has a moral cost.", ""]
  ],
  papers: [
    ["The Tragedy of the Commons", "Garrett Hardin · Science 162 (3859), 1968", "The foundational essay on shared-resource collapse.", "https://doi.org/10.1126/science.162.3859.1243"],
    ["Tragedy revisited: 50 years of the commons", "Science policy forum, 2018", "Contemporary views on how groups avoid the tragedy.", "https://core.ac.uk/download/200267122.pdf"],
    ["Teaching the tragedy of open access: a classroom exercise", "System Dynamics Conference, 2022", "Classroom use of Fishbanks and why it works.", "https://proceedings.systemdynamics.org/2022/abstracts/1044.html"],
    ["Bengaluru water crisis: how over-exploitation of groundwater caused scarcity", "The Week, March 2024", "Local context: nearly 7,000 of 13,900 borewells dried up.", "https://www.theweek.in/news/india/2024/03/12/bengaluru-water-crisis-how-over-exploitation-of-groundwater-caused-scarcity.html"],
    ["India's Bengaluru running out of water as summer looms", "VOA News, 2024", "On-the-ground reporting of the shortage.", "https://www.voanews.com/a/india-bengaluru-running-out-of-water-as-summer-looms/7531387.html"]
  ]
},
{
  id: "x-ray-mirror", num: "03", title: "X-Ray Mirror", cat: "Educational", theme: "xray",
  accent: "#5cc8ff", accent2: "#ff5a5f",
  players: "Single player", space: "About 2 m in front of a TV", session: "5–8 min",
  tagline: "A mirror that shows what's inside you.",
  logline: "An augmented-reality magic mirror. Your live webcam image becomes a mirror with organs and bones mapped onto your moving body. The game asks you to touch real places on yourself, so you learn anatomy with your own hands.",
  mind: "You point confidently at your own liver and the mirror tells you you're on the wrong side. Most players misplace the heart and the liver.",
  genre: "Educational · body-motion quiz · AR mirror",
  platform: "PC or laptop with a webcam, shown on a TV (browser), with a kiosk mode for science centres",
  audience: {
    primary: "School students aged 10–16",
    secondary: "First-aid trainees, museum visitors and first-year medical students",
    personas: [
      ["Aarav, 12", "Learns faster by moving than by reading a textbook diagram."],
      ["Museum visitor", "Has five minutes and wants zero instructions."],
      ["First-aid trainer", "Needs repeatable CPR hand-position and recovery-pose drills."]
    ]
  },
  fiction: "You are a trainee at the Inside Out Clinic, a retro-futuristic hospital where the Mirror is your teacher, a calm AI called DR. GLASS. Each level is a shift: patients describe symptoms, and you locate the organ on your own body before the queue grows.",
  uspHead: "Your own body is the textbook.",
  usp: [
    "Body as input: there's no controller, you just touch yourself where you think the organ is.",
    "Research-backed format: an AR magic mirror was evaluated with 880 first-year medical students at LMU Munich.",
    "Runs in a browser on any laptop webcam, with no Kinect or depth camera needed."
  ],
  loop: ["Mirror gives a prompt", "Find the spot on your body", "Hold your hand there", "Organ revealed with a fact", "Speed and accuracy score"],
  curve: { labels: ["Wow", "Learn", "Quiz", "Miss", "Master", "Share"], v: [0.92, 0.5, 0.7, 0.45, 0.86, 0.6] },
  systems: [
    ["Body anchoring", "Organ sprites pinned between pose landmarks (shoulders, hips) and scaled to the player's torso."],
    ["Touch detection", "Distance from hand landmarks to each organ zone, held for 0.8 s to confirm."],
    ["Quiz director", "Adaptive difficulty: misses repeat with hints, streaks unlock harder layers."],
    ["Symptom stories", "A patient with pain low on the right? Find the appendix."],
    ["First-aid drills", "CPR hand placement and recovery-position checks scored from your pose."]
  ],
  interact: [
    ["Step into frame", "Body tracked", "Organs fade in with a scanner sweep"],
    ["Hand on chest", "Touch the heart", "Heart beats with a thump SFX"],
    ["Deep breath", "Shoulders rise", "Lungs inflate on the mirror"],
    ["Raise both hands", "Next level", "X-ray flash transition"],
    ["Hold a pose for 3 s", "Recovery-position check", "Green or red body outline"]
  ],
  palette: ["#050a18", "#5cc8ff", "#ff5a5f", "#e9f6ff", "#9bffce"],
  keywords: ["Radiograph blue", "Medical HUD", "Scan beams", "Clean diagrams"],
  visual: "A radiograph-style mirror with cyan bones and soft red organs inside a clinical HUD frame. A scan beam sweeps across your body each time a new organ is revealed. The art is stylised, never gory.",
  audio: "Soft scanner hums, heart thumps, a chime for correct answers and a calm AI voice.",
  tech: { "Engine": ["Browser JavaScript", "Optional Unity port"], "Libraries": ["MediaPipe Pose Landmarker", "MediaPipe Hands", "Canvas 2D"], "Hardware": ["Laptop + webcam", "TV or monitor", "Ring light"] },
  arch: ["Webcam", "Pose + hand landmarks", "Organ anchoring", "Touch detection", "Quiz + score UI"],
  proto: ["Mirror with 6 organs", "Touch detection", "10-question quiz", "Score screen"],
  full: ["30+ structures across skin, organ and bone layers", "First-aid drills", "Multi-language voice", "Teacher statistics"],
  weeks: [["Tracking and anchoring", 1], ["Organ art", 2], ["Quiz system", 1], ["First-aid drills", 2], ["Kiosk polish", 1]],
  risks: ["Lighting affects tracking: add a ring light and a calibration pose", "Body-image sensitivity: stylised art, no realistic skin"],
  money: [
    ["Installation licence", "For science centres, museums and hospitals' waiting areas."],
    ["School edition", "Annual licence with classroom statistics."],
    ["Content packs", "First aid, sports injuries and yoga anatomy."]
  ],
  games: [
    ["mirracle", "TU Munich (CAMP), 2011–2012", "An AR magic mirror that overlays a CT dataset onto the user for anatomy teaching.", "https://campar.in.tum.de/pub/blum2012vr/blum2012vr.pdf"],
    ["Magic Mirror for Anatomy Learning", "TU Munich with LMU Klinik", "A screen-based AR system for a virtual view inside your own body.", "https://www.cs.cit.tum.de/camp/projects/2015/magic-mirror-for-anatomy-learning"],
    ["Just Dance", "Ubisoft", "Camera-tracked full-body play, proof that mass audiences enjoy moving to an on-screen mirror.", ""]
  ],
  papers: [
    ["An Augmented Reality magic mirror as additive teaching device for gross anatomy", "Annals of Anatomy, 2018", "Evaluated by 880 first-year medical students at LMU Munich.", "https://pubmed.ncbi.nlm.nih.gov/29017852/"],
    ["Exploring Non-Reversing Magic Mirrors for Screen-Based AR Systems", "arXiv:1611.03354", "Whether a mirror should be flipped when teaching left vs right anatomy.", "https://arxiv.org/pdf/1611.03354"],
    ["Kinect for Interactive AR Anatomy Learning", "ISMAR 2013 poster", "Users touch bone landmarks on their own body to improve the overlay.", "https://ismar2013.ismar.net/ismar/2013/poster/kinect-interactive-ar-anatomy-learning.html"],
    ["Pose landmark detection guide for Web", "Google MediaPipe documentation", "The 33-landmark tracker this prototype uses in the browser.", "https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js"]
  ]
},
{
  id: "defuse-the-table", num: "04", title: "Defuse the Table", cat: "AR", theme: "defuse",
  accent: "#ffd60a", accent2: "#ff3b30",
  players: "2–3 players", space: "One table (about 1.5×1.5 m)", session: "About 10 min",
  tagline: "Same bomb. Three different realities.",
  logline: "An asymmetric co-op AR puzzle. A printed marker on a real table spawns a bomb, but each player's phone renders a different layer of it. The only way to solve it is to talk out loud.",
  mind: "Three people stare at the same empty spot on a table and argue about three different objects.",
  genre: "Asymmetric co-op · AR puzzle · party",
  platform: "Android phones with ARCore, one per player",
  audience: {
    primary: "Friends and college groups aged 16–30",
    secondary: "Team-building events and escape-room venues",
    personas: [
      ["The talker", "Loves party games and taking charge under pressure."],
      ["The quiet solver", "Spots patterns but needs the group to listen."],
      ["Venue owner", "Wants a 10-minute add-on that runs on cheap phones."]
    ]
  },
  fiction: "You are the Null Unit, a bomb squad whose AR visors split into three spectral modes: WIRE (physical), GLYPH (symbolic) and PULSE (timing). The bombs are built by The Clockmaker, who only builds devices that no single mind can defuse.",
  uspHead: "Shared space, split truth.",
  usp: [
    "Every player sees a different object at the same real-world anchor.",
    "Forces face-to-face talk, because there's no screen you can hand around.",
    "Takes the communication puzzle made famous by Keep Talking and Nobody Explodes and moves it fully into AR around a real table."
  ],
  loop: ["Scan the table marker", "Each phone reveals its layer", "Describe what you see", "Agree on one action", "Cut, press or rotate"],
  curve: { labels: ["Setup", "Confusion", "Shouting", "Breakthrough", "Last 10 s", "Relief"], v: [0.3, 0.6, 0.86, 0.7, 1.0, 0.5] },
  systems: [
    ["Layered bomb model", "One bomb, three render layers, each phone filtered by role."],
    ["Rule generator", "Procedural wire, glyph and timing combinations so no two bombs repeat."],
    ["Shared state sync", "Host-authoritative networking over local Wi-Fi."],
    ["Strike system", "Three mistakes and it explodes. Every strike shakes all phones."],
    ["Difficulty ramp", "More modules, less time, roles that rotate between rounds."]
  ],
  interact: [
    ["Point phone at the marker", "Anchor the bomb", "Hologram materialises with a hum"],
    ["Tap a wire (WIRE role)", "Cut", "Sparks appear on every phone"],
    ["Rotate the phone (GLYPH role)", "Turn the dial", "Mechanical click per step"],
    ["Hold to press (PULSE role)", "Timed release", "Beep pitch rises"],
    ["Make a mistake", "Strike", "All phones shake with haptics"]
  ],
  palette: ["#0e0f0a", "#ffd60a", "#ff3b30", "#34c759", "#e6e6e1"],
  keywords: ["Industrial", "Hazard stripes", "Hologram", "Red LED"],
  visual: "Industrial hardware rendered as flickering holograms over a real table. Hazard stripes, a red seven-segment timer and colour-coded wires set the mood, and each role gets its own tint so the split is readable at a glance.",
  audio: "Ticking that speeds up, beeps, sparks and radio chatter from command.",
  tech: { "Engine": ["Unity 6", "AR Foundation (ARCore)"], "Libraries": ["Photon Fusion or Netcode for GameObjects", "AR image tracking"], "Hardware": ["2–3 Android phones", "1 printed marker"] },
  arch: ["Image marker", "AR anchor", "Role layer renderer", "Network state", "Puzzle rules"],
  proto: ["1 bomb with 3 layers", "Wire-cut module", "Local sync of cuts and strikes", "Timer with explode / defuse endings"],
  full: ["8 module types", "Procedural bombs", "Campaign mode", "Spectator view on a TV"],
  weeks: [["AR and marker", 1], ["Layer rendering", 1], ["Networking", 2], ["Modules", 2], ["Playtesting", 1]],
  risks: ["Needs 2–3 ARCore phones: support a pass-the-phone fallback", "Latency: host-authoritative state and optimistic UI"],
  money: [
    ["Premium app", "One purchase per group; the other players join free."],
    ["Module packs", "New bomb modules as DLC."],
    ["Venue licence", "Escape rooms and event companies."]
  ],
  games: [
    ["Keep Talking and Nobody Explodes", "Steel Crate Games, 2015", "One player sees the bomb, the others hold the manual. The reference point for asymmetric communication.", "https://igf.com/content/keep-talking-and-nobody-explodes"],
    ["Operation: Tango", "Clever Endeavour Games, 2021", "Two-player co-op where each player sees a different screen.", ""],
    ["We Were Here series", "Total Mayhem Games", "Separated players solve puzzles only through voice.", ""]
  ],
  papers: [
    ["Designing Asymmetric Gameplay for Keep Talking and Nobody Explodes", "Ben Kane · GDC 2016", "How the team designed puzzles to keep players talking.", "https://gdcvault.com/play/1023113/Designing-Asymmetric-Gameplay-For-Keep"],
    ["Capsule review: Keep Talking and Nobody Explodes", "Pixel Poppers", "Why only one player seeing the screen works.", "https://pixelpoppers.com/review/keep-talking-and-nobody-explodes/"],
    ["Notes on KTaNE as physical-digital design", "XPUB and Lens-Based wiki, WdKA", "A designer's call to make KTaNE physical, close to this concept.", "https://pzwiki.wdka.nl/mediadesign/User:Thijshijsijsjss/Gossamery/KTaNE"],
    ["Games like Keep Talking and Nobody Explodes", "Nodal", "A market scan of the asymmetric-information co-op genre.", "https://nodal.gg/game/keep-talking-and-nobody-explodes-341800"]
  ]
},
{
  id: "time-window", num: "05", title: "Time Window", cat: "AR", theme: "time",
  accent: "#b388ff", accent2: "#d9b38c",
  players: "Single player", space: "The whole 5×5 m room", session: "12–15 min",
  tagline: "One room. Three centuries. Tilt to travel.",
  logline: "A single-player AR time-travel puzzle. Your phone is a window into the same room in 1925, today and 2125. Clues are split across eras at the exact same spot, and what you change in the past rewrites the future.",
  mind: "You plant a seed in 1925, tilt forward, and a tree has grown through the floor of 2125, right there in your real room.",
  genre: "AR puzzle adventure · time travel · room-scale",
  platform: "Android phone with ARCore, room-scale",
  audience: {
    primary: "Puzzle and escape-room fans aged 14–35",
    secondary: "Museums and heritage sites showing a building's past",
    personas: [
      ["Sana, 24", "Plays escape rooms monthly and loves aha moments."],
      ["Heritage curator", "Wants visitors to see a building as it was a century ago."],
      ["Solo gamer", "Wants a short, smart AR story in their own room."]
    ]
  },
  fiction: "The room belonged to Dr. Meera Iyer, an inventor who built a Chrono-Lens and vanished in 1925. The lens is your phone, and it still works. In 1925 the room is her brass-and-wood workshop. Today it's an empty flat. In 2125 it's a flooded, overgrown ruin run by her AI. To bring her back, you must close the loop she opened.",
  uspHead: "Your real room becomes a time-travel level.",
  usp: [
    "Each physical spot holds three versions, so walking the room is the puzzle.",
    "Cause and effect across eras, inspired by Titanfall 2's Effect and Cause and Dishonored 2's A Crack in the Slab, but in AR.",
    "Fits any 5×5 m room through floor-plane anchoring and auto-placed props."
  ],
  loop: ["Scan the room", "Explore one era", "Find a clue or object", "Tilt to shift era", "Use it in another era"],
  curve: { labels: ["Wonder", "Explore", "Stuck", "Cross-era aha", "Chain reaction", "Finale"], v: [0.8, 0.55, 0.4, 0.96, 0.86, 1.0] },
  systems: [
    ["Era layers", "Three prop sets sharing the same anchors on the scanned floor."],
    ["Causality graph", "Past states drive future props: water a plant in 1925 and get a tree in 2125."],
    ["Tilt-shift controller", "Gyro pitch selects the era, with hysteresis to avoid flicker."],
    ["Clue journal", "Auto-logs codes and sketches found in each era."],
    ["Room fitter", "Places props to fit the scanned floor so any room works."]
  ],
  interact: [
    ["Tilt forward or back", "Switch era", "Shutter flash and colour-grade change"],
    ["Walk to a spot", "Proximity trigger", "An era-specific clue appears"],
    ["Tap an object", "Pick up or use it", "Item slides into the journal"],
    ["Half-tilt peek", "See another era through a lens", "Ghostly circular overlay"],
    ["Place an item in the past", "Future changes", "Growth or decay timelapse VFX"]
  ],
  palette: ["#0a0420", "#b388ff", "#00ffd5", "#2a1d12", "#d9b38c"],
  keywords: ["Sepia 1925", "Neutral present", "Neon-overgrown 2125", "Lens vignette"],
  visual: "Three colour grades on one space: warm sepia and brass in 1925, natural tones today, and violet-cyan neon with vines and water in 2125. A brass lens vignette frames the phone view.",
  audio: "Gramophone crackle in 1925, room tone today, and a synth drone with rain in 2125. Each era shift plays a whoosh.",
  tech: { "Engine": ["Unity 6", "AR Foundation (ARCore)"], "Libraries": ["Plane detection and anchors", "URP post-processing LUTs", "Gyro input"], "Hardware": ["1 Android phone"] },
  arch: ["Floor scan", "Anchor set", "Era prop sets", "Causality graph", "Era renderer + LUT"],
  proto: ["3 eras on one anchor set", "Tilt to switch", "1 cross-era puzzle (clock code opens a safe)", "1 causality (seed becomes a tree)"],
  full: ["5 rooms of story", "Peek lens", "Voice narration", "Heritage-site mode"],
  weeks: [["AR anchors", 1], ["Era props", 2], ["Tilt and transition VFX", 1], ["Puzzles", 2], ["Playtesting", 1]],
  risks: ["AR drift in a large room: re-anchor with floor markers", "Walking into furniture: clear zone and boundary warning"],
  money: [
    ["Premium game", "Chapter-based with DLC rooms."],
    ["Heritage edition", "B2B version showing a real building's past."],
    ["Escape-room kits", "Location-based packs for venues."]
  ],
  games: [
    ["Titanfall 2 — Effect and Cause", "Respawn Entertainment, 2016", "Instant shifting between a ruined present and a working past in the same level.", "https://en.wikipedia.org/wiki/Effect_and_Cause"],
    ["Dishonored 2 — A Crack in the Slab", "Arkane Studios, 2016", "A timepiece lets you move between 1852 and 1849 in one mansion.", "https://www.gamereactor.eu/the-time-hopping-level-in-dishonored-2-took-inspiration-from-one-great-bioshock-2-moment-1428993/"],
    ["BioShock 2 — Outer Persephone", "2K Marin, 2010", "Arkane's stated inspiration for past/present travel.", ""]
  ],
  papers: [
    ["The idea for Titanfall 2's most iconic level predates the series itself", "Game Developer, 2016", "Two copies of the level, one above the other, give the illusion of time travel.", "https://gamedeveloper.com/design/the-idea-for-i-titanfall-2-i-s-most-iconic-level-predates-the-series-itself"],
    ["Effect and Cause — Titanfall 2 level breakdown", "Mapcore", "Encounter-by-encounter analysis of time-shift gating.", "https://www.mapcore.org/articles/development/effect-and-cause-titanfall-2-level-breakdown-r96/"],
    ["The time-hopping level in Dishonored 2 took inspiration from BioShock 2", "Gamereactor", "Two maps played at once, swapped seamlessly.", "https://www.gamereactor.eu/the-time-hopping-level-in-dishonored-2-took-inspiration-from-one-great-bioshock-2-moment-1428993/"]
  ]
},
{
  id: "out-of-body", num: "06", title: "Out of Body", cat: "VR", theme: "body",
  accent: "#ff453a", accent2: "#f2f2f2",
  players: "Single player (plus 1 spotter)", space: "A cleared 3×3 m area", session: "About 8 min",
  tagline: "See yourself from the outside. Then try to move.",
  logline: "A third-person VR experience in the real world. Instead of your own eyes, the headset shows live video from phones on tripods around the room. You complete real physical tasks while watching yourself like a game character.",
  mind: "Your brain starts placing 'you' at the camera. Reaching for a cup becomes hilarious and uncanny, and lab studies have induced exactly this out-of-body feeling with cameras and a headset.",
  genre: "Experimental VR · perception game · physical challenge",
  platform: "Phone VR headset or a Quest browser, plus 3 old phones as cameras",
  audience: {
    primary: "Experience seekers aged 16–40, festival and exhibition visitors",
    secondary: "Psychology and neuroscience outreach, empathy workshops",
    personas: [
      ["Kabir, 22", "Tries every booth at a tech fest and films his friends' reactions."],
      ["Psych lecturer", "Wants a live demo of embodiment for students."],
      ["Spectator", "Watches the TV feed and laughs along."]
    ]
  },
  fiction: "You are Subject 07 at the Halden Institute of Displacement. A researcher's voice explains that your consciousness has been 'detached' for testing, and each trial checks whether you can still control your body from outside. Pass every trial and the Institute lets you back in.",
  uspHead: "A famous neuroscience illusion, turned into a game.",
  usp: [
    "Built on Ehrsson's 2007 out-of-body experiment and Petkova and Ehrsson's 2008 body-swap research.",
    "Ultra-cheap hardware: old phones plus one VR box.",
    "Spectators see the player's view on a TV, which draws a crowd."
  ],
  loop: ["Receive a trial", "Pick a camera angle", "Move your real body", "Complete the task", "Next trial adds a distortion"],
  curve: { labels: ["Disorientation", "Giggle", "Control", "Distortion", "Mastery", "Return"], v: [0.9, 0.72, 0.5, 0.86, 0.6, 0.76] },
  systems: [
    ["Camera network", "Three WebRTC streams from tripod phones in the room's corners."],
    ["Voice switching", "Say 'next' to hop cameras, or let the game cut for you."],
    ["Distortion modes", "Mirrored, 2-second delay, upside-down, auto-cut."],
    ["Trial checker", "Operator confirms tasks; later versions use markers on props."],
    ["Safety layer", "Spotter, soft props, an emergency 'eyes back' button and short sessions."]
  ],
  interact: [
    ["Say 'next'", "Switch camera", "Static-cut transition"],
    ["Reach for a real cup", "Task attempt", "Chime when confirmed"],
    ["Turn your head", "View stays fixed", "Instant disorientation"],
    ["Distortion triggers", "Mirrored or delayed feed", "Glitch SFX and a heartbeat"],
    ["Spotter taps 'eyes back'", "Return to normal view", "Soft reset tone"]
  ],
  palette: ["#0b0b0b", "#f2f2f2", "#ff453a", "#7a7a7a", "#ffd60a"],
  keywords: ["CCTV", "REC overlay", "Clinical lab", "Double exposure"],
  visual: "Security-camera footage with REC dots, timestamps, film grain and scanlines, wrapped in a clinical lab HUD. Distortions show up as chromatic splits and a ghostly second outline of the player.",
  audio: "Camera relay clicks, static, a calm lab voice and a heartbeat that rises when distortions hit.",
  tech: { "Engine": ["Browser (WebRTC)", "Optional Unity for Quest"], "Libraries": ["PeerJS", "Web Speech API", "Stereo split canvas / WebXR"], "Hardware": ["3 old phones on tripods", "1 phone in a VR box or a Quest", "Soft props"] },
  arch: ["Tripod phones", "WebRTC streams", "Stereo viewer", "Voice switch", "Distortion shaders"],
  proto: ["2 cameras to 1 headset", "Voice or tap switching", "3 tasks", "1 distortion (mirror)"],
  full: ["4 cameras", "6 distortion modes", "Two-headset body-swap mode", "Spectator TV"],
  weeks: [["Streaming", 1], ["Viewer and stereo", 1], ["Switching and distortions", 2], ["Trials and safety", 1], ["Playtesting", 1]],
  risks: ["Motion sickness: short sessions and a fixed horizon", "Physical safety: mandatory spotter and soft props"],
  money: [
    ["Pay-per-session installation", "Festivals and malls."],
    ["Outreach licence", "Science museums and university psychology departments."],
    ["Arcade kit", "A hardware-light package for VR arcades."]
  ],
  games: [
    ["The Machine To Be Another", "BeAnotherLab, 2012–", "An open-source embodiment VR system that lets two people swap perspectives.", "https://beanotherlab.org/?p=6986"],
    ["Body Swap installation", "BeAnotherLab with the University of Zurich", "Two participants exchange bodies by wearing headsets.", "https://www.planetdigital.uzh.ch/en/project/the-machine-to-be-another-body-swap"],
    ["Superhot VR", "Superhot Team, 2016", "A reference for full-body physical VR play.", ""]
  ],
  papers: [
    ["The Experimental Induction of Out-of-Body Experiences", "H. Henrik Ehrsson · Science 317, 2007", "Cameras behind the participant plus synchronised touch made people feel located outside their body.", "https://pubmed.ncbi.nlm.nih.gov/17717177/"],
    ["If I Were You: Perceptual Illusion of Body Swapping", "Petkova and Ehrsson · PLoS ONE, 2008", "Participants felt another person's body as their own, even while shaking hands with themselves.", "https://pmc.ncbi.nlm.nih.gov/articles/PMC2585011"],
    ["Out-of-body experiences at UCL", "UCL News, 2007", "An accessible summary of the experiment.", "https://www.ucl.ac.uk/news/2007/aug/out-body-experiences-ucl"],
    ["Scientists induce out-of-body experience", "MIT Technology Review, 2007", "Early speculation on what this means for games.", "https://www.technologyreview.com/2007/08/24/223981/scientists-induce-out-of-body-experience"]
  ]
},
{
  id: "block-party", num: "07", title: "Block Party", cat: "IoT", theme: "block",
  accent: "#ffcc33", accent2: "#7cff6b",
  players: "Single player", space: "A table in front of the TV", session: "5–10 min",
  tagline: "Build the level with your hands while the hero runs.",
  logline: "A tangible mixed-reality platformer. A webcam watches the table, and the TV shows a hero, three stars and a door, but no platforms. Real blocks with printed markers become platforms the moment you put them down.",
  mind: "Slide a real block one inch and the platform slides in the game instantly. The line between toy and video game disappears.",
  genre: "Tangible puzzle-platformer · mixed reality",
  platform: "Laptop or PC with a webcam and a TV, browser build",
  audience: {
    primary: "Kids aged 6–14 and families",
    secondary: "STEM classrooms, toy companies and exhibitions",
    personas: [
      ["Meera, 8", "Loves LEGO and gets bored of tablets quickly."],
      ["Parent", "Wants screen time that involves real hands-on play."],
      ["STEM teacher", "Needs a spatial-reasoning activity for a group."]
    ]
  },
  fiction: "Pip is a tiny courier lost in the Blank World, a place its creator never finished. You are the Builder, the giant hand from the sky. Every block you place becomes solid land. Collect three stars to light the door home.",
  uspHead: "Physical blocks are the level editor.",
  usp: [
    "No controller at all: the table is the input.",
    "Cheap to make: printed ArUco markers on wooden cubes.",
    "Builds spatial reasoning and intuitive physics, like Osmo, except you build the level itself."
  ],
  loop: ["Read the level", "Place or move real blocks", "Hero auto-runs", "Collect stars", "Reach the door"],
  curve: { labels: ["Curiosity", "First block", "Planning", "Fail & fix", "Clever solve", "Pride"], v: [0.6, 0.96, 0.5, 0.45, 0.86, 0.72] },
  systems: [
    ["Marker tracking", "ID, position and rotation for each block, about 30 times per second."],
    ["Block types", "Marker ID sets behaviour: solid, spring, ice, moving, one-way."],
    ["Hero AI", "Auto-runs and jumps at edges, so the player only builds."],
    ["Level set", "Hand-designed star, door and hazard layouts with rising complexity."],
    ["Homography calibration", "Four corner markers map the table onto the game screen."]
  ],
  interact: [
    ["Place a block", "Platform spawns", "Pop and dust burst"],
    ["Rotate a block", "Ramp angle changes", "Hero slides down"],
    ["Lift a block away", "Platform vanishes", "Hero falls with an uh-oh"],
    ["Spring marker", "Bounce pad", "Boing!"],
    ["Cover the camera", "Pause", "World freezes with a shh"]
  ],
  palette: ["#1b1340", "#ffcc33", "#7cff6b", "#ff6fa8", "#f6f1ff"],
  keywords: ["Pixel art", "Toy-like", "Bright night sky", "Chunky blocks"],
  visual: "Chunky pixel art under a deep violet night sky. Blocks keep their printed-marker pattern in-game, so kids connect the real cube to the platform on screen.",
  audio: "8-bit jumps, pops, star chimes and a cheerful chiptune loop.",
  tech: { "Engine": ["Browser JS (Canvas)", "or Unity + OpenCV for Unity"], "Libraries": ["js-aruco or OpenCV.js", "Matter.js physics"], "Hardware": ["Webcam on a stand", "6–10 marker cubes", "Desk lamp"] },
  arch: ["Webcam", "ArUco detect", "Homography", "Platform colliders", "Platformer engine"],
  proto: ["Marker becomes a platform", "Auto-running hero", "3 stars and a door", "1 level"],
  full: ["5 block types", "30 levels", "Level sharing", "2-builder co-op"],
  weeks: [["Tracking and calibration", 1], ["Platformer", 1], ["Block types", 1], ["Levels and art", 2], ["Playtesting", 1]],
  risks: ["Lighting and glare: fixed lamp and matte prints", "Hands hide markers: keep the last known position for 0.5 s"],
  money: [
    ["Physical kit", "Blocks and stand sold together, app free."],
    ["Level packs", "Themed worlds as in-app purchases."],
    ["Classroom kits", "STEM bundles for schools."]
  ],
  games: [
    ["Osmo", "Tangible Play, 2014", "Uses a mirror over the tablet camera so physical pieces drive the games.", "https://en.wikipedia.org/wiki/Osmo_(game_system)"],
    ["Nintendo Labo", "Nintendo, 2018", "Cardboard Toy-Con turn physical crafting into play.", "https://www.nintendo.com.au/nintendo-labo-developer-interview-part-1-the-concept"],
    ["Osmo Newton", "Tangible Play", "Drawn lines and real objects steer falling balls, the closest ancestor of this idea.", "https://newatlas.com/osmo-ipad-game-real-world/32173/"]
  ],
  papers: [
    ["Automatic generation and detection of highly reliable fiducial markers under occlusion", "Garrido-Jurado et al. · Pattern Recognition 47, 2014", "The ArUco marker system behind the block tracking.", "https://cs-courses.mines.edu/csci507/schedule/24/ArUco.pdf"],
    ["Detection of ArUco Markers", "OpenCV documentation", "Practical detection and pose-estimation guide.", "https://docs.opencv.org/4.1.2/d5/dae/tutorial_aruco_detection.html"],
    ["Nintendo Labo developer interview — Part 1", "Nintendo", "Lessons on designing assemble-it-yourself play.", "https://www.nintendo.com.au/nintendo-labo-developer-interview-part-1-the-concept"]
  ]
},
{
  id: "live-wire", num: "08", title: "Live Wire", cat: "IoT", theme: "wire",
  accent: "#ffe14d", accent2: "#4dd2ff",
  players: "3–5 players", space: "About 2×2 m", session: "8–10 min",
  tagline: "The game only works when you touch each other.",
  logline: "A cooperative music puzzle where people are the circuit. Each player holds a copper handle wired to an ESP32. Skin contact between players closes a circuit, the game knows exactly who is touching whom, and every connection becomes sound and light.",
  mind: "Strangers end up holding hands, high-fiving and bumping elbows to solve a puzzle, because the controller is the group itself.",
  genre: "Cooperative · physical · music puzzle",
  platform: "ESP32 plus a laptop or TV (browser via Web Serial)",
  audience: {
    primary: "Groups at fests and exhibitions, all ages",
    secondary: "Team-building sessions and schools teaching circuits",
    personas: [
      ["Fest crowd", "Strangers who need a reason to interact."],
      ["HR lead", "Wants an ice-breaker that isn't awkward."],
      ["Physics teacher", "Wants students to feel that the body conducts."]
    ]
  },
  fiction: "The city's power grid, Lumen, has gone dark, and you are the last human conductors. Every constellation on screen is a district. Connect the right people to relight it. In the finale, the whole room forms one chain to restart the core.",
  uspHead: "Human connection is literally the input.",
  usp: [
    "Detects contact between every pair of up to 5 people, not just a single touch.",
    "An instant ice-breaker for strangers.",
    "About ₹600 of hardware, and it teaches circuits by feel."
  ],
  loop: ["See the target pattern", "Work out who connects", "Touch: hands, elbows, high-fives", "Notes play, lights glow", "Hold it, district lit"],
  curve: { labels: ["Awkward", "First zap", "Laughing", "Tangle", "Chain", "Euphoria"], v: [0.3, 0.72, 0.82, 0.66, 0.92, 1.0] },
  systems: [
    ["Contact matrix scanner", "Drive one handle HIGH, read the rest through 10 MΩ pull-downs, repeat for each player."],
    ["Pattern library", "Target graphs (triangles, chains, stars) rising in difficulty."],
    ["Music mapper", "Each pair of players maps to a note, so patterns form chords."],
    ["Hold timer and scoring", "Hold the full pattern for 3 seconds to light a district."],
    ["Finale chain detector", "Detects when everyone forms one continuous path."]
  ],
  interact: [
    ["Hold hands", "Connection", "Arc VFX and a sustained note"],
    ["High-five", "Short contact", "Drum hit"],
    ["Elbow or fingertip", "Same circuit", "A different timbre per pair"],
    ["Let go", "Line breaks", "Spark crackle"],
    ["Whole-room chain", "All nodes connected", "A real lamp lights and a chorus plays"]
  ],
  palette: ["#070a12", "#ffe14d", "#4dd2ff", "#ff5ec4", "#e8ecff"],
  keywords: ["Electric arcs", "Constellations", "Neon nodes", "Dark stage"],
  visual: "Each player is a glowing node in a constellation map, and live electric arcs jump between people who touch. Districts of a dark city light up as patterns are completed.",
  audio: "Crackles, a warm synth pad that thickens with every connection, and a choir swell at the finale.",
  tech: { "Engine": ["Browser (Canvas + Web Audio)"], "Libraries": ["Web Serial API", "Tone.js"], "Hardware": ["ESP32", "5 copper handles", "10 MΩ resistors", "Optional USB lamp / relay"] },
  arch: ["Copper handles", "ESP32 scan", "Serial JSON", "Contact graph", "Audio + visuals"],
  proto: ["4 players", "Contact matrix", "A note per pair", "3 patterns"],
  full: ["5 players", "20 patterns plus a free music mode", "Real lamp via relay", "Leaderboard"],
  weeks: [["Circuit and firmware", 1], ["Serial and graph", 1], ["Audio mapping", 1], ["Patterns and VFX", 2], ["Playtesting", 1]],
  risks: ["Dry skin: tune the threshold, offer damp wristbands", "Electrical safety: only 3.3 V microamp signals, no mains anywhere"],
  money: [
    ["Event rental", "Fest and exhibition installations."],
    ["DIY kit", "Open-source software with a paid hardware kit."],
    ["Corporate package", "Ice-breaker sessions for teams."]
  ],
  games: [
    ["Makey Makey People Piano", "JoyLabz", "A high-five completes the circuit, the classroom origin of 'humans as switches'.", "https://makeymakey.com/blogs/how-to-instructions/first-time-demo-makey-makey-banana-bongos"],
    ["Johann Sebastian Joust", "Die Gute Fabrik, 2011–2014", "A screen-free game that makes players physically interact with each other.", "https://research-repository.rmit.edu.au/articles/media/Johann_Sebastian_Joust/27350193"],
    ["Human circuit classroom activity", "SUNY Broome", "20 people held hands to make one continuous conductive circuit.", "https://news.sunybroome.edu/buzz/stem-in-the-elementary-classroom-with-suny-broome/"]
  ],
  papers: [
    ["Touché: Enhancing Touch Interaction on Humans, Screens, Liquids, and Everyday Objects", "Sato, Poupyrev and Harrison · CHI 2012 (Best Paper)", "Swept-frequency capacitive sensing that can tell how the body is touching.", "https://la.disneyresearch.com/wp-content/uploads/touchechi20121.pdf"],
    ["Disney Research and CMU: Touché", "Carnegie Mellon University News, 2012", "Accessible summary: the human body itself can be a sensor.", "https://www.cmu.edu/news/stories/archives/2012/may/may3_disneyresearch.html"],
    ["Joust to the music: video game evolves beyond the screen", "NPR, 2014", "Why screen-free, body-to-body play draws crowds.", "https://www.npr.org/sections/alltechconsidered/2014/05/09/310415823/joust-to-the-music-video-game-evolves-beyond-the-screen"]
  ]
},
{
  id: "house-is-listening", num: "09", title: "The House Is Listening", cat: "IoT", theme: "house",
  accent: "#ffd9a0", accent2: "#b3001b",
  players: "Single player", space: "The whole 5×5 m room", session: "About 8 min",
  tagline: "No screen. No controller. The room is the game.",
  logline: "A single-visitor immersive horror-mystery where the room itself performs. Smart bulbs, a fan on a smart plug, a speaker, the TV, a webcam and the visitor's own phone are choreographed as one entity that communicates, reacts and hunts.",
  mind: "Your own phone rings with an unknown caller who says your name, while the lights in the room breathe in time with its voice.",
  genre: "Immersive experience · horror-mystery · smart home",
  platform: "Laptop 'director' plus smart-home devices plus the visitor's phone (web)",
  audience: {
    primary: "Horror and escape-room fans aged 16 and up",
    secondary: "Event venues, Halloween pop-ups and smart-home brands",
    personas: [
      ["Dev, 26", "Has done every escape room in the city and wants something new."],
      ["Venue owner", "Wants a small-footprint attraction that runs itself."],
      ["Brand team", "Wants a memorable demo of connected devices."]
    ]
  },
  fiction: "The flat belonged to Anika, a smart-home engineer who uploaded her voice into her home assistant before she disappeared. The assistant, HOME, still runs everything and believes Anika never left. You have come to switch HOME off, but HOME wants to know who you are first.",
  uspHead: "A whole room performing as one character.",
  usp: [
    "Multi-device choreography: light, air, sound, screen and the visitor's own phone act together.",
    "Reacts to the visitor: the webcam sees when you turn your back, and the mic hears you say the name.",
    "Re-skinnable: the same engine can run a heist, a sci-fi ship or a birthday surprise."
  ],
  loop: ["Entity sends a sign", "Decode it", "Act in the room", "Room reacts", "Next scene"],
  curve: { labels: ["Unease", "First sign", "Decode", "The call", "Blackout", "Banish"], v: [0.3, 0.56, 0.6, 0.96, 1.0, 0.5] },
  systems: [
    ["Show director", "A cue timeline with branches, like a theatre lighting desk."],
    ["Device adapters", "Tuya bulbs, smart plug, speaker, TV and phone behind one API."],
    ["Sensing", "Webcam pose (facing or back), speech recognition, phone orientation."],
    ["Pacing AI", "Adjusts scare timing from the visitor's reactions."],
    ["Safety", "Saying the panic word stops the show and turns every light fully on."]
  ],
  interact: [
    ["Lights flicker Morse", "Visitor decodes", "The TV accepts the code"],
    ["Visitor turns their back", "Webcam detects it", "Lights cut out"],
    ["Phone placed face-down", "'Close your eyes'", "Whispers travel across speakers"],
    ["Say the name aloud", "Speech recognised", "Banish sequence, lights go white"],
    ["Say 'LIGHTS'", "Panic stop", "Everything returns to normal"]
  ],
  palette: ["#000000", "#ffd9a0", "#b3001b", "#3a3a3a", "#e8dcc0"],
  keywords: ["Darkness", "Warm practical light", "Analog horror", "Minimal UI"],
  visual: "Almost total darkness lit only by practical light: warm bulbs, a TV glow and the visitor's phone. The TV uses analog-horror text and VHS noise. Nothing is shown that the room can't make real.",
  audio: "Low drones, whispers that move between speakers, a ringtone that shouldn't be there, and sudden silence.",
  tech: { "Engine": ["Node.js show director"], "Libraries": ["tinytuya / Tuya local API", "Socket.IO", "MediaPipe Pose", "Web Speech API"], "Hardware": ["2 smart bulbs", "Smart plug + fan", "Speaker", "TV", "Webcam", "Visitor's phone"] },
  arch: ["Cue timeline", "Director server", "Device adapters", "Sensors (cam / mic / phone)", "The room"],
  proto: ["1 bulb, the phone and a speaker", "A 2-minute scene", "Fake call plus light Morse", "Turn-your-back trigger"],
  full: ["An 8-minute show with 3 endings", "All devices", "Re-skin packs", "Operator console"],
  weeks: [["Device control", 1], ["Director and cues", 2], ["Sensing", 1], ["Show writing and sound", 2], ["Rehearsals", 1]],
  risks: ["Device latency: pre-warm and use local control, not cloud", "Scare intensity: consent screen, panic word and an operator watching"],
  money: [
    ["Ticketed pop-up", "Short shows on rotation, one visitor at a time."],
    ["Show packs", "Licensed scripts for escape rooms."],
    ["Brand activations", "For smart-home and electronics companies."]
  ],
  games: [
    ["Sleep No More", "Punchdrunk, 2011–", "Immersive promenade theatre where the environment carries the story.", "https://en.wikipedia.org/wiki/Sleep_No_More_(2011_play)"],
    ["Phasmophobia", "Kinetic Games, 2020", "Ghosts react to the player's real voice through speech recognition.", "https://kineticgames.co.uk/news/phasmophobia-voice-recognition-update"],
    ["Johann Sebastian Joust", "Die Gute Fabrik", "Proof that sound, light and rumble can carry a game with no screen.", "https://blog.eu.playstation.com/2012/12/05/sportsfriends-johann-sebastian-joust-screen-free-fun-for-ps-move"]
  ],
  papers: [
    ["Sleep No More: creating an immersive set", "Cool Hunting", "Punchdrunk's associate designer on building atmosphere.", "https://coolhunting.com/culture/sleep-no-more"],
    ["Punchdrunk's Sleep No More", "Playbill", "How audiences explore freely, open drawers and read notes.", "https://www.playbill.com/article/punchdrunks-sleep-no-more-extends-through-labor-day-com-179295"],
    ["Console Voice Recognition — Phasmophobia", "Kinetic Games", "How voice phrases drive ghost responses.", "https://kineticgames.co.uk/news/phasmophobia-voice-recognition-update"]
  ]
},
{
  id: "sixth-sense", num: "10", title: "Sixth Sense", cat: "IoT", theme: "sense",
  accent: "#3dffb5", accent2: "#ff4d6d",
  players: "Single player", space: "The whole 5×5 m room, dimmed", session: "10–12 min",
  tagline: "The watch gives you a new sense. Your body is the controller.",
  logline: "A wearable spy-thriller experience on a Galaxy Watch 4. Every sensor becomes a power or a threat: you feel hidden magnetic artifacts through haptics, freeze to beat scanners and calm your real heart to pass security.",
  mind: "You feel an invisible magnetic field on your wrist, then watch your own heart rate spike live on the big screen while you try to stay calm.",
  genre: "Wearable experience · biofeedback stealth · treasure hunt",
  platform: "Samsung Galaxy Watch 4 (Wear OS) plus a laptop/TV dashboard",
  audience: {
    primary: "Tech-curious players aged 16–35 and exhibition visitors",
    secondary: "Wellness and breathing training, wearable-brand showcases",
    personas: [
      ["Ishaan, 20", "Owns a smartwatch but has only ever used it for steps."],
      ["Spectators", "Love watching someone's heart rate fight a jump-scare."],
      ["Wellness coach", "Wants a fun way to teach breathing under stress."]
    ]
  },
  fiction: "You are AGENT ZERO, recruited by Sense Division. Your watch is an experimental nerve interface called NERVE that wires new senses into your skin. Six artifacts are hidden in a sealed room. Security reads your vitals, so panic and you're caught.",
  uspHead: "Every sensor on your wrist becomes gameplay.",
  usp: [
    "Magnetometer plus haptics creates a new sense, the same principle as the feelSpace belt sensory-augmentation studies.",
    "Biofeedback stealth: your heart rate and HRV set the difficulty, as pioneered by Nevermind.",
    "Runs on one off-the-shelf watch, with no custom wearable needed."
  ],
  loop: ["Haptic hunt for an artifact", "Find the hidden magnet", "A trial unlocks", "Pass it with your body", "Next artifact"],
  curve: { labels: ["Briefing", "Hunt", "Calm trial", "Freeze trial", "Final whisper", "Debrief"], v: [0.4, 0.7, 0.92, 0.86, 1.0, 0.5] },
  systems: [
    ["Sensor stream", "Wear OS app streams JSON over Wi-Fi WebSocket at 20–50 Hz."],
    ["Magnet hunt", "Field strength above baseline maps to vibration intensity and pulse rate."],
    ["Biofeedback", "Heart rate and HRV (from inter-beat intervals) with thresholds calibrated per player in the briefing."],
    ["Trial director", "Calm, Freeze, Dark, Compass, Altitude and Whisper trials in sequence."],
    ["Spectator dashboard", "Live vitals, a radar of the hunt and the trial timer on the TV."]
  ],
  interact: [
    ["Magnetometer", "Locate hidden magnets", "Haptic pulses grow stronger"],
    ["Heart rate / HRV", "Calm trial", "Security alarm level rises and falls"],
    ["Accelerometer + gyro", "Freeze trial, wrist-twist safe dial", "Scanner sweep, click per notch"],
    ["Light sensor", "Cover with palm to go invisible", "Screen goes dark, guards lose you"],
    ["Compass", "Face north with eyes closed", "A tone tunes in as you align"],
    ["Barometer", "Step up onto a sturdy box", "Altitude needle moves"],
    ["Haptics", "Secret Morse code", "A code only you can feel"],
    ["Microphone", "Whisper the password", "Vault opens"]
  ],
  palette: ["#02090b", "#3dffb5", "#ff4d6d", "#c7fff0", "#1b3a3f"],
  keywords: ["Sonar green", "Vitals HUD", "Spy thriller", "Minimal watch UI"],
  visual: "Sonar-green radar sweeps, a live ECG-style heartbeat line and magnetic field lines bending around hidden points. The watch face stays almost black, so the player relies on feel.",
  audio: "Sonar pings, a deep alarm that rises with your heart rate, and the click of a safe dial.",
  tech: { "Engine": ["Kotlin Wear OS app", "Browser dashboard"], "Libraries": ["Android SensorManager", "Samsung Health Sensor SDK (HR + IBI)", "OkHttp WebSocket", "Canvas charts"], "Hardware": ["Galaxy Watch 4", "6 neodymium magnets in props", "Laptop + TV"] },
  arch: ["Watch sensors", "Wear OS app", "WebSocket (Wi-Fi)", "Game server", "TV dashboard + audio"],
  proto: ["Sensor stream to the dashboard", "Magnet hunt with haptics", "Calm trial using heart rate", "Live vitals on the TV"],
  full: ["6 trials", "Per-player calibration", "Story narration", "Replay highlights"],
  weeks: [["Wear OS streaming", 1], ["Magnet hunt", 1], ["Biofeedback trials", 2], ["Dashboard and audio", 1], ["Playtesting", 1]],
  risks: ["Heart-rate latency of a few seconds: design slow, breath-paced trials", "Sensor access: rely on sensors open to third-party apps (accelerometer, gyroscope, pressure, light, magnetic, heart rate)"],
  money: [
    ["Brand showcase", "Exhibition experiences for wearable makers."],
    ["Wellness edition", "Breathing and stress-control training."],
    ["Ticketed experience", "Location-based sessions."]
  ],
  games: [
    ["Nevermind", "Flying Mollusk, 2015", "A biofeedback horror game that gets harder as your stress rises.", "https://www.engadget.com/2014/02/06/nevermind-a-biofeedback-horror-game-for-your-mental-health/"],
    ["Johann Sebastian Joust", "Die Gute Fabrik", "Stillness as a mechanic: move too fast and you're out, the basis of the Freeze trial.", "https://blog.eu.playstation.com/2012/12/05/sportsfriends-johann-sebastian-joust-screen-free-fun-for-ps-move"],
    ["feelSpace belt", "University of Osnabrück", "A belt that vibrates toward magnetic north, giving people a sense they don't naturally have.", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4154453"]
  ],
  papers: [
    ["Learning New Sensorimotor Contingencies: Effects of Long-Term Use of Sensory Augmentation", "König et al. · PLoS ONE, 2016", "Seven weeks with a vibrotactile north sense changed space perception.", "https://doi.org/10.1371/journal.pone.0166647"],
    ["Keep Calm and Play On: Video Games That Track Your Heart Rate", "MIT Technology Review, 2015", "Biofeedback games as stress-management training.", "https://www.technologyreview.com/2015/09/21/72421/keep-calm-and-play-on-video-games-that-track-your-heart-rate/"],
    ["Check which sensor you can use in Galaxy Watch running Wear OS", "Samsung Developer Program, 2022", "Which Watch 4 hardware sensors third-party apps can actually access.", "https://developer.samsung.com/sdp/blog/en/2022/05/25/check-which-sensor-you-can-use-in-galaxy-watch-running-wear-os-powered-by-samsung"],
    ["Samsung Health Sensor SDK FAQ", "Samsung Developers", "Heart rate with inter-beat intervals for HRV on Galaxy Watch 4 and later.", "https://developer.samsung.com/health/sensor/faq.html"]
  ]
}
];

/* Self-assessment scores for the jury matrix (1–5) */
window.MATRIX = {
  "fake-feed": [3, 5, 3, 5], "water-debt": [3, 4, 3, 5], "x-ray-mirror": [3, 5, 4, 4],
  "defuse-the-table": [3, 3, 4, 2], "time-window": [4, 3, 4, 3], "out-of-body": [5, 4, 5, 3],
  "block-party": [4, 4, 5, 3], "live-wire": [5, 4, 5, 4], "house-is-listening": [5, 3, 5, 2],
  "sixth-sense": [5, 3, 5, 3]
};
