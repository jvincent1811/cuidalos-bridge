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
    let body = req.body;
    console.log("BODY RECIBIDO DE EMQX:", body);

    // Si EMQX envía texto plano (ej. "0000000"), lo convertimos
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = { codigo: body }; 
      }
    }

    // Prueba de salud segura
    if (body && body.health_check === true) {
      const response = await fetch(biltUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-health-check': '1' },
        body: '{"health_check":true}'
      });
      const text = await response.text();
      return res.status(200).json({ success: response.ok, bilt_status: response.status, bilt_response: text });
    }

    const secret = process.env.ESCUELA_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Falta ESCUELA_WEBHOOK_SECRET' });
    }

    // Buscamos el código en cualquier formato posible
    let codigoBoton = null;
    if (body && typeof body === 'object') {
      codigoBoton = body.codigo || body.device_id || body.devId;
    }

    if (!codigoBoton) {
      return res.status(400).json({ error: 'No se recibió el código del botón', body_recibido: body });
    }

    const payload = JSON.stringify({
      device_id: String(codigoBoton).trim(),
      event: 'SOS',
      timestamp: new Date().toISOString()
    });

    const timestamp = Date.now().toString();
    const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`, 'utf8').digest('hex');

    const response = await fetch(biltUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
        'x-timestamp': timestamp
      },
      body: payload
    });

    const text = await response.text();

    return res.status(200).json({
      success: response.ok,
      bilt_status: response.status,
      bilt_response: text
    });

  } catch (error) {
    console.error('Error en el puente:', error);
    return res.status(500).json({ error: 'Error en el puente', detail: String(error) });
  }
}
