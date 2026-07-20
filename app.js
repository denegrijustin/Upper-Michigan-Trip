(function () {
  const data = window.TRIP_DATA;
  const WEATHER_TTL = 30 * 60 * 1000;
  const state = loadState();
  let activeProfile = state.profile || "elsie";
  let activePage = "today";
  let watchId = null;
  let lastGpsRender = 0;
  let routeMap = null;
  let homeMap = null;
  let exploreMap = null;
  let mapLibreLoading = null;
  let lastRouteOrigin = null;
  let liveRouteResults = {};
  let modalReturnFocus = null;
  const EMBEDDED_TRIP_STOPS = [
  {
    "id": "P1-001",
    "title": "Mahaffie Stagecoach Stop & Farm",
    "name": "Mahaffie Stagecoach Stop & Farm",
    "category": "Historic Site",
    "latitude": 38.8816,
    "longitude": -94.8198,
    "lat": 38.8816,
    "lon": -94.8198,
    "lng": -94.8198,
    "phase": "Phase 1",
    "routeSegment": "Olathe / Kansas City",
    "route_segment": "Olathe / Kansas City",
    "tier": "Core",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.mahaffie.org",
    "official_website": "https://www.mahaffie.org",
    "learnMoreUrl": "https://www.mahaffie.org",
    "learn_more": "https://www.mahaffie.org",
    "sourceUrl": "https://www.mahaffie.org",
    "shortSummary": "Santa Fe Trail-era stagecoach stop and working farm in Olathe.",
    "summary": "Santa Fe Trail-era stagecoach stop and working farm in Olathe.",
    "whyItMatters": "Great starting point because it connects your drive to earlier overland travel routes.",
    "why": "Great starting point because it connects your drive to earlier overland travel routes.",
    "notes": {
      "elsie": "Compare old trail travel to this road trip.",
      "katrina": "Ask why towns grew around trails and stopping points.",
      "emma": "Notice how chores, food, and travel worked before cars.",
      "eliette": "Look for small farm details, signs, and tools.",
      "jules": "Stagecoach and farm animals make this an easy first mission.",
      "momdad": "Great starting point because it connects your drive to earlier overland travel routes."
    },
    "profiles": {
      "elsie": "Compare old trail travel to this road trip.",
      "katrina": "Ask why towns grew around trails and stopping points.",
      "emma": "Notice how chores, food, and travel worked before cars.",
      "eliette": "Look for small farm details, signs, and tools.",
      "jules": "Stagecoach and farm animals make this an easy first mission.",
      "momdad": "Great starting point because it connects your drive to earlier overland travel routes."
    },
    "csvOrder": 1
  },
  {
    "id": "P1-002",
    "title": "Ernie Miller Nature Center",
    "name": "Ernie Miller Nature Center",
    "category": "Nature Center",
    "latitude": 38.8844,
    "longitude": -94.8578,
    "lat": 38.8844,
    "lon": -94.8578,
    "lng": -94.8578,
    "phase": "Phase 1",
    "routeSegment": "Olathe / Kansas City",
    "route_segment": "Olathe / Kansas City",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.jcprd.com/Facilities/Facility/Details/Ernie-Miller-Park-Nature-Center-15",
    "official_website": "https://www.jcprd.com/Facilities/Facility/Details/Ernie-Miller-Park-Nature-Center-15",
    "learnMoreUrl": "https://www.jcprd.com/Facilities/Facility/Details/Ernie-Miller-Park-Nature-Center-15",
    "learn_more": "https://www.jcprd.com/Facilities/Facility/Details/Ernie-Miller-Park-Nature-Center-15",
    "sourceUrl": "https://www.jcprd.com/Facilities/Facility/Details/Ernie-Miller-Park-Nature-Center-15",
    "shortSummary": "Local nature center with trails and Kansas wildlife interpretation.",
    "summary": "Local nature center with trails and Kansas wildlife interpretation.",
    "whyItMatters": "Good outdoor reset before the long eastbound drive.",
    "why": "Good outdoor reset before the long eastbound drive.",
    "notes": {
      "elsie": "Look for habitats and animal signs.",
      "katrina": "Ask what animals live near cities and why.",
      "emma": "Spot how nature and suburbs share space.",
      "eliette": "Find one tiny detail on the trail.",
      "jules": "Look for birds, bugs, and tracks.",
      "momdad": "Good outdoor reset before the long eastbound drive."
    },
    "profiles": {
      "elsie": "Look for habitats and animal signs.",
      "katrina": "Ask what animals live near cities and why.",
      "emma": "Spot how nature and suburbs share space.",
      "eliette": "Find one tiny detail on the trail.",
      "jules": "Look for birds, bugs, and tracks.",
      "momdad": "Good outdoor reset before the long eastbound drive."
    },
    "csvOrder": 2
  },
  {
    "id": "P1-003",
    "title": "Museum at Prairiefire",
    "name": "Museum at Prairiefire",
    "category": "Science Museum",
    "latitude": 38.8838,
    "longitude": -94.6358,
    "lat": 38.8838,
    "lon": -94.6358,
    "lng": -94.6358,
    "phase": "Phase 1",
    "routeSegment": "Olathe / Kansas City",
    "route_segment": "Olathe / Kansas City",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://museumatpf.org/",
    "official_website": "https://museumatpf.org/",
    "learnMoreUrl": "https://museumatpf.org/",
    "learn_more": "https://museumatpf.org/",
    "sourceUrl": "https://museumatpf.org/",
    "shortSummary": "Science and discovery museum with a striking colored-glass building.",
    "summary": "Science and discovery museum with a striking colored-glass building.",
    "whyItMatters": "Strong curiosity stop with visual impact and kid-friendly exhibits.",
    "why": "Strong curiosity stop with visual impact and kid-friendly exhibits.",
    "notes": {
      "elsie": "Use the building as a design and science observation.",
      "katrina": "Pick one exhibit and ask how scientists know it is true.",
      "emma": "Connect science to everyday life.",
      "eliette": "Find the coolest color, shape, or object.",
      "jules": "Look for dinosaurs or animals first.",
      "momdad": "Strong curiosity stop with visual impact and kid-friendly exhibits."
    },
    "profiles": {
      "elsie": "Use the building as a design and science observation.",
      "katrina": "Pick one exhibit and ask how scientists know it is true.",
      "emma": "Connect science to everyday life.",
      "eliette": "Find the coolest color, shape, or object.",
      "jules": "Look for dinosaurs or animals first.",
      "momdad": "Strong curiosity stop with visual impact and kid-friendly exhibits."
    },
    "csvOrder": 3
  },
  {
    "id": "P1-004",
    "title": "Overland Park Arboretum & Botanical Gardens",
    "name": "Overland Park Arboretum & Botanical Gardens",
    "category": "Garden",
    "latitude": 38.843,
    "longitude": -94.6885,
    "lat": 38.843,
    "lon": -94.6885,
    "lng": -94.6885,
    "phase": "Phase 1",
    "routeSegment": "Olathe / Kansas City",
    "route_segment": "Olathe / Kansas City",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.opkansas.org/recreation-fun/arboretum-botanical-gardens/",
    "official_website": "https://www.opkansas.org/recreation-fun/arboretum-botanical-gardens/",
    "learnMoreUrl": "https://www.opkansas.org/recreation-fun/arboretum-botanical-gardens/",
    "learn_more": "https://www.opkansas.org/recreation-fun/arboretum-botanical-gardens/",
    "sourceUrl": "https://www.opkansas.org/recreation-fun/arboretum-botanical-gardens/",
    "shortSummary": "Large botanical garden and trail area in southern Overland Park.",
    "summary": "Large botanical garden and trail area in southern Overland Park.",
    "whyItMatters": "A calm outdoor reset before the highway miles.",
    "why": "A calm outdoor reset before the highway miles.",
    "notes": {
      "elsie": "Notice plant patterns and animal habitats.",
      "katrina": "Ask why certain plants thrive here.",
      "emma": "Pick a favorite path or garden space.",
      "eliette": "Look for colors, textures, and small details.",
      "jules": "Find water, flowers, or a bridge.",
      "momdad": "A calm outdoor reset before the highway miles."
    },
    "profiles": {
      "elsie": "Notice plant patterns and animal habitats.",
      "katrina": "Ask why certain plants thrive here.",
      "emma": "Pick a favorite path or garden space.",
      "eliette": "Look for colors, textures, and small details.",
      "jules": "Find water, flowers, or a bridge.",
      "momdad": "A calm outdoor reset before the highway miles."
    },
    "csvOrder": 4
  },
  {
    "id": "P1-005",
    "title": "Deanna Rose Children's Farmstead",
    "name": "Deanna Rose Children's Farmstead",
    "category": "Family Attraction",
    "latitude": 38.8789,
    "longitude": -94.7129,
    "lat": 38.8789,
    "lon": -94.7129,
    "lng": -94.7129,
    "phase": "Phase 1",
    "routeSegment": "Olathe / Kansas City",
    "route_segment": "Olathe / Kansas City",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.opkansas.org/recreation-fun/deanna-rose-childrens-farmstead/",
    "official_website": "https://www.opkansas.org/recreation-fun/deanna-rose-childrens-farmstead/",
    "learnMoreUrl": "https://www.opkansas.org/recreation-fun/deanna-rose-childrens-farmstead/",
    "learn_more": "https://www.opkansas.org/recreation-fun/deanna-rose-childrens-farmstead/",
    "sourceUrl": "https://www.opkansas.org/recreation-fun/deanna-rose-childrens-farmstead/",
    "shortSummary": "Family farmstead with animals, gardens, schoolhouse, and Kansas life exhibits.",
    "summary": "Family farmstead with animals, gardens, schoolhouse, and Kansas life exhibits.",
    "whyItMatters": "Great kid-friendly launch point tied to farming and local history.",
    "why": "Great kid-friendly launch point tied to farming and local history.",
    "notes": {
      "elsie": "Think about how kids learned and worked on farms.",
      "katrina": "Ask how farm life changed over time.",
      "emma": "Compare farm routines to your daily routines.",
      "eliette": "Find the cutest animal or best small detail.",
      "jules": "Animal mission: count goats, cows, and chickens.",
      "momdad": "Great kid-friendly launch point tied to farming and local history."
    },
    "profiles": {
      "elsie": "Think about how kids learned and worked on farms.",
      "katrina": "Ask how farm life changed over time.",
      "emma": "Compare farm routines to your daily routines.",
      "eliette": "Find the cutest animal or best small detail.",
      "jules": "Animal mission: count goats, cows, and chickens.",
      "momdad": "Great kid-friendly launch point tied to farming and local history."
    },
    "csvOrder": 5
  },
  {
    "id": "P1-006",
    "title": "National WWI Museum and Memorial",
    "name": "National WWI Museum and Memorial",
    "category": "History Museum",
    "latitude": 39.0805,
    "longitude": -94.5858,
    "lat": 39.0805,
    "lon": -94.5858,
    "lng": -94.5858,
    "phase": "Phase 1",
    "routeSegment": "Kansas City",
    "route_segment": "Kansas City",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://www.theworldwar.org/",
    "official_website": "https://www.theworldwar.org/",
    "learnMoreUrl": "https://www.theworldwar.org/",
    "learn_more": "https://www.theworldwar.org/",
    "sourceUrl": "https://www.theworldwar.org/",
    "shortSummary": "National museum and memorial dedicated to World War I.",
    "summary": "National museum and memorial dedicated to World War I.",
    "whyItMatters": "Major Kansas City anchor and one of the strongest history stops on the route.",
    "why": "Major Kansas City anchor and one of the strongest history stops on the route.",
    "notes": {
      "elsie": "Consider how one war changed the modern world.",
      "katrina": "Ask why countries got pulled into the war.",
      "emma": "Notice how technology changed daily life and war.",
      "eliette": "Find one artifact that tells a story.",
      "jules": "Look for flags, uniforms, and big machines.",
      "momdad": "Major Kansas City anchor and one of the strongest history stops on the route."
    },
    "profiles": {
      "elsie": "Consider how one war changed the modern world.",
      "katrina": "Ask why countries got pulled into the war.",
      "emma": "Notice how technology changed daily life and war.",
      "eliette": "Find one artifact that tells a story.",
      "jules": "Look for flags, uniforms, and big machines.",
      "momdad": "Major Kansas City anchor and one of the strongest history stops on the route."
    },
    "csvOrder": 6
  },
  {
    "id": "P1-007",
    "title": "Union Station Kansas City",
    "name": "Union Station Kansas City",
    "category": "Historic Site",
    "latitude": 39.0849,
    "longitude": -94.5856,
    "lat": 39.0849,
    "lon": -94.5856,
    "lng": -94.5856,
    "phase": "Phase 1",
    "routeSegment": "Kansas City",
    "route_segment": "Kansas City",
    "tier": "Core",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://unionstation.org/",
    "official_website": "https://unionstation.org/",
    "learnMoreUrl": "https://unionstation.org/",
    "learn_more": "https://unionstation.org/",
    "sourceUrl": "https://unionstation.org/",
    "shortSummary": "Restored historic train station with exhibits and family attractions.",
    "summary": "Restored historic train station with exhibits and family attractions.",
    "whyItMatters": "Connects the road trip to rail travel and city growth.",
    "why": "Connects the road trip to rail travel and city growth.",
    "notes": {
      "elsie": "Compare train travel to car travel.",
      "katrina": "Ask why stations became city landmarks.",
      "emma": "Notice crowds, schedules, and movement.",
      "eliette": "Look for old architecture details.",
      "jules": "Big building mission: find the tallest ceiling.",
      "momdad": "Connects the road trip to rail travel and city growth."
    },
    "profiles": {
      "elsie": "Compare train travel to car travel.",
      "katrina": "Ask why stations became city landmarks.",
      "emma": "Notice crowds, schedules, and movement.",
      "eliette": "Look for old architecture details.",
      "jules": "Big building mission: find the tallest ceiling.",
      "momdad": "Connects the road trip to rail travel and city growth."
    },
    "csvOrder": 7
  },
  {
    "id": "P1-008",
    "title": "Negro Leagues Baseball Museum",
    "name": "Negro Leagues Baseball Museum",
    "category": "History Museum",
    "latitude": 39.0914,
    "longitude": -94.5636,
    "lat": 39.0914,
    "lon": -94.5636,
    "lng": -94.5636,
    "phase": "Phase 1",
    "routeSegment": "Kansas City",
    "route_segment": "Kansas City",
    "tier": "Core",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.nlbm.com/",
    "official_website": "https://www.nlbm.com/",
    "learnMoreUrl": "https://www.nlbm.com/",
    "learn_more": "https://www.nlbm.com/",
    "sourceUrl": "https://www.nlbm.com/",
    "shortSummary": "Museum preserving Negro Leagues baseball history.",
    "summary": "Museum preserving Negro Leagues baseball history.",
    "whyItMatters": "Important sports, civil rights, and Kansas City history stop.",
    "why": "Important sports, civil rights, and Kansas City history stop.",
    "notes": {
      "elsie": "Track how sports can tell a bigger justice story.",
      "katrina": "Ask why separate leagues existed and what changed.",
      "emma": "Connect sports to fairness and community.",
      "eliette": "Find a uniform, logo, or photo detail.",
      "jules": "Baseball mission: look for bats, balls, and jerseys.",
      "momdad": "Important sports, civil rights, and Kansas City history stop."
    },
    "profiles": {
      "elsie": "Track how sports can tell a bigger justice story.",
      "katrina": "Ask why separate leagues existed and what changed.",
      "emma": "Connect sports to fairness and community.",
      "eliette": "Find a uniform, logo, or photo detail.",
      "jules": "Baseball mission: look for bats, balls, and jerseys.",
      "momdad": "Important sports, civil rights, and Kansas City history stop."
    },
    "csvOrder": 8
  },
  {
    "id": "P1-009",
    "title": "Arabia Steamboat Museum",
    "name": "Arabia Steamboat Museum",
    "category": "Museum",
    "latitude": 39.108,
    "longitude": -94.5854,
    "lat": 39.108,
    "lon": -94.5854,
    "lng": -94.5854,
    "phase": "Phase 1",
    "routeSegment": "Kansas City",
    "route_segment": "Kansas City",
    "tier": "Core",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.1856.com/",
    "official_website": "https://www.1856.com/",
    "learnMoreUrl": "https://www.1856.com/",
    "learn_more": "https://www.1856.com/",
    "sourceUrl": "https://www.1856.com/",
    "shortSummary": "Museum of recovered cargo from the steamboat Arabia.",
    "summary": "Museum of recovered cargo from the steamboat Arabia.",
    "whyItMatters": "Shows what everyday goods looked like in the 1850s.",
    "why": "Shows what everyday goods looked like in the 1850s.",
    "notes": {
      "elsie": "Think about how objects survive and tell stories.",
      "katrina": "Ask what people needed before modern stores.",
      "emma": "Compare old products to things we buy today.",
      "eliette": "Find the weirdest object on display.",
      "jules": "Treasure hunt: spot something shiny or strange.",
      "momdad": "Shows what everyday goods looked like in the 1850s."
    },
    "profiles": {
      "elsie": "Think about how objects survive and tell stories.",
      "katrina": "Ask what people needed before modern stores.",
      "emma": "Compare old products to things we buy today.",
      "eliette": "Find the weirdest object on display.",
      "jules": "Treasure hunt: spot something shiny or strange.",
      "momdad": "Shows what everyday goods looked like in the 1850s."
    },
    "csvOrder": 9
  },
  {
    "id": "P1-010",
    "title": "Science City at Union Station",
    "name": "Science City at Union Station",
    "category": "Science Museum",
    "latitude": 39.0851,
    "longitude": -94.5856,
    "lat": 39.0851,
    "lon": -94.5856,
    "lng": -94.5856,
    "phase": "Phase 1",
    "routeSegment": "Kansas City",
    "route_segment": "Kansas City",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://sciencecity.unionstation.org/",
    "official_website": "https://sciencecity.unionstation.org/",
    "learnMoreUrl": "https://sciencecity.unionstation.org/",
    "learn_more": "https://sciencecity.unionstation.org/",
    "sourceUrl": "https://sciencecity.unionstation.org/",
    "shortSummary": "Hands-on science center inside Union Station.",
    "summary": "Hands-on science center inside Union Station.",
    "whyItMatters": "Useful if the family needs an interactive indoor stop.",
    "why": "Useful if the family needs an interactive indoor stop.",
    "notes": {
      "elsie": "Pick one experiment and explain what happened.",
      "katrina": "Ask what made the experiment work.",
      "emma": "Try one activity and explain it simply.",
      "eliette": "Find the most colorful exhibit.",
      "jules": "Push buttons and test one science idea.",
      "momdad": "Useful if the family needs an interactive indoor stop."
    },
    "profiles": {
      "elsie": "Pick one experiment and explain what happened.",
      "katrina": "Ask what made the experiment work.",
      "emma": "Try one activity and explain it simply.",
      "eliette": "Find the most colorful exhibit.",
      "jules": "Push buttons and test one science idea.",
      "momdad": "Useful if the family needs an interactive indoor stop."
    },
    "csvOrder": 10
  },
  {
    "id": "P1-011",
    "title": "Liberty Jail Historic Site",
    "name": "Liberty Jail Historic Site",
    "category": "Historic Site",
    "latitude": 39.2453,
    "longitude": -94.4183,
    "lat": 39.2453,
    "lon": -94.4183,
    "lng": -94.4183,
    "phase": "Phase 1",
    "routeSegment": "Kansas City Northland",
    "route_segment": "Kansas City Northland",
    "tier": "Good Reset",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://history.churchofjesuschrist.org/subsection/historic-sites/missouri/liberty-jail",
    "official_website": "https://history.churchofjesuschrist.org/subsection/historic-sites/missouri/liberty-jail",
    "learnMoreUrl": "https://history.churchofjesuschrist.org/subsection/historic-sites/missouri/liberty-jail",
    "learn_more": "https://history.churchofjesuschrist.org/subsection/historic-sites/missouri/liberty-jail",
    "sourceUrl": "https://history.churchofjesuschrist.org/subsection/historic-sites/missouri/liberty-jail",
    "shortSummary": "Historic reconstruction and interpretation site in Liberty, Missouri.",
    "summary": "Historic reconstruction and interpretation site in Liberty, Missouri.",
    "whyItMatters": "Adds a religious-history and frontier-conflict layer near the route.",
    "why": "Adds a religious-history and frontier-conflict layer near the route.",
    "notes": {
      "elsie": "Consider how place shapes memory.",
      "katrina": "Ask why people preserve difficult places.",
      "emma": "Think about how communities tell history.",
      "eliette": "Look for small reconstructed details.",
      "jules": "Find the stone walls and count steps.",
      "momdad": "Adds a religious-history and frontier-conflict layer near the route."
    },
    "profiles": {
      "elsie": "Consider how place shapes memory.",
      "katrina": "Ask why people preserve difficult places.",
      "emma": "Think about how communities tell history.",
      "eliette": "Look for small reconstructed details.",
      "jules": "Find the stone walls and count steps.",
      "momdad": "Adds a religious-history and frontier-conflict layer near the route."
    },
    "csvOrder": 11
  },
  {
    "id": "P1-012",
    "title": "Jesse James Birthplace Museum",
    "name": "Jesse James Birthplace Museum",
    "category": "Historic Site",
    "latitude": 39.3032,
    "longitude": -94.361,
    "lat": 39.3032,
    "lon": -94.361,
    "lng": -94.361,
    "phase": "Phase 1",
    "routeSegment": "Kearney / Missouri",
    "route_segment": "Kearney / Missouri",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.jessejamesmuseum.org/",
    "official_website": "https://www.jessejamesmuseum.org/",
    "learnMoreUrl": "https://www.jessejamesmuseum.org/",
    "learn_more": "https://www.jessejamesmuseum.org/",
    "sourceUrl": "https://www.jessejamesmuseum.org/",
    "shortSummary": "Museum at the James family farm near Kearney.",
    "summary": "Museum at the James family farm near Kearney.",
    "whyItMatters": "Good route oddity/history stop tied to outlaw mythology.",
    "why": "Good route oddity/history stop tied to outlaw mythology.",
    "notes": {
      "elsie": "Separate legend from fact.",
      "katrina": "Ask how stories about outlaws get exaggerated.",
      "emma": "Notice how fame can come from bad choices.",
      "eliette": "Find one object that feels like a clue.",
      "jules": "Cowboy/outlaw mission with grown-up context.",
      "momdad": "Good route oddity/history stop tied to outlaw mythology."
    },
    "profiles": {
      "elsie": "Separate legend from fact.",
      "katrina": "Ask how stories about outlaws get exaggerated.",
      "emma": "Notice how fame can come from bad choices.",
      "eliette": "Find one object that feels like a clue.",
      "jules": "Cowboy/outlaw mission with grown-up context.",
      "momdad": "Good route oddity/history stop tied to outlaw mythology."
    },
    "csvOrder": 12
  },
  {
    "id": "P1-013",
    "title": "Watkins Woolen Mill State Historic Site",
    "name": "Watkins Woolen Mill State Historic Site",
    "category": "Historic Site",
    "latitude": 39.4992,
    "longitude": -94.0771,
    "lat": 39.4992,
    "lon": -94.0771,
    "lng": -94.0771,
    "phase": "Phase 1",
    "routeSegment": "Missouri I-70 region",
    "route_segment": "Missouri I-70 region",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://mostateparks.com/park/watkins-woolen-mill-state-park-and-state-historic-site",
    "official_website": "https://mostateparks.com/park/watkins-woolen-mill-state-park-and-state-historic-site",
    "learnMoreUrl": "https://mostateparks.com/park/watkins-woolen-mill-state-park-and-state-historic-site",
    "learn_more": "https://mostateparks.com/park/watkins-woolen-mill-state-park-and-state-historic-site",
    "sourceUrl": "https://mostateparks.com/park/watkins-woolen-mill-state-park-and-state-historic-site",
    "shortSummary": "Preserved 19th-century woolen mill and state historic site.",
    "summary": "Preserved 19th-century woolen mill and state historic site.",
    "whyItMatters": "Shows work, industry, and family life before modern factories.",
    "why": "Shows work, industry, and family life before modern factories.",
    "notes": {
      "elsie": "Compare old machines to modern manufacturing.",
      "katrina": "Ask how clothing was made before big stores.",
      "emma": "Connect work, water, machines, and daily life.",
      "eliette": "Look for textures: wool, wood, gears.",
      "jules": "Machine mission: find wheels and belts.",
      "momdad": "Shows work, industry, and family life before modern factories."
    },
    "profiles": {
      "elsie": "Compare old machines to modern manufacturing.",
      "katrina": "Ask how clothing was made before big stores.",
      "emma": "Connect work, water, machines, and daily life.",
      "eliette": "Look for textures: wool, wood, gears.",
      "jules": "Machine mission: find wheels and belts.",
      "momdad": "Shows work, industry, and family life before modern factories."
    },
    "csvOrder": 13
  },
  {
    "id": "P1-014",
    "title": "Battle of Lexington State Historic Site",
    "name": "Battle of Lexington State Historic Site",
    "category": "Civil War Site",
    "latitude": 39.1833,
    "longitude": -93.8811,
    "lat": 39.1833,
    "lon": -93.8811,
    "lng": -93.8811,
    "phase": "Phase 1",
    "routeSegment": "Lexington / Missouri",
    "route_segment": "Lexington / Missouri",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://mostateparks.com/park/battle-lexington-state-historic-site",
    "official_website": "https://mostateparks.com/park/battle-lexington-state-historic-site",
    "learnMoreUrl": "https://mostateparks.com/park/battle-lexington-state-historic-site",
    "learn_more": "https://mostateparks.com/park/battle-lexington-state-historic-site",
    "sourceUrl": "https://mostateparks.com/park/battle-lexington-state-historic-site",
    "shortSummary": "Civil War battlefield site in Lexington, Missouri.",
    "summary": "Civil War battlefield site in Lexington, Missouri.",
    "whyItMatters": "Adds Missouri Civil War context along the outbound corridor.",
    "why": "Adds Missouri Civil War context along the outbound corridor.",
    "notes": {
      "elsie": "Think about how geography affected battles.",
      "katrina": "Ask why Missouri was so divided.",
      "emma": "Notice how towns remember conflict.",
      "eliette": "Find a cannon or marker detail.",
      "jules": "Look for big open spaces and flags.",
      "momdad": "Adds Missouri Civil War context along the outbound corridor."
    },
    "profiles": {
      "elsie": "Think about how geography affected battles.",
      "katrina": "Ask why Missouri was so divided.",
      "emma": "Notice how towns remember conflict.",
      "eliette": "Find a cannon or marker detail.",
      "jules": "Look for big open spaces and flags.",
      "momdad": "Adds Missouri Civil War context along the outbound corridor."
    },
    "csvOrder": 14
  },
  {
    "id": "P1-015",
    "title": "Warm Springs Ranch",
    "name": "Warm Springs Ranch",
    "category": "Family Attraction",
    "latitude": 38.8956,
    "longitude": -92.7282,
    "lat": 38.8956,
    "lon": -92.7282,
    "lng": -92.7282,
    "phase": "Phase 1",
    "routeSegment": "Boonville / Missouri",
    "route_segment": "Boonville / Missouri",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.warmspringsranch.com/",
    "official_website": "https://www.warmspringsranch.com/",
    "learnMoreUrl": "https://www.warmspringsranch.com/",
    "learn_more": "https://www.warmspringsranch.com/",
    "sourceUrl": "https://www.warmspringsranch.com/",
    "shortSummary": "Home of the Budweiser Clydesdales breeding operation near Boonville.",
    "summary": "Home of the Budweiser Clydesdales breeding operation near Boonville.",
    "whyItMatters": "Great family animal stop near the I-70 corridor.",
    "why": "Great family animal stop near the I-70 corridor.",
    "notes": {
      "elsie": "Watch how large animals are cared for.",
      "katrina": "Ask what jobs people do at a horse ranch.",
      "emma": "Notice routines, feeding, and teamwork.",
      "eliette": "Find the best horse detail.",
      "jules": "Big horse mission.",
      "momdad": "Great family animal stop near the I-70 corridor."
    },
    "profiles": {
      "elsie": "Watch how large animals are cared for.",
      "katrina": "Ask what jobs people do at a horse ranch.",
      "emma": "Notice routines, feeding, and teamwork.",
      "eliette": "Find the best horse detail.",
      "jules": "Big horse mission.",
      "momdad": "Great family animal stop near the I-70 corridor."
    },
    "csvOrder": 15
  },
  {
    "id": "P1-016",
    "title": "Rocheport Historic District",
    "name": "Rocheport Historic District",
    "category": "Small Town",
    "latitude": 38.9809,
    "longitude": -92.5615,
    "lat": 38.9809,
    "lon": -92.5615,
    "lng": -92.5615,
    "phase": "Phase 1",
    "routeSegment": "Rocheport / Missouri",
    "route_segment": "Rocheport / Missouri",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.rocheport.com/",
    "official_website": "https://www.rocheport.com/",
    "learnMoreUrl": "https://www.rocheport.com/",
    "learn_more": "https://www.rocheport.com/",
    "sourceUrl": "https://www.rocheport.com/",
    "shortSummary": "Historic Missouri River town near the Katy Trail.",
    "summary": "Historic Missouri River town near the Katy Trail.",
    "whyItMatters": "Strong scenic reset with river-town character.",
    "why": "Strong scenic reset with river-town character.",
    "notes": {
      "elsie": "Notice how rivers shape towns.",
      "katrina": "Ask why trails and rivers attract people.",
      "emma": "Compare small-town routines with city life.",
      "eliette": "Look for signs, shops, and textures.",
      "jules": "River-town walk mission.",
      "momdad": "Strong scenic reset with river-town character."
    },
    "profiles": {
      "elsie": "Notice how rivers shape towns.",
      "katrina": "Ask why trails and rivers attract people.",
      "emma": "Compare small-town routines with city life.",
      "eliette": "Look for signs, shops, and textures.",
      "jules": "River-town walk mission.",
      "momdad": "Strong scenic reset with river-town character."
    },
    "csvOrder": 16
  },
  {
    "id": "P1-017",
    "title": "Katy Trail State Park - Rocheport Trailhead",
    "name": "Katy Trail State Park - Rocheport Trailhead",
    "category": "State Park",
    "latitude": 38.9804,
    "longitude": -92.5605,
    "lat": 38.9804,
    "lon": -92.5605,
    "lng": -92.5605,
    "phase": "Phase 1",
    "routeSegment": "Rocheport / Missouri",
    "route_segment": "Rocheport / Missouri",
    "tier": "Core",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://mostateparks.com/park/katy-trail-state-park",
    "official_website": "https://mostateparks.com/park/katy-trail-state-park",
    "learnMoreUrl": "https://mostateparks.com/park/katy-trail-state-park",
    "learn_more": "https://mostateparks.com/park/katy-trail-state-park",
    "sourceUrl": "https://mostateparks.com/park/katy-trail-state-park",
    "shortSummary": "Trailhead on Missouri's long rail-trail park.",
    "summary": "Trailhead on Missouri's long rail-trail park.",
    "whyItMatters": "Great stretch-your-legs route stop with river and rail history.",
    "why": "Great stretch-your-legs route stop with river and rail history.",
    "notes": {
      "elsie": "Connect old rail lines to new trails.",
      "katrina": "Ask why old transportation routes get reused.",
      "emma": "Notice walkers, cyclists, and town life.",
      "eliette": "Find a trail marker or bridge detail.",
      "jules": "Trail mission: walk to a sign and back.",
      "momdad": "Great stretch-your-legs route stop with river and rail history."
    },
    "profiles": {
      "elsie": "Connect old rail lines to new trails.",
      "katrina": "Ask why old transportation routes get reused.",
      "emma": "Notice walkers, cyclists, and town life.",
      "eliette": "Find a trail marker or bridge detail.",
      "jules": "Trail mission: walk to a sign and back.",
      "momdad": "Great stretch-your-legs route stop with river and rail history."
    },
    "csvOrder": 17
  },
  {
    "id": "P1-018",
    "title": "Shelter Gardens",
    "name": "Shelter Gardens",
    "category": "Garden",
    "latitude": 38.951,
    "longitude": -92.3677,
    "lat": 38.951,
    "lon": -92.3677,
    "lng": -92.3677,
    "phase": "Phase 1",
    "routeSegment": "Columbia / Missouri",
    "route_segment": "Columbia / Missouri",
    "tier": "Good Reset",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://www.shelterinsurance.com/aboutshelter/sheltergardens/",
    "official_website": "https://www.shelterinsurance.com/aboutshelter/sheltergardens/",
    "learnMoreUrl": "https://www.shelterinsurance.com/aboutshelter/sheltergardens/",
    "learn_more": "https://www.shelterinsurance.com/aboutshelter/sheltergardens/",
    "sourceUrl": "https://www.shelterinsurance.com/aboutshelter/sheltergardens/",
    "shortSummary": "Public garden in Columbia, Missouri.",
    "summary": "Public garden in Columbia, Missouri.",
    "whyItMatters": "Short, calm reset on a long drive day.",
    "why": "Short, calm reset on a long drive day.",
    "notes": {
      "elsie": "Look for plant design and animal habitats.",
      "katrina": "Ask what makes a garden peaceful.",
      "emma": "Pick a favorite path or flower.",
      "eliette": "Find a tiny detail others miss.",
      "jules": "Flower and fountain mission.",
      "momdad": "Short, calm reset on a long drive day."
    },
    "profiles": {
      "elsie": "Look for plant design and animal habitats.",
      "katrina": "Ask what makes a garden peaceful.",
      "emma": "Pick a favorite path or flower.",
      "eliette": "Find a tiny detail others miss.",
      "jules": "Flower and fountain mission.",
      "momdad": "Short, calm reset on a long drive day."
    },
    "csvOrder": 18
  },
  {
    "id": "P1-019",
    "title": "University of Missouri / Faurot Field",
    "name": "University of Missouri / Faurot Field",
    "category": "College Landmark",
    "latitude": 38.9358,
    "longitude": -92.3333,
    "lat": 38.9358,
    "lon": -92.3333,
    "lng": -92.3333,
    "phase": "Phase 1",
    "routeSegment": "Columbia / Missouri",
    "route_segment": "Columbia / Missouri",
    "tier": "Good Reset",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://mutigers.com/",
    "official_website": "https://mutigers.com/",
    "learnMoreUrl": "https://mutigers.com/",
    "learn_more": "https://mutigers.com/",
    "sourceUrl": "https://mutigers.com/",
    "shortSummary": "University of Missouri sports landmark in Columbia.",
    "summary": "University of Missouri sports landmark in Columbia.",
    "whyItMatters": "Adds college-town and sports context near the route.",
    "why": "Adds college-town and sports context near the route.",
    "notes": {
      "elsie": "Think about traditions and school identity.",
      "katrina": "Ask what makes a college town feel different.",
      "emma": "Sports and community lens.",
      "eliette": "Look for logos and colors.",
      "jules": "Tiger spotting mission.",
      "momdad": "Adds college-town and sports context near the route."
    },
    "profiles": {
      "elsie": "Think about traditions and school identity.",
      "katrina": "Ask what makes a college town feel different.",
      "emma": "Sports and community lens.",
      "eliette": "Look for logos and colors.",
      "jules": "Tiger spotting mission.",
      "momdad": "Adds college-town and sports context near the route."
    },
    "csvOrder": 19
  },
  {
    "id": "P1-020",
    "title": "Missouri State Capitol",
    "name": "Missouri State Capitol",
    "category": "Historic Site",
    "latitude": 38.5767,
    "longitude": -92.1735,
    "lat": 38.5767,
    "lon": -92.1735,
    "lng": -92.1735,
    "phase": "Phase 1",
    "routeSegment": "Jefferson City / Missouri",
    "route_segment": "Jefferson City / Missouri",
    "tier": "Core",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://capitol.mo.gov/",
    "official_website": "https://capitol.mo.gov/",
    "learnMoreUrl": "https://capitol.mo.gov/",
    "learn_more": "https://capitol.mo.gov/",
    "sourceUrl": "https://capitol.mo.gov/",
    "shortSummary": "Missouri's state capitol building in Jefferson City.",
    "summary": "Missouri's state capitol building in Jefferson City.",
    "whyItMatters": "Excellent government and architecture stop on the Missouri segment.",
    "why": "Excellent government and architecture stop on the Missouri segment.",
    "notes": {
      "elsie": "Consider how public buildings communicate power.",
      "katrina": "Ask what happens in a capitol.",
      "emma": "Connect laws to daily life.",
      "eliette": "Look for murals, columns, and symbols.",
      "jules": "Big dome mission.",
      "momdad": "Excellent government and architecture stop on the Missouri segment."
    },
    "profiles": {
      "elsie": "Consider how public buildings communicate power.",
      "katrina": "Ask what happens in a capitol.",
      "emma": "Connect laws to daily life.",
      "eliette": "Look for murals, columns, and symbols.",
      "jules": "Big dome mission.",
      "momdad": "Excellent government and architecture stop on the Missouri segment."
    },
    "csvOrder": 20
  },
  {
    "id": "P1-021",
    "title": "Missouri State Penitentiary",
    "name": "Missouri State Penitentiary",
    "category": "History Museum",
    "latitude": 38.5689,
    "longitude": -92.173,
    "lat": 38.5689,
    "lon": -92.173,
    "lng": -92.173,
    "phase": "Phase 1",
    "routeSegment": "Jefferson City / Missouri",
    "route_segment": "Jefferson City / Missouri",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.missouripentours.com/",
    "official_website": "https://www.missouripentours.com/",
    "learnMoreUrl": "https://www.missouripentours.com/",
    "learn_more": "https://www.missouripentours.com/",
    "sourceUrl": "https://www.missouripentours.com/",
    "shortSummary": "Historic former prison with guided tours.",
    "summary": "Historic former prison with guided tours.",
    "whyItMatters": "Memorable, older-kid history stop with strong storytelling.",
    "why": "Memorable, older-kid history stop with strong storytelling.",
    "notes": {
      "elsie": "Think about justice, reform, and time.",
      "katrina": "Ask how prisons have changed.",
      "emma": "Compare rules, jobs, and daily routines.",
      "eliette": "Find a detail that feels like a movie set.",
      "jules": "Big door and hallway mission.",
      "momdad": "Memorable, older-kid history stop with strong storytelling."
    },
    "profiles": {
      "elsie": "Think about justice, reform, and time.",
      "katrina": "Ask how prisons have changed.",
      "emma": "Compare rules, jobs, and daily routines.",
      "eliette": "Find a detail that feels like a movie set.",
      "jules": "Big door and hallway mission.",
      "momdad": "Memorable, older-kid history stop with strong storytelling."
    },
    "csvOrder": 21
  },
  {
    "id": "P1-022",
    "title": "Arrow Rock State Historic Site",
    "name": "Arrow Rock State Historic Site",
    "category": "Historic Site",
    "latitude": 39.0687,
    "longitude": -92.9474,
    "lat": 39.0687,
    "lon": -92.9474,
    "lng": -92.9474,
    "phase": "Phase 1",
    "routeSegment": "Arrow Rock / Missouri",
    "route_segment": "Arrow Rock / Missouri",
    "tier": "Core",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://mostateparks.com/historic-site/arrow-rock-state-historic-site",
    "official_website": "https://mostateparks.com/historic-site/arrow-rock-state-historic-site",
    "learnMoreUrl": "https://mostateparks.com/historic-site/arrow-rock-state-historic-site",
    "learn_more": "https://mostateparks.com/historic-site/arrow-rock-state-historic-site",
    "sourceUrl": "https://mostateparks.com/historic-site/arrow-rock-state-historic-site",
    "shortSummary": "Preserved Missouri River village and state historic site.",
    "summary": "Preserved Missouri River village and state historic site.",
    "whyItMatters": "A strong historic small-town detour with frontier context.",
    "why": "A strong historic small-town detour with frontier context.",
    "notes": {
      "elsie": "Notice how old towns preserve stories.",
      "katrina": "Ask why this town mattered near the river.",
      "emma": "Compare old and new community life.",
      "eliette": "Look for old buildings and signs.",
      "jules": "Old town exploring mission.",
      "momdad": "A strong historic small-town detour with frontier context."
    },
    "profiles": {
      "elsie": "Notice how old towns preserve stories.",
      "katrina": "Ask why this town mattered near the river.",
      "emma": "Compare old and new community life.",
      "eliette": "Look for old buildings and signs.",
      "jules": "Old town exploring mission.",
      "momdad": "A strong historic small-town detour with frontier context."
    },
    "csvOrder": 22
  },
  {
    "id": "P1-023",
    "title": "Gateway Arch National Park",
    "name": "Gateway Arch National Park",
    "category": "National Park",
    "latitude": 38.6247,
    "longitude": -90.1848,
    "lat": 38.6247,
    "lon": -90.1848,
    "lng": -90.1848,
    "phase": "Phase 1",
    "routeSegment": "St. Louis / Missouri",
    "route_segment": "St. Louis / Missouri",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.nps.gov/jeff/",
    "official_website": "https://www.nps.gov/jeff/",
    "learnMoreUrl": "https://www.nps.gov/jeff/",
    "learn_more": "https://www.nps.gov/jeff/",
    "sourceUrl": "https://www.nps.gov/jeff/",
    "shortSummary": "National park centered on the Gateway Arch and westward expansion.",
    "summary": "National park centered on the Gateway Arch and westward expansion.",
    "whyItMatters": "Major visual landmark and NPS anchor on the route.",
    "why": "Major visual landmark and NPS anchor on the route.",
    "notes": {
      "elsie": "Think about the symbolism of a gateway.",
      "katrina": "Ask why expansion stories are complicated.",
      "emma": "Connect rivers, cities, and travel.",
      "eliette": "Find the best photo angle.",
      "jules": "Giant arch mission.",
      "momdad": "Major visual landmark and NPS anchor on the route."
    },
    "profiles": {
      "elsie": "Think about the symbolism of a gateway.",
      "katrina": "Ask why expansion stories are complicated.",
      "emma": "Connect rivers, cities, and travel.",
      "eliette": "Find the best photo angle.",
      "jules": "Giant arch mission.",
      "momdad": "Major visual landmark and NPS anchor on the route."
    },
    "csvOrder": 23
  },
  {
    "id": "P1-024",
    "title": "City Museum St. Louis",
    "name": "City Museum St. Louis",
    "category": "Roadside Oddity",
    "latitude": 38.6336,
    "longitude": -90.2004,
    "lat": 38.6336,
    "lon": -90.2004,
    "lng": -90.2004,
    "phase": "Phase 1",
    "routeSegment": "St. Louis / Missouri",
    "route_segment": "St. Louis / Missouri",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://citymuseum.org/",
    "official_website": "https://citymuseum.org/",
    "learnMoreUrl": "https://citymuseum.org/",
    "learn_more": "https://citymuseum.org/",
    "sourceUrl": "https://citymuseum.org/",
    "shortSummary": "Highly unusual interactive museum/play structure in St. Louis.",
    "summary": "Highly unusual interactive museum/play structure in St. Louis.",
    "whyItMatters": "One of the best oddball family stops on the route.",
    "why": "One of the best oddball family stops on the route.",
    "notes": {
      "elsie": "Notice how recycled objects become art.",
      "katrina": "Ask why weird design is memorable.",
      "emma": "Move, climb, and compare spaces.",
      "eliette": "Find the strangest detail.",
      "jules": "Climb-and-find mission.",
      "momdad": "One of the best oddball family stops on the route."
    },
    "profiles": {
      "elsie": "Notice how recycled objects become art.",
      "katrina": "Ask why weird design is memorable.",
      "emma": "Move, climb, and compare spaces.",
      "eliette": "Find the strangest detail.",
      "jules": "Climb-and-find mission.",
      "momdad": "One of the best oddball family stops on the route."
    },
    "csvOrder": 24
  },
  {
    "id": "P1-025",
    "title": "Missouri Botanical Garden",
    "name": "Missouri Botanical Garden",
    "category": "Garden",
    "latitude": 38.6156,
    "longitude": -90.258,
    "lat": 38.6156,
    "lon": -90.258,
    "lng": -90.258,
    "phase": "Phase 1",
    "routeSegment": "St. Louis / Missouri",
    "route_segment": "St. Louis / Missouri",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.missouribotanicalgarden.org/",
    "official_website": "https://www.missouribotanicalgarden.org/",
    "learnMoreUrl": "https://www.missouribotanicalgarden.org/",
    "learn_more": "https://www.missouribotanicalgarden.org/",
    "sourceUrl": "https://www.missouribotanicalgarden.org/",
    "shortSummary": "Major botanical garden in St. Louis.",
    "summary": "Major botanical garden in St. Louis.",
    "whyItMatters": "Good calmer alternative to downtown attractions.",
    "why": "Good calmer alternative to downtown attractions.",
    "notes": {
      "elsie": "Look for ecosystems and plant design.",
      "katrina": "Ask why plant conservation matters.",
      "emma": "Connect plants to food, weather, and health.",
      "eliette": "Find a tiny flower or pattern.",
      "jules": "Garden path mission.",
      "momdad": "Good calmer alternative to downtown attractions."
    },
    "profiles": {
      "elsie": "Look for ecosystems and plant design.",
      "katrina": "Ask why plant conservation matters.",
      "emma": "Connect plants to food, weather, and health.",
      "eliette": "Find a tiny flower or pattern.",
      "jules": "Garden path mission.",
      "momdad": "Good calmer alternative to downtown attractions."
    },
    "csvOrder": 25
  },
  {
    "id": "P1-026",
    "title": "Saint Louis Zoo",
    "name": "Saint Louis Zoo",
    "category": "Zoo",
    "latitude": 38.6365,
    "longitude": -90.2946,
    "lat": 38.6365,
    "lon": -90.2946,
    "lng": -90.2946,
    "phase": "Phase 1",
    "routeSegment": "St. Louis / Missouri",
    "route_segment": "St. Louis / Missouri",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://stlzoo.org/",
    "official_website": "https://stlzoo.org/",
    "learnMoreUrl": "https://stlzoo.org/",
    "learn_more": "https://stlzoo.org/",
    "sourceUrl": "https://stlzoo.org/",
    "shortSummary": "Large free-admission zoo in Forest Park.",
    "summary": "Large free-admission zoo in Forest Park.",
    "whyItMatters": "Strong kid-friendly stop if time allows.",
    "why": "Strong kid-friendly stop if time allows.",
    "notes": {
      "elsie": "Think about conservation and animal habitats.",
      "katrina": "Ask why zoos protect endangered animals.",
      "emma": "Pick an animal and describe its routine.",
      "eliette": "Find colors, patterns, and animal details.",
      "jules": "Animal spotting mission.",
      "momdad": "Strong kid-friendly stop if time allows."
    },
    "profiles": {
      "elsie": "Think about conservation and animal habitats.",
      "katrina": "Ask why zoos protect endangered animals.",
      "emma": "Pick an animal and describe its routine.",
      "eliette": "Find colors, patterns, and animal details.",
      "jules": "Animal spotting mission.",
      "momdad": "Strong kid-friendly stop if time allows."
    },
    "csvOrder": 26
  },
  {
    "id": "P1-027",
    "title": "Cahokia Mounds State Historic Site",
    "name": "Cahokia Mounds State Historic Site",
    "category": "Historic Site",
    "latitude": 38.6551,
    "longitude": -90.0618,
    "lat": 38.6551,
    "lon": -90.0618,
    "lng": -90.0618,
    "phase": "Phase 1",
    "routeSegment": "Collinsville / Illinois",
    "route_segment": "Collinsville / Illinois",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://cahokiamounds.org/",
    "official_website": "https://cahokiamounds.org/",
    "learnMoreUrl": "https://cahokiamounds.org/",
    "learn_more": "https://cahokiamounds.org/",
    "sourceUrl": "https://cahokiamounds.org/",
    "shortSummary": "Major Mississippian cultural site near St. Louis.",
    "summary": "Major Mississippian cultural site near St. Louis.",
    "whyItMatters": "Important Native American history stop just east of the Mississippi.",
    "why": "Important Native American history stop just east of the Mississippi.",
    "notes": {
      "elsie": "Think about cities before modern America.",
      "katrina": "Ask how people built and organized Cahokia.",
      "emma": "Connect food, trade, and community.",
      "eliette": "Look for mound shapes and landscape clues.",
      "jules": "Big hill mission.",
      "momdad": "Important Native American history stop just east of the Mississippi."
    },
    "profiles": {
      "elsie": "Think about cities before modern America.",
      "katrina": "Ask how people built and organized Cahokia.",
      "emma": "Connect food, trade, and community.",
      "eliette": "Look for mound shapes and landscape clues.",
      "jules": "Big hill mission.",
      "momdad": "Important Native American history stop just east of the Mississippi."
    },
    "csvOrder": 27
  },
  {
    "id": "P1-028",
    "title": "Lincoln Home National Historic Site",
    "name": "Lincoln Home National Historic Site",
    "category": "National Historic Site",
    "latitude": 39.7975,
    "longitude": -89.645,
    "lat": 39.7975,
    "lon": -89.645,
    "lng": -89.645,
    "phase": "Phase 1",
    "routeSegment": "Springfield / Illinois",
    "route_segment": "Springfield / Illinois",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.nps.gov/liho/",
    "official_website": "https://www.nps.gov/liho/",
    "learnMoreUrl": "https://www.nps.gov/liho/",
    "learn_more": "https://www.nps.gov/liho/",
    "sourceUrl": "https://www.nps.gov/liho/",
    "shortSummary": "National Park Service site preserving Abraham Lincoln's Springfield home.",
    "summary": "National Park Service site preserving Abraham Lincoln's Springfield home.",
    "whyItMatters": "Strong presidential-history anchor on the Illinois corridor.",
    "why": "Strong presidential-history anchor on the Illinois corridor.",
    "notes": {
      "elsie": "Consider Lincoln as a person before president.",
      "katrina": "Ask how a home can tell history.",
      "emma": "Compare old family routines to today.",
      "eliette": "Find household details and street clues.",
      "jules": "President house mission.",
      "momdad": "Strong presidential-history anchor on the Illinois corridor."
    },
    "profiles": {
      "elsie": "Consider Lincoln as a person before president.",
      "katrina": "Ask how a home can tell history.",
      "emma": "Compare old family routines to today.",
      "eliette": "Find household details and street clues.",
      "jules": "President house mission.",
      "momdad": "Strong presidential-history anchor on the Illinois corridor."
    },
    "csvOrder": 28
  },
  {
    "id": "P1-029",
    "title": "Abraham Lincoln Presidential Library and Museum",
    "name": "Abraham Lincoln Presidential Library and Museum",
    "category": "Museum",
    "latitude": 39.8018,
    "longitude": -89.6486,
    "lat": 39.8018,
    "lon": -89.6486,
    "lng": -89.6486,
    "phase": "Phase 1",
    "routeSegment": "Springfield / Illinois",
    "route_segment": "Springfield / Illinois",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://presidentlincoln.illinois.gov/",
    "official_website": "https://presidentlincoln.illinois.gov/",
    "learnMoreUrl": "https://presidentlincoln.illinois.gov/",
    "learn_more": "https://presidentlincoln.illinois.gov/",
    "sourceUrl": "https://presidentlincoln.illinois.gov/",
    "shortSummary": "Major museum focused on Abraham Lincoln's life and presidency.",
    "summary": "Major museum focused on Abraham Lincoln's life and presidency.",
    "whyItMatters": "High-value indoor history stop for the route.",
    "why": "High-value indoor history stop for the route.",
    "notes": {
      "elsie": "Trace Lincoln's life arc.",
      "katrina": "Ask how leaders make choices under pressure.",
      "emma": "Connect leadership to everyday decisions.",
      "eliette": "Find the most dramatic exhibit.",
      "jules": "Lincoln story mission.",
      "momdad": "High-value indoor history stop for the route."
    },
    "profiles": {
      "elsie": "Trace Lincoln's life arc.",
      "katrina": "Ask how leaders make choices under pressure.",
      "emma": "Connect leadership to everyday decisions.",
      "eliette": "Find the most dramatic exhibit.",
      "jules": "Lincoln story mission.",
      "momdad": "High-value indoor history stop for the route."
    },
    "csvOrder": 29
  },
  {
    "id": "P1-030",
    "title": "Pontiac Route 66 Hall of Fame & Museum",
    "name": "Pontiac Route 66 Hall of Fame & Museum",
    "category": "Roadside History",
    "latitude": 40.8793,
    "longitude": -88.6298,
    "lat": 40.8793,
    "lon": -88.6298,
    "lng": -88.6298,
    "phase": "Phase 1",
    "routeSegment": "Pontiac / Illinois",
    "route_segment": "Pontiac / Illinois",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://visitpontiac.org/experience/museums-exhibits/route-66-museum/",
    "official_website": "https://visitpontiac.org/experience/museums-exhibits/route-66-museum/",
    "learnMoreUrl": "https://visitpontiac.org/experience/museums-exhibits/route-66-museum/",
    "learn_more": "https://visitpontiac.org/experience/museums-exhibits/route-66-museum/",
    "sourceUrl": "https://visitpontiac.org/experience/museums-exhibits/route-66-museum/",
    "shortSummary": "Route 66 museum and photo stop in Pontiac, Illinois.",
    "summary": "Route 66 museum and photo stop in Pontiac, Illinois.",
    "whyItMatters": "Good road-trip meta stop about America's driving culture.",
    "why": "Good road-trip meta stop about America's driving culture.",
    "notes": {
      "elsie": "Compare old road trips with this one.",
      "katrina": "Ask why Route 66 became famous.",
      "emma": "Notice signs, cars, maps, and travel ads.",
      "eliette": "Find the best vintage sign.",
      "jules": "Road sign mission.",
      "momdad": "Good road-trip meta stop about America's driving culture."
    },
    "profiles": {
      "elsie": "Compare old road trips with this one.",
      "katrina": "Ask why Route 66 became famous.",
      "emma": "Notice signs, cars, maps, and travel ads.",
      "eliette": "Find the best vintage sign.",
      "jules": "Road sign mission.",
      "momdad": "Good road-trip meta stop about America's driving culture."
    },
    "csvOrder": 30
  },
  {
    "id": "P1-031",
    "title": "Old Joliet Prison",
    "name": "Old Joliet Prison",
    "category": "Historic Site",
    "latitude": 41.535,
    "longitude": -88.0817,
    "lat": 41.535,
    "lon": -88.0817,
    "lng": -88.0817,
    "phase": "Phase 1",
    "routeSegment": "Joliet / Illinois",
    "route_segment": "Joliet / Illinois",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.jolietprison.org/",
    "official_website": "https://www.jolietprison.org/",
    "learnMoreUrl": "https://www.jolietprison.org/",
    "learn_more": "https://www.jolietprison.org/",
    "sourceUrl": "https://www.jolietprison.org/",
    "shortSummary": "Historic prison site known for tours and filming history.",
    "summary": "Historic prison site known for tours and filming history.",
    "whyItMatters": "Memorable odd-history stop near the route.",
    "why": "Memorable odd-history stop near the route.",
    "notes": {
      "elsie": "Think about places changing purpose over time.",
      "katrina": "Ask why old buildings become tourist sites.",
      "emma": "Connect rules, history, and storytelling.",
      "eliette": "Find movie-like details.",
      "jules": "Big wall mission.",
      "momdad": "Memorable odd-history stop near the route."
    },
    "profiles": {
      "elsie": "Think about places changing purpose over time.",
      "katrina": "Ask why old buildings become tourist sites.",
      "emma": "Connect rules, history, and storytelling.",
      "eliette": "Find movie-like details.",
      "jules": "Big wall mission.",
      "momdad": "Memorable odd-history stop near the route."
    },
    "csvOrder": 31
  },
  {
    "id": "P1-032",
    "title": "Indiana Dunes National Park",
    "name": "Indiana Dunes National Park",
    "category": "National Park",
    "latitude": 41.6533,
    "longitude": -87.0524,
    "lat": 41.6533,
    "lon": -87.0524,
    "lng": -87.0524,
    "phase": "Phase 1",
    "routeSegment": "Northern Indiana",
    "route_segment": "Northern Indiana",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://www.nps.gov/indu/",
    "official_website": "https://www.nps.gov/indu/",
    "learnMoreUrl": "https://www.nps.gov/indu/",
    "learn_more": "https://www.nps.gov/indu/",
    "sourceUrl": "https://www.nps.gov/indu/",
    "shortSummary": "National park along Lake Michigan's southern shore.",
    "summary": "National park along Lake Michigan's southern shore.",
    "whyItMatters": "Major nature anchor before South Bend.",
    "why": "Major nature anchor before South Bend.",
    "notes": {
      "elsie": "Notice dunes, water, plants, and birds.",
      "katrina": "Ask how wind and water make dunes.",
      "emma": "Connect lake weather to daily plans.",
      "eliette": "Find sand patterns and beach textures.",
      "jules": "Giant sand hill mission.",
      "momdad": "Major nature anchor before South Bend."
    },
    "profiles": {
      "elsie": "Notice dunes, water, plants, and birds.",
      "katrina": "Ask how wind and water make dunes.",
      "emma": "Connect lake weather to daily plans.",
      "eliette": "Find sand patterns and beach textures.",
      "jules": "Giant sand hill mission.",
      "momdad": "Major nature anchor before South Bend."
    },
    "csvOrder": 32
  },
  {
    "id": "P1-033",
    "title": "University of Notre Dame",
    "name": "University of Notre Dame",
    "category": "Historic Campus",
    "latitude": 41.7056,
    "longitude": -86.2353,
    "lat": 41.7056,
    "lon": -86.2353,
    "lng": -86.2353,
    "phase": "Phase 1",
    "routeSegment": "South Bend / Indiana",
    "route_segment": "South Bend / Indiana",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.nd.edu/",
    "official_website": "https://www.nd.edu/",
    "learnMoreUrl": "https://www.nd.edu/",
    "learn_more": "https://www.nd.edu/",
    "sourceUrl": "https://www.nd.edu/",
    "shortSummary": "Historic university campus and South Bend overnight anchor.",
    "summary": "Historic university campus and South Bend overnight anchor.",
    "whyItMatters": "Strong overnight-area stop with sports, architecture, and Catholic context.",
    "why": "Strong overnight-area stop with sports, architecture, and Catholic context.",
    "notes": {
      "elsie": "Notice campus symbols and architecture.",
      "katrina": "Ask why traditions make places famous.",
      "emma": "Sports, school, and community lens.",
      "eliette": "Look for gold, stone, and signs.",
      "jules": "Football campus mission.",
      "momdad": "Strong overnight-area stop with sports, architecture, and Catholic context."
    },
    "profiles": {
      "elsie": "Notice campus symbols and architecture.",
      "katrina": "Ask why traditions make places famous.",
      "emma": "Sports, school, and community lens.",
      "eliette": "Look for gold, stone, and signs.",
      "jules": "Football campus mission.",
      "momdad": "Strong overnight-area stop with sports, architecture, and Catholic context."
    },
    "csvOrder": 33
  },
  {
    "id": "P1-034",
    "title": "Basilica of the Sacred Heart",
    "name": "Basilica of the Sacred Heart",
    "category": "Historic Church",
    "latitude": 41.7037,
    "longitude": -86.2375,
    "lat": 41.7037,
    "lon": -86.2375,
    "lng": -86.2375,
    "phase": "Phase 1",
    "routeSegment": "South Bend / Indiana",
    "route_segment": "South Bend / Indiana",
    "tier": "Core",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://basilica.nd.edu/",
    "official_website": "https://basilica.nd.edu/",
    "learnMoreUrl": "https://basilica.nd.edu/",
    "learn_more": "https://basilica.nd.edu/",
    "sourceUrl": "https://basilica.nd.edu/",
    "shortSummary": "Historic basilica on Notre Dame's campus.",
    "summary": "Historic basilica on Notre Dame's campus.",
    "whyItMatters": "Short, meaningful architecture and faith stop.",
    "why": "Short, meaningful architecture and faith stop.",
    "notes": {
      "elsie": "Think about sacred space and design.",
      "katrina": "Ask why churches use art and symbols.",
      "emma": "Notice quiet routines and respect.",
      "eliette": "Find stained glass details.",
      "jules": "Quiet looking mission.",
      "momdad": "Short, meaningful architecture and faith stop."
    },
    "profiles": {
      "elsie": "Think about sacred space and design.",
      "katrina": "Ask why churches use art and symbols.",
      "emma": "Notice quiet routines and respect.",
      "eliette": "Find stained glass details.",
      "jules": "Quiet looking mission.",
      "momdad": "Short, meaningful architecture and faith stop."
    },
    "csvOrder": 34
  },
  {
    "id": "P1-035",
    "title": "Studebaker National Museum",
    "name": "Studebaker National Museum",
    "category": "Museum",
    "latitude": 41.6698,
    "longitude": -86.2513,
    "lat": 41.6698,
    "lon": -86.2513,
    "lng": -86.2513,
    "phase": "Phase 1",
    "routeSegment": "South Bend / Indiana",
    "route_segment": "South Bend / Indiana",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://studebakermuseum.org/",
    "official_website": "https://studebakermuseum.org/",
    "learnMoreUrl": "https://studebakermuseum.org/",
    "learn_more": "https://studebakermuseum.org/",
    "sourceUrl": "https://studebakermuseum.org/",
    "shortSummary": "Vehicle museum preserving Studebaker history.",
    "summary": "Vehicle museum preserving Studebaker history.",
    "whyItMatters": "Great South Bend stop tying vehicles to American industry.",
    "why": "Great South Bend stop tying vehicles to American industry.",
    "notes": {
      "elsie": "Track wagons to cars to modern travel.",
      "katrina": "Ask how companies adapt over time.",
      "emma": "Connect transportation to daily life.",
      "eliette": "Find logos, colors, and details.",
      "jules": "Car and wheel mission.",
      "momdad": "Great South Bend stop tying vehicles to American industry."
    },
    "profiles": {
      "elsie": "Track wagons to cars to modern travel.",
      "katrina": "Ask how companies adapt over time.",
      "emma": "Connect transportation to daily life.",
      "eliette": "Find logos, colors, and details.",
      "jules": "Car and wheel mission.",
      "momdad": "Great South Bend stop tying vehicles to American industry."
    },
    "csvOrder": 35
  },
  {
    "id": "P2-001",
    "title": "South Bend Chocolate Company",
    "name": "South Bend Chocolate Company",
    "category": "Food Stop",
    "latitude": 41.6766,
    "longitude": -86.252,
    "lat": 41.6766,
    "lon": -86.252,
    "lng": -86.252,
    "phase": "Phase 2",
    "routeSegment": "South Bend / Indiana",
    "route_segment": "South Bend / Indiana",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://www.sbchocolate.com/",
    "official_website": "https://www.sbchocolate.com/",
    "learnMoreUrl": "https://www.sbchocolate.com/",
    "learn_more": "https://www.sbchocolate.com/",
    "sourceUrl": "https://www.sbchocolate.com/",
    "shortSummary": "Local chocolate company and family-friendly treat stop.",
    "summary": "Local chocolate company and family-friendly treat stop.",
    "whyItMatters": "Good morale stop around the overnight area.",
    "why": "Good morale stop around the overnight area.",
    "notes": {
      "elsie": "Think about how local businesses become traditions.",
      "katrina": "Ask how chocolate is made and sold.",
      "emma": "Food, work, and community lens.",
      "eliette": "Pick the best wrapper or treat detail.",
      "jules": "Chocolate mission.",
      "momdad": "Good morale stop around the overnight area."
    },
    "profiles": {
      "elsie": "Think about how local businesses become traditions.",
      "katrina": "Ask how chocolate is made and sold.",
      "emma": "Food, work, and community lens.",
      "eliette": "Pick the best wrapper or treat detail.",
      "jules": "Chocolate mission.",
      "momdad": "Good morale stop around the overnight area."
    },
    "csvOrder": 36
  },
  {
    "id": "P2-002",
    "title": "Potawatomi Zoo",
    "name": "Potawatomi Zoo",
    "category": "Zoo",
    "latitude": 41.6629,
    "longitude": -86.2208,
    "lat": 41.6629,
    "lon": -86.2208,
    "lng": -86.2208,
    "phase": "Phase 2",
    "routeSegment": "South Bend / Indiana",
    "route_segment": "South Bend / Indiana",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.potawatomizoo.org/",
    "official_website": "https://www.potawatomizoo.org/",
    "learnMoreUrl": "https://www.potawatomizoo.org/",
    "learn_more": "https://www.potawatomizoo.org/",
    "sourceUrl": "https://www.potawatomizoo.org/",
    "shortSummary": "Family zoo in South Bend.",
    "summary": "Family zoo in South Bend.",
    "whyItMatters": "Good kid-friendly option before heading north.",
    "why": "Good kid-friendly option before heading north.",
    "notes": {
      "elsie": "Compare animal habitats.",
      "katrina": "Ask what animals need to stay healthy.",
      "emma": "Pick one animal and describe its day.",
      "eliette": "Find patterns and colors.",
      "jules": "Animal count mission.",
      "momdad": "Good kid-friendly option before heading north."
    },
    "profiles": {
      "elsie": "Compare animal habitats.",
      "katrina": "Ask what animals need to stay healthy.",
      "emma": "Pick one animal and describe its day.",
      "eliette": "Find patterns and colors.",
      "jules": "Animal count mission.",
      "momdad": "Good kid-friendly option before heading north."
    },
    "csvOrder": 37
  },
  {
    "id": "P2-003",
    "title": "Air Zoo Aerospace & Science Museum",
    "name": "Air Zoo Aerospace & Science Museum",
    "category": "Aviation Museum",
    "latitude": 42.2348,
    "longitude": -85.5536,
    "lat": 42.2348,
    "lon": -85.5536,
    "lng": -85.5536,
    "phase": "Phase 2",
    "routeSegment": "Kalamazoo / Michigan",
    "route_segment": "Kalamazoo / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.airzoo.org/",
    "official_website": "https://www.airzoo.org/",
    "learnMoreUrl": "https://www.airzoo.org/",
    "learn_more": "https://www.airzoo.org/",
    "sourceUrl": "https://www.airzoo.org/",
    "shortSummary": "Aviation and science museum near Kalamazoo.",
    "summary": "Aviation and science museum near Kalamazoo.",
    "whyItMatters": "Strong indoor STEM stop on the Michigan approach.",
    "why": "Strong indoor STEM stop on the Michigan approach.",
    "notes": {
      "elsie": "Think about flight and engineering.",
      "katrina": "Ask why airplane shapes matter.",
      "emma": "Connect machines to travel and weather.",
      "eliette": "Find the best design detail.",
      "jules": "Airplane mission.",
      "momdad": "Strong indoor STEM stop on the Michigan approach."
    },
    "profiles": {
      "elsie": "Think about flight and engineering.",
      "katrina": "Ask why airplane shapes matter.",
      "emma": "Connect machines to travel and weather.",
      "eliette": "Find the best design detail.",
      "jules": "Airplane mission.",
      "momdad": "Strong indoor STEM stop on the Michigan approach."
    },
    "csvOrder": 38
  },
  {
    "id": "P2-004",
    "title": "Gilmore Car Museum",
    "name": "Gilmore Car Museum",
    "category": "Museum",
    "latitude": 42.4622,
    "longitude": -85.408,
    "lat": 42.4622,
    "lon": -85.408,
    "lng": -85.408,
    "phase": "Phase 2",
    "routeSegment": "Hickory Corners / Michigan",
    "route_segment": "Hickory Corners / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://gilmorecarmuseum.org/",
    "official_website": "https://gilmorecarmuseum.org/",
    "learnMoreUrl": "https://gilmorecarmuseum.org/",
    "learn_more": "https://gilmorecarmuseum.org/",
    "sourceUrl": "https://gilmorecarmuseum.org/",
    "shortSummary": "Large automotive museum campus in Michigan.",
    "summary": "Large automotive museum campus in Michigan.",
    "whyItMatters": "Excellent transportation-history stop for the drive.",
    "why": "Excellent transportation-history stop for the drive.",
    "notes": {
      "elsie": "Compare car eras and designs.",
      "katrina": "Ask how cars changed where people could live.",
      "emma": "Connect cars to family road trips.",
      "eliette": "Find colors, hood ornaments, and signs.",
      "jules": "Car spotting mission.",
      "momdad": "Excellent transportation-history stop for the drive."
    },
    "profiles": {
      "elsie": "Compare car eras and designs.",
      "katrina": "Ask how cars changed where people could live.",
      "emma": "Connect cars to family road trips.",
      "eliette": "Find colors, hood ornaments, and signs.",
      "jules": "Car spotting mission.",
      "momdad": "Excellent transportation-history stop for the drive."
    },
    "csvOrder": 39
  },
  {
    "id": "P2-005",
    "title": "Michigan State Capitol",
    "name": "Michigan State Capitol",
    "category": "Historic Site",
    "latitude": 42.7336,
    "longitude": -84.5555,
    "lat": 42.7336,
    "lon": -84.5555,
    "lng": -84.5555,
    "phase": "Phase 2",
    "routeSegment": "Lansing / Michigan",
    "route_segment": "Lansing / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://capitol.michigan.gov/",
    "official_website": "https://capitol.michigan.gov/",
    "learnMoreUrl": "https://capitol.michigan.gov/",
    "learn_more": "https://capitol.michigan.gov/",
    "sourceUrl": "https://capitol.michigan.gov/",
    "shortSummary": "Michigan's state capitol building in Lansing.",
    "summary": "Michigan's state capitol building in Lansing.",
    "whyItMatters": "Adds state-government context on the Michigan leg.",
    "why": "Adds state-government context on the Michigan leg.",
    "notes": {
      "elsie": "Compare state capitols on the trip.",
      "katrina": "Ask what state governments decide.",
      "emma": "Connect laws to parks, roads, and schools.",
      "eliette": "Look for dome and symbol details.",
      "jules": "Big building mission.",
      "momdad": "Adds state-government context on the Michigan leg."
    },
    "profiles": {
      "elsie": "Compare state capitols on the trip.",
      "katrina": "Ask what state governments decide.",
      "emma": "Connect laws to parks, roads, and schools.",
      "eliette": "Look for dome and symbol details.",
      "jules": "Big building mission.",
      "momdad": "Adds state-government context on the Michigan leg."
    },
    "csvOrder": 40
  },
  {
    "id": "P2-006",
    "title": "Potter Park Zoo",
    "name": "Potter Park Zoo",
    "category": "Zoo",
    "latitude": 42.717,
    "longitude": -84.536,
    "lat": 42.717,
    "lon": -84.536,
    "lng": -84.536,
    "phase": "Phase 2",
    "routeSegment": "Lansing / Michigan",
    "route_segment": "Lansing / Michigan",
    "tier": "Good Reset",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://potterparkzoo.org/",
    "official_website": "https://potterparkzoo.org/",
    "learnMoreUrl": "https://potterparkzoo.org/",
    "learn_more": "https://potterparkzoo.org/",
    "sourceUrl": "https://potterparkzoo.org/",
    "shortSummary": "Lansing zoo and family stop.",
    "summary": "Lansing zoo and family stop.",
    "whyItMatters": "Useful kid reset near the Michigan corridor.",
    "why": "Useful kid reset near the Michigan corridor.",
    "notes": {
      "elsie": "Watch animal behavior and habitats.",
      "katrina": "Ask why conservation matters.",
      "emma": "Pick one animal and compare it to home pets.",
      "eliette": "Find the most colorful animal.",
      "jules": "Animal mission.",
      "momdad": "Useful kid reset near the Michigan corridor."
    },
    "profiles": {
      "elsie": "Watch animal behavior and habitats.",
      "katrina": "Ask why conservation matters.",
      "emma": "Pick one animal and compare it to home pets.",
      "eliette": "Find the most colorful animal.",
      "jules": "Animal mission.",
      "momdad": "Useful kid reset near the Michigan corridor."
    },
    "csvOrder": 41
  },
  {
    "id": "P2-007",
    "title": "Uncle John's Cider Mill",
    "name": "Uncle John's Cider Mill",
    "category": "Food Stop",
    "latitude": 43.0014,
    "longitude": -84.377,
    "lat": 43.0014,
    "lon": -84.377,
    "lng": -84.377,
    "phase": "Phase 2",
    "routeSegment": "St. Johns / Michigan",
    "route_segment": "St. Johns / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.ujcidermill.com/",
    "official_website": "https://www.ujcidermill.com/",
    "learnMoreUrl": "https://www.ujcidermill.com/",
    "learn_more": "https://www.ujcidermill.com/",
    "sourceUrl": "https://www.ujcidermill.com/",
    "shortSummary": "Cider mill stop north of Lansing.",
    "summary": "Cider mill stop north of Lansing.",
    "whyItMatters": "Good seasonal food and outdoor reset.",
    "why": "Good seasonal food and outdoor reset.",
    "notes": {
      "elsie": "Think about farms becoming destinations.",
      "katrina": "Ask how apples become cider.",
      "emma": "Connect food, farming, and family routines.",
      "eliette": "Find a label or treat detail.",
      "jules": "Apple mission.",
      "momdad": "Good seasonal food and outdoor reset."
    },
    "profiles": {
      "elsie": "Think about farms becoming destinations.",
      "katrina": "Ask how apples become cider.",
      "emma": "Connect food, farming, and family routines.",
      "eliette": "Find a label or treat detail.",
      "jules": "Apple mission.",
      "momdad": "Good seasonal food and outdoor reset."
    },
    "csvOrder": 42
  },
  {
    "id": "P2-008",
    "title": "Frankenmuth River Place Shops",
    "name": "Frankenmuth River Place Shops",
    "category": "Small Town / Shops",
    "latitude": 43.3314,
    "longitude": -83.7395,
    "lat": 43.3314,
    "lon": -83.7395,
    "lng": -83.7395,
    "phase": "Phase 2",
    "routeSegment": "Frankenmuth / Michigan",
    "route_segment": "Frankenmuth / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://frankenmuthriverplace.com/",
    "official_website": "https://frankenmuthriverplace.com/",
    "learnMoreUrl": "https://frankenmuthriverplace.com/",
    "learn_more": "https://frankenmuthriverplace.com/",
    "sourceUrl": "https://frankenmuthriverplace.com/",
    "shortSummary": "Bavarian-themed shopping village in Frankenmuth.",
    "summary": "Bavarian-themed shopping village in Frankenmuth.",
    "whyItMatters": "Fun walkable stop with strong visual character.",
    "why": "Fun walkable stop with strong visual character.",
    "notes": {
      "elsie": "Notice how towns build identity.",
      "katrina": "Ask why a theme attracts visitors.",
      "emma": "Compare tourist routines and local life.",
      "eliette": "Find the best sign or shop detail.",
      "jules": "Pretend village mission.",
      "momdad": "Fun walkable stop with strong visual character."
    },
    "profiles": {
      "elsie": "Notice how towns build identity.",
      "katrina": "Ask why a theme attracts visitors.",
      "emma": "Compare tourist routines and local life.",
      "eliette": "Find the best sign or shop detail.",
      "jules": "Pretend village mission.",
      "momdad": "Fun walkable stop with strong visual character."
    },
    "csvOrder": 43
  },
  {
    "id": "P2-009",
    "title": "Bronner's Christmas Wonderland",
    "name": "Bronner's Christmas Wonderland",
    "category": "Roadside Oddity",
    "latitude": 43.331,
    "longitude": -83.7344,
    "lat": 43.331,
    "lon": -83.7344,
    "lng": -83.7344,
    "phase": "Phase 2",
    "routeSegment": "Frankenmuth / Michigan",
    "route_segment": "Frankenmuth / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.bronners.com/",
    "official_website": "https://www.bronners.com/",
    "learnMoreUrl": "https://www.bronners.com/",
    "learn_more": "https://www.bronners.com/",
    "sourceUrl": "https://www.bronners.com/",
    "shortSummary": "Huge Christmas-themed store and roadside attraction.",
    "summary": "Huge Christmas-themed store and roadside attraction.",
    "whyItMatters": "One of the most memorable oddity stops in Michigan.",
    "why": "One of the most memorable oddity stops in Michigan.",
    "notes": {
      "elsie": "Think about scale and why giant stores become famous.",
      "katrina": "Ask why people travel for a store.",
      "emma": "Notice retail design and holiday traditions.",
      "eliette": "Find the funniest ornament.",
      "jules": "Christmas mission.",
      "momdad": "One of the most memorable oddity stops in Michigan."
    },
    "profiles": {
      "elsie": "Think about scale and why giant stores become famous.",
      "katrina": "Ask why people travel for a store.",
      "emma": "Notice retail design and holiday traditions.",
      "eliette": "Find the funniest ornament.",
      "jules": "Christmas mission.",
      "momdad": "One of the most memorable oddity stops in Michigan."
    },
    "csvOrder": 44
  },
  {
    "id": "P2-010",
    "title": "Hartwick Pines State Park",
    "name": "Hartwick Pines State Park",
    "category": "State Park",
    "latitude": 44.7603,
    "longitude": -84.6755,
    "lat": 44.7603,
    "lon": -84.6755,
    "lng": -84.6755,
    "phase": "Phase 2",
    "routeSegment": "Grayling / Michigan",
    "route_segment": "Grayling / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.michigan.gov/dnr/places/state-parks/hartwick-pines",
    "official_website": "https://www.michigan.gov/dnr/places/state-parks/hartwick-pines",
    "learnMoreUrl": "https://www.michigan.gov/dnr/places/state-parks/hartwick-pines",
    "learn_more": "https://www.michigan.gov/dnr/places/state-parks/hartwick-pines",
    "sourceUrl": "https://www.michigan.gov/dnr/places/state-parks/hartwick-pines",
    "shortSummary": "Old-growth pine forest and logging museum area near Grayling.",
    "summary": "Old-growth pine forest and logging museum area near Grayling.",
    "whyItMatters": "Strong nature/history stop before the Straits.",
    "why": "Strong nature/history stop before the Straits.",
    "notes": {
      "elsie": "Compare old forests and logging history.",
      "katrina": "Ask why old-growth trees matter.",
      "emma": "Connect forests to jobs and conservation.",
      "eliette": "Find bark, needles, and trail details.",
      "jules": "Big tree mission.",
      "momdad": "Strong nature/history stop before the Straits."
    },
    "profiles": {
      "elsie": "Compare old forests and logging history.",
      "katrina": "Ask why old-growth trees matter.",
      "emma": "Connect forests to jobs and conservation.",
      "eliette": "Find bark, needles, and trail details.",
      "jules": "Big tree mission.",
      "momdad": "Strong nature/history stop before the Straits."
    },
    "csvOrder": 45
  },
  {
    "id": "P2-011",
    "title": "Grayling Fish Hatchery",
    "name": "Grayling Fish Hatchery",
    "category": "Nature / History",
    "latitude": 44.6616,
    "longitude": -84.7145,
    "lat": 44.6616,
    "lon": -84.7145,
    "lng": -84.7145,
    "phase": "Phase 2",
    "routeSegment": "Grayling / Michigan",
    "route_segment": "Grayling / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://graylingfishhatchery.org/",
    "official_website": "https://graylingfishhatchery.org/",
    "learnMoreUrl": "https://graylingfishhatchery.org/",
    "learn_more": "https://graylingfishhatchery.org/",
    "sourceUrl": "https://graylingfishhatchery.org/",
    "shortSummary": "Historic fish hatchery in Grayling.",
    "summary": "Historic fish hatchery in Grayling.",
    "whyItMatters": "Good nature stop tied to rivers and conservation.",
    "why": "Good nature stop tied to rivers and conservation.",
    "notes": {
      "elsie": "Think about fish habitats and river health.",
      "katrina": "Ask why people raise fish for streams.",
      "emma": "Connect water, wildlife, and recreation.",
      "eliette": "Look for water movement and fish details.",
      "jules": "Fish mission.",
      "momdad": "Good nature stop tied to rivers and conservation."
    },
    "profiles": {
      "elsie": "Think about fish habitats and river health.",
      "katrina": "Ask why people raise fish for streams.",
      "emma": "Connect water, wildlife, and recreation.",
      "eliette": "Look for water movement and fish details.",
      "jules": "Fish mission.",
      "momdad": "Good nature stop tied to rivers and conservation."
    },
    "csvOrder": 46
  },
  {
    "id": "P2-012",
    "title": "Cross in the Woods National Shrine",
    "name": "Cross in the Woods National Shrine",
    "category": "Religious Site",
    "latitude": 45.4448,
    "longitude": -84.7825,
    "lat": 45.4448,
    "lon": -84.7825,
    "lng": -84.7825,
    "phase": "Phase 2",
    "routeSegment": "Indian River / Michigan",
    "route_segment": "Indian River / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://crossinthewoods.com/",
    "official_website": "https://crossinthewoods.com/",
    "learnMoreUrl": "https://crossinthewoods.com/",
    "learn_more": "https://crossinthewoods.com/",
    "sourceUrl": "https://crossinthewoods.com/",
    "shortSummary": "Outdoor shrine in Indian River with a large crucifix.",
    "summary": "Outdoor shrine in Indian River with a large crucifix.",
    "whyItMatters": "Quiet, distinctive stop near the northern Michigan approach.",
    "why": "Quiet, distinctive stop near the northern Michigan approach.",
    "notes": {
      "elsie": "Notice scale, setting, and sacred art.",
      "katrina": "Ask why outdoor sacred spaces feel different.",
      "emma": "Connect faith, travel, and place.",
      "eliette": "Find small prayer or statue details.",
      "jules": "Big cross mission.",
      "momdad": "Quiet, distinctive stop near the northern Michigan approach."
    },
    "profiles": {
      "elsie": "Notice scale, setting, and sacred art.",
      "katrina": "Ask why outdoor sacred spaces feel different.",
      "emma": "Connect faith, travel, and place.",
      "eliette": "Find small prayer or statue details.",
      "jules": "Big cross mission.",
      "momdad": "Quiet, distinctive stop near the northern Michigan approach."
    },
    "csvOrder": 47
  },
  {
    "id": "P2-013",
    "title": "Call of the Wild Museum",
    "name": "Call of the Wild Museum",
    "category": "Museum",
    "latitude": 45.444,
    "longitude": -84.7835,
    "lat": 45.444,
    "lon": -84.7835,
    "lng": -84.7835,
    "phase": "Phase 2",
    "routeSegment": "Gaylord / Michigan",
    "route_segment": "Gaylord / Michigan",
    "tier": "Good Reset",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://callofthewildmuseum.com/",
    "official_website": "https://callofthewildmuseum.com/",
    "learnMoreUrl": "https://callofthewildmuseum.com/",
    "learn_more": "https://callofthewildmuseum.com/",
    "sourceUrl": "https://callofthewildmuseum.com/",
    "shortSummary": "Wildlife museum and family attraction in Gaylord.",
    "summary": "Wildlife museum and family attraction in Gaylord.",
    "whyItMatters": "Kid-friendly wildlife context before northern Michigan.",
    "why": "Kid-friendly wildlife context before northern Michigan.",
    "notes": {
      "elsie": "Compare animal adaptations.",
      "katrina": "Ask why Michigan animals live where they do.",
      "emma": "Connect wildlife to forests and water.",
      "eliette": "Find the best animal display detail.",
      "jules": "Animal mission.",
      "momdad": "Kid-friendly wildlife context before northern Michigan."
    },
    "profiles": {
      "elsie": "Compare animal adaptations.",
      "katrina": "Ask why Michigan animals live where they do.",
      "emma": "Connect wildlife to forests and water.",
      "eliette": "Find the best animal display detail.",
      "jules": "Animal mission.",
      "momdad": "Kid-friendly wildlife context before northern Michigan."
    },
    "csvOrder": 48
  },
  {
    "id": "P2-014",
    "title": "Historic Mill Creek Discovery Park",
    "name": "Historic Mill Creek Discovery Park",
    "category": "Historic Site",
    "latitude": 45.8646,
    "longitude": -84.7285,
    "lat": 45.8646,
    "lon": -84.7285,
    "lng": -84.7285,
    "phase": "Phase 2",
    "routeSegment": "Mackinaw City / Michigan",
    "route_segment": "Mackinaw City / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.mackinacparks.com/parks-and-attractions/historic-mill-creek-discovery-park/",
    "official_website": "https://www.mackinacparks.com/parks-and-attractions/historic-mill-creek-discovery-park/",
    "learnMoreUrl": "https://www.mackinacparks.com/parks-and-attractions/historic-mill-creek-discovery-park/",
    "learn_more": "https://www.mackinacparks.com/parks-and-attractions/historic-mill-creek-discovery-park/",
    "sourceUrl": "https://www.mackinacparks.com/parks-and-attractions/historic-mill-creek-discovery-park/",
    "shortSummary": "Reconstructed sawmill and nature/history park near Mackinaw City.",
    "summary": "Reconstructed sawmill and nature/history park near Mackinaw City.",
    "whyItMatters": "Excellent hands-on history tied to timber and frontier industry.",
    "why": "Excellent hands-on history tied to timber and frontier industry.",
    "notes": {
      "elsie": "Connect wood, water, and settlement.",
      "katrina": "Ask how sawmills changed northern Michigan.",
      "emma": "Notice how machines use water and gravity.",
      "eliette": "Find gears, boards, and forest details.",
      "jules": "Sawmill machine mission.",
      "momdad": "Excellent hands-on history tied to timber and frontier industry."
    },
    "profiles": {
      "elsie": "Connect wood, water, and settlement.",
      "katrina": "Ask how sawmills changed northern Michigan.",
      "emma": "Notice how machines use water and gravity.",
      "eliette": "Find gears, boards, and forest details.",
      "jules": "Sawmill machine mission.",
      "momdad": "Excellent hands-on history tied to timber and frontier industry."
    },
    "csvOrder": 49
  },
  {
    "id": "P2-015",
    "title": "Colonial Michilimackinac",
    "name": "Colonial Michilimackinac",
    "category": "Historic Fort",
    "latitude": 45.7866,
    "longitude": -84.7272,
    "lat": 45.7866,
    "lon": -84.7272,
    "lng": -84.7272,
    "phase": "Phase 2",
    "routeSegment": "Mackinaw City / Michigan",
    "route_segment": "Mackinaw City / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://www.mackinacparks.com/parks-and-attractions/colonial-michilimackinac/",
    "official_website": "https://www.mackinacparks.com/parks-and-attractions/colonial-michilimackinac/",
    "learnMoreUrl": "https://www.mackinacparks.com/parks-and-attractions/colonial-michilimackinac/",
    "learn_more": "https://www.mackinacparks.com/parks-and-attractions/colonial-michilimackinac/",
    "sourceUrl": "https://www.mackinacparks.com/parks-and-attractions/colonial-michilimackinac/",
    "shortSummary": "Reconstructed 18th-century fort and fur-trade site.",
    "summary": "Reconstructed 18th-century fort and fur-trade site.",
    "whyItMatters": "One of the strongest Straits history stops.",
    "why": "One of the strongest Straits history stops.",
    "notes": {
      "elsie": "Think about trade, alliances, and conflict.",
      "katrina": "Ask why the Straits mattered so much.",
      "emma": "Connect travel routes, water, and commerce.",
      "eliette": "Look for fort, tools, and costume details.",
      "jules": "Fort mission.",
      "momdad": "One of the strongest Straits history stops."
    },
    "profiles": {
      "elsie": "Think about trade, alliances, and conflict.",
      "katrina": "Ask why the Straits mattered so much.",
      "emma": "Connect travel routes, water, and commerce.",
      "eliette": "Look for fort, tools, and costume details.",
      "jules": "Fort mission.",
      "momdad": "One of the strongest Straits history stops."
    },
    "csvOrder": 50
  },
  {
    "id": "P2-016",
    "title": "Old Mackinac Point Lighthouse",
    "name": "Old Mackinac Point Lighthouse",
    "category": "Lighthouse",
    "latitude": 45.7877,
    "longitude": -84.7276,
    "lat": 45.7877,
    "lon": -84.7276,
    "lng": -84.7276,
    "phase": "Phase 2",
    "routeSegment": "Mackinaw City / Michigan",
    "route_segment": "Mackinaw City / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.mackinacparks.com/parks-and-attractions/old-mackinac-point-lighthouse/",
    "official_website": "https://www.mackinacparks.com/parks-and-attractions/old-mackinac-point-lighthouse/",
    "learnMoreUrl": "https://www.mackinacparks.com/parks-and-attractions/old-mackinac-point-lighthouse/",
    "learn_more": "https://www.mackinacparks.com/parks-and-attractions/old-mackinac-point-lighthouse/",
    "sourceUrl": "https://www.mackinacparks.com/parks-and-attractions/old-mackinac-point-lighthouse/",
    "shortSummary": "Historic lighthouse at the Straits of Mackinac.",
    "summary": "Historic lighthouse at the Straits of Mackinac.",
    "whyItMatters": "Strong maritime navigation stop before the ferry region.",
    "why": "Strong maritime navigation stop before the ferry region.",
    "notes": {
      "elsie": "Think about ships before GPS.",
      "katrina": "Ask why lights mattered in storms and fog.",
      "emma": "Connect weather, water, and safety.",
      "eliette": "Find lens, tower, and stone details.",
      "jules": "Lighthouse mission.",
      "momdad": "Strong maritime navigation stop before the ferry region."
    },
    "profiles": {
      "elsie": "Think about ships before GPS.",
      "katrina": "Ask why lights mattered in storms and fog.",
      "emma": "Connect weather, water, and safety.",
      "eliette": "Find lens, tower, and stone details.",
      "jules": "Lighthouse mission.",
      "momdad": "Strong maritime navigation stop before the ferry region."
    },
    "csvOrder": 51
  },
  {
    "id": "P2-017",
    "title": "Mackinac Bridge",
    "name": "Mackinac Bridge",
    "category": "Scenic / Engineering",
    "latitude": 45.8176,
    "longitude": -84.7278,
    "lat": 45.8176,
    "lon": -84.7278,
    "lng": -84.7278,
    "phase": "Phase 2",
    "routeSegment": "Straits of Mackinac",
    "route_segment": "Straits of Mackinac",
    "tier": "Core",
    "estimatedStopMinutes": 20,
    "estimated_stop_minutes": 20,
    "officialWebsiteUrl": "https://www.mackinacbridge.org/",
    "official_website": "https://www.mackinacbridge.org/",
    "learnMoreUrl": "https://www.mackinacbridge.org/",
    "learn_more": "https://www.mackinacbridge.org/",
    "sourceUrl": "https://www.mackinacbridge.org/",
    "shortSummary": "Major suspension bridge connecting Michigan's peninsulas.",
    "summary": "Major suspension bridge connecting Michigan's peninsulas.",
    "whyItMatters": "Essential engineering landmark for the region.",
    "why": "Essential engineering landmark for the region.",
    "notes": {
      "elsie": "Think about what it takes to connect two peninsulas.",
      "katrina": "Ask why building here was hard.",
      "emma": "Connect bridges to daily life and travel.",
      "eliette": "Look for cables, towers, and water views.",
      "jules": "Big bridge mission.",
      "momdad": "Essential engineering landmark for the region."
    },
    "profiles": {
      "elsie": "Think about what it takes to connect two peninsulas.",
      "katrina": "Ask why building here was hard.",
      "emma": "Connect bridges to daily life and travel.",
      "eliette": "Look for cables, towers, and water views.",
      "jules": "Big bridge mission.",
      "momdad": "Essential engineering landmark for the region."
    },
    "csvOrder": 52
  },
  {
    "id": "P2-018",
    "title": "Icebreaker Mackinaw Maritime Museum",
    "name": "Icebreaker Mackinaw Maritime Museum",
    "category": "Maritime Museum",
    "latitude": 45.777,
    "longitude": -84.727,
    "lat": 45.777,
    "lon": -84.727,
    "lng": -84.727,
    "phase": "Phase 2",
    "routeSegment": "Mackinaw City / Michigan",
    "route_segment": "Mackinaw City / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.themackinaw.org/",
    "official_website": "https://www.themackinaw.org/",
    "learnMoreUrl": "https://www.themackinaw.org/",
    "learn_more": "https://www.themackinaw.org/",
    "sourceUrl": "https://www.themackinaw.org/",
    "shortSummary": "Historic Coast Guard icebreaker museum ship.",
    "summary": "Historic Coast Guard icebreaker museum ship.",
    "whyItMatters": "Great ship and Great Lakes logistics stop.",
    "why": "Great ship and Great Lakes logistics stop.",
    "notes": {
      "elsie": "Think about winter shipping and ice.",
      "katrina": "Ask why icebreakers matter to trade.",
      "emma": "Connect lakes, weather, and supplies.",
      "eliette": "Find ship details and equipment.",
      "jules": "Big boat mission.",
      "momdad": "Great ship and Great Lakes logistics stop."
    },
    "profiles": {
      "elsie": "Think about winter shipping and ice.",
      "katrina": "Ask why icebreakers matter to trade.",
      "emma": "Connect lakes, weather, and supplies.",
      "eliette": "Find ship details and equipment.",
      "jules": "Big boat mission.",
      "momdad": "Great ship and Great Lakes logistics stop."
    },
    "csvOrder": 53
  },
  {
    "id": "P2-019",
    "title": "Headlands International Dark Sky Park",
    "name": "Headlands International Dark Sky Park",
    "category": "Dark Sky Park",
    "latitude": 45.7744,
    "longitude": -84.7515,
    "lat": 45.7744,
    "lon": -84.7515,
    "lng": -84.7515,
    "phase": "Phase 2",
    "routeSegment": "Mackinaw City / Michigan",
    "route_segment": "Mackinaw City / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://www.emmetcounty.org/experiences/headlands/index.php",
    "official_website": "https://www.emmetcounty.org/experiences/headlands/index.php",
    "learnMoreUrl": "https://www.emmetcounty.org/experiences/headlands/index.php",
    "learn_more": "https://www.emmetcounty.org/experiences/headlands/index.php",
    "sourceUrl": "https://www.emmetcounty.org/experiences/headlands/index.php",
    "shortSummary": "Dark sky park on Lake Michigan near Mackinaw City.",
    "summary": "Dark sky park on Lake Michigan near Mackinaw City.",
    "whyItMatters": "Major night-sky and nature experience near the island route.",
    "why": "Major night-sky and nature experience near the island route.",
    "notes": {
      "elsie": "Think about light pollution and stars.",
      "katrina": "Ask why dark skies need protection.",
      "emma": "Connect sky, weather, and planning.",
      "eliette": "Find constellations or moonlight details.",
      "jules": "Star mission.",
      "momdad": "Major night-sky and nature experience near the island route."
    },
    "profiles": {
      "elsie": "Think about light pollution and stars.",
      "katrina": "Ask why dark skies need protection.",
      "emma": "Connect sky, weather, and planning.",
      "eliette": "Find constellations or moonlight details.",
      "jules": "Star mission.",
      "momdad": "Major night-sky and nature experience near the island route."
    },
    "csvOrder": 54
  },
  {
    "id": "P2-020",
    "title": "Wilderness State Park",
    "name": "Wilderness State Park",
    "category": "State Park",
    "latitude": 45.731,
    "longitude": -84.915,
    "lat": 45.731,
    "lon": -84.915,
    "lng": -84.915,
    "phase": "Phase 2",
    "routeSegment": "Mackinaw City / Michigan",
    "route_segment": "Mackinaw City / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.michigan.gov/dnr/places/state-parks/wilderness",
    "official_website": "https://www.michigan.gov/dnr/places/state-parks/wilderness",
    "learnMoreUrl": "https://www.michigan.gov/dnr/places/state-parks/wilderness",
    "learn_more": "https://www.michigan.gov/dnr/places/state-parks/wilderness",
    "sourceUrl": "https://www.michigan.gov/dnr/places/state-parks/wilderness",
    "shortSummary": "Large Lake Michigan shoreline state park.",
    "summary": "Large Lake Michigan shoreline state park.",
    "whyItMatters": "Outdoor anchor for beaches, trails, and northern habitat.",
    "why": "Outdoor anchor for beaches, trails, and northern habitat.",
    "notes": {
      "elsie": "Compare forest, beach, and wetlands.",
      "katrina": "Ask why undeveloped shoreline matters.",
      "emma": "Connect parks to family rest and conservation.",
      "eliette": "Find rocks, waves, and trail details.",
      "jules": "Beach and woods mission.",
      "momdad": "Outdoor anchor for beaches, trails, and northern habitat."
    },
    "profiles": {
      "elsie": "Compare forest, beach, and wetlands.",
      "katrina": "Ask why undeveloped shoreline matters.",
      "emma": "Connect parks to family rest and conservation.",
      "eliette": "Find rocks, waves, and trail details.",
      "jules": "Beach and woods mission.",
      "momdad": "Outdoor anchor for beaches, trails, and northern habitat."
    },
    "csvOrder": 55
  },
  {
    "id": "P2-021",
    "title": "McGulpin Point Lighthouse",
    "name": "McGulpin Point Lighthouse",
    "category": "Lighthouse",
    "latitude": 45.7869,
    "longitude": -84.7727,
    "lat": 45.7869,
    "lon": -84.7727,
    "lng": -84.7727,
    "phase": "Phase 2",
    "routeSegment": "Mackinaw City / Michigan",
    "route_segment": "Mackinaw City / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.emmetcounty.org/experiences/mcgulpin-point-lighthouse/",
    "official_website": "https://www.emmetcounty.org/experiences/mcgulpin-point-lighthouse/",
    "learnMoreUrl": "https://www.emmetcounty.org/experiences/mcgulpin-point-lighthouse/",
    "learn_more": "https://www.emmetcounty.org/experiences/mcgulpin-point-lighthouse/",
    "sourceUrl": "https://www.emmetcounty.org/experiences/mcgulpin-point-lighthouse/",
    "shortSummary": "Historic lighthouse west of Mackinaw City.",
    "summary": "Historic lighthouse west of Mackinaw City.",
    "whyItMatters": "Good scenic maritime stop near Headlands.",
    "why": "Good scenic maritime stop near Headlands.",
    "notes": {
      "elsie": "Compare lighthouse locations around the Straits.",
      "katrina": "Ask how sailors navigated dangerous water.",
      "emma": "Notice tower shape and shoreline clues.",
      "eliette": "Find the best lighthouse angle.",
      "jules": "Lighthouse mission.",
      "momdad": "Good scenic maritime stop near Headlands."
    },
    "profiles": {
      "elsie": "Compare lighthouse locations around the Straits.",
      "katrina": "Ask how sailors navigated dangerous water.",
      "emma": "Notice tower shape and shoreline clues.",
      "eliette": "Find the best lighthouse angle.",
      "jules": "Lighthouse mission.",
      "momdad": "Good scenic maritime stop near Headlands."
    },
    "csvOrder": 56
  },
  {
    "id": "P2-022",
    "title": "Cheboygan State Park",
    "name": "Cheboygan State Park",
    "category": "State Park",
    "latitude": 45.6467,
    "longitude": -84.4306,
    "lat": 45.6467,
    "lon": -84.4306,
    "lng": -84.4306,
    "phase": "Phase 2",
    "routeSegment": "Cheboygan / Michigan",
    "route_segment": "Cheboygan / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.michigan.gov/dnr/places/state-parks/cheboygan",
    "official_website": "https://www.michigan.gov/dnr/places/state-parks/cheboygan",
    "learnMoreUrl": "https://www.michigan.gov/dnr/places/state-parks/cheboygan",
    "learn_more": "https://www.michigan.gov/dnr/places/state-parks/cheboygan",
    "sourceUrl": "https://www.michigan.gov/dnr/places/state-parks/cheboygan",
    "shortSummary": "State park on Lake Huron near Cheboygan.",
    "summary": "State park on Lake Huron near Cheboygan.",
    "whyItMatters": "Strong outdoor stop close to ferry logistics.",
    "why": "Strong outdoor stop close to ferry logistics.",
    "notes": {
      "elsie": "Think about lakeshore habitats.",
      "katrina": "Ask how Great Lakes shorelines change.",
      "emma": "Connect beach time, weather, and travel plans.",
      "eliette": "Find rocks, waves, and trees.",
      "jules": "Lake mission.",
      "momdad": "Strong outdoor stop close to ferry logistics."
    },
    "profiles": {
      "elsie": "Think about lakeshore habitats.",
      "katrina": "Ask how Great Lakes shorelines change.",
      "emma": "Connect beach time, weather, and travel plans.",
      "eliette": "Find rocks, waves, and trees.",
      "jules": "Lake mission.",
      "momdad": "Strong outdoor stop close to ferry logistics."
    },
    "csvOrder": 57
  },
  {
    "id": "P2-023",
    "title": "Cheboygan Crib Light",
    "name": "Cheboygan Crib Light",
    "category": "Lighthouse",
    "latitude": 45.648,
    "longitude": -84.4702,
    "lat": 45.648,
    "lon": -84.4702,
    "lng": -84.4702,
    "phase": "Phase 2",
    "routeSegment": "Cheboygan / Michigan",
    "route_segment": "Cheboygan / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://www.cheboygan.com/",
    "official_website": "https://www.cheboygan.com/",
    "learnMoreUrl": "https://www.cheboygan.com/",
    "learn_more": "https://www.cheboygan.com/",
    "sourceUrl": "https://www.cheboygan.com/",
    "shortSummary": "Lighthouse structure marking Cheboygan's harbor area.",
    "summary": "Lighthouse structure marking Cheboygan's harbor area.",
    "whyItMatters": "Quick maritime photo stop near the ferry town.",
    "why": "Quick maritime photo stop near the ferry town.",
    "notes": {
      "elsie": "Think about harbor safety.",
      "katrina": "Ask why boats need lights at channel entrances.",
      "emma": "Connect shipping, weather, and town life.",
      "eliette": "Find the best red lighthouse photo.",
      "jules": "Red lighthouse mission.",
      "momdad": "Quick maritime photo stop near the ferry town."
    },
    "profiles": {
      "elsie": "Think about harbor safety.",
      "katrina": "Ask why boats need lights at channel entrances.",
      "emma": "Connect shipping, weather, and town life.",
      "eliette": "Find the best red lighthouse photo.",
      "jules": "Red lighthouse mission.",
      "momdad": "Quick maritime photo stop near the ferry town."
    },
    "csvOrder": 58
  },
  {
    "id": "P2-024",
    "title": "Cheboygan Opera House",
    "name": "Cheboygan Opera House",
    "category": "Historic Site",
    "latitude": 45.6462,
    "longitude": -84.4745,
    "lat": 45.6462,
    "lon": -84.4745,
    "lng": -84.4745,
    "phase": "Phase 2",
    "routeSegment": "Cheboygan / Michigan",
    "route_segment": "Cheboygan / Michigan",
    "tier": "Good Reset",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://theoperahouse.org/",
    "official_website": "https://theoperahouse.org/",
    "learnMoreUrl": "https://theoperahouse.org/",
    "learn_more": "https://theoperahouse.org/",
    "sourceUrl": "https://theoperahouse.org/",
    "shortSummary": "Historic performing arts venue in Cheboygan.",
    "summary": "Historic performing arts venue in Cheboygan.",
    "whyItMatters": "Adds small-town culture near the ferry base.",
    "why": "Adds small-town culture near the ferry base.",
    "notes": {
      "elsie": "Think about why towns built theaters.",
      "katrina": "Ask what entertainment looked like before screens.",
      "emma": "Connect community, arts, and downtown life.",
      "eliette": "Look for old building details.",
      "jules": "Theater sign mission.",
      "momdad": "Adds small-town culture near the ferry base."
    },
    "profiles": {
      "elsie": "Think about why towns built theaters.",
      "katrina": "Ask what entertainment looked like before screens.",
      "emma": "Connect community, arts, and downtown life.",
      "eliette": "Look for old building details.",
      "jules": "Theater sign mission.",
      "momdad": "Adds small-town culture near the ferry base."
    },
    "csvOrder": 59
  },
  {
    "id": "P2-025",
    "title": "Plaunt Transportation Ferry",
    "name": "Plaunt Transportation Ferry",
    "category": "Ferry",
    "latitude": 45.6469,
    "longitude": -84.4745,
    "lat": 45.6469,
    "lon": -84.4745,
    "lng": -84.4745,
    "phase": "Phase 2",
    "routeSegment": "Cheboygan to Bois Blanc",
    "route_segment": "Cheboygan to Bois Blanc",
    "tier": "Core",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://plaunttransportation.com/",
    "official_website": "https://plaunttransportation.com/",
    "learnMoreUrl": "https://plaunttransportation.com/",
    "learn_more": "https://plaunttransportation.com/",
    "sourceUrl": "https://plaunttransportation.com/",
    "shortSummary": "Ferry service connecting Cheboygan and Bois Blanc Island.",
    "summary": "Ferry service connecting Cheboygan and Bois Blanc Island.",
    "whyItMatters": "Essential logistics and island-life stop.",
    "why": "Essential logistics and island-life stop.",
    "notes": {
      "elsie": "Think about how islands depend on ferries.",
      "katrina": "Ask what changes when groceries and cars travel by boat.",
      "emma": "Connect ferry schedules to daily life.",
      "eliette": "Watch ropes, ramps, signs, and loading.",
      "jules": "Cars-on-a-boat mission.",
      "momdad": "Essential logistics and island-life stop."
    },
    "profiles": {
      "elsie": "Think about how islands depend on ferries.",
      "katrina": "Ask what changes when groceries and cars travel by boat.",
      "emma": "Connect ferry schedules to daily life.",
      "eliette": "Watch ropes, ramps, signs, and loading.",
      "jules": "Cars-on-a-boat mission.",
      "momdad": "Essential logistics and island-life stop."
    },
    "csvOrder": 60
  },
  {
    "id": "P2-026",
    "title": "Bois Blanc Township",
    "name": "Bois Blanc Township",
    "category": "Island Community",
    "latitude": 45.7465,
    "longitude": -84.4948,
    "lat": 45.7465,
    "lon": -84.4948,
    "lng": -84.4948,
    "phase": "Phase 2",
    "routeSegment": "Bois Blanc Island",
    "route_segment": "Bois Blanc Island",
    "tier": "Core",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.boisblanctownship.org/",
    "official_website": "https://www.boisblanctownship.org/",
    "learnMoreUrl": "https://www.boisblanctownship.org/",
    "learn_more": "https://www.boisblanctownship.org/",
    "sourceUrl": "https://www.boisblanctownship.org/",
    "shortSummary": "Official township anchor for Bois Blanc Island.",
    "summary": "Official township anchor for Bois Blanc Island.",
    "whyItMatters": "Gives civic and island-life context for the stay.",
    "why": "Gives civic and island-life context for the stay.",
    "notes": {
      "elsie": "Think about how small island communities work.",
      "katrina": "Ask what services an island township must handle.",
      "emma": "Compare island routines to Olathe routines.",
      "eliette": "Find signs and community details.",
      "jules": "Island town mission.",
      "momdad": "Gives civic and island-life context for the stay."
    },
    "profiles": {
      "elsie": "Think about how small island communities work.",
      "katrina": "Ask what services an island township must handle.",
      "emma": "Compare island routines to Olathe routines.",
      "eliette": "Find signs and community details.",
      "jules": "Island town mission.",
      "momdad": "Gives civic and island-life context for the stay."
    },
    "csvOrder": 61
  },
  {
    "id": "P2-027",
    "title": "Bois Blanc Island Museum and Library",
    "name": "Bois Blanc Island Museum and Library",
    "category": "Museum / Library",
    "latitude": 45.7465,
    "longitude": -84.4948,
    "lat": 45.7465,
    "lon": -84.4948,
    "lng": -84.4948,
    "phase": "Phase 2",
    "routeSegment": "Bois Blanc Island",
    "route_segment": "Bois Blanc Island",
    "tier": "Core",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.boisblanctownship.org/community/museum-and-library/",
    "official_website": "https://www.boisblanctownship.org/community/museum-and-library/",
    "learnMoreUrl": "https://www.boisblanctownship.org/community/museum-and-library/",
    "learn_more": "https://www.boisblanctownship.org/community/museum-and-library/",
    "sourceUrl": "https://www.boisblanctownship.org/community/museum-and-library/",
    "shortSummary": "Island museum and library resource listed by the township.",
    "summary": "Island museum and library resource listed by the township.",
    "whyItMatters": "Best official island history/culture anchor.",
    "why": "Best official island history/culture anchor.",
    "notes": {
      "elsie": "Think about how small places preserve memory.",
      "katrina": "Ask what island stories people save.",
      "emma": "Connect books, photos, and community.",
      "eliette": "Find old photos or tiny artifacts.",
      "jules": "Island story mission.",
      "momdad": "Best official island history/culture anchor."
    },
    "profiles": {
      "elsie": "Think about how small places preserve memory.",
      "katrina": "Ask what island stories people save.",
      "emma": "Connect books, photos, and community.",
      "eliette": "Find old photos or tiny artifacts.",
      "jules": "Island story mission.",
      "momdad": "Best official island history/culture anchor."
    },
    "csvOrder": 62
  },
  {
    "id": "P2-028",
    "title": "Bois Blanc Island Lighthouse",
    "name": "Bois Blanc Island Lighthouse",
    "category": "Lighthouse",
    "latitude": 45.8118,
    "longitude": -84.4183,
    "lat": 45.8118,
    "lon": -84.4183,
    "lng": -84.4183,
    "phase": "Phase 2",
    "routeSegment": "Bois Blanc Island",
    "route_segment": "Bois Blanc Island",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.michigan.org/property/bois-blanc-island-lighthouse",
    "official_website": "https://www.michigan.org/property/bois-blanc-island-lighthouse",
    "learnMoreUrl": "https://www.michigan.org/property/bois-blanc-island-lighthouse",
    "learn_more": "https://www.michigan.org/property/bois-blanc-island-lighthouse",
    "sourceUrl": "https://www.michigan.org/property/bois-blanc-island-lighthouse",
    "shortSummary": "Historic lighthouse associated with Bois Blanc Island.",
    "summary": "Historic lighthouse associated with Bois Blanc Island.",
    "whyItMatters": "Strong island maritime-history stop.",
    "why": "Strong island maritime-history stop.",
    "notes": {
      "elsie": "Compare island lights to mainland lights.",
      "katrina": "Ask why lighthouses were placed here.",
      "emma": "Connect boats, rocks, fog, and safety.",
      "eliette": "Find lighthouse shapes and shoreline details.",
      "jules": "Island lighthouse mission.",
      "momdad": "Strong island maritime-history stop."
    },
    "profiles": {
      "elsie": "Compare island lights to mainland lights.",
      "katrina": "Ask why lighthouses were placed here.",
      "emma": "Connect boats, rocks, fog, and safety.",
      "eliette": "Find lighthouse shapes and shoreline details.",
      "jules": "Island lighthouse mission.",
      "momdad": "Strong island maritime-history stop."
    },
    "csvOrder": 63
  },
  {
    "id": "P2-029",
    "title": "Bois Blanc Island Natural Area",
    "name": "Bois Blanc Island Natural Area",
    "category": "Natural Area",
    "latitude": 45.772,
    "longitude": -84.485,
    "lat": 45.772,
    "lon": -84.485,
    "lng": -84.485,
    "phase": "Phase 2",
    "routeSegment": "Bois Blanc Island",
    "route_segment": "Bois Blanc Island",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.michigan.gov/dnr/places/natural-areas/bois-blanc-island",
    "official_website": "https://www.michigan.gov/dnr/places/natural-areas/bois-blanc-island",
    "learnMoreUrl": "https://www.michigan.gov/dnr/places/natural-areas/bois-blanc-island",
    "learn_more": "https://www.michigan.gov/dnr/places/natural-areas/bois-blanc-island",
    "sourceUrl": "https://www.michigan.gov/dnr/places/natural-areas/bois-blanc-island",
    "shortSummary": "Michigan DNR natural area on Bois Blanc Island.",
    "summary": "Michigan DNR natural area on Bois Blanc Island.",
    "whyItMatters": "Key official nature anchor for island exploration.",
    "why": "Key official nature anchor for island exploration.",
    "notes": {
      "elsie": "Notice rare habitats and island ecosystems.",
      "katrina": "Ask why island nature can be fragile.",
      "emma": "Connect plants, animals, and conservation.",
      "eliette": "Find textures, leaves, rocks, and tracks.",
      "jules": "Nature detective mission.",
      "momdad": "Key official nature anchor for island exploration."
    },
    "profiles": {
      "elsie": "Notice rare habitats and island ecosystems.",
      "katrina": "Ask why island nature can be fragile.",
      "emma": "Connect plants, animals, and conservation.",
      "eliette": "Find textures, leaves, rocks, and tracks.",
      "jules": "Nature detective mission.",
      "momdad": "Key official nature anchor for island exploration."
    },
    "csvOrder": 64
  },
  {
    "id": "P2-030",
    "title": "Bois Blanc Island Airport",
    "name": "Bois Blanc Island Airport",
    "category": "Transit / Island Logistics",
    "latitude": 45.725,
    "longitude": -84.428,
    "lat": 45.725,
    "lon": -84.428,
    "lng": -84.428,
    "phase": "Phase 2",
    "routeSegment": "Bois Blanc Island",
    "route_segment": "Bois Blanc Island",
    "tier": "Good Reset",
    "estimatedStopMinutes": 20,
    "estimated_stop_minutes": 20,
    "officialWebsiteUrl": "https://www.boisblancairport.com/",
    "official_website": "https://www.boisblancairport.com/",
    "learnMoreUrl": "https://www.boisblancairport.com/",
    "learn_more": "https://www.boisblancairport.com/",
    "sourceUrl": "https://www.boisblancairport.com/",
    "shortSummary": "Small island airport resource.",
    "summary": "Small island airport resource.",
    "whyItMatters": "Good island-logistics point showing another way people connect to the mainland.",
    "why": "Good island-logistics point showing another way people connect to the mainland.",
    "notes": {
      "elsie": "Think about ferry versus airplane access.",
      "katrina": "Ask when a small island airport matters.",
      "emma": "Connect transportation to emergencies and daily life.",
      "eliette": "Look for runway signs and small details.",
      "jules": "Tiny airport mission.",
      "momdad": "Good island-logistics point showing another way people connect to the mainland."
    },
    "profiles": {
      "elsie": "Think about ferry versus airplane access.",
      "katrina": "Ask when a small island airport matters.",
      "emma": "Connect transportation to emergencies and daily life.",
      "eliette": "Look for runway signs and small details.",
      "jules": "Tiny airport mission.",
      "momdad": "Good island-logistics point showing another way people connect to the mainland."
    },
    "csvOrder": 65
  },
  {
    "id": "P2-031",
    "title": "Bois Blanc Pines School",
    "name": "Bois Blanc Pines School",
    "category": "Community",
    "latitude": 45.7465,
    "longitude": -84.4948,
    "lat": 45.7465,
    "lon": -84.4948,
    "lng": -84.4948,
    "phase": "Phase 2",
    "routeSegment": "Bois Blanc Island",
    "route_segment": "Bois Blanc Island",
    "tier": "Good Reset",
    "estimatedStopMinutes": 20,
    "estimated_stop_minutes": 20,
    "officialWebsiteUrl": "https://boisblanc.eupschools.org/",
    "official_website": "https://boisblanc.eupschools.org/",
    "learnMoreUrl": "https://boisblanc.eupschools.org/",
    "learn_more": "https://boisblanc.eupschools.org/",
    "sourceUrl": "https://boisblanc.eupschools.org/",
    "shortSummary": "Island school district site.",
    "summary": "Island school district site.",
    "whyItMatters": "Useful community-life stop for comparing school on an island.",
    "why": "Useful community-life stop for comparing school on an island.",
    "notes": {
      "elsie": "Think about school when the community is small.",
      "katrina": "Ask what would feel different about island school.",
      "emma": "Compare their school day to yours.",
      "eliette": "Look for school signs and community details.",
      "jules": "School mission.",
      "momdad": "Useful community-life stop for comparing school on an island."
    },
    "profiles": {
      "elsie": "Think about school when the community is small.",
      "katrina": "Ask what would feel different about island school.",
      "emma": "Compare their school day to yours.",
      "eliette": "Look for school signs and community details.",
      "jules": "School mission.",
      "momdad": "Useful community-life stop for comparing school on an island."
    },
    "csvOrder": 66
  },
  {
    "id": "P2-032",
    "title": "Mackinac Island State Park",
    "name": "Mackinac Island State Park",
    "category": "State Park",
    "latitude": 45.8492,
    "longitude": -84.6189,
    "lat": 45.8492,
    "lon": -84.6189,
    "lng": -84.6189,
    "phase": "Phase 2",
    "routeSegment": "Mackinac Island / Straits",
    "route_segment": "Mackinac Island / Straits",
    "tier": "Core",
    "estimatedStopMinutes": 180,
    "estimated_stop_minutes": 180,
    "officialWebsiteUrl": "https://www.mackinacparks.com/parks-and-attractions/mackinac-island-state-park/",
    "official_website": "https://www.mackinacparks.com/parks-and-attractions/mackinac-island-state-park/",
    "learnMoreUrl": "https://www.mackinacparks.com/parks-and-attractions/mackinac-island-state-park/",
    "learn_more": "https://www.mackinacparks.com/parks-and-attractions/mackinac-island-state-park/",
    "sourceUrl": "https://www.mackinacparks.com/parks-and-attractions/mackinac-island-state-park/",
    "shortSummary": "State park covering much of Mackinac Island.",
    "summary": "State park covering much of Mackinac Island.",
    "whyItMatters": "Major regional outdoor/history anchor if taking a side trip.",
    "why": "Major regional outdoor/history anchor if taking a side trip.",
    "notes": {
      "elsie": "Think about why islands become parks.",
      "katrina": "Ask why cars are restricted on Mackinac Island.",
      "emma": "Connect tourism, nature, and preservation.",
      "eliette": "Find trails, signs, and shoreline views.",
      "jules": "Island park mission.",
      "momdad": "Major regional outdoor/history anchor if taking a side trip."
    },
    "profiles": {
      "elsie": "Think about why islands become parks.",
      "katrina": "Ask why cars are restricted on Mackinac Island.",
      "emma": "Connect tourism, nature, and preservation.",
      "eliette": "Find trails, signs, and shoreline views.",
      "jules": "Island park mission.",
      "momdad": "Major regional outdoor/history anchor if taking a side trip."
    },
    "csvOrder": 67
  },
  {
    "id": "P2-033",
    "title": "Fort Mackinac",
    "name": "Fort Mackinac",
    "category": "Historic Fort",
    "latitude": 45.8525,
    "longitude": -84.6174,
    "lat": 45.8525,
    "lon": -84.6174,
    "lng": -84.6174,
    "phase": "Phase 2",
    "routeSegment": "Mackinac Island / Straits",
    "route_segment": "Mackinac Island / Straits",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://www.mackinacparks.com/parks-and-attractions/fort-mackinac/",
    "official_website": "https://www.mackinacparks.com/parks-and-attractions/fort-mackinac/",
    "learnMoreUrl": "https://www.mackinacparks.com/parks-and-attractions/fort-mackinac/",
    "learn_more": "https://www.mackinacparks.com/parks-and-attractions/fort-mackinac/",
    "sourceUrl": "https://www.mackinacparks.com/parks-and-attractions/fort-mackinac/",
    "shortSummary": "Historic military fort on Mackinac Island.",
    "summary": "Historic military fort on Mackinac Island.",
    "whyItMatters": "Excellent military and Straits-history side trip.",
    "why": "Excellent military and Straits-history side trip.",
    "notes": {
      "elsie": "Think about strategic high ground.",
      "katrina": "Ask why forts were built above harbors.",
      "emma": "Connect defense, trade, and water routes.",
      "eliette": "Find cannon and uniform details.",
      "jules": "Fort mission.",
      "momdad": "Excellent military and Straits-history side trip."
    },
    "profiles": {
      "elsie": "Think about strategic high ground.",
      "katrina": "Ask why forts were built above harbors.",
      "emma": "Connect defense, trade, and water routes.",
      "eliette": "Find cannon and uniform details.",
      "jules": "Fort mission.",
      "momdad": "Excellent military and Straits-history side trip."
    },
    "csvOrder": 68
  },
  {
    "id": "P2-034",
    "title": "Arch Rock",
    "name": "Arch Rock",
    "category": "Scenic / Geology",
    "latitude": 45.859,
    "longitude": -84.61,
    "lat": 45.859,
    "lon": -84.61,
    "lng": -84.61,
    "phase": "Phase 2",
    "routeSegment": "Mackinac Island / Straits",
    "route_segment": "Mackinac Island / Straits",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.mackinacparks.com/parks-and-attractions/arch-rock/",
    "official_website": "https://www.mackinacparks.com/parks-and-attractions/arch-rock/",
    "learnMoreUrl": "https://www.mackinacparks.com/parks-and-attractions/arch-rock/",
    "learn_more": "https://www.mackinacparks.com/parks-and-attractions/arch-rock/",
    "sourceUrl": "https://www.mackinacparks.com/parks-and-attractions/arch-rock/",
    "shortSummary": "Natural limestone arch on Mackinac Island.",
    "summary": "Natural limestone arch on Mackinac Island.",
    "whyItMatters": "Strong geology/photo side trip.",
    "why": "Strong geology/photo side trip.",
    "notes": {
      "elsie": "Think about how rock formations change over time.",
      "katrina": "Ask what made the arch shape.",
      "emma": "Connect water, rock, and erosion.",
      "eliette": "Find the best frame for a photo.",
      "jules": "Rock arch mission.",
      "momdad": "Strong geology/photo side trip."
    },
    "profiles": {
      "elsie": "Think about how rock formations change over time.",
      "katrina": "Ask what made the arch shape.",
      "emma": "Connect water, rock, and erosion.",
      "eliette": "Find the best frame for a photo.",
      "jules": "Rock arch mission.",
      "momdad": "Strong geology/photo side trip."
    },
    "csvOrder": 69
  },
  {
    "id": "P2-035",
    "title": "Museum of Ojibwa Culture",
    "name": "Museum of Ojibwa Culture",
    "category": "Museum",
    "latitude": 45.8686,
    "longitude": -84.7278,
    "lat": 45.8686,
    "lon": -84.7278,
    "lng": -84.7278,
    "phase": "Phase 2",
    "routeSegment": "St. Ignace / Straits",
    "route_segment": "St. Ignace / Straits",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.cityofstignace.com/museum-ojibwa-culture",
    "official_website": "https://www.cityofstignace.com/museum-ojibwa-culture",
    "learnMoreUrl": "https://www.cityofstignace.com/museum-ojibwa-culture",
    "learn_more": "https://www.cityofstignace.com/museum-ojibwa-culture",
    "sourceUrl": "https://www.cityofstignace.com/museum-ojibwa-culture",
    "shortSummary": "Museum focused on Ojibwa culture in St. Ignace.",
    "summary": "Museum focused on Ojibwa culture in St. Ignace.",
    "whyItMatters": "Important Indigenous history context for the Straits.",
    "why": "Important Indigenous history context for the Straits.",
    "notes": {
      "elsie": "Think about whose stories came first in the region.",
      "katrina": "Ask how culture and place connect.",
      "emma": "Connect language, art, and daily life.",
      "eliette": "Look for patterns, tools, and symbols.",
      "jules": "Story and culture mission.",
      "momdad": "Important Indigenous history context for the Straits."
    },
    "profiles": {
      "elsie": "Think about whose stories came first in the region.",
      "katrina": "Ask how culture and place connect.",
      "emma": "Connect language, art, and daily life.",
      "eliette": "Look for patterns, tools, and symbols.",
      "jules": "Story and culture mission.",
      "momdad": "Important Indigenous history context for the Straits."
    },
    "csvOrder": 70
  },
  {
    "id": "P3-001",
    "title": "Soo Locks Visitor Center",
    "name": "Soo Locks Visitor Center",
    "category": "Engineering / Maritime",
    "latitude": 46.5036,
    "longitude": -84.3453,
    "lat": 46.5036,
    "lon": -84.3453,
    "lng": -84.3453,
    "phase": "Phase 3",
    "routeSegment": "Eastern Upper Peninsula",
    "route_segment": "Eastern Upper Peninsula",
    "tier": "Core",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.lrd.usace.army.mil/Submit-ArticleCS/Recreation/Article/3833525/soo-locks-visitor-center/",
    "official_website": "https://www.lrd.usace.army.mil/Submit-ArticleCS/Recreation/Article/3833525/soo-locks-visitor-center/",
    "learnMoreUrl": "https://www.lrd.usace.army.mil/Submit-ArticleCS/Recreation/Article/3833525/soo-locks-visitor-center/",
    "learn_more": "https://www.lrd.usace.army.mil/Submit-ArticleCS/Recreation/Article/3833525/soo-locks-visitor-center/",
    "sourceUrl": "https://www.lrd.usace.army.mil/Submit-ArticleCS/Recreation/Article/3833525/soo-locks-visitor-center/",
    "shortSummary": "Visitor center for the Soo Locks in Sault Ste. Marie.",
    "summary": "Visitor center for the Soo Locks in Sault Ste. Marie.",
    "whyItMatters": "Great engineering side trip showing Great Lakes shipping.",
    "why": "Great engineering side trip showing Great Lakes shipping.",
    "notes": {
      "elsie": "Think about how ships move between lake levels.",
      "katrina": "Ask why locks are needed.",
      "emma": "Connect shipping to food, cars, and goods.",
      "eliette": "Find big gates and ship details.",
      "jules": "Giant boat gate mission.",
      "momdad": "Great engineering side trip showing Great Lakes shipping."
    },
    "profiles": {
      "elsie": "Think about how ships move between lake levels.",
      "katrina": "Ask why locks are needed.",
      "emma": "Connect shipping to food, cars, and goods.",
      "eliette": "Find big gates and ship details.",
      "jules": "Giant boat gate mission.",
      "momdad": "Great engineering side trip showing Great Lakes shipping."
    },
    "csvOrder": 71
  },
  {
    "id": "P3-002",
    "title": "Tahquamenon Falls State Park",
    "name": "Tahquamenon Falls State Park",
    "category": "State Park / Waterfall",
    "latitude": 46.574,
    "longitude": -85.256,
    "lat": 46.574,
    "lon": -85.256,
    "lng": -85.256,
    "phase": "Phase 3",
    "routeSegment": "Eastern Upper Peninsula",
    "route_segment": "Eastern Upper Peninsula",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://www.michigan.gov/dnr/places/state-parks/tahquamenon-falls",
    "official_website": "https://www.michigan.gov/dnr/places/state-parks/tahquamenon-falls",
    "learnMoreUrl": "https://www.michigan.gov/dnr/places/state-parks/tahquamenon-falls",
    "learn_more": "https://www.michigan.gov/dnr/places/state-parks/tahquamenon-falls",
    "sourceUrl": "https://www.michigan.gov/dnr/places/state-parks/tahquamenon-falls",
    "shortSummary": "Famous Upper Peninsula waterfall park.",
    "summary": "Famous Upper Peninsula waterfall park.",
    "whyItMatters": "Top nature extension near the Straits region.",
    "why": "Top nature extension near the Straits region.",
    "notes": {
      "elsie": "Think about water power and forest ecosystems.",
      "katrina": "Ask why the water color looks different.",
      "emma": "Connect rivers, forests, and erosion.",
      "eliette": "Find foam, color, rocks, and trail details.",
      "jules": "Waterfall mission.",
      "momdad": "Top nature extension near the Straits region."
    },
    "profiles": {
      "elsie": "Think about water power and forest ecosystems.",
      "katrina": "Ask why the water color looks different.",
      "emma": "Connect rivers, forests, and erosion.",
      "eliette": "Find foam, color, rocks, and trail details.",
      "jules": "Waterfall mission.",
      "momdad": "Top nature extension near the Straits region."
    },
    "csvOrder": 72
  },
  {
    "id": "P3-003",
    "title": "Great Lakes Shipwreck Museum / Whitefish Point Light",
    "name": "Great Lakes Shipwreck Museum / Whitefish Point Light",
    "category": "Maritime Museum",
    "latitude": 46.7706,
    "longitude": -84.9571,
    "lat": 46.7706,
    "lon": -84.9571,
    "lng": -84.9571,
    "phase": "Phase 3",
    "routeSegment": "Whitefish Point / Michigan",
    "route_segment": "Whitefish Point / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://shipwreckmuseum.com/",
    "official_website": "https://shipwreckmuseum.com/",
    "learnMoreUrl": "https://shipwreckmuseum.com/",
    "learn_more": "https://shipwreckmuseum.com/",
    "sourceUrl": "https://shipwreckmuseum.com/",
    "shortSummary": "Maritime museum and lighthouse at Whitefish Point.",
    "summary": "Maritime museum and lighthouse at Whitefish Point.",
    "whyItMatters": "Major shipwreck and Great Lakes history stop.",
    "why": "Major shipwreck and Great Lakes history stop.",
    "notes": {
      "elsie": "Think about weather, risk, and navigation.",
      "katrina": "Ask why Lake Superior is dangerous for ships.",
      "emma": "Connect storms, cargo, and lighthouses.",
      "eliette": "Find lighthouse and shipwreck details.",
      "jules": "Shipwreck mission.",
      "momdad": "Major shipwreck and Great Lakes history stop."
    },
    "profiles": {
      "elsie": "Think about weather, risk, and navigation.",
      "katrina": "Ask why Lake Superior is dangerous for ships.",
      "emma": "Connect storms, cargo, and lighthouses.",
      "eliette": "Find lighthouse and shipwreck details.",
      "jules": "Shipwreck mission.",
      "momdad": "Major shipwreck and Great Lakes history stop."
    },
    "csvOrder": 73
  },
  {
    "id": "P3-004",
    "title": "Castle Rock",
    "name": "Castle Rock",
    "category": "Roadside Oddity",
    "latitude": 45.8683,
    "longitude": -84.7264,
    "lat": 45.8683,
    "lon": -84.7264,
    "lng": -84.7264,
    "phase": "Phase 3",
    "routeSegment": "St. Ignace / Michigan",
    "route_segment": "St. Ignace / Michigan",
    "tier": "Good Reset",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://www.stignace.com/attractions/castle-rock/",
    "official_website": "https://www.stignace.com/attractions/castle-rock/",
    "learnMoreUrl": "https://www.stignace.com/attractions/castle-rock/",
    "learn_more": "https://www.stignace.com/attractions/castle-rock/",
    "sourceUrl": "https://www.stignace.com/attractions/castle-rock/",
    "shortSummary": "Classic St. Ignace roadside overlook and attraction.",
    "summary": "Classic St. Ignace roadside overlook and attraction.",
    "whyItMatters": "Quick oddity/photo stop near the Straits.",
    "why": "Quick oddity/photo stop near the Straits.",
    "notes": {
      "elsie": "Think about why overlooks become attractions.",
      "katrina": "Ask what makes a good road-trip photo.",
      "emma": "Look for views and tourist signs.",
      "eliette": "Find the best photo detail.",
      "jules": "Big rock mission.",
      "momdad": "Quick oddity/photo stop near the Straits."
    },
    "profiles": {
      "elsie": "Think about why overlooks become attractions.",
      "katrina": "Ask what makes a good road-trip photo.",
      "emma": "Look for views and tourist signs.",
      "eliette": "Find the best photo detail.",
      "jules": "Big rock mission.",
      "momdad": "Quick oddity/photo stop near the Straits."
    },
    "csvOrder": 74
  },
  {
    "id": "P3-005",
    "title": "Mystery Spot",
    "name": "Mystery Spot",
    "category": "Roadside Oddity",
    "latitude": 45.868,
    "longitude": -84.789,
    "lat": 45.868,
    "lon": -84.789,
    "lng": -84.789,
    "phase": "Phase 3",
    "routeSegment": "St. Ignace / Michigan",
    "route_segment": "St. Ignace / Michigan",
    "tier": "Good Reset",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.mysteryspotstignace.com/",
    "official_website": "https://www.mysteryspotstignace.com/",
    "learnMoreUrl": "https://www.mysteryspotstignace.com/",
    "learn_more": "https://www.mysteryspotstignace.com/",
    "sourceUrl": "https://www.mysteryspotstignace.com/",
    "shortSummary": "Classic roadside mystery attraction near St. Ignace.",
    "summary": "Classic roadside mystery attraction near St. Ignace.",
    "whyItMatters": "Good quirky stop for kids and road-trip fun.",
    "why": "Good quirky stop for kids and road-trip fun.",
    "notes": {
      "elsie": "Think about perception and balance.",
      "katrina": "Ask what feels real versus tricked.",
      "emma": "Connect senses to science.",
      "eliette": "Look for clues in the room design.",
      "jules": "Weird gravity mission.",
      "momdad": "Good quirky stop for kids and road-trip fun."
    },
    "profiles": {
      "elsie": "Think about perception and balance.",
      "katrina": "Ask what feels real versus tricked.",
      "emma": "Connect senses to science.",
      "eliette": "Look for clues in the room design.",
      "jules": "Weird gravity mission.",
      "momdad": "Good quirky stop for kids and road-trip fun."
    },
    "csvOrder": 75
  },
  {
    "id": "P3-006",
    "title": "Levi and Catharine Coffin State Historic Site",
    "name": "Levi and Catharine Coffin State Historic Site",
    "category": "Historic Site",
    "latitude": 39.9565,
    "longitude": -84.9183,
    "lat": 39.9565,
    "lon": -84.9183,
    "lng": -84.9183,
    "phase": "Phase 3",
    "routeSegment": "Indiana return corridor",
    "route_segment": "Indiana return corridor",
    "tier": "Core",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.indianamuseum.org/historic-sites/levi-catharine-coffin-house/",
    "official_website": "https://www.indianamuseum.org/historic-sites/levi-catharine-coffin-house/",
    "learnMoreUrl": "https://www.indianamuseum.org/historic-sites/levi-catharine-coffin-house/",
    "learn_more": "https://www.indianamuseum.org/historic-sites/levi-catharine-coffin-house/",
    "sourceUrl": "https://www.indianamuseum.org/historic-sites/levi-catharine-coffin-house/",
    "shortSummary": "Underground Railroad historic site in Fountain City, Indiana.",
    "summary": "Underground Railroad historic site in Fountain City, Indiana.",
    "whyItMatters": "Powerful history stop on the return corridor with a direct justice and courage story.",
    "why": "Powerful history stop on the return corridor with a direct justice and courage story.",
    "notes": {
      "elsie": "Think about moral courage and risk.",
      "katrina": "Ask why helping people escape slavery was dangerous.",
      "emma": "Connect fairness, courage, and choices.",
      "eliette": "Look for hidden-room or house details.",
      "jules": "Safe-house mission.",
      "momdad": "Powerful history stop on the return corridor with a direct justice and courage story."
    },
    "profiles": {
      "elsie": "Think about moral courage and risk.",
      "katrina": "Ask why helping people escape slavery was dangerous.",
      "emma": "Connect fairness, courage, and choices.",
      "eliette": "Look for hidden-room or house details.",
      "jules": "Safe-house mission.",
      "momdad": "Powerful history stop on the return corridor with a direct justice and courage story."
    },
    "csvOrder": 76
  },
  {
    "id": "P3-007",
    "title": "Hayes Arboretum",
    "name": "Hayes Arboretum",
    "category": "Nature Preserve",
    "latitude": 39.8286,
    "longitude": -84.856,
    "lat": 39.8286,
    "lon": -84.856,
    "lng": -84.856,
    "phase": "Phase 3",
    "routeSegment": "Richmond / Indiana",
    "route_segment": "Richmond / Indiana",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://hayesarboretum.org/",
    "official_website": "https://hayesarboretum.org/",
    "learnMoreUrl": "https://hayesarboretum.org/",
    "learn_more": "https://hayesarboretum.org/",
    "sourceUrl": "https://hayesarboretum.org/",
    "shortSummary": "Large arboretum and nature area in Richmond, Indiana.",
    "summary": "Large arboretum and nature area in Richmond, Indiana.",
    "whyItMatters": "Good outdoor reset with trees, trails, and local ecology.",
    "why": "Good outdoor reset with trees, trails, and local ecology.",
    "notes": {
      "elsie": "Compare tree shapes and habitats.",
      "katrina": "Ask why people protect tree collections.",
      "emma": "Connect forests to clean air and shade.",
      "eliette": "Find bark, leaves, and trail markers.",
      "jules": "Tree mission.",
      "momdad": "Good outdoor reset with trees, trails, and local ecology."
    },
    "profiles": {
      "elsie": "Compare tree shapes and habitats.",
      "katrina": "Ask why people protect tree collections.",
      "emma": "Connect forests to clean air and shade.",
      "eliette": "Find bark, leaves, and trail markers.",
      "jules": "Tree mission.",
      "momdad": "Good outdoor reset with trees, trails, and local ecology."
    },
    "csvOrder": 77
  },
  {
    "id": "P3-008",
    "title": "Richmond Rose Garden",
    "name": "Richmond Rose Garden",
    "category": "Garden",
    "latitude": 39.8281,
    "longitude": -84.8794,
    "lat": 39.8281,
    "lon": -84.8794,
    "lng": -84.8794,
    "phase": "Phase 3",
    "routeSegment": "Richmond / Indiana",
    "route_segment": "Richmond / Indiana",
    "tier": "Good Reset",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://richmondrosegarden.com/",
    "official_website": "https://richmondrosegarden.com/",
    "learnMoreUrl": "https://richmondrosegarden.com/",
    "learn_more": "https://richmondrosegarden.com/",
    "sourceUrl": "https://richmondrosegarden.com/",
    "shortSummary": "Public rose garden in Richmond, Indiana.",
    "summary": "Public rose garden in Richmond, Indiana.",
    "whyItMatters": "Short colorful reset with easy visual interest.",
    "why": "Short colorful reset with easy visual interest.",
    "notes": {
      "elsie": "Notice color, pattern, and plant design.",
      "katrina": "Ask why public gardens matter to towns.",
      "emma": "Connect beauty, parks, and community life.",
      "eliette": "Pick the best rose detail.",
      "jules": "Flower mission.",
      "momdad": "Short colorful reset with easy visual interest."
    },
    "profiles": {
      "elsie": "Notice color, pattern, and plant design.",
      "katrina": "Ask why public gardens matter to towns.",
      "emma": "Connect beauty, parks, and community life.",
      "eliette": "Pick the best rose detail.",
      "jules": "Flower mission.",
      "momdad": "Short colorful reset with easy visual interest."
    },
    "csvOrder": 78
  },
  {
    "id": "P3-009",
    "title": "Wayne County Historical Museum",
    "name": "Wayne County Historical Museum",
    "category": "History Museum",
    "latitude": 39.8285,
    "longitude": -84.895,
    "lat": 39.8285,
    "lon": -84.895,
    "lng": -84.895,
    "phase": "Phase 3",
    "routeSegment": "Richmond / Indiana",
    "route_segment": "Richmond / Indiana",
    "tier": "Good Reset",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://waynecountyhistoricalmuseum.org/",
    "official_website": "https://waynecountyhistoricalmuseum.org/",
    "learnMoreUrl": "https://waynecountyhistoricalmuseum.org/",
    "learn_more": "https://waynecountyhistoricalmuseum.org/",
    "sourceUrl": "https://waynecountyhistoricalmuseum.org/",
    "shortSummary": "Local history museum in Richmond, Indiana.",
    "summary": "Local history museum in Richmond, Indiana.",
    "whyItMatters": "Adds small-city history and artifact variety to the return drive.",
    "why": "Adds small-city history and artifact variety to the return drive.",
    "notes": {
      "elsie": "Notice how local objects tell big stories.",
      "katrina": "Ask what makes a town remember certain things.",
      "emma": "Compare old daily life with today.",
      "eliette": "Find the strangest old object.",
      "jules": "Old-stuff mission.",
      "momdad": "Adds small-city history and artifact variety to the return drive."
    },
    "profiles": {
      "elsie": "Notice how local objects tell big stories.",
      "katrina": "Ask what makes a town remember certain things.",
      "emma": "Compare old daily life with today.",
      "eliette": "Find the strangest old object.",
      "jules": "Old-stuff mission.",
      "momdad": "Adds small-city history and artifact variety to the return drive."
    },
    "csvOrder": 79
  },
  {
    "id": "P3-010",
    "title": "Indianapolis Motor Speedway Museum",
    "name": "Indianapolis Motor Speedway Museum",
    "category": "Automotive Museum",
    "latitude": 39.7934,
    "longitude": -86.2352,
    "lat": 39.7934,
    "lon": -86.2352,
    "lng": -86.2352,
    "phase": "Phase 3",
    "routeSegment": "Indianapolis / Indiana",
    "route_segment": "Indianapolis / Indiana",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://imsmuseum.org/",
    "official_website": "https://imsmuseum.org/",
    "learnMoreUrl": "https://imsmuseum.org/",
    "learn_more": "https://imsmuseum.org/",
    "sourceUrl": "https://imsmuseum.org/",
    "shortSummary": "Museum at the Indianapolis Motor Speedway focused on racing history.",
    "summary": "Museum at the Indianapolis Motor Speedway focused on racing history.",
    "whyItMatters": "High-impact stop for cars, engineering, sports, and Indianapolis identity.",
    "why": "High-impact stop for cars, engineering, sports, and Indianapolis identity.",
    "notes": {
      "elsie": "Track how racing technology changed.",
      "katrina": "Ask why one race became world-famous.",
      "emma": "Connect sports, teams, speed, and tradition.",
      "eliette": "Find the best car color or logo.",
      "jules": "Race car mission.",
      "momdad": "High-impact stop for cars, engineering, sports, and Indianapolis identity."
    },
    "profiles": {
      "elsie": "Track how racing technology changed.",
      "katrina": "Ask why one race became world-famous.",
      "emma": "Connect sports, teams, speed, and tradition.",
      "eliette": "Find the best car color or logo.",
      "jules": "Race car mission.",
      "momdad": "High-impact stop for cars, engineering, sports, and Indianapolis identity."
    },
    "csvOrder": 80
  },
  {
    "id": "P3-011",
    "title": "The Children's Museum of Indianapolis",
    "name": "The Children's Museum of Indianapolis",
    "category": "Children's Museum",
    "latitude": 39.8106,
    "longitude": -86.1579,
    "lat": 39.8106,
    "lon": -86.1579,
    "lng": -86.1579,
    "phase": "Phase 3",
    "routeSegment": "Indianapolis / Indiana",
    "route_segment": "Indianapolis / Indiana",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://www.childrensmuseum.org/",
    "official_website": "https://www.childrensmuseum.org/",
    "learnMoreUrl": "https://www.childrensmuseum.org/",
    "learn_more": "https://www.childrensmuseum.org/",
    "sourceUrl": "https://www.childrensmuseum.org/",
    "shortSummary": "Large children's museum with science, history, and dinosaur exhibits.",
    "summary": "Large children's museum with science, history, and dinosaur exhibits.",
    "whyItMatters": "Excellent high-energy family stop on the return corridor.",
    "why": "Excellent high-energy family stop on the return corridor.",
    "notes": {
      "elsie": "Pick one exhibit and explain its story.",
      "katrina": "Ask what makes a museum fun and educational.",
      "emma": "Connect play with learning.",
      "eliette": "Find one tiny detail others miss.",
      "jules": "Dinosaur and button mission.",
      "momdad": "Excellent high-energy family stop on the return corridor."
    },
    "profiles": {
      "elsie": "Pick one exhibit and explain its story.",
      "katrina": "Ask what makes a museum fun and educational.",
      "emma": "Connect play with learning.",
      "eliette": "Find one tiny detail others miss.",
      "jules": "Dinosaur and button mission.",
      "momdad": "Excellent high-energy family stop on the return corridor."
    },
    "csvOrder": 81
  },
  {
    "id": "P3-012",
    "title": "Indiana State Museum",
    "name": "Indiana State Museum",
    "category": "State Museum",
    "latitude": 39.7687,
    "longitude": -86.1693,
    "lat": 39.7687,
    "lon": -86.1693,
    "lng": -86.1693,
    "phase": "Phase 3",
    "routeSegment": "Indianapolis / Indiana",
    "route_segment": "Indianapolis / Indiana",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.indianamuseum.org/",
    "official_website": "https://www.indianamuseum.org/",
    "learnMoreUrl": "https://www.indianamuseum.org/",
    "learn_more": "https://www.indianamuseum.org/",
    "sourceUrl": "https://www.indianamuseum.org/",
    "shortSummary": "Museum covering Indiana history, science, and culture.",
    "summary": "Museum covering Indiana history, science, and culture.",
    "whyItMatters": "Strong indoor stop for state context on the drive home.",
    "why": "Strong indoor stop for state context on the drive home.",
    "notes": {
      "elsie": "Compare Indiana's story with Kansas and Michigan.",
      "katrina": "Ask what makes a state unique.",
      "emma": "Connect fossils, history, and daily life.",
      "eliette": "Find an object with a surprising story.",
      "jules": "Indiana museum mission.",
      "momdad": "Strong indoor stop for state context on the drive home."
    },
    "profiles": {
      "elsie": "Compare Indiana's story with Kansas and Michigan.",
      "katrina": "Ask what makes a state unique.",
      "emma": "Connect fossils, history, and daily life.",
      "eliette": "Find an object with a surprising story.",
      "jules": "Indiana museum mission.",
      "momdad": "Strong indoor stop for state context on the drive home."
    },
    "csvOrder": 82
  },
  {
    "id": "P3-013",
    "title": "Eiteljorg Museum",
    "name": "Eiteljorg Museum",
    "category": "Art / Native American History",
    "latitude": 39.7681,
    "longitude": -86.1677,
    "lat": 39.7681,
    "lon": -86.1677,
    "lng": -86.1677,
    "phase": "Phase 3",
    "routeSegment": "Indianapolis / Indiana",
    "route_segment": "Indianapolis / Indiana",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://eiteljorg.org/",
    "official_website": "https://eiteljorg.org/",
    "learnMoreUrl": "https://eiteljorg.org/",
    "learn_more": "https://eiteljorg.org/",
    "sourceUrl": "https://eiteljorg.org/",
    "shortSummary": "Museum of Native American and Western art in Indianapolis.",
    "summary": "Museum of Native American and Western art in Indianapolis.",
    "whyItMatters": "Adds art and Indigenous history perspective to the route.",
    "why": "Adds art and Indigenous history perspective to the route.",
    "notes": {
      "elsie": "Think about art as history.",
      "katrina": "Ask whose stories are shown in museums.",
      "emma": "Connect people, places, and images.",
      "eliette": "Find patterns, colors, and symbols.",
      "jules": "Art clue mission.",
      "momdad": "Adds art and Indigenous history perspective to the route."
    },
    "profiles": {
      "elsie": "Think about art as history.",
      "katrina": "Ask whose stories are shown in museums.",
      "emma": "Connect people, places, and images.",
      "eliette": "Find patterns, colors, and symbols.",
      "jules": "Art clue mission.",
      "momdad": "Adds art and Indigenous history perspective to the route."
    },
    "csvOrder": 83
  },
  {
    "id": "P3-014",
    "title": "Conner Prairie",
    "name": "Conner Prairie",
    "category": "Living History Museum",
    "latitude": 39.9844,
    "longitude": -86.0331,
    "lat": 39.9844,
    "lon": -86.0331,
    "lng": -86.0331,
    "phase": "Phase 3",
    "routeSegment": "Fishers / Indiana",
    "route_segment": "Fishers / Indiana",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://www.connerprairie.org/",
    "official_website": "https://www.connerprairie.org/",
    "learnMoreUrl": "https://www.connerprairie.org/",
    "learn_more": "https://www.connerprairie.org/",
    "sourceUrl": "https://www.connerprairie.org/",
    "shortSummary": "Living history museum in Fishers, Indiana.",
    "summary": "Living history museum in Fishers, Indiana.",
    "whyItMatters": "Hands-on family history stop with immersive pioneer-era interpretation.",
    "why": "Hands-on family history stop with immersive pioneer-era interpretation.",
    "notes": {
      "elsie": "Compare old work and modern life.",
      "katrina": "Ask what chores kids did long ago.",
      "emma": "Connect homes, food, work, and weather.",
      "eliette": "Look for clothing, tools, and craft details.",
      "jules": "Old-time village mission.",
      "momdad": "Hands-on family history stop with immersive pioneer-era interpretation."
    },
    "profiles": {
      "elsie": "Compare old work and modern life.",
      "katrina": "Ask what chores kids did long ago.",
      "emma": "Connect homes, food, work, and weather.",
      "eliette": "Look for clothing, tools, and craft details.",
      "jules": "Old-time village mission.",
      "momdad": "Hands-on family history stop with immersive pioneer-era interpretation."
    },
    "csvOrder": 84
  },
  {
    "id": "P3-015",
    "title": "Fort Wayne Zoo",
    "name": "Fort Wayne Zoo",
    "category": "Zoo",
    "latitude": 41.0929,
    "longitude": -85.1436,
    "lat": 41.0929,
    "lon": -85.1436,
    "lng": -85.1436,
    "phase": "Phase 3",
    "routeSegment": "Fort Wayne / Indiana",
    "route_segment": "Fort Wayne / Indiana",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://fwzoo.com/",
    "official_website": "https://fwzoo.com/",
    "learnMoreUrl": "https://fwzoo.com/",
    "learn_more": "https://fwzoo.com/",
    "sourceUrl": "https://fwzoo.com/",
    "shortSummary": "Regional zoo in Fort Wayne.",
    "summary": "Regional zoo in Fort Wayne.",
    "whyItMatters": "Good kid-friendly stop if taking a northern Indiana return variation.",
    "why": "Good kid-friendly stop if taking a northern Indiana return variation.",
    "notes": {
      "elsie": "Think about animal care and habitats.",
      "katrina": "Ask why conservation matters.",
      "emma": "Pick one animal and describe its routine.",
      "eliette": "Find colors, patterns, and signs.",
      "jules": "Animal mission.",
      "momdad": "Good kid-friendly stop if taking a northern Indiana return variation."
    },
    "profiles": {
      "elsie": "Think about animal care and habitats.",
      "katrina": "Ask why conservation matters.",
      "emma": "Pick one animal and describe its routine.",
      "eliette": "Find colors, patterns, and signs.",
      "jules": "Animal mission.",
      "momdad": "Good kid-friendly stop if taking a northern Indiana return variation."
    },
    "csvOrder": 85
  },
  {
    "id": "P3-016",
    "title": "Foellinger-Freimann Botanical Conservatory",
    "name": "Foellinger-Freimann Botanical Conservatory",
    "category": "Garden",
    "latitude": 41.077,
    "longitude": -85.1374,
    "lat": 41.077,
    "lon": -85.1374,
    "lng": -85.1374,
    "phase": "Phase 3",
    "routeSegment": "Fort Wayne / Indiana",
    "route_segment": "Fort Wayne / Indiana",
    "tier": "Good Reset",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.botanicalconservatory.org/",
    "official_website": "https://www.botanicalconservatory.org/",
    "learnMoreUrl": "https://www.botanicalconservatory.org/",
    "learn_more": "https://www.botanicalconservatory.org/",
    "sourceUrl": "https://www.botanicalconservatory.org/",
    "shortSummary": "Indoor botanical conservatory in downtown Fort Wayne.",
    "summary": "Indoor botanical conservatory in downtown Fort Wayne.",
    "whyItMatters": "Weather-proof plant and design stop.",
    "why": "Weather-proof plant and design stop.",
    "notes": {
      "elsie": "Notice how indoor environments can mimic nature.",
      "katrina": "Ask why some plants need special climates.",
      "emma": "Connect temperature, humidity, and plants.",
      "eliette": "Find textures and unusual leaves.",
      "jules": "Jungle plant mission.",
      "momdad": "Weather-proof plant and design stop."
    },
    "profiles": {
      "elsie": "Notice how indoor environments can mimic nature.",
      "katrina": "Ask why some plants need special climates.",
      "emma": "Connect temperature, humidity, and plants.",
      "eliette": "Find textures and unusual leaves.",
      "jules": "Jungle plant mission.",
      "momdad": "Weather-proof plant and design stop."
    },
    "csvOrder": 86
  },
  {
    "id": "P3-017",
    "title": "Kalamazoo Valley Museum",
    "name": "Kalamazoo Valley Museum",
    "category": "Science / History Museum",
    "latitude": 42.2925,
    "longitude": -85.5836,
    "lat": 42.2925,
    "lon": -85.5836,
    "lng": -85.5836,
    "phase": "Phase 2",
    "routeSegment": "Kalamazoo / Michigan",
    "route_segment": "Kalamazoo / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://kalamazoomuseum.org/",
    "official_website": "https://kalamazoomuseum.org/",
    "learnMoreUrl": "https://kalamazoomuseum.org/",
    "learn_more": "https://kalamazoomuseum.org/",
    "sourceUrl": "https://kalamazoomuseum.org/",
    "shortSummary": "Hands-on museum focused on science, technology, and history.",
    "summary": "Hands-on museum focused on science, technology, and history.",
    "whyItMatters": "Good family museum near the Michigan corridor.",
    "why": "Good family museum near the Michigan corridor.",
    "notes": {
      "elsie": "Choose one exhibit and explain it like a teacher.",
      "katrina": "Ask why local inventions matter.",
      "emma": "Connect science to everyday things.",
      "eliette": "Find one odd artifact.",
      "jules": "Museum discovery mission.",
      "momdad": "Good family museum near the Michigan corridor."
    },
    "profiles": {
      "elsie": "Choose one exhibit and explain it like a teacher.",
      "katrina": "Ask why local inventions matter.",
      "emma": "Connect science to everyday things.",
      "eliette": "Find one odd artifact.",
      "jules": "Museum discovery mission.",
      "momdad": "Good family museum near the Michigan corridor."
    },
    "csvOrder": 87
  },
  {
    "id": "P3-018",
    "title": "Kalamazoo Nature Center",
    "name": "Kalamazoo Nature Center",
    "category": "Nature Center",
    "latitude": 42.3825,
    "longitude": -85.5884,
    "lat": 42.3825,
    "lon": -85.5884,
    "lng": -85.5884,
    "phase": "Phase 2",
    "routeSegment": "Kalamazoo / Michigan",
    "route_segment": "Kalamazoo / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://naturecenter.org/",
    "official_website": "https://naturecenter.org/",
    "learnMoreUrl": "https://naturecenter.org/",
    "learn_more": "https://naturecenter.org/",
    "sourceUrl": "https://naturecenter.org/",
    "shortSummary": "Nature center with trails and environmental education.",
    "summary": "Nature center with trails and environmental education.",
    "whyItMatters": "Outdoor reset with a strong nature-learning purpose.",
    "why": "Outdoor reset with a strong nature-learning purpose.",
    "notes": {
      "elsie": "Watch for habitat changes on trails.",
      "katrina": "Ask why protected land matters near cities.",
      "emma": "Connect hiking, weather, and wildlife.",
      "eliette": "Find small trail details.",
      "jules": "Nature walk mission.",
      "momdad": "Outdoor reset with a strong nature-learning purpose."
    },
    "profiles": {
      "elsie": "Watch for habitat changes on trails.",
      "katrina": "Ask why protected land matters near cities.",
      "emma": "Connect hiking, weather, and wildlife.",
      "eliette": "Find small trail details.",
      "jules": "Nature walk mission.",
      "momdad": "Outdoor reset with a strong nature-learning purpose."
    },
    "csvOrder": 88
  },
  {
    "id": "P3-019",
    "title": "Binder Park Zoo",
    "name": "Binder Park Zoo",
    "category": "Zoo",
    "latitude": 42.2764,
    "longitude": -85.1507,
    "lat": 42.2764,
    "lon": -85.1507,
    "lng": -85.1507,
    "phase": "Phase 2",
    "routeSegment": "Battle Creek / Michigan",
    "route_segment": "Battle Creek / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://binderparkzoo.org/",
    "official_website": "https://binderparkzoo.org/",
    "learnMoreUrl": "https://binderparkzoo.org/",
    "learn_more": "https://binderparkzoo.org/",
    "sourceUrl": "https://binderparkzoo.org/",
    "shortSummary": "Large zoo near Battle Creek, Michigan.",
    "summary": "Large zoo near Battle Creek, Michigan.",
    "whyItMatters": "Good family stop if timing favors a zoo reset.",
    "why": "Good family stop if timing favors a zoo reset.",
    "notes": {
      "elsie": "Compare animals and habitats.",
      "katrina": "Ask why some animals need large spaces.",
      "emma": "Connect conservation to daily choices.",
      "eliette": "Find an animal pattern or footprint.",
      "jules": "Zoo mission.",
      "momdad": "Good family stop if timing favors a zoo reset."
    },
    "profiles": {
      "elsie": "Compare animals and habitats.",
      "katrina": "Ask why some animals need large spaces.",
      "emma": "Connect conservation to daily choices.",
      "eliette": "Find an animal pattern or footprint.",
      "jules": "Zoo mission.",
      "momdad": "Good family stop if timing favors a zoo reset."
    },
    "csvOrder": 89
  },
  {
    "id": "P3-020",
    "title": "Grand Rapids Public Museum",
    "name": "Grand Rapids Public Museum",
    "category": "Museum",
    "latitude": 42.9653,
    "longitude": -85.6769,
    "lat": 42.9653,
    "lon": -85.6769,
    "lng": -85.6769,
    "phase": "Phase 2",
    "routeSegment": "Grand Rapids / Michigan",
    "route_segment": "Grand Rapids / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.grpm.org/",
    "official_website": "https://www.grpm.org/",
    "learnMoreUrl": "https://www.grpm.org/",
    "learn_more": "https://www.grpm.org/",
    "sourceUrl": "https://www.grpm.org/",
    "shortSummary": "Public museum on the Grand River in Grand Rapids.",
    "summary": "Public museum on the Grand River in Grand Rapids.",
    "whyItMatters": "Strong indoor stop for regional history and science.",
    "why": "Strong indoor stop for regional history and science.",
    "notes": {
      "elsie": "Think about how cities collect their stories.",
      "katrina": "Ask what artifacts belong in a city museum.",
      "emma": "Connect rivers, work, and city life.",
      "eliette": "Find the carousel or a favorite object.",
      "jules": "Big museum mission.",
      "momdad": "Strong indoor stop for regional history and science."
    },
    "profiles": {
      "elsie": "Think about how cities collect their stories.",
      "katrina": "Ask what artifacts belong in a city museum.",
      "emma": "Connect rivers, work, and city life.",
      "eliette": "Find the carousel or a favorite object.",
      "jules": "Big museum mission.",
      "momdad": "Strong indoor stop for regional history and science."
    },
    "csvOrder": 90
  },
  {
    "id": "P3-021",
    "title": "Frederik Meijer Gardens & Sculpture Park",
    "name": "Frederik Meijer Gardens & Sculpture Park",
    "category": "Garden / Art Museum",
    "latitude": 42.9804,
    "longitude": -85.5909,
    "lat": 42.9804,
    "lon": -85.5909,
    "lng": -85.5909,
    "phase": "Phase 2",
    "routeSegment": "Grand Rapids / Michigan",
    "route_segment": "Grand Rapids / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://www.meijergardens.org/",
    "official_website": "https://www.meijergardens.org/",
    "learnMoreUrl": "https://www.meijergardens.org/",
    "learn_more": "https://www.meijergardens.org/",
    "sourceUrl": "https://www.meijergardens.org/",
    "shortSummary": "Botanical garden and sculpture park in Grand Rapids.",
    "summary": "Botanical garden and sculpture park in Grand Rapids.",
    "whyItMatters": "Major art-and-nature stop with strong visual appeal.",
    "why": "Major art-and-nature stop with strong visual appeal.",
    "notes": {
      "elsie": "Compare sculpture and landscape design.",
      "katrina": "Ask how outdoor art changes a place.",
      "emma": "Connect plants, paths, and creativity.",
      "eliette": "Find the most interesting sculpture detail.",
      "jules": "Giant art mission.",
      "momdad": "Major art-and-nature stop with strong visual appeal."
    },
    "profiles": {
      "elsie": "Compare sculpture and landscape design.",
      "katrina": "Ask how outdoor art changes a place.",
      "emma": "Connect plants, paths, and creativity.",
      "eliette": "Find the most interesting sculpture detail.",
      "jules": "Giant art mission.",
      "momdad": "Major art-and-nature stop with strong visual appeal."
    },
    "csvOrder": 91
  },
  {
    "id": "P3-022",
    "title": "John Ball Zoo",
    "name": "John Ball Zoo",
    "category": "Zoo",
    "latitude": 42.9631,
    "longitude": -85.7047,
    "lat": 42.9631,
    "lon": -85.7047,
    "lng": -85.7047,
    "phase": "Phase 2",
    "routeSegment": "Grand Rapids / Michigan",
    "route_segment": "Grand Rapids / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 120,
    "estimated_stop_minutes": 120,
    "officialWebsiteUrl": "https://jbzoo.org/",
    "official_website": "https://jbzoo.org/",
    "learnMoreUrl": "https://jbzoo.org/",
    "learn_more": "https://jbzoo.org/",
    "sourceUrl": "https://jbzoo.org/",
    "shortSummary": "Grand Rapids zoo with animal exhibits and conservation focus.",
    "summary": "Grand Rapids zoo with animal exhibits and conservation focus.",
    "whyItMatters": "Family-friendly animal stop on the Michigan leg.",
    "why": "Family-friendly animal stop on the Michigan leg.",
    "notes": {
      "elsie": "Think about zoo design and habitats.",
      "katrina": "Ask what animals need from caretakers.",
      "emma": "Connect conservation to local choices.",
      "eliette": "Find animal colors and signs.",
      "jules": "Animal trail mission.",
      "momdad": "Family-friendly animal stop on the Michigan leg."
    },
    "profiles": {
      "elsie": "Think about zoo design and habitats.",
      "katrina": "Ask what animals need from caretakers.",
      "emma": "Connect conservation to local choices.",
      "eliette": "Find animal colors and signs.",
      "jules": "Animal trail mission.",
      "momdad": "Family-friendly animal stop on the Michigan leg."
    },
    "csvOrder": 92
  },
  {
    "id": "P3-023",
    "title": "Holland State Park",
    "name": "Holland State Park",
    "category": "State Park / Beach",
    "latitude": 42.7728,
    "longitude": -86.2097,
    "lat": 42.7728,
    "lon": -86.2097,
    "lng": -86.2097,
    "phase": "Phase 2",
    "routeSegment": "Holland / Michigan",
    "route_segment": "Holland / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.michigan.gov/dnr/places/state-parks/holland",
    "official_website": "https://www.michigan.gov/dnr/places/state-parks/holland",
    "learnMoreUrl": "https://www.michigan.gov/dnr/places/state-parks/holland",
    "learn_more": "https://www.michigan.gov/dnr/places/state-parks/holland",
    "sourceUrl": "https://www.michigan.gov/dnr/places/state-parks/holland",
    "shortSummary": "Lake Michigan beach park near Holland Harbor and Big Red views.",
    "summary": "Lake Michigan beach park near Holland Harbor and Big Red views.",
    "whyItMatters": "Great beach/photo stop on a western Michigan variation.",
    "why": "Great beach/photo stop on a western Michigan variation.",
    "notes": {
      "elsie": "Notice waves, dunes, and harbor traffic.",
      "katrina": "Ask why beaches and harbors change over time.",
      "emma": "Connect lake weather to travel plans.",
      "eliette": "Find sand, water, and lighthouse details.",
      "jules": "Beach mission.",
      "momdad": "Great beach/photo stop on a western Michigan variation."
    },
    "profiles": {
      "elsie": "Notice waves, dunes, and harbor traffic.",
      "katrina": "Ask why beaches and harbors change over time.",
      "emma": "Connect lake weather to travel plans.",
      "eliette": "Find sand, water, and lighthouse details.",
      "jules": "Beach mission.",
      "momdad": "Great beach/photo stop on a western Michigan variation."
    },
    "csvOrder": 93
  },
  {
    "id": "P3-024",
    "title": "Windmill Island Gardens",
    "name": "Windmill Island Gardens",
    "category": "Garden / Cultural Site",
    "latitude": 42.798,
    "longitude": -86.1079,
    "lat": 42.798,
    "lon": -86.1079,
    "lng": -86.1079,
    "phase": "Phase 2",
    "routeSegment": "Holland / Michigan",
    "route_segment": "Holland / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.cityofholland.com/471/Windmill-Island-Gardens",
    "official_website": "https://www.cityofholland.com/471/Windmill-Island-Gardens",
    "learnMoreUrl": "https://www.cityofholland.com/471/Windmill-Island-Gardens",
    "learn_more": "https://www.cityofholland.com/471/Windmill-Island-Gardens",
    "sourceUrl": "https://www.cityofholland.com/471/Windmill-Island-Gardens",
    "shortSummary": "Holland attraction with gardens and a Dutch windmill.",
    "summary": "Holland attraction with gardens and a Dutch windmill.",
    "whyItMatters": "Good visual stop with cultural and mechanical hooks.",
    "why": "Good visual stop with cultural and mechanical hooks.",
    "notes": {
      "elsie": "Think about immigrant traditions and place identity.",
      "katrina": "Ask why a town celebrates Dutch heritage.",
      "emma": "Connect machines, gardens, and culture.",
      "eliette": "Find tulip, windmill, or costume details.",
      "jules": "Windmill mission.",
      "momdad": "Good visual stop with cultural and mechanical hooks."
    },
    "profiles": {
      "elsie": "Think about immigrant traditions and place identity.",
      "katrina": "Ask why a town celebrates Dutch heritage.",
      "emma": "Connect machines, gardens, and culture.",
      "eliette": "Find tulip, windmill, or costume details.",
      "jules": "Windmill mission.",
      "momdad": "Good visual stop with cultural and mechanical hooks."
    },
    "csvOrder": 94
  },
  {
    "id": "P3-025",
    "title": "Grand Haven State Park",
    "name": "Grand Haven State Park",
    "category": "State Park / Beach",
    "latitude": 43.0578,
    "longitude": -86.2461,
    "lat": 43.0578,
    "lon": -86.2461,
    "lng": -86.2461,
    "phase": "Phase 2",
    "routeSegment": "Grand Haven / Michigan",
    "route_segment": "Grand Haven / Michigan",
    "tier": "Good Reset",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.michigan.gov/dnr/places/state-parks/grand-haven",
    "official_website": "https://www.michigan.gov/dnr/places/state-parks/grand-haven",
    "learnMoreUrl": "https://www.michigan.gov/dnr/places/state-parks/grand-haven",
    "learn_more": "https://www.michigan.gov/dnr/places/state-parks/grand-haven",
    "sourceUrl": "https://www.michigan.gov/dnr/places/state-parks/grand-haven",
    "shortSummary": "Beach park at Grand Haven with lighthouse views.",
    "summary": "Beach park at Grand Haven with lighthouse views.",
    "whyItMatters": "Good Lake Michigan stretch stop if routed along the lakeshore.",
    "why": "Good Lake Michigan stretch stop if routed along the lakeshore.",
    "notes": {
      "elsie": "Compare beach towns and inland towns.",
      "katrina": "Ask how piers and lights help boats.",
      "emma": "Connect recreation, weather, and water.",
      "eliette": "Find lighthouse and wave details.",
      "jules": "Pier mission.",
      "momdad": "Good Lake Michigan stretch stop if routed along the lakeshore."
    },
    "profiles": {
      "elsie": "Compare beach towns and inland towns.",
      "katrina": "Ask how piers and lights help boats.",
      "emma": "Connect recreation, weather, and water.",
      "eliette": "Find lighthouse and wave details.",
      "jules": "Pier mission.",
      "momdad": "Good Lake Michigan stretch stop if routed along the lakeshore."
    },
    "csvOrder": 95
  },
  {
    "id": "P3-026",
    "title": "Silver Lake State Park",
    "name": "Silver Lake State Park",
    "category": "State Park / Dunes",
    "latitude": 43.6409,
    "longitude": -86.5123,
    "lat": 43.6409,
    "lon": -86.5123,
    "lng": -86.5123,
    "phase": "Phase 2",
    "routeSegment": "Mears / Michigan",
    "route_segment": "Mears / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.michigan.gov/dnr/places/state-parks/silver-lake",
    "official_website": "https://www.michigan.gov/dnr/places/state-parks/silver-lake",
    "learnMoreUrl": "https://www.michigan.gov/dnr/places/state-parks/silver-lake",
    "learn_more": "https://www.michigan.gov/dnr/places/state-parks/silver-lake",
    "sourceUrl": "https://www.michigan.gov/dnr/places/state-parks/silver-lake",
    "shortSummary": "State park with dunes, lake, and Lake Michigan access.",
    "summary": "State park with dunes, lake, and Lake Michigan access.",
    "whyItMatters": "High-value dunes stop on a western Michigan route variation.",
    "why": "High-value dunes stop on a western Michigan route variation.",
    "notes": {
      "elsie": "Think about how wind shapes land.",
      "katrina": "Ask why dunes move and change.",
      "emma": "Connect sand, vehicles, water, and safety.",
      "eliette": "Find dune textures and patterns.",
      "jules": "Sand mountain mission.",
      "momdad": "High-value dunes stop on a western Michigan route variation."
    },
    "profiles": {
      "elsie": "Think about how wind shapes land.",
      "katrina": "Ask why dunes move and change.",
      "emma": "Connect sand, vehicles, water, and safety.",
      "eliette": "Find dune textures and patterns.",
      "jules": "Sand mountain mission.",
      "momdad": "High-value dunes stop on a western Michigan route variation."
    },
    "csvOrder": 96
  },
  {
    "id": "P3-027",
    "title": "Little Sable Point Lighthouse",
    "name": "Little Sable Point Lighthouse",
    "category": "Lighthouse",
    "latitude": 43.6512,
    "longitude": -86.5384,
    "lat": 43.6512,
    "lon": -86.5384,
    "lng": -86.5384,
    "phase": "Phase 2",
    "routeSegment": "Mears / Michigan",
    "route_segment": "Mears / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.lakeshorekeepers.org/little-sable-point-lighthouse",
    "official_website": "https://www.lakeshorekeepers.org/little-sable-point-lighthouse",
    "learnMoreUrl": "https://www.lakeshorekeepers.org/little-sable-point-lighthouse",
    "learn_more": "https://www.lakeshorekeepers.org/little-sable-point-lighthouse",
    "sourceUrl": "https://www.lakeshorekeepers.org/little-sable-point-lighthouse",
    "shortSummary": "Historic brick lighthouse near Silver Lake State Park.",
    "summary": "Historic brick lighthouse near Silver Lake State Park.",
    "whyItMatters": "Strong maritime photo stop paired with dunes.",
    "why": "Strong maritime photo stop paired with dunes.",
    "notes": {
      "elsie": "Compare this lighthouse to Straits lights.",
      "katrina": "Ask why lighthouses differ in shape and height.",
      "emma": "Connect shorelines, storms, and safety.",
      "eliette": "Find brick, lens, and tower details.",
      "jules": "Tall tower mission.",
      "momdad": "Strong maritime photo stop paired with dunes."
    },
    "profiles": {
      "elsie": "Compare this lighthouse to Straits lights.",
      "katrina": "Ask why lighthouses differ in shape and height.",
      "emma": "Connect shorelines, storms, and safety.",
      "eliette": "Find brick, lens, and tower details.",
      "jules": "Tall tower mission.",
      "momdad": "Strong maritime photo stop paired with dunes."
    },
    "csvOrder": 97
  },
  {
    "id": "P3-028",
    "title": "Big Sable Point Lighthouse",
    "name": "Big Sable Point Lighthouse",
    "category": "Lighthouse",
    "latitude": 44.0556,
    "longitude": -86.5149,
    "lat": 44.0556,
    "lon": -86.5149,
    "lng": -86.5149,
    "phase": "Phase 2",
    "routeSegment": "Ludington / Michigan",
    "route_segment": "Ludington / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.lakeshorekeepers.org/big-sable-point-lighthouse",
    "official_website": "https://www.lakeshorekeepers.org/big-sable-point-lighthouse",
    "learnMoreUrl": "https://www.lakeshorekeepers.org/big-sable-point-lighthouse",
    "learn_more": "https://www.lakeshorekeepers.org/big-sable-point-lighthouse",
    "sourceUrl": "https://www.lakeshorekeepers.org/big-sable-point-lighthouse",
    "shortSummary": "Historic lighthouse in Ludington State Park.",
    "summary": "Historic lighthouse in Ludington State Park.",
    "whyItMatters": "Scenic maritime stop with a walk-to destination feel.",
    "why": "Scenic maritime stop with a walk-to destination feel.",
    "notes": {
      "elsie": "Think about isolation and lighthouse work.",
      "katrina": "Ask what life was like for keepers.",
      "emma": "Connect weather, ships, and daily routines.",
      "eliette": "Find stripes, sand, and shoreline details.",
      "jules": "Lighthouse walk mission.",
      "momdad": "Scenic maritime stop with a walk-to destination feel."
    },
    "profiles": {
      "elsie": "Think about isolation and lighthouse work.",
      "katrina": "Ask what life was like for keepers.",
      "emma": "Connect weather, ships, and daily routines.",
      "eliette": "Find stripes, sand, and shoreline details.",
      "jules": "Lighthouse walk mission.",
      "momdad": "Scenic maritime stop with a walk-to destination feel."
    },
    "csvOrder": 98
  },
  {
    "id": "P3-029",
    "title": "Manistee North Pierhead Lighthouse",
    "name": "Manistee North Pierhead Lighthouse",
    "category": "Lighthouse",
    "latitude": 44.2513,
    "longitude": -86.3465,
    "lat": 44.2513,
    "lon": -86.3465,
    "lng": -86.3465,
    "phase": "Phase 2",
    "routeSegment": "Manistee / Michigan",
    "route_segment": "Manistee / Michigan",
    "tier": "Good Reset",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.lakeshorekeepers.org/manistee-north-pierhead-lighthouse",
    "official_website": "https://www.lakeshorekeepers.org/manistee-north-pierhead-lighthouse",
    "learnMoreUrl": "https://www.lakeshorekeepers.org/manistee-north-pierhead-lighthouse",
    "learn_more": "https://www.lakeshorekeepers.org/manistee-north-pierhead-lighthouse",
    "sourceUrl": "https://www.lakeshorekeepers.org/manistee-north-pierhead-lighthouse",
    "shortSummary": "Historic Manistee lighthouse and pierhead landmark.",
    "summary": "Historic Manistee lighthouse and pierhead landmark.",
    "whyItMatters": "Good quick maritime stop on the western Michigan corridor.",
    "why": "Good quick maritime stop on the western Michigan corridor.",
    "notes": {
      "elsie": "Notice harbor entrances and wave action.",
      "katrina": "Ask why pier lights are different from shore lights.",
      "emma": "Connect towns, boats, and lake weather.",
      "eliette": "Find railings, color, and water details.",
      "jules": "Pier light mission.",
      "momdad": "Good quick maritime stop on the western Michigan corridor."
    },
    "profiles": {
      "elsie": "Notice harbor entrances and wave action.",
      "katrina": "Ask why pier lights are different from shore lights.",
      "emma": "Connect towns, boats, and lake weather.",
      "eliette": "Find railings, color, and water details.",
      "jules": "Pier light mission.",
      "momdad": "Good quick maritime stop on the western Michigan corridor."
    },
    "csvOrder": 99
  },
  {
    "id": "P3-030",
    "title": "Sleeping Bear Dunes National Lakeshore",
    "name": "Sleeping Bear Dunes National Lakeshore",
    "category": "National Lakeshore",
    "latitude": 44.8897,
    "longitude": -86.0467,
    "lat": 44.8897,
    "lon": -86.0467,
    "lng": -86.0467,
    "phase": "Phase 2",
    "routeSegment": "Northwest Michigan",
    "route_segment": "Northwest Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 150,
    "estimated_stop_minutes": 150,
    "officialWebsiteUrl": "https://www.nps.gov/slbe/",
    "official_website": "https://www.nps.gov/slbe/",
    "learnMoreUrl": "https://www.nps.gov/slbe/",
    "learn_more": "https://www.nps.gov/slbe/",
    "sourceUrl": "https://www.nps.gov/slbe/",
    "shortSummary": "National lakeshore with dunes, overlooks, beaches, and trails.",
    "summary": "National lakeshore with dunes, overlooks, beaches, and trails.",
    "whyItMatters": "One of the strongest nature anchors in Lower Michigan.",
    "why": "One of the strongest nature anchors in Lower Michigan.",
    "notes": {
      "elsie": "Think about glacial landscapes and big lake power.",
      "katrina": "Ask how dunes get so high.",
      "emma": "Connect wind, water, sand, and habitats.",
      "eliette": "Find sweeping views and tiny sand patterns.",
      "jules": "Huge dune mission.",
      "momdad": "One of the strongest nature anchors in Lower Michigan."
    },
    "profiles": {
      "elsie": "Think about glacial landscapes and big lake power.",
      "katrina": "Ask how dunes get so high.",
      "emma": "Connect wind, water, sand, and habitats.",
      "eliette": "Find sweeping views and tiny sand patterns.",
      "jules": "Huge dune mission.",
      "momdad": "One of the strongest nature anchors in Lower Michigan."
    },
    "csvOrder": 100
  },
  {
    "id": "P3-031",
    "title": "Pierce Stocking Scenic Drive",
    "name": "Pierce Stocking Scenic Drive",
    "category": "Scenic Drive",
    "latitude": 44.882,
    "longitude": -86.053,
    "lat": 44.882,
    "lon": -86.053,
    "lng": -86.053,
    "phase": "Phase 2",
    "routeSegment": "Sleeping Bear Dunes / Michigan",
    "route_segment": "Sleeping Bear Dunes / Michigan",
    "tier": "Core",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.nps.gov/slbe/planyourvisit/psscenicdrive.htm",
    "official_website": "https://www.nps.gov/slbe/planyourvisit/psscenicdrive.htm",
    "learnMoreUrl": "https://www.nps.gov/slbe/planyourvisit/psscenicdrive.htm",
    "learn_more": "https://www.nps.gov/slbe/planyourvisit/psscenicdrive.htm",
    "sourceUrl": "https://www.nps.gov/slbe/planyourvisit/psscenicdrive.htm",
    "shortSummary": "Scenic loop drive within Sleeping Bear Dunes National Lakeshore.",
    "summary": "Scenic loop drive within Sleeping Bear Dunes National Lakeshore.",
    "whyItMatters": "Efficient way to experience big overlooks without a long hike.",
    "why": "Efficient way to experience big overlooks without a long hike.",
    "notes": {
      "elsie": "Compare viewpoints and landscape layers.",
      "katrina": "Ask why overlooks change how we understand a place.",
      "emma": "Connect driving, stops, and scenery.",
      "eliette": "Find the best photo angle.",
      "jules": "Lookout mission.",
      "momdad": "Efficient way to experience big overlooks without a long hike."
    },
    "profiles": {
      "elsie": "Compare viewpoints and landscape layers.",
      "katrina": "Ask why overlooks change how we understand a place.",
      "emma": "Connect driving, stops, and scenery.",
      "eliette": "Find the best photo angle.",
      "jules": "Lookout mission.",
      "momdad": "Efficient way to experience big overlooks without a long hike."
    },
    "csvOrder": 101
  },
  {
    "id": "P3-032",
    "title": "Charlevoix South Pier Light Station",
    "name": "Charlevoix South Pier Light Station",
    "category": "Lighthouse",
    "latitude": 45.3207,
    "longitude": -85.2584,
    "lat": 45.3207,
    "lon": -85.2584,
    "lng": -85.2584,
    "phase": "Phase 2",
    "routeSegment": "Charlevoix / Michigan",
    "route_segment": "Charlevoix / Michigan",
    "tier": "Good Reset",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://visitcharlevoix.com/Charlevoix-South-Pier-Light-Station",
    "official_website": "https://visitcharlevoix.com/Charlevoix-South-Pier-Light-Station",
    "learnMoreUrl": "https://visitcharlevoix.com/Charlevoix-South-Pier-Light-Station",
    "learn_more": "https://visitcharlevoix.com/Charlevoix-South-Pier-Light-Station",
    "sourceUrl": "https://visitcharlevoix.com/Charlevoix-South-Pier-Light-Station",
    "shortSummary": "Red lighthouse at the Charlevoix channel.",
    "summary": "Red lighthouse at the Charlevoix channel.",
    "whyItMatters": "Quick, bright lighthouse/photo stop approaching northern Michigan.",
    "why": "Quick, bright lighthouse/photo stop approaching northern Michigan.",
    "notes": {
      "elsie": "Think about channel navigation.",
      "katrina": "Ask how boats enter harbors safely.",
      "emma": "Connect water traffic and town life.",
      "eliette": "Find color, shape, and pier details.",
      "jules": "Red light mission.",
      "momdad": "Quick, bright lighthouse/photo stop approaching northern Michigan."
    },
    "profiles": {
      "elsie": "Think about channel navigation.",
      "katrina": "Ask how boats enter harbors safely.",
      "emma": "Connect water traffic and town life.",
      "eliette": "Find color, shape, and pier details.",
      "jules": "Red light mission.",
      "momdad": "Quick, bright lighthouse/photo stop approaching northern Michigan."
    },
    "csvOrder": 102
  },
  {
    "id": "P3-033",
    "title": "Castle Farms",
    "name": "Castle Farms",
    "category": "Historic / Family Attraction",
    "latitude": 45.3121,
    "longitude": -85.2589,
    "lat": 45.3121,
    "lon": -85.2589,
    "lng": -85.2589,
    "phase": "Phase 2",
    "routeSegment": "Charlevoix / Michigan",
    "route_segment": "Charlevoix / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://castlefarms.com/",
    "official_website": "https://castlefarms.com/",
    "learnMoreUrl": "https://castlefarms.com/",
    "learn_more": "https://castlefarms.com/",
    "sourceUrl": "https://castlefarms.com/",
    "shortSummary": "Historic castle-like property and attraction in Charlevoix.",
    "summary": "Historic castle-like property and attraction in Charlevoix.",
    "whyItMatters": "Visual oddity stop with architecture and family appeal.",
    "why": "Visual oddity stop with architecture and family appeal.",
    "notes": {
      "elsie": "Think about how buildings get reused.",
      "katrina": "Ask why a castle-looking place exists in Michigan.",
      "emma": "Connect design, history, and tourism.",
      "eliette": "Find stone, garden, and tower details.",
      "jules": "Castle mission.",
      "momdad": "Visual oddity stop with architecture and family appeal."
    },
    "profiles": {
      "elsie": "Think about how buildings get reused.",
      "katrina": "Ask why a castle-looking place exists in Michigan.",
      "emma": "Connect design, history, and tourism.",
      "eliette": "Find stone, garden, and tower details.",
      "jules": "Castle mission.",
      "momdad": "Visual oddity stop with architecture and family appeal."
    },
    "csvOrder": 103
  },
  {
    "id": "P3-034",
    "title": "Petoskey State Park",
    "name": "Petoskey State Park",
    "category": "State Park / Beach",
    "latitude": 45.3833,
    "longitude": -84.9264,
    "lat": 45.3833,
    "lon": -84.9264,
    "lng": -84.9264,
    "phase": "Phase 2",
    "routeSegment": "Petoskey / Michigan",
    "route_segment": "Petoskey / Michigan",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.michigan.gov/dnr/places/state-parks/petoskey",
    "official_website": "https://www.michigan.gov/dnr/places/state-parks/petoskey",
    "learnMoreUrl": "https://www.michigan.gov/dnr/places/state-parks/petoskey",
    "learn_more": "https://www.michigan.gov/dnr/places/state-parks/petoskey",
    "sourceUrl": "https://www.michigan.gov/dnr/places/state-parks/petoskey",
    "shortSummary": "Lake Michigan state park near Petoskey.",
    "summary": "Lake Michigan state park near Petoskey.",
    "whyItMatters": "Good northern Michigan beach and rock-hunting reset.",
    "why": "Good northern Michigan beach and rock-hunting reset.",
    "notes": {
      "elsie": "Look for shoreline ecology and stones.",
      "katrina": "Ask what makes Petoskey stones special.",
      "emma": "Connect geology, waves, and beaches.",
      "eliette": "Find patterns in rocks and water.",
      "jules": "Rock hunt mission.",
      "momdad": "Good northern Michigan beach and rock-hunting reset."
    },
    "profiles": {
      "elsie": "Look for shoreline ecology and stones.",
      "katrina": "Ask what makes Petoskey stones special.",
      "emma": "Connect geology, waves, and beaches.",
      "eliette": "Find patterns in rocks and water.",
      "jules": "Rock hunt mission.",
      "momdad": "Good northern Michigan beach and rock-hunting reset."
    },
    "csvOrder": 104
  },
  {
    "id": "P3-035",
    "title": "Harbor Springs Bluff Drive / Tunnel of Trees Area",
    "name": "Harbor Springs Bluff Drive / Tunnel of Trees Area",
    "category": "Scenic Drive",
    "latitude": 45.431,
    "longitude": -84.991,
    "lat": 45.431,
    "lon": -84.991,
    "lng": -84.991,
    "phase": "Phase 2",
    "routeSegment": "Harbor Springs / Michigan",
    "route_segment": "Harbor Springs / Michigan",
    "tier": "Good Reset",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.harborspringschamber.com/",
    "official_website": "https://www.harborspringschamber.com/",
    "learnMoreUrl": "https://www.harborspringschamber.com/",
    "learn_more": "https://www.harborspringschamber.com/",
    "sourceUrl": "https://www.harborspringschamber.com/",
    "shortSummary": "Scenic northern Michigan area near Harbor Springs and M-119.",
    "summary": "Scenic northern Michigan area near Harbor Springs and M-119.",
    "whyItMatters": "Good scenic route variation near the Straits approach.",
    "why": "Good scenic route variation near the Straits approach.",
    "notes": {
      "elsie": "Think about why roads become scenic attractions.",
      "katrina": "Ask how trees change the driving experience.",
      "emma": "Connect place, pace, and scenery.",
      "eliette": "Find curves, trees, and lake glimpses.",
      "jules": "Tree tunnel mission.",
      "momdad": "Good scenic route variation near the Straits approach."
    },
    "profiles": {
      "elsie": "Think about why roads become scenic attractions.",
      "katrina": "Ask how trees change the driving experience.",
      "emma": "Connect place, pace, and scenery.",
      "eliette": "Find curves, trees, and lake glimpses.",
      "jules": "Tree tunnel mission.",
      "momdad": "Good scenic route variation near the Straits approach."
    },
    "csvOrder": 105
  },
  {
    "id": "P3-036",
    "title": "Minnetrista Museum & Gardens",
    "name": "Minnetrista Museum & Gardens",
    "category": "Museum / Garden",
    "latitude": 40.2019,
    "longitude": -85.3979,
    "lat": 40.2019,
    "lon": -85.3979,
    "lng": -85.3979,
    "phase": "Phase 3",
    "routeSegment": "Muncie / Indiana return corridor",
    "route_segment": "Muncie / Indiana return corridor",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.minnetrista.net/",
    "official_website": "https://www.minnetrista.net/",
    "learnMoreUrl": "https://www.minnetrista.net/",
    "learn_more": "https://www.minnetrista.net/",
    "sourceUrl": "https://www.minnetrista.net/",
    "shortSummary": "Museum and gardens tied to the Ball family and Muncie history.",
    "summary": "Museum and gardens tied to the Ball family and Muncie history.",
    "whyItMatters": "Good return-route culture stop with gardens, homes, and community history.",
    "why": "Good return-route culture stop with gardens, homes, and community history.",
    "notes": {
      "elsie": "Connect family businesses to community places.",
      "katrina": "Ask how one company can shape a town.",
      "emma": "Notice gardens, houses, and local routines.",
      "eliette": "Find architecture, flowers, and tiny display details.",
      "jules": "Garden and house mission.",
      "momdad": "Good return-route culture stop with gardens, homes, and community history."
    },
    "profiles": {
      "elsie": "Connect family businesses to community places.",
      "katrina": "Ask how one company can shape a town.",
      "emma": "Notice gardens, houses, and local routines.",
      "eliette": "Find architecture, flowers, and tiny display details.",
      "jules": "Garden and house mission.",
      "momdad": "Good return-route culture stop with gardens, homes, and community history."
    },
    "csvOrder": 106
  },
  {
    "id": "P3-037",
    "title": "Mounds State Park",
    "name": "Mounds State Park",
    "category": "State Park / Earthworks",
    "latitude": 40.0981,
    "longitude": -85.6177,
    "lat": 40.0981,
    "lon": -85.6177,
    "lng": -85.6177,
    "phase": "Phase 3",
    "routeSegment": "Anderson / Indiana return corridor",
    "route_segment": "Anderson / Indiana return corridor",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.in.gov/dnr/state-parks/parks-lakes/mounds-state-park/",
    "official_website": "https://www.in.gov/dnr/state-parks/parks-lakes/mounds-state-park/",
    "learnMoreUrl": "https://www.in.gov/dnr/state-parks/parks-lakes/mounds-state-park/",
    "learn_more": "https://www.in.gov/dnr/state-parks/parks-lakes/mounds-state-park/",
    "sourceUrl": "https://www.in.gov/dnr/state-parks/parks-lakes/mounds-state-park/",
    "shortSummary": "Indiana state park preserving prehistoric earthworks.",
    "summary": "Indiana state park preserving prehistoric earthworks.",
    "whyItMatters": "Strong nature and Indigenous history stop near the return corridor.",
    "why": "Strong nature and Indigenous history stop near the return corridor.",
    "notes": {
      "elsie": "Think about ancient places and how they survive.",
      "katrina": "Ask why people built earthworks.",
      "emma": "Connect land, ceremony, and preservation.",
      "eliette": "Look for shapes, trails, and signs.",
      "jules": "Mound trail mission.",
      "momdad": "Strong nature and Indigenous history stop near the return corridor."
    },
    "profiles": {
      "elsie": "Think about ancient places and how they survive.",
      "katrina": "Ask why people built earthworks.",
      "emma": "Connect land, ceremony, and preservation.",
      "eliette": "Look for shapes, trails, and signs.",
      "jules": "Mound trail mission.",
      "momdad": "Strong nature and Indigenous history stop near the return corridor."
    },
    "csvOrder": 107
  },
  {
    "id": "P3-038",
    "title": "Hoosier Gym",
    "name": "Hoosier Gym",
    "category": "Sports / Film Site",
    "latitude": 39.9072,
    "longitude": -85.1614,
    "lat": 39.9072,
    "lon": -85.1614,
    "lng": -85.1614,
    "phase": "Phase 3",
    "routeSegment": "Knightstown / Indiana return corridor",
    "route_segment": "Knightstown / Indiana return corridor",
    "tier": "Good Reset",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://thehoosiergym.com/",
    "official_website": "https://thehoosiergym.com/",
    "learnMoreUrl": "https://thehoosiergym.com/",
    "learn_more": "https://thehoosiergym.com/",
    "sourceUrl": "https://thehoosiergym.com/",
    "shortSummary": "Historic basketball gym known from the movie Hoosiers.",
    "summary": "Historic basketball gym known from the movie Hoosiers.",
    "whyItMatters": "Fun sports and small-town Indiana stop.",
    "why": "Fun sports and small-town Indiana stop.",
    "notes": {
      "elsie": "Think about why gyms become community symbols.",
      "katrina": "Ask why basketball matters so much in Indiana.",
      "emma": "Connect sports, towns, and teamwork.",
      "eliette": "Find jerseys, wood floor, and old gym details.",
      "jules": "Basketball mission.",
      "momdad": "Fun sports and small-town Indiana stop."
    },
    "profiles": {
      "elsie": "Think about why gyms become community symbols.",
      "katrina": "Ask why basketball matters so much in Indiana.",
      "emma": "Connect sports, towns, and teamwork.",
      "eliette": "Find jerseys, wood floor, and old gym details.",
      "jules": "Basketball mission.",
      "momdad": "Fun sports and small-town Indiana stop."
    },
    "csvOrder": 108
  },
  {
    "id": "P3-039",
    "title": "Indiana Basketball Hall of Fame",
    "name": "Indiana Basketball Hall of Fame",
    "category": "Sports Museum",
    "latitude": 39.9287,
    "longitude": -85.3705,
    "lat": 39.9287,
    "lon": -85.3705,
    "lng": -85.3705,
    "phase": "Phase 3",
    "routeSegment": "New Castle / Indiana return corridor",
    "route_segment": "New Castle / Indiana return corridor",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://hoopshall.com/",
    "official_website": "https://hoopshall.com/",
    "learnMoreUrl": "https://hoopshall.com/",
    "learn_more": "https://hoopshall.com/",
    "sourceUrl": "https://hoopshall.com/",
    "shortSummary": "Museum celebrating Indiana basketball history.",
    "summary": "Museum celebrating Indiana basketball history.",
    "whyItMatters": "Great sports-history return stop for basketball context.",
    "why": "Great sports-history return stop for basketball context.",
    "notes": {
      "elsie": "Compare local sports pride with pro sports fame.",
      "katrina": "Ask why high school basketball became such a big tradition.",
      "emma": "Connect teamwork, towns, and fans.",
      "eliette": "Find trophies, photos, and uniform details.",
      "jules": "Hoop mission.",
      "momdad": "Great sports-history return stop for basketball context."
    },
    "profiles": {
      "elsie": "Compare local sports pride with pro sports fame.",
      "katrina": "Ask why high school basketball became such a big tradition.",
      "emma": "Connect teamwork, towns, and fans.",
      "eliette": "Find trophies, photos, and uniform details.",
      "jules": "Hoop mission.",
      "momdad": "Great sports-history return stop for basketball context."
    },
    "csvOrder": 109
  },
  {
    "id": "P3-040",
    "title": "Levi and Catharine Coffin House",
    "name": "Levi and Catharine Coffin House",
    "category": "Historic Site",
    "latitude": 39.9555,
    "longitude": -84.9186,
    "lat": 39.9555,
    "lon": -84.9186,
    "lng": -84.9186,
    "phase": "Phase 3",
    "routeSegment": "Fountain City / Indiana return corridor",
    "route_segment": "Fountain City / Indiana return corridor",
    "tier": "Core",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.indianamuseum.org/historic-sites/levi-catharine-coffin-house/",
    "official_website": "https://www.indianamuseum.org/historic-sites/levi-catharine-coffin-house/",
    "learnMoreUrl": "https://www.indianamuseum.org/historic-sites/levi-catharine-coffin-house/",
    "learn_more": "https://www.indianamuseum.org/historic-sites/levi-catharine-coffin-house/",
    "sourceUrl": "https://www.indianamuseum.org/historic-sites/levi-catharine-coffin-house/",
    "shortSummary": "Underground Railroad historic site in Fountain City.",
    "summary": "Underground Railroad historic site in Fountain City.",
    "whyItMatters": "Powerful courage and justice stop on the way home.",
    "why": "Powerful courage and justice stop on the way home.",
    "notes": {
      "elsie": "Think about risk and moral courage.",
      "katrina": "Ask why helping enslaved people escape was dangerous.",
      "emma": "Connect fairness, choices, and history.",
      "eliette": "Look for house details that protected people.",
      "jules": "Safe-house mission.",
      "momdad": "Powerful courage and justice stop on the way home."
    },
    "profiles": {
      "elsie": "Think about risk and moral courage.",
      "katrina": "Ask why helping enslaved people escape was dangerous.",
      "emma": "Connect fairness, choices, and history.",
      "eliette": "Look for house details that protected people.",
      "jules": "Safe-house mission.",
      "momdad": "Powerful courage and justice stop on the way home."
    },
    "csvOrder": 110
  },
  {
    "id": "P3-041",
    "title": "Model T Museum",
    "name": "Model T Museum",
    "category": "Automotive Museum",
    "latitude": 39.8317,
    "longitude": -84.8902,
    "lat": 39.8317,
    "lon": -84.8902,
    "lng": -84.8902,
    "phase": "Phase 3",
    "routeSegment": "Richmond / Indiana return corridor",
    "route_segment": "Richmond / Indiana return corridor",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://www.mtfca.com/museum/",
    "official_website": "https://www.mtfca.com/museum/",
    "learnMoreUrl": "https://www.mtfca.com/museum/",
    "learn_more": "https://www.mtfca.com/museum/",
    "sourceUrl": "https://www.mtfca.com/museum/",
    "shortSummary": "Museum dedicated to the Ford Model T.",
    "summary": "Museum dedicated to the Ford Model T.",
    "whyItMatters": "Strong transportation-history addition for a family road trip.",
    "why": "Strong transportation-history addition for a family road trip.",
    "notes": {
      "elsie": "Compare early cars to your current road trip vehicle.",
      "katrina": "Ask why the Model T changed travel.",
      "emma": "Connect affordability, roads, and family mobility.",
      "eliette": "Find steering, wheels, and dashboard details.",
      "jules": "Old car mission.",
      "momdad": "Strong transportation-history addition for a family road trip."
    },
    "profiles": {
      "elsie": "Compare early cars to your current road trip vehicle.",
      "katrina": "Ask why the Model T changed travel.",
      "emma": "Connect affordability, roads, and family mobility.",
      "eliette": "Find steering, wheels, and dashboard details.",
      "jules": "Old car mission.",
      "momdad": "Strong transportation-history addition for a family road trip."
    },
    "csvOrder": 111
  },
  {
    "id": "P3-042",
    "title": "Gennett Records Walk of Fame",
    "name": "Gennett Records Walk of Fame",
    "category": "Music History",
    "latitude": 39.8272,
    "longitude": -84.8957,
    "lat": 39.8272,
    "lon": -84.8957,
    "lng": -84.8957,
    "phase": "Phase 3",
    "routeSegment": "Richmond / Indiana return corridor",
    "route_segment": "Richmond / Indiana return corridor",
    "tier": "Good Reset",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://visitrichmond.org/visitors/things-to-do/gennett-walk-of-fame",
    "official_website": "https://visitrichmond.org/visitors/things-to-do/gennett-walk-of-fame",
    "learnMoreUrl": "https://visitrichmond.org/visitors/things-to-do/gennett-walk-of-fame",
    "learn_more": "https://visitrichmond.org/visitors/things-to-do/gennett-walk-of-fame",
    "sourceUrl": "https://visitrichmond.org/visitors/things-to-do/gennett-walk-of-fame",
    "shortSummary": "Outdoor music-history walk honoring Gennett Records artists.",
    "summary": "Outdoor music-history walk honoring Gennett Records artists.",
    "whyItMatters": "Quick culture stop with jazz and recording history.",
    "why": "Quick culture stop with jazz and recording history.",
    "notes": {
      "elsie": "Think about how music gets preserved.",
      "katrina": "Ask why early recordings mattered.",
      "emma": "Connect technology, art, and fame.",
      "eliette": "Look for names, signs, and music details.",
      "jules": "Music walk mission.",
      "momdad": "Quick culture stop with jazz and recording history."
    },
    "profiles": {
      "elsie": "Think about how music gets preserved.",
      "katrina": "Ask why early recordings mattered.",
      "emma": "Connect technology, art, and fame.",
      "eliette": "Look for names, signs, and music details.",
      "jules": "Music walk mission.",
      "momdad": "Quick culture stop with jazz and recording history."
    },
    "csvOrder": 112
  },
  {
    "id": "P3-043",
    "title": "Dayton Aviation Heritage National Historical Park",
    "name": "Dayton Aviation Heritage National Historical Park",
    "category": "National Historical Park",
    "latitude": 39.7561,
    "longitude": -84.2057,
    "lat": 39.7561,
    "lon": -84.2057,
    "lng": -84.2057,
    "phase": "Phase 3",
    "routeSegment": "Dayton / Ohio optional return",
    "route_segment": "Dayton / Ohio optional return",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.nps.gov/daav/",
    "official_website": "https://www.nps.gov/daav/",
    "learnMoreUrl": "https://www.nps.gov/daav/",
    "learn_more": "https://www.nps.gov/daav/",
    "sourceUrl": "https://www.nps.gov/daav/",
    "shortSummary": "National Park Service site tied to the Wright brothers and aviation history.",
    "summary": "National Park Service site tied to the Wright brothers and aviation history.",
    "whyItMatters": "Excellent optional STEM/history stop if routing through Dayton.",
    "why": "Excellent optional STEM/history stop if routing through Dayton.",
    "notes": {
      "elsie": "Think about invention and persistence.",
      "katrina": "Ask why flight changed the world.",
      "emma": "Connect experiments, failure, and travel.",
      "eliette": "Find bicycle and airplane details.",
      "jules": "Flying machine mission.",
      "momdad": "Excellent optional STEM/history stop if routing through Dayton."
    },
    "profiles": {
      "elsie": "Think about invention and persistence.",
      "katrina": "Ask why flight changed the world.",
      "emma": "Connect experiments, failure, and travel.",
      "eliette": "Find bicycle and airplane details.",
      "jules": "Flying machine mission.",
      "momdad": "Excellent optional STEM/history stop if routing through Dayton."
    },
    "csvOrder": 113
  },
  {
    "id": "P3-044",
    "title": "National Museum of the U.S. Air Force",
    "name": "National Museum of the U.S. Air Force",
    "category": "Aviation Museum",
    "latitude": 39.7817,
    "longitude": -84.11,
    "lat": 39.7817,
    "lon": -84.11,
    "lng": -84.11,
    "phase": "Phase 3",
    "routeSegment": "Dayton / Ohio optional return",
    "route_segment": "Dayton / Ohio optional return",
    "tier": "Core",
    "estimatedStopMinutes": 150,
    "estimated_stop_minutes": 150,
    "officialWebsiteUrl": "https://www.nationalmuseum.af.mil/",
    "official_website": "https://www.nationalmuseum.af.mil/",
    "learnMoreUrl": "https://www.nationalmuseum.af.mil/",
    "learn_more": "https://www.nationalmuseum.af.mil/",
    "sourceUrl": "https://www.nationalmuseum.af.mil/",
    "shortSummary": "Massive official U.S. Air Force museum near Dayton.",
    "summary": "Massive official U.S. Air Force museum near Dayton.",
    "whyItMatters": "High-value aviation and technology stop if route timing allows.",
    "why": "High-value aviation and technology stop if route timing allows.",
    "notes": {
      "elsie": "Compare aircraft across eras.",
      "katrina": "Ask how design changes with purpose.",
      "emma": "Connect technology, history, and service.",
      "eliette": "Find nose art, engines, and cockpit details.",
      "jules": "Giant airplane mission.",
      "momdad": "High-value aviation and technology stop if route timing allows."
    },
    "profiles": {
      "elsie": "Compare aircraft across eras.",
      "katrina": "Ask how design changes with purpose.",
      "emma": "Connect technology, history, and service.",
      "eliette": "Find nose art, engines, and cockpit details.",
      "jules": "Giant airplane mission.",
      "momdad": "High-value aviation and technology stop if route timing allows."
    },
    "csvOrder": 114
  },
  {
    "id": "P3-045",
    "title": "Carillon Historical Park",
    "name": "Carillon Historical Park",
    "category": "History Museum",
    "latitude": 39.7334,
    "longitude": -84.2003,
    "lat": 39.7334,
    "lon": -84.2003,
    "lng": -84.2003,
    "phase": "Phase 3",
    "routeSegment": "Dayton / Ohio optional return",
    "route_segment": "Dayton / Ohio optional return",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.daytonhistory.org/visit/dayton-history-sites/carillon-historical-park/",
    "official_website": "https://www.daytonhistory.org/visit/dayton-history-sites/carillon-historical-park/",
    "learnMoreUrl": "https://www.daytonhistory.org/visit/dayton-history-sites/carillon-historical-park/",
    "learn_more": "https://www.daytonhistory.org/visit/dayton-history-sites/carillon-historical-park/",
    "sourceUrl": "https://www.daytonhistory.org/visit/dayton-history-sites/carillon-historical-park/",
    "shortSummary": "Dayton history park with transportation and innovation exhibits.",
    "summary": "Dayton history park with transportation and innovation exhibits.",
    "whyItMatters": "Good optional stop combining invention, industry, and local history.",
    "why": "Good optional stop combining invention, industry, and local history.",
    "notes": {
      "elsie": "Notice how invention changes daily life.",
      "katrina": "Ask why Dayton produced so many innovations.",
      "emma": "Connect bikes, cars, planes, and factories.",
      "eliette": "Find bells, machines, and old signs.",
      "jules": "Invention mission.",
      "momdad": "Good optional stop combining invention, industry, and local history."
    },
    "profiles": {
      "elsie": "Notice how invention changes daily life.",
      "katrina": "Ask why Dayton produced so many innovations.",
      "emma": "Connect bikes, cars, planes, and factories.",
      "eliette": "Find bells, machines, and old signs.",
      "jules": "Invention mission.",
      "momdad": "Good optional stop combining invention, industry, and local history."
    },
    "csvOrder": 115
  },
  {
    "id": "P3-046",
    "title": "Aullwood Audubon Center and Farm",
    "name": "Aullwood Audubon Center and Farm",
    "category": "Nature Center / Farm",
    "latitude": 39.8745,
    "longitude": -84.274,
    "lat": 39.8745,
    "lon": -84.274,
    "lng": -84.274,
    "phase": "Phase 3",
    "routeSegment": "Dayton / Ohio optional return",
    "route_segment": "Dayton / Ohio optional return",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://aullwood.audubon.org/",
    "official_website": "https://aullwood.audubon.org/",
    "learnMoreUrl": "https://aullwood.audubon.org/",
    "learn_more": "https://aullwood.audubon.org/",
    "sourceUrl": "https://aullwood.audubon.org/",
    "shortSummary": "Audubon nature center and farm near Dayton.",
    "summary": "Audubon nature center and farm near Dayton.",
    "whyItMatters": "Good nature reset with birds, trails, and farm context.",
    "why": "Good nature reset with birds, trails, and farm context.",
    "notes": {
      "elsie": "Watch for birds and habitats.",
      "katrina": "Ask why migration and habitat protection matter.",
      "emma": "Connect farms, birds, and weather.",
      "eliette": "Find feathers, tracks, and trail details.",
      "jules": "Bird mission.",
      "momdad": "Good nature reset with birds, trails, and farm context."
    },
    "profiles": {
      "elsie": "Watch for birds and habitats.",
      "katrina": "Ask why migration and habitat protection matter.",
      "emma": "Connect farms, birds, and weather.",
      "eliette": "Find feathers, tracks, and trail details.",
      "jules": "Bird mission.",
      "momdad": "Good nature reset with birds, trails, and farm context."
    },
    "csvOrder": 116
  },
  {
    "id": "P3-047",
    "title": "The Magic House",
    "name": "The Magic House",
    "category": "Children's Museum",
    "latitude": 38.581,
    "longitude": -90.4068,
    "lat": 38.581,
    "lon": -90.4068,
    "lng": -90.4068,
    "phase": "Phase 3",
    "routeSegment": "St. Louis return corridor",
    "route_segment": "St. Louis return corridor",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.magichouse.org/",
    "official_website": "https://www.magichouse.org/",
    "learnMoreUrl": "https://www.magichouse.org/",
    "learn_more": "https://www.magichouse.org/",
    "sourceUrl": "https://www.magichouse.org/",
    "shortSummary": "Children's museum in the St. Louis area.",
    "summary": "Children's museum in the St. Louis area.",
    "whyItMatters": "Strong family stop on the return route if kids need interactive time.",
    "why": "Strong family stop on the return route if kids need interactive time.",
    "notes": {
      "elsie": "Pick a hands-on activity and explain it.",
      "katrina": "Ask why play helps learning.",
      "emma": "Connect experiments to everyday life.",
      "eliette": "Find colors, buttons, and design details.",
      "jules": "Play mission.",
      "momdad": "Strong family stop on the return route if kids need interactive time."
    },
    "profiles": {
      "elsie": "Pick a hands-on activity and explain it.",
      "katrina": "Ask why play helps learning.",
      "emma": "Connect experiments to everyday life.",
      "eliette": "Find colors, buttons, and design details.",
      "jules": "Play mission.",
      "momdad": "Strong family stop on the return route if kids need interactive time."
    },
    "csvOrder": 117
  },
  {
    "id": "P3-048",
    "title": "Laumeier Sculpture Park",
    "name": "Laumeier Sculpture Park",
    "category": "Art Park",
    "latitude": 38.5517,
    "longitude": -90.4143,
    "lat": 38.5517,
    "lon": -90.4143,
    "lng": -90.4143,
    "phase": "Phase 3",
    "routeSegment": "St. Louis return corridor",
    "route_segment": "St. Louis return corridor",
    "tier": "Good Reset",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.laumeiersculpturepark.org/",
    "official_website": "https://www.laumeiersculpturepark.org/",
    "learnMoreUrl": "https://www.laumeiersculpturepark.org/",
    "learn_more": "https://www.laumeiersculpturepark.org/",
    "sourceUrl": "https://www.laumeiersculpturepark.org/",
    "shortSummary": "Outdoor sculpture park in St. Louis County.",
    "summary": "Outdoor sculpture park in St. Louis County.",
    "whyItMatters": "Good walkable art-and-nature reset.",
    "why": "Good walkable art-and-nature reset.",
    "notes": {
      "elsie": "Think about how art changes outdoor space.",
      "katrina": "Ask what makes sculpture different from a statue.",
      "emma": "Connect movement, scale, and creativity.",
      "eliette": "Find the weirdest sculpture detail.",
      "jules": "Giant art mission.",
      "momdad": "Good walkable art-and-nature reset."
    },
    "profiles": {
      "elsie": "Think about how art changes outdoor space.",
      "katrina": "Ask what makes sculpture different from a statue.",
      "emma": "Connect movement, scale, and creativity.",
      "eliette": "Find the weirdest sculpture detail.",
      "jules": "Giant art mission.",
      "momdad": "Good walkable art-and-nature reset."
    },
    "csvOrder": 118
  },
  {
    "id": "P3-049",
    "title": "Ulysses S. Grant National Historic Site",
    "name": "Ulysses S. Grant National Historic Site",
    "category": "National Historic Site",
    "latitude": 38.5511,
    "longitude": -90.3512,
    "lat": 38.5511,
    "lon": -90.3512,
    "lng": -90.3512,
    "phase": "Phase 3",
    "routeSegment": "St. Louis return corridor",
    "route_segment": "St. Louis return corridor",
    "tier": "Core",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.nps.gov/ulsg/",
    "official_website": "https://www.nps.gov/ulsg/",
    "learnMoreUrl": "https://www.nps.gov/ulsg/",
    "learn_more": "https://www.nps.gov/ulsg/",
    "sourceUrl": "https://www.nps.gov/ulsg/",
    "shortSummary": "National Park Service site preserving Grant's White Haven home.",
    "summary": "National Park Service site preserving Grant's White Haven home.",
    "whyItMatters": "Strong presidential and Civil War history stop near St. Louis.",
    "why": "Strong presidential and Civil War history stop near St. Louis.",
    "notes": {
      "elsie": "Think about one person's life before and after war.",
      "katrina": "Ask how homes reveal history.",
      "emma": "Connect leadership, family, and place.",
      "eliette": "Look for house and farm details.",
      "jules": "President house mission.",
      "momdad": "Strong presidential and Civil War history stop near St. Louis."
    },
    "profiles": {
      "elsie": "Think about one person's life before and after war.",
      "katrina": "Ask how homes reveal history.",
      "emma": "Connect leadership, family, and place.",
      "eliette": "Look for house and farm details.",
      "jules": "President house mission.",
      "momdad": "Strong presidential and Civil War history stop near St. Louis."
    },
    "csvOrder": 119
  },
  {
    "id": "P3-050",
    "title": "Lone Elk Park",
    "name": "Lone Elk Park",
    "category": "Wildlife / Park",
    "latitude": 38.542,
    "longitude": -90.5318,
    "lat": 38.542,
    "lon": -90.5318,
    "lng": -90.5318,
    "phase": "Phase 3",
    "routeSegment": "St. Louis return corridor",
    "route_segment": "St. Louis return corridor",
    "tier": "Good Reset",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://stlouiscountymo.gov/st-louis-county-departments/parks/places/lone-elk-park/",
    "official_website": "https://stlouiscountymo.gov/st-louis-county-departments/parks/places/lone-elk-park/",
    "learnMoreUrl": "https://stlouiscountymo.gov/st-louis-county-departments/parks/places/lone-elk-park/",
    "learn_more": "https://stlouiscountymo.gov/st-louis-county-departments/parks/places/lone-elk-park/",
    "sourceUrl": "https://stlouiscountymo.gov/st-louis-county-departments/parks/places/lone-elk-park/",
    "shortSummary": "County park with elk and bison viewing opportunities.",
    "summary": "County park with elk and bison viewing opportunities.",
    "whyItMatters": "Excellent quick wildlife drive-through style stop.",
    "why": "Excellent quick wildlife drive-through style stop.",
    "notes": {
      "elsie": "Observe large animals safely from the car.",
      "katrina": "Ask why wildlife needs protected space.",
      "emma": "Connect animals, parks, and visitor rules.",
      "eliette": "Look for antlers, signs, and movement.",
      "jules": "Elk spotting mission.",
      "momdad": "Excellent quick wildlife drive-through style stop."
    },
    "profiles": {
      "elsie": "Observe large animals safely from the car.",
      "katrina": "Ask why wildlife needs protected space.",
      "emma": "Connect animals, parks, and visitor rules.",
      "eliette": "Look for antlers, signs, and movement.",
      "jules": "Elk spotting mission.",
      "momdad": "Excellent quick wildlife drive-through style stop."
    },
    "csvOrder": 120
  },
  {
    "id": "P3-051",
    "title": "Route 66 State Park",
    "name": "Route 66 State Park",
    "category": "State Park / Road History",
    "latitude": 38.5026,
    "longitude": -90.6843,
    "lat": 38.5026,
    "lon": -90.6843,
    "lng": -90.6843,
    "phase": "Phase 3",
    "routeSegment": "Eureka / Missouri return corridor",
    "route_segment": "Eureka / Missouri return corridor",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://mostateparks.com/park/route-66-state-park",
    "official_website": "https://mostateparks.com/park/route-66-state-park",
    "learnMoreUrl": "https://mostateparks.com/park/route-66-state-park",
    "learn_more": "https://mostateparks.com/park/route-66-state-park",
    "sourceUrl": "https://mostateparks.com/park/route-66-state-park",
    "shortSummary": "Missouri state park preserving Route 66 corridor history.",
    "summary": "Missouri state park preserving Route 66 corridor history.",
    "whyItMatters": "Good road-trip themed stop west of St. Louis.",
    "why": "Good road-trip themed stop west of St. Louis.",
    "notes": {
      "elsie": "Compare Route 66 travel with interstate travel.",
      "katrina": "Ask why old roads become historic.",
      "emma": "Connect signs, cars, diners, and maps.",
      "eliette": "Find old-road details.",
      "jules": "Road history mission.",
      "momdad": "Good road-trip themed stop west of St. Louis."
    },
    "profiles": {
      "elsie": "Compare Route 66 travel with interstate travel.",
      "katrina": "Ask why old roads become historic.",
      "emma": "Connect signs, cars, diners, and maps.",
      "eliette": "Find old-road details.",
      "jules": "Road history mission.",
      "momdad": "Good road-trip themed stop west of St. Louis."
    },
    "csvOrder": 121
  },
  {
    "id": "P3-052",
    "title": "Meramec Caverns",
    "name": "Meramec Caverns",
    "category": "Cave / Roadside Attraction",
    "latitude": 38.2434,
    "longitude": -91.0923,
    "lat": 38.2434,
    "lon": -91.0923,
    "lng": -91.0923,
    "phase": "Phase 3",
    "routeSegment": "Stanton / Missouri return corridor",
    "route_segment": "Stanton / Missouri return corridor",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://www.americascave.com/",
    "official_website": "https://www.americascave.com/",
    "learnMoreUrl": "https://www.americascave.com/",
    "learn_more": "https://www.americascave.com/",
    "sourceUrl": "https://www.americascave.com/",
    "shortSummary": "Large show cave and classic Missouri roadside attraction.",
    "summary": "Large show cave and classic Missouri roadside attraction.",
    "whyItMatters": "Memorable geology and old-school road-trip stop.",
    "why": "Memorable geology and old-school road-trip stop.",
    "notes": {
      "elsie": "Think about how caves form over time.",
      "katrina": "Ask why caves became tourist attractions.",
      "emma": "Connect water, rock, and time.",
      "eliette": "Find shapes, colors, and cave details.",
      "jules": "Cave mission.",
      "momdad": "Memorable geology and old-school road-trip stop."
    },
    "profiles": {
      "elsie": "Think about how caves form over time.",
      "katrina": "Ask why caves became tourist attractions.",
      "emma": "Connect water, rock, and time.",
      "eliette": "Find shapes, colors, and cave details.",
      "jules": "Cave mission.",
      "momdad": "Memorable geology and old-school road-trip stop."
    },
    "csvOrder": 122
  },
  {
    "id": "P3-053",
    "title": "Onondaga Cave State Park",
    "name": "Onondaga Cave State Park",
    "category": "State Park / Cave",
    "latitude": 38.0726,
    "longitude": -91.2407,
    "lat": 38.0726,
    "lon": -91.2407,
    "lng": -91.2407,
    "phase": "Phase 3",
    "routeSegment": "Leasburg / Missouri return corridor",
    "route_segment": "Leasburg / Missouri return corridor",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://mostateparks.com/park/onondaga-cave-state-park",
    "official_website": "https://mostateparks.com/park/onondaga-cave-state-park",
    "learnMoreUrl": "https://mostateparks.com/park/onondaga-cave-state-park",
    "learn_more": "https://mostateparks.com/park/onondaga-cave-state-park",
    "sourceUrl": "https://mostateparks.com/park/onondaga-cave-state-park",
    "shortSummary": "Missouri state park known for cave tours.",
    "summary": "Missouri state park known for cave tours.",
    "whyItMatters": "Official cave-and-nature alternative on the return route.",
    "why": "Official cave-and-nature alternative on the return route.",
    "notes": {
      "elsie": "Notice how water shapes stone.",
      "katrina": "Ask why caves need protection.",
      "emma": "Connect geology, water, and patience.",
      "eliette": "Find formations and patterns.",
      "jules": "Cave shape mission.",
      "momdad": "Official cave-and-nature alternative on the return route."
    },
    "profiles": {
      "elsie": "Notice how water shapes stone.",
      "katrina": "Ask why caves need protection.",
      "emma": "Connect geology, water, and patience.",
      "eliette": "Find formations and patterns.",
      "jules": "Cave shape mission.",
      "momdad": "Official cave-and-nature alternative on the return route."
    },
    "csvOrder": 123
  },
  {
    "id": "P3-054",
    "title": "Missouri Mines State Historic Site",
    "name": "Missouri Mines State Historic Site",
    "category": "Historic Site / Mining",
    "latitude": 37.8359,
    "longitude": -90.4947,
    "lat": 37.8359,
    "lon": -90.4947,
    "lng": -90.4947,
    "phase": "Phase 3",
    "routeSegment": "Park Hills / Missouri optional return",
    "route_segment": "Park Hills / Missouri optional return",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://mostateparks.com/historic-site/missouri-mines-state-historic-site",
    "official_website": "https://mostateparks.com/historic-site/missouri-mines-state-historic-site",
    "learnMoreUrl": "https://mostateparks.com/historic-site/missouri-mines-state-historic-site",
    "learn_more": "https://mostateparks.com/historic-site/missouri-mines-state-historic-site",
    "sourceUrl": "https://mostateparks.com/historic-site/missouri-mines-state-historic-site",
    "shortSummary": "Historic mining and mineral site in Missouri.",
    "summary": "Historic mining and mineral site in Missouri.",
    "whyItMatters": "Good industry and geology stop if using a southern return variation.",
    "why": "Good industry and geology stop if using a southern return variation.",
    "notes": {
      "elsie": "Think about what comes from underground.",
      "katrina": "Ask how mining changed towns and landscapes.",
      "emma": "Connect minerals, jobs, and environmental choices.",
      "eliette": "Find shiny rocks and equipment details.",
      "jules": "Rock and mine mission.",
      "momdad": "Good industry and geology stop if using a southern return variation."
    },
    "profiles": {
      "elsie": "Think about what comes from underground.",
      "katrina": "Ask how mining changed towns and landscapes.",
      "emma": "Connect minerals, jobs, and environmental choices.",
      "eliette": "Find shiny rocks and equipment details.",
      "jules": "Rock and mine mission.",
      "momdad": "Good industry and geology stop if using a southern return variation."
    },
    "csvOrder": 124
  },
  {
    "id": "P3-055",
    "title": "Mark Twain Cave",
    "name": "Mark Twain Cave",
    "category": "Cave / Literature",
    "latitude": 39.7073,
    "longitude": -91.3585,
    "lat": 39.7073,
    "lon": -91.3585,
    "lng": -91.3585,
    "phase": "Phase 3",
    "routeSegment": "Hannibal / Missouri optional return",
    "route_segment": "Hannibal / Missouri optional return",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://marktwaincave.com/",
    "official_website": "https://marktwaincave.com/",
    "learnMoreUrl": "https://marktwaincave.com/",
    "learn_more": "https://marktwaincave.com/",
    "sourceUrl": "https://marktwaincave.com/",
    "shortSummary": "Show cave associated with Mark Twain's Hannibal stories.",
    "summary": "Show cave associated with Mark Twain's Hannibal stories.",
    "whyItMatters": "Combines literature, geology, and classic road-trip energy.",
    "why": "Combines literature, geology, and classic road-trip energy.",
    "notes": {
      "elsie": "Think about how places inspire stories.",
      "katrina": "Ask how a cave becomes part of a book.",
      "emma": "Connect adventure, imagination, and real places.",
      "eliette": "Find story clues and cave textures.",
      "jules": "Tom Sawyer cave mission.",
      "momdad": "Combines literature, geology, and classic road-trip energy."
    },
    "profiles": {
      "elsie": "Think about how places inspire stories.",
      "katrina": "Ask how a cave becomes part of a book.",
      "emma": "Connect adventure, imagination, and real places.",
      "eliette": "Find story clues and cave textures.",
      "jules": "Tom Sawyer cave mission.",
      "momdad": "Combines literature, geology, and classic road-trip energy."
    },
    "csvOrder": 125
  },
  {
    "id": "P3-056",
    "title": "Mark Twain Boyhood Home & Museum",
    "name": "Mark Twain Boyhood Home & Museum",
    "category": "Literary Museum",
    "latitude": 39.7084,
    "longitude": -91.358,
    "lat": 39.7084,
    "lon": -91.358,
    "lng": -91.358,
    "phase": "Phase 3",
    "routeSegment": "Hannibal / Missouri optional return",
    "route_segment": "Hannibal / Missouri optional return",
    "tier": "Core",
    "estimatedStopMinutes": 90,
    "estimated_stop_minutes": 90,
    "officialWebsiteUrl": "https://marktwainmuseum.org/",
    "official_website": "https://marktwainmuseum.org/",
    "learnMoreUrl": "https://marktwainmuseum.org/",
    "learn_more": "https://marktwainmuseum.org/",
    "sourceUrl": "https://marktwainmuseum.org/",
    "shortSummary": "Museum centered on Mark Twain's childhood in Hannibal.",
    "summary": "Museum centered on Mark Twain's childhood in Hannibal.",
    "whyItMatters": "Strong literature/history stop if using a northern Missouri return.",
    "why": "Strong literature/history stop if using a northern Missouri return.",
    "notes": {
      "elsie": "Think about how childhood places shape writers.",
      "katrina": "Ask why Twain's stories lasted so long.",
      "emma": "Connect books, towns, and imagination.",
      "eliette": "Find old house and story details.",
      "jules": "Book-town mission.",
      "momdad": "Strong literature/history stop if using a northern Missouri return."
    },
    "profiles": {
      "elsie": "Think about how childhood places shape writers.",
      "katrina": "Ask why Twain's stories lasted so long.",
      "emma": "Connect books, towns, and imagination.",
      "eliette": "Find old house and story details.",
      "jules": "Book-town mission.",
      "momdad": "Strong literature/history stop if using a northern Missouri return."
    },
    "csvOrder": 126
  },
  {
    "id": "P3-057",
    "title": "Walt Disney Hometown Museum",
    "name": "Walt Disney Hometown Museum",
    "category": "Museum",
    "latitude": 39.4231,
    "longitude": -92.8016,
    "lat": 39.4231,
    "lon": -92.8016,
    "lng": -92.8016,
    "phase": "Phase 3",
    "routeSegment": "Marceline / Missouri optional return",
    "route_segment": "Marceline / Missouri optional return",
    "tier": "Core",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://www.waltdisneymuseum.org/",
    "official_website": "https://www.waltdisneymuseum.org/",
    "learnMoreUrl": "https://www.waltdisneymuseum.org/",
    "learn_more": "https://www.waltdisneymuseum.org/",
    "sourceUrl": "https://www.waltdisneymuseum.org/",
    "shortSummary": "Museum in Walt Disney's childhood hometown of Marceline.",
    "summary": "Museum in Walt Disney's childhood hometown of Marceline.",
    "whyItMatters": "Great family/pop-culture stop with small-town roots.",
    "why": "Great family/pop-culture stop with small-town roots.",
    "notes": {
      "elsie": "Think about how childhood places shape creativity.",
      "katrina": "Ask what Disney may have remembered from Marceline.",
      "emma": "Connect imagination, work, and home towns.",
      "eliette": "Look for photos, trains, and drawing details.",
      "jules": "Mickey hometown mission.",
      "momdad": "Great family/pop-culture stop with small-town roots."
    },
    "profiles": {
      "elsie": "Think about how childhood places shape creativity.",
      "katrina": "Ask what Disney may have remembered from Marceline.",
      "emma": "Connect imagination, work, and home towns.",
      "eliette": "Look for photos, trains, and drawing details.",
      "jules": "Mickey hometown mission.",
      "momdad": "Great family/pop-culture stop with small-town roots."
    },
    "csvOrder": 127
  },
  {
    "id": "P3-058",
    "title": "Gen. John J. Pershing Boyhood Home State Historic Site",
    "name": "Gen. John J. Pershing Boyhood Home State Historic Site",
    "category": "Historic Site",
    "latitude": 39.787,
    "longitude": -93.0638,
    "lat": 39.787,
    "lon": -93.0638,
    "lng": -93.0638,
    "phase": "Phase 3",
    "routeSegment": "Laclede / Missouri optional return",
    "route_segment": "Laclede / Missouri optional return",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 60,
    "estimated_stop_minutes": 60,
    "officialWebsiteUrl": "https://mostateparks.com/historic-site/gen-john-j-pershing-boyhood-home-state-historic-site",
    "official_website": "https://mostateparks.com/historic-site/gen-john-j-pershing-boyhood-home-state-historic-site",
    "learnMoreUrl": "https://mostateparks.com/historic-site/gen-john-j-pershing-boyhood-home-state-historic-site",
    "learn_more": "https://mostateparks.com/historic-site/gen-john-j-pershing-boyhood-home-state-historic-site",
    "sourceUrl": "https://mostateparks.com/historic-site/gen-john-j-pershing-boyhood-home-state-historic-site",
    "shortSummary": "Missouri state historic site honoring General John J. Pershing's boyhood home.",
    "summary": "Missouri state historic site honoring General John J. Pershing's boyhood home.",
    "whyItMatters": "Useful World War I connection paired with Kansas City's WWI museum.",
    "why": "Useful World War I connection paired with Kansas City's WWI museum.",
    "notes": {
      "elsie": "Connect a person’s childhood to world events.",
      "katrina": "Ask how leaders are shaped by early life.",
      "emma": "Compare small-town roots and global history.",
      "eliette": "Find house and military details.",
      "jules": "General house mission.",
      "momdad": "Useful World War I connection paired with Kansas City's WWI museum."
    },
    "profiles": {
      "elsie": "Connect a person’s childhood to world events.",
      "katrina": "Ask how leaders are shaped by early life.",
      "emma": "Compare small-town roots and global history.",
      "eliette": "Find house and military details.",
      "jules": "General house mission.",
      "momdad": "Useful World War I connection paired with Kansas City's WWI museum."
    },
    "csvOrder": 128
  },
  {
    "id": "P3-059",
    "title": "Battle of Westport Museum and Visitor Center",
    "name": "Battle of Westport Museum and Visitor Center",
    "category": "Civil War Site",
    "latitude": 38.9847,
    "longitude": -94.6044,
    "lat": 38.9847,
    "lon": -94.6044,
    "lng": -94.6044,
    "phase": "Phase 3",
    "routeSegment": "Kansas City return corridor",
    "route_segment": "Kansas City return corridor",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://battleofwestport.org/",
    "official_website": "https://battleofwestport.org/",
    "learnMoreUrl": "https://battleofwestport.org/",
    "learn_more": "https://battleofwestport.org/",
    "sourceUrl": "https://battleofwestport.org/",
    "shortSummary": "Visitor center and interpretation for the Battle of Westport.",
    "summary": "Visitor center and interpretation for the Battle of Westport.",
    "whyItMatters": "Good Kansas City-area return history stop.",
    "why": "Good Kansas City-area return history stop.",
    "notes": {
      "elsie": "Think about how war reached familiar places.",
      "katrina": "Ask why Westport mattered in the Civil War.",
      "emma": "Connect local streets to national history.",
      "eliette": "Find maps, markers, and battlefield clues.",
      "jules": "Map mission.",
      "momdad": "Good Kansas City-area return history stop."
    },
    "profiles": {
      "elsie": "Think about how war reached familiar places.",
      "katrina": "Ask why Westport mattered in the Civil War.",
      "emma": "Connect local streets to national history.",
      "eliette": "Find maps, markers, and battlefield clues.",
      "jules": "Map mission.",
      "momdad": "Good Kansas City-area return history stop."
    },
    "csvOrder": 129
  },
  {
    "id": "P3-060",
    "title": "Shawnee Town 1929",
    "name": "Shawnee Town 1929",
    "category": "Living History",
    "latitude": 39.0146,
    "longitude": -94.714,
    "lat": 39.0146,
    "lon": -94.714,
    "lng": -94.714,
    "phase": "Phase 3",
    "routeSegment": "Johnson County return corridor",
    "route_segment": "Johnson County return corridor",
    "tier": "Good Reset",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://www.shawneetown.org/",
    "official_website": "https://www.shawneetown.org/",
    "learnMoreUrl": "https://www.shawneetown.org/",
    "learn_more": "https://www.shawneetown.org/",
    "sourceUrl": "https://www.shawneetown.org/",
    "shortSummary": "Living history museum in Shawnee, Kansas.",
    "summary": "Living history museum in Shawnee, Kansas.",
    "whyItMatters": "Good close-to-home final stop showing everyday life in 1929.",
    "why": "Good close-to-home final stop showing everyday life in 1929.",
    "notes": {
      "elsie": "Compare 1929 daily life with your home today.",
      "katrina": "Ask what changed most in 100 years.",
      "emma": "Connect school, stores, chores, and transportation.",
      "eliette": "Find old signs, rooms, and shop details.",
      "jules": "Old town mission.",
      "momdad": "Good close-to-home final stop showing everyday life in 1929."
    },
    "profiles": {
      "elsie": "Compare 1929 daily life with your home today.",
      "katrina": "Ask what changed most in 100 years.",
      "emma": "Connect school, stores, chores, and transportation.",
      "eliette": "Find old signs, rooms, and shop details.",
      "jules": "Old town mission.",
      "momdad": "Good close-to-home final stop showing everyday life in 1929."
    },
    "csvOrder": 130
  },
  {
    "id": "P3-061",
    "title": "Johnson County Museum",
    "name": "Johnson County Museum",
    "category": "History Museum",
    "latitude": 38.9666,
    "longitude": -94.7013,
    "lat": 38.9666,
    "lon": -94.7013,
    "lng": -94.7013,
    "phase": "Phase 3",
    "routeSegment": "Johnson County return corridor",
    "route_segment": "Johnson County return corridor",
    "tier": "Good Reset",
    "estimatedStopMinutes": 45,
    "estimated_stop_minutes": 45,
    "officialWebsiteUrl": "https://jcprd.com/330/Johnson-County-Museum",
    "official_website": "https://jcprd.com/330/Johnson-County-Museum",
    "learnMoreUrl": "https://jcprd.com/330/Johnson-County-Museum",
    "learn_more": "https://jcprd.com/330/Johnson-County-Museum",
    "sourceUrl": "https://jcprd.com/330/Johnson-County-Museum",
    "shortSummary": "Local museum covering Johnson County history.",
    "summary": "Local museum covering Johnson County history.",
    "whyItMatters": "Useful final reflection stop after returning home.",
    "why": "Useful final reflection stop after returning home.",
    "notes": {
      "elsie": "Think about how home has its own history.",
      "katrina": "Ask what future people will remember about today.",
      "emma": "Connect the trip back to where you live.",
      "eliette": "Find familiar places in old photos.",
      "jules": "Home history mission.",
      "momdad": "Useful final reflection stop after returning home."
    },
    "profiles": {
      "elsie": "Think about how home has its own history.",
      "katrina": "Ask what future people will remember about today.",
      "emma": "Connect the trip back to where you live.",
      "eliette": "Find familiar places in old photos.",
      "jules": "Home history mission.",
      "momdad": "Useful final reflection stop after returning home."
    },
    "csvOrder": 131
  },
  {
    "id": "P3-062",
    "title": "Kauffman Stadium",
    "name": "Kauffman Stadium",
    "category": "Sports Landmark",
    "latitude": 39.0517,
    "longitude": -94.4803,
    "lat": 39.0517,
    "lon": -94.4803,
    "lng": -94.4803,
    "phase": "Phase 3",
    "routeSegment": "Kansas City return corridor",
    "route_segment": "Kansas City return corridor",
    "tier": "Good Reset",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://www.mlb.com/royals/ballpark",
    "official_website": "https://www.mlb.com/royals/ballpark",
    "learnMoreUrl": "https://www.mlb.com/royals/ballpark",
    "learn_more": "https://www.mlb.com/royals/ballpark",
    "sourceUrl": "https://www.mlb.com/royals/ballpark",
    "shortSummary": "Home of the Kansas City Royals.",
    "summary": "Home of the Kansas City Royals.",
    "whyItMatters": "Quick KC sports landmark on the way back into town.",
    "why": "Quick KC sports landmark on the way back into town.",
    "notes": {
      "elsie": "Think about stadiums as community gathering places.",
      "katrina": "Ask what makes a team feel like home.",
      "emma": "Connect sports, city pride, and family memories.",
      "eliette": "Find logos, fountains, and blue details.",
      "jules": "Royals mission.",
      "momdad": "Quick KC sports landmark on the way back into town."
    },
    "profiles": {
      "elsie": "Think about stadiums as community gathering places.",
      "katrina": "Ask what makes a team feel like home.",
      "emma": "Connect sports, city pride, and family memories.",
      "eliette": "Find logos, fountains, and blue details.",
      "jules": "Royals mission.",
      "momdad": "Quick KC sports landmark on the way back into town."
    },
    "csvOrder": 132
  },
  {
    "id": "P3-063",
    "title": "GEHA Field at Arrowhead Stadium",
    "name": "GEHA Field at Arrowhead Stadium",
    "category": "Sports Landmark",
    "latitude": 39.0489,
    "longitude": -94.4839,
    "lat": 39.0489,
    "lon": -94.4839,
    "lng": -94.4839,
    "phase": "Phase 3",
    "routeSegment": "Kansas City return corridor",
    "route_segment": "Kansas City return corridor",
    "tier": "Good Reset",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://www.chiefs.com/stadium/",
    "official_website": "https://www.chiefs.com/stadium/",
    "learnMoreUrl": "https://www.chiefs.com/stadium/",
    "learn_more": "https://www.chiefs.com/stadium/",
    "sourceUrl": "https://www.chiefs.com/stadium/",
    "shortSummary": "Home of the Kansas City Chiefs.",
    "summary": "Home of the Kansas City Chiefs.",
    "whyItMatters": "Strong homecoming sports landmark for KC fans.",
    "why": "Strong homecoming sports landmark for KC fans.",
    "notes": {
      "elsie": "Think about why stadiums become city symbols.",
      "katrina": "Ask how traditions make fans feel connected.",
      "emma": "Connect sports, family, and place.",
      "eliette": "Look for red, arrows, and stadium shapes.",
      "jules": "Chiefs mission.",
      "momdad": "Strong homecoming sports landmark for KC fans."
    },
    "profiles": {
      "elsie": "Think about why stadiums become city symbols.",
      "katrina": "Ask how traditions make fans feel connected.",
      "emma": "Connect sports, family, and place.",
      "eliette": "Look for red, arrows, and stadium shapes.",
      "jules": "Chiefs mission.",
      "momdad": "Strong homecoming sports landmark for KC fans."
    },
    "csvOrder": 133
  },
  {
    "id": "P3-064",
    "title": "Powell Gardens",
    "name": "Powell Gardens",
    "category": "Garden",
    "latitude": 38.864,
    "longitude": -94.0407,
    "lat": 38.864,
    "lon": -94.0407,
    "lng": -94.0407,
    "phase": "Phase 3",
    "routeSegment": "Kansas City east return corridor",
    "route_segment": "Kansas City east return corridor",
    "tier": "Worth a Stop",
    "estimatedStopMinutes": 75,
    "estimated_stop_minutes": 75,
    "officialWebsiteUrl": "https://powellgardens.org/",
    "official_website": "https://powellgardens.org/",
    "learnMoreUrl": "https://powellgardens.org/",
    "learn_more": "https://powellgardens.org/",
    "sourceUrl": "https://powellgardens.org/",
    "shortSummary": "Botanical garden east of Kansas City.",
    "summary": "Botanical garden east of Kansas City.",
    "whyItMatters": "Good final outdoor reset before home.",
    "why": "Good final outdoor reset before home.",
    "notes": {
      "elsie": "Notice plant design and prairie landscapes.",
      "katrina": "Ask how gardens teach people about nature.",
      "emma": "Connect beauty, food, pollinators, and weather.",
      "eliette": "Find flowers, paths, and art details.",
      "jules": "Garden mission.",
      "momdad": "Good final outdoor reset before home."
    },
    "profiles": {
      "elsie": "Notice plant design and prairie landscapes.",
      "katrina": "Ask how gardens teach people about nature.",
      "emma": "Connect beauty, food, pollinators, and weather.",
      "eliette": "Find flowers, paths, and art details.",
      "jules": "Garden mission.",
      "momdad": "Good final outdoor reset before home."
    },
    "csvOrder": 134
  },
  {
    "id": "P3-065",
    "title": "Lone Jack Battlefield Museum",
    "name": "Lone Jack Battlefield Museum",
    "category": "Civil War Site",
    "latitude": 38.8706,
    "longitude": -94.1743,
    "lat": 38.8706,
    "lon": -94.1743,
    "lng": -94.1743,
    "phase": "Phase 3",
    "routeSegment": "Missouri return corridor",
    "route_segment": "Missouri return corridor",
    "tier": "Good Reset",
    "estimatedStopMinutes": 30,
    "estimated_stop_minutes": 30,
    "officialWebsiteUrl": "https://historiclonejack.org/",
    "official_website": "https://historiclonejack.org/",
    "learnMoreUrl": "https://historiclonejack.org/",
    "learn_more": "https://historiclonejack.org/",
    "sourceUrl": "https://historiclonejack.org/",
    "shortSummary": "Museum and battlefield site in Lone Jack, Missouri.",
    "summary": "Museum and battlefield site in Lone Jack, Missouri.",
    "whyItMatters": "Small but route-relevant Civil War stop east of KC.",
    "why": "Small but route-relevant Civil War stop east of KC.",
    "notes": {
      "elsie": "Think about local places with national history.",
      "katrina": "Ask why small battles are remembered.",
      "emma": "Connect markers, towns, and memory.",
      "eliette": "Find old photos, maps, and signs.",
      "jules": "Battlefield marker mission.",
      "momdad": "Small but route-relevant Civil War stop east of KC."
    },
    "profiles": {
      "elsie": "Think about local places with national history.",
      "katrina": "Ask why small battles are remembered.",
      "emma": "Connect markers, towns, and memory.",
      "eliette": "Find old photos, maps, and signs.",
      "jules": "Battlefield marker mission.",
      "momdad": "Small but route-relevant Civil War stop east of KC."
    },
    "csvOrder": 135
  }
];

  const phaseLabels = {
    pretrip: "Pre-trip",
    outbound: "Outbound",
    island: "Island stay",
    return: "Return trip",
    complete: "Trip complete"
  };

  const pages = ["today", "route", "explore", "nearby", "learn", "lens", "rewards", "memories", "detail", "weather", "stars", "ferry", "activities", "badges", "saved", "photos", "sources", "settings"];
  const parentPages = ["today", "route", "explore", "nearby", "learn", "lens", "rewards", "memories", "detail", "gps", "weather", "ferry", "stops", "votes", "saved", "badges", "photos", "sources", "settings"];
  const mainMenuItems = [
    ["explore", "Explore Map", "All uploaded trip stops on one clustered map"],
    ["lens", "Real Life Lens", "Analyze a photo and save the story"],
    ["memories", "Trip Summary", "Saved photos, stats, and timeline"],
    ["photos", "Photos", "Captured media"],
    ["rewards", "Badges", "Earned and upcoming trip badges"],
    ["weather", "Weather", "Forecast and radar"],
    ["ferry", "Ferry Information", "Plaunt ferry and weather context"],
    ["settings", "Settings", "Storage, offline, and app status"]
  ];
  const julesFlow = ["Captain Today", "Weather", "Ferry / Boats", "Big Machines", "Stars", "Badges", "Photos", "Done / Next choice"];

  function defaultState() {
    return {
      phase: "pretrip",
      progress: 0,
      returnProgress: 0,
      profile: "elsie",
      hasChosenProfile: false,
      shortlist: {},
      favorites: {},
      votes: {},
      approved: [],
      dismissed: [],
      completed: [],
      captures: [],
      journal: [],
      draftPhotos: [],
      visitedStops: {},
      tripLeg: "day1",
      includeIndianaDunes: true,
      completedStops: {},
      profileStopRatings: { elsie: {} },
      profileCollections: { elsie: {} },
      pendingAnalyze: false,
      badges: {},
      weather: {},
      actionMessage: "No action yet.",
      gpsStatus: "Off",
      trackingStatus: "Off",
      breadcrumbTrail: [],
      breadcrumbVisible: true,
      radarEnabled: false,
      radarOpacity: 0.45,
      radarAnimationEnabled: false,
      radarStationsVisible: false,
      radarCachedFrame: null,
      activeElsieSheet: null
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("tripState")) || {};
      const merged = { ...defaultState(), ...saved };
      merged.shortlist = { ...(saved.shortlist || saved.favorites || {}) };
      merged.badges ||= {};
      merged.weather ||= {};
      return merged;
    } catch {
      return defaultState();
    }
  }

  function ensureCollections() {
    state.shortlist ||= {};
    state.favorites ||= {};
    state.votes ||= {};
    state.approved ||= [];
    state.dismissed ||= [];
    state.completed ||= [];
    state.captures ||= [];
    state.journal ||= [];
    state.draftPhotos ||= [];
    state.visitedStops ||= {};
    state.completedStops ||= {};
    state.profileStopRatings ||= { elsie: {} };
    state.profileStopRatings.elsie ||= {};
    state.profileCollections ||= { elsie: {} };
    state.profileCollections.elsie ||= {};
    delete state.routeResults;
    if (typeof state.includeIndianaDunes !== "boolean") state.includeIndianaDunes = true;
    [state.captures, state.journal, state.draftPhotos].forEach((list) => {
      list.forEach((item) => {
        item.id ||= makeId("photo");
        item.notes ||= "";
      });
    });
    state.badges ||= {};
    state.weather ||= {};
    if (!Array.isArray(state.breadcrumbTrail)) state.breadcrumbTrail = [];
    if (typeof state.breadcrumbVisible !== "boolean") state.breadcrumbVisible = true;
    if (typeof state.radarEnabled !== "boolean") state.radarEnabled = false;
    if (!Number.isFinite(Number(state.radarOpacity))) state.radarOpacity = 0.45;
    if (typeof state.radarAnimationEnabled !== "boolean") state.radarAnimationEnabled = false;
    if (typeof state.radarStationsVisible !== "boolean") state.radarStationsVisible = false;
  }

  function saveState() {
    ensureCollections();
    state.profile = activeProfile;
    try {
      localStorage.setItem("tripState", JSON.stringify(state));
      state.storageWarning = "";
    } catch {
      state.storageWarning = "Storage is nearly full on this device. Save fewer large photos or remove older entries.";
    }
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function currentProfile() {
    return data.profiles.find((profile) => profile.id === activeProfile) || data.profiles[0];
  }

  function selectedDay() {
    const now = new Date();
    const depart = new Date(data.dates.depart);
    const dayMs = 24 * 60 * 60 * 1000;
    const index = clamp(Math.floor((now - depart) / dayMs), 0, data.days.length - 1);
    return data.days[index] || data.days[0];
  }

  function selectedDayDate() {
    return selectedDay().date;
  }

  function isChild(profile = currentProfile()) {
    return !["momdad"].includes(profile.id);
  }

  function isDashboardProfile(profile = currentProfile()) {
    return profile.id !== "jules";
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function haversineMiles(a, b) {
    const radius = 3958.8;
    const toRad = (degrees) => (degrees * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return radius * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function allAttractions() {
    const csvStops = Array.isArray(window.TRIP_STOPS) ? window.TRIP_STOPS : [];
    const embeddedStops = Array.isArray(EMBEDDED_TRIP_STOPS) ? EMBEDDED_TRIP_STOPS : [];
    const source = csvStops.length ? csvStops : embeddedStops.length ? embeddedStops : (data.attractions || data.route.routePlaces || []);
    return source
      .map((item) => enrichStop({
        ...item,
        title: item.title || item.name,
        name: item.name || item.title,
        sourceUrl: item.sourceUrl || item.officialWebsiteUrl || item.learnMoreUrl || item.learnMore,
        learnMore: item.learnMore || item.learnMoreUrl || item.officialWebsiteUrl,
        summary: item.summary || item.shortSummary,
        why: item.why || item.whyItMatters
      }))
      .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lon));
  }

  function enrichStop(item) {
    const title = item.title || item.name || "";
    const category = item.category || stopCategory(item);
    const lat = Number(item.lat ?? item.latitude);
    const lon = Number(item.lon ?? item.lng ?? item.longitude);
    const minutes = Number(item.estimatedStopMinutes ?? item.estimated_stop_minutes);
    const estimatedStopTime = item.estimatedStopTime || (Number.isFinite(minutes) ? `${minutes} min` : stopTime({ ...item, category }));
    const profileNotes = item.profiles || item.notes || {};
    return {
      ...item,
      title,
      name: item.name || title,
      lat,
      lon,
      category,
      icon: stopIcon(category),
      tier: item.tier || stopTier(item),
      estimatedStopTime,
      distanceOffRoute: item.distanceOffRoute || offRouteEstimate(item),
      latitude: lat,
      longitude: lon,
      summary: item.summary || item.shortSummary || "",
      why: item.why || item.whyItMatters || item.summary || item.shortSummary || "",
      profiles: {
        momdad: profileNotes.momdad || item.whyItMatters || item.why || item.summary || "",
        elsie: profileNotes.elsie || profileNotes.elsie14 || "",
        katrina: profileNotes.katrina || profileNotes.katrina11 || "",
        emma: profileNotes.emma || profileNotes.emma10 || "",
        eliette: profileNotes.eliette || profileNotes.eliette10 || "",
        jules: profileNotes.jules || profileNotes.jules5 || ""
      }
    };
  }

  function stopCategory(item) {
    const text = `${item.title || item.name} ${item.summary || item.why || ""}`.toLowerCase();
    if (text.includes("ferry") || text.includes("plaunt")) return "Ferry";
    if (text.includes("national park") || text.includes("dunes")) return "National Park";
    if (text.includes("museum") || text.includes("studebaker")) return "Museum";
    if (text.includes("arch") || text.includes("bridge") || text.includes("historic") || text.includes("history")) return "Historic Site";
    if (text.includes("lighthouse")) return "Lighthouse";
    if (text.includes("food") || text.includes("dinner")) return "Food Stop";
    if (text.includes("big things") || text.includes("odd")) return "Oddity";
    return "Photo Stop";
  }

  function stopIcon(category) {
    return {
      "National Park": "△",
      "Historic Site": "▥",
      "Museum": "▦",
      "Lighthouse": "◌",
      "Waterfall": "≈",
      "Food Stop": "⌘",
      "Oddity": "✦",
      "Photo Stop": "◉",
      "Ferry": "▰"
    }[category] || "•";
  }

  function stopTier(item) {
    const name = item.title || item.name || "";
    if (/South Bend|Notre Dame|Plaunt|Gateway Arch|Bois Blanc/i.test(name)) return "Core";
    if (/Studebaker|Speedway|Mackinac|Dunes|Big Things/i.test(name)) return "Worth a stop";
    return "Good reset";
  }

  function stopTime(item) {
    const category = item.category || stopCategory(item);
    if (category === "Ferry") return "45-75 min";
    if (category === "National Park") return "45-90 min";
    if (category === "Museum") return "45-90 min";
    if (category === "Food Stop") return "45-60 min";
    return "15-30 min";
  }

  function offRouteEstimate(item) {
    const name = item.title || item.name || "";
    if (/Gateway Arch|Notre Dame|Studebaker|Plaunt|Columbia|Rocheport/i.test(name)) return "near route";
    if (/Big Things|Speedway|Dunes|Mackinac/i.test(name)) return "short detour";
    return "route context";
  }

  function appleMapsUrl(stop) {
    return `https://maps.apple.com/?daddr=${stop.lat},${stop.lon}&dirflg=d`;
  }

  function stopDistanceLabel(stop) {
    if (state.lastPosition) return `${haversineMiles(state.lastPosition, stop).toFixed(1)} mi away`;
    if (stop.milesFromStart) return `mile ${stop.milesFromStart}`;
    return stop.routeSegment || "route stop";
  }

  function stopKey(stop) {
    return stop.id || (stop.title || stop.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function isStopSaved(stop) {
    const name = stop.title || stop.name;
    return Object.values(state.shortlist || {}).some((item) => item.name === name && (activeProfile !== "elsie" || item.profile === "elsie"));
  }

  function isStopVisited(stop) {
    return Boolean(state.visitedStops?.[stopKey(stop)]);
  }

  function attractionForName(name) {
    return allAttractions().find((item) => item.name === name || item.title === name);
  }

  function makeId(prefix = "item") {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function nearestAttractions(point = state.lastPosition, limit = 8) {
    if (!point) return allAttractions().slice(0, limit);
    return allAttractions()
      .map((item) => ({ ...item, distance: haversineMiles(point, item) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  function activeDestination() {
    return getActiveTripTarget();
  }

  function activeOrigin() {
    const day = selectedDayDate();
    if (state.phase === "return" || day === "2026-08-08") return data.route.coordinates.islandApprox;
    if (day === "2026-08-01" && state.phase !== "island") return data.route.coordinates.merrillville;
    return data.route.coordinates.start;
  }

  function routeResultKey(target = getActiveTripTarget()) {
    return stopKey(target);
  }

  function plannedRouteResult(target = getActiveTripTarget()) {
    const miles = Number(target.plannedMiles || 0);
    const hours = Number(target.plannedHours || (miles ? miles / 58 : 0));
    return {
      distanceMeters: miles * 1609.344,
      durationSeconds: hours * 3600,
      trafficDurationSeconds: null,
      coordinates: [],
      calculatedAt: Date.now(),
      source: "planned",
      isLive: false,
      isFallback: true
    };
  }

  async function getActiveRoute({ origin, destination, waypoints = [], travelMode = "driving", force = false } = {}) {
    const target = destination || getActiveTripTarget();
    const from = origin || state.lastPosition || activeOrigin();
    const key = routeResultKey(target);
    const cached = liveRouteResults[key];
    if (!force && cached && Date.now() - Number(cached.calculatedAt || 0) < 5 * 60 * 1000) return cached;
    if (!navigator.onLine || document.visibilityState === "hidden") return cached || plannedRouteResult(target);
    const points = [from, ...waypoints, target].map((point) => `${Number(point.lon).toFixed(6)},${Number(point.lat).toFixed(6)}`).join(";");
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/${travelMode}/${points}?overview=full&geometries=geojson&steps=false`);
      if (!response.ok) throw new Error("route unavailable");
      const payload = await response.json();
      const route = payload.routes?.[0];
      if (!route) throw new Error("route missing");
      const normalized = {
        distanceMeters: route.distance,
        durationSeconds: route.duration,
        trafficDurationSeconds: null,
        encodedPolyline: null,
        coordinates: route.geometry?.coordinates || [],
        calculatedAt: Date.now(),
        source: "OSRM road route",
        isLive: Boolean(state.lastPosition),
        isFallback: false,
        destination: { lat: target.lat, lon: target.lon, label: target.label }
      };
      lastRouteOrigin = { lat: from.lat, lon: from.lon };
      liveRouteResults[key] = normalized;
      state.initialLegDistanceMeters ||= normalized.distanceMeters;
      saveState();
      return normalized;
    } catch {
      if (cached) return { ...cached, isLive: false, source: "cached road route" };
      return plannedRouteResult(target);
    }
  }

  function currentRouteResult() {
    return liveRouteResults[routeResultKey()] || plannedRouteResult();
  }

  function routeShouldRefresh(point) {
    const route = liveRouteResults[routeResultKey()];
    if (!route || Date.now() - Number(route.calculatedAt || 0) > 5 * 60 * 1000) return true;
    return lastRouteOrigin && point && haversineMiles(lastRouteOrigin, point) >= 3;
  }

  function refreshActiveRoute(force = false) {
    if (document.visibilityState === "hidden") return Promise.resolve(currentRouteResult());
    const plan = routePlan();
    const waypoints = plan.waypoints.map((w) => w.location);
    return getActiveRoute({ force, waypoints }).then((route) => {
      if (route.distanceMeters) state.gpsMilesToActiveDestination = route.distanceMeters / 1609.344;
      if (state.initialLegDistanceMeters && route.distanceMeters) {
        const progress = clamp(1 - route.distanceMeters / state.initialLegDistanceMeters, 0, 1) * 100;
        if (state.phase === "return") state.returnProgress = progress;
        else if (state.phase === "outbound") state.progress = progress;
      }
      saveState();
      const routeSource = homeMap?.getSource?.("elsie-active-route");
      if (routeSource && route.coordinates?.length > 1) routeSource.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route.coordinates } });
      renderElsieRouteTracker();
      refreshElsieEtaPill();
      return route;
    });
  }

  function destinationTimeZone(target = getActiveTripTarget()) {
    if (target === data.route.destinationTargets.cheboygan || target === data.route.destinationTargets.island) return "America/Detroit";
    return "America/Chicago";
  }

  function routeArrivalText(route = currentRouteResult(), target = getActiveTripTarget()) {
    if (!route?.durationSeconds) return "Arrival unavailable";
    const arrival = new Date(Date.now() + route.durationSeconds * 1000);
    const zone = destinationTimeZone(target);
    const time = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit", timeZone: zone }).format(arrival);
    return `Arrival about ${time} ${zone === "America/Detroit" ? "ET" : "CT"}`;
  }

  function googleMapsNavigationUrl(stop = getActiveTripTarget()) {
    const params = new URLSearchParams({ api: "1", destination: `${stop.lat},${stop.lon}`, travelmode: "driving" });
    if (stop === data.route.destinationTargets.cheboygan && state.includeIndianaDunes && !state.completedStops["indiana-dunes"]) {
      const dunes = data.route.destinationTargets.indianaDunes;
      params.set("waypoints", `${dunes.lat},${dunes.lon}`);
    }
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function getActiveTripTarget() {
    const day = selectedDayDate();
    if (state.phase === "return" || day === "2026-08-08" || state.tripLeg === "return") return data.route.destinationTargets.home;
    if (state.phase === "island" || state.phase === "complete") return data.route.destinationTargets.island;
    if (day === "2026-08-01" || state.tripLeg === "day2") {
      if (state.includeIndianaDunes && !state.completedStops["indiana-dunes"]) return data.route.destinationTargets.indianaDunes;
      return data.route.destinationTargets.cheboygan;
    }
    return data.route.destinationTargets.merrillville;
  }

  function isTravelDay(date = selectedDayDate()) {
    return ["2026-07-31", "2026-08-01", "2026-08-08"].includes(date);
  }

  function isFerryRelevant() {
    const day = selectedDayDate();
    return day === "2026-08-01" || state.phase === "island" || state.phase === "return";
  }

  function progressForPhase() {
    if (state.phase === "outbound") return clamp(state.progress || 0, 0, 100);
    if (state.phase === "return") return clamp(state.returnProgress || 0, 0, 100);
    if (state.phase === "island" || state.phase === "complete") return 100;
    return 0;
  }

  function milesLeft() {
    if (state.gpsMilesToActiveDestination && state.phase !== "pretrip" && state.phase !== "complete") {
      return Math.round(state.gpsMilesToActiveDestination);
    }
    if (state.phase === "island" || state.phase === "complete") return 0;
    const destination = activeDestination();
    const total = state.phase === "return" ? data.route.totalReturnMiles : (destination.plannedMiles || data.route.totalOutboundMiles);
    return Math.round(total * (1 - progressForPhase() / 100));
  }

  function routeProgressMiles() {
    const destination = activeDestination();
    const progress = progressForPhase() / 100;
    if (state.phase === "return") return Math.round(data.route.totalReturnMiles * progress);
    if (selectedDayDate() === "2026-07-31") return Math.round((destination.plannedMiles || 585) * progress);
    if (selectedDayDate() === "2026-08-01") return Math.round(585 + (destination.plannedMiles || 460) * progress);
    return Math.round(data.route.totalOutboundMiles * progress);
  }

  function weatherCodeText(code) {
    const map = {
      0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Cloudy", 45: "Fog", 48: "Fog",
      51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain",
      65: "Heavy rain", 71: "Snow", 80: "Showers", 95: "Thunderstorm"
    };
    return map[code] || "Weather changing";
  }

  function weatherFlags(weather) {
    if (!weather || !weather.current) return ["Needs verification"];
    const current = weather.current;
    const daily = weather.daily || {};
    const flags = [];
    const rain = Number(current.precipitation_probability ?? weather.hourly?.precipitation_probability?.[0] ?? 0);
    const gust = Number(current.wind_gusts_10m || daily.wind_gusts_10m_max?.[0] || 0);
    const temp = Number(current.temperature_2m || 0);
    const cloud = Number(current.cloud_cover ?? weather.hourly?.cloud_cover?.[0] ?? 0);
    if (rain >= 45) flags.push("Rain likely");
    if (gust >= 25) flags.push("Windy ferry concern");
    if (cloud >= 65) flags.push("Stargazing risk");
    if (temp <= 58) flags.push("Layer needed");
    if (temp >= 86) flags.push("Heat note");
    if (!flags.length) flags.push("Outdoor window");
    return flags;
  }

  function weatherSummaryFor(profile, weather, locationName) {
    const flags = weatherFlags(weather);
    const current = weather?.current;
    const rainChance = current ? Number(current.precipitation_probability ?? weather.hourly?.precipitation_probability?.[0] ?? 0) : 0;
    const humidity = current ? Number(current.relative_humidity_2m ?? weather.hourly?.relative_humidity_2m?.[0] ?? 0) : 0;
    const base = current ? `${locationName}: ${Math.round(current.temperature_2m)} F, ${weatherCodeText(current.weather_code)}, wind ${Math.round(current.wind_speed_10m || 0)} mph, gusts ${Math.round(current.wind_gusts_10m || 0)} mph, humidity ${humidity}%, rain chance ${rainChance}%.` : `${locationName}: weather is not available yet.`;
    const flagText = flags.join(", ");
    const copy = {
      elsie: `Sky and animal watch: ${base} Look for how clouds, wind, birds, and small animals change. ${flagText}.`,
      katrina: `Why it matters: ${base} Lake air and wind can change a plan faster than temperature alone. ${flagText}.`,
      emma: `Plan window: ${base} Use this to choose outside time, food, shopping, walking, or an indoor backup. ${flagText}.`,
      eliette: `Photo/detail weather: ${base} Keep paper, crafts, and small keepsakes dry if rain or wind shows up. ${flagText}.`,
      jules: `Captain weather: ${flags.includes("Rain likely") ? "rain plan" : "outside may work"}. ${flags.includes("Layer needed") ? "Jacket on." : "Stay with grownups."}`,
      momdad: `Logistics readout: ${base} Flags: ${flagText}. Verify ferry timing and backup plans before depending on this.`
    };
    return copy[profile.id] || copy.elsie;
  }

  function formatWeatherTime(value) {
    if (!value) return "--";
    return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function formatDaylight(seconds) {
    if (!Number.isFinite(Number(seconds))) return "--";
    const hours = Math.floor(Number(seconds) / 3600);
    const minutes = Math.round((Number(seconds) % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  function weatherMetricList(weather) {
    const current = weather?.current || {};
    const hourly = weather?.hourly || {};
    if (!weather?.current && !hourly?.time?.length) return [];
    const precipitation = Number(current.precipitation ?? hourly.precipitation?.[0] ?? 0);
    const rain = Number(current.rain ?? hourly.rain?.[0] ?? 0);
    const showers = Number(current.showers ?? hourly.showers?.[0] ?? 0);
    const cloud = Number(current.cloud_cover ?? hourly.cloud_cover?.[0] ?? 0);
    const humidity = Number(current.relative_humidity_2m ?? hourly.relative_humidity_2m?.[0] ?? 0);
    const cape = Number(hourly.cape?.[0] ?? 0);
    const cin = Number(hourly.convective_inhibition?.[0] ?? 0);
    return [
      ["Temp", `${Math.round(current.temperature_2m ?? hourly.temperature_2m?.[0] ?? 0)} F`],
      ["Humidity", `${humidity}%`],
      ["Precip", `${precipitation.toFixed(2)} in`],
      ["Rain", `${rain.toFixed(2)} in`],
      ["Showers", `${showers.toFixed(2)} in`],
      ["Clouds", `${cloud}%`],
      ["Wind", `${Math.round(current.wind_speed_10m ?? hourly.wind_speed_10m?.[0] ?? 0)} mph`],
      ["Gusts", `${Math.round(current.wind_gusts_10m ?? hourly.wind_gusts_10m?.[0] ?? 0)} mph`],
      ["CAPE", `${Math.round(cape)} J/kg`],
      ["CIN", `${Math.round(cin)} J/kg`]
    ];
  }

  function weatherSunList(weather) {
    const daily = weather?.daily || {};
    if (!daily.sunrise?.length && !daily.sunset?.length && !daily.daylight_duration?.length) return [];
    return [
      ["Sunrise", formatWeatherTime(daily.sunrise?.[0])],
      ["Sunset", formatWeatherTime(daily.sunset?.[0])],
      ["Daylight", formatDaylight(daily.daylight_duration?.[0])]
    ];
  }

  function renderHourlyWeather(weather) {
    const hourly = weather?.hourly;
    if (!hourly?.time?.length) return `<p class="map-caption">12-hour forecast will appear after refresh.</p>`;
    return `
      <div class="hourly-strip" aria-label="12 hour weather forecast">
        ${hourly.time.slice(0, 12).map((time, index) => `
          <div class="hourly-pill">
            <strong>${formatWeatherTime(time)}</strong>
            <span>${Math.round(hourly.temperature_2m?.[index] ?? 0)} F</span>
            <small>${hourly.precipitation_probability?.[index] ?? 0}% rain</small>
            <small>${Number(hourly.precipitation?.[index] ?? 0).toFixed(2)} in</small>
            <small>${Math.round(hourly.wind_speed_10m?.[index] ?? 0)} mph</small>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderWeatherMetrics(weather) {
    const metrics = weatherMetricList(weather);
    if (!metrics.length) return "";
    return `<div class="weather-metrics">${metrics.map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`).join("")}</div>`;
  }

  function renderSunMetrics(weather) {
    const metrics = weatherSunList(weather);
    if (!metrics.length) return "";
    return `<div class="weather-metrics sun-metrics">${metrics.map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`).join("")}</div>`;
  }

  function weatherUrl(location) {
    const current = "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,showers,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m";
    const hourly = "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,showers,cloud_cover,wind_speed_10m,wind_gusts_10m,cape,convective_inhibition";
    const daily = "sunrise,sunset,daylight_duration";
    const params = new URLSearchParams({
      latitude: location.lat,
      longitude: location.lon,
      current,
      hourly,
      daily,
      forecast_hours: "12",
      models: "best_match",
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      precipitation_unit: "inch",
      timezone: "America/Chicago"
    });
    return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  }

  function weatherCacheFresh(cached, location) {
    if (!cached || Date.now() - cached.fetchedAt >= WEATHER_TTL) return false;
    if (location.id !== "gps" || !cached.location) return true;
    return haversineMiles(cached.location, location) < 2;
  }

  async function getWeather(location) {
    ensureCollections();
    const cached = state.weather[location.id];
    if (weatherCacheFresh(cached, location)) return { ...cached, sourceStatus: "Cached recent" };
    try {
      const response = await fetch(weatherUrl(location));
      if (!response.ok) throw new Error("Weather unavailable");
      const payload = await response.json();
      const next = { ...payload, location: { ...location }, fetchedAt: Date.now(), sourceStatus: "Live from Open-Meteo, imperial units" };
      state.weather[location.id] = next;
      saveState();
      return next;
    } catch {
      if (cached) return { ...cached, sourceStatus: "Cached fallback" };
      return { location, sourceStatus: "Not available" };
    }
  }

  async function refreshWeatherCards() {
    const container = byId("weatherBlocks");
    if (container) container.innerHTML = `<div class="loading-note">Refreshing Open-Meteo weather...</div>`;
    const locations = weatherLocationsForContext();
    const results = await Promise.all(locations.map(getWeather));
    renderWeatherBlocks(results);
    awardBadge("weather-watch");
    if (results.some((weather) => weatherFlags(weather).includes("Stargazing risk"))) awardBadge("cloud-cover-checker");
    saveState();
  }

  function weatherLocationsForContext() {
    const ids = state.phase === "pretrip" ? ["olathe", "southBend", "cheboygan", "boisBlanc"] :
      state.phase === "outbound" ? ["southBend", "cheboygan", "boisBlanc"] :
      state.phase === "return" ? ["cheboygan", "southBend", "olathe"] : ["boisBlanc", "cheboygan"];
    const live = state.lastPosition ? [{ id: "gps", name: "Current GPS location", lat: state.lastPosition.lat, lon: state.lastPosition.lon, role: "Live GPS" }] : [];
    return [...live, ...ids.map((id) => data.weatherLocations.find((location) => location.id === id)).filter(Boolean)];
  }

  function refreshGpsWeatherIfNeeded() {
    if (!state.lastPosition) return;
    const location = { id: "gps", name: "Current GPS location", lat: state.lastPosition.lat, lon: state.lastPosition.lon, role: "Live GPS" };
    if (weatherCacheFresh(state.weather?.gps, location)) return;
    getWeather(location).then(() => {
      const container = byId("weatherBlocks");
      if (container) renderWeatherBlocks(weatherLocationsForContext().map((item) => state.weather[item.id] || { location: item, sourceStatus: "Not available" }));
    });
  }

  function activeRouteUrl() {
    if (state.phase === "return" || selectedDayDate() === "2026-08-08") return data.mapLinks.returnUrl;
    if (selectedDayDate() === "2026-07-31") return data.mapLinks.dayOneUrl;
    if (selectedDayDate() === "2026-08-01") return data.mapLinks.ferryDayUrl;
    return data.mapLinks.outboundUrl;
  }

  function sourceLinkForPlace(place) {
    if (place.source?.url) return place.source.url;
    if (place.sourceUrl) return place.sourceUrl;
    if (place.officialWebsiteUrl) return place.officialWebsiteUrl;
    if (place.learnMoreUrl) return place.learnMoreUrl;
    if (place.official_website) return place.official_website;
    if (place.learn_more) return place.learn_more;
    if (place.learnMore) return place.learnMore;
    const links = data.sourceLinks;
    const name = place.name || place.title || "";
    if (name.includes("Gateway")) return links.gatewayArch.url;
    if (name.includes("Notre")) return links.notreDame.url;
    if (name.includes("Studebaker")) return links.studebaker.url;
    if (name.includes("Dunes")) return links.indianaDunes.url;
    if (name.includes("Mackinac")) return links.mackinacBridge.url;
    if (name.includes("Plaunt")) return links.ferry.url;
    return links.boisBlanc.url;
  }

  function sourceLabelForPlace(place) {
    return place.source?.label || place.sourceLabel || "Learn More";
  }

  function fallbackImageForPlace(place) {
    const title = escapeHtml(place.name || "Trip stop");
    const subtitle = escapeHtml(place.place || "Route discovery");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
        <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#1f4f3a"/><stop offset="1" stop-color="#f7efd9"/></linearGradient></defs>
        <rect width="900" height="520" fill="url(#g)"/>
        <circle cx="720" cy="120" r="70" fill="#f2c14e" opacity=".85"/>
        <path d="M 170 330 C 265 230 365 370 485 250" fill="none" stroke="#fffdf7" stroke-width="28" stroke-linecap="round"/>
        <rect x="46" y="348" width="808" height="118" rx="22" fill="rgba(255,253,247,.92)"/>
        <text x="78" y="397" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#17211b">${title}</text>
        <text x="78" y="440" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#536159">${subtitle}</text>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function routeVisualForPlace(place) {
    const imageUrl = place.image?.url || place.imageUrl || (typeof place.image === "string" ? place.image : "");
    if (imageUrl) return imageUrl;
    const name = place.name || place.title || "Trip stop";
    const title = name.replace(" / ", "\n").replace(" National Historical Park", "").replace(" Transportation", "");
    const subtitle = place.place || "Trip stop";
    const kind = name.includes("Notre") ? "campus" :
      name.includes("Studebaker") ? "vehicles" :
      name.includes("Dunes") ? "dunes" :
      name.includes("Mackinac") ? "bridge" :
      name.includes("Plaunt") ? "ferry" :
      name.includes("Gateway") ? "arch" : "history";
    const palette = {
      campus: ["#174a7c", "#f6d483", "M 190 330 L 300 210 L 410 330 Z M 245 330 V 250 H 355 V 330"],
      vehicles: ["#284f3b", "#e9b44c", "M 160 315 H 440 L 405 250 H 235 Z M 210 330 a 28 28 0 1 0 1 0 M 390 330 a 28 28 0 1 0 1 0"],
      dunes: ["#2b6f7f", "#f3d28a", "M 0 335 C 120 260 235 355 360 290 S 520 285 600 225 V 420 H 0 Z"],
      bridge: ["#1f4f3a", "#8bc0d6", "M 85 330 H 515 M 160 330 V 180 M 440 330 V 180 M 160 190 C 255 250 345 250 440 190"],
      ferry: ["#205f86", "#f4f0df", "M 135 300 H 465 L 430 350 H 170 Z M 190 265 H 380 V 300 H 190 Z"],
      arch: ["#244d66", "#d7dde3", "M 185 340 C 210 125 390 125 415 340 M 225 340 C 250 205 350 205 375 340"],
      history: ["#5b4aa0", "#f4d7a1", "M 190 170 H 410 V 340 H 190 Z M 230 220 H 370 M 230 260 H 370 M 230 300 H 335"]
    }[kind];
    const [bg, accent, path] = palette;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
        <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#f9f5e8"/></linearGradient></defs>
        <rect width="900" height="520" fill="url(#g)"/>
        <circle cx="720" cy="120" r="70" fill="${accent}" opacity=".85"/>
        <path d="${path}" fill="none" stroke="#fffdf7" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="46" y="348" width="808" height="118" rx="22" fill="rgba(255,253,247,.9)"/>
        <text x="78" y="397" font-family="Arial, sans-serif" font-size="38" font-weight="800" fill="#17211b">${escapeHtml(title)}</text>
        <text x="78" y="440" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#536159">${escapeHtml(subtitle)}</text>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function badgeOwner(profileId = activeProfile) {
    return profileId || "elsie";
  }

  function badgeStore(profileId = activeProfile) {
    ensureCollections();
    state.badges[badgeOwner(profileId)] ||= {};
    return state.badges[badgeOwner(profileId)];
  }

  function canEarnBadge(badge, profileId = activeProfile) {
    return badge.profiles.includes("all") || badge.profiles.includes(profileId);
  }

  function awardBadge(badgeId, context = {}) {
    const badge = data.badgeCatalog.find((item) => item.id === badgeId);
    if (!badge || !canEarnBadge(badge)) return false;
    const store = badgeStore();
    if (store[badgeId]) return false;
    store[badgeId] = { id: badgeId, earnedAt: new Date().toISOString(), context };
    return true;
  }

  function awardByTrigger(trigger, context = {}) {
    data.badgeCatalog
      .filter((badge) => badge.trigger === trigger && canEarnBadge(badge))
      .slice(0, trigger === "manual" ? 0 : 6)
      .forEach((badge) => awardBadge(badge.id, context));
  }

  function badgesForProfile(profileId = activeProfile) {
    const store = badgeStore(profileId);
    return Object.values(store)
      .map((earned) => ({ ...data.badgeCatalog.find((badge) => badge.id === earned.id), ...earned }))
      .filter((badge) => badge.id)
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));
  }

  function upcomingBadges(profileId = activeProfile, limit = 6) {
    const earned = new Set(badgesForProfile(profileId).map((badge) => badge.id));
    return data.badgeCatalog.filter((badge) => canEarnBadge(badge, profileId) && !earned.has(badge.id)).slice(0, limit);
  }

  function renderBadgeShelf(profileId = activeProfile) {
    const earned = badgesForProfile(profileId).slice(0, 6);
    const upcoming = upcomingBadges(profileId, Math.max(0, 6 - earned.length));
    const badges = [...earned, ...upcoming.map((badge) => ({ ...badge, locked: badge.locked, upcoming: true }))];
    return `
      <div class="badge-shelf" aria-label="Badges">
        ${badges.map((badge) => `
          <button type="button" class="badge-pill ${badge.upcoming ? "is-locked" : "is-earned"}" data-badge="${badge.id}" aria-label="${badge.upcoming ? "Upcoming badge" : "Earned badge"}: ${badge.title}">
            <i aria-hidden="true">${badge.upcoming ? "○" : "●"}</i>
            <span>${badge.title}</span>
            <small>${badge.upcoming ? "Upcoming" : badge.category}</small>
          </button>
        `).join("")}
      </div>
    `;
  }

  const adventureBadges = [
    ["mitten-state", "Mitten State", "Trace the trip from the palm to the tip of Michigan.", "state|michigan|welcome|visitor center", 3, "#f2c14e", "mitten"],
    ["great-lakes", "Great Lakes", "Spot stories connected to Michigan, Huron, or the Straits.", "lake|shore|harbor|maritime|straits", 3, "#1f78a4", "waves"],
    ["mackinac-bridge", "Mackinac Bridge", "Find the bridge and Straits stories that connect the peninsulas.", "mackinac bridge|straits of mackinac|bridge", 1, "#244d66", "bridge"],
    ["lighthouse-explorer", "Lighthouse Explorer", "Save or visit lighthouse stops along the water.", "lighthouse|light station", 2, "#205f86", "lighthouse"],
    ["ferry-rider", "Ferry Rider", "Track the ferry pieces of the island arrival.", "ferry|plaunt|boat|dock", 1, "#163f33", "ferry"],
    ["sand-dune-explorer", "Sand Dune Explorer", "Catch a dunes stop or shoreline sand story.", "dune|sand", 1, "#d6a84f", "dune"],
    ["waterfall-hunter", "Waterfall Hunter", "Find a falls or rushing-water stop.", "waterfall|falls|river", 1, "#2b8da8", "falls"],
    ["white-pine", "White Pine", "Notice Michigan forest and nature stops.", "pine|forest|nature|woods|trail", 2, "#2f7d5f", "pine"],
    ["cider-donuts", "Cider & Donuts", "Save a Michigan treat, market, or farm stop.", "cider|donut|farm|market|orchard", 1, "#bd5a36", "donut"],
    ["fudge-finder", "Fudge Finder", "Find a fudge or sweets stop near the island route.", "fudge|candy|sweet|ice cream", 1, "#7c4f3a", "fudge"],
    ["food-stop", "Food Stop", "Save real food stops on the route.", "food|restaurant|diner|cafe|market|grill", 2, "#c65c35", "food"],
    ["museum-explorer", "Museum Explorer", "Open, save, or visit museum stops.", "museum|library|hall of fame", 3, "#174a7c", "museum"],
    ["roadside-oddity", "Roadside Oddity", "Find something weird, giant, tiny, or unexpected.", "oddity|big things|world's largest|quirky|unusual", 1, "#8c5bb0", "spark"],
    ["state-capitol", "State Capitol", "Connect the route to a capitol or government story.", "capitol|statehouse|government", 1, "#5b4aa0", "capitol"],
    ["sports-fan", "Sports Fan", "Find a sports, stadium, racing, or hall-of-fame stop.", "sports|baseball|football|basketball|speedway|stadium|hall of fame", 2, "#cb7a2d", "ball"],
    ["island-explorer", "Island Explorer", "Save or visit Bois Blanc island discoveries.", "bois blanc|island|pointe aux pins", 3, "#2f7d5f", "island"],
    ["dark-sky-observer", "Dark Sky Observer", "Use the sky and stargazing layer during the trip.", "dark sky|stars|observatory|night sky|astronomy", 1, "#26385f", "stars"],
    ["nature-explorer", "Nature Explorer", "Collect parks, preserves, trails, and outdoor stops.", "park|nature|trail|preserve|wildlife|garden", 4, "#4d8b52", "leaf"],
    ["historic-fort", "Historic Fort", "Find forts, old buildings, and historic sites.", "fort|historic|history|heritage", 2, "#7c5d3a", "fort"],
    ["photo-memory", "Photo Memory", "Capture a trip photo and save it to the journal.", "photo|camera|scenic|view|lookout", 1, "#1f78a4", "camera"]
  ].map(([id, title, description, match, required, color, icon]) => ({ id, title, description, match, required, color, icon }));

  function visibleAdventureBadges() {
    if (activeProfile !== "elsie") return adventureBadges;
    const mature = {
      "roadside-oddity": ["Oddity Collector", "Find 3 genuinely unusual stops.", 3],
      "historic-fort": ["Story Hunter", "Save 3 places with a story worth retelling.", 3],
      "great-lakes": ["Lake Effect", "Explore 3 Great Lakes locations.", 3],
      "lighthouse-explorer": ["Lighthouse Files", "Visit or save 3 lighthouse locations.", 3],
      "sand-dune-explorer": ["Dunes Discovered", "Visit Indiana Dunes.", 1],
      "island-explorer": ["Island Arrival", "Reach Bois Blanc Island.", 1]
    };
    return adventureBadges.filter((badge) => mature[badge.id]).map((badge) => {
      const [title, description, required] = mature[badge.id];
      return { ...badge, title, description, required };
    });
  }

  function relatedStopsForAdventureBadge(badge, limit = 12) {
    const pattern = new RegExp(badge.match, "i");
    return allAttractions().filter((item) => pattern.test(`${item.title} ${item.category} ${item.routeSegment} ${item.summary} ${item.why}`)).slice(0, limit);
  }

  function adventureBadgeProgress(badge) {
    const related = relatedStopsForAdventureBadge(badge, 999);
    const relatedKeys = new Set(related.map(stopKey));
    const saved = Object.values(state.shortlist || {}).filter((item) => (activeProfile !== "elsie" || item.profile === "elsie") && related.some((stop) => stop.title === item.name || stop.name === item.name)).length;
    const visited = Object.entries(state.visitedStops || {}).filter(([key, item]) => relatedKeys.has(key) && (activeProfile !== "elsie" || item.profile === "elsie")).length;
    const photoCount = badge.id === "photo-memory" ? (state.journal || []).length + (state.captures || []).length : 0;
    const count = Math.max(saved, visited, photoCount);
    const value = clamp(count, 0, badge.required);
    return { value, total: badge.required, pct: Math.round((value / badge.required) * 100), earned: value >= badge.required, related };
  }

  function badgeDoodleSvg(badge, progress) {
    const color = badge.color || "#1f78a4";
    const fill = progress.earned ? color : "#fffdf7";
    const ink = progress.earned ? "#fffdf7" : color;
    const shape = {
      mitten: "M30 58 C20 47 18 28 31 18 C42 9 52 18 52 31 L52 14 C52 8 62 8 63 15 L67 48 C68 62 42 70 30 58 Z",
      waves: "M13 43 C24 32 36 54 47 43 S70 54 81 43 M13 58 C24 47 36 69 47 58 S70 69 81 58",
      bridge: "M11 61 H85 M20 61 V31 M76 61 V31 M20 34 C36 48 60 48 76 34",
      lighthouse: "M35 76 H61 L55 20 H41 Z M38 20 H58 L54 10 H42 Z M33 76 H63",
      ferry: "M17 51 H79 L70 68 H26 Z M30 37 H62 V51 H30 Z",
      dune: "M12 63 C28 38 47 67 62 46 C70 36 78 35 86 39 V72 H12 Z",
      falls: "M24 19 H73 V39 C65 43 62 49 62 62 C52 52 43 50 35 63 C34 48 30 40 24 36 Z",
      pine: "M48 12 L25 43 H38 L20 64 H42 V78 H54 V64 H76 L58 43 H71 Z",
      donut: "M48 20 A28 28 0 1 1 47 20 M48 37 A11 11 0 1 0 49 37",
      fudge: "M21 46 L33 28 H75 L64 68 H24 Z",
      food: "M34 18 V72 M27 18 V35 M41 18 V35 M63 18 C76 28 72 46 62 49 V72",
      museum: "M16 32 L48 13 L80 32 Z M23 37 H73 M28 37 V72 M43 37 V72 M58 37 V72 M19 72 H77",
      spark: "M48 11 L55 37 L82 42 L58 56 L63 83 L48 61 L31 83 L37 56 L14 42 L41 37 Z",
      capitol: "M21 75 H75 M27 70 V42 H69 V70 M34 42 C37 25 59 25 62 42 M39 24 H57 M48 14 V24",
      ball: "M48 17 A31 31 0 1 1 47 17 M22 48 C35 40 61 40 74 48 M48 17 C38 31 38 65 48 79 M48 17 C58 31 58 65 48 79",
      island: "M15 62 C30 45 47 56 58 42 C69 30 80 43 85 62 Z M34 42 C37 27 51 24 60 18 M49 38 C52 30 54 22 53 13",
      stars: "M28 30 L33 43 L47 47 L34 53 L29 66 L23 53 L10 48 L24 43 Z M66 16 L70 27 L82 31 L71 37 L67 48 L61 37 L50 32 L62 27 Z",
      leaf: "M20 61 C22 28 53 18 78 18 C78 46 60 72 28 72 M28 72 C42 54 54 45 78 18",
      fort: "M19 75 V28 H31 V18 H43 V28 H55 V18 H67 V28 H79 V75 Z M39 75 V54 H59 V75",
      camera: "M20 34 H35 L40 25 H58 L63 34 H78 V72 H20 Z M49 43 A12 12 0 1 1 48 43"
    }[badge.icon] || "M18 48 A30 30 0 1 1 17 48";
    return `
      <svg class="badge-doodle-svg" viewBox="0 0 96 96" aria-hidden="true">
        <rect x="8" y="8" width="80" height="80" rx="22" fill="${fill}" stroke="${color}" stroke-width="4" stroke-dasharray="7 4"/>
        <path d="${shape}" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  function renderTopBadgePreview() {
    const container = byId("topBadgePreview");
    if (!container) return;
    const badges = visibleAdventureBadges().map((badge) => ({ ...badge, progress: adventureBadgeProgress(badge) }));
    container.innerHTML = `
      <div class="adventure-badge-tray" aria-label="Trip badges">
        ${badges.map((badge) => `
          <button type="button" class="adventure-badge ${badge.progress.earned ? "is-earned" : "is-progress"}" data-adventure-badge="${badge.id}" title="${escapeHtml(`${badge.title}: ${badge.progress.value}/${badge.progress.total}. ${badge.description}`)}" aria-label="${escapeHtml(badge.title)} badge, ${badge.progress.value} of ${badge.progress.total}">
            ${badgeDoodleSvg(badge, badge.progress)}
            <span>${escapeHtml(badge.title)}</span>
            <small>${badge.progress.value}/${badge.progress.total}</small>
            <i style="width:${badge.progress.pct}%"></i>
          </button>
        `).join("")}
      </div>
    `;
  }

  function showAdventureBadgeDetail(badgeId) {
    const badge = visibleAdventureBadges().find((item) => item.id === badgeId) || adventureBadges.find((item) => item.id === badgeId);
    if (!badge) return;
    const progress = adventureBadgeProgress(badge);
    modalReturnFocus = document.activeElement;
    document.getElementById("badgeDetailOverlay")?.remove();
    const overlay = document.createElement("div");
    overlay.id = "badgeDetailOverlay";
    overlay.className = "app-modal";
    overlay.innerHTML = `
      <div class="app-modal-card badge-detail-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(badge.title)}">
        <button type="button" class="modal-close" data-close-modal>Close</button>
        <div class="badge-detail-head">
          ${badgeDoodleSvg(badge, progress)}
          <div>
            <p class="eyebrow">${progress.earned ? "Earned" : "Badge progress"}</p>
            <h3>${escapeHtml(badge.title)}</h3>
            <p>${escapeHtml(badge.description)}</p>
          </div>
        </div>
        <div class="badge-progress-line"><span style="width:${progress.pct}%"></span></div>
        <p><strong>How to earn:</strong> Save or visit ${progress.total} related ${progress.total === 1 ? "stop" : "stops"}. Current progress: ${progress.value}/${progress.total}.</p>
        <div class="badge-related-list">
          ${progress.related.slice(0, 5).map((item) => `
            <article>
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.category)} · ${escapeHtml(item.routeSegment || "Route")}</small>
              <div class="compact-actions">
                <button type="button" data-stop-detail="${escapeHtml(item.title)}">View</button>
                <button type="button" data-route-stop="${escapeHtml(item.title)}">Route</button>
                <a class="external-link" href="${sourceLinkForPlace(item)}" target="_blank" rel="noopener">Learn More</a>
              </div>
            </article>
          `).join("") || "<p>No matching route stops yet.</p>"}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add("modal-open");
    overlay.querySelector("button")?.focus();
  }

  function adventureBadgeHoverText(badgeId) {
    const badge = visibleAdventureBadges().find((item) => item.id === badgeId) || adventureBadges.find((item) => item.id === badgeId);
    if (!badge) return "";
    const progress = adventureBadgeProgress(badge);
    return `${badge.title}: ${progress.value}/${progress.total}. ${badge.description}`;
  }

  function closeBadgeModal() {
    document.getElementById("badgeDetailOverlay")?.remove();
    document.body.classList.remove("modal-open");
    if (modalReturnFocus?.focus) modalReturnFocus.focus();
    modalReturnFocus = null;
  }

  function showBadgeDetail(badgeId) {
    const badge = data.badgeCatalog.find((item) => item.id === badgeId);
    if (!badge) return;
    const earned = badgeStore()[badgeId];
    const profile = currentProfile();
    const includeProfile = profile.id === "momdad";
    document.getElementById("badgeDetailOverlay")?.remove();
    const overlay = document.createElement("div");
    overlay.id = "badgeDetailOverlay";
    overlay.className = "app-modal";
    overlay.innerHTML = `
      <div class="app-modal-card" role="dialog" aria-modal="true" aria-label="${escapeHtml(badge.title)}">
        <button type="button" class="modal-close" data-close-modal>Close</button>
        <p class="eyebrow">${escapeHtml(badge.category || "Badge")}</p>
        <h3>${escapeHtml(badge.title)}</h3>
        <p>${escapeHtml(earned ? badge.earned : badge.locked)}</p>
        <p>${earned ? `Earned ${new Date(earned.earnedAt).toLocaleString()}.` : "Not earned yet. Complete the action or learn about the place to unlock it."}</p>
        ${includeProfile ? `<p><strong>Profile:</strong> ${escapeHtml(profile.name)}</p>` : ""}
        <div class="action-row">
          ${badge.sourceUrl ? `<a class="external-link" href="${badge.sourceUrl}" target="_blank" rel="noopener">Learn More</a>` : ""}
          <button type="button" data-close-modal>Done</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function saveShortlist(item) {
    ensureCollections();
    const key = `${activeProfile}:${item.name || item}:${selectedDayDate()}`;
    state.shortlist[key] = {
      name: item.name || item,
      category: item.category || "Trip item",
      profile: activeProfile,
      date: selectedDayDate(),
      sourceUrl: item.sourceUrl || "",
      addedAt: new Date().toISOString()
    };
    awardBadge("trip-shortlist-starter");
    saveState();
    updateHomeGpsLayer();
    const radar = byId("elsieRadar");
    if (radar && activeProfile === "elsie") radar.outerHTML = renderElsieRadarMarkup();
    if (activeProfile === "elsie") renderTopBadgePreview();
    renderBottomDrawer();
    if (["rewards", "memories"].includes(activePage)) renderProfile();
    setAction(`Saved to Trip Shortlist: ${item.name || item}.`);
  }

  function markStopVisited(name) {
    const stop = attractionForName(name);
    if (!stop) return;
    state.visitedStops[stopKey(stop)] = {
      name: stop.title || stop.name,
      category: stop.category,
      sourceUrl: sourceLinkForPlace(stop),
      visitedAt: new Date().toISOString(),
      profile: activeProfile,
      lat: stop.lat,
      lon: stop.lon
    };
    if (Number.isFinite(stop.lat) && Number.isFinite(stop.lon)) {
      addBreadcrumb({ lat: stop.lat, lon: stop.lon }, "stop-visited", null, `Visited ${stop.title || stop.name}`);
    }
    if (/indiana dunes/i.test(stop.title || stop.name)) {
      state.completedStops["indiana-dunes"] = true;
      state.initialLegDistanceMeters = null;
    }
    awardByTrigger("activity", { title: stop.title || stop.name });
    saveState();
    renderHomeMapPanel();
    renderBottomDrawer();
    if (["memories", "rewards"].includes(activePage)) renderProfile();
    setAction(`Marked visited: ${stop.title || stop.name}.`);
  }

  function removeShortlist(key) {
    delete state.shortlist[key];
    saveState();
    renderProfile();
    setAction("Removed from Trip Shortlist.");
  }

  function familyVote(itemName, choice) {
    const key = `${selectedDayDate()}:${itemName}`;
    state.votes[key] ||= {};
    state.votes[key][activeProfile] = { choice, at: new Date().toISOString() };
    awardBadge("family-vote-starter");
    if (activeProfile === "jules") awardBadge("captain-choice");
    saveState();
    if (activePage === "rewards") renderProfile();
    setAction(`Family Vote saved: ${choice}.`);
  }

  function approvePlan(name) {
    const key = `${selectedDayDate()}:${name}`;
    if (!state.approved.includes(key)) state.approved.push(key);
    awardBadge("plan-approved");
    awardBadge("logistics-captain");
    if (name.toLowerCase().includes("ferry")) awardBadge("ferry-ready");
    saveState();
    if (activePage === "rewards") renderProfile();
    setAction(`Approved into the real plan: ${name}.`);
  }

  function completeActivity(title) {
    const key = `${activeProfile}:${title}`;
    if (!state.completed.some((item) => item.activityKey === key)) {
      state.completed.push({ activityKey: key, activityTitle: title, profile: activeProfile, date: selectedDayDate(), at: new Date().toISOString() });
    }
    awardByTrigger("activity", { title });
    const lower = title.toLowerCase();
    if (lower.includes("animal") || lower.includes("wildlife") || lower.includes("gecko")) awardBadge(activeProfile === "jules" ? "big-machine-spotter" : "wildlife-watcher");
    if (lower.includes("fact") || lower.includes("history") || lower.includes("timeline")) awardBadge(activeProfile === "katrina" ? "hidden-fact-hunter" : "teacher-fact-builder");
    if (lower.includes("detail") || lower.includes("shiny") || lower.includes("treasure")) awardBadge("tiny-treasure-scout");
    if (lower.includes("daily") || lower.includes("life") || lower.includes("community")) awardBadge("real-life-explorer");
    saveState();
    if (["today", "learn", "rewards"].includes(activePage)) renderProfile();
    setAction(`Completed ${title}.`);
  }

  function deleteCapture(index) {
    state.captures.splice(index, 1);
    saveState();
    render();
  }

  function requestDeletePhoto(collection, id) {
    state.pendingDelete = { collection, id };
    saveState();
    renderProfile();
  }

  function cancelDeletePhoto() {
    state.pendingDelete = null;
    saveState();
    renderProfile();
  }

  function confirmDeletePhoto(collection, id) {
    if (collection === "draft") state.draftPhotos = state.draftPhotos.filter((item) => item.id !== id);
    if (collection === "journal") state.journal = state.journal.filter((item) => item.id !== id);
    if (collection === "capture") state.captures = state.captures.filter((item, index) => (item.id || String(index)) !== id);
    state.pendingDelete = null;
    saveState();
    render();
    setAction("Photo removed.");
  }

  function startCapture(label, analyze = false) {
    state.pendingCaptureLabel = label;
    state.pendingAnalyze = analyze;
    saveState();
    byId("captureInput").click();
  }

  async function analyzePhotoEntry(entry) {
    const response = await fetch("/api/analyze-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageDataUrl: entry.dataUrl,
        mimeType: entry.type,
        profile: currentProfile().name,
        tripContext: "Family road trip learning hub from Olathe, Kansas to South Bend, Cheboygan, and Bois Blanc Island."
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Image analysis unavailable");
    return payload;
  }

  function wireCaptureInput() {
    byId("captureInput").addEventListener("change", () => {
      const files = Array.from(byId("captureInput").files || []).slice(0, 3);
      if (!files.length) return;
      let remaining = files.length;
      files.forEach((file) => {
        if (file.size > 4500000) {
          state.actionMessage = "That file is too large for offline storage. Try a smaller photo or shorter clip.";
          remaining -= 1;
          if (!remaining) render();
          return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
          const entry = {
            id: makeId("photo"),
            profile: activeProfile,
            date: selectedDayDate(),
            label: state.pendingCaptureLabel || "Trip capture",
            name: file.name,
            type: file.type || "file",
            dataUrl: reader.result,
            gps: state.lastPosition ? { ...state.lastPosition } : null,
            nearest: nearestAttractions(state.lastPosition, 1)[0]?.title || "",
            at: new Date().toISOString(),
            notes: ""
          };
          if (state.pendingAnalyze && entry.type.startsWith("image/")) {
            entry.status = "Ready to analyze";
            entry.notes = "";
            state.draftPhotos.unshift(entry);
            state.actionMessage = "Photo ready. Tap Analyze, then Save.";
          } else {
            state.captures.push(entry);
            state.actionMessage = "Captured to the trip summary on this device.";
          }
          awardBadge("first-photo-captured");
          if (state.phase === "island") awardBadge("first-island-photo");
          if (activeProfile === "eliette") awardBadge("detail-collector");
          remaining -= 1;
          if (!remaining) {
            byId("captureInput").value = "";
            state.pendingAnalyze = false;
            saveState();
            render();
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function draftPhoto(index) {
    ensureCollections();
    return state.draftPhotos[index];
  }

  function analysisViewModel(analysis = {}, profile = currentProfile()) {
    return {
      what: analysis.likelySubject || analysis.whatItIs || analysis.summary || "Photo subject identified after analysis.",
      why: analysis.whyItMatters || analysis.childFriendlyFact || "This connects to the route, place, weather, nature, history, or family story.",
      trip: analysis.tripConnection || "Use this as a route memory and compare it with nearby attractions.",
      kids: analysis.forKids?.[profile.id] || analysis.forKids || analysis.childFriendlyFact || profile.prompts?.[0] || "What do you notice first?",
      fact: analysis.funFact || analysis.childFriendlyFact || "Small details make the best trip memories.",
      tags: Array.isArray(analysis.tags) ? analysis.tags : []
    };
  }

  async function analyzeDraftPhoto(index) {
    const entry = draftPhoto(index);
    if (!entry) return;
    entry.status = "Analyzing...";
    saveState();
    renderProfile();
    try {
      entry.analysis = await analyzePhotoEntry(entry);
      entry.status = "Analyzed";
      awardBadge("first-photo-captured");
      saveState();
      render();
      setAction("Photo analysis complete. Add notes or save to Trip Summary.");
    } catch (error) {
      entry.analysisError = error.message;
      entry.status = "Needs API setup";
      saveState();
      render();
      setAction(`Analysis did not finish: ${error.message}`);
    }
  }

  async function analyzeDraftPhotoById(id) {
    const index = state.draftPhotos.findIndex((item) => item.id === id);
    if (index >= 0) await analyzeDraftPhoto(index);
  }

  function saveDraftPhoto(index) {
    const entry = draftPhoto(index);
    if (!entry) return;
    entry.savedAt = new Date().toISOString();
    entry.status = "Saved";
    state.journal.unshift(entry);
    state.draftPhotos.splice(index, 1);
    awardBadge("first-photo-captured");
    if (state.phase === "island") awardBadge("first-island-photo");
    saveState();
    render();
    setAction("Saved to Trip Summary.");
  }

  function saveDraftPhotoById(id) {
    const index = state.draftPhotos.findIndex((item) => item.id === id);
    if (index >= 0) saveDraftPhoto(index);
  }

  function updateDraftNote(index, value) {
    const entry = draftPhoto(index);
    if (!entry) return;
    entry.notes = value;
    saveState();
  }

  function updateDraftNoteById(id, value) {
    const entry = state.draftPhotos.find((item) => item.id === id);
    if (!entry) return;
    entry.notes = value;
    saveState();
  }

  function updateJournalNote(index, value) {
    const entry = state.journal[index];
    if (!entry) return;
    entry.notes = value;
    saveState();
  }

  function updateJournalNoteById(id, value) {
    const entry = state.journal.find((item) => item.id === id);
    if (!entry) return;
    entry.notes = value;
    saveState();
  }

  function setAction(message) {
    state.actionMessage = message;
    saveState();
    renderTripStatus();
  }

  function setPhase(phase) {
    state.phase = phase;
    if (phase === "outbound") {
      state.startedAt = new Date().toISOString();
      awardBadge("launch-crew");
    }
    if (phase === "island") {
      state.progress = 100;
      awardBadge("island-arrival");
      awardBadge("ferry-crossing-crew");
    }
    if (phase === "return") {
      state.returnStartedAt = new Date().toISOString();
      awardBadge("homeward-bound");
      awardBadge("ferry-return-ready");
    }
    if (phase === "complete") {
      awardBadge("full-route-complete");
    }
    saveState();
    render();
  }

  function updatePosition(position) {
    const now = Date.now();
    if (now - lastGpsRender < 5000) return;
    lastGpsRender = now;
    const point = { lat: position.coords.latitude, lon: position.coords.longitude };
    const destination = activeDestination();
    const shouldRefreshRoute = routeShouldRefresh(point);
    state.lastPosition = { lat: point.lat, lon: point.lon, accuracy: position.coords.accuracy, updatedAt: new Date().toISOString() };
    state.gpsStatus = "Active";
    state.trackingStatus = `Active - ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    maybeRecordBreadcrumb(point, position.coords.accuracy);
    refreshElsieEtaPill();
    state.destinationStatus = `${destination.label} · ${position.coords.accuracy > 100 ? "GPS signal is weak" : "GPS active"}`;
    renderHomeMapPanel();
    renderRouteMapPanel();
    renderExploreMapPanel();
    offerNearbyBadges(point);
    saveState();
    renderTripStatus();
    if (activeProfile !== "elsie") refreshGpsWeatherIfNeeded();
    if (shouldRefreshRoute) refreshActiveRoute();
  }

  function offerNearbyBadges(point) {
    const nearby = nearestAttractions(point, 1)[0];
    if (nearby && nearby.distance < 10) state.nearbyBadgeMessage = `Nearby learning stop: ${nearby.title || nearby.name}`;
  }

  function useLocation() {
    if (!navigator.geolocation) {
      state.gpsStatus = "Error";
      state.trackingStatus = "GPS unavailable";
      saveState();
      render();
      return;
    }
    if (watchId !== null) {
      setAction("Live trip tracking is already active.");
      return;
    }
    state.gpsStatus = "Requesting";
    state.trackingStatus = "Requesting permission";
    saveState();
    renderTripStatus();
    watchId = navigator.geolocation.watchPosition(updatePosition, () => {
      state.gpsStatus = "Error";
      state.trackingStatus = "Permission denied or unavailable";
      watchId = null;
      saveState();
      render();
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  }

  function stopLocation() {
    if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    state.gpsStatus = "Off";
    state.trackingStatus = "Off";
    saveState();
    render();
  }

  function routePlan() {
    const stops = data.route.coordinates;
    if (state.phase === "return" || selectedDayDate() === "2026-08-08") {
      return {
        origin: { label: "Cheboygan", location: { lat: stops.cheboygan.lat, lon: stops.cheboygan.lon } },
        destination: { label: "Olathe", location: { lat: stops.start.lat, lon: stops.start.lon } },
        waypoints: [
          { label: "Merrillville", location: { lat: stops.merrillville.lat, lon: stops.merrillville.lon } }
        ]
      };
    }
    if (selectedDayDate() === "2026-07-31") {
      return {
        origin: { label: "Olathe", location: { lat: stops.start.lat, lon: stops.start.lon } },
        destination: { label: "Merrillville Overnight", location: { lat: stops.merrillville.lat, lon: stops.merrillville.lon } },
        waypoints: [
          { label: "Columbia", location: { lat: stops.columbia.lat, lon: stops.columbia.lon } },
          { label: "St. Louis", location: { lat: stops.stLouis.lat, lon: stops.stLouis.lon } },
          { label: "Indianapolis", location: { lat: stops.indianapolis.lat, lon: stops.indianapolis.lon } }
        ]
      };
    }
    if (selectedDayDate() === "2026-08-01") {
      return {
        origin: { label: "Merrillville Overnight", location: { lat: stops.merrillville.lat, lon: stops.merrillville.lon } },
        destination: { label: "Plaunt ferry", location: { lat: stops.cheboygan.lat, lon: stops.cheboygan.lon } },
        waypoints: [
          ...(state.includeIndianaDunes && !state.completedStops["indiana-dunes"] ? [{ label: "Indiana Dunes", location: { lat: stops.indianaDunes.lat, lon: stops.indianaDunes.lon } }] : []),
          { label: "Grand Rapids", location: { lat: stops.grandRapids.lat, lon: stops.grandRapids.lon } },
          { label: "Grayling", location: { lat: stops.grayling.lat, lon: stops.grayling.lon } }
        ]
      };
    }
    return {
      origin: { label: "Olathe", location: { lat: stops.start.lat, lon: stops.start.lon } },
      destination: { label: "Plaunt ferry", location: { lat: stops.cheboygan.lat, lon: stops.cheboygan.lon } },
      waypoints: [
        { label: "Merrillville", location: { lat: stops.merrillville.lat, lon: stops.merrillville.lon } },
        { label: "Grand Rapids", location: { lat: stops.grandRapids.lat, lon: stops.grandRapids.lon } }
      ]
    };
  }

  function renderRouteMapPanel() {
    const container = byId("routeMapPanel");
    if (!container) return;
    const mapMode = byId("mapMode");
    if (mapMode) mapMode.textContent = state.lastPosition ? "Open map with live GPS active" : "Open map; tap Start GPS to show your location";
    if (!window.maplibregl) {
      container.innerHTML = `
        <div class="map-fallback">
          <strong>Loading map</strong>
          <p>The full map loads only when this page is open so the rest of the app stays fast. Phone-map buttons still work immediately.</p>
          <div class="route-steps"><span>Olathe</span><span>South Bend</span><span>Cheboygan ferry</span><span>Bois Blanc Island</span></div>
          <div class="action-row"><a class="external-link" href="${activeRouteUrl()}" target="_blank" rel="noopener">Open driving route</a><a class="external-link" href="${data.mapLinks.returnUrl}" target="_blank" rel="noopener">Open return route</a></div>
        </div>
      `;
      loadMapLibre();
      return;
    }
    container.innerHTML = `<div id="mapLibreCanvas" class="maplibre-canvas" role="img" aria-label="Open trip map"></div>`;
    drawRouteMap();
  }

  function formatRouteDuration(seconds) {
    const minutes = Math.max(0, Math.round(Number(seconds || 0) / 60));
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
  }

  function elsieHeaderCopy() {
    const target = getActiveTripTarget();
    if (state.phase === "return" || state.tripLeg === "return") return ["HOMEWARD", "One long road back to Olathe"];
    if (state.phase === "pretrip") return ["ELSIE'S ROUTE", "Merrillville first, Indiana Dunes next, then the ferry"];
    return [`${target.label.toUpperCase()} IS NEXT`, target === data.route.destinationTargets.indianaDunes ? "Dunes, wetlands, forest, then north to the ferry" : "Live route context without the clutter"];
  }

  function elsieRouteTrackerMarkup() {
    const target = getActiveTripTarget();
    const route = currentRouteResult();
    const miles = route.distanceMeters ? Math.round(route.distanceMeters / 1609.344) : target.plannedMiles;
    const progress = state.initialLegDistanceMeters && route.distanceMeters ? clamp((1 - route.distanceMeters / state.initialLegDistanceMeters) * 100, 0, 100) : progressForPhase();
    const status = route.isFallback ? (route.source === "planned" ? "PLANNED" : "CACHED") : route.isLive ? "LIVE" : "ROAD ROUTE";
    const updated = route.calculatedAt ? new Date(route.calculatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "not yet";
    return `
      <section id="elsieRouteTracker" class="elsie-route-tracker" aria-label="Elsie route and ETA">
        <div class="elsie-route-heading"><span>NEXT: ${escapeHtml(target.label)}</span><b>${status}</b></div>
        <div class="elsie-route-metrics" aria-live="polite"><strong>${formatRouteDuration(route.durationSeconds)}</strong><span>${Number(miles || 0).toLocaleString()} miles</span></div>
        <p>${routeArrivalText(route, target)}</p>
        <div class="elsie-progress" role="progressbar" aria-label="Active route progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}"><span style="width:${progress}%"></span></div>
        <small>${escapeHtml(state.gpsStatus || "GPS off")} · ETA updated ${updated} · ${escapeHtml(route.source || "planned")}</small>
        <div class="elsie-tracker-actions">
          ${watchId === null ? `<button type="button" data-start-gps="true">Start Live Trip</button>` : `<button type="button" data-stop-gps>Stop Tracking</button>`}
          <button type="button" data-refresh-route>Refresh ETA</button>
          <a href="${googleMapsNavigationUrl(target)}" target="_blank" rel="noopener">Navigate</a>
        </div>
        ${selectedDayDate() === "2026-08-01" || state.tripLeg === "day2" ? `<label class="dunes-toggle"><input type="checkbox" data-include-dunes ${state.includeIndianaDunes ? "checked" : ""}> Include Indiana Dunes</label>` : ""}
      </section>`;
  }

  function renderElsieRouteTracker() {
    const current = byId("elsieRouteTracker");
    if (!current || activeProfile !== "elsie") return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = elsieRouteTrackerMarkup();
    current.replaceWith(wrapper.firstElementChild);
  }

  function elsieRadarLabel(item) {
    const text = `${item.title} ${item.category} ${item.summary} ${item.why}`.toLowerCase();
    if (/animal|wildlife|habitat|zoo|bird/.test(text)) return "ANIMAL WATCH";
    if (/prison|fort|historic|history|shipwreck/.test(text)) return "STRANGE HISTORY";
    if (/odd|weird|largest|unusual/.test(text)) return "WEIRD STOP";
    if (/mystery|legend|underground|ghost/.test(text)) return "MYSTERY";
    return /core|worth/i.test(item.tier || "") ? "WORTH THE DETOUR" : "BEST STORY";
  }

  function elsieRadarStops() {
    const currentMiles = routeProgressMiles();
    return topAttractionsForPanel(allAttractions().filter((item) => {
      if (isStopVisited(item)) return false;
      if (/wisconsin/i.test(`${item.routeSegment} ${item.place}`)) return false;
      if (Number.isFinite(Number(item.milesFromStart)) && Number(item.milesFromStart) + 20 < currentMiles) return false;
      if (!state.includeIndianaDunes && /indiana dunes/i.test(item.title)) return false;
      return true;
    }), "elsie").slice(0, 3);
  }

  function b64encode(str) {
    try { return window.btoa(unescape(encodeURIComponent(str))); }
    catch { return window.btoa(str); }
  }

  function elsieMiniBadgeIcon(badge, progress) {
    const svg = badgeDoodleSvg(badge, progress).replace(
      '<svg class="badge-doodle-svg"',
      '<svg xmlns="http://www.w3.org/2000/svg" class="badge-doodle-svg"'
    );
    const src = `data:image/svg+xml;base64,${b64encode(svg)}`;
    return `<img src="${src}" alt="${escapeHtml(badge.title)}${progress.earned ? " (earned)" : ""}" class="elsie-mini-badge ${progress.earned ? "is-earned" : ""}">`;
  }

  function renderElsieRadarMarkup() {
    const picks = elsieRadarStops();
    const summary = elsieBadgeSummary();
    const trailIcon = `<span class="elsie-mini-badge elsie-mini-badge-emoji ${summary.trail.earned ? "is-earned" : ""}">👣</span>`;
    const icons = summary.items.map(({ badge, progress }) => elsieMiniBadgeIcon(badge, progress)).join("") + trailIcon;
    return `
      <div id="elsieRadar" class="elsie-float-bottom" aria-label="Elsie quick controls">
        <button type="button" class="elsie-chip" data-elsie-sheet="picks">Elsie's Picks · ${picks.length}</button>
      </div>
      <button type="button" class="elsie-badge-tracker" data-elsie-sheet="badges" aria-label="Badges ${summary.earned} of ${summary.total} earned">
        <span class="elsie-badge-tracker-icons">${icons}</span>
        <span class="elsie-badge-tracker-count">${summary.earned}/${summary.total}</span>
      </button>`;
  }


  /* ===================== ELSIE MAP EXPERIENCE ===================== */

  const ELSIE_ICON_OVERRIDES = {
    // "stop-id": "spooky"
  };

  const ELSIE_ICON_TYPES = ["spooky", "strange-history", "weird-stop", "science", "stars", "anime-vibe", "music-energy", "mystery", "animal-watch"];

  function getElsieIconType(stop) {
    if (!stop) return "";
    const override = ELSIE_ICON_OVERRIDES[stop.id] || ELSIE_ICON_OVERRIDES[stop.title];
    if (override) return override;
    const text = `${stop.title || ""} ${stop.category || ""} ${stop.summary || ""} ${stop.why || ""} ${stop.profiles?.elsie || ""}`.toLowerCase();
    if (/ghost|haunt|cemeter|grave|prison|jail|tunnel|eerie|abandon|spirit|spook/.test(text)) return "spooky";
    if (/mystery|legend|secret|unexplained|hidden room|cryptic|lost /.test(text)) return "mystery";
    if (/dark sky|astronom|observator|stargaz|planetari|night sky|\bstar\b/.test(text)) return "stars";
    if (/science|aviation|geolog|engineer|invention|technolog|experiment|weather station/.test(text)) return "science";
    if (/music|opera|concert|sound|record|organ|band/.test(text)) return "music-energy";
    if (/largest|giant|odd|weird|unusual|roadside|novelty|quirk/.test(text)) return "weird-stop";
    if (/wildlife|zoo|wetland|bird|habitat|animal|refuge|aquarium/.test(text)) return "animal-watch";
    if (/fort|battle|\bwar\b|outlaw|frontier|historic|history|heritage/.test(text)) return "strange-history";
    if (/waterfall|falls|dune|lighthouse|bridge|overlook|scenic|vista|shoreline|canyon/.test(text)) return "anime-vibe";
    if (/museum|market|farm|food|restaurant|cafe|orchard|fudge|donut|sport|stadium|capitol|state|park|preserve|library/.test(text)) return "weird-stop";
    return "mystery";
  }

  function elsieIconSvg(type) {
    const base = (fill, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29.5" fill="#fffdf7"/><circle cx="32" cy="32" r="27" fill="${fill}" stroke="#141414" stroke-width="4"/>${inner}</svg>`;
    switch (type) {
      case "spooky": return base("#3a2a54", `<path d="M32 16c-8 0-12 7-12 14v14l4-3 4 3 4-3 4 3 4-3 4 3V30c0-7-4-14-12-14z" fill="#efe6ff" stroke="#141414" stroke-width="3"/><circle cx="27" cy="30" r="2.6" fill="#141414"/><circle cx="37" cy="30" r="2.6" fill="#141414"/><circle cx="27.9" cy="29.1" r="0.9" fill="#fff"/><path d="M45 15a6 6 0 1 0 4 10 8 8 0 0 1-4-10z" fill="#cbb7f2" stroke="#141414" stroke-width="2.5"/>`);
      case "strange-history": return base("#8a5a2b", `<rect x="20" y="18" width="24" height="30" rx="3" fill="#f2e3c2" stroke="#141414" stroke-width="3"/><path d="M24 26h16M24 32h16M24 38h11" stroke="#141414" stroke-width="2.5" stroke-linecap="round"/><path d="M44 18l6-4M44 48l6 4" stroke="#141414" stroke-width="3" stroke-linecap="round"/><circle cx="46" cy="42" r="4.5" fill="#e0aa3e" stroke="#141414" stroke-width="2.5"/>`);
      case "weird-stop": return base("#7a3fa0", `<g transform="rotate(-8 32 32)"><rect x="18" y="22" width="28" height="16" rx="3" fill="#f7c948" stroke="#141414" stroke-width="3"/><path d="M32 38v10" stroke="#141414" stroke-width="4"/><circle cx="32" cy="30" r="5.5" fill="none" stroke="#141414" stroke-width="3"/><circle cx="32" cy="30" r="1.8" fill="#141414"/></g><path d="M50 14l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ff8b3d" stroke="#141414" stroke-width="2"/>`);
      case "science": return base("#0e5e78", `<ellipse cx="32" cy="32" rx="16" ry="6.5" fill="none" stroke="#7ff0ff" stroke-width="3"/><ellipse cx="32" cy="32" rx="16" ry="6.5" transform="rotate(60 32 32)" fill="none" stroke="#7ff0ff" stroke-width="3"/><ellipse cx="32" cy="32" rx="16" ry="6.5" transform="rotate(120 32 32)" fill="none" stroke="#7ff0ff" stroke-width="3"/><circle cx="32" cy="32" r="5" fill="#ffe14d" stroke="#141414" stroke-width="3"/>`);
      case "stars": return base("#141b3f", `<path d="M32 14l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#f4efff" stroke="#141414" stroke-width="2.5"/><circle cx="46" cy="20" r="2" fill="#cfd6ff"/><circle cx="20" cy="44" r="2" fill="#cfd6ff"/><path d="M44 42a7 7 0 1 0 5 11 9 9 0 0 1-5-11z" fill="#c3b6f5" stroke="#141414" stroke-width="2.5"/>`);
      case "anime-vibe": return base("#1c3a63", `<circle cx="32" cy="36" r="10" fill="#ffd24d" stroke="#141414" stroke-width="3"/><path d="M32 18v6M18 36h-6M52 36h-6M22 26l-4-4M42 26l4-4" stroke="#ff5fa2" stroke-width="3.5" stroke-linecap="round"/><path d="M14 47h36" stroke="#66e0ff" stroke-width="4" stroke-linecap="round"/>`);
      case "music-energy": return base("#152417", `<path d="M16 34h4l3-8 4 16 4-22 4 26 4-16 3 4h6" fill="none" stroke="#5dff8a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 18l6-2v8" stroke="#8f7bff" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="43" cy="25" r="3" fill="#8f7bff" stroke="#141414" stroke-width="2"/>`);
      case "mystery": return base("#1a2436", `<circle cx="32" cy="28" r="9" fill="#0e1420" stroke="#d9c069" stroke-width="3"/><path d="M32 28m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0M32 31v8l-3 5h6l-3-5" fill="#d9c069" stroke="#d9c069" stroke-width="1.5"/><circle cx="45" cy="18" r="1.6" fill="#aab6d3"/><circle cx="19" cy="45" r="1.6" fill="#aab6d3"/>`);
      case "animal-watch": return base("#22532f", `<ellipse cx="32" cy="38" rx="7" ry="5.5" fill="#f0dcb4" stroke="#141414" stroke-width="3"/><circle cx="24" cy="28" r="3.4" fill="#f0dcb4" stroke="#141414" stroke-width="2.5"/><circle cx="32" cy="24" r="3.4" fill="#f0dcb4" stroke="#141414" stroke-width="2.5"/><circle cx="40" cy="28" r="3.4" fill="#f0dcb4" stroke="#141414" stroke-width="2.5"/>`);
      default: return base("#1f78a4", `<circle cx="32" cy="32" r="8" fill="#fffdf7" stroke="#141414" stroke-width="3"/>`);
    }
  }

  let elsieIconsRegistered = false;
  function registerElsieIcons(map) {
    if (!map) return Promise.resolve();
    const jobs = ELSIE_ICON_TYPES.map((type) => new Promise((resolve) => {
      const name = `elsie-${type}`;
      if (map.hasImage && map.hasImage(name)) return resolve();
      const image = new Image(64, 64);
      image.onload = () => {
        try { if (!map.hasImage(name)) map.addImage(name, image, { pixelRatio: 2 }); } catch {}
        resolve();
      };
      image.onerror = () => resolve();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(elsieIconSvg(type))}`;
    }));
    return Promise.all(jobs).then(() => { elsieIconsRegistered = true; });
  }

  function elsieStopsFeatureCollection() {
    return {
      type: "FeatureCollection",
      features: allAttractions().map((item) => ({
        type: "Feature",
        properties: {
          id: item.id,
          title: item.title,
          elsieIcon: `elsie-${getElsieIconType(item) || "mystery"}`
        },
        geometry: { type: "Point", coordinates: [item.lon, item.lat] }
      }))
    };
  }

  function addElsieIconLayer(map) {
    if (!map || map.getLayer("elsie-artwork")) return;
    if (!map.getSource("elsie-stops")) {
      map.addSource("elsie-stops", { type: "geojson", data: elsieStopsFeatureCollection() });
    }
    map.addLayer({
      id: "elsie-artwork",
      type: "symbol",
      source: "elsie-stops",
      layout: {
        "icon-image": ["get", "elsieIcon"],
        "icon-size": ["interpolate", ["linear"], ["zoom"], 3, 0.34, 6, 0.5, 9, 0.62, 12, 0.72],
        "icon-allow-overlap": true,
        "icon-ignore-placement": true
      }
    });
    map.on("click", "elsie-artwork", (event) => {
      const item = attractionForIdOrTitle(event.features[0].properties.id, event.features[0].properties.title);
      if (item) openElsieMarkerPopup(map, item, event.features[0].geometry.coordinates);
    });
    map.on("mouseenter", "elsie-artwork", () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "elsie-artwork", () => { map.getCanvas().style.cursor = ""; });
  }

  const ELSIE_ICON_LABELS = {
    "spooky": "Spooky",
    "strange-history": "Strange History",
    "weird-stop": "Weird Stop",
    "science": "Science",
    "stars": "Stars",
    "anime-vibe": "Anime Vibe",
    "music-energy": "Music Energy",
    "mystery": "Mystery",
    "animal-watch": "Animal Watch"
  };

  let elsieMarkerPopup = null;

  function openElsieMarkerPopup(map, rawItem, coordinates) {
    const item = enrichStop(rawItem);
    const iconType = getElsieIconType(item);
    const label = ELSIE_ICON_LABELS[iconType] || "Worth the Detour";
    const link = item.learn_more || item.official_website || sourceLinkForPlace(item);
    if (elsieMarkerPopup) elsieMarkerPopup.remove();
    elsieMarkerPopup = new maplibregl.Popup({ closeButton: true, maxWidth: "260px", offset: 18, className: "elsie-marker-popup" })
      .setLngLat(coordinates)
      .setHTML(`
        <div class="elsie-popup-card">
          <small>${escapeHtml(label)}</small>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.summary || item.why || "")}</p>
          ${item.profiles?.elsie ? `<p class="elsie-popup-angle">${escapeHtml(item.profiles.elsie)}</p>` : ""}
          <div class="elsie-popup-actions">
            <button type="button" data-shortlist="${escapeHtml(item.title)}" data-category="${escapeHtml(item.category)}" data-url="${sourceLinkForPlace(item)}">${isStopSaved(item) ? "Saved" : "Save"}</button>
            <button type="button" data-visited-stop="${escapeHtml(item.title)}">${isStopVisited(item) ? "Visited" : "Mark visited"}</button>
          </div>
          <div class="elsie-popup-links">
            <a class="external-link" href="${googleMapsNavigationUrl(item)}" target="_blank" rel="noopener">Navigate</a>
            <a class="external-link" href="${link}" target="_blank" rel="noopener">Visit official site</a>
          </div>
        </div>`)
      .addTo(map);
  }

  /* ---------- Weather radar (RainViewer) ---------- */

  const elsieWeatherRadar = { host: "https://tilecache.rainviewer.com", frames: [], lastFetch: 0, frameIndex: 0, animTimer: null };

  function fetchRadarMeta(force = false) {
    const now = Date.now();
    if (!force && now - elsieWeatherRadar.lastFetch < 5 * 60 * 1000 && elsieWeatherRadar.frames.length) return Promise.resolve(elsieWeatherRadar.frames);
    if (document.visibilityState === "hidden") return Promise.resolve(elsieWeatherRadar.frames);
    elsieWeatherRadar.lastFetch = now;
    return fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((response) => response.json())
      .then((meta) => {
        elsieWeatherRadar.host = meta.host || elsieWeatherRadar.host;
        elsieWeatherRadar.frames = (meta.radar?.past || []).slice(-8);
        elsieWeatherRadar.frameIndex = Math.max(0, elsieWeatherRadar.frames.length - 1);
        const latest = elsieWeatherRadar.frames[elsieWeatherRadar.frameIndex];
        if (latest) {
          state.radarCachedFrame = { path: latest.path, time: latest.time, host: elsieWeatherRadar.host };
          saveState();
        }
        return elsieWeatherRadar.frames;
      })
      .catch(() => {
        if (state.radarCachedFrame) {
          elsieWeatherRadar.host = state.radarCachedFrame.host || elsieWeatherRadar.host;
          elsieWeatherRadar.frames = [{ path: state.radarCachedFrame.path, time: state.radarCachedFrame.time }];
          elsieWeatherRadar.frameIndex = 0;
        }
        return elsieWeatherRadar.frames;
      });
  }

  function currentRadarFrame() {
    return elsieWeatherRadar.frames[elsieWeatherRadar.frameIndex] || (state.radarCachedFrame ? { path: state.radarCachedFrame.path, time: state.radarCachedFrame.time } : null);
  }

  function getRadarFrame() { return currentRadarFrame(); }

  function radarTileUrl(frame) {
    return `${elsieWeatherRadar.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
  }

  function firstElsieBaseLayerId(map) {
    if (map.getLayer("elsie-breadcrumb-line")) return "elsie-breadcrumb-line";
    if (map.getLayer("home-clusters")) return "home-clusters";
    return undefined;
  }

  function applyRadarLayer(map = homeMap) {
    if (!map || activeProfile !== "elsie") return;
    const frame = currentRadarFrame();
    if (!frame) return;
    const apply = () => {
      if (map.getLayer("elsie-radar-layer")) map.removeLayer("elsie-radar-layer");
      if (map.getSource("elsie-radar")) map.removeSource("elsie-radar");
      map.addSource("elsie-radar", {
        type: "raster",
        tiles: [radarTileUrl(frame)],
        tileSize: 256,
        attribution: "Radar © RainViewer"
      });
      map.addLayer({
        id: "elsie-radar-layer",
        type: "raster",
        source: "elsie-radar",
        paint: { "raster-opacity": Number(state.radarOpacity) || 0.45 }
      }, firstElsieBaseLayerId(map));
    };
    if (map.isStyleLoaded && !map.isStyleLoaded()) map.once("load", apply);
    else apply();
  }

  function removeRadarLayer(map = homeMap) {
    if (!map) return;
    try {
      if (map.getLayer("elsie-radar-layer")) map.removeLayer("elsie-radar-layer");
      if (map.getSource("elsie-radar")) map.removeSource("elsie-radar");
    } catch {}
  }

  function stopRadarAnimation() {
    if (elsieWeatherRadar.animTimer) window.clearInterval(elsieWeatherRadar.animTimer);
    elsieWeatherRadar.animTimer = null;
  }

  function startRadarAnimation() {
    stopRadarAnimation();
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!state.radarEnabled || !state.radarAnimationEnabled || reduced || document.visibilityState === "hidden") return;
    if (elsieWeatherRadar.frames.length < 2) return;
    elsieWeatherRadar.animTimer = window.setInterval(() => {
      elsieWeatherRadar.frameIndex = (elsieWeatherRadar.frameIndex + 1) % elsieWeatherRadar.frames.length;
      applyRadarLayer();
    }, 700);
  }

  function setRadarEnabled(enabled) {
    state.radarEnabled = Boolean(enabled);
    saveState();
    if (state.radarEnabled) {
      fetchRadarMeta().then(() => {
        applyRadarLayer();
        startRadarAnimation();
      });
    } else {
      stopRadarAnimation();
      removeRadarLayer();
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      stopRadarAnimation();
    } else if (state.radarEnabled && activeProfile === "elsie") {
      fetchRadarMeta().then(() => {
        applyRadarLayer();
        startRadarAnimation();
      });
    }
  });

  const ELSIE_RADAR_STATIONS = [
    { code: "KEAX", name: "Kansas City / Pleasant Hill NEXRAD", lat: 38.8103, lon: -94.2645 },
    { code: "KLSX", name: "St. Louis NEXRAD", lat: 38.6989, lon: -90.6828 },
    { code: "KIND", name: "Indianapolis NEXRAD", lat: 39.7075, lon: -86.2803 },
    { code: "KLOT", name: "Chicago NEXRAD", lat: 41.6045, lon: -88.0847 },
    { code: "KGRR", name: "Grand Rapids NEXRAD", lat: 42.8939, lon: -85.5449 },
    { code: "KAPX", name: "Gaylord NEXRAD", lat: 44.9072, lon: -84.7198 }
  ];

  function syncRadarStationLayer(map = homeMap) {
    if (!map) return;
    const visible = activeProfile === "elsie" && state.radarStationsVisible;
    if (!visible) {
      try { if (map.getLayer("elsie-radar-stations")) map.setLayoutProperty("elsie-radar-stations", "visibility", "none"); } catch {}
      return;
    }
    if (!map.getSource("elsie-radar-stations")) {
      map.addSource("elsie-radar-stations", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: ELSIE_RADAR_STATIONS.map((station) => ({
            type: "Feature",
            properties: { code: station.code, name: station.name },
            geometry: { type: "Point", coordinates: [station.lon, station.lat] }
          }))
        }
      });
      map.addLayer({
        id: "elsie-radar-stations",
        type: "symbol",
        source: "elsie-radar-stations",
        layout: { "text-field": "📡", "text-size": 14, "text-allow-overlap": true }
      });
      map.on("click", "elsie-radar-stations", (event) => {
        const props = event.features[0].properties;
        new maplibregl.Popup({ closeButton: true })
          .setLngLat(event.features[0].geometry.coordinates)
          .setText(`${props.code} · ${props.name} · NOAA/NWS NEXRAD`)
          .addTo(map);
      });
    }
    map.setLayoutProperty("elsie-radar-stations", "visibility", "visible");
  }

  /* ---------- Sasquatch breadcrumb trail ---------- */

  const BREADCRUMB_MAX = 2000;
  const MEANINGFUL_REASONS = ["stop-visited", "waypoint-arrival", "leg-change"];

  function lastBreadcrumb() {
    return state.breadcrumbTrail[state.breadcrumbTrail.length - 1] || null;
  }

  function addBreadcrumb(point, reason, accuracy, label) {
    state.breadcrumbTrail.push({
      id: makeId("crumb"),
      latitude: Number(point.lat.toFixed(5)),
      longitude: Number(point.lon.toFixed(5)),
      recordedAt: new Date().toISOString(),
      tripLeg: state.tripLeg || state.phase || "day1",
      reason,
      accuracy: Number.isFinite(accuracy) ? Math.round(accuracy) : null,
      profile: "elsie",
      label: label || ""
    });
    pruneBreadcrumbs();
    saveState();
    syncBreadcrumbLayers();
  }

  function pruneBreadcrumbs() {
    if (state.breadcrumbTrail.length <= BREADCRUMB_MAX) return;
    const meaningful = state.breadcrumbTrail.filter((crumb) => MEANINGFUL_REASONS.includes(crumb.reason));
    const ordinary = state.breadcrumbTrail.filter((crumb) => !MEANINGFUL_REASONS.includes(crumb.reason));
    const half = Math.floor(ordinary.length / 2);
    const thinnedOld = ordinary.slice(0, half).filter((crumb, index) => index % 2 === 0);
    state.breadcrumbTrail = [...meaningful, ...thinnedOld, ...ordinary.slice(half)]
      .sort((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
  }

  function maybeRecordBreadcrumb(point, accuracy) {
    const last = lastBreadcrumb();
    if (!last) return addBreadcrumb(point, "distance", accuracy);
    const previous = { lat: last.latitude, lon: last.longitude };
    const miles = haversineMiles(previous, point);
    const minutes = (Date.now() - Date.parse(last.recordedAt)) / 60000;
    if (miles >= 1) return addBreadcrumb(point, "distance", accuracy);
    if (minutes >= 10 && miles >= 0.1) return addBreadcrumb(point, "time", accuracy);
  }

  function getBreadcrumbGeoJson() {
    const crumbs = state.breadcrumbTrail;
    return {
      line: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: crumbs.map((crumb) => [crumb.longitude, crumb.latitude]) }
      },
      points: {
        type: "FeatureCollection",
        features: crumbs.map((crumb, index) => ({
          type: "Feature",
          properties: {
            rank: MEANINGFUL_REASONS.includes(crumb.reason) ? 0 : index % 20 === 0 ? 1 : index % 5 === 0 ? 2 : 3,
            reason: crumb.reason,
            label: crumb.label || "",
            recordedAt: crumb.recordedAt,
            tripLeg: crumb.tripLeg
          },
          geometry: { type: "Point", coordinates: [crumb.longitude, crumb.latitude] }
        }))
      }
    };
  }

  function syncBreadcrumbLayers(map = homeMap) {
    if (!map || !map.getStyle) return;
    const visible = activeProfile === "elsie" && state.breadcrumbVisible && state.breadcrumbTrail.length > 0;
    const geo = getBreadcrumbGeoJson();
    try {
      if (!map.getSource("elsie-breadcrumb-line")) {
        if (!map.isStyleLoaded || !map.isStyleLoaded()) return;
        map.addSource("elsie-breadcrumb-line", { type: "geojson", data: geo.line });
        map.addLayer({
          id: "elsie-breadcrumb-line",
          type: "line",
          source: "elsie-breadcrumb-line",
          paint: { "line-color": "#6b4f3a", "line-width": 2, "line-opacity": 0.45, "line-dasharray": [2, 3] }
        }, map.getLayer("home-clusters") ? "home-clusters" : undefined);
        map.addSource("elsie-breadcrumb-steps", { type: "geojson", data: geo.points });
        map.addLayer({
          id: "elsie-breadcrumb-steps",
          type: "symbol",
          source: "elsie-breadcrumb-steps",
          filter: ["<=", ["get", "rank"], ["step", ["zoom"], 1, 7, 2, 10, 3]],
          layout: {
            "text-field": "👣",
            "text-size": ["case", ["==", ["get", "rank"], 0], 16, 11],
            "text-allow-overlap": false
          }
        });
        map.on("click", "elsie-breadcrumb-steps", (event) => {
          const props = event.features[0].properties;
          if (Number(props.rank) !== 0 && map.getZoom() < 9) return;
          const when = new Date(props.recordedAt).toLocaleString([], { weekday: "long", hour: "numeric", minute: "2-digit" });
          const text = props.label ? `${props.label} · ${when}` : `Passed here · ${when} · ${props.tripLeg}`;
          new maplibregl.Popup({ closeButton: true }).setLngLat(event.features[0].geometry.coordinates).setText(text).addTo(map);
        });
      } else {
        map.getSource("elsie-breadcrumb-line").setData(geo.line);
        map.getSource("elsie-breadcrumb-steps").setData(geo.points);
      }
      const visibility = visible ? "visible" : "none";
      map.setLayoutProperty("elsie-breadcrumb-line", "visibility", visibility);
      map.setLayoutProperty("elsie-breadcrumb-steps", "visibility", visibility);
    } catch {}
  }

  function clearBreadcrumbTrail() {
    state.breadcrumbTrail = [];
    saveState();
    syncBreadcrumbLayers();
  }

  function sasquatchTrailProgress() {
    const legs = new Set(state.breadcrumbTrail.map((crumb) => crumb.tripLeg).filter((leg) => ["day1", "day2", "return", "outbound", "island"].includes(leg)));
    const normalized = new Set([...legs].map((leg) => (leg === "outbound" ? "day1" : leg === "island" ? "day2" : leg)));
    const covered = ["day1", "day2", "return"].filter((leg) => normalized.has(leg)).length;
    return { value: covered, total: 3, earned: covered >= 3 };
  }

  /* ---------- Shared bottom sheet ---------- */

  let elsieSheetLastFocus = null;

  function openElsieSheet(type, payload) {
    if (activeProfile !== "elsie") return;
    const sheet = byId("elsieSheet");
    const scrim = byId("elsieSheetScrim");
    if (!sheet) return;
    state.activeElsieSheet = type;
    elsieSheetLastFocus = document.activeElement;
    sheet.innerHTML = renderElsieSheetContent(type, payload);
    sheet.hidden = false;
    if (scrim) scrim.hidden = false;
    sheet.querySelector("button, a, input")?.focus?.();
  }

  function closeElsieSheet() {
    const sheet = byId("elsieSheet");
    const scrim = byId("elsieSheetScrim");
    if (sheet) { sheet.hidden = true; sheet.innerHTML = ""; }
    if (scrim) scrim.hidden = true;
    state.activeElsieSheet = null;
    if (elsieSheetLastFocus?.focus) elsieSheetLastFocus.focus();
    elsieSheetLastFocus = null;
  }

  function elsieSheetHead(title) {
    return `<div class="elsie-sheet-head"><strong>${escapeHtml(title)}</strong><button type="button" data-elsie-close-sheet aria-label="Close sheet">Close</button></div>`;
  }

  function renderElsieSheetContent(type, payload) {
    if (type === "eta") return `${elsieSheetHead("Route + ETA")}${elsieRouteTrackerMarkup()}`;
    if (type === "picks") return renderElsiePicksSheet();
    if (type === "radar") return renderElsieRadarSheet();
    if (type === "badges") return renderElsieBadgeSheet();
    if (type === "breadcrumb") return renderElsieTrailSheet();
    return elsieSheetHead("Elsie");
  }

  function renderElsiePicksSheet() {
    const stops = elsieRadarStops();
    return `${elsieSheetHead("Elsie's Picks")}
      <div class="elsie-picks-list">
        ${stops.length ? stops.map((item) => `<article>
          <small>${elsieRadarLabel(item)}</small><strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.profiles?.elsie || item.summary || "A stop with a story worth retelling.")}</p>
          <div><button type="button" data-preview-stop="${escapeHtml(item.title)}">Preview</button><button type="button" data-shortlist="${escapeHtml(item.title)}" data-category="${escapeHtml(item.category)}" data-url="${sourceLinkForPlace(item)}">${isStopSaved(item) ? "Saved" : "Save"}</button><a href="${googleMapsNavigationUrl(item)}" target="_blank" rel="noopener">Navigate</a></div>
        </article>`).join("") : "<p>No picks ahead on this leg right now.</p>"}
      </div>`;
  }

  function renderElsieRadarSheet() {
    const frame = currentRadarFrame();
    const frameTime = frame ? new Date(frame.time * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "no data yet";
    const opacities = [0, 0.25, 0.45, 0.65];
    return `${elsieSheetHead("Weather radar")}
      <div class="elsie-radar-sheet">
        <label class="elsie-switch"><input type="checkbox" data-radar-toggle ${state.radarEnabled ? "checked" : ""}> Radar on</label>
        <p class="elsie-sheet-meta">Latest frame: ${frameTime}${state.radarEnabled && frame && state.radarCachedFrame && frame.path === state.radarCachedFrame.path && elsieWeatherRadar.frames.length <= 1 ? " · using cached frame" : ""}</p>
        <div class="elsie-opacity-row" role="group" aria-label="Radar opacity">
          ${opacities.map((value) => `<button type="button" data-radar-opacity="${value}" aria-pressed="${Number(state.radarOpacity) === value}">${Math.round(value * 100)}%</button>`).join("")}
        </div>
        <div class="elsie-radar-actions">
          <button type="button" data-radar-anim>${state.radarAnimationEnabled ? "Pause" : "Play"}</button>
          <button type="button" data-radar-refresh>Refresh</button>
        </div>
        <label class="elsie-switch"><input type="checkbox" data-radar-stations ${state.radarStationsVisible ? "checked" : ""}> Show radar stations</label>
        <p class="elsie-sheet-meta">Radar data © RainViewer · Stations: NOAA / NWS NEXRAD</p>
      </div>`;
  }

  function elsieBadgeSummary() {
    const list = visibleAdventureBadges();
    const items = list.map((badge) => ({ badge, progress: adventureBadgeProgress(badge) }));
    const trail = sasquatchTrailProgress();
    const earned = items.filter((entry) => entry.progress.earned).length + (trail.earned ? 1 : 0);
    return { items, trail, earned, total: items.length + 1 };
  }

  function renderElsieBadgeSheet() {
    const summary = elsieBadgeSummary();
    return `${elsieSheetHead(`Badges ${summary.earned}/${summary.total}`)}
      <div class="elsie-badge-list">
        ${summary.items.map(({ badge, progress }) => `
          <article class="${progress.earned ? "is-earned" : ""}">
            <strong>${escapeHtml(badge.title)}</strong>
            <p>${escapeHtml(badge.description || "")}</p>
            <div class="elsie-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${progress.total}" aria-valuenow="${progress.value}" aria-label="${escapeHtml(badge.title)} progress"><span style="width:${progress.pct}%"></span></div>
            <small>${progress.value}/${progress.total}${progress.earned ? " · Earned" : ""}</small>
          </article>`).join("")}
        <article class="${summary.trail.earned ? "is-earned" : ""}">
          <strong>Sasquatch Trail 👣</strong>
          <p>Record breadcrumbs across all three travel legs.</p>
          <div class="elsie-progress" role="progressbar" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${summary.trail.value}" aria-label="Sasquatch Trail progress"><span style="width:${Math.round((summary.trail.value / 3) * 100)}%"></span></div>
          <small>${summary.trail.value}/3 legs${summary.trail.earned ? " · Earned" : ""}</small>
        </article>
      </div>`;
  }

  function renderElsieTrailSheet() {
    const count = state.breadcrumbTrail.length;
    return `${elsieSheetHead("Sasquatch trail")}
      <div class="elsie-trail-sheet">
        <p>${count ? `${count} footprints recorded. A tiny mysterious creature has been following the route.` : "No footprints yet. Start Live Trip and the trail begins."}</p>
        <label class="elsie-switch"><input type="checkbox" data-trail-visible ${state.breadcrumbVisible ? "checked" : ""}> Show trail</label>
        <button type="button" class="elsie-danger" data-trail-clear ${count ? "" : "disabled"}>Clear trail</button>
      </div>`;
  }

  function elsieEtaPillText() {
    const target = getActiveTripTarget();
    const route = currentRouteResult();
    const miles = route.distanceMeters ? Math.round(route.distanceMeters / 1609.344) : target.plannedMiles;
    const status = route.isFallback ? (route.source === "planned" ? "Planned" : "Cached") : route.isLive ? "Live" : "Approximate";
    return `<b>${escapeHtml(target.label)}</b><span>${formatRouteDuration(route.durationSeconds)} · ${Number(miles || 0).toLocaleString()} mi</span><em>${status}</em>`;
  }

  function refreshElsieEtaPill() {
    const pill = byId("elsieEtaPill");
    if (pill) pill.innerHTML = elsieEtaPillText();
  }

  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-elsie-sheet]");
    if (opener) {
      const type = opener.dataset.elsieSheet;
      if (state.activeElsieSheet === type) closeElsieSheet();
      else openElsieSheet(type);
      return;
    }
    if (event.target.closest("[data-elsie-close-sheet]") || event.target.id === "elsieSheetScrim") {
      closeElsieSheet();
      return;
    }
    const opacityButton = event.target.closest("[data-radar-opacity]");
    if (opacityButton) {
      state.radarOpacity = Number(opacityButton.dataset.radarOpacity);
      saveState();
      if (state.radarEnabled && homeMap?.getLayer?.("elsie-radar-layer")) homeMap.setPaintProperty("elsie-radar-layer", "raster-opacity", state.radarOpacity);
      openElsieSheet("radar");
      return;
    }
    if (event.target.closest("[data-radar-refresh]")) {
      fetchRadarMeta(false).then(() => { applyRadarLayer(); openElsieSheet("radar"); });
      return;
    }
    if (event.target.closest("[data-radar-anim]")) {
      state.radarAnimationEnabled = !state.radarAnimationEnabled;
      saveState();
      if (state.radarAnimationEnabled) startRadarAnimation();
      else { stopRadarAnimation(); applyRadarLayer(); }
      openElsieSheet("radar");
      return;
    }
    if (event.target.closest("[data-trail-clear]")) {
      if (window.confirm("Clear the entire Sasquatch trail? This cannot be undone.")) {
        clearBreadcrumbTrail();
        openElsieSheet("breadcrumb");
      }
      return;
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-radar-toggle]")) {
      setRadarEnabled(event.target.checked);
      openElsieSheet("radar");
    }
    if (event.target.matches("[data-radar-stations]")) {
      state.radarStationsVisible = event.target.checked;
      saveState();
      syncRadarStationLayer();
    }
    if (event.target.matches("[data-trail-visible]")) {
      state.breadcrumbVisible = event.target.checked;
      saveState();
      syncBreadcrumbLayers();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.activeElsieSheet) closeElsieSheet();
  });

  /* =================== END ELSIE MAP EXPERIENCE =================== */

  function renderHomeMapPanel() {
    const container = byId("homeRouteMapPanel");
    if (!container) return;
    const attractions = allAttractions();
    const count = byId("mapStopCount");
    if (count) count.textContent = `${attractions.length} stops`;
    const elsie = activeProfile === "elsie";
    const [elsieTitle, elsieSubtitle] = elsieHeaderCopy();
    document.body.classList.toggle("elsie-map-active", elsie);
    container.innerHTML = elsie ? `
      <div class="elsie-map-shell">
        <div id="homeClusterMap" class="home-cluster-map maplibre-canvas elsie-map-canvas" role="application" aria-label="Elsie's route map with ${attractions.length} trip stops">
          <div class="map-fallback">
            <strong>Loading Elsie's map</strong>
            <p>${attractions.length} trip stops are ready.</p>
          </div>
        </div>
        <div class="elsie-float-top">
          <button type="button" id="elsieEtaPill" class="elsie-eta-pill" data-elsie-sheet="eta" aria-haspopup="dialog" aria-label="Route and ETA details">${elsieEtaPillText()}</button>
        </div>
        <div class="elsie-float-right">
          <button type="button" class="elsie-map-fab ${state.radarEnabled ? "is-on" : ""}" data-elsie-sheet="radar" aria-haspopup="dialog" aria-label="Weather radar controls">🌦</button>
          <button type="button" class="elsie-map-fab" data-elsie-sheet="breadcrumb" aria-haspopup="dialog" aria-label="Sasquatch trail controls">👣</button>
        </div>
        ${renderElsieRadarMarkup()}
        <div id="elsieSheetScrim" class="elsie-sheet-scrim" hidden></div>
        <section id="elsieSheet" class="elsie-sheet" role="dialog" aria-modal="true" aria-label="Elsie map sheet" hidden></section>
        <div id="clusterDrawer" class="cluster-drawer" hidden></div>
      </div>
    ` : `
      <div id="homeClusterMap" class="home-cluster-map maplibre-canvas" role="application" aria-label="Explore map with ${attractions.length} uploaded trip stops">
        <div class="map-fallback">
          <strong>Loading explore map</strong>
          <p>${attractions.length} uploaded trip stops are ready. Clusters expand as you zoom in.</p>
        </div>
      </div>
      <div id="homeDomMarkerLayer" class="home-dom-marker-layer" aria-label="Visible stop markers"></div>
      ${renderUploadedStopsPanel(attractions)}
      <div id="clusterDrawer" class="cluster-drawer" hidden></div>
    `;
    if (!window.maplibregl) {
      loadMapLibre();
      return;
    }
    drawHomeClusterMap();
  }

  function drawHomeClusterMap() {
    const canvas = byId("homeClusterMap");
    if (!canvas || !window.maplibregl) return;
    const attractions = allAttractions();
    if (!attractions.length) {
      canvas.innerHTML = `<div class="map-fallback"><strong>No route stops loaded</strong><p>Upload the CSV-generated trip-stops.js file to show clustered stops.</p></div>`;
      return;
    }
    if (homeMap) {
      homeMap.remove();
      homeMap = null;
    }
    homeMap = new maplibregl.Map({
      container: canvas,
      style: data.mapLinks.styleUrl,
      center: [-89.7, 41.8],
      zoom: 4.35,
      attributionControl: true
    });
    homeMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    homeMap.on("error", () => {
      const panel = byId("uploadedStopsPanel");
      if (panel) panel.classList.add("is-map-fallback");
    });
    homeMap.on("load", () => {
      window.setTimeout(() => homeMap?.resize?.(), 80);
      homeMap.addSource("home-attractions", {
        type: "geojson",
        data: attractionFeatureCollection(),
        cluster: true,
        clusterMaxZoom: 7,
        clusterRadius: 30
      });
      homeMap.addLayer({
        id: "home-clusters",
        type: "circle",
        source: "home-attractions",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": ["step", ["get", "point_count"], "#1f78a4", 10, "#2f7d5f", 25, "#bd5a36"],
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 25, 31],
          "circle-stroke-width": 4,
          "circle-stroke-color": "#fffdf7",
          "circle-opacity": 0.94
        }
      });
      homeMap.addLayer({
        id: "home-cluster-count",
        type: "symbol",
        source: "home-attractions",
        filter: ["has", "point_count"],
        layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 14 },
        paint: { "text-color": "#fffdf7" }
      });
      homeMap.addLayer({
        id: "home-unclustered-point",
        type: "circle",
        source: "home-attractions",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["match", ["get", "categoryGroup"],
            "nature", "#2f7d5f",
            "history", "#7c5d3a",
            "museum", "#174a7c",
            "food", "#bd5a36",
            "ferry", "#163f33",
            "water", "#1f78a4",
            "#f2c14e"
          ],
          "circle-radius": 8,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#fffdf7"
        }
      });
      homeMap.addLayer({
        id: "home-unclustered-label",
        type: "symbol",
        source: "home-attractions",
        filter: ["!", ["has", "point_count"]],
        minzoom: 7.25,
        layout: { "text-field": ["get", "title"], "text-offset": [0, 1.3], "text-size": 11, "text-anchor": "top" },
        paint: { "text-color": "#17211b", "text-halo-color": "#fffdf7", "text-halo-width": 1.5 }
      });
      homeMap.addLayer({
        id: "home-unclustered-icon",
        type: "symbol",
        source: "home-attractions",
        filter: ["!", ["has", "point_count"]],
        layout: { "text-field": ["get", "icon"], "text-size": 13, "text-allow-overlap": true },
        paint: { "text-color": "#fffdf7" }
      });
      if (activeProfile === "elsie") {
        const routed = currentRouteResult().coordinates || [];
        const plan = routePlan();
        const planned = [plan.origin, ...plan.waypoints, plan.destination].map((point) => [point.location.lon, point.location.lat]);
        homeMap.addSource("elsie-active-route", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routed.length > 1 ? routed : planned } }
        });
        homeMap.addLayer({
          id: "elsie-active-route-line",
          type: "line",
          source: "elsie-active-route",
          paint: { "line-color": "#6f50a0", "line-width": 5, "line-opacity": 0.82 }
        }, "home-unclustered-point");
        syncBreadcrumbLayers(homeMap);
        registerElsieIcons(homeMap).then(() => addElsieIconLayer(homeMap));
        if (state.radarEnabled) fetchRadarMeta().then(() => { applyRadarLayer(homeMap); startRadarAnimation(); });
        syncRadarStationLayer(homeMap);
        refreshActiveRoute();
      }
      if (state.lastPosition) {
        homeMap.addSource("current-location", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [state.lastPosition.lon, state.lastPosition.lat] } }
        });
        homeMap.addLayer({
          id: "current-location-dot",
          type: "circle",
          source: "current-location",
          paint: { "circle-color": "#c94f34", "circle-radius": 9, "circle-stroke-width": 4, "circle-stroke-color": "#fffdf7" }
        });
      }
      homeMap.on("click", "home-clusters", (event) => {
        const features = homeMap.queryRenderedFeatures(event.point, { layers: ["home-clusters"] });
        const feature = features[0];
        if (!feature) return;
        const source = homeMap.getSource("home-attractions");
        showClusterDrawer(feature);
        const expansion = source.getClusterExpansionZoom(feature.properties.cluster_id, (error, zoom) => {
          if (error) return;
          homeMap.easeTo({ center: feature.geometry.coordinates, zoom });
        });
        if (expansion?.then) expansion.then((zoom) => homeMap.easeTo({ center: feature.geometry.coordinates, zoom })).catch(() => {});
      });
      homeMap.on("mouseenter", "home-clusters", () => { homeMap.getCanvas().style.cursor = "pointer"; });
      homeMap.on("mouseleave", "home-clusters", () => { homeMap.getCanvas().style.cursor = ""; });
      homeMap.on("click", "home-unclustered-point", (event) => {
        const item = attractionForIdOrTitle(event.features[0].properties.id, event.features[0].properties.title);
        if (item) {
          showAttractionPreview(item);
          if (activeProfile !== "elsie") showStopDetailDrawer(item);
        }
      });
      homeMap.on("mousemove", "home-unclustered-point", (event) => {
        const item = attractionForIdOrTitle(event.features[0].properties.id, event.features[0].properties.title);
        if (item) showAttractionPreview(item);
      });
      homeMap.on("mouseenter", "home-unclustered-point", () => { homeMap.getCanvas().style.cursor = "pointer"; });
      homeMap.on("mouseleave", "home-unclustered-point", () => { homeMap.getCanvas().style.cursor = ""; });
      homeMap.on("moveend", refreshUploadedStopsPanel);
      homeMap.on("zoomend", refreshUploadedStopsPanel);
      if (activeProfile !== "elsie") {
        homeMap.on("move", renderHomeDomMarkers);
        homeMap.on("zoom", renderHomeDomMarkers);
        homeMap.on("resize", renderHomeDomMarkers);
      }
      const first = attractions[0];
      const bounds = attractions.reduce((next, item) => next.extend([item.lon, item.lat]), new maplibregl.LngLatBounds([first.lon, first.lat], [first.lon, first.lat]));
      homeMap.fitBounds(bounds, { padding: { top: 92, bottom: 86, left: 42, right: 42 }, maxZoom: 5.8, duration: 0 });
      refreshUploadedStopsPanel();
      if (activeProfile !== "elsie") window.setTimeout(renderHomeDomMarkers, 120);
    });
  }

  function renderHomeDomMarkers() {
    const layer = byId("homeDomMarkerLayer");
    if (!layer || !homeMap?.project) return;
    const bounds = homeMap.getBounds?.();
    const zoom = homeMap.getZoom?.() || 5;
    const stops = allAttractions().filter((item) => {
      try {
        return bounds ? bounds.contains([item.lon, item.lat]) : true;
      } catch {
        return true;
      }
    });
    const width = layer.clientWidth || window.innerWidth;
    const height = layer.clientHeight || window.innerHeight;
    const clusterSize = zoom < 6 ? 86 : zoom < 7.5 ? 64 : zoom < 9 ? 46 : 0;
    const buckets = new Map();
    stops.forEach((item) => {
      const point = homeMap.project([item.lon, item.lat]);
      if (point.x < -60 || point.y < -60 || point.x > width + 60 || point.y > height + 60) return;
      const key = clusterSize ? `${Math.floor(point.x / clusterSize)}:${Math.floor(point.y / clusterSize)}` : stopKey(item);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push({ ...item, screenX: point.x, screenY: point.y });
    });
    layer.innerHTML = "";
    Array.from(buckets.values()).forEach((items) => {
      const x = items.reduce((sum, item) => sum + item.screenX, 0) / items.length;
      const y = items.reduce((sum, item) => sum + item.screenY, 0) / items.length;
      const button = document.createElement("button");
      button.type = "button";
      button.style.left = `${x}px`;
      button.style.top = `${y}px`;
      if (items.length > 1) {
        button.className = "dom-map-cluster";
        button.textContent = String(items.length);
        button.setAttribute("aria-label", `${items.length} stops in this area`);
        button.addEventListener("click", (event) => {
          event.preventDefault();
          showManualClusterDrawer(items);
          const avg = items.reduce((acc, item) => ({ lat: acc.lat + item.lat / items.length, lon: acc.lon + item.lon / items.length }), { lat: 0, lon: 0 });
          homeMap.easeTo({ center: [avg.lon, avg.lat], zoom: Math.min(10, zoom + 1.8) });
        });
      } else {
        const item = items[0];
        button.className = `dom-map-pin category-${categoryGroup(item.category)}`;
        button.innerHTML = `<span>${escapeHtml(item.icon || "•")}</span>`;
        button.title = `${item.title} - ${item.category}`;
        button.setAttribute("aria-label", `${item.title}, ${item.category}`);
        button.addEventListener("mouseenter", () => showAttractionPreview(item));
        button.addEventListener("focus", () => showAttractionPreview(item));
        button.addEventListener("click", (event) => {
          event.preventDefault();
          showAttractionPreview(item);
          showStopDetailDrawer(item);
        });
      }
      layer.appendChild(button);
    });
  }

  function profileKeywords(profileId = activeProfile) {
    return {
      elsie: ["suspense", "mystery", "story", "historic", "museum", "oddity", "ghost", "fort", "underground", "secret", "weird"],
      katrina: ["historic", "history", "museum", "heritage", "pioneer", "civil war", "state", "church", "campus", "monument", "story"],
      emma: ["sports", "baseball", "hall of fame", "speedway", "community", "farm", "daily", "school", "park", "zoo", "food"],
      eliette: ["craft", "glass", "gem", "shop", "market", "museum", "garden", "story", "oddity", "art", "shiny", "historic"],
      jules: ["truck", "train", "boat", "ferry", "dinosaur", "baseball", "machine", "speedway", "farm", "why", "zoo"],
      momdad: ["food", "fuel", "park", "museum", "historic", "ferry", "rest", "core", "national", "campus", "route"]
    }[profileId] || [];
  }

  function profileStopScore(item, profileId = activeProfile) {
    const text = `${item.title} ${item.category} ${item.routeSegment} ${item.summary} ${item.why} ${item.profiles?.[profileId] || ""}`.toLowerCase();
    const keywords = profileKeywords(profileId);
    let score = 0;
    keywords.forEach((word) => {
      if (text.includes(word)) score += 3;
    });
    if ((item.profiles?.[profileId] || "").length > 20) score += 4;
    if (/core/i.test(item.tier || "")) score += 3;
    if (/worth|high|major/i.test(item.tier || "")) score += 2;
    if (/gateway arch|notre dame|studebaker|indiana dunes|mackinac|plaunt|bois blanc/i.test(item.title)) score += 2;
    if (state.lastPosition && Number.isFinite(item.lat) && Number.isFinite(item.lon)) score += Math.max(0, 6 - haversineMiles(state.lastPosition, item) / 25);
    return score;
  }

  function stopsInCurrentMapView(attractions) {
    if (!homeMap?.getBounds) return attractions;
    try {
      const bounds = homeMap.getBounds();
      const visible = attractions.filter((item) => bounds.contains([item.lon, item.lat]));
      return visible.length ? visible : attractions;
    } catch {
      return attractions;
    }
  }

  function topAttractionsForPanel(attractions, profileId = activeProfile) {
    return [...attractions]
      .map((item) => ({ ...item, profileScore: profileStopScore(item, profileId) }))
      .sort((a, b) => b.profileScore - a.profileScore || String(a.routeSegment || "").localeCompare(String(b.routeSegment || "")) || a.title.localeCompare(b.title))
      .slice(0, 18);
  }

  function refreshUploadedStopsPanel() {
    const panel = byId("uploadedStopsPanel");
    if (!panel) return;
    const wasCollapsed = panel.classList.contains("is-collapsed");
    const allStops = allAttractions();
    const visibleStops = stopsInCurrentMapView(allStops);
    panel.outerHTML = renderUploadedStopsPanel(allStops, visibleStops, wasCollapsed);
  }

  function renderUploadedStopsPanel(attractions, visibleStops = attractions, collapsed = false) {
    const topStops = topAttractionsForPanel(visibleStops);
    const groups = visibleStops.reduce((acc, item) => {
      const key = categoryGroup(item.category);
      acc[key] ||= 0;
      acc[key] += 1;
      return acc;
    }, {});
    const profile = currentProfile();
    return `
      <aside id="uploadedStopsPanel" class="uploaded-stops-panel ${collapsed ? "is-collapsed" : "is-mobile-peek"}" aria-label="Uploaded trip stops">
        <div class="uploaded-stops-head">
          <div>
            <p class="eyebrow">Top attractions in view</p>
            <strong>${topStops.length} for ${escapeHtml(profile.name)}</strong>
            <small>${attractions.length} total uploaded · ${visibleStops.length} in this map view</small>
          </div>
          <button type="button" data-toggle-uploaded-stops>${collapsed ? "Stops" : "Hide"}</button>
        </div>
        <div class="uploaded-category-row">
          ${Object.entries(groups).map(([group, total]) => `<span>${escapeHtml(group)} <b>${total}</b></span>`).join("")}
        </div>
        <div class="uploaded-stop-list">
          ${topStops.map((item) => `
            <article class="uploaded-stop-card">
              <button type="button" data-stop-detail="${escapeHtml(item.title)}">
                <strong>${escapeHtml(item.title)}</strong>
                <small>${escapeHtml(item.category)} · ${escapeHtml(item.routeSegment || "Route")}</small>
              </button>
              <p>${escapeHtml(item.profiles?.[activeProfile] || item.summary || item.why || "")}</p>
              <div class="compact-actions">
                <button type="button" data-stop-detail="${escapeHtml(item.title)}">Details</button>
                <button type="button" data-route-stop="${escapeHtml(item.title)}">Route</button>
                <a class="external-link" href="${sourceLinkForPlace(item)}" target="_blank" rel="noopener">Learn More</a>
              </div>
            </article>
          `).join("")}
        </div>
      </aside>
    `;
  }

  function updateHomeGpsLayer() {
    if (!homeMap || !state.lastPosition) return;
    const dataPoint = { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [state.lastPosition.lon, state.lastPosition.lat] } };
    const source = homeMap.getSource?.("current-location");
    if (source) {
      source.setData(dataPoint);
      return;
    }
    if (!homeMap.isStyleLoaded?.()) return;
    homeMap.addSource("current-location", { type: "geojson", data: dataPoint });
    homeMap.addLayer({
      id: "current-location-dot",
      type: "circle",
      source: "current-location",
      paint: { "circle-color": "#c94f34", "circle-radius": 9, "circle-stroke-width": 4, "circle-stroke-color": "#fffdf7" }
    });
  }

  function categoryGroup(category = "") {
    const text = category.toLowerCase();
    if (/park|nature|trail|preserve|garden|dune|forest|waterfall|falls/.test(text)) return "nature";
    if (/historic|history|fort|capitol|heritage/.test(text)) return "history";
    if (/museum|library|hall/.test(text)) return "museum";
    if (/food|restaurant|cafe|market|cider|fudge|donut/.test(text)) return "food";
    if (/ferry|boat|dock/.test(text)) return "ferry";
    if (/lake|lighthouse|shore|harbor|river/.test(text)) return "water";
    return "discovery";
  }

  function attractionForIdOrTitle(id, title) {
    return allAttractions().find((item) => item.id === id || item.title === title || item.name === title);
  }

  function showClusterDrawer(feature) {
    const drawer = byId("clusterDrawer");
    if (!drawer || !homeMap) return;
    const source = homeMap.getSource("home-attractions");
    const clusterId = feature.properties.cluster_id;
    const count = feature.properties.point_count || 0;
    drawer.hidden = false;
    drawer.innerHTML = `
      <div class="cluster-drawer-card">
        <p class="eyebrow">Map cluster</p>
        <h3>Opening ${count} trip stops...</h3>
      </div>
    `;
    const renderLeaves = (leaves) => {
      leaves ||= [];
      if (!leaves.length) {
        const [lon, lat] = feature.geometry.coordinates;
        leaves = allAttractions()
          .map((item) => ({
            properties: {
              id: item.id,
              title: item.title,
              category: item.category,
              segment: item.routeSegment,
              distance: haversineMiles({ lat, lon }, item)
            }
          }))
          .sort((a, b) => a.properties.distance - b.properties.distance)
          .slice(0, Math.min(count || 12, 12));
      }
      const groups = leaves.reduce((acc, leaf) => {
        const category = leaf.properties.category || "Trip Stop";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      drawer.hidden = false;
      drawer.innerHTML = `
        <div class="cluster-drawer-card">
          <button type="button" class="modal-close" data-close-cluster>Close</button>
          <p class="eyebrow">Explore cluster</p>
          <h3>${count} uploaded trip stops here</h3>
          <p class="cluster-help">Showing ${Math.min(leaves.length, 8)} nearby stops. Zoom in to split the cluster, or open any stop below.</p>
          <div class="cluster-chip-row">${Object.entries(groups).slice(0, 8).map(([category, total]) => `<span>${escapeHtml(category)} <b>${total}</b></span>`).join("")}</div>
          <div class="cluster-stop-grid">
            ${leaves.slice(0, 8).map((leaf) => {
              const item = attractionForIdOrTitle(leaf.properties.id, leaf.properties.title) || leaf.properties;
              return `
              <article class="cluster-stop-card">
                <strong>${escapeHtml(leaf.properties.title)}</strong>
                <small>${escapeHtml(leaf.properties.category)} · ${escapeHtml(leaf.properties.segment || "Route")}</small>
                <p>${escapeHtml(item.summary || item.shortSummary || item.why || item.whyItMatters || "")}</p>
                <div class="compact-actions">
                  <button type="button" data-stop-detail="${escapeHtml(leaf.properties.title)}">Details</button>
                  <button type="button" data-route-stop="${escapeHtml(leaf.properties.title)}">Route</button>
                  <a class="external-link" href="${sourceLinkForPlace(item)}" target="_blank" rel="noopener">Learn More</a>
                </div>
              </article>
            `; }).join("")}
          </div>
        </div>
      `;
    };
    const leavesResult = source.getClusterLeaves(clusterId, Math.min(count, 100), 0, (error, leaves) => {
      if (error) return;
      renderLeaves(leaves);
    });
    if (leavesResult?.then) leavesResult.then(renderLeaves).catch(() => {});
    window.setTimeout(() => {
      if (!drawer.hidden && !drawer.querySelector(".cluster-stop-card")) renderLeaves([]);
    }, 250);
  }

  function showManualClusterDrawer(items) {
    const drawer = byId("clusterDrawer");
    if (!drawer) return;
    const normalized = items.map((item) => enrichStop(item));
    const groups = normalized.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    drawer.hidden = false;
    drawer.innerHTML = `
      <div class="cluster-drawer-card">
        <button type="button" class="modal-close" data-close-cluster>Close</button>
        <p class="eyebrow">Visible map cluster</p>
        <h3>${normalized.length} uploaded trip stops here</h3>
        <p class="cluster-help">These are the stops grouped in this part of the map. Zoom in to separate them.</p>
        <div class="cluster-chip-row">${Object.entries(groups).slice(0, 8).map(([category, total]) => `<span>${escapeHtml(category)} <b>${total}</b></span>`).join("")}</div>
        <div class="cluster-stop-grid">
          ${normalized.slice(0, 12).map((item) => `
            <article class="cluster-stop-card">
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.category)} · ${escapeHtml(item.routeSegment || "Route")}</small>
              <p>${escapeHtml(item.profiles?.[activeProfile] || item.summary || item.why || "")}</p>
              <div class="compact-actions">
                <button type="button" data-stop-detail="${escapeHtml(item.title)}">Details</button>
                <button type="button" data-route-stop="${escapeHtml(item.title)}">Route</button>
                <a class="external-link" href="${sourceLinkForPlace(item)}" target="_blank" rel="noopener">Learn More</a>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }

  function showAttractionPreview(item) {
    item = enrichStop(item);
    if (activeProfile === "elsie") {
      const preview = byId("homeAttractionPreview") || byId("exploreDetail");
      if (!preview) return;
      preview.hidden = false;
      preview.innerHTML = `
        <article class="attraction-preview-card elsie-preview-card">
          <div>
            <p class="eyebrow">${escapeHtml(item.category)} · ${escapeHtml(item.tier)} · ${escapeHtml(item.estimatedStopTime)}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary || item.why || "")}</p>
            <p><strong>Elsie's angle:</strong> ${escapeHtml(item.profiles?.elsie || "Look for the detail that changes the whole story.")}</p>
            <small>${escapeHtml(stopDistanceLabel(item))} · ${escapeHtml(item.distanceOffRoute)}</small>
            <div class="compact-actions">
              <button type="button" data-stop-detail="${escapeHtml(item.title)}">Details</button>
              <a class="external-link" href="${googleMapsNavigationUrl(item)}" target="_blank" rel="noopener">Navigate</a>
              <button type="button" data-shortlist="${escapeHtml(item.title)}" data-category="${escapeHtml(item.category)}" data-url="${sourceLinkForPlace(item)}">${isStopSaved(item) ? "Saved" : "Save"}</button>
            </div>
          </div>
        </article>`;
      return;
    }
    const profile = currentProfile();
    const previewTargets = [byId("homeAttractionPreview"), byId("exploreDetail")].filter(Boolean);
    const markup = `
      <article class="attraction-preview-card">
        <img src="${routeVisualForPlace(item)}" alt="${escapeHtml(item.title || item.name)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImageForPlace(item)}';">
        <div>
          <p class="eyebrow">${escapeHtml(item.category)} · ${escapeHtml(item.tier)} · ${escapeHtml(stopDistanceLabel(item))}</p>
          <h3>${escapeHtml(item.title || item.name)}</h3>
          <p>${escapeHtml(item.summary || item.why || "")}</p>
          <p><strong>Off route:</strong> ${escapeHtml(item.distanceOffRoute)} · <strong>Stop time:</strong> ${escapeHtml(item.estimatedStopTime)}</p>
          <p>${escapeHtml(item.profiles?.[profile.id] || item.profiles?.momdad || "")}</p>
          <div class="compact-actions">
            <a class="external-link" href="${sourceLinkForPlace(item)}" target="_blank" rel="noopener">Learn More</a>
            <button type="button" data-route-stop="${escapeHtml(item.title || item.name)}">Route</button>
            <button type="button" data-shortlist="${escapeHtml(item.title || item.name)}" data-category="${escapeHtml(item.category)}" data-url="${sourceLinkForPlace(item)}">${isStopSaved(item) ? "Saved" : "Save"}</button>
            <button type="button" data-stop-detail="${escapeHtml(item.title || item.name)}">Details</button>
          </div>
        </div>
      </article>
    `;
    previewTargets.forEach((target) => {
      target.hidden = false;
      target.innerHTML = markup;
    });
  }

  function showStopDetailDrawer(item) {
    item = enrichStop(item);
    const drawer = byId("bottomDrawer");
    if (!drawer) return;
    const cluster = byId("clusterDrawer");
    if (cluster) cluster.hidden = true;
    const profile = currentProfile();
    if (profile.id === "elsie") {
      const key = stopKey(item);
      const rating = state.profileStopRatings.elsie[key] || "";
      const collections = state.profileCollections.elsie[key] || [];
      const collectionChoices = ["Weird", "Historic", "Animal", "Best Story", "Would Visit"];
      drawer.innerHTML = `
        <section class="stop-detail-drawer elsie-detail-drawer" role="dialog" aria-modal="false" aria-labelledby="elsieStopTitle">
          <div class="elsie-drawer-head"><div><p class="eyebrow">${escapeHtml(item.category)} · ${escapeHtml(item.tier)}</p><h3 id="elsieStopTitle">${escapeHtml(item.title)}</h3></div><button type="button" data-close-stop-drawer aria-label="Close attraction details">Close</button></div>
          <div class="elsie-detail-meta"><span>${escapeHtml(item.routeSegment || "Route")}</span><span>${escapeHtml(stopDistanceLabel(item))}</span><span>${escapeHtml(item.distanceOffRoute)}</span><span>${escapeHtml(item.estimatedStopTime)}</span></div>
          <p>${escapeHtml(item.summary || "")}</p>
          <p><strong>Why it matters:</strong> ${escapeHtml(item.why || item.summary || "")}</p>
          <p><strong>Elsie's angle:</strong> ${escapeHtml(item.profiles?.elsie || "Look for the detail that changes the whole story.")}</p>
          <p><strong>What to look for:</strong> ${escapeHtml(item.profiles?.elsie || item.summary || "")}</p>
          <div class="compact-actions">
            <button type="button" data-shortlist="${escapeHtml(item.title)}" data-category="${escapeHtml(item.category)}" data-url="${sourceLinkForPlace(item)}">${isStopSaved(item) ? "Saved" : "Save"}</button>
            <button type="button" data-visited-stop="${escapeHtml(item.title)}">${isStopVisited(item) ? "Visited" : "Mark visited"}</button>
            <a class="external-link" href="${googleMapsNavigationUrl(item)}" target="_blank" rel="noopener">Navigate</a>
            <a class="external-link" href="${sourceLinkForPlace(item)}" target="_blank" rel="noopener">Learn More</a>
          </div>
          <fieldset class="elsie-collections"><legend>Elsie's Collections</legend>${collectionChoices.map((choice) => `<label><input type="checkbox" data-elsie-collection="${escapeHtml(key)}" value="${choice}" ${collections.includes(choice) ? "checked" : ""}> ${choice}</label>`).join("")}</fieldset>
          ${isStopVisited(item) ? `<fieldset class="elsie-rating"><legend>Worth the detour?</legend>${["Skip next time", "Interesting", "Actually great"].map((choice) => `<label><input type="radio" name="elsie-rating-${escapeHtml(key)}" data-elsie-rating="${escapeHtml(key)}" value="${choice}" ${rating === choice ? "checked" : ""}> ${choice}</label>`).join("")}</fieldset>` : ""}
        </section>`;
      return;
    }
    drawer.innerHTML = `
      <details open class="stop-detail-drawer">
        <summary>
          <span><strong>${escapeHtml(item.title || item.name)}</strong><small>${escapeHtml(item.category)} · ${escapeHtml(item.tier)} · ${escapeHtml(stopDistanceLabel(item))}</small></span>
          <b>${isStopVisited(item) ? "Visited" : isStopSaved(item) ? "Saved" : "Stop"}</b>
        </summary>
        <article class="stop-detail-card">
          <img src="${routeVisualForPlace(item)}" alt="${escapeHtml(item.title || item.name)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImageForPlace(item)}';">
          <div>
            <p class="eyebrow">${escapeHtml(item.category)} · ${escapeHtml(item.estimatedStopTime)} · ${escapeHtml(item.distanceOffRoute)}</p>
            <h3>${escapeHtml(item.title || item.name)}</h3>
            <p>${escapeHtml(item.summary || item.why || "")}</p>
            <p><strong>Why it matters:</strong> ${escapeHtml(item.why || item.summary || "")}</p>
            <p><strong>${escapeHtml(profile.name)} view:</strong> ${escapeHtml(item.profiles?.[profile.id] || item.profiles?.momdad || "")}</p>
            <div class="compact-actions">
              <a class="external-link" href="${sourceLinkForPlace(item)}" target="_blank" rel="noopener">Learn More</a>
              <button type="button" data-route-stop="${escapeHtml(item.title || item.name)}">Route</button>
              <button type="button" data-shortlist="${escapeHtml(item.title || item.name)}" data-category="${escapeHtml(item.category)}" data-url="${sourceLinkForPlace(item)}">${isStopSaved(item) ? "Saved" : "Save"}</button>
              <button type="button" data-visited-stop="${escapeHtml(item.title || item.name)}">${isStopVisited(item) ? "Visited" : "Mark Visited"}</button>
            </div>
          </div>
        </article>
      </details>
    `;
  }

  function renderBottomDrawer() {
    const drawer = byId("bottomDrawer");
    if (!drawer) return;
    if (isHomeMapPage()) {
      drawer.innerHTML = "";
      return;
    }
    const profile = currentProfile();
    const nearest = nearestAttractions(state.lastPosition, 4);
    const weather = weatherLocationsForContext().map((location) => state.weather[location.id]).find(Boolean);
    drawer.innerHTML = `
      <details open>
        <summary>
          <span><strong>${nearest[0]?.title || "Next discovery"}</strong><small>${milesLeft().toLocaleString()} miles left · ${state.gpsStatus || "GPS off"}</small></span>
          <b>${state.phase === "pretrip" ? "Prep" : "Live"}</b>
        </summary>
        <div class="drawer-grid">
          <section>
            <h3>Nearby</h3>
            ${nearest.map((item) => `
              <button type="button" class="drawer-row" data-detail="${escapeHtml(item.title)}">
                <strong>${escapeHtml(item.title)}</strong>
                <span>${Number.isFinite(item.distance) ? `${item.distance.toFixed(1)} mi` : item.routeSegment || item.place}</span>
              </button>
            `).join("")}
          </section>
          <section>
            <h3>Trip Pulse</h3>
            <div class="drawer-chips">
              <button type="button" data-need="Bathroom now">Bathroom</button>
              <button type="button" data-need="Gas now">Gas</button>
              <button type="button" data-need="Food now">Food</button>
              <button type="button" data-nav-global="weather">Weather</button>
              <button type="button" data-nav-global="lens">Lens</button>
            </div>
            <p>${weather ? weatherSummaryFor(profile, weather, weather.location?.name || "Weather") : "Weather appears after refresh or GPS weather check."}</p>
          </section>
          <section>
            <h3>Badges</h3>
            ${renderBadgeShelf(profile.id)}
          </section>
        </div>
      </details>
    `;
  }

  function openAppleRoute(name) {
    const stop = attractionForName(name);
    if (!stop) return;
    window.open(activeProfile === "elsie" ? googleMapsNavigationUrl(stop) : appleMapsUrl(stop), "_blank");
  }

  function loadMapLibre() {
    if (window.maplibregl || mapLibreLoading || !navigator.onLine) return;
    if (!document.querySelector('link[data-maplibre-css]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@5.9.0/dist/maplibre-gl.css";
      link.dataset.maplibreCss = "true";
      document.head.appendChild(link);
    }
    mapLibreLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/maplibre-gl@5.9.0/dist/maplibre-gl.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }).then(() => {
      mapLibreLoading = null;
      if (isHomeMapPage()) renderHomeMapPanel();
      renderRouteMapPanel();
      renderExploreMapPanel();
    }).catch(() => {
      mapLibreLoading = null;
    });
  }

  function mapPoint(stop) {
    return [stop.location.lon, stop.location.lat];
  }

  function drawRouteMap() {
    const canvas = byId("mapLibreCanvas");
    if (!canvas || !window.maplibregl) return;
    const plan = routePlan();
    const stops = [plan.origin, ...plan.waypoints, plan.destination];
    const line = stops.map(mapPoint);
    if (state.lastPosition) line.push([state.lastPosition.lon, state.lastPosition.lat]);
    if (routeMap) {
      routeMap.remove();
      routeMap = null;
    }
    routeMap = new maplibregl.Map({
      container: canvas,
      style: data.mapLinks.styleUrl,
      center: mapPoint(plan.origin),
      zoom: 5
    });
    routeMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    routeMap.on("load", () => {
      routeMap.addSource("trip-route", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: stops.map(mapPoint) } }
      });
      routeMap.addLayer({
        id: "trip-route-line",
        type: "line",
        source: "trip-route",
        paint: { "line-color": "#1f78a4", "line-width": 5, "line-opacity": 0.9 }
      });
      stops.forEach((stop) => addMapMarker(stop.location, stop.label, "route"));
      if (state.lastPosition) addMapMarker(state.lastPosition, "Current GPS location", "gps");
      const bounds = line.reduce((next, coord) => next.extend(coord), new maplibregl.LngLatBounds(line[0], line[0]));
      routeMap.fitBounds(bounds, { padding: 48, maxZoom: 8, duration: 0 });
    });
  }

  function addMapMarker(point, label, type) {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = `map-marker ${type === "gps" ? "is-gps" : ""}`;
    marker.title = label;
    marker.textContent = type === "gps" ? "You" : "";
    new maplibregl.Marker({ element: marker }).setLngLat([point.lon, point.lat]).setPopup(new maplibregl.Popup().setText(label)).addTo(routeMap);
  }

  function renderExploreMapPanel() {
    const container = byId("exploreMapPanel");
    if (!container) return;
    if (!window.maplibregl) {
      container.innerHTML = `
        ${renderExploreClusterFallback()}
        <p class="map-caption">Map tiles are loading. These clusters are generated from the same route data and stay visible offline.</p>
      `;
      loadMapLibre();
      return;
    }
    container.innerHTML = `
      <div id="exploreMapCanvas" class="maplibre-canvas" role="img" aria-label="Explore route attractions"></div>
      ${renderExploreClusterFallback()}
    `;
    drawExploreMap();
  }

  function attractionClusterGroups() {
    const groups = new Map();
    allAttractions()
      .sort((a, b) => (a.milesFromStart || 0) - (b.milesFromStart || 0))
      .forEach((item) => {
        const key = item.routeSegment || "Route";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      });
    return Array.from(groups.entries());
  }

  function renderExploreClusterFallback() {
    const groups = attractionClusterGroups();
    return `
      <div class="fallback-cluster-map" aria-label="Route attraction clusters">
        ${groups.map(([segment, items]) => `
          <section class="cluster-card">
            <button type="button" class="cluster-head" data-cluster-segment="${escapeHtml(segment)}">
              <span>${items.length}</span>
              <strong>${escapeHtml(segment)}</strong>
            </button>
            <div class="cluster-items">
              ${items.map((item) => `
                <button type="button" data-detail="${escapeHtml(item.title)}">
                  <strong>${escapeHtml(item.title)}</strong>
                  <small>${escapeHtml(item.place)}${item.milesFromStart ? ` · mile ${item.milesFromStart}` : ""}</small>
                </button>
              `).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    `;
  }

  function attractionFeatureCollection() {
    return {
      type: "FeatureCollection",
      features: allAttractions().map((item) => ({
        type: "Feature",
        properties: {
          id: item.id,
          title: item.title,
          category: item.category,
          categoryGroup: categoryGroup(item.category),
          place: item.place || item.routeSegment,
          segment: item.routeSegment,
          tier: item.tier,
          stopTime: item.estimatedStopTime,
          icon: item.icon,
          elsieIcon: activeProfile === "elsie" && getElsieIconType(item) ? `elsie-${getElsieIconType(item)}` : ""
        },
        geometry: { type: "Point", coordinates: [item.lon, item.lat] }
      }))
    };
  }

  function drawExploreMap() {
    const canvas = byId("exploreMapCanvas");
    if (!canvas || !window.maplibregl) return;
    const attractions = allAttractions();
    if (exploreMap) {
      exploreMap.remove();
      exploreMap = null;
    }
    exploreMap = new maplibregl.Map({
      container: canvas,
      style: data.mapLinks.styleUrl,
      center: [-90.1848, 39.8],
      zoom: 4.5
    });
    exploreMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
    exploreMap.on("load", () => {
      exploreMap.addSource("attractions", {
        type: "geojson",
        data: attractionFeatureCollection(),
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 48
      });
      exploreMap.addLayer({
        id: "clusters",
        type: "circle",
        source: "attractions",
        filter: ["has", "point_count"],
        paint: { "circle-color": "#1f78a4", "circle-radius": ["step", ["get", "point_count"], 20, 4, 28, 8, 36], "circle-opacity": 0.9 }
      });
      exploreMap.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "attractions",
        filter: ["has", "point_count"],
        layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 13 },
        paint: { "text-color": "#fffdf7" }
      });
      exploreMap.addLayer({
        id: "unclustered-attraction",
        type: "circle",
        source: "attractions",
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-color": "#f2c14e", "circle-radius": 9, "circle-stroke-width": 3, "circle-stroke-color": "#163f33" }
      });
      exploreMap.addLayer({
        id: "attraction-labels",
        type: "symbol",
        source: "attractions",
        filter: ["!", ["has", "point_count"]],
        layout: { "text-field": ["get", "title"], "text-offset": [0, 1.25], "text-size": 12 },
        paint: { "text-color": "#17211b", "text-halo-color": "#fffdf7", "text-halo-width": 1 }
      });
      exploreMap.on("click", "clusters", (event) => {
        const features = exploreMap.queryRenderedFeatures(event.point, { layers: ["clusters"] });
        const clusterId = features[0].properties.cluster_id;
        exploreMap.getSource("attractions").getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (error) return;
          exploreMap.easeTo({ center: features[0].geometry.coordinates, zoom });
        });
      });
      exploreMap.on("click", "unclustered-attraction", (event) => {
        const title = event.features[0].properties.title;
        const item = allAttractions().find((entry) => entry.title === title);
        if (item) showAttractionPreview(item);
      });
      if (activeProfile !== "elsie") attractions.forEach((item) => addExploreAttractionMarker(item));
      if (state.lastPosition) addExploreGpsMarker();
      const first = attractions[0];
      if (first) {
        const bounds = attractions.reduce((next, item) => next.extend([item.lon, item.lat]), new maplibregl.LngLatBounds([first.lon, first.lat], [first.lon, first.lat]));
        exploreMap.fitBounds(bounds, { padding: 44, maxZoom: 7, duration: 0 });
      }
    });
    exploreMap.on("error", () => {
      const status = byId("exploreMapStatus");
      if (status) status.textContent = "Map tiles had trouble loading; route clusters below are still active.";
    });
  }

  function addExploreAttractionMarker(item) {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = `map-marker is-attraction category-${item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")} ${isStopSaved(item) ? "is-saved" : ""} ${isStopVisited(item) ? "is-visited" : ""}`;
    marker.title = item.title;
    marker.textContent = item.icon;
    marker.addEventListener("mouseenter", () => showAttractionPreview(item));
    marker.addEventListener("focus", () => showAttractionPreview(item));
    marker.addEventListener("click", () => showStopDetailDrawer(item));
    new maplibregl.Marker({ element: marker }).setLngLat([item.lon, item.lat]).setPopup(new maplibregl.Popup().setText(item.title)).addTo(exploreMap);
  }

  function addExploreGpsMarker() {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "map-marker is-gps";
    marker.textContent = "You";
    new maplibregl.Marker({ element: marker }).setLngLat([state.lastPosition.lon, state.lastPosition.lat]).setPopup(new maplibregl.Popup().setText("Current GPS location")).addTo(exploreMap);
  }

  function showAttractionDetail(item) {
    const profile = currentProfile();
    const target = byId("exploreDetail");
    if (target) target.innerHTML = placeCard(item, profile);
  }

  function renderDaySelect() {
    return selectedDay();
  }

  function isHomeMapPage() {
    return activePage === "explore" || activePage === "route";
  }

  function renderSplashProfiles() {
    const container = byId("splashProfiles");
    container.innerHTML = "";
    data.profiles.forEach((profile) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "splash-profile";
      button.dataset.profileChoice = profile.id;
      button.style.setProperty("--profile-accent", profile.accent || "#1f78a4");
      const ageLabel = profile.age === "adult" ? "Adult full-detail view" : `Age ${profile.age} view`;
      button.innerHTML = `<strong>${profile.name}</strong><em>${ageLabel}</em><span>${profile.lens}</span>`;
      container.appendChild(button);
    });
  }

  function parseHash() {
    const parts = (location.hash || "").replace(/^#\/?/, "").split("/").filter(Boolean);
    const profileIds = data.profiles.map((profile) => profile.id);
    if (profileIds.includes(parts[0])) activeProfile = parts[0];
    const profile = currentProfile();
    const validPages = profile.id === "momdad" ? parentPages : pages;
    const aliases = { home: "explore", route: "explore", activities: "learn", stars: "learn", ferry: "learn", badges: "rewards", saved: "rewards" };
    const requestedPage = aliases[parts[1]] || parts[1];
    activePage = validPages.includes(requestedPage) ? requestedPage : "today";
  }

  function chooseProfile(profileId) {
    activeProfile = profileId;
    state.profile = profileId;
    state.hasChosenProfile = true;
    saveState();
    location.hash = `/${profileId}/explore`;
    byId("splash").classList.add("is-hidden");
    render();
    if (!state.lastPosition && state.gpsStatus !== "Active") {
      setAction("Traveler selected. Tap Start GPS when you are ready to allow location tracking.");
    }
  }

  function navTo(page) {
    location.hash = `/${activeProfile}/${page}`;
  }

  function renderBottomNav() {
    const nav = byId("bottomNav");
    if (!nav) return;
    nav.hidden = true;
    nav.innerHTML = "";
  }

  function renderMainMenu() {
    const container = byId("mainMenuLinks");
    if (!container) return;
    container.innerHTML = mainMenuItems.map(([page, title, copy]) => `
      <button type="button" data-menu-nav="${page}" class="menu-link">
        <strong>${title}</strong>
        <span>${copy}</span>
      </button>
    `).join("");
  }

  function toggleMainMenu(open) {
    const menu = byId("mainMenu");
    const button = byId("mainMenuButton");
    if (!menu || !button) return;
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  }

  function renderCountdowns() {
    const now = new Date();
    const depart = new Date(data.dates.depart);
    const complete = new Date(data.dates.complete);
    const totalPrep = depart - new Date("2026-05-30T00:00:00-05:00");
    const prepDone = clamp(((now - new Date("2026-05-30T00:00:00-05:00")) / totalPrep) * 100, 0, 100);
    const wholeTrip = state.phase === "pretrip" ? prepDone : clamp(((now - depart) / (complete - depart)) * 100, 0, 100);
    byId("daysUntil").textContent = Math.max(0, Math.ceil((depart - now) / 86400000));
    byId("milesLeft").textContent = milesLeft().toLocaleString();
    byId("percentLeft").textContent = `${Math.round(100 - progressForPhase())}%`;
    byId("phaseLabel").textContent = phaseLabels[state.phase] || "Pre-trip";
    byId("heroTitle").textContent = state.phase === "return" ? "Homeward Bound" : state.phase === "island" ? selectedDay().title : "Bois Blanc Bound";
    byId("heroText").textContent = "";
    byId("heroText").hidden = true;
    byId("primaryProgressLabel").textContent = state.phase === "pretrip" ? "Countdown to launch" : "Whole trip progress";
    byId("primaryProgressText").textContent = `${Math.round(wholeTrip)}%`;
    byId("primaryProgressBar").style.width = `${wholeTrip}%`;
    byId("phaseProgressLabel").textContent = state.phase === "pretrip" ? "Launch getting closer" : "Current phase progress";
    byId("phaseProgressText").textContent = `${Math.round(state.phase === "pretrip" ? prepDone : progressForPhase())}%`;
    byId("phaseProgressBar").style.width = `${state.phase === "pretrip" ? prepDone : progressForPhase()}%`;
  }

  function renderTripStatus() {
    const profile = currentProfile();
    const destination = activeDestination();
    const mph = destination.plannedHours && destination.plannedMiles ? destination.plannedMiles / destination.plannedHours : 62;
    const minutes = Math.max(10, Math.round((milesLeft() / mph) * 60));
    const timeText = `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
    const childText = profile.id === "jules"
      ? `Next big thing: ${destination.label}.`
      : `${milesLeft().toLocaleString()} miles, about ${timeText}, to ${destination.label}.`;
    byId("onlineStatus").textContent = navigator.onLine ? "Online" : "Offline - using cached trip data";
    byId("nextStop").textContent = state.needNow ? `${state.needNow}: route-aware options below.` : state.phase === "pretrip" ? "Trip has not started. Use planning, route, weather, and badge prep." : `Next target: ${destination.label}.`;
    byId("kidTravelUpdate").innerHTML = `<strong>${profile.id === "momdad" ? "Adult GPS readout" : "Road update"}</strong><p>${childText}</p>${state.nearbyBadgeMessage ? `<p>${state.nearbyBadgeMessage}</p>` : ""}`;
    byId("actionStatus").textContent = state.actionMessage || "No action yet.";
    byId("gpsStatus").textContent = state.gpsStatus || "Off";
    byId("destinationStatus").textContent = state.destinationStatus || destination.label;
    byId("trackingStatus").textContent = state.trackingStatus || "Off";
    renderNeedResults();
  }

  function bestNeedStops() {
    const dayStops = data.route.restStops.filter((stop) => stop.date === selectedDayDate());
    const candidates = dayStops.length ? dayStops : data.route.restStops.filter((stop) => isTravelDay(stop.date));
    const currentMiles = routeProgressMiles();
    return candidates
      .filter((stop) => !state.needNow || !stop.needs || stop.needs.includes(state.needNow))
      .sort((a, b) => Math.abs((a.milesFromStart || 0) - currentMiles) - Math.abs((b.milesFromStart || 0) - currentMiles))
      .slice(0, 3);
  }

  function renderNeedResults() {
    const container = byId("needResults");
    if (!state.needNow) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = `
      <div class="choice-card">
        <strong>${state.needNow}</strong>
        <p>${state.phase === "pretrip" ? "Previewing likely route options. Live GPS will sort this better once the trip starts." : "Sorted by the current segment and estimated route position."}</p>
        <ul>${bestNeedStops().map((stop) => `<li><strong>${stop.name}</strong><br>${stop.timing}. ${stop.note}</li>`).join("")}</ul>
      </div>
    `;
  }

  function renderRouteQuest() {
    const container = byId("routeQuest");
    if (!container) return;
    const profile = currentProfile();
    container.innerHTML = `
      <div class="route-actions">
        <a class="external-link" href="${activeRouteUrl()}" target="_blank" rel="noopener">Open phone driving route</a>
        <a class="external-link" href="${data.mapLinks.returnUrl}" target="_blank" rel="noopener">Open return route</a>
      </div>
      <p class="map-caption">The in-app map uses MapLibre and OpenFreeMap with no API key. Phone-map buttons are for turn-by-turn driving.</p>
      ${renderBadgeShelf(profile.id)}
    `;
  }

  function profileHomeTiles(profile) {
    const childTiles = [
      ["today", "Today", "What to look for right now."],
      ["explore", "Explore Map", "Stops, sources, and nearby discoveries."],
      ["weather", "Weather", "Open-Meteo plan guidance."],
      ["stars", "Stars", "STARZ directions and sky checks."],
      ["ferry", "Ferry / Boats", "Water crossing context."],
      ["activities", "Activities", "Your interactive board."],
      ["badges", "Badges", "Earned and upcoming badges."],
      ["saved", "Saved", "Trip Shortlist and votes."],
      ["photos", "Photos", "Captured trip story."]
    ];
    const parentTiles = [
      ["explore", "Explore Map", "Uploaded stops, GPS, and family discovery detail."],
      ["weather", "Weather & Road Risk", "Open-Meteo, ferry wind, backup plans."],
      ["ferry", "Ferry Plan", "Official Plaunt links and reminders."],
      ["stops", "Stops & Supplies", "Clean stops, gas, food, last mainland prep."],
      ["votes", "Family Votes", "Review votes and approve plan items."],
      ["saved", "Trip Shortlist", "Saved ideas by profile."],
      ["badges", "Badges", "Family achievement progress."],
      ["photos", "Photos / Captures", "Trip story media."],
      ["sources", "Sources & Data Status", "Official links and live/cached status."]
    ];
    return (profile.id === "momdad" ? parentTiles : childTiles).map(([page, title, copy]) => `
      <button type="button" class="dashboard-tile" data-nav="${page}">
        <strong>${title}</strong>
        <span>${copy}</span>
      </button>
    `).join("");
  }

  function routePlaceForProfile(profile) {
    const candidates = data.route.routePlaces.filter((place) => place.day === selectedDayDate());
    const pool = candidates.length ? candidates : data.route.routePlaces;
    const preferred = data.profilePlacePreferences?.[profile.id] || [];
    const exact = preferred.map((name) => pool.find((place) => place.name === name)).find(Boolean);
    if (exact) return exact;
    return pool.find((place) => place.profiles?.[profile.id]) || pool[0];
  }

  function placeCard(place, profile) {
    return `
      <article class="choice-card place-preview">
        <img src="${routeVisualForPlace(place)}" alt="${escapeHtml(place.image?.alt || place.name)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImageForPlace(place)}';">
        <div>
          <strong>${place.name}</strong>
          <p>${place.place}. ${place.why}</p>
          <p>${place.profiles?.[profile.id] || place.profiles?.momdad || ""}</p>
          <div class="action-row">
            <button type="button" data-detail="${escapeHtml(place.name)}">View details</button>
            <a class="external-link" href="${sourceLinkForPlace(place)}" target="_blank" rel="noopener">${sourceLabelForPlace(place)}</a>
            <button type="button" data-source="${escapeHtml(place.name)}">Source checked</button>
            <button type="button" data-shortlist="${escapeHtml(place.name)}" data-category="Place" data-url="${sourceLinkForPlace(place)}">Save to Trip</button>
            <button type="button" data-capture="${escapeHtml(place.name)}">Capture image/video</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderDashboard(profile) {
    return renderTodayPage(profile, routePlaceForProfile(profile));
  }

  function renderJules() {
    const weather = latestWeather("boisBlanc");
    return `
      <div class="jules-flow">
        ${julesFlow.map((title) => `
          <section class="choice-card jules-card">
            <h3>${title}</h3>
            <p>${julesCopy(title, weather)}</p>
            <div class="action-row">
              <button type="button" data-complete-activity="${escapeHtml(title)}">Done</button>
              ${title.includes("Photos") ? `<button type="button" data-capture="Captain Jules photo">Take picture</button>` : ""}
            </div>
          </section>
        `).join("")}
      </div>
    `;
  }

  function julesCopy(title, weather) {
    const map = {
      "Captain Today": "Pick one safe captain choice. Grownups choose the choices.",
      "Weather": weather ? weatherSummaryFor(currentProfile(), weather, weather.location.name) : "Jacket? Rain? Wind? Check with a grownup.",
      "Ferry / Boats": "Cars go on a boat. Captain eyes open.",
      "Big Machines": "Spot trucks, boats, ramps, or bridges. Say what job they do.",
      "Stars": "Look up. Use red light. Stay with grownups.",
      "Badges": "Earn badge cards when you help the trip.",
      "Photos": "Take a picture with help.",
      "Done / Next choice": "Choose the next safe mission."
    };
    return map[title] || "Captain choice.";
  }

  function latestWeather(id) {
    return state.weather?.[id];
  }

  function renderSubpage(profile) {
    if (activePage === "today") return renderTodayPage(profile, routePlaceForProfile(profile));
    const title = activePage === "gps" ? "GPS" : activePage[0].toUpperCase() + activePage.slice(1);
    return `
      <div class="subpage">
        <div class="subpage-head">
          <button type="button" data-nav="today">Back to Today</button>
          <h3>${title}</h3>
        </div>
        ${renderPageContent(profile, activePage)}
      </div>
    `;
  }

  function renderPageContent(profile, page) {
    const place = routePlaceForProfile(profile);
    const map = {
      today: () => renderTodayPage(profile, place),
      route: () => renderRoutePage(profile, place),
      explore: () => renderExplorePage(profile),
      nearby: () => renderNearbyPage(profile),
      learn: () => renderLearnPage(profile, place),
      lens: () => renderLensPage(profile),
      rewards: () => renderRewardsPage(profile),
      memories: () => renderMemoriesPage(profile),
      gps: () => renderGpsPage(),
      detail: () => renderDetailPage(profile),
      weather: () => renderWeatherPage(profile),
      stars: () => renderStarsPage(profile),
      ferry: () => renderFerryPage(profile),
      activities: () => renderActivitiesPage(profile),
      badges: () => renderBadgesPage(profile),
      saved: () => renderSavedPage(profile),
      votes: () => renderVotesPage(true),
      stops: () => renderStopsPage(),
      photos: () => renderPhotosPage(profile),
      sources: () => renderSourcesPage(),
      settings: () => renderSettingsPage()
    };
    return (map[page] || map.today)();
  }

  function renderExplorePage(profile) {
    const attractions = allAttractions();
    return `
      <div class="choice-card">
        <strong>Explore Map</strong>
        <p>Every route-relevant place in the trip data appears here. Tap a marker for a detail card, or open the list below while offline.</p>
        <div class="action-row"><button type="button" data-start-gps="true">Start GPS</button><button type="button" data-nav="nearby">Nearest places</button></div>
      </div>
      <div class="maplibre-panel">
        <div class="section-head compact-head"><strong>Attraction clusters</strong><span class="map-caption">${attractions.length} route places</span></div>
        <p id="exploreMapStatus" class="map-caption">Route clusters and map pins use the same verified attraction list.</p>
        <div id="exploreMapPanel"></div>
      </div>
      <div id="exploreDetail"></div>
      <div class="attraction-list">
        ${attractions.map((item) => placeCard(item, profile)).join("")}
      </div>
    `;
  }

  function renderNearbyPage(profile) {
    const items = nearestAttractions(state.lastPosition, 10);
    return `
      <div class="choice-card">
        <strong>Nearby learning stops</strong>
        <p>${state.lastPosition ? "Sorted from your live GPS location." : "Start GPS to sort these by where you actually are. Until then, this shows the route learning set."}</p>
        <div class="action-row"><button type="button" data-start-gps="true">Start GPS</button><button type="button" data-nav="explore">Open Explore Map</button></div>
      </div>
      <div class="nearby-list">
        ${items.map((item) => `
          <article class="choice-card nearby-card">
            <strong>${item.title}</strong>
            <p>${item.place}. ${item.summary || item.why}</p>
            ${Number.isFinite(item.distance) ? `<p><strong>${item.distance.toFixed(1)} miles away</strong> by straight-line GPS estimate.</p>` : ""}
            <div class="action-row">
              <button type="button" data-detail="${escapeHtml(item.title)}">View details</button>
              <a class="external-link" href="${sourceLinkForPlace(item)}" target="_blank" rel="noopener">${sourceLabelForPlace(item)}</a>
              <button type="button" data-capture="${escapeHtml(item.title)}">Capture image/video</button>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderLensPage(profile) {
    const drafts = state.draftPhotos.filter((item) => profile.id === "momdad" || item.profile === activeProfile);
    const last = state.journal[0];
    return `
      <div class="choice-card lens-card">
        <strong>Real Life Lens</strong>
        <p>Take or upload a real photo. It stays here after Use Photo, then you can analyze it, add notes, and save it to the Trip Summary.</p>
        <div class="action-row">
          <button type="button" data-capture="Real Life Lens" data-analyze-photo="true">Take Photo</button>
          <button type="button" data-nav="memories">Open Photo Journal</button>
        </div>
      </div>
      <div class="photo-analysis-stack">
        ${drafts.map((item) => renderDraftPhotoCard(item, profile)).join("") || `<p class="map-caption">No photo waiting. Tap Take Photo to start.</p>`}
      </div>
      ${last ? `<h4>Last saved</h4>${renderJournalEntry(last, 0, profile)}` : ""}
    `;
  }

  function renderDraftPhotoCard(item, profile) {
    const analysis = analysisViewModel(item.analysis, profile);
    const pendingDelete = state.pendingDelete?.collection === "draft" && state.pendingDelete?.id === item.id;
    return `
      <article class="photo-analysis-card">
        <img src="${item.dataUrl}" alt="${escapeHtml(item.label)}">
        <div class="photo-analysis-body">
          <div class="section-head compact-head">
            <div>
              <p class="eyebrow">${escapeHtml(item.status || "Ready")}</p>
              <h3>${escapeHtml(item.label || "Photo Analysis")}</h3>
            </div>
            <small>${new Date(item.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small>
          </div>
          <div class="compact-actions">
            <button type="button" data-analyze-draft="${item.id}">Analyze</button>
            <button type="button" data-save-draft="${item.id}">Save</button>
            <button type="button" data-remove-photo="draft:${item.id}">Remove</button>
          </div>
          ${pendingDelete ? renderInlineDelete("draft", item.id) : ""}
          <div class="analysis-result">
            ${item.status === "Analyzing..." ? `<p><strong>Analyzing...</strong></p>` : ""}
            ${item.analysisError ? `<p class="warning-note">${escapeHtml(item.analysisError)}</p>` : ""}
            ${item.analysis ? `
              <h4>What it is</h4><p>${escapeHtml(analysis.what)}</p>
              <h4>Why it matters</h4><p>${escapeHtml(analysis.why)}</p>
              <h4>Trip connection</h4><p>${escapeHtml(analysis.trip)}</p>
              <h4>For kids</h4><p>${escapeHtml(analysis.kids)}</p>
              <h4>Fun fact</h4><p>${escapeHtml(analysis.fact)}</p>
            ` : `<p class="map-caption">Analysis result will appear here.</p>`}
          </div>
          <label class="notes-field">Notes<textarea data-draft-note="${item.id}" placeholder="What made this memorable?">${escapeHtml(item.notes || "")}</textarea></label>
        </div>
      </article>
    `;
  }

  function renderInlineDelete(collection, id) {
    return `
      <div class="inline-confirm">
        <span>Remove this photo?</span>
        <button type="button" data-confirm-remove="${collection}:${id}">Remove</button>
        <button type="button" data-cancel-remove="true">Keep</button>
      </div>
    `;
  }

  function renderLearnPage(profile, place) {
    return `
      <div class="learning-hub">
        <div class="choice-card">
          <strong>Learning hub</strong>
          <p>Pick one thing to notice, learn, or capture. This keeps the trip playful before we leave and useful while we are moving.</p>
          <div class="action-row">
            <button type="button" data-nav="activities">Activities</button>
            <button type="button" data-nav="stars">Stars</button>
            <button type="button" data-nav="ferry">Ferry</button>
            <button type="button" data-nav="weather">Weather</button>
          </div>
        </div>
        ${placeCard(place, profile)}
        ${renderActivitiesPage(profile)}
        ${renderStarsPage(profile)}
        ${renderFerryPage(profile)}
      </div>
    `;
  }

  function renderRewardsPage(profile) {
    return `
      <div class="learning-hub">
        <div class="choice-card">
          <strong>Rewards and family picks</strong>
          <p>See what has been earned, saved, voted on, or approved without hunting through separate tabs.</p>
        </div>
        ${renderBadgesPage(profile)}
        ${renderSavedPage(profile)}
      </div>
    `;
  }

  function renderMemoriesPage(profile) {
    return `
      <div class="learning-hub">
        <div class="choice-card">
          <strong>Trip Summary</strong>
          <p>Saved photos, attraction history, badges, notes, and route stats become the family travel scrapbook.</p>
          ${renderTripStats(profile)}
          ${renderAttractionHistory(profile)}
          <div class="action-row"><button type="button" data-nav="lens">Take Photo</button><button type="button" data-nav="nearby">Nearby attractions</button></div>
        </div>
        ${renderPhotosPage(profile)}
      </div>
    `;
  }

  function renderTripStats(profile) {
    const savedPlaces = Object.values(state.shortlist || {}).filter((item) => profile.id === "momdad" || item.profile === profile.id);
    const badgeCount = badgesForProfile(profile.id).length;
    const historical = allAttractions().filter((item) => /museum|history|historic|arch|dame|studebaker/i.test(`${item.title} ${item.summary}`)).length;
    const parks = allAttractions().filter((item) => /national park|dunes|nps/i.test(`${item.title} ${item.summary}`)).length;
    return `
      <div class="trip-stats">
        <span><strong>${data.route.totalOutboundMiles.toLocaleString()}</strong><small>route miles</small></span>
        <span><strong>6</strong><small>states</small></span>
        <span><strong>${savedPlaces.length}</strong><small>saved</small></span>
        <span><strong>${Object.keys(state.visitedStops || {}).length}</strong><small>visited</small></span>
        <span><strong>${state.journal.length}</strong><small>photos</small></span>
        <span><strong>${badgeCount}</strong><small>badges</small></span>
        <span><strong>${parks}</strong><small>parks</small></span>
        <span><strong>${historical}</strong><small>history stops</small></span>
      </div>
    `;
  }

  function renderAttractionHistory(profile) {
    const saved = Object.values(state.shortlist || {}).filter((item) => profile.id === "momdad" || item.profile === profile.id);
    const visited = Object.values(state.visitedStops || {}).filter((item) => profile.id === "momdad" || item.profile === profile.id);
    return `
      <div class="attraction-history">
        <section>
          <h4>Visited</h4>
          ${visited.map((item) => `<button type="button" data-preview-stop="${escapeHtml(item.name)}"><strong>${escapeHtml(item.name)}</strong><span>${new Date(item.visitedAt).toLocaleDateString()}</span></button>`).join("") || `<p>No visited stops yet.</p>`}
        </section>
        <section>
          <h4>Saved</h4>
          ${saved.map((item) => `<button type="button" data-preview-stop="${escapeHtml(item.name)}"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.category || "Saved stop")}</span></button>`).join("") || `<p>No saved stops yet.</p>`}
        </section>
      </div>
    `;
  }

  function selectedDetailPlace() {
    const parts = (location.hash || "").replace(/^#\/?/, "").split("/").filter(Boolean);
    const target = decodeURIComponent(parts.slice(2).join("/") || "");
    return data.route.routePlaces.find((place) => place.name === target) || routePlaceForProfile(currentProfile());
  }

  function renderDetailPage(profile) {
    const place = selectedDetailPlace();
    return `
      <article class="choice-card detail-hero">
        <img src="${routeVisualForPlace(place)}" alt="${escapeHtml(place.image?.alt || place.name)}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImageForPlace(place)}';">
        <div>
          <p class="eyebrow">${place.place}</p>
          <h3>${place.name}</h3>
          <p>${place.why}</p>
          <p>${place.profiles?.[profile.id] || place.profiles?.momdad || ""}</p>
          <p><strong>Best fit:</strong> ${profile.name}. <strong>Route context:</strong> ${place.milesFromStart ? `${place.milesFromStart} miles from home area` : "Island or flexible context"}.</p>
          <div class="action-row">
            <a class="external-link" href="${sourceLinkForPlace(place)}" target="_blank" rel="noopener">${sourceLabelForPlace(place)}</a>
            <button type="button" data-shortlist="${escapeHtml(place.name)}" data-category="Place" data-url="${sourceLinkForPlace(place)}">Save to Trip</button>
            <button type="button" data-vote-item="${escapeHtml(place.name)}" data-choice="Yes">Family Vote: Yes</button>
            <button type="button" data-capture="${escapeHtml(place.name)}">Capture image/video</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderTodayPage(profile, place) {
    const features = data.dailyProfileFeatures[profile.id] || data.dailyProfileFeatures.momdad;
    const dayIndex = Math.max(0, data.days.findIndex((day) => day.date === selectedDayDate()));
    const feature = features[dayIndex % features.length];
    return `
      <div class="learning-hub">
        <div class="dashboard-hero">
          <p class="eyebrow">${profile.id === "momdad" ? "Family learning hub" : `${profile.name}'s learning hub`}</p>
          <h3>What can we learn today?</h3>
          <p>${profile.lens}</p>
          <div class="action-row">
            <button type="button" data-nav="route">Route</button>
            <button type="button" data-nav="learn">Learn</button>
            <button type="button" data-nav="rewards">Rewards</button>
            <button type="button" data-nav="memories">Memories</button>
          </div>
        </div>
        <div class="choice-card">
          <strong>${feature.title}</strong>
          <p>${feature.text}</p>
          <p><strong>Look for:</strong> ${feature.lookFor}</p>
          <div class="action-row"><button type="button" data-complete-activity="${escapeHtml(feature.title)}">Done</button><button type="button" data-capture="${escapeHtml(feature.title)}">Capture image/video</button></div>
        </div>
        ${placeCard(place, profile)}
        ${renderBadgesMini(profile)}
      </div>
    `;
  }

  function renderRoutePage(profile, place) {
    const simple = profile.id === "jules";
    return `
      <div class="choice-card">
        <strong>${simple ? "Road, ferry, island" : "Live route and location"}</strong>
        <p>${simple ? "First road. Then boat. Then island. Tap Start GPS so the map can find us." : "The in-app map uses MapLibre with no key. Tap Start GPS to show the current location, distance, and percent to the next destination."}</p>
        <div class="action-row">
          <button type="button" data-start-gps="true">Start GPS</button>
          <a class="external-link" href="${activeRouteUrl()}" target="_blank" rel="noopener">Open phone driving route</a>
          <a class="external-link" href="${data.mapLinks.returnUrl}" target="_blank" rel="noopener">Open return route</a>
        </div>
      </div>
      <div class="maplibre-panel">
        <div class="section-head compact-head">
          <strong>Route map</strong>
          <span id="mapMode" class="map-caption">Open map; tap Start GPS to show your location</span>
        </div>
        <div id="routeMapPanel"></div>
      </div>
      ${placeCard(place, profile)}
      ${renderStopsPage()}
    `;
  }

  function renderGpsPage() {
    const pos = state.lastPosition;
    return `
      <div class="choice-card">
        <strong>GPS status: ${state.gpsStatus || "Off"}</strong>
        <p>${state.trackingStatus || "Off"}</p>
        <dl>
          <div><dt>Accuracy</dt><dd>${pos ? `${Math.round(pos.accuracy)} meters` : "Not available"}</dd></div>
          <div><dt>Coordinates</dt><dd>${pos ? `${pos.lat.toFixed(5)}, ${pos.lon.toFixed(5)}` : "Not available"}</dd></div>
          <div><dt>Last updated</dt><dd>${pos ? new Date(pos.updatedAt).toLocaleString() : "Not available"}</dd></div>
          <div><dt>Destination miles</dt><dd>${milesLeft().toLocaleString()}</dd></div>
        </dl>
      </div>
    `;
  }

  function renderWeatherPage(profile) {
    return `
      <div class="choice-card">
        <strong>Weather source status</strong>
        <p>Open-Meteo is used with no API key. Data is cached for 30 minutes, follows live GPS when location is enabled, and displays Fahrenheit, mph, and inches.</p>
        <div class="action-row"><button type="button" id="refreshWeather" data-weather-refresh="true">Refresh weather</button><a class="external-link" href="${data.sourceLinks.weather.url}" target="_blank" rel="noopener">Open weather source</a></div>
      </div>
      ${renderRadarPanel()}
      <div id="weatherBlocks" class="weather-grid">${renderWeatherBlocksMarkup(profile, weatherLocationsForContext().map((location) => state.weather[location.id] || { location, sourceStatus: "Not available" }))}</div>
    `;
  }

  function activeRadarStation() {
    if (state.phase === "island" || state.phase === "return") return data.radarStations.find((station) => station.id === "KAPX");
    if (selectedDayDate() === "2026-08-01") return data.radarStations.find((station) => station.id === "KAPX");
    if (selectedDayDate() === "2026-07-31") return data.radarStations.find((station) => station.id === "KIWX");
    return data.radarStations.find((station) => station.id === "KAPX") || data.radarStations[0];
  }

  function renderRadarPanel() {
    const active = activeRadarStation();
    const stations = data.radarStations || [];
    return `
      <article class="choice-card radar-card">
        <strong>Live radar</strong>
        <p>National Weather Service radar station: ${active.label}. If the embedded view is slow, use the station buttons below.</p>
        <iframe title="NWS radar ${active.id}" loading="lazy" src="${active.url}"></iframe>
        <div class="radar-links">
          ${stations.map((station) => `<a class="external-link" href="${station.url}" target="_blank" rel="noopener">${station.id}: ${station.label}</a>`).join("")}
        </div>
      </article>
    `;
  }

  function renderWeatherBlocks(results) {
    const container = byId("weatherBlocks");
    if (container) container.innerHTML = renderWeatherBlocksMarkup(currentProfile(), results);
  }

  function renderWeatherBlocksMarkup(profile, results) {
    return results.map((weather) => `
      <article class="choice-card">
        <strong>${weather.location?.name || "Weather"}</strong>
        <p>${weatherSummaryFor(profile, weather, weather.location?.name || "Location")}</p>
        ${renderWeatherMetrics(weather)}
        ${renderSunMetrics(weather)}
        ${renderHourlyWeather(weather)}
        <p><strong>Status:</strong> ${weather.sourceStatus || "Cached"}${weather.fetchedAt ? `, updated ${new Date(weather.fetchedAt).toLocaleString()}` : ""}</p>
        <ul>${weatherFlags(weather).map((flag) => `<li>${flag}</li>`).join("")}</ul>
      </article>
    `).join("");
  }

  function renderStarsPage(profile) {
    const island = state.weather.boisBlanc;
    const cloud = island?.hourly?.cloud_cover?.[0];
    return `
      <div class="choice-card">
        <strong>STARZ guide</strong>
        <p>${starsCopy(profile, cloud)}</p>
        <p><strong>Source status:</strong> ${island ? `Weather ${island.sourceStatus}, updated ${new Date(island.fetchedAt).toLocaleString()}` : "Needs verification. Use source links before heading out."}</p>
        <p><strong>Overhead:</strong> ${data.stars.overhead.join("; ")}.</p>
        <p><strong>Horizon:</strong> ${data.stars.horizon.join("; ")}.</p>
        <ul>${data.stars.checklist.map((item) => `<li>${item}</li>`).join("")}</ul>
        <div class="action-row">
          <a class="external-link" href="${data.stars.clearDarkSky}" target="_blank" rel="noopener">Open Clear Dark Sky chart</a>
          <button type="button" data-complete-activity="Stargazing session">Stargazing done</button>
        </div>
      </div>
    `;
  }

  function starsCopy(profile, cloud) {
    const cloudText = cloud === undefined ? "Cloud cover is not live yet." : `Cloud cover estimate is ${cloud}%.`;
    const copy = {
      elsie: `${cloudText} Let your eyes adjust for 20 minutes. Teach someone Vega, Deneb, and Altair.`,
      katrina: `${cloudText} Why it matters: darker skies reveal patterns people used for navigation and stories.`,
      emma: `${cloudText} Best family setup: blankets, timing, bug spray, and a clear backup if clouds win.`,
      eliette: `${cloudText} Look for color, sparkle, moon reflections, and cozy visual patterns.`,
      jules: `${cloudText} Look up. Find a big shape. Stay with grownups. Use red light.`,
      momdad: `${cloudText} Verify Clear Dark Sky, cloud cover, wind, humidity, and safe viewing location before heading out.`
    };
    return copy[profile.id] || copy.elsie;
  }

  function renderFerryPage(profile) {
    if (profile.id === "elsie") {
      return `<div class="choice-card"><strong>Water crossing facts</strong><p>Look for boats, waves, ropes, ramps, gulls, and shoreline changes. Adults handle schedule pressure.</p><a class="external-link" href="${data.ferry.learnMore}" target="_blank" rel="noopener">Open official ferry site</a></div>`;
    }
    const risk = state.weather.cheboygan ? weatherFlags(state.weather.cheboygan).join(", ") : "Needs weather verification";
    return `
      <div class="choice-card">
        <strong>${profile.id === "jules" ? "Cars go on a boat" : "Plaunt Transportation ferry"}</strong>
        <p>${data.ferry.terminal}. ${data.ferry.route}. Crossing: ${data.ferry.crossing}.</p>
        <p><strong>Schedule status:</strong> Live ferry schedule is not embedded yet. Verify times on the official Plaunt Transportation site before departure.</p>
        <p><strong>Weather/ferry risk:</strong> ${risk}.</p>
        <ul>${data.ferry.reminders.map((item) => `<li>${item}</li>`).join("")}</ul>
        <div class="action-row">
          <a class="external-link" href="${data.ferry.learnMore}" target="_blank" rel="noopener">Open official ferry schedule</a>
          ${profile.id === "momdad" ? `<button type="button" data-approve="Plaunt ferry plan">Approve ferry plan</button>` : ""}
        </div>
      </div>
    `;
  }

  function profileActivities(profile) {
    return data.activityBoard[profile.id] || [];
  }

  function renderActivitiesPage(profile) {
    const completed = new Set(state.completed.filter((item) => item.profile === activeProfile).map((item) => item.activityTitle));
    const items = profileActivities(profile).filter((item) => !completed.has(item.title)).slice(0, 10);
    return `
      <div class="activity-board">
        ${items.map((item) => `
          <article class="activity-item">
            <h4>${item.title}</h4>
            <p>${item.detail}</p>
            <p><strong>Look for:</strong> ${item.lookFor}</p>
            <div class="action-row">
              <a class="external-link" href="${item.link}" target="_blank" rel="noopener">Open official source</a>
              <button type="button" data-complete-activity="${escapeHtml(item.title)}">Done</button>
              <button type="button" data-shortlist="${escapeHtml(item.title)}" data-category="${escapeHtml(item.type)}" data-url="${item.link}">Save to Trip</button>
              <button type="button" data-capture="${escapeHtml(item.title)}">Capture image/video</button>
              <button type="button" data-vote-item="${escapeHtml(item.title)}" data-choice="Yes">Family Vote: Yes</button>
              <button type="button" data-vote-item="${escapeHtml(item.title)}" data-choice="Maybe">Maybe</button>
              <button type="button" data-vote-item="${escapeHtml(item.title)}" data-choice="Skip">Skip</button>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="completed-list">${state.completed.filter((item) => item.profile === activeProfile).slice(-6).map((item) => `<span class="saved-pill">Completed: ${item.activityTitle}</span>`).join("") || `<span class="saved-pill">Complete an activity and a new one appears.</span>`}</div>
    `;
  }

  function renderBadgesMini(profile) {
    return `<h3>Recent badges</h3>${renderBadgeShelf(profile.id)}<button type="button" data-nav="badges">View all badges</button>`;
  }

  function renderBadgesPage(profile) {
    const earned = profile.id === "momdad"
      ? data.profiles.flatMap((p) => badgesForProfile(p.id).map((badge) => ({ ...badge, ownerName: p.name })))
      : badgesForProfile(profile.id);
    const upcoming = upcomingBadges(profile.id, 20);
    return `
      <div class="badge-page">
        <h4>Earned</h4>
        <div class="badge-grid">${earned.map((badge) => badgeCard(badge, profile.id === "momdad")).join("") || `<p>No badges earned yet.</p>`}</div>
        <h4>Upcoming</h4>
        <div class="badge-grid">${upcoming.map((badge) => badgeCard({ ...badge, upcoming: true }, false)).join("")}</div>
      </div>
    `;
  }

  function badgeCard(badge, showOwner) {
    return `
      <button type="button" class="badge-card ${badge.upcoming ? "is-locked" : "is-earned"}" data-badge="${badge.id}">
        <strong>${badge.title}</strong>
        <span>${badge.category} - ${badge.segment}</span>
        <small>${badge.upcoming ? badge.locked : badge.earned}${showOwner && badge.ownerName ? ` (${badge.ownerName})` : ""}</small>
      </button>
    `;
  }

  function renderSavedPage(profile) {
    const entries = Object.entries(state.shortlist).filter(([, item]) => profile.id === "momdad" || item.profile === activeProfile);
    return `
      <div class="saved-list">
        ${entries.map(([key, item]) => `
          <div class="choice-card">
            <strong>${item.name}</strong>
            <p>${item.category || "Trip item"} - ${item.date}${profile.id === "momdad" ? ` - ${profileName(item.profile)}` : ""}</p>
            <div class="action-row">
              ${item.sourceUrl ? `<a class="external-link" href="${item.sourceUrl}" target="_blank" rel="noopener">Open official source</a>` : ""}
              <button type="button" data-remove-shortlist="${escapeHtml(key)}">Remove</button>
              ${profile.id === "momdad" ? `<button type="button" data-approve="${escapeHtml(item.name)}">Approve into plan</button>` : ""}
            </div>
          </div>
        `).join("") || `<p>No Trip Shortlist items yet.</p>`}
      </div>
      ${renderVotesPage(profile.id === "momdad")}
    `;
  }

  function profileName(id) {
    return data.profiles.find((profile) => profile.id === id)?.name || id;
  }

  function renderVotesPage(parentView) {
    const rows = Object.entries(state.votes).map(([key, votes]) => {
      const totals = ["Yes", "Maybe", "Skip"].map((choice) => `${choice}: ${Object.values(votes).filter((vote) => vote.choice === choice).length}`).join(" | ");
      return `<div class="choice-card"><strong>${key.split(":").slice(1).join(":") || key}</strong><p>${totals}</p>${parentView ? `<p>${Object.entries(votes).map(([profile, vote]) => `${profileName(profile)}: ${vote.choice}`).join(", ")}</p><button type="button" data-approve="${escapeHtml(key)}">Approve into plan</button>` : ""}</div>`;
    }).join("");
    return `<div><h4>Family Votes</h4>${rows || `<p>No Family Votes yet.</p>`}</div>`;
  }

  function renderStopsPage() {
    const stops = data.route.restStops.filter((stop) => stop.date === selectedDayDate());
    return `
      <div class="choice-card">
        <strong>${isTravelDay() ? "Route-specific stops and supplies" : "Open island day"}</strong>
        ${isTravelDay() ? `<ul>${stops.map((stop) => `<li><strong>${stop.name}</strong><br>${stop.timing}. ${stop.note}</li>`).join("")}</ul>` : `<p>No road-stop planner today. Use island weather, activities, and family votes.</p>`}
      </div>
      <div class="choice-card">
        <strong>Arrival checklist</strong>
        <ul><li>Before boarding ferry: gas, snacks, water, restroom, weather, ferry confirmation.</li><li>On island: orient, unload, check weather, choose a light first activity.</li><li>If arriving late or weather shifts: keep the plan small and save adventures for the next day.</li></ul>
      </div>
    `;
  }

  function renderPhotosPage(profile) {
    const drafts = state.draftPhotos.filter((item) => profile.id === "momdad" || item.profile === activeProfile);
    const journal = state.journal.map((item, index) => ({ ...item, index })).filter((item) => profile.id === "momdad" || item.profile === activeProfile);
    const captures = state.captures.map((item, index) => ({ ...item, index })).filter((item) => profile.id === "momdad" || item.profile === activeProfile);
    return `
      ${state.storageWarning ? `<p class="warning-note">${escapeHtml(state.storageWarning)}</p>` : ""}
      <div class="action-row"><button type="button" data-nav="lens">Take Photo</button><button type="button" data-capture="Trip photo">Save photo/video</button></div>
      ${drafts.length ? `<h4>Ready to save</h4><div class="photo-analysis-stack">${drafts.map((item) => renderDraftPhotoCard(item, profile)).join("")}</div>` : ""}
      <h4>Photo Journal</h4>
      <div class="journal-list">
        ${journal.map((item) => renderJournalEntry(item, item.index, profile)).join("") || `<p>No analyzed journal entries yet.</p>`}
      </div>
      <h4>Family Memory Timeline</h4>
      <div class="memory-timeline">${journal.map((item) => `<article><strong>${new Date(item.at).toLocaleDateString()}</strong><span>${escapeHtml(item.label)} · ${escapeHtml(item.nearest || "route memory")}</span></article>`).join("") || `<p>No saved timeline entries yet.</p>`}</div>
      <h4>Saved media</h4>
      <div class="summary-grid">
        ${captures.map((item) => `
          <div class="summary-tile">
            ${item.type.startsWith("image/") ? `<img class="summary-photo" src="${item.dataUrl}" alt="${escapeHtml(item.label)}">` : `<span>Video saved: ${escapeHtml(item.name || item.label)}</span>`}
            <span>${escapeHtml(item.label)} - ${new Date(item.at).toLocaleDateString()}${profile.id === "momdad" ? ` - ${profileName(item.profile)}` : ""}</span>
            ${state.pendingDelete?.collection === "capture" && state.pendingDelete?.id === (item.id || String(item.index)) ? renderInlineDelete("capture", item.id || String(item.index)) : ""}
            <button type="button" data-remove-photo="capture:${item.id || item.index}">Delete</button>
          </div>
        `).join("") || `<p>No captured moments yet.</p>`}
      </div>
      <p class="map-caption">Media is stored on this device with a size limit. Delete old captures if storage gets tight.</p>
    `;
  }

  function renderJournalEntry(item, index, profile) {
    const analysis = item.analysis || {};
    const model = analysisViewModel(analysis, profile);
    const summary = analysis.summary || analysis.description || item.analysisError || "Analysis is not available yet.";
    const tags = Array.isArray(analysis.tags) ? analysis.tags : [];
    const pendingDelete = state.pendingDelete?.collection === "journal" && state.pendingDelete?.id === item.id;
    return `
      <article class="choice-card journal-entry">
        ${item.type?.startsWith("image/") ? `<img class="summary-photo" src="${item.dataUrl}" alt="${escapeHtml(item.label)}">` : ""}
        <div>
          <strong>${escapeHtml(item.label || "Trip photo")}</strong>
          <p>${escapeHtml(summary)}</p>
          ${item.analysis ? `<details><summary>Analysis</summary><p><strong>What it is:</strong> ${escapeHtml(model.what)}</p><p><strong>Why it matters:</strong> ${escapeHtml(model.why)}</p><p><strong>Trip connection:</strong> ${escapeHtml(model.trip)}</p><p><strong>For kids:</strong> ${escapeHtml(model.kids)}</p><p><strong>Fun fact:</strong> ${escapeHtml(model.fact)}</p></details>` : ""}
          <p><strong>Nearest:</strong> ${escapeHtml(item.nearest || "Unknown until GPS is enabled")}</p>
          <p><strong>GPS:</strong> ${item.gps ? `${item.gps.lat.toFixed(5)}, ${item.gps.lon.toFixed(5)}` : "Not saved"}</p>
          ${tags.length ? `<div class="tag-list">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
          <label class="notes-field">Notes<textarea data-journal-note="${item.id}" placeholder="What made this memorable?">${escapeHtml(item.notes || "")}</textarea></label>
          ${pendingDelete ? renderInlineDelete("journal", item.id) : ""}
          <div class="action-row">
            <button type="button" data-remove-photo="journal:${item.id}">Delete</button>
            ${profile.id === "momdad" ? `<button type="button" data-approve="${escapeHtml(item.label || "Photo Journal item")}">Approve into story</button>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  function renderSourcesPage() {
    const weatherStatus = Object.values(state.weather || {}).length ? "Cached or live Open-Meteo data available" : "Weather not fetched yet";
    return `
      <div class="source-grid">
        <div class="choice-card"><strong>Data status</strong><p>Weather: ${weatherStatus}. GPS: ${state.gpsStatus}. Route map: MapLibre/OpenFreeMap in the app; phone-map links open outside the app for turn-by-turn driving.</p></div>
        ${Object.values(data.sourceLinks).map((source) => `<div class="choice-card"><strong>${source.label}</strong><p><a class="external-link" href="${source.url}" target="_blank" rel="noopener">${source.label}</a></p></div>`).join("")}
      </div>
    `;
  }

  function renderSettingsPage() {
    return `
      <div class="source-grid">
        <div class="choice-card"><strong>Location</strong><p>GPS status: ${state.gpsStatus}. ${state.trackingStatus || ""}</p><button type="button" data-start-gps="true">Start GPS</button></div>
        <div class="choice-card"><strong>Offline cache</strong><p>The app shell and trip data are cached for road use. Cache version: v24.</p></div>
        <div class="choice-card"><strong>Photo storage</strong><p>${state.storageWarning || "Photos are stored on this device for the trip summary."}</p></div>
        <div class="choice-card"><strong>Sources</strong><p>Official links and data status are available in Trip Info.</p><button type="button" data-nav="sources">Trip Info</button></div>
      </div>
    `;
  }

  function renderProfile() {
    parseHash();
    const profile = currentProfile();
    byId("profileView").style.setProperty("--profile-accent", profile.accent || "#1f78a4");
    byId("profileTitle").textContent = profile.id === "jules" ? "Captain Jules" : profile.id === "momdad" ? "Mom/Dad logistics" : `${profile.name}'s dashboard`;
    byId("profileView").innerHTML = `<div class="top-badge-row">${renderBadgeShelf(profile.id)}</div>${renderSubpage(profile)}`;
    byId("activeTraveler").textContent = `${profile.name}'s view`;
    if (activePage === "weather" && navigator.onLine && !Object.keys(state.weather || {}).length) {
      setTimeout(refreshWeatherCards, 0);
    }
  }

  function handleAppTap(event) {
    const target = event.target.closest("button, a");
    if (!target) return;
    if (target.matches("[data-close-modal]")) {
      closeBadgeModal();
      return;
    }
    if (target.matches("[data-close-cluster]")) {
      const drawer = byId("clusterDrawer");
      if (drawer) drawer.hidden = true;
      return;
    }
    if (target.dataset.closeStopDrawer !== undefined) {
      event.preventDefault();
      const drawer = byId("bottomDrawer");
      if (drawer) drawer.innerHTML = "";
      return;
    }
    if (target.dataset.stopGps !== undefined) {
      event.preventDefault();
      stopLocation();
      return;
    }
    if (target.dataset.refreshRoute !== undefined) {
      event.preventDefault();
      refreshActiveRoute(true);
      return;
    }
    if (target.dataset.toggleElsieRadar !== undefined) {
      event.preventDefault();
      state.elsieRadarCollapsed = !state.elsieRadarCollapsed;
      saveState();
      const radar = byId("elsieRadar");
      if (radar) radar.outerHTML = renderElsieRadarMarkup();
      return;
    }
    if (target.dataset.toggleUploadedStops !== undefined) {
      event.preventDefault();
      const panel = byId("uploadedStopsPanel");
      if (!panel) return;
      panel.classList.toggle("is-collapsed");
      panel.classList.remove("is-mobile-peek");
      target.textContent = panel.classList.contains("is-collapsed") ? "Stops" : "Hide";
      return;
    }
    if (target.id === "activeTraveler") {
      byId("splash")?.classList.remove("is-hidden");
      return;
    }
    if (target.id === "mainMenuButton") {
      event.preventDefault();
      toggleMainMenu(true);
      return;
    }
    if (target.dataset.closeMenu !== undefined) {
      event.preventDefault();
      toggleMainMenu(false);
      return;
    }
    if (target.dataset.menuNav) {
      event.preventDefault();
      toggleMainMenu(false);
      navTo(target.dataset.menuNav);
      return;
    }
    if (target.dataset.previewStop) {
      event.preventDefault();
      const item = attractionForName(target.dataset.previewStop);
      if (item) showAttractionPreview(item);
      return;
    }
    if (target.dataset.stopDetail) {
      event.preventDefault();
      const item = attractionForName(target.dataset.stopDetail);
      if (item) showStopDetailDrawer(item);
      return;
    }
    if (target.dataset.routeStop) {
      event.preventDefault();
      openAppleRoute(target.dataset.routeStop);
      return;
    }
    if (target.dataset.visitedStop) {
      event.preventDefault();
      markStopVisited(target.dataset.visitedStop);
      return;
    }
    if (target.dataset.profileChoice) {
      event.preventDefault();
      chooseProfile(target.dataset.profileChoice);
      return;
    }
    if (target.dataset.nav) {
      event.preventDefault();
      navTo(target.dataset.nav);
      return;
    }
    if (target.dataset.navGlobal) {
      event.preventDefault();
      if (!state.hasChosenProfile) {
        byId("splash")?.classList.remove("is-hidden");
        return;
      }
      navTo(target.dataset.navGlobal);
      return;
    }
    if (target.dataset.detail) {
      event.preventDefault();
      const item = attractionForName(target.dataset.detail) || data.route.routePlaces.find((place) => place.name === target.dataset.detail);
      if (item) showAttractionPreview(item);
      return;
    }
    if (target.dataset.openDetail) {
      event.preventDefault();
      location.hash = `/${activeProfile}/detail/${encodeURIComponent(target.dataset.openDetail)}`;
      return;
    }
    if (target.dataset.badge) {
      event.preventDefault();
      showBadgeDetail(target.dataset.badge);
      return;
    }
    if (target.dataset.adventureBadge) {
      event.preventDefault();
      showAdventureBadgeDetail(target.dataset.adventureBadge);
      return;
    }
    if (target.dataset.shortlist) {
      event.preventDefault();
      saveShortlist({ name: target.dataset.shortlist, category: target.dataset.category, sourceUrl: target.dataset.url });
      return;
    }
    if (target.dataset.need) {
      event.preventDefault();
      state.needNow = target.dataset.need;
      awardByTrigger("need", { need: state.needNow });
      saveState();
      renderBottomDrawer();
      renderNeedResults();
      setAction(`${state.needNow} selected. Showing route-aware options.`);
      return;
    }
    if (target.dataset.removeShortlist) {
      event.preventDefault();
      removeShortlist(target.dataset.removeShortlist);
      return;
    }
    if (target.dataset.voteItem) {
      event.preventDefault();
      familyVote(target.dataset.voteItem, target.dataset.choice);
      return;
    }
    if (target.dataset.approve) {
      event.preventDefault();
      approvePlan(target.dataset.approve);
      return;
    }
    if (target.dataset.completeActivity) {
      event.preventDefault();
      completeActivity(target.dataset.completeActivity);
      return;
    }
    if (target.dataset.capture) {
      event.preventDefault();
      startCapture(target.dataset.capture, target.dataset.analyzePhoto !== undefined);
      return;
    }
    if (target.dataset.analyzeDraft) {
      event.preventDefault();
      analyzeDraftPhotoById(target.dataset.analyzeDraft);
      return;
    }
    if (target.dataset.saveDraft) {
      event.preventDefault();
      saveDraftPhotoById(target.dataset.saveDraft);
      return;
    }
    if (target.dataset.removePhoto) {
      event.preventDefault();
      const [collection, id] = target.dataset.removePhoto.split(":");
      requestDeletePhoto(collection, id);
      return;
    }
    if (target.dataset.confirmRemove) {
      event.preventDefault();
      const [collection, id] = target.dataset.confirmRemove.split(":");
      confirmDeletePhoto(collection, id);
      return;
    }
    if (target.dataset.cancelRemove) {
      event.preventDefault();
      cancelDeletePhoto();
      return;
    }
    if (target.dataset.deleteCapture) {
      event.preventDefault();
      deleteCapture(Number(target.dataset.deleteCapture));
      return;
    }
    if (target.dataset.source) {
      event.preventDefault();
      awardBadge("source-checker", { source: target.dataset.source });
      setAction(`Source checked: ${target.dataset.source}.`);
      return;
    }
    if (target.dataset.weatherRefresh !== undefined) {
      event.preventDefault();
      refreshWeatherCards();
      return;
    }
    if (target.dataset.startGps !== undefined) {
      event.preventDefault();
      useLocation();
    }
  }

  function wireEvents() {
    const on = (id, eventName, handler) => {
      const element = byId(id);
      if (element) element.addEventListener(eventName, handler);
    };
    on("activeTraveler", "click", () => {
      const splash = byId("splash");
      if (splash) splash.classList.remove("is-hidden");
    });
    on("useLocation", "click", useLocation);
    on("stopLocation", "click", stopLocation);
    on("startTrip", "click", () => setPhase("outbound"));
    on("markArrived", "click", () => setPhase("island"));
    on("startReturn", "click", () => setPhase("return"));
    on("completeTrip", "click", () => setPhase("complete"));
    document.querySelectorAll("[data-need]").forEach((button) => {
      button.addEventListener("click", () => {
        state.needNow = button.dataset.need;
        awardByTrigger("need", { need: state.needNow });
        setAction(`${state.needNow} selected. Showing route-aware options.`);
      });
    });
    window.addEventListener("hashchange", render);
    window.addEventListener("online", renderTripStatus);
    window.addEventListener("offline", renderTripStatus);
    document.addEventListener("click", handleAppTap);
    document.addEventListener("click", (event) => {
      if (event.target?.id === "badgeDetailOverlay") {
        closeBadgeModal();
      }
    });
    document.addEventListener("mouseover", (event) => {
      const target = event.target.closest("[data-preview-stop]");
      if (!target || event.pointerType === "touch") return;
      const item = attractionForName(target.dataset.previewStop);
      if (item) showAttractionPreview(item);
    });
    document.addEventListener("mouseover", (event) => {
      const target = event.target.closest("[data-adventure-badge]");
      if (!target) return;
      target.title = adventureBadgeHoverText(target.dataset.adventureBadge);
    });
    document.addEventListener("focusin", (event) => {
      const target = event.target.closest("[data-preview-stop]");
      if (!target) return;
      const item = attractionForName(target.dataset.previewStop);
      if (item) showAttractionPreview(item);
    });
    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.dataset?.draftNote) updateDraftNoteById(target.dataset.draftNote, target.value);
      if (target.dataset?.journalNote) updateJournalNoteById(target.dataset.journalNote, target.value);
    });
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-include-dunes]")) {
        state.includeIndianaDunes = target.checked;
        state.initialLegDistanceMeters = null;
        saveState();
        render();
        refreshActiveRoute(true);
      }
      if (target.matches("[data-elsie-rating]")) {
        state.profileStopRatings.elsie[target.dataset.elsieRating] = target.value;
        saveState();
      }
      if (target.matches("[data-elsie-collection]")) {
        const key = target.dataset.elsieCollection;
        const values = new Set(state.profileCollections.elsie[key] || []);
        target.checked ? values.add(target.value) : values.delete(target.value);
        state.profileCollections.elsie[key] = [...values];
        saveState();
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && activeProfile === "elsie" && state.gpsStatus === "Active") refreshActiveRoute();
    });
    document.addEventListener("keydown", (event) => {
      const modal = document.getElementById("badgeDetailOverlay");
      if (event.key === "Tab" && modal) {
        const focusable = [...modal.querySelectorAll("button, a[href], input, [tabindex]:not([tabindex='-1'])")].filter((item) => !item.disabled);
        if (focusable.length) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
        return;
      }
      if (event.key !== "Escape") return;
      closeBadgeModal();
      if (activeProfile === "elsie") {
        const drawer = byId("bottomDrawer");
        if (drawer) drawer.innerHTML = "";
      }
    });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    let reloadedForUpdate = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloadedForUpdate) return;
      reloadedForUpdate = true;
      window.location.reload();
    });
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      registration.update().catch(() => {});
      window.setInterval(() => registration.update().catch(() => {}), 10 * 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registration.update().catch(() => {});
      });
    }).catch(() => {});
  }

  function render() {
    parseHash();
    document.body.dataset.page = activePage;
    document.body.dataset.profile = activeProfile;
    if (activeProfile === "elsie") {
      const [title, subtitle] = elsieHeaderCopy();
      byId("topbarTitle").textContent = title;
      byId("topbarMeta").textContent = subtitle;
    } else {
      byId("topbarTitle").textContent = "Family Trip";
      byId("topbarMeta").textContent = `${currentProfile().name}'s view`;
    }
    if (!state.hasChosenProfile) byId("splash").classList.remove("is-hidden");
    renderCountdowns();
    renderTripStatus();
    if (isHomeMapPage()) {
      renderTopBadgePreview();
      renderHomeMapPanel();
      renderBottomDrawer();
      byId("activeTraveler").textContent = `${currentProfile().name}'s view`;
    } else {
      document.body.classList.remove("elsie-map-active");
      stopRadarAnimation();
      closeElsieSheet();
      if (homeMap) {
        homeMap.remove();
        homeMap = null;
      }
      const homePanel = byId("homeRouteMapPanel");
      if (homePanel) homePanel.innerHTML = "";
      const preview = byId("homeAttractionPreview");
      if (preview) {
        preview.hidden = true;
        preview.innerHTML = "";
      }
      const drawer = byId("bottomDrawer");
      if (drawer) drawer.innerHTML = "";
      const badgePreview = byId("topBadgePreview");
      if (badgePreview) badgePreview.innerHTML = "";
      renderProfile();
      renderRouteMapPanel();
      renderExploreMapPanel();
    }
    renderRouteQuest();
    renderBottomNav();
    renderMainMenu();
  }

  renderDaySelect();
  renderSplashProfiles();
  if (state.hasChosenProfile) byId("splash").classList.add("is-hidden");
  if (!location.hash) location.hash = `/${activeProfile}/explore`;
  wireEvents();
  wireCaptureInput();
  registerServiceWorker();
  render();
})();
