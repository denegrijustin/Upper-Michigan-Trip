(function () {
  const data = window.TRIP_DATA;
  const state = loadState();
  let activeProfile = state.profile || "elsie";
  let watchId = null;
  let routeMap = null;
  let routeLayer = null;
  let userMarker = null;

  const phaseOrder = ["pretrip", "outbound", "island", "return", "complete"];
  const phaseLabels = {
    pretrip: "Pre-trip",
    outbound: "Outbound",
    island: "Island stay",
    return: "Return trip",
    complete: "Trip complete"
  };

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem("tripState")) || defaultState();
    } catch {
      return defaultState();
    }
  }

  function defaultState() {
    return {
      phase: "pretrip",
      progress: 0,
      packDownloaded: false,
      favorites: {},
      votes: {},
      approved: [],
      dismissed: [],
      completed: [],
      actionMessage: "No action yet."
    };
  }

  function ensureCollections() {
    state.favorites ||= {};
    state.votes ||= {};
    state.approved ||= [];
    state.dismissed ||= [];
    state.completed ||= [];
  }

  function saveState() {
    ensureCollections();
    localStorage.setItem("tripState", JSON.stringify(state));
  }

  function setAction(message) {
    state.actionMessage = message;
    saveState();
    render();
  }

  function itemKey(name) {
    return `${activeProfile}:${selectedDayDate()}:${name}`;
  }

  function toggleFavorite(name) {
    ensureCollections();
    const key = itemKey(name);
    if (state.favorites[key]) {
      delete state.favorites[key];
      setAction(`Removed ${name} from ${currentProfile().name}'s favorites.`);
      return;
    }
    state.favorites[key] = { name, profile: activeProfile, date: selectedDayDate(), addedAt: new Date().toISOString() };
    setAction(`Saved ${name} for ${currentProfile().name}.`);
  }

  function voteFor(name) {
    ensureCollections();
    const key = itemKey(name);
    state.votes[key] = (state.votes[key] || 0) + 1;
    setAction(`${currentProfile().name} voted for ${name}.`);
  }

  function approvePlan(name) {
    ensureCollections();
    const key = itemKey(name);
    if (!state.approved.includes(key)) state.approved.push(key);
    setAction(`Mom/Dad approved ${name} for the real plan.`);
  }

  function dismissItem(name) {
    ensureCollections();
    const key = itemKey(name);
    if (!state.dismissed.includes(key)) state.dismissed.push(key);
    setAction(`Skipped ${name} for now.`);
  }

  function currentProfile() {
    return data.profiles.find((item) => item.id === activeProfile) || data.profiles[0];
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function daysBetween(a, b) {
    return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / 86400000));
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

  function todayTripDay() {
    const now = new Date();
    const exact = data.days.find((day) => day.date === now.toISOString().slice(0, 10));
    return exact || data.days[0];
  }

  function selectedDay() {
    return data.days.find((day) => day.date === byId("daySelect").value) || todayTripDay();
  }

  function selectedDayDate() {
    return selectedDay().date;
  }

  function isTravelDay(date) {
    return ["2026-07-31", "2026-08-01", "2026-08-08"].includes(date);
  }

  function isFerryRelevant() {
    const day = selectedDayDate();
    return day === "2026-08-01" || state.phase === "island" || state.phase === "return";
  }

  function travelStage() {
    const day = selectedDayDate();
    if (day === "2026-07-31") return "road-to-south-bend";
    if (day === "2026-08-01") return "south-bend-to-ferry";
    if (day === "2026-08-08" || state.phase === "return") return "return-home";
    return "island";
  }

  function currentRouteContext() {
    const day = selectedDayDate();
    if (state.phase === "return" || day === "2026-08-08") return "Return route toward home";
    if (state.phase === "island" || (day >= "2026-08-02" && day <= "2026-08-07")) return "Bois Blanc Island";
    if (day === "2026-08-01") return "South Bend to Cheboygan to Bois Blanc";
    return "Olathe to South Bend";
  }

  function activeDestination() {
    const day = selectedDayDate();
    if (state.phase === "return" || day === "2026-08-08") return data.route.destinationTargets.home;
    if (day === "2026-07-31") return data.route.destinationTargets.southBend;
    if (day === "2026-08-01" && state.phase !== "island") return data.route.destinationTargets.cheboygan;
    return data.route.destinationTargets.island;
  }

  function activeOrigin() {
    const day = selectedDayDate();
    if (state.phase === "return" || day === "2026-08-08") return data.route.coordinates.islandApprox;
    if (day === "2026-08-01" && state.phase !== "island") return data.route.coordinates.southBend;
    return data.route.coordinates.start;
  }

  function childTravelLine(profile) {
    const destination = activeDestination();
    const miles = milesLeft();
    const minutes = Math.max(10, Math.round((miles / 62) * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeText = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;
    const joke = data.travelJokes.find((item) => miles <= item.maxMiles).joke;
    if (profile.id === "momdad") {
      return {
        title: "Adult travel readout",
        text: `${miles.toLocaleString()} miles / about ${timeText} to ${destination.label}.`
      };
    }
    return {
      title: `${profile.name}'s road update`,
      text: `${miles.toLocaleString()} miles, about ${timeText}, to ${destination.label}. Dad joke: ${joke}`
    };
  }

  function preTripGameFor(profile) {
    const options = data.preTripGame.filter((item) => item.bestFor.includes(profile.id) || item.bestFor.includes("all"));
    return options[(new Date(selectedDayDate()).getDate() + profile.name.length) % options.length] || data.preTripGame[0];
  }

  function dailyFeatureFor(profile) {
    const features = data.dailyProfileFeatures[profile.id] || data.dailyProfileFeatures.momdad;
    return features[(new Date(selectedDayDate()).getDate() + profile.name.length) % features.length];
  }

  function routePlaceFor(profile) {
    const day = selectedDayDate();
    const candidates = data.route.routePlaces.filter((place) => place.day === day);
    const pool = candidates.length ? candidates : data.route.routePlaces;
    return pool[(new Date(day).getDate() + profile.name.length) % pool.length];
  }

  function phaseProgressPercent() {
    const now = new Date();
    const depart = new Date(data.dates.depart);
    const arriveIsland = new Date(data.dates.arriveIsland);
    const departIsland = new Date(data.dates.departIsland);
    const complete = new Date(data.dates.complete);
    if (state.phase === "pretrip") {
      const created = new Date("2026-05-30T00:00:00-05:00");
      return clamp(((now - created) / (depart - created)) * 100, 0, 100);
    }
    if (state.phase === "outbound") {
      return progressForPhase();
    }
    if (state.phase === "island") {
      return clamp(((now - arriveIsland) / (departIsland - arriveIsland)) * 100, 0, 100);
    }
    if (state.phase === "return") {
      return progressForPhase();
    }
    return 100;
  }

  function tripOverallPercent() {
    const now = new Date();
    const depart = new Date(data.dates.depart);
    const complete = new Date(data.dates.complete);
    if (state.phase === "pretrip") {
      const created = new Date("2026-05-30T00:00:00-05:00");
      return clamp(((now - created) / (depart - created)) * 100, 0, 100);
    }
    return clamp(((now - depart) / (complete - depart)) * 100, 0, 100);
  }

  function setPhase(phase) {
    state.phase = phase;
    if (phase === "outbound") state.startedAt = new Date().toISOString();
    if (phase === "island") state.progress = 100;
    if (phase === "return") state.returnStartedAt = new Date().toISOString();
    if (phase === "complete") state.progress = 100;
    state.actionMessage = `Trip mode changed to ${phaseLabels[phase]}.`;
    saveState();
    render();
  }

  function progressForPhase() {
    if (state.phase === "pretrip") return 0;
    if (state.phase === "outbound") return clamp(state.progress || 18, 0, 100);
    if (state.phase === "island") return 100;
    if (state.phase === "return") return clamp(state.returnProgress || 12, 0, 100);
    return 100;
  }

  function milesLeft() {
    if (state.gpsMilesToActiveDestination && state.phase !== "complete") {
      return Math.round(state.gpsMilesToActiveDestination);
    }
    if (state.gpsMilesToFinal && state.phase !== "return" && state.phase !== "complete") {
      return Math.round(state.gpsMilesToFinal * 1.18);
    }
    const progress = progressForPhase();
    const total = state.phase === "return" ? data.route.totalReturnMiles : data.route.totalOutboundMiles;
    if (state.phase === "island") return 0;
    if (state.phase === "complete") return 0;
    return Math.round(total * (1 - progress / 100));
  }

  function updatePosition(position) {
    const point = { lat: position.coords.latitude, lon: position.coords.longitude };
    const destination = activeDestination();
    const origin = activeOrigin();
    const directMilesToDestination = haversineMiles(point, destination);
    const directRouteMiles = Math.max(1, haversineMiles(origin, destination));
    const directMilesFromOrigin = haversineMiles(origin, point);
    const routeAdjustedMiles = directMilesToDestination * 1.18;
    const percentToDestination = clamp((directMilesFromOrigin / directRouteMiles) * 100, 0, 100);
    const fromStart = haversineMiles(point, data.route.coordinates.start);
    const toFinal = haversineMiles(point, data.route.coordinates.islandApprox);
    state.gpsMilesToFinal = toFinal;
    state.gpsMilesToActiveDestination = routeAdjustedMiles;
    state.lastPosition = {
      lat: point.lat,
      lon: point.lon,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed,
      updatedAt: new Date().toISOString()
    };
    state.gpsStatus = `${Math.round(routeAdjustedMiles)} road miles est.`;
    state.destinationStatus = `${Math.round(percentToDestination)}% to ${destination.label}`;
    state.trackingStatus = `Live - ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    updateRealMap(point);
    if (state.phase === "pretrip" && fromStart > 1.5) {
      state.phase = "outbound";
      state.startedAt = state.startedAt || new Date().toISOString();
    }
    if (state.phase === "outbound") state.progress = percentToDestination;
    if (state.phase === "return") state.returnProgress = percentToDestination;
    saveState();
    render();
  }

  function nextStopText() {
    if (state.needNow) return `${state.needNow}: showing best cached options first.`;
    if (state.phase === "pretrip") return "Trip has not started yet. Play countdown games, learn the route, and download the trip pack.";
    if (state.phase === "outbound" && travelStage() === "road-to-south-bend") return "Next goal: clean stop rhythm, light lunch, and dinner in South Bend. No ferry logic today.";
    if (state.phase === "outbound") return "Next goal: road miles to Cheboygan, top-off stop, then Plaunt ferry.";
    if (state.phase === "island") return "Build today's adventure. Nothing is locked until parents approve it.";
    if (state.phase === "return") return "Return mode: track miles and percent left to home.";
    return "Trip complete. Save the journal and favorite memories.";
  }

  function renderCountdowns() {
    const now = new Date();
    const depart = new Date(data.dates.depart);
    const islandDepart = new Date(data.dates.departIsland);
    byId("daysUntil").textContent = state.phase === "island" ? daysBetween(now, islandDepart) : daysBetween(now, depart);
    byId("milesLeft").textContent = milesLeft().toLocaleString();
    byId("percentLeft").textContent = `${Math.round(100 - progressForPhase())}%`;
    byId("phaseLabel").textContent = phaseLabels[state.phase] || "Pre-trip";
    byId("heroTitle").textContent = state.phase === "return" ? "Homeward Bound" : state.phase === "island" ? selectedDay().title : "Bois Blanc Bound";
    byId("heroText").textContent = selectedDay().outlook;
    document.documentElement.style.setProperty("--lake", selectedDay().accent);
  }

  function renderProgressBars() {
    const phasePercent = Math.round(phaseProgressPercent());
    const overallPercent = Math.round(tripOverallPercent());
    byId("primaryProgressLabel").textContent = state.phase === "pretrip" ? "Countdown to launch" : "Whole trip progress";
    byId("primaryProgressText").textContent = `${overallPercent}%`;
    byId("primaryProgressBar").style.width = `${overallPercent}%`;
    byId("phaseProgressLabel").textContent =
      state.phase === "pretrip" ? "Pre-trip prep" :
      state.phase === "island" ? "Island time used" :
      state.phase === "return" ? "Return route complete" :
      state.phase === "outbound" ? "Current destination progress" : "Trip complete";
    byId("phaseProgressText").textContent = `${phasePercent}%`;
    byId("phaseProgressBar").style.width = `${phasePercent}%`;
  }

  function projectRoutePoint(point, bounds) {
    const width = 760;
    const height = 250;
    const left = 70;
    const top = 48;
    const x = left + ((point.lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
    const y = top + ((bounds.maxLat - point.lat) / (bounds.maxLat - bounds.minLat)) * height;
    return { x, y };
  }

  function renderAnchoredMap() {
    const svg = byId("routeSvg");
    if (!svg) return;
    const points = data.route.mapStops;
    const bounds = {
      minLat: Math.min(...points.map((point) => point.lat)),
      maxLat: Math.max(...points.map((point) => point.lat)),
      minLon: Math.min(...points.map((point) => point.lon)),
      maxLon: Math.max(...points.map((point) => point.lon))
    };
    const projected = points.map((point) => ({ ...point, ...projectRoutePoint(point, bounds) }));
    const line = projected.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
    const progress = progressForPhase() / 100;
    const segment = Math.min(projected.length - 2, Math.floor(progress * (projected.length - 1)));
    const local = progress * (projected.length - 1) - segment;
    const start = projected[segment];
    const end = projected[segment + 1] || projected[projected.length - 1];
    const dotX = start.x + (end.x - start.x) * local;
    const dotY = start.y + (end.y - start.y) * local;

    svg.innerHTML = `
      <path class="route-shadow" d="${line}"></path>
      <path class="route-line" d="${line}"></path>
      ${projected.map((point) => `
        <circle class="stop-dot ${point.type === "ferry" ? "ferry" : ""}" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${point.type === "route" ? 6 : 10}"></circle>
      `).join("")}
      <circle id="progressDot" class="progress-dot" cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="13"></circle>
      ${projected.filter((point) => point.type !== "route").map((point) => `
        <text x="${Math.min(810, point.x + 10).toFixed(1)}" y="${Math.max(26, point.y - 12).toFixed(1)}">${point.label}</text>
      `).join("")}
      <text class="map-caption" x="70" y="335">Anchored to trip waypoints, not a decorative route.</text>
    `;
  }

  function renderMapProgress() {
    renderAnchoredMap();
    initRealMap();
  }

  function initRealMap() {
    const mapContainer = byId("map");
    if (!window.L || routeMap) {
      if (!window.L) {
        mapContainer.classList.add("using-fallback");
        byId("mapMode").textContent = "Offline fallback map";
      }
      return;
    }
    mapContainer.classList.remove("using-fallback");
    byId("mapMode").textContent = "OpenStreetMap route";
    routeMap = L.map("leafletMap", { zoomControl: true, scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(routeMap);
    const latLngs = data.route.mapStops.map((point) => [point.lat, point.lon]);
    routeLayer = L.polyline(latLngs, { color: "#1f78a4", weight: 5, opacity: 0.86 }).addTo(routeMap);
    data.route.mapStops.forEach((point) => {
      L.circleMarker([point.lat, point.lon], {
        radius: point.type === "route" ? 4 : 7,
        color: point.type === "ferry" ? "#bd5a36" : "#163f33",
        fillColor: "#fffdf7",
        fillOpacity: 1,
        weight: 3
      }).addTo(routeMap).bindPopup(point.label);
    });
    routeMap.fitBounds(routeLayer.getBounds(), { padding: [20, 20] });
  }

  function updateRealMap(point) {
    if (!routeMap || !window.L) return;
    const latLng = [point.lat, point.lon];
    if (!userMarker) {
      userMarker = L.circleMarker(latLng, {
        radius: 9,
        color: "#ffffff",
        fillColor: "#f2c14e",
        fillOpacity: 1,
        weight: 4
      }).addTo(routeMap).bindPopup("You are here");
    } else {
      userMarker.setLatLng(latLng);
    }
    routeMap.panTo(latLng, { animate: true });
  }

  function renderTripStatus() {
    const profile = currentProfile();
    const line = childTravelLine(profile);
    byId("onlineStatus").textContent = navigator.onLine ? "Online" : "Offline - using cached trip data";
    byId("nextStop").textContent = nextStopText();
    byId("kidTravelUpdate").innerHTML = `<strong>${line.title}</strong><p>${line.text}</p>`;
    byId("actionStatus").textContent = state.actionMessage || "No action yet.";
    byId("packStatus").textContent = state.packDownloaded
      ? `${state.packStatus === "partial" ? "Partial cache" : "Ready"} - ${new Date(state.packDownloaded).toLocaleString()}`
      : "Not downloaded";
    byId("sinceStop").textContent = state.phase === "pretrip" ? "Not started" : "Track every 4-5 hours";
    byId("gpsStatus").textContent = state.gpsStatus || "Not requested";
    byId("destinationStatus").textContent = state.destinationStatus || activeDestination().label;
    byId("trackingStatus").textContent = state.trackingStatus || "Off";
  }

  function renderProfileTabs() {
    const container = byId("profileTabs");
    if (!container) return;
    container.innerHTML = "";
    data.profiles.forEach((profile) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = profile.name;
      button.setAttribute("aria-selected", String(profile.id === activeProfile));
      button.addEventListener("click", () => {
        activeProfile = profile.id;
        state.profile = profile.id;
        saveState();
        renderProfile();
        renderProfileTabs();
      });
      container.appendChild(button);
    });
  }

  function renderSplashProfiles() {
    const container = byId("splashProfiles");
    container.innerHTML = "";
    data.profiles.forEach((profile) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "splash-profile";
      button.dataset.profile = profile.id;
      button.style.setProperty("--profile-accent", profile.accent || "#1f78a4");
      const ageLabel = profile.age === "adult" ? "Adult full-detail view" : `Age ${profile.age} view`;
      button.innerHTML = `<strong>${profile.name}</strong><em>${ageLabel}</em><span>${profile.lens}</span>`;
      button.addEventListener("click", () => chooseProfile(profile.id));
      container.appendChild(button);
    });
  }

  function chooseProfile(profileId) {
    activeProfile = profileId;
    state.profile = profileId;
    state.hasChosenProfile = true;
    saveState();
    byId("splash").classList.add("is-hidden");
    render();
  }

  function renderProfile() {
    const day = selectedDay();
    const profile = currentProfile();
    const adventure = data.adventureOptions.find((item) => item.bestFor.includes(profile.id)) || data.adventureOptions[0];
    const isJules = profile.id === "jules";
    const locationContext = currentRouteContext();
    const ferryHidden = profile.suppressFerryLogistics && isFerryRelevant();
    const profilePrompt = profile.prompts[(new Date(day.date).getDate() + profile.name.length) % profile.prompts.length];
    const travelLine = childTravelLine(profile);
    const preGame = preTripGameFor(profile);
    const feature = dailyFeatureFor(profile);
    const routePlace = routePlaceFor(profile);
    const routeProfileText = routePlace.profiles[profile.id] || routePlace.profiles.momdad;
    byId("profileView").style.setProperty("--profile-accent", profile.accent || "#1f78a4");
    if (state.phase === "pretrip") {
      byId("profileView").innerHTML = `
        <div class="profile-grid">
          <div>
            <p class="eyebrow">Pre-trip game mode - ${profile.name}</p>
            <h3>Countdown Quest</h3>
            <p>${profile.lens}</p>
            <div class="choice-card kid-travel-update">
              <strong>${preGame.title}</strong>
              <p>${preGame.prompt}</p>
              <div class="action-row">
                <button type="button" data-complete-prompt="${preGame.title}: ${preGame.answer}">Reveal / learned it</button>
                <button type="button" data-favorite="${preGame.title}">Save game</button>
              </div>
            </div>
            <div class="choice-card">
              <strong>Today's real trip feature: ${feature.title}</strong>
              <p>${feature.text}</p>
              <p><strong>Look for:</strong> ${feature.lookFor}</p>
              <div class="action-row">
                <button type="button" data-favorite="${feature.title}">Save feature</button>
                <button type="button" data-complete-prompt="${feature.title}: ${feature.lookFor}">I know what to look for</button>
              </div>
            </div>
            <div class="choice-card">
              <strong>Real place preview: ${routePlace.name}</strong>
              <p>${routePlace.place}. ${routePlace.why}</p>
              <p>${routeProfileText}</p>
            </div>
            <div class="choice-card">
              <strong>What ${profile.name} should watch for on the trip</strong>
              <ul>${profile.routeInterests.map((item) => `<li>${item}</li>`).join("")}</ul>
            </div>
            <div class="choice-card parent-callout">
              <strong>Mom/Dad setup</strong>
              <p>${profile.parentNote}</p>
              <p>Use this before departure to build excitement without starting live travel mode.</p>
            </div>
          </div>
          <aside>
            <h3>Before we leave</h3>
            <p><strong>Goal:</strong> learn one thing, save one idea, and download the trip pack.</p>
            <div class="action-row">
              <button type="button" data-vote="${preGame.title}">Vote for this game</button>
              <button type="button" data-favorite="What ${profile.name} wants to see">Save watch list</button>
            </div>
            ${renderSavedSummary()}
          </aside>
        </div>
      `;
      byId("activeTraveler").textContent = `${profile.name}'s view`;
      return;
    }
    byId("profileView").innerHTML = `
      <div class="profile-grid">
        <div>
          <p class="eyebrow">${day.title} - ${locationContext}</p>
          <h3>${profile.name}'s view</h3>
          <p>${profile.lens}</p>
          <ul class="tag-list">${profile.tags.map((tag) => `<li>${tag}</li>`).join("")}</ul>
          <div class="choice-card">
            <strong>${isJules ? "Captain Jules mission" : `${profile.name}'s prompt`}</strong>
            <p>${profilePrompt}</p>
            <div class="action-row">
              <button type="button" data-save-prompt="${profilePrompt}">Save prompt</button>
              <button type="button" data-complete-prompt="${profilePrompt}">Did it</button>
            </div>
          </div>
          <div class="choice-card">
            <strong>Today's real trip feature: ${feature.title}</strong>
            <p>${feature.text}</p>
            <p><strong>Look for:</strong> ${feature.lookFor}</p>
          </div>
          <div class="choice-card">
            <strong>Real place on the route: ${routePlace.name}</strong>
            <p>${routePlace.place}. ${routePlace.why}</p>
            <p>${routeProfileText}</p>
            <div class="action-row">
              <button type="button" data-favorite="${routePlace.name}">Save place</button>
              <button type="button" data-vote="${routePlace.name}">Vote</button>
            </div>
          </div>
          <div class="choice-card kid-travel-update">
            <strong>${travelLine.title}</strong>
            <p>${travelLine.text}</p>
          </div>
          <div class="choice-card parent-callout">
            <strong>Mom/Dad note about ${profile.name}</strong>
            <p>${profile.parentNote}</p>
            <p><strong>Child-facing:</strong> ${profilePrompt}</p>
          </div>
          <div class="choice-card">
            <strong>Stop along the route for ${profile.name}</strong>
            <ul>${profile.routeInterests.map((item) => `<li>${item}</li>`).join("")}</ul>
            <div class="action-row">
              <button type="button" data-favorite="Route stop for ${profile.name}">Save route idea</button>
              <button type="button" data-vote="Route stop for ${profile.name}">Vote for this</button>
            </div>
          </div>
          ${ferryHidden ? `
            <div class="choice-card">
              <strong>Elsie's version</strong>
              <p>Adults are handling ferry timing. Your view stays focused on water-crossing facts, island arrival details, and small-animal lookout ideas.</p>
            </div>
          ` : ""}
        </div>
        <aside>
          <h3>${profile.name}'s specific pick</h3>
          <p><strong>${adventure.name}</strong></p>
          <p>${adventure.why}</p>
          <ul>${profile.islandInterests.map((item) => `<li>${item}</li>`).join("")}</ul>
          <div class="action-row">
            <button type="button" data-favorite="${adventure.name}">Favorite</button>
            <button type="button" data-vote="${adventure.name}">Vote</button>
            <button type="button" data-approve="${adventure.name}">Approve</button>
            <button type="button" data-dismiss="${adventure.name}">Skip</button>
          </div>
          <div class="choice-card parent-callout">
            <strong>Why this fits ${profile.name}</strong>
            <p>${profile.parentNote}</p>
          </div>
          <ul class="mini-list">
            <li>${adventure.effort}</li>
            <li>${adventure.bring}</li>
          </ul>
        </aside>
      </div>
    `;
    byId("activeTraveler").textContent = `${profile.name}'s view`;
  }

  function renderDaySelect() {
    const select = byId("daySelect");
    if (select.children.length) return;
    data.days.forEach((day) => {
      const option = document.createElement("option");
      option.value = day.date;
      option.textContent = `${day.date.slice(5)} - ${day.title}`;
      select.appendChild(option);
    });
    select.value = todayTripDay().date;
    select.addEventListener("change", render);
  }

  function renderCards() {
    const day = selectedDay();
    const profile = currentProfile();
    const travelStops = data.route.restStops.filter((stop) => stop.date === day.date);
    const preGame = preTripGameFor(profile);
    const routePlace = routePlaceFor(profile);
    const stopsMarkup = state.phase === "pretrip"
      ? `<p>Trip has not started. Stop planning is in preview mode: learn what the route will feel like before live travel begins.</p>
        <div class="choice-card">
          <strong>Pre-trip route game</strong>
          <p>${preGame.prompt}</p>
          <div class="action-row">
            <button type="button" data-complete-prompt="${preGame.title}: ${preGame.answer}">Reveal / learned it</button>
            <button type="button" data-favorite="${preGame.title}">Save game</button>
          </div>
        </div>`
      : isTravelDay(day.date)
      ? `<p>Specific to ${day.title}: these are planning windows, not generic stops.</p>
        <ul>${travelStops.map((stop) => `<li><strong>${stop.name}</strong> <span class="map-caption">${stop.timing}</span><br>${stop.note}</li>`).join("")}</ul>`
      : `<p>No road-stop planner today. This only appears on travel days so island days stay open and flexible.</p>`;
    byId("stopsCard").innerHTML = `
      <p class="eyebrow">Smart stops</p>
      <h3>${state.phase === "pretrip" ? "Pre-trip route games" : isTravelDay(day.date) ? "Route-specific stop plan" : "Island mode"}</h3>
      ${stopsMarkup}
      <div class="action-row">
        <button type="button" data-need="Bathroom now">Bathroom now</button>
        <button type="button" data-need="Gas now">Gas now</button>
        <button type="button" data-need="Food now">Food now</button>
        <button type="button" data-favorite="${isTravelDay(day.date) ? `${day.title} stop plan` : "Island open day"}">Save stop plan</button>
      </div>
    `;
    const ferryForElsie = profile.suppressFerryLogistics;
    const ferryRelevant = isFerryRelevant();
    byId("ferryCard").innerHTML = ferryRelevant ? `
      <p class="eyebrow">Ferry</p>
      <h3>${ferryForElsie ? "Water crossing facts" : "Plaunt Transportation"}</h3>
      <p>${ferryForElsie ? "Adults handle timing. This view keeps ferry logistics out of Elsie's experience." : data.ferry.terminal}</p>
      ${ferryForElsie ? `<div class="choice-card parent-callout"><strong>Mom/Dad note</strong><p>Elsie does not need ferry schedule pressure. Keep schedule/check-in decisions in the adult view and offer her observation prompts instead.</p></div>` : ""}
      <ul>${(ferryForElsie ? ["Look for boats, gulls, waves, and shoreline changes.", "Think about how islands depend on ferries.", "Save suspense for shipwreck stories, not schedule stress."] : data.ferry.reminders).map((item) => `<li>${item}</li>`).join("")}</ul>
      <div class="action-row">
        <button type="button" data-favorite="${ferryForElsie ? "Water crossing facts" : "Plaunt ferry plan"}">Save</button>
        ${profile.id === "momdad" ? `<button type="button" data-approve="Plaunt ferry plan">Approve ferry plan</button>` : ""}
      </div>
    ` : `
      <p class="eyebrow">Ferry</p>
      <h3>Not today</h3>
      <p>Today is the road segment to South Bend. Ferry timing stays hidden until the Cheboygan travel day.</p>
      <div class="choice-card parent-callout">
        <strong>Mom/Dad note</strong>
        <p>Keep the focus on clean stops, lunch timing, and dinner in South Bend. The app will shift to ferry logic on August 1.</p>
      </div>
    `;
    byId("starsCard").innerHTML = `
      <p class="eyebrow">Stars</p>
      <h3>Night-sky guide</h3>
      <p>${data.stars.tonight}</p>
      <ul>${data.stars.checklist.slice(0, 5).map((item) => `<li>${item}</li>`).join("")}</ul>
      <div class="action-row">
        <button type="button" data-favorite="Night-sky blanket session">Favorite stars</button>
        <button type="button" data-vote="Night-sky blanket session">Vote</button>
      </div>
    `;
    byId("adventureCard").innerHTML = `
      <p class="eyebrow">Island</p>
      <h3>Kid-specific adventure board</h3>
      <p>No generic local taste run. Each child gets specific ideas; parents approve the real plan.</p>
      ${data.adventureOptions.filter((item) => item.bestFor.includes(profile.id) || item.bestFor.includes("all")).map((item) => `
        <div class="choice-card">
          <strong>${item.name}</strong>
          <p>${item.why}</p>
          <div class="action-row">
            <button type="button" data-favorite="${item.name}">Favorite</button>
            <button type="button" data-vote="${item.name}">Vote</button>
            <button type="button" data-approve="${item.name}">Approve</button>
            <button type="button" data-dismiss="${item.name}">Skip</button>
          </div>
        </div>
      `).join("")}
      ${renderSavedSummary()}
    `;
    byId("eventsCard").innerHTML = `
      <p class="eyebrow">Real route content</p>
      <h3>${routePlace.name}</h3>
      <p>${routePlace.place}. ${routePlace.why}</p>
      <p>${routePlace.profiles[profile.id] || routePlace.profiles.momdad}</p>
      <div class="action-row">
        <button type="button" data-favorite="${routePlace.name}">Save place</button>
        <button type="button" data-complete-prompt="Learned about ${routePlace.name}">Learned it</button>
      </div>
    `;
    byId("journalCard").innerHTML = `
      <p class="eyebrow">Journal</p>
      <h3>Memory prompts</h3>
      <p>Save favorite facts, stops, family votes, sky sessions, and photos.</p>
      <textarea id="journalNote" rows="5" placeholder="Today's best moment"></textarea>
      <div class="action-row"><button id="saveJournal" type="button">Save note</button><span id="journalSaved"></span></div>
      ${renderSavedSummary()}
    `;
    const save = byId("saveJournal");
    save.addEventListener("click", () => {
      localStorage.setItem(`journal-${selectedDay().date}`, byId("journalNote").value);
      byId("journalSaved").textContent = "Saved on this device";
      state.actionMessage = "Journal note saved.";
      saveState();
      renderTripStatus();
    });
    wireDynamicActions();
  }

  function renderSavedSummary() {
    ensureCollections();
    const favorites = Object.values(state.favorites).filter((item) => item.profile === activeProfile && item.date === selectedDayDate());
    const approved = state.approved.filter((key) => key.startsWith(`${activeProfile}:${selectedDayDate()}:`));
    if (!favorites.length && !approved.length) {
      return `<div class="saved-list"><span class="saved-pill">No saved picks yet</span></div>`;
    }
    return `
      <div class="saved-list">
        ${favorites.map((item) => `<span class="saved-pill">Saved: ${item.name}</span>`).join("")}
        ${approved.map((key) => `<span class="saved-pill">Approved: ${key.split(":").slice(2).join(":")}</span>`).join("")}
      </div>
    `;
  }

  function wireDynamicActions() {
    document.querySelectorAll("[data-favorite]").forEach((button) => {
      button.onclick = () => toggleFavorite(button.dataset.favorite);
    });
    document.querySelectorAll("[data-vote]").forEach((button) => {
      button.onclick = () => voteFor(button.dataset.vote);
    });
    document.querySelectorAll("[data-approve]").forEach((button) => {
      button.onclick = () => approvePlan(button.dataset.approve);
    });
    document.querySelectorAll("[data-dismiss]").forEach((button) => {
      button.onclick = () => dismissItem(button.dataset.dismiss);
    });
    document.querySelectorAll("[data-save-prompt]").forEach((button) => {
      button.onclick = () => toggleFavorite(button.dataset.savePrompt);
    });
    document.querySelectorAll("[data-complete-prompt]").forEach((button) => {
      button.onclick = () => {
        ensureCollections();
        state.completed.push({ text: button.dataset.completePrompt, profile: activeProfile, date: selectedDayDate(), at: new Date().toISOString() });
        setAction(`Marked complete for ${currentProfile().name}.`);
      };
    });
    document.querySelectorAll("[data-need]").forEach((button) => {
      button.onclick = () => {
        state.needNow = button.dataset.need;
        setAction(`${button.dataset.need} selected. Showing cached best-fit guidance.`);
      };
    });
  }

  async function downloadTripPack() {
    const button = byId("installPack");
    button.textContent = "Downloading...";
    button.disabled = true;
    state.packDownloaded = new Date().toISOString();
    state.cachedTripPack = {
      route: data.route,
      profiles: data.profiles,
      days: data.days,
      ferry: data.ferry,
      stars: data.stars,
      adventureOptions: data.adventureOptions
    };
    try {
      if ("caches" in window) {
        const cache = await caches.open("elskatemm-trip-v2");
        await cache.addAll(["/", "/index.html", "/styles.css", "/app.js", "/trip-data.js", "/manifest.json", "/icon.svg", "/sw.js"]);
      }
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) registration.active.postMessage({ type: "CACHE_TRIP_PACK" });
      }
      state.packStatus = "ready";
      state.actionMessage = "Trip Pack Ready. Offline basics are saved on this device.";
      saveState();
      button.textContent = "Trip Pack Ready";
    } catch (error) {
      state.packStatus = "partial";
      state.packError = "Some files could not be cached. Try again while online.";
      state.actionMessage = state.packError;
      saveState();
      button.textContent = "Try Download Again";
    } finally {
      button.disabled = false;
      render();
    }
  }

  function useLocation() {
    if (!navigator.geolocation) {
      state.gpsStatus = "GPS unavailable";
      state.trackingStatus = "Unavailable";
      saveState();
      renderTripStatus();
      return;
    }
    if (watchId !== null) {
      state.trackingStatus = "Already live";
      renderTripStatus();
      return;
    }
    state.gpsStatus = "Requesting";
    state.trackingStatus = "Starting";
    renderTripStatus();
    watchId = navigator.geolocation.watchPosition(
      updatePosition,
      () => {
        state.gpsStatus = "Permission denied or unavailable";
        state.trackingStatus = "Off";
        watchId = null;
        saveState();
        renderTripStatus();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }

  function stopLocation() {
    if (watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    state.trackingStatus = "Off";
    saveState();
    renderTripStatus();
  }

  function wireEvents() {
    byId("installPack").addEventListener("click", downloadTripPack);
    byId("activeTraveler").addEventListener("click", () => byId("splash").classList.remove("is-hidden"));
    byId("useLocation").addEventListener("click", useLocation);
    byId("stopLocation").addEventListener("click", stopLocation);
    byId("startTrip").addEventListener("click", () => setPhase("outbound"));
    byId("markArrived").addEventListener("click", () => setPhase("island"));
    byId("startReturn").addEventListener("click", () => setPhase("return"));
    byId("completeTrip").addEventListener("click", () => setPhase("complete"));
    window.addEventListener("online", renderTripStatus);
    window.addEventListener("offline", renderTripStatus);
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        byId("packStatus").textContent = "Offline worker unavailable";
      });
    }
  }

  function render() {
    renderCountdowns();
    renderProgressBars();
    renderTripStatus();
    renderProfile();
    renderCards();
    renderMapProgress();
  }

  renderDaySelect();
  renderSplashProfiles();
  if (state.hasChosenProfile && state.profile) {
    byId("splash").classList.add("is-hidden");
  } else {
    byId("splash").classList.remove("is-hidden");
  }
  renderProfileTabs();
  wireEvents();
  registerServiceWorker();
  render();
})();
