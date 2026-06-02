import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const key = formData.get("key"); // e.g. "artwork/song-01" or "mp3s/last-days"
    const password = formData.get("password");

    // Password protection — same as edit mode password
    if (password !== "killaking2026") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (!file || !key) {
      return new Response(JSON.stringify({ error: "Missing file or key" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const store = getStore({ name: "killaking-media", consistency: "strong" });
    const arrayBuffer = await file.arrayBuffer();
    const contentType = file.type || "application/octet-stream";

    await store.set(key, arrayBuffer, {
      metadata: { contentType, fileName: file.name, uploadedAt: new Date().toISOString() },
    });

    // Build the public URL
    const siteUrl = context.site?.url || `https://${request.headers.get("host")}`;
    const mediaUrl = `${siteUrl}/media/${key}`;

    return new Response(JSON.stringify({ success: true, url: mediaUrl, key }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
};

export const config = { path: "/upload" };
