import crypto from 'crypto';

function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const biltUrl = process.env.BILT_WEBHOOK_URL;
  if (!biltUrl) {
    return res.status(500).json({ error: 'Falta BILT_WEBHOOK_URL' });
  }

  const bodyObj = parseBody(req);
  if (!bodyObj) {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  try {
    // Prueba de salud segura: no crea SOS ni envía avisos
    if (bodyObj.health_check === true) {
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

      return res.status(200).json({
        success: response.ok,
        bilt_status: response.status,
        bilt_response: text
      });
    }

    const secret = process.env.ESCUELA_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Falta ESCUELA_WEBHOOK_SECRET' });
    }

    const codigoBoton = bodyObj.codigo || bodyObj.device_id || bodyObj.devId;
    if (!codigoBoton) {
      return res.status(400).json({ error: 'No se recibió el código del botón' });
    }

    // Cuerpo exacto que se firma y se envía. No se vuelve a serializar.
    const body = JSON.stringify({
      device_id: String(codigoBoton),
      event: 'SOS',
      timestamp: new Date().toISOString()
    });

    // Timestamp Unix en milisegundos, 13 dígitos
    const timestamp = Date.now().toString();

    // HMAC-SHA256 hexadecimal sobre: <timestamp>.<body exacto>
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

    // Devolvemos 200 al cliente para que no reintente en bucle,
    // pero informamos el estado real de Bilt en el JSON.
    return res.status(200).json({
      success: response.ok,
      bilt_status: response.status,
      bilt_response: text
    });
  } catch (error) {
    console.error('Error en el puente:', error);
    return res.status(500).json({
      error: 'Error en el puente',
      detail: String(error)
    });
  }
}
