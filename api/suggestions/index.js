import { query } from "../_db.js";
import { createIssue, jiraBrowseUrl } from "../../lib/jira.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(404).send("Not Found");
  try {
    await query("create table if not exists suggestions (id bigserial primary key, text text not null, created_at timestamptz default now())");
    await query("alter table suggestions add column if not exists title text");
    await query("alter table suggestions add column if not exists username text");
    await query("alter table suggestions add column if not exists role text");
    await query("alter table suggestions add column if not exists product text");
    await query("alter table suggestions add column if not exists topic text");
    await query("alter table suggestions add column if not exists jira text");
    await query("alter table suggestions add column if not exists status text default 'new'");
    await query("alter table suggestions add column if not exists user_id bigint");
    await query("alter table suggestions alter column user_id drop not null");

    const body = await readJson(req);
    const { title=null, text=null, username=null, role=null, product=null, topic=null } = body || {};
    if (!title || typeof title !== "string" || !title.trim()) return res.status(400).send("Missing title");
    if (!text  || typeof text  !== "string"  || !text.trim())  return res.status(400).send("Missing text");

    const ins = await query(
      "insert into suggestions(title, text, username, role, product, topic, status) values ($1,$2,$3,$4,$5,$6,'queued') returning id, created_at",
      [title.trim(), text.trim(), username, role, product, topic]
    );
    const id = ins.rows[0].id;

    let jiraKey=null, jiraUrl=null, jiraError=null;
    try {
      const issue = await createIssue({ title, text, role, product, topic, username });
      jiraKey = issue.key;
      jiraUrl = jiraBrowseUrl(jiraKey);
      await query("update suggestions set jira=$1, status='sent' where id=$2", [jiraKey, id]);
    } catch (e) {
      jiraError = String(e.message || e);
      await query("update suggestions set status='db_ok_jira_fail' where id=$1", [id]);
    }

    res.status(200).json({ ok:true, id, created_at: ins.rows[0].created_at, jiraKey, jiraUrl, jiraError });
  } catch (e) {
    console.error("[/api/suggestions] error", e);
    res.status(500).send("Internal Server Error");
  }
}

async function readJson(req){
  const chunks=[]; for await (const ch of req) chunks.push(ch);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
