import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${theme.accent}40`,
          backdropFilter: 'blur(10px)',
          color: '#fff',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</div>
        <div style={{ color: theme.accent, fontWeight: 600 }}>{payload[0].value}</div>
      </div>
    );
  }
  return null;
};

export default function ChartPanel({ theme }) {
  return (
    <motion.div
      key={theme.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-6 relative z-10"
    >
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          boxShadow: `0 0 60px rgba(${theme.accentRgb},0.06)`,
        }}
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Summary */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="mb-6">
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: theme.accent, fontFamily: 'Outfit, sans-serif' }}
              >
                AI Sentiment Engine
              </p>
              <h2
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                Market Summary
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit, sans-serif' }}
              >
                {theme.summaryDesc}
              </p>
            </div>

            {/* Sentiment Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit, sans-serif' }}>
                  Market Sentiment
                </span>
                <span className="text-sm font-bold" style={{ color: theme.accent, fontFamily: 'Outfit, sans-serif' }}>
                  {theme.sentimentLabel} {theme.sentiment}%
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${theme.sentiment}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${theme.accentSecondary}, ${theme.accent})`,
                    boxShadow: `0 0 10px ${theme.accent}60`,
                  }}
                />
              </div>
            </div>

            {/* Metric grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Sentiment Score', value: theme.score, sub: theme.scoreChange, up: !theme.scoreChange.startsWith('-') },
                { label: 'Volatility Index', value: theme.volatility.toFixed(1), sub: theme.volChange, up: theme.volChange.startsWith('+') && theme.name !== 'bullish' ? false : true },
                { label: 'Market Trend', value: theme.trend, sub: `↑ ${theme.trendStrength}`, up: true },
                { label: 'AI Confidence', value: `${theme.confidence}%`, sub: `↑ ${theme.confidenceLevel}`, up: true },
              ].map((m, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                    {m.label}
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{
                      color: i === 2 ? theme.accent : '#fff',
                      fontFamily: 'Sora, sans-serif',
                      lineHeight: 1.2,
                    }}
                  >
                    {m.value}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      color: m.sub.includes('-') ? '#ef4444' : theme.accent,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {m.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Chart */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm font-medium"
                style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif' }}
              >
                Sentiment Trend
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full pulse-glow"
                  style={{ background: theme.accent, boxShadow: `0 0 6px ${theme.accent}` }}
                />
                <span className="text-xs font-medium" style={{ color: theme.accent, fontFamily: 'Outfit, sans-serif' }}>
                  Live Analysis
                </span>
              </div>
            </div>

            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={theme.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${theme.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.accent} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={theme.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Outfit' }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Outfit' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip theme={theme} />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme.accent}
                    strokeWidth={2}
                    fill={`url(#grad-${theme.name})`}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: theme.accent,
                      stroke: 'rgba(0,0,0,0.8)',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
