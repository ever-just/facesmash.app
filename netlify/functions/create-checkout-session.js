// Netlify serverless function — creates a Stripe Checkout Session for the Pro plan
// Uses Stripe REST API directly (no npm dependency needed)

export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const SITE_URL = process.env.URL || "https://facesmash.app";

  // Pro plan price ID ($29/mo)
  const PRO_PRICE_ID = "price_1T8Z5JKL0p3ve1jH64BJPsd1";

  if (!STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not set");
    return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error" }) };
  }

  try {
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("payment_method_types[]", "card");
    params.append("line_items[0][price]", PRO_PRICE_ID);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `${SITE_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${SITE_URL}/pricing/cancel`);
    params.append("allow_promotion_codes", "true");
    params.append("subscription_data[trial_period_days]", "14");

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error("Stripe error:", session);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: session.error?.message || "Failed to create checkout session" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": SITE_URL,
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Checkout session error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}
