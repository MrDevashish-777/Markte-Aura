import { motion, AnimatePresence } from 'framer-motion';

function SentimentBadge({ label, color }) {
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      {label}
    </span>
  );
}

function SentimentBar({ bullPct, bearPct, neutPct }) {
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden w-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${bullPct}%` }} transition={{ duration: 1 }} style={{ background: '#22c55e' }} />
      <motion.div initial={{ width: 0 }} animate={{ width: `${neutPct}%` }} transition={{ duration: 1, delay: 0.1 }} style={{ background: 'rgba(255,255,255,0.12)' }} />
      <motion.div initial={{ width: 0 }} animate={{ width: `${bearPct}%` }} transition={{ duration: 1, delay: 0.2 }} style={{ background: '#ef4444' }} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 p-3 animate-pulse">
      <div className="w-0.5 h-12 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.07)', width: '85%' }} />
        <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.05)', width: '60%' }} />
        <div className="h-2 rounded" style={{ background: 'rgba(255,255,255,0.04)', width: '35%' }} />
      </div>
    </div>
  );
}

function NewsCard({ article, index }) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ x: 3 }}
      className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group"
      style={{ border: '1px solid transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Sentiment colour bar */}
      <div
        className="w-0.5 rounded-full self-stretch flex-shrink-0"
        style={{
          background: article.sentiment.color,
          minHeight: 40,
          boxShadow: `0 0 6px ${article.sentiment.color}50`,
        }}
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-sm leading-snug line-clamp-2"
          style={{ color: 'rgba(255,255,255,0.78)', fontFamily: 'Outfit, sans-serif' }}
        >
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>
            {article.source}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>•</span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif' }}>
            {article.timeAgo}
          </span>
          <SentimentBadge label={article.sentiment.label} color={article.sentiment.color} />
        </div>
      </div>
      {/* External link arrow */}
      <span className="text-xs opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0 mt-1" style={{ color: '#fff' }}>↗</span>
    </motion.a>
  );
}

export default function NewsPanel({ theme, news, activeMarket }) {
  const { articles, aggregate, isLoading, lastUpdated, refresh } = news;

  const marketLabel = { indian: 'Indian Market', crypto: 'Crypto Market', forex: 'Forex Market' }[activeMarket] || 'Market';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="max-w-7xl mx-auto px-6 relative z-10 mt-6"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          boxShadow: `0 0 60px rgba(${theme.accentRgb},0.05)`,
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: `${theme.accent}20`, border: `1px solid ${theme.accent}30` }}
            >
              📰
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: theme.accent, fontFamily: 'Outfit, sans-serif' }}>
                News Sentiment Engine
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif' }}>
                {marketLabel} · Live headlines via NewsAPI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh button */}
            {refresh && !isLoading && (
              <button
                onClick={refresh}
                className="text-xs px-2 py-1 rounded-lg transition-all"
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'Outfit, sans-serif',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                ↺ Refresh
              </button>
            )}
            {/* Timestamp */}
            {lastUpdated && !isLoading && (
              <span className="text-xs hidden sm:block" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Outfit, sans-serif' }}>
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {/* Live badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: isLoading ? 'rgba(255,255,255,0.05)' : `${theme.accent}15`,
                border: `1px solid ${isLoading ? 'rgba(255,255,255,0.08)' : theme.accent + '30'}`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isLoading ? '#6b7280' : theme.accent,
                  boxShadow: isLoading ? 'none' : `0 0 6px ${theme.accent}`,
                  animation: isLoading ? 'none' : 'pulseGlow 2s infinite',
                }}
              />
              <span className="text-xs font-medium" style={{ color: isLoading ? '#6b7280' : theme.accent, fontFamily: 'Outfit, sans-serif' }}>
                {isLoading ? 'Fetching...' : 'LIVE'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* ── Left sidebar: aggregate sentiment ── */}
          <div
            className="lg:w-64 flex-shrink-0 p-6 flex flex-col gap-5"
            style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* News Sentiment label */}
            <div>
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                News Sentiment
              </p>
              <motion.p
                key={aggregate.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold"
                style={{ color: aggregate.color, fontFamily: 'Sora, sans-serif' }}
              >
                {isLoading ? '—' : aggregate.label}
              </motion.p>
            </div>

            {/* Breakdown bar */}
            {!isLoading && articles.length > 0 && (
              <div>
                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                  Headline Breakdown
                </p>
                <SentimentBar bullPct={aggregate.bullPct} bearPct={aggregate.bearPct} neutPct={aggregate.neutPct} />
                <div className="flex justify-between mt-2">
                  {[
                    { label: 'Bull', value: `${aggregate.bullPct}%`, color: '#22c55e' },
                    { label: 'Neut', value: `${aggregate.neutPct}%`, color: '#6b7280' },
                    { label: 'Bear', value: `${aggregate.bearPct}%`, color: '#ef4444' },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <p className="text-xs font-bold" style={{ color: item.color, fontFamily: 'Sora, sans-serif' }}>{item.value}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Count card */}
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>Headlines Analysed</p>
              <p className="text-2xl font-bold" style={{ color: '#fff', fontFamily: 'Sora, sans-serif' }}>
                {isLoading ? '—' : articles.length}
              </p>
              <p className="text-xs" style={{ color: theme.accent, fontFamily: 'Outfit, sans-serif' }}>Last 24 hours</p>
            </div>

            {/* Score gauge */}
            {!isLoading && articles.length > 0 && (
              <div>
                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>Sentiment Score</p>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(((aggregate.score + 1) / 2) * 100)}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, #ef4444, ${aggregate.color})` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs" style={{ color: '#ef4444', fontFamily: 'Outfit, sans-serif' }}>Bear</span>
                  <span className="text-xs" style={{ color: '#22c55e', fontFamily: 'Outfit, sans-serif' }}>Bull</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Article list ── */}
          <div className="flex-1 p-4 min-w-0">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
                </motion.div>
              ) : articles.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-52 gap-4"
                >
                  <div className="text-4xl">📡</div>
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit, sans-serif' }}>
                      No news loaded
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Outfit, sans-serif' }}>
                      Make sure <code style={{ color: theme.accent }}>npm run dev</code> is running (proxy required)
                    </p>
                  </div>
                  {refresh && (
                    <button
                      onClick={refresh}
                      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: `${theme.accent}20`,
                        border: `1px solid ${theme.accent}40`,
                        color: theme.accent,
                        fontFamily: 'Outfit, sans-serif',
                        cursor: 'pointer',
                      }}
                    >
                      ↺ Try Again
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={activeMarket + '-articles'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-0.5"
                >
                  {articles.map((article, i) => (
                    <NewsCard key={article.id} article={article} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
