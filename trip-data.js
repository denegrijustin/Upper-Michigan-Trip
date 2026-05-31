window.TRIP_DATA = {
  dates: {
    depart: "2026-07-24T08:00:00-05:00",
    arriveIsland: "2026-07-25T17:00:00-04:00",
    departIsland: "2026-08-01T09:00:00-04:00",
    complete: "2026-08-02T21:00:00-05:00"
  },
  route: {
    totalOutboundMiles: 1065,
    totalReturnMiles: 1065,
    finalPublicLabel: "Bois Blanc Island home base",
    coordinates: {
      start: { lat: 38.8562, lon: -94.7878 },
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
      southBend: { label: "South Bend dinner stop", lat: 41.6764, lon: -86.2520, plannedMiles: 585, plannedHours: 9 },
      cheboygan: { label: "Plaunt ferry in Cheboygan", lat: 45.6469, lon: -84.4745, plannedMiles: 460 },
      island: { label: "Bois Blanc Island home base", lat: 45.7465, lon: -84.4948, plannedMiles: 1065 },
      home: { label: "home in Olathe", lat: 38.8814, lon: -94.8191, plannedMiles: 1065 }
    },
    mapStops: [
      { id: "olathe", label: "Olathe", lat: 38.8562, lon: -94.7878, type: "start" },
      { id: "columbia", label: "Columbia", lat: 38.9517, lon: -92.3341, type: "route" },
      { id: "st-louis", label: "St. Louis", lat: 38.6270, lon: -90.1994, type: "route" },
      { id: "indianapolis", label: "Indianapolis", lat: 39.7684, lon: -86.1581, type: "route" },
      { id: "south-bend", label: "South Bend", lat: 41.6764, lon: -86.2520, type: "overnight" },
      { id: "grand-rapids", label: "Grand Rapids", lat: 42.9634, lon: -85.6681, type: "route" },
      { id: "grayling", label: "Grayling", lat: 44.6614, lon: -84.7148, type: "route" },
      { id: "cheboygan", label: "Cheboygan", lat: 45.6469, lon: -84.4745, type: "ferry" },
      { id: "bois-blanc", label: "Bois Blanc", lat: 45.7465, lon: -84.4948, type: "arrival" }
    ],
    routePlaces: [
      {
        name: "Columbia / Rocheport Missouri River stretch",
        place: "Columbia and Rocheport, Missouri",
        day: "2026-07-31",
        milesFromStart: 150,
        image: "https://www.visitcolumbiamo.com/wp-content/uploads/2021/04/VisitColumbiaMO.jpg",
        learnMore: "https://www.visitcolumbiamo.com/",
        sourceLabel: "Learn More",
        why: "A practical first reset zone on I-70 with college-town energy, Missouri River context, and good service density.",
        profiles: {
          elsie: "Animal and setting lens: watch how the road changes around river bluffs, trees, and open Missouri stretches.",
          katrina: "Why question: why do towns grow near rivers, highways, and colleges?",
          emma: "Everyday-life lens: college towns show food, sports, traffic, students, and routines all at once.",
          eliette: "Detail hunt: look for murals, signs, campus colors, river-town textures, and small stop souvenirs.",
          jules: "Captain reset: decide if the crew needs bathroom, snack, or truck spotting.",
          momdad: "Good first eastbound reset window; route-relevant and practical before St. Louis."
        }
      },
      {
        name: "Gateway Arch",
        place: "St. Louis, Missouri",
        day: "2026-07-31",
        milesFromStart: 260,
        image: "https://www.nps.gov/common/uploads/cropped_image/primary/3C7F2389-1DD8-B71B-0B89B5A435368B0E.jpg",
        learnMore: "https://www.nps.gov/jeff/index.htm",
        sourceLabel: "Learn More",
        why: "A 630-foot monument on the Mississippi River tied to westward expansion, river travel, engineering, and the big St. Louis route moment.",
        profiles: {
          elsie: "Suspense-light angle: giant metal arch, river crossings, and old travel stories make this feel dramatic without being scary.",
          katrina: "Random fact: the Arch is as wide as it is tall. Ask why a monument about movement is shaped like a doorway.",
          emma: "Big-picture angle: St. Louis grew because rivers, roads, sports, food, and people all connected there.",
          eliette: "Shiny thing alert: stainless steel outside, river views, souvenir possibilities, and a strong photo moment.",
          jules: "Big build question: how did people build something that tall and curved?",
          momdad: "Strong visual landmark on the eastbound route. Downtown detour may cost time, but it is route-relevant."
        }
      },
      {
        name: "Big Things Small Town",
        place: "Casey, Illinois",
        day: "2026-07-31",
        milesFromStart: 405,
        image: "https://www.enjoyillinois.com/assets/Tourism-Operators/images/Big-Things-in-a-Small-Town-wind-chime-3627822d4a0ff3df2f9a278efabed4c7.jpg",
        learnMore: "https://www.bigthingssmalltown.com/",
        sourceLabel: "Learn More",
        why: "A playful I-70 stop full of oversized everyday objects, photo moments, and quick kid-friendly curiosity.",
        profiles: {
          elsie: "Teacher lens: giant everyday objects are easy to explain because everyone knows what a chair, pencil, or mailbox is.",
          katrina: "Why question: why would a small town build giant objects, and how can one odd idea become local history?",
          emma: "Everyday-life lens: normal things become funny and interesting when scale changes. Great compare-and-rate stop.",
          eliette: "Detail and nicknack radar: look for tiny souvenirs near the giant things, fun signs, colors, and photo angles.",
          jules: "Captain mission: find the biggest thing and announce what job it would do if a giant used it.",
          momdad: "Good morale stop near I-70 if timing allows. It is eastbound, memorable, and easier than a deep city detour."
        }
      },
      {
        name: "Indianapolis Motor Speedway Museum",
        place: "Speedway / Indianapolis, Indiana",
        day: "2026-07-31",
        milesFromStart: 500,
        image: "https://www.indianapolismotorspeedway.com/-/media/IMS/images/at-the-track/museum/museum-exterior.jpg",
        learnMore: "https://www.indianapolismotorspeedway.com/at-the-track/museum",
        sourceLabel: "Learn More",
        why: "A route-relevant Indiana stop about race cars, engineering, speed, teamwork, and the Indianapolis 500.",
        profiles: {
          elsie: "Story lens: racing has pressure, timing, decisions, and suspense without needing horror.",
          katrina: "History lens: ask how one race became a tradition people know all over the country.",
          emma: "Sports and real-life lens: teams, fans, routines, food, traffic, and community all organize around race day.",
          eliette: "Shiny detail watch: paint colors, numbers, trophies, logos, helmets, and small design choices.",
          jules: "Big machine jackpot: cars, wheels, speed, engines, and a huge track.",
          momdad: "Possible indoor route stop if time allows; verify hours/tours before committing."
        }
      },
      {
        name: "Notre Dame",
        place: "South Bend, Indiana",
        day: "2026-07-31",
        milesFromStart: 585,
        image: "https://www.nd.edu/assets/images/about/history/1200/sorin-arrives-1200.jpg",
        learnMore: "https://www.nd.edu/about/history/",
        sourceLabel: "Learn More",
        why: "A famous university town stop with campus, sports history, architecture, and dinner nearby.",
        profiles: {
          elsie: "Look for campus details that feel like a story setting: old buildings, symbols, and quiet paths.",
          katrina: "Ask what makes a college become famous over generations: sports, traditions, buildings, people, or stories?",
          emma: "Sports and everyday-life angle: college towns revolve around games, students, food, and routines.",
          eliette: "Look for bookstore/souvenir possibilities, pretty architecture, and small details on signs or buildings.",
          jules: "Football place. Big field energy. Captain question: food first or quick look first?",
          momdad: "Good dinner-area anchor for July 24; keep meal goal protected."
        }
      },
      {
        name: "Studebaker National Museum",
        place: "South Bend, Indiana",
        day: "2026-07-31",
        milesFromStart: 585,
        image: "https://studebakermuseum.org/wp-content/uploads/2020/08/SNM-Exterior.jpg",
        learnMore: "https://studebakermuseum.org/",
        sourceLabel: "Learn More",
        why: "A museum about vehicles and the Studebaker company, from wagons to cars.",
        profiles: {
          elsie: "Cause-and-effect: wagons became cars because people needed better ways to move families and goods.",
          katrina: "Great random-fact stop: a company can change from one kind of transportation to another as the world changes.",
          emma: "Everyday-life angle: transportation changes how people work, shop, travel, and play.",
          eliette: "Look for shiny car details, logos, colors, handles, and old-fashioned design choices.",
          jules: "Vehicles. Wheels. Big machine history. This is a strong Jules stop if time and energy allow.",
          momdad: "Good backup if arriving early in South Bend or needing an indoor activity."
        }
      },
      {
        name: "Indiana Dunes National Park",
        place: "Lake Michigan shoreline",
        day: "2026-08-01",
        milesFromStart: 655,
        image: "https://www.nps.gov/common/uploads/cropped_image/primary/4FF4684F-1DD8-B71B-0B46D743E2BEE8C5.jpg",
        learnMore: "https://www.nps.gov/indu/planyourvisit/things2do.htm",
        why: "A National Park on Lake Michigan with dunes, beaches, wetlands, and biodiversity.",
        profiles: {
          elsie: "Animal habitat lens: dunes, wetlands, birds, and small creatures all use different layers of the shoreline.",
          katrina: "Why question: how can wind and water build giant hills of sand?",
          emma: "Big-picture angle: this is where lake, beach, plants, animals, weather, and people all meet.",
          eliette: "Texture hunt: sand patterns, beach colors, shells, stones, and tiny visual details.",
          jules: "Giant sand hills. Wind built them. Captain choice: would you climb, spot birds, or inspect sand first?",
          momdad: "Potential detour depending route and timing; watch ferry-day schedule."
        }
      },
      {
        name: "Mackinac Bridge / Straits of Mackinac",
        place: "Northern Michigan",
        day: "2026-08-01",
        milesFromStart: 1000,
        image: "https://www.mackinacbridge.org/wp-content/uploads/2020/04/MackinacBridge.jpg",
        learnMore: "https://www.mackinacbridge.org/history/",
        why: "The bridge connects Michigan’s peninsulas across the Straits, where Lakes Michigan and Huron meet.",
        profiles: {
          elsie: "Suspense-light engineering: huge bridge, deep water, wind, and stories of crossing the Straits.",
          katrina: "Random fact angle: this is a place where geography forced people to solve a huge transportation problem.",
          emma: "Connection lens: bridges change daily life by connecting work, school, food, sports, and travel.",
          eliette: "Look for views, water color, bridge cables, signs, and souvenir stops nearby.",
          jules: "Big bridge, big trucks, big water. Why did people build it? So they did not always have to ferry across.",
          momdad: "Relevant if route crosses/approaches the Straits; weather and traffic matter."
        }
      },
      {
        name: "Plaunt Transportation Ferry",
        place: "Cheboygan to Bois Blanc Island",
        day: "2026-08-01",
        milesFromStart: 1035,
        image: "https://www.boisblanctownship.org/wp-content/uploads/2022/02/transportation.jpg",
        learnMore: "https://plaunttransportation.com/",
        why: "The ferry is the practical link between mainland Cheboygan and Bois Blanc Island.",
        profiles: {
          elsie: "Observation only: boats, gulls, waves, and how island life depends on water. Adults handle timing.",
          katrina: "Why question: what has to be planned differently when groceries, cars, mail, and people cross by ferry?",
          emma: "Everyday-life angle: this is how normal island routines connect to mainland errands.",
          eliette: "Look for small ferry details: signs, ropes, vehicle loading, water sparkle, and souvenir possibilities later.",
          jules: "Captain Jules big-machine moment: cars go on a boat. That is the whole headline.",
          momdad: "Adult logistics: schedule, reservation/check-in, weather, vehicle loading, and supplies before boarding."
        }
      }
    ],
    stops: [
      { id: "olathe", name: "Olathe, Kansas", milesFromStart: 0, type: "start" },
      { id: "south-bend", name: "South Bend dinner / overnight", milesFromStart: 575, type: "dinner" },
      { id: "cheboygan", name: "Plaunt Transportation, Cheboygan", milesFromStart: 1035, type: "ferry" },
      { id: "island", name: "Bois Blanc Island", milesFromStart: 1065, type: "arrival" }
    ],
    restStops: [
      { date: "2026-07-31", name: "Columbia, MO travel-center window", segment: "I-70 east of Kansas City", milesFromStart: 150, timing: "About 2.5 hours after departure", confidence: "High", needs: ["Bathroom now", "Gas now", "Food now"], note: "Good first reset: clean-restroom chains, fuel, breakfast/snack choices, and no pressure on South Bend dinner." },
      { date: "2026-07-31", name: "Wentzville / St. Charles, MO reset", segment: "Before or just after the St. Louis metro", milesFromStart: 235, timing: "About 3.75-4.25 hours after departure", confidence: "High", needs: ["Bathroom now", "Gas now"], note: "Best if you want a cleaner edge-of-metro stop before traffic and the Illinois push." },
      { date: "2026-07-31", name: "Effingham, IL lunch/gas window", segment: "I-70 / I-57 crossing", milesFromStart: 365, timing: "About 5.75-6.25 hours after departure", confidence: "High", needs: ["Bathroom now", "Gas now", "Food now"], note: "Strong lunch zone with many services, then protect the final run toward South Bend." },
      { date: "2026-07-31", name: "Lafayette, IN final stretch check", segment: "Before turning north toward South Bend", milesFromStart: 485, timing: "About 7.5 hours after departure", confidence: "Medium", needs: ["Bathroom now", "Gas now", "Food now"], note: "Use only if energy dips. Keep it short so South Bend dinner still works." },
      { date: "2026-07-31", name: "Dinner target", segment: "South Bend, Indiana", milesFromStart: 585, timing: "About 9 hours driving from home before longer breaks", confidence: "Goal", needs: ["Food now"], note: "Primary day-one food target. Notre Dame and Studebaker are nearby learning anchors, not ferry content." },
      { date: "2026-08-01", name: "Grand Rapids / Comstock Park reset", segment: "US-131 northbound", milesFromStart: 735, timing: "Morning/midday after leaving South Bend", confidence: "High", needs: ["Bathroom now", "Gas now", "Food now"], note: "Good service density before northern Michigan gets more spread out." },
      { date: "2026-08-01", name: "Grayling, MI top-off", segment: "Before the Cheboygan approach", milesFromStart: 920, timing: "Before reaching Plaunt Transportation", confidence: "High", needs: ["Bathroom now", "Gas now", "Food now"], note: "Gas, restroom, snacks, and a buffer before ferry-day logistics." },
      { date: "2026-08-08", name: "Cheboygan mainland reset", segment: "After ferry return", milesFromStart: 30, timing: "Immediately after returning to the mainland", confidence: "High", needs: ["Bathroom now", "Gas now", "Food now"], note: "Bathroom, fuel, food, and route choice before the long drive home." },
      { date: "2026-08-08", name: "Return 4-hour service window", segment: "Michigan / Indiana return corridor", milesFromStart: 300, timing: "Every 4-5 hours while returning", confidence: "Medium", needs: ["Bathroom now", "Gas now", "Food now"], note: "Use only while the return phase is active." }
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
    { date: "2026-07-31", title: "Launch Day", mood: "Road-trip energy", outlook: "Track the road to South Bend, watch for real landmarks, and keep the dinner goal visible without crowding the screen.", accent: "#1f4f3a" },
    { date: "2026-08-01", title: "Ferry and Arrival", mood: "South Bend to Cheboygan", outlook: "Morning road miles first, then Cheboygan timing, Plaunt ferry buffer, island orientation, first sunset and stars.", accent: "#236c8f" },
    { date: "2026-08-02", title: "Build Today's Adventure", mood: "Open island day", outlook: "No fixed plan. Vote on beaches, shops, local taste, slow exploring, or a low-energy backup.", accent: "#6c8a4b" },
    { date: "2026-08-03", title: "Stories and History", mood: "Great Lakes context", outlook: "Use history as a menu: ferry stories, island life, lighthouses, shipwrecks, and old routes.", accent: "#8b5e34" },
    { date: "2026-08-04", title: "Nature and Wildlife", mood: "Forest and shoreline", outlook: "Look for birds, small animals, rocks, water patterns, tracks, and quiet places.", accent: "#3f6f4f" },
    { date: "2026-08-05", title: "Choose Your Own Adventure", mood: "Everyone gets a vote", outlook: "Kids favorite options, parents approve the real plan, and backups stay flexible.", accent: "#7a6fba" },
    { date: "2026-08-06", title: "Stars and Wonder", mood: "Night-sky focus", outlook: "Check clouds, moonlight, best viewing window, and horizon targets.", accent: "#25446b" },
    { date: "2026-08-07", title: "Favorites Day", mood: "Last full island day", outlook: "Revisit favorites, gather memories, buy keepsakes, and choose one last good adventure.", accent: "#b06f33" },
    { date: "2026-08-08", title: "Departure Day", mood: "Pack and return", outlook: "Ferry timing, packing, goodbye views, return progress, and what-we-learned recap.", accent: "#56616f" }
  ],
  planningQuest: [
    {
      title: "Map the first big day",
      prompt: "Find Olathe, St. Louis, Indianapolis, and South Bend on the map. Which city feels like the halfway mood shift?",
      answer: "St. Louis is the first big landmark; Effingham/Lafayette are useful service windows; South Bend is the dinner goal.",
      bestFor: ["all"]
    },
    {
      title: "Pack for one perfect night sky",
      prompt: "Pick three things that make stargazing better: comfort, darkness, and patience all count.",
      answer: "Red light, blanket/chair, layers, bug spray, and binoculars are the best starter kit.",
      bestFor: ["elsie", "katrina", "eliette", "momdad"]
    },
    {
      title: "Clean stop captain",
      prompt: "Choose the best stop rule: stop when bored, stop when fuel is low, or stop before everyone is desperate?",
      answer: "Stop before everyone is desperate. The app watches 4-5 hour windows but lets needs override the plan.",
      bestFor: ["emma", "jules", "momdad"]
    },
    {
      title: "Route photo challenge",
      prompt: "Pick one thing to capture on the way: a bridge, campus sign, giant machine, shiny detail, or local food sign.",
      answer: "The best trip summary comes from small, real moments captured as they happen.",
      bestFor: ["all"]
    }
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
  activityBoard: {
    elsie: [
      { title: "Squirrel behavior scout", type: "Island", detail: "Watch how squirrels or chipmunks use trees, food, and hiding places.", link: "https://www.michigan.gov/dnr/education/michigan-species/mammals", lookFor: "Tail flicks, climbing paths, food choices", capture: "Photo or short animal-note video" },
      { title: "Shipwreck story check", type: "Great Lakes", detail: "Read one Great Lakes shipwreck story and decide what made it suspenseful.", link: "https://thunderbay.noaa.gov/shipwrecks/", lookFor: "Weather, choices, water, warning signs", capture: "Record a 20-second suspense summary" },
      { title: "Kindergarten explainer", type: "Teach", detail: "Explain the ferry, dunes, or stars in words a kindergartener would understand.", link: "https://plaunttransportation.com/", lookFor: "Simple cause and effect", capture: "Video your tiny lesson" },
      { title: "Eerie but safe setting", type: "Story", detail: "Find a place that feels like a mystery scene without being actually scary.", link: "https://www.michigan.org/city/bois-blanc-island", lookFor: "Old sign, quiet road, fog, shoreline", capture: "Photo with a story title" },
      { title: "Animal habitat sketch", type: "Nature", detail: "Pick one small animal and sketch where it would hide, eat, and watch.", link: "https://www.boisblanctownship.org/", lookFor: "Trees, brush, rocks, shoreline cover", capture: "Photo of the habitat" },
      { title: "Notre Dame story setting", type: "Route", detail: "Look for one campus detail that could start a scene.", link: "https://www.nd.edu/about/history/", lookFor: "Old building, symbol, arch, path", capture: "Photo of the detail" },
      { title: "Storm science fact", type: "Sky", detail: "Learn why Great Lakes weather can change fast.", link: "https://www.weather.gov/greatlakes/", lookFor: "Clouds, wind, wave changes", capture: "Sky photo" },
      { title: "Suspense sound map", type: "Island", detail: "List five sounds that make the island feel alive at dusk.", link: "https://www.michigan.org/city/bois-blanc-island", lookFor: "Leaves, water, birds, boats, insects", capture: "Audio/video clip if allowed" },
      { title: "Arch teacher fact card", type: "Route", detail: "Turn the Gateway Arch into one simple fact younger kids could understand.", link: "https://www.nps.gov/jeff/index.htm", lookFor: "River, shape, height, travel story", capture: "Photo or note of your simple fact" },
      { title: "Night creature question", type: "Stars", detail: "Ask what animals might be active while humans look at stars.", link: "https://www.michigan.gov/dnr/education/michigan-species", lookFor: "Sounds, tracks, safe distance", capture: "No flash; note only" },
      { title: "Mystery object", type: "Island", detail: "Choose one object and write the non-scary mystery behind it.", link: "https://www.boisblanctownship.org/", lookFor: "Rope, sign, dock, weathered wood", capture: "Object photo" }
    ],
    katrina: [
      { title: "Missouri River why chain", type: "Route", detail: "Build a three-step why chain: river, road, town.", link: "https://www.visitcolumbiamo.com/", lookFor: "Why towns and roads gather near rivers", capture: "Photo of your why chain" },
      { title: "Arch fact collector", type: "Route", detail: "Find the weirdest Gateway Arch fact and quiz the car.", link: "https://www.nps.gov/jeff/", lookFor: "Height, shape, river, engineering", capture: "Quiz video" },
      { title: "Notre Dame origin story", type: "Route", detail: "Learn how Notre Dame began in 1842 and turn it into historical fiction.", link: "https://www.nd.edu/about/history/", lookFor: "Founder, cold day, mission, campus", capture: "Read your first sentence" },
      { title: "Studebaker transformation", type: "Route", detail: "Track how a company moved from wagons to cars.", link: "https://studebakermuseum.org/", lookFor: "What changed in transportation", capture: "Before/after note" },
      { title: "Dunes question", type: "Nature", detail: "Explain how wind and water can build a giant hill of sand.", link: "https://www.nps.gov/indu/planyourvisit/things2do.htm", lookFor: "Wind, waves, grass, slope", capture: "Sand pattern photo" },
      { title: "Ferry economy question", type: "Island", detail: "Ask what island life has to plan around because of ferry timing.", link: "https://plaunttransportation.com/", lookFor: "Mail, groceries, vehicles, weather", capture: "List three dependencies" },
      { title: "Lighthouse clue", type: "Island", detail: "Learn why the Bois Blanc light mattered for Lake Huron travel.", link: "https://www.michigan.org/property/bois-blanc-island-lighthouse", lookFor: "Shoal, shore, navigation, safety", capture: "Map or shoreline photo" },
      { title: "Timeline detective", type: "Island", detail: "Put ferry, lighthouse, bridge, and university into timeline order.", link: "https://www.michigan.org/city/bois-blanc-island", lookFor: "Dates and reasons", capture: "Timeline picture" },
      { title: "Historical-fiction ferry scene", type: "Write", detail: "Write one paragraph from someone arriving before smartphones.", link: "https://www.boisblanctownship.org/community/transportation/", lookFor: "What they carried, worried about, noticed", capture: "Read it aloud" },
      { title: "Mackinac Bridge problem", type: "Engineering", detail: "Explain what problem the bridge solved.", link: "https://www.mackinacbridge.org/history/", lookFor: "Water crossing, weather, traffic", capture: "Bridge fact card" },
      { title: "Question nobody asked", type: "Any Day", detail: "Find one place detail and ask the question no one else asked.", link: "https://www.boisblanctownship.org/", lookFor: "A sign, old object, map label, rule", capture: "Question photo" }
    ],
    emma: [
      { title: "South Bend sports town", type: "Route", detail: "Find how Notre Dame shapes normal weekends in South Bend.", link: "https://fightingirish.com/", lookFor: "Team colors, restaurants, signs, fields", capture: "Sports-town photo" },
      { title: "How island errands work", type: "Island", detail: "Figure out how groceries, school, mail, and repairs happen on an island.", link: "https://www.boisblanctownship.org/", lookFor: "Store, post office, ferry, dock", capture: "Everyday-life photo" },
      { title: "Studebaker daily-life shift", type: "Route", detail: "Notice how vehicles changed work, shopping, family trips, and jobs.", link: "https://studebakermuseum.org/", lookFor: "Wagons, cars, tools, signs", capture: "Then-vs-now note" },
      { title: "Dinner town review", type: "Route", detail: "Rate the South Bend dinner area like a local: food, walkability, energy.", link: "https://visitsouthbend.com/", lookFor: "Where people gather", capture: "One photo and one rating" },
      { title: "Beach movement challenge", type: "Island", detail: "Create a low-key family movement challenge on sand, road, or shoreline.", link: "https://www.michigan.org/city/bois-blanc-island", lookFor: "Safe open space", capture: "Scoreboard photo" },
      { title: "Indiana Dunes ecosystem", type: "Nature", detail: "Spot how beach, plants, water, and people share one place.", link: "https://www.nps.gov/indu/planyourvisit/things2do.htm", lookFor: "Boardwalks, plants, beach rules", capture: "Ecosystem photo" },
      { title: "Ferry routine reporter", type: "Island", detail: "Describe the ferry like a normal daily routine, not just a tourist thing.", link: "https://plaunttransportation.com/", lookFor: "Cars, people, supplies, timing", capture: "Reporter clip" },
      { title: "Local gathering spot", type: "Island", detail: "Find where people seem to gather and what it tells you.", link: "https://www.boisblanctownship.org/", lookFor: "Store, tavern, dock, road crossing", capture: "Gathering-place note" },
      { title: "Baseball maybe", type: "Route", detail: "Look for a field, team sign, or community sports clue along the way.", link: "https://visitsouthbend.com/things-to-do/sports-recreation/", lookFor: "Field lights, team signs, ball caps", capture: "Sports clue photo" },
      { title: "Why people vacation here", type: "Island", detail: "Pick three reasons a real family would choose a quiet island.", link: "https://www.michigan.org/city/bois-blanc-island", lookFor: "Water, quiet, routine break, stars", capture: "Three-reason video" },
      { title: "Best stop scorecard", type: "Travel", detail: "Score a stop: bathroom, food, speed, mood, and something interesting.", link: "https://maps.apple.com/?q=gas%20food%20restroom%20near%20me", lookFor: "Clean, quick, useful, local", capture: "Scorecard photo" }
    ],
    eliette: [
      { title: "Shiny rock and texture hunt", type: "Island", detail: "Find legal, leave-no-trace textures: rocks, shells, bark, signs, water sparkle.", link: "https://www.michigan.org/city/bois-blanc-island", lookFor: "Sparkle, pattern, color, shape", capture: "Close-up photo" },
      { title: "Souvenir scouting list", type: "Route", detail: "Look for patches, postcards, stickers, pins, or small local objects.", link: "https://visitsouthbend.com/", lookFor: "Small, local, easy to carry", capture: "Wish-list photo" },
      { title: "Ferry detail story", type: "Island", detail: "Pick one ferry detail and invent its story.", link: "https://plaunttransportation.com/", lookFor: "Rope, sign, ramp, ticket, water", capture: "Detail photo" },
      { title: "Lighthouse story object", type: "Island", detail: "Choose one lighthouse detail and ask what it helped sailors avoid.", link: "https://www.michigan.org/property/bois-blanc-island-lighthouse", lookFor: "Light, shore, rocks, shoal", capture: "Story-object photo" },
      { title: "Craft color palette", type: "Island", detail: "Collect five colors from the island for a bracelet, drawing, or craft idea.", link: "https://www.boisblanctownship.org/", lookFor: "Water, moss, sand, bark, sunset", capture: "Color collage" },
      { title: "Notre Dame tiny detail", type: "Route", detail: "Find a building detail, symbol, or sign most people would miss.", link: "https://www.nd.edu/about/history/", lookFor: "Carving, lettering, gold, pattern", capture: "Tiny detail photo" },
      { title: "Museum logo hunt", type: "Route", detail: "At Studebaker, look for old logos, handles, wheels, and shiny trim.", link: "https://studebakermuseum.org/", lookFor: "Chrome, badges, paint, handles", capture: "Design detail photo" },
      { title: "Hidden sign story", type: "Any Day", detail: "Find a sign that tells a bigger story than it looks like.", link: "https://www.boisblanctownship.org/", lookFor: "Rules, place names, hand lettering", capture: "Sign photo" },
      { title: "Postcard sentence", type: "Write", detail: "Write one perfect postcard sentence from today's tiny discovery.", link: "https://www.michigan.org/city/bois-blanc-island", lookFor: "A detail worth remembering", capture: "Postcard text photo" },
      { title: "Local treat or nicknack", type: "Island", detail: "Find one small local thing that feels like the place.", link: "https://www.boisblanctownship.org/", lookFor: "Snack, sticker, card, handmade item", capture: "Only if buying is parent-approved" },
      { title: "Water sparkle watch", type: "Stars", detail: "At sunset or night, notice how water changes color and reflection.", link: "https://www.cleardarksky.com/c/BsBlnIObMOkey.html?1", lookFor: "Glints, moon path, ripples", capture: "Low-light photo if safe" }
    ],
    jules: [
      { title: "Captain stop choice", type: "Travel", detail: "Pick from two parent-approved stops and explain why your crew needs it.", link: "https://maps.apple.com/?q=gas%20food%20restroom%20near%20me", lookFor: "Bathroom, snack, truck, sign", capture: "Captain thumbs-up photo" },
      { title: "Truck job spotter", type: "Route", detail: "Spot three trucks and guess each one's job.", link: "https://www.fhwa.dot.gov/", lookFor: "Tanker, box truck, construction, tow", capture: "No driver photos; draw them" },
      { title: "Ferry boss question", type: "Island", detail: "Figure out why cars can ride on a boat.", link: "https://plaunttransportation.com/", lookFor: "Ramp, wheels, ropes, captain", capture: "Captain explanation video" },
      { title: "Dino brain rock", type: "Nature", detail: "Find a rock or sand pattern that looks ancient and ask how it got there.", link: "https://www.nps.gov/indu/learn/nature/index.htm", lookFor: "Layers, bumps, big stones, sand", capture: "Rock photo" },
      { title: "Super gecko hideout", type: "Island", detail: "Find the best place a super gecko would climb or hide.", link: "https://www.michigan.gov/dnr/education/michigan-species/reptiles", lookFor: "Tree bark, rocks, rails, shadows", capture: "Point at the hideout" },
      { title: "Bridge why", type: "Route", detail: "Explain why people built a giant bridge instead of always using boats.", link: "https://www.mackinacbridge.org/history/", lookFor: "Water, cars, trucks, wind", capture: "Bridge why video" },
      { title: "Museum wheels mission", type: "Route", detail: "Find the coolest wheels or old vehicle detail.", link: "https://studebakermuseum.org/", lookFor: "Wheels, headlights, steering wheels", capture: "Vehicle detail photo" },
      { title: "Baseball sometimes challenge", type: "Route", detail: "Find one baseball clue: field, hat, sign, or ball shape.", link: "https://visitsouthbend.com/things-to-do/sports-recreation/", lookFor: "Baseball clue", capture: "Baseball clue photo" },
      { title: "Why do I have to buckle?", type: "Travel", detail: "Captain safety rule: explain why seatbelts are part of being in charge.", link: "https://www.nhtsa.gov/vehicle-safety/seat-belts", lookFor: "Safety first, then captain choices", capture: "Captain rule salute" },
      { title: "Boat sound detective", type: "Island", detail: "Listen for boat sounds and guess what is happening.", link: "https://www.boisblanctownship.org/community/transportation/", lookFor: "Motor, horn, waves, dock sounds", capture: "Sound note" },
      { title: "Big machine reason", type: "Any Day", detail: "Find one big machine and say the reason people need it.", link: "https://www.michigan.org/city/bois-blanc-island", lookFor: "Truck, ferry, mower, tractor, bridge", capture: "Reason video" }
    ],
    momdad: [
      { title: "Approve one kid win per segment", type: "Planning", detail: "Pick the child most likely to benefit from the next optional stop.", link: "https://maps.apple.com/?q=gas%20food%20restroom%20near%20me", lookFor: "Clean restrooms, time cost, child fit", capture: "Save a note" },
      { title: "Verify Plaunt schedule", type: "Ferry", detail: "Check official ferry details before relying on any cached plan.", link: "https://plaunttransportation.com/", lookFor: "Schedule, vehicle space, weather, buffer", capture: "Screenshot if needed" },
      { title: "Star grade check", type: "Night", detail: "Use Clear Dark Sky before promising a stargazing night.", link: "https://www.cleardarksky.com/c/BsBlnIObMOkey.html?1", lookFor: "Cloud cover, transparency, darkness, smoke", capture: "Save the grade" },
      { title: "Route stop confidence", type: "Travel", detail: "Choose stops by service density and restroom confidence first.", link: "https://maps.apple.com/?q=gas%20food%20restroom%20near%20me", lookFor: "Recent reviews, fuel, food, clean restrooms", capture: "Favorite the stop" }
    ]
  },
  eventsFallback: [
    "Check Bois Blanc Township and community updates before heading out.",
    "Verify The Outpost and Bob-Lo Tavern hours before leaving.",
    "Use Cheboygan, Mackinac City, and St. Ignace as mainland fallback event areas."
  ],
  preTripGame: [
    {
      title: "Ferry Brain",
      prompt: "Why does an island need a ferry?",
      answer: "Because people, vehicles, mail, food, and supplies need a way across the water.",
      bestFor: ["emma", "jules", "katrina"]
    },
    {
      title: "Great Lakes Mystery",
      prompt: "What makes the Great Lakes feel almost like inland seas?",
      answer: "They are huge, deep, windy, and powerful enough to shape weather, travel, shipping, and local stories.",
      bestFor: ["katrina", "elsie"]
    },
    {
      title: "Tiny Treasure Scout",
      prompt: "What tiny details might you look for on an island walk?",
      answer: "Patterns in rocks, shells, leaves, animal tracks, shiny bits, signs, boats, and old objects.",
      bestFor: ["eliette", "elsie"]
    },
    {
      title: "Road Trip Spot-It",
      prompt: "What changes as we drive from Kansas toward Michigan?",
      answer: "Land, trees, towns, road signs, food stops, weather, water, and how close we feel to the Great Lakes.",
      bestFor: ["all"]
    },
    {
      title: "Captain Choice",
      prompt: "If you were in charge for one stop, would you pick trucks, snacks, rocks, or boats?",
      answer: "Any pick works if the captain can explain why.",
      bestFor: ["jules"]
    }
  ],
  dailyProfileFeatures: {
    elsie: [
      { title: "Teacher Fact", text: "The Gateway Arch is a real route landmark that can be explained through rivers, travel, engineering, and symbols.", lookFor: "A river, arch shape, or travel story you could explain simply." },
      { title: "Suspense-Lite Watch", text: "Great Lakes travel has real shipwreck and storm stories; suspense here comes from weather, water, and choices.", lookFor: "Water, fog, old boats, or dramatic shoreline." },
      { title: "Small Creature Science", text: "Squirrels and chipmunks survive by reading habitat: trees, food, hiding places, and people.", lookFor: "Tracks, nests, nuts, holes, or quick movement." }
    ],
    katrina: [
      { title: "Why It Matters", text: "Routes are history: towns grow where people can cross rivers, trade, stop, eat, and sleep.", lookFor: "Old downtowns, bridges, rail lines, and signs." },
      { title: "Fact Collector", text: "The Gateway Arch is 630 feet tall and 630 feet wide, which makes it a monument shaped like a perfect crossing.", lookFor: "A shape that means movement." },
      { title: "Historical Fiction Seed", text: "Imagine arriving at an island by ferry before phones made everything easy. What would you bring?", lookFor: "Objects people depend on: fuel, food, mail, tools." }
    ],
    emma: [
      { title: "Real-Life Lens", text: "Every place on the route has routines: school, work, sports, dinner, errands, weather, and getting around.", lookFor: "Where local people gather." },
      { title: "Sports Town Watch", text: "South Bend is tied to Notre Dame, where sports shape weekends, restaurants, traffic, and traditions.", lookFor: "Team colors, fields, signs, and campus energy." },
      { title: "How Island Life Works", text: "On an island, normal errands depend on timing, boats, weather, and planning.", lookFor: "Stores, docks, delivery vehicles, and ferry routines." }
    ],
    eliette: [
      { title: "Tiny Treasure", text: "The best trip details are often small: signs, textures, stones, stickers, postcards, and handmade objects.", lookFor: "Something shiny, textured, or easy to miss." },
      { title: "Story Object", text: "Pick one object at a stop and invent the story of how it got there.", lookFor: "Old signs, souvenirs, ropes, rocks, tools, or photos." },
      { title: "Nicknack Radar", text: "Visitor centers, ferry towns, and local stores are good places to find small keepsakes.", lookFor: "Patches, pins, postcards, stones, or local crafts." }
    ],
    jules: [
      { title: "Captain Reason", text: "Big things are built for reasons: bridges cross water, ferries carry cars, trucks move supplies.", lookFor: "One big machine and the job it does." },
      { title: "Dino Brain", text: "Rocks are old clues. Some places tell stories from before people, roads, and cars.", lookFor: "Big rocks, layers, sand, or anything that looks ancient." },
      { title: "Super Gecko Power", text: "Animals survive by climbing, hiding, gripping, spotting, and waiting.", lookFor: "A place a gecko would hide or climb." }
    ],
    momdad: [
      { title: "Parent Operating Note", text: "Use kid-specific facts as stop filters: one meaningful kid win can make a long road segment better.", lookFor: "Clean restrooms, time cost, and the child most likely to light up." },
      { title: "Timing Note", text: "Protect South Bend dinner on July 31 and ferry buffer on August 1.", lookFor: "Stops that solve a need without stealing the day." },
      { title: "Flex Note", text: "Island days should not be over-scheduled. Let kids vote, then parents approve.", lookFor: "Weather, effort, supplies, and backup options." }
    ]
  },
  stars: {
    checklist: ["Red-light flashlight", "Blankets or chairs", "Bug spray", "Layers", "Closed-toe shoes", "Binoculars", "Tripod", "Battery pack", "Water and snacks"],
    tonight: "Use Clear Dark Sky for cloud cover, transparency, seeing, darkness, smoke, wind, and humidity before committing.",
    clearDarkSky: "https://www.cleardarksky.com/c/BsBlnIObMOkey.html?1",
    gradeRules: [
      "A: dark-blue cloud blocks, good transparency, dark sky, low smoke, light wind",
      "B: mostly clear with average transparency or a brighter moon",
      "C: broken clouds, haze, or humidity risk; still good for bright stars and planets",
      "D: cloudy, smoky, windy, or too bright; use it as a learning night"
    ],
    overhead: ["Summer Triangle: Vega, Deneb, Altair", "Milky Way band if the sky is dark and clear", "Big Dipper / Ursa Major low-to-mid northern sky", "Cassiopeia rising later in the northeast"],
    horizon: ["North: possible faint aurora only if space weather cooperates", "South: Scorpius and Sagittarius low, with the Milky Way core direction", "West after sunset: bright twilight colors over water", "East later: rising constellations and moon path if the moon is up"]
  },
  ferry: {
    terminal: "Plaunt Transportation, 412 Water Street, Cheboygan, MI",
    route: "Cheboygan to Bois Blanc Island",
    crossing: "About 45 minutes",
    learnMore: "https://plaunttransportation.com/",
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

window.TRIP_DATA.mapLinks = {
  styleUrl: "https://tiles.openfreemap.org/styles/liberty",
  outboundUrl: "https://maps.apple.com/?saddr=1924%20E%20155th%20St%2C%20Olathe%2C%20KS&daddr=Bois%20Blanc%20Island%2C%20MI",
  dayOneUrl: "https://maps.apple.com/?saddr=1924%20E%20155th%20St%2C%20Olathe%2C%20KS&daddr=South%20Bend%2C%20IN",
  ferryDayUrl: "https://maps.apple.com/?saddr=South%20Bend%2C%20IN&daddr=Plaunt%20Transportation%2C%20412%20Water%20Street%2C%20Cheboygan%2C%20MI",
  returnUrl: "https://maps.apple.com/?saddr=Bois%20Blanc%20Island%2C%20MI&daddr=1924%20E%20155th%20St%2C%20Olathe%2C%20KS"
};

window.TRIP_DATA.profilePlacePreferences = {
  elsie: [
    "Gateway Arch",
    "Notre Dame",
    "Studebaker National Museum",
    "Mackinac Bridge / Straits of Mackinac"
  ],
  katrina: [
    "Gateway Arch",
    "Notre Dame",
    "Columbia / Rocheport Missouri River stretch",
    "Mackinac Bridge / Straits of Mackinac"
  ],
  emma: [
    "Notre Dame",
    "Indianapolis Motor Speedway Museum",
    "Studebaker National Museum",
    "Indiana Dunes National Park"
  ],
  eliette: [
    "Big Things Small Town",
    "Gateway Arch",
    "Notre Dame",
    "Studebaker National Museum"
  ],
  jules: [
    "Indianapolis Motor Speedway Museum",
    "Studebaker National Museum",
    "Plaunt Transportation Ferry",
    "Mackinac Bridge / Straits of Mackinac"
  ],
  momdad: [
    "Columbia / Rocheport Missouri River stretch",
    "Gateway Arch",
    "Notre Dame",
    "Studebaker National Museum"
  ]
};

window.TRIP_DATA.weatherLocations = [
  { id: "olathe", name: "Olathe / home", lat: 38.8562, lon: -94.7878, role: "Start" },
  { id: "southBend", name: "South Bend", lat: 41.6764, lon: -86.2520, role: "Day-one dinner" },
  { id: "cheboygan", name: "Cheboygan / Plaunt ferry", lat: 45.6469, lon: -84.4745, role: "Ferry mainland" },
  { id: "boisBlanc", name: "Bois Blanc Island", lat: 45.7465, lon: -84.4948, role: "Island" }
];

window.TRIP_DATA.sourceLinks = {
  weather: { label: "Open weather source", url: "https://open-meteo.com/en/docs?timezone=America%2FChicago&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,showers,cloud_cover,wind_speed_10m,wind_gusts_10m,cape,convective_inhibition&forecast_hours=12&models=best_match&daily=sunrise,sunset,daylight_duration&location_mode=bounding_box&bounding_box=-90,-180,90,180" },
  gatewayArch: { label: "Open official NPS Gateway Arch page", url: "https://www.nps.gov/jeff/index.htm" },
  indianaDunes: { label: "Open official NPS Indiana Dunes page", url: "https://www.nps.gov/indu/planyourvisit/things2do.htm" },
  notreDame: { label: "Open official Notre Dame history page", url: "https://www.nd.edu/about/history/" },
  studebaker: { label: "Open official museum page", url: "https://studebakermuseum.org/" },
  mackinacBridge: { label: "Open official bridge page", url: "https://www.mackinacbridge.org/history/" },
  ferry: { label: "Open official ferry schedule", url: "https://plaunttransportation.com/" },
  clearDarkSky: { label: "Open Clear Dark Sky chart", url: "https://www.cleardarksky.com/c/BsBlnIObMOkey.html?1" },
  boisBlanc: { label: "Open official island township site", url: "https://www.boisblanctownship.org/" },
  michiganVisitor: { label: "Open official Michigan visitor page", url: "https://www.michigan.org/city/bois-blanc-island" }
};

window.TRIP_DATA.badgeCatalog = [
  ["launch-crew","Launch Crew","Route","Olathe departure","startTrip",["all"],"The trip officially started.","You started the trip.",""],
  ["first-miles-marker","First Miles Marker","Route","Kansas outbound","manual",["all"],"Leave the first real miles behind.","The first miles are behind you.",""],
  ["kansas-road-reader","Kansas Road Reader","Route","Kansas","activity",["all"],"Notice the route instead of only riding through it.","You started reading the road.",""],
  ["columbia-reset-scout","Columbia Reset Scout","Stops","Columbia / Rocheport","source",["all"],"Learn why this is a smart first eastbound reset zone.","You found the first reset story.","https://www.visitcolumbiamo.com/"],
  ["big-things-finder","Big Things Finder","Place","Casey Big Things","source",["eliette","jules","emma"],"Find the giant roadside idea in Casey, Illinois.","You found a giant little-town story.","https://www.bigthingssmalltown.com/"],
  ["speedway-story","Speedway Story","Place","Indianapolis Motor Speedway","source",["emma","jules","katrina"],"Learn why Indianapolis became a racing landmark.","You unlocked the speedway story.","https://www.indianapolismotorspeedway.com/at-the-track/museum"],
  ["first-reset-pro","First Reset Pro","Stops","Columbia reset","need",["all"],"Use a smart first stop before everyone is desperate.","You made the first smart reset.",""],
  ["missouri-miles","Missouri Miles","Route","Missouri crossing","manual",["all"],"Cross into the next big part of the drive.","Missouri miles unlocked.",""],
  ["arch-spotter","Arch Spotter","Place","Gateway Arch","source",["all"],"Spot or learn about the Gateway Arch.","You found the Arch story.","https://www.nps.gov/jeff/index.htm"],
  ["river-crossing-scout","River Crossing Scout","Route","Mississippi River","manual",["katrina","emma","momdad"],"Notice the Mississippi River crossing.","You caught a major river crossing.",""],
  ["illinois-stretch-survivor","Illinois Stretch Survivor","Route","Illinois road stretch","manual",["all"],"Handle a long road stretch.","You handled the Illinois stretch.",""],
  ["effingham-energy-reset","Effingham Energy Reset","Stops","Effingham service window","need",["all"],"Use a smart service stop to keep the day moving.","You used a strong reset window.",""],
  ["indiana-line-crosser","Indiana Line Crosser","Route","Indiana crossing","manual",["all"],"Cross another state line.","Indiana line crossed.",""],
  ["indianapolis-route-marker","Indianapolis Route Marker","Route","Indianapolis","manual",["all"],"Pass a major Midwest city marker.","Indianapolis marker reached.",""],
  ["lafayette-final-push","Lafayette Final Push","Route","Lafayette","manual",["all"],"Reach the final stretch before South Bend.","Final push unlocked.",""],
  ["south-bend-stopper","South Bend Stopper","Route","South Bend overnight","manual",["all"],"Reach the day-one dinner goal.","South Bend goal reached.",""],
  ["golden-dome-detective","Golden Dome Detective","Place","Notre Dame","source",["katrina","emma","eliette"],"Learn one Notre Dame history detail.","You found a campus story.","https://www.nd.edu/about/history/"],
  ["campus-story-finder","Campus Story Finder","Place","Notre Dame","capture",["elsie","katrina","eliette"],"Capture or save a campus detail.","You found a campus story detail.","https://www.nd.edu/about/history/"],
  ["studebaker-shift","Studebaker Shift","Place","Studebaker Museum","source",["emma","jules","katrina"],"Learn how wagons became cars.","You learned a transportation shift.","https://studebakermuseum.org/"],
  ["lake-michigan-lookout","Lake Michigan Lookout","Route","Lake Michigan","manual",["all"],"Reach the Great Lakes part of the trip.","Great Lakes mode unlocked.",""],
  ["dunes-questioner","Dunes Questioner","Place","Indiana Dunes","source",["katrina","emma","eliette"],"Ask how wind and water build dunes.","You unlocked a dunes question.","https://www.nps.gov/indu/planyourvisit/things2do.htm"],
  ["michigan-bound","Michigan Bound","Route","Michigan entry","manual",["all"],"Make it into the destination state.","Michigan reached.",""],
  ["grand-rapids-reset","Grand Rapids Reset","Stops","Grand Rapids reset","need",["all"],"Pick a smart Michigan reset.","Michigan reset complete.",""],
  ["northern-michigan-mode","Northern Michigan Mode","Route","Northern Michigan","manual",["all"],"The trip shifts into northern Michigan.","Northern Michigan mode unlocked.",""],
  ["forest-road-watcher","Forest Road Watcher","Route","Grayling / forest roads","activity",["elsie","jules","momdad"],"Notice the northern forest road change.","You watched the forest road shift.",""],
  ["straits-scout","Straits Scout","Place","Mackinac / Straits","source",["all"],"Learn why the Straits matter.","You scouted the Straits.","https://www.mackinacbridge.org/history/"],
  ["last-mainland-prep","Last Mainland Prep","Ferry","Cheboygan supplies","activity",["emma","eliette","momdad"],"Help with the last mainland checklist.","Mainland prep complete.",""],
  ["cheboygan-ready","Cheboygan Ready","Ferry","Cheboygan","manual",["all"],"Reach the ferry town.","Cheboygan ready.",""],
  ["ferry-ready","Ferry Ready","Ferry","Plaunt ferry","approve",["momdad"],"Verify the ferry plan before depending on it.","Ferry plan checked.","https://plaunttransportation.com/"],
  ["boat-boss","Boat Boss","Ferry","Plaunt ferry","activity",["jules","emma","momdad"],"Notice how cars and people get to the island.","Boat boss unlocked.","https://plaunttransportation.com/"],
  ["ferry-crossing-crew","Ferry Crossing Crew","Ferry","Mainland to island","markArrived",["all"],"Cross from mainland to island.","Ferry crossing complete.",""],
  ["island-arrival","Island Arrival","Island","Bois Blanc arrival","markArrived",["all"],"Make it to Bois Blanc Island.","Island arrival unlocked.",""],
  ["first-island-photo","First Island Photo","Photos","Island memory","capture",["all"],"Capture the first island memory.","First island photo captured.",""],
  ["island-explorer","Island Explorer","Island","Island activity","activity",["all"],"Complete the first island activity.","Island exploring started.",""],
  ["wildlife-watcher","Wildlife Watcher","Nature","Island wildlife","activity",["elsie","jules"],"Complete or capture an animal or habitat activity.","Wildlife watching unlocked.",""],
  ["tiny-treasure-scout","Tiny Treasure Scout","Details","Keepsake/detail","activity",["eliette"],"Find a shiny, small, or story-rich detail.","Tiny treasure found.",""],
  ["island-life-investigator","Island Life Investigator","Island","Daily life","activity",["emma","katrina"],"Explore how island life works.","Island life investigated.",""],
  ["shoreline-story","Shoreline Story","Place","Lighthouse / shoreline","source",["katrina","elsie","eliette"],"Open or complete a shoreline story card.","Shoreline story unlocked.","https://www.michigan.org/property/bois-blanc-island-lighthouse"],
  ["weather-watch","Weather Watch","Weather","Trip weather","weather",["momdad"],"Check real weather before making a plan.","Weather checked.","https://open-meteo.com/"],
  ["cloud-cover-checker","Cloud Cover Checker","Stars","Sky conditions","weather",["momdad","elsie","katrina"],"Check cloud cover before stargazing.","Cloud cover checked.","https://www.cleardarksky.com/c/BsBlnIObMOkey.html?1"],
  ["star-looker","Star Looker","Stars","Simple stargazing","stars",["jules"],"Look up safely with grownups.","Star Looker unlocked.",""],
  ["stargazing-team","Stargazing Team","Stars","Family sky session","stars",["all"],"Use the night sky as part of the trip.","Stargazing team unlocked.","https://www.cleardarksky.com/c/BsBlnIObMOkey.html?1"],
  ["summer-triangle-finder","Summer Triangle Finder","Stars","Summer Triangle","stars",["elsie","katrina","eliette"],"Look high overhead for Vega, Deneb, and Altair.","Summer Triangle found.",""],
  ["first-photo-captured","First Photo Captured","Photos","Trip memory","capture",["all"],"Start the trip memory collection.","First capture saved.",""],
  ["detail-collector","Detail Collector","Photos","Small details","capture",["eliette"],"Capture or save a detail-oriented item.","Detail collected.",""],
  ["trip-shortlist-starter","Trip Shortlist Starter","Shortlist","Saved item","shortlist",["all"],"Save something worth remembering or planning around.","Trip Shortlist started.",""],
  ["family-vote-starter","Family Vote Starter","Votes","Family choice","vote",["all"],"Help choose what the family might do.","First family vote recorded.",""],
  ["plan-approved","Plan Approved","Planning","Approved plan","approve",["momdad"],"Approve a saved or voted item into the real plan.","Plan approved.",""],
  ["ferry-return-ready","Ferry Return Ready","Return","Return ferry","startReturn",["momdad","emma"],"Put the return crossing on the radar.","Return ferry ready.","https://plaunttransportation.com/"],
  ["homeward-bound","Homeward Bound","Return","Return route","startReturn",["all"],"The trip turns toward home.","Homeward bound unlocked.",""],
  ["return-road-warrior","Return Road Warrior","Return","Long road home","manual",["all"],"Handle the road back.","Return road warrior unlocked.",""],
  ["full-route-complete","Full Route Complete","Completion","Whole trip","completeTrip",["all"],"Complete the full route.","Full route complete.",""],
  ["teacher-fact-builder","Teacher Fact Builder","Learning","Teachable facts","activity",["elsie"],"Explain a place in younger-kid language.","Teacher fact built.",""],
  ["suspense-story-finder","Suspense-Light Story Finder","Story","Safe mystery","activity",["elsie"],"Find a safe suspense story hook.","Safe suspense story found.",""],
  ["hidden-fact-hunter","Hidden Fact Hunter","Learning","Hidden facts","activity",["katrina"],"Save or complete a history or trivia item.","Hidden fact hunted.",""],
  ["timeline-detective","Timeline Detective","History","Timeline task","activity",["katrina"],"Complete a timeline or history task.","Timeline detective unlocked.",""],
  ["real-life-explorer","Real-Life Explorer","Community","Daily life","activity",["emma"],"Complete a daily-life or community activity.","Real-life exploring unlocked.",""],
  ["community-connector","Community Connector","Community","Sports/community","activity",["emma"],"Notice how people gather, play, or work.","Community connection made.",""],
  ["cozy-sky-watcher","Cozy Sky Watcher","Stars","Cozy sky setup","stars",["eliette"],"Use color, comfort, and detail while stargazing.","Cozy sky watched.",""],
  ["captain-choice","Captain Choice","Jules","Captain decision","vote",["jules"],"Make a simple captain choice.","Captain choice made.",""],
  ["big-machine-spotter","Big Machine Spotter","Jules","Trucks/boats/machines","activity",["jules"],"Spot a machine and say what it does.","Big machine spotted.",""],
  ["source-checker","Source Checker","Sources","Official source","source",["momdad"],"Open or verify an official source.","Official source checked.",""],
  ["logistics-captain","Logistics Captain","Planning","Logistics check","approve",["momdad"],"Approve weather, route, ferry, or family plan details.","Logistics captain unlocked.",""]
].map(([id,title,category,segment,trigger,profiles,locked,earned,sourceUrl]) => ({
  id, title, category, segment, trigger, profiles, locked, earned, sourceUrl,
  icon: category.toLowerCase().replaceAll(" ", "-")
}));

window.TRIP_DATA.dateDisplayMap = {
  "2026-07-31": "2026-07-24",
  "2026-08-01": "2026-07-25",
  "2026-08-02": "2026-07-26",
  "2026-08-03": "2026-07-27",
  "2026-08-04": "2026-07-28",
  "2026-08-05": "2026-07-29",
  "2026-08-06": "2026-07-30",
  "2026-08-07": "2026-07-31",
  "2026-08-08": "2026-08-01",
  "2026-08-09": "2026-08-02"
};

window.TRIP_DATA.displayDate = function displayDate(date) {
  return window.TRIP_DATA.dateDisplayMap[date] || date;
};

window.TRIP_DATA.days.forEach((day) => {
  day.displayDate = window.TRIP_DATA.displayDate(day.date);
});
