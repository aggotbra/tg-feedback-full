export function escapeHtml(s=""){return s
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");}

export async function sendFeedbackToChannel({title,text,role,product,topic,username,jiraKey,jiraUrl}) {
  const token = process.env.BOT_TOKEN;
  const chat  = process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_CHANNEL || "";
  if(!token || !chat) throw new Error("Missing telegram env (BOT_TOKEN / TELEGRAM_CHANNEL_ID)");

  const lines = [];
  if (title)    lines.push(`<b>${escapeHtml(title)}</b>`);
  if (product)  lines.push(`Продукт: <code>${escapeHtml(product)}</code>`);
  if (topic)    lines.push(`Категория: <code>${escapeHtml(topic)}</code>`);
  if (role)     lines.push(`Роль: <code>${escapeHtml(role)}</code>`);
  if (username) lines.push(`Автор: <code>${escapeHtml(username)}</code>`);
  if (jiraKey && jiraUrl) lines.push(`Jira: <a href="${jiraUrl}">${jiraKey}</a>`);
  lines.push("");
  lines.push(escapeHtml(text || "—"));

  const body = new URLSearchParams({
    chat_id: chat,
    text: lines.join("\n"),
    parse_mode: "HTML",
    disable_web_page_preview: "true"
  });

  const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:"POST",
    headers:{ "content-type":"application/x-www-form-urlencoded;charset=utf-8" },
    body
  });
  if(!resp.ok){
    const e = await resp.text().catch(()=> "");
    throw new Error(`telegram ${resp.status}: ${e}`);
  }
  return resp.json();
}
