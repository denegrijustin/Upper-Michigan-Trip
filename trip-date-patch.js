(function () {
  const data = window.TRIP_DATA;
  if (!data) return;

  // Correct real-world trip dates while keeping existing internal day keys stable
  // for route logic that still uses the original day identifiers.
  data.dates = {
    depart: "2026-07-24T08:00:00-05:00",
    arriveIsland: "2026-07-25T17:00:00-04:00",
    departIsland: "2026-08-01T09:00:00-04:00",
    complete: "2026-08-02T21:00:00-05:00"
  };

  data.dateDisplayMap = {
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

  data.displayDate = function displayDate(date) {
    return data.dateDisplayMap[date] || date;
  };

  data.days.forEach((day) => {
    day.displayDate = data.displayDate(day.date);
  });

  function sourcedPlace(item) {
    return {
      ...item,
      sourceLabel: "Learn More",
      source: { ...item.source, label: "Learn More" },
      learnMore: item.source.url
    };
  }

  const eastboundRoutePlaces = [
    sourcedPlace({
      id: "columbia-rocheport-missouri-river",
      category: "city",
      name: "Columbia / Rocheport Missouri River stretch",
      place: "Columbia and Rocheport, Missouri",
      day: "2026-07-31",
      milesFromStart: 150,
      image: {
        url: "https://www.visitcolumbiamo.com/wp-content/uploads/2021/04/VisitColumbiaMO.jpg",
        alt: "Columbia Missouri visitor view near the first eastbound reset stretch",
        credit: "Visit Columbia MO",
        sourceUrl: "https://www.visitcolumbiamo.com/"
      },
      source: { url: "https://www.visitcolumbiamo.com/", type: "tourism", confidence: "high" },
      why: "A practical first reset zone on I-70 with college-town energy, Missouri River context, and good service density.",
      profiles: {
        elsie: "Animal and setting lens: watch how the road changes around river bluffs, trees, and open Missouri stretches.",
        katrina: "Why question: why do towns grow near rivers, highways, and colleges?",
        emma: "Everyday-life lens: college towns show food, sports, traffic, students, and routines all at once.",
        eliette: "Detail hunt: look for murals, signs, campus colors, river-town textures, and small stop souvenirs.",
        jules: "Captain reset: decide if the crew needs bathroom, snack, or truck spotting.",
        momdad: "Good first eastbound reset window; route-relevant and practical before St. Louis."
      }
    }),
    sourcedPlace({
      id: "gateway-arch-national-park",
      category: "national-park",
      name: "Gateway Arch",
      place: "St. Louis, Missouri",
      day: "2026-07-31",
      milesFromStart: 260,
      image: {
        url: "https://www.nps.gov/common/uploads/cropped_image/primary/3C7F2389-1DD8-B71B-0B89B5A435368B0E.jpg",
        alt: "Gateway Arch rising above the St. Louis riverfront",
        credit: "National Park Service",
        sourceUrl: "https://www.nps.gov/jeff/index.htm"
      },
      source: { url: "https://www.nps.gov/jeff/index.htm", type: "federal", confidence: "high" },
      why: "A 630-foot monument on the Mississippi River tied to westward expansion, river travel, engineering, and the big St. Louis route moment.",
      profiles: {
        elsie: "Suspense-light angle: giant metal arch, river crossings, and old travel stories make this feel dramatic without being scary.",
        katrina: "Random fact: the Arch is as wide as it is tall. Ask why a monument about movement is shaped like a doorway.",
        emma: "Big-picture angle: St. Louis grew because rivers, roads, sports, food, and people all connected there.",
        eliette: "Shiny thing alert: stainless steel outside, river views, souvenir possibilities, and a strong photo moment.",
        jules: "Big build question: how did people build something that tall and curved?",
        momdad: "Strong visual landmark on the eastbound route. Downtown detour may cost time, but it is route-relevant."
      }
    }),
    sourcedPlace({
      id: "casey-illinois-big-things",
      category: "roadside",
      name: "Big Things Small Town",
      place: "Casey, Illinois",
      day: "2026-07-31",
      milesFromStart: 405,
      image: {
        url: "https://www.enjoyillinois.com/assets/Tourism-Operators/images/Big-Things-in-a-Small-Town-wind-chime-3627822d4a0ff3df2f9a278efabed4c7.jpg",
        alt: "A giant roadside attraction in Casey Illinois",
        credit: "Enjoy Illinois",
        sourceUrl: "https://www.bigthingssmalltown.com/"
      },
      source: { url: "https://www.bigthingssmalltown.com/", type: "tourism", confidence: "high" },
      why: "A playful I-70 stop full of oversized everyday objects, photo moments, and quick kid-friendly curiosity.",
      profiles: {
        elsie: "Teacher lens: giant everyday objects are easy to explain because everyone knows what a chair, pencil, or mailbox is.",
        katrina: "Why question: why would a small town build giant objects, and how can one odd idea become local history?",
        emma: "Everyday-life lens: normal things become funny and interesting when scale changes. Great compare-and-rate stop.",
        eliette: "Detail and nicknack radar: look for tiny souvenirs near the giant things, fun signs, colors, and photo angles.",
        jules: "Captain mission: find the biggest thing and announce what job it would do if a giant used it.",
        momdad: "Good morale stop near I-70 if timing allows. It is eastbound, memorable, and easier than a deep city detour."
      }
    }),
    sourcedPlace({
      id: "indianapolis-motor-speedway-museum",
      category: "museum",
      name: "Indianapolis Motor Speedway Museum",
      place: "Speedway / Indianapolis, Indiana",
      day: "2026-07-31",
      milesFromStart: 500,
      image: {
        url: "https://www.indianapolismotorspeedway.com/-/media/IMS/images/at-the-track/museum/museum-exterior.jpg",
        alt: "Indianapolis Motor Speedway Museum exterior",
        credit: "Indianapolis Motor Speedway",
        sourceUrl: "https://www.indianapolismotorspeedway.com/at-the-track/museum"
      },
      source: { url: "https://www.indianapolismotorspeedway.com/at-the-track/museum", type: "museum", confidence: "high" },
      why: "A route-relevant Indiana stop about race cars, engineering, speed, teamwork, and the Indianapolis 500.",
      profiles: {
        elsie: "Story lens: racing has pressure, timing, decisions, and suspense without needing horror.",
        katrina: "History lens: ask how one race became a tradition people know all over the country.",
        emma: "Sports and real-life lens: teams, fans, routines, food, traffic, and community all organize around race day.",
        eliette: "Shiny detail watch: paint colors, numbers, trophies, logos, helmets, and small design choices.",
        jules: "Big machine jackpot: cars, wheels, speed, engines, and a huge track.",
        momdad: "Possible indoor route stop if time allows; verify hours/tours before committing."
      }
    }),
    sourcedPlace({
      id: "notre-dame-south-bend",
      category: "history",
      name: "Notre Dame",
      place: "South Bend, Indiana",
      day: "2026-07-31",
      milesFromStart: 585,
      image: {
        url: "https://www.nd.edu/assets/images/about/history/1200/sorin-arrives-1200.jpg",
        alt: "Historic Notre Dame campus image",
        credit: "University of Notre Dame",
        sourceUrl: "https://www.nd.edu/about/history/"
      },
      source: { url: "https://www.nd.edu/about/history/", type: "official", confidence: "high" },
      why: "A famous university town stop with campus, sports history, architecture, and dinner nearby.",
      profiles: {
        elsie: "Look for campus details that feel like a story setting: old buildings, symbols, and quiet paths.",
        katrina: "Ask what makes a college become famous over generations: sports, traditions, buildings, people, or stories?",
        emma: "Sports and everyday-life angle: college towns revolve around games, students, food, and routines.",
        eliette: "Look for bookstore/souvenir possibilities, pretty architecture, and small details on signs or buildings.",
        jules: "Football place. Big field energy. Captain question: food first or quick look first?",
        momdad: "Good dinner-area anchor for July 24; keep meal goal protected."
      }
    }),
    sourcedPlace({
      id: "studebaker-national-museum",
      category: "museum",
      name: "Studebaker National Museum",
      place: "South Bend, Indiana",
      day: "2026-07-31",
      milesFromStart: 585,
      image: {
        url: "https://studebakermuseum.org/wp-content/uploads/2020/08/SNM-Exterior.jpg",
        alt: "Studebaker National Museum exterior",
        credit: "Studebaker National Museum",
        sourceUrl: "https://studebakermuseum.org/"
      },
      source: { url: "https://studebakermuseum.org/", type: "museum", confidence: "high" },
      why: "A museum about vehicles and the Studebaker company, from wagons to cars.",
      profiles: {
        elsie: "Cause-and-effect: wagons became cars because people needed better ways to move families and goods.",
        katrina: "Great random-fact stop: a company can change from one kind of transportation to another as the world changes.",
        emma: "Everyday-life angle: transportation changes how people work, shop, travel, and play.",
        eliette: "Look for shiny car details, logos, colors, handles, and old-fashioned design choices.",
        jules: "Vehicles. Wheels. Big machine history. Strong Jules stop if time and energy allow.",
        momdad: "Good backup if arriving early in South Bend or needing an indoor activity."
      }
    })
  ];

  const keepLaterPlaces = data.route.routePlaces.filter((place) =>
    place.day !== "2026-07-31" && !place.name.includes("Brown v. Board")
  );
  data.route.routePlaces = [...eastboundRoutePlaces, ...keepLaterPlaces];

  if (data.profilePlacePreferences) {
    Object.keys(data.profilePlacePreferences).forEach((profile) => {
      data.profilePlacePreferences[profile] = data.profilePlacePreferences[profile]
        .filter((name) => !name.includes("Brown v. Board"));
    });
    data.profilePlacePreferences.elsie = ["Gateway Arch", "Notre Dame", "Studebaker National Museum", "Mackinac Bridge / Straits of Mackinac"];
    data.profilePlacePreferences.katrina = ["Gateway Arch", "Notre Dame", "Columbia / Rocheport Missouri River stretch", "Mackinac Bridge / Straits of Mackinac"];
    data.profilePlacePreferences.emma = ["Notre Dame", "Indianapolis Motor Speedway Museum", "Studebaker National Museum", "Indiana Dunes National Park"];
    data.profilePlacePreferences.eliette = ["Big Things Small Town", "Gateway Arch", "Notre Dame", "Studebaker National Museum"];
    data.profilePlacePreferences.jules = ["Indianapolis Motor Speedway Museum", "Studebaker National Museum", "Plaunt Transportation Ferry", "Mackinac Bridge / Straits of Mackinac"];
    data.profilePlacePreferences.momdad = ["Columbia / Rocheport Missouri River stretch", "Gateway Arch", "Notre Dame", "Studebaker National Museum"];
  }

  if (data.activityBoard) {
    const replacements = {
      elsie: {
        title: "Arch teacher fact card",
        type: "Route",
        detail: "Turn the Gateway Arch into one simple fact younger kids could understand.",
        link: "https://www.nps.gov/jeff/index.htm",
        lookFor: "River, shape, height, travel story",
        capture: "Photo or note of your simple fact"
      },
      katrina: {
        title: "Missouri River why chain",
        type: "Route",
        detail: "Build a three-step why chain: river, road, town.",
        link: "https://www.visitcolumbiamo.com/",
        lookFor: "Why towns and roads gather near rivers",
        capture: "Photo of your why chain"
      }
    };
    Object.entries(data.activityBoard).forEach(([profile, items]) => {
      data.activityBoard[profile] = items.map((item) => {
        const joined = `${item.title} ${item.detail} ${item.link}`;
        if (!joined.includes("Brown v. Board") && !joined.includes("brvb")) return item;
        return replacements[profile] || {
          title: "Gateway route fact",
          type: "Route",
          detail: "Find one eastbound route fact that connects a place to travel, rivers, food, or local life.",
          link: "https://www.nps.gov/jeff/index.htm",
          lookFor: "A route-relevant detail",
          capture: "Photo or note"
        };
      });
    });
  }

  if (Array.isArray(data.badgeCatalog)) {
    data.badgeCatalog = data.badgeCatalog.filter((badge) => !String(badge[3] || "").includes("Brown v. Board"));
    data.badgeCatalog.splice(3, 0,
      ["columbia-reset-scout", "Columbia Reset Scout", "Stops", "Columbia / Rocheport", "source", ["all"], "Learn why this is a smart first eastbound reset zone.", "You found the first reset story.", "https://www.visitcolumbiamo.com/"],
      ["big-things-finder", "Big Things Finder", "Place", "Casey Big Things", "source", ["eliette", "jules", "emma"], "Find the giant roadside idea in Casey, Illinois.", "You found a giant little-town story.", "https://www.bigthingssmalltown.com/"],
      ["speedway-story", "Speedway Story", "Place", "Indianapolis Motor Speedway", "source", ["emma", "jules", "katrina"], "Learn why Indianapolis became a racing landmark.", "You unlocked the speedway story.", "https://www.indianapolismotorspeedway.com/at-the-track/museum"]
    );
  }
})();
