const BASE = (process.env.JIRA_BASE_URL || "").replace(/\/+$/,"");
const ISSUE_TYPE = process.env.JIRA_ISSUE_TYPE || "Task";
const PROJECT_KEY = process.env.JIRA_PROJECT_KEY || "MBA";

function authHeader() {
  const email = process.env.JIRA_EMAIL || "";
  const token = process.env.JIRA_API_TOKEN || "";
  const b64 = Buffer.from(email + ":" + token).toString("base64");
  return { Authorization: "Basic " + b64 };
}

function adfParagraph(text) {
  return { type: "paragraph", content: [{ type: "text", text: text }] };
}

function toADF({ text, username, product, topic }) {
  const blocks = [];
  blocks.push(adfParagraph("Source: Telegram bot / Admin"));
  blocks.push(adfParagraph("From: " + (username ? "@" + username : "(unknown)")));
  if (product) blocks.push(adfParagraph("Product: " + product));
  if (topic) blocks.push(adfParagraph("Topic: " + topic));
  blocks.push({ type: "rule" });
  blocks.push(adfParagraph(text || ""));
  return { version: 1, type: "doc", content: blocks };
}

export async function createIssue({ text, username, product, topic }) {
  const body = {
    fields: {
      project: { key: PROJECT_KEY },
      summary: (text || "").slice(0, 200) || "New suggestion",
      issuetype: { name: ISSUE_TYPE },
      labels: ["tg-feedback", product ? product.replace(/\s+/g, "_") : "product"],
      description: toADF({ text, username, product, topic })
    }
  };

  const res = await fetch(BASE + "/rest/api/3/issue", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeader() },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error("Jira createIssue failed: " + res.status + " " + res.statusText + " " + err);
  }
  return res.json();
}

export function jiraBrowseUrl(key) {
  return BASE + "/browse/" + encodeURIComponent(key);
}
