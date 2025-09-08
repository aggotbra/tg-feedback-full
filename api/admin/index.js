import { requireAuth } from "../_auth.js";
import { query } from "../../lib/db.js";

export default async function handler(req, res) {
  console.log("[admin/index] start", { ts: new Date().toISOString() });

  // Basic auth
  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const rs = await query(
      "SELECT id, text, username, product, topic, jira_key, jira_status, created_at FROM suggestions ORDER BY id DESC LIMIT 100"
    );

    const base = process.env.JIRA_BASE_URL || "";
    const rows = (rs.rows || []).map(r => {
      const keyCell = r.jira_key
        ? '<a href="' + (base ? (base + '/browse/' + encodeURIComponent(r.jira_key)) : '#') + '" target="_blank" rel="noreferrer">' + r.jira_key + '</a>'
        : "—";
      return (
        "<tr>" +
          "<td>" + r.id + "</td>" +
          "<td class=\"text\">" + (r.text || "") + "</td>" +
          "<td>" + (r.username || "") + "</td>" +
          "<td>" + (r.product || "") + "</td>" +
          "<td>" + (r.topic || "") + "</td>" +
          "<td class=\"key\">" + keyCell + "</td>" +
          "<td>" + (r.jira_status || "") + "</td>" +
          "<td>" + new Date(r.created_at).toISOString().replace('T',' ').slice(0,19) + "</td>" +
        "</tr>"
      );
    }).join("");

    const html =
      '<!doctype html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>Admin · Suggestions</title>' +
      '<style>' +
      'body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;background:#0b1220;color:#e5e7eb;margin:0;padding:24px}' +
      'h1{margin:0 0 16px;font-size:20px}' +
      '.toolbar{display:flex;gap:8px;margin-bottom:16px}' +
      'input{background:#0f172a;border:1px solid #334155;color:#e5e7eb;padding:8px 10px;border-radius:8px;outline:none}' +
      'table{width:100%;border-collapse:collapse;background:#0f172a;border:1px solid #334155;border-radius:8px;overflow:hidden}' +
      'th,td{border-bottom:1px solid #1f2937;padding:10px 12px;text-align:left;vertical-align:top;font-size:14px}' +
      'th{background:#111827;color:#cbd5e1}' +
      'tr:hover{background:#0b1220}' +
      'td.text{max-width:520px;white-space:pre-wrap;word-wrap:break-word}' +
      'button{padding:8px 12px;border:1px solid #334155;background:#111827;color:#fff;border-radius:8px;cursor:pointer}' +
      'button:hover{opacity:.9}' +
      '.key a{color:#2563eb;text-decoration:none}' +
      '.key a:hover{text-decoration:underline}' +
      '</style></head><body>' +
      '<h1>Admin · Suggestions</h1>' +
      '<div class="toolbar">' +
      '<input id="t" type="text" placeholder="Text"/>' +
      '<input id="u" type="text" placeholder="@username (optional)"/>' +
      '<button onclick="create()">Create</button>' +
      '</div>' +
      '<table><thead><tr>' +
      '<th>ID</th><th>Text</th><th>User</th><th>Product</th><th>Topic</th><th>Jira</th><th>Status</th><th>Created</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>' +
      '<script>' +
      'async function create(){' +
      ' const t=document.getElementById("t").value.trim();' +
      ' const u=document.getElementById("u").value.trim();' +
      ' if(!t) return;' +
      " const res=await fetch('/api/admin/create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:t,username:u})});" +
      ' if(res.ok) location.reload(); else alert("Create failed: "+(await res.text()));' +
      '}' +
      '</script>' +
      '</body></html>';

    res.setHeader("content-type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (err) {
    console.error("[admin/index] error", err);
    res.status(500).send("Internal Server Error");
  }
}
