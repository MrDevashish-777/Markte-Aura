import { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { themes } from './themes';
import { classifyMood, MOOD_AURORA } from './moodEngine';
import { useMarketData } from './hooks/useMarketData';
import { useNewsData } from './hooks/useNewsData';
import Background from './components/Background';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ChartPanel from './components/ChartPanel';
import MarketCards from './components/MarketCards';
import InsightPanel from './components/InsightPanel';
import NewsPanel from './components/NewsPanel';
import TickerBar from './components/TickerBar';

export default function App() {
  const market = useMarketData();

  // ── Active market tab ─────────────────────────────────────────────────────
  const [activeMarket, setActiveMarket] = useState('indian'); // 'indian' | 'forex' | 'crypto'

  // ── Live news for active market ───────────────────────────────────────────
  const news = useNewsData(activeMarket);

  // ── Per-market sentiments ─────────────────────────────────────────────────
  const sentiments = useMemo(() => {
    if (market.isLoading) return null;

    const indianMood = classifyMood({
      label: 'Indian Market',
      marketType: 'indian',
      change: market.niftyChange,
      secondaryChange: (market.indianAssets?.find(a => a.label === 'SENSEX')?.change || 0),
      changes: (market.indianAssets ?? []).map((a) => a.change).filter((n) => Number.isFinite(n)),
      price: market.niftyPrice,
    });

    const cryptoMood = classifyMood({
      label: 'Crypto Market',
      marketType: 'crypto',
      change: market.btcChange,
      secondaryChange: (market.cryptoAssets?.find(a => a.label === 'ETH')?.change || 0),
      changes: (market.cryptoAssets ?? []).map((a) => a.change).filter((n) => Number.isFinite(n)),
      price: market.btcPrice,
    });

    const forexMood = classifyMood({
      label: 'Forex Market',
      marketType: 'forex',
      change: (market.forexAssets?.find(a => a.label === 'EUR/USD')?.change || 0),
      secondaryChange: (market.forexAssets?.find(a => a.label === 'GBP/USD')?.change || 0),
      changes: (market.forexAssets ?? []).map((a) => a.change).filter((n) => Number.isFinite(n)),
      price: (market.forexAssets?.find(a => a.label === 'EUR/USD')?.price || 0),
    });

    return { indian: indianMood, crypto: cryptoMood, forex: forexMood };
  }, [market.isLoading, market.btcChange, market.niftyChange, market.cryptoAssets, market.forexAssets, market.indianAssets]);

  // ── Derived mood based on active tab ──────────────────────────────────────
  const [manualMood, setManualMood] = useState(null);
  const derivedMood = sentiments?.[activeMarket]?.mood || 'calm';
  const activeMood  = manualMood ?? derivedMood;

  // ── Theme & Overrides ─────────────────────────────────────────────────────
  const baseTheme    = themes[activeMood] ?? themes.calm;
  const moodResult   = sentiments?.[activeMarket];
  const liveOverrides = moodResult ? moodResult.overrides : {};

  const displayOverrides = {
    bitcoinPrice:  `$${Number(market.btcPrice || 0).toLocaleString('en-US')}`,
    bitcoinChange: `${market.btcChange >= 0 ? '+' : ''}${market.btcChange.toFixed(2)}%`,
    bitcoinUp:      market.btcChange >= 0,
    nasdaqPrice:    Number(market.nasdaqPrice || 0).toLocaleString('en-US'),
    nasdaqChange:  `${market.nasdaqChange >= 0 ? '+' : ''}${market.nasdaqChange.toFixed(2)}%`,
    nasdaqUp:       market.nasdaqChange >= 0,
    niftyPrice:     Number(market.niftyPrice || 0).toLocaleString('en-US'),
    niftyChange:   `${market.niftyChange >= 0 ? '+' : ''}${market.niftyChange.toFixed(2)}%`,
    niftyUp:        market.niftyChange >= 0,
  };

  const theme = { ...baseTheme, ...liveOverrides, ...displayOverrides };

  // ── Sparkline historical data ─────────────────────────────────────────────
  const miniChartRef = useRef({
    btc:    baseTheme.miniChartBitcoin.slice(),
    nasdaq: baseTheme.miniChartNasdaq.slice(),
    nifty:  baseTheme.miniChartGold.slice(),
    ai:     baseTheme.miniChartAI.slice(),
  });

  useEffect(() => {
    if (market.isLoading) return;
    const charts = miniChartRef.current;
    const push = (arr, val) => { arr.push(val); if (arr.length > 8) arr.shift(); };
    push(charts.btc,    market.btcPrice / (market.btcPrice / 50 || 1));
    push(charts.nasdaq, market.nasdaqPrice / (market.nasdaqPrice / 50 || 1));
    push(charts.nifty,  50 + market.niftyChange * 3);
    push(charts.ai,     50 + (market.btcChange + market.nasdaqChange) * 2);
  }, [market.btcPrice, market.nasdaqPrice, market.niftyChange, market.isLoading]);

  const auroraParams = MOOD_AURORA[activeMood] ?? MOOD_AURORA.calm;

  // ── Mood transition flash ─────────────────────────────────────────────────
  const prevMoodRef = useRef(activeMood);
  const [moodTransition, setMoodTransition] = useState(false);
  useEffect(() => {
    if (prevMoodRef.current !== activeMood) {
      prevMoodRef.current = activeMood;
      setMoodTransition(true);
      const t = setTimeout(() => setMoodTransition(false), 800);
      return () => clearTimeout(t);
    }
  }, [activeMood]);

  // ── Ticker strip selection ────────────────────────────────────────────────
  const tickerData =
    activeMarket === 'crypto' ? market.cryptoTicker :
    activeMarket === 'forex'  ? market.forexTicker  :
    market.indianTicker;

  return (
    <div className="min-h-screen bg-black relative">
      <AnimatePresence>
        {moodTransition && (
          <motion.div
            key="flash"
            initial={{ opacity: 0.25 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: theme.accent, pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <Background theme={theme} auroraParams={auroraParams} />

      <Navbar
        theme={theme}
        activeMood={activeMood}
        isLive={market.isLive}
      />

      <main className="relative z-10 pb-16">
        <Hero
          theme={theme}
          activeMood={activeMood}
          manualMood={manualMood}
          onMoodChange={setManualMood}
          market={market}
          moodReasons={moodResult?.reasons ?? []}
          activeMarket={activeMarket}
          onMarketChange={setActiveMarket}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeMood + '-' + activeMarket}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="space-y-6"
          >
            <ChartPanel theme={theme} activeMood={activeMood} />
            <MarketCards theme={theme} market={market} activeMarket={activeMarket} />

            {/* ── Live News Sentiment Panel ── */}
            <NewsPanel theme={theme} news={news} activeMarket={activeMarket} />

            <InsightPanel theme={theme} />
          </motion.div>
        </AnimatePresence>
      </main>

      <TickerBar
        theme={theme}
        tickerData={tickerData}
        lastUpdated={market.lastUpdated}
        isLive={market.isLive}
      />
    </div>
  );
}
