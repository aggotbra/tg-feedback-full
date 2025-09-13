import { query } from "../_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(404).send("Not Found");
  try {
    await query("create table if not exists suggestions (id bigserial primary key, text text not null, created_at timestamptz default now())");
    await query("alter table suggestions add column if not exists username text");
    await query("alter table suggestions add column if not exists role text");
    await query("alter table suggestions add column if not exists product text");
    await query("alter table suggestions add column if not exists topic text");
    await query("alter table suggestions add column if not exists jira text");
    await query("alter table suggestions add column if not exists status text default 'new'");

    const body = await readJson(req);
    const { text, username=null, role=null, product=null, topic=null } = body || {};
    if (!text || typeof text !== "string" || !text.trim()) return res.status(400).send("Missing text");

    const ins = await query(
      "insert into suggestions(text, username, role, product, topic, status) values ($1,$2,$3,$4,$5,'saved') returning id, created_at",
      [text.trim(), username, role, product, topic]
    );

    res.status(200).json({ ok:true, id: ins.rows[0].id, created_at: ins.rows[0].created_at });
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
