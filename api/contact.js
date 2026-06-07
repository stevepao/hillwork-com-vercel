import {handleContactRequest} from '../server/contact.js';

export default async function handler(request, response) {
  const result = await handleContactRequest({
    method: request.method,
    body: request.body,
    headers: request.headers,
    ip: request.socket?.remoteAddress ?? null,
  });

  response.status(result.status).json(result.payload);
}
