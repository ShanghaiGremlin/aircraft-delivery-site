// netlify/edge-functions/image-resolver-debug.js
const DIRS = [
  "", // /assets/<file>
  "about",
  "join-pilot-roster",
  "mobile",
  "past-deliveries",
  "pilot-directory",
  "quote",
  "services",
];

function splitExt(file) {
  const m = file.match(/^(.*)\.([^.]+)$/);
  return m ? [m[1], m[2]] : [file, ""];
}

function extVariants(file) {
  const [base, ext] = splitExt(file);
  const e = ext.toLowerCase();
  if (!ext) return [file];
  if (e === "jpg")  return [`${base}.jpg`, `${base}.jpeg`];
  if (e === "jpeg") return [`${base}.jpeg`, `${base}.jpg`];
  return [`${base}.${ext}`]; // png/webp/etc
}

export default async (request) => {
  const url   = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean); // ["images-debug","320","foo.jpg"] | ["images-debug","full","foo.jpg"]

  const isFull = parts[1] === "full";
  const width  = isFull ? null : Number.parseInt(parts[1], 10);
  const rest   = parts.slice(2).join("/"); // "foo.jpg" or "folder/foo.jpg"

  if (!rest || (!isFull && (!Number.isFinite(width) || width <= 0))) {
    return new Response(JSON.stringify({ error: "bad request", route: url.pathname }), {
      status: 400, headers: { "content-type": "application/json" }
    });
  }

  // Build candidate /assets paths
  const candidates = [];
  if (rest.includes("/")) {
    const i = rest.lastIndexOf("/");
    const dir = rest.slice(0, i);
    const file = rest.slice(i + 1);
    for (const v of extVariants(file)) candidates.push(`/assets/${dir}/${v}`);
  } else {
    for (const v of extVariants(rest)) {
      for (const d of DIRS) candidates.push(`${d ? `/assets/${d}` : "/assets"}/${v}`);
    }
  }

  // Probe: which candidate actually exists?
  let hit = null;
  for (const assetPath of candidates) {
    const probe = new URL(assetPath, url).toString();
    let r = await fetch(probe, { method: "HEAD" });
    if (!r.ok) r = await fetch(probe, { method: "GET" });
    if (r.ok) { hit = assetPath; break; }
  }

  // If found, show the exact Netlify Images URL we'd use
  let target = null;
  if (hit) {
    const t = new URL("/.netlify/images", url);
    t.searchParams.set("url", hit);
    if (!isFull) t.searchParams.set("w", String(width));
    // pass through any extra params EXCEPT "debug"
    for (const [k, v] of url.searchParams) if (k !== "debug") t.searchParams.set(k, v);
    target = t.toString();
  }

  return new Response(JSON.stringify({ route: url.pathname, candidates, hit, target }, null, 2), {
    status: hit ? 200 : 404,
    headers: { "content-type": "application/json" }
  });
};
