(function () {
  const data = window.TRIP_DATA;
  const state = loadState();
  let activeProfile = state.profile || "elsie";
  let watchId = null;

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
      return JSON.parse(localStorage.getItem("tripState")) || { phase: "pretrip", progress: 0, packDownloaded: false };
    } catch {
      return { phase: "pretrip", progress: 0, packDownloaded: false };
    }
  }

  function saveState() {
    localStorage.setItem("tripState", JSON.stringify(state));
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

  function setPhase(phase) {
    state.phase = phase;
    if (phase === "outbound") state.startedAt = new Date().toISOString();
    if (phase === "island") state.progress = 100;
    if (phase === "return") state.returnStartedAt = new Date().toISOString();
    if (phase === "complete") state.progress = 100;
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
    if (state.phase === "pretrip") return "Download trip pack, then start when leaving home.";
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
  }

  function renderTripStatus() {
    const profile = data.profiles.find((item) => item.id === activeProfile) || data.profiles[0];
    const line = childTravelLine(profile);
    byId("onlineStatus").textContent = navigator.onLine ? "Online" : "Offline - using cached trip data";
    byId("nextStop").textContent = nextStopText();
    byId("kidTravelUpdate").innerHTML = `<strong>${line.title}</strong><p>${line.text}</p>`;
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
    const profile = data.profiles.find((item) => item.id === activeProfile) || data.profiles[0];
    const adventure = data.adventureOptions.find((item) => item.bestFor.includes(profile.id)) || data.adventureOptions[0];
    const isJules = profile.id === "jules";
    const locationContext = currentRouteContext();
    const ferryHidden = profile.suppressFerryLogistics && isFerryRelevant();
    const profilePrompt = profile.prompts[(new Date(day.date).getDate() + profile.name.length) % profile.prompts.length];
    const travelLine = childTravelLine(profile);
    byId("profileView").style.setProperty("--profile-accent", profile.accent || "#1f78a4");
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
    const profile = data.profiles.find((item) => item.id === activeProfile) || data.profiles[0];
    const travelStops = data.route.restStops.filter((stop) => stop.date === day.date);
    const stopsMarkup = isTravelDay(day.date)
      ? `<p>Specific to ${day.title}: these are planning windows, not generic stops.</p>
        <ul>${travelStops.map((stop) => `<li><strong>${stop.name}</strong> <span class="map-caption">${stop.timing}</span><br>${stop.note}</li>`).join("")}</ul>`
      : `<p>No road-stop planner today. This only appears on travel days so island days stay open and flexible.</p>`;
    byId("stopsCard").innerHTML = `
      <p class="eyebrow">Smart stops</p>
      <h3>${isTravelDay(day.date) ? "Route-specific stop plan" : "Island mode"}</h3>
      ${stopsMarkup}
    `;
    const ferryForElsie = profile.suppressFerryLogistics;
    const ferryRelevant = isFerryRelevant();
    byId("ferryCard").innerHTML = ferryRelevant ? `
      <p class="eyebrow">Ferry</p>
      <h3>${ferryForElsie ? "Water crossing facts" : "Plaunt Transportation"}</h3>
      <p>${ferryForElsie ? "Adults handle timing. This view keeps ferry logistics out of Elsie's experience." : data.ferry.terminal}</p>
      ${ferryForElsie ? `<div class="choice-card parent-callout"><strong>Mom/Dad note</strong><p>Elsie does not need ferry schedule pressure. Keep schedule/check-in decisions in the adult view and offer her observation prompts instead.</p></div>` : ""}
      <ul>${(ferryForElsie ? ["Look for boats, gulls, waves, and shoreline changes.", "Think about how islands depend on ferries.", "Save suspense for shipwreck stories, not schedule stress."] : data.ferry.reminders).map((item) => `<li>${item}</li>`).join("")}</ul>
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
    `;
    byId("adventureCard").innerHTML = `
      <p class="eyebrow">Island</p>
      <h3>Kid-specific adventure board</h3>
      <p>No generic local taste run. Each child gets specific ideas; parents approve the real plan.</p>
      ${data.adventureOptions.filter((item) => item.bestFor.includes(profile.id) || item.bestFor.includes("all")).map((item) => `
        <div class="choice-card">
          <strong>${item.name}</strong>
          <p>${item.why}</p>
          <button type="button" data-favorite="${item.name}">Favorite</button>
        </div>
      `).join("")}
    `;
    byId("eventsCard").innerHTML = `
      <p class="eyebrow">Current events</p>
      <h3>What is happening</h3>
      <p>Cached sources and freshness labels will keep this honest when service is weak.</p>
      <ul>${data.eventsFallback.map((item) => `<li>${item}</li>`).join("")}</ul>
    `;
    byId("journalCard").innerHTML = `
      <p class="eyebrow">Journal</p>
      <h3>Memory prompts</h3>
      <p>Save favorite facts, stops, family votes, sky sessions, and photos.</p>
      <textarea id="journalNote" rows="5" placeholder="Today's best moment"></textarea>
      <div class="action-row"><button id="saveJournal" type="button">Save note</button><span id="journalSaved"></span></div>
    `;
    const save = byId("saveJournal");
    save.addEventListener("click", () => {
      localStorage.setItem(`journal-${selectedDay().date}`, byId("journalNote").value);
      byId("journalSaved").textContent = "Saved on this device";
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
      saveState();
      button.textContent = "Trip Pack Ready";
    } catch (error) {
      state.packStatus = "partial";
      state.packError = "Some files could not be cached. Try again while online.";
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
    document.querySelectorAll("[data-need]").forEach((button) => {
      button.addEventListener("click", () => {
        state.needNow = button.dataset.need;
        saveState();
        renderTripStatus();
      });
    });
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
