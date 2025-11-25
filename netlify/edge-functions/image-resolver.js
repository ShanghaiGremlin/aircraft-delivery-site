// Robust resolver: parses pathname instead of relying on context.params.splat
const DIRS = [
  "", // root: /assets/<file>
  "about",
  "join-pilot-roster",
  "mobile",
  "past-deliveries",
  "pilot-directory",
  "quote",
  "services",
];

function extVariants(file) {
  const m = file.match(/^(.*)\.([^.]+)$/);
  if (!m) return [file];
  const base = m[1], ext = m[2].toLowerCase();
  if (ext === "jpg")  return [`${base}.jpg`, `${base}.jpeg`];
  if (ext === "jpeg") return [`${base}.jpeg`, `${base}.jpg`];
  return [file]; // png/webp/etc keep as-is
}

export default async (request) => {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean); // e.g. ["images","320","N6181T-file.jpg"]

  // Determine route type
  const isFull = parts[1] === "full";
  const width = isFull ? null : Number.parseInt(parts[1], 10);

  // The remainder after "/images/<width|full>/"
  const rest = parts.slice(2).join("/"); // "N6181T-file.jpg" or "past-deliveries/N6181T-file.jpg"
  const hasSubpath = rest.includes("/");

  // Build candidate asset paths
  const candidates = [];
  if (!rest) {
    // malformed path like /images/320/
    console.warn("Resolver 400: missing filename in", url.pathname);
    return new Response("Bad request", { status: 400 });
  }

  if (hasSubpath) {
    const i = rest.lastIndexOf("/");
    const dir = rest.slice(0, i);
    const file = rest.slice(i + 1);
    for (const f of extVariants(file)) {
      candidates.push(`/assets/${dir}/${f}`);
    }
  } else {
    for (const f of extVariants(rest)) {
      for (const dir of DIRS) {
        const prefix = dir ? `/assets/${dir}` : `/assets`;
        candidates.push(`${prefix}/${f}`);
      }
    }
  }

  console.log("Resolver probing:", candidates);

  // Probe each candidate with HEAD, then GET as a fallback (in case HEAD isn't supported)
  for (const assetPath of candidates) {
    const probe = new URL(assetPath, url);
    let head = await fetch(probe.toString(), { method: "HEAD" });
    if (!head.ok) {
      // lightweight GET fallback
      head = await fetch(probe.toString(), { method: "GET" });
    }
    if (head.ok) {
      const target = new URL("/.netlify/images", url);
      target.searchParams.set("url", assetPath);
      if (!isFull) {
        if (!Number.isFinite(width) || width <= 0) {
          return new Response("Bad width", { status: 400 });
        }
        target.searchParams.set("w", String(width));
      }
      // pass-through any extra query params (e.g. fm=png)
      for (const [k, v] of url.searchParams) {
        if (k !== "w") target.searchParams.set(k, v);
      }
      console.log("Resolver hit:", assetPath, "->", target.toString());
      return Response.redirect(target.toString(), 302);
    }
  }

  console.warn("Resolver 404 for:", url.pathname, "tried:", candidates);
  return new Response("Not found", { status: 404 });
}
