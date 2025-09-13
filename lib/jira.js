import fetch from "node-fetch";

const JIRA_BASE = process.env.JIRA_BASE || process.env.JIRA_BASE_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || "MBA"; // fallback на твой проект

function summaryFrom(text) {
  const line = (text || "").trim().split(/\r?\n/).find(Boolean) || "Feedback";
  return line.length > 120 ? line.slice(0,117) + "..." : line;
}

function adfDescription({ text, role, product, topic, username }) {
  const bullets = [
    role ? `**Role:** ${role}` : null,
    product ? `**Product:** ${product}` : null,
    topic ? `**Topic:** ${topic}` : null,
    username ? `**Author:** ${username}` : null,
  ].filter(Boolean);

  const body = (text || "").trim();

  const makeP = (t) => ({ type:"paragraph", content:[{ type:"text", text:t }]});

  return {
    type: "doc",
    version: 1,
    content: [
      ...(bullets.length ? [{ type:"bulletList", content: bullets.map(b => ({ type:"listItem", content:[ makeP(b) ] })) }] : []),
      { type:"rule" },
      ...(
        body
          ? body.split(/\r?\n/).map(line => line ? makeP(line) : { type:"paragraph" })
          : [ makeP("Без текста") ]
      ),
    ]
  };
}

export function jiraBrowseUrl(key){ return `${JIRA_BASE}/browse/${encodeURIComponent(key)}`; }

export async function createIssue({ text, role, product, topic, username }) {
  if (!JIRA_BASE || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
    throw new Error("Missing Jira env: JIRA_BASE,JIRA_EMAIL,JIRA_API_TOKEN,JIRA_PROJECT_KEY");
  }

  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");
  const payload = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary: summaryFrom(text),
      issuetype: { name: "Task" },
      description: adfDescription({ text, role, product, topic, username }),
      labels: ["feedback","miniapp","tiger"],
      // При желании: components, priority и т.д.
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
    const txt = await resp.text().catch(()=> "");
    throw new Error(`Jira ${resp.status} ${resp.statusText}: ${txt}`);
  }
  return resp.json();
}
