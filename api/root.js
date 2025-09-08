import fs from "node:fs/promises";
import path from "node:path";

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "index.html");
    const html = await fs.readFile(filePath, "utf8").catch(() => null);
    res.setHeader("content-type", "text/html; charset=utf-8");
    if (html) return res.status(200).send(html);
    return res.status(200).send("<!doctype html><html><head><meta charset='utf-8'><title>tg-feedback · status</title></head><body><h1>tg-feedback · status</h1><ul><li><a href='/api/admin'>/api/admin</a></li><li><a href='/api/ping'>/api/ping</a></li><li><a href='/api/telegram'>/api/telegram</a></li></ul></body></html>");
  } catch {
    return res.status(500).send("Internal Server Error");
  }
}
