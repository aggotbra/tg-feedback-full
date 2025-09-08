const BASE = process.env.JIRA_BASE;
const EMAIL = process.env.JIRA_EMAIL;
const TOKEN = process.env.JIRA_API_TOKEN;
const PROJECT = process.env.JIRA_PROJECT;
const ISSUE_TYPE = process.env.JIRA_ISSUE_TYPE || "Task";

function authHeader() {
  const b64 = Buffer.from(`${EMAIL}:${TOKEN}`).toString("base64");
  return { Authorization: `Basic ${b64}` };
}

function toADF({ text, role, product, topic, username }) {
  const para = (s) => ({
    type: "paragraph",
    content: [{ type: "text", text: s }]
  });
  const lines = [
    `Feedback`,
    role ? `Role: ${role}` : null,
    product ? `Product: ${product}` : null,
    topic ? `Topic: ${topic}` : null,
    username ? `Username: ${username}` : null,
  ].filter(Boolean);

  return {
    version: 1,
    type: "doc",
    content: [
      ...lines.map(para),
      { type: "rule" },
      para(text || "")
    ]
  };
}

export async function createIssue({ text, role, product, topic, username }) {
  if (!BASE || !EMAIL || !TOKEN || !PROJECT) {
    throw new Error("Jira env missing (JIRA_BASE/JIRA_EMAIL/JIRA_API_TOKEN/JIRA_PROJECT)");
  }
  const summaryBase = (text || "Feedback").replace(/\s+/g, " ").slice(0, 100);
  const body = {
    fields: {
      project: { key: PROJECT },
      issuetype: { name: ISSUE_TYPE },
      summary: `Feedback: ${summaryBase}`,
      description: toADF({ text, role, product, topic, username })
    }
  };

  const res = await fetch(`${BASE}/rest/api/3/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeader() },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Jira createIssue failed: ${res.status} ${res.statusText} ${err}`);
  }
  return res.json(); // { id, key, self }
}

export function jiraBrowseUrl(key) {
  if (!BASE) return "";
  return `${BASE}/browse/${encodeURIComponent(key)}`;
}
