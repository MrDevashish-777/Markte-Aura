/**
 * useMarketData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Data sources:
 *   CRYPTO  → Finnhub (BINANCE:BTCUSDT etc.) — FREE, real-time
 *   FOREX   → Finnhub (Forex pairs) — FREE, real-time
 *   INDIAN  → Yahoo Finance JSON API (via allorigins CORS proxy) — FREE, ~15min delay
 *
 * Refresh every 30 seconds. Falls back to simulation if API is unavailable.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Config ───────────────────────────────────────────────────────────────────

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const REFRESH_MS  = 30_000;

// ─── Utility formatters ───────────────────────────────────────────────────────

const fmt   = (n, dec = 0) => n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const pct   = (c) => `${c >= 0 ? '+' : ''}${parseFloat(c).toFixed(2)}%`;
const tick  = (label, val, change) => ({ label, value: val, change: pct(change), up: change >= 0 });

function mkAsset(label, name, icon, iconBg, price, change, prefix = '', dec = 0) {
  return {
    label, name, icon, iconBg, price,
    priceStr: `${prefix}${fmt(price, dec)}`,
    change, changeStr: pct(change), up: change >= 0,
  };
}

// ─── Finnhub quote ────────────────────────────────────────────────────────────

async function fetchFinnhub(symbol) {
  if (!FINNHUB_KEY || FINNHUB_KEY === 'your_finnhub_api_key_here') return null;
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const d = await res.json();
    if (!d.c || d.c === 0) return null;
    return { price: d.c, change: d.dp ?? 0 };
  } catch {
    return null;
  }
}

// ─── Finnhub Forex ────────────────────────────────────────────────────────────

async function fetchFinnhubForex(from, to) {
  if (!FINNHUB_KEY || FINNHUB_KEY === 'your_finnhub_api_key_here') return null;
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/forex/rates?base=${from}&token=${FINNHUB_KEY}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const d = await res.json();
    const rate = d.quote?.[to];
    if (!rate) return null;
    return { price: rate, change: (Math.random() - 0.5) * 0.4 }; // Finnhub free doesn't return % change for forex
  } catch {
    return null;
  }
}

// ─── Yahoo Finance (Indian stocks via CORS proxy) ─────────────────────────────

async function fetchYahoo(symbol) {
  try {
    // Use allorigins to bypass CORS on Yahoo Finance
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`;

    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const outer = await res.json();
    if (!outer.contents) return null;

    const data = JSON.parse(outer.contents);
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price  = meta.regularMarketPrice ?? 0;
    const prev   = meta.previousClose ?? meta.chartPreviousClose ?? price;
    const change = prev ? ((price - prev) / prev) * 100 : 0;

    if (!price) return null;
    return { price, change };
  } catch {
    return null;
  }
}

// ─── Simulation fallback ──────────────────────────────────────────────────────

const simState = {
  eur:    { price: 1.0856, change: -0.14 },
  gbp:    { price: 1.2688, change:  0.03 },
  jpy:    { price: 156.82, change:  0.15 },
  nifty:  { price: 24652,  change:  0.17 },
  sensex: { price: 81148,  change:  0.32 },
  btc:    { price: 76822,  change:  2.88 },
  eth:    { price: 2420,   change:  4.50 },
  sol:    { price: 86,     change:  5.29 },
};

function stepSim(key, volatility = 0.0005) {
  const s = simState[key];
  const move = (Math.random() - 0.495) * volatility;
  s.price  = s.price * (1 + move);
  s.change = Math.max(-15, Math.min(15, s.change + (Math.random() - 0.5) * 0.12));
  return { price: s.price, change: s.change };
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useMarketData() {
  const [data, setData] = useState({
    isLoading: true, isLive: false, lastUpdated: null,
    btcPrice: 0, btcChange: 0,
    nasdaqPrice: 0, nasdaqChange: 0,
    niftyPrice: 0, niftyChange: 0,
    cryptoAssets: [], forexAssets: [], indianAssets: [],
    cryptoTicker: [], forexTicker: [], indianTicker: [],
  });

  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    // ── 1. CRYPTO: Finnhub Binance feeds ─────────────────────────────────────
    const [btcR, ethR, solR] = await Promise.all([
      fetchFinnhub('BINANCE:BTCUSDT'),
      fetchFinnhub('BINANCE:ETHUSDT'),
      fetchFinnhub('BINANCE:SOLUSDT'),
    ]);

    // ── 2. US STOCKS (for NASDAQ proxy via QQQ ETF) ──────────────────────────
    const qqqR = await fetchFinnhub('QQQ');

    // ── 3. FOREX: Finnhub rates ───────────────────────────────────────────────
    const [eurR, gbpR, jpyR] = await Promise.all([
      fetchFinnhub('OANDA:EUR_USD'),
      fetchFinnhub('OANDA:GBP_USD'),
      fetchFinnhub('OANDA:USD_JPY'),
    ]);

    // ── 4. INDIAN: Yahoo Finance via proxy ────────────────────────────────────
    const [niftyR, sensexR, relianceR, tcsR] = await Promise.all([
      fetchYahoo('%5ENSEI'),     // NIFTY 50
      fetchYahoo('%5EBSESN'),    // SENSEX
      fetchYahoo('RELIANCE.NS'), // Reliance Industries
      fetchYahoo('TCS.NS'),      // Tata Consultancy
    ]);

    if (!mountedRef.current) return;

    // ── Resolve with sim fallbacks ────────────────────────────────────────────

    const btc    = btcR  || stepSim('btc');
    const eth    = ethR  || stepSim('eth');
    const sol    = solR  || stepSim('sol');
    const eur    = eurR  || stepSim('eur', 0.0001);
    const gbp    = gbpR  || stepSim('gbp', 0.0001);
    const jpy    = jpyR  || stepSim('jpy', 0.0001);
    const nifty  = niftyR  || stepSim('nifty',  0.0002);
    const sensex = sensexR || stepSim('sensex', 0.0002);

    // Reliance / TCS with sim fallback
    const reliance = relianceR || { price: 2842 + (Math.random()-0.5)*20, change: (Math.random()-0.5)*2 };
    const tcs      = tcsR      || { price: 3941 + (Math.random()-0.5)*30, change: (Math.random()-0.5)*2 };

    // NASDAQ approximation from QQQ (QQQ ≈ NASDAQ/27)
    const nasdaq = qqqR
      ? { price: qqqR.price * 50, change: qqqR.change }
      : { price: 19503, change: 0.42 };

    // Sync sim states
    simState.btc.price = btc.price; simState.btc.change = btc.change;
    simState.eth.price = eth.price; simState.eth.change = eth.change;
    simState.sol.price = sol.price; simState.sol.change = sol.change;
    simState.nifty.price = nifty.price; simState.nifty.change = nifty.change;
    simState.sensex.price = sensex.price; simState.sensex.change = sensex.change;

    // ── Build asset arrays ─────────────────────────────────────────────────────

    const cryptoAssets = [
      mkAsset('BTC',  'Bitcoin',  '₿', '#f7931a', btc.price, btc.change, '$'),
      mkAsset('ETH',  'Ethereum', 'Ξ', '#627eea', eth.price, eth.change, '$'),
      mkAsset('SOL',  'Solana',   'S', '#9945ff', sol.price, sol.change, '$', 2),
    ];

    const forexAssets = [
      mkAsset('EUR/USD', 'Euro',   '€', '#003399', eur.price, eur.change, '', 4),
      mkAsset('GBP/USD', 'Pound',  '£', '#012169', gbp.price, gbp.change, '', 4),
      mkAsset('USD/JPY', 'Yen',    '¥', '#bc002d', jpy.price, jpy.change, '', 2),
    ];

    const indianAssets = [
      mkAsset('NIFTY 50', 'NIFTY 50',  '₹', '#004080', nifty.price,    nifty.change),
      mkAsset('SENSEX',   'SENSEX',    'B', '#1a3c6e', sensex.price,   sensex.change),
      mkAsset('RELIANCE', 'Reliance',  'R', '#e6241b', reliance.price, reliance.change, '₹'),
      mkAsset('TCS',      'TCS',       'T', '#0072bc', tcs.price,      tcs.change,      '₹'),
    ];

    // ── Determine live status ─────────────────────────────────────────────────
    const anyLive = !!(btcR || niftyR || eurR);

    setData({
      isLoading: false,
      isLive: anyLive,
      lastUpdated: new Date(),
      btcPrice: btc.price, btcChange: btc.change,
      nasdaqPrice: nasdaq.price, nasdaqChange: nasdaq.change,
      niftyPrice: nifty.price, niftyChange: nifty.change,
      cryptoAssets, forexAssets, indianAssets,
      cryptoTicker: cryptoAssets.map(a => tick(a.label, a.priceStr, a.change)),
      forexTicker:  forexAssets.map(a  => tick(a.label, a.priceStr, a.change)),
      indianTicker: indianAssets.map(a => tick(a.label, a.priceStr, a.change)),
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const interval = setInterval(refresh, REFRESH_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  return data;
}
