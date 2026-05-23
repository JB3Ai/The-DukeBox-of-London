import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHASE_COLORS } from '../data/constants';
import { useTheme } from '../hooks/useTheme';

const API = process.env.REACT_APP_BACKEND_URL;

export default function ShareModal({ track, onClose }) {
  const t = useTheme();
  const [vibeCode, setVibeCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const pc = PHASE_COLORS[track?.phase] || PHASE_COLORS[1];

  const generateLink = useCallback(async () => {
    if (!track) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/vibe-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: track.track_id,
          phase: track.phase,
          atmosphere: track.atmosphere || 'balanced',
          bpm: track.bpm || 128,
          genre_code: track.genre?.code || track.seed?.genre_code,
          vocal_style: track.vocal_style || track.seed?.vocal_style,
          name: track.name,
        }),
      });
      const data = await res.json();
      setVibeCode(data.code);
    } catch (_) { /* share error */ }
    finally { setLoading(false); }
  }, [track]);

  useEffect(() => { generateLink(); }, [generateLink]);

  const shareUrl = vibeCode ? `${window.location.origin}?vibe=${vibeCode}` : '';

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [shareUrl]);

  if (!track) return null;

  return (
    <motion.div
      data-testid="share-modal"
      className="fixed inset-0 z-[160] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0" style={{ background: `${t.bg}E8`, backdropFilter: 'blur(20px)' }} onClick={onClose} />
      <div className="texture-grain absolute inset-0 pointer-events-none opacity-20" />

      <motion.div
        className="relative z-10 w-full max-w-md glass-card rounded-2xl p-6 overflow-hidden"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ border: `1px solid ${pc.accent}30` }}
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${pc.accent}, transparent)` }} />

        {/* Close */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-data text-[10px] tracking-[0.3em]" style={{ color: pc.accent }}>VIBE LINK</span>
          <button data-testid="share-modal-close" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `1px solid ${t.border}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Track preview */}
        <div className="mb-6">
          <h2 className="font-display text-xl tracking-tight mb-1" style={{ color: t.text }}>{track.name}</h2>
          <div className="flex items-center gap-3">
            <span className="font-data text-[10px]" style={{ color: pc.accent }}>P{track.phase}</span>
            <span className="font-data text-[10px]" style={{ color: t.textMuted }}>{track.bpm} BPM</span>
            <span className="font-data text-[10px]" style={{ color: t.textMuted }}>{track.atmosphere}</span>
          </div>
        </div>

        {/* Vibe Link URL */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <motion.div
              className="w-6 h-6 rounded-full border-2"
              style={{ borderColor: `${pc.accent}30`, borderTopColor: pc.accent }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <span className="font-data text-[10px] ml-3" style={{ color: t.textMuted }}>GENERATING LINK...</span>
          </div>
        ) : vibeCode ? (
          <>
            {/* Code display */}
            <div className="text-center mb-4">
              <span className="font-data text-[9px] tracking-widest block mb-2" style={{ color: t.textMuted }}>YOUR VIBE CODE</span>
              <span
                className="font-display text-4xl tracking-[0.2em]"
                style={{ color: pc.accent, textShadow: `0 0 30px ${pc.glow}` }}
              >
                {vibeCode}
              </span>
            </div>

            {/* URL field */}
            <div
              className="rounded-xl p-3 mb-4 flex items-center gap-2"
              style={{ background: `${t.surface}80`, border: `1px solid ${t.border}` }}
            >
              <span
                data-testid="share-url-display"
                className="font-data text-[10px] flex-1 truncate"
                style={{ color: t.textSecondary }}
              >
                {shareUrl}
              </span>
            </div>

            {/* Copy button */}
            <motion.button
              data-testid="share-copy-btn"
              className="w-full py-3.5 rounded-xl font-ui font-bold text-sm tracking-wider relative overflow-hidden"
              style={{
                background: copied ? `${pc.accent}25` : `${pc.accent}15`,
                border: `1px solid ${copied ? pc.accent : pc.accent + '40'}`,
                color: pc.accent,
              }}
              whileHover={{ boxShadow: `0 0 20px ${pc.glow}` }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
            >
              {copied ? 'COPIED TO CLIPBOARD' : 'COPY VIBE LINK'}
              {/* Success flash */}
              <AnimatePresence>
                {copied && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `${pc.accent}10` }}
                    initial={{ opacity: 1 }} animate={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>

            {/* Stats */}
            <div className="mt-4 text-center">
              <span className="font-data text-[8px] tracking-widest" style={{ color: t.textMuted }}>
                ANYONE WITH THIS LINK DROPS INTO YOUR EXACT VIBE
              </span>
            </div>

            {/* Encoded params preview */}
            <div className="mt-4 rounded-lg p-3" style={{ background: `${t.surface}40`, border: `1px solid ${t.border}` }}>
              <span className="font-data text-[8px] tracking-widest block mb-2" style={{ color: t.textMuted }}>ENCODED SEED</span>
              <div className="font-data text-[9px] space-y-0.5">
                <div className="flex justify-between"><span style={{ color: t.textMuted }}>phase:</span><span style={{ color: pc.accent }}>{track.phase}</span></div>
                <div className="flex justify-between"><span style={{ color: t.textMuted }}>bpm:</span><span style={{ color: pc.accent }}>{track.bpm}</span></div>
                <div className="flex justify-between"><span style={{ color: t.textMuted }}>atmosphere:</span><span style={{ color: pc.accent }}>{track.atmosphere}</span></div>
                {track.genre?.code && <div className="flex justify-between"><span style={{ color: t.textMuted }}>genre:</span><span style={{ color: pc.accent }}>{track.genre.code}</span></div>}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <span className="font-data text-[10px]" style={{ color: t.textMuted }}>Failed to generate link</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
