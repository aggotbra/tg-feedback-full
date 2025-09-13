import fetch from "node-fetch";
export default async function handler(req, res) {
  try {
    const token = process.env.BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHANNEL_ID;
    if (!token || !chatId) return res.status(500).json({ ok:false, error:"Missing BOT_TOKEN or TELEGRAM_CHANNEL_ID" });
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: "tg-test ok", disable_web_page_preview: true })
    });
    const data = await r.json();
    if (!data.ok) return res.status(500).json({ ok:false, error: JSON.stringify(data) });
    res.status(200).json({ ok:true, message_id: data.result.message_id });
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e.message || e) });
  }
}
