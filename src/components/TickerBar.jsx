import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/** Speed of ticker scroll per mood */
const MOOD_SPEED = {
  bullish: 28,   // smooth, confident
  fear:    18,   // fast, urgent
  calm:    40,   // slow, peaceful
  chaos:   12,   // very fast, erratic
};

export default function TickerBar({ theme, tickerData = [], lastUpdated, isLive }) {
  const moodKey = theme?.name?.toLowerCase() ?? 'calm';
  const speed   = MOOD_SPEED[moodKey] ?? 28;

  const tickers = tickerData.length > 0 ? tickerData : [
    { label: 'LOADING', value: '...', change: '0%', up: true }
  ];

  const doubled = [...tickers, ...tickers, ...tickers, ...tickers];
  const duration = tickers.length * (speed / 3);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center"
      style={{
        background: 'rgba(0,0,0,0.95)',
        borderTop: `1px solid ${theme.accent}30`,
        backdropFilter: 'blur(25px)',
        height: 42,
      }}
    >
      {/* Live Badge */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-4 bg-black border-r border-white/5">
        <div 
          className="flex items-center gap-2 px-2 py-0.5 rounded border"
          style={{ 
            borderColor: isLive ? '#22c55e40' : '#f59e0b40',
            background: isLive ? '#22c55e10' : '#f59e0b10'
          }}
        >
          <motion.div 
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: isLive ? '#22c55e' : '#f59e0b' }}
          />
          <span className="text-[10px] font-black tracking-tighter" style={{ color: isLive ? '#22c55e' : '#f59e0b' }}>
            {isLive ? 'LIVE' : 'SIM'}
          </span>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-white/20 ml-3 font-mono">
            {lastUpdated.toLocaleTimeString([], { hour12: false })}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-hidden ml-[120px]">
        <motion.div
          animate={{ x: [0, `-${50}%`] }}
          transition={{
            repeat: Infinity,
            duration: duration > 0 ? duration : 20,
            ease: 'linear',
          }}
          className="flex items-center whitespace-nowrap"
        >
          {doubled.map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-6 border-r border-white/5"
            >
              <span className="text-[11px] font-bold text-white/30 tracking-wider">
                {t.label}
              </span>
              <span className="text-[11px] font-black text-white">
                {t.value}
              </span>
              <span
                className="text-[11px] font-bold"
                style={{ color: t.up ? '#22c55e' : '#ef4444' }}
              >
                {t.change}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
