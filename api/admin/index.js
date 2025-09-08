import { query } from "../_db.js";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || "";
  const [scheme, value] = authHeader.split(" ");
  let authorized = false;
  if (scheme === "Basic" && value) {
    const [user, pass] = Buffer.from(value, "base64").toString().split(":");
    authorized = (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS);
  }

  res.setHeader("content-type", "text/html; charset=utf-8");

  if (!authorized) {
    return res.status(200).send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Login</title></head>
<body style="font-family:sans-serif;background:#0b1220;color:#e5e7eb;display:flex;align-items:center;justify-content:center;height:100vh;">
  <div style="background:#111827;padding:24px;border-radius:12px;max-width:300px;width:100%;">
    <h2 style="margin-top:0">Admin login</h2>
    <input id="u" placeholder="User" style="width:100%;margin-bottom:8px;padding:8px"/>
    <input id="p" type="password" placeholder="Password" style="width:100%;margin-bottom:12px;padding:8px"/>
    <button onclick="login()" style="padding:8px 12px;width:100%;">Login</button>
  </div>
<script>
async function login(){
  const u=document.getElementById('u').value;
  const p=document.getElementById('p').value;
  const basic = btoa(u+":"+p);
  const r = await fetch('/api/admin?auth='+Date.now(), {headers:{Authorization:'Basic '+basic}});
  if(r.ok){
    document.open();document.write(await r.text());document.close();
  }else{
    alert('Auth failed: '+r.status);
  }
}
</script>
</body></html>`);
  }

  try {
    await query("create table if not exists suggestions (id bigserial primary key, text text, created_at timestamptz default now())");
    const { rows } = await query("select * from suggestions order by created_at desc limit 100");
    let trs = rows.map(r =>
      `<tr><td>${r.id}</td><td>${r.text}</td><td>${new Date(r.created_at).toLocaleString()}</td></tr>`
    ).join("");
    return res.status(200).send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Admin</title></head>
<body style="font-family:sans-serif;background:#0b1220;color:#e5e7eb;">
  <h1>Suggestions</h1>
  <table border="1" cellpadding="6" style="border-collapse:collapse;">
    <tr><th>ID</th><th>Text</th><th>Created</th></tr>
    ${trs}
  </table>
</body></html>`);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal error");
  }
}
