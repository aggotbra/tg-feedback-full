import { requireBasicAuth } from "../_auth.js";
import { query } from "../_db.js";
import { createIssue, jiraBrowseUrl } from "../../lib/jira.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method Not Allowed" });
  const auth = requireBasicAuth(req, res);
  if (!auth) return;
  try {
    const body = req.body || {};
    const text = (body.text || "").toString();
    const username = (body.username || "").toString() || null;
    const product = (body.product || "").toString() || null;
    const topic = (body.topic || "").toString() || null;

    if (!text.trim()) return res.status(400).json({ ok:false, error:"text is required" });

    const ins = await query(
      "INSERT INTO suggestions (text, username, product, topic, jira_status) VALUES ($1,$2,$3,$4,'creating') RETURNING id",
      [text.trim(), username, product, topic]
    );
    const id = ins.rows[0].id;

    let key = null, jira_id = null;
    try {
      const issue = await createIssue({ text, username, product, topic });
      key = issue.key;
      jira_id = issue.id;
      await query("UPDATE suggestions SET jira_key=$1, jira_id=$2, jira_status='created' WHERE id=$3", [key, jira_id, id]);
    } catch (err) {
      await query("UPDATE suggestions SET jira_status='error' WHERE id=$1", [id]);
      throw err;
    }

    res.status(200).json({ ok:true, id, jiraKey:key, jiraUrl: jiraBrowseUrl(key) });
  } catch (e) {
    console.error("[admin/create] error", e);
    res.status(500).json({ ok:false, error:String(e && e.message ? e.message : e) });
  }
}
