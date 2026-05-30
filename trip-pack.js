export async function onRequestGet() {
  return Response.json({
    version: "v1",
    generatedAt: new Date().toISOString(),
    note: "The static app includes the core offline trip pack. Live data can be layered into KV."
  });
}
