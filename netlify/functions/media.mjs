export default async (request, context) => {
  const key = context.params.splat;

  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("killaking-media");
    const entry = await store.getWithMetadata(key, { type: "arrayBuffer" });

    if (!entry || !entry.data) {
      return new Response("Not found", { status: 404 });
    }

    const contentType = entry.metadata?.contentType || "application/octet-stream";

    return new Response(entry.data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Media error:", err);
    return new Response("Error: " + err.message, { status: 500 });
  }
};

export const config = { path: "/media/*" };
