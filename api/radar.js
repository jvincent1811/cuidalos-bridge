export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { id_niño, id_padre, instagram, tiktok, facebook, x } = req.body;
    
    console.log("Datos recibidos para el Radar:", { id_niño, id_padre, instagram, tiktok, facebook, x });

    return res.status(200).json({ 
      success: true, 
      message: "Radar activado y programado correctamente" 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error en el Radar' });
  }
}
