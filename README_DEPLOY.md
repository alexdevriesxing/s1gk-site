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
- `data/products.json` for easy catalog expansion.
- `sitemap.xml`, `robots.txt`, `llms.txt`, `_headers`, `_redirects`, `manifest.webmanifest`.
- Product, Organization, Website, ItemList and FAQ structured data on the homepage.

## Editing products

Update `/data/products.json` first. Then create matching static pages under `/products/product-slug/` for SEO. The homepage search reads the JSON file automatically.

## Performance notes

The site uses vanilla HTML/CSS/JS, no runtime frameworks and no external libraries. Animations respect `prefers-reduced-motion`. Product images are local WebP assets. The particle canvas is lightweight and disabled for users with reduced motion enabled.

## Important launch checklist

- Replace placeholder domain and social handles.
- Replace concept prices with real pricing.
- Add real material specs, palm type, sizes and manufacturer details.
- Add real shipping, return, privacy and terms content.
- Do not publish fake reviews. Add reviews only after real buyers exist.
- Connect checkout through Shopify, Snipcart, Stripe, Medusa, WooCommerce headless or your own backend.
