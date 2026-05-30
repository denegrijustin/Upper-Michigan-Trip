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
      const saved = JSON.parse(localStorage.getItem("tripState")) || {};
      return { ...defaultState(), ...saved, phase: saved.phase || "pretrip" };
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
      captures: [],
      actionMessage: "No action yet."
    };
  }

  function ensureCollections() {
    state.favorites ||= {};
    state.votes ||= {};
    state.approved ||= [];
    state.dismissed ||= [];
    state.completed ||= [];
    state.captures ||= [];
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

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
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
    const mph = destination.plannedHours && destination.plannedMiles ? destination.plannedMiles / destination.plannedHours : 62;
    const minutes = Math.max(10, Math.round((miles / mph) * 60));
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
      title: "Road update",
      text: `${miles.toLocaleString()} miles, about ${timeText}, to ${destination.label}. Dad joke: ${joke}`
    };
  }

  function planningQuestFor(profile) {
    const options = data.planningQuest.filter((item) => item.bestFor.includes(profile.id) || item.bestFor.includes("all"));
    return options[(new Date(selectedDayDate()).getDate() + profile.name.length) % options.length] || data.planningQuest[0];
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

  function routeProgressMiles() {
    const destination = activeDestination();
    const progress = progressForPhase() / 100;
    if (state.phase === "return") return Math.round(data.route.totalReturnMiles * progress);
    if (selectedDayDate() === "2026-07-31") return Math.round((destination.plannedMiles || 585) * progress);
    if (selectedDayDate() === "2026-08-01") return Math.round(585 + (destination.plannedMiles || 460) * progress);
    return Math.round(data.route.totalOutboundMiles * progress);
  }

  function nearbyRoutePlaces(limit = 3) {
    const currentMiles = routeProgressMiles();
    return [...data.route.routePlaces]
      .filter((place) => place.milesFromStart !== undefined)
      .sort((a, b) => Math.abs(a.milesFromStart - currentMiles) - Math.abs(b.milesFromStart - currentMiles))
      .slice(0, limit);
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
    if (state.gpsMilesToActiveDestination && state.phase !== "pretrip" && state.phase !== "complete") {
      return Math.round(state.gpsMilesToActiveDestination);
    }
    if (state.gpsMilesToFinal && state.phase !== "pretrip" && state.phase !== "return" && state.phase !== "complete") {
      return Math.round(state.gpsMilesToFinal * 1.18);
    }
    const progress = progressForPhase();
    const destination = activeDestination();
    const total = state.phase === "return" ? data.route.totalReturnMiles : (destination.plannedMiles || data.route.totalOutboundMiles);
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
    if (state.phase === "pretrip") return "Trip has not started yet. Use the map, planning quests, and what-to-look-for cards to get ready.";
    if (state.phase === "outbound" && travelStage() === "road-to-south-bend") return "Next goal: clean stops only when needed, light lunch, and dinner in South Bend. No ferry logic today.";
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
      state.phase === "pretrip" ? "Launch getting closer" :
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
    setTimeout(() => routeMap.invalidateSize(), 100);
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

  function bestNeedStops() {
    const dayStops = data.route.restStops.filter((stop) => stop.date === selectedDayDate());
    const candidates = dayStops.length ? dayStops : data.route.restStops.filter((stop) => isTravelDay(stop.date));
    const need = state.needNow;
    const filtered = need ? candidates.filter((stop) => !stop.needs || stop.needs.includes(need)) : candidates;
    const currentMiles = routeProgressMiles();
    return [...filtered]
      .sort((a, b) => Math.abs((a.milesFromStart || 0) - currentMiles) - Math.abs((b.milesFromStart || 0) - currentMiles))
      .slice(0, 3);
  }

  function renderNeedResults() {
    const container = byId("needResults");
    if (!container) return;
    if (!state.needNow) {
      container.innerHTML = "";
      return;
    }
    const stops = bestNeedStops();
    container.innerHTML = `
      <div class="choice-card">
        <strong>${state.needNow}</strong>
        <p>${state.phase === "pretrip" ? "Previewing likely route options. Live GPS will sort this by where you actually are once the trip starts." : "Sorted by the current trip segment and estimated route position."}</p>
        <ul>${stops.map((stop) => `<li><strong>${stop.name}</strong> <span class="map-caption">${stop.timing}</span><br>${stop.note}</li>`).join("")}</ul>
      </div>
    `;
  }

  function renderTripStatus() {
    const profile = currentProfile();
    const line = childTravelLine(profile);
    byId("onlineStatus").textContent = navigator.onLine ? "Online" : "Offline - using cached trip data";
    byId("nextStop").textContent = nextStopText();
    byId("kidTravelUpdate").innerHTML = `<strong>${line.title}</strong><p>${line.text}</p>`;
    byId("actionStatus").textContent = state.actionMessage || "No action yet.";
    byId("gpsStatus").textContent = state.gpsStatus || "Not requested";
    byId("destinationStatus").textContent = state.destinationStatus || activeDestination().label;
    byId("trackingStatus").textContent = state.trackingStatus || "Off";
    renderNeedResults();
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

  function placePreview(place, profile) {
    const profileText = place.profiles[profile.id] || place.profiles.momdad;
    return `
      <div class="choice-card place-preview">
        <img src="${place.image}" alt="${escapeHtml(place.name)}" loading="lazy" onerror="this.style.display='none'">
        <div>
          <strong>${place.name}</strong>
          <p>${place.place}. ${place.why}</p>
          <p>${profileText}</p>
          <div class="action-row">
            <a class="external-link" href="${place.learnMore}" target="_blank" rel="noopener">Learn More</a>
            <button type="button" data-favorite="${escapeHtml(place.name)}">Save place</button>
            <button type="button" data-capture="${escapeHtml(place.name)}">Capture image/video</button>
          </div>
        </div>
      </div>
    `;
  }

  function activityKey(activity) {
    return `${activeProfile}:${activity.title}`;
  }

  function profileActivities(profile) {
    const profileList = data.activityBoard[profile.id] || [];
    const shared = profile.id === "momdad" ? [] : data.activityBoard.momdad.slice(0, 2);
    return [...profileList, ...shared];
  }

  function renderActivityBoard(profile) {
    ensureCollections();
    const activities = profileActivities(profile);
    const completedKeys = new Set(state.completed.filter((item) => item.profile === activeProfile && item.activityKey).map((item) => item.activityKey));
    const pending = activities.filter((activity) => !completedKeys.has(activityKey(activity))).slice(0, 10);
    const completed = state.completed
      .filter((item) => item.profile === activeProfile && item.activityTitle)
      .slice(-6)
      .reverse();
    return `
      <div class="activity-board">
        ${pending.map((activity) => `
          <article class="activity-item">
            <header>
              <div>
                <h4>${activity.title}</h4>
                <span class="activity-meta">${activity.type} - Look for: ${activity.lookFor}</span>
              </div>
            </header>
            <p>${activity.detail}</p>
            <p><strong>Capture:</strong> ${activity.capture}</p>
            <div class="action-row">
              <a class="external-link" href="${activity.link}" target="_blank" rel="noopener">Learn More</a>
              <button type="button" data-complete-activity="${escapeHtml(activity.title)}">Done</button>
              <button type="button" data-capture="${escapeHtml(activity.title)}">Capture image/video</button>
              <button type="button" data-favorite="${escapeHtml(activity.title)}">Save</button>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="completed-list">
        ${completed.length ? completed.map((item) => `<span class="saved-pill">Completed: ${item.activityTitle}</span>`).join("") : `<span class="saved-pill">Complete one activity and a new one will appear.</span>`}
      </div>
    `;
  }

  function renderRouteQuest() {
    const profile = currentProfile();
    const quest = planningQuestFor(profile);
    const near = nearbyRoutePlaces(3);
    byId("routeQuest").innerHTML = state.phase === "pretrip" ? `
      <p class="eyebrow">Planning and learning quest</p>
      <div class="choice-card">
        <strong>${quest.title}</strong>
        <p>${quest.prompt}</p>
        <div class="action-row">
          <button type="button" data-complete-prompt="${escapeHtml(`${quest.title}: ${quest.answer}`)}">Reveal / learned it</button>
          <button type="button" data-favorite="${escapeHtml(quest.title)}">Save quest</button>
        </div>
      </div>
    ` : `
      <p class="eyebrow">What is close on the route</p>
      <div class="activity-board">
        ${near.map((place) => `
          <article class="activity-item">
            <h4>${place.name}</h4>
            <p>${place.place}. ${place.profiles[profile.id] || place.profiles.momdad}</p>
            <div class="action-row">
              <a class="external-link" href="${place.learnMore}" target="_blank" rel="noopener">Learn More</a>
              <button type="button" data-capture="${escapeHtml(place.name)}">Capture image/video</button>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderProfile() {
    const day = selectedDay();
    const profile = currentProfile();
    const isJules = profile.id === "jules";
    const locationContext = currentRouteContext();
    const ferryHidden = profile.suppressFerryLogistics && isFerryRelevant();
    const profilePrompt = profile.prompts[(new Date(day.date).getDate() + profile.name.length) % profile.prompts.length];
    const travelLine = childTravelLine(profile);
    const quest = planningQuestFor(profile);
    const feature = dailyFeatureFor(profile);
    const routePlace = routePlaceFor(profile);
    byId("profileView").style.setProperty("--profile-accent", profile.accent || "#1f78a4");
    if (state.phase === "pretrip") {
      byId("profileView").innerHTML = `
        <div class="profile-grid">
          <div>
            <p class="eyebrow">Planning and learning quest</p>
            <h3>Countdown Quest</h3>
            <p>${profile.lens}</p>
            <div class="choice-card kid-travel-update">
              <strong>${quest.title}</strong>
              <p>${quest.prompt}</p>
              <div class="action-row">
                <button type="button" data-complete-prompt="${escapeHtml(`${quest.title}: ${quest.answer}`)}">Reveal / learned it</button>
                <button type="button" data-favorite="${escapeHtml(quest.title)}">Save quest</button>
              </div>
            </div>
            <div class="choice-card">
              <strong>Today's real trip feature: ${feature.title}</strong>
              <p>${feature.text}</p>
              <p><strong>Look for:</strong> ${feature.lookFor}</p>
              <div class="action-row">
                <button type="button" data-favorite="${escapeHtml(feature.title)}">Save feature</button>
                <button type="button" data-complete-prompt="${escapeHtml(`${feature.title}: ${feature.lookFor}`)}">I know what to look for</button>
                <button type="button" data-capture="${escapeHtml(feature.title)}">Capture image/video</button>
              </div>
            </div>
            ${placePreview(routePlace, profile)}
            <div class="choice-card">
              <strong>What to watch for on the trip</strong>
              <ul>${profile.routeInterests.map((item) => `<li>${item}</li>`).join("")}</ul>
            </div>
          </div>
          <aside>
            <h3>Interactive board</h3>
            ${renderActivityBoard(profile)}
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
          <h3>${profile.name === "Mom and Dad" ? "Full trip view" : "Today's view"}</h3>
          <p>${profile.lens}</p>
          <ul class="tag-list">${profile.tags.map((tag) => `<li>${tag}</li>`).join("")}</ul>
          <div class="choice-card">
            <strong>${isJules ? "Captain mission" : "Today's prompt"}</strong>
            <p>${profilePrompt}</p>
            <div class="action-row">
              <button type="button" data-save-prompt="${escapeHtml(profilePrompt)}">Save prompt</button>
              <button type="button" data-complete-prompt="${escapeHtml(profilePrompt)}">Did it</button>
            </div>
          </div>
          <div class="choice-card">
            <strong>Today's real trip feature: ${feature.title}</strong>
            <p>${feature.text}</p>
            <p><strong>Look for:</strong> ${feature.lookFor}</p>
            <div class="action-row">
              <button type="button" data-capture="${escapeHtml(feature.title)}">Capture image/video</button>
            </div>
          </div>
          ${placePreview(routePlace, profile)}
          <div class="choice-card kid-travel-update">
            <strong>${travelLine.title}</strong>
            <p>${travelLine.text}</p>
          </div>
          ${profile.id === "momdad" ? `<div class="choice-card parent-callout"><strong>Operating note</strong><p>${profile.parentNote}</p></div>` : ""}
          <div class="choice-card">
            <strong>Stop ideas that match this view</strong>
            <ul>${profile.routeInterests.map((item) => `<li>${item}</li>`).join("")}</ul>
            <div class="action-row">
              <button type="button" data-favorite="Route stop idea">Save route idea</button>
              <button type="button" data-vote="Route stop idea">Vote for this</button>
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
          <h3>Interactive board</h3>
          ${renderActivityBoard(profile)}
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
    const quest = planningQuestFor(profile);
    const routePlace = routePlaceFor(profile);
    const stopsMarkup = state.phase === "pretrip"
      ? `<p>Trip has not started. Use this as a route preview and packing brain-starter before live GPS takes over.</p>
        <div class="choice-card">
          <strong>${quest.title}</strong>
          <p>${quest.prompt}</p>
          <div class="action-row">
            <button type="button" data-complete-prompt="${escapeHtml(`${quest.title}: ${quest.answer}`)}">Reveal / learned it</button>
            <button type="button" data-favorite="${escapeHtml(quest.title)}">Save quest</button>
          </div>
        </div>`
      : isTravelDay(day.date)
      ? `<p>Specific to ${day.title}: these are planning windows, not generic stops.</p>
        <ul>${travelStops.map((stop) => `<li><strong>${stop.name}</strong> <span class="map-caption">${stop.timing}</span><br>${stop.note}</li>`).join("")}</ul>`
      : `<p>No road-stop planner today. This only appears on travel days so island days stay open and flexible.</p>`;
    byId("stopsCard").innerHTML = `
      <p class="eyebrow">Smart stops</p>
      <h3>${state.phase === "pretrip" ? "Planning quest" : isTravelDay(day.date) ? "Route-specific stop plan" : "Island mode"}</h3>
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
      <ul>${(ferryForElsie ? ["Look for boats, gulls, waves, and shoreline changes.", "Think about how islands depend on ferries.", "Save suspense for shipwreck stories, not schedule stress."] : data.ferry.reminders).map((item) => `<li>${item}</li>`).join("")}</ul>
      <div class="action-row">
        <a class="external-link" href="${data.ferry.learnMore}" target="_blank" rel="noopener">Learn More</a>
        <button type="button" data-favorite="${ferryForElsie ? "Water crossing facts" : "Plaunt ferry plan"}">Save</button>
        ${profile.id === "momdad" ? `<button type="button" data-approve="Plaunt ferry plan">Approve ferry plan</button>` : ""}
      </div>
    ` : `
      <p class="eyebrow">Ferry</p>
      <h3>Not today</h3>
      <p>Today is the road segment to South Bend. Ferry timing stays hidden until the Cheboygan travel day.</p>
    `;
    byId("starsCard").innerHTML = `
      <p class="eyebrow">Stars</p>
      <h3>Night-sky guide</h3>
      <p>${data.stars.tonight}</p>
      <p><strong>Star viewing grade:</strong> ${data.stars.gradeRules[0]}</p>
      <p><strong>Overhead:</strong> ${data.stars.overhead.slice(0, 2).join("; ")}.</p>
      <p><strong>Horizon:</strong> ${data.stars.horizon.slice(0, 2).join("; ")}.</p>
      <ul>${data.stars.checklist.slice(0, 5).map((item) => `<li>${item}</li>`).join("")}</ul>
      <div class="action-row">
        <a class="external-link" href="${data.stars.clearDarkSky}" target="_blank" rel="noopener">Learn More</a>
        <button type="button" data-favorite="Night-sky blanket session">Favorite stars</button>
        <button type="button" data-vote="Night-sky blanket session">Vote</button>
      </div>
    `;
    byId("adventureCard").innerHTML = `
      <p class="eyebrow">Island</p>
      <h3>Interactive activity board</h3>
      <p>Ten options show at a time. When one is completed, it moves down and the next option appears.</p>
      ${renderActivityBoard(profile)}
    `;
    byId("eventsCard").innerHTML = `
      <p class="eyebrow">Real route content</p>
      <h3>Real place preview</h3>
      ${placePreview(routePlace, profile)}
    `;
    byId("summaryCard").innerHTML = `
      <p class="eyebrow">Trip summary</p>
      <h3>Captured story</h3>
      <p>Photos and videos captured from activity cards build the trip story on this device.</p>
      ${renderCaptureSummary()}
      ${renderSavedSummary()}
    `;
    wireDynamicActions();
  }

  function renderCaptureSummary() {
    ensureCollections();
    const captures = state.captures.filter((item) => item.profile === activeProfile).slice(-4).reverse();
    if (!captures.length) return `<div class="saved-list"><span class="saved-pill">No captured moments yet</span></div>`;
    return `
      <div class="summary-grid">
        ${captures.map((item) => `
          <div class="summary-tile">
            ${item.type.startsWith("image/") ? `<img class="summary-photo" src="${item.dataUrl}" alt="${escapeHtml(item.label)}">` : `<span>Video saved: ${escapeHtml(item.name || item.label)}</span>`}
            <span>${escapeHtml(item.label)} - ${new Date(item.at).toLocaleDateString()}</span>
          </div>
        `).join("")}
      </div>
    `;
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

  function completeActivity(title) {
    ensureCollections();
    const profile = currentProfile();
    const activity = profileActivities(profile).find((item) => item.title === title);
    const key = activity ? activityKey(activity) : `${activeProfile}:${title}`;
    if (!state.completed.some((item) => item.activityKey === key)) {
      state.completed.push({
        activityKey: key,
        activityTitle: title,
        profile: activeProfile,
        date: selectedDayDate(),
        at: new Date().toISOString()
      });
    }
    setAction(`Completed ${title}. A new activity is ready.`);
  }

  function startCapture(label) {
    state.pendingCaptureLabel = label;
    saveState();
    byId("captureInput").click();
  }

  function wireCaptureInput() {
    const input = byId("captureInput");
    input.addEventListener("change", () => {
      const files = Array.from(input.files || []).slice(0, 3);
      if (!files.length) return;
      let remaining = files.length;
      files.forEach((file) => {
        if (file.size > 4500000) {
          state.actionMessage = "That file is too large for this offline summary. Try a smaller photo or short clip.";
          remaining -= 1;
          if (!remaining) {
            input.value = "";
            saveState();
            render();
          }
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          ensureCollections();
          state.captures.push({
            profile: activeProfile,
            date: selectedDayDate(),
            label: state.pendingCaptureLabel || "Trip capture",
            name: file.name,
            type: file.type,
            dataUrl: reader.result,
            at: new Date().toISOString()
          });
          state.actionMessage = `Captured ${state.pendingCaptureLabel || "trip moment"} for the trip summary.`;
          remaining -= 1;
          if (!remaining) {
            input.value = "";
            saveState();
            render();
          }
        };
        reader.readAsDataURL(file);
      });
    });
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
    document.querySelectorAll("[data-complete-activity]").forEach((button) => {
      button.onclick = () => completeActivity(button.dataset.completeActivity);
    });
    document.querySelectorAll("[data-capture]").forEach((button) => {
      button.onclick = () => startCapture(button.dataset.capture);
    });
    document.querySelectorAll("[data-need]").forEach((button) => {
      button.onclick = () => {
        state.needNow = button.dataset.need;
        setAction(`${button.dataset.need} selected. Showing cached best-fit guidance.`);
      };
    });
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
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }

  function render() {
    renderCountdowns();
    renderProgressBars();
    renderTripStatus();
    renderProfile();
    renderCards();
    renderRouteQuest();
    wireDynamicActions();
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
  wireCaptureInput();
  registerServiceWorker();
  render();
})();
