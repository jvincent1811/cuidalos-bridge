export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { telefono_destino } = req.body;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  
  const host = req.headers.host;
  const answerUrl = `https://${host}/api/answer.xml`;

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const params = new URLSearchParams();
  params.append('To', telefono_destino);
  params.append('From', fromNumber);
  params.append('Url', answerUrl);

  try {
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error en Twilio');
    
    return res.status(200).json({ success: true, sid: data.sid, message: 'Llamada en curso' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
