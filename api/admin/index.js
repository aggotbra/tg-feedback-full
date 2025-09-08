export default async function handler(req, res) {
  console.log("[admin] hit", { method: req.method, url: req.url });
  res.status(200).send("admin ok");
}
