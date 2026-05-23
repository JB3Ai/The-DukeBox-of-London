import React from 'react';
import { motion } from 'framer-motion';
import { PHASE_COLORS } from '../data/constants';
import { useTheme } from '../hooks/useTheme';

function MiniWaveform({ data, color, width = 120, height = 32 }) {
  if (!data || data.length === 0) return null;
  const barW = width / data.length;
  return (
    <svg width={width} height={height} className="opacity-60">
      {data.map((v, i) => (
        <rect key={`wf-${i}`} x={i * barW} y={height - v * height} width={Math.max(1, barW - 1)} height={v * height} fill={color} rx="0.5" />
      ))}
    </svg>
  );
}

export default function TrackTile({ track, onAction }) {
  const t = useTheme();
  const pc = PHASE_COLORS[track.phase] || PHASE_COLORS[1];
  const time = new Date(track.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const date = new Date(track.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  return (
    <motion.div
      data-testid={`track-tile-${track.track_id}`}
      className="glass-card rounded-xl p-4 relative group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center shrink-0">
          <span className="font-data text-[10px]" style={{ color: t.textMuted }}>{date}</span>
          <div className="w-3 h-3 rounded-full my-1" style={{ background: pc.accent, boxShadow: `0 0 8px ${pc.glow}` }} />
          <span className="font-data text-[10px]" style={{ color: t.textMuted }}>{time}</span>
        </div>
        <div className="shrink-0">
          <MiniWaveform data={track.waveform?.slice(0, 32)} color={pc.accent} width={100} height={28} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-ui text-sm font-semibold truncate" style={{ color: t.text }}>{track.name}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-data text-[10px]" style={{ color: t.textMuted }}>{track.bpm} BPM</span>
            <span className="font-data text-[10px]" style={{ color: pc.accent }}>P{track.phase}</span>
            <span className="font-data text-[10px]" style={{ color: t.textMuted }}>{track.atmosphere}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            data-testid={`track-love-${track.track_id}`}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
            style={{ borderColor: t.border }}
            onClick={() => onAction?.(track.track_id, 'love')}
            title="Love"
          >
            {track.loved ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill={t.accent}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            )}
          </button>
          <button
            data-testid={`track-pin-${track.track_id}`}
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
            style={{ borderColor: t.border }}
            onClick={() => onAction?.(track.track_id, 'pin')}
            title="Pin to Vault"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={track.pinned ? t.accent2 : t.textMuted} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </button>
        </div>
      </div>
      {track.artist_seed && (
        <div className="absolute top-2 right-2 font-data text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${t.accent}20`, color: t.accent }}>
          JAS VERIFIED
        </div>
      )}
    </motion.div>
  );
}
