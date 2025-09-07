export default async function handler(req, res) {
  const { secret } = req.query;
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return res.status(404).send('NOT_FOUND');
  }
  // Пока просто подтверждаем приём запроса от Telegram:
  if (req.method === 'POST') return res.status(200).json({ ok: true });
  return res.status(200).send('OK');
}
