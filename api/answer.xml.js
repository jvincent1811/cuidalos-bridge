export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  
  // Leemos el nombre (sin la ñ para evitar errores de codificación)
  const nombreNino = req.query.nombre || 'su hijo';

  res.status(200).send(`
    <Response>
      <Say voice="Polly.Mia" language="es-MX">
        Hola, buen día. Le habla Cuídalos. 
        <break time="1s"/>
        Alerta registrada. El niño ${nombreNino} ha activado el botón de alerta. 
        <break time="1s"/>
        Por favor, revise la aplicación o comuníquese con la escuela.
      </Say>
    </Response>
  `);
}
