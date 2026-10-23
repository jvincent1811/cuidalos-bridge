export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Twilio envía los datos en formato de formulario (urlencoded)
  const { CallSid, CallStatus, To } = req.body;

  console.log(`Llamada ${CallSid} a ${To} terminó con estado: ${CallStatus}`);

  // URL exacta proporcionada por Bilt
  const BILT_WEBHOOK_URL = "https://898d66a5-fd1e-4a85-94b8-f200c01feb08.cloud.bilt.me/functions/v1/call-status-webhook";
  const SECRET = process.env.CUIDALOS_CALL_STATUS_SECRET;

  try {
    // Enviamos el estado a Bilt con la clave de seguridad
    const response = await fetch(BILT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cuidalos-secret': SECRET
      },
      body: JSON.stringify({
        telefono: To,
        estado: CallStatus, // completed, busy, no-answer, failed
        sid: CallSid
      })
    });

    const text = await response.text();
    console.log("Respuesta de Bilt (Status Llamada):", text);

  } catch (error) {
    console.error("Error enviando a Bilt:", error);
  }

  // Twilio siempre requiere un 200 OK para no reintentar el webhook
  return res.status(200).send('OK');
}
