# Hillwork

React/Vite site for Hillwork, LLC, with native Node API routes for contact form mail.

The frontend renders in the browser. The direct-message form is handled by a Node/Nodemailer endpoint that sends mail through SMTP.

## Deployment

### Vercel

Vercel builds the Vite frontend and serves the Node API functions in `api/`.

- `/` for the website
- `/api/contact` for contact form submissions through Nodemailer/SMTP
- `/api/config` for public frontend config, currently the Cloudflare Turnstile site key

Set these environment variables in Vercel using the same names as `.env.example`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_ENCRYPTION`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_TO`
- `CONTACT_FROM`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

### Docker

The optional Docker image builds the Vite frontend, serves it from a Node/Express server, and exposes the same `/api/*` routes.

This repository can run as a Docker Compose service on a host that already has Nginx Proxy Manager attached to an external Docker network named `proxy-tier`.

### Docker Host Setup

1. Clone the repository on the Docker host.
2. Copy the example environment file:
   `cp .env.example .env`
3. Edit `.env` with your SMTP, destination email, Cloudflare Turnstile, and optional local port settings.
4. Ensure the proxy network exists:
   `docker network create proxy-tier`
5. Build and start the service:
   `docker compose up -d --build`

If `proxy-tier` already exists, Docker will report that and you can continue.

### Nginx Proxy Manager

Create a Proxy Host in Nginx Proxy Manager that forwards to:

- Forward Hostname / IP: `hillwork`
- Forward Port: `3000`
- Scheme: `http`

The `hillwork` name is provided as a Docker network alias on the external `proxy-tier` network.

### Local Host Port

`APP_PORT` maps a host port to the Node server inside the container:

```text
localhost:APP_PORT -> container:3000
```

This is useful for direct host-level testing. In production, public traffic should come through Nginx Proxy Manager.

## Local Development

For quick React/Vite work:

1. Install dependencies:
   `npm install`
2. Start Vite:
   `npm run dev`

For contact form API testing during Vite development, run the API server in another terminal:

```sh
npm run dev:api
```

The Vite dev server proxies `/api/*` requests to that Node server.

To preview the production-style Node server locally:

```sh
npm run preview
```

## License

Code is licensed under the MIT License. Site content, branding, and images are not licensed for reuse without permission.

Copyright (c) 2026 Hillwork, LLC.

See `LICENSE-CODE.md` for the code license text.
