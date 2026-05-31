(function () {
  const data = window.TRIP_DATA;
  const WEATHER_TTL = 30 * 60 * 1000;
  const state = loadState();
  let activeProfile = state.profile || "elsie";
  let activePage = "today";
  let watchId = null;
  let lastGpsRender = 0;
  let routeMap = null;
  let exploreMap = null;
  let mapLibreLoading = null;

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
    ["route", "Route", "Live route map and travel stops"],
    ["explore", "Attractions", "All route attractions on a cluster map"],
    ["nearby", "Nearby", "Closest route-relevant places"],
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
      pendingAnalyze: false,
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
    state.journal ||= [];
    state.draftPhotos ||= [];
    state.visitedStops ||= {};
    [state.captures, state.journal, state.draftPhotos].forEach((list) => {
      list.forEach((item) => {
        item.id ||= makeId("photo");
        item.notes ||= "";
      });
    });
    state.badges ||= {};
    state.weather ||= {};
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
    return (data.attractions || data.route.routePlaces || [])
      .map((item) => enrichStop({ ...item, title: item.title || item.name, sourceUrl: item.sourceUrl || item.learnMore }))
      .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lon));
  }

  function enrichStop(item) {
    const title = item.title || item.name || "";
    const category = item.category || stopCategory(item);
    return {
      ...item,
      category,
      icon: stopIcon(category),
      tier: item.tier || stopTier(item),
      estimatedStopTime: item.estimatedStopTime || stopTime(item),
      distanceOffRoute: item.distanceOffRoute || offRouteEstimate(item),
      latitude: item.lat,
      longitude: item.lon
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
    return Object.values(state.shortlist || {}).some((item) => item.name === name);
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
    if (place.learnMore) return place.learnMore;
    const links = data.sourceLinks;
    if (place.name.includes("Gateway")) return links.gatewayArch.url;
    if (place.name.includes("Notre")) return links.notreDame.url;
    if (place.name.includes("Studebaker")) return links.studebaker.url;
    if (place.name.includes("Dunes")) return links.indianaDunes.url;
    if (place.name.includes("Mackinac")) return links.mackinacBridge.url;
    if (place.name.includes("Plaunt")) return links.ferry.url;
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

  function renderTopBadgePreview() {
    const container = byId("topBadgePreview");
    if (!container) return;
    const profile = currentProfile();
    container.innerHTML = `
      <div class="section-head compact-head">
        <div>
          <p class="eyebrow">Badges</p>
          <strong>${profile.name}'s earned and available badges</strong>
        </div>
        <button type="button" data-nav-global="rewards">View all</button>
      </div>
      ${renderBadgeShelf(profile.id)}
    `;
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
    renderHomeMapPanel();
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
    renderExploreMapPanel();
    offerNearbyBadges(point);
    saveState();
    renderTripStatus();
    refreshGpsWeatherIfNeeded();
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
    const mapMode = byId("mapMode");
    if (mapMode) mapMode.textContent = state.lastPosition ? "Open map with live GPS active" : "Open map; tap Start GPS to show your location";
    if (!window.maplibregl) {
      container.innerHTML = `
        <div class="map-fallback">
          <strong>Loading route map</strong>
          <p>The full map loads only when this page is open so the rest of the app stays fast. Phone-map buttons still work immediately.</p>
          <div class="route-steps"><span>Olathe</span><span>South Bend</span><span>Cheboygan ferry</span><span>Bois Blanc Island</span></div>
          <div class="action-row"><a class="external-link" href="${activeRouteUrl()}" target="_blank" rel="noopener">Open driving route</a><a class="external-link" href="${data.mapLinks.returnUrl}" target="_blank" rel="noopener">Open return route</a></div>
        </div>
      `;
      loadMapLibre();
      return;
    }
    container.innerHTML = `<div id="mapLibreCanvas" class="maplibre-canvas" role="img" aria-label="Open route map"></div>`;
    drawRouteMap();
  }

  function renderHomeMapPanel() {
    const container = byId("homeRouteMapPanel");
    if (!container) return;
    const points = data.route.mapStops || [];
    const attractions = allAttractions();
    container.innerHTML = `
      <div class="static-route-map">
        <svg viewBox="0 0 1000 560" role="img" aria-label="Route from Olathe to Bois Blanc Island">
          <path class="static-route-shadow" d="M 78 450 C 210 430 270 465 370 420 S 500 360 570 305 S 620 230 678 180 S 760 126 846 82" />
          <path class="static-route-line" d="M 78 450 C 210 430 270 465 370 420 S 500 360 570 305 S 620 230 678 180 S 760 126 846 82" />
          ${points.map((stop, index) => {
            const x = 78 + (index / Math.max(1, points.length - 1)) * 768;
            const y = 450 - (index / Math.max(1, points.length - 1)) * 368 + (index % 2 ? 24 : -10);
            return `<g><circle class="static-stop ${stop.type}" cx="${x}" cy="${y}" r="13"/><text x="${x + 18}" y="${y + 5}">${escapeHtml(stop.label)}</text></g>`;
          }).join("")}
          ${attractions.map((item) => {
            const pct = clamp((item.milesFromStart || 0) / data.route.totalOutboundMiles, 0, 1);
            const x = 78 + pct * 768;
            const y = 450 - pct * 368 + (Math.round(pct * 10) % 2 ? -42 : 42);
            return `<g class="static-attraction ${isStopSaved(item) ? "is-saved" : ""} ${isStopVisited(item) ? "is-visited" : ""}" data-title="${escapeHtml(item.title)}"><circle cx="${x}" cy="${y}" r="9"/><text x="${x + 12}" y="${y + 4}">${escapeHtml(item.title)}</text></g>`;
          }).join("")}
          ${state.lastPosition ? `<circle class="static-gps" cx="${78 + progressForPhase() / 100 * 768}" cy="${450 - progressForPhase() / 100 * 368}" r="15"><title>Current GPS location</title></circle>` : ""}
        </svg>
        <div class="map-pin-layer">
          ${attractions.map((item) => {
            const pct = clamp((item.milesFromStart || 0) / data.route.totalOutboundMiles, 0, 1);
            const left = 7.8 + pct * 76.8;
            const top = 80 - pct * 66 + (Math.round(pct * 10) % 2 ? -7 : 7);
            return `<button type="button" class="interactive-map-pin category-${item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")} ${isStopSaved(item) ? "is-saved" : ""} ${isStopVisited(item) ? "is-visited" : ""}" style="left:${left}%;top:${top}%;" data-preview-stop="${escapeHtml(item.title)}" aria-label="${escapeHtml(item.title)} ${item.category}"><span>${item.icon}</span></button>`;
          }).join("")}
        </div>
        <div class="static-map-pins">
          ${attractions.map((item) => `<button type="button" data-preview-stop="${escapeHtml(item.title)}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.category)} · ${escapeHtml(item.tier)} · ${escapeHtml(stopDistanceLabel(item))}</span></button>`).join("")}
        </div>
      </div>
    `;
  }

  function showAttractionPreview(item) {
    item = enrichStop(item);
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
    const profile = currentProfile();
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
    window.open(appleMapsUrl(stop), "_blank");
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
        properties: { id: item.id, title: item.title, place: item.place, segment: item.routeSegment },
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
      attractions.forEach((item) => addExploreAttractionMarker(item));
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
    const aliases = { home: "today", activities: "learn", stars: "learn", ferry: "learn", badges: "rewards", saved: "rewards", photos: "memories" };
    const requestedPage = aliases[parts[1]] || parts[1];
    activePage = validPages.includes(requestedPage) ? requestedPage : "today";
  }

  function chooseProfile(profileId) {
    activeProfile = profileId;
    state.profile = profileId;
    state.hasChosenProfile = true;
    saveState();
    location.hash = `/${profileId}/route`;
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
      ["route", "Route", "Road, stops, and source-linked places."],
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
        <div class="choice-card"><strong>Offline cache</strong><p>The app shell and trip data are cached for road use. Cache version: v22.</p></div>
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
      document.getElementById("badgeDetailOverlay")?.remove();
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
    document.addEventListener("mouseover", (event) => {
      const target = event.target.closest("[data-preview-stop]");
      if (!target || event.pointerType === "touch") return;
      const item = attractionForName(target.dataset.previewStop);
      if (item) showAttractionPreview(item);
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
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  function render() {
    parseHash();
    if (!state.hasChosenProfile) byId("splash").classList.remove("is-hidden");
    renderCountdowns();
    renderTripStatus();
    renderTopBadgePreview();
    renderHomeMapPanel();
    renderBottomDrawer();
    renderProfile();
    renderRouteMapPanel();
    renderExploreMapPanel();
    renderRouteQuest();
    renderBottomNav();
    renderMainMenu();
  }

  renderDaySelect();
  renderSplashProfiles();
  if (state.hasChosenProfile) byId("splash").classList.add("is-hidden");
  if (!location.hash) location.hash = `/${activeProfile}/route`;
  wireEvents();
  wireCaptureInput();
  registerServiceWorker();
  render();
})();
