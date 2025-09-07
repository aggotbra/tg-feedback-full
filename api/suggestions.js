export default async function handler(req, res) {
  // CORS на всякий случай (не мешает)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error: 'Method Not Allowed' });

  // читаем тело вручную — на Vercel req.body может быть пустым
  let raw = '';
  for await (const chunk of req) raw += chunk;
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch (e) {
    return res.status(400).json({ ok:false, error:'Invalid JSON' });
  }

  const { product, topic, text } = data || {};
  if (!product || !topic || !text) {
    return res.status(400).json({ ok:false, error:'product, topic, text are required' });
  }

  // тут позже прикрутим БД; пока просто генерируем id
  const id = Date.now();

  return res.status(200).json({ ok:true, id });
}
