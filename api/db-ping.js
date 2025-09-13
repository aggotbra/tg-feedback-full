import { query } from "./_db.js";
export default async function handler(req, res) {
  try {
    const { rows } = await query("select now() as now");
    res.status(200).json({ ok: true, now: rows[0].now });
  } catch (e) {
    console.error("[/api/db-ping] error", e);
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
}
