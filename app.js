(function () {
  const data = window.TRIP_DATA;
  const state = loadState();
  let activeProfile = state.profile || "elsie";

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
    if (state.gpsMilesToFinal && state.phase !== "return" && state.phase !== "complete") {
      return Math.round(state.gpsMilesToFinal * 1.18);
    }
    const progress = progressForPhase();
    const total = state.phase === "return" ? data.route.totalReturnMiles : data.route.totalOutboundMiles;
    if (state.phase === "island") return 0;
    if (state.phase === "complete") return 0;
    return Math.round(total * (1 - progress / 100));
  }

  function nextStopText() {
    if (state.needNow) return `${state.needNow}: showing best cached options first.`;
    if (state.phase === "pretrip") return "Download trip pack, then start when leaving home.";
    if (state.phase === "outbound") return "Next goal: clean stop rhythm, then dinner in South Bend, then Plaunt ferry.";
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

  function renderMapProgress() {
    const dot = byId("progressDot");
    if (!dot) return;
    const pathPoints = [
      [80, 250],
      [410, 170],
      [700, 145],
      [835, 95]
    ];
    const progress = progressForPhase() / 100;
    const scaled = progress * (pathPoints.length - 1);
    const index = Math.min(pathPoints.length - 2, Math.floor(scaled));
    const local = scaled - index;
    const start = pathPoints[index];
    const end = pathPoints[index + 1];
    dot.setAttribute("cx", String(start[0] + (end[0] - start[0]) * local));
    dot.setAttribute("cy", String(start[1] + (end[1] - start[1]) * local));
  }

  function renderTripStatus() {
    byId("onlineStatus").textContent = navigator.onLine ? "Online" : "Offline - using cached trip data";
    byId("nextStop").textContent = nextStopText();
    byId("packStatus").textContent = state.packDownloaded ? `Downloaded ${new Date(state.packDownloaded).toLocaleString()}` : "Not downloaded";
    byId("sinceStop").textContent = state.phase === "pretrip" ? "Not started" : "Track every 4-5 hours";
    byId("gpsStatus").textContent = state.gpsStatus || "Not requested";
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
      button.innerHTML = `<strong>${profile.name}</strong><span>${profile.lens}</span>`;
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
    byId("profileView").style.setProperty("--profile-accent", profile.accent || "#1f78a4");
    byId("profileView").innerHTML = `
      <div class="profile-grid">
        <div>
          <p class="eyebrow">${day.title} - ${day.mood}</p>
          <h3>${profile.name}'s view</h3>
          <p>${profile.lens}</p>
          <ul class="tag-list">${profile.tags.map((tag) => `<li>${tag}</li>`).join("")}</ul>
          <div class="choice-card">
            <strong>${isJules ? "Captain Jules mission" : "Today's question"}</strong>
            <p>${profile.prompts[(new Date(day.date).getDate() + profile.name.length) % profile.prompts.length]}</p>
          </div>
        </div>
        <aside>
          <h3>Best flexible pick</h3>
          <p><strong>${adventure.name}</strong></p>
          <p>${adventure.why}</p>
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
    byId("stopsCard").innerHTML = `
      <p class="eyebrow">Smart stops</p>
      <h3>Clean, safe stop rhythm</h3>
      <p>Plan around 4-5 hours between breaks, with early nudges around 3.5 hours.</p>
      <ul>${data.route.restStops.map((stop) => `<li><strong>${stop.name}</strong>: ${stop.note}</li>`).join("")}</ul>
    `;
    byId("ferryCard").innerHTML = `
      <p class="eyebrow">Ferry</p>
      <h3>Plaunt Transportation</h3>
      <p>${data.ferry.terminal}</p>
      <ul>${data.ferry.reminders.map((item) => `<li>${item}</li>`).join("")}</ul>
    `;
    byId("starsCard").innerHTML = `
      <p class="eyebrow">Stars</p>
      <h3>Night-sky guide</h3>
      <p>${data.stars.tonight}</p>
      <ul>${data.stars.checklist.slice(0, 5).map((item) => `<li>${item}</li>`).join("")}</ul>
    `;
    byId("adventureCard").innerHTML = `
      <p class="eyebrow">Island</p>
      <h3>Build today's adventure</h3>
      <p>No fixed island itinerary. Kids favorite ideas; parents approve the plan.</p>
      ${data.adventureOptions.slice(0, 3).map((item) => `
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

  function downloadTripPack() {
    state.packDownloaded = new Date().toISOString();
    state.cachedTripPack = {
      route: data.route,
      profiles: data.profiles,
      days: data.days,
      ferry: data.ferry,
      stars: data.stars,
      adventureOptions: data.adventureOptions
    };
    saveState();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) registration.active.postMessage({ type: "CACHE_TRIP_PACK" });
      });
    }
    render();
  }

  function useLocation() {
    if (!navigator.geolocation) {
      state.gpsStatus = "GPS unavailable";
      saveState();
      renderTripStatus();
      return;
    }
    state.gpsStatus = "Requesting";
    renderTripStatus();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lon: position.coords.longitude };
        const fromStart = haversineMiles(point, data.route.coordinates.start);
        const toFinal = haversineMiles(point, data.route.coordinates.islandApprox);
        state.gpsMilesToFinal = toFinal;
        state.gpsStatus = `${Math.round(toFinal * 1.18)} road miles est. to island`;
        if (state.phase === "pretrip" && fromStart > 1.5) {
          state.phase = "outbound";
          state.startedAt = state.startedAt || new Date().toISOString();
        }
        if (state.phase === "outbound") {
          state.progress = clamp(100 - ((toFinal * 1.18) / data.route.totalOutboundMiles) * 100, 0, 100);
        }
        saveState();
        render();
      },
      () => {
        state.gpsStatus = "Permission denied or unavailable";
        saveState();
        renderTripStatus();
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  function wireEvents() {
    byId("installPack").addEventListener("click", downloadTripPack);
    byId("activeTraveler").addEventListener("click", () => byId("splash").classList.remove("is-hidden"));
    byId("useLocation").addEventListener("click", useLocation);
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
    renderMapProgress();
    renderProfile();
    renderCards();
  }

  renderDaySelect();
  renderSplashProfiles();
  if (state.hasChosenProfile) {
    byId("splash").classList.add("is-hidden");
  }
  renderProfileTabs();
  wireEvents();
  registerServiceWorker();
  render();
})();
