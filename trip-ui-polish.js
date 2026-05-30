(function () {
  const data = window.TRIP_DATA || {};
  const displayMap = data.dateDisplayMap || {};
  const shortMap = Object.fromEntries(Object.entries(displayMap).map(([from, to]) => [from.slice(5), to.slice(5)]));
  const textMap = {
    "July 31": "July 24",
    "August 1": "July 25",
    "August 2": "July 26",
    "August 3": "July 27",
    "August 4": "July 28",
    "August 5": "July 29",
    "August 6": "July 30",
    "August 7": "July 31",
    "August 8": "August 1",
    "August 9": "August 2"
  };

  function displayDate(date) {
    return displayMap[date] || date;
  }

  function replaceDateText(value) {
    let next = String(value || "");
    Object.entries(shortMap).forEach(([from, to]) => {
      next = next.replaceAll(from, to);
    });
    Object.entries(textMap).forEach(([from, to]) => {
      next = next.replaceAll(from, to);
    });
    return next;
  }

  function patchDaySelect() {
    const select = document.getElementById("daySelect");
    if (!select || !data.days) return;
    Array.from(select.options).forEach((option) => {
      const day = data.days.find((item) => item.date === option.value);
      if (!day) return;
      option.textContent = `${displayDate(day.date).slice(5)} - ${day.title}`;
    });
  }

  function patchVisibleDates() {
    const root = document.querySelector(".app-shell");
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const next = replaceDateText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  }

  function improveMobileFlow() {
    document.body.classList.add("mobile-first-ready");
    document.querySelectorAll(".bottom-nav a").forEach((link) => {
      link.setAttribute("role", "link");
      link.setAttribute("aria-label", link.textContent.trim());
    });
    document.querySelectorAll(".dashboard-tile, .splash-profile, .feature-card").forEach((button) => {
      if (!button.getAttribute("aria-label")) {
        button.setAttribute("aria-label", button.textContent.trim().replace(/\s+/g, " "));
      }
    });
  }

  function applyPolish() {
    patchDaySelect();
    patchVisibleDates();
    improveMobileFlow();
  }

  function schedulePolish() {
    requestAnimationFrame(applyPolish);
    setTimeout(applyPolish, 80);
  }

  document.addEventListener("DOMContentLoaded", schedulePolish);
  window.addEventListener("hashchange", schedulePolish);
  window.addEventListener("online", schedulePolish);
  window.addEventListener("offline", schedulePolish);

  const observer = new MutationObserver(schedulePolish);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  schedulePolish();
})();
