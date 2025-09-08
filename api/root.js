import fs from "node:fs/promises";
import path from "node:path";

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "index.html");
    const html = await fs.readFile(filePath, "utf8").catch(() => null);
    if (html) {
      res.setHeader("content-type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    }
    const fallback = `
<!doctype html><html><head><meta charset="utf-8"/>
<title>tg-feedback · status</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Helvetica,Arial,sans-serif;background:#0b1220;color:#e5e7eb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px}
  .card{max-width:680px;width:100%;background:#0f172a;border:1px solid #334155;border-radius:14px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
  h1{margin:0 0 16px 0;font-size:22px}
  .grid{display:grid;grid-template-columns:160px 1fr;gap:8px 12px}
  .k{opacity:.75}
  a{color:#60a5fa;text-decoration:none}
  a:hover{text-decoration:underline}
  .row{margin-top:18px}
  button{padding:8px 12px;border:1px solid #334155;background:#111827;color:#fff;border-radius:8px;cursor:pointer}
  button:hover{opacity:.9}
  .ok{color:#22c55e}
  .bad{color:#ef4444}
</style>
</head><body>
<div class="card">
  <h1>tg-feedback · status</h1>
  <div class="grid">
    <div class="k">Admin</div><div><a href="/api/admin">/api/admin</a></div>
    <div class="k">Ping</div><div><a href="/api/ping">/api/ping</a></div>
    <div class="k">Telegram Webhook</div><div><a href="/api/telegram">/api/telegram</a></div>
  </div>
  <div class="row">
    <button id="hb">Проверить health</button>
    <span id="hs"></span>
  </div>
</div>
<script>
document.getElementById('hb').onclick = async () => {
  const el = document.getElementById('hs');
  el.textContent = '…';
  try{
    const r = await fetch('/api/ping',{cache:'no-store'});
    el.textContent = r.ok ? 'OK' : ('ERR '+r.status);
    el.className = r.ok ? 'ok' : 'bad';
  }catch(e){
    el.textContent = 'ERR';
    el.className = 'bad';
  }
};
</script>
</body></html>`;
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.status(200).send(fallback);
  } catch (e) {
    return res.status(500).send("Internal Server Error");
  }
}
