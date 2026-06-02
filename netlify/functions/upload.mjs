export default async (request, context) => {
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
    const key = formData.get("key");
    const password = formData.get("password");

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

    const { getStore } = await import("@netlify/blobs");
    const store = getStore("killaking-media");
    const arrayBuffer = await file.arrayBuffer();

    await store.set(key, arrayBuffer, {
      metadata: { contentType: file.type || "application/octet-stream", fileName: file.name },
    });

    const siteUrl = `https://${request.headers.get("host")}`;
    const mediaUrl = `${siteUrl}/media/${key}`;

    return new Response(JSON.stringify({ success: true, url: mediaUrl, key }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
};

export const config = { path: "/upload" };
