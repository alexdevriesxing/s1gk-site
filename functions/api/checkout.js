/* Cloudflare Pages Function: POST /api/checkout
 *
 * Creates a Stripe Checkout Session from the cart and returns { url } for the
 * client to redirect to. This is the single integration seam for real payments
 * — the rest of the site is a static Cloudflare Pages deployment.
 *
 * Configuration (Cloudflare Pages → Settings → Environment variables):
 *   STRIPE_SECRET_KEY   required to enable live checkout (e.g. sk_live_… / sk_test_…)
 *   SITE_URL            optional, absolute origin for success/cancel URLs
 *                       (falls back to the request origin)
 *
 * If STRIPE_SECRET_KEY is absent the endpoint returns HTTP 503 with
 * { configured:false }, which the client treats as "no backend" and falls back
 * to the built-in demo confirmation. No secrets are ever committed to the repo.
 *
 * Pricing is resolved SERVER-SIDE from data/products.json so the client cannot
 * tamper with amounts. Money is handled in integer minor units (cents).
 */

const CURRENCY = 'eur';

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'invalid_json' }, 400);
  }

  const items = Array.isArray(body && body.items) ? body.items : [];
  if (!items.length) return json({ error: 'empty_cart' }, 400);

  // No payment backend configured → tell the client to use its demo flow.
  if (!env || !env.STRIPE_SECRET_KEY) {
    return json({ configured: false, error: 'stripe_not_configured' }, 503);
  }

  const origin = (env && env.SITE_URL) || new URL(request.url).origin;

  // Load the catalog from the deployed static asset and price authoritatively.
  let catalog;
  try {
    const res = await fetch(new URL('/data/products.json', origin).toString());
    catalog = await res.json();
  } catch (e) {
    return json({ error: 'catalog_unavailable' }, 500);
  }
  const byId = Object.fromEntries(catalog.map((p) => [p.id, p]));

  const lineItems = [];
  for (const raw of items) {
    const product = byId[raw && raw.id];
    if (!product) continue;
    const qty = clampQty(raw.qty);
    const unitAmount = Math.round(parseFloat(product.price) * 100);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) continue;
    const name = raw.variant ? `${product.name} (${sanitize(raw.variant)})` : product.name;
    lineItems.push({
      'price_data[currency]': CURRENCY,
      'price_data[product_data][name]': name,
      'price_data[unit_amount]': String(unitAmount),
      quantity: String(qty)
    });
  }
  if (!lineItems.length) return json({ error: 'no_valid_items' }, 400);

  // Build the form-encoded payload Stripe's REST API expects.
  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('success_url', `${origin}/cart/?checkout=success`);
  form.set('cancel_url', `${origin}/cart/?checkout=cancel`);
  if (body.email) form.set('customer_email', String(body.email).slice(0, 200));
  form.set('shipping_address_collection[allowed_countries][0]', 'NL');
  lineItems.forEach((li, i) => {
    for (const [k, v] of Object.entries(li)) {
      form.set(`line_items[${i}][${k}]`, v);
    }
  });

  try {
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    });
    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      return json({ error: 'stripe_error', detail: session && session.error && session.error.message }, 502);
    }
    return json({ url: session.url });
  } catch (e) {
    return json({ error: 'stripe_unreachable' }, 502);
  }
}

function clampQty(q) {
  const n = parseInt(q, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 99);
}

function sanitize(s) {
  return String(s).replace(/[^\w\s./-]/g, '').slice(0, 40);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
