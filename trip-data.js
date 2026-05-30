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
      southBend: { lat: 41.6764, lon: -86.2520 },
      cheboygan: { lat: 45.6469, lon: -84.4745 },
      islandApprox: { lat: 45.7465, lon: -84.4948 }
    },
    stops: [
      { id: "olathe", name: "Olathe, Kansas", milesFromStart: 0, type: "start" },
      { id: "south-bend", name: "South Bend dinner / overnight", milesFromStart: 575, type: "dinner" },
      { id: "cheboygan", name: "Plaunt Transportation, Cheboygan", milesFromStart: 1035, type: "ferry" },
      { id: "island", name: "Bois Blanc Island", milesFromStart: 1065, type: "arrival" }
    ],
    restStops: [
      { name: "Travel center window 1", segment: "Olathe to South Bend", timing: "3.5-4.5 hours after leaving", confidence: "High", note: "Use for restroom, gas, and stretch before lunch decisions." },
      { name: "Lunch window", segment: "Olathe to South Bend", timing: "Midday outbound", confidence: "Medium", note: "Keep it light so dinner in South Bend still works." },
      { name: "Dinner target", segment: "South Bend", timing: "Evening July 31", confidence: "Goal", note: "Primary day-one food target." },
      { name: "Pre-ferry top-off", segment: "Northern Michigan", timing: "Before Cheboygan", confidence: "High", note: "Gas, bathroom, snacks, ferry buffer." }
    ]
  },
  profiles: [
    {
      id: "elsie",
      name: "Elsie",
      age: 14,
      lens: "Facts, suspense, teaching moments, anime-adjacent story hooks, squirrels and small animals.",
      prompts: ["What would make this easy to explain to kindergarteners?", "What is the eerie but not-too-scary version of this place?", "Which small animal could live here?"],
      tags: ["suspense", "facts", "animals", "teaching", "shipwrecks"],
      accent: "#5b4aa0"
    },
    {
      id: "katrina",
      name: "Katrina",
      age: 12,
      lens: "Smart tidbits, historical fiction, hidden facts, why questions, and quiz-the-car energy.",
      prompts: ["What is the fact nobody else knows yet?", "What would it feel like to be here 100 years ago?", "What question should we ask next?"],
      tags: ["history", "trivia", "why", "fiction", "timelines"],
      accent: "#a35d2d"
    },
    {
      id: "emma",
      name: "Emma Grace",
      age: 11,
      lens: "Big picture, real-life daily routines, sports, interaction, and why people go here.",
      prompts: ["Why would a real family come here?", "How do people live, work, or play here?", "What is the most interactive thing to do?"],
      tags: ["daily life", "sports", "interactive", "big picture", "real world"],
      accent: "#1f78a4"
    },
    {
      id: "eliette",
      name: "Eliette",
      age: 11,
      lens: "Stories, hidden details, adventures, crafts, shiny things, souvenirs, and nicknacks.",
      prompts: ["What tiny treasure is hiding here?", "What is the story behind this thing?", "Could we find something handmade or shiny?"],
      tags: ["stories", "crafts", "shiny", "shops", "hidden gems"],
      accent: "#b8892d"
    },
    {
      id: "jules",
      name: "Jules",
      age: 6,
      lens: "Captain choices, super gecko powers, dinosaurs, trucks, ferries, and why people did it.",
      prompts: ["Captain Jules, should we spot boats or big trucks first?", "What would a super gecko notice?", "Why did people build this?"],
      tags: ["captain", "dinosaurs", "trucks", "ferry", "choices"],
      accent: "#2f8a57"
    },
    {
      id: "momdad",
      name: "Mom and Dad",
      age: "adult",
      lens: "Full logistics, timing, costs, sources, restroom/gas reliability, safety, weather, and backup plans.",
      prompts: ["What is the detour cost?", "What is the safest clean-stop option?", "What is the backup if weather or ferry timing changes?"],
      tags: ["logistics", "safety", "weather", "cost", "sources"],
      accent: "#163f33"
    }
  ],
  days: [
    { date: "2026-07-31", title: "Launch Day", mood: "Road-trip energy", outlook: "Track stop rhythm, protect the South Bend dinner goal, and bank fun facts along the route.", accent: "#1f4f3a" },
    { date: "2026-08-01", title: "Ferry and Arrival", mood: "Water crossing", outlook: "Cheboygan timing, Plaunt ferry buffer, island orientation, first sunset and stars.", accent: "#236c8f" },
    { date: "2026-08-02", title: "Build Today's Adventure", mood: "Open island day", outlook: "No fixed plan. Vote on beaches, shops, local taste, slow exploring, or a low-energy backup.", accent: "#6c8a4b" },
    { date: "2026-08-03", title: "Stories and History", mood: "Great Lakes context", outlook: "Use history as a menu: ferry stories, island life, lighthouses, shipwrecks, and old routes.", accent: "#8b5e34" },
    { date: "2026-08-04", title: "Nature and Wildlife", mood: "Forest and shoreline", outlook: "Look for birds, small animals, rocks, water patterns, tracks, and quiet places.", accent: "#3f6f4f" },
    { date: "2026-08-05", title: "Choose Your Own Adventure", mood: "Everyone gets a vote", outlook: "Kids favorite options, parents approve the real plan, and backups stay flexible.", accent: "#7a6fba" },
    { date: "2026-08-06", title: "Stars and Wonder", mood: "Night-sky focus", outlook: "Check clouds, moonlight, best viewing window, and horizon targets.", accent: "#25446b" },
    { date: "2026-08-07", title: "Favorites Day", mood: "Last full island day", outlook: "Revisit favorites, gather memories, buy keepsakes, and choose one last good adventure.", accent: "#b06f33" },
    { date: "2026-08-08", title: "Departure Day", mood: "Pack and return", outlook: "Ferry timing, packing, goodbye views, return progress, and what-we-learned recap.", accent: "#56616f" }
  ],
  adventureOptions: [
    { name: "Shoreline treasure walk", bestFor: ["eliette", "emma", "elsie"], effort: "Easy", bring: "Water, bag for legal keepsakes, closed-toe shoes", why: "It turns the island into a search game without locking the whole day." },
    { name: "Ferry and boat watch", bestFor: ["jules", "emma", "momdad"], effort: "Easy", bring: "Binoculars, snack, jacket", why: "Big machines, daily island life, and a simple way to understand how people move here." },
    { name: "Local taste run", bestFor: ["eliette", "katrina", "momdad"], effort: "Easy", bring: "Hours checked first, shopping list", why: "Good for nicknacks, treats, supplies, and tiny local discoveries." },
    { name: "Story stop loop", bestFor: ["katrina", "elsie", "emma"], effort: "Medium", bring: "Downloaded notes, bug spray", why: "Great Lakes, island life, and local history become a chooseable story instead of homework." },
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
  }
};
