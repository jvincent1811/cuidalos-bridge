export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;
    
    const response = await fetch("https://api.github.com/repos/jvincet1811/cuidalos-radar/dispatches", {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'radar_trigger',
        client_payload: data
      })
    });

    if (!response.ok) throw new Error('GitHub rechazó la petición');

    return res.status(200).json({ success: true, message: "Radar programado en GitHub" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al programar el Radar' });
  }
}
