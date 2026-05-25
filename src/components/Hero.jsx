import { motion, AnimatePresence } from 'framer-motion';

// ── Per-tab config ────────────────────────────────────────────────────────────

const TAB_META = {
  indian: {
    badge:    '🇮🇳 Indian Markets Active',
    subtitle: 'Tracking NIFTY 50, SENSEX, and India\'s financial pulse in real-time.',
    pills: (market) => [
      { label: 'NIFTY 50',   price: (market.niftyPrice  || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }),  change: market.niftyChange  ?? 0 },
      { label: 'SENSEX',     price: (market.indianAssets?.find(a => a.label === 'SENSEX')?.price || 81200).toLocaleString('en-US', { maximumFractionDigits: 0 }), change: market.indianAssets?.find(a => a.label === 'SENSEX')?.change ?? 0 },
      { label: 'USD/INR',    price: '₹' + (market.indianAssets?.find(a => a.label === 'USD/INR')?.price || 83.47).toFixed(2), change: market.indianAssets?.find(a => a.label === 'USD/INR')?.change ?? 0 },
    ],
  },
  forex: {
    badge:    '💱 Forex Markets Live',
    subtitle: 'Monitoring global currency movements and exchange rate dynamics.',
    pills: (market) => [
      { label: 'EUR/USD', price: (market.forexAssets?.find(a => a.label === 'EUR/USD')?.price || 1.086).toFixed(4),  change: market.forexAssets?.find(a => a.label === 'EUR/USD')?.change ?? 0 },
      { label: 'GBP/USD', price: (market.forexAssets?.find(a => a.label === 'GBP/USD')?.price || 1.268).toFixed(4),  change: market.forexAssets?.find(a => a.label === 'GBP/USD')?.change ?? 0 },
      { label: 'USD/JPY', price: (market.forexAssets?.find(a => a.label === 'USD/JPY')?.price || 156.8).toFixed(2),  change: market.forexAssets?.find(a => a.label === 'USD/JPY')?.change ?? 0 },
    ],
  },
  crypto: {
    badge:    '₿ Crypto Markets Live',
    subtitle: 'Real-time blockchain asset sentiment across DeFi and major cryptocurrencies.',
    pills: (market) => [
      { label: 'BTC',  price: '$' + (market.btcPrice  || 0).toLocaleString('en-US', { maximumFractionDigits: 0 }), change: market.btcChange  ?? 0 },
      { label: 'ETH',  price: '$' + (market.cryptoAssets?.find(a => a.label === 'ETH')?.price || 2100).toLocaleString('en-US', { maximumFractionDigits: 0 }), change: market.cryptoAssets?.find(a => a.label === 'ETH')?.change ?? 0 },
      { label: 'BNB',  price: '$' + (market.cryptoAssets?.find(a => a.label === 'BNB')?.price || 650).toLocaleString('en-US', { maximumFractionDigits: 0 }), change: market.cryptoAssets?.find(a => a.label === 'BNB')?.change ?? 0 },
    ],
  },
};

const MARKET_TABS = [
  { key: 'indian', label: 'Indian', icon: '🇮🇳' },
  { key: 'forex',  label: 'Forex',  icon: '💱'  },
  { key: 'crypto', label: 'Crypto', icon: '₿'   },
];

const moodButtons = [
  { key: null,      label: 'Auto',    icon: '◎' },
  { key: 'bullish', label: 'Bullish', icon: '↗' },
  { key: 'fear',    label: 'Fear',    icon: '↘' },
  { key: 'calm',    label: 'Calm',    icon: '〰' },
  { key: 'chaos',   label: 'Chaos',   icon: '⚡' },
];

const moodSubtitles = {
  bullish: 'Markets surging — institutional inflows accelerating across all sectors.',
  fear:    'Panic detected — broad sell-off with cascading liquidations.',
  calm:    'Low volatility consolidation — balanced forces, no clear directional bias.',
  chaos:   'Extreme divergence — unpredictable multi-directional price action.',
};

const containerVariants = {
  bullish: { x: 0, y: 0 },
  fear:    { x: [0,-2,2,-1,1,0], y: [0,1,-1,0], transition: { repeat: Infinity, duration: 4 } },
  calm:    { x: 0, y: [0,-3,0,3,0],  transition: { repeat: Infinity, duration: 6 } },
  chaos:   { x: [0,-3,4,-2,3,-4,0], y: [0,2,-3,1,-2,3,0], transition: { repeat: Infinity, duration: 1.5 } },
};

function LiveDot({ isLive }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ repeat: Infinity, duration: isLive ? 1.2 : 2.5 }}
        style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: isLive ? '#22c55e' : '#f59e0b' }}
      />
      <span style={{ fontSize: 10, color: isLive ? '#22c55e' : '#f59e0b', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
        {isLive ? 'LIVE' : 'SIM'}
      </span>
    </span>
  );
}

export default function Hero({
  theme, activeMood, manualMood, onMoodChange,
  market, moodReasons, activeMarket, onMarketChange,
}) {
  const isLoading   = market?.isLoading;
  const isLive      = market?.isLive ?? false;
  const lastUpdated = market?.lastUpdated;

  const meta  = TAB_META[activeMarket] ?? TAB_META.indian;
  const pills = isLoading ? [] : meta.pills(market);

  const subtitle = isLoading
    ? 'Connecting to live market feeds…'
    : moodSubtitles[activeMood] ?? meta.subtitle;

  return (
    <motion.section
      className="relative z-10 flex flex-col items-center justify-center text-center pt-36 pb-16 px-6"
      animate={containerVariants[activeMood] || containerVariants.calm}
    >

      {/* ── Market tab switcher — ABOVE the title ── */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center gap-1 p-1 rounded-2xl mb-5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {MARKET_TABS.map(tab => {
          const isActive = activeMarket === tab.key;
          return (
            <motion.button
              key={tab.key}
              onClick={() => onMarketChange(tab.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-400"
              style={{
                fontFamily: 'Outfit, sans-serif',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.38)',
                background: isActive
                  ? `linear-gradient(135deg, ${theme.accent}35, ${theme.accent}18)`
                  : 'transparent',
                border: isActive
                  ? `1px solid ${theme.accent}55`
                  : '1px solid transparent',
                boxShadow: isActive ? `0 0 24px ${theme.accent}25` : 'none',
              }}
            >
              <span style={{ fontSize: 17 }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="hero-tab-indicator"
                  style={{
                    position: 'absolute', bottom: -1, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 24, height: 2, borderRadius: 2,
                    background: theme.accent,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Live status badge ── */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <LiveDot isLive={isLive} />
        <AnimatePresence mode="wait">
          <motion.span
            key={activeMood + activeMarket + '-badge'}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.35 }}
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif' }}
          >
            {isLoading ? 'Fetching Market Data…' : meta.badge}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* ── Main heading ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h1
          className="text-7xl md:text-8xl lg:text-9xl font-black leading-none tracking-tight"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          <span className="text-white">Market</span>
          <br />
          <motion.span
            key={activeMood + '-title'}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              color: theme.accent,
              textShadow: `0 0 60px ${theme.accent}60, 0 0 120px ${theme.accent}30`,
              transition: 'color 0.8s ease, text-shadow 0.8s ease',
            }}
          >
            Aura
          </motion.span>
        </h1>
      </motion.div>

      {/* ── Subtitle (tab-specific + mood-specific) ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.45 }}
        className="mt-6 max-w-xl"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={activeMood + activeMarket + '-sub'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
            className="text-base md:text-lg leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit, sans-serif', fontWeight: 400 }}
          >
            {subtitle}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* ── Live price pills — tab-specific ── */}
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            key={activeMarket + '-pills'}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3 mt-6"
          >
            {pills.map(item => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                  {item.label}
                </span>
                <span style={{ color: '#fff', fontSize: 13, fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>
                  {item.price}
                </span>
                <span style={{ color: item.change >= 0 ? '#22c55e' : '#ef4444', fontSize: 10, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                  {item.change >= 0 ? '↑' : '↓'}{Math.abs(item.change).toFixed(2)}%
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mood selector ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.65 }}
        className="flex flex-wrap justify-center gap-3 mt-8"
      >
        {moodButtons.map(btn => {
          const isActive = btn.key === null ? manualMood === null : manualMood === btn.key;
          return (
            <motion.button
              key={String(btn.key)}
              onClick={() => onMoodChange(btn.key)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-500"
              style={{
                fontFamily: 'Outfit, sans-serif',
                background: isActive
                  ? `linear-gradient(135deg, ${theme.accent}25, ${theme.accent}15)`
                  : 'rgba(255,255,255,0.04)',
                border: isActive
                  ? `1px solid ${theme.accent}80`
                  : '1px solid rgba(255,255,255,0.1)',
                color: isActive ? theme.accent : 'rgba(255,255,255,0.5)',
                boxShadow: isActive ? `0 0 20px ${theme.accent}20` : 'none',
              }}
            >
              <span>{btn.icon}</span>
              {btn.label}
              {btn.key === null && (
                <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 2 }}>
                  {activeMood.toUpperCase()}
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Mood reasons strip ── */}
      {moodReasons.length > 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-2 mt-4"
        >
          {moodReasons.map((r, i) => (
            <span
              key={i}
              style={{
                background: `${theme.accent}12`,
                border: `1px solid ${theme.accent}30`,
                color: theme.accentLight,
                fontFamily: 'Outfit, sans-serif',
                fontSize: 10, fontWeight: 500,
                padding: '3px 10px', borderRadius: 999,
              }}
            >
              {r}
            </span>
          ))}
        </motion.div>
      )}

      {/* ── Last updated ── */}
      {lastUpdated && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10, fontFamily: 'Outfit, sans-serif', marginTop: 16 }}
        >
          Last updated: {lastUpdated.toLocaleTimeString()} · {market.source}
        </motion.p>
      )}
    </motion.section>
  );
}
