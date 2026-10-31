import {envFromObject} from '../../server/contact-shared.js';

export async function onRequestGet(context) {
  const getEnv = envFromObject(context.env);

  return Response.json(
    {
      turnstileSiteKey: getEnv('TURNSTILE_SITE_KEY', '') ?? '',
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

export async function onRequest(context) {
  if (context.request.method === 'GET') {
    return onRequestGet(context);
  }

  return Response.json(
    {error: 'Method not allowed'},
    {
      status: 405,
      headers: {
        Allow: 'GET',
      },
    },
  );
}
