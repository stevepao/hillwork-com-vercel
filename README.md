# Hillwork

React/Vite site for Hillwork, LLC.

> **Hosting note:** Despite the GitHub repo name (`hillwork-com-vercel`), this project **deploys to Cloudflare Pages**, not Vercel. Vercel has been disconnected. Production is `https://hillwork.us` on Cloudflare.

The frontend renders in the browser. The direct-message form is handled by a Cloudflare Pages Function that sends mail through PurelyMail SMTP via `@workermailer/smtp` (Nodemailer is only for local Node API testing).

## Architecture

| Path | What serves it |
| --- | --- |
| `/` | Static Vite build (`dist/`) |
| `/press` | Same SPA shell, routed by `functions/_middleware.js` (keeps URL at `/press`; do **not** rewrite to `/index.html` or Cloudflare may 308 → `/`) |
| `/press-media/*` | Static press logos (kept off `/press/` so the page route does not collide with an asset folder) |
| `/api/config` | Pages Function — public Turnstile site key |
| `/api/contact` | Pages Function — Turnstile verify + PurelyMail SMTP via `@workermailer/smtp` |

## Deployment (Cloudflare Pages)

- **Git production branch:** `main`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Compatibility flag:** `nodejs_compat` (also in `wrangler.toml`)

Set these environment variables in the Cloudflare Pages project (Production and Preview), same names as `.env.example`:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_ENCRYPTION`, `SMTP_USER`, `SMTP_PASS`
- `CONTACT_TO`, `CONTACT_FROM`
- `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`

After changing env vars, **redeploy** so Functions pick them up.

### Turnstile hostnames

In the Turnstile widget allowlist, include:

- `hillwork.us` (and `www.hillwork.us` if needed)
- `hillwork-com-vercel.pages.dev` (or `*.pages.dev`) for preview testing

### Custom domain / www

`hillwork.us` is the canonical host. `www.hillwork.us` should **301** to `https://hillwork.us` via a Cloudflare Redirect Rule (not by serving a second copy of the site).

CLI deploy (after `npx wrangler login`):

```sh
npm run deploy
```

## Local Development

1. `npm install`
2. `npm run dev` — Vite on port 3000

Contact form API during Vite dev (Nodemailer, not Worker SMTP):

```sh
npm run dev:api
```

Vite proxies `/api/*` to that Node server (`PORT=3001`).

Preview Pages Functions locally (including Worker SMTP):

```sh
npm run pages:dev
```

## Lessons learned (migration from Vercel)

1. **APIs need a Worker-compatible mail path** — Nodemailer/SMTP sockets do not run on Pages Functions; use `@workermailer/smtp` (or an HTTP mail API) in production.
2. **Don’t put static assets at the same path as an SPA route** — `/press` page vs `/press/` images broke routing; assets live under `/press-media/`.
3. **Avoid `_redirects` to `/index.html` for SPA routes on Pages** — that can 308 to `/`, and browsers cache 308s permanently. Prefer a Function/`_middleware` that returns **200** with `Cache-Control: no-store`. Test redirect fixes in a private window.
4. **Cut over with a branch** — keep `main` deployable on the old host until Pages preview works, then switch DNS, disconnect the old host’s Git integration, merge, set Pages production branch to `main`.

## License

Code is licensed under the MIT License. Site content, branding, and images are not licensed for reuse without permission.

Copyright (c) 2026 Hillwork, LLC.

See `LICENSE-CODE.md` for the code license text.
