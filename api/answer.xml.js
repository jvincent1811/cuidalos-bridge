export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  
  // Leemos el nombre (ahora se llama nombre_nino sin la ñ)
  const nombreNino = req.query.nombre || 'su hijo';

  res.status(200).send(`
    <Response>
      <Say voice="Polly.Mia" language="es-MX">
        Hola, buen día. Le habla Cuidalos. 
        <break time="1s"/>
        Emergencia registrada. El niño ${nombreNino} ha activado el botón de emergencia. 
        <break time="1s"/>
        Por favor, revise la aplicación o comuníquese con la escuela.
      </Say>
    </Response>
  `);
}
