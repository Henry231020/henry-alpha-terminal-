export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }
  const { mint, apiKey } = req.body || {};
  if (typeof mint !== "string" || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint)) {
    return res.status(400).json({ error: "Invalid Solana token address." });
  }
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    return res.status(400).json({ error: "Enter your Noesis API key." });
  }
  const base = "https://noesisapi.dev/api/v1";
  async function ask(path) {
    const response = await fetch(base + path, {
      headers: { "X-API-Key": apiKey.trim(), "Accept": "application/json" }
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { error: text.slice(0, 300) || "Invalid API response" }; }
    if (!response.ok) throw new Error(data.error || ("Noesis HTTP " + response.status));
    return data;
  }
  const result = {};
  try { result.preview = await ask("/token/" + encodeURIComponent(mint) + "/preview"); }
  catch (e) { result.previewError = e.message; }
  try { result.earlyBuyers = await ask("/token/" + encodeURIComponent(mint) + "/early-buyers?hours=1"); }
  catch (e) { result.earlyBuyersError = e.message; }
  try { result.bestTraders = await ask("/token/" + encodeURIComponent(mint) + "/best-traders"); }
  catch (e) { result.bestTradersError = e.message; }
  if (!result.preview && !result.earlyBuyers && !result.bestTraders) {
    return res.status(502).json({ error: "Noesis requests failed.", details: result });
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(result);
}