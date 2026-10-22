export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(`
    <Response>
      <Say language="es-MX" voice="Polly.Mia">
        Emergencia Cuidalos. El niño ha activado el botón de emergencia. Por favor revise la aplicación o comuníquese con la escuela.
      </Say>
    </Response>
  `);
}
