import { requireBasicAuth } from "../_auth.js";
import { query } from "../_db.js";

export default async function handler(req, res) {
  const auth = requireBasicAuth(req, res);
  if (!auth) return;
  try {
    const rs = await query(
      "SELECT id, text, username, product, topic, jira_key, jira_status, created_at FROM suggestions ORDER BY id DESC LIMIT 50"
    );
    const rows = rs.rows || [];

    function esc(s) {
      return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

    let body = "";
    for (const r of rows) {
      const jiraUrl = r.jira_key ? (process.env.JIRA_BASE_URL || "").replace(/\/+$/,"") + "/browse/" + encodeURIComponent(r.jira_key) : "";
      const jiraCell = r.jira_key ? ('<a href="' + jiraUrl + '" target="_blank" rel="noreferrer">' + esc(r.jira_key) + "</a>") : "—";
      body += "<tr>"
        + "<td>" + r.id + "</td>"
        + '<td class="text">' + esc(r.text) + "</td>"
        + "<td>" + esc(r.username) + "</td>"
        + "<td>" + esc(r.product) + "</td>"
        + "<td>" + esc(r.topic) + "</td>"
        + '<td class="key">' + jiraCell + "</td>"
        + "<td>" + esc(r.jira_status) + "</td>"
        + "<td>" + esc(r.created_at) + "</td>"
        + "</tr>";
    }

    const html =
      '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      "<title>Admin · Suggestions</title>" +
      '<style>' +
      'body{margin:32px;background:#0b1220;color:#e5e7eb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica Neue,Arial}' +
      'h1{margin:0 0 16px 0;font-size:20px}' +
      '.toolbar{display:flex;gap:8px;margin:0 0 16px 0}' +
      'input{background:#0f172a;border:1px solid #334155;color:#e5e7eb;padding:8px 10px;border-radius:8px;outline:none}' +
      'table{width:100%;border-collapse:collapse;background:#0f172a;border:1px solid #334155;border-radius:8px;overflow:hidden}' +
      'th,td{border-bottom:1px solid #1f2937;padding:10px 12px;text-align:left;vertical-align:top;font-size:14px}' +
      'th{background:#111827;color:#cbd5e1}' +
      'tr:hover{background:#0b1220}' +
      'td.text{max-width:520px;white-space:pre-wrap;word-wrap:break-word}' +
      'button{padding:8px 12px;border:1px solid #334155;background:#111827;color:#fff;border-radius:8px;cursor:pointer}' +
      'button:hover{opacity:.9}' +
      '.key a{color:#60a5fa;text-decoration:none}' +
      '.key a:hover{text-decoration:underline}' +
      "</style></head><body>" +
      "<h1>Admin · Suggestions</h1>" +
      '<div class="toolbar">' +
      '<input id="t" type="text" placeholder="Text">' +
      '<input id="u" type="text" placeholder="@username (optional)">' +
      '<button onclick="createItem()">Create</button>' +
      "</div>" +
      "<table><thead><tr>" +
      "<th>ID</th><th>Text</th><th>User</th><th>Product</th><th>Topic</th><th>Jira</th><th>Status</th><th>Created</th>" +
      "</tr></thead><tbody>" + body + "</tbody></table>" +
      "<script>" +
      "async function createItem(){" +
      " const t=document.getElementById('t').value.trim();" +
      " const u=document.getElementById('u').value.trim();" +
      " if(!t) return;" +
      " const r=await fetch('/api/admin/create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:t,username:u})});" +
      " if(r.ok) location.reload(); else alert('Create failed: '+(await r.text()));" +
      "}" +
      "</script>" +
      "</body></html>";

    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (e) {
    console.error("[admin] error", e);
    res.status(500).send("Internal Server Error");
  }
}
