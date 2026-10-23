// Ejecutar como servicio continuo separado en Railway, no dentro de la app.

const base = process.env.EXPO_PUBLIC_BILT_URL;
const token = process.env.BAILEYS_API_TOKEN;

if (!base || !token) {
  throw new Error(
    'Configura EXPO_PUBLIC_BILT_URL y BAILEYS_API_TOKEN en Railway.',
  );
}

const endpoint = `${base.replace(/\/$/, '')}/functions/v1/escuela-cascada`;

const stop = new AbortController();

process.once('SIGTERM', () => stop.abort());
process.once('SIGINT', () => stop.abort());

async function run() {
  while (!stop.signal.aborted) {
    let processed = 0;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ action: 'tick' }),
        signal: AbortSignal.any([
          stop.signal,
          AbortSignal.timeout(120000),
        ]),
      });

      const payload: unknown = await response.json();

      if (
        !response.ok ||
        !payload ||
        typeof payload !== 'object' ||
        !('ok' in payload) ||
        payload.ok !== true
      ) {
        throw new Error(
          `No se completó el ciclo de Escuela (HTTP ${response.status}).`,
        );
      }

      processed =
        'processed' in payload && typeof payload.processed === 'number'
          ? payload.processed
          : 0;
    } catch (error) {
      if (!stop.signal.aborted) {
        console.error(
          error instanceof Error
            ? error.message
            : 'Falló el ciclo de Escuela.',
        );
      }
    }

    if (!stop.signal.aborted && !processed) {
      await new Promise<void>((resolve) => {
        const finish = () => {
          clearTimeout(timer);
          stop.signal.removeEventListener('abort', finish);
          resolve();
        };

        const timer = setTimeout(finish, 5000);
        stop.signal.addEventListener('abort', finish, { once: true });
      });
    }
  }
}

void run();
