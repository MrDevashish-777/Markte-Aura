import { motion } from 'framer-motion';

const moodEmoji = { bullish: '📈', fear: '📉', calm: '🌊', chaos: '⚡' };

export default function Navbar({ theme, activeMood, isLive }) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* ── Logo + mood pill ── */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `radial-gradient(circle, ${theme.accent}, ${theme.accentSecondary})`,
              boxShadow: `0 0 12px ${theme.accent}60`,
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-black opacity-80" />
          </div>
          <span
            className="text-white font-semibold text-sm tracking-wide"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Market Aura
          </span>

          {activeMood && (
            <motion.div
              key={activeMood}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: `${theme.accent}15`,
                border: `1px solid ${theme.accent}35`,
                marginLeft: 6,
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: isLive ? 1.2 : 2.5 }}
                style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: isLive ? '#22c55e' : '#f59e0b',
                  display: 'inline-block',
                }}
              />
              <span style={{
                fontSize: 10, color: theme.accent,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {moodEmoji[activeMood]} {activeMood}
              </span>
            </motion.div>
          )}
        </div>

        {/* Center intentionally empty — tabs live in the hero section */}
        <div />

        {/* ── Live badge (replaces CTA) ── */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            background: isLive ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${isLive ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
            color: isLive ? '#22c55e' : '#f59e0b',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: isLive ? 1.2 : 2.5 }}
            style={{ width: 5, height: 5, borderRadius: '50%',
              background: isLive ? '#22c55e' : '#f59e0b', display: 'inline-block' }}
          />
          {isLive ? 'Live · Finnhub' : 'Simulated'}
        </motion.div>
      </div>


    </motion.nav>
  );
}
