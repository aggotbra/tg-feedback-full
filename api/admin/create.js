import { requireBasicAuth } from "../_auth.js";
import { query } from "../_db.js";

export default async function handler(req, res) {
  const auth = requireBasicAuth(req, res);
  if (!auth) return;

  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    await query(
      "create table if not exists suggestions (" +
      "id bigserial primary key," +
      "text text not null," +
      "username text," +
      "product text," +
      "topic text," +
      "jira text," +
      "status text default 'new'," +
      "created_at timestamptz default now()" +
      ")"
    );

    const raw = await readJson(req);
    const { text, username=null, product=null, topic=null } = raw || {};
    if (!text || typeof text !== "string") return res.status(400).send("Missing text");

    const ins = await query(
      "insert into suggestions(text,username,product,topic) values ($1,$2,$3,$4) returning id, created_at",
      [text, username, product, topic]
    );

    res.status(200).json({ ok:true, id: ins.rows[0].id, created_at: ins.rows[0].created_at });
  } catch (e) {
    console.error("[admin/create]", e);
    res.status(500).send("Internal Server Error");
  }
}

async function readJson(req){
  const chunks=[]; for await (const ch of req) chunks.push(ch);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
