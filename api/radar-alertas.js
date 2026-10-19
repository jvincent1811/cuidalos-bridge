export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const alerta = req.body;
    console.log("Alerta recibida del Radar:", alerta);

    return res.status(200).json({ 
      success: true, 
      message: "Alerta recibida y procesada" 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}
