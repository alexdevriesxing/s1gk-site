# S1GK Final Cloudflare Pages Build

This is the final polished static website package for S1GK: a Gen Alpha goalkeeper gear brand with a dark neon e-commerce design, micro animations, product structure, SEO/GAIO foundations and Cloudflare Pages deployment files.

## Deploy to GitHub + Cloudflare Pages

1. Create a new GitHub repository, for example `s1gk-site`.
2. Upload all files from this ZIP to the repository root.
3. In Cloudflare Pages, choose **Create a project** → **Connect to Git**.
4. Select the GitHub repository.
5. Build settings:
   - Framework preset: None / Static HTML
   - Build command: leave empty
   - Build output directory: `/`
6. Deploy.
7. Add your custom domain in Cloudflare Pages.
8. Replace every `https://www.s1gk.com` URL with your final domain.

## What is included

- Responsive homepage with animated hero, product carousel, glove finder, kit builder, keeper mode tabs, particle canvas and sticky CTA.
- Static category pages, product pages, guide pages and level pages.
- Product images and brand images in WebP.
- `data/products.json` for easy catalog expansion (now includes `currency` and `sizes`).
- **15-language internationalization** with an in-header language switcher (see below).
- **Data-driven cart** with quantities, size/variant support, per-locale currency formatting and a Stripe-ready checkout seam.
- `sitemap.xml`, `robots.txt`, `llms.txt`, `_headers`, `_redirects`, `manifest.webmanifest`.
- Product, Organization, Website, ItemList and FAQ structured data on the homepage.

## Internationalization (i18n)

Languages: English, Dutch, French, German, Spanish, Italian, Portuguese, Greek, Swedish, Danish, Norwegian, Finnish, Indonesian, Chinese (Traditional & Simplified).

How it works:

- `assets/js/i18n.js` is the engine. It loads on every page (before `app.js`), injects the language switcher into the header, sets `<html lang>`, persists the choice in `localStorage` (`s1gk-lang`), honours `?lang=xx`, and falls back to the browser language.
- Translations live in `data/i18n/<code>.json`. `en.json` is the source of truth and the fallback for any missing key.
- The shared header nav, mobile drawer, footer links/headings and "Add to kit" buttons are auto-translated site-wide by href/label maps — no per-page markup needed.
- Page-body strings opt in with `data-i18n="some.key"` (text), `data-i18n-ph` (placeholder), `data-i18n-aria` (aria-label) or `data-i18n-html` (rich text). The homepage is fully tagged; tag additional pages the same way.

**Add a language:** add an entry to `LOCALES` in `i18n.js` and ship `data/i18n/<code>.json`.
**Add a string:** add the key to every locale file and reference it with `data-i18n`.

## Editing products

Update `/data/products.json` first — each product supports `currency` (default `EUR`) and a `sizes` array that drives the size selector on product pages and the variant lines in the cart. Then create matching static pages under `/products/product-slug/` for SEO. The homepage search and the cart read the JSON file automatically.

## Checkout (Stripe-ready)

The cart is static-first and works offline as a demo (it confirms the order locally). To enable real payments:

1. The Cloudflare Pages Function `functions/api/checkout.js` creates a Stripe Checkout Session server-side (pricing is resolved from `products.json`, so amounts can't be tampered with client-side).
2. In **Cloudflare Pages → Settings → Environment variables**, add `STRIPE_SECRET_KEY` (and optionally `SITE_URL`). No secret is ever committed to the repo.
3. With the key present, "Proceed to Checkout" redirects to Stripe and returns to `/cart/?checkout=success|cancel`. Without it, the endpoint returns `503` and the client transparently falls back to the demo confirmation.

To swap in a different backend (Shopify Storefront, Snipcart, Medusa, etc.), replace `startStripeCheckout()` in `assets/js/app.js` and/or the `functions/api/checkout.js` handler — the cart model (`Cart`) is decoupled from the payment provider.

## Performance notes

The site uses vanilla HTML/CSS/JS, no runtime frameworks and no external libraries. Animations respect `prefers-reduced-motion`. Product images are local WebP assets. The particle canvas is lightweight and disabled for users with reduced motion enabled.

## SEO & GAIO (AI answer engines)

- **Per-language SEO:** the homepage ships translated `<title>`, meta description, `og:title/description`, `og:locale` and `<html lang>` (driven by the `meta.*` keys in each locale file + `<meta name="i18n-title">`/`i18n-desc`). `hreflang` alternates (`?lang=xx` + `x-default`) are declared in the homepage `<head>` and in `sitemap.xml`.
- **Structured data:** Organization, WebSite, BreadcrumbList, FAQ, Product (with `offers`), ItemList and CollectionPage JSON-LD across the relevant pages. All blocks are validated (the `/products/` page previously had a broken, unclosed JSON-LD block that swallowed the page body — now fixed).
- **GAIO:** `robots.txt` explicitly allows the major AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, etc.). `llms.txt` gives answer-engines a structured, language-neutral product + FAQ summary they can cite and translate.
- **Crawlability:** the JS-rendered `/products/` grid now has static category links + descriptive copy and a `<noscript>` product list so crawlers see real content.

> Ranking #1 also depends on off-page factors this code can't provide: real backlinks, brand authority, genuine reviews, fresh content and time. For full per-language *body* ranking (not just chrome), pre-render localized URLs (`/nl/`, `/fr/`, …) — the i18n keys make this scriptable as a future step.

## Important launch checklist

- Replace placeholder domain and social handles.
- Replace concept prices with real pricing.
- Add real material specs, palm type, sizes and manufacturer details.
- Add real shipping, return, privacy and terms content.
- Do not publish fake reviews. Add reviews only after real buyers exist.
- Connect checkout through Shopify, Snipcart, Stripe, Medusa, WooCommerce headless or your own backend.
