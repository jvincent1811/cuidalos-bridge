export default async function handler(req, res) {
  // Esta URL es el backend de Bilt que nos dio
  const BILT_URL = "https://898d66a5-fd1e-4a85-94b8-f200c01feb08.cloud.bilt.me/functions/v1/escuela-cascada";
  
  // Usamos el token que Bilt nos indicó
  const TOKEN = process.env.BAILEYS_API_TOKEN;

  try {
    const response = await fetch(BILT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      // El "tick" le dice a Bilt que revise si algo ya venció
      body: JSON.stringify({ action: "tick" })
    });

    const data = await response.json();
    console.log("Tick enviado a Bilt:", data);
    return res.status(200).json({ ok: true, bilt: data });
  } catch (error) {
    console.error("Error en Cron Tick:", error);
    return res.status(500).json({ error: error.message });
  }
}
