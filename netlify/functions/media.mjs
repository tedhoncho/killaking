export default async (request, context) => {
  try {
    // Get key from URL directly - more reliable than context.params
    const url = new URL(request.url);
    const key = url.pathname.replace('/media/', '').replace('/.netlify/functions/media/', '');

    if (!key) {
      return new Response("Not found", { status: 404 });
    }

    const { getStore } = await import("@netlify/blobs");
    const store = getStore("killaking-media");

    // Try to get the blob
    const result = await store.getWithMetadata(key, { type: "arrayBuffer" });

    if (!result || !result.data) {
      // Debug: list what's actually in the store
      return new Response(JSON.stringify({ 
        error: "Not found", 
        requestedKey: key,
        url: request.url,
        pathname: url.pathname
      }), { 
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const contentType = result.metadata?.contentType || "application/octet-stream";

    return new Response(result.data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = { path: "/media/*" };
