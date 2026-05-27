/**
 * useNewsData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches live financial news from NewsAPI.org via Vite dev proxy.
 *
 * WHY PROXY:
 *   NewsAPI free plan only allows requests from localhost.
 *   Browser → /api/news/... → Vite proxy (Node.js, localhost) → newsapi.org
 *   NewsAPI sees it as a localhost request ✓
 *
 * Sentiment scoring is done locally on each headline.
 * Refreshes every 5 minutes (free tier: 100 req/day, use wisely).
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const NEWS_KEY   = import.meta.env.VITE_NEWS_API_KEY;
const REFRESH_MS = 5 * 60 * 1000; // 5 minutes

// ─── Sentiment word lists ─────────────────────────────────────────────────────

const BULLISH_WORDS = new Set([
  'surge','surges','surged','rally','rallies','rallied','gain','gains','gained',
  'rise','rises','rose','risen','bull','bullish','record','boom','soar','soars',
  'soared','jump','jumps','jumped','positive','profit','growth','strong','strength',
  'optimism','optimistic','recovery','recover','outperform','breakout','upside',
  'upgrade','beat','beats','exceeded','green','high','up','advances','advance',
  'climbs','climb','climbed','rebounds','rebound','rebounded','tops','topped',
]);

const BEARISH_WORDS = new Set([
  'crash','crashes','crashed','fall','falls','fell','fallen','drop','drops',
  'dropped','decline','declines','declined','bear','bearish','loss','losses',
  'slump','slumps','slumped','plunge','plunges','plunged','sink','sinks','sank',
  'down','negative','fear','panic','risk','recession','inflation','warning',
  'concern','crisis','weak','weakness','sell','selloff','red','miss','missed',
  'disappoints','downgrade','cut','worries','uncertainty','volatile','volatility',
  'tumbles','tumble','tumbled','slides','slide','slid','retreats','retreat',
]);

function scoreHeadline(text = '') {
  const words = text.toLowerCase().split(/\W+/);
  let bull = 0, bear = 0;
  words.forEach(w => {
    if (BULLISH_WORDS.has(w)) bull++;
    if (BEARISH_WORDS.has(w)) bear++;
  });
  const total = bull + bear;
  if (total === 0) return { score: 0, label: 'Neutral', color: '#6b7280' };
  const raw = (bull - bear) / total;
  let label, color;
  if      (raw >  0.4) { label = 'Bullish';  color = '#22c55e'; }
  else if (raw >  0.1) { label = 'Positive'; color = '#86efac'; }
  else if (raw < -0.4) { label = 'Bearish';  color = '#ef4444'; }
  else if (raw < -0.1) { label = 'Negative'; color = '#fca5a5'; }
  else                  { label = 'Neutral';  color = '#94a3b8'; }
  return { score: raw, label, color };
}

function aggregateSentiment(articles) {
  if (!articles.length) return { score: 0, label: 'Neutral', color: '#6b7280', bullPct: 0, bearPct: 0, neutPct: 100 };
  const scores = articles.map(a => a.sentiment.score);
  const avg    = scores.reduce((a, b) => a + b, 0) / scores.length;
  const bull   = Math.round((scores.filter(s => s >  0.1).length / scores.length) * 100);
  const bear   = Math.round((scores.filter(s => s < -0.1).length / scores.length) * 100);
  const neut   = 100 - bull - bear;
  let label, color;
  if      (avg >  0.35) { label = 'Strongly Bullish'; color = '#22c55e'; }
  else if (avg >  0.10) { label = 'Mildly Bullish';   color = '#86efac'; }
  else if (avg < -0.35) { label = 'Strongly Bearish'; color = '#ef4444'; }
  else if (avg < -0.10) { label = 'Mildly Bearish';   color = '#fca5a5'; }
  else                   { label = 'Neutral';           color = '#94a3b8'; }
  return { score: avg, label, color, bullPct: bull, bearPct: bear, neutPct: neut };
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return `${Math.round(diff)}s ago`;
  if (diff < 3600)  return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

// ─── Per-market queries ───────────────────────────────────────────────────────

const QUERIES = {
  indian: 'NIFTY OR SENSEX OR "Indian stock" OR BSE OR NSE OR "Dalal Street" OR "Indian market"',
  crypto: 'Bitcoin OR Ethereum OR cryptocurrency OR "crypto market" OR BTC OR ETH OR Solana',
  forex:  'forex OR "currency market" OR "EUR USD" OR "GBP USD" OR "US dollar" OR "exchange rate"',
};

// ─── Fetch via Vite proxy (/api/news → newsapi.org) ──────────────────────────

async function fetchNews(market) {
  if (!NEWS_KEY) {
    console.warn('[NewsData] VITE_NEWS_API_KEY not set');
    return [];
  }

  try {
    const q      = encodeURIComponent(QUERIES[market]);
    // Route through Vite proxy: /api/news/v2/everything → newsapi.org/v2/everything
    const url    = `/api/news/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_KEY}`;
    const res    = await fetch(url, { signal: AbortSignal.timeout(12000) });

    if (!res.ok) {
      const text = await res.text();
      console.error('[NewsData] HTTP', res.status, text.slice(0, 200));
      return [];
    }

    const data = await res.json();

    if (data.status !== 'ok') {
      console.error('[NewsData] API error:', data.code, data.message);
      return [];
    }

    return (data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]' && a.source?.name !== '[Removed]')
      .slice(0, 8)
      .map(a => ({
        id:          a.url,
        title:       a.title,
        description: a.description || '',
        source:      a.source?.name || 'News',
        url:         a.url,
        publishedAt: a.publishedAt,
        sentiment:   scoreHeadline(a.title + ' ' + (a.description || '')),
        timeAgo:     timeAgo(a.publishedAt),
      }));

  } catch (err) {
    console.error('[NewsData] fetch error:', err);
    return [];
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNewsData(activeMarket) {
  const [state, setState] = useState({
    articles:    [],
    aggregate:   { score: 0, label: 'Loading...', color: '#6b7280', bullPct: 0, bearPct: 0, neutPct: 100 },
    isLoading:   true,
    lastUpdated: null,
    error:       null,
  });

  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    const articles = await fetchNews(activeMarket);
    if (!mountedRef.current) return;
    setState({
      articles,
      aggregate:   aggregateSentiment(articles),
      isLoading:   false,
      lastUpdated: new Date(),
      error:       articles.length === 0 ? 'Could not load news' : null,
    });
  }, [activeMarket]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const iv = setInterval(refresh, REFRESH_MS);
    return () => { mountedRef.current = false; clearInterval(iv); };
  }, [refresh]);

  return { ...state, refresh };
}
