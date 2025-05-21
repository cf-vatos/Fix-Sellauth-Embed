export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      });
    }

    const apiKey = "YOUR-API-KEY"; // 🔁 Replace this
    const shopId = 123456789;      // 🔁 Replace this
    const host = "api.sellauth.com";

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    }

    const { cart } = body;
    if (!Array.isArray(cart) || cart.length === 0) {
      return new Response(JSON.stringify({ error: "Missing or invalid cart array" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    }

    const url = `https://${host}/v1/shops/${shopId}/checkout`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cart })
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error: "API request failed", details: error }), {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ url: data.invoice_url }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  }
};
