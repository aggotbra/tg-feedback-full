import { requireBasicAuth } from "../_auth.js";
import { query } from "../_db.js";

export default async function handler(req, res) {
  const auth = requireBasicAuth(req, res);
  if (!auth) return;

  try {
    const { rows } = await query(
      "select id, text, coalesce(username,'') username, coalesce(product,'') product, coalesce(topic,'') topic, coalesce(jira,'') jira, coalesce(status,'new') status, created_at from suggestions order by created_at desc limit 200"
    );

    let body = "";
    for (const r of rows) {
      body += "<tr>" +
        "<td>"+r.id+"</td>" +
        "<td class='text'>"+escapeHtml(r.text)+"</td>" +
        "<td>"+escapeHtml(r.username)+"</td>" +
        "<td>"+escapeHtml(r.product)+"</td>" +
        "<td>"+escapeHtml(r.topic)+"</td>" +
        "<td>"+escapeHtml(r.jira)+"</td>" +
        "<td>"+escapeHtml(r.status)+"</td>" +
        "<td>"+new Date(r.created_at).toISOString().replace('T',' ').slice(0,19)+"</td>" +
      "</tr>";
    }

    const html =
      "<!doctype html><html><head><meta charset='utf-8'><title>Admin · Suggestions</title>" +
      "<style>body{font-family:system-ui;background:#0b1220;color:#e5e7eb;margin:0;padding:24px}h1{margin:0 0 16px}table{width:100%;border-collapse:collapse;background:#0f172a;border:1px solid #334155;border-radius:8px;overflow:hidden}th,td{border-bottom:1px solid #1f2937;padding:10px 12px;text-align:left;vertical-align:top;font-size:14px}th{background:#111827;color:#cbd5e1}tr:hover{background:#0b1220}td.text{max-width:560px;white-space:pre-wrap;word-wrap:break-word}.toolbar{display:flex;gap:8px;margin:12px 0}input,select{background:#0f172a;border:1px solid #334155;color:#e5e7eb;padding:8px 10px;border-radius:8px;outline:none}button{padding:8px 12px;border:1px solid #334155;background:#111827;color:#fff;border-radius:8px;cursor:pointer}button:hover{opacity:.9}</style>" +
      "</head><body>" +
      "<h1>Admin · Suggestions</h1>" +
      "<div class='toolbar'>" +
      "<input id='t' placeholder='Text' style='flex:1'/>" +
      "<input id='u' placeholder='@username (optional)'/>" +
      "<input id='p' placeholder='product'/>" +
      "<input id='tp' placeholder='topic'/>" +
      "<button onclick='create()'>Create</button>" +
      "</div>" +
      "<table><thead><tr><th>ID</th><th>Text</th><th>User</th><th>Product</th><th>Topic</th><th>Jira</th><th>Status</th><th>Created</th></tr></thead><tbody>" +
      body +
      "</tbody></table>" +
      "<script>async function create(){const t=document.getElementById('t').value.trim();const u=document.getElementById('u').value.trim();const p=document.getElementById('p').value.trim();const tp=document.getElementById('tp').value.trim();if(!t)return;const r=await fetch('/api/admin/create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:t,username:u,product:p,topic:tp})});if(r.ok)location.reload();else alert('Create failed: '+await r.text());}function escapeHtml(s){return s.replace(/[&<>\"']/g,m=>({\"&\":\"&amp;\",\"<\":\"&lt;\",\">\":\"&gt;\",\"\\\"\":\"&quot;\",\"'\":\"&#39;\"}[m]));}</script>" +
      "</body></html>";

    res.setHeader("content-type","text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (e) {
    console.error("[admin/index]", e);
    res.status(500).send("Internal Server Error");
  }
}

function escapeHtml(s){return String(s).replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));}
