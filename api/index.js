import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let rawCode = req.body.codigo || req.body.device_id || req.body.devId;
    if (!rawCode) return res.status(400).json({ error: 'No se recibió código' });

    const device_id = String(rawCode).trim();
    const payload = JSON.stringify({
      device_id: device_id,
      event: 'SOS',
      timestamp: new Date().toISOString()
    });

    const secret = process.env.ESCUELA_WEBHOOK_SECRET;
    const unixTimestamp = Date.now().toString();

    // CORRECCIÓN: Firmamos el timestamp, un punto y el payload
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${unixTimestamp}.${payload}`, 'utf8')
      .digest('hex');

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
    console.log("3. RESPUESTA DE BILT:", text);

    return res.status(200).json({ success: response.ok, bilt_status: response.status, bilt_response: text });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error en el puente', detail: String(error) });
  }
}
