
module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.HELIUS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: "HELIUS_API_KEY is not configured"
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
          method: "getHealth",
          params: []
        })
      }
    );

    const data = await response.json();

    if (!response.ok || data.error || data.result !== "ok") {
      return res.status(502).json({
        ok: false,
        error: "Helius connection check failed"
      });
    }

    return res.status(200).json({
      ok: true,
      provider: "Helius",
      network: "Solana mainnet",
      status: "connected"
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: "Unable to reach Helius"
    });
  }
};
