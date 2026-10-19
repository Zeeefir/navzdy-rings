# Navždy

Ring selection catalog: 300 models, Russian/Czech interface, favorites, ring configuration and consent-based sharing.

Live website: https://navzdy.foggyfig16.chatgpt.site

## Build

Requires Node.js 18 or later; no npm dependencies.

    node build.mjs

Output: `dist/server/index.js`, a Cloudflare-compatible Worker exporting `fetch`.

The full HTML/CSS/client code is in `index.html`. `embedded-photos.json` includes the image assets served at `/images/`. The other CSS/JS files are editable source references; the HTML already includes its runtime code.

## Backend

For a new deployment bind an R2 bucket as `BUCKET`, then configure `ADMIN_PASSWORD` as a runtime secret. Do not commit the password. `/api/choice` stores selections only after consent; `/api/admin` requires the admin password.

The existing live deployment is managed in Sites. This GitHub repository is a source backup; commits here do not automatically redeploy that site.
