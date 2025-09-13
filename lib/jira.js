const { JIRA_BASE, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = process.env;

function requireEnv() {
  if (!JIRA_BASE || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
    throw new Error("Missing Jira env: JIRA_BASE,JIRA_EMAIL,JIRA_API_TOKEN,JIRA_PROJECT_KEY");
  }
}

function toADF({ text, role, product, topic, username }) {
  const lines = [
    text || "",
    "",
    role ? `Role: ${role}` : "",
    product ? `Product: ${product}` : "",
    topic ? `Topic: ${topic}` : "",
    username ? `User: ${username}` : ""
  ].filter(Boolean);
  return {
    version: 1,
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: lines.join("\n").split("\n").map(t => ({ type: "text", text: t || " " }))
      }
    ]
  };
}

export async function createIssue({ text, role, product, topic, username }) {
  requireEnv();
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");
  const summary = (text || "Suggestion").replace(/\s+/g," ").slice(0, 80);
  const payload = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      issuetype: { name: "Task" },
      summary,
      description: toADF({ text, role, product, topic, username })
    }
  };
  const resp = await fetch(`${JIRA_BASE}/rest/api/3/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Basic ${auth}` },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const errTxt = await resp.text().catch(()=> "");
    throw new Error(`Jira ${resp.status} ${resp.statusText}: ${errTxt}`);
  }
  return resp.json();
}

export function jiraBrowseUrl(key) {
  requireEnv();
  return `${JIRA_BASE}/browse/${encodeURIComponent(key)}`;
}
