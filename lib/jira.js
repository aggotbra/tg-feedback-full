// lib/jira.js
const BASE = process.env.JIRA_BASE_URL;
const EMAIL = process.env.JIRA_EMAIL;
const API_TOKEN = process.env.JIRA_API_TOKEN;
const PROJECT_KEY = process.env.JIRA_PROJECT_KEY; // OPS
const ISSUE_TYPE = process.env.JIRA_ISSUE_TYPE || "Task";

if (!BASE || !EMAIL || !API_TOKEN || !PROJECT_KEY) {
  throw new Error("Jira env vars are not set (JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY).");
}

function authHeader() {
  const token = Buffer.from(`${EMAIL}:${API_TOKEN}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

function buildDescription({ text, username, product, topic }) {
  const lines = [
    `*Source*: Telegram bot`,
    username ? `*From*: @${username}` : `*From*: (unknown)`,
    product ? `*Product*: ${product}` : null,
    topic ? `*Topic*: ${topic}` : null,
    "",
    "----",
    "",
    `${text}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export async function createIssue({ text, username, product, topic }) {
  const body = {
    fields: {
      project: { key: PROJECT_KEY },
      summary: (text || "").slice(0, 200) || "New suggestion",
      issuetype: { name: ISSUE_TYPE },
      labels: ["tg-feedback", product?.replace(/\s+/g, "_") || "product"],
      description: buildDescription({ text, username, product, topic }),
    },
  };

  const res = await fetch(`${BASE}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Jira createIssue failed: ${res.status} ${res.statusText} ${err}`);
  }
  return res.json(); // { id, key, self }
}

export function jiraBrowseUrl(key) {
  return `${BASE}/browse/${encodeURIComponent(key)}`;
}
