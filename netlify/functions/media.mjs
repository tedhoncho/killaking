import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  const url = new URL(request.url);
  // key = everything after /media/
  const key = context.params.splat;

  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const store = getStore({ name: "killaking-media", consistency: "strong" });
    const { data, metadata } = await store.getWithMetadata(key, { type: "arrayBuffer" });

    if (!data) {
      return new Response("Not found", { status: 404 });
    }

    const contentType = metadata?.contentType || "application/octet-stream";

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Media fetch error:", err);
    return new Response("Not found", { status: 404 });
  }
};

export const config = { path: "/media/*" };
