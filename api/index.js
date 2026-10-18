export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Recibimos el código del botón desde EMQX
    const codigoBoton = req.body.codigo || req.body.device_id || req.body.devId;

    if (!codigoBoton) {
      return res.status(400).json({ error: 'No se recibió el código del botón' });
    }

    // 2. Lo enviamos al Webhook de Bilt
    const biltUrl = process.env.BILT_WEBHOOK_URL;
    
    const response = await fetch(biltUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_id: codigoBoton,
        event: 'SOS',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Bilt rechazó la petición');
    }

    return res.status(200).json({ success: true, message: 'Alerta enviada a Bilt' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error en el puente' });
  }
}
