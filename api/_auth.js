const b64 = (s) => Buffer.from(s).toString("base64");

export default function requireAdmin(req, res) {
  const user = process.env.ADMIN_USER || "";
  const pass = process.env.ADMIN_PASS || "";
  const expected = "Basic " + b64(`${user}:${pass}`);
  const got = req.headers.authorization || "";

  if (!user || !pass || got !== expected) {
    res.setHeader("WWW-Authenticate", 'Basic realm="admin", charset="UTF-8"');
    res.status(401).end("Unauthorized");
    return false;
  }
  return true;
}
