# Hillwork

React/Vite site for Hillwork, LLC, with Cloudflare Pages Functions for the contact form.

The frontend renders in the browser. The direct-message form is handled by a Pages Function that sends mail through PurelyMail SMTP via `@workermailer/smtp`.

## Deployment

Cloudflare Pages builds the Vite frontend and serves Pages Functions from `functions/`.

- `/` for the website
- `/press` for the selected press archive (SPA rewrite)
- `/api/contact` for contact form submissions through PurelyMail SMTP
- `/api/config` for public frontend config, currently the Cloudflare Turnstile site key

Build settings in the Cloudflare Pages project:

- Build command: `npm run build`
- Output directory: `dist`
- Compatibility flag: `nodejs_compat` (also set in `wrangler.toml`)

Set these environment variables in the Cloudflare Pages project (Production and Preview) using the same names as `.env.example`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_ENCRYPTION`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_TO`
- `CONTACT_FROM`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

CLI deploy (after `npx wrangler login`):

```sh
npm run deploy
```

## Local Development

For quick React/Vite work:

1. Install dependencies:
   `npm install`
2. Start Vite:
   `npm run dev`

For contact form API testing during Vite development, run the local Node API (Nodemailer) in another terminal:

```sh
npm run dev:api
```

The Vite dev server proxies `/api/*` requests to that Node server.

To preview the Cloudflare Pages Functions locally (including Worker SMTP):

```sh
npm run pages:dev
```

## License

Code is licensed under the MIT License. Site content, branding, and images are not licensed for reuse without permission.

Copyright (c) 2026 Hillwork, LLC.

See `LICENSE-CODE.md` for the code license text.
