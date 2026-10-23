const base = process.env.EXPO_PUBLIC_BILT_URL;
const token = process.env.BAILEYS_API_TOKEN;

if (!base || !token) {
  throw new Error(
    'Configura EXPO_PUBLIC_BILT_URL y usa el BAILEYS_API_TOKEN existente en el servidor.',
  );
}

const endpoint = `${base.replace(/\/$/, '')}/functions/v1/cuidalos-abuelitos`;

const stop = new AbortController();

process.once('SIGTERM', () => stop.abort());
process.once('SIGINT', () => stop.abort());

async function tick() {
  let cursor: string | null = null;

  do {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ action: 'tick', cursor }),
      signal: AbortSignal.any([
        stop.signal,
        AbortSignal.timeout(90000),
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
        `Falló el ciclo de alertas (HTTP ${response.status}).`,
      );
    }

    if (
      'failed' in payload &&
      typeof payload.failed === 'number' &&
      payload.failed > 0
    ) {
      console.error(
        'Hay alertas con avisos pendientes. Revisar las invocaciones de cuidalos-abuelitos.',
      );
    }

    cursor =
      'nextCursor' in payload &&
      typeof payload.nextCursor === 'string'
        ? payload.nextCursor
        : null;
  } while (cursor && !stop.signal.aborted);
}

async function run() {
  while (!stop.signal.aborted) {
    try {
      await tick();
    } catch (error) {
      if (!stop.signal.aborted) {
        console.error(
          error instanceof Error
            ? error.message
            : 'Falló el ciclo de alertas.',
        );
      }
    }

    if (!stop.signal.aborted) {
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
