window.TRIP_DATA = {
  dates: {
    depart: "2026-07-31T08:00:00-05:00",
    arriveIsland: "2026-08-01T17:00:00-04:00",
    departIsland: "2026-08-08T09:00:00-04:00",
    complete: "2026-08-09T21:00:00-05:00"
  },
  route: {
    totalOutboundMiles: 1065,
    totalReturnMiles: 1065,
    finalPublicLabel: "Bois Blanc Island home base",
    coordinates: {
      start: { lat: 38.8814, lon: -94.8191 },
      columbia: { lat: 38.9517, lon: -92.3341 },
      stLouis: { lat: 38.6270, lon: -90.1994 },
      indianapolis: { lat: 39.7684, lon: -86.1581 },
      southBend: { lat: 41.6764, lon: -86.2520 },
      grandRapids: { lat: 42.9634, lon: -85.6681 },
      grayling: { lat: 44.6614, lon: -84.7148 },
      cheboygan: { lat: 45.6469, lon: -84.4745 },
      islandApprox: { lat: 45.7465, lon: -84.4948 }
    },
    destinationTargets: {
      southBend: { label: "South Bend dinner stop", lat: 41.6764, lon: -86.2520, plannedMiles: 575 },
      cheboygan: { label: "Plaunt ferry in Cheboygan", lat: 45.6469, lon: -84.4745, plannedMiles: 460 },
      island: { label: "Bois Blanc Island home base", lat: 45.7465, lon: -84.4948, plannedMiles: 1065 },
      home: { label: "home in Olathe", lat: 38.8814, lon: -94.8191, plannedMiles: 1065 }
    },
    mapStops: [
      { id: "olathe", label: "Olathe", lat: 38.8814, lon: -94.8191, type: "start" },
      { id: "columbia", label: "Columbia", lat: 38.9517, lon: -92.3341, type: "route" },
      { id: "st-louis", label: "St. Louis", lat: 38.6270, lon: -90.1994, type: "route" },
      { id: "indianapolis", label: "Indianapolis", lat: 39.7684, lon: -86.1581, type: "route" },
      { id: "south-bend", label: "South Bend", lat: 41.6764, lon: -86.2520, type: "overnight" },
      { id: "grand-rapids", label: "Grand Rapids", lat: 42.9634, lon: -85.6681, type: "route" },
      { id: "grayling", label: "Grayling", lat: 44.6614, lon: -84.7148, type: "route" },
      { id: "cheboygan", label: "Cheboygan", lat: 45.6469, lon: -84.4745, type: "ferry" },
      { id: "bois-blanc", label: "Bois Blanc", lat: 45.7465, lon: -84.4948, type: "arrival" }
    ],
    stops: [
      { id: "olathe", name: "Olathe, Kansas", milesFromStart: 0, type: "start" },
      { id: "south-bend", name: "South Bend dinner / overnight", milesFromStart: 575, type: "dinner" },
      { id: "cheboygan", name: "Plaunt Transportation, Cheboygan", milesFromStart: 1035, type: "ferry" },
      { id: "island", name: "Bois Blanc Island", milesFromStart: 1065, type: "arrival" }
    ],
    restStops: [
      { date: "2026-07-31", name: "Mid-Missouri travel center window", segment: "Olathe to Columbia / St. Louis corridor", timing: "3.5-4.5 hours after departure", confidence: "High", note: "Bathroom, gas, stretch, and snack stop before the long Illinois/Indiana push." },
      { date: "2026-07-31", name: "Light lunch window", segment: "Missouri or Illinois, on route", timing: "Late morning to early afternoon", confidence: "Medium", note: "Keep lunch lighter so dinner in South Bend still feels worth it." },
      { date: "2026-07-31", name: "Dinner target", segment: "South Bend, Indiana", timing: "Evening July 31", confidence: "Goal", note: "Primary day-one food target. Do not replace with a late heavy stop unless needed." },
      { date: "2026-08-01", name: "Northern Michigan top-off", segment: "Grand Rapids / Grayling / Cheboygan corridor", timing: "Before reaching Plaunt Transportation", confidence: "High", note: "Gas, restroom, snacks, and ferry buffer before boarding." },
      { date: "2026-08-08", name: "Return first mainland reset", segment: "Cheboygan after ferry", timing: "Immediately after returning to the mainland", confidence: "High", note: "Bathroom, fuel, food, and route choice before the long drive home." },
      { date: "2026-08-08", name: "Return 4-hour window", segment: "Michigan / Indiana return corridor", timing: "Every 4-5 hours while returning", confidence: "Medium", note: "Use only while the return phase is active." }
    ]
  },
  profiles: [
    {
      id: "elsie",
      name: "Elsie",
      age: 14,
      lens: "Facts, suspense, teaching moments, anime-adjacent story hooks, squirrels and small animals.",
      prompts: ["What would make this easy to explain to kindergarteners?", "What is the eerie but not-too-scary version of this place?", "Which small animal could live here?"],
      parentNote: "Elsie's view should stay fact-forward and suspense-light. Keep ferry timing with adults; give her animal, story, and teachable detail instead.",
      routeInterests: [
        "Suspense-light stops: shipwreck stories, old buildings, eerie-but-safe local legends, and unusual museums.",
        "Small-animal lookout: squirrels, chipmunks, birds, shoreline tracks, and places where habitat explains behavior.",
        "Teacher lens: quick facts she could explain to younger kids after the stop."
      ],
      islandInterests: [
        "Small-animal and shoreline observation walk",
        "Spooky-but-not-scary Great Lakes story card",
        "Kindergarten-teacher challenge: explain the ferry, forest, or stars simply"
      ],
      tags: ["suspense", "facts", "animals", "teaching", "shipwrecks"],
      accent: "#5b4aa0",
      suppressFerryLogistics: true
    },
    {
      id: "katrina",
      name: "Katrina",
      age: 12,
      lens: "Smart tidbits, historical fiction, hidden facts, why questions, and quiz-the-car energy.",
      prompts: ["What is the fact nobody else knows yet?", "What would it feel like to be here 100 years ago?", "What question should we ask next?"],
      parentNote: "Katrina likes to know the why and have the fact nobody else has yet. Give her extra context and a chance to quiz the car.",
      routeInterests: [
        "Historical-fiction stops: places where she can imagine a character living through the moment.",
        "Random-fact pullovers: markers, museums, older towns, and Great Lakes facts she can tell everyone.",
        "Why questions: what changed here, who decided it, and what would have happened otherwise."
      ],
      islandInterests: [
        "Island history mystery: who used this place and why?",
        "Tell-the-family fact hunt",
        "Historical-fiction prompt: write one paragraph from someone arriving by ferry"
      ],
      tags: ["history", "trivia", "why", "fiction", "timelines"],
      accent: "#a35d2d"
    },
    {
      id: "emma",
      name: "Emma Grace",
      age: 11,
      lens: "Big picture, real-life daily routines, sports, interaction, and why people go here.",
      prompts: ["Why would a real family come here?", "How do people live, work, or play here?", "What is the most interactive thing to do?"],
      parentNote: "Emma Grace needs the big picture and the everyday-life connection. Frame stops around interaction, sports, routines, and why people care.",
      routeInterests: [
        "Everyday-life stops: schools, stadiums, diners, ferries, factories, and places that show how people actually live.",
        "Sports angle: baseball fields, college towns, local teams, and places where a community gathers.",
        "Interaction-first stops: anything she can compare, choose, spot, or physically do."
      ],
      islandInterests: [
        "How island life works: ferry, school, store, mail, food, weather",
        "Sports or movement challenge: beach game, walk route, or family competition",
        "Big-picture map: how the island connects to Cheboygan and the Great Lakes"
      ],
      tags: ["daily life", "sports", "interactive", "big picture", "real world"],
      accent: "#1f78a4"
    },
    {
      id: "eliette",
      name: "Eliette",
      age: 11,
      lens: "Stories, hidden details, adventures, crafts, shiny things, souvenirs, and nicknacks.",
      prompts: ["What tiny treasure is hiding here?", "What is the story behind this thing?", "Could we find something handmade or shiny?"],
      parentNote: "Eliette responds to stories, details, small discoveries, crafts, shiny things, and souvenir/nicknack possibilities.",
      routeInterests: [
        "Hidden-detail stops: small shops, old downtowns, visitor centers, craft places, and unexpected local objects.",
        "Shiny/nicknack stops: souvenirs, stones, handmade items, postcards, stickers, and tiny keepsakes.",
        "Story stops: places with one interesting object or detail she can remember."
      ],
      islandInterests: [
        "Tiny treasure walk: shiny rocks, shells, textures, and legal keepsakes",
        "Nicknack/souvenir scouting",
        "Secret-detail story card: find one thing nobody noticed first"
      ],
      tags: ["stories", "crafts", "shiny", "shops", "hidden gems"],
      accent: "#b8892d"
    },
    {
      id: "jules",
      name: "Jules",
      age: 6,
      lens: "Captain choices, super gecko powers, dinosaurs, trucks, ferries, and why people did it.",
      prompts: ["Captain Jules, should we spot boats or big trucks first?", "What would a super gecko notice?", "Why did people build this?"],
      parentNote: "Jules does best when the plan feels like his idea. Offer two parent-approved choices and let him be the captain.",
      routeInterests: [
        "Big-machine stops: ferries, trucks, bridges, construction, boats, and anything with wheels or engines.",
        "Dinosaur/rock angle: fossils, rocks, old earth, museum displays, and why things were built.",
        "Captain choice stops: give him two options that are both acceptable."
      ],
      islandInterests: [
        "Captain Jules ferry/boat mission",
        "Super gecko spotting: climb, hide, stick, or spot",
        "Dino brain question: what is old, rocky, or huge here?"
      ],
      tags: ["captain", "dinosaurs", "trucks", "ferry", "choices"],
      accent: "#2f8a57"
    },
    {
      id: "momdad",
      name: "Mom and Dad",
      age: "adult",
      lens: "Full logistics, timing, costs, sources, restroom/gas reliability, safety, weather, and backup plans.",
      prompts: ["What is the detour cost?", "What is the safest clean-stop option?", "What is the backup if weather or ferry timing changes?"],
      parentNote: "Mom and Dad see the full operating layer: logistics, safety, timing, backups, and every child-specific rationale.",
      routeInterests: [
        "Use each child interest card to decide whether a stop is worth the time.",
        "Balance clean restroom/gas needs with one kid-specific highlight per travel segment.",
        "Keep adult logistics separate from kid excitement."
      ],
      islandInterests: [
        "Approve kid votes into the real plan",
        "Check weather, effort, supplies, and drive/ferry constraints",
        "Keep flexible backups"
      ],
      tags: ["logistics", "safety", "weather", "cost", "sources"],
      accent: "#163f33"
    }
  ],
  days: [
    { date: "2026-07-31", title: "Launch Day", mood: "Road-trip energy", outlook: "Track stop rhythm, protect the South Bend dinner goal, and bank fun facts along the route.", accent: "#1f4f3a" },
    { date: "2026-08-01", title: "Ferry and Arrival", mood: "South Bend to Cheboygan", outlook: "Morning road miles first, then Cheboygan timing, Plaunt ferry buffer, island orientation, first sunset and stars.", accent: "#236c8f" },
    { date: "2026-08-02", title: "Build Today's Adventure", mood: "Open island day", outlook: "No fixed plan. Vote on beaches, shops, local taste, slow exploring, or a low-energy backup.", accent: "#6c8a4b" },
    { date: "2026-08-03", title: "Stories and History", mood: "Great Lakes context", outlook: "Use history as a menu: ferry stories, island life, lighthouses, shipwrecks, and old routes.", accent: "#8b5e34" },
    { date: "2026-08-04", title: "Nature and Wildlife", mood: "Forest and shoreline", outlook: "Look for birds, small animals, rocks, water patterns, tracks, and quiet places.", accent: "#3f6f4f" },
    { date: "2026-08-05", title: "Choose Your Own Adventure", mood: "Everyone gets a vote", outlook: "Kids favorite options, parents approve the real plan, and backups stay flexible.", accent: "#7a6fba" },
    { date: "2026-08-06", title: "Stars and Wonder", mood: "Night-sky focus", outlook: "Check clouds, moonlight, best viewing window, and horizon targets.", accent: "#25446b" },
    { date: "2026-08-07", title: "Favorites Day", mood: "Last full island day", outlook: "Revisit favorites, gather memories, buy keepsakes, and choose one last good adventure.", accent: "#b06f33" },
    { date: "2026-08-08", title: "Departure Day", mood: "Pack and return", outlook: "Ferry timing, packing, goodbye views, return progress, and what-we-learned recap.", accent: "#56616f" }
  ],
  adventureOptions: [
    { name: "Elsie's small-creature suspense walk", bestFor: ["elsie"], effort: "Easy", bring: "Binoculars, camera, bug spray", why: "Looks for squirrels, tracks, birds, and eerie-but-safe island story details she can turn into teachable facts." },
    { name: "Katrina's hidden-history fact hunt", bestFor: ["katrina"], effort: "Easy", bring: "Notes app, downloaded history cards", why: "Gives her the why, the random facts, and the historical-fiction angle she can explain to everyone." },
    { name: "Emma Grace's real-life island challenge", bestFor: ["emma"], effort: "Easy", bring: "Comfortable shoes, family question list", why: "Focuses on how people actually live here: ferry, store, school, weather, food, sports, and routines." },
    { name: "Eliette's shiny-detail treasure scout", bestFor: ["eliette"], effort: "Easy", bring: "Small bag, camera, spending-money boundary", why: "Built around crafts, shiny things, nicknacks, keepsakes, and the tiny details most people miss." },
    { name: "Captain Jules big-machine mission", bestFor: ["jules"], effort: "Easy", bring: "Two choices, snack, patience buffer", why: "Lets Jules feel in charge while spotting trucks, boats, ferries, rocks, and super-gecko-style powers." },
    { name: "Mom/Dad route optimizer", bestFor: ["momdad"], effort: "Planning", bring: "Hours, maps, weather, ferry notes", why: "Compares kid excitement with safety, time, restroom confidence, and backup plans." },
    { name: "Night-sky blanket session", bestFor: ["all"], effort: "Easy", bring: "Red light, blankets, bug spray, layers", why: "A flexible end-of-day adventure when the sky cooperates." }
  ],
  eventsFallback: [
    "Check Bois Blanc Township and community updates before heading out.",
    "Verify The Outpost and Bob-Lo Tavern hours before leaving.",
    "Use Cheboygan, Mackinac City, and St. Ignace as mainland fallback event areas."
  ],
  stars: {
    checklist: ["Red-light flashlight", "Blankets or chairs", "Bug spray", "Layers", "Closed-toe shoes", "Binoculars", "Tripod", "Battery pack", "Water and snacks"],
    tonight: "Check twilight, moonlight, clouds, and the northern horizon before committing."
  },
  ferry: {
    terminal: "Plaunt Transportation, 412 Water Street, Cheboygan, MI",
    route: "Cheboygan to Bois Blanc Island",
    crossing: "About 45 minutes",
    reminders: ["Reserve/check vehicle space", "Arrive with buffer", "Top off gas and snacks before boarding", "Watch wind and storm conditions"]
  },
  travelJokes: [
    { maxMiles: 25, joke: "We are so close the snacks are starting to pack themselves." },
    { maxMiles: 60, joke: "Less than an hour-ish. The car is basically doing its final lap." },
    { maxMiles: 120, joke: "Still a bit to go, but at least the road is not asking, 'Are we there yet?'" },
    { maxMiles: 240, joke: "Plenty of miles left. This is what roads call a character-building exercise." },
    { maxMiles: 9999, joke: "Big drive energy. Buckle up: the highway has chosen us." }
  ]
};
