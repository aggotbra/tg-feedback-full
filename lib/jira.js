// lib/jira.js

// --- Env & constants ---------------------------------------------------------
const BASE = process.env.JIRA_BASE_URL;              // e.g. https://aggotbra.atlassian.net
const ISSUE_TYPE = process.env.JIRA_ISSUE_TYPE || "Task";
const PROJECT_KEY = process.env.JIRA_PROJECT_KEY;    // e.g. MBA
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

if (!BASE || !PROJECT_KEY || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.warn("[Jira] Missing env vars: JIRA_BASE_URL/JIRA_PROJECT_KEY/JIRA_EMAIL/JIRA_API_TOKEN");
}

// --- Auth header (Basic) -----------------------------------------------------
function authHeader() {
  const token = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

// --- ADF helpers -------------------------------------------------------------
// https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
function adfParagraph(nodes) {
  return { type: "paragraph", content: nodes };
}

function adfText(text, marks = []) {
  const node = { type: "text", text: String(text ?? "") };
  if (marks.length) node.marks = marks;
  return node;
}

function strong(text) {
  return adfText(text, [{ type: "strong" }]);
}

function buildDescriptionADF({ text, username, product, topic }) {
  const content = [];

  // Metadata block
  content.push(adfParagraph([strong("Source: "), adfText("Telegram bot")]));
  content.push(adfParagraph([strong("From: "), adfText(username ? `@${username}` : "(unknown)")]));
  if (product) content.push(adfParagraph([strong("Product: "), adfText(product)]));
  if (topic) content.push(adfParagraph([strong("Topic: "), adfText(topic)]));

  // Divider
  content.push({ type: "rule" });

  // Body (split by lines -> paragraphs)
  const lines = String(text ?? "").split(/\r?\n/);
  if (lines.length === 0 || (lines.length === 1 && lines[0] === "")) {
    content.push(adfParagraph([adfText("(empty)")]));
  } else {
    for (const line of lines) {
      // allow empty lines as blank paragraphs
      content.push(line ? adfParagraph([adfText(line)]) : adfParagraph([]));
    }
  }

  return { type: "doc", version: 1, content };
}

// --- Public API --------------------------------------------------------------
export async function createIssue({ text, username, product, topic }) {
  const summary = (text || "").trim().slice(0, 200) || "New suggestion";

  const body = {
    fields: {
      project: { key: PROJECT_KEY },
      summary,
      issuetype: { name: ISSUE_TYPE },
      labels: ["tg-feedback", product?.replace(/\s+/g, "_") || "product"],
      // Key change: ADF document, not a plain string
      description: buildDescriptionADF({ text, username, product, topic }),
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

  // { id, key, self }
  return res.json();
}

export function jiraBrowseUrl(key) {
  return `${BASE}/browse/${encodeURIComponent(key)}`;
}