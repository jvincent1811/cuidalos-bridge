import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const biltUrl = process.env.BILT_WEBHOOK_URL;
  if (!biltUrl) {
    return res.status(500).json({ error: 'Falta BILT_WEBHOOK_URL' });
  }

  try {
    // Prueba de salud segura: no crea SOS ni envía avisos
    if (req.body && req.body.health_check === true) {
      const healthBody = '{"health_check":true}';
      const response = await fetch(biltUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-health-check': '1'
        },
        body: healthBody
      });
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const secret = process.env.ESCUELA_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Falta ESCUELA_WEBHOOK_SECRET' });
    }

    const codigoBoton = req.body?.codigo || req.body?.device_id || req.body?.devId;
    if (!codigoBoton) {
      return res.status(400).json({ error: 'No se recibió el código del botón' });
    }

    const body = JSON.stringify({
      device_id: String(codigoBoton),
      event: 'SOS',
      timestamp: new Date().toISOString()
    });

    const timestamp = Date.now().toString();

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${body}`, 'utf8')
      .digest('hex');

    const response = await fetch(biltUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
        'x-timestamp': timestamp
      },
      body
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Bilt rechazó la petición',
        status: response.status,
        detail: text
      });
    }

    return res.status(200).json({ success: true, bilt: text });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error en el puente', detail: String(error) });
  }
}
