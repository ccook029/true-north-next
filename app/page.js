"use client";
import { useState, useCallback } from "react";

const LOGO_URL = "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/mePxnP9KVEs5oWkD/true-north-steelworks-final---transparent-logo-YNqB7l2OLJF8rz5o.png";
const INITIAL_PARAMS = { shipping: 6000, containers: 1, tariff: 25, gst: 5, salesTax: 8, margin: 35, exchRate: 1.44, engineeringCAD: 2500, miscCAD: 2000 };

const fmtCAD = (n) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 }).format(isNaN(n) ? 0 : n);
const fmtUSD = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(isNaN(n) ? 0 : n);

function Param({ label, value, onChange, prefix, suffix }) {
  return (
    <div>
      <label style={{ fontSize: 10, color: "#8a9bb0", letterSpacing: 2, display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 4, padding: "8px 12px" }}>
        {prefix && <span style={{ color: "#c8a96e", marginRight: 4, fontSize: 13 }}>{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          style={{ background: "transparent", border: "none", color: "#e8eef5", fontSize: 15, fontFamily: "inherit", width: "100%", outline: "none" }} />
        {suffix && <span style={{ color: "#4a6080", fontSize: 13 }}>{suffix}</span>}
      </div>
    </div>
  );
}

export default function App() {
  const [params, setParams] = useState(INITIAL_PARAMS);
  const [items, setItems] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newItem, setNewItem] = useState({ name: "", usd: "" });
  const [dragging, setDragging] = useState(false);
  const [showItems, setShowItems] = useState(true);
  const [currency, setCurrency] = useState("CAD"); // CAD or USD

  const setParam = (key) => (val) => setParams(p => ({ ...p, [key]: Number(val) }));
  const fmt = currency === "CAD" ? fmtCAD : fmtUSD;

  const parsePDF = async (file) => {
    setLoading(true);
    setError("");
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("Read failed"));
        r.readAsDataURL(file);
      });

      const response = await fetch("/api/parse-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 })
      });

      const parsed = await response.json();
      if (parsed.error) throw new Error(parsed.error);

      setProjectName(parsed.projectName || file.name);
      setItems((parsed.items || []).map((item, i) => ({ ...item, id: i + 1, enabled: true })));
      if (parsed.containers) setParams(p => ({ ...p, containers: parsed.containers }));
    } catch (err) {
      setError("Could not parse PDF. Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && file.type === "application/pdf") parsePDF(file);
    else setError("Please upload a PDF file.");
  }, []);

  const toggleItem = (id) => setItems(p => p.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
  const removeItem = (id) => setItems(p => p.filter(i => i.id !== id));
  const addItem = () => {
    if (!newItem.name || !newItem.usd) return;
    setItems(p => [...p, { id: Date.now(), category: "Custom", name: newItem.name, usd: Number(newItem.usd), enabled: true }]);
    setNewItem({ name: "", usd: "" });
  };

  // --- Calculations ---
  const factoryUSD = items.filter(i => i.enabled).reduce((s, i) => s + (Number(i.usd) || 0), 0);
  const fobUSD = factoryUSD + 1300;
  const totalShippingUSD = params.shipping * params.containers;
  const landedUSD = fobUSD + totalShippingUSD;
  const tariffUSD = landedUSD * (params.tariff / 100);
  const hiddenCostsCAD = params.engineeringCAD + params.miscCAD;
  const hiddenCostsUSD = hiddenCostsCAD / params.exchRate;

  let totalCost, sellingPrice, grossProfit, taxAmount, taxLabel;

  if (currency === "CAD") {
    const subtotalCAD = (landedUSD + tariffUSD) * params.exchRate;
    const gstCAD = subtotalCAD * (params.gst / 100);
    totalCost = subtotalCAD + gstCAD + hiddenCostsCAD;
    taxAmount = gstCAD;
    taxLabel = `GST ${params.gst}%`;
  } else {
    const subtotalUSD = landedUSD + tariffUSD + hiddenCostsUSD;
    const salesTaxUSD = subtotalUSD * (params.salesTax / 100);
    totalCost = subtotalUSD + salesTaxUSD;
    taxAmount = salesTaxUSD;
    taxLabel = `Sales Tax ${params.salesTax}%`;
  }

  sellingPrice = totalCost / (1 - params.margin / 100);
  grossProfit = sellingPrice - totalCost;

  // Per category selling prices (margin baked in)
  const categories = [...new Set(items.map(i => i.category))];
  const categoryTotals = categories.map(cat => {
    const subtotalUSD = items.filter(i => i.category === cat && i.enabled).reduce((s, i) => s + Number(i.usd), 0);
    const subtotal = currency === "CAD" ? subtotalUSD * params.exchRate : subtotalUSD;
    return { cat, selling: subtotal / (1 - params.margin / 100) };
  });

  const sqft = 20000; // 100x200

  const colors = { bg: "#060f1e", panel: "#0d1f35", border: "#1a3355", accent: "#c8a96e", blue: "#2a7fd4", text: "#d4dde8", muted: "#6a8aaa", dim: "#3a5570" };
  const panelStyle = { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 24, marginBottom: 24 };

  return (
    <div style={{ fontFamily: "'DM Mono', 'Courier New', monospace", background: colors.bg, minHeight: "100vh", color: colors.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#080f1c", borderBottom: `2px solid ${colors.accent}`, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src={LOGO_URL} alt="True North Steelworks" style={{ height: 48, objectFit: "contain" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Currency Toggle */}
          <div style={{ display: "flex", background: "#0a1628", border: `1px solid ${colors.border}`, borderRadius: 6, overflow: "hidden" }}>
            {["CAD", "USD"].map(c => (
              <button key={c} onClick={() => setCurrency(c)} style={{
                padding: "8px 20px", border: "none", cursor: "pointer", fontSize: 12, fontFamily: "inherit", letterSpacing: 2, fontWeight: 600,
                background: currency === c ? colors.accent : "transparent",
                color: currency === c ? "#000" : colors.muted,
                transition: "all 0.2s"
              }}>{c}</button>
            ))}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: colors.accent }}>QUOTE PRICING CALCULATOR</div>
            <div style={{ fontSize: 10, color: colors.muted, letterSpacing: 2 }}>INTERNAL USE ONLY</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>

          {/* LEFT */}
          <div>
            {/* Upload */}
            <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
              style={{ ...panelStyle, border: `2px dashed ${dragging ? colors.accent : colors.border}`, textAlign: "center", cursor: "pointer" }}
              onClick={() => document.getElementById("pdf-input").click()}>
              <input id="pdf-input" type="file" accept=".pdf" style={{ display: "none" }} onChange={onDrop} />
              {loading ? (
                <div><div style={{ fontSize: 28 }}>⟳</div><div style={{ color: colors.accent, fontSize: 12, letterSpacing: 2 }}>PARSING QUOTE WITH AI...</div></div>
              ) : items.length > 0 ? (
                <div>
                  <div style={{ fontSize: 11, color: colors.accent, letterSpacing: 2, marginBottom: 4 }}>✓ QUOTE LOADED</div>
                  <div style={{ fontSize: 13 }}>{projectName}</div>
                  <div style={{ fontSize: 10, color: colors.muted, marginTop: 4 }}>{items.length} line items · Click or drop to load a new quote</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 36, opacity: 0.4, marginBottom: 8 }}>📄</div>
                  <div style={{ color: colors.accent, fontSize: 12, letterSpacing: 2, marginBottom: 4 }}>DROP FACTORY QUOTE PDF HERE</div>
                  <div style={{ fontSize: 10, color: colors.muted }}>or click to browse · AI will extract all line items automatically</div>
                </div>
              )}
              {error && <div style={{ color: "#e05555", fontSize: 11, marginTop: 12, padding: "8px 12px", background: "#1a0808", borderRadius: 4 }}>{error}</div>}
            </div>

            {/* Parameters */}
            <div style={panelStyle}>
              <div style={{ fontSize: 10, color: colors.accent, letterSpacing: 3, marginBottom: 20 }}>COST PARAMETERS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <Param label="SHIPPING/CONTAINER (USD)" value={params.shipping} onChange={setParam("shipping")} prefix="$" />
                <Param label="# OF CONTAINERS" value={params.containers} onChange={setParam("containers")} />
                <Param label="TARIFF RATE" value={params.tariff} onChange={setParam("tariff")} suffix="%" />
                {currency === "CAD"
                  ? <Param label="GST" value={params.gst} onChange={setParam("gst")} suffix="%" />
                  : <Param label="US SALES TAX" value={params.salesTax} onChange={setParam("salesTax")} suffix="%" />}
                <Param label="TARGET MARGIN" value={params.margin} onChange={setParam("margin")} suffix="%" />
                {currency === "CAD" && <Param label="USD → CAD RATE" value={params.exchRate} onChange={setParam("exchRate")} />}
              </div>
              {/* Hidden costs — internal only */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid #111d2a` }}>
                <div style={{ fontSize: 10, color: colors.dim, letterSpacing: 2, marginBottom: 12 }}>HIDDEN COSTS (NOT SHOWN TO CUSTOMER)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Param label="ENGINEERING (CAD)" value={params.engineeringCAD} onChange={setParam("engineeringCAD")} prefix="$" />
                  <Param label="MISC (CAD)" value={params.miscCAD} onChange={setParam("miscCAD")} prefix="$" />
                </div>
              </div>
            </div>

            {/* Line Items */}
            {items.length > 0 && (
              <div style={panelStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: colors.accent, letterSpacing: 3 }}>LINE ITEMS (EX-FACTORY USD)</div>
                  <button onClick={() => setShowItems(s => !s)} style={{ background: "transparent", border: `1px solid ${colors.dim}`, color: colors.muted, padding: "4px 12px", fontSize: 10, letterSpacing: 2, cursor: "pointer", borderRadius: 4 }}>
                    {showItems ? "COLLAPSE" : "EXPAND"}
                  </button>
                </div>
                {showItems && categories.map(cat => (
                  <div key={cat} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: colors.dim, letterSpacing: 2, marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid #111d2a" }}>{cat.toUpperCase()}</div>
                    {items.filter(i => i.category === cat).map(item => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", opacity: item.enabled ? 1 : 0.3 }}>
                        <input type="checkbox" checked={item.enabled} onChange={() => toggleItem(item.id)} style={{ accentColor: colors.accent, cursor: "pointer", flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 11 }}>{item.name}</span>
                        <span style={{ fontSize: 11, minWidth: 80, textAlign: "right" }}>${Number(item.usd).toFixed(2)}</span>
                        <button onClick={() => removeItem(item.id)} style={{ background: "transparent", border: "none", color: "#6a3030", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                      </div>
                    ))}
                  </div>
                ))}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #111d2a", display: "flex", gap: 8 }}>
                  <input placeholder="Add line item" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                    style={{ flex: 1, background: "#0a1628", border: `1px solid ${colors.border}`, color: colors.text, padding: "7px 10px", fontSize: 11, fontFamily: "inherit", borderRadius: 4, outline: "none" }} />
                  <input placeholder="USD" type="number" value={newItem.usd} onChange={e => setNewItem(p => ({ ...p, usd: e.target.value }))}
                    style={{ width: 85, background: "#0a1628", border: `1px solid ${colors.border}`, color: colors.text, padding: "7px 10px", fontSize: 11, fontFamily: "inherit", borderRadius: 4, outline: "none" }} />
                  <button onClick={addItem} style={{ background: colors.accent, border: "none", color: "#000", padding: "7px 14px", fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: "pointer", borderRadius: 4 }}>ADD</button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Summary */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ ...panelStyle, marginBottom: 0 }}>
              <div style={{ fontSize: 10, color: colors.accent, letterSpacing: 3, marginBottom: 4 }}>COST SUMMARY</div>
              {projectName && <div style={{ fontSize: 11, color: colors.muted, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${colors.border}` }}>{projectName}</div>}

              {[
                { label: "Ex-Factory (USD)", value: fmtUSD(factoryUSD) },
                { label: "FOB Qingdao (+$1,300)", value: fmtUSD(fobUSD) },
                { label: `Ocean Freight (${params.containers}x $${Number(params.shipping).toLocaleString()})`, value: fmtUSD(totalShippingUSD) },
                { label: "Landed Cost (USD)", value: fmtUSD(landedUSD), bold: true },
                { label: `Tariff ${params.tariff}%`, value: fmtUSD(tariffUSD), warn: true },
                { label: taxLabel, value: fmt(taxAmount) },
                { label: `Hidden Costs`, value: fmt(currency === "CAD" ? hiddenCostsCAD : hiddenCostsUSD) },
                { label: `Your Total Cost (${currency})`, value: fmt(totalCost), bold: true, highlight: true },
              ].map(({ label, value, bold, warn, highlight }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #0f1e2e" }}>
                  <span style={{ fontSize: 10, color: bold ? colors.muted : colors.dim, letterSpacing: 1 }}>{label}</span>
                  <span style={{ fontSize: bold ? 14 : 11, color: warn ? "#d4844a" : highlight ? colors.accent : bold ? colors.text : "#4a6a8a", fontWeight: bold ? 600 : 400 }}>{value}</span>
                </div>
              ))}

              {/* Selling Price */}
              <div style={{ marginTop: 20, background: "linear-gradient(135deg, #1a3a6a, #0d2040)", border: `1px solid ${colors.blue}`, borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 10, color: "#6a9fd4", letterSpacing: 3, marginBottom: 6 }}>CUSTOMER SELLING PRICE ({currency})</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: "#fff", letterSpacing: 1, lineHeight: 1 }}>{fmt(sellingPrice)}</div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a3a5a", display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                  <span style={{ color: "#4a7aaa" }}>Gross Profit</span>
                  <span style={{ color: "#6dcf8a" }}>{fmt(grossProfit)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4 }}>
                  <span style={{ color: "#4a7aaa" }}>Margin</span>
                  <span style={{ color: "#6dcf8a" }}>{params.margin}% ({((params.margin / (100 - params.margin)) * 100).toFixed(1)}% markup)</span>
                </div>
              </div>

              {/* Category breakdown for customer quote */}
              {items.length > 0 && (
                <div style={{ marginTop: 14, background: "#080f1c", borderRadius: 6, padding: 14 }}>
                  <div style={{ fontSize: 10, color: colors.dim, letterSpacing: 2, marginBottom: 8 }}>CUSTOMER QUOTE BY CATEGORY</div>
                  {categoryTotals.map(({ cat, selling }) => (
                    <div key={cat} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: colors.dim }}>{cat}</span>
                      <span style={{ color: colors.accent }}>{fmt(selling)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 8, paddingTop: 8, borderTop: "1px solid #1a2a3a" }}>
                    <span style={{ color: colors.muted }}>Per sq ft (100×200)</span>
                    <span style={{ color: colors.muted }}>{fmt(sellingPrice / sqft)}/sqft</span>
                  </div>
                </div>
              )}

              {items.length === 0 && (
                <div style={{ marginTop: 20, textAlign: "center", color: colors.dim, fontSize: 11, padding: "20px 0" }}>
                  Upload a factory PDF quote to see your pricing
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "16px 0 24px", fontSize: 10, color: colors.dim, letterSpacing: 2 }}>
        TRUENORTHSTEELWORKS.COM · INTERNAL PRICING TOOL
      </div>
    </div>
  );
}
