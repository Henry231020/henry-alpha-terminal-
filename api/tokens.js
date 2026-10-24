// api/tokens.js - Vercel Serverless Backend Proxy for Henry Alpha Terminal
export default async function handler(req, res) {
    // Enable CORS for your frontend
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { action, query } = req.query;

    try {
        if (action === 'search' && query) {
            // Fetch live data from DexScreener API securely from the server side
            const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            const solPairs = (data.pairs || []).filter(p => p.chainId === 'solana');
            return res.status(200).json({ success: true, pairs: solPairs });
        }

        // Default action: Fetch trending Solana tokens with live logos and volume
        const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=solana');
        const data = await response.json();
        const solPairs = (data.pairs || []).filter(p => p.chainId === 'solana').slice(0, 15);

        const formattedTokens = solPairs.map(p => ({
            symbol: p.baseToken?.symbol || 'UNKNOWN',
            name: p.baseToken?.name || 'Solana Asset',
            mint: p.baseToken?.address || '',
            image: p.info?.imageUrl || 'https://cryptologos.cc/logos/solana-sol-logo.png',
            vol: `$${((p.volume?.h24 || 1000) / 1000).toFixed(1)}K`,
            txs: (p.txns?.h24?.buys || 20) + (p.txns?.h24?.sells || 20),
            mc: p.fdv || p.marketCap || 50000,
            mc1m: `${(p.priceChange?.m5 || 0) > 0 ? '+' : ''}${p.priceChange?.m5 || 0}%`,
            bonding: p.dexId === 'pumpfun' ? 88.5 : 100
        }));

        return res.status(200).json({ success: true, tokens: formattedTokens });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
