export default async function handler(req, res) {
  console.log("[ping] hit", { method: req.method, url: req.url, ts: new Date().toISOString() });
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
}
