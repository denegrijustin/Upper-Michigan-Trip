export async function onRequestGet({ env }) {
  const cached = env.TRIP_CACHE ? await env.TRIP_CACHE.get("ferry-status", "json") : null;
  return Response.json(
    cached || {
      source: "static-fallback",
      freshness: "manual fallback",
      terminal: "Plaunt Transportation, 412 Water Street, Cheboygan, MI",
      route: "Cheboygan to Bois Blanc Island",
      crossing: "About 45 minutes",
      reminders: [
        "Verify schedule before leaving.",
        "Arrive with a buffer.",
        "Top off gas and supplies before boarding."
      ]
    }
  );
}
