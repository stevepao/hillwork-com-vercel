import express from 'express';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getPublicConfig} from './config.js';
import {handleContactRequest} from './contact.js';

const app = express();
const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(serverDir, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const hasBuiltFrontend = existsSync(indexPath);

app.disable('x-powered-by');
app.use(express.json({limit: '32kb'}));
app.use(express.urlencoded({extended: false, limit: '32kb'}));

app.get('/api/config', (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.status(200).json(getPublicConfig());
});

app.all('/api/config', (_request, response) => {
  response.setHeader('Allow', 'GET');
  response.status(405).json({error: 'Method not allowed'});
});

app.all('/api/contact', async (request, response) => {
  const result = await handleContactRequest({
    method: request.method,
    body: request.body,
    headers: request.headers,
    ip: request.ip,
  });

  response.status(result.status).json(result.payload);
});

if (hasBuiltFrontend) {
  app.use(express.static(distDir));

  app.use((request, response, next) => {
    if (request.method !== 'GET' || request.path.startsWith('/api/')) {
      next();
      return;
    }

    response.sendFile(indexPath);
  });
}

app.use((_request, response) => {
  response.status(404).json({error: 'Not found'});
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Hillwork server listening on port ${port}`);
});
