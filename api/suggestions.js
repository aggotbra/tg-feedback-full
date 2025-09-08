import { query } from "./_db.js";
import { createIssue, jiraBrowseUrl } from "../lib/jira.js";

async function readJson(req) {
  const chunks=[]; for await (const ch of req) chunks.push(ch);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    await query(`create table if not exists suggestions(
      id bigserial primary key,
      text text not null,
      username text,
      role text,
      product text,
      topic text,
      jira text,
      status text default 'new',
      created_at timestamptz default now()
    )`);

    const body = await readJson(req);
    const { text, username=null, role=null, product=null, topic=null } = body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).send("Missing text");
    }

    const ins = await query(
      "insert into suggestions(text, username, role, product, topic, status) values ($1,$2,$3,$4,$5,'queued') returning id, created_at",
      [text.trim(), username, role, product, topic]
    );
    const id = ins.rows[0].id;

    // Try to create Jira
    let jiraKey = null, jiraUrl = null, jiraErr = null;
    try {
      const issue = await createIssue({ text, role, product, topic, username });
      jiraKey = issue.key;
      jiraUrl = jiraBrowseUrl(jiraKey);
      await query("update suggestions set jira=$1, status='sent' where id=$2", [jiraKey, id]);
    } catch (e) {
      jiraErr = String(e.message || e);
      await query("update suggestions set status='db_ok_jira_fail' where id=$1", [id]);
    }

    res.status(200).json({
      ok: true,
      id,
      created_at: ins.rows[0].created_at,
      jiraKey,
      jiraUrl,
      jiraError: jiraErr
    });
  } catch (e) {
    console.error("[/api/suggestions] error", e);
    res.status(500).send("Internal Server Error");
  }
}
