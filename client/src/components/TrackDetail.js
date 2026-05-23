import React from 'react';
import { motion } from 'framer-motion';
import { PHASE_COLORS } from '../data/constants';
import { useTheme } from '../hooks/useTheme';

export default function TrackDetail({ track, onReconduct, onShare, onClose }) {
  const t = useTheme();
  const pc = PHASE_COLORS[track.phase] || PHASE_COLORS[1];

  const seedEntries = track.seed ? Object.entries(track.seed) : [];

  return (
    <motion.div
      data-testid="track-detail-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0" style={{ background: `${t.bg}E0`, backdropFilter: 'blur(16px)' }} onClick={onClose} />
      <div className="texture-grain absolute inset-0 pointer-events-none opacity-20" />

      <motion.div
        className="relative z-10 w-full max-w-lg glass-card rounded-2xl p-6 overflow-hidden"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ border: `1px solid ${pc.accent}30` }}
      >
        {/* Phase accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${pc.accent}, transparent)` }} />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="font-data text-[9px] tracking-widest block mb-1" style={{ color: pc.accent }}>
              P{track.phase} {PHASE_COLORS[track.phase]?.name}
            </span>
            <h2 className="font-display text-xl tracking-tight" style={{ color: t.text }}>{track.name}</h2>
            <span className="font-data text-[10px] block mt-1" style={{ color: t.textMuted }}>
              {new Date(track.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button data-testid="track-detail-close" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `1px solid ${t.border}` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Full waveform */}
        {track.waveform && (
          <div className="mb-6">
            <span className="font-data text-[8px] tracking-widest block mb-2" style={{ color: t.textMuted }}>WAVEFORM</span>
            <svg width="100%" height="48" viewBox="0 0 300 48" className="rounded-lg" style={{ background: `${t.surface}80` }}>
              {track.waveform.map((v, i) => {
                const barW = 300 / track.waveform.length;
                return (
                  <rect key={`wd-${i}`} x={i * barW} y={48 - v * 44} width={Math.max(1, barW - 1)} height={v * 44} fill={pc.accent} opacity="0.7" rx="0.5" />
                );
              })}
            </svg>
          </div>
        )}

        {/* Track stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'BPM', value: track.bpm },
            { label: 'ATMOSPHERE', value: track.atmosphere?.toUpperCase() },
            { label: 'DURATION', value: track.duration_s ? `${Math.floor(track.duration_s / 60)}:${String(track.duration_s % 60).padStart(2, '0')}` : '--' },
            { label: 'GENRE', value: track.genre?.name || '--' },
            { label: 'COST/HR', value: `$${track.cost_per_hour || 0.02}` },
            { label: 'TIER', value: track.processing_tier?.toUpperCase() || 'STANDARD' },
          ].map(s => (
            <div key={s.label} className="rounded-lg p-2.5" style={{ background: `${t.surface}80`, border: `1px solid ${t.border}` }}>
              <span className="font-data text-[7px] tracking-widest block" style={{ color: t.textMuted }}>{s.label}</span>
              <span className="font-data text-xs block mt-0.5" style={{ color: t.text }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Seed parameters */}
        {seedEntries.length > 0 && (
          <div className="mb-6">
            <span className="font-data text-[8px] tracking-widest block mb-2" style={{ color: t.textMuted }}>SEED PARAMETERS</span>
            <div className="rounded-lg p-3" style={{ background: `${t.surface}60`, border: `1px solid ${t.border}`, fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
              {seedEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between py-0.5">
                  <span style={{ color: t.textMuted }}>{key}:</span>
                  <span style={{ color: pc.accent }}>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="flex gap-2 mb-6">
          {track.loved && <span className="font-data text-[8px] tracking-wider px-2 py-1 rounded-full" style={{ background: `${t.accent}15`, color: t.accent }}>LOVED</span>}
          {track.pinned && <span className="font-data text-[8px] tracking-wider px-2 py-1 rounded-full" style={{ background: `${t.accent2}15`, color: t.accent2 }}>VAULTED</span>}
          {track.transition && <span className="font-data text-[8px] tracking-wider px-2 py-1 rounded-full" style={{ background: `${pc.accent}15`, color: pc.accent }}>TRANSITION</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            data-testid="track-detail-reconduct"
            className="flex-1 py-3 rounded-xl font-ui font-bold text-sm tracking-wider"
            style={{ background: `${pc.accent}15`, border: `1px solid ${pc.accent}40`, color: pc.accent }}
            whileHover={{ boxShadow: `0 0 20px ${pc.glow}` }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReconduct(track)}
          >
            RE-CONDUCT
          </motion.button>
          <button
            data-testid="track-detail-share"
            className="px-6 py-3 rounded-xl font-data text-[10px] tracking-wider border transition-all"
            style={{ borderColor: t.border, color: t.textMuted }}
            onClick={() => onShare?.(track)}
          >
            SHARE
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
