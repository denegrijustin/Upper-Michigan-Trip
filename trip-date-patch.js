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
})();
