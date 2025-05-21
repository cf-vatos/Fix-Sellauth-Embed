# SellAuth Embed Fix (Cloudflare Worker Method)

> 💡 A simple fix for the broken SellAuth embed using Cloudflare Workers.  
> ⚠️ Requires a SellAuth **Business Plan**.

---

## 🧩 Why This Exists

As of now, the default SellAuth embed (which uses https://api-internal.sellauth.com/v1/checkout) is broken, as it is currently suspected of being used for phishing.
This repository provides a workaround by proxying the SellAuth API via a Cloudflare Worker — restoring full functionality on your site.

---

## ✅ Requirements

- An active **SellAuth Business Plan**
- A **Cloudflare account**

---

## 🚀 Setup Instructions

### 1. Create a Cloudflare Worker (Step to step guide: cloudflareworker.md)
2. Replace the default code with the following:

```js
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
```

3. 🔐 Replace:
   - `YOUR-API-KEY` with your **SellAuth API key**
   - `123456789` with your **SellAuth shop ID**

4. Save and deploy the Worker.

---

## 🛠 Modify the Embed Script

1. Download or copy the original embed JavaScript from SellAuth.
2. Find the section in the script where it makes a POST request to:

   ```js
   https://api-internal.sellauth.com/v1/checkout
   ```

3. Replace that URL with your deployed **Cloudflare Worker URL**.

4. Save your modified embed script and use it on your website.

---

## 🧪 Test

Test the embed on your site and verify that:
- The cart loads correctly
- The checkout process redirects properly
- No CORS or API errors show in the console

---

## 📬 Questions?

Feel free to open an issue or submit a pull request if you'd like to contribute or improve this solution.

---

## 🛡 Disclaimer

This project is an unofficial workaround for the broken SellAuth embed.  
Use it at your own discretion. Always keep your API key secure and avoid exposing it in frontend code.
