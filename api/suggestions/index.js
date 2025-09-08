import { query } from "../_db.js";

async function readJson(req){
  const chunks=[]; for await (const ch of req) chunks.push(ch);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(404).send("NOT_FOUND");

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
      "insert into suggestions(text,username,role,product,topic,status) values($1,$2,$3,$4,$5,'queued') returning id,created_at",
      [text.trim(), username, role, product, topic]
    );
    const id = ins.rows[0].id;

    let jiraKey=null, jiraUrl=null, jiraError=null;
    try {
      const { JIRA_BASE, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = process.env;
      if (JIRA_BASE && JIRA_EMAIL && JIRA_API_TOKEN && JIRA_PROJECT_KEY) {
        const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");
        const summary = (text.trim().slice(0, 100) || "Suggestion").replace(/\s+/g, " ");
        const payload = {
          fields: {
            project: { key: JIRA_PROJECT_KEY },
            summary,
            issuetype: { name: "Task" },
            description: {
              type: "doc",
              version: 1,
              content: [{
                type: "paragraph",
                content: [{
                  type: "text",
                  text: `Text: ${text}\nRole: ${role || "-"}\nProduct: ${product || "-"}\nTopic: ${topic || "-"}\nUser: ${username || "-"}`
                }]
              }]
            }
          }
        };

        const resp = await fetch(`${JIRA_BASE}/rest/api/3/issue`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Basic ${auth}`
          },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          const errTxt = await resp.text().catch(()=> "");
          throw new Error(`Jira ${resp.status} ${resp.statusText}: ${errTxt}`);
        }
        const issue = await resp.json();
        jiraKey = issue.key;
        jiraUrl = `${JIRA_BASE}/browse/${encodeURIComponent(jiraKey)}`;
        await query("update suggestions set jira=$1, status='sent' where id=$2", [jiraKey, id]);
      } else {
        await query("update suggestions set status='db_ok_no_jira' where id=$1", [id]);
      }
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
