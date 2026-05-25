import { motion } from 'framer-motion';

export default function InsightPanel({ theme }) {
  return (
    <motion.div
      key={theme.name + '-insight'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="max-w-7xl mx-auto px-6 relative z-10 mt-6"
    >
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          boxShadow: `0 0 60px rgba(${theme.accentRgb},0.05)`,
        }}
      >
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Insight text */}
          <div className="flex-1">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: theme.accent, fontFamily: 'Outfit, sans-serif' }}
            >
              AI Insight Engine
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold mb-4 leading-tight"
              style={{ color: theme.accent, fontFamily: 'Sora, sans-serif' }}
            >
              {theme.insightTitle}
            </h2>
            <p
              className="text-sm leading-relaxed max-w-xl"
              style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit, sans-serif' }}
            >
              {theme.insightDesc}
            </p>
          </div>

          {/* Right: Metrics */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-6 lg:min-w-72">
            {/* Sentiment Confidence */}
            <div>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                Sentiment Confidence
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: '#fff', fontFamily: 'Sora, sans-serif' }}
              >
                {theme.sentimentConfidence}
              </p>
              <div className="mt-2 h-1 rounded-full w-32" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: theme.sentimentConfidence }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: theme.accent, maxWidth: '100%' }}
                />
              </div>
            </div>

            <div className="flex gap-6">
              {/* Market Stability */}
              <div>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                  Market Stability
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: theme.stabilityColor, fontFamily: 'Sora, sans-serif' }}
                >
                  {theme.marketStability}
                </p>
                <div className="mt-2 h-1 rounded-full w-28" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: '65%', background: theme.stabilityColor }}
                  />
                </div>
              </div>

              {/* Prediction Window */}
              <div>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                  AI Prediction Window
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: theme.predictionColor, fontFamily: 'Sora, sans-serif' }}
                >
                  {theme.predictionWindow}
                </p>
                <div className="mt-2 h-1 rounded-full w-28" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: '80%', background: theme.predictionColor }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
