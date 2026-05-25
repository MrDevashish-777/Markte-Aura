import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// ── Mini sparkline ────────────────────────────────────────────────────────────

function MiniChart({ data, color }) {
  const chartData = data.map(v => ({ v }));
  return (
    <div style={{ width: 80, height: 36 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      className="p-4 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        height: 88,
      }}
    />
  );
}

// ── Individual card ───────────────────────────────────────────────────────────

function AssetCard({ card, theme, index }) {
  const changeColor = card.up ? '#22c55e' : '#ef4444';
  const miniData    = Array.from({ length: 8 }, (_, i) =>
    50 + Math.sin(i * 0.8 + index) * 8 + (card.up ? i * 0.5 : -i * 0.5)
  );

  return (
    <motion.div
      key={card.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{
        y: -4,
        boxShadow: `0 20px 40px rgba(${theme.accentRgb},0.15)`,
      }}
      className="p-4 rounded-2xl cursor-pointer transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: `${card.iconBg}20`,
              border: `1px solid ${card.iconBg}40`,
              color: card.iconBg,
            }}
          >
            {card.icon}
          </div>

          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit, sans-serif' }}>
              {card.name}
            </p>
            <motion.p
              key={card.priceStr}
              initial={{ opacity: 0.4, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-lg font-bold leading-tight"
              style={{ color: '#fff', fontFamily: 'Sora, sans-serif' }}
            >
              {card.priceStr}
            </motion.p>
            <p className="text-xs font-medium" style={{ color: changeColor, fontFamily: 'Outfit, sans-serif' }}>
              {card.up ? '↑' : '↓'} {card.changeStr}
            </p>
          </div>
        </div>

        <MiniChart data={miniData} color={changeColor} />
      </div>
    </motion.div>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────

const TAB_LABELS = {
  indian: { icon: '🇮🇳', title: 'Indian Market Overview',    count: 6 },
  forex:  { icon: '💱', title: 'Forex Market Overview',      count: 8 },
  crypto: { icon: '₿',  title: 'Crypto Market Overview',     count: 8 },
};

// ── Main component ────────────────────────────────────────────────────────────

export default function MarketCards({ theme, market, activeMarket }) {
  const isLoading = market?.isLoading;
  const tab       = TAB_LABELS[activeMarket] ?? TAB_LABELS.crypto;

  // Select the right asset array based on active tab
  const assets =
    activeMarket === 'crypto' ? (market.cryptoAssets ?? []) :
    activeMarket === 'forex'  ? (market.forexAssets  ?? []) :
                                (market.indianAssets  ?? []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 relative z-10 mt-6">
        <div className="flex items-center justify-center mb-5">
          <span className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif' }}>
            Fetching Live Data…
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 relative z-10 mt-6">

      {/* Section label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2 mb-5"
      >
        <span style={{ fontSize: 14 }}>{tab.icon}</span>
        <span
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif' }}
        >
          {tab.title}
        </span>
        {market.isLive && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e',
              border: '1px solid rgba(34,197,94,0.25)', fontFamily: 'Outfit, sans-serif' }}
          >
            LIVE
          </span>
        )}
      </motion.div>

      {/* Cards grid — animates when tab changes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMarket}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className={`grid gap-4 ${
            assets.length <= 4
              ? 'grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {assets.map((asset, i) => (
            <AssetCard
              key={asset.label}
              card={asset}
              theme={theme}
              index={i}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
