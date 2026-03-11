export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return Response.json({ error: "ANTHROPIC_API_KEY not found in environment" }, { status: 500 });

    const { pdfBase64 } = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: pdfBase64 }
            },
            {
              type: "text",
              text: `Extract all line items from this factory quotation PDF. Return ONLY a JSON object like this, no preamble, no markdown:
{
  "projectName": "short description e.g. 40x60x14ft Warehouse",
  "currency": "USD",
  "containers": 1,
  "items": [
    { "category": "category name", "name": "item description", "usd": 1234.56 }
  ]
}
For "containers": look for any FOB line that mentions the number of 40HQ or 20HQ containers (e.g. "3*40HQ container" = 3). Default to 1 if not found.
Include every individual line item with its price in USD. If a price is in another currency, convert to USD using rates implied by the document or note it. Group items by their section/category from the document.`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return Response.json({ error: "Anthropic API error", detail: data }, { status: 500 });
    const text = data.content?.map(b => b.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
