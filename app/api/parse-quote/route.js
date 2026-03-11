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
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: pdfBase64 }
            },
            {
              type: "text",
              text: "Extract all line items from this factory quotation PDF. Return ONLY raw JSON with no explanation, no markdown, no code blocks. Format: {\"projectName\":\"string\",\"currency\":\"USD\",\"containers\":1,\"items\":[{\"category\":\"string\",\"name\":\"string\",\"usd\":0.00}]}. Rules: containers = number before 40HQ or 20HQ (default 1). Every line item must have a numeric usd value. No trailing commas. Valid JSON only."
            }
          ]
        }]
      })
    });
    const data = await response.json();
    if (!response.ok) return Response.json({ error: "Anthropic API error", detail: data }, { status: 500 });
    const text = data.content?.map(b => b.text || "").join("") || "";
    let clean = text.replace(/```json|```/g, "").trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error("No JSON object found in response");
    clean = clean.slice(start, end + 1);
    const parsed = JSON.parse(clean);
    return Response.json(parsed);
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
