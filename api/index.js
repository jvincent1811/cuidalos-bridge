import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 1. Recibimos el código de EMQX
    let rawCode = req.body.codigo || req.body.device_id || req.body.devId;
    if (!rawCode) return res.status(400).json({ error: 'No se recibió código' });

    // Limpiamos el código por si viene con espacios
    const device_id = String(rawCode).trim();

    // 2. Armamos el JSON exacto que Bilt exige
    const payload = JSON.stringify({
      device_id: device_id,
      event: 'SOS',
      timestamp: new Date().toISOString()
    });

    // 3. Firmamos con la clave secreta (HMAC-SHA256)
    const secret = process.env.ESCUELA_WEBHOOK_SECRET;
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const unixTimestamp = Date.now().toString();

    // 4. Lo enviamos a Bilt
    const biltUrl = process.env.BILT_WEBHOOK_URL;
    const response = await fetch(biltUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
        'x-timestamp': unixTimestamp
      },
      body: payload
    });

    const text = await response.text();
    return res.status(200).json({ success: response.ok, bilt_status: response.status, bilt_response: text });

  } catch (error) {
    return res.status(500).json({ error: 'Error en el puente', detail: String(error) });
  }
}
