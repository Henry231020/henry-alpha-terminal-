export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=solana');
        const data = await response.json();
        const solPairs = (data.pairs || []).filter(p => p.chainId === 'solana').slice(0, 15);

        const tokens = solPairs.map(p => ({
            symbol: p.baseToken?.symbol || 'UNKNOWN',
            name: p.baseToken?.name || 'Solana Asset',
            mint: p.baseToken?.address || '',
            image: p.info?.imageUrl || 'https://cryptologos.cc/logos/solana-sol-logo.png',
            vol: `$${((p.volume?.h24 || 1000) / 1000).toFixed(1)}K`,
            txs: (p.txns?.h24?.buys || 10) + (p.txns?.h24?.sells || 10),
            mc: p.fdv || p.marketCap || 50000,
            mc1m: `${(p.priceChange?.m5 || 0) > 0 ? '+' : ''}${p.priceChange?.m5 || 0}%`
        }));

        return res.status(200).json({ success: true, tokens });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
