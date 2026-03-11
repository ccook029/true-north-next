import { NextResponse } from "next/server";

function pad(n) { return String(n).padStart(2, "0"); }
function quoteNumber() {
  const d = new Date();
  return `TN-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${Math.floor(Math.random()*9000+1000)}`;
}
function formatCurrency(n, currency) {
  return new Intl.NumberFormat(currency === "CAD" ? "en-CA" : "en-US", {
    style: "currency", currency, minimumFractionDigits: 2
  }).format(isNaN(n) ? 0 : n);
}
function todayDate() {
  return new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}
function expiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { customerName, projectName, specs, currency, params, categoryTotals, totalShippingUSD, tariffUSD, taxAmount, taxLabel, sellingPrice } = data;

    const fmt = (n) => formatCurrency(n, currency);
    const fmtUSD = (n) => formatCurrency(n, "USD");
    const quoteNum = quoteNumber();

    const shippingDisplay = currency === "CAD" ? fmt(totalShippingUSD * params.exchRate) : fmtUSD(totalShippingUSD);
    const tariffDisplay = currency === "CAD" ? fmt(tariffUSD * params.exchRate) : fmtUSD(tariffUSD);

    const categorySum = categoryTotals.reduce((s, c) => s + c.selling, 0);
    const shippingTaxLine = sellingPrice - categorySum;

    // Build specs HTML
    const specRows = [
      specs.length && specs.width ? `<tr><td>Overall Dimensions</td><td>${specs.length} ft × ${specs.width} ft${specs.height ? ` × ${specs.height} ft (eave height)` : ""}</td></tr>` : "",
      specs.freespan ? `<tr><td>Clear Span / Freespan</td><td>${specs.freespan}</td></tr>` : "",
      specs.mezzanine ? `<tr><td>Mezzanine / Second Level</td><td>${specs.mezzanine}</td></tr>` : "",
      `<tr><td>Insulation</td><td>${specs.insulated ? "Fully Insulated" : "Not Insulated"}</td></tr>`,
      specs.notes ? `<tr><td>Additional Notes</td><td>${specs.notes}</td></tr>` : "",
    ].filter(Boolean).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a2a3a; background: #fff; padding: 48px; font-size: 12px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0d1f35; padding-bottom: 24px; margin-bottom: 28px; }
  .header img { height: 60px; }
  .company-info { text-align: right; font-size: 11px; color: #4a6080; line-height: 1.8; }
  .company-info strong { color: #0d1f35; font-size: 13px; display: block; }
  .quote-meta { display: flex; justify-content: space-between; margin-bottom: 24px; gap: 16px; }
  .meta-block { background: #f5f7fa; border-left: 4px solid #c8a96e; padding: 12px 16px; flex: 1; }
  .meta-block .label { font-size: 10px; color: #6a8aaa; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .meta-block .value { font-size: 13px; color: #0d1f35; font-weight: 600; }
  .section-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #c8a96e; margin-bottom: 10px; margin-top: 22px; border-bottom: 1px solid #eef1f5; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  th { background: #0d1f35; color: #fff; padding: 9px 12px; text-align: left; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
  th.right { text-align: right; }
  td { padding: 9px 12px; border-bottom: 1px solid #eef1f5; font-size: 12px; }
  td.right { text-align: right; }
  tr:nth-child(even) td { background: #f9fbfd; }
  .subtotal-row td { background: #eef1f5 !important; font-weight: 600; border-top: 2px solid #dde3ea; }
  .total-row td { background: #0d1f35 !important; color: #fff; font-weight: 700; font-size: 15px; padding: 14px 12px; }
  .total-row td.right { color: #c8a96e; font-size: 18px; }
  .disclaimers { margin-top: 24px; padding: 14px 16px; background: #fffbf0; border: 1px solid #e8d5a0; border-radius: 4px; }
  .disc-title { font-size: 10px; letter-spacing: 2px; color: #8a6a20; text-transform: uppercase; margin-bottom: 10px; }
  .disclaimer { font-size: 10px; color: #5a4a20; line-height: 1.7; margin-bottom: 8px; padding-left: 10px; border-left: 2px solid #c8a96e; }
  .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #eef1f5; text-align: center; font-size: 10px; color: #8a9bb0; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>

<div class="header">
  <div>
    <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/mePxnP9KVEs5oWkD/true-north-steelworks-final---transparent-logo-YNqB7l2OLJF8rz5o.png" />
    <div style="font-size:11px;color:#4a6080;margin-top:6px;">Custom Steel Buildings for Canadian Conditions</div>
  </div>
  <div class="company-info">
    <strong>True North Steelworks</strong>
    chris@truenorthsteelworks.com<br>
    truenorthsteelworks.com<br>
    Ontario, Canada
  </div>
</div>

<div class="quote-meta">
  <div class="meta-block">
    <div class="label">Prepared For</div>
    <div class="value">${customerName}</div>
    <div style="font-size:11px;color:#6a8aaa;margin-top:4px;">${projectName || "Steel Building"}</div>
  </div>
  <div class="meta-block" style="text-align:right;">
    <div class="label">Quote Reference</div>
    <div class="value">${quoteNum}</div>
    <div style="font-size:11px;color:#6a8aaa;margin-top:4px;">Issued: ${todayDate()}</div>
    <div style="font-size:11px;color:#c8a96e;margin-top:2px;">Valid Until: ${expiryDate()}</div>
  </div>
</div>

${specRows ? `
<div class="section-title">Building Specifications</div>
<table>
  <tr><th>Specification</th><th>Details</th></tr>
  ${specRows}
</table>` : ""}

<div class="section-title">Building Components</div>
<table>
  <tr><th>Category</th><th class="right">Price (${currency})</th></tr>
  ${categoryTotals.map(({ cat, selling }) => `
  <tr><td>${cat}</td><td class="right">${fmt(selling)}</td></tr>
  `).join("")}
  <tr class="subtotal-row"><td>Components Subtotal</td><td class="right">${fmt(categorySum)}</td></tr>
</table>

<div class="section-title">Shipping, Duties & Tax</div>
<table>
  <tr><th>Item</th><th class="right">Amount (${currency})</th></tr>
  <tr><td>Ocean Freight (${params.containers} × 40HQ Container${params.containers > 1 ? "s" : ""})</td><td class="right">${shippingDisplay}</td></tr>
  <tr><td>Import Tariff (${params.tariff}%)</td><td class="right">${tariffDisplay}</td></tr>
  <tr><td>${taxLabel}</td><td class="right">${fmt(taxAmount)}</td></tr>
  <tr class="subtotal-row"><td>Shipping, Duties & Tax Subtotal</td><td class="right">${fmt(shippingTaxLine)}</td></tr>
</table>

<table style="margin-top:8px;">
  <tr class="total-row">
    <td>TOTAL INVESTMENT (${currency})</td>
    <td class="right">${fmt(sellingPrice)}</td>
  </tr>
</table>

<div class="disclaimers">
  <div class="disc-title">Important Notices</div>
  <div class="disclaimer">Shipping costs are estimated based on current carrier rates as of ${todayDate()} and are subject to change at the time of order confirmation. Final shipping costs will be confirmed prior to invoicing.</div>
  <div class="disclaimer">Quoted tariff rates reflect current trade and import duty conditions. Any changes to applicable tariffs or import duties enacted prior to order confirmation may affect final pricing. True North Steelworks will notify the customer of any material changes before proceeding.</div>
  <div class="disclaimer">This quote is valid for 7 days from the date of issue. Pricing beyond this period is subject to review and may change without notice.</div>
</div>

<div class="footer">
  True North Steelworks &nbsp;·&nbsp; chris@truenorthsteelworks.com &nbsp;·&nbsp; truenorthsteelworks.com<br>
  Quote ${quoteNum} &nbsp;·&nbsp; Generated ${todayDate()}
</div>

</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html", "X-Quote-Number": quoteNum }
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
