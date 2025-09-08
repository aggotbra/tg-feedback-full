import requireAdmin from "../_auth.js";
import { query } from "../../lib/db.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  const { rows } = await query(
    `SELECT id, text, username, product, topic, jira_key, jira_status, created_at
     FROM suggestions
     ORDER BY id DESC
     LIMIT 100`
  );

  const escape = (s) => (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;");

  const html = `<!doctype html>
  <html lang="ru"><head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>Admin · Suggestions</title>
    <style>
      body{font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:24px;}
      table{border-collapse:collapse;width:100%;}
      th,td{border:1px solid #e5e5e5;padding:8px;vertical-align:top;}
      th{background:#fafafa;text-align:left;}
      pre{white-space:pre-wrap;margin:0;}
      .muted{color:#777;}
      .nowrap{white-space:nowrap;}
      .key a{color:#0b5fff;text-decoration:none;}
      .key a:hover{text-decoration:underline;}
    </style>
  </head><body>
    <h1>Telegram Suggestions</h1>
    <p class="muted">Всего: ${rows.length} (последние 100)</p>
    <table>
      <thead><tr>
        <th>ID</th><th>Время</th><th>Пользователь</th><th>Текст</th>
        <th>Product / Topic</th><th>Jira</th><th>Status</th>
      </tr></thead>
      <tbody>
      ${rows.map(r => {
        const jiraUrl = r.jira_key
          ? (process.env.JIRA_BASE_URL || "").replace(/\/+$/, "") + "/browse/" + encodeURIComponent(r.jira_key)
          : "";
        return `<tr>
          <td class="nowrap">\${r.id}</td>
          <td class="nowrap">\${new Date(r.created_at).toLocaleString("ru-RU")}</td>
          <td>@\${escape(r.username) || "—"}</td>
          <td><pre>\${escape(r.text)}</pre></td>
          <td>\${escape(r.product) || "—"} / \${escape(r.topic) || "—"}</td>
          <td class="key">\${r.jira_key ? `<a href="\${jiraUrl}" target="_blank" rel="noreferrer">\${r.jira_key}</a>` : "—"}</td>
          <td>\${escape(r.jira_status) || "—"}</td>
        </tr>`;
      }).join("")}
      </tbody>
    </table>
  </body></html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
