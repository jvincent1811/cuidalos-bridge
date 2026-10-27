function readName(value, fallback) {
  const text = Array.isArray(value) ? value[0] : value;
  return typeof text === 'string' && text.trim()
    ? text.trim()
    : fallback;
}

function escapeXml(text) {
  return text.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  })[character]);
}

export default function handler(req, res) {
  const persona = escapeXml(
    readName(req.query.persona || req.query.nino, 'la persona protegida')
  );

  const titular = escapeXml(
    readName(req.query.titular || req.query.papa, 'Titular')
  );

  res.setHeader('Content-Type', 'text/xml; charset=utf-8');

  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Mia" language="es-MX">
    Hola, ${titular}. Este es un aviso de Cuídalos para el Titular.
    Hay una alerta activa para ${persona}.
    Por favor, abre Cuídalos y presiona Acusar recibo
    para confirmar que estás enterado.
  </Say>
</Response>`);
}
