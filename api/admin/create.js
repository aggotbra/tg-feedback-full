import requireAdmin from "../_auth.js";
import { query } from "../../lib/db.js";
import { createIssue, jiraBrowseUrl } from "../../lib/jira.js";

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const body =
      typeof req.body === "object" && req.body
        ? req.body
        : JSON.parse(req.body || "{}");

    const { text, username = "admin", product = null, topic = null } = body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ ok: false, error: "text is required" });
    }

    const insert = await query(
      `INSERT INTO suggestions (text, username, product, topic, jira_status)
       VALUES ($1, $2, $3, $4, 'creating')
       RETURNING id`,
      [text.trim(), username, product, topic]
    );
    const id = insert.rows[0].id;

    let key, jira_id;
    try {
      const issue = await createIssue({ text, username, product, topic });
      key = issue.key;
      jira_id = issue.id;
      await query(
        `UPDATE suggestions SET jira_key = $1, jira_id = $2, jira_status = 'created' WHERE id = $3`,
        [key, jira_id, id]
      );
    } catch (e) {
      await query(`UPDATE suggestions SET jira_status = 'error' WHERE id = $1`, [id]);
      throw e;
    }

    return res.status(200).json({ ok: true, id, jiraKey: key, jiraUrl: jiraBrowseUrl(key) });
  } catch (err) {
    console.error("[admin/create] error", err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
