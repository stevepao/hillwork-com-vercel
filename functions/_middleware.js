/**
 * Serve the SPA shell for /press without ever returning a 308 to /.
 * Earlier _redirects rewrites caused browsers to permanently cache that redirect.
 */
async function serveSpaShell(context) {
  const indexUrl = new URL('/index.html', context.request.url);
  let response = await context.env.ASSETS.fetch(indexUrl);

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('Location');
    if (location) {
      response = await context.env.ASSETS.fetch(new URL(location, context.request.url));
    }
  }

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store');
  headers.delete('Location');

  return new Response(response.body, {
    status: 200,
    headers,
  });
}

export async function onRequest(context) {
  const pathname = new URL(context.request.url).pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/press' && context.request.method === 'GET') {
    return serveSpaShell(context);
  }

  return context.next();
}
