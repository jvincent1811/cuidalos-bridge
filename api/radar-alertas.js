export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { id_niño, red_social, tipo_riesgo, fecha } = req.body;

    if (!id_niño) {
      return res.status(400).json({ error: 'Falta el id del niño' });
    }

    const biltUrl = process.env.RADAR_ALERTAS_WEBHOOK_URL;
    const secret = process.env.RADAR_WEBHOOK_SECRET;

    const response = await fetch(biltUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-radar-secret': secret
      },
      body: JSON.stringify({
        id_niño: id_niño,
        red_social: red_social || 'Desconocida',
        tipo_riesgo: tipo_riesgo || 'Lenguaje sospechoso',
        fecha: fecha || new Date().toISOString()
      })
    });

    const text = await response.text();
    console.log("Respuesta de Bilt (Radar):", text);

    return res.status(200).json({ success: true, bilt_response: text });
  } catch (error) {
    console.error("Error enviando a Bilt:", error);
    return res.status(500).json({ error: 'Error al enviar a Bilt' });
  }
}
