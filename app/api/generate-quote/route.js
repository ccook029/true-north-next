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

function expiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

function todayDate() {
  return new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      customerName, projectName, currency, params, specs,
      categoryTotals, totalShippingUSD, tariffUSD,
      taxAmount, taxLabel, totalCost, sellingPrice,
    } = data;

    const fmt = (n) => formatCurrency(n, currency);
    const fmtUSD = (n) => formatCurrency(n, "USD");
    const quoteNum = quoteNumber();
    const shippingDisplay = currency === "CAD"
      ? fmt(totalShippingUSD * params.exchRate)
      : fmtUSD(totalShippingUSD);
    const tariffDisplay = currency === "CAD"
      ? fmt(tariffUSD * params.exchRate)
      : fmtUSD(tariffUSD);

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a2a3a; background: #fff; padding: 48px; font-size: 12px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0d1f35; padding-bottom: 24px; margin-bottom: 28px; }
  .logo-area img { height: 60px; }
  .company-info { text-align: right; font-size: 11px; color: #4a6080; line-height: 1.8; }
  .company-info strong { color: #0d1f35; font-size: 13px; }
  .quote-meta { display: flex; justify-content: space-between; margin-bottom: 28px; }
  .meta-block { background: #f5f7fa; border-left: 4px solid #c8a96e; padding: 12px 16px; width: 48%; }
  .meta-block .label { font-size: 10px; color: #6a8aaa; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .meta-block .value { font-size: 13px; color: #0d1f35; font-weight: 600; }
  .section-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #c8a96e; margin-bottom: 12px; margin-top: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th { background: #0d1f35; color: #fff; padding: 10px 12px; text-align: left; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
  th.right { text-align: right; }
  td { padding: 10px 12px; border-bottom: 1px solid #eef1f5; font-size: 12px; }
  td.right { text-align: right; }
  tr:nth-child(even) td { background: #f9fbfd; }
  .subtotal-row td { background: #eef1f5 !important; font-weight: 600; }
  .total-row td { background: #0d1f35 !important; color: #fff; font-weight: 700; font-size: 14px; }
  .total-row td.right { color: #c8a96e; }
  .selling-box { background: linear-gradient(135deg, #0d1f35, #1a3a6a); color: #fff; padding: 24px; border-radius: 6px; margin-top: 24px; display: flex; justify-content: space-between; align-items: center; }
  .selling-label { font-size: 11px; letter-spacing: 2px; color: #6a9fd4; text-transform: uppercase; margin-bottom: 6px; }
  .selling-price { font-size: 36px; font-weight: 700; color: #fff; letter-spacing: 1px; }
  .validity { font-size: 11px; color: #6a9fd4; margin-top: 4px; }
  .disclaimers { margin-top: 28px; padding: 16px; background: #fffbf0; border: 1px solid #e8d5a0; border-radius: 4px; }
  .disclaimers .disc-title { font-size: 10px; letter-spacing: 2px; color: #8a6a20; text-transform: uppercase; margin-bottom: 10px; }
  .disclaimer { font-size: 10px; color: #5a4a20; line-height: 1.6; margin-bottom: 6px; padding-left: 12px; border-left: 2px solid #c8a96e; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eef1f5; text-align: center; font-size: 10px; color: #8a9bb0; }
</style>
</head>
<body>

<div class="header">
  <div class="logo-area">
    <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/mePxnP9KVEs5oWkD/true-north-steelworks-final---transparent-logo-YNqB7l2OLJF8rz5o.png" />
    <div style="font-size:11px;color:#4a6080;margin-top:6px;">Custom Steel Buildings for Canadian Conditions</div>
  </div>
  <div class="company-info">
    <strong>True North Steelworks</strong><br>
    chris@truenorthsteelworks.com<br>
    truenorthsteelworks.com<br>
    Ontario, Canada
  </div>
</div>

<div class="quote-meta">
  <div class="meta-block">
    <div class="label">Prepared For</div>
    <div class="value">${customerName}</div>
    <div style="font-size:11px;color:#6a8aaa;margin-top:4px;">${projectName}</div>
  </div>
  <div class="meta-block" style="text-align:right;">
    <div class="label">Quote Reference</div>
    <div class="value">${quoteNum}</div>
    <div style="font-size:11px;color:#6a8aaa;margin-top:4px;">Issued: ${todayDate()}</div>
    <div style="font-size:11px;color:#c8a96e;margin-top:2px;">Valid Until: ${expiryDate()}</div>
  </div>
</div>

<div class="section-title">Building Specifications</div>
<table>
  <tr><th>Specification</th><th>Details</th></tr>
  ${specs?.dimensions ? `<tr><td>Overall Dimensions</td><td>${specs.dimensions}</td></tr>` : ""}
  ${specs?.freespan ? `<tr><td>Clear Span / Freespan</td><td>${specs.freespan}</td></tr>` : ""}
  ${specs?.mezzanine ? `<tr><td>Mezzanine / Second Level</td><td>${specs.mezzanine}</td></tr>` : ""}
  <tr><td>Insulation</td><td>${specs?.insulated || "Yes"}</td></tr>
  ${specs?.notes ? `<tr><td>Additional Notes</td><td>${specs.notes}</td></tr>` : ""}
</table>

<div class="section-title">Building Components</div>
<table>
  <tr><th>Category</th><th class="right">Price (${currency})</th></tr>
  ${categoryTotals.map(({ cat, selling }) => `
  <tr><td>${cat}</td><td class="right">${fmt(selling)}</td></tr>
  `).join("")}
</table>

<div class="section-title">Shipping & Duties</div>
<table>
  <tr><th>Item</th><th class="right">Amount (${currency})</th></tr>
  <tr><td>Ocean Freight (${params.containers} x 40HQ Container${params.containers > 1 ? "s" : ""})</td><td class="right">${shippingDisplay}</td></tr>
  <tr><td>Import Tariff (${params.tariff}%)</td><td class="right">${tariffDisplay}</td></tr>
  <tr><td>${taxLabel}</td><td class="right">${fmt(taxAmount)}</td></tr>
</table>

<table style="margin-top:8px;">
  <tr class="total-row">
    <td><strong>TOTAL INVESTMENT</strong></td>
    <td class="right"><strong>${fmt(sellingPrice)}</strong></td>
  </tr>
</table>

<div class="disclaimers">
  <div class="disc-title">Important Notices</div>
  <div class="disclaimer">Shipping costs are estimated based on current carrier rates as of ${todayDate()} and are subject to change at the time of order confirmation. Final shipping costs will be confirmed prior to invoicing.</div>
  <div class="disclaimer">Quoted tariff rates reflect current trade and import duty conditions. Any changes to applicable tariffs or import duties enacted prior to order confirmation may affect the final pricing. True North Steelworks will notify the customer of any material changes before proceeding.</div>
  <div class="disclaimer">This quote is valid for 7 days from the date of issue. Pricing beyond this period is subject to review.</div>
</div>

<div class="footer">
  True North Steelworks · chris@truenorthsteelworks.com · truenorthsteelworks.com<br>
  Quote ${quoteNum} · Generated ${todayDate()}
</div>

</body>
</html>`;

    // Use Vercel's built-in puppeteer-compatible approach via a simple HTML response
    // We'll return the HTML and let the client print it to PDF
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "X-Quote-Number": quoteNum,
      }
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
