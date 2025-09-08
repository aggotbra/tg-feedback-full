export default async function handler(req, res) {
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.status(200).send(
    "<!doctype html><html><head><meta charset='utf-8'><title>tg-feedback · status</title></head><body style='font-family:system-ui;padding:24px'>" +
    "<h1>tg-feedback · status</h1>" +
    "<ul>" +
    "<li><a href='/api/admin'>/api/admin</a></li>" +
    "<li><a href='/api/ping'>/api/ping</a></li>" +
    "<li><a href='/api/telegram'>/api/telegram</a></li>" +
    "</ul>" +
    "</body></html>"
  );
}
