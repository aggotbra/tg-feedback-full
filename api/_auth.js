export function requireBasicAuth(req, res) {
  const user = process.env.ADMIN_USER || "";
  const pass = process.env.ADMIN_PASS || "";
  if (!user || !pass) return { name: "no-auth-set" };
  const h = req.headers.authorization || "";
  if (!h.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="admin", charset="UTF-8"');
    res.status(401).send("Auth required");
    return null;
  }
  const decoded = Buffer.from(h.slice(6), "base64").toString("utf8");
  const idx = decoded.indexOf(":");
  const name = idx >= 0 ? decoded.slice(0, idx) : decoded;
  const pwd = idx >= 0 ? decoded.slice(idx + 1) : "";
  if (name !== user || pwd !== pass) {
    res.setHeader("WWW-Authenticate", 'Basic realm="admin", charset="UTF-8"');
    res.status(401).send("Auth required");
    return null;
  }
  return { name };
}
