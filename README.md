# BioAnnova

The official BioAnnova brand website — a clean-ingredient toothpaste line by Herbapharmedica Ltd, London.

Built with [Astro](https://astro.build) on [Cloudflare Workers](https://workers.cloudflare.com).

## Stack

- **Astro 5** with content collections for products
- **Cloudflare Workers** adapter (`@astrojs/cloudflare`) with compile-time image optimization
- **Vanilla CSS** with design tokens — no framework dependency
- **Zod** validation (via `astro/zod`) for API endpoints
- **TypeScript** in strict mode

## Routes

| Route | Type | Purpose |
|---|---|---|
| `/` | static | Homepage — hero, concerns, range, trust, heritage, bundle, signup |
| `/products` | static | Filterable collection grid |
| `/products/[slug]` | static (4 prerendered) | PDP — gallery, ingredients, how-to-use, cross-sell |
| `/about` | static | Brand story + Herbapharmedica heritage |
| `/science` | static | Formulation principles & ingredient philosophy |
| `/contact` | static | Contact form (POSTs to `/api/contact`) |
| `/api/subscribe` | worker | Newsletter signup endpoint |
| `/api/contact` | worker | Contact form endpoint |

## Security

API endpoints implement:
- Rate limiting (5/min/IP, returns 429 + `Retry-After`) — in-memory; swap to Cloudflare Rate Limiting binding before prod (see `src/lib/security.ts`)
- Zod input validation with strict mode — unknown fields rejected
- Honeypot field on every form
- CORS allowlist (`bioannova.com`, `www.bioannova.com`)
- Generic error messages — no stack traces leaked

Site-wide security headers (HSTS, CSP, X-Frame-Options, etc.) are applied by `src/middleware.ts`.

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # build to dist/
npm run preview    # build + wrangler dev (runs Worker locally)
```

Copy `.dev.vars.example` → `.dev.vars` for local secrets. Production secrets are set via `wrangler secret put <NAME>`.

## Deployment

```bash
npm run deploy
```

## TODOs before launch

Search the codebase for these markers:
- `{{ FILL: ... }}` — copy that needs writing
- `TODO(SUPABASE)` — newsletter & contact persistence wiring
- `TODO(SMTP)` — transactional email via cPanel SMTP
- `TODO(prod)` — production-grade rate limiter

## Brand

BioAnnova is a brand by [Herbapharmedica Ltd](https://herbapharmedica.co.uk).
78 York Street, London, United Kingdom · +44 750 880 5859
