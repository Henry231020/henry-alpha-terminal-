
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      ok: false,
      error: "Use GET"
    });
  }

  const apiKey = process.env.HELIUS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: "Helius API key is not configured"
    });
  }

  try {
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getSlot",
          params: []
        })
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(502).json({
        ok: false,
        error: "Solana data request failed"
      });
    }

    return res.status(200).json({
      ok: true,
      network: "Solana mainnet",
      slot: data.result,
      checkedAt: new Date().toISOString()
    });
  } catch {
    return res.status(502).json({
      ok: false,
      error: "Unable to fetch Solana data"
    });
  }
};
