export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  
  // Leemos los nombres de la URL
  const nombreNino = req.query.nino || 'su hijo';
  const nombrePapa = req.query.papa || 'padre de familia';

  res.status(200).send(`
    <Response>
      <Say voice="Polly.Mia" language="es-MX">
        Hola ${nombrePapa}, buen día. Le habla Cuídalos. 
        <break time="1s"/>
        Alerta registrada. El niño ${nombreNino} ha activado el botón de alerta. 
        <break time="1s"/>
        Por favor, revise la aplicación o comuníquese con la escuela.
        <break time="1s"/>
        Gracias.
      </Say>
    </Response>
  `);
}
