(function () {
  const data = window.TRIP_DATA;
  const WEATHER_TTL = 30 * 60 * 1000;
  const state = loadState();
  let activeProfile = state.profile || "elsie";
  let activePage = "home";
  let watchId = null;
  let lastGpsRender = 0;
  let routeMap = null;

  const phaseLabels = {
    pretrip: "Pre-trip",
    outbound: "Outbound",
    island: "Island stay",
    return: "Return trip",
    complete: "Trip complete"
  };

  const pages = ["home", "today", "route", "gps", "detail", "weather", "stars", "ferry", "activities", "badges", "saved", "photos"];
  const parentPages = ["home", "route", "detail", "gps", "weather", "ferry", "stops", "votes", "saved", "badges", "photos", "sources"];
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
      badges: {},
      weather: {},
      actionMessage: "No action yet.",
      gpsStatus: "Off",
      trackingStatus: "Off"
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
    state.badges ||= {};
    state.weather ||= {};
  }

  function saveState() {
    ensureCollections();
    state.profile = activeProfile;
    localStorage.setItem("tripState", JSON.stringify(state));
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
    const select = byId("daySelect");
    return data.days.find((day) => day.date === select.value) || data.days[0];
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
    if (place.learnMore) return place.learnMore;
    const links = data.sourceLinks;
    if (place.name.includes("Gateway")) return links.gatewayArch.url;
    if (place.name.includes("Brown")) return links.brownBoard.url;
    if (place.name.includes("Notre")) return links.notreDame.url;
    if (place.name.includes("Studebaker")) return links.studebaker.url;
    if (place.name.includes("Dunes")) return links.indianaDunes.url;
    if (place.name.includes("Mackinac")) return links.mackinacBridge.url;
    if (place.name.includes("Plaunt")) return links.ferry.url;
    return links.boisBlanc.url;
  }

  function sourceLabelForPlace(place) {
    if (place.name.includes("Gateway")) return "Open official NPS page";
    if (place.name.includes("Brown")) return "Open official NPS page";
    if (place.name.includes("Notre")) return "Open official Notre Dame page";
    if (place.name.includes("Studebaker")) return "Open official museum page";
    if (place.name.includes("Dunes")) return "Open official NPS page";
    if (place.name.includes("Mackinac")) return "Open official bridge page";
    if (place.name.includes("Plaunt")) return "Open official ferry schedule";
    return "Open official source";
  }

  function routeVisualForPlace(place) {
    const title = place.name.replace(" / ", "\n").replace(" National Historical Park", "").replace(" Transportation", "");
    const subtitle = place.place || "Trip stop";
    const kind = place.name.includes("Notre") ? "campus" :
      place.name.includes("Studebaker") ? "vehicles" :
      place.name.includes("Dunes") ? "dunes" :
      place.name.includes("Mackinac") ? "bridge" :
      place.name.includes("Plaunt") ? "ferry" :
      place.name.includes("Gateway") ? "arch" : "history";
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
    saveState();
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
            <span>${badge.title}</span>
            <small>${badge.upcoming ? "Upcoming" : badge.category}</small>
          </button>
        `).join("")}
      </div>
    `;
  }

  function showBadgeDetail(badgeId) {
    const badge = data.badgeCatalog.find((item) => item.id === badgeId);
    if (!badge) return;
    const earned = badgeStore()[badgeId];
    const profile = currentProfile();
    const includeProfile = profile.id === "momdad";
    const message = [
      badge.title,
      earned ? badge.earned : badge.locked,
      earned ? `Earned ${new Date(earned.earnedAt).toLocaleString()}.` : "Not earned yet.",
      includeProfile ? `Profile: ${profile.name}` : ""
    ].filter(Boolean).join(" — ");
    setAction(message);
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
    setAction(`Saved to Trip Shortlist: ${item.name || item}.`);
  }

  function removeShortlist(key) {
    delete state.shortlist[key];
    saveState();
    setAction("Removed from Trip Shortlist.");
  }

  function familyVote(itemName, choice) {
    const key = `${selectedDayDate()}:${itemName}`;
    state.votes[key] ||= {};
    state.votes[key][activeProfile] = { choice, at: new Date().toISOString() };
    awardBadge("family-vote-starter");
    if (activeProfile === "jules") awardBadge("captain-choice");
    saveState();
    setAction(`Family Vote saved: ${choice}.`);
  }

  function approvePlan(name) {
    const key = `${selectedDayDate()}:${name}`;
    if (!state.approved.includes(key)) state.approved.push(key);
    awardBadge("plan-approved");
    awardBadge("logistics-captain");
    if (name.toLowerCase().includes("ferry")) awardBadge("ferry-ready");
    saveState();
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
    setAction(`Completed ${title}.`);
  }

  function deleteCapture(index) {
    const item = state.captures[index];
    if (!item) return;
    if (!confirm(`Delete ${item.label || "this captured moment"}?`)) return;
    state.captures.splice(index, 1);
    saveState();
    render();
  }

  function startCapture(label) {
    state.pendingCaptureLabel = label;
    saveState();
    byId("captureInput").click();
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
        reader.onload = () => {
          state.captures.push({
            profile: activeProfile,
            date: selectedDayDate(),
            label: state.pendingCaptureLabel || "Trip capture",
            name: file.name,
            type: file.type || "file",
            dataUrl: reader.result,
            at: new Date().toISOString()
          });
          awardBadge("first-photo-captured");
          if (state.phase === "island") awardBadge("first-island-photo");
          if (activeProfile === "eliette") awardBadge("detail-collector");
          state.actionMessage = "Captured to the trip summary on this device.";
          remaining -= 1;
          if (!remaining) {
            byId("captureInput").value = "";
            saveState();
            render();
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }

  function setAction(message) {
    state.actionMessage = message;
    saveState();
    render();
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
    const origin = activeOrigin();
    const directMilesToDestination = haversineMiles(point, destination);
    const directRouteMiles = Math.max(1, haversineMiles(origin, destination));
    const directMilesFromOrigin = haversineMiles(origin, point);
    const percentToDestination = clamp((directMilesFromOrigin / directRouteMiles) * 100, 0, 100);
    state.gpsMilesToActiveDestination = directMilesToDestination * 1.18;
    state.lastPosition = { lat: point.lat, lon: point.lon, accuracy: position.coords.accuracy, updatedAt: new Date().toISOString() };
    state.gpsStatus = "Active";
    state.trackingStatus = `Active - ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    state.destinationStatus = `${Math.round(percentToDestination)}% to ${destination.label}`;
    if (state.phase === "outbound") state.progress = percentToDestination;
    if (state.phase === "return") state.returnProgress = percentToDestination;
    renderRouteMapPanel();
    offerNearbyBadges(point);
    saveState();
    render();
    refreshGpsWeatherIfNeeded();
  }

  function offerNearbyBadges(point) {
    const nearby = data.route.routePlaces.find((place) => place.lat && haversineMiles(point, place) < 5);
    if (nearby) state.nearbyBadgeMessage = `Badge available nearby: ${nearby.name}`;
  }

  function useLocation() {
    if (!navigator.geolocation) {
      state.gpsStatus = "Error";
      state.trackingStatus = "GPS unavailable";
      saveState();
      render();
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
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
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
          { label: "South Bend", location: { lat: stops.southBend.lat, lon: stops.southBend.lon } }
        ]
      };
    }
    if (selectedDayDate() === "2026-07-31") {
      return {
        origin: { label: "Olathe", location: { lat: stops.start.lat, lon: stops.start.lon } },
        destination: { label: "South Bend", location: { lat: stops.southBend.lat, lon: stops.southBend.lon } },
        waypoints: [
          { label: "Columbia", location: { lat: stops.columbia.lat, lon: stops.columbia.lon } },
          { label: "St. Louis", location: { lat: stops.stLouis.lat, lon: stops.stLouis.lon } },
          { label: "Indianapolis", location: { lat: stops.indianapolis.lat, lon: stops.indianapolis.lon } }
        ]
      };
    }
    if (selectedDayDate() === "2026-08-01") {
      return {
        origin: { label: "South Bend", location: { lat: stops.southBend.lat, lon: stops.southBend.lon } },
        destination: { label: "Plaunt ferry", location: { lat: stops.cheboygan.lat, lon: stops.cheboygan.lon } },
        waypoints: [
          { label: "Grand Rapids", location: { lat: stops.grandRapids.lat, lon: stops.grandRapids.lon } },
          { label: "Grayling", location: { lat: stops.grayling.lat, lon: stops.grayling.lon } }
        ]
      };
    }
    return {
      origin: { label: "Olathe", location: { lat: stops.start.lat, lon: stops.start.lon } },
      destination: { label: "Plaunt ferry", location: { lat: stops.cheboygan.lat, lon: stops.cheboygan.lon } },
      waypoints: [
        { label: "South Bend", location: { lat: stops.southBend.lat, lon: stops.southBend.lon } },
        { label: "Grand Rapids", location: { lat: stops.grandRapids.lat, lon: stops.grandRapids.lon } }
      ]
    };
  }

  function renderRouteMapPanel() {
    const container = byId("routeMapPanel");
    if (!container) return;
    byId("mapMode").textContent = state.lastPosition ? "Open map with live GPS active" : "Open map; tap Start GPS to show your location";
    if (!window.maplibregl) {
      container.innerHTML = `
        <div class="map-fallback">
          <strong>Map will load when online</strong>
          <p>The trip route and GPS tracker still work from saved trip data. Open the full route in your phone maps if you need turn-by-turn directions.</p>
          <div class="route-steps"><span>Olathe</span><span>South Bend</span><span>Cheboygan ferry</span><span>Bois Blanc Island</span></div>
          <div class="action-row"><a class="external-link" href="${activeRouteUrl()}" target="_blank" rel="noopener">Open driving route</a><a class="external-link" href="${data.mapLinks.returnUrl}" target="_blank" rel="noopener">Open return route</a></div>
        </div>
      `;
      return;
    }
    container.innerHTML = `<div id="mapLibreCanvas" class="maplibre-canvas" role="img" aria-label="Open route map"></div>`;
    drawRouteMap();
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

  function renderDaySelect() {
    const select = byId("daySelect");
    if (select.children.length) return;
    data.days.forEach((day) => {
      const option = document.createElement("option");
      option.value = day.date;
      option.textContent = `${day.date.slice(5)} - ${day.title}`;
      select.appendChild(option);
    });
    select.value = data.days[0].date;
    select.addEventListener("change", render);
  }

  function renderSplashProfiles() {
    const container = byId("splashProfiles");
    container.innerHTML = "";
    data.profiles.forEach((profile) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "splash-profile";
      button.style.setProperty("--profile-accent", profile.accent || "#1f78a4");
      const ageLabel = profile.age === "adult" ? "Adult full-detail view" : `Age ${profile.age} view`;
      button.innerHTML = `<strong>${profile.name}</strong><em>${ageLabel}</em><span>${profile.lens}</span>`;
      button.addEventListener("click", () => chooseProfile(profile.id));
      container.appendChild(button);
    });
  }

  function parseHash() {
    const parts = (location.hash || "").replace(/^#\/?/, "").split("/").filter(Boolean);
    const profileIds = data.profiles.map((profile) => profile.id);
    if (profileIds.includes(parts[0])) activeProfile = parts[0];
    const profile = currentProfile();
    const validPages = profile.id === "momdad" ? parentPages : pages;
    activePage = validPages.includes(parts[1]) ? parts[1] : "home";
  }

  function chooseProfile(profileId) {
    activeProfile = profileId;
    state.profile = profileId;
    state.hasChosenProfile = true;
    saveState();
    location.hash = `/${profileId}/home`;
    byId("splash").classList.add("is-hidden");
    render();
    if (!state.lastPosition && state.gpsStatus !== "Active") useLocation();
  }

  function navTo(page) {
    location.hash = `/${activeProfile}/${page}`;
  }

  const profileNavs = {
    child: [
      ["home", "Home"],
      ["route", "Route"],
      ["weather", "Weather"],
      ["badges", "Badges"],
      ["photos", "Photos"]
    ],
    momdad: [
      ["home", "Home"],
      ["route", "Route & GPS"],
      ["weather", "Weather"],
      ["ferry", "Ferry"],
      ["stops", "Stops"]
    ],
    jules: [
      ["home", "Home"],
      ["ferry", "Boats"],
      ["stars", "Stars"],
      ["badges", "Badges"],
      ["photos", "Photos"]
    ]
  };

  function renderBottomNav() {
    const nav = byId("bottomNav");
    if (!nav) return;
    const profile = currentProfile();
    const navItems = profile.id === "momdad" ? profileNavs.momdad : profile.id === "jules" ? profileNavs.jules : profileNavs.child;
    nav.innerHTML = navItems.map(([page, label]) => {
      const isActive = activePage === page;
      return `<a href="#/${activeProfile}/${page}" data-page="${page}" class="${isActive ? "is-active" : ""}" ${isActive ? 'aria-current="page"' : ""}>${label}</a>`;
    }).join("");
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
    const heroText = byId("heroText");
    if (heroText) { heroText.textContent = ""; heroText.hidden = true; }
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
      : `${milesLeft().toLocaleString()} mi · ~${timeText} to ${destination.label}.`;

    // Online status pill
    const pill = byId("onlineStatus");
    if (pill) {
      pill.textContent = navigator.onLine ? "Online" : "Offline";
      pill.className = `status-pill ${navigator.onLine ? "is-online" : "is-offline"}`;
    }

    // Topbar identity
    const topbarTitle = byId("topbarTitle");
    const topbarMeta = byId("topbarMeta");
    const day = selectedDay();
    if (topbarTitle) topbarTitle.textContent = profile.id === "momdad" ? "Mom/Dad Logistics" : `${profile.name}'s Trip`;
    if (topbarMeta) topbarMeta.textContent = `${day.date.slice(5)} · ${day.title} · ${phaseLabels[state.phase] || "Pre-trip"}`;

    // Next stop in today-summary-card
    const nextStopEl = byId("nextStop");
    if (nextStopEl) {
      nextStopEl.textContent = state.needNow
        ? `${state.needNow}: see Route page for stops.`
        : state.phase === "pretrip"
          ? "Pre-trip · Use planning and Route pages."
          : `Next target: ${destination.label}.`;
    }

    // Compact travel update in today-summary-card
    const kidUpdateEl = byId("kidTravelUpdate");
    if (kidUpdateEl) {
      const nearbyNote = state.nearbyBadgeMessage ? ` · ${state.nearbyBadgeMessage}` : "";
      kidUpdateEl.textContent = state.phase !== "pretrip" ? `${childText}${nearbyNote}` : "";
    }

    // Hidden elements (for GPS subpage reads)
    const actionEl = byId("actionStatus");
    if (actionEl) actionEl.textContent = state.actionMessage || "No action yet.";
    const gpsEl = byId("gpsStatus");
    if (gpsEl) gpsEl.textContent = state.gpsStatus || "Off";
    const destEl = byId("destinationStatus");
    if (destEl) destEl.textContent = state.destinationStatus || destination.label;
    const trackEl = byId("trackingStatus");
    if (trackEl) trackEl.textContent = state.trackingStatus || "Off";

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
      ["route", "Route", "Road, stops, and source-linked places."],
      ["gps", "GPS & Controls", "Start GPS, needs, trip phase."],
      ["weather", "Weather", "Open-Meteo plan guidance."],
      ["stars", "Stars", "STARZ directions and sky checks."],
      ["ferry", "Ferry / Boats", "Water crossing context."],
      ["activities", "Activities", "Your interactive board."],
      ["badges", "Badges", "Earned and upcoming badges."],
      ["saved", "Saved", "Trip Shortlist and votes."],
      ["photos", "Photos", "Captured trip story."]
    ];
    const parentTiles = [
      ["route", "Route & GPS", "Road-accurate links and GPS detail."],
      ["gps", "Trip Controls", "Start/stop GPS, needs, phase controls."],
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
        <img src="${routeVisualForPlace(place)}" alt="${escapeHtml(place.name)}" loading="lazy">
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
    if (profile.id === "jules") return renderJules();
    return `
      <div class="profile-dashboard">
        <div class="dashboard-hero">
          <p class="eyebrow">${profile.id === "momdad" ? "Logistics dashboard" : `${profile.name}'s dashboard`}</p>
          <h3>${profile.id === "momdad" ? "Full Trip Control" : "Choose what you want to do"}</h3>
          <p>${profile.lens}</p>
          ${renderBadgeShelf(profile.id)}
        </div>
        <div class="feature-strip">${data.route.routePlaces.slice(0, 4).map((place) => `
          <button type="button" class="feature-card" data-detail="${escapeHtml(place.name)}">
            <img src="${routeVisualForPlace(place)}" alt="${escapeHtml(place.name)}" loading="lazy">
            <span>${place.name}</span>
          </button>
        `).join("")}</div>
        <div class="dashboard-grid">${profileHomeTiles(profile)}</div>
      </div>
    `;
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
    if (activePage === "home") return renderDashboard(profile);
    const title = activePage === "gps" ? "GPS" : activePage[0].toUpperCase() + activePage.slice(1);
    return `
      <div class="subpage">
        <div class="subpage-head">
          <button type="button" data-nav="home">Back to Profile Home</button>
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
      sources: () => renderSourcesPage()
    };
    return (map[page] || map.today)();
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
        <img src="${routeVisualForPlace(place)}" alt="${escapeHtml(place.name)}" loading="lazy">
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
      <div class="profile-grid">
        <div>
          <div class="choice-card">
            <strong>${feature.title}</strong>
            <p>${feature.text}</p>
            <p><strong>Look for:</strong> ${feature.lookFor}</p>
            <div class="action-row"><button type="button" data-complete-activity="${escapeHtml(feature.title)}">Done</button><button type="button" data-capture="${escapeHtml(feature.title)}">Capture image/video</button></div>
          </div>
          ${placeCard(place, profile)}
        </div>
        <aside>${renderBadgesMini(profile)}</aside>
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
      <div class="map-panel">
        <div class="map-toolbar">
          <strong>Live Route Map</strong>
          <span id="mapMode">${state.lastPosition ? "Live GPS active" : "Tap Start GPS to show your location"}</span>
        </div>
        <div id="map" class="route-map maplibre-panel" aria-label="Live route map">
          <div id="routeMapPanel" class="maplibre-panel"></div>
        </div>
        <div id="routeQuest" class="route-quest"></div>
      </div>
      ${placeCard(place, profile)}
      ${renderStopsPage()}
    `;
  }

  function renderGpsPage() {
    const pos = state.lastPosition;
    return `
      <div class="gps-subpage">
        <div class="choice-card">
          <strong>GPS and tracking</strong>
          <p>Status: ${state.gpsStatus || "Off"} — ${state.trackingStatus || "Off"}</p>
          <dl>
            <div><dt>Accuracy</dt><dd>${pos ? `${Math.round(pos.accuracy)} meters` : "Not available"}</dd></div>
            <div><dt>Coordinates</dt><dd>${pos ? `${pos.lat.toFixed(5)}, ${pos.lon.toFixed(5)}` : "Not available"}</dd></div>
            <div><dt>Last updated</dt><dd>${pos ? new Date(pos.updatedAt).toLocaleString() : "Not available"}</dd></div>
            <div><dt>Destination</dt><dd>${state.destinationStatus || activeDestination().label}</dd></div>
            <div><dt>Miles left</dt><dd>${milesLeft().toLocaleString()}</dd></div>
          </dl>
          <div class="trip-controls-grid">
            <button id="useLocationSub" type="button" class="primary-action">Start GPS</button>
            <button id="stopLocationSub" type="button">Stop GPS</button>
            <button id="startTripSub" type="button">We Left</button>
            <button id="markArrivedSub" type="button">On Island</button>
            <button id="startReturnSub" type="button">Return</button>
            <button id="completeTripSub" type="button">Complete</button>
          </div>
        </div>
        <div class="choice-card">
          <strong>Needs</strong>
          <p>Tap a need to see nearby route-aware stops.</p>
          <div class="quick-needs-grid">
            <button data-need="Bathroom now" type="button">Bathroom now</button>
            <button data-need="Gas now" type="button">Gas now</button>
            <button data-need="Food now" type="button">Food now</button>
          </div>
          <div id="needResultsSub" class="need-results"></div>
        </div>
        <div class="choice-card">
          <p class="eyebrow">Last action</p>
          <p>${state.actionMessage || "No action yet."}</p>
        </div>
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
      <div id="weatherBlocks" class="weather-grid">${renderWeatherBlocksMarkup(profile, weatherLocationsForContext().map((location) => state.weather[location.id] || { location, sourceStatus: "Not available" }))}</div>
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
    const captures = state.captures.map((item, index) => ({ ...item, index })).filter((item) => profile.id === "momdad" || item.profile === activeProfile);
    return `
      <div class="action-row"><button type="button" data-capture="Trip photo">Capture image/video</button></div>
      <div class="summary-grid">
        ${captures.map((item) => `
          <div class="summary-tile">
            ${item.type.startsWith("image/") ? `<img class="summary-photo" src="${item.dataUrl}" alt="${escapeHtml(item.label)}">` : `<span>Video saved: ${escapeHtml(item.name || item.label)}</span>`}
            <span>${escapeHtml(item.label)} - ${new Date(item.at).toLocaleDateString()}${profile.id === "momdad" ? ` - ${profileName(item.profile)}` : ""}</span>
            <button type="button" data-delete-capture="${item.index}">Delete</button>
          </div>
        `).join("") || `<p>No captured moments yet.</p>`}
      </div>
      <p class="map-caption">Media is stored on this device with a size limit. Delete old captures if storage gets tight.</p>
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

  function renderProfile() {
    parseHash();
    const profile = currentProfile();
    byId("profileView").style.setProperty("--profile-accent", profile.accent || "#1f78a4");
    byId("profileTitle").textContent = profile.id === "jules" ? "Captain Jules" : profile.id === "momdad" ? "Mom/Dad logistics" : `${profile.name}'s dashboard`;
    byId("profileView").innerHTML = renderSubpage(profile);
    byId("activeTraveler").textContent = `${profile.name}'s view`;
    wireDynamicActions();
    if (activePage === "route") {
      renderRouteMapPanel();
      renderRouteQuest();
    }
    if (activePage === "weather" && navigator.onLine && !Object.keys(state.weather || {}).length) {
      setTimeout(refreshWeatherCards, 0);
    }
  }


  function wireDynamicActions() {
    document.querySelectorAll("[data-nav]").forEach((button) => {
      button.onclick = () => navTo(button.dataset.nav);
    });
    document.querySelectorAll("[data-detail]").forEach((button) => {
      button.onclick = () => { location.hash = `/${activeProfile}/detail/${encodeURIComponent(button.dataset.detail)}`; };
    });
    document.querySelectorAll("[data-shortlist]").forEach((button) => {
      button.onclick = () => saveShortlist({ name: button.dataset.shortlist, category: button.dataset.category, sourceUrl: button.dataset.url });
    });
    document.querySelectorAll("[data-remove-shortlist]").forEach((button) => {
      button.onclick = () => removeShortlist(button.dataset.removeShortlist);
    });
    document.querySelectorAll("[data-vote-item]").forEach((button) => {
      button.onclick = () => familyVote(button.dataset.voteItem, button.dataset.choice);
    });
    document.querySelectorAll("[data-approve]").forEach((button) => {
      button.onclick = () => approvePlan(button.dataset.approve);
    });
    document.querySelectorAll("[data-complete-activity]").forEach((button) => {
      button.onclick = () => completeActivity(button.dataset.completeActivity);
    });
    document.querySelectorAll("[data-capture]").forEach((button) => {
      button.onclick = () => startCapture(button.dataset.capture);
    });
    document.querySelectorAll("[data-delete-capture]").forEach((button) => {
      button.onclick = () => deleteCapture(Number(button.dataset.deleteCapture));
    });
    document.querySelectorAll("[data-badge]").forEach((button) => {
      button.onclick = () => showBadgeDetail(button.dataset.badge);
    });
    document.querySelectorAll("[data-source]").forEach((button) => {
      button.onclick = () => {
        awardBadge("source-checker", { source: button.dataset.source });
        setAction(`Source checked: ${button.dataset.source}.`);
      };
    });
    document.querySelectorAll("[data-weather-refresh]").forEach((button) => { button.onclick = refreshWeatherCards; });
    document.querySelectorAll("[data-start-gps]").forEach((button) => { button.onclick = useLocation; });
    wireSubpageGpsControls();
  }

  function wireEvents() {
    byId("activeTraveler").addEventListener("click", () => byId("splash").classList.remove("is-hidden"));
    // Primary GPS button in today-summary-card
    byId("useLocation").addEventListener("click", useLocation);
    // Today-summary-card navigation buttons
    document.querySelectorAll("[data-nav-global]").forEach((button) => {
      button.addEventListener("click", () => navTo(button.dataset.navGlobal));
    });
    window.addEventListener("hashchange", render);
    window.addEventListener("online", renderTripStatus);
    window.addEventListener("offline", renderTripStatus);
  }

  function wireSubpageGpsControls() {
    const sub = (id, fn) => { const el = byId(id); if (el) el.addEventListener("click", fn); };
    sub("useLocationSub", useLocation);
    sub("stopLocationSub", stopLocation);
    sub("startTripSub", () => setPhase("outbound"));
    sub("markArrivedSub", () => setPhase("island"));
    sub("startReturnSub", () => setPhase("return"));
    sub("completeTripSub", () => setPhase("complete"));
    document.querySelectorAll(".gps-subpage [data-need]").forEach((button) => {
      button.addEventListener("click", () => {
        state.needNow = button.dataset.need;
        awardByTrigger("need", { need: state.needNow });
        setAction(`${state.needNow} selected. Showing route-aware options.`);
        const container = byId("needResultsSub");
        if (container) {
          container.innerHTML = `
            <div class="choice-card">
              <strong>${state.needNow}</strong>
              <p>${state.phase === "pretrip" ? "Previewing likely route options." : "Sorted by current route position."}</p>
              <ul>${bestNeedStops().map((stop) => `<li><strong>${stop.name}</strong><br>${stop.timing}. ${stop.note}</li>`).join("")}</ul>
            </div>
          `;
        }
      });
    });
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  function render() {
    parseHash();
    if (!state.hasChosenProfile) byId("splash").classList.remove("is-hidden");
    renderBottomNav();
    renderCountdowns();
    renderTripStatus();
    renderProfile();
  }

  renderDaySelect();
  renderSplashProfiles();
  if (state.hasChosenProfile) byId("splash").classList.add("is-hidden");
  if (!location.hash) location.hash = `/${activeProfile}/home`;
  wireEvents();
  wireCaptureInput();
  registerServiceWorker();
  render();
})();
