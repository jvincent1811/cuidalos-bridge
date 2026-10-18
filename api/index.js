import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let rawCode = req.body.codigo || req.body.device_id;
    if (!rawCode) return res.status(400).json({ error: 'No se recibió código' });

    const device_id = String(rawCode).trim();
    
    // Permitir inyectar el timestamp original para reintentos
    const eventTimestamp = req.body.timestamp || new Date().toISOString();
    
    const payload = JSON.stringify({
      device_id: device_id,
      event: 'SOS',
      timestamp: eventTimestamp
    });

    const secret = process.env.ESCUELA_WEBHOOK_SECRET;
    const unixTimestamp = Date.now().toString(); // Firma NUEVA

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${unixTimestamp}.${payload}`, 'utf8')
      .digest('hex');

    const response = await fetch(process.env.BILT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
        'x-timestamp': unixTimestamp
      },
      body: payload
    });

    const text = await response.text();
    return res.status(200).json({ success: response.ok, bilt_response: text });
  } catch (error) {
    return res.status(500).json({ error: 'Error en el puente' });
  }
}
