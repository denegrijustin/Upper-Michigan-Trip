export async function onRequestGet({ env }) {
  const cached = env.TRIP_CACHE ? await env.TRIP_CACHE.get("events", "json") : null;
  return Response.json(
    cached || {
      source: "static-fallback",
      freshness: "manual fallback",
      items: [
        "Check Bois Blanc Township and community notices.",
        "Verify The Outpost and Bob-Lo Tavern hours.",
        "Use Cheboygan, Mackinac City, and St. Ignace as mainland fallback event areas."
      ]
    }
  );
}
