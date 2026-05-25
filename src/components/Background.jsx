import Aurora from './Aurora';
import { motion } from 'framer-motion';

// Theme-matched color stops for the Aurora WebGL shader
const THEME_STOPS = {
  bullish: ['#00ff88', '#22c55e', '#00e5cc'],
  fear:    ['#ff1744', '#ef4444', '#ff6680'],
  calm:    ['#00d4ff', '#3b82f6', '#818cf8'],
  chaos:   ['#ffcc00', '#f59e0b', '#ff6600'],
};

export default function Background({ theme, auroraParams }) {
  const key = theme?.name?.toLowerCase() || 'bullish';
  const stops = THEME_STOPS[key] || THEME_STOPS.bullish;

  const { amplitude = 1.0, speed = 1.3, blend = 0.51 } = auroraParams ?? {};

  return (
    <>
      {/* ── Aurora WebGL — fixed full-screen ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          background: '#000',
        }}
      >
        <Aurora
          colorStops={stops}
          amplitude={amplitude}
          blend={blend}
          speed={speed}
        />
      </div>

      {/* ── Dark overlay so text stays readable ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.30)',
          transition: 'background 1s ease',
        }}
      />

      {/* ── Bottom fade for ticker bar ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent 65%, rgba(0,0,0,0.80) 100%)',
        }}
      />

      {/* ── Subtle grid texture ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Chaos: extra flickering strobe vignette ── */}
      {key === 'chaos' && (
        <motion.div
          animate={{ opacity: [0, 0.08, 0, 0.05, 0, 0.1, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(245,158,11,0.3), transparent 70%)',
          }}
        />
      )}

      {/* ── Fear: slow pulsing red vignette ── */}
      {key === 'fear' && (
        <motion.div
          animate={{ opacity: [0.05, 0.12, 0.05] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(239,68,68,0.25), transparent 65%)',
          }}
        />
      )}

      {/* ── Bullish: soft rising green shimmer ── */}
      {key === 'bullish' && (
        <motion.div
          animate={{ opacity: [0.04, 0.10, 0.04], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(34,197,94,0.2), transparent 65%)',
          }}
        />
      )}
    </>
  );
}
