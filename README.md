# Hillwork

React/Vite site for Hillwork, LLC, with native Node API routes for contact form mail.

The frontend renders in the browser. The direct-message form is handled by a Node/Nodemailer endpoint that sends mail through SMTP.

## Deployment

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
