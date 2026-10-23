export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  
  // Leemos el nombre que viene desde llamar.js, si no viene, usamos "tu hijo"
  const nombreNiño = req.query.nombre || 'tu hijo';

  res.status(200).send(`
    <Response>
      <Say voice="Polly.Lupe" language="es-MX">
        <prosody rate="slow">
          Hola, buen día. Le habla Cuidalos.
          <break time="500ms"/>
          Emergencia registrada. 
          El niño ${nombreNiño} ha activado el botón de emergencia. 
          <break time="500ms"/>
          Por favor revise la aplicación o comuníquese con la escuela.
        </prosody>
      </Say>
    </Response>
  `);
}
