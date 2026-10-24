module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      ok: false,
      error: "POST requests only"
    });
  }

  const secret = process.env.HELIUS_WEBHOOK_SECRET;
  const suppliedSecret = req.headers["authorization"];

  if (!secret || suppliedSecret !== `Bearer ${secret}`) {
    return res.status(401).json({
      ok: false,
      error: "Unauthorized"
    });
  }

  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    console.log("Helius webhook received", {
      eventCount: events.length,
      receivedAt: new Date().toISOString()
    });

    return res.status(200).json({
      ok: true,
      received: events.length
    });
  } catch {
    return res.status(400).json({
      ok: false,
      error: "Invalid webhook payload"
    });
  }
};
